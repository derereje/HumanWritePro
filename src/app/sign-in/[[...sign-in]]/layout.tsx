import { type Metadata } from "next";

export const metadata: Metadata = {
  keywords: [
    "ai humanizer",
    "humanizer",
    "sign in",
    "login",
    "AI text humanizer",
    "humanize AI text",
    "text humanization tool",
    "AI detection bypass",
    "user login",
    "account access"
    ,
    "free AI humanizer"
  ],
  openGraph: {
  title: "Sign In - AcousticText",
  description: "Sign in to your AcousticText account to access our AI humanizer. Transform AI-generated text into natural, human-like writing.",
    description: "Sign in to access AcousticText's AI text humanization tools.",
    url: "https://www.acoustictext.com/sign-in",
    siteName: "AcousticText",
    images: [
      {
        url: "/forOpengraph.png",
        width: 1200,
        height: 630,
        alt: "AcousticText OpenGraph Image",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sign In - AcousticText | AI Humanizer",
    description: "Sign in to your account to start humanizing text.",
    images: ["/forOpengraph.png"],
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

export default function SignInLayout({
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
        "item": "https://www.acoustictext.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Sign In",
        "item": "https://www.acoustictext.com/sign-in"
      }
    ]
  };

  return (
    <>
      {children}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
}
