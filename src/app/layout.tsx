import "~/styles/globals.css";

import { type Metadata } from "next";
import { Toaster } from "sonner";
import { ClerkProvider } from "~/lib/mockClerk";
import { Inter } from "next/font/google"; // Using Inter for a professional SaaS feel
import CookieConsent from "~/components/CookieConsent";
import { AnalyticsProvider } from "~/components/AnalyticsProvider";
import { EventReplayProvider } from "~/components/EventReplayContext";
import EventHighlighter from "~/components/EventHighlighter";
import SocialProofToasts from "~/components/SocialProofToasts";
import { SHOW_SOCIAL_PROOF } from "~/config";
import { ThemeProvider } from "next-themes";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.acoustictext.com'),
  title: "AcousticText: Advanced AI Humanizer to Bypass AI Detectors",
  description: "AcousticText transforms your content into natural, undetectable writing. Bypass AI detectors effortlessly with AcousticText.",
  keywords: [
    "ai humanizer",
    "humanize AI text",
    "humanizer",
    "AI text humanizer",
    "AI detection bypass",
    "AI content humanizer",
    "GPT detector bypass",
    "make AI text human",
    "undetectable AI content",
    "AI writing humanizer"
  ],
  authors: [{ name: "AcousticText" }],
  creator: "AcousticText",
  publisher: "AcousticText",
  alternates: {
    canonical: "https://www.acoustictext.com",
    languages: {
      'en-US': 'https://www.acoustictext.com',
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.acoustictext.com",
    siteName: "AcousticText",
    title: "AcousticText: Advanced AI Humanizer to Bypass AI Detectors",
    description: "Advanced AI humanizer transforms your content into natural, undetectable writing. Bypass AI detectors effortlessly.",
    images: [
      {
        url: "/forOpenGraph.png",
        width: 1200,
        height: 630,
        alt: "AcousticText - AI Text Humanizer"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "AcousticText: Advanced AI Humanizer to Bypass AI Detectors",
    description: "Advanced AI humanizer transforms your content into natural, undetectable writing. Bypass AI detectors effortlessly.",
    images: ["/forOpenGraph.png"],
    site: "@acoustictext",
    creator: "@acoustictext",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "AcousticText",
    "url": "https://www.acoustictext.com",
    "description": "Transform AI-generated text into natural, human-like writing with our advanced AI humanizer.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://www.acoustictext.com/?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    },
    "sameAs": [
      "https://x.com/acoustictext",
      "https://www.linkedin.com/company/humanwrite-pro"
    ]
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "AcousticText",
    "url": "https://www.acoustictext.com",
    "logo": "https://www.acoustictext.com/AcousticText.png",
    "description": "Professional AI humanizer for transforming AI-generated content into natural, human-like writing.",
    "email": "kirubelman3@gmail.com",
    "sameAs": [
      "https://x.com/acoustictext",
      "https://www.linkedin.com/company/humanwrite-pro"
    ]
  };

  const softwareApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "AcousticText AI Humanizer",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "2450",
      "bestRating": "5",
      "worstRating": "1"
    },
    "featureList": "AI Detection Bypass, Humanize Text, Grammar Correction, SEO Optimization",
    "screenshot": "https://www.acoustictext.com/opengraph-image.png"
  };

  return (
    <ClerkProvider>
      <html lang="en" className={`${inter.variable}`}> 
        <head>
          {/* Google tag (gtag.js) */}
          <script async src="https://www.googletagmanager.com/gtag/js?id=G-QCMVGCJJJV"></script>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-QCMVGCJJJV');
              `,
            }}
          />
          <title>AcousticText: Advanced AI Humanizer to Bypass AI Detectors</title>
          <link rel="canonical" href="https://www.acoustictext.com" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        </head>
        <body suppressHydrationWarning className="overflow-x-hidden font-sans bg-background text-foreground">
          <ThemeProvider attribute="class" defaultTheme="light">
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
            />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }}
          />
          <AnalyticsProvider>
            <EventReplayProvider>
              {children}
              <CookieConsent />
              <Toaster visibleToasts={5} position="bottom-left" expand={true} />
              <EventHighlighter />
              {SHOW_SOCIAL_PROOF && <SocialProofToasts />}
            </EventReplayProvider>
          </AnalyticsProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
