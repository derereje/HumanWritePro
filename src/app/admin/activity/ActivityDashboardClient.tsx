"use client";

import React, { useState, useMemo } from 'react';
import {
    Activity,
    MousePointer2,
    Map as MapIcon,
    User as UserIcon,
    Globe,
    Clock,
    ArrowLeft,
    TrendingUp,
    ChevronRight,
    Layers,
    Navigation2,
    Info,
    CreditCard,
    Target as TargetIcon,
    Search,
    Filter,
    BarChart3,
    Flame,
    ShieldAlert,
    Smartphone,
    Monitor,
    Recycle,
    Zap,
    Users
} from 'lucide-react';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

interface ActivityItem {
    id: string;
    event: string;
    path: string | null;
    target: string | null;
    metadata: any;
    createdAt: Date;
    user: {
        name: string | null;
        email: string | null;
        subscriptionPlan: string | null;
        subscriptionType: string | null;
        createdAt: Date | string | null;
    } | null;
    clerkId: string | null;
}

interface ActivityDashboardClientProps {
    activities: ActivityItem[];
    totalEvents: number;
    pageViews: number;
    clicks: number;
    commonJourneys: { sequence: string[]; count: number }[];
    initialSortedInventory: { count: number; text: string; path: string; event: string }[];
    humanizerHistory: {
        tokensUsed: number;
        createdAt: Date | string;
        user: {
            subscriptionPlan: string | null;
            subscriptionType: string | null;
            clerkId: string | null;
            email: string | null;
        } | null;
    }[];
    businessStats: {
        dailyBurn: { date: string; tokens: number }[];
        funnel: { landing: number; pricing: number; conversion: number };
        devices: Record<string, number>;
        retention: { returning: number; new: number };
    };
}

