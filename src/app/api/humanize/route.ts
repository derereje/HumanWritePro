import { NextResponse } from "next/server";
import { db } from "~/server/db";

// POST - Humanize text using API key
export async function POST(request: Request) {
  try {
    // Check for API key in Authorization header
    const authHeader = request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid Authorization header. Use: Authorization: Bearer YOUR_API_KEY" },
        { status: 401 }
      );
    }

    const apiKey = authHeader.substring(7); // Remove "Bearer " prefix

    // Validate and get API key from database
    const apiKeyRecord = await db.apiKey.findUnique({
      where: { key: apiKey },
      include: {
        user: {
          select: {
            id: true,
            credits: true,
            subscriptionPlan: true,
            maxWordsPerRequest: true
          }
        }
      }
    });

    if (!apiKeyRecord?.isActive) {
      return NextResponse.json(
        { error: "Invalid or inactive API key" },
        { status: 401 }
      );
    }

    // Check if user has enough credits
    if (apiKeyRecord.user.credits <= 0) {
      return NextResponse.json(
        { error: "Insufficient credits. Please purchase more credits." },
        { status: 402 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { text, preset = "professional" } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Text is required and must be a string" },
        { status: 400 }
      );
    }

    // Validate text length
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

    if (wordCount === 0) {
      return NextResponse.json(
        { error: "Text cannot be empty" },
        { status: 400 }
      );
    }

    if (wordCount > apiKeyRecord.user.maxWordsPerRequest) {
      return NextResponse.json(
        {
          error: `Text exceeds maximum allowed words (${apiKeyRecord.user.maxWordsPerRequest} words)`,
          wordCount,
          maxWords: apiKeyRecord.user.maxWordsPerRequest
        },
        { status: 400 }
      );
    }

    // Calculate credits needed (1 credit per 1 words)
    const creditsNeeded = wordCount;

    if (apiKeyRecord.user.credits < creditsNeeded) {
      return NextResponse.json(
        {
          error: "Insufficient credits",
          creditsNeeded,
          creditsAvailable: apiKeyRecord.user.credits
        },
        { status: 402 }
      );
    }

    // Call the humanizer API (reuse existing logic from /api/humanizer)
    try {
      const humanizerResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/humanizer`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": apiKeyRecord.user.id, // Internal header to identify user
            "x-api-key-auth": "true" // Flag to skip Clerk auth in humanizer route
          },
          body: JSON.stringify({ text, preset })
        }
      );

      if (!humanizerResponse.ok) {
        let errorMsg = "Failed to humanize text";
        try {
          const errorData = await humanizerResponse.json();
          errorMsg = errorData.error || errorMsg;
        } catch (e) {
          // If parsing JSON fails, try text or use statusText
          const textError = await humanizerResponse.text().catch(() => "");
          if (textError && textError.length < 200 && !textError.includes("<!DOCTYPE")) {
            errorMsg = textError;
          } else {
            errorMsg = `Internal error (${humanizerResponse.status}): ${humanizerResponse.statusText}`;
          }
        }
        
        return NextResponse.json(
          { error: errorMsg },
          { status: humanizerResponse.status }
        );
      }

      let result;
      try {
        result = await humanizerResponse.json();
      } catch (e) {
        return NextResponse.json(
          { error: "Received invalid response from humanization engine. Please try again later." },
          { status: 502 }
        );
      }

      // Update API key last used timestamp
      await db.apiKey.update({
        where: { id: apiKeyRecord.id },
        data: { lastUsedAt: new Date() }
      });

      return NextResponse.json({
        success: true,
        humanizedText: result.humanized_text,
        creditsUsed: result.credits_used,
        creditsRemaining: result.credits_remaining,
        wordCount,
        preset
      });

    } catch (error) {
      console.error("Error calling humanizer:", error);
      return NextResponse.json(
        { error: "Failed to process humanization request" },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("Error in API humanize endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET - API documentation
export async function GET() {
  return NextResponse.json({
    message: "AcousticText Humanizer API",
    version: "1.0.0",
    documentation: {
      endpoint: "/api/humanize",
      method: "POST",
      authentication: "Bearer token in Authorization header",
      headers: {
        "Authorization": "Bearer YOUR_API_KEY",
        "Content-Type": "application/json"
      },
      body: {
        text: "Your AI-generated text here (required)",
        preset: "professional | casual | minimal-errors | playful (optional, default: professional)"
      },
      response: {
        success: true,
        humanizedText: "The humanized version of your text",
        creditsUsed: 5,
        creditsRemaining: 95,
        wordCount: 50,
        preset: "professional"
      },
      errors: {
        401: "Invalid or missing API key",
        402: "Insufficient credits",
        400: "Invalid request parameters",
        500: "Internal server error"
      }
    },
    links: {
      getApiKey: "/api-keys",
      pricing: "/pricing",
      support: "/contact"
    }
  });
}
