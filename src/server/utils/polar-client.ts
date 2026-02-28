import { env } from "~/env";
import { db } from "~/server/db";

const POLAR_API_URL = "https://api.polar.sh/v1";

interface PolarSubscription {
  id: string;
  status: string;
  current_period_start: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  recurring_interval: string;
  recurring_interval_count: number;
  customer_id: string;
  product_id: string;
}

interface PolarEvent {
  name: string;
  customer_id?: string;
  external_customer_id?: string;
  timestamp?: string;
  metadata?: Record<string, any>;
}

interface PolarEventResponse {
  inserted: number;
}

interface PolarCustomer {
  id: string;
  email: string;
  name: string | null;
  external_id?: string;
}

/**
 * Create or get a customer in Polar by external ID
 * This ensures customers exist in Polar before sending usage events
 */
async function ensurePolarCustomer(
  clerkId: string,
  email: string,
  name: string
): Promise<{ success: boolean; customerId?: string; error?: string }> {
  try {
    // Try to get customer by external ID first
    const getResponse = await fetch(
      `${POLAR_API_URL}/customers/external/${encodeURIComponent(clerkId)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${env.POLAR_ACCESS_TOKEN}`,
        },
      }
    );

    if (getResponse.ok) {
      const customer = (await getResponse.json()) as PolarCustomer;
      console.log("[Polar Client] Customer already exists:", customer.id);
      return { success: true, customerId: customer.id };
    }

    // Customer doesn't exist, create it
    console.log("[Polar Client] Creating new customer in Polar");
    const createResponse = await fetch(`${POLAR_API_URL}/customers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.POLAR_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        external_id: clerkId,
        email,
        name,
      }),
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error("[Polar Client] Failed to create customer:", errorText);
      return {
        success: false,
        error: `Failed to create customer: ${createResponse.status} - ${errorText}`,
      };
    }

    const newCustomer = (await createResponse.json()) as PolarCustomer;
    console.log("[Polar Client] Customer created successfully:", newCustomer.id);
    
    // Update our database with the Polar customer ID
    await db.user.update({
      where: { clerkId },
      data: { polarCustomerId: newCustomer.id },
    });

    return { success: true, customerId: newCustomer.id };
  } catch (error) {
    console.error("[Polar Client] Error ensuring customer:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Send usage events to Polar for usage-based billing
 * This tracks customer usage so Polar can properly meter and bill
 */
export async function ingestPolarEvent(
  customerId: string,
  eventName: string,
  metadata: Record<string, any>
): Promise<{ success: boolean; error?: string }> {
  try {
    const event: PolarEvent = {
      name: eventName,
      customer_id: customerId,
      timestamp: new Date().toISOString(),
      metadata,
    };

    console.log("[Polar Client] Ingesting event:", {
      eventName,
      customerId,
      metadata,
    });

    const response = await fetch(`${POLAR_API_URL}/events/ingest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.POLAR_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({ events: [event] }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Polar Client] Failed to ingest event:", {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });
      return {
        success: false,
        error: `Polar API error: ${response.status} - ${errorText}`,
      };
    }

    const result = (await response.json()) as PolarEventResponse;
    console.log("[Polar Client] Event ingested successfully:", {
      inserted: result.inserted,
    });

    return { success: true };
  } catch (error) {
    console.error("[Polar Client] Error ingesting event:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Get subscription details from Polar
 */
export async function getPolarSubscription(
  subscriptionId: string
): Promise<{ success: boolean; subscription?: PolarSubscription; error?: string }> {
  try {
    const response = await fetch(
      `${POLAR_API_URL}/subscriptions/${subscriptionId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${env.POLAR_ACCESS_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Polar Client] Failed to get subscription:", errorText);
      return {
        success: false,
        error: `Failed to get subscription: ${response.status}`,
      };
    }

    const subscription = (await response.json()) as PolarSubscription;
    return { success: true, subscription };
  } catch (error) {
    console.error("[Polar Client] Error getting subscription:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Track word usage for a customer
 * This should be called after successful humanization
 */
export async function trackWordUsage(
  clerkId: string,
  wordCount: number,
  metadata?: Record<string, any>
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get user from database to get Polar customer ID
    const user = await db.user.findUnique({
      where: { clerkId },
      select: { polarCustomerId: true, email: true, name: true },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    let polarCustomerId = user.polarCustomerId;

    // If no Polar customer ID, create/get the customer
    if (!polarCustomerId) {
      console.log("[Polar Client] No Polar customer ID found, creating customer");
      const customerResult = await ensurePolarCustomer(
        clerkId,
        user.email,
        user.name
      );

      if (!customerResult.success || !customerResult.customerId) {
        return {
          success: false,
          error: customerResult.error || "Failed to create Polar customer",
        };
      }

      polarCustomerId = customerResult.customerId;
    }

    // Send the usage event
    return ingestPolarEvent(polarCustomerId, "word_usage", {
      word_count: wordCount,
      ...metadata,
    });
  } catch (error) {
    console.error("[Polar Client] Error tracking word usage:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
