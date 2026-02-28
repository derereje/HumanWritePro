"use client";

import { FileText, Sparkles, ArrowRight, Zap } from "lucide-react";

const steps = [
  {
    step: 1,
    title: "Paste Your Text",
    description: "Drop any AI-generated content. Essays, articles, reports - we handle it all.",
    icon: FileText,
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-100",
    shadowColor: "shadow-blue-200",
    hoverShadow: "hover:shadow-blue-100/50",
  },
  {
    step: 2,
    title: "One-Click Transform",
    description: "Our engine removes AI fingerprints while keeping your message intact.",
    icon: Sparkles,
    color: "from-blue-600 to-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-100",
    shadowColor: "shadow-blue-200",
    hoverShadow: "hover:shadow-blue-100/50",
  },
  {
    step: 3,
    title: "Pass Any Detector",
    description: "Get undetectable text ready for Turnitin, GPTZero, or any other checker.",
    icon: Zap,
    color: "from-blue-500 to-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-100",
    shadowColor: "shadow-blue-200",
    hoverShadow: "hover:shadow-blue-100/50",
  }
];

export default function HowToUseSection({ keyword }: { keyword?: string }) {
  const displayKeyword = keyword ? ` for ${keyword}` : "";

  return (
    <section className="py-40 bg-background relative overflow-hidden">
      {/* Enhanced atmospheric background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
        <div className="absolute top-[10%] left-[5%] w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-[10%] right-[5%] w-[600px] h-[600px] bg-blue-800/5 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-24 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-[0.2em] mb-8">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 pulse-glow"></span>
            EFFORTLESS WORKFLOW
          </div>
          <h2 className="text-4xl sm:text-7xl font-black tracking-tighter text-white mb-8 max-w-4xl leading-[1]">
            How to Use <span className="text-blue-500 italic">HumanWritePro</span>{displayKeyword}
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium">
            Transform AI text into human-like content in seconds. No complex settings, just superior results.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="mx-auto max-w-6xl mb-16">
          <div className="grid md:grid-cols-3 gap-8 lg:gap-10 relative">
            {/* Animated Connecting Lines (Desktop) */}
            <div className="hidden md:block absolute top-16 left-[16%] right-[16%] h-1 z-0">
              <div className="h-full w-full bg-gradient-to-r from-blue-200 via-blue-300 to-blue-200 rounded-full opacity-40" />
              <div className="absolute inset-0 h-full bg-gradient-to-r from-blue-400 via-blue-500 to-blue-400 rounded-full animate-pulse opacity-60" />
            </div>

            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.step} className="relative z-10 group">
                  <div className="flex flex-col items-center text-center p-10 rounded-[3rem] bg-white/[0.02] border border-white/5 backdrop-blur-md shadow-3xl transition-all duration-500 hover:-translate-y-4 hover:bg-white/[0.04] hover:border-blue-500/30 hover:shadow-blue-500/10 group-hover:scale-105">
                    {/* Icon Container */}
                    <div className="relative mb-10">
                      <div className="absolute inset-0 bg-blue-500 rounded-[2rem] blur-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-700" />
                      <div className="relative w-24 h-24 rounded-[2rem] bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center shadow-2xl shadow-blue-500/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 border border-white/10">
                        <Icon className="h-12 w-12 text-white" strokeWidth={2} />
                      </div>
                      {/* Step Number Badge */}
                      <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-card text-blue-600 flex items-center justify-center shadow-2xl font-black text-lg border-4 border-background">
                        {step.step}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-6">
                      <h3 className="text-3xl font-black text-white group-hover:text-blue-400 transition-colors tracking-tight">
                        {step.title}
                      </h3>
                      <p className="text-lg leading-relaxed text-slate-400 px-2 font-medium">
                        {step.description}
                      </p>
                    </div>

                    {/* Arrow indicator (except last) */}
                    {index < steps.length - 1 && (
                      <div className="hidden md:block absolute -right-10 top-1/2 -translate-y-1/2 z-20">
                        <ArrowRight className="h-8 w-8 text-white/10 group-hover:text-blue-500 transition-all duration-500 group-hover:translate-x-2" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

