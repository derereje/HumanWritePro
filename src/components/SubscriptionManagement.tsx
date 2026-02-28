"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Package, Calendar, CreditCard, ExternalLink, Loader2 } from "lucide-react";
import { Separator } from "~/components/ui/separator";
import Link from "next/link";
import { toast } from "sonner";
import { mockGetSubscriptionDetails } from "~/lib/mockApi";

interface SubscriptionDetails {
  subscriptionPlan?: string | null;
  subscriptionType?: string | null;
  nextResetDate?: string | null;
  productId?: string | null;
  billingCycle?: string;
  status?: string | null;
  cancelAtPeriodEnd?: boolean;
  currentPeriodEnd?: string | null;
  isTeamMember?: boolean;
}

interface SubscriptionManagementProps {
  subscriptionPlan?: string | null;
  subscriptionType?: string | null;
  nextResetDate?: Date | null;
  productId?: string | null;
  isTeamMember?: boolean;
}

export default function SubscriptionManagement({
  subscriptionPlan: initialPlan,
  subscriptionType: initialType,
  nextResetDate: initialResetDate,
  productId: initialProductId,
  isTeamMember: initialIsTeamMember = false
}: SubscriptionManagementProps) {
  const [isCanceling, setIsCanceling] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [details, setDetails] = useState<SubscriptionDetails>({
    subscriptionPlan: initialPlan,
    subscriptionType: initialType,
    nextResetDate: initialResetDate?.toISOString() || null,
    productId: initialProductId,
    billingCycle: "N/A",
    isTeamMember: initialIsTeamMember,
  });

  useEffect(() => {
    // Fetch subscription details from Polar
    const fetchDetails = async () => {
      try {
        const data = await mockGetSubscriptionDetails();
        setDetails(prev => ({ ...prev, ...data }));
      } catch (error) {
        console.error("Failed to fetch subscription details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, []);

  const hasActiveSubscription = !!details.subscriptionPlan;
  const planName = details.subscriptionPlan ? formatPlanName(details.subscriptionPlan) : "Free";
  const billingCycle = details.billingCycle || "N/A";
  const nextResetDate = details.nextResetDate ? new Date(details.nextResetDate) : null;

  const handleCancelSubscription = async () => {
    if (!confirm("Are you sure you want to cancel your subscription? You'll retain access until the end of your current billing period.")) {
      return;
    }

    setIsCanceling(true);
    try {
      // Mock cancellation delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Subscription canceled successfully (Mock Mode)");

      // Reload the page to reflect changes
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error("Cancellation error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to cancel subscription");
    } finally {
      setIsCanceling(false);
    }
  };

  const handleLeaveTeam = async () => {
    if (!confirm("Are you sure you want to leave this team? You will lose access to shared credits.")) {
      return;
    }

    setIsCanceling(true);
    try {
      const response = await fetch("/api/team/leave", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to leave team");
      }

      toast.success("Left team successfully");

      // Reload the page to reflect changes
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error("Leave team error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to leave team");
    } finally {
      setIsCanceling(false);
    }
  };

  return (
    <Card className="border-white/10 bg-white/[0.03] shadow-xl shadow-black/50 shadow-black/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5 text-blue-600" />
          Subscription
        </CardTitle>
        <CardDescription>Manage your subscription and billing</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        ) : hasActiveSubscription ? (
          <>
            <div>
              <label className="text-sm font-medium text-slate-400">Current Plan</label>
              <p className="mt-1 text-2xl font-bold text-blue-600">{planName}</p>
              {details.cancelAtPeriodEnd && (
                <p className="mt-1 text-sm text-amber-600">
                  Cancels at period end
                </p>
              )}
            </div>
            <Separator />
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-400">
                <CreditCard className="h-4 w-4" />
                Billing Cycle
              </label>
              <p className="mt-1 text-base font-semibold text-white">{billingCycle}</p>
            </div>
            {nextResetDate && (
              <>
                <Separator />
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-400">
                    <Calendar className="h-4 w-4" />
                    Next Renewal
                  </label>
                  <p className="mt-1 text-base font-semibold text-white">
                    {new Date(nextResetDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    })}
                  </p>
                </div>
              </>
            )}
            <Separator />
            <div className="space-y-2">
              <Link href="/pricing">
                <Button variant="outline" className="w-full" disabled={details.isTeamMember} data-analytics-id="subscription-management-change-plan">
                  {details.isTeamMember ? "Managed by Team Owner" : "Change Plan"}
                </Button>
              </Link>
              {details.isTeamMember ? (
                <Button
                  variant="outline"
                  className="w-full text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={handleLeaveTeam}
                  disabled={isCanceling}
                  data-analytics-id="subscription-management-leave-team"
                >
                  Leave Team
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="w-full text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={handleCancelSubscription}
                  disabled={isCanceling || details.cancelAtPeriodEnd}
                  data-analytics-id="subscription-management-cancel-subscription"
                >
                  {details.cancelAtPeriodEnd ? "Cancellation Scheduled" : "Cancel Subscription"}
                </Button>
              )}
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="text-sm font-medium text-slate-400">Current Plan</label>
              <p className="mt-1 text-2xl font-bold text-slate-400">Free</p>
              <p className="mt-1 text-sm text-slate-400">
                Upgrade to unlock more credits and premium features
              </p>
            </div>
            <Separator />
            <div className="rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 p-4">
              <p className="text-sm font-medium text-white">Ready to upgrade?</p>
              <p className="mt-1 text-sm text-slate-400">
                Get more credits, priority support, and API access with our premium plans.
              </p>
              <Link href="/pricing">
                <Button className="mt-3 w-full bg-blue-600 hover:bg-blue-700" data-analytics-id="subscription-management-view-premium">
                  View Premium Plans
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function formatPlanName(plan: string): string {
  // Format plan names nicely
  if (plan.toLowerCase().includes("small")) return "Starter Plan";
  if (plan.toLowerCase().includes("medium")) return "Professional Plan";
  if (plan.toLowerCase().includes("large") || plan.toLowerCase().includes("ultra")) return "ULTRA Plan";
  return plan;
}
