import { usePage, Link } from '@inertiajs/react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Button from '../../components/Button';
import { CheckCircle, FileText, ArrowLeft, Home } from 'lucide-react';

export default function ZoningApplicationSuccess() {
    const { applicationNumber } = usePage<{ applicationNumber: string }>().props;

    return (
        <div className="flex flex-col bg-background dark:bg-dark-bg w-full min-h-dvh transition-colors">
            <Header />

            <div className="mt-16 py-12 w-full">
                <div className="mx-auto px-4 max-w-3xl">
                    <div className="bg-white dark:bg-dark-surface shadow-lg rounded-2xl p-8 md:p-12 text-center">
                        {/* Success Icon */}
                        <div className="flex justify-center mb-6">
                            <div className="flex justify-center items-center bg-green-100 dark:bg-green-900/30 rounded-full w-20 h-20">
                                <CheckCircle size={48} className="text-green-600 dark:text-green-400" />
                            </div>
                        </div>

                        {/* Success Message */}
                        <h1 className="mb-4 font-bold text-gray-900 dark:text-white text-3xl md:text-4xl">
                            Application Submitted Successfully!
                        </h1>
                        <p className="mb-8 text-gray-600 dark:text-gray-400 text-lg">
                            Your zoning clearance application has been received and is being processed.
                        </p>

                        {/* Application Number */}
                        <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center justify-center gap-2 mb-2 text-gray-500 dark:text-gray-400 text-sm">
                                <FileText size={18} />
                                <span>Application Number</span>
                            </div>
                            <p className="font-mono font-bold text-primary dark:text-primary text-2xl">
                                {applicationNumber || 'ZON-2026-0001'}
                            </p>
                        </div>

                        {/* Important Information */}
                        <div className="mb-8 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-left">
                            <h2 className="mb-4 font-semibold text-blue-900 dark:text-blue-200 text-lg">
                                What's Next?
                            </h2>
                            <ul className="space-y-2 text-blue-800 dark:text-blue-200 text-sm list-disc list-inside">
                                <li>Your application will be reviewed by our planning department</li>
                                <li>You will receive updates via email on the status of your application</li>
                                <li>Processing time is typically 3-5 working days</li>
                                <li>You can track your application status using the application number above</li>
                                <li>If additional documents are required, you will be notified</li>
                            </ul>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                            <Link href="/applications/zoning">
                                <Button variant="primary" size="md" className="flex items-center gap-2">
                                    <ArrowLeft size={18} />
                                    Return to Applications
                                </Button>
                            </Link>
                            <Link href="/">
                                <Button variant="outline" size="md" className="flex items-center gap-2">
                                    <Home size={18} />
                                    Return to Home
                                </Button>
                            </Link>
                            <Button
                                variant="outline"
                                size="md"
                                onClick={() => window.print()}
                                className="flex items-center gap-2"
                            >
                                <FileText size={18} />
                                Print Confirmation
                            </Button>
                        </div>

                        {/* Note */}
                        <p className="mt-8 text-gray-500 dark:text-gray-400 text-xs">
                            Please save your application number for future reference. You will need it to
                            track your application status or contact our office.
                        </p>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
