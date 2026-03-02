import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - AcousticText",
  description: "Read the official Privacy Policy for AcousticText. Understand how we collect, use, and protect your personal information and data.",
  keywords: [
    "ai humanizer",
    "AI detection bypass",
    "humanize AI text",
    "humanizer",
    "AcousticText privacy",
    "privacy policy",
    "data protection",
    "user data",
    "information security",
    "free AI humanizer"
  ],
  alternates: {
    canonical: "https://www.acoustictext.com/privacy",
  },
  openGraph: {
    title: "Privacy Policy - AcousticText | AI Humanizer",
    description: "Learn how AcousticText protects your privacy and handles your data.",
    url: "https://www.acoustictext.com/privacy",
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
    title: "Privacy Policy - AcousticText",
    description: "Read the privacy policy for AcousticText.",
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
