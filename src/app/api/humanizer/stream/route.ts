import { type NextRequest, after } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import {
  checkRateLimit,
  getRateLimitForPlan
} from "~/server/utils/rate-limiter";
import {
  validateRequestFrequency,
  sanitizeText
} from "~/server/utils/request-validator";
import { aiStudios } from "~/server/adapters/aistudios";
import { GroqAdapter } from "~/server/adapters/groq";
import { env } from "~/env";
import { DEFAULT_MODEL } from "~/server/config/models";
import { trackWordUsage } from "~/server/utils/polar-client";

/**
 * Using the original humanization prompt from aistudios.ts
 * The prompt uses the original format with <role>, <task>, <instructions>, <input>, <output_format> tags
 * We use proper system/user message separation for OpenAI best practices:
 * - System message: Simple role definition
 * - User message: Contains the original prompt format with all rules and the text to humanize
 */

/**
 * Calculates max tokens based on word count
 * Returns appropriate token limit for different word count ranges
 */
function calculateMaxTokens(wordCount: number): number {
  if (wordCount <= 500) return 6000;
  if (wordCount <= 1000) return 15000;
  if (wordCount <= 2000) return 20000;
  if (wordCount <= 3000) return 26000;
  return 26000; // Cap at 26000 for >3000 words
}

/**
 * Chunks text for streaming while preserving paragraph structure
 * Splits text into chunks that preserve newlines and paragraph breaks (\n\n)
 * This ensures the frontend can properly display paragraphs
 */
function chunkTextPreservingParagraphs(text: string): string[] {
  // If text is very short, return as single chunk
  if (text.length <= 150) {
    return [text];
  }

  const chunks: string[] = [];
  const minChunkSize = 50;
  const maxChunkSize = 200;

  // Split text while preserving paragraph breaks
  // We'll split by sentences to avoid breaking in the middle of words
  // but ensure we never break \n\n sequences

  let remaining = text;

  while (remaining.length > 0) {
    // If remaining text is small enough, add it as the last chunk
    if (remaining.length <= maxChunkSize) {
      chunks.push(remaining);
      break;
    }

    // Find a good split point - prefer sentence endings, but preserve \n\n
    let splitIndex = maxChunkSize;

    // Look for sentence endings near the target size
    const searchStart = Math.max(minChunkSize, maxChunkSize - 50);
    const searchEnd = Math.min(remaining.length, maxChunkSize + 50);
    const searchText = remaining.substring(searchStart, searchEnd);

    // Try to find sentence ending (period, exclamation, question mark followed by space)
    const sentenceMatch = /[.!?]\s+/.exec(searchText);
    if (sentenceMatch) {
      splitIndex = searchStart + (sentenceMatch.index || 0) + sentenceMatch[0].length;
    } else {
      // No sentence ending found, try to find a word boundary (space)
      const spaceMatch = /\s+/.exec(searchText);
      if (spaceMatch) {
        splitIndex = searchStart + (spaceMatch.index || 0) + spaceMatch[0].length;
      }
      // If no space found either, just split at maxChunkSize
    }

    // Make sure we don't break in the middle of \n\n
    const chunk = remaining.substring(0, splitIndex);
    const nextChars = remaining.substring(splitIndex, splitIndex + 3);

    // If we're about to break a \n\n, adjust the split
    if (chunk.endsWith('\n') && nextChars.startsWith('\n')) {
      // Include the \n\n in this chunk
      splitIndex += 2;
    } else if (chunk.endsWith('\n') && !nextChars.startsWith('\n')) {
      // We have a single \n at the end, which is fine
    }

    // Extract chunk
    const chunkText = remaining.substring(0, splitIndex);
    chunks.push(chunkText);
    remaining = remaining.substring(splitIndex);
  }

  return chunks.length > 0 ? chunks : [text];
}

