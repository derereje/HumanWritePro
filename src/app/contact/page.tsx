import { type Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";

import PageNavbar from "~/components/PageNavbar";
import { SiteFooter } from "~/components/SiteFooter";
import ContactForm from "./ContactForm";
import { Mail, MessageSquare, Building2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us - HumanWritePro",
  description: "Have a question or feedback? Contact the HumanWritePro support team. We're here to help you with our professional AI humanizer.",
  keywords: [
    "ai humanizer",
    "AI detection bypass",
    "humanize AI text",
    "humanizer",
    "HumanWritePro contact",
    "support",
    "customer service",
    "contact us",
    "help",
    "feedback",
    "professional AI humanizer"
  ],
  alternates: {
    canonical: "https://www.humanwritepro.com/contact",
  },
  openGraph: {
    title: "Contact Us - HumanWritePro",
    description: "Get in touch with our professional support team for help or feedback.",
    url: "https://www.humanwritepro.com/contact",
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
    title: "Contact Us - HumanWritePro",
    description: "Get in touch with the HumanWritePro support team.",
    images: ["/forOpengraph.png"],
  },
};

export default async function ContactPage() {
  const user = await currentUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://purifytext.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Contact Us",
        "item": "https://www.purifytext.com/contact"
      }
    ]
  };

  const contactSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "Contact HumanWritePro",
    "description": "Contact the HumanWritePro support team for help with our professional AI humanizer.",
    "url": "https://www.humanwritepro.com/contact"
  };

  const contactOptions = [
    {
      icon: Mail,
      title: "Email Support",
      description: "Get help via email",
      detail: "purifytext@gmail.com",
      link: "mailto:purifytext@gmail.com",
    },
    {
      icon: MessageSquare,
      title: "FAQ",
      description: "Find quick answers",
      detail: "Browse common questions",
      link: "/faq",
    },
    {
      icon: Building2,
      title: "Enterprise",
      description: "Custom solutions",
      detail: "Contact for volume pricing",
      link: "mailto:purifytext@gmail.com?subject=Enterprise%20Inquiry",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactSchema) }}
      />
      <PageNavbar />
      <main className="mx-auto max-w-6xl px-4 py-12 pt-24 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tighter text-white mb-6">
            Get in <span className="text-blue-500">Touch</span>
          </h1>
          <p className="mt-4 text-xl text-slate-400 max-w-xl mx-auto font-medium">
            Have questions? We'd love to hear from you. Send us a message and we'll respond within 24 hours.
          </p>
        </div>

        {/* Contact Options */}
        <div className="grid gap-4 sm:grid-cols-3 mb-12">
          {contactOptions.map((option) => (
            <a
              key={option.title}
              href={option.link}
              data-analytics-id={`contact-page-option-${option.title.toLowerCase().replace(/\s+/g, '-')}`}
              className="group flex flex-col items-center p-8 bg-white/[0.02] border border-white/5 rounded-3xl hover:border-blue-500/30 hover:bg-white/[0.04] transition-all duration-300"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                <option.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-6 font-black text-white tracking-tight">{option.title}</h3>
              <p className="mt-2 text-sm font-medium text-slate-400">{option.description}</p>
              <p className="mt-3 text-sm font-black text-blue-500 uppercase tracking-wider">{option.detail}</p>
            </a>
          ))}
        </div>

        {/* Contact Form */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/[0.02] border border-white/5 backdrop-blur-md rounded-3xl p-10 shadow-2xl">
            <h2 className="text-2xl font-black text-white mb-3 tracking-tight">Send a Message</h2>
            <p className="text-base font-medium text-slate-400 mb-8">
              Fill out the form below and we'll get back to you as soon as possible.
            </p>
            <ContactForm initialEmail={userEmail} isEmailReadOnly />
          </div>
        </div>

        {/* Response Time */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-400">
            Average response time: <span className="font-medium text-slate-300">Under 24 hours</span>
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
