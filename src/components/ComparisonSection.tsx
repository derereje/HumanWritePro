"use client";

import { useEffect, useState } from "react";
import { ShieldAlert, ShieldCheck, X, Check, AlertTriangle } from "lucide-react";

const COMPETITORS = [
  {
    name: "Walter Writes AI",
    issues: ["Detected by Turnitin", "Inconsistent quality", "Overpriced"],
  },
  {
    name: "Undetectable AI",
    issues: ["Fails major detectors", "Random ML outputs", "Hidden fees"],
  },
  {
    name: "StealthGPT",
    issues: ["Gets flagged easily", "Poor output quality", "No refunds"],
  },
  {
    name: "WriteHuman AI",
    issues: ["Detected by GPTZero", "Unpredictable results", "Poor support"],
  },
  {
    name: "GPTInf",
    issues: ["Fails Originality.ai", "Robotic text output", "Wastes credits"],
  },
  {
    name: "StealthWriter",
    issues: ["Doesn't bypass detectors", "ML garbage output", "Fake reviews"],
  },
  {
    name: "Ryne AI",
    issues: ["Caught by Turnitin", "Inconsistent results", "No support"],
  },
  {
    name: "Humbot AI",
    issues: ["Detected easily", "Black-box AI", "Subscription traps"],
  },
  {
    name: "Phrasly AI",
    issues: ["Fails detection tests", "Poor quality rewrites", "Hidden costs"],
  },
  {
    name: "Twaingpt",
    issues: ["Gets flagged instantly", "Unreliable output", "No refund policy"],
  },
  {
    name: "HIX Bypass",
    issues: ["Fails GPTZero", "Random results", "Misleading claims"],
  },
  {
    name: "BypassGPT",
    issues: ["Detected by all checkers", "Wastes your money", "Fake testimonials"],
  },
];

const ACOUSTICTEXT_BENEFITS = [
  "Fine-tuned on 2M+ samples",
  "Consistent, predictable results",
  "Passes ALL major AI detectors",
  "Transparent pricing, no hidden fees",
  "Money-back guarantee",
  "24/7 customer support",
];

export default function ComparisonSection({ keyword }: { keyword?: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const displayKeyword = keyword || "AI Humanizer";

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % COMPETITORS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const currentScam = COMPETITORS[currentIndex];

  return (
    <section className="py-40 bg-background relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-24 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 rounded-full bg-red-500/10 px-5 py-2 text-sm font-black text-red-500 mb-8 border border-red-500/20">
            <AlertTriangle className="h-4 w-4 animate-pulse" />
            WARNING: MOST AI HUMANIZERS ARE SCAMS
          </div>
          <h2 className="text-4xl sm:text-7xl font-black tracking-tighter text-foreground dark:text-white mb-8 leading-[1]">
            Why <span className="text-blue-500 dark:text-blue-400">AcousticText</span> is the Only Choice
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium">
            Most humanizers use weak models that fail Turnitin. AcousticText is built on high-fidelity human datasets.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-stretch">
          {/* Scam Competitors - Redesigned for Dark Theme */}
          <div className="rounded-[3rem] border border-red-500/20 bg-red-100 dark:bg-red-500/[0.02] p-8 sm:p-10 flex flex-col relative overflow-hidden group">
            <div className="absolute inset-0 bg-red-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
            <div className="flex items-center gap-4 mb-10 relative z-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20">
                <ShieldAlert className="h-8 w-8 text-red-500" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-red-500 tracking-tight">Scam Competitors</h3>
                <p className="text-sm font-bold text-red-400/60 uppercase tracking-widest">Exposing the Fraud</p>
              </div>
            </div>

            {/* Animated scam card */}
            <div className="flex-1 flex flex-col justify-center">
              <div className="relative overflow-hidden min-h-[200px]">
                <div
                  key={currentIndex}
                  className="rounded-3xl bg-black/40 border border-red-500/30 p-8 shadow-2xl animate-in slide-in-from-right-full duration-500 backdrop-blur-md"
                >
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-2xl font-black text-foreground dark:text-white tracking-tight">{currentScam?.name}</span>
                    <span className="inline-flex items-center gap-2 rounded-full bg-red-500/20 px-4 py-2 text-xs font-black text-red-500 border border-red-500/30 uppercase tracking-widest">
                      <X className="h-4 w-4" /> SCAM DETECTED
                    </span>
                  </div>
                  <ul className="space-y-4">
                    {currentScam?.issues.map((issue, idx) => (
                      <li key={idx} className="flex items-center gap-4 text-lg font-bold text-red-400/80">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20 flex-shrink-0">
                          <X className="h-4 w-4 text-red-500" />
                        </div>
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Progress dots */}
              <div className="flex justify-center gap-2 mt-6">
                {COMPETITORS.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    data-analytics-id={`comparison-dot-${idx}`}
                    className={`h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? "w-6 bg-red-500" : "w-2 bg-red-200 hover:bg-red-300"
                      }`}
                  />
                ))}
              </div>

              <p className="text-center text-sm text-red-500 mt-4">
                {currentIndex + 1} of {COMPETITORS.length} scams exposed
              </p>
            </div>
          </div>

          {/* AcousticText - Redesigned for Dark Theme */}
          <div className="rounded-[3rem] border border-blue-500/30 bg-blue-500/[0.02] p-8 sm:p-10 shadow-[0_0_50px_rgba(37,99,235,0.1)] flex flex-col relative overflow-hidden group">
            <div className="absolute inset-0 bg-blue-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
            <div className="flex items-center gap-4 mb-10 relative z-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 shadow-xl shadow-blue-500/40">
                <ShieldCheck className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white tracking-tight">AcousticText</h3>
                <p className="text-sm font-bold text-blue-400/80 uppercase tracking-widest leading-none">The Industry Leader</p>
              </div>
            </div>

            <div className="mb-8 relative z-10">
              <span className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-5 py-2.5 text-xs font-black text-blue-400 border border-blue-500/30 uppercase tracking-widest">
                <Check className="h-4 w-4" /> AUTHENTICITY VERIFIED
              </span>
            </div>

            <ul className="space-y-6 flex-1 relative z-10">
              {ACOUSTICTEXT_BENEFITS.map((benefit, idx) => (
                <li key={idx} className="flex items-center gap-4 text-foreground dark:text-white">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10 border border-blue-500/20 flex-shrink-0">
                    <Check className="h-5 w-5 text-blue-500" />
                  </div>
                  <span className="font-bold text-lg tracking-tight">{benefit}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 p-4 rounded-2xl bg-blue-100/50 border border-blue-200">
              <p className="text-sm text-blue-800 font-medium text-center">
                🎯 Fine-tuned on 2M+ samples = Consistent, high-quality output every time
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-slate-400 text-sm">
            * Based on our testing of 20+ AI humanizer tools against Turnitin, GPTZero, and Originality.ai
          </p>
        </div>
      </div>
    </section>
  );
}
