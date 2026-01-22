import { Link } from '@inertiajs/react';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import Button from '../../../components/Button';
import { CheckCircle, ArrowLeft, FileText } from 'lucide-react';

interface ApplicationSuccessProps {
    applicationNumber: string;
}

export default function ApplicationSuccess({ applicationNumber }: ApplicationSuccessProps) {
    return (
        <div className="flex flex-col bg-background dark:bg-dark-bg w-full min-h-dvh transition-colors">
            <Header />
            <main className="flex-1 mt-16 py-8 md:py-12">
                <div className="mx-auto px-4 max-w-2xl">
                    <div className="bg-white dark:bg-dark-surface rounded-lg shadow-lg p-8 text-center">
                        <div className="flex justify-center mb-6">
                            <div className="bg-green-100 dark:bg-green-900 rounded-full p-4">
                                <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                            Application Submitted Successfully!
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Your housing beneficiary application has been submitted and is now under review.
                        </p>
                        <div className="bg-gray-50 dark:bg-dark-bg rounded-lg p-4 mb-6">
                            <div className="flex items-center justify-center gap-2 text-gray-700 dark:text-gray-300">
                                <FileText size={20} />
                                <span className="font-mono font-semibold">{applicationNumber}</span>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/applications/housing">
                                <Button variant="primary" size="md" className="flex items-center gap-2">
                                    View My Applications
                                </Button>
                            </Link>
                            <Link href="/user">
                                <Button variant="secondary" size="md" className="flex items-center gap-2">
                                    <ArrowLeft size={18} />
                                    Return to Home
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
