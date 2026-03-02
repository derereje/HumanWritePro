"use client";

import PageNavbar from "~/components/PageNavbar";
import { SiteFooter } from "~/components/SiteFooter";
import Link from "next/link";
import { AlertTriangle, CheckCircle, XCircle, Lightbulb } from "lucide-react";

export default function ResponsibleUsePage() {
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
        "name": "Responsible Use",
        "item": "https://www.acoustictext.com/responsible-use"
      }
    ]
  };

  const doItems = [
    "Use AcousticText to refine and polish your own writing",
    "Improve sentence structure and readability",
    "Ensure your writing sounds natural and authentic",
    "Follow your institution's guidelines on AI tools",
  ];

  const dontItems = [
    "Submit humanized content as entirely original work without disclosure",
    "Use AcousticText to circumvent academic integrity policies",
    "Violate your institution's rules on AI-assisted writing",
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <PageNavbar />
      <main className="mx-auto max-w-3xl px-4 py-12 pt-24 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Responsible Use Guidelines
          </h1>
          <p className="mt-3 text-lg text-slate-400">
            Use AcousticText ethically and responsibly
          </p>
        </div>

        {/* Important Notice */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-5 mb-8">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-300">Important Notice</h3>
              <p className="mt-1 text-sm text-amber-400">
                AcousticText is not a tool for academic dishonesty. We encourage responsible use that enhances your work while respecting integrity policies.
              </p>
            </div>
          </div>
        </div>

        {/* What AcousticText Does */}
        <div className="bg-card rounded-xl border border-white/10 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-white">What AcousticText Does</h2>
          </div>
          <p className="text-slate-400 leading-relaxed">
            AcousticText helps you refine how your content reads — making it more natural, clear, and engaging. Our model, fine-tuned on 2M+ writing samples, transforms text while preserving your original ideas and voice.
          </p>
        </div>

        {/* Do's and Don'ts */}
        <div className="grid gap-6 sm:grid-cols-2 mb-8">
          {/* Do's */}
          <div className="bg-card rounded-xl border border-white/10 p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-white">Do</h3>
            </div>
            <ul className="space-y-3">
              {doItems.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-slate-400">
                  <span className="text-blue-500 mt-1">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Don'ts */}
          <div className="bg-card rounded-xl border border-white/10 p-6">
            <div className="flex items-center gap-2 mb-4">
              <XCircle className="h-5 w-5 text-red-500" />
              <h3 className="font-semibold text-white">Don't</h3>
            </div>
            <ul className="space-y-3">
              {dontItems.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-slate-400">
                  <span className="text-red-500 mt-1">✗</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Academic Integrity */}
        <div className="bg-card rounded-xl border border-white/10 p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-3">Academic Integrity</h2>
          <p className="text-slate-400 leading-relaxed">
            Every educational institution has its own policies regarding AI-assisted writing. It's essential to understand and comply with your school's guidelines. When in doubt, consult with your instructor or academic integrity office.
          </p>
        </div>

        {/* Contact */}
        <div className="bg-white/[0.04] border border-white/10 rounded-xl p-6 text-center">
          <p className="text-slate-400">
            Questions about responsible use?{" "}
            <Link href="mailto:kirubelman3@gmail.com" className="text-blue-600 hover:underline font-medium">
              Contact us
            </Link>
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
