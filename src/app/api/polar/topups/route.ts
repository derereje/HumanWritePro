import { NextResponse } from "next/server";
import { fetchPolarTopUpsFromEnv } from "~/lib/polar-products";

export const dynamic = "force-dynamic";

export async function GET() {
  console.log('[Polar API] Fetching top-ups...');
  
  try {
    const products = await fetchPolarTopUpsFromEnv();
    console.log('[Polar API] Top-ups fetched:', products.length);
    
    if (products.length === 0) {
      return NextResponse.json({ error: "No top-ups configured" }, { status: 404 });
    }
    
    const payload = products.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description ?? undefined,
      displayPrice: product.displayPrice ?? "",
      priceAmount: product.priceAmount ?? null,
      priceCurrency: product.priceCurrency ?? null,
    }));
    
    return NextResponse.json(payload);
  } catch (e) {
    console.error('[Polar API] Error:', e);
    return NextResponse.json({ 
      error: "Failed to load top-ups",
      details: e instanceof Error ? e.message : String(e)
    }, { status: 500 });
  }
}
