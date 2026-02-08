import { Link, router } from '@inertiajs/react';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import Button from '../../../components/Button';
import { ArrowLeft } from 'lucide-react';

interface ApplicationDetailsProps {
    application: {
        id: string;
        referenceNo: string;
        zoningClearanceNo: string;
        applicantType: string;
        contactNumber: string;
        contactEmail: string | null;
        pinLat: number;
        pinLng: number;
        projectAddress: string;
        developerName: string;
        subdivisionName: string;
        projectDescription: string | null;
        totalAreaSqm: number;
        totalLotsPlanned: number;
        openSpacePercentage: number;
        currentStage: string;
        status: string;
        submittedAt: string | null;
    };
}

export default function ApplicationDetails({ application }: ApplicationDetailsProps) {
    const getStatusBadge = (status: string) => {
        const statusColors: Record<string, string> = {
            submitted: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
            returned: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            revision: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
        };

        const color = statusColors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
                {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
            </span>
        );
    };

    return (
        <div className="flex flex-col bg-background dark:bg-dark-bg w-full min-h-dvh transition-colors">
            <Header />
            <main className="flex-1 mt-16 py-8 md:py-12">
                <div className="mx-auto px-4 max-w-4xl">
                    <div className="mb-6">
                        <Link href="/development-clearance">
                            <Button variant="secondary" size="sm" className="flex items-center gap-2">
                                <ArrowLeft size={18} />
                                Back to Applications
                            </Button>
                        </Link>
                    </div>

                    <div className="mb-8">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="mb-2 font-bold text-gray-900 dark:text-white text-3xl">
                                    Application Details
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Reference: {application.referenceNo}
                                </p>
                            </div>
                            {getStatusBadge(application.status)}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-dark-surface shadow-lg rounded-lg p-6 md:p-8 space-y-6">
                        <div>
                            <h2 className="mb-4 font-semibold text-gray-900 dark:text-white text-xl">
                                Application Information
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Reference Number</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{application.referenceNo}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Status</p>
                                    {getStatusBadge(application.status)}
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Zoning Clearance</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{application.zoningClearanceNo}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Applicant Type</p>
                                    <p className="font-medium text-gray-900 dark:text-white capitalize">
                                        {application.applicantType.replace('_', ' ')}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Contact Number</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{application.contactNumber}</p>
                                </div>
                                {application.contactEmail && (
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Contact Email</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{application.contactEmail}</p>
                                    </div>
                                )}
                                {application.submittedAt && (
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Submitted At</p>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {new Date(application.submittedAt).toLocaleString()}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                            <h2 className="mb-4 font-semibold text-gray-900 dark:text-white text-xl">
                                Project Details
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Developer Name</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{application.developerName}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Subdivision Name</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{application.subdivisionName}</p>
                                </div>
                                <div className="col-span-1 md:col-span-2">
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Project Address</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{application.projectAddress}</p>
                                </div>
                                {application.projectDescription && (
                                    <div className="col-span-1 md:col-span-2">
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Project Description</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{application.projectDescription}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Area</p>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {application.totalAreaSqm.toLocaleString()} sqm
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Lots Planned</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{application.totalLotsPlanned}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Open Space</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{application.openSpacePercentage}%</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Current Stage</p>
                                    <p className="font-medium text-gray-900 dark:text-white capitalize">
                                        {application.currentStage.replace('_', ' ')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
