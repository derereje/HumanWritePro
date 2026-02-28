import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Set a fixed target date for the offer
    // February 25, 2026 at 23:59:59 (end of day)
    const targetDate = new Date(Date.UTC(2026, 1, 25, 23, 59, 59, 999)); // Month is 0-indexed, so 1 = February
    
    // Alternative: Calculate from environment variable
    // const daysFromNow = parseInt(process.env.OFFER_DAYS_REMAINING || "7", 10);
    // const targetDate = new Date();
    // targetDate.setDate(targetDate.getDate() + daysFromNow);
    // targetDate.setHours(23, 59, 59, 999);

    return NextResponse.json({
      targetDate: targetDate.toISOString(),
      serverTime: new Date().toISOString(),
    }, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("Error in countdown API:", error);
    return NextResponse.json(
      { error: "Failed to get countdown data" },
      { status: 500 }
    );
  }
}
