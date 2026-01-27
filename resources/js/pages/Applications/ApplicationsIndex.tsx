import { Link, router, usePage } from '@inertiajs/react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Button from '../../components/Button';
import ApplicationsTable, { BaseApplication, PaginatedData, ApplicationStatus } from '../../components/ApplicationsTable';
import { Plus, ArrowLeft } from 'lucide-react';

interface Application extends BaseApplication {
    lotAddress: string;
}

interface ApplicationsIndexProps {
    applications: PaginatedData<Application>;
}

export default function ApplicationsIndex({ applications }: ApplicationsIndexProps) {
    const { auth } = usePage<any>().props;

    const handlePaginationClick = (url: string) => {
        router.get(url, {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <div className="flex flex-col bg-background dark:bg-dark-bg w-full min-h-dvh transition-colors">
            <Header />
            <main className="flex-1 mt-16 py-8 md:py-12">
                <div className="mx-auto px-4 max-w-7xl">
                    {/* Flash Messages */}
                    {usePage<any>().props.flash?.success && (
                        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-800 dark:text-green-200 text-sm">
                            {usePage<any>().props.flash.success}
                        </div>
                    )}
                    {usePage<any>().props.flash?.error && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200 text-sm">
                            {usePage<any>().props.flash.error}
                        </div>
                    )}

                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="mb-2 font-bold text-gray-900 dark:text-white text-3xl">
                                My Applications
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                View and track the status of your urban planning applications.
                            </p>
                        </div>
                        <Link href="/zoning-applications/create">
                            <Button className="flex items-center gap-2">
                                <Plus size={20} />
                                New Application
                            </Button>
                        </Link>
                    </div>

                    <ApplicationsTable<Application>
                        applications={applications}
                        viewUrl={(id) => `/zoning-applications/${id}`}
                        columns="user"
                        onPaginationClick={handlePaginationClick}
                        emptyState={{
                            title: 'No Applications Found',
                            message: 'You haven\'t submitted any applications for zoning clearance yet.',
                            action: (
                                <Link href="/zoning-applications/create">
                                    <Button variant="primary">Submit First Application</Button>
                                </Link>
                            )
                        }}
                    />
                </div>
            </main>
            <Footer />
        </div>
    );
}
