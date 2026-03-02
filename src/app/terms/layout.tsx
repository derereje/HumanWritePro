import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - AcousticText",
  description: "Read the official Terms of Service for AcousticText. Understand our terms, conditions, and guidelines for using our AI humanizer service.",
  keywords: [
    "ai humanizer",
    "AI detection bypass",
    "humanize AI text",
    "humanizer",
    "AcousticText terms",
    "terms of service",
    "terms and conditions",
    "user agreement",
    "service terms",
    "free AI humanizer"
  ],
  alternates: {
    canonical: "https://www.acoustictext.com/terms",
  },
  openGraph: {
    title: "Terms of Service - AcousticText | AI Humanizer",
    description: "Read the terms of service for AcousticText AI humanizer.",
    url: "https://www.acoustictext.com/terms",
    siteName: "AcousticText",
    images: [
      {
        url: "/forOpengraph.png",
        width: 1200,
        height: 630,
        alt: "AcousticText OpenGraph Image"
      }
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms of Service - AcousticText",
    description: "Read the terms of service for AcousticText.",
    images: ["/forOpengraph.png"],
  },
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
