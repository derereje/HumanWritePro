import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import { getPolarSubscription } from "~/server/utils/polar-client";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await db.user.findFirst({
      where: { clerkId: userId },
      select: {
        subscriptionPlan: true,
        subscriptionType: true,
        productId: true,
        polarSubscriptionId: true,
        nextResetDate: true,
        team: {
          select: {
            owner: {
              select: {
                subscriptionPlan: true,
                subscriptionType: true,
                productId: true,
                polarSubscriptionId: true,
                nextResetDate: true,
              }
            }
          }
        }
      },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Use team owner's subscription if user is in a team
    const effectiveUser = dbUser.team?.owner || dbUser;
    const isTeamMember = !!dbUser.team?.owner;

    // If no active subscription, return basic info
    if (!effectiveUser.polarSubscriptionId) {
      return NextResponse.json({
        subscriptionPlan: effectiveUser.subscriptionPlan,
        subscriptionType: effectiveUser.subscriptionType,
        productId: effectiveUser.productId,
        nextResetDate: effectiveUser.nextResetDate,
        billingCycle: "N/A",
        status: null,
        isTeamMember,
      });
    }

    // Get subscription details from Polar
    const result = await getPolarSubscription(effectiveUser.polarSubscriptionId);

    if (!result.success || !result.subscription) {
      console.error("[Subscription Details] Failed to get from Polar:", result.error);
      // Return database info as fallback
      return NextResponse.json({
        subscriptionPlan: effectiveUser.subscriptionPlan,
        subscriptionType: effectiveUser.subscriptionType,
        productId: effectiveUser.productId,
        nextResetDate: effectiveUser.nextResetDate,
        billingCycle: "N/A",
        status: null,
        isTeamMember,
      });
    }

    const subscription = result.subscription;

    // Format billing cycle from Polar data
    const billingCycle = formatBillingCycle(
      subscription.recurring_interval,
      subscription.recurring_interval_count
    );

    return NextResponse.json({
      subscriptionPlan: effectiveUser.subscriptionPlan,
      subscriptionType: effectiveUser.subscriptionType,
      productId: effectiveUser.productId,
      polarSubscriptionId: subscription.id,
      status: subscription.status,
      billingCycle,
      currentPeriodStart: subscription.current_period_start,
      currentPeriodEnd: subscription.current_period_end,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      nextResetDate: effectiveUser.nextResetDate || subscription.current_period_end,
      isTeamMember,
    });
  } catch (error) {
    console.error("[Subscription Details] Error:", error);
    return NextResponse.json(
      { error: "Failed to get subscription details" },
      { status: 500 }
    );
  }
}

function formatBillingCycle(interval: string, count: number): string {
  const intervalMap: Record<string, string> = {
    day: "Daily",
    week: "Weekly",
    month: "Monthly",
    year: "Yearly",
  };

  const intervalName = intervalMap[interval] || interval;

  if (count === 1) {
    return intervalName;
  }

  return `Every ${count} ${interval}s`;
}
