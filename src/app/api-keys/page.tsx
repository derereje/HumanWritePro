import { type Metadata } from "next";
// Mock: currentUser and DB replaced to avoid Clerk/DB requirement in mock mode
import PageNavbar from "~/components/PageNavbar";
import { SiteFooter } from "~/components/SiteFooter";
import ApiKeysClient from "~/components/ApiKeysClient";

export const metadata: Metadata = {
  title: "API Keys - AcousticText | AI Humanizer API",
  description: "Manage your API keys for AcousticText integration. ULTRA plan users get API access to integrate AI humanizer into their systems.",
  keywords: [
    "ai humanizer api",
    "humanizer api key",
    "API integration",
    "developer api",
    "AI text humanizer API"
  ],
  robots: {
    index: false,
    follow: true,
  },
};

export default async function ApiKeysPage() {
  // Mock: ULTRA plan access enabled for demo
  const hasApiAccess = true;

  return (
    <div className="min-h-screen bg-black">
      <PageNavbar />
      <div className="container mx-auto max-w-5xl px-4 py-8 pt-24 md:py-16 md:pt-24">
        <ApiKeysClient hasApiAccess={hasApiAccess} />
      </div>
      <SiteFooter />
    </div>
  );
}
