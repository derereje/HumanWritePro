import { type Metadata } from "next";
import Link from "next/link";
import PageNavbar from "~/components/PageNavbar";
import { SiteFooter } from "~/components/SiteFooter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { CreditCard, Mail, User, Calendar, Key, Users, Settings } from "lucide-react";
import SubscriptionManagement from "~/components/SubscriptionManagement";

export const metadata: Metadata = {
  title: "Account - AcousticText | Manage Your AI Humanizer",
  description: "Manage your AcousticText account and credits. Access your professional AI humanizer and track your usage for bypassing AI detectors.",
  keywords: [
    "ai humanizer",
    "humanizer",
    "account",
    "user profile",
    "credits",
    "AI detection bypass",
    "humanize AI text",
    "AI text humanizer",
    "professional AI humanizer"
  ],
  robots: {
    index: false, // Account pages typically shouldn't be indexed
    follow: true,
  },
};

export default async function AccountPage() {
  const user = {
    id: "user_mocked",
    firstName: "Mock",
    lastName: "User",
    username: "mockuser",
    imageUrl: "https://via.placeholder.com/150",
    emailAddresses: [{ emailAddress: "mock@example.com" }],
    primaryEmailAddress: { emailAddress: "mock@example.com" },
    createdAt: Date.now(),
  };

  // Get user's information from mock
  let userCredits = 1000;
  let userExtraCredits = 250;
  let subscriptionPlan = "pro";
  let subscriptionType = "monthly";
  let nextResetDate = new Date(Date.now() + 15 * 86400000);
  let productId = "prod_mock";
  let hasApiAccess = true;
  let isTeamMember = false;

  const userEmail = user.primaryEmailAddress?.emailAddress ?? "No email";
  const userName = user.firstName && user.lastName
    ? `${user.firstName} ${user.lastName}`
    : user.username ?? "User";
  const createdAt = user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  }) : "Unknown";

  return (
    <div className="min-h-screen bg-black">
      <PageNavbar currentCredits={userCredits + userExtraCredits} isTeamMember={isTeamMember} />
      <main className="mx-auto max-w-5xl px-4 py-12 pt-24 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-white">
            Manage Your Account Settings
          </h1>
          <p className="mt-2 text-lg text-slate-400">
            Manage your AcousticText account and view your usage
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Subscription Management */}
          <SubscriptionManagement
            subscriptionPlan={subscriptionPlan}
            subscriptionType={subscriptionType}
            nextResetDate={nextResetDate}
            productId={productId}
            isTeamMember={isTeamMember}
          />

          {/* Profile Information */}
          <Card className="border-white/10 bg-card ">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Profile Information
              </CardTitle>
              <CardDescription>Your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-400">Full Name</label>
                <p className="mt-1 text-base font-semibold text-white">{userName}</p>
              </div>
              <Separator />
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-400">
                  <Mail className="h-4 w-4" />
                  Email Address
                </label>
                <p className="mt-1 text-base font-semibold text-white">{userEmail}</p>
              </div>
              <Separator />
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-400">
                  <Calendar className="h-4 w-4" />
                  Member Since
                </label>
                <p className="mt-1 text-base font-semibold text-white">{createdAt}</p>
              </div>
            </CardContent>
          </Card>

          {/* Credits & Usage */}
          <Card className="border-white/10 bg-card ">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-600" />
                Credits & Usage
              </CardTitle>
              <CardDescription>Your current credit balance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-400">Available Credits</label>
                <p className="mt-2 text-4xl font-bold text-blue-600">
                  {(userCredits + userExtraCredits).toLocaleString()}
                </p>
                <div className="mt-2 flex gap-4 text-sm text-slate-400">
                  <div>
                    <span className="font-medium text-white">Plan:</span> {userCredits.toLocaleString()}
                  </div>
                  {userExtraCredits > 0 && (
                    <div>
                      <span className="font-medium text-white">Top-up:</span> {userExtraCredits.toLocaleString()}
                    </div>
                  )}
                </div>
                <p className="mt-2 text-sm text-slate-400">
                  Credits are used to humanize your AI-generated text. Plan credits reset monthly, while top-up credits never expire.
                </p>
              </div>
              <Separator />
              <div className="rounded-lg bg-white/[0.02] p-4">
                <p className="text-sm font-medium text-white">Need more credits?</p>
                <p className="mt-1 text-sm text-slate-400">
                  Visit our pricing page to purchase more credits and continue humanizing your content.
                </p>
                <a
                  href="/pricing"
                  data-analytics-id="account-view-pricing-button"
                  className="mt-3 inline-block rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  View Pricing Plans
                </a>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <div className="mt-8">
          <Card className="border-white/10 bg-card ">
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
              <CardDescription>Access important resources and support</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <Link
                  href="/"
                  data-analytics-id="account-quick-link-humanizer"
                  className="rounded-lg border border-white/10 bg-card p-4 text-center transition hover:border-blue-500 hover:shadow-xl shadow-black/50 shadow-black/50"
                >
                  <p className="font-semibold text-white">Humanizer Tool</p>
                  <p className="mt-1 text-xs text-slate-400">Transform your text</p>
                </Link>
                <Link
                  href="/pricing"
                  data-analytics-id="account-quick-link-pricing"
                  className="rounded-lg border border-white/10 bg-card p-4 text-center transition hover:border-blue-500 hover:shadow-xl shadow-black/50 shadow-black/50"
                >
                  <p className="font-semibold text-white">Pricing</p>
                  <p className="mt-1 text-xs text-slate-400">View credit packages</p>
                </Link>
                {(isTeamMember || hasApiAccess) && (
                  <Link
                    href="/team"
                    data-analytics-id="account-quick-link-team"
                    className="rounded-lg border border-white/10 bg-card p-4 text-center transition hover:border-blue-500 hover:shadow-xl shadow-black/50 shadow-black/50"
                  >
                    <div className="flex justify-center mb-1">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <p className="font-semibold text-white">Team</p>
                    <p className="mt-1 text-xs text-slate-400">Manage team</p>
                  </Link>
                )}
                {hasApiAccess && (
                  <Link
                    href="/api-keys"
                    data-analytics-id="account-quick-link-api-keys"
                    className="rounded-lg border border-white/10 bg-card p-4 text-center transition hover:border-blue-500 hover:shadow-xl shadow-black/50 shadow-black/50"
                  >
                    <div className="flex justify-center mb-1">
                      <Key className="h-5 w-5 text-blue-600" />
                    </div>
                    <p className="font-semibold text-white">API Keys</p>
                    <p className="mt-1 text-xs text-slate-400">Manage integrations</p>
                  </Link>
                )}
                <Link
                  href="/faq"
                  data-analytics-id="account-quick-link-faq"
                  className="rounded-lg border border-white/10 bg-card p-4 text-center transition hover:border-blue-500 hover:shadow-xl shadow-black/50 shadow-black/50"
                >
                  <p className="font-semibold text-white">FAQ</p>
                  <p className="mt-1 text-xs text-slate-400">Common questions</p>
                </Link>
                <Link
                  href="/contact"
                  data-analytics-id="account-quick-link-contact"
                  className="rounded-lg border border-white/10 bg-card p-4 text-center transition hover:border-blue-500 hover:shadow-xl shadow-black/50 shadow-black/50"
                >
                  <p className="font-semibold text-white">Contact</p>
                  <p className="mt-1 text-xs text-slate-400">Get support</p>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
