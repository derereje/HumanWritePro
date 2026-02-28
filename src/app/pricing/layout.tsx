import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing - HumanWritePro",
  description: "Choose your AI humanizer plan including Free. Affordable pricing to bypass AI detectors and transform your content naturally with HumanWritePro.",
  keywords: [
    "ai humanizer",
    "humanizer",
    "AI humanizer pricing",
    "humanizer plans",
    "text humanization pricing",
    "AI text humanizer cost",
    "humanize AI text plans",
    "AI detection bypass pricing",
    "content humanization credits",
    "subscription plans",
    "free AI humanizer"
  ],
  openGraph: {
    title: "Pricing - HumanWritePro | AI Humanizer Plans & Free Credits",
    description: "Choose your AI humanizer plan including Free. Affordable pricing to bypass AI detectors and transform content naturally.",
    url: "https://www.humanwritepro.com/pricing",
    siteName: "HumanWritePro",
    images: [
      {
        url: "/forOpengraph.png",
        width: 1200,
        height: 630,
        alt: "HumanWritePro OpenGraph Image",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing - HumanWritePro | AI Humanizer Plans & Free Credits",
    description: "Choose your free AI humanizer plan. Affordable pricing to bypass AI detectors and transform content naturally.",
    images: ["/forOpengraph.png"],
    site: "@humanwritepro",
    creator: "@humanwritepro",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://www.humanwritepro.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Pricing",
        "item": "https://www.humanwritepro.com/pricing"
      }
    ]
  };

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "HumanWritePro AI Humanizer",
    "description": "Transform AI-generated text into natural, human-like writing with flexible pricing plans.",
    "brand": {
      "@type": "Brand",
      "name": "HumanWritePro"
    },
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "USD",
      "lowPrice": "5.99",
      "highPrice": "19.99",
      "offerCount": "3",
      "availability": "https://schema.org/InStock"
    }
  };

  return (
    <>
      {children}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
    </>
  );
}
