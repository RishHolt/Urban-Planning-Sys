import { Link } from '@inertiajs/react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Button from '../../components/Button';
import ApplicationsTable, { BaseApplication } from '../../components/ApplicationsTable';
import { Plus, ArrowLeft } from 'lucide-react';

interface Application extends BaseApplication {
    municipality: string;
    barangay: string;
    updatedAt: string;
}

interface ApplicationsIndexProps {
    applications: Application[];
}

export default function ApplicationsIndex({ applications }: ApplicationsIndexProps) {

    return (
        <div className="flex flex-col bg-background dark:bg-dark-bg w-full min-h-dvh transition-colors">
            <Header />
            <main className="flex-1 mt-16 py-8 md:py-12">
                <div className="mx-auto px-4 max-w-7xl">
                    <div className="mb-6">
                        <Link href="/user">
                            <Button variant="secondary" size="sm" className="flex items-center gap-2">
                                <ArrowLeft size={18} />
                                Return to Home
                            </Button>
                        </Link>
                    </div>
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="mb-2 font-bold text-gray-900 dark:text-white text-3xl">
                                My Applications
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                View and manage your zoning clearance applications
                            </p>
                        </div>
                        <Link href="/clearance-applications/create">
                            <Button variant="primary" size="md" className="flex items-center gap-2">
                                <Plus size={20} />
                                New Application
                            </Button>
                        </Link>
                    </div>

                    <ApplicationsTable<Application>
                        applications={applications}
                        viewUrl={(id) => `/clearance-applications/${id}`}
                        columns="user"
                        emptyState={{
                            title: 'No Applications Yet',
                            message: 'You haven\'t submitted any applications. Start by creating a new application.',
                            action: (
                                <Link href="/clearance-applications/create">
                                    <Button variant="primary" size="md" className="flex items-center gap-2 mx-auto">
                                        <Plus size={20} />
                                        Create New Application
                                    </Button>
                                </Link>
                            ),
                        }}
                    />
                </div>
            </main>
            <Footer />
        </div>
    );
}
