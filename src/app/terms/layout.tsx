import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - HumanWritePro",
  description: "Read the official Terms of Service for HumanWritePro. Understand our terms, conditions, and guidelines for using our AI humanizer service.",
  keywords: [
    "ai humanizer",
    "AI detection bypass",
    "humanize AI text",
    "humanizer",
    "HumanWritePro terms",
    "terms of service",
    "terms and conditions",
    "user agreement",
    "service terms",
    "free AI humanizer"
  ],
  alternates: {
    canonical: "https://www.humanwritepro.com/terms",
  },
  openGraph: {
    title: "Terms of Service - HumanWritePro | AI Humanizer",
    description: "Read the terms of service for HumanWritePro AI humanizer.",
    url: "https://www.humanwritepro.com/terms",
    siteName: "HumanWritePro",
    images: [
      {
        url: "/forOpengraph.png",
        width: 1200,
        height: 630,
        alt: "HumanWritePro OpenGraph Image"
      }
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms of Service - HumanWritePro",
    description: "Read the terms of service for HumanWritePro.",
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
