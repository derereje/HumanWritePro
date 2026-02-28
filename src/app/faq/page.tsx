import { type Metadata } from "next";
import Link from "next/link";
import PageNavbar from "~/components/PageNavbar";
import { SiteFooter } from "~/components/SiteFooter";

export const metadata: Metadata = {
  title: "FAQ - HumanWritePro",
  description: "Get answers about our professional AI humanizer. Learn how to bypass AI detectors and humanize your content naturally with HumanWritePro.",
  keywords: [
    "ai humanizer",
    "humanizer",
    "AI humanizer FAQ",
    "humanizer questions",
    "bypass AI detectors",
    "AI detection bypass",
    "humanize AI text",
    "AI text humanizer",
    "undetectable AI",
    "professional AI humanizer"
  ],
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://www.humanwritepro.com/faq",
  },
  openGraph: {
    title: "FAQ - HumanWritePro | Professional AI Humanizer Questions",
    description: "Get answers about our professional AI humanizer. Learn how to bypass AI detectors and humanize your content naturally.",
    url: "https://www.humanwritepro.com/faq",
    siteName: "HumanWritePro",
    images: [
      {
        url: "/forOpengraph.png",
        width: 1200,
        height: 630,
        alt: "HumanWritePro - AI Humanizer",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FAQ - HumanWritePro | Professional AI Humanizer Questions",
    description: "Get answers about our professional AI humanizer. Learn how to bypass AI detectors and humanize your content naturally.",
    images: ["/forOpengraph.png"],
    site: "@humanwritepro",
    creator: "@humanwritepro",
  },
};

export default function FAQPage() {
  const faqs = [
    {
      category: "Getting Started",
      questions: [
        {
          question: "What is PurifyText?",
          answer: "PurifyText is an AI humanizer fine-tuned on 2M+ writing samples that transforms AI-generated content into natural, undetectable writing. Our advanced model consistently bypasses AI detectors while preserving your original meaning.",
        },
        {
          question: "How does PurifyText work?",
          answer: "Our model, fine-tuned on over 2 million human writing samples, analyzes your text and applies intelligent transformations to break AI patterns. You can choose from different presets like 'Friendly', 'Professional', or 'Academic' to match your desired tone.",
        },
        {
          question: "Is PurifyText free to use?",
          answer:
            "Yes! New users get 500 free credits to test our editor. After that, you can purchase affordable credit packages. We offer flexible pricing plans to suit different needs.",
        },
      ],
    },
    {
      category: "Credits & Pricing",
      questions: [
        {
          question: "How do credits work?",
          answer: "1 credit = 1 word. When you humanize text, credits are deducted based on word count. You can view your remaining credits in your account dashboard.",
        },
        {
          question: "Can I get a refund?",
          answer: "Yes, we offer a 7-day money-back guarantee. If you're not satisfied with the results, contact our support team and we'll work with you to find a solution.",
        },
      ],
    },
    {
      category: "AI Detection",
      questions: [
        {
          question: "Which AI detectors does PurifyText bypass?",
          answer: "PurifyText is verified to bypass Turnitin, GPTZero, Originality.ai, Copyleaks, ZeroGPT, QuillBot detector, Sapling, and Writer. We continuously test and update our rules.",
        },
        {
          question: "Will the humanized text keep my original meaning?",
          answer: "Absolutely. Our model fine-tuned on 2M+ samples preserves your core message while transforming the delivery. The meaning, key points, and information remain intact.",
        },
        {
          question: "What if I'm not happy with the result?",
          answer: "You can try humanizing again with a different preset. Each preset (Friendly, Professional, Academic) produces different styles. Our support team is also here to help.",
        },
      ],
    },
    {
      category: "Technical",
      questions: [
        {
          question: "What file formats are supported?",
          answer: "You can paste text directly or upload .txt, .docx, or .pdf files. We'll extract the content automatically.",
        },
        {
          question: "Is there a word limit?",
          answer: "Word limits depend on your plan. Basic: 1,000 words/request. Pro: 2,000 words/request. Ultra: 3,000 words/request.",
        },
        {
          question: "How do I contact support?",
          answer: "Email us at kirubelman3@gmail.com or use our contact page. We typically respond within 24 hours.",
        },
      ],
    },
  ];

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://humanwritepro.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "FAQ",
        "item": "https://www.humanwritepro.com/faq"
      }
    ]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.flatMap((category) =>
      category.questions.map((faq) => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    )
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <PageNavbar />
      <main className="mx-auto max-w-4xl px-4 py-12 pt-24 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tighter text-white mb-6">
            Frequently Asked <span className="text-blue-500">Questions</span>
          </h1>
          <p className="mt-4 text-xl text-slate-400 font-medium max-w-2xl mx-auto">
            Everything you need to know about the HumanWritePro technology.
          </p>
        </div>

        {/* FAQ Sections */}
        <div className="space-y-8">
          {faqs.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              <h2 className="text-xl font-black text-white mb-6 pb-3 border-b border-white/5 tracking-tight uppercase tracking-[0.1em] text-blue-500/80">
                {category.category}
              </h2>
              <div className="space-y-3">
                {category.questions.map((faq, faqIndex) => (
                  <details
                    key={faqIndex}
                    className="group bg-white/[0.02] rounded-2xl border border-white/5 hover:border-blue-500/30 hover:bg-white/[0.04] transition-all duration-300 overflow-hidden"
                  >
                    <summary className="flex cursor-pointer items-center justify-between p-6 font-black text-white tracking-tight">
                      {faq.question}
                      <span className="ml-4 flex-shrink-0 text-slate-400 group-open:rotate-180 transition-transform">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </span>
                    </summary>
                    <div className="px-6 pb-6 text-slate-400 leading-relaxed font-medium">
                      {faq.answer}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-24 bg-gradient-to-br from-blue-700 to-blue-900 rounded-[3rem] border border-white/20 p-12 text-center shadow-3xl relative overflow-hidden group">
          <div className="relative z-10">
            <h2 className="text-3xl font-black text-white tracking-tight mb-4">
              Still have questions?
            </h2>
            <p className="text-blue-100/80 text-lg font-medium mb-10 max-w-2xl mx-auto">
              Can't find what you're looking for? Our elite support team is ready to assist you.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/contact">
                <button
                  data-analytics-id="faq-page-contact-support"
                  className="w-full sm:w-auto rounded-2xl bg-card px-8 py-4 font-black text-blue-900 hover:bg-blue-50 transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  Contact Support
                </button>
              </Link>
              <Link href="/pricing">
                <button
                  data-analytics-id="faq-page-view-pricing"
                  className="w-full sm:w-auto rounded-2xl border border-white/30 backdrop-blur-sm px-8 py-4 font-black text-white hover:bg-white/10 transition-all duration-300"
                >
                  View Pricing
                </button>
              </Link>
            </div>
          </div>
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
