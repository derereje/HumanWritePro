"use client";

import { Brain, Shield, Fingerprint, Zap, CheckCircle2 } from "lucide-react";

const features = [
  {
    name: "Proprietary Dataset Training",
    description: "Engineered using 2M+ human-written texts to ensure structural authenticity and natural flow.",
    icon: Brain,
  },
  {
    name: "High Detection Resilience",
    description: "Built to maintain compatibility across leading detection protocols including Turnitin and Originality.ai.",
    icon: Fingerprint,
  },
  {
    name: "Enterprise Data Privacy",
    description: "Strict zero-retention policy ensures all data is processed in-memory and immediately purged.",
    icon: Shield,
  },
  {
    name: "Semantic Integrity",
    description: "Preserves precise intent and technical nuance while optimizing for undetectable readability.",
    icon: CheckCircle2,
  },
  {
    name: "High-Performance Delivery",
    description: "Delivers refined, human-grade output in seconds, optimized for professional workflows.",
    icon: Zap,
  },
];

export default function FactsSection() {
  return (
    <section className="py-32 bg-background relative overflow-hidden">
      {/* Premium background mesh */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:32px_32px]"></div>
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.02] border border-white/10 text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-primary-500"></span>
            The Standard for Humanization
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4 max-w-3xl">
            Engineered for <span className="text-brand-primary-600 italic font-serif">Professional</span> Quality
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl leading-relaxed mb-6">
            AcousticText utilizes advanced semantic restructuring to ensure your content is not just undetectable, but genuinely readable and authoritative.
          </p>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <div
              key={feature.name}
              className="group relative flex flex-col justify-between p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 backdrop-blur-sm transition-all duration-500 hover:bg-white/[0.04] hover:border-blue-500/30 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/10"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-xl shadow-black/50 shadow-blue-500/0 group-hover:shadow-blue-500/20">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <span className="text-5xl font-black text-white/5 group-hover:text-blue-500/10 transition-colors select-none">
                    0{idx + 1}
                  </span>
                </div>
                <h3 className="text-xl font-black text-white mb-3 tracking-tight group-hover:text-blue-400 transition-colors">
                  {feature.name}
                </h3>
                <p className="text-slate-400 leading-relaxed font-medium">
                  {feature.description}
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-white/5 flex items-center gap-3 text-[10px] font-black text-slate-400 group-hover:text-blue-400 transition-colors uppercase tracking-[0.2em]">
                <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
                <span>Verified Protocol</span>
                <span className="h-1 w-1 rounded-full bg-slate-700"></span>
                <span>Active</span>
              </div>
            </div>
          ))}

          {/* Final CTA Card */}
          <div className="relative group overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-blue-700 to-blue-900 p-8 text-white shadow-3xl flex flex-col justify-between hover:scale-[1.02] transition-all duration-500 border border-white/20">
            <div className="relative z-10">
              <h3 className="text-2xl font-black mb-4 tracking-tight leading-tight">Ready to humanize your workflow?</h3>
              <p className="text-blue-100/70 leading-relaxed font-medium mb-8">
                Join the professional elite using AcousticText to secure their content's future.
              </p>
            </div>
            <button
              onClick={() => document.getElementById('tool')?.scrollIntoView({ behavior: 'smooth' })}
              className="relative z-10 w-full py-4 px-6 bg-card text-blue-900 font-black rounded-2xl shadow-xl hover:bg-blue-50 transition-all duration-300 hover:scale-105 active:scale-95 text-lg"
            >
              Start for Free
            </button>
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
