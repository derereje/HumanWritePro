import { type NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import { addCorsHeaders, handleCorsPreflight } from "~/lib/cors";

export async function GET(request: NextRequest) {
  const corsResponse = handleCorsPreflight(request);
  if (corsResponse) return corsResponse;

  try {
    console.log("🔍 [API] Starting credits fetch at", new Date().toISOString());
    const startTime = Date.now();

    let userId;
    try {
      console.log("🔍 [API] Calling auth()...");
      const authResult = await auth();
      userId = authResult.userId;
      console.log("✅ [API] auth() successful, userId:", userId);
    } catch (authError) {
      console.error("❌ [API] auth() failed:", authError);
      throw authError; // Re-throw to be caught by the outer try-catch
    }

    if (!userId) {
      console.log("❌ [API] No session found for credits");
      const response = NextResponse.json({ credits: 0 }, { status: 401 });
      return addCorsHeaders(response, request);
    }

    let user = await db.user.findFirst({
      where: { clerkId: userId },
      select: {
        credits: true,
        extraCredits: true,
        subscriptionPlan: true,
        team: {
          select: {
            owner: {
              select: {
                credits: true,
                extraCredits: true,
                subscriptionPlan: true
              }
            }
          }
        }
      },
    });

    // Fallback: If user not found in DB (webhook delay), try to sync from Clerk
    if (!user) {
      console.log("⚠️ [API] User not found in DB, attempting to sync from Clerk...");
      try {
        const clerkUser = await currentUser();
        if (clerkUser) {
          const email = clerkUser.emailAddresses[0]?.emailAddress || "";
          const name = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || clerkUser.username || "User";

          // Check if user exists by email first (to handle pre-existing users or race conditions)
          const existingUser = email ? await db.user.findUnique({ where: { email } }) : null;

          let newUser;

          if (existingUser) {
            console.log(`⚠️ [API] Found existing user by email ${email}, linking to Clerk ID ${userId}`);
            newUser = await db.user.update({
              where: { id: existingUser.id },
              data: {
                clerkId: userId,
                // Optionally update other fields if they are missing
                name: existingUser.name || name,
                image: existingUser.image || clerkUser.imageUrl,
              }
            });
          } else {
            // Create user with default credits (300)
            newUser = await db.user.create({
              data: {
                clerkId: userId,
                email,
                name,
                image: clerkUser.imageUrl,
                emailVerified: clerkUser.emailAddresses[0]?.verification?.status === 'verified',
                // credits will default to 300 from schema
              }
            });
            console.log(`✅ [API] Created missing user ${userId} on the fly`);
          }

          // Use the new user data
          user = {
            credits: newUser.credits,
            extraCredits: newUser.extraCredits,
            subscriptionPlan: newUser.subscriptionPlan,
            team: null
          };
        }
      } catch (syncError) {
        console.error("❌ [API] Failed to sync user from Clerk:", syncError);
      }
    }

    if (!user) {
      const response = NextResponse.json({ credits: 0, extraCredits: 0, subscriptionPlan: null }, { status: 404 });
      return addCorsHeaders(response, request);
    }

    // If user is in a team, return owner's credits and plan
    const effectiveCredits = user.team?.owner ? user.team.owner.credits : user.credits;
    const effectiveExtraCredits = user.team?.owner ? user.team.owner.extraCredits : user.extraCredits;
    const effectivePlan = user.team?.owner ? user.team.owner.subscriptionPlan : user.subscriptionPlan;
    const isTeamMember = !!user.team?.owner;

    const endTime = Date.now();
    console.log(`✅ [API] Credits fetched in ${endTime - startTime}ms:`, effectiveCredits + effectiveExtraCredits);

    const response = NextResponse.json(
      {
        credits: effectiveCredits,
        extraCredits: effectiveExtraCredits,
        subscriptionPlan: effectivePlan,
        isTeamMember
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
    return addCorsHeaders(response, request);
  } catch (error) {
    console.error("❌ [API] Error fetching credits:", error);
    const response = NextResponse.json(
      { credits: 0, extraCredits: 0 },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
    return addCorsHeaders(response, request);
  }
}

export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflight(request) || new NextResponse(null, { status: 200 });
}
