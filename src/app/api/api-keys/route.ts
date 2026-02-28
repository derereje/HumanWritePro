import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import { randomBytes } from "crypto";

// GET - Fetch user's API keys
export async function GET() {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user's subscription info
    const dbUser = await db.user.findUnique({
      where: { clerkId: user.id },
      select: {
        id: true,
        subscriptionPlan: true,
        apiKeys: {
          orderBy: { createdAt: "desc" }
        }
      }
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if user has API access (ULTRA plan)
    const hasApiAccess = dbUser.subscriptionPlan?.toLowerCase().includes("large") || 
                         dbUser.subscriptionPlan?.toLowerCase().includes("ultra");

    if (!hasApiAccess) {
      return NextResponse.json(
        { error: "API access requires ULTRA plan" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      apiKeys: dbUser.apiKeys
    });

  } catch (error) {
    console.error("Error fetching API keys:", error);
    return NextResponse.json(
      { error: "Failed to fetch API keys" },
      { status: 500 }
    );
  }
}

// POST - Create a new API key
export async function POST(request: Request) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "API key name is required" },
        { status: 400 }
      );
    }

    // Get user's subscription info
    const dbUser = await db.user.findUnique({
      where: { clerkId: user.id },
      select: {
        id: true,
        subscriptionPlan: true,
        apiKeys: true
      }
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if user has API access
    const hasApiAccess = dbUser.subscriptionPlan?.toLowerCase().includes("large") || 
                         dbUser.subscriptionPlan?.toLowerCase().includes("ultra");

    if (!hasApiAccess) {
      return NextResponse.json(
        { error: "API access requires ULTRA plan" },
        { status: 403 }
      );
    }

    // Limit number of API keys per user
    if (dbUser.apiKeys.length >= 10) {
      return NextResponse.json(
        { error: "Maximum of 10 API keys allowed per user" },
        { status: 400 }
      );
    }

    // Generate a secure API key
    const apiKey = `cb_${randomBytes(32).toString("hex")}`;

    // Create the API key in database
    const newApiKey = await db.apiKey.create({
      data: {
        key: apiKey,
        name: name.trim(),
        userId: dbUser.id
      }
    });

    return NextResponse.json({
      apiKey: newApiKey,
      message: "API key created successfully"
    });

  } catch (error) {
    console.error("Error creating API key:", error);
    return NextResponse.json(
      { error: "Failed to create API key" },
      { status: 500 }
    );
  }
}

// DELETE - Delete an API key
export async function DELETE(request: Request) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const keyId = searchParams.get("id");

    if (!keyId) {
      return NextResponse.json(
        { error: "API key ID is required" },
        { status: 400 }
      );
    }

    // Get user from database
    const dbUser = await db.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true }
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Verify the API key belongs to the user
    const apiKey = await db.apiKey.findFirst({
      where: {
        id: keyId,
        userId: dbUser.id
      }
    });

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not found" },
        { status: 404 }
      );
    }

    // Delete the API key
    await db.apiKey.delete({
      where: { id: keyId }
    });

    return NextResponse.json({
      message: "API key deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting API key:", error);
    return NextResponse.json(
      { error: "Failed to delete API key" },
      { status: 500 }
    );
  }
}
