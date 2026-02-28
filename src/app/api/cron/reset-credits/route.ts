import { type NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { env } from "~/env";

export const dynamic = "force-dynamic";

function getPlanCredits(plan: string): number {
  // Credits now represent word count (1 credit = 1 word)
  switch (plan) {
    case 'basic':
      return 5000;
    case 'pro':
      return 20000;
    case 'ultra':
      return 45000;
    case 'lifetime':
      return 20000; // Lifetime gets Pro credits (20k/mo)
    default:
      return 5000;
  }
}

function getNextResetDate(): Date {
  const now = new Date();
  const nextMonth = new Date(now);
  nextMonth.setMonth(now.getMonth() + 1);
  nextMonth.setDate(1);
  nextMonth.setHours(0, 0, 0, 0);
  return nextMonth;
}

export async function GET(req: NextRequest) {
  try {
    // Verify cron secret for security (optional)
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[Credit Reset] Starting monthly credit reset for annual subscribers...");

    const now = new Date();

    // Find users who need a reset
    // This includes:
    // 1. Annual subscribers (who get monthly credit refreshes)
    // 2. Lifetime deal users (who get monthly credit refreshes)
    const usersToReset = await db.user.findMany({
      where: {
        OR: [
          { subscriptionType: "annual" },
          { subscriptionType: "lifetime" }
        ],
        nextResetDate: {
          lte: now, // Date is in the past or today
        },
      },
    });

    console.log(`[Credit Reset] Found ${usersToReset.length} users to reset`);

    let resetCount = 0;
    const errors: string[] = [];

    for (const user of usersToReset) {
      try {
        const planCredits = getPlanCredits(user.subscriptionPlan || 'basic');
        const nextReset = getNextResetDate();

        await db.user.update({
          where: { id: user.id },
          data: {
            credits: planCredits, // Reset to plan credits (replaces leftover credits)
            nextResetDate: nextReset,
          },
        });

        console.log(`[Credit Reset] Reset user ${user.id} (${user.subscriptionPlan}): ${planCredits} credits, next reset: ${nextReset}`);
        resetCount++;
      } catch (error) {
        const errorMsg = `Failed to reset user ${user.id}: ${error}`;
        console.error(`[Credit Reset] ${errorMsg}`);
        errors.push(errorMsg);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Credit reset completed`,
      resetCount,
      totalUsers: usersToReset.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("[Credit Reset] Error:", error);
    return NextResponse.json(
      { 
        error: "Failed to reset credits",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
