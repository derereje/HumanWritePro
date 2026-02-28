"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "~/components/ui/button";
import { Loader2, ShieldCheck } from "lucide-react";
import { useUser } from "~/lib/mockClerk";
import { useRouter } from "next/navigation";

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

  // Split by lines first
  const lines = description.split(/\r?\n/).map(line => line.trim()).filter(Boolean);

  // Find the headline (all text before the first bullet point)
  let headline = "Everything you need to humanize confidently.";
  let features: string[] = [];

  const headlineLines: string[] = [];
  let foundBulletSection = false;

  for (const line of lines) {
    // Skip the credits reset line
    if (line.includes('**Credits reset:**')) {
      continue;
    }

    // Check if this is a bullet point line (starts with • or -)
    if (line.startsWith('•') || line.startsWith('-')) {
      foundBulletSection = true;
      // Clean up the bullet point
      const cleaned = line.replace(/^[•\-]\s*/, '').trim();
      if (cleaned) {
        features.push(cleaned);
      }
    } else if (!foundBulletSection) {
      // This is part of the headline (all lines before bullet points)
      headlineLines.push(line);
    }
  }

  // Join all headline lines into one
  if (headlineLines.length > 0) {
    headline = headlineLines.join(' ');
  }

  // If no features were found, use defaults
  if (features.length === 0) {
    features = [
      "Instant AI-to-human conversions",
      "Copy & export in one click",
      "Cancel or upgrade any time",
    ];
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

  if (option.recurringInterval === "year") {
    return amount / 12;
  }

  return amount;
}

