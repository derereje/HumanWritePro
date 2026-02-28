import { type NextRequest, NextResponse } from "next/server";
import { Polar } from "@polar-sh/sdk";
import { currentUser } from "@clerk/nextjs/server";
import { env } from "~/env";
import { db } from "~/server/db";

export const dynamic = "force-dynamic";

const polarClient = new Polar({
  accessToken: env.POLAR_ACCESS_TOKEN,
  server: env.POLAR_ENV,
});

export async function POST(req: NextRequest) {
  console.log("[Polar Checkout] Creating checkout session");

  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { productId } = body as { productId: string };

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    console.log("[Polar Checkout] Creating checkout for:", {
      userId: user.id,
      email: user.emailAddresses[0]?.emailAddress,
      productId,
    });

    // Check if user is a team member (and not the owner)
    const dbUser = await db.user.findUnique({
      where: { clerkId: user.id },
      include: {
        team: {
          include: {
            owner: true
          }
        }
      }
    });

    if (dbUser?.team?.owner && dbUser.team.ownerId !== dbUser.id) {
      return NextResponse.json(
        { error: "Team members cannot purchase subscriptions. Please contact your team owner." },
        { status: 403 }
      );
    }

    // Get the base URL for success/cancel redirects
    const baseUrl = req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3050";

    // Create checkout session - products should be an array of product IDs
    const checkout = await polarClient.checkouts.create({
      products: [productId],
      customerEmail: user.emailAddresses[0]?.emailAddress,
      customerName: user.fullName || undefined,
      metadata: {
        clerkId: user.id,
      },
      successUrl: `${baseUrl}/?purchase=success`,
    } as any);

    console.log("[Polar Checkout] Checkout created:", checkout.id);

    return NextResponse.json({
      checkoutUrl: checkout.url,
      checkoutId: checkout.id,
    });
  } catch (error) {
    console.error("[Polar Checkout] Error:", error);
    return NextResponse.json(
      { 
        error: "Failed to create checkout session",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