export default function ActivityDashboardClient({
    activities,
    totalEvents,
    pageViews,
    clicks,
    commonJourneys: initialCommonJourneys,
    initialSortedInventory,
    humanizerHistory,
    businessStats
}: ActivityDashboardClientProps) {
    const [inventorySearch, setInventorySearch] = useState('');
    const [feedSearch, setFeedSearch] = useState('');
    const [feedCountry, setFeedCountry] = useState('');
    const [feedWordsFilter, setFeedWordsFilter] = useState('');
    const [inventoryDate, setInventoryDate] = useState<string>('');
    const [feedDate, setFeedDate] = useState<string>('');
    const [retentionDate, setRetentionDate] = useState<string>('');
    const [frictionDate, setFrictionDate] = useState<string>('');
    const [deviceDate, setDeviceDate] = useState<string>('');
    const [funnelDate, setFunnelDate] = useState<string>('');
    const [geoDate, setGeoDate] = useState<string>('');
    const [trendStartDate, setTrendStartDate] = useState<string>(() => {
        const d = new Date();
        d.setDate(d.getDate() - 14);
        return d.toISOString().split('T')[0] || '';
    });
    const [trendEndDate, setTrendEndDate] = useState<string>(() => new Date().toISOString().split('T')[0] || '');
    const [trendCountry, setTrendCountry] = useState<string>('');
    const [clusterDate, setClusterDate] = useState<string>('');
    const [clusterLimit, setClusterLimit] = useState<number>(12);
    const [sequenceFilter, setSequenceFilter] = useState<string>('');
    const [countryFilter, setCountryFilter] = useState<string>('');
    const [userTypeFilter, setUserTypeFilter] = useState<'ALL' | 'FREE' | 'PAID'>('ALL');
    const [clusterEmailSearch, setClusterEmailSearch] = useState('');
    const [isFeedAggregated, setIsFeedAggregated] = useState(false);
    const [expandedFeedUserId, setExpandedFeedUserId] = useState<string | null>(null);
    const [geoSortBy, setGeoSortBy] = useState<'hits' | 'users' | 'words'>('hits');
    const [geoSortOrder, setGeoSortOrder] = useState<'asc' | 'desc'>('desc');
    const [isMounted, setIsMounted] = useState(false);

    React.useEffect(() => {
        setIsMounted(true);
    }, []);


    const getEventCategory = (a: any) => {
        const text = (a.metadata)?.element?.text?.toLowerCase() || '';
        const path = a.path?.toLowerCase() || '';
        if (text.includes('buy') || text.includes('pay') || text.includes('subscribe') || path.includes('pricing') || text.includes('celebrate') || text.includes('quota'))
            return { label: 'Transactional', color: 'bg-amber-100/50 text-amber-700 border-amber-100', icon: CreditCard };
        if (text.includes('humanize') || text.includes('purify') || text.includes('convert'))
            return { label: 'Core Intent', color: 'bg-indigo-100/50 text-indigo-700 border-indigo-100', icon: TargetIcon };
        if (a.event === 'PAGE_VIEW')
            return { label: 'Navigational', color: 'bg-white/[0.03] text-slate-300 border-white/5', icon: Navigation2 };
        return { label: 'Informational', color: 'bg-blue-100/50 text-blue-700 border-blue-100', icon: Info };
    };

    const getRefinedLabel = (a: any) => {
        if (a.event === 'PAGE_VIEW') return `View ${a.path || '/'}`;

        const metadata = a.metadata;
        const pathName = a.path === '/' ? 'Home' : a.path?.replace(/^\//, '').split('/')[0] || 'Global';
        const capitalizedPath = pathName.charAt(0).toUpperCase() + pathName.slice(1);

        // Modal context priority
        const context = metadata?.modal || capitalizedPath;

        let label = metadata?.element?.text || 'Button';

        // Icon detection for generic buttons
        if (!metadata?.element?.text || metadata?.element?.text === 'Button') {
            const tag = a.target?.toLowerCase() || '';
            if (tag.includes('x') || tag.includes('close')) label = '✖ Close';
            else if (tag.includes('menu') || tag.includes('hamburger')) label = '☰ Menu';
            else if (tag.includes('search')) label = '🔍 Search';
            else if (tag.includes('profile') || tag.includes('user')) label = '👤 Profile';
            else if (tag.includes('history')) label = '🕒 History';
            else if (tag.includes('sparkles') || tag.includes('ai')) label = '✨ AI Tool';
            else label = '🖱️ Interaction';
        }

        return `${label} [${context}]`;
    };

    const filteredActivities = useMemo(() => {
        const adminEmails = ['kirubelman3@gmail.com', 'misganaworkineh@gmail.com'];
        return activities.filter(a => {
            // Admin Exclusion
            if (a.user?.email && adminEmails.includes(a.user.email)) return false;

            // User Type Filter
            let matchesUserType = true;
            if (userTypeFilter !== 'ALL') {
                const isPaid = !!(a.user?.subscriptionPlan || a.user?.subscriptionType);
                matchesUserType = userTypeFilter === 'PAID' ? isPaid : !isPaid;
            }

            // Country Filter
            let matchesCountry = true;
            if (countryFilter) {
                const loc = (a.metadata)?.location || 'Unknown';
                const country = loc.split(', ').pop() || 'Unknown';
                matchesCountry = country === countryFilter;
            }

            return matchesUserType && matchesCountry;
        });
    }, [activities, userTypeFilter, countryFilter]);

    const availableCountries = useMemo(() => {
        const countries = new Set<string>();
        activities.forEach(a => {
            const loc = (a.metadata)?.location || 'Unknown';
            const country = loc.split(', ').pop() || 'Unknown';
            countries.add(country);
        });
        return Array.from(countries).sort();
    }, [activities]);

    const filteredInventory = initialSortedInventory.filter(item => {
        const matchesSearch = item.text.toLowerCase().includes(inventorySearch.toLowerCase()) ||
            item.path.toLowerCase().includes(inventorySearch.toLowerCase()) ||
            item.event.toLowerCase().includes(inventorySearch.toLowerCase());
        return matchesSearch;
    });

    // Re-aggregate inventory with all filters and user metadata
    const displayInventory = useMemo(() => {
        const aggregated: Record<string, { count: number; text: string; path: string; event: string; users: any[] }> = {};

        filteredActivities.forEach(a => {
            if (a.path === '/admin/activity') return;
            if (inventoryDate) {
                const aDate = new Date(a.createdAt).toISOString().split('T')[0];
                if (aDate !== inventoryDate) return;
            }

            const metadata = a.metadata;
            const text = getRefinedLabel(a);

            const key = `${a.event}-${a.path}-${text}`;
            const email = a.user?.email || (a.clerkId ? 'User@' + a.clerkId.substring(0, 6) : 'Guest');
            const loc = (a.metadata)?.location || 'Unknown';
            const country = loc.split(', ').pop() || 'Unknown';

            if (!aggregated[key]) {
                aggregated[key] = { count: 0, text, path: a.path || '/', event: a.event, users: [] };
            }
            aggregated[key].count++;

            // Collect user for drilldown (most recent 50)
            if (aggregated[key].users.length < 50) {
                aggregated[key].users.push({
                    email,
                    country,
                    timestamp: new Date(a.createdAt)
                });
            }
        });

        return Object.values(aggregated)
            .sort((a, b) => b.count - a.count)
            .filter(item =>
                item.text.toLowerCase().includes(inventorySearch.toLowerCase()) ||
                item.path.toLowerCase().includes(inventorySearch.toLowerCase()) ||
                item.event.toLowerCase().includes(inventorySearch.toLowerCase())
            );
    }, [filteredActivities, inventoryDate, userTypeFilter, inventorySearch]);

    const filteredFeed = filteredActivities.filter(a => {
        const search = feedSearch.toLowerCase();
        const text = (a.metadata)?.element?.text || '';
        const matchesSearch = a.event.toLowerCase().includes(search) ||
            (a.path || '').toLowerCase().includes(search) ||
            text.toLowerCase().includes(search) ||
            (a.user?.name || '').toLowerCase().includes(search);

        if (!matchesSearch) return false;
        if (a.path === '/admin/activity') return false;

        if (feedDate) {
            const aDate = new Date(a.createdAt).toISOString().split('T')[0];
            if (aDate !== feedDate) return false;
        }

        if (feedCountry) {
            const loc = (a.metadata)?.location || 'Unknown';
            const country = loc.split(', ').pop() || 'Unknown';
            if (country !== feedCountry) return false;
        }

        return true;
    });

    const topButtons = initialSortedInventory
        .filter(i => i.event === 'CLICK')
        .slice(0, 5);

    // 4. BI AGGREGATIONS (CLIENT-SIDE FOR REAL-TIME FILTERING)
    const dynamicBI = useMemo(() => {
        const funnelUsers: Record<string, Map<string, {
            email: string;
            timestamp: Date;
            country: string;
            page?: string;
            elementText?: string;
            isTrigger?: boolean;
        }>> = {
            land: new Map(),
            humanizer: new Map(), // Strictly tool usage
            pricing: new Map(),   // Pricing exploration (plans)
            convert: new Map(),
            inactive: new Map()   // Logged in but never used humanizer
        };
        const deviceStats: Record<string, {
            hits: number;
            users: Map<string, { email: string, timestamp: Date }>;
            wordsHumanized: number
        }> = {
            Desktop: { hits: 0, users: new Map(), wordsHumanized: 0 },
            Mobile: { hits: 0, users: new Map(), wordsHumanized: 0 },
            Tablet: { hits: 0, users: new Map(), wordsHumanized: 0 },
            Other: { hits: 0, users: new Map(), wordsHumanized: 0 }
        };
        const userContextMap: Record<string, { device: string; country: string }> = {};
        const userDays: Record<string, Set<string>> = {};

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        [...filteredActivities].reverse().forEach(a => {
            const uid: string = a.clerkId || 'guest-' + ((a.metadata)?.userAgent?.substring(0, 30) || 'default');

            // NEWCOMER FILTER: Only guests or users created within the last 7 days
            const isNewcomer = !a.user || (a.user.createdAt && new Date(a.user.createdAt) > sevenDaysAgo);
            if (!isNewcomer) return;

            const email: string = a.user?.email || (a.clerkId ? 'User@' + a.clerkId.substring(0, 6) : 'Guest');
            const aDate = new Date(a.createdAt).toISOString().split('T')[0] || '';
            const timestamp = new Date(a.createdAt);

            const loc = (a.metadata)?.location || 'Unknown';
            const country = loc.split(', ').pop() || 'Unknown';
            const page = a.path;
            const elementText = (a.metadata)?.element?.text || 'None';

            const addUserToFunnel = (stage: 'land' | 'humanizer' | 'pricing' | 'convert' | 'inactive', isTrigger = false) => {
                const stageMap = funnelUsers[stage];
                if (!stageMap) return;
                const existing = stageMap.get(uid);

                // Prioritize 'isTrigger' events over regular timestamps to capture the specific action (like a button click)
                const shouldUpdate = !existing ||
                    (isTrigger && !existing.isTrigger) ||
                    (timestamp > existing.timestamp && (isTrigger === existing.isTrigger));

                if (shouldUpdate) {
                    stageMap.set(uid, {
                        email: email || 'Guest',
                        timestamp,
                        country,
                        page: page || undefined,
                        elementText: elementText || undefined,
                        isTrigger
                    });
                }
            };

            // Funnel
            if (!funnelDate || aDate === funnelDate) {
                const isPaid = !!(a.user?.subscriptionPlan || a.user?.subscriptionType);
                const lowerText = (a.metadata)?.element?.text?.toLowerCase() || '';

                if (a.path === '/') addUserToFunnel('land');

                // 1. TOOL ENGAGEMENT (STRICT HUMANIZER USAGE)
                const isHumanizerAction = (
                    getEventCategory(a).label === 'Core Intent' ||
                    lowerText.includes('humanize') ||
                    lowerText.includes('purify') ||
                    lowerText.includes('convert')
                );
                if (isHumanizerAction) {
                    addUserToFunnel('humanizer', a.event === 'CLICK');
                }

                // 2. PRICING EXPLORATION (EXCLUDING FIRST LOGIN MODAL)
                const isFirstLoginModal = (a.metadata)?.modal === 'FirstLoginPricingModal';
                const isPricingEngagement = (
                    (
                        a.path === '/pricing' ||
                        lowerText.includes('pricing') ||
                        lowerText.includes('plan') ||
                        lowerText.includes('subscribe') ||
                        lowerText.includes('claim') ||
                        lowerText.includes('discount') ||
                        lowerText.includes('50%') ||
                        (a.target?.toLowerCase().includes('pricing'))
                    ) &&
                    !isFirstLoginModal
                );

                if (isPricingEngagement) {
                    addUserToFunnel('pricing', a.event === 'CLICK');
                }

                // 3. CONVERSION
                if (funnelUsers.land?.has(uid)) {
                    const isPaid = !!(a.user?.subscriptionPlan || a.user?.subscriptionType);
                    const isConversionClick = a.event === 'CLICK' && (
                        a.target?.toLowerCase().includes('subscribe') ||
                        a.target?.toLowerCase().includes('pay') ||
                        lowerText.includes('subscribe') ||
                        lowerText.includes('plan')
                    );

                    if (isPaid || isConversionClick) {
                        addUserToFunnel('convert', isConversionClick);
                    }
                }
            }

            // Devices (Section-specific Date Filter)
            if (!deviceDate || aDate === deviceDate) {
                const ua = (a.metadata)?.userAgent || '';
                const device = /mobile/i.test(ua) ? 'Mobile' : /tablet/i.test(ua) ? 'Tablet' : 'Desktop';
                if (deviceStats[device]) {
                    deviceStats[device].hits++;

                    // Track user with email and timestamp
                    if (!deviceStats[device].users.has(uid)) {
                        deviceStats[device].users.set(uid, {
                            email: email || (a.clerkId ? 'User@' + a.clerkId.substring(0, 6) : 'Guest'),
                            timestamp: new Date(a.createdAt)
                        });
                    }
                }

                // Track latest context for token attribution
                userContextMap[uid] = { device, country };
            }

            // Track daily presence for all filtered activities
            const uid_ret = a.clerkId || 'guest-' + ((a.metadata)?.userAgent?.substring(0, 30) || 'default');
            const dDate_ret = new Date(a.createdAt).toISOString().split('T')[0];
            if (!userDays[uid_ret]) (userDays as any)[uid_ret] = new Set<string>();
            (userDays as any)[uid_ret]!.add(dDate_ret);
        });

        // Humanizer attribution to devices
        const adminEmailList = ['kirubelman3@gmail.com', 'misganaworkineh@gmail.com'];
        const filteredHumanizerHistory = humanizerHistory.filter(h =>
            !h.user?.email || !adminEmailList.includes(h.user.email)
        );

        filteredHumanizerHistory.forEach(h => {
            const uid = h.user?.clerkId;
            if (!uid) return;
            const context = userContextMap[uid];
            if (context && deviceStats[context.device]) {
                deviceStats[context.device]!.wordsHumanized += (h.tokensUsed || 0);
            }
        });

        const activeOnDate = new Set<string>();
        filteredActivities.forEach(a => {
            const dDate_curr = new Date(a.createdAt).toISOString().split('T')[0];
            if (!retentionDate || dDate_curr === retentionDate) {
                const uid_curr = a.clerkId || 'guest-' + ((a.metadata)?.userAgent?.substring(0, 30) || 'default');
                activeOnDate.add(uid_curr);
            }
        });

        const sortedTotal = Array.from(activeOnDate)
            .map(uid => {
                const days = userDays[uid]!;
                return {
                    uid,
                    email: activities.find(a => a.clerkId === uid || ('guest-' + (a.metadata)?.userAgent?.substring(0, 30)) === uid)?.user?.email ||
                        (uid.startsWith('guest-') ? 'Guest' : 'User@' + uid.substring(0, 6)),
                    days: days?.size || 0,
                    latest: Math.max(...filteredActivities.filter(a => (a.clerkId || 'guest-' + (a.metadata)?.userAgent?.substring(0, 30)) === uid).map(a => new Date(a.createdAt).getTime()))
                };
            })
            .sort((a, b) => b.latest - a.latest);

        const returningUsers = sortedTotal.filter(u => u.days > 1).slice(0, 50);
        const newUsersRes = sortedTotal.filter(u => u.days === 1).slice(0, 50);

        const getRecentUsers = (stage: 'land' | 'humanizer' | 'pricing' | 'convert' | 'inactive') => {
            const stageMap = funnelUsers[stage];
            if (!stageMap) return [];
            return Array.from(stageMap.values())
                .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                .slice(0, 50);
        };

        // 4. INACTIVE LOGGED-IN USERS
        // Filter users who have clericId but are NOT in the 'humanizer' funnel map
        // AND have no historical record in humanizerHistory (quota untouched)
        const usersWithAnyHistory = new Set(
            humanizerHistory
                .map(h => (h as any).user?.clerkId)
                .filter(Boolean)
        );

        const allLoggedInUids = new Set<string>();
        activities.forEach(a => {
            if (a.clerkId) {
                const uid = a.clerkId;
                const isPaid = !!(a.user?.subscriptionPlan || a.user?.subscriptionType);
                if (!funnelUsers.humanizer?.has(uid) && !usersWithAnyHistory.has(uid) && !isPaid) {
                    allLoggedInUids.add(uid);
                }
            }
        });

        allLoggedInUids.forEach(uid => {
            const lastAct = activities.find(a => a.clerkId === uid);
            if (lastAct) {
                const email = lastAct.user?.email || 'User@' + uid.substring(0, 6);
                const loc = (lastAct.metadata)?.location || 'Unknown';
                const country = loc.split(', ').pop() || 'Unknown';

                funnelUsers.inactive?.set(uid, {
                    email,
                    timestamp: new Date(lastAct.createdAt),
                    country,
                    isTrigger: false
                });
            }
        });

        return {
            funnel: {
                landingCount: funnelUsers.land?.size || 0,
                humanizerCount: funnelUsers.humanizer?.size || 0,
                pricingCount: funnelUsers.pricing?.size || 0,
                conversionCount: funnelUsers.convert?.size || 0,
                inactiveCount: funnelUsers.inactive?.size || 0,
                landingUsers: getRecentUsers('land'),
                humanizerUsers: getRecentUsers('humanizer'),
                pricingUsers: getRecentUsers('pricing'),
                conversionUsers: getRecentUsers('convert'),
                inactiveUsers: getRecentUsers('inactive')
            },
            devices: deviceStats,
            retention: {
                returning: sortedTotal.filter(u => u.days > 1).length,
                new: sortedTotal.filter(u => u.days === 1).length,
                returningUsers: returningUsers.map(u => ({ email: u.email, timestamp: new Date(u.latest) })),
                newUsers: newUsersRes.map(u => ({ email: u.email, timestamp: new Date(u.latest) }))
            }
        };
    }, [filteredActivities, retentionDate, deviceDate, funnelDate, humanizerHistory, activities]);

    // 5. CREDITS VELOCITY AGGREGATION
    const creditsVelocity = useMemo(() => {
        // Map clerkId to latest country from activities
        const userCountries: Record<string, string> = {};
        activities.forEach(a => {
            const uid = a.clerkId;
            if (!uid || userCountries[uid]) return;
            const loc = (a.metadata)?.location || 'Unknown';
            const country = loc.split(', ').pop() || 'Unknown';
            userCountries[uid] = country;
        });

        const filteredBurn: Record<string, number> = {};

        humanizerHistory.forEach(h => {
            // User Type Filter
            if (userTypeFilter !== 'ALL') {
                const isPaid = !!(h.user?.subscriptionPlan || h.user?.subscriptionType);
                const matches = userTypeFilter === 'PAID' ? isPaid : !isPaid;
                if (!matches) return;
            }

            // Country Filter
            if (countryFilter) {
                const country = h.user?.clerkId ? userCountries[h.user.clerkId] : 'Unknown';
                if (country !== countryFilter) return;
            }

            const date = new Date(h.createdAt).toISOString().split('T')[0];
            if (date) {
                filteredBurn[date] = (filteredBurn[date] || 0) + (h.tokensUsed || 0);
            }
        });

        return Object.entries(filteredBurn)
            .map(([date, tokens]) => ({ date, tokens }))
            .sort((a, b) => b.date.localeCompare(a.date))
            .slice(0, 7);
    }, [humanizerHistory, activities, userTypeFilter, countryFilter]);

    const { interactionPatterns, availableSequences, hasMore } = useMemo(() => {
        const sessionJourneys: Record<string, { sequence: string[]; user: any }> = {};

        filteredActivities.slice().reverse().forEach(a => {
            if (a.event !== 'CLICK') return;

            // Cluster Date Filter
            if (clusterDate) {
                const aDate = new Date(a.createdAt).toISOString().split('T')[0];
                if (aDate !== clusterDate) return;
            }

            const uid = a.clerkId || 'guest-' + ((a.metadata)?.userAgent?.substring(0, 30) || 'unknown');
            const loc = (a.metadata)?.location || 'Unknown';
            const country = loc.split(', ').pop() || 'Unknown';
            const timestamp = new Date(a.createdAt);
            const email = a.user?.email || (a.clerkId ? 'User@' + a.clerkId.substring(0, 6) : 'Guest');

            if (uid) {
                if (!sessionJourneys[uid]) {
                    sessionJourneys[uid] = {
                        sequence: [],
                        user: { uid, email, country, timestamp }
                    };
                }
                const finalLabel = getRefinedLabel(a);
                sessionJourneys[uid].sequence.push(finalLabel);
                // Update timestamp to the latest in the session
                if (timestamp > sessionJourneys[uid].user.timestamp) {
                    sessionJourneys[uid].user.timestamp = timestamp;
                }
            }
        });

        const journeyFrequency: Record<string, { sequence: string[]; count: number; users: any[] }> = {};
        const pairs = new Set<string>();

        Object.values(sessionJourneys).forEach(item => {
            const rawSeq = item.sequence;
            if (rawSeq.length === 0) return;

            // Sequence Compression (A -> A -> B becomes A -> B)
            const seq: string[] = [];
            rawSeq.forEach((step, i) => {
                if (i === 0 || step !== rawSeq[i - 1]) {
                    seq.push(step);
                }
            });

            if (seq.length === 0) return;

            // Collect 2-step pairs for filter
            for (let i = 0; i < seq.length - 1; i++) {
                pairs.add(`${seq[i]} → ${seq[i + 1]}`);
            }

            const hash = seq.join(' → ');

            // Sequence Filter
            if (sequenceFilter) {
                if (!hash.includes(sequenceFilter)) return;
            }

            if (!journeyFrequency[hash]) {
                journeyFrequency[hash] = { sequence: seq, count: 0, users: [] };
            }
            journeyFrequency[hash].count++;
            journeyFrequency[hash].users.push(item.user);
        });

        const sorted = Object.values(journeyFrequency)
            .sort((a, b) => b.count - a.count)
            .map(pattern => ({
                ...pattern,
                users: pattern.users
                    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                    .slice(0, 50)
            }))
            .filter(pattern => {
                if (!clusterEmailSearch) return true;
                return pattern.users.some(u =>
                    u.email.toLowerCase().includes(clusterEmailSearch.toLowerCase())
                );
            });

        return {
            interactionPatterns: sorted.slice(0, clusterLimit),
            availableSequences: Array.from(pairs).sort(),
            hasMore: sorted.length > clusterLimit
        };
    }, [filteredActivities, clusterDate, sequenceFilter, clusterLimit, clusterEmailSearch]);

    // 7. RAGE CLICK DETECTION (Friction Monitor)
    const rageClicks = useMemo(() => {
        const threshold = 5; // clicks
        const timeWindow = 2000; // 2 seconds
        const userActionGroups: Record<string, { times: Date[], user: string, path: string }> = {};

        filteredActivities.forEach(a => {
            if (a.event !== 'CLICK') return;
            const aDate = new Date(a.createdAt).toISOString().split('T')[0];
            if (frictionDate && aDate !== frictionDate) return;

            const uid = a.clerkId || 'guest-' + (a.metadata)?.userAgent?.substring(0, 30);
            const metadata = a.metadata;
            const targetLabel = metadata?.element?.text || a.target || 'Unknown Element';
            const key = `${uid}-${targetLabel}`;

            if (!userActionGroups[key]) userActionGroups[key] = { times: [], user: a.user?.name || a.clerkId || 'Guest', path: a.path || '/' };
            userActionGroups[key].times.push(new Date(a.createdAt));
        });

        const detected = [];
        for (const [key, group] of Object.entries(userActionGroups)) {
            const times = group.times;
            times.sort((a, b) => a.getTime() - b.getTime());
            for (let i = 0; i <= times.length - threshold; i++) {
                const start = times[i];
                const end = times[i + threshold - 1];

                if (start && end) {
                    const diff = end.getTime() - start.getTime();
                    if (diff <= timeWindow) {
                        const [, ...targetParts] = key.split('-');
                        detected.push({
                            target: targetParts.join('-') || 'unknown',
                            count: times.length,
                            user: group.user,
                            path: group.path,
                            lastSeen: times[times.length - 1]
                        });
                        break;
                    }
                }
            }
        }
        return detected.slice(0, 5);
    }, [filteredActivities, frictionDate]);

    const geoDistribution = useMemo(() => {
        const stats: Record<string, {
            hits: number;
            users: Map<string, { email: string, timestamp: Date }>;
            wordsHumanized: number
        }> = {};
        const userCountryMap: Record<string, string> = {};

        filteredActivities.forEach(a => {
            const loc = (a.metadata)?.location || 'Unknown';
            const country = loc.split(', ').pop() || 'Unknown';
            const uid = a.clerkId || 'guest-' + ((a.metadata)?.userAgent?.substring(0, 30) || 'unknown');

            userCountryMap[uid] = country;

            if (geoDate) {
                const aDate = new Date(a.createdAt).toISOString().split('T')[0];
                if (aDate !== geoDate) return;
            }

            if (!stats[country]) {
                stats[country] = { hits: 0, users: new Map(), wordsHumanized: 0 };
            }
            stats[country].hits++;

            if (!stats[country].users.has(uid)) {
                const email = a.user?.email || (a.clerkId ? 'User@' + a.clerkId.substring(0, 6) : 'Guest');
                stats[country].users.set(uid, { email, timestamp: new Date(a.createdAt) });
            }
        });

        // Words Humanized Attribution (Geo)
        const adminEmailList = ['kirubelman3@gmail.com', 'misganaworkineh@gmail.com'];
        const filteredHumanizerHistory = humanizerHistory.filter(h =>
            !h.user?.email || !adminEmailList.includes(h.user.email)
        );

        filteredHumanizerHistory.forEach(h => {
            const uid = h.user?.clerkId;
            if (!uid) return;
            const country = userCountryMap[uid];
            if (country && stats[country]) {
                stats[country].wordsHumanized += (h.tokensUsed || 0);
            }
        });

        const result = Object.entries(stats)
            .map(([country, data]) => ({
                country,
                hits: data.hits,
                userCount: data.users.size,
                wordsHumanized: data.wordsHumanized,
                recentUsers: Array.from(data.users.values())
                    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                    .slice(0, 50)
            }));

        // Apply sorting
        const sorted = result.sort((a, b) => {
            let compareValue = 0;
            if (geoSortBy === 'hits') {
                compareValue = a.hits - b.hits;
            } else if (geoSortBy === 'users') {
                compareValue = a.userCount - b.userCount;
            } else if (geoSortBy === 'words') {
                compareValue = a.wordsHumanized - b.wordsHumanized;
            }
            return geoSortOrder === 'asc' ? compareValue : -compareValue;
        });

        return sorted;
    }, [filteredActivities, geoDate, humanizerHistory, geoSortBy, geoSortOrder]);

    // 8. ACTIVE USERS TREND (HOURLY DISTRIBUTION OVER DATE RANGE)
    const userActivityTrend = useMemo(() => {
        const buckets: Record<string, Set<string>> = {};
        const hours: string[] = [];

        // Initialize 24-hour buckets
        for (let i = 0; i < 24; i++) {
            const label = `${i}:00`;
            buckets[label] = new Set();
            hours.push(label);
        }

        const start = trendStartDate ? new Date(`${trendStartDate}T00:00:00Z`) : new Date(0);
        const end = trendEndDate ? new Date(`${trendEndDate}T23:59:59Z`) : new Date();

        filteredActivities.forEach(a => {
            const aDate = new Date(a.createdAt);
            if (aDate >= start && aDate <= end) {
                // Individual Trend Country Filter
                if (trendCountry) {
                    const loc = (a.metadata)?.location || 'Unknown';
                    const country = loc.split(', ').pop() || 'Unknown';
                    if (country !== trendCountry) return;
                }

                const hour = aDate.getUTCHours();
                const label = `${hour}:00`;
                if (buckets[label]) {
                    const uid = a.clerkId || 'guest-' + ((a.metadata)?.userAgent?.substring(0, 30) || 'unknown');
                    buckets[label].add(uid);
                }
            }
        });

        return hours.map(label => ({
            label, // e.g. "14:00"
            users: buckets[label]?.size || 0
        }));
    }, [filteredActivities, trendStartDate, trendEndDate, trendCountry]);

    const aggregatedFeed = useMemo(() => {
        if (!isFeedAggregated) return null;

        const groups: Record<string, {
            user: any,
            activities: any[],
            latestTimestamp: Date,
            country: string,
            email: string,
            clerkId: string | null,
            wordsHumanized: number
        }> = {};

        filteredFeed.forEach(a => {
            const uid = a.clerkId || 'guest-' + ((a.metadata)?.userAgent?.substring(0, 30) || 'unknown');
            if (!groups[uid]) {
                const loc = (a.metadata)?.location || 'Unknown';
                const country = loc.split(', ').pop() || 'Unknown';
                const email = a.user?.email || (a.clerkId ? 'User@' + a.clerkId.substring(0, 6) : 'Guest');

                // Calculate total words humanized for this user
                const userWords = humanizerHistory
                    .filter(h => (a.clerkId && (h as any).user?.clerkId === a.clerkId) || (!a.clerkId && !(h as any).user?.clerkId))
                    .reduce((sum, h) => sum + (h.tokensUsed || 0), 0);

                groups[uid] = {
                    user: a.user,
                    activities: [],
                    latestTimestamp: new Date(a.createdAt),
                    country,
                    email,
                    clerkId: a.clerkId,
                    wordsHumanized: userWords
                };
            }
            const group = groups[uid];
            if (group) {
                group.activities.push(a);
                const aTime = new Date(a.createdAt);
                if (aTime > group.latestTimestamp) {
                    group.latestTimestamp = aTime;
                }
            }
        });

        return Object.values(groups)
            .filter(group => {
                if (!feedWordsFilter) return true;

                // Only filter free users by word consumption
                const isPaid = !!(group.user?.subscriptionPlan || group.user?.subscriptionType);
                if (isPaid) return true;

                const words = group.wordsHumanized;
                switch (feedWordsFilter) {
                    case '0-100': return words >= 0 && words <= 100;
                    case '100-200': return words > 100 && words <= 200;
                    case '200-300': return words > 200 && words <= 300;
                    case '300-400': return words > 300 && words <= 400;
                    case '400-500': return words > 400 && words <= 500;
                    default: return true;
                }
            })
            .sort((a, b) => b.latestTimestamp.getTime() - a.latestTimestamp.getTime());
    }, [filteredFeed, isFeedAggregated, feedWordsFilter]);

    return (
        <div className="min-h-screen bg-white/[0.02] p-4 md:p-8 font-sans text-white">
            <div className="max-w-[1600px] mx-auto">
                <header className="mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                    <div>
                        <Link href="/" className="inline-flex items-center text-[10px] font-black text-slate-400 hover:text-brand-primary-600 mb-2 transition-colors uppercase tracking-[0.2em]">
                            <ArrowLeft className="w-3 h-3 mr-2" /> Exit Dashboard
                        </Link>
                        <h1 className="text-4xl font-black tracking-tighter leading-none flex items-center">
                            Behavioral<span className="text-brand-primary-600 ml-1.5">Intelligence</span>
                        </h1>
                        <p className="text-slate-400 mt-2 text-sm font-medium">Real-time engagement analysis and interaction mapping.</p>
                    </div>
                    <div className="flex gap-4 items-center">
                        <select
                            className="px-4 py-2 bg-card rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-brand-primary-50 transition-all cursor-pointer"
                            value={userTypeFilter}
                            onChange={(e) => setUserTypeFilter(e.target.value as any)}
                        >
                            <option value="ALL">All Segments</option>
                            <option value="FREE">Free Users Only</option>
                            <option value="PAID">Paid Customers Only</option>
                        </select>
                        <select
                            className="px-4 py-2 bg-card rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-brand-primary-50 transition-all cursor-pointer"
                            value={countryFilter}
                            onChange={(e) => setCountryFilter(e.target.value)}
                        >
                            <option value="">All Locations</option>
                            {availableCountries.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                        <div className="px-5 py-3 bg-card rounded-2xl  border border-white/10 flex items-center ring-4 ring-slate-100/50">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2.5 animate-pulse"></div>
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Uplink Active</span>
                        </div>
                    </div>
                </header>

                <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
                        <div className="bg-card p-6 rounded-[2.5rem]  border border-white/10 md:col-span-12 lg:col-span-8 flex flex-col justify-center">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-sm font-black uppercase tracking-[0.2em] flex items-center text-slate-400">
                                        <Users className="w-4 h-4 mr-2 text-emerald-500" />
                                        Returning vs New
                                    </h3>
                                </div>
                                <input
                                    type="date"
                                    className="px-3 py-1.5 bg-white/[0.02] rounded-lg border border-white/10 text-[10px] font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 uppercase tracking-tighter"
                                    value={retentionDate}
                                    onChange={(e) => setRetentionDate(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col md:flex-row items-center gap-8">
                                <div className="flex items-center gap-6">
                                    <div className="group/ret relative cursor-help">
                                        <p className="text-3xl font-black text-white leading-tight">{dynamicBI.retention.returning}</p>
                                        <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Returning</p>

                                        {/* Returning Users Drilldown */}
                                        <div className="absolute top-full left-0 mt-2 z-50 transition-all duration-300 opacity-0 group-hover/ret:opacity-100 pointer-events-none group-hover/ret:pointer-events-auto min-w-[240px]">
                                            <div className="bg-card rounded-2xl p-4 shadow-2xl border border-white/10 max-h-[250px] overflow-y-auto custom-scrollbar">
                                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pb-2 border-b border-white/5 flex justify-between">
                                                    <span>Returning Users</span>
                                                    <span className="text-emerald-500">History</span>
                                                </h4>
                                                <div className="space-y-2">
                                                    {(dynamicBI.retention as any).returningUsers?.map((u: any, idx: number) => (
                                                        <div key={idx} className="flex justify-between items-center gap-4 group/u">
                                                            <span className="text-[10px] font-bold text-white truncate flex-1">{u.email}</span>
                                                            <span className="text-[7px] font-black text-slate-300 uppercase shrink-0">
                                                                {isMounted ? new Date(u.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }) : '--'}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-px h-12 bg-white/[0.04]"></div>
                                    <div className="group/new relative cursor-help">
                                        <p className="text-3xl font-black text-white leading-tight">{dynamicBI.retention.new}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fresh Leads</p>

                                        {/* New Users Drilldown */}
                                        <div className="absolute top-full left-0 mt-2 z-50 transition-all duration-300 opacity-0 group-hover/new:opacity-100 pointer-events-none group-hover/new:pointer-events-auto min-w-[240px]">
                                            <div className="bg-card rounded-2xl p-4 shadow-2xl border border-white/10 max-h-[250px] overflow-y-auto custom-scrollbar">
                                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pb-2 border-b border-white/5 flex justify-between">
                                                    <span>Fresh Leads</span>
                                                    <span className="text-slate-400">History</span>
                                                </h4>
                                                <div className="space-y-2">
                                                    {(dynamicBI.retention as any).newUsers?.map((u: any, idx: number) => (
                                                        <div key={idx} className="flex justify-between items-center gap-4 group/u">
                                                            <span className="text-[10px] font-bold text-white truncate flex-1">{u.email}</span>
                                                            <span className="text-[7px] font-black text-slate-300 uppercase shrink-0">
                                                                {isMounted ? new Date(u.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }) : '--'}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1 w-full space-y-2">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                                        <span>Retention Index</span>
                                        <span>{Math.round((dynamicBI.retention.returning / (dynamicBI.retention.returning + dynamicBI.retention.new || 1)) * 100)}%</span>
                                    </div>
                                    <div className="h-3 bg-white/[0.04] rounded-full overflow-hidden flex ring-4 ring-slate-50">
                                        <div
                                            className="h-full bg-emerald-500 transition-all duration-500"
                                            style={{ width: `${(dynamicBI.retention.returning / (dynamicBI.retention.returning + dynamicBI.retention.new || 1)) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* BI Performance Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        {/* 1. Friction Radar */}
                        <div className="bg-slate-900 text-white p-6 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-sm font-black uppercase tracking-[0.2em] flex items-center text-slate-400">
                                    <ShieldAlert className="w-4 h-4 mr-2 text-brand-primary-400" />
                                    Friction Radar
                                </h3>
                                <input
                                    type="date"
                                    className="px-2 py-1 bg-white/5 rounded border border-white/10 text-[8px] font-bold outline-none uppercase tracking-tighter"
                                    value={frictionDate}
                                    onChange={(e) => setFrictionDate(e.target.value)}
                                />
                            </div>
                            <div className="space-y-3 relative z-10 max-h-[350px] overflow-y-auto custom-scrollbar pr-2">
                                {rageClicks.length > 0 ? rageClicks.map((click, i) => (
                                    <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                                        <div className="flex justify-between items-start mb-1.5">
                                            <div className="min-w-0">
                                                <p className="text-[8px] font-black text-brand-primary-400 uppercase tracking-tighter">Rage Detected • {click.count}x</p>
                                                <p className="text-xs font-bold truncate">{click.target}</p>
                                            </div>
                                            <span className="text-[7px] font-bold opacity-30">
                                                {isMounted && click.lastSeen ? new Date(click.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 pt-1.5 border-t border-white/5">
                                            <p className="text-[7px] font-bold opacity-50 flex items-center truncate">
                                                <UserIcon className="w-2 h-2 mr-1" /> {click.user}
                                            </p>
                                            <div className="w-px h-2 bg-white/10"></div>
                                            <p className="text-[7px] font-bold opacity-50 flex items-center truncate">
                                                <Navigation2 className="w-2 h-2 mr-1" /> {click.path}
                                            </p>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="py-8 text-center">
                                        <Zap className="w-8 h-8 mx-auto opacity-20 mb-2" />
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Smooth Surface - No Friction</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 2. Conversion Funnel */}
                        <div className="bg-card p-6 rounded-[2.5rem] border border-white/10  relative overflow-hidden flex flex-col">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-sm font-black uppercase tracking-[0.2em] flex items-center text-slate-400">
                                    <BarChart3 className="w-4 h-4 mr-2 text-indigo-500" />
                                    Conversion Funnel
                                </h3>
                                <input
                                    type="date"
                                    className="px-2 py-1 bg-white/[0.02] rounded border border-white/10 text-[8px] font-bold outline-none uppercase tracking-tighter"
                                    value={funnelDate}
                                    onChange={(e) => setFunnelDate(e.target.value)}
                                />
                            </div>
                            <div className="space-y-4 flex-1">
                                {[
                                    { label: 'Landed', value: dynamicBI.funnel.landingCount, users: dynamicBI.funnel.landingUsers, color: 'bg-white/[0.04]', icon: Globe },
                                    { label: 'Used Humanizer', value: dynamicBI.funnel.humanizerCount, users: dynamicBI.funnel.humanizerUsers, color: 'bg-blue-50', icon: Zap },
                                    { label: 'Explored Pricing', value: dynamicBI.funnel.pricingCount, users: dynamicBI.funnel.pricingUsers, color: 'bg-indigo-50/50', icon: CreditCard },
                                    { label: 'Converted', value: dynamicBI.funnel.conversionCount, users: dynamicBI.funnel.conversionUsers, color: 'bg-brand-primary-50', icon: TrendingUp },
                                    { label: 'Inactive Logged-in', value: dynamicBI.funnel.inactiveCount, users: dynamicBI.funnel.inactiveUsers, color: 'bg-rose-50/50', icon: ShieldAlert }
                                ].map((step, i, arr) => {
                                    const prevStep = i === 0 ? step : arr[i - 1];
                                    const dropoff = i === 0 ? 100 : Math.round((step.value / (arr[0]?.value || 1)) * 100);
                                    return (
                                        <div key={step.label} className="group/funnel">
                                            <div className={`flex justify-between items-center p-3 rounded-xl ${step.color} border border-white/5 hover:shadow-xl shadow-black/50 shadow-black/50 transition-all`}>
                                                <div className="flex items-center gap-2">
                                                    <step.icon className="w-3.5 h-3.5 text-slate-400" />
                                                    <span className="text-xs font-black uppercase tracking-tighter text-slate-400">{step.label}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-black text-white">{isMounted ? step.value.toLocaleString() : step.value}</span>
                                                    {i > 0 && (
                                                        <span className="text-[10px] font-bold text-emerald-600">
                                                            {dropoff}%
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="mt-1 transition-all duration-300 max-h-0 group-hover/funnel:max-h-[300px] overflow-hidden">
                                                <div className="bg-white/[0.02] rounded-xl p-2 border border-white/5 max-h-[290px] overflow-y-auto custom-scrollbar">
                                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-2">Most Recent Active</p>
                                                    {step.users.length > 0 ? step.users.map((u, idx) => (
                                                        <div key={idx} className="flex flex-col gap-1 px-2 py-2 hover:bg-card rounded-md transition-colors border-b border-white/[0.05]/50 last:border-0">
                                                            <div className="flex justify-between items-center">
                                                                <div className="flex items-center gap-1.5 min-w-0">
                                                                    <span className="text-[9px] font-bold text-slate-300 truncate">{u.email}</span>
                                                                    <span className="px-1 py-0.5 bg-white/[0.04] text-slate-400 text-[6px] font-black uppercase rounded tracking-tighter shrink-0 border border-white/10">
                                                                        {u.country}
                                                                    </span>
                                                                </div>
                                                                <div className="flex flex-col items-end shrink-0 ml-2">
                                                                    <span className="text-[7px] font-bold text-slate-400">
                                                                        {isMounted ? new Date(u.timestamp).toLocaleDateString([], { month: '2-digit', day: '2-digit' }) : '--/--'}
                                                                    </span>
                                                                    <span className="text-[7px] font-medium text-slate-400">
                                                                        {isMounted ? new Date(u.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            {(u.page || u.elementText) && i > 0 && (
                                                                <div className="flex flex-wrap gap-1.5 leading-none mt-1">
                                                                    {u.page && (
                                                                        <span className="text-[7px] font-black text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100/50 truncate max-w-[100px]">
                                                                            {u.page}
                                                                        </span>
                                                                    )}
                                                                    {u.elementText && u.elementText !== 'None' && (
                                                                        <span className={`text-[7px] font-black italic px-1.5 py-0.5 rounded border truncate max-w-[150px] ${step.label.includes('Pricing')
                                                                            ? 'text-amber-600 bg-amber-50 border-amber-100'
                                                                            : 'text-blue-500 bg-blue-50/50 border-blue-100'
                                                                            }`}>
                                                                            "{u.elementText}"
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )) : (
                                                        <p className="text-[9px] text-slate-400 text-center py-2 italic font-medium">No activity in sample</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 3. Credits Velocity */}
                        <div className="bg-card p-6 rounded-[2.5rem] border border-white/10  flex flex-col">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-sm font-black uppercase tracking-[0.2em] flex items-center text-slate-400">
                                    <Recycle className="w-4 h-4 mr-2 text-emerald-500" />
                                    Credits Velocity
                                </h3>
                                <div className="px-2 py-1 bg-emerald-50 rounded border border-emerald-100 text-[8px] font-black text-emerald-600 uppercase tracking-tighter">
                                    Last 7 Days
                                </div>
                            </div>
                            <div className="flex-1 flex items-end gap-2 h-[200px] px-2 justify-between">
                                {creditsVelocity.length > 0 ? creditsVelocity.slice().reverse().map((d, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                                        <div
                                            className="w-full bg-emerald-500/10 rounded-t-xl hover:bg-emerald-500/80 transition-all cursor-help relative min-h-[4px]"
                                            style={{ height: `${Math.max(2, (d.tokens / (Math.max(...creditsVelocity.map(b => b.tokens)) || 1)) * 100)}%` }}
                                        >
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-black px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-xl z-10 whitespace-nowrap pointer-events-none">
                                                {d.tokens.toLocaleString()}
                                            </div>
                                        </div>
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter shrink-0">{d.date.split('-').slice(1).join('/')}</span>
                                    </div>
                                )) : (
                                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 h-full w-full">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mt-2">No activity in window</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Secondary BI Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Device Mix Card */}
                        <div className="bg-card p-6 rounded-[2.5rem] border border-white/10 ">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-sm font-black uppercase tracking-[0.2em] flex items-center text-slate-400">
                                    <Smartphone className="w-4 h-4 mr-2 text-indigo-500" />
                                    Device Mix
                                </h3>
                                <input
                                    type="date"
                                    className="px-2 py-1 bg-white/[0.02] rounded border border-white/10 text-[8px] font-bold outline-none uppercase tracking-tighter"
                                    value={deviceDate}
                                    onChange={(e) => setDeviceDate(e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {Object.entries(dynamicBI.devices).map(([type, stats]) => {
                                    const totalHits = Object.values(dynamicBI.devices).reduce((acc, s) => acc + s.hits, 0) || 1;
                                    const recentUsers = Array.from((stats as any).users?.values() || [])
                                        .sort((a: any, b: any) => b.timestamp.getTime() - a.timestamp.getTime())
                                        .slice(0, 50);

                                    return (
                                        <div key={type} className="bg-white/[0.02] p-3 rounded-xl border border-white/5 flex flex-col gap-2 group/device relative">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{type}</span>
                                                <div className="flex flex-col items-end">
                                                    <span className="text-xs font-black text-emerald-600 leading-none">{(stats as any).wordsHumanized?.toLocaleString() || 0}</span>
                                                    <span className="text-[6px] font-bold text-slate-400 uppercase tracking-tighter">Words</span>
                                                </div>
                                                <div className="w-[1px] h-3 bg-white/[0.05] mx-0.5 opacity-50"></div>
                                                <div className="flex flex-col items-end">
                                                    <span className="text-xs font-black text-white leading-none">{stats.hits}</span>
                                                    <span className="text-[6px] font-bold text-slate-400 uppercase tracking-tighter">Hits</span>
                                                </div>
                                                <div className="w-[1px] h-3 bg-white/[0.05] mx-0.5 opacity-50"></div>
                                                <div className="flex flex-col items-end">
                                                    <span className="text-xs font-black text-indigo-600 leading-none">{stats.users.size}</span>
                                                    <span className="text-[6px] font-bold text-slate-400 uppercase tracking-tighter">Users</span>
                                                </div>
                                            </div>
                                            <div className="w-full h-1 bg-white/[0.05] rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-indigo-500"
                                                    style={{ width: `${(stats.hits / totalHits) * 100}%` }}
                                                ></div>
                                            </div>

                                            {/* Device User Drilldown Tooltip */}
                                            {recentUsers.length > 0 && (
                                                <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 opacity-0 group-hover/device:opacity-100 pointer-events-none group-hover/device:pointer-events-auto min-w-[240px]">
                                                    <div className="bg-card rounded-2xl p-4 shadow-2xl border border-white/10 max-h-[220px] overflow-y-auto custom-scrollbar">
                                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pb-2 border-b border-white/5 flex justify-between">
                                                            <span>Recent Users</span>
                                                            <span className="text-indigo-500">{type}</span>
                                                        </h4>
                                                        <div className="space-y-2">
                                                            {recentUsers.map((u: any, idx: number) => (
                                                                <div key={idx} className="flex justify-between items-center gap-4">
                                                                    <span className="text-[10px] font-bold text-white truncate flex-1">{u.email}</span>
                                                                    <span className="text-[7px] font-black text-slate-300 uppercase shrink-0">
                                                                        {isMounted ? new Date(u.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }) : '--'}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    {/* Arrow pointing down */}
                                                    <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-white "></div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Global Reach Card */}
                        <div className="bg-card p-6 rounded-[2.5rem] border border-white/10  overflow-visible">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-sm font-black uppercase tracking-[0.2em] flex items-center text-slate-400">
                                    <Globe className="w-4 h-4 mr-2 text-emerald-500" />
                                    Global Reach
                                </h3>
                                <div className="flex gap-2">
                                    <input
                                        type="date"
                                        className="px-2 py-1 bg-white/[0.02] rounded border border-white/10 text-[8px] font-bold outline-none uppercase tracking-tighter"
                                        value={geoDate}
                                        onChange={(e) => setGeoDate(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="overflow-visible">
                                <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                                    {/* Column Headers with Sorting */}
                                    <div className="flex items-center gap-3 pb-2 border-b border-white/10">
                                        <span className="text-[10px] font-black text-slate-400 uppercase w-12">Country</span>
                                        <div className="flex-1"></div>
                                        <div className="flex items-center gap-2 shrink-0 min-w-[100px] justify-end">
                                            <button
                                                onClick={() => {
                                                    if (geoSortBy === 'words') {
                                                        setGeoSortOrder(geoSortOrder === 'asc' ? 'desc' : 'asc');
                                                    } else {
                                                        setGeoSortBy('words');
                                                        setGeoSortOrder('desc');
                                                    }
                                                }}
                                                className="flex flex-col items-end cursor-pointer hover:opacity-70 transition-opacity"
                                            >
                                                <div className="flex items-center gap-1">
                                                    <span className="text-[6px] font-bold text-slate-400 uppercase tracking-tighter">Words</span>
                                                    {geoSortBy === 'words' && (
                                                        <span className="text-[8px]">{geoSortOrder === 'asc' ? '↑' : '↓'}</span>
                                                    )}
                                                </div>
                                            </button>
                                            <div className="w-[1px] h-4 bg-white/[0.05] mx-0.5 opacity-50"></div>
                                            <button
                                                onClick={() => {
                                                    if (geoSortBy === 'hits') {
                                                        setGeoSortOrder(geoSortOrder === 'asc' ? 'desc' : 'asc');
                                                    } else {
                                                        setGeoSortBy('hits');
                                                        setGeoSortOrder('desc');
                                                    }
                                                }}
                                                className="flex flex-col items-end cursor-pointer hover:opacity-70 transition-opacity"
                                            >
                                                <div className="flex items-center gap-1">
                                                    <span className="text-[6px] font-bold text-slate-400 uppercase tracking-tighter">Hits</span>
                                                    {geoSortBy === 'hits' && (
                                                        <span className="text-[8px]">{geoSortOrder === 'asc' ? '↑' : '↓'}</span>
                                                    )}
                                                </div>
                                            </button>
                                            <div className="w-[1px] h-4 bg-white/[0.05] mx-0.5 opacity-50"></div>
                                            <button
                                                onClick={() => {
                                                    if (geoSortBy === 'users') {
                                                        setGeoSortOrder(geoSortOrder === 'asc' ? 'desc' : 'asc');
                                                    } else {
                                                        setGeoSortBy('users');
                                                        setGeoSortOrder('desc');
                                                    }
                                                }}
                                                className="flex flex-col items-end cursor-pointer hover:opacity-70 transition-opacity"
                                            >
                                                <div className="flex items-center gap-1">
                                                    <span className="text-[6px] font-bold text-slate-400 uppercase tracking-tighter">Users</span>
                                                    {geoSortBy === 'users' && (
                                                        <span className="text-[8px]">{geoSortOrder === 'asc' ? '↑' : '↓'}</span>
                                                    )}
                                                </div>
                                            </button>
                                        </div>
                                    </div>

                                    {geoDistribution.map((data, idx) => (
                                        <div key={data.country} className="flex items-center gap-3 group/geo relative py-1">
                                            <span className="text-[10px] font-black text-slate-400 uppercase w-12">{data.country}</span>
                                            <div className="flex-1 h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-emerald-500 opacity-60"
                                                    style={{ width: `${(data.hits / (geoDistribution[0]?.hits || 1)) * 100}%` }}
                                                ></div>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0 min-w-[100px] justify-end">
                                                <div className="flex flex-col items-end">
                                                    <span className="text-[10px] font-black text-brand-primary-500 leading-none">{(data as any).wordsHumanized?.toLocaleString() || 0}</span>
                                                </div>
                                                <div className="w-[1px] h-4 bg-white/[0.05] mx-0.5 opacity-50"></div>
                                                <div className="flex flex-col items-end">
                                                    <span className="text-[10px] font-black text-white leading-none">{data.hits}</span>
                                                </div>
                                                <div className="w-[1px] h-4 bg-white/[0.05] mx-0.5 opacity-50"></div>
                                                <div className="flex flex-col items-end">
                                                    <span className="text-[10px] font-black text-emerald-600 leading-none">{data.userCount}</span>
                                                </div>
                                            </div>

                                            {/* Country User Drilldown - Adaptive positioning to avoid clipping */}
                                            <div className={`absolute ${idx < 3 ? 'top-full mt-2' : 'bottom-full mb-4'} left-1/2 -translate-x-1/2 z-50 transition-all duration-300 opacity-0 group-hover/geo:opacity-100 pointer-events-none group-hover/geo:pointer-events-auto min-w-[240px]`}>
                                                <div className="bg-card rounded-2xl p-4 shadow-2xl border border-white/10 max-h-[220px] overflow-y-auto custom-scrollbar">
                                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pb-2 border-b border-white/5 flex justify-between">
                                                        <span>Recent Users</span>
                                                        <span className="text-emerald-500">{data.country}</span>
                                                    </h4>
                                                    <div className="space-y-2">
                                                        {(data as any).recentUsers?.map((u: any, idx: number) => (
                                                            <div key={idx} className="flex justify-between items-center gap-4">
                                                                <span className="text-[10px] font-bold text-white truncate flex-1">{u.email}</span>
                                                                <span className="text-[7px] font-black text-slate-300 uppercase shrink-0">
                                                                    {isMounted ? new Date(u.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }) : '--'}
                                                                </span>
                                                            </div>
                                                        ))}
                                                        {(!(data as any).recentUsers || (data as any).recentUsers.length === 0) && (
                                                            <span className="text-[8px] font-bold text-slate-300 uppercase block text-center py-2">No user records</span>
                                                        )}
                                                    </div>
                                                </div>
                                                {/* Arrow - pointing up for top items, down for bottom items */}
                                                {idx < 3 ? (
                                                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-white"></div>
                                                ) : (
                                                    <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-white "></div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {geoDistribution.length === 0 && (
                                        <p className="text-center py-4 text-[10px] font-black text-slate-400 uppercase">No geo data</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                        {/* Historical User Activity Trend Chart */}
                        <div className="xl:col-span-12">
                            <section className="bg-card rounded-[2rem] border border-white/10  p-6">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                                    <h2 className="text-xl font-black flex items-center">
                                        <TrendingUp className="w-6 h-6 mr-2 text-emerald-500" />
                                        User Activity Trend
                                    </h2>
                                    <div className="flex flex-wrap gap-2 items-center">
                                        <div className="flex items-center bg-white/[0.04] p-1 rounded-xl border border-white/10">
                                            <Globe className="w-3.5 h-3.5 ml-2 text-slate-400" />
                                            <select
                                                className="bg-transparent border-none text-[10px] font-black uppercase outline-none px-2 cursor-pointer h-7 min-w-[120px]"
                                                value={trendCountry}
                                                onChange={(e) => setTrendCountry(e.target.value)}
                                            >
                                                <option value="">All Regions</option>
                                                {availableCountries.map(c => (
                                                    <option key={c} value={c}>{c}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="flex items-center bg-white/[0.04] p-1 rounded-xl border border-white/10">
                                            <input
                                                type="date"
                                                className="bg-transparent border-none text-[10px] font-black uppercase outline-none px-2 cursor-pointer"
                                                value={trendStartDate}
                                                onChange={(e) => setTrendStartDate(e.target.value)}
                                            />
                                            <span className="text-[10px] font-black text-slate-400 px-1">→</span>
                                            <input
                                                type="date"
                                                className="bg-transparent border-none text-[10px] font-black uppercase outline-none px-2 cursor-pointer"
                                                value={trendEndDate}
                                                onChange={(e) => setTrendEndDate(e.target.value)}
                                            />
                                        </div>
                                        <div className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase rounded-full border border-emerald-100">
                                            Aggregated Hourly Distribution (UTC)
                                        </div>
                                    </div>
                                </div>
                                <div className="h-[250px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={userActivityTrend}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                            <XAxis
                                                dataKey="label"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                                                dy={10}
                                                interval={2}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                                                dx={-10}
                                            />
                                            <RechartsTooltip
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }}
                                                cursor={{ stroke: '#6366f1', strokeWidth: 2, strokeDasharray: '4 4' }}
                                                labelFormatter={(val) => `Hour (UTC): ${val}`}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="users"
                                                stroke="#4f46e5"
                                                strokeWidth={3}
                                                dot={(props: any) => {
                                                    const { cx, cy, index, payload } = props;
                                                    const currentHourLabel = `${new Date().getUTCHours()}:00`;
                                                    if (payload.label === currentHourLabel) {
                                                        return (
                                                            <g key={index}>
                                                                <circle cx={cx} cy={cy} r={6} fill="#10b981" className="animate-ping opacity-75" />
                                                                <circle cx={cx} cy={cy} r={4} fill="#10b981" stroke="#fff" strokeWidth={1} />
                                                            </g>
                                                        );
                                                    }
                                                    return <React.Fragment key={index} />;
                                                }}
                                                activeDot={{ r: 6, fill: '#4f46e5', stroke: '#fff', strokeWidth: 2 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </section>
                        </div>

                        {/* Patterns Section - WIDE SIDEBAR STYLE */}
                        <div className="xl:col-span-12 space-y-4">
                            <section className="space-y-4">
                                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 px-2">
                                    <h2 className="text-xl font-black flex items-center">
                                        <Layers className="w-6 h-6 mr-2 text-brand-primary-500" />
                                        Click Series Clusters
                                    </h2>
                                    <div className="flex flex-wrap gap-3 items-center">
                                        <div className="relative group w-48">
                                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 group-focus-within:text-brand-primary-500 transition-colors" />
                                            <input
                                                type="text"
                                                placeholder="Search email..."
                                                className="w-full pl-7 pr-3 py-1.5 bg-card rounded-lg border border-white/10 text-[10px] font-bold outline-none focus:ring-2 focus:ring-brand-primary-50 transition-all placeholder:text-slate-300"
                                                value={clusterEmailSearch}
                                                onChange={(e) => setClusterEmailSearch(e.target.value)}
                                            />
                                        </div>
                                        <select
                                            className="px-3 py-1.5 bg-card rounded-lg border border-white/10 text-[10px] font-bold outline-none focus:ring-2 focus:ring-brand-primary-50 uppercase tracking-tighter max-w-[200px]"
                                            value={sequenceFilter}
                                            onChange={(e) => setSequenceFilter(e.target.value)}
                                        >
                                            <option value="">All Sequences</option>
                                            {availableSequences.map(seq => (
                                                <option key={seq} value={seq}>{seq}</option>
                                            ))}
                                        </select>
                                        <input
                                            type="date"
                                            className="px-3 py-1.5 bg-card rounded-lg border border-white/10 text-[10px] font-bold outline-none focus:ring-2 focus:ring-brand-primary-50 uppercase tracking-tighter"
                                            value={clusterDate}
                                            onChange={(e) => setClusterDate(e.target.value)}
                                        />
                                        <span className="px-3 py-1.5 bg-brand-primary-50 text-brand-primary-700 text-[10px] font-black rounded-lg border border-brand-primary-100 uppercase tracking-wider">
                                            Frequency Ranking
                                        </span>
                                    </div>
                                </div>
                                <div className="bg-white/[0.02] rounded-3xl border border-slate-200/60 p-1">
                                    <div className="max-h-[500px] overflow-y-auto custom-scrollbar p-2">
                                        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
                                            {interactionPatterns.map((journey, idx) => (
                                                <div key={idx} className="group/pattern relative">
                                                    <div className="bg-card p-3 rounded-2xl border border-white/10  flex flex-col hover:shadow-xl shadow-black/50 shadow-black/50 transition-all h-full cursor-help">
                                                        <div className="flex justify-between items-center mb-3">
                                                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter"># {idx + 1} Pattern</span>
                                                            <div className="flex items-center gap-1.5 leading-none">
                                                                <div className="flex flex-col items-end">
                                                                    <span className="text-sm font-black text-white leading-none">{journey.count}</span>
                                                                    <span className="text-[6px] font-bold text-brand-primary-500 uppercase tracking-tighter">Hits</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-wrap items-center gap-1 mt-auto">
                                                            {journey.sequence.map((step, sIdx) => (
                                                                <React.Fragment key={sIdx}>
                                                                    <div className="px-1.5 py-0.5 rounded-lg text-[8px] font-bold border bg-white/[0.02] border-white/5 text-slate-400 max-w-[120px] truncate">
                                                                        {step}
                                                                    </div>
                                                                    {sIdx < journey.sequence.length - 1 && <ChevronRight className="w-2 h-2 text-slate-300 shrink-0" />}
                                                                </React.Fragment>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Pattern Drilldown (Hover Reveal) */}
                                                    <div className="absolute top-full left-0 right-0 z-20 mt-1 transition-all duration-300 max-h-0 group-hover/pattern:max-h-[300px] overflow-hidden pointer-events-none group-hover/pattern:pointer-events-auto">
                                                        <div className="bg-slate-900 rounded-2xl p-3 border border-slate-800 shadow-2xl max-h-[290px] overflow-y-auto custom-scrollbar-dark">
                                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Recent Sequence Leads</p>
                                                            <div className="space-y-1.5">
                                                                {journey.users.map((u, uIdx) => (
                                                                    <div key={uIdx} className="flex flex-col gap-0.5 px-2 py-1.5 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 transition-colors">
                                                                        <div className="flex justify-between items-center">
                                                                            <div className="flex items-center gap-1.5 min-w-0">
                                                                                <span className="text-[9px] font-bold text-slate-200 truncate">{u.email}</span>
                                                                                <span className="px-1 py-0.5 bg-brand-primary-500/20 text-brand-primary-400 text-[6px] font-black uppercase rounded tracking-tighter shrink-0 border border-brand-primary-500/20">
                                                                                    {u.country}
                                                                                </span>
                                                                            </div>
                                                                            <div className="flex flex-col items-end shrink-0 ml-2">
                                                                                <span className="text-[7px] font-bold text-slate-400">
                                                                                    {isMounted ? new Date(u.timestamp).toLocaleTimeString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-- --, --:--'}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        {hasMore && (
                                            <div className="mt-4 text-center pb-2">
                                                <button
                                                    onClick={() => setClusterLimit(prev => prev + 12)}
                                                    className="px-6 py-2 bg-card border border-white/10  rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-brand-primary-600 hover:border-brand-primary-200 transition-all"
                                                >
                                                    Load More Patterns
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </section>
                        </div>

                        <div className="xl:col-span-4 space-y-8">
                            {/* Full Inventory Section */}
                            <section className="space-y-4">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
                                    <h2 className="text-xl font-black flex items-center">
                                        <MousePointer2 className="w-6 h-6 mr-2 text-amber-500" />
                                        Global Event Library
                                    </h2>
                                    <div className="relative group w-full md:w-64">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-brand-primary-500 transition-colors" />
                                        <input
                                            type="text"
                                            placeholder="Filter library..."
                                            className="w-full pl-9 pr-4 py-2 bg-card rounded-xl border border-white/10 text-xs font-medium focus:ring-4 focus:ring-brand-primary-50 focus:border-brand-primary-400 outline-none transition-all"
                                            value={inventorySearch}
                                            onChange={(e) => setInventorySearch(e.target.value)}
                                        />
                                    </div>
                                    <div className="relative group w-full md:w-44">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-brand-primary-500 transition-colors" />
                                        <input
                                            type="date"
                                            className="w-full pl-9 pr-3 py-2 bg-card rounded-xl border border-white/10 text-xs font-medium focus:ring-4 focus:ring-brand-primary-50 focus:border-brand-primary-400 outline-none transition-all uppercase tracking-tighter"
                                            value={inventoryDate}
                                            onChange={(e) => setInventoryDate(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="bg-card rounded-[2rem] border border-white/10  overflow-hidden">
                                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                        <table className="w-full text-left">
                                            <thead className="sticky top-0 bg-white/[0.02] border-b border-white/5 z-10">
                                                <tr>
                                                    <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Count</th>
                                                    <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                                                    <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Identifier</th>
                                                    <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Context</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {(displayInventory as any[]).map((item, i) => (
                                                    <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                                                        <td className="px-6 py-3 relative group/libitem">
                                                            <span className="text-xs font-black text-white cursor-help underline decoration-dotted decoration-slate-200 underline-offset-4">
                                                                {isMounted ? item.count.toLocaleString() : item.count}
                                                            </span>

                                                            {/* Library Item Drilldown (Hover Reveal) */}
                                                            <div className="absolute top-full left-0 z-30 mt-1 transition-all duration-300 max-h-0 group-hover/libitem:max-h-[300px] overflow-hidden pointer-events-none group-hover/libitem:pointer-events-auto">
                                                                <div className="bg-slate-900 rounded-2xl p-3 border border-slate-800 shadow-2xl max-h-[290px] overflow-y-auto custom-scrollbar-dark min-w-[240px]">
                                                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 text-left">Recent Interaction Leads</p>
                                                                    <div className="space-y-1.5">
                                                                        {item.users?.map((u: any, uIdx: number) => (
                                                                            <div key={uIdx} className="flex flex-col gap-0.5 px-2 py-1.5 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 transition-colors text-left">
                                                                                <div className="flex justify-between items-center">
                                                                                    <div className="flex items-center gap-1.5 min-w-0">
                                                                                        <span className="text-[9px] font-bold text-slate-200 truncate">{u.email}</span>
                                                                                        <span className="px-1 py-0.5 bg-brand-primary-500/20 text-brand-primary-400 text-[6px] font-black uppercase rounded tracking-tighter shrink-0 border border-brand-primary-500/20">
                                                                                            {u.country}
                                                                                        </span>
                                                                                    </div>
                                                                                    <div className="flex flex-col items-end shrink-0 ml-2">
                                                                                        <span className="text-[7px] font-bold text-slate-400">
                                                                                            {isMounted ? new Date(u.timestamp).toLocaleTimeString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-- --, --:--'}
                                                                                        </span>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-3">
                                                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md ${item.event === 'PAGE_VIEW' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                                                }`}>
                                                                {item.event}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-3">
                                                            <span className="text-[10px] font-bold text-white line-clamp-1">{item.text}</span>
                                                        </td>
                                                        <td className="px-6 py-3">
                                                            <span className="text-[8px] font-medium text-slate-400 font-mono italic">
                                                                {item.path}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {displayInventory.length === 0 && (
                                                    <tr><td colSpan={4} className="p-8 text-center text-xs text-slate-400 font-medium">No records matching your filter.</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </section>
                        </div>

                        <div className="xl:col-span-8 space-y-4">
                            {/* Real-time Semantic Feed */}
                            <section className="space-y-4">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
                                    <h2 className="text-xl font-black flex items-center">
                                        <Activity className="w-6 h-6 mr-2 text-indigo-500" />
                                        Semantic Feed
                                    </h2>
                                    <div className="flex flex-wrap gap-2 items-center w-full md:w-auto">
                                        <div className="flex bg-white/[0.04] p-0.5 rounded-lg border border-white/10">
                                            <button
                                                onClick={() => setIsFeedAggregated(false)}
                                                className={`px-2 py-1 text-[8px] font-black uppercase rounded-md transition-all ${!isFeedAggregated ? 'bg-card text-brand-primary-600 ' : 'text-slate-400 hover:text-slate-400'}`}
                                            >
                                                Stream
                                            </button>
                                            <button
                                                onClick={() => setIsFeedAggregated(true)}
                                                className={`px-2 py-1 text-[8px] font-black uppercase rounded-md transition-all ${isFeedAggregated ? 'bg-card text-indigo-600 ' : 'text-slate-400 hover:text-slate-400'}`}
                                            >
                                                Users
                                            </button>
                                        </div>
                                        <div className="relative group flex-1 md:w-32">
                                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 group-focus-within:text-brand-primary-500 transition-colors" />
                                            <input
                                                type="text"
                                                placeholder="Search..."
                                                className="w-full pl-7 pr-3 py-1.5 bg-card rounded-lg border border-white/10 text-[10px] font-bold outline-none focus:ring-2 focus:ring-brand-primary-50 transition-all placeholder:text-slate-300"
                                                value={feedSearch}
                                                onChange={(e) => setFeedSearch(e.target.value)}
                                            />
                                        </div>
                                        <select
                                            className="px-3 py-1.5 bg-card rounded-lg border border-white/10 text-[10px] font-bold outline-none focus:ring-2 focus:ring-brand-primary-50 uppercase tracking-tighter shrink-0 cursor-pointer"
                                            value={feedCountry}
                                            onChange={(e) => setFeedCountry(e.target.value)}
                                        >
                                            <option value="">All Countries</option>
                                            {availableCountries.map(c => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                        <select
                                            className="px-3 py-1.5 bg-card rounded-lg border border-white/10 text-[10px] font-bold outline-none focus:ring-2 focus:ring-brand-primary-50 uppercase tracking-tighter shrink-0 cursor-pointer"
                                            value={feedWordsFilter}
                                            onChange={(e) => setFeedWordsFilter(e.target.value)}
                                        >
                                            <option value="">Credits Used</option>
                                            <option value="0-100">0 - 100</option>
                                            <option value="100-200">100 - 200</option>
                                            <option value="200-300">200 - 300</option>
                                            <option value="300-400">300 - 400</option>
                                            <option value="400-500">400 - 500</option>
                                        </select>
                                        <input
                                            type="date"
                                            className="px-3 py-1.5 bg-card rounded-lg border border-white/10 text-[10px] font-bold outline-none focus:ring-2 focus:ring-brand-primary-50 uppercase tracking-tighter shrink-0"
                                            value={feedDate}
                                            onChange={(e) => setFeedDate(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="bg-white/[0.02] rounded-[2.5rem] border border-slate-200/60 p-1.5 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                                    <div className="max-h-[850px] overflow-y-auto custom-scrollbar p-1.5 space-y-1.5 relative z-10">
                                        {isFeedAggregated ? (
                                            aggregatedFeed?.map((group, i) => {
                                                const groupId = group.clerkId || group.email;
                                                const isExpanded = expandedFeedUserId === groupId;

                                                // Plan Badge Logic for Group
                                                const isPaid = !!(group.user?.subscriptionPlan || group.user?.subscriptionType);
                                                const planLabel = group.user?.subscriptionPlan ? 'PRO' : (group.user?.subscriptionType ? 'TEAM' : 'FREE');
                                                const planColor = isPaid ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-white/[0.04] text-slate-400 border-white/10';

                                                return (
                                                    <div key={i} className="group/agg relative">
                                                        <div
                                                            onClick={() => setExpandedFeedUserId(isExpanded ? null : groupId)}
                                                            className={`bg-card p-3 rounded-2xl border transition-all flex items-center gap-3 cursor-pointer ${isExpanded ? 'border-indigo-500 shadow-xl shadow-black/50 shadow-black/50 ring-1 ring-indigo-500/20' : 'border-white/5  hover:shadow-xl shadow-black/50 shadow-black/50'}`}
                                                        >
                                                            <div className="w-8 h-8 rounded-full bg-white/[0.04] flex items-center justify-center text-slate-400 shrink-0 border border-white/10 uppercase text-[10px] font-black">
                                                                {group.email.substring(0, 1)}
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <div className="flex items-center gap-2 mb-0.5">
                                                                    <p className="text-[10px] font-black text-white truncate">{group.email}</p>
                                                                    <span className={`px-1.5 py-0.5 rounded-[4px] text-[6px] font-black uppercase tracking-wider border ${planColor}`}>
                                                                        {planLabel}
                                                                    </span>
                                                                    <span className="text-[7px] font-black text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded-full uppercase ml-auto">
                                                                        {group.activities.length} Events
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-[8px] font-bold text-slate-400 bg-white/[0.04] px-1 rounded truncate">
                                                                        {group.country}
                                                                    </span>
                                                                    <span className="text-[7px] font-black text-brand-primary-600 bg-brand-primary-50 px-1.5 py-0.5 rounded-full uppercase tracking-tighter">
                                                                        {(group as any).wordsHumanized?.toLocaleString() || 0} words
                                                                    </span>
                                                                    <span className="text-[7px] font-medium text-slate-400">
                                                                        Active {isMounted ? new Date(group.latestTimestamp).toLocaleTimeString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-- --, --:--'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <ChevronRight className={`w-4 h-4 text-slate-300 transition-transform ${isExpanded ? 'rotate-90 text-indigo-500' : ''}`} />
                                                        </div>

                                                        {/* Collapsible Activity List */}
                                                        {isExpanded && (
                                                            <div className="mt-2 bg-slate-900 rounded-2xl p-4 border border-slate-800 shadow-xl overflow-hidden animate-in slide-in-from-top-2 duration-200">
                                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1 flex justify-between">
                                                                    <span>Activity History</span>
                                                                    <span className="text-indigo-400">{group.email}</span>
                                                                </p>
                                                                <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar-dark pr-1">
                                                                    {group.activities.map((a, idx) => {
                                                                        const cat = getEventCategory(a);
                                                                        const ua = (a.metadata)?.userAgent || '';

                                                                        // Helper for Device Icon (Inline for Aggregated)
                                                                        const getDeviceIcon = (userAgent: string) => {
                                                                            if (/mobile/i.test(userAgent)) return Smartphone;
                                                                            if (/tablet/i.test(userAgent)) return Smartphone;
                                                                            return Monitor;
                                                                        };
                                                                        const DeviceIcon = getDeviceIcon(ua);

                                                                        return (
                                                                            <div
                                                                                key={idx}
                                                                                onClick={() => {
                                                                                    const buttonText = getRefinedLabel(a);
                                                                                    const path = a.path || '/';
                                                                                    const elMeta = (a.metadata)?.element || {};
                                                                                    const metaObj = {
                                                                                        tag: elMeta.tag,
                                                                                        id: elMeta.id,
                                                                                        className: elMeta.className,
                                                                                        selector: (a.metadata)?.selector || elMeta.selector,
                                                                                        analyticsId: elMeta.analyticsId,
                                                                                        modal: (a.metadata)?.modal
                                                                                    };
                                                                                    const replayUrl = `${path}?highlight=${encodeURIComponent(buttonText)}&meta=${encodeURIComponent(JSON.stringify(metaObj))}`;
                                                                                    window.open(replayUrl, '_blank');
                                                                                }}
                                                                                className="p-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer hover:border-indigo-500/30 group/item relative overflow-visible"
                                                                            >
                                                                                <div className="flex justify-between items-center mb-1.5">
                                                                                    <div className="flex items-center gap-2">
                                                                                        <span className={`text-[6px] font-black uppercase px-1.5 py-0.5 rounded ${cat.color} opacity-80`}>{cat.label}</span>
                                                                                        <div className="flex items-center text-slate-400" title={ua}>
                                                                                            <DeviceIcon className="w-2.5 h-2.5" />
                                                                                        </div>
                                                                                    </div>
                                                                                    <span className="text-[7px] font-bold text-slate-400">
                                                                                        {isMounted ? new Date(a.createdAt).toLocaleTimeString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-- --, --:--'}
                                                                                    </span>
                                                                                </div>

                                                                                <div className="flex items-start justify-between gap-2">
                                                                                    <div className="min-w-0 flex-1">
                                                                                        <p className="text-[10px] font-bold text-slate-100 leading-tight mb-1 truncate">{getRefinedLabel(a)}</p>
                                                                                        <p className="text-[7px] font-medium text-slate-400 truncate opacity-50 italic">{a.path || '/'}</p>
                                                                                    </div>

                                                                                    {/* Technical Details Tooltip Trigger (Dark Mode) */}
                                                                                    <div className="relative group/tech" onClick={(e) => e.stopPropagation()}>
                                                                                        <Info className="w-3 h-3 text-slate-300 hover:text-indigo-400 transition-colors cursor-help" />

                                                                                        {/* Tooltip Content */}
                                                                                        <div className="absolute bottom-full right-0 mb-2 w-48 bg-slate-950 text-white p-2 rounded-lg text-[7px] shadow-2xl border border-slate-800 opacity-0 group-hover/tech:opacity-100 pointer-events-none group-hover/tech:pointer-events-auto transition-opacity z-50">
                                                                                            <div className="space-y-1">
                                                                                                <p className="font-bold border-b border-white/10 pb-1 mb-1 text-slate-400 uppercase tracking-wider">Technical Context</p>
                                                                                                <div className="grid grid-cols-[auto,1fr] gap-x-2 gap-y-0.5 text-slate-400">
                                                                                                    <span className="text-slate-400">ID:</span>
                                                                                                    <span className="font-mono text-slate-300 break-all">{(a.metadata)?.element?.analyticsId || 'N/A'}</span>

                                                                                                    <span className="text-slate-400">Tag:</span>
                                                                                                    <span className="font-mono text-slate-300 break-all">{(a.metadata)?.element?.tag || 'N/A'}</span>

                                                                                                    <span className="text-slate-400">Sel:</span>
                                                                                                    <span className="font-mono text-slate-300 break-all line-clamp-2" title={(a.metadata)?.element?.selector}>
                                                                                                        {(a.metadata)?.element?.selector || 'N/A'}
                                                                                                    </span>
                                                                                                </div>
                                                                                            </div>
                                                                                            {/* Arrow */}
                                                                                            <div className="absolute top-full right-1 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-slate-950"></div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            filteredFeed.map((a, i) => {
                                                const category = getEventCategory(a);
                                                const timestamp = isMounted ? new Date(a.createdAt) : null;
                                                const email = a.user?.email || (a.clerkId ? 'User@' + a.clerkId.substring(0, 6) : 'Guest');
                                                const loc = (a.metadata)?.location || 'Unknown';
                                                const country = loc.split(', ').pop() || 'Unknown';
                                                const ua = (a.metadata)?.userAgent || '';

                                                // Helper for Device Icon
                                                const getDeviceIcon = (userAgent: string) => {
                                                    if (/mobile/i.test(userAgent)) return Smartphone;
                                                    if (/tablet/i.test(userAgent)) return Smartphone; // Reusing Smartphone for Tablet for now, or import Tablet if available
                                                    return Monitor;
                                                };
                                                const DeviceIcon = getDeviceIcon(ua);

                                                // Helper for Plan Badge
                                                const isPaid = !!(a.user?.subscriptionPlan || a.user?.subscriptionType);
                                                const planLabel = a.user?.subscriptionPlan ? 'PRO' : (a.user?.subscriptionType ? 'TEAM' : 'FREE');
                                                const planColor = isPaid ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-white/[0.04] text-slate-400 border-white/10';

                                                return (
                                                    <div
                                                        key={i}
                                                        onClick={() => {
                                                            const buttonText = getRefinedLabel(a);
                                                            const path = a.path || '/';
                                                            const elMeta = (a.metadata)?.element || {};
                                                            const metaObj = {
                                                                tag: elMeta.tag,
                                                                id: elMeta.id,
                                                                className: elMeta.className,
                                                                selector: (a.metadata)?.selector || elMeta.selector,
                                                                analyticsId: elMeta.analyticsId,
                                                                modal: (a.metadata)?.modal
                                                            };
                                                            const replayUrl = `${path}?highlight=${encodeURIComponent(buttonText)}&meta=${encodeURIComponent(JSON.stringify(metaObj))}`;
                                                            window.open(replayUrl, '_blank');
                                                        }}
                                                        className="bg-card p-2.5 rounded-2xl border border-white/5  hover:shadow-xl shadow-black/50 shadow-black/50 transition-all group overflow-visible cursor-pointer hover:border-indigo-200 relative"
                                                    >
                                                        <div className="flex justify-between items-start mb-1.5">
                                                            <div className="flex items-center gap-2">
                                                                <div className={`px-2 py-0.5 rounded-md text-[6px] font-black uppercase tracking-widest border ${category.color}`}>
                                                                    {category.label}
                                                                </div>
                                                                <div className="flex items-center text-slate-300" title={ua}>
                                                                    <DeviceIcon className="w-2.5 h-2.5" />
                                                                </div>
                                                            </div>
                                                            <span className="text-[7px] font-bold text-slate-400">
                                                                {isMounted && timestamp ? timestamp.toLocaleTimeString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-- --, --:--'}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2.5 mb-2">
                                                            <div className={`p-1.5 rounded-lg border opacity-80 ${category.color}`}>
                                                                <category.icon className="w-3 h-3" />
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <div className="flex items-center gap-1.5 w-full">
                                                                    <p className="text-[10px] font-black text-white truncate leading-tight flex-1">
                                                                        {getRefinedLabel(a)}
                                                                    </p>
                                                                    {/* Technical Details Tooltip Trigger */}
                                                                    <div className="relative group/tech" onClick={(e) => e.stopPropagation()}>
                                                                        <Info className="w-2.5 h-2.5 text-slate-300 hover:text-indigo-500 transition-colors cursor-help" />

                                                                        {/* Tooltip Content */}
                                                                        <div className="absolute bottom-full right-0 mb-2 w-48 bg-slate-800 text-white p-2 rounded-lg text-[7px] shadow-xl opacity-0 group-hover/tech:opacity-100 pointer-events-none group-hover/tech:pointer-events-auto transition-opacity z-50">
                                                                            <div className="space-y-1">
                                                                                <p className="font-bold border-b border-white/10 pb-1 mb-1 text-slate-400 uppercase tracking-wider">Technical Context</p>
                                                                                <div className="grid grid-cols-[auto,1fr] gap-x-2 gap-y-0.5">
                                                                                    <span className="text-slate-400">ID:</span>
                                                                                    <span className="font-mono text-slate-300 break-all">{(a.metadata)?.element?.analyticsId || 'N/A'}</span>

                                                                                    <span className="text-slate-400">Tag:</span>
                                                                                    <span className="font-mono text-slate-300 break-all">{(a.metadata)?.element?.tag || 'N/A'}</span>

                                                                                    <span className="text-slate-400">Selector:</span>
                                                                                    <span className="font-mono text-slate-300 break-all line-clamp-2" title={(a.metadata)?.element?.selector}>
                                                                                        {(a.metadata)?.element?.selector || 'N/A'}
                                                                                    </span>

                                                                                    <span className="text-slate-400">Params:</span>
                                                                                    <span className="font-mono text-slate-300 break-all line-clamp-2">
                                                                                        {JSON.stringify((a.metadata)?.params || {})}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                            {/* Arrow */}
                                                                            <div className="absolute top-full right-1 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-slate-800"></div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-1.5 leading-none mt-0.5">
                                                                    <span className={`px-1 py-0.5 rounded-[3px] text-[5px] font-black uppercase tracking-wider border ${planColor}`}>
                                                                        {planLabel}
                                                                    </span>
                                                                    <span className="text-[8px] font-bold text-brand-primary-500 truncate">{email}</span>
                                                                    <span className="px-1 py-0 bg-white/[0.04] text-slate-400 text-[5px] font-black uppercase rounded tracking-tighter shrink-0 border border-white/10">
                                                                        {country}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center justify-between text-[7px] font-bold text-slate-400 pt-1.5 border-t border-slate-50">
                                                            <span className="flex items-center truncate max-w-[150px] opacity-60 group-hover:opacity-100 transition-opacity">
                                                                <Navigation2 className="w-2 h-2 mr-1" /> {a.path || '/'}
                                                            </span>
                                                            <span className="flex items-center text-slate-200 font-mono tracking-tighter">{a.id.substring(0, 8)}</span>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                        {filteredFeed.length === 0 && (
                                            <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400">
                                                <Filter className="w-8 h-8 opacity-10 mb-2" />
                                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">No matching events</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </main>
                <style jsx global>{`
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 4px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: transparent;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: #e2e8f0;
                        border-radius: 10px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                        background: #cbd5e1;
                    }
                    .custom-scrollbar-dark::-webkit-scrollbar {
                        width: 4px;
                    }
                    .custom-scrollbar-dark::-webkit-scrollbar-track {
                        background: transparent;
                    }
                    .custom-scrollbar-dark::-webkit-scrollbar-thumb {
                        background: #334155;
                        border-radius: 10px;
                    }
                `}</style>
            </div >
        </div >
    );
}

