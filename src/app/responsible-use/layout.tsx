import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Responsible Use - HumanWritePro",
  description: "Learn how to use HumanWritePro responsibly and ethically. Understand our guidelines for academic integrity and ethical content creation.",
  keywords: [
    "ai humanizer",
    "responsible AI use",
    "academic integrity",
    "ethical writing",
    "HumanWritePro guidelines",
    "AI ethics",
    "content creation ethics",
    "academic honesty",
  ],
  alternates: {
    canonical: "https://www.humanwritepro.com/responsible-use",
  },
  openGraph: {
    title: "Responsible Use - HumanWritePro | AI Humanizer",
    description: "Learn how to use HumanWritePro responsibly and ethically.",
    url: "https://www.humanwritepro.com/responsible-use",
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
    title: "Responsible Use - HumanWritePro",
    description: "Learn how to use HumanWritePro responsibly and ethically.",
    images: ["/forOpengraph.png"],
  },
};

export default function ResponsibleUseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

