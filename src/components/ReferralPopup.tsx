"use client";

import { useState } from "react";
import { X, Share2, Copy, Check, Sparkles, Heart } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";

interface ReferralPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ReferralPopup({ isOpen, onClose }: ReferralPopupProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = "https://acoustictext.com";
  const shareText =
    "Just discovered AcousticText - the only AI humanizer that actually works! Passed all my detector tests. Try it free 👉";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "AcousticText - AI Humanizer That Works",
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      handleCopy();
    }
  };

  const handleTwitterShare = () => {
    const tweetText = encodeURIComponent(`${shareText} ${shareUrl}`);
    window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, "_blank");
  };

  const handleLinkedInShare = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(linkedInUrl, "_blank");
  };

  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(facebookUrl, "_blank");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Popup */}
      <div className="relative w-full max-w-md animate-in zoom-in-95 fade-in duration-200">
        <div className="relative overflow-hidden rounded-2xl bg-card shadow-2xl">
          {/* Close button */}
          <button
            onClick={onClose}
            data-analytics-id="referral-popup-close"
            className="absolute right-3 top-3 z-10 rounded-full p-1.5 text-slate-400 hover:bg-white/[0.04] hover:text-slate-400 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Header with gradient */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 px-6 py-8 text-center text-white">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur">
              <Sparkles className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold">It worked! 🎉</h2>
            <p className="mt-2 text-blue-100">
              Your text is now undetectable
            </p>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            <div className="mb-6 rounded-xl bg-white/[0.02] p-4">
              <div className="flex items-start gap-3">
                <Heart className="mt-0.5 h-5 w-5 flex-shrink-0 text-rose-500" />
                <div>
                  <p className="text-sm font-medium text-white">
                    Know someone struggling with AI detectors?
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    Share AcousticText and help them out. Unlike other
                    "humanizers" that don't work, we're fine-tuned on 2M+ real
                    writing samples.
                  </p>
                </div>
              </div>
            </div>

            {/* Share buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleShare}
                data-analytics-id="referral-popup-share-native"
                className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Share2 className="h-4 w-4" />
                Share with a friend
              </Button>

              {/* Social media row */}
              <div className="grid grid-cols-4 gap-2">
                {/* X/Twitter */}
                <Button
                  variant="outline"
                  onClick={handleTwitterShare}
                  data-analytics-id="referral-popup-share-twitter"
                  className="flex-1 p-2"
                  title="Share on X"
                >
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </Button>

                {/* LinkedIn */}
                <Button
                  variant="outline"
                  onClick={handleLinkedInShare}
                  data-analytics-id="referral-popup-share-linkedin"
                  className="flex-1 p-2"
                  title="Share on LinkedIn"
                >
                  <svg
                    className="h-5 w-5 text-[#0A66C2]"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </Button>

                {/* Facebook */}
                <Button
                  variant="outline"
                  onClick={handleFacebookShare}
                  data-analytics-id="referral-popup-share-facebook"
                  className="flex-1 p-2"
                  title="Share on Facebook"
                >
                  <svg
                    className="h-5 w-5 text-[#1877F2]"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </Button>

                {/* Copy */}
                <Button
                  variant="outline"
                  onClick={handleCopy}
                  data-analytics-id="referral-popup-share-copy"
                  className="flex-1 p-2"
                  title="Copy link"
                >
                  {copied ? (
                    <Check className="h-5 w-5 text-blue-600" />
                  ) : (
                    <Copy className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>

            {/* Skip link */}
            <button
              onClick={onClose}
              data-analytics-id="referral-popup-maybe-later"
              className="mt-4 w-full text-center text-sm text-slate-400 hover:text-slate-300 transition-colors"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
