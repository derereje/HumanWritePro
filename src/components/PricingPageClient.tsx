"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "~/components/ui/button";
import { Loader2, ShieldCheck, Zap, ArrowLeft } from "lucide-react";
import { useUser, SignInButton } from "~/lib/mockClerk";
import { useRouter } from "next/navigation";
import PageNavbar from "~/components/PageNavbar";
import PolarPricing from "~/components/pricing/PolarPricing";
import TopUpSection from "~/components/pricing/TopUpSection";
import BlackFridayBanner from "~/components/pricing/BlackFridayBanner";

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

  const clean = (value: string) =>
    value
      .replace(/^[-•]\s*/, "")
      .replace(/\*\*/g, "")
      .replace(/[_`]/g, "")
      .replace(/^#+\s*/, "")
      .replace(/\s+/g, " ")
      .trim();

  const segments = description
    .split(/\r?\n|•|-|\u2022/g)
    .map(clean)
    .filter(Boolean)
    .filter((segment) => !/^key features:?$/i.test(segment.replace(/[^a-z]/gi, "")));

  const headline = segments.shift() ?? "Everything you need to humanize confidently.";
  const features = segments.length
    ? segments
    : [
      "Instant AI-to-human conversions",
      "Copy & export in one click",
      "Cancel or upgrade any time",
    ];

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
  if (monthlyYearTotal <= 0) return 0;

  const savings = 1 - yearlyAmount / monthlyYearTotal;
  if (savings <= 0) return 0;

  return Math.round(savings * 100);
}

interface PricingPageClientProps {
  isTeamMember?: boolean;
  hasSubscription?: boolean;
  subscriptionPlan?: string | null;
}

export default function PricingPageClient({ isTeamMember = false, hasSubscription = false, subscriptionPlan }: PricingPageClientProps) {
  const { isSignedIn, user } = useUser();
  const router = useRouter();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [ctaLoadingId, setCtaLoadingId] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        console.log('[PricingPage] Fetching products from API...');
        const res = await fetch("/api/polar/products");
        console.log('[PricingPage] Response status:', res.status);

        if (!res.ok) {
          const errorData = await res.json();
          console.error('[PricingPage] API error:', errorData);
          throw new Error(errorData.error || "Failed to load products");
        }

        const data = (await res.json()) as Product[];
        console.log('[PricingPage] Products loaded:', data);

        if (active) setProducts(data);
      } catch (e) {
        console.error('[PricingPage] Error:', e);
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

      console.log('[PricingPage] Creating checkout for product:', productId);

      const res = await fetch("/api/polar/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error('[PricingPage] Checkout error:', errorData);
        throw new Error(errorData.error || "Failed to create checkout");
      }

      const { checkoutUrl } = await res.json();
      console.log('[PricingPage] Redirecting to checkout:', checkoutUrl);

      window.location.href = checkoutUrl;
    } catch (error) {
      console.error('[PricingPage] Error:', error);
      alert(error instanceof Error ? error.message : "Failed to create checkout. Please try again.");
      setCtaLoadingId(null);
    }
  };

  const hasYearlyPlans = useMemo(() => !!products?.some((plan) => plan.yearly), [products]);

  useEffect(() => {
    if (!hasYearlyPlans && billingCycle === "yearly") {
      setBillingCycle("monthly");
    }
  }, [hasYearlyPlans, billingCycle]);

  const maxSavings = useMemo(() => {
    if (!products) return 0;
    return products.reduce((acc, plan) => Math.max(acc, computePlanSavings(plan)), 0);
  }, [products]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="flex min-h-[80vh] items-center justify-center">
          <div className="inline-flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.02] px-8 py-4 text-sm font-black text-white shadow-3xl backdrop-blur-md">
            <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
            <span className="uppercase tracking-[0.2em]">Synchronizing Plans...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !products?.length) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <PageNavbar isTeamMember={isTeamMember} />
        <div className="container mx-auto max-w-6xl px-4 py-24">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="mb-12 gap-3 group text-white hover:bg-white/5 font-black uppercase tracking-widest text-xs"
            data-analytics-id="pricing-page-error-back-home"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to Command Center
          </Button>

          <div className="mx-auto max-w-3xl rounded-[2.5rem] border border-red-500/20 bg-red-500/10 p-12 text-center shadow-3xl backdrop-blur-md">
            <h3 className="text-2xl font-black text-red-500 mb-4 tracking-tight">System Protocol Error</h3>
            <p className="text-lg font-medium text-red-400/80 mb-6">
              {error || "No products are currently configured in the Secure Cloud."}
            </p>
            <div className="mt-8 p-4 bg-black/40 rounded-xl border border-white/5 text-[10px] font-mono text-red-500/60 leading-relaxed uppercase tracking-widest">
              Check Integration Environment: POLAR_ACCESS_TOKEN, POLAR_PRODUCT_ID_SET.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto max-w-7xl px-4 pb-4">

        <section id="pricing">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

            <div className="mt-12">
              <PolarPricing isTeamMember={isTeamMember} subscriptionPlan={subscriptionPlan} />
            </div>

            {hasSubscription && <TopUpSection />}
          </div>
        </section>

        <div className="mt-24 rounded-[3rem] border border-white/5 bg-white/[0.02] p-12 text-center backdrop-blur-md shadow-3xl group relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="mb-4 text-3xl font-black text-white tracking-tight">
              Need Help Choosing?
            </h3>
            <p className="mb-10 text-xl text-slate-400 font-medium max-w-2xl mx-auto">
              Our specialists are ready to help you find the perfect deployment for your workflow.
            </p>
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-blue-600 bg-blue-600/5 text-blue-500 hover:bg-blue-600 hover:text-white rounded-2xl px-10 py-7 text-lg font-black transition-all duration-300"
              onClick={() => router.push("/contact")}
              data-analytics-id="pricing-page-contact-support"
            >
              Consult an Expert
            </Button>
          </div>
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
