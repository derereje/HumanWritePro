"use client";

import { SignInButton, SignUpButton, UserButton, useUser } from "~/lib/mockClerk";
import { Button } from "./ui/button";
import { History, Menu, X, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "~/lib/utils";

interface PageNavbarProps {
  onHistoryClick?: () => void;
  currentCredits?: number;
  variant?: "home" | "page";
  isTeamMember?: boolean;
}

export default function PageNavbar({
  onHistoryClick,
  currentCredits,
  variant = "page",
  isTeamMember = false,
}: PageNavbarProps) {
  const { isSignedIn } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const baseNavLinks =
    variant === "home"
      ? [
        { href: "/#hero", label: "Home" },
        { href: "/#pricing", label: "Pricing" },
        { href: "/#faq", label: "FAQ" },
      ]
      : [
        { href: "/", label: "Home" },
        { href: "/pricing", label: "Pricing" },
        { href: "/faq", label: "FAQ" },
        { href: "/contact", label: "Contact" },
      ];

  const navLinks =
    isSignedIn && variant === "page"
      ? [
        ...baseNavLinks.slice(0, 2),
        { href: "/account", label: "Account" },
        ...baseNavLinks.slice(2),
      ]
      : baseNavLinks;

  const isActive = (href: string) =>
    variant === "page" ? pathname === href : false;

  return (
    <div className="fixed top-4 left-0 right-0 z-50 px-4">
      <nav className="mx-auto max-w-4xl bg-black/40 backdrop-blur-md border border-white/10 rounded-full shadow-2xl shadow-black/20">
        <div className="flex h-14 items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group transition-all" data-analytics-id="page-navbar-logo">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-400 shadow-xl shadow-black/50 shadow-blue-600/40 group-hover:scale-110 transition-transform duration-300 group-hover:drop-shadow-[0_0_10px_rgba(37,99,235,0.6)]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 text-white animate-pulse-glow"
              >
                <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .52 8.125A4 4 0 0 0 11.5 22a4 4 0 0 0 7.497-2.98 4 4 0 0 0 .52-8.125 4 4 0 0 0-2.526-5.77A3 3 0 1 0 12 5Z" />
                <path d="M9 13a4.5 4.5 0 0 0 3 4" />
                <path d="M15 13a4.5 4.5 0 0 1-3 4" />
                <path d="M12 5v4" />
              </svg>
            </div>
            <span className="text-xl font-black tracking-tight text-white bg-gradient-to-r from-blue-100 to-white bg-clip-text text-transparent group-hover:from-white group-hover:to-blue-100 transition-all duration-300">
              HumanWrite<span className="text-blue-500 group-hover:text-blue-400">Pro</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:gap-1">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3 py-1.5 text-sm font-bold rounded-full transition-all hover:scale-105",
                  isActive(item.href)
                    ? "bg-white/10 text-white shadow-inner"
                    : "text-slate-300 hover:text-white"
                )}
                data-analytics-id={`page-navbar-link-${item.label.toLowerCase()}`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Desktop Right Section */}
          <div className="hidden lg:flex lg:items-center lg:gap-2">
            {isSignedIn ? (
              <>
                {isTeamMember && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
                    <Sparkles className="h-3 w-3" />
                    Team
                  </span>
                )}
                {currentCredits !== undefined && (
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                    {currentCredits?.toLocaleString() ?? "0"}
                  </span>
                )}
                {onHistoryClick && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onHistoryClick}
                    className="gap-1.5 text-slate-300 hover:text-white hover:bg-white/5 rounded-full h-8 px-4 transition-all"
                    data-analytics-id="page-navbar-history-button"
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
                    className="text-slate-400 hover:text-white rounded-full"
                    data-analytics-id="page-navbar-signin"
                  >
                    Sign In
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button
                    size="sm"
                    className="bg-blue-600 text-white hover:bg-blue-700 rounded-full px-4"
                    data-analytics-id="page-navbar-get-started"
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
            className="inline-flex items-center justify-center rounded-full p-2 text-slate-400 hover:bg-white/[0.04] lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation"
            data-analytics-id="page-navbar-mobile-toggle"
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
          <div className="border-t border-white/5 bg-card rounded-b-3xl lg:hidden">
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "block px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                    isActive(item.href)
                      ? "bg-white/[0.04] text-white"
                      : "text-slate-400 hover:bg-white/[0.02] hover:text-white"
                  )}
                  data-analytics-id={`page-navbar-mobile-link-${item.label.toLowerCase()}`}
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
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700">
                        <Sparkles className="h-3 w-3" />
                        Team Member
                      </span>
                    )}
                    {currentCredits !== undefined && (
                      <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700">
                        {currentCredits?.toLocaleString() ?? "0"} credits
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
                      data-analytics-id="page-navbar-mobile-history"
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
                    <Button variant="outline" className="w-full rounded-full" data-analytics-id="page-navbar-mobile-signin">
                      Sign In
                    </Button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <Button className="w-full bg-blue-600 text-white hover:bg-blue-700 rounded-full" data-analytics-id="page-navbar-mobile-get-started">
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
