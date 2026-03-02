import { type Metadata } from "next";
import UnifiedHomePage from "./UnifiedHomePage";

export const metadata: Metadata = {
  title: "AcousticText: Free AI Humanizer to Bypass AI Detectors",
  description: "AcousticText transforms your content into natural, undetectable writing. Bypass AI detectors effortlessly with AcousticText.",
  keywords: [
    "AI text humanizer",
    "humanize AI text",
    "AI detection bypass",
    "text paraphrasing",
    "natural writing",
    "AI content",
    "human-like text",
    "content creation",
    "writing tool",
    "AI writing assistant"
  ],
  authors: [{ name: "AcousticText" }],
  creator: "AcousticText",
  publisher: "AcousticText",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "https://www.acoustictext.com",
  },
  openGraph: {
    title: "AcousticText: Free AI Humanizer to Bypass AI Detectors",
    description: "AcousticText transforms your content into natural, undetectable writing. Bypass AI detectors effortlessly with AcousticText.",
    url: "https://www.acoustictext.com",
    siteName: "AcousticText",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AcousticText: Free AI Humanizer to Bypass AI Detectors",
    description: "AcousticText transforms your content into natural, undetectable writing. Bypass AI detectors effortlessly with AcousticText.",
    site: "@acoustictext",
    creator: "@acoustictext",
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-site-verification-code",
  },
};

export default function HomePage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Why is AcousticText different from other humanizers?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Most AI humanizers use simple word replacement. AcousticText uses advanced neural processing to genuinely transform text structure, tone, and flow - producing output that reads like authentic human writing."
        }
      },
      {
        "@type": "Question",
        "name": "Is my content secure?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Absolutely. Your text is encrypted end-to-end and never stored permanently. We don't train on your data, and you can delete your history anytime."
        }
      },
      {
        "@type": "Question",
        "name": "Which AI detectors does it bypass?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "AcousticText is verified to bypass Turnitin, GPTZero, Originality.ai, Copyleaks, ZeroGPT, QuillBot, Sapling, and Writer."
        }
      },
      {
        "@type": "Question",
        "name": "How do credits work?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "1 credit = 1 word. Free users get 500 credits. Paid plans include monthly allowances that reset automatically.",
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "AcousticText",
            "description": "AI Text Humanizer - Transform AI-generated text into natural, human-like writing that passes detection tests.",
            "url": "https://acoustictext.com",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "5.99",
              "priceCurrency": "USD",
              "priceValidUntil": "2026-12-31",
              "description": "Small pack with 3 credits"
            },
            "creator": {
              "@type": "Organization",
              "name": "AcousticText"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "ratingCount": "1000",
              "bestRating": "5",
              "worstRating": "1"
            },
            "featureList": [
              "AI Text Humanization",
              "Smart Paraphrasing",
              "AI Detection Bypass",
              "Multiple Presets",
              "Fast Processing",
              "History Tracking"
            ]
          })
        }}
      />
      <UnifiedHomePage />
    </>
  );
}
