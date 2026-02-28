import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - HumanWritePro",
  description: "Read the official Privacy Policy for HumanWritePro. Understand how we collect, use, and protect your personal information and data.",
  keywords: [
    "ai humanizer",
    "AI detection bypass",
    "humanize AI text",
    "humanizer",
    "HumanWritePro privacy",
    "privacy policy",
    "data protection",
    "user data",
    "information security",
    "free AI humanizer"
  ],
  alternates: {
    canonical: "https://www.humanwritepro.com/privacy",
  },
  openGraph: {
    title: "Privacy Policy - HumanWritePro | AI Humanizer",
    description: "Learn how HumanWritePro protects your privacy and handles your data.",
    url: "https://www.humanwritepro.com/privacy",
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
    title: "Privacy Policy - HumanWritePro",
    description: "Read the privacy policy for HumanWritePro.",
    images: ["/forOpengraph.png"],
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
