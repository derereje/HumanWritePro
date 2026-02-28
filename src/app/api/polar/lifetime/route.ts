import { NextResponse } from "next/server";
import { env } from "~/env";
import { fetchPolarProduct } from "~/lib/polar-products";
import { db } from "~/server/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const productId = env.POLAR_PRODUCT_LIFETIME;
  let price = null;
  let displayPrice = null;

  if (productId) {
    const product = await fetchPolarProduct(productId);
    if (product) {
      price = product.priceAmount;
      displayPrice = product.displayPrice;
    }
  }

  // Count lifetime users
  const claimedCount = await db.user.count({
    where: {
      subscriptionPlan: "lifetime",
    },
  });

  return NextResponse.json({
    productId,
    price,
    displayPrice,
    claimedCount,
  });
}
