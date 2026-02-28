import { type NextRequest, NextResponse } from "next/server";
import { validateEvent } from "@polar-sh/sdk/webhooks";
import { db } from "~/server/db";
import { env } from "~/env";

export const dynamic = "force-dynamic";

type PolarWebhookPayload = {
  type: string;
  data: {
    id: string;
    created_at: string;
    modified_at: string | null;
    subscription_id?: string;
    product: {
      id: string;
      name: string;
      created_at: string;
      modified_at: string | null;
    };
    product_price: {
      id: string;
      created_at: string;
      modified_at: string | null;
      type: string;
      price_amount: number;
      price_currency: string;
    };
    customer: {
      id: string;
      email: string;
      name: string | null;
      created_at: string;
    };
    customer_metadata?: {
      clerkId?: string;
    };
    metadata?: {
      clerkId?: string;
    };
  };
};

function getPlanConfig(productId: string): { credits: number; plan: string; maxWords: number; type: string; isTopUp?: boolean } | null {
  // Credits now represent word count (1 credit = 1 word)
  // All plans get monthly word credits, reset monthly for annual plans
  if (productId === env.POLAR_PRODUCT_SMALL || productId === env.POLAR_PRODUCT_YEARLY_SMALL) {
    return { credits: 5000, plan: 'basic', maxWords: 600, type: productId === env.POLAR_PRODUCT_SMALL ? 'monthly' : 'annual' };
  }
  if (productId === env.POLAR_PRODUCT_MEDIUM || productId === env.POLAR_PRODUCT_YEARLY_MEDIUM) {
    return { credits: 20000, plan: 'pro', maxWords: 2000, type: productId === env.POLAR_PRODUCT_MEDIUM ? 'monthly' : 'annual' };
  }
  if (productId === env.POLAR_PRODUCT_LARGE || productId === env.POLAR_PRODUCT_YEARLY_LARGE) {
    return { credits: 45000, plan: 'ultra', maxWords: 3000, type: productId === env.POLAR_PRODUCT_LARGE ? 'monthly' : 'annual' };
  }

  // Lifetime Deal
  if (productId === env.POLAR_PRODUCT_LIFETIME) {
    return { credits: 20000, plan: 'lifetime', maxWords: 2000, type: 'lifetime', isTopUp: false };
  }

  // Top-up packs (One-time purchases)
  if (productId === env.POLAR_CREDITS_5000) {
    return { credits: 5000, plan: 'topup', maxWords: 0, type: 'one_time', isTopUp: true };
  }
  if (productId === env.POLAR_CREDITS_20000) {
    return { credits: 20000, plan: 'topup', maxWords: 0, type: 'one_time', isTopUp: true };
  }
  if (productId === env.POLAR_CREDITS_45000) {
    return { credits: 45000, plan: 'topup', maxWords: 0, type: 'one_time', isTopUp: true };
  }

  return null;
}

function getNextResetDate(type: string): Date {
  const now = new Date();
  const nextMonth = new Date(now);
  nextMonth.setMonth(now.getMonth() + 1);
  nextMonth.setDate(1);
  nextMonth.setHours(0, 0, 0, 0);
  return nextMonth;
}

