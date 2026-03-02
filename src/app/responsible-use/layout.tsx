import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Responsible Use - AcousticText",
  description: "Learn how to use AcousticText responsibly and ethically. Understand our guidelines for academic integrity and ethical content creation.",
  keywords: [
    "ai humanizer",
    "responsible AI use",
    "academic integrity",
    "ethical writing",
    "AcousticText guidelines",
    "AI ethics",
    "content creation ethics",
    "academic honesty",
  ],
  alternates: {
    canonical: "https://www.acoustictext.com/responsible-use",
  },
  openGraph: {
    title: "Responsible Use - AcousticText | AI Humanizer",
    description: "Learn how to use AcousticText responsibly and ethically.",
    url: "https://www.acoustictext.com/responsible-use",
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
    title: "Responsible Use - AcousticText",
    description: "Learn how to use AcousticText responsibly and ethically.",
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

