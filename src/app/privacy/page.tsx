"use client";

import PageNavbar from "~/components/PageNavbar";
import { SiteFooter } from "~/components/SiteFooter";

export default function PrivacyPage() {

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
                "name": "Privacy Policy",
                "item": "https://www.acoustictext.com/privacy"
            }
        ]
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            <PageNavbar />
            <main className="mx-auto max-w-4xl px-4 py-12 pt-24 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-16 animate-fade-in-up">
                    <div className="inline-block rounded-full bg-blue-500/10 px-6 py-2 text-xs font-black text-blue-400 mb-8  border border-blue-500/20 uppercase tracking-[0.2em]">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mr-2 inline-block pulse-glow"></span>
                        Legal & Privacy
                    </div>
                    <h1 className="text-4xl sm:text-6xl font-black tracking-tighter text-white mb-6">
                        Privacy Policy
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium">
                        Your privacy matters to us. Learn how we collect, use, and protect your personal information.
                    </p>
                    <div className="mt-6 text-xs font-black text-slate-400 bg-white/5 rounded-full px-5 py-2 w-fit mx-auto border border-white/5 uppercase tracking-widest">
                        Last updated: November 4, 2025
                    </div>
                </div>

                {/* Privacy Content */}
                <div className="rounded-[3rem] border border-white/10 bg-white/[0.02] p-8 md:p-12 backdrop-blur-md shadow-3xl">
                    <div className="space-y-12">
                        <div className="text-base text-slate-400 leading-relaxed mb-6">
                            <p>
                                Welcome to AcousticText. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our services.
                            </p>
                        </div>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-white mb-3">
                                1. Information We Collect
                            </h2>
                            <p className="text-base text-slate-400 leading-relaxed">
                                We may collect personal information from you in a variety of ways, including, but not limited to, when you visit our site, register on the site, place an order, and in connection with other activities, services, features, or resources we make available.
                            </p>
                            <ul className="space-y-2 ml-4 list-disc list-outside text-base text-slate-400">
                                <li><strong className="text-white">Personal Data:</strong> Personally identifiable information, such as your name, email address, and payment information, that you voluntarily give to us when you register or when you choose to participate in various activities related to the site.</li>
                                <li><strong className="text-white">Usage Data:</strong> Information your browser sends whenever you visit our Service or when you access the Service by or through a mobile device.</li>
                            </ul>
                        </section>

                        <section className="space-y-6">
                            <h2 className="text-2xl font-black text-white mb-4 pt-8 border-t border-white/5 tracking-tight">
                                2. How We Use Your Information
                            </h2>
                            <p className="text-base text-slate-400 leading-relaxed">
                                We use the information we collect in order to:
                            </p>
                            <ul className="space-y-2 ml-4 list-disc list-outside text-base text-slate-400">
                                <li>Provide, operate, and maintain our services.</li>
                                <li>Improve, personalize, and expand our services.</li>
                                <li>Understand and analyze how you use our services.</li>
                                <li>Develop new products, services, features, and functionality.</li>
                                <li>Communicate with you, either directly or through one of our partners, including for customer service, to provide you with updates and other information relating to the website, and for marketing and promotional purposes.</li>
                                <li>Process your transactions.</li>
                            </ul>
                        </section>

                        <section className="space-y-6">
                            <h2 className="text-2xl font-black text-white mb-4 pt-8 border-t border-white/5 tracking-tight">
                                3. Data Security
                            </h2>
                            <p className="text-base text-slate-400 leading-relaxed">
                                We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
                            </p>
                        </section>

                        <section className="space-y-6">
                            <h2 className="text-2xl font-black text-white mb-4 pt-8 border-t border-white/5 tracking-tight">
                                4. Your Data Protection Rights
                            </h2>
                            <p className="text-base text-slate-400 leading-relaxed">
                                Depending on your location, you may have the following rights regarding your personal data:
                            </p>
                            <ul className="space-y-2 ml-4 list-disc list-outside text-base text-slate-400">
                                <li>The right to access – You have the right to request copies of your personal data.</li>
                                <li>The right to rectification – You have the right to request that we correct any information you believe is inaccurate.</li>
                                <li>The right to erasure – You have the right to request that we erase your personal data, under certain conditions.</li>
                                <li>The right to restrict processing – You have the right to request that we restrict the processing of your personal data, under certain conditions.</li>
                                <li>The right to object to processing – You have the right to object to our processing of your personal data, under certain conditions.</li>
                                <li>The right to data portability – You have the right to request that we transfer the data that we have collected to another organization, or directly to you, under certain conditions.</li>
                            </ul>
                        </section>

                        <section className="space-y-6">
                            <h2 className="text-2xl font-black text-white mb-4 pt-8 border-t border-white/5 tracking-tight">
                                5. Cookies and Tracking Technologies
                            </h2>
                            <p className="text-base text-slate-400 leading-relaxed">
                                We use cookies and similar tracking technologies to track activity on our service and hold certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
                            </p>
                        </section>

                        <section className="space-y-6">
                            <h2 className="text-2xl font-black text-white mb-4 pt-8 border-t border-white/5 tracking-tight">
                                6. Third-Party Services
                            </h2>
                            <p className="text-base text-slate-400 leading-relaxed">
                                We may use third-party services to help us operate our service and administer activities on our behalf, such as sending out newsletters or surveys. We may share your information with these third parties for those limited purposes provided that you have given us your permission.
                            </p>
                        </section>

                        <section className="space-y-6">
                            <h2 className="text-2xl font-black text-white mb-4 pt-8 border-t border-white/5 tracking-tight">
                                7. Data Retention
                            </h2>
                            <p className="text-base text-slate-400 leading-relaxed">
                                We will retain your personal information only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use your information to the extent necessary to comply with our legal obligations, resolve disputes, and enforce our policies.
                            </p>
                        </section>

                        <section className="space-y-6">
                            <h2 className="text-2xl font-black text-white mb-4 pt-8 border-t border-white/5 tracking-tight">
                                8. Changes to This Privacy Policy
                            </h2>
                            <p className="text-base text-slate-400 leading-relaxed">
                                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
                            </p>
                        </section>

                        <section className="space-y-6">
                            <h2 className="text-2xl font-black text-white mb-4 pt-8 border-t border-white/5 tracking-tight">
                                9. Children's Privacy
                            </h2>
                            <p className="text-base text-slate-400 leading-relaxed">
                                Our service does not address anyone under the age of 13. We do not knowingly collect personally identifiable information from children under 13. If you are a parent or guardian and you are aware that your child has provided us with personal information, please contact us so that we can take the necessary actions.
                            </p>
                        </section>

                        <section className="space-y-6">
                            <h2 className="text-2xl font-black text-white mb-4 pt-8 border-t border-white/5 tracking-tight">
                                10. Contact Us
                            </h2>
                            <p className="text-base text-slate-400 leading-relaxed mb-4">
                                If you have any questions about this Privacy Policy, you can contact us at:
                            </p>
                            <div className="rounded-[2rem] bg-blue-500/5 p-8 border border-blue-500/10 shadow-3xl transition-all duration-300 hover:bg-blue-500/10">
                                <p className="text-xs font-black text-blue-400 uppercase tracking-widest mb-2">Email our legal team</p>
                                <p className="font-black text-white text-2xl mb-4">kirubelman3@gmail.com</p>
                                <p className="text-sm text-slate-400 font-medium pt-6 border-t border-white/5">
                                    Official response time: Under 24 Business Hours
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
