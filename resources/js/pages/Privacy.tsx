import { Link } from '@inertiajs/react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Privacy() {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
            <Header />
            <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-12">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Privacy Policy</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Last updated: April 13, 2026</p>

                    <div className="prose prose-gray dark:prose-invert max-w-none space-y-8 text-gray-700 dark:text-gray-300">
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">1. Information We Collect</h2>
                            <p className="leading-relaxed">
                                GoServePH collects personal information necessary to process government service applications. This includes
                                your full name, contact details (email address, phone number), home address, government-issued identification
                                numbers, and any documents you submit as part of an application (e.g., zoning, housing, subdivision, or
                                building permit applications).
                            </p>
                            <p className="leading-relaxed mt-3">
                                We also collect technical data such as IP addresses, browser type, and usage logs to maintain system
                                security and improve service delivery.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">2. How We Use Your Information</h2>
                            <ul className="list-disc list-inside space-y-2 leading-relaxed">
                                <li>To process and manage your government service applications</li>
                                <li>To verify your identity and eligibility for services</li>
                                <li>To send notifications and updates regarding your application status</li>
                                <li>To generate official documents, clearances, and permits</li>
                                <li>To comply with legal and regulatory obligations</li>
                                <li>To improve platform functionality and user experience</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">3. Data Sharing</h2>
                            <p className="leading-relaxed">
                                Your personal information is shared only within the relevant government departments (Zoning Clearance
                                Section, Housing Beneficiary Registry, Subdivision & Building Review, Operations & Maintenance, and
                                Infrastructure Projects) that handle your application. We do not sell, rent, or share your data with
                                third-party commercial entities.
                            </p>
                            <p className="leading-relaxed mt-3">
                                Data may be disclosed to authorized government agencies or law enforcement when required by law.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">4. Data Retention</h2>
                            <p className="leading-relaxed">
                                Application records and personal data are retained for the duration required by applicable government
                                records management policies. You may request deletion of your account and associated data, subject to
                                legal retention requirements.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">5. Data Security</h2>
                            <p className="leading-relaxed">
                                We implement industry-standard security measures including encrypted connections (HTTPS), secure
                                authentication with OTP verification, and role-based access control to protect your information from
                                unauthorized access, disclosure, or misuse.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">6. Your Rights</h2>
                            <p className="leading-relaxed">
                                Under the Data Privacy Act of 2012 (Republic Act No. 10173), you have the right to access, correct,
                                and request deletion of your personal data. To exercise these rights, contact us at{' '}
                                <a href="mailto:info@goserveph.com" className="text-primary hover:underline">info@goserveph.com</a>.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">7. Cookies</h2>
                            <p className="leading-relaxed">
                                This platform uses session cookies for authentication purposes. No third-party tracking cookies are used.
                                You can disable cookies in your browser settings, but this may affect platform functionality.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">8. Changes to This Policy</h2>
                            <p className="leading-relaxed">
                                We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated
                                revision date. Continued use of the platform after changes constitutes acceptance of the updated policy.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">9. Contact</h2>
                            <p className="leading-relaxed">
                                For privacy-related inquiries, please contact our Data Protection Officer at{' '}
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
