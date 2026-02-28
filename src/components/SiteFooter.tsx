import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Zap, AlertCircle } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/5 bg-background text-slate-400">
      {/* Legal Disclaimer */}
      <div className="border-b border-white/5 bg-blue-600/5">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-6 w-6 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-slate-400 leading-relaxed font-medium">
                <strong className="text-blue-400 font-black">HumanWritePro is not a tool for academic dishonesty or cheating.</strong>{" "}
                We encourage responsible use that enhances your work while respecting academic integrity and professional standards.
              </p>
            </div>
            <Link
              href="/responsible-use"
              data-analytics-id="footer-banner-responsible-use"
              className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors whitespace-nowrap underline decoration-blue-200 hover:decoration-blue-400 underline-offset-4"
            >
              Read more →
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:py-14 lg:px-8">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between items-center lg:items-start text-center lg:text-left">
          <div className="max-w-sm space-y-6">
            <Link href="/" className="flex items-center gap-3 group" data-analytics-id="footer-logo">
              <span className="text-2xl font-black tracking-tighter bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent group-hover:from-blue-300 group-hover:to-blue-500 transition-all duration-300">HumanWritePro</span>
            </Link>
            <p className="text-sm text-slate-400 max-w-md mx-auto lg:mx-0 font-medium">
              HumanWritePro is the gold standard for undetectable AI content transformation, powered by proprietary human-fidelity algorithms.
            </p>
          </div>

          <div className="grid flex-1 gap-8 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 w-full sm:w-auto">
            <div>
              <h5 className="text-xs font-black uppercase tracking-[0.2em] text-white/40">Navigate</h5>
              <ul className="mt-4 space-y-3 text-sm text-slate-400">
                <li>
                  <Link href="/" className="flex items-center gap-2 transition hover:text-blue-600" data-analytics-id="footer-nav-home">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/" className="flex items-center gap-2 transition hover:text-blue-600" data-analytics-id="footer-nav-start-humanizing">
                    Start humanizing
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="flex items-center gap-2 transition hover:text-blue-600" data-analytics-id="footer-nav-pricing">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="flex items-center gap-2 transition hover:text-blue-600" data-analytics-id="footer-nav-faq">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="text-xs font-black uppercase tracking-[0.2em] text-white/40">Resources</h5>
              <ul className="mt-4 space-y-3 text-sm text-slate-400">
                <li>
                  <Link href="/responsible-use" className="flex items-center gap-2 transition hover:text-blue-600" data-analytics-id="footer-resource-responsible-use">
                    Responsible Use
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="flex items-center gap-2 transition hover:text-blue-600" data-analytics-id="footer-resource-privacy">
                    Privacy policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="flex items-center gap-2 transition hover:text-blue-600" data-analytics-id="footer-resource-terms">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="text-xs font-black uppercase tracking-[0.2em] text-white/40">Stay in touch</h5>
              <ul className="mt-4 space-y-3 text-sm text-slate-400">
                <li>
                  <Link href="/contact" className="flex items-center gap-2 transition hover:text-white" data-analytics-id="footer-contact-us">
                    Contact us
                  </Link>
                </li>
                <li>
                  <a href="mailto:kirubelman3@gmail.com" className="flex items-center gap-2 transition hover:text-white font-bold text-blue-500" data-analytics-id="footer-contact-email">
                    kirubelman3@gmail.com
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/5 pt-8 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between font-medium">
          <p>© {new Date().getFullYear()} HumanWritePro. Premium AI Humanization.</p>
          <p className="text-xs opacity-60">Engineered with Excellence.</p>
        </div>
      </div>
    </footer>
  );
}

