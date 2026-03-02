import { type Metadata } from "next";
// Mock: currentUser and DB replaced to avoid Clerk/DB requirement in mock mode
import PageNavbar from "~/components/PageNavbar";
import PricingPageClient from "~/components/PricingPageClient";
import { SiteFooter } from "~/components/SiteFooter";

export const metadata: Metadata = {
  title: "Pricing - AcousticText",
  description: "Choose your professional AI humanizer plan. Affordable pricing to bypass AI detectors and transform your content naturally with AcousticText.",
  keywords: [
    "ai humanizer pricing",
    "humanizer plans",
    "AI text humanizer cost",
    "humanize AI text pricing",
    "AI detection bypass pricing",
    "text humanization plans",
    "affordable AI humanizer"
  ],
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://www.acoustictext.com/pricing",
  },
  openGraph: {
    title: "Pricing - AcousticText | Professional AI Humanizer Plans & Credits",
    description: "Choose your professional AI humanizer plan. Affordable pricing to bypass AI detectors and transform content naturally.",
    url: "https://www.acoustictext.com/pricing",
    siteName: "AcousticText",
    images: [
      {
        url: "/forOpengraph.png",
        width: 1200,
        height: 630,
        alt: "AcousticText Pricing",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing - AcousticText | Professional AI Humanizer Plans & Credits",
    description: "Choose your professional AI humanizer plan. Affordable pricing to bypass AI detectors and transform content naturally.",
    images: ["/forOpengraph.png"],
    site: "@acoustictext",
    creator: "@acoustictext",
  },
};

export default async function PricingPage() {
  // Mock: static values replacing Clerk + DB lookups
  const isTeamMember = false;
  const hasSubscription = true;
  const subscriptionPlan: string | null = "pro";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageNavbar />
      <main className="mx-auto max-w-7xl px-4 py-12 pt-24 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in-up">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tighter text-white mb-6">
            Simple, <span className="text-blue-500">Transparent</span> Pricing
          </h1>
          <p className="mt-4 text-xl text-slate-400 max-w-xl mx-auto font-medium">
            Choose the plan that fits your needs. No hidden fees, cancel anytime.
          </p>
        </div>
        <PricingPageClient isTeamMember={isTeamMember} hasSubscription={hasSubscription} subscriptionPlan={subscriptionPlan} />
      </main>
      <SiteFooter />
    </div>
  );
}
