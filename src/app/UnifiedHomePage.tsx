"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "~/lib/mockClerk";
import Image from "next/image";
import { Button } from "~/components/ui/button";
import { ShieldCheck, Sparkles, Lock, Bolt } from "lucide-react";
import { SiteFooter } from "~/components/SiteFooter";

const FEATURES = [
  {
    title: "Bypass AI Detectors",
    description: "Proven 98% success against Turnitin, GPTZero, Originality.ai, and more.",
    icon: ShieldCheck,
  },
  {
    title: "Multiple Tones & Presets",
    description: "Casual, professional, creative — pick the voice that fits your message.",
    icon: Sparkles,
  },
  {
    title: "Secure & Private",
    description: "Text is encrypted, never stored, and never used for training.",
    icon: Lock,
  },
  {
    title: "Instant Results",
    description: "Transform content in seconds with zero waiting and no downloads.",
    icon: Bolt,
  },
];

const STATS = [
  { value: "98%", label: "Detection Bypass Rate" },
  { value: "500M+", label: "Words Humanized" },
  { value: "200K+", label: "Satisfied Users" },
  { value: "30+", label: "Supported Detectors" },
];

export default function UnifiedHomePage() {
  const { isSignedIn } = useUser();
  const router = useRouter();

  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  

  const scrollToTool = () => {
    const el = document.getElementById("main-tool");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };


  


  const handleHumanize = async () => {
    setError(null);
    setOutputText("");

    const wordCount = inputText.trim().split(/\s+/).filter(Boolean).length;
    if (wordCount < 50) {
      setError("Please provide at least 50 words for humanization.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/humanizer/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ text: inputText, preset: "default" }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json?.error || `Request failed with status ${res.status}`);
      }

      if (!res.body) throw new Error("No response body from server.");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });

        const parts = buf.split("\n\n");
        buf = parts.pop() || "";

        for (const part of parts) {
          const line = part.trim();
          if (!line) continue;
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6).trim();
          if (payload === "[DONE]") continue;

          try {
            const parsed = JSON.parse(payload);
            const content = parsed?.choices?.[0]?.delta?.content || parsed?.content || parsed?.text;
            if (content) setOutputText((prev) => prev + content);
            else if (parsed?.type === "complete") {
              // completion metadata received (credits etc.) — placeholder
            }
          } catch (e) {
            setOutputText((prev) => prev + "\n" + payload);
          }
        }
      }
    } catch (err: any) {
      console.error("Humanize error:", err);
      setError(err?.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      setInputText(text);
    };
    reader.readAsText(file);
  };

  const handleCTA = () => {
    if (isSignedIn) router.push("/account");
    else router.push("/signin");
  };

  return (
    <div className="relative">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Go to top"
          >
            <div className="flex items-center justify-center bg-indigo-600 rounded-lg p-2 shadow-md w-12 h-12 transition-transform duration-200 group-hover:scale-105">
              {/* brain icon fallback SVG */}
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C8.686 2 6 4.686 6 8c0 .984.248 1.908.683 2.708L6 16v2h12v-2l-1.683-5.292c.435-.8.683-1.724.683-2.708 0-3.314-2.686-6-6-6z" fill="#fff"/>
                <path d="M12 4a4 4 0 00-4 4c0 .552.134 1.07.363 1.52l.637 2.008.399-1.197A1 1 0 0010 10h4a1 1 0 00.601-.169l.399 1.197.637-2.008A3.992 3.992 0 0016 8a4 4 0 00-4-4z" fill="#8b5cf6"/>
              </svg>
            </div>
            <div className="ml-2 flex flex-col leading-tight">
              <span className="text-3xl font-extrabold text-gray-900 transition-colors duration-200 group-hover:text-indigo-800 break-words">AcousticText</span>
              <span className="text-sm font-bold text-gray-600">AI Humanizer</span>
            </div>
          </div>

          <nav className="flex items-center gap-6">
            <a href="#" className="text-base md:text-lg font-bold text-indigo-700 hover:text-indigo-900 transition-colors duration-200">
              Pricing
            </a>
            <a href="#" className="text-base md:text-lg font-bold text-indigo-700 hover:text-indigo-900 transition-colors duration-200">
              Upgrade
            </a>
            <Button onClick={handleCTA} className="hidden md:inline-flex bg-indigo-600 text-white transition-colors duration-200 hover:bg-indigo-700 active:scale-95">
              Sign in
            </Button>
          </nav>
        </div>
      </header>

      <div className="h-16 md:h-20" />

      {/* Main Tool (moved to top as focal element) */}
      <section id="main-tool" className="bg-white py-8 md:py-12 opacity-0 animate-fade-in-up">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight overflow-hidden">
              <span className="text-indigo-700 animate-header-slide drop-shadow">Humanize AI Text Instantly</span>
            </h1>
            <div className="mt-3 text-lg md:text-xl text-gray-700 max-w-2xl mx-auto">
              Type, paste, or upload AI-generated text below to transform it into natural, human-written prose.
            </div>
          </div>

          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 md:p-8 rounded-3xl shadow-lg opacity-0 animate-fade-in-up">
            {/* Tool container animation handled by parent fade-in */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Input Panel */}
              <div className="md:col-span-6 flex flex-col justify-between items-stretch bg-gradient-to-br from-white/95 to-indigo-50 p-8 rounded-3xl shadow-xl min-h-[460px] h-full">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-lg md:text-xl font-bold text-gray-800 block">Start here</label>
                  <label className="cursor-pointer inline-flex items-center gap-2 text-base md:text-lg font-semibold text-indigo-700 bg-white rounded-lg px-5 py-3 shadow-sm hover:shadow-md transition">
                    <input type="file" accept=".txt,.md,.doc,.docx" onChange={handleFileUpload} className="hidden" />
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828L20 9.828a4 4 0 10-5.657-5.657L9.172 9.343" />
                    </svg>
                    <span className="ml-1">Upload file</span>
                  </label>
                </div>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type, paste, or upload text to humanize..."
                  className="w-full min-h-[350px] h-full p-6 rounded-2xl resize-none focus:outline-none focus:ring-4 focus:ring-indigo-200 mb-4 text-gray-900 text-base md:text-lg font-medium bg-white/95"
                  style={{ lineHeight: 1.6 }}
                />
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex-1" />
                  <Button onClick={handleHumanize} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl inline-flex items-center justify-center transition transform duration-150 hover:-translate-y-0.5 shadow-lg hover:shadow-2xl active:scale-95" disabled={isLoading}>
                    {isLoading ? (
                      <span className="inline-flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                        </svg>
                        Humanizing...
                      </span>
                    ) : (
                      "Humanize"
                    )}
                  </Button>
                </div>
                {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
              </div>
              {/* Output Panel */}
              <div className="md:col-span-6 flex flex-col items-stretch bg-gradient-to-br from-white/95 to-indigo-50 p-8 rounded-3xl shadow-xl min-h-[460px] h-full">
                <label className="text-sm font-semibold text-gray-700 mb-3 block">Result</label>
                <pre className="whitespace-pre-wrap break-words min-h-[350px] h-full p-6 rounded-2xl bg-white text-gray-800 text-base md:text-lg font-medium">{outputText || 'Your humanized result will appear here.'}</pre>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Scrolling detectors marquee */}
      {/* Scrolling detectors marquee (centered rounded container, single-line) */}
      <section className="bg-white py-6">
        <div className="max-w-7xl mx-auto px-6">
          <div className="rounded-2xl bg-white/80 dark:bg-zinc-900/80 shadow-xl px-2 py-1">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg md:text-xl font-bold text-indigo-700">AI detectors we pass</h4>
              <span className="text-xs text-gray-500">Trusted across platforms</span>
            </div>
            <div className="relative overflow-hidden">
              <div className="w-full">
                <div className="inline-flex items-center gap-8 w-max whitespace-nowrap will-change-transform animate-marquee" style={{ animationDuration: '28s' }}>
                  {['GPTZero','Turnitin','Originality.ai','Copyleaks','Scribbr'].map((label, i) => (
                    <div key={`chip-${i}`} className="inline-flex items-center gap-3 px-5 py-3 bg-white rounded-full shadow-sm mr-4">
                      <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-semibold">{label.split(/\s|\.|/)[0].slice(0,2).toUpperCase()}</div>
                      <span className="font-semibold text-xl md:text-2xl text-indigo-700">{label}</span>
                    </div>
                  ))}
                  {/* duplicate for seamless loop */}
                  {['GPTZero','Turnitin','Originality.ai','Copyleaks','Scribbr'].map((label, i) => (
                    <div key={`chip-dup-${i}`} className="inline-flex items-center gap-3 px-5 py-3 bg-white rounded-full shadow-sm mr-4">
                      <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-semibold">{label.split(/\s|\.|/)[0].slice(0,2).toUpperCase()}</div>
                      <span className="font-semibold text-xl md:text-2xl text-indigo-700">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features cards */}
      <section className="bg-white py-12 opacity-0 animate-fade-in-up">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">Core Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="p-6 bg-gray-50 rounded-2xl shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              >
                <f.icon className="h-10 w-10 text-indigo-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
                <p className="text-gray-600 text-sm">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gray-100 py-12 opacity-0 animate-fade-in-up">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6 text-gray-900">Proven Results</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((s) => (
              <div key={s.label} className="p-6 bg-white rounded-xl shadow-sm">
                <div className="text-4xl font-extrabold text-indigo-600">{s.value}</div>
                <div className="text-sm text-gray-500 mt-2">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* quick CTA after stats */}
      <section className="py-12 opacity-0 animate-fade-in-up">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to start?</h2>
          <Button
            onClick={handleCTA}
            className="bg-blue-600 text-white font-bold text-lg md:text-xl shadow-lg hover:bg-blue-700 transition duration-150 active:scale-95"
          >
            Try Now
          </Button>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
