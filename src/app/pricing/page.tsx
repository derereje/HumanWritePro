import { type Metadata } from "next";
import PageNavbar from "~/components/PageNavbar";
import PricingPageClient from "~/components/PricingPageClient";
import { SiteFooter } from "~/components/SiteFooter";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "~/server/db";

export const metadata: Metadata = {
  title: "Pricing - HumanWritePro",
  description: "Choose your professional AI humanizer plan. Affordable pricing to bypass AI detectors and transform your content naturally with HumanWritePro.",
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
    canonical: "https://www.humanwritepro.com/pricing",
  },
  openGraph: {
    title: "Pricing - HumanWritePro | Professional AI Humanizer Plans & Credits",
    description: "Choose your professional AI humanizer plan. Affordable pricing to bypass AI detectors and transform content naturally.",
    url: "https://www.humanwritepro.com/pricing",
    siteName: "HumanWritePro",
    images: [
      {
        url: "/forOpengraph.png",
        width: 1200,
        height: 630,
        alt: "HumanWritePro Pricing",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing - HumanWritePro | Professional AI Humanizer Plans & Credits",
    description: "Choose your professional AI humanizer plan. Affordable pricing to bypass AI detectors and transform content naturally.",
    images: ["/forOpengraph.png"],
    site: "@humanwritepro",
    creator: "@humanwritepro",
  },
};

export default async function PricingPage() {
  const user = await currentUser();
  let isTeamMember = false;
  let hasSubscription = false;
  let subscriptionPlan: string | null = null;

  if (user) {
    let dbUser = await db.user.findUnique({
      where: { clerkId: user.id },
      include: {
        team: {
          include: {
            owner: true
          }
        }
      }
    });

    // Fallback: If user not found in DB (webhook delay), create on the fly
    if (!dbUser) {
      console.log("⚠️ [Pricing Page] User not found in DB, creating on the fly...");
      const email = user.emailAddresses[0]?.emailAddress || "";
      const name = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username || "User";

      const newUser = await db.user.create({
        data: {
          clerkId: user.id,
          email,
          name,
          image: user.imageUrl,
          emailVerified: user.emailAddresses[0]?.verification?.status === 'verified',
          // credits will default to 500 from schema
        }
      });

      // Refetch with relations
      dbUser = await db.user.findUnique({
        where: { id: newUser.id },
        include: {
          team: {
            include: {
              owner: true
            }
          }
        }
      });
    }

    if (dbUser) {
      // Check if user is in a team and NOT the owner
      if (dbUser.team?.owner && dbUser.team.ownerId !== dbUser.id) {
        isTeamMember = true;
      }

      // Check if user has an active subscription
      if (dbUser.subscriptionPlan) {
        hasSubscription = true;
        subscriptionPlan = dbUser.subscriptionPlan;
      }
    }
  }

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
