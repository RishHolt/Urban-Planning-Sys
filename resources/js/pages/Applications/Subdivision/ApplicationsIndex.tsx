import { Link } from '@inertiajs/react';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import Button from '../../../components/Button';
import ApplicationsTable, { BaseApplication } from '../../../components/ApplicationsTable';
import { Plus, ArrowLeft } from 'lucide-react';

interface Application extends BaseApplication {
    subdivisionName: string;
    currentStage: string;
    projectAddress: string;
}

interface ApplicationsIndexProps {
    applications: Application[];
}

export default function ApplicationsIndex({ applications }: ApplicationsIndexProps) {
    const getStatusBadge = (status: string) => {
        const statusColors: Record<string, string> = {
            submitted: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
            concept_review: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
            preliminary_review: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
            improvement_review: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
            final_review: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
            approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
            denied: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
            revision: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
        };

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}`}>
                {status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
        );
    };

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
                                My Subdivision Applications
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                View and manage your subdivision development applications
                            </p>
                        </div>
                        <Link href="/subdivision-applications/create">
                            <Button variant="primary" size="md" className="flex items-center gap-2">
                                <Plus size={20} />
                                New Application
                            </Button>
                        </Link>
                    </div>

                    {applications.length === 0 ? (
                        <div className="p-12 text-center bg-white dark:bg-dark-surface rounded-lg border border-gray-200 dark:border-gray-700">
                            <h3 className="mb-2 font-semibold text-gray-900 dark:text-white text-lg">
                                No Applications Yet
                            </h3>
                            <p className="mb-6 text-gray-600 dark:text-gray-400">
                                You haven't submitted any subdivision applications. Start by creating a new application.
                            </p>
                            <Link href="/subdivision-applications/create">
                                <Button variant="primary" size="md" className="flex items-center gap-2 mx-auto">
                                    <Plus size={20} />
                                    Create New Application
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-dark-surface shadow-lg rounded-lg overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 dark:bg-gray-800">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Reference No
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Subdivision Name
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Stage
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Submitted
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-dark-surface divide-y divide-gray-200 dark:divide-gray-700">
                                        {applications.map((app) => (
                                            <tr key={app.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="font-medium text-gray-900 dark:text-white text-sm">
                                                        {app.referenceNo}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-gray-900 dark:text-white text-sm">
                                                        {app.subdivisionName}
                                                    </div>
                                                    <div className="text-gray-500 dark:text-gray-400 text-xs">
                                                        {app.projectAddress}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-xs font-medium">
                                                        {app.currentStage.replace(/\b\w/g, l => l.toUpperCase())}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getStatusBadge(app.status)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400 text-sm">
                                                    {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <Link
                                                        href={`/subdivision-applications/${app.id}`}
                                                        className="text-primary hover:text-primary-dark font-medium text-sm"
                                                    >
                                                        View Details
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
