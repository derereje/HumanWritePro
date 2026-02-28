"use client";

import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Loader2, ShieldCheck } from "lucide-react";
import { useUser } from "~/lib/mockClerk";
import { useRouter } from "next/navigation";

type TopUpProduct = {
  id: string;
  name: string;
  description?: string;
  displayPrice: string;
  priceAmount: number | null;
  priceCurrency: string | null;
};

export default function TopUpSection() {
  const { isSignedIn } = useUser();
  const router = useRouter();
  const [products, setProducts] = useState<TopUpProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopUps = async () => {
      try {
        const res = await fetch("/api/polar/topups");
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch (error) {
        console.error("Failed to fetch top-ups:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopUps();
  }, []);

  const handlePurchase = async (productId: string) => {
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }

    setPurchasingId(productId);
    try {
      const res = await fetch("/api/polar/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      if (!res.ok) throw new Error("Failed to create checkout");

      const { checkoutUrl } = await res.json();
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error("Purchase error:", error);
      alert("Failed to start purchase. Please try again.");
      setPurchasingId(null);
    }
  };

  if (loading || products.length === 0) return null;

  return (
    <div className="mt-20">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-white">Need Extra Credits?</h2>
        <p className="mt-2 text-lg text-slate-400">
          Running low? Top up your account with a one-time credit pack.
        </p>
      </div>

      <div className="grid gap-5 sm:gap-6 lg:grid-cols-3 lg:gap-8 max-w-6xl mx-auto px-2 sm:px-0">
        {products.map((product) => (
          <div
            key={product.id}
            className="relative flex flex-col rounded-[24px] sm:rounded-[28px] md:rounded-[30px] border border-white/10 bg-card p-5 sm:p-6 md:p-8 shadow-xl shadow-black/50 transition duration-200 hover:-translate-y-1 hover:shadow-[0_22px_60px_-30px_rgba(37,99,235,0.15)] w-full"
          >
            <div className="flex flex-1 flex-col w-full">
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-white">{product.name}</h3>
                <div className="mt-2 sm:mt-3 flex flex-wrap items-baseline gap-1.5 sm:gap-2 text-white">
                  <span className="text-3xl sm:text-4xl font-semibold">
                    {product.displayPrice}
                  </span>
                  <span className="text-xs sm:text-sm text-slate-400">/ one-time</span>
                </div>
                <p className="mt-2 text-xs text-slate-400">Credits never expire</p>
              </div>

              <div className="mt-5 sm:mt-6 flex flex-col gap-3 sm:gap-4">
                <Button
                  onClick={() => handlePurchase(product.id)}
                  disabled={!!purchasingId}
                  className="w-full h-11 sm:h-12 rounded-xl sm:rounded-2xl py-3 sm:py-4 text-xs sm:text-sm font-semibold  bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 transition"
                >
                  {purchasingId === product.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Buy Credits"
                  )}
                </Button>
                <p className="text-center text-[10px] sm:text-xs text-slate-400">Secure checkout · Instant delivery</p>
              </div>

              <ul className="mt-3 sm:mt-4 space-y-2.5 sm:space-y-3 text-xs sm:text-sm text-slate-400">
                <li className="flex items-start gap-2 sm:gap-3">
                  <ShieldCheck className="mt-0.5 sm:mt-1 h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500 flex-shrink-0" />
                  <span className="flex-1">Instant credit delivery</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <ShieldCheck className="mt-0.5 sm:mt-1 h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500 flex-shrink-0" />
                  <span className="flex-1">Works with any plan</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <ShieldCheck className="mt-0.5 sm:mt-1 h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500 flex-shrink-0" />
                  <span className="flex-1">No expiration date</span>
                </li>
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
