import { NextResponse } from 'next/server';
import { db } from '~/server/db';
import { auth } from '@clerk/nextjs/server';

export async function POST(req: Request) {
    try {
        const { userId: clerkId } = await auth();
        const body = await req.json();
        const { event, path, target, metadata } = body;

        // Non-blocking IP Geolocation (Server-side)
        let location = 'Unknown';
        try {
            const forwarded = req.headers.get('x-forwarded-for');
            const ip = forwarded ? forwarded.split(',')[0] : '8.8.8.8'; // Fallback for local dev

            // Fast, asynchronous lookup (limit to 1s)
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 1000);

            const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,city`, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            const geoData = await geoRes.json();
            if (geoData.status === 'success') {
                location = `${geoData.city}, ${geoData.country}`;
            }
        } catch (e) {
            console.log('Geo lookup skipped/failed (speed prioritized)');
        }

        // Find the internal user ID if clerkId exists
        let internalUserId = null;
        if (clerkId) {
            const user = await db.user.findUnique({
                where: { clerkId },
                select: { id: true },
            });
            internalUserId = user?.id;
        }

        const activity = await db.userActivity.create({
            data: {
                userId: internalUserId,
                clerkId: clerkId,
                event,
                path,
                target,
                metadata: {
                    ...(metadata || {}),
                    location
                },
            },
        });

        return NextResponse.json({ success: true, id: activity.id });
    } catch (error) {
        console.error('[Activity API Error]:', error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
