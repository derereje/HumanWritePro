"use client";

import { useCallback, useEffect, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import { useUser, SignInButton } from "~/lib/mockClerk";
import Image from "next/image";
import mammoth from "mammoth";
import ModernNavbar from "~/components/ModernNavbar";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "~/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import {
  Check,
  Copy,
  Download,
  Loader2,
  ShieldCheck,
  FileText,
  UploadCloud,
  ChevronDown,
  Info,
  Lock,
  Sparkles,
  Eraser,
  Maximize2,
  History,
  Command,
  Star,
  Keyboard,
  Brain,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import PolarPricing from "~/components/pricing/PolarPricing";
import TopUpSection from "~/components/pricing/TopUpSection";
import { cn } from "~/lib/utils";
import { SiteFooter } from "~/components/SiteFooter";
import HowToUseSection from "~/components/HowToUseSection";
import FactsSection from "~/components/FactsSection";
import ReferralPopup from "~/components/ReferralPopup";


import FirstLoginPricingModal from "~/components/FirstLoginPricingModal";
import { useEventReplay } from "~/components/EventReplayContext";
import { mockGetUserCount, mockGetCredits, simulateHumanizerStream } from "~/lib/mockApi";

// --- Configuration & Data ---

const PRESETS = [
  { value: "default", label: "Default", description: "Standard humanization", isPremium: false },
  { value: "casual", label: "Friendly", description: "Warm and conversational", isPremium: true },
  { value: "professional", label: "Professional", description: "Polished and confident", isPremium: true },
  { value: "minimal-errors", label: "Academic", description: "Structured and research-ready", isPremium: true },
  { value: "playful", label: "Empathetic", description: "Expressive storytelling", isPremium: true },
  { value: "creative", label: "Creative", description: "Imaginative and engaging", isPremium: true },
  { value: "formal", label: "Formal", description: "Precise and authoritative", isPremium: true },
  { value: "persuasive", label: "Persuasive", description: "Compelling marketing tone", isPremium: true },
];

const HUMANIZING_PROCESSES = [
  "Restructuring content flow...",
  "Removing robotic patterns...",
  "Refining natural rhythm...",
  "Adjusting tone authenticity...",
  "Enriching word variety...",
  "Finalizing human touch...",
];

const DETECTOR_BADGES = [
  { name: "Turnitin", logoSrc: "/logo/turnitin.png" },
  { name: "GPTZero", logoSrc: "/logo/GPTZero.png" },
  { name: "Originality.ai", logoSrc: "/logo/originality.png" },
  { name: "Copyleaks", logoSrc: "/logo/copyleaks.png" },
  { name: "ZeroGPT", logoSrc: "/logo/zeroGPT.png" },
  { name: "QuillBot", logoSrc: "/logo/quillbot.png" },
  { name: "Sapling", logoSrc: "/logo/sapling.png" },
  { name: "Writer", logoSrc: "/logo/writer.png" },
];

const FAQ_ITEMS = [
  {
    id: "why-different",
    question: "Why is HumanWritePro different from other humanizers?",
    answer: "Most AI humanizers use simple word replacement. HumanWritePro uses advanced neural processing to genuinely transform text structure, tone, and flow - producing output that reads like authentic human writing.",
  },
  {
    id: "privacy",
    question: "Is my content secure?",
    answer: "Absolutely. Your text is encrypted end-to-end and never stored permanently. We don't train on your data, and you can delete your history anytime.",
  },
  {
    id: "detectors",
    question: "Which AI detectors does it bypass?",
    answer: "HumanWritePro is verified to bypass Turnitin, GPTZero, Originality.ai, Copyleaks, ZeroGPT, QuillBot, Sapling, and Writer.",
  },
  {
    id: "credits",
    question: "How do credits work?",
    answer: "1 credit = 1 word. Free users get 500 credits. Paid plans include monthly allowances that reset automatically.",
  },
];

// Comparison examples for different content types
const COMPARISON_EXAMPLES = {
  'Academic Essay': {
    before: 'Ultimately, creativity is more than a skill; it is a mindset that fosters growth, adaptability, and originality. By nurturing curiosity, embracing experimentation, and collaborating with others, individuals can unlock their creative potential. Creativity enriches life by providing new ways to express ideas, solve problems, and connect with others. Those who cultivate it contribute not only to personal development but also to the advancement of society, making the world more innovative, dynamic, and vibrant.',
    after: 'All in all, creativity is not just a recipe; but it is rather an approach to get people growing.The Three Foci of Creativity: Nurturing curiosity, embracing experimentation with hands on learning experience in order to explore other and in collaboration with other innovation warriors.If you\'re an individual with creativity, it not only makes your life more colorful and fulfilling but can also in more general and practical terms actually create better solutions for old problems and encourage new ones to emerge: Creativity makes life richer by providing new media to express ideas Creativity enables the most unique solutions to problems Creativity results from connecting people together.Such people benefit their own lives greatly, so it seems reasonable to assume that society as a whole will benefit even more from having them around. They contribute in every way to making the world a far more creative, active and interesting place.'
  },
  'Cold Email': {
    before: "I hope you're doing well and having a smooth, productive day.I wanted to reach out because I've been exploring new ways to help individuals simplify their digital workload and create a more effortless, efficient workflow experience. \n\nI recently developed a tool that automates repetitive tasks, enhances overall productivity, and reduces the amount of time spent on manual processes.It's designed to adapt intelligently to different needs, operate smoothly without complex setup, and provide a more streamlined way of getting things done.",
    after: "I hope you are doing well, and having a good and productive day. I'm writing because I've been experimenting with new ways to help people reduce the amount of digital weight in their lives and focus on a more effortless way of moving through work. \n\nI recently created an application that automate the things you do on a regular basis, saving you time and helping you become more productive.It's intended to automatically accommodate your needs, flow easily without a ton of setup work, and offer a more streamlined way to get things done."
  },
  'Blog Post': {
    before: 'Early Earth was extremely hot and covered in molten rock. Over time, its surface cooled, forming a solid crust and oceans. Volcanic activity released gases that formed the early atmosphere. Simple life is believed to have appeared around 3.5 billion years ago, evolving gradually into the complex organisms that inhabit the planet today. Earth became suitable for life because it has liquid water, a stable atmosphere, the right temperature range, and protection from harmful space radiation through its magnetic field.',
    after: 'The early Earth was red hot and bathed in molten rock. It gradually cooled on the surface, and a solid crust and oceans formed. Gasses were released through volcanic activity to make the early atmosphere. Primitive life is thought to have evolved rapidly, perhaps as much 3.5 billion years ago, into a variety of complex forms that share the planet today. Earth is habitable because it contains liquid water, has a stable atmosphere, maintains temperatures that are conducive to life and is shielded from space radiation by the magnetic field.'
  }
};

// Proven Results Comparison Component
function ProvenResultsComparison() {
  const [activeTab, setActiveTab] = useState<keyof typeof COMPARISON_EXAMPLES>('Academic Essay');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showFullText, setShowFullText] = useState(false);

  const handleTabChange = (tab: keyof typeof COMPARISON_EXAMPLES) => {
    if (tab === activeTab) return;

    setIsTransitioning(true);
    setShowFullText(false);
    setTimeout(() => {
      setActiveTab(tab);
      setIsTransitioning(false);
    }, 200);
  };

  const currentExample = COMPARISON_EXAMPLES[activeTab];

  return (
    <>
      {/* Modern Tabs */}
      <div className="flex justify-center mb-12">
        <div className="inline-flex items-center bg-white/[0.04] p-1.5 rounded-full border border-white/10">
          {(Object.keys(COMPARISON_EXAMPLES) as Array<keyof typeof COMPARISON_EXAMPLES>).map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${activeTab === tab
                ? 'bg-card text-white  ring-1 ring-slate-200'
                : 'text-slate-400 hover:text-slate-300 hover:bg-white/[0.04]'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Comparison Cards */}
      <div
        className={`grid md:grid-cols-2 gap-6 lg:gap-8 max-w-6xl mx-auto transition-all duration-300 ease-in-out ${isTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
          }`}
      >
        {/* Before Card */}
        <div className="relative group flex flex-col h-full">
          <div className="absolute inset-0 bg-white/[0.02] rounded-3xl -z-10" />
          <div className="relative rounded-3xl border border-white/10 bg-white/[0.02] p-5 sm:p-6 h-full flex flex-col transition-all duration-300 group-hover:border-white/[0.15]">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200/60">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Before</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-card border border-white/10 text-[10px] font-semibold text-slate-400 ">
                <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                AI Detected
              </span>
            </div>

            {/* Content */}
            <div className="relative flex-grow">
              <div className={`relative text-slate-400 leading-relaxed font-mono text-xs sm:text-sm opacity-90 whitespace-pre-wrap ${!showFullText ? 'line-clamp-6' : ''}`}>
                {currentExample.before}
              </div>
              {!showFullText && currentExample.before.length > 450 && (
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-slate-50/90 to-transparent pointer-events-none" />
              )}
            </div>

            {/* Footer - Generic Tag */}
            <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center gap-2 text-[10px] font-medium text-slate-400">
              <svg className="h-3.5 w-3.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Requires rewrite
            </div>
          </div>
        </div>

        {/* After Card */}
        <div className="relative group flex flex-col h-full transform transition-all duration-500 hover:-translate-y-1">
          <div className="absolute inset-0 bg-blue-500/5 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="relative rounded-3xl border border-blue-100 bg-card p-5 sm:p-6 h-full flex flex-col shadow-xl shadow-slate-200/50 ring-1 ring-slate-900/5">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">After HumanWritePro</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-[10px] font-bold text-blue-700">
                <CheckCircle2 className="h-3 w-3" />
                100% Human Score
              </span>
            </div>

            {/* Content */}
            <div className="relative flex-grow">
              <div className={`relative text-slate-200 leading-relaxed font-medium text-sm sm:text-base whitespace-pre-wrap ${!showFullText ? 'line-clamp-6' : ''}`}>
                {currentExample.after}
              </div>
              {!showFullText && currentExample.after.length > 450 && (
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent pointer-events-none" />
              )}
            </div>

            {/* Read More Button */}
            {currentExample.after.length > 450 && (
              <button
                onClick={() => setShowFullText(!showFullText)}
                className="absolute bottom-16 left-6 z-10 text-blue-600 text-xs font-semibold hover:text-blue-700 flex items-center gap-1 transition-colors bg-white/[0.03] backdrop-blur-sm px-3 py-1 rounded-full border border-blue-100 "
              >
                {showFullText ? 'Collapse text' : 'Read full text'}
                <svg className={`h-3.5 w-3.5 transition-transform duration-300 ${showFullText ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}

            {/* Footer - Quality Tag */}
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-2 text-[10px] font-bold text-blue-700">
              <Sparkles className="h-3.5 w-3.5" />
              Natural Flow & Nuance Preserved
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

interface UnifiedHomePageProps {
  initialHeadline?: React.ReactNode;
  initialSubheadline?: string;
}

export default function UnifiedHomePage({
  initialHeadline,
  initialSubheadline,
}: UnifiedHomePageProps = {}) {
  const { isSignedIn, user } = useUser();
  const router = useRouter();

  // State
  const [originalText, setOriginalText] = useState("");
  const [humanizedText, setHumanizedText] = useState("");
  const [preset, setPreset] = useState("default");
  const [isHumanizing, setIsHumanizing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentCredits, setCurrentCredits] = useState<number | undefined>(undefined);
  const [subscriptionPlan, setSubscriptionPlan] = useState<string | null>(null);
  const [isTeamMember, setIsTeamMember] = useState(false);
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [faqOpen, setFaqOpen] = useState<string | null>(null);
  const [currentAiScore, setCurrentAiScore] = useState<number | null>(null);
  const [isMac, setIsMac] = useState(false);
  const [liveUserCount, setLiveUserCount] = useState<number | null>(null);

  // Process Animation State
  const [activeProcess, setActiveProcess] = useState(HUMANIZING_PROCESSES[0]);
  const processTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [showReferralPopup, setShowReferralPopup] = useState(false);

  // First Login Pricing Modal State
  const [showFirstLoginModal, setShowFirstLoginModal] = useState(false);
  const [modalVariant, setModalVariant] = useState<'welcome' | 'out-of-credits' | 'celebration'>('welcome');

  const activeFqs = FAQ_ITEMS;

  // --- Event Replay Registration ---
  const { registerModalOpener, unregisterModalOpener } = useEventReplay();

  useEffect(() => {
    registerModalOpener('Auth', () => setShowSignInPrompt(true));
    registerModalOpener('Pricing', () => setShowFirstLoginModal(true));

    return () => {
      unregisterModalOpener('Auth');
      unregisterModalOpener('Pricing');
    };
  }, [registerModalOpener, unregisterModalOpener]);

  // --- Effects & Logic ---

  // Initialize PDF.js worker
  useEffect(() => {
    const initPdfWorker = async () => {
      if (typeof window !== 'undefined') {
        try {
          const pdfjsLib = await import('pdfjs-dist');
          if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
            // Use https and .mjs for v5+ compatibility
            pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
          }
        } catch (e) {
          console.error("Failed to init PDF worker", e);
        }
      }
    };
    initPdfWorker();
  }, []);

  useEffect(() => {
    if (!isHumanizing) return;
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % HUMANIZING_PROCESSES.length;
      setActiveProcess(HUMANIZING_PROCESSES[index]);
    }, 1800);
    return () => clearInterval(interval);
  }, [isHumanizing]);

  useEffect(() => {
    // Fetch initial backend-grounded count
    const fetchUserCount = async () => {
      try {
        const data = await mockGetUserCount();
        if (data.count) setLiveUserCount(data.count);
      } catch (e) {
        console.error("Failed to fetch user count", e);
      }
    };

    fetchUserCount();

    fetchUserCount();

    // Simulate live activity with random intervals and increments
    let timeoutId: NodeJS.Timeout;

    const scheduleNextUpdate = () => {
      // Update between 2-10 seconds
      const delay = Math.floor(Math.random() * (10000 - 2000 + 1)) + 2000;
      timeoutId = setTimeout(() => {
        // At avg 6s interval, adding 1 user every ~1.8 intervals
        // yields ~7,500 users/day (the requested 5k-10k range).
        if (Math.random() > 0.45) { // ~55% chance to increment
          setLiveUserCount(prev => prev !== null ? prev + 1 : null);
        }
        scheduleNextUpdate();
      }, delay);
    };

    scheduleNextUpdate();

    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMac(navigator.platform.toUpperCase().includes('MAC'));
    }
  }, []);

  // Check for first login to show pricing modal
  useEffect(() => {
    if (isSignedIn && user?.id) {
      // Check if we've already shown the welcome pricing for this user session/device
      // We use a specific key that can be versioned if needed (e.g., 'v1')
      const hasSeenKey = `human_write_pro_has_seen_welcome_pricing_${user.id}`;
      const hasSeen = localStorage.getItem(hasSeenKey);

      if (!hasSeen) {
        // Tiny delay to ensure smooth loading transition
        const timer = setTimeout(() => {
          setShowFirstLoginModal(true);
          localStorage.setItem(hasSeenKey, 'true');
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [isSignedIn, user?.id]);

  const fetchCredits = useCallback(async () => {
    try {
      const data = await mockGetCredits();
      const totalCredits = (data.credits || 0) + (data.extraCredits || 0);
      setCurrentCredits(totalCredits);
      setSubscriptionPlan(data.subscriptionPlan || null);
      setIsTeamMember(data.isTeamMember || false);

      if (user?.id) {
        localStorage.setItem(`credits_${user.id}`, JSON.stringify({
          credits: totalCredits,
          subscriptionPlan: data.subscriptionPlan,
          isTeamMember: data.isTeamMember,
          timestamp: Date.now()
        }));
      }
    } catch (error) {
      console.error("Failed to fetch credits:", error);
    }
  }, [user?.id]);

  useEffect(() => {
    if (isSignedIn && user?.id) {
      const cached = localStorage.getItem(`credits_${user.id}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        setCurrentCredits((prev) => prev === undefined ? parsed.credits : prev);
        setSubscriptionPlan((prev) => prev === null ? parsed.subscriptionPlan : prev);
      }
      fetchCredits();

      // Restore pending text after sign-in
      const pendingText = localStorage.getItem('pendingHumanizeText');
      const pendingFileName = localStorage.getItem('pendingHumanizeFileName');
      if (pendingText) {
        setOriginalText(pendingText);
        localStorage.removeItem('pendingHumanizeText');

        if (pendingFileName) {
          setUploadedFileName(pendingFileName);
          localStorage.removeItem('pendingHumanizeFileName');
        }

        // Show success message
        toast.success("Welcome back! Your text has been restored.");
      }
    }
  }, [isSignedIn, user?.id, fetchCredits]);

  // Restore history logic
  useEffect(() => {
    const restoreData = localStorage.getItem("restoreHistory");
    if (restoreData) {
      try {
        const item = JSON.parse(restoreData);
        setOriginalText(item.originalText || "");
        setHumanizedText(item.humanizedText || "");
        setPreset(item.preset || "default");
        localStorage.removeItem("restoreHistory");
        setTimeout(() => {
          document.getElementById("tool")?.scrollIntoView({ behavior: "smooth" });
        }, 500);
      } catch (e) {
        console.error("Failed to restore history", e);
      }
    }
  }, []);

  const handleHumanize = useCallback(async () => {
    if (!originalText.trim()) return toast.error("Please enter text to humanize");
    if (!isSignedIn) {
      // Save text to localStorage before showing sign-in prompt
      localStorage.setItem('pendingHumanizeText', originalText);
      if (uploadedFileName) {
        localStorage.setItem('pendingHumanizeFileName', uploadedFileName);
      }
      return setShowSignInPrompt(true);
    }

    const wordCount = originalText.trim().split(/\s+/).filter(Boolean).length;
    if (wordCount < 50) return toast.error("Text must contain at least 50 words");

    if (currentCredits !== undefined && currentCredits < wordCount) {
      toast.error("Insufficient credits.");
      document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    setIsHumanizing(true);
    setHumanizedText("");
    setCurrentAiScore(null);

    try {
      let accumulatedText = "";
      await simulateHumanizerStream(originalText, (chunk) => {
        accumulatedText += chunk.toUpperCase().charAt(0) + chunk.slice(1); // Fake transform
        setHumanizedText(accumulatedText);
      });

      setCurrentAiScore(100);
      setIsHumanizing(false);
      toast.success(`Used 0 credits (Mock mode).`);

      const currentCount = parseInt(localStorage.getItem("human_write_pro_generation_count") || "0", 10);
      const newCount = currentCount + 1;
      localStorage.setItem("human_write_pro_generation_count", newCount.toString());

      if (newCount === 3) {
        setTimeout(() => {
          setShowReferralPopup(true);
        }, 2000);
      }

      void fetchCredits();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error humanizing text");
      setIsHumanizing(false);
    }
  }, [originalText, isSignedIn, currentCredits, preset, fetchCredits]);

  // Shortcuts & File Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && originalText && !isHumanizing) {
        e.preventDefault();
        void handleHumanize();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [originalText, isHumanizing, handleHumanize]);

  const processFile = async (file: File) => {
    const ext = file.name.toLowerCase().split('.').pop();

    if (ext === "docx") {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      setOriginalText(result.value);
      setUploadedFileName(file.name);
    } else if (ext === "txt") {
      const text = await file.text();
      setOriginalText(text);
      setUploadedFileName(file.name);
    } else if (ext === "pdf") {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfjsLib = await import('pdfjs-dist');
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(' ');
          fullText += pageText + '\n\n';
        }

        setOriginalText(fullText);
        setUploadedFileName(file.name);
      } catch (e) {
        console.error("PDF Error:", e);
        toast.error("Failed to read PDF file.");
      }
    } else {
      toast.error("Unsupported file type. Please use .docx, .pdf, or .txt");
    }
  };

  const handleDownloadTXT = () => {
    if (!humanizedText) return;
    const blob = new Blob([humanizedText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "humanized-text.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Downloaded TXT");
  };

  const handleDownloadDOCX = () => {
    if (!humanizedText) return;
    // Simple HTML-based DOCX export
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' " +
      "xmlns:w='urn:schemas-microsoft-com:office:word' " +
      "xmlns='http://www.w3.org/TR/REC-html40'>" +
      "<head><meta charset='utf-8'><title>Export HTML to Word Document with JavaScript</title></head><body>";
    const footer = "</body></html>";
    const sourceHTML = header + humanizedText.replace(/\n/g, "<br>") + footer;

    const blob = new Blob(['\ufeff', sourceHTML], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "humanized-text.doc"; // Browser handles .doc/.docx conversion
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Downloaded DOC");
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(humanizedText);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };


  const wordCount = originalText.trim().split(/\s+/).filter(Boolean).length;
  const isPro = subscriptionPlan === "pro" || subscriptionPlan === "ultra" || subscriptionPlan === "lifetime";

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-blue-500/30">
      <FirstLoginPricingModal
        isOpen={showFirstLoginModal}
        onClose={() => {
          setShowFirstLoginModal(false);
          setModalVariant('welcome'); // Reset to default
        }}
        variant={modalVariant}
      />

      <Dialog open={showSignInPrompt && !isSignedIn} onOpenChange={setShowSignInPrompt}>
        <DialogContent
          className="sm:max-w-md text-center bg-card border-brand-primary-200 shadow-2xl"
          data-analytics-modal="Auth"
        >
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold text-white">Unlock Full Access</DialogTitle>
            <DialogDescription className="text-center text-slate-400">
              Join thousands of writers using HumanWritePro.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-6 gap-4">
            <div className="rounded-full bg-blue-50 p-4 ring-8 ring-blue-50/50">
              <Sparkles className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-base text-slate-400 max-w-[280px] mx-auto leading-relaxed">
              Sign in to get <span className="font-semibold text-blue-600">500 free credits</span> and save your humanization history.
            </p>
          </div>
          <DialogFooter className="sm:justify-center w-full">
            <SignInButton mode="modal">
              <Button
                size="lg"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold shadow-xl shadow-black/50 shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                data-analytics-id="sign-in-dialog-button"
                onClick={() => {
                  // Ensure text is saved before sign-in
                  if (originalText) {
                    localStorage.setItem('pendingHumanizeText', originalText);
                    if (uploadedFileName) {
                      localStorage.setItem('pendingHumanizeFileName', uploadedFileName);
                    }
                  }
                }}
              >
                Sign In Now
              </Button>
            </SignInButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ModernNavbar currentCredits={currentCredits} isTeamMember={isTeamMember} />

      <main className="relative pt-20">
        {/* Atmospheric Background Mesh */}
        <div className="fixed inset-0 -z-20 overflow-hidden pointer-events-none">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse"></div>
          <div className="absolute top-[20%] -right-[10%] w-[30%] h-[50%] bg-blue-400/5 blur-[100px] rounded-full"></div>
          <div className="absolute bottom-[0%] left-[20%] w-[50%] h-[30%] bg-blue-800/10 blur-[150px] rounded-full"></div>
        </div>

        {/* Hero Section */}
        <section id="tool" className="relative pt-16 pb-24 sm:pt-24 sm:pb-32 overflow-hidden">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center mb-16 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-black uppercase tracking-[0.25em] mb-8">
              <Sparkles className="h-4 w-4" />
              Next-Gen AI Humanizer
            </div>
            <h1 className="text-5xl sm:text-8xl font-black tracking-tighter text-white mb-8 leading-[0.9] drop-shadow-2xl">
              Undetectable AI.<br />
              <span className="text-blue-500 drop-shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all duration-500">Human Authenticity.</span>
            </h1>
            <p className="max-w-2xl mx-auto text-xl sm:text-2xl text-slate-400 font-medium leading-relaxed">
              HumanWritePro transforms AI writing into high-quality, human-like content that bypasses every major detector.
            </p>
          </div>

          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-black/40 backdrop-blur-2xl shadow-3xl group">
              {/* Glowing gradient border effect */}
              <div className="absolute -inset-px bg-gradient-to-r from-blue-600/20 via-blue-400/10 to-blue-600/20 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

              {/* Toolbar */}
              <div className="flex flex-col border-b border-white/5 bg-white/[0.02] px-6 py-5 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Select value={preset} onValueChange={(v) => {
                    const p = PRESETS.find(x => x.value === v);
                    if (p?.isPremium && !isPro) {
                      toast.error("Upgrade to Pro to unlock this tone.");
                      document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
                      return;
                    }
                    setPreset(v);
                  }}>
                    <SelectTrigger className="w-[180px] border-white/10 bg-white/5 text-white shadow-xl focus:ring-blue-500 rounded-xl" suppressHydrationWarning>
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-blue-500" />
                        <SelectValue placeholder="Tone" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-card border-white/10" suppressHydrationWarning>
                      {PRESETS.map((p) => (
                        <SelectItem key={p.value} value={p.value} disabled={p.isPremium && !isPro} className="cursor-pointer">
                          <div className="flex items-center justify-between w-full gap-2">
                            <span>{p.label}</span>
                            {p.isPremium && !isPro && <Lock className="h-3 w-3 text-brand-text-muted" />}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* File Upload Trigger */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-brand-text-secondary hover:text-brand-text-primary hover:bg-brand-primary-50"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <UploadCloud className="h-4 w-4 mr-2" />
                    Import
                  </Button>
                  <input ref={fileInputRef} type="file" accept=".docx,.txt,.pdf" className="hidden" onChange={(e) => {
                    if (e.target.files?.[0]) processFile(e.target.files[0]);
                    e.target.value = "";
                  }} />
                </div>

                <div className="flex items-center gap-2">
                  {isSignedIn && (
                    <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 mr-2">
                      <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                      {currentCredits ?? "..."} credits
                    </div>
                  )}

                  {/* Download Buttons */}
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={!humanizedText}
                    onClick={handleDownloadTXT}
                    className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                    title="Download as TXT"
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={!humanizedText}
                    onClick={handleDownloadDOCX}
                    className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                    title="Download as DOC"
                  >
                    <Download className="h-4 w-4" />
                  </Button>

                  <div className="h-4 w-px bg-white/[0.05] mx-1"></div>

                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={!humanizedText}
                    onClick={async () => {
                      await navigator.clipboard.writeText(humanizedText);
                      toast.success("Copied to clipboard");
                    }}
                    className="text-slate-400 font-medium hover:text-blue-600 hover:bg-blue-50 gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    Copy
                  </Button>
                </div>
              </div>

              {/* Editor Grid */}
              <div className="grid gap-4 sm:gap-0 lg:grid-cols-2 lg:h-[600px] p-0 bg-transparent">

                {/* Input Side */}
                <div className="relative group bg-white/5 h-auto min-h-[350px] lg:h-full border-r border-white/5">
                  <Textarea
                    value={originalText}
                    onChange={(e) => setOriginalText(e.target.value)}
                    placeholder="Paste your AI-generated text here (Minimum 50 words)..."
                    className="absolute inset-0 h-full w-full resize-none !border-0 !bg-transparent p-6 sm:p-10 pb-16 text-lg sm:text-xl font-bold leading-relaxed !text-white placeholder:text-slate-400 !ring-0 !ring-offset-0 focus:!ring-0 focus:!ring-offset-0 focus-visible:!ring-0 focus-visible:!ring-offset-0 focus:!outline-none focus-visible:!outline-none focus:!border-0 overflow-y-auto"
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
                    }}
                  />

                  {/* Empty State with Upload Option */}
                  {!originalText && !isDragging && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-8">
                      <div className="text-center max-w-md">
                        <div className="mb-6">
                          <FileText className="h-16 w-16 mx-auto text-blue-200 mb-4" />
                          <p className="text-slate-400 text-base mb-2">Paste your text or upload a file</p>
                          <p className="text-slate-400 text-sm">Supports .pdf, .docx, and .txt</p>
                        </div>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          data-analytics-id="upload-file-button"
                          className="pointer-events-auto inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-card border-2 border-blue-200 border-dashed text-blue-700 font-semibold hover:bg-blue-50 hover:border-blue-500 transition-all duration-200  hover:shadow-xl shadow-black/50 shadow-black/50"
                        >
                          <UploadCloud className="h-5 w-5" />
                          Upload File
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Drag Overlay */}
                  {isDragging && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-blue-50/90 backdrop-blur-sm border-2 border-blue-500 border-dashed m-2 rounded-xl">
                      <div className="text-center text-blue-700">
                        <UploadCloud className="h-12 w-12 mx-auto mb-3 animate-bounce" />
                        <p className="font-bold text-lg mb-1">Drop file to import</p>
                        <p className="text-sm text-blue-600">Supports .pdf, .docx, .txt</p>
                      </div>
                    </div>
                  )}

                  {/* File Name Badge */}
                  {uploadedFileName && (
                    <div className="absolute top-4 left-4 flex items-center gap-2 bg-white/[0.03] backdrop-blur-sm px-3 py-2 rounded-lg border border-blue-200 ">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <span className="text-xs font-medium text-white">{uploadedFileName}</span>
                      <button
                        onClick={() => {
                          setUploadedFileName(null);
                          setOriginalText("");
                        }}
                        data-analytics-id="remove-file-button"
                        className="ml-1 text-slate-400 hover:text-blue-600 transition-colors"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}

                  <div className="absolute bottom-4 left-4 text-xs text-white font-medium bg-slate-800/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-700/50">
                    {wordCount} words
                  </div>
                </div>

                {/* Output Side */}
                <div className="relative bg-black/20 h-auto min-h-[350px] lg:h-full overflow-hidden">
                  <div className="absolute inset-0 w-full overflow-y-auto p-6 sm:p-10">
                    {humanizedText ? (
                      <div className="prose prose-blue max-w-none text-base sm:text-lg leading-relaxed text-white">
                        {humanizedText.split("\n\n").map((p, i) => (
                          <p key={i} className="mb-4 last:mb-0">{p}</p>
                        ))}
                      </div>
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center text-slate-400">
                        {isHumanizing ? (
                          <div className="text-center space-y-4">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto" />
                            <p className="text-sm font-medium animate-pulse text-blue-700">{activeProcess}</p>
                          </div>
                        ) : (
                          <div className="text-center opacity-60">
                            <Sparkles className="h-10 w-10 mx-auto mb-3 text-blue-300" />
                            <p>Humanized output will appear here</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Output Actions */}
                  {/* Removed bottom copy/export buttons as requested */}
                </div>
              </div>

              {/* Footer Action Bar */}
              <div className="relative border-t border-white/5 bg-white/5 px-6 py-5 sm:flex sm:items-center sm:justify-between">
                <div className="hidden sm:flex items-center gap-8">
                  <div className="flex items-center gap-2.5">
                    <div className={`h-2.5 w-2.5 rounded-full ${humanizedText ? 'bg-blue-500 shadow-[0_0_8px_rgba(37,99,235,0.6)]' : 'bg-white/10'}`}></div>
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                      {isHumanizing ? "Analyzing Patterns..." : humanizedText ? "Transformation Ready" : "System Standby"}
                    </span>
                  </div>
                  {currentAiScore !== null && (
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Human Authenticity:</span>
                      <span className="text-lg font-black text-blue-400">{currentAiScore}%</span>
                    </div>
                  )}
                </div>

                <div className="flex w-full sm:w-auto items-center justify-end gap-4">
                  <Button
                    onClick={handleHumanize}
                    data-analytics-id="humanize-button"
                    disabled={isHumanizing || !originalText.trim() || wordCount < 50}
                    className={cn(
                      "w-full sm:w-auto min-w-[160px] rounded-full bg-blue-600 text-white shadow-xl shadow-black/50 shadow-blue-600/20 transition-all hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98]",
                      isHumanizing && "cursor-not-allowed opacity-80"
                    )}
                  >
                    {isHumanizing ? (
                      <>Processing...</>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" /> Humanize Text
                        <span className="ml-2 hidden text-[10px] opacity-60 sm:inline-block border border-white/20 px-1 rounded">
                          {isMac ? '⌘' : 'Ctrl'} + ↵
                        </span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* AI Detectors Marquee Section */}
            <div className="mt-20 w-full overflow-hidden relative">
              <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10"></div>
              <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10"></div>

              <p className="text-center text-sm font-black text-slate-400 uppercase tracking-[0.3em] mb-10 animate-fade-in-up">AI Detectors We Help You Pass</p>

              <div className="flex w-max animate-marquee whitespace-nowrap gap-16 py-4">
                {[...DETECTOR_BADGES, ...DETECTOR_BADGES].map((badge, idx) => (
                  <div key={`${badge.name}-${idx}`} className="flex items-center gap-3 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-default">
                    <Image src={badge.logoSrc} alt={badge.name} width={32} height={32} className="object-contain" />
                    <span className="text-lg font-bold text-white tracking-tight">{badge.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-32 bg-background border-t border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-600/5 to-transparent opacity-30"></div>
          <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
            {/* Proven Results Header */}
            <div className="flex flex-col items-center text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-[0.2em] mb-6">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                PROVEN RESULTS
              </div>
              <h2 className="text-4xl sm:text-6xl font-black tracking-tighter text-white mb-6 max-w-4xl leading-[1.1]">
                See the <span className="text-blue-500 drop-shadow-[0_0_15px_rgba(37,99,235,0.3)]">Scientific Difference</span>
              </h2>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium">
                Our proprietary algorithms restructure AI patterns into authentic human narratives.
              </p>
            </div>

            <ProvenResultsComparison />

            {/* Bottom CTA */}
            <div className="text-center mt-8">
              <button
                onClick={() => document.getElementById('tool')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-blue-600 text-white font-bold shadow-xl shadow-black/50 hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <Sparkles className="h-5 w-5" />
                Try It Yourself
              </button>
            </div>
          </div>
        </section>


        {/* Pricing Section */}
        <section id="pricing" className="py-40 bg-background relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="flex flex-col items-center text-center mb-20 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-500/10 border border-slate-500/20 text-slate-400 text-xs font-black uppercase tracking-[0.2em] mb-8">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                SIMPLE PRICING
              </div>
              <h2 className="text-4xl sm:text-6xl font-black tracking-tighter text-white mb-8 max-w-4xl">
                Professional Tools, <span className="text-blue-500 italic">Transparent</span> Cost
              </h2>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium">
                Premium AI humanization for creators, students, and professionals.
              </p>
            </div>
            <PolarPricing isTeamMember={isTeamMember} subscriptionPlan={subscriptionPlan} />
            {subscriptionPlan && <TopUpSection />}
          </div>
        </section>

        <FactsSection />

        {/* Testimonials */}
        <section className="py-32 bg-background relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:32px_32px]"></div>
          <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
            <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-20 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-[0.2em] mb-8">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                GLOBAL RECOGNITION
              </div>
              <h2 className="text-4xl sm:text-6xl font-black tracking-tighter text-white mb-8">
                Trusted by <span className="text-blue-500 italic">1.3M+ Specialists</span>
              </h2>
              <p className="text-xl text-slate-400 leading-relaxed font-medium">
                The gold standard for undetectable AI content transformation.
              </p>
            </div>

            {/* Testimonials Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  name: "Jessica M.",
                  role: "Postgraduate Student",
                  content: "The structural authenticity HumanWritePro provides is unmatched. It doesn't just swap words; it rebuilds the narrative flow to sound genuinely human.",
                  accent: "bg-blue-500"
                },
                {
                  name: "Dr. James Chen",
                  role: "Senior Researcher",
                  content: "Maintaining semantic integrity while passing detection is a complex challenge. HumanWritePro handles this with an impressive level of technical nuance.",
                  accent: "bg-blue-400"
                },
                {
                  name: "Emma R.",
                  role: "Content Strategist",
                  content: "As a professional, I needed a tool that respects my tone. HumanWritePro offers a range of presets that actually sound like real people, not algorithms.",
                  accent: "bg-slate-400"
                }
              ].map((testimonial, idx) => (
                <div
                  key={idx}
                  className="group relative flex flex-col p-8 rounded-2xl bg-card border border-white/5  transition-all duration-300 hover:border-brand-primary-200/50 hover:shadow-xl shadow-black/50 shadow-black/50"
                >
                  <div className="flex items-center gap-1 mb-6">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="h-4 w-4 fill-blue-500 text-blue-500" />
                    ))}
                  </div>

                  <blockquote className="flex-grow mb-8 text-[15px] leading-relaxed text-slate-400 italic">
                    "{testimonial.content}"
                  </blockquote>

                  <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white text-sm">{testimonial.name}</p>
                      <p className="text-xs text-slate-400 font-medium">{testimonial.role}</p>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/[0.02] border border-white/5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <div className={`h-1.5 w-1.5 rounded-full ${testimonial.accent}`} />
                      Verified User
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-40 bg-background relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px]" />
            <div className="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] bg-blue-800/5 rounded-full blur-[120px]" />
          </div>

          <div className="mx-auto max-w-4xl px-6 relative z-10">
            {/* Header */}
            <div className="flex flex-col items-center text-center mb-20 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-[0.2em] mb-8">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 pulse-glow"></span>
                KNOWLEDGE BASE
              </div>
              <h2 className="text-4xl sm:text-6xl font-black tracking-tighter text-white mb-8">
                Questions? <span className="text-blue-500 italic">Clarified.</span>
              </h2>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium">
                Everything you need to know about professional AI humanization.
              </p>
            </div>

            {/* FAQ Items */}
            <div className="space-y-4">
              {activeFqs.map((item, index) => (
                <div
                  key={item.id}
                  className="group relative"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Hover glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-100/0 via-blue-100/50 to-slate-100/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />

                  <div className="relative rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group-hover:border-blue-500/30 group-hover:bg-white/[0.04]">
                    {/* Accent bar */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-600 to-blue-400 transform scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-top" />

                    <button
                      onClick={() => setFaqOpen(faqOpen === item.id ? null : item.id)}
                      className="flex w-full items-center justify-between p-6 text-left group/button"
                    >
                      <div className="flex items-start gap-4 flex-1">
                        {/* Icon */}
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-slate-100 flex items-center justify-center group-hover:from-blue-200 group-hover:to-slate-200 transition-all duration-300">
                            <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        </div>

                        {/* Question */}
                        <span className="font-black text-xl text-white group-hover/button:text-blue-400 transition-colors pr-4 tracking-tight">
                          {item.question}
                        </span>
                      </div>

                      {/* Chevron */}
                      <div className="flex-shrink-0">
                        <div className={`w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center transition-all duration-300 ${faqOpen === item.id ? 'rotate-180 bg-blue-100' : 'group-hover:bg-blue-100'}`}>
                          <ChevronDown className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                    </button>

                    {/* Answer */}
                    <div className={`transition-all duration-300 ease-in-out ${faqOpen === item.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
                      <div className="px-6 pb-6 pl-20">
                        <div className="pt-2 pb-4 border-t border-white/5">
                          <p className="text-slate-400 leading-relaxed text-lg font-medium">
                            {item.answer}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom CTA */}
            <div className="mt-20 text-center">
              <div className="inline-flex flex-col items-center gap-6 p-12 rounded-[2.5rem] bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/10 shadow-3xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center shadow-xl shadow-black/50 shadow-blue-500/20 relative z-10 transition-transform duration-500 group-hover:scale-110">
                  <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div className="relative z-10">
                  <h3 className="text-2xl font-black text-white mb-3">
                    Still have questions?
                  </h3>
                  <p className="text-slate-400 mb-8 font-medium">
                    Our team of AI engineers is here to help you succeed.
                  </p>
                  <button
                    onClick={() => router.push('/contact')}
                    className="inline-flex items-center gap-3 px-10 py-4 rounded-full bg-blue-600 text-white font-black shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all duration-300 hover:scale-105 hover:shadow-blue-600/40"
                  >
                    Contact Expert Support
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>


      </main>
      <SiteFooter />
      <ReferralPopup isOpen={showReferralPopup} onClose={() => setShowReferralPopup(false)} />
    </div>
  );
}
