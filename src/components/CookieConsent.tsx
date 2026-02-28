"use client";

import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Cookie, X, Settings } from "lucide-react";
import Link from "next/link";

const COOKIE_CONSENT_KEY = "human-write-pro-cookie-consent";

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true, // Always true, can't be disabled
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Show banner after a short delay
      setTimeout(() => setShowBanner(true), 1000);
    } else {
      // Load saved preferences
      try {
        const saved = JSON.parse(consent);
        setPreferences(saved);
      } catch (e) {
        console.error("Error parsing cookie consent:", e);
      }
    }
  }, []);

  const savePreferences = (prefs: typeof preferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(prefs));
    setPreferences(prefs);
    setShowBanner(false);
    setShowSettings(false);
  };

  const acceptAll = () => {
    savePreferences({
      necessary: true,
      analytics: true,
      marketing: true,
    });
  };

  const acceptNecessary = () => {
    savePreferences({
      necessary: true,
      analytics: false,
      marketing: false,
    });
  };

  const saveCustom = () => {
    savePreferences(preferences);
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Cookie Consent Banner */}
      <div className="fixed bottom-4 right-4 z-50 w-fit max-w-sm p-4 text-sm">
        <Card className="mx-auto max-w-4xl border-white/10 bg-white/95 shadow-2xl backdrop-blur-lg">
          <div className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <Cookie className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    We value your privacy
                  </h3>
                  <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                    We use cookies to enhance your experience, analyze site traffic, and personalize content.
                    By clicking "Accept All", you consent to our use of cookies. You can customize your preferences
                    or learn more in our{" "}
                    <Link href="/privacy" className="text-blue-600 hover:underline" data-analytics-id="cookie-consent-privacy-link">
                      Privacy Policy
                    </Link>
                    .
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowBanner(false)}
                className="text-slate-400 hover:text-slate-400 transition"
                aria-label="Close"
                data-analytics-id="cookie-consent-close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {!showSettings ? (
              // Buttons section - vertically stacked
              <div className="mt-6 flex flex-col gap-3">
                <Button
                  onClick={acceptAll}
                  className="bg-blue-600 hover:bg-blue-700 w-full"
                  data-analytics-id="cookie-consent-accept-all"
                >
                  Accept All
                </Button>
                <Button
                  onClick={acceptNecessary}
                  variant="outline"
                  className="w-full"
                  data-analytics-id="cookie-consent-necessary-only"
                >
                  Necessary Only
                </Button>
                <Button
                  onClick={() => setShowSettings(true)}
                  variant="ghost"
                  className="gap-2 w-full"
                  data-analytics-id="cookie-consent-customize"
                >
                  <Settings className="h-4 w-4" />
                  Customize
                </Button>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] cursor-not-allowed">
                    <input
                      type="checkbox"
                      checked={true}
                      disabled
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-white">Necessary Cookies</p>
                      <p className="text-sm text-slate-400">
                        Required for the website to function properly. Cannot be disabled.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/[0.02] cursor-pointer transition">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) =>
                        setPreferences({ ...preferences, analytics: e.target.checked })
                      }
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-white">Analytics Cookies</p>
                      <p className="text-sm text-slate-400">
                        Help us understand how visitors interact with our website.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/[0.02] cursor-pointer transition">
                    <input
                      type="checkbox"
                      checked={preferences.marketing}
                      onChange={(e) =>
                        setPreferences({ ...preferences, marketing: e.target.checked })
                      }
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-white">Marketing Cookies</p>
                      <p className="text-sm text-slate-400">
                        Used to track visitors across websites for marketing purposes.
                      </p>
                    </div>
                  </label>
                </div>

                <div className="flex flex-col gap-3">
                  <Button
                    onClick={saveCustom}
                    className="bg-blue-600 hover:bg-blue-700 w-full"
                    data-analytics-id="cookie-consent-save-preferences"
                  >
                    Save Preferences
                  </Button>
                  <Button
                    onClick={() => setShowSettings(false)}
                    variant="outline"
                    className="w-full"
                    data-analytics-id="cookie-consent-back"
                  >
                    Back
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

    </>
  );
}
