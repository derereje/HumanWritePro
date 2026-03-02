"use client";

import { useState } from "react";
import { SignInButton, SignUpButton, UserButton, useUser } from "~/lib/mockClerk";
import { Button } from "./ui/button";
import ThemeToggle from "./ThemeToggle";
import { History, Menu, X, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "~/lib/utils";

interface ModernNavbarProps {
  onHistoryClick?: () => void;
  currentCredits?: number;
  isTeamMember?: boolean;
}

export default function ModernNavbar({
  onHistoryClick,
  currentCredits,
  isTeamMember = false,
}: ModernNavbarProps) {
  const { isSignedIn } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/pricing", label: "Pricing" },
    { href: "/faq", label: "FAQ" },
    { href: "/contact", label: "Contact" },
  ];

  const allNavLinks = isSignedIn
    ? [
      ...navLinks.slice(0, 2),
      { href: "/account", label: "Account" },
      ...navLinks.slice(2),
    ]
    : navLinks;

  const isActive = (href: string) => pathname === href;

  return (
    <div className="fixed top-2 sm:top-4 left-0 right-0 z-50 px-2 sm:px-4">
      <nav className={cn(
        "mx-auto max-w-7xl backdrop-blur-md shadow-2xl transition-all",
        mobileMenuOpen ? "rounded-2xl" : "rounded-full",
        "bg-white/50 dark:bg-black/40",
        "border border-gray-300/30 dark:border-white/10"
      )}>
        <div className="flex h-12 sm:h-14 items-center justify-between px-3 sm:px-6">
          {/* Logo */}
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group transition-all" data-analytics-id="nav-logo">
            <div className="flex items-center justify-center ml-2 group-hover:drop-shadow-[0_0_8px_rgba(37,99,235,0.6)] transition-all">
              <Brain className="h-7 w-7 text-blue-500 group-hover:scale-110 transition-transform duration-300 animate-pulse-glow" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent group-hover:from-blue-300 group-hover:to-blue-500 transition-all duration-300">
                AcousticText
              </span>
              <span className="hidden xs:inline-block text-[8px] sm:text-[10px] font-bold text-slate-400 tracking-widest uppercase mt-0.5 opacity-80">
                Professional AI Humanizer
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:gap-1">
            {allNavLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                data-analytics-id={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                className={cn(
                  "px-3 py-1.5 text-sm font-bold rounded-full transition-all hover:scale-105",
                  isActive(item.href)
                    ? "bg-white/10 text-white shadow-inner"
                    : "text-slate-300 hover:text-white"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Desktop Right Section */}
          <div className="hidden lg:flex lg:items-center lg:gap-2">
            <ThemeToggle />
            {isSignedIn ? (
              <>
                {isTeamMember && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 text-xs font-medium text-indigo-400">
                    <Sparkles className="h-3 w-3" />
                    Team
                  </span>
                )}
                <span className="inline-flex items-center rounded-full bg-blue-500/10 border border-blue-500/20 px-3 py-1 text-sm font-medium text-blue-400">
                  {currentCredits?.toLocaleString() ?? "0"}
                </span>
                {onHistoryClick && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onHistoryClick}
                    data-analytics-id="nav-history"
                    className="gap-1.5 text-slate-600 dark:text-slate-200 hover:text-slate-800 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/5 rounded-full h-8 px-4 transition-all"
                  >
                    <History className="h-4 w-4" />
                    History
                  </Button>
                )}
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8",
                    },
                  }}
                />
              </>
            ) : (
              <>
                <SignInButton mode="modal">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white rounded-full"
                  >
                    Sign In
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button
                    size="sm"
                    className="bg-brand-primary-500 text-white hover:bg-brand-primary-600 rounded-full px-4"
                  >
                    Get Started
                  </Button>
                </SignUpButton>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full p-2 text-slate-300 hover:bg-white/5 lg:hidden transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-analytics-id="nav-mobile-menu-toggle"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-gray-300/30 dark:border-white/10 bg-white/90 dark:bg-black/90 backdrop-blur-xl rounded-b-2xl lg:hidden max-h-[80vh] overflow-y-auto">
            <div className="px-4 py-2 flex justify-end">
              <ThemeToggle />
            </div>
            <div className="px-4 py-3 space-y-1">
              {allNavLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "block px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                    isActive(item.href)
                      ? "bg-white/[0.04] text-white"
                      : "text-slate-400 hover:bg-white/[0.02] hover:text-white"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="border-t border-white/5 px-4 py-4">
              {isSignedIn ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    {isTeamMember && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 text-xs font-medium text-indigo-400">
                        <Sparkles className="h-3 w-3" />
                        Team Member
                      </span>
                    )}
                    {currentCredits !== undefined && (
                      <span className="inline-flex items-center rounded-full bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 text-sm font-medium text-blue-400">
                        {currentCredits.toLocaleString()} credits
                      </span>
                    )}
                  </div>
                  {onHistoryClick && (
                    <Button
                      variant="outline"
                      className="w-full justify-center gap-2 rounded-full"
                      onClick={() => {
                        onHistoryClick();
                        setMobileMenuOpen(false);
                      }}
                    >
                      <History className="h-4 w-4" />
                      History
                    </Button>
                  )}
                  <div className="flex justify-center pt-2">
                    <UserButton
                      appearance={{
                        elements: {
                          avatarBox: "w-10 h-10",
                        },
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <SignInButton mode="modal">
                    <Button variant="outline" className="w-full rounded-full">
                      Sign In
                    </Button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <Button className="w-full bg-blue-600 text-white hover:bg-blue-700 rounded-full">
                      Get Started
                    </Button>
                  </SignUpButton>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}
