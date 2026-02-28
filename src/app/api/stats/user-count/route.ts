import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    // Base count as requested by user
    const BASE_COUNT = 1376000;

    // Use a fixed start date to ensure consistency across reloads/users
    // Grounding the "live" aspect in a deterministic calculation
    const START_DATE = new Date('2026-02-16T11:12:00Z').getTime();
    const NOW = Date.now();

    const SECONDS_PASSED = (NOW - START_DATE) / 1000;
    // 8,000 users per day = 1 user every ~10.8 seconds
    const INCREMENT = Math.floor(SECONDS_PASSED / 10.8);

    const currentCount = BASE_COUNT + INCREMENT;

    return NextResponse.json({ count: currentCount });
}
