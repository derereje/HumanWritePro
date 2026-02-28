import { NextResponse } from "next/server";
import { fetchPolarProductsFromEnv, type PolarProductSummary } from "~/lib/polar-products";

export const dynamic = "force-dynamic";

export async function GET() {
  console.log('[Polar API] Fetching products...');
  
  try {
    const products = await fetchPolarProductsFromEnv();
    console.log('[Polar API] Products fetched:', products.length);
    
    if (products.length === 0) {
      console.warn('[Polar API] No products found - check POLAR_PRODUCT_* env variables');
      return NextResponse.json({ error: "No products configured" }, { status: 404 });
    }
    
    const mapPrice = (product: PolarProductSummary | null | undefined) => {
      if (!product) return null;

      return {
        id: product.id,
        displayPrice: product.displayPrice ?? "",
        priceAmount: product.priceAmount ?? null,
        priceCurrency: product.priceCurrency ?? null,
        priceType: product.priceType ?? null,
        recurringInterval: product.recurringInterval ?? null,
      };
    };

    const payload = products.map((tier) => ({
      key: tier.key,
      name: tier.name,
      description: tier.description ?? undefined,
      uiDescription: tier.uiDescription,
      monthly: mapPrice(tier.monthly),
      yearly: mapPrice(tier.yearly),
    }));
    
    console.log('[Polar API] Returning payload:', payload);
    return NextResponse.json(payload);
  } catch (e) {
    console.error('[Polar API] Error:', e);
    return NextResponse.json({ 
      error: "Failed to load products",
      details: e instanceof Error ? e.message : String(e)
    }, { status: 500 });
  }
}


