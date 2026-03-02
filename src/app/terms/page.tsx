"use client";

import PageNavbar from "~/components/PageNavbar";
import { SiteFooter } from "~/components/SiteFooter";

export default function TermsPage() {
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
                "name": "Terms of Service",
                "item": "https://www.acoustictext.com/terms"
            }
        ]
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            <PageNavbar />
            <main className="mx-auto max-w-4xl px-4 py-12 pt-24 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-block rounded-full bg-blue-100 px-6 py-2.5 text-sm font-semibold text-blue-700 mb-6  border border-blue-200">
                        Terms & Conditions
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
                        Terms of Service
                    </h1>
                    <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        Please read these terms carefully before using AcousticText. By using our service, you agree to these terms.
                    </p>
                    <div className="mt-4 text-xs sm:text-sm text-slate-400 bg-white/[0.03] rounded-full px-4 py-2 w-fit mx-auto border border-white/[0.1]">
                        Last updated: November 4, 2025
                    </div>
                </div>

                {/* Terms Content */}
                <div className="rounded-3xl border border-slate-200/60 bg-card p-8 md:p-10 lg:p-12 shadow-xl hover:shadow-2xl transition-shadow duration-300">
                    <div className="space-y-8">
                        <div className="text-base text-slate-400 leading-relaxed mb-6">
                            <p>
                                These Terms of Service govern your use of AcousticText and provide information about the AcousticText Service. By using our services, you agree to these terms.
                            </p>
                        </div>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-white mb-3">
                                1. Acceptance of Terms
                            </h2>
                            <p className="text-base text-slate-400 leading-relaxed">
                                By accessing and using AcousticText, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these Terms of Service, please do not use our service.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-white mb-3 pt-4 border-t border-white/10">
                                2. Description of Service
                            </h2>
                            <p className="text-base text-slate-400 leading-relaxed">
                                AcousticText provides an AI-powered text humanization service that transforms AI-generated content into natural, human-like writing. Our service includes:
                            </p>
                            <ul className="space-y-2 ml-4 list-disc list-outside text-base text-slate-400">
                                <li>Text humanization with multiple style presets</li>
                                <li>AI detection bypass capabilities</li>
                                <li>Credit-based usage system</li>
                                <li>API access for ULTRA plan subscribers</li>
                                <li>History tracking and management</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-white mb-3 pt-4 border-t border-white/10">
                                3. User Accounts
                            </h2>
                            <p className="text-base text-slate-400 leading-relaxed">
                                To use certain features of our service, you must register for an account. You are responsible for:
                            </p>
                            <ul className="space-y-2 ml-4 list-disc list-outside text-base text-slate-400">
                                <li>Maintaining the confidentiality of your account credentials</li>
                                <li>All activities that occur under your account</li>
                                <li>Notifying us immediately of any unauthorized use</li>
                                <li>Ensuring your account information is accurate and up-to-date</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-white mb-3 pt-4 border-t border-white/10">
                                4. Acceptable Use
                            </h2>
                            <p className="text-base text-slate-400 leading-relaxed">
                                You agree not to use AcousticText to:
                            </p>
                            <ul className="space-y-2 ml-4 list-disc list-outside text-base text-slate-400">
                                <li>Violate any laws or regulations</li>
                                <li>Infringe on intellectual property rights</li>
                                <li>Transmit harmful or malicious content</li>
                                <li>Attempt to gain unauthorized access to our systems</li>
                                <li>Use the service for any illegal or unethical purposes</li>
                                <li>Resell or redistribute our service without permission</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-white mb-3 pt-4 border-t border-white/10">
                                5. Payment and Subscriptions
                            </h2>
                            <p className="text-base text-slate-400 leading-relaxed">
                                AcousticText offers both free and paid plans:
                            </p>
                            <ul className="space-y-2 ml-4 list-disc list-outside text-base text-slate-400">
                                <li><strong className="text-white">Free Plan:</strong> Limited credits provided at signup</li>
                                <li><strong className="text-white">Paid Plans:</strong> Subscription-based with monthly or yearly billing</li>
                                <li><strong className="text-white">Credits:</strong> One credit typically equals processing of 1 word</li>
                                <li><strong className="text-white">Refunds:</strong> We're confident in the quality of our AI humanizer. If you're not satisfied with the results, please contact our support team within 7 days of purchase, and we'll work with you to find a solution.</li>
                                <li><strong className="text-white">Cancellation:</strong> You may cancel your subscription at any time</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-white mb-3 pt-4 border-t border-white/10">
                                6. Intellectual Property
                            </h2>
                            <p className="text-base text-slate-400 leading-relaxed">
                                The service and its original content, features, and functionality are owned by AcousticText and are protected by international copyright, trademark, and other intellectual property laws.
                            </p>
                            <p className="text-base text-slate-400 leading-relaxed">
                                Content you create using our service remains yours, but you grant us a license to process and humanize your text to provide the service.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-white mb-3 pt-4 border-t border-white/10">
                                7. API Usage (ULTRA Plan)
                            </h2>
                            <p className="text-base text-slate-400 leading-relaxed">
                                ULTRA plan subscribers with API access must:
                            </p>
                            <ul className="space-y-2 ml-4 list-disc list-outside text-base text-slate-400">
                                <li>Keep API keys confidential and secure</li>
                                <li>Not exceed rate limits or abuse the API</li>
                                <li>Not share API keys with unauthorized parties</li>
                                <li>Monitor API key usage and deactivate if compromised</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-white mb-3 pt-4 border-t border-white/10">
                                8. Disclaimer of Warranties
                            </h2>
                            <p className="text-base text-slate-400 leading-relaxed">
                                The service is provided "as is" and "as available" without any warranties of any kind, either express or implied. We do not guarantee that:
                            </p>
                            <ul className="space-y-2 ml-4 list-disc list-outside text-base text-slate-400">
                                <li>The service will be uninterrupted or error-free</li>
                                <li>The humanized text will bypass all AI detection systems</li>
                                <li>The service will meet all your specific requirements</li>
                                <li>All errors will be corrected</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-white mb-3 pt-4 border-t border-white/10">
                                9. Limitation of Liability
                            </h2>
                            <p className="text-base text-slate-400 leading-relaxed">
                                To the maximum extent permitted by law, AcousticText shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-white mb-3 pt-4 border-t border-white/10">
                                10. Changes to Terms
                            </h2>
                            <p className="text-base text-slate-400 leading-relaxed">
                                We reserve the right to modify these terms at any time. We will notify users of any material changes via email or through the service. Continued use of the service after changes constitutes acceptance of the new terms.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-white mb-3 pt-4 border-t border-white/10">
                                11. Termination
                            </h2>
                            <p className="text-base text-slate-400 leading-relaxed">
                                We may terminate or suspend your account and access to the service immediately, without prior notice, for any breach of these Terms of Service.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-white mb-3 pt-4 border-t border-white/10">
                                12. Governing Law
                            </h2>
                            <p className="text-base text-slate-400 leading-relaxed">
                                These Terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law provisions.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-white mb-3 pt-4 border-t border-white/10">
                                13. Contact Information
                            </h2>
                            <p className="text-base text-slate-400 leading-relaxed mb-4">
                                For questions about these Terms of Service, please contact us:
                            </p>
                            <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-white p-6 border border-white/10  hover:shadow-xl shadow-black/50 shadow-black/50 transition-shadow">
                                <p className="text-sm text-slate-400 font-medium mb-1">Email us at</p>
                                <p className="font-semibold text-white text-lg mb-4">kirubelman3@gmail.com</p>
                                <p className="text-sm text-slate-400 pt-4 border-t border-white/10">
                                    We typically respond within 24 hours
                                </p>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
            <SiteFooter />
        </div>
    );
}
