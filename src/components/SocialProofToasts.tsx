"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";

const PLANS = [
    { name: "Ultra", price: "$39.99/month", color: "text-green-600", weight: 45 },
    { name: "Pro", price: "$19.99/month", color: "text-green-600", weight: 45 },
    { name: "Basic", price: "$9.99/month", color: "text-green-600", weight: 10 },
];

export default function SocialProofToasts() {
    const router = useRouter();

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        const getRandomPlan = () => {
            const totalWeight = PLANS.reduce((acc, p) => acc + p.weight, 0);
            let random = Math.random() * totalWeight;
            for (const plan of PLANS) {
                if (random < plan.weight) return plan;
                random -= plan.weight;
            }
            return PLANS[0];
        };

        const showToast = () => {
            // Don't show if tab is hidden
            if (document.hidden) return;

            const plan = getRandomPlan();
            const words = Math.floor(Math.random() * (2500 - 400 + 1)) + 400;
            const formattedWords = new Intl.NumberFormat().format(words);

            toast.custom((t) => (
                <div className="w-auto max-w-[350px] bg-[#1a1f2e] backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.4)] border border-white/10 p-2.5 flex items-center gap-3 relative overflow-hidden group">
                    {/* Subtle icon */}
                    <div className="flex-shrink-0 mt-0.5">
                        <div className="w-7 h-7 rounded-full bg-brand-primary-50 flex items-center justify-center">
                            <Sparkles className="h-3.5 w-3.5 text-brand-primary-600" />
                        </div>
                    </div>

                    <div className="flex-1 min-w-0 pr-2">
                        <p className="text-[12px] text-slate-300 leading-snug whitespace-nowrap">
                            Someone just humanized <span className="font-bold">{formattedWords} words</span> using <span className={`font-bold ${plan?.color}`}>{plan?.name}</span>
                        </p>
                        <button
                            onClick={() => {
                                toast.dismiss(t);
                                document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
                                if (window.location.pathname !== '/') {
                                    router.push('/#pricing');
                                }
                            }}
                            className="block text-[11px] text-brand-primary-600 font-semibold hover:text-brand-primary-700 transition-colors text-left mt-1"
                        >
                            Unlock {plan?.name} — {plan?.price} →
                        </button>
                    </div>

                    <button
                        onClick={() => toast.dismiss(t)}
                        className="flex-shrink-0 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Subtle accent bar */}
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-brand-primary-500" />
                </div>
            ), {
                duration: 6000,
                position: 'bottom-left'
            });

            // Schedule next toast at a random interval (1-20 seconds)
            const nextInterval = Math.floor(Math.random() * (20000 - 1000 + 1)) + 1000;
            timeoutId = setTimeout(showToast, nextInterval);
        };

        const handleVisibilityChange = () => {
            if (!document.hidden) {
                // Clear any existing timeout and start a fresh one when returning
                clearTimeout(timeoutId);
                const returnDelay = Math.floor(Math.random() * (5000 - 2000 + 1)) + 2000;
                timeoutId = setTimeout(showToast, returnDelay);
            } else {
                // Stop the loop when tab is hidden
                clearTimeout(timeoutId);
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        // Initial launch
        const initialDelay = Math.floor(Math.random() * (7000 - 3000 + 1)) + 3000;
        timeoutId = setTimeout(showToast, initialDelay);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            clearTimeout(timeoutId);
        };
    }, [router]);

    return null;
}
