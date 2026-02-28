import React from 'react';
import { db } from '~/server/db';
import ActivityDashboardClient from './ActivityDashboardClient';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminActivityPage() {
    const user = await currentUser();
    const authorizedEmail = 'kirubelman3@gmail.com';

    if (!user?.emailAddresses.some(e => e.emailAddress === authorizedEmail)) {
        redirect('/');
    }

    const activities = await db.userActivity.findMany({
        orderBy: { createdAt: 'desc' },
        take: 1000,
        include: {
            user: {
                select: {
                    name: true,
                    email: true,
                    createdAt: true,
                    subscriptionPlan: true,
                    subscriptionType: true,
                },
            },
        },
    });

    const humanizerHistory = await db.humanizerHistory.findMany({
        orderBy: { createdAt: 'desc' },
        take: 1000,
        select: {
            tokensUsed: true,
            createdAt: true,
            userId: true,
            user: {
                select: {
                    subscriptionPlan: true,
                    subscriptionType: true,
                    clerkId: true
                }
            }
        }
    });

    const totalEvents = await db.userActivity.count();
    const pageViews = await db.userActivity.count({ where: { event: 'PAGE_VIEW' } });
    const clicks = await db.userActivity.count({ where: { event: 'CLICK' } });

    // 1. BUSINESS METRICS: DAILY BURN RATE
    const dailyBurn: Record<string, number> = {};
    humanizerHistory.forEach(h => {
        const date = h.createdAt?.toISOString()?.split('T')[0];
        if (date) {
            dailyBurn[date] = (dailyBurn[date] || 0) + (h.tokensUsed || 0);
        }
    });

    // 2. FUNNEL ANALYTICS
    // Land (/) -> Pricing (/pricing) -> Conversion (Click Subscribe/Pay)
    const funnel = {
        land: new Set<string>(),
        pricing: new Set<string>(),
        convert: new Set<string>()
    };

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    [...activities].reverse().forEach(a => {
        const uid = a.clerkId || 'guest-' + (a.metadata as any)?.userAgent?.substring(0, 30);

        // NEWCOMER FILTER: Only guests or users created within the last 7 days
        const isNewcomer = !a.user || (a.user.createdAt && new Date(a.user.createdAt) > sevenDaysAgo);
        if (!isNewcomer) return;

        if (a.path === '/') funnel.land.add(uid);

        // Integrity Check: Must have landed to be engaged or converted
        if (funnel.land.has(uid)) {
            if (a.path === '/pricing') funnel.pricing.add(uid);

            const isPaid = !!(a.user?.subscriptionPlan || a.user?.subscriptionType);
            const text = (a.metadata as any)?.element?.text?.toLowerCase() || '';
            if (isPaid || (a.event === 'CLICK' && (text.includes('subscribe') || text.includes('pay') || text.includes('buy')))) {
                funnel.convert.add(uid);
            }
        }
    });

    // 3. DEVICE DISTRIBUTION
    const devices: { Mobile: number; Desktop: number; Tablet: number; Other: number } = {
        Mobile: 0, Desktop: 0, Tablet: 0, Other: 0
    };
    activities.forEach(a => {
        const ua = (a.metadata as any)?.userAgent || '';
        if (/mobile/i.test(ua)) devices.Mobile++;
        else if (/tablet/i.test(ua)) devices.Tablet++;
        else if (/mozilla|chrome|safari/i.test(ua)) devices.Desktop++;
        else devices.Other++;
    });

    // 4. USER STICKINESS (Returning vs New)
    const userActivityDays: Record<string, Set<string>> = {};
    activities.forEach(a => {
        const uid = a.clerkId || 'guest-' + ((a.metadata as any)?.userAgent?.substring(0, 30) || 'unknown');
        const day = a.createdAt?.toISOString()?.split('T')[0];
        if (day) {
            if (!userActivityDays[uid]) userActivityDays[uid] = new Set();
            userActivityDays[uid]?.add(day);
        }
    });

    let returningUsers = 0;
    let newUsers = 0;
    Object.values(userActivityDays).forEach(days => {
        if (days.size > 1) returningUsers++;
        else newUsers++;
    });

    // 5. EVENT INVENTORY
    const inventoryMap: Record<string, { count: number; text: string; path: string; event: string }> = {};
    activities.forEach(item => {
        const metadata = item.metadata as any;
        const eventName = item.event || 'UNKNOWN';
        const pathName = item.path || '/';
        const text = item.event === 'PAGE_VIEW'
            ? `View ${pathName}`
            : (metadata?.element?.text || (item.target && item.target.length > 20 ? item.target.substring(0, 20) + '...' : item.target) || 'Interaction');

        const key = `${eventName}-${pathName}-${text}`;
        if (!inventoryMap[key]) {
            inventoryMap[key] = { count: 0, text, path: pathName, event: eventName };
        }
        inventoryMap[key].count++;
    });

    const sortedInventory = Object.values(inventoryMap)
        .sort((a, b) => b.count - a.count);

    // 6. JOURNEY CLUSTERING
    const sessionJourneys: Record<string, string[]> = {};
    activities.slice().reverse().forEach(a => {
        if (a.event !== 'CLICK') return;
        const uid = a.clerkId || 'guest-' + ((a.metadata as any)?.userAgent?.substring(0, 30) || 'unknown');
        if (uid) {
            if (!sessionJourneys[uid]) sessionJourneys[uid] = [];
            const label = (a.metadata as any)?.element?.text || 'Button';
            sessionJourneys[uid]?.push(label);
        }
    });

    const journeyFrequency: Record<string, { sequence: string[]; count: number }> = {};
    Object.values(sessionJourneys).forEach(seq => {
        if (seq.length === 0) return;
        const hash = seq.join(' → ');
        if (!journeyFrequency[hash]) {
            journeyFrequency[hash] = { sequence: seq, count: 0 };
        }
        journeyFrequency[hash].count++;
    });

    const commonJourneys = Object.values(journeyFrequency)
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);

    return (
        <ActivityDashboardClient
            activities={activities.map(a => ({
                id: a.id,
                event: a.event,
                path: a.path,
                target: a.target,
                metadata: a.metadata,
                createdAt: new Date(a.createdAt),
                user: a.user ? {
                    name: a.user.name,
                    email: a.user.email,
                    subscriptionPlan: a.user.subscriptionPlan,
                    subscriptionType: a.user.subscriptionType,
                    createdAt: a.user.createdAt
                } : null,
                clerkId: a.clerkId
            }))}
            totalEvents={totalEvents}
            pageViews={pageViews}
            clicks={clicks}
            commonJourneys={commonJourneys}
            initialSortedInventory={sortedInventory}
            businessStats={{
                dailyBurn: Object.entries(dailyBurn).map(([date, tokens]) => ({ date, tokens })).slice(0, 7),
                funnel: {
                    landing: funnel.land.size,
                    pricing: funnel.pricing.size,
                    conversion: funnel.convert.size
                },
                devices,
                retention: { returning: returningUsers, new: newUsers }
            }}
            humanizerHistory={humanizerHistory.map(h => ({
                tokensUsed: h.tokensUsed,
                createdAt: h.createdAt,
                user: h.user ? {
                    subscriptionPlan: h.user.subscriptionPlan,
                    subscriptionType: h.user.subscriptionType,
                    clerkId: h.user.clerkId
                } : null
            }))}
        />
    );
}