export async function POST(req: NextRequest) {
  console.log("[Polar Webhook] Received webhook");

  try {
    const body = await req.text();
    const webhookSecret = env.POLAR_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("[Polar Webhook] POLAR_WEBHOOK_SECRET not configured");
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    const payload = JSON.parse(body) as PolarWebhookPayload;
    
    // Validate webhook signature
    const headers: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      headers[key] = value;
    });
    const isValid = validateEvent(body, headers, webhookSecret);
    
    if (!isValid) {
      console.error("[Polar Webhook] Invalid webhook signature");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    console.log("[Polar Webhook] Event type:", payload.type);

    // Handle successful payment completion events only
    if (payload.type === "checkout.completed" || payload.type === "order.created" || payload.type === "subscription.created") {
      const { data } = payload;
      
      // Safely extract productId and customerId from different event payloads
      // checkout.completed: product_id, customer_id
      // subscription.created: product.id, customer.id
      // order.created: product_id, customer_id
      const productId = (data as any).product_id || (data as any).product?.id;
      const customerId = (data as any).customer_id || (data as any).customer?.id;
      const subscriptionId = (data as any).subscription_id || (data as any).id; // For subscription events, id is subscription_id

      console.log(`[Polar Webhook] Processing product ID: ${productId}`);
      console.log(`[Polar Webhook] Configured Lifetime ID: ${env.POLAR_PRODUCT_LIFETIME}`);

      if (!productId) {
         console.error("[Polar Webhook] Could not find product ID in payload data:", Object.keys(data));
         return NextResponse.json({ error: "Missing product ID" }, { status: 400 });
      }

      const planConfig = getPlanConfig(productId);

      if (!planConfig) {
        console.error("[Polar Webhook] Unknown product ID:", productId);
        console.error("[Polar Webhook] Available products:", {
            small: env.POLAR_PRODUCT_SMALL,
            medium: env.POLAR_PRODUCT_MEDIUM,
            large: env.POLAR_PRODUCT_LARGE,
            lifetime: env.POLAR_PRODUCT_LIFETIME,
            topup5k: env.POLAR_CREDITS_5000,
            topup20k: env.POLAR_CREDITS_20000,
            topup45k: env.POLAR_CREDITS_45000
        });
        return NextResponse.json(
          { error: "Unknown product" },
          { status: 400 }
        );
      }

      // Get clerkId from metadata
      // Check multiple possible locations for metadata depending on event type
      const clerkId = 
        data.customer_metadata?.clerkId || 
        data.metadata?.clerkId || 
        (data as any).checkout?.metadata?.clerkId ||
        (data as any).order?.metadata?.clerkId;

      if (!clerkId) {
        console.error("[Polar Webhook] No clerkId in metadata. Data keys:", Object.keys(data));
        return NextResponse.json(
          { error: "No clerkId in metadata" },
          { status: 400 }
        );
      }

      console.log("[Polar Webhook] Processing purchase:", {
        clerkId,
        polarCustomerId: customerId,
        polarSubscriptionId: subscriptionId,
        productId,
        plan: planConfig.plan,
        credits: planConfig.credits,
        type: planConfig.type,
        isTopUp: planConfig.isTopUp,
      });

      // Update user credits and plan info
      try {
        if (planConfig.isTopUp) {
          // For top-ups: INCREMENT extraCredits, do NOT change subscription plan
          const user = await db.user.update({
            where: { clerkId },
            data: {
              extraCredits: { increment: planConfig.credits }, // Add to PERMANENT balance
              polarCustomerId: customerId,
            },
          });
          
          console.log("[Polar Webhook] Top-up successful:", {
            userId: user.id,
            addedExtraCredits: planConfig.credits,
            newExtraBalance: user.extraCredits,
          });
        } else {
          // For subscriptions: SET credits (replace old value) and update plan
          // Set next reset date for annual AND lifetime plans (both need monthly resets)
          const shouldSetResetDate = planConfig.type === 'annual' || planConfig.type === 'lifetime';
          const nextReset = shouldSetResetDate ? getNextResetDate(planConfig.type) : null;
          
          const user = await db.user.update({
            where: { clerkId },
            data: {
              credits: planConfig.credits, // SET credits, replacing old value
              subscriptionPlan: planConfig.plan,
              subscriptionType: planConfig.type,
              productId: productId,
              polarCustomerId: customerId, // Store Polar customer ID for usage tracking
              polarSubscriptionId: subscriptionId || null, // Store subscription ID (or null for one-time)
              maxWordsPerRequest: planConfig.maxWords,
              nextResetDate: nextReset,
            },
          });

          console.log("[Polar Webhook] Subscription updated successfully:", {
            userId: user.id,
            newBalance: user.credits,
            plan: user.subscriptionPlan,
            type: user.subscriptionType,
            nextReset: user.nextResetDate,
          });
        }

        return NextResponse.json({
          success: true,
          message: "Credits updated successfully",
        });
      } catch (error) {
        console.error("[Polar Webhook] Database error:", error);
        return NextResponse.json(
          { error: "Failed to update user credits" },
          { status: 500 }
        );
      }
    }

    // Acknowledge other events
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Polar Webhook] Error processing webhook:", error);
    return NextResponse.json(
      { 
        error: "Webhook processing failed",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
