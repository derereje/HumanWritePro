"use client";

import { useEffect, useState } from "react";
import { Zap, Crown, Users, ArrowRight, Check, Sparkles, Timer, Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

interface CyberMondayDealsProps {
  subscriptionPlan?: string | null;
}

export default function CyberMondayDeals({ subscriptionPlan }: CyberMondayDealsProps) {
  const { isSignedIn } = useUser();
  const router = useRouter();
  const [lifetimeProductId, setLifetimeProductId] = useState<string | null>(null);
  const [lifetimePrice, setLifetimePrice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLoadingPrice, setIsLoadingPrice] = useState(true);
  const [claimedCount, setClaimedCount] = useState<number>(0);

  // Inflate the claimed count by 4
  const displayedClaimedCount = claimedCount + 13;
  // Start with 20 spots, but expand if we get close to ensure there's always availability
  const totalSpots = Math.max(20, displayedClaimedCount + 4);

  const isLifetime = subscriptionPlan === 'lifetime';

  // Fixed target date: Set to a specific end date/time so all users see the same countdown
  // This should be 15 hours from when the deal started
  // Set DEAL_START_TIME to when you launched the deal (fixed date/time)
  // Format: "YYYY-MM-DDTHH:mm:ssZ" (UTC time)
  // Example: If deal started at Dec 5, 2025 10:00 AM UTC:
  const DEAL_START_TIME = new Date("2025-12-05T10:00:00Z").getTime(); // UPDATE THIS to your actual deal start time
  const TARGET_DATE = DEAL_START_TIME + (15 * 60 * 60 * 1000); // 15 hours from deal start

  // Or use a completely fixed end date/time directly:
  // const TARGET_DATE = new Date("2025-12-05T01:00:00Z").getTime(); // 15 hours after start

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    // Fetch lifetime product ID and price
    fetch("/api/polar/lifetime")
      .then((res) => res.json())
      .then((data) => {
        if (data.productId) {
          setLifetimeProductId(data.productId);
        }
        if (data.displayPrice) {
          setLifetimePrice(data.displayPrice);
        }
        if (data.claimedCount !== undefined) {
          setClaimedCount(data.claimedCount);
        }
      })
      .catch((err) => console.error("Failed to fetch lifetime product details", err))
      .finally(() => setIsLoadingPrice(false));

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = TARGET_DATE - now;

      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        };
      } else {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const onSubscribe = async () => {
    if (!lifetimeProductId) return;

    try {
      setLoading(true);
      if (!isSignedIn) {
        router.push("/sign-in");
        return;
      }

      const res = await fetch("/api/polar/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId: lifetimeProductId }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create checkout");
      }

      const { checkoutUrl } = await res.json();
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error("Checkout error:", error);
      alert(error instanceof Error ? error.message : "Failed to create checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-12">
      {/* Mobile View: Simplified Compact Card */}
      <div className="lg:hidden relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-900 to-emerald-950 p-5 text-white shadow-xl border border-emerald-800">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-500/20 blur-[50px]" />
        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-emerald-400/20 blur-[50px]" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-200 border border-emerald-500/30">
              <Zap className="h-3 w-3 fill-current" />
              Cyber Monday
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-medium text-amber-400 bg-amber-500/10 px-2 py-1 rounded-full border border-amber-500/20">
              <Timer className="h-3 w-3" />
              {String(timeLeft.days)}d {String(timeLeft.hours).padStart(2, '0')}h {String(timeLeft.minutes).padStart(2, '0')}m {String(timeLeft.seconds).padStart(2, '0')}s
            </div>
          </div>

          <div className="space-y-1 mb-4">
            <h2 className="text-2xl font-black tracking-tight leading-tight">
              <span className="text-white">50% OFF </span>
              <span className="bg-gradient-to-r from-emerald-200 via-white to-emerald-100 bg-clip-text text-transparent">
                Everything
              </span>
            </h2>
            <p className="text-xs text-emerald-100/70">
              Pay once, humanize forever. Only {Math.max(totalSpots - displayedClaimedCount, 0)} spots left.
            </p>
          </div>

          <div className="mb-4 space-y-2">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-emerald-200/70">Spots claimed</span>
              <span className="font-bold text-white">{displayedClaimedCount} / {totalSpots}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.5)] transition-all duration-1000"
                style={{ width: `${Math.min((displayedClaimedCount / totalSpots) * 100, 100)}%` }}
              />
            </div>
          </div>

          <ul className="mb-4 space-y-1.5">
            {[
              "All Pro features",
              "Priority support",
            ].map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-xs text-emerald-100/90">
                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300">
                  <Check className="h-2.5 w-2.5" />
                </div>
                {feature}
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <div className="flex flex-col shrink-0">
              <span className="text-lg font-bold text-white leading-none">
                {isLoadingPrice ? "..." : (lifetimePrice || "$399.99")}
              </span>
              <span className="text-[10px] text-emerald-200/50 line-through leading-none mt-1">
                $1500+
              </span>
            </div>
            <Button
              onClick={onSubscribe}
              disabled={loading || !lifetimeProductId || isLifetime}
              className="flex-1 h-10 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-sm font-bold text-white shadow-xl shadow-black/50 hover:from-emerald-400 hover:to-emerald-500"
            >
              {isLifetime ? (
                <>
                  <Check className="mr-1.5 h-4 w-4" /> Active
                </>
              ) : loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Get Deal <ArrowRight className="ml-1.5 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop View: Clean Modern Layout */}
      <div className="hidden lg:grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Cyber Monday Card */}
        <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-emerald-900 to-emerald-950 p-8 text-white shadow-2xl lg:p-10 border border-emerald-800/50">
          {/* Background Effects */}
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-emerald-500/20 blur-[100px]" />
          <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-emerald-600/20 blur-[100px]" />

          <div className="relative z-10 flex h-full flex-col justify-between">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-bold uppercase tracking-wider text-emerald-200 backdrop-blur-md border border-white/10">
                <Zap className="h-4 w-4 fill-current" />
                Cyber Monday Sale
              </div>

              <h2 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl leading-[1.1]">
                <span className="block text-white">Get 50% OFF</span>
                <span className="bg-gradient-to-r from-emerald-200 via-white to-emerald-100 bg-clip-text text-transparent">
                  Everything
                </span>
              </h2>

              <p className="mt-4 max-w-md text-lg text-emerald-100/80 leading-relaxed">
                Unlock unlimited humanization power at our lowest price of the year. Don't miss out on this exclusive offer.
              </p>
            </div>

            <div className="mt-10">
              <div className="mb-4 flex items-center gap-2 text-sm font-medium text-emerald-200/70">
                <Timer className="h-4 w-4" /> Offer ends in:
              </div>
              <div className="flex gap-3 sm:gap-4">
                {[
                  { label: "Days", value: timeLeft.days },
                  { label: "Hours", value: timeLeft.hours },
                  { label: "Mins", value: timeLeft.minutes },
                  { label: "Secs", value: timeLeft.seconds },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center rounded-2xl bg-black/20 border border-white/5 p-3 sm:p-4 backdrop-blur-sm min-w-[70px] sm:min-w-[80px]">
                    <span className="text-2xl sm:text-3xl font-bold tabular-nums text-white">
                      {String(item.value).padStart(2, '0')}
                    </span>
                    <span className="text-[10px] sm:text-xs uppercase tracking-wider text-emerald-200/60 font-semibold mt-1">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Lifetime Deal Card */}
        <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-b from-white to-emerald-50 p-[1px] shadow-xl border border-emerald-100">
          <div className="relative h-full overflow-hidden rounded-[31px] bg-card p-8 lg:p-9">
            {/* Gold/Green Glow */}
            <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-emerald-100 blur-[80px]" />

            <div className="relative z-10 flex h-full flex-col">
              <div className="flex items-start justify-between">
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-600 border border-emerald-200">
                  <Crown className="h-3.5 w-3.5 fill-current" />
                  Lifetime Deal
                </div>
                <div className="flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-red-600 border border-red-200 animate-pulse">
                  Almost Gone
                </div>
              </div>

              <h3 className="mt-6 text-3xl font-bold text-white">
                Pay Once, <br />
                <span className="text-emerald-600">Humanize Forever</span>
              </h3>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Spots claimed</span>
                  <span className="font-bold text-white">{displayedClaimedCount} / {totalSpots}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.04]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)] transition-all duration-1000"
                    style={{ width: `${Math.min((displayedClaimedCount / totalSpots) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400">
                  Only {Math.max(totalSpots - displayedClaimedCount, 0)} spots remaining at this price.
                </p>
              </div>

              <ul className="mt-8 space-y-3">
                {[
                  "All Pro features",
                  "Priority support",
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-slate-400">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      <Check className="h-3 w-3" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-8">
                <div className="mb-4 flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-white">
                    {isLoadingPrice ? (
                      <span className="animate-pulse">...</span>
                    ) : (
                      lifetimePrice || "$399.99"
                    )}
                  </span>
                  <span className="text-lg text-slate-400 line-through">$1500+</span>
                </div>
                <Button
                  onClick={onSubscribe}
                  disabled={loading || !lifetimeProductId || isLifetime}
                  className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 py-6 text-base font-bold text-white shadow-xl shadow-black/50 hover:from-emerald-600 hover:to-emerald-700 hover:shadow-emerald-200/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLifetime ? (
                    <>
                      <Check className="mr-2 h-5 w-5" /> Lifetime Access Active
                    </>
                  ) : loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...
                    </>
                  ) : (
                    <>
                      Get Lifetime Access <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
