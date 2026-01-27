import { Link } from '@inertiajs/react';
import AdminLayout from '../../../components/AdminLayout';
import Button from '../../../components/Button';
import { FileText, Calendar, CheckCircle, XCircle, Clock, Download, ArrowLeft } from 'lucide-react';

interface ClearanceApplication {
    id: number;
    reference_no: string;
    lot_address: string;
    lot_owner: string;
    status: string;
    applicant_type: string;
    zone?: {
        name: string;
        code: string;
    };
}

interface IssuedClearance {
    id: number;
    clearance_no: string;
    application_id: number;
    issue_date: string;
    valid_until: string | null;
    conditions: string | null;
    status: 'active' | 'revoked' | 'expired';
    created_at: string;
    clearanceApplication: ClearanceApplication;
}

interface ClearanceDetailsProps {
    clearance: IssuedClearance;
}

export default function ClearanceDetails({ clearance }: ClearanceDetailsProps) {
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        <CheckCircle size={16} />
                        Active
                    </span>
                );
            case 'revoked':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                        <XCircle size={16} />
                        Revoked
                    </span>
                );
            case 'expired':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                        <Clock size={16} />
                        Expired
                    </span>
                );
            default:
                return null;
        }
    };

    const isExpired = clearance.valid_until && new Date(clearance.valid_until) < new Date();

    return (
        <AdminLayout
            title="Clearance Details"
            description="View issued zoning clearance certificate"
            backButton={{
                href: '/clearances',
                label: 'Back to Clearances',
            }}
        >
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white dark:bg-dark-surface rounded-lg shadow-md p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                Zoning Clearance Certificate
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                {clearance.clearance_no}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            {getStatusBadge(clearance.status)}
                            {isExpired && clearance.status === 'active' && (
                                <span className="px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                                    Expired
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <span className="text-sm text-gray-500 dark:text-gray-400">Issue Date</span>
                                <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                                    {new Date(clearance.issue_date).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </p>
                            </div>
                            {clearance.valid_until && (
                                <div>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Valid Until</span>
                                    <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                                        {new Date(clearance.valid_until).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Application Information */}
                <div className="bg-white dark:bg-dark-surface rounded-lg shadow-md p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <FileText size={20} />
                        Application Information
                    </h2>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">Reference Number</span>
                            <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                                {clearance.clearanceApplication.reference_no}
                            </p>
                        </div>
                        <div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">Applicant Type</span>
                            <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white capitalize">
                                {clearance.clearanceApplication.applicant_type?.replace('_', ' ')}
                            </p>
                        </div>
                        <div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">Lot Owner</span>
                            <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                                {clearance.clearanceApplication.lot_owner}
                            </p>
                        </div>
                        {clearance.clearanceApplication.zone && (
                            <div>
                                <span className="text-sm text-gray-500 dark:text-gray-400">Zone</span>
                                <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                                    {clearance.clearanceApplication.zone.name} ({clearance.clearanceApplication.zone.code})
                                </p>
                            </div>
                        )}
                        <div className={clearance.clearanceApplication.zone ? 'col-span-2' : ''}>
                            <span className="text-sm text-gray-500 dark:text-gray-400">Location</span>
                            <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                                {clearance.clearanceApplication.lot_address}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Conditions */}
                {clearance.conditions && (
                    <div className="bg-white dark:bg-dark-surface rounded-lg shadow-md p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Conditions
                        </h2>
                        <div className="prose dark:prose-invert max-w-none">
                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                {clearance.conditions}
                            </p>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="bg-white dark:bg-dark-surface rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between">
                        <Link
                            href={`/admin/clearance/applications/${clearance.clearanceApplication.id}`}
                            className="text-sm text-primary hover:underline"
                        >
                            View Application Details
                        </Link>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(`/clearances/${clearance.id}/view`, '_blank')}
                            >
                                <FileText size={16} className="mr-2" />
                                View PDF
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.location.href = `/clearances/${clearance.id}/download`}
                            >
                                <Download size={16} className="mr-2" />
                                Download PDF
                            </Button>
                            <Link href="/clearances">
                                <Button variant="secondary" size="sm">
                                    <ArrowLeft size={16} className="mr-2" />
                                    Back to Clearances
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
