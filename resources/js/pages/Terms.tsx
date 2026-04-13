import { Link } from '@inertiajs/react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Terms() {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
            <Header />
            <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-12">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Terms of Service</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Last updated: April 13, 2026</p>

                    <div className="prose prose-gray dark:prose-invert max-w-none space-y-8 text-gray-700 dark:text-gray-300">
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">1. Acceptance of Terms</h2>
                            <p className="leading-relaxed">
                                By accessing or using the GoServePH Service Portal, you agree to be bound by these Terms of Service
                                and our <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>. If you do
                                not agree to these terms, you may not use the platform.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">2. Eligibility</h2>
                            <p className="leading-relaxed">
                                This platform is intended for use by residents, property owners, businesses, and authorized government
                                personnel within the jurisdiction served by this system. You must be at least 18 years of age to create
                                an account and submit applications.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">3. Account Responsibilities</h2>
                            <p className="leading-relaxed">
                                You are responsible for maintaining the confidentiality of your account credentials. You agree to provide
                                accurate, current, and complete information during registration and to update your information as needed.
                                Any activity conducted through your account is your responsibility.
                            </p>
                            <p className="leading-relaxed mt-3">
                                You must immediately notify us at{' '}
                                <a href="mailto:info@goserveph.com" className="text-primary hover:underline">info@goserveph.com</a>{' '}
                                if you suspect unauthorized access to your account.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">4. Acceptable Use</h2>
                            <p className="leading-relaxed">You agree not to:</p>
                            <ul className="list-disc list-inside space-y-2 leading-relaxed mt-2">
                                <li>Submit false, misleading, or fraudulent information in any application</li>
                                <li>Impersonate another person or entity</li>
                                <li>Attempt to gain unauthorized access to other accounts or system resources</li>
                                <li>Use the platform for any unlawful purpose</li>
                                <li>Interfere with or disrupt the platform's operation or infrastructure</li>
                                <li>Upload malicious files, scripts, or software</li>
                            </ul>
                            <p className="leading-relaxed mt-3">
                                Violation of these rules may result in immediate account suspension and referral to the appropriate
                                authorities.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">5. Application Submissions</h2>
                            <p className="leading-relaxed">
                                Submitting an application through this platform does not guarantee approval. All applications are subject
                                to review and approval by the relevant government department in accordance with applicable laws,
                                ordinances, and regulations. Processing times may vary.
                            </p>
                            <p className="leading-relaxed mt-3">
                                You are responsible for the accuracy and completeness of all submitted documents. Submission of
                                falsified documents is a criminal offense under Philippine law.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">6. Fees and Payments</h2>
                            <p className="leading-relaxed">
                                Certain applications may require payment of government fees as assessed by the relevant department.
                                Fee schedules are determined by applicable local ordinances. The platform displays assessed fees for
                                informational purposes; payment instructions will be provided upon application processing.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">7. Intellectual Property</h2>
                            <p className="leading-relaxed">
                                All content, design, and functionality of this platform are the property of the operating government
                                unit and its technology partners. You may not reproduce, distribute, or create derivative works without
                                explicit written permission.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">8. Disclaimers</h2>
                            <p className="leading-relaxed">
                                The platform is provided "as is" without warranties of any kind. We do not guarantee uninterrupted or
                                error-free service. Government decisions made through this platform are subject to the authority of the
                                relevant department and applicable law — the platform itself does not constitute legal advice.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">9. Limitation of Liability</h2>
                            <p className="leading-relaxed">
                                To the maximum extent permitted by law, GoServePH and the operating government unit shall not be liable
                                for any indirect, incidental, or consequential damages arising from your use of the platform or any
                                application decision made therein.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">10. Governing Law</h2>
                            <p className="leading-relaxed">
                                These Terms are governed by the laws of the Republic of the Philippines. Any disputes shall be subject
                                to the jurisdiction of the appropriate courts in the Philippines.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">11. Changes to These Terms</h2>
                            <p className="leading-relaxed">
                                We reserve the right to update these Terms at any time. Continued use of the platform after changes
                                are posted constitutes your acceptance of the revised Terms.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">12. Contact</h2>
                            <p className="leading-relaxed">
                                For questions about these Terms, contact us at{' '}
                                <a href="mailto:info@goserveph.com" className="text-primary hover:underline">info@goserveph.com</a>.
                            </p>
                        </section>
                    </div>

                    <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <Link href="/" className="text-primary hover:underline text-sm">
                            &larr; Back to Home
                        </Link>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
