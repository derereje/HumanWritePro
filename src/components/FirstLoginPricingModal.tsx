"use client";

import { useEffect, useState, useMemo } from "react";
import { X, Check, Sparkles, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { useUser } from "~/lib/mockClerk";

// --- Types & Helpers (Duplicated from PolarPricing for independence) ---
type BillingCycle = "monthly" | "yearly";

type ProductPriceOption = {
    id: string;
    displayPrice: string;
    priceAmount: number | null;
    priceCurrency: string | null;
    priceType: "one_time" | "recurring" | null;
    recurringInterval: string | null;
};

type Product = {
    key: string;
    name: string;
    description?: string | null;
    uiDescription?: string;
    monthly: ProductPriceOption | null;
    yearly: ProductPriceOption | null;
};

type ParsedDescription = {
    headline: string;
    features: string[];
};

function parseProductDescription(description?: string | null): ParsedDescription {
    if (!description) {
        return {
            headline: "Everything you need to humanize confidently.",
            features: [
                "Instant AI-to-human conversions",
                "Copy & export in one click",
                "Cancel or upgrade any time",
            ],
        };
    }
    const lines = description.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
    let headline = "Everything you need to humanize confidently.";
    let features: string[] = [];
    const headlineLines: string[] = [];
    let foundBulletSection = false;

    for (const line of lines) {
        if (line.includes('**Credits reset:**')) continue;
        if (line.startsWith('•') || line.startsWith('-')) {
            foundBulletSection = true;
            const cleaned = line.replace(/^[•\-]\s*/, '').trim();
            if (cleaned) features.push(cleaned);
        } else if (!foundBulletSection) {
            headlineLines.push(line);
        }
    }
    if (headlineLines.length > 0) headline = headlineLines.join(' ');
    if (features.length === 0) {
        features = ["Instant AI-to-human conversions", "Copy & export in one click", "Cancel or upgrade any time"];
    }
    return { headline, features };
}

function formatCurrency(amount: number, currency?: string | null) {
    const resolvedCurrency = currency ?? "USD";
    return amount.toLocaleString(undefined, {
        style: "currency",
        currency: resolvedCurrency,
        maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
        minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    });
}

function getEffectiveMonthlyAmount(option: ProductPriceOption | null): number | null {
    if (!option?.priceAmount) return null;
    const amount = option.priceAmount / 100;
    if (option.recurringInterval === "year") return amount / 12;
    return amount;
}

function computePlanSavings(plan: Product): number {
    const monthlyAmount = plan.monthly?.priceAmount;
    const yearlyAmount = plan.yearly?.priceAmount;
    if (!monthlyAmount || !yearlyAmount) return 0;
    const monthlyYearTotal = monthlyAmount * 12;
    const yearlyYearTotal = yearlyAmount * 12;
    if (monthlyYearTotal <= 0) return 0;
    const savings = 1 - yearlyYearTotal / monthlyYearTotal;
    if (savings <= 0) return 0;
    return Math.round(savings * 100);
}

// --- Component ---

interface FirstLoginPricingModalProps {
    isOpen: boolean;
    onClose: () => void;
    variant?: 'welcome' | 'out-of-credits' | 'celebration';
}

export default function FirstLoginPricingModal({
    isOpen,
    onClose,
    variant = 'welcome'
}: FirstLoginPricingModalProps) {
    const router = useRouter();
    const { isSignedIn } = useUser();
    const [billingCycle, setBillingCycle] = useState<BillingCycle>("yearly");
    const [products, setProducts] = useState<Product[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [ctaLoadingId, setCtaLoadingId] = useState<string | null>(null);

    const content = {
        welcome: {
            title: "Welcome to AcousticText!",
            desc: (
                <>
                    Start free with 500 words. Upgrade anytime for more.<br />
                    <span className="text-white font-semibold">Join 2,000,000+ students and writers.</span>
                </>
            )
        },
        'out-of-credits': {
            title: "Quota Expired? Get 50% OFF",
            desc: (
                <>
                    You&apos;ve humanized your free words. <br />
                    <span className="text-white font-semibold">Lock in our best celebration rate to keep going.</span>
                </>
            )
        },
        'celebration': {
            title: "Celebrate 2M Users with 50% OFF",
            desc: (
                <>
                    Thank you for being part of our community. <br />
                    <span className="text-white font-semibold">Lock in this exclusive milestone rate now.</span>
                </>
            )
        }
    }[variant];

    // Fetch products on mount
    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const res = await fetch("/api/polar/products");
                if (!res.ok) throw new Error("Failed to load products");
                const data = (await res.json()) as Product[];
                if (active) setProducts(data);
            } catch (e) {
                console.error('Failed to modal products', e);
            } finally {
                if (active) setLoading(false);
            }
        })();
        return () => { active = false; };
    }, []);

    const hasYearlyPlans = useMemo(() => !!products?.some((plan) => plan.yearly), [products]);

    // Adjust billing cycle based on availability
    useEffect(() => {
        if (!loading && products) {
            if (!hasYearlyPlans && billingCycle === "yearly") setBillingCycle("monthly");
            else if (hasYearlyPlans && billingCycle === "monthly") setBillingCycle("yearly"); // Default to yearly for logic
        }
    }, [hasYearlyPlans, loading, products]); // Removed billingCycle dep to avoid flip-flopping if user changes it, forcing default once

    const onSubscribe = async (productId: string) => {
        try {
            setCtaLoadingId(productId);
            if (!isSignedIn) {
                router.push("/sign-in");
                return;
            }
            const res = await fetch("/api/polar/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId }),
            });
            if (!res.ok) throw new Error("Failed to create checkout");
            const { checkoutUrl } = await res.json();
            window.location.href = checkoutUrl;
        } catch (error) {
            alert("Failed to create checkout.");
            setCtaLoadingId(null);
        }
    };


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div
                className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 fade-in duration-300"
                data-analytics-modal="Pricing"
            >
                <div className="relative overflow-hidden rounded-3xl bg-card shadow-2xl">
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        data-analytics-id="pricing-modal-close"
                        className="absolute right-4 top-4 z-20 rounded-full p-2 bg-white/[0.03] hover:bg-white/[0.04] text-slate-400 hover:text-slate-200 transition-all backdrop-blur-sm"
                    >
                        <X className="h-5 w-5" />
                    </button>

                    {/* Header / Hero Section */}
                    <div className="bg-gradient-to-br from-blue-900 to-blue-700 px-6 py-10 sm:px-12 text-center text-white relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] [background-size:20px_20px]"></div>
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>
                        <div className="relative z-10">
                            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
                                {content.title}
                            </h2>
                            <p className="text-lg text-blue-100 max-w-xl mx-auto leading-relaxed">
                                {content.desc}
                            </p>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="px-6 py-8 sm:px-12 bg-white/[0.02]">

                        {loading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                            </div>
                        ) : !products ? (
                            <div className="text-center py-8 text-red-500">Failed to load offers.</div>
                        ) : (
                            <>
                                {/* Billing Toggle */}
                                {hasYearlyPlans && (
                                    <div className="flex justify-center mb-8">
                                        <div className="inline-flex items-center p-1 rounded-full bg-white/[0.04] border border-white/10">
                                            <button
                                                onClick={() => setBillingCycle("monthly")}
                                                data-analytics-id="pricing-billing-monthly"
                                                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${billingCycle === "monthly"
                                                    ? "bg-card text-white "
                                                    : "text-slate-400 hover:text-slate-300"
                                                    }`}
                                            >
                                                Monthly
                                            </button>
                                            <button
                                                onClick={() => setBillingCycle("yearly")}
                                                data-analytics-id="pricing-billing-yearly"
                                                className={`px-6 py-2 rounded-full text-sm font-medium transition-all relative ${billingCycle === "yearly"
                                                    ? "bg-blue-600 text-white shadow-xl shadow-black/50 shadow-black/50 shadow-blue-600/20"
                                                    : "text-slate-400 hover:text-slate-300"
                                                    }`}
                                            >
                                                Yearly
                                                {billingCycle === "yearly" && (
                                                    <span className="absolute -top-3 -right-3 bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full  border border-white">
                                                        -50%
                                                    </span>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className={`grid gap-6 max-w-[1100px] mx-auto ${products.length === 3 ? 'lg:grid-cols-3' : 'md:grid-cols-2'}`}>
                                    {products.map((product, index) => {
                                        const { features } = parseProductDescription(product.uiDescription ?? product.description);
                                        const isPopular = index === 1 && products.length > 1; // Middle plan usually popular
                                        const isUltra = index === products.length - 1; // Last plan highest tier

                                        const desiredOption = billingCycle === "yearly" ? product.yearly : product.monthly;
                                        const fallbackOption = product.monthly ?? product.yearly;
                                        const activeOption = desiredOption ?? fallbackOption; // Fallback if regular option missing
                                        const activeProductId = activeOption?.id;

                                        const effectiveMonthlyAmount = getEffectiveMonthlyAmount(activeOption);
                                        const displayPrice = effectiveMonthlyAmount != null ? formatCurrency(effectiveMonthlyAmount, activeOption?.priceCurrency).replace('.00', '') : "Contact";
                                        const planSavings = computePlanSavings(product);

                                        // Special styling for "Best Value" / Ultra
                                        const isHighlight = isPopular || isUltra;

                                        return (
                                            <div
                                                key={product.key}
                                                className={`relative rounded-2xl p-6  hover:shadow-xl shadow-black/50 shadow-black/50 transition-shadow flex flex-col ${isPopular
                                                    ? "bg-card border-2 border-amber-400 scale-[1.02] z-10 shadow-xl shadow-amber-400/20"
                                                    : "bg-card border border-white/10"
                                                    }`}
                                            >
                                                {isPopular && (
                                                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-2 bg-amber-500 text-white text-[9px] font-black px-3 py-1 rounded-full shadow-xl shadow-black/50 tracking-wider uppercase">
                                                        Preferred by 82% of users
                                                    </div>
                                                )}
                                                {isUltra && !isPopular && (
                                                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-2 bg-gradient-to-r from-blue-500 to-blue-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow-xl shadow-black/50">
                                                        BEST VALUE
                                                    </div>
                                                )}

                                                <h3 className="text-xl font-bold text-white">{product.name}</h3>
                                                <div className="mt-4 mb-6">
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="text-3xl font-bold text-white">
                                                            {displayPrice}
                                                        </span>
                                                        <span className="text-sm text-slate-400">/mo</span>
                                                    </div>
                                                    {billingCycle === "yearly" && planSavings > 0 && (
                                                        <p className="text-xs text-blue-600 font-medium mt-1">
                                                            Save {planSavings}% billed yearly
                                                        </p>
                                                    )}
                                                </div>

                                                <ul className="space-y-3 mb-8 flex-1">
                                                    {features.slice(0, 5).map((feat, i) => (
                                                        <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                                                            <Check className={`h-4 w-4 flex-shrink-0 mt-0.5 ${isHighlight ? 'text-blue-600' : 'text-blue-500'}`} />
                                                            <span className="text-slate-400">{feat}</span>
                                                        </li>
                                                    ))}
                                                </ul>

                                                <Button
                                                    className={`w-full rounded-xl ${isHighlight
                                                        ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-xl shadow-black/50"
                                                        : "bg-slate-900 hover:bg-slate-800 text-white"
                                                        }`}
                                                    onClick={() => activeProductId && onSubscribe(activeProductId)}
                                                    data-analytics-id={`pricing-subscribe-${product.key}`}
                                                    disabled={!!ctaLoadingId && ctaLoadingId !== activeProductId}
                                                >
                                                    {ctaLoadingId === activeProductId ? "Processing..." : `Select ${product.name}`}
                                                </Button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}

                        <div className="mt-8 text-center">
                            <button
                                onClick={onClose}
                                data-analytics-id="pricing-maybe-later"
                                className="text-sm text-slate-400 hover:text-slate-400 transition-colors"
                            >
                                Maybe later, I'll stick to free for now
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