export async function POST(request: NextRequest) {
  const isDev = process.env.NODE_ENV === 'development';
  let userId;
  try {
    const authResult = await auth();
    userId = authResult.userId;
  } catch (authError) {
    console.error("[STREAM API] auth() failed:", authError);
    return new Response(
      JSON.stringify({ error: "Authentication failed", details: authError instanceof Error ? authError.message : String(authError) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!userId) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  // Frequency check
  const frequencyCheck = validateRequestFrequency(userId, 3);
  if (!frequencyCheck.valid) {
    return new Response(
      JSON.stringify({ error: frequencyCheck.error }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    );
  }

  // Parse body early to calculate word count for parallelization
  const body = await request.json();
  const { text: rawText, preset = "default", tone, options = {} } = body;
  const selectedPreset = preset || tone || "default";

  if (isDev) {
    console.log("\n" + "=".repeat(80));
    console.log("[STREAM API] ========== NEW HUMANIZATION REQUEST ==========");
    console.log("=".repeat(80));
    console.log(`[STREAM API] User ID: ${userId}`);
    console.log(`[STREAM API] Preset selected: ${selectedPreset}`);
    console.log(`[STREAM API] Request body keys: ${Object.keys(body).join(", ")}`);
  }

  if (!rawText || typeof rawText !== "string") {
    console.error("[STREAM API] ERROR: Text is required and must be a string");
    return new Response(
      JSON.stringify({ error: "Text is required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const text = sanitizeText(rawText);
  if (isDev) {
    console.log(`[STREAM API] Original text length: ${rawText.length} characters`);
    console.log(`[STREAM API] Sanitized text length: ${text.length} characters`);
  }

  if (text.length < 100 || text.length > 50000) {
    console.error(`[STREAM API] ERROR: Text length ${text.length} is out of range (100-50,000)`);
    return new Response(
      JSON.stringify({ error: "Text must be between 100-50,000 characters" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  // CRITICAL: Check minimum word count (50 words) BEFORE any processing
  if (wordCount < 50) {
    console.error(`[STREAM API] ERROR: Word count ${wordCount} is below minimum of 50 words`);
    return new Response(
      JSON.stringify({ error: "Text must contain at least 50 words to be humanized" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const maxTokens = calculateMaxTokens(wordCount);

  // CRITICAL: Perform ALL validations FIRST before starting stream
  // This prevents API costs when validations fail
  if (isDev) {
    console.log(`[STREAM API] Word count: ${wordCount}`);
    console.log(`[STREAM API] Calculated max tokens: ${maxTokens}`);
  }

  // Get user from database FIRST (before starting stream)
  let dbUser = await db.user.findFirst({
    where: { clerkId: userId },
    select: {
      id: true,
      credits: true,
      extraCredits: true,
      subscriptionPlan: true,
      subscriptionType: true,
      maxWordsPerRequest: true,
      nextResetDate: true,
      team: {
        select: {
          owner: {
            select: {
              id: true,
              credits: true,
              extraCredits: true,
              subscriptionPlan: true,
              subscriptionType: true,
              maxWordsPerRequest: true,
              nextResetDate: true,
            }
          }
        }
      }
    },
  });

  // Fallback: If user not found in DB (webhook delay), try to sync from Clerk
  if (!dbUser) {
    console.log("⚠️ [STREAM API] User not found in DB, attempting to sync from Clerk...");
    try {
      const clerkUser = await currentUser();
      if (clerkUser) {
        const email = clerkUser.emailAddresses[0]?.emailAddress || "";
        const name = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || clerkUser.username || "User";

        // Create user with default credits (300)
        const newUser = await db.user.create({
          data: {
            clerkId: userId,
            email,
            name,
            image: clerkUser.imageUrl,
            emailVerified: clerkUser.emailAddresses[0]?.verification?.status === 'verified',
            // credits will default to 300 from schema
          }
        });

        console.log(`✅ [STREAM API] Created missing user ${userId} on the fly`);

        // Refetch to get the full object structure with relations
        dbUser = await db.user.findFirst({
          where: { id: newUser.id },
          select: {
            id: true,
            credits: true,
            extraCredits: true,
            subscriptionPlan: true,
            subscriptionType: true,
            maxWordsPerRequest: true,
            nextResetDate: true,
            team: {
              select: {
                owner: {
                  select: {
                    id: true,
                    credits: true,
                    extraCredits: true,
                    subscriptionPlan: true,
                    subscriptionType: true,
                    maxWordsPerRequest: true,
                    nextResetDate: true,
                  }
                }
              }
            }
          },
        });
      }
    } catch (syncError) {
      console.error("❌ [STREAM API] Failed to sync user from Clerk:", syncError);
    }
  }

  // Validate user exists (before starting stream)
  if (!dbUser) {
    console.error(`[STREAM API] ERROR: User not found for userId: ${userId}`);
    return new Response(
      JSON.stringify({ error: "User not found" }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }

  // Determine which user to bill (team owner if exists, otherwise the user)
  const billingUser = dbUser.team?.owner || dbUser;
  const isTeamMember = !!dbUser.team?.owner;

  if (isDev && isTeamMember) {
    console.log(`[STREAM API] User is team member. Billing owner: ${billingUser.id}`);
  }

  // Check if annual subscription needs credit reset
  if (billingUser.subscriptionType === 'annual' && billingUser.nextResetDate && new Date() >= billingUser.nextResetDate) {
    // Credits now represent word count (1 credit = 1 word)
    const planCredits = billingUser.subscriptionPlan === 'basic' ? 5000 : billingUser.subscriptionPlan === 'pro' ? 20000 : 45000;
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(1);
    nextMonth.setHours(0, 0, 0, 0);

    await db.user.update({
      where: { id: billingUser.id },
      data: {
        credits: planCredits,
        nextResetDate: nextMonth,
      },
    });

    billingUser.credits = planCredits;
    if (isDev) {
      console.log(`[STREAM API] Reset annual subscription credits for user ${billingUser.id}`);
    }
  }

  const maxWords = billingUser.maxWordsPerRequest || 600;
  if (isDev) {
    console.log(`[STREAM API] Max words allowed: ${maxWords}`);
  }

  // Validate word count limit (before starting stream)
  if (wordCount > maxWords) {
    console.error(`[STREAM API] ERROR: Word count ${wordCount} exceeds limit ${maxWords}`);
    return new Response(
      JSON.stringify({ error: `Text exceeds ${maxWords} words limit` }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Validate credits (before starting stream)
  const totalCredits = (billingUser.credits || 0) + (billingUser.extraCredits || 0);
  if (totalCredits < wordCount) {
    console.error(`[STREAM API] ERROR: Insufficient credits. Have: ${totalCredits} (Plan: ${billingUser.credits}, Extra: ${billingUser.extraCredits}), Need: ${wordCount}`);
    return new Response(
      JSON.stringify({ error: "Insufficient credits" }),
      { status: 402, headers: { "Content-Type": "application/json" } }
    );
  }

  // Validate preset access - only pro and ultra users can use presets (except "default" which is available to all)
  const effectivePlan = billingUser.subscriptionPlan;
  if (selectedPreset !== "default" && (effectivePlan === "basic" || !effectivePlan)) {
    // Basic users can only use "default" preset, other presets require pro/ultra
    console.error(`[STREAM API] Preset access denied for ${effectivePlan || "free"} user. Preset: ${selectedPreset}`);
    return new Response(
      JSON.stringify({
        error: "This preset is only available for Pro and Ultra subscribers. Please upgrade to access all presets.",
        errorCode: "PRESET_LOCKED",
        upgradeRequired: true,
      }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  // Rate limiting check (before starting stream)
  // Use billing user's plan for limits, but requesting user's ID for tracking
  const rateLimitConfig = getRateLimitForPlan(billingUser.subscriptionPlan);
  const rateLimit = checkRateLimit(userId, rateLimitConfig);

  if (!rateLimit.allowed) {
    console.error(`[STREAM API] ERROR: Rate limit exceeded for user: ${userId}`);
    return new Response(
      JSON.stringify({
        error: `Rate limit exceeded. Please wait ${rateLimit.retryAfter} seconds.`,
        retryAfter: rateLimit.retryAfter,
      }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    );
  }

  // All validations passed - NOW we can safely start the stream
  if (isDev) {
    console.log(`[STREAM API] ✓ All validations passed`);
    console.log(`[STREAM API] Credits available: ${totalCredits} (Plan: ${billingUser.credits}, Extra: ${billingUser.extraCredits}), Credits needed: ${wordCount}`);
    console.log(`[STREAM API] Starting stream with model: ${options.model || DEFAULT_MODEL}`);
  }

  const isFreeUser = !billingUser.subscriptionPlan || billingUser.subscriptionPlan === 'free';

  // Start stream ONLY after all validations pass
  let stream: ReadableStream;
  const primaryProvider = env.AI_PROVIDER || 'aistudio';
  const isGroqPrimary = primaryProvider === 'groq';

  try {
    try {
      if (isGroqPrimary && env.GROQ_API_KEY) {
        console.log(`[STREAM API] Trying primary provider: Groq`);
        const groq = new GroqAdapter();
        stream = await groq.humanizeTextStream(text, {
          temperature: options.temperature,
          maxTokens: maxTokens,
          preset: selectedPreset,
          model: options.model || (env.GROQ_MODEL || "llama-3.3-70b-versatile"),
          isFreeUser: isFreeUser,
          ...options,
        });
      } else {
        console.log(`[STREAM API] Trying primary provider: AI Studio`);
        stream = await aiStudios.humanizeTextStream(text, {
          temperature: options.temperature,
          maxTokens: maxTokens,
          preset: selectedPreset,
          tone: selectedPreset,
          model: options.model || DEFAULT_MODEL,
          isFreeUser: isFreeUser,
          ...options,
        });
      }
    } catch (primaryError) {
      console.error(`[STREAM API] Primary provider (${primaryProvider}) failed:`, primaryError instanceof Error ? primaryError.message : String(primaryError));

      // Fallback logic
      const canFallbackToGroq = !isGroqPrimary && !!env.GROQ_API_KEY;
      const canFallbackToAIStudio = isGroqPrimary;

      if (canFallbackToAIStudio) {
        console.log(`[STREAM API] Falling back to AI Studio...`);
        stream = await aiStudios.humanizeTextStream(text, {
          temperature: options.temperature,
          maxTokens: maxTokens,
          preset: selectedPreset,
          tone: selectedPreset,
          model: DEFAULT_MODEL,
          isFreeUser: isFreeUser,
          ...options,
        });
      } else if (canFallbackToGroq) {
        console.log(`[STREAM API] Falling back to Groq...`);
        const groq = new GroqAdapter();
        stream = await groq.humanizeTextStream(text, {
          temperature: options.temperature,
          maxTokens: maxTokens,
          preset: selectedPreset,
          model: env.GROQ_MODEL || "llama-3.3-70b-versatile",
          isFreeUser: isFreeUser,
          ...options,
        });
      } else {
        throw primaryError;
      }
    }
  } catch (finalError) {
    // If both primary and fallback fail, return error without charging user
    console.error(`[STREAM API] ERROR: All providers failed:`, finalError);
    return new Response(
      JSON.stringify({
        error: "Failed to start humanization stream. All providers failed.",
        details: finalError instanceof Error ? finalError.message : String(finalError),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    // Stream is ready, continue with normal processing
    if (isDev) {
      console.log("[STREAM API] Stream started successfully, forwarding response to client...");
    }

    // Track text in background, forward stream immediately
    let fullText = "";
    let chunkBuffer = "";

    const transformedStream = stream.pipeThrough(
      new TransformStream({
        transform(chunk, controller) {
          // CRITICAL: Forward chunk IMMEDIATELY
          controller.enqueue(chunk);

          // Parse in background for tracking
          try {
            const text = new TextDecoder().decode(chunk);
            const lines = text.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ") && line !== "data: [DONE]") {
                try {
                  const data = line.slice(6);
                  const json = JSON.parse(data);

                  // Handle different chunk types: thought, content, or default (for backward compatibility)
                  // Only track content chunks for fullText (thoughts are separate)
                  let content: string | undefined;

                  if (json.type === "content" || !json.type) {
                    // Content chunks - these go into fullText for tracking
                    content = json.choices?.[0]?.delta?.content;
                  } else if (json.type === "thought") {
                    // Thought chunks - don't add to fullText, but log for debugging
                    const thoughtContent = json.choices?.[0]?.delta?.content;
                    if (isDev && thoughtContent) {
                      console.log(`[STREAM] Thought chunk received (${thoughtContent.length} chars)`);
                    }
                    continue; // Don't track thoughts in fullText
                  } else if (json.type === "thoughts_complete") {
                    if (isDev) {
                      console.log(`[STREAM] Thoughts complete marker received`);
                    }
                    continue; // Don't track markers
                  }

                  if (content) {
                    fullText += content;
                    chunkBuffer += content;

                    // Log every few words to verify streaming (dev only)
                    if (isDev && (chunkBuffer.length > 20 || content.includes(".") || content.includes("!"))) {
                      console.log(`[STREAM] Forwarded content: "${chunkBuffer.substring(0, 50)}..."`);
                      chunkBuffer = "";
                    } else if (!isDev) {
                      chunkBuffer = "";
                    }
                  }
                } catch (e) {
                  // Ignore parse errors
                }
              }
            }
          } catch (e) {
            // Ignore any errors in tracking
          }
        },

        async flush(controller) {
          // Check if we actually generated content
          const generatedWordCount = fullText.trim().split(/\s+/).filter(Boolean).length;

          // If no content was generated (or very little, indicating failure), don't deduct credits
          if (generatedWordCount < 50) {
            if (isDev) {
              console.log(`[STREAM API] Generated content too short (${generatedWordCount} words). Skipping credit deduction.`);
            }

            controller.enqueue(
              new TextEncoder().encode(
                `data: ${JSON.stringify({
                  type: "complete",
                  credits_used: 0,
                  credits_remaining: (billingUser.credits || 0) + (billingUser.extraCredits || 0),
                })}\n\n`
              )
            );
            return;
          }

          // Send completion message FIRST (non-blocking)
          if (!dbUser) {
            console.error("[STREAM API] ERROR: dbUser is null in flush");
            return;
          }

          // Calculate deduction
          let newCredits = billingUser.credits || 0;
          let newExtraCredits = billingUser.extraCredits || 0;
          let remainingToDeduct = wordCount;

          // 1. Deduct from monthly plan credits first
          if (newCredits >= remainingToDeduct) {
            newCredits -= remainingToDeduct;
            remainingToDeduct = 0;
          } else {
            remainingToDeduct -= newCredits;
            newCredits = 0;
          }

          // 2. Deduct remaining from extra credits
          if (remainingToDeduct > 0) {
            newExtraCredits = Math.max(0, newExtraCredits - remainingToDeduct);
          }

          const creditsRemaining = newCredits + newExtraCredits;

          // Send completion immediately
          controller.enqueue(
            new TextEncoder().encode(
              `data: ${JSON.stringify({
                type: "complete",
                credits_used: wordCount,
                credits_remaining: creditsRemaining,
              })}\n\n`
            )
          );
          // Stream closes automatically when flush completes - user sees completion immediately

          // DB operations in background (fire and forget) using Next.js 15 after()
          after(async () => {
            try {
              if (isDev) {
                console.log("\n" + "=".repeat(80));
                console.log("[STREAM API] ========== STREAM COMPLETED ==========");
                console.log("=".repeat(80));
                console.log(`[STREAM API] Humanized text length: ${fullText.length} characters`);
                console.log(`[STREAM API] Humanized text word count: ${fullText.trim().split(/\s+/).filter(Boolean).length} words`);
                console.log(`[STREAM API] Credits deducted: ${wordCount}`);
                console.log(`[STREAM API] New Balance - Plan: ${newCredits}, Extra: ${newExtraCredits}`);
                console.log(`[STREAM API] Preset used: ${selectedPreset}`);
              }

              // Update credits (on billing user)
              await db.user.update({
                where: { id: billingUser.id },
                data: {
                  credits: newCredits,
                  extraCredits: newExtraCredits
                },
              });

              // Create history (non-blocking) - associate with requesting user
              await db.humanizerHistory.create({
                data: {
                  originalText: rawText,
                  humanizedText: fullText || text,
                  preset: selectedPreset,
                  tokensUsed: wordCount,
                  aiScore: 100,
                  metadata: {
                    source: "gemini-stream",
                    preset: selectedPreset,
                    originalLength: text.length,
                    humanizedLength: fullText.length,
                    billedTo: isTeamMember ? billingUser.id : undefined
                  },
                  userId: dbUser.id,
                },
              });

              // Track usage in Polar for billing (already non-blocking)
              // Track against billing user (owner) so it counts towards their usage
              trackWordUsage(billingUser.id, wordCount, {
                preset: selectedPreset,
                plan: billingUser.subscriptionPlan,
                model: "gemini",
                stream: true,
                teamMemberId: isTeamMember ? dbUser.id : undefined
              }).then((result) => {
                if (!result.success) {
                  console.error(`[STREAM API] Failed to track usage in Polar: ${result.error}`);
                } else if (isDev) {
                  console.log(`[STREAM API] Successfully tracked ${wordCount} words in Polar`);
                }
              }).catch((error) => {
                console.error(`[STREAM API] Error tracking usage in Polar:`, error);
              });

              if (isDev) {
                console.log(`[STREAM API] Database record saved successfully`);
                console.log("=".repeat(80) + "\n");
              }
            } catch (dbError) {
              console.error("[STREAM API] ERROR: Background database save failed");
              console.error("[STREAM API] Error details:", dbError);
            }
          });
        },
      })
    );

    return new Response(transformedStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    console.error("\n" + "=".repeat(80));
    console.error("[STREAM API] ========== UNEXPECTED ERROR ==========");
    console.error("=".repeat(80));
    console.error("[STREAM API] Error type:", error instanceof Error ? error.constructor.name : typeof error);
    console.error("[STREAM API] Error message:", error instanceof Error ? error.message : String(error));
    console.error("[STREAM API] Error stack:", error instanceof Error ? error.stack : "No stack trace");
    console.error("=".repeat(80) + "\n");

    return new Response(
      JSON.stringify({
        error: "Failed to humanize text. Both Gemini and OpenAI failed.",
        details: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