function getAnnualBillingAmount(option: ProductPriceOption | null): number | null {
  if (!option?.priceAmount) return null;

  if (option.recurringInterval === "year") {
    return option.priceAmount / 100;
  }

  if (option.recurringInterval === "month") {
    return (option.priceAmount * 12) / 100;
  }

  return null;
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

interface PolarPricingProps {
  isTeamMember?: boolean;
  subscriptionPlan?: string | null;
}

export default function PolarPricing({ isTeamMember = false, subscriptionPlan }: PolarPricingProps) {
  const { isSignedIn } = useUser();
  const router = useRouter();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [ctaLoadingId, setCtaLoadingId] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("yearly");

  const isLifetime = subscriptionPlan === 'lifetime';

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        console.log('[PolarPricing] Fetching products from API...');
        const res = await fetch("/api/polar/products");
        console.log('[PolarPricing] Response status:', res.status);

        if (!res.ok) {
          const errorData = await res.json();
          console.error('[PolarPricing] API error:', errorData);
          throw new Error(errorData.error || "Failed to load products");
        }

        const data = (await res.json()) as Product[];
        console.log('[PolarPricing] Products loaded:', data);

        if (active) setProducts(data);
      } catch (e) {
        console.error('[PolarPricing] Error:', e);
        setError((e as Error).message);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const onSubscribe = async (productId: string) => {
    try {
      setCtaLoadingId(productId);
      if (!isSignedIn) {
        router.push("/sign-in");
        setCtaLoadingId(null);
        return;
      }

      console.log('[PolarPricing] Creating checkout for product:', productId);

      const res = await fetch("/api/polar/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error('[PolarPricing] Checkout error:', errorData);
        throw new Error(errorData.error || "Failed to create checkout");
      }

      const { checkoutUrl } = await res.json();
      console.log('[PolarPricing] Redirecting to checkout:', checkoutUrl);

      // Redirect to Polar checkout
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error('[PolarPricing] Error:', error);
      alert(error instanceof Error ? error.message : "Failed to create checkout. Please try again.");
      setCtaLoadingId(null);
    }
  };

  // const featureList = [
  //   "AI Text Humanization",
  //   "Smart Paraphrasing",
  //   "AI Detection Bypass",
  //   "Multiple Presets",
  //   "Fast Processing",
  //   "History Tracking",
  // ];

  const hasYearlyPlans = useMemo(() => !!products?.some((plan) => plan.yearly), [products]);
  const [hasUserChangedBilling, setHasUserChangedBilling] = useState(false);

  useEffect(() => {
    // Only adjust billing cycle after products have loaded
    if (!loading && products) {
      if (!hasYearlyPlans && billingCycle === "yearly") {
        // No yearly plans available, switch to monthly
        setBillingCycle("monthly");
      } else if (hasYearlyPlans && billingCycle === "monthly" && !hasUserChangedBilling) {
        // Yearly plans are available and user hasn't manually changed it, ensure yearly is selected
        setBillingCycle("yearly");
      }
    }
  }, [hasYearlyPlans, billingCycle, products, loading, hasUserChangedBilling]);

  const maxSavings = useMemo(() => {
    if (!products) return 0;
    return products.reduce((acc, plan) => Math.max(acc, computePlanSavings(plan)), 0);
  }, [products]);

  if (loading) {
    return (
      <div className="flex justify-center pt-10">
        <div className="inline-flex items-center gap-3 rounded-full border border-blue-100 bg-card px-5 py-3 text-sm font-medium text-slate-400 ">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" /> Fetching plans…
        </div>
      </div>
    );
  }

  if (error || !products?.length) {
    return (
      <div className="mx-auto max-w-3xl rounded-3xl border border-red-200 bg-red-50/70 p-8 text-center ">
        <h3 className="text-lg font-semibold text-red-700">We couldn’t load pricing</h3>
        <p className="mt-2 text-sm text-red-600">
          {error || "No products are currently configured in Polar."}
        </p>
        <p className="mt-4 text-xs text-red-500">
          Check your Polar environment variables: POLAR_ACCESS_TOKEN, POLAR_PRODUCT_SMALL, POLAR_PRODUCT_MEDIUM,
          POLAR_PRODUCT_LARGE, POLAR_PRODUCT_YEARLY_SMALL, POLAR_PRODUCT_YEARLY_MEDIUM, POLAR_PRODUCT_YEARLY_LARGE.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {hasYearlyPlans && (
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="inline-flex items-center rounded-full border border-white/10 bg-card p-1 ">
            <button
              type="button"
              onClick={() => {
                setBillingCycle("monthly");
                setHasUserChangedBilling(true);
              }}
              data-analytics-id="pricing-page-billing-monthly"
              className={`min-w-[100px] rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition whitespace-nowrap ${billingCycle === "monthly"
                ? "bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white "
                : "text-slate-400 hover:text-white bg-transparent"
                }`}
            >
              Monthly billing
            </button>
            <button
              type="button"
              onClick={() => {
                setBillingCycle("yearly");
                setHasUserChangedBilling(true);
              }}
              data-analytics-id="pricing-page-billing-yearly"
              className={`min-w-[100px] rounded-full px-3 py-2 text-xs sm:text-sm font-semibold transition relative flex items-center justify-center gap-1.5 whitespace-nowrap ${billingCycle === "yearly"
                ? "bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white "
                : "text-slate-400 hover:text-white bg-transparent"
                }`}
            >
              <span>Yearly billing</span>
              {billingCycle === "yearly" && (
                <span className="rounded-full px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold whitespace-nowrap bg-white/25 text-white border border-white/40">
                  Save 50%
                </span>
              )}
            </button>
          </div>
        </div>
      )}

      <div className="mx-auto grid max-w-6xl gap-5 sm:gap-6 lg:grid-cols-3 lg:gap-8 w-full px-2 sm:px-0">
        {products.map((product, index) => {
          const { headline, features } = parseProductDescription(product.uiDescription ?? product.description);
          const isPopular = index === 1 && products.length > 1;
          const isUltraPlan = index === 2 && products.length > 2; // Third plan is ULTRA
          const desiredOption = billingCycle === "yearly" ? product.yearly : product.monthly;
          const fallbackOption = product.monthly ?? product.yearly;
          const activeOption = desiredOption ?? fallbackOption;
          const activeCycle: BillingCycle = activeOption && product.yearly && activeOption.id === product.yearly.id ? "yearly" : "monthly";
          const activeProductId = activeOption?.id;
          const effectiveMonthlyAmount = getEffectiveMonthlyAmount(activeOption);
          const primaryPrice = effectiveMonthlyAmount != null ? formatCurrency(effectiveMonthlyAmount, activeOption?.priceCurrency) : "";
          const annualBillingAmount = activeCycle === "yearly" ? getAnnualBillingAmount(product.yearly) : null;
          const planSavings = computePlanSavings(product);
          const showSavingsBadge = activeCycle === "yearly" && planSavings > 0;

          return (
            <div className={`p-1 ${isPopular ? 'bg-gradient-to-b from-blue-500/40 to-transparent p-px rounded-[2.6rem]' : ''} w-full`}>
              <div
                key={product.key}
                className={cn(
                  "relative flex flex-col h-full rounded-[2.5rem] border p-8 transition-all duration-500 group",
                  isPopular
                    ? "bg-blue-600/[0.03] border-blue-500/30 shadow-3xl shadow-blue-500/10 scale-105 z-10"
                    : "bg-white/[0.02] border-white/5 hover:border-white/10"
                )}
              >
                {isPopular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] px-5 py-2 rounded-full shadow-2xl pulse-glow whitespace-nowrap">
                    MOST POPULAR CHOICE
                  </div>
                )}

                {showSavingsBadge && (
                  <div className="absolute top-3 sm:top-4 right-3 sm:right-4 rounded-full bg-blue-100 px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold text-blue-600 whitespace-nowrap">
                    Save {planSavings}%
                  </div>
                )}

                <div className="flex flex-1 flex-col w-full">
                  <div className="mb-10 text-center lg:text-left">
                    <h4 className="text-2xl font-black text-white tracking-tight mb-2 group-hover:text-blue-400 transition-colors uppercase tracking-[0.05em]">{product.name}</h4>
                    <div className="flex items-baseline justify-center lg:justify-start gap-2 text-white">
                      {activeCycle === "yearly" && product.yearly?.priceAmount ? (
                        <>
                          {/* Show monthly (original) price struck out if available */}
                          {product.monthly?.priceAmount && (
                            <span className="text-xl sm:text-2xl font-black text-slate-400 line-through decoration-2">
                              {formatCurrency(
                                product.monthly.priceAmount / 100,
                                product.monthly.priceCurrency
                              )}
                            </span>
                          )}

                          {/* Show yearly divided by 12 */}
                          <span className="text-4xl sm:text-5xl font-black tracking-tighter">
                            {formatCurrency(
                              (product.yearly.priceAmount / 12) / 100,
                              product.yearly.priceCurrency
                            )}
                          </span>
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">/mo</span>
                        </>
                      ) : (
                        <>
                          <span className="text-4xl sm:text-5xl font-black tracking-tighter">
                            {primaryPrice || "Contact us"}
                          </span>
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">/mo</span>
                        </>
                      )}
                    </div>

                    {activeCycle === "yearly" ? (
                      <p className="mt-3 text-[10px] font-black uppercase tracking-widest text-blue-400/80">
                        {annualBillingAmount != null
                          ? `Billed annually at ${formatCurrency(annualBillingAmount, activeOption?.priceCurrency)}`
                          : "Billed annually"}
                      </p>
                    ) : (
                      <p className="mt-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Billed monthly</p>
                    )}
                  </div>

                  <div className="mt-8 flex flex-col gap-4">
                    {isTeamMember ? (
                      <Button
                        className="w-full h-14 rounded-2xl py-4 text-xs font-black uppercase tracking-widest bg-white/5 text-slate-400 cursor-not-allowed border border-white/5"
                        disabled
                      >
                        Managed by Owner
                      </Button>
                    ) : (
                      <Button
                        className={cn(
                          "w-full h-14 rounded-2xl py-4 text-sm font-black uppercase tracking-widest transition-all duration-500",
                          isPopular
                            ? "bg-blue-600 hover:bg-blue-700 text-white shadow-3xl shadow-blue-600/20 hover:scale-[1.03] active:scale-95"
                            : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                        )}
                        onClick={() => activeProductId && onSubscribe(activeProductId)}
                        data-analytics-id={`pricing-page-subscribe-${product.key}`}
                        disabled={!activeProductId || !!ctaLoadingId || isLifetime}
                      >
                        {isLifetime
                          ? "Protocol Active"
                          : ctaLoadingId === activeProductId
                            ? "Initializing..."
                            : "Deploy Plan"}
                      </Button>
                    )}
                    <p className="text-center text-[10px] font-black uppercase tracking-widest text-slate-500/60">Secure Protocol · Instant Activation</p>
                  </div>

                  <p className="mt-8 text-sm font-medium text-slate-400 leading-relaxed min-h-[40px] italic">{headline}</p>

                  <ul className="mt-8 space-y-4 flex-1">
                    {features.map((feature, featureIndex) => (
                      <li key={`${product.key}-feature-${featureIndex}`} className="flex items-center gap-4 text-sm font-bold text-slate-300 group-hover:text-white transition-colors">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/10 border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
                          <Check className="h-4 w-4" />
                        </div>
                        <span className="flex-1">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}



