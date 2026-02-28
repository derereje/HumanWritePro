import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import { env } from "~/env";

const POLAR_API_URL = "https://api.polar.sh/v1";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await db.user.findFirst({
      where: { clerkId: userId },
      select: {
        id: true,
        subscriptionPlan: true,
        productId: true,
        polarSubscriptionId: true,
      },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!dbUser.subscriptionPlan || !dbUser.productId) {
      return NextResponse.json({ error: "No active subscription found" }, { status: 400 });
    }

    if (!dbUser.polarSubscriptionId) {
      console.error("[Cancel Subscription] No Polar subscription ID found");
      return NextResponse.json({ error: "Cannot cancel: Subscription ID not found" }, { status: 400 });
    }

    console.log("[Cancel Subscription] Attempting to cancel:", {
      subscriptionId: dbUser.polarSubscriptionId,
      userId: dbUser.id,
    });

    try {
      // Cancel subscription in Polar using the correct endpoint
      // Using PATCH to cancel at period end (revoke would cancel immediately)
      const response = await fetch(
        `${POLAR_API_URL}/subscriptions/${dbUser.polarSubscriptionId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${env.POLAR_ACCESS_TOKEN}`,
          },
          body: JSON.stringify({
            cancel_at_period_end: true,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[Cancel Subscription] Polar API error:", {
          status: response.status,
          error: errorText,
        });
        throw new Error(`Polar API error: ${response.status} - ${errorText}`);
      }

      const subscription = await response.json();
      console.log("[Cancel Subscription] Successfully canceled in Polar:", {
        subscriptionId: subscription.id,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        currentPeriodEnd: subscription.current_period_end,
      });

      // Update database to reflect cancellation
      // Keep subscription data until period ends for access
      await db.user.update({
        where: { id: dbUser.id },
        data: {
          // Don't clear these yet - keep until webhook confirms end
          // subscriptionPlan: null,
          // subscriptionType: null,
          // productId: null,
          // polarSubscriptionId: null,
          // User retains access until current_period_end
        },
      });

      return NextResponse.json({
        success: true,
        message: "Subscription will be canceled at the end of your current billing period.",
        cancelAtPeriodEnd: subscription.current_period_end,
      });
    } catch (polarError) {
      console.error("[Cancel Subscription] Error:", polarError);

      return NextResponse.json(
        {
          error: "Failed to cancel subscription",
          details: polarError instanceof Error ? polarError.message : String(polarError),
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[Cancel Subscription] Unexpected error:", error);
    return NextResponse.json(
      { error: "Failed to cancel subscription" },
      { status: 500 }
    );
  }
}
