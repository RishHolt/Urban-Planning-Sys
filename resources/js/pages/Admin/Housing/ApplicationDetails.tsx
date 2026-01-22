import { router } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import AdminContentCard from '../../../components/AdminContentCard';
import Button from '../../../components/Button';

interface ApplicationDetailsProps {
    application: {
        id: string;
        applicationNumber: string;
        applicationType: string;
        status: string;
        submittedAt: string | null;
        beneficiary: any;
        household: any;
        documents: Array<{
            id: string;
            documentType: string;
            fileName: string | null;
            status: string;
            url: string | null;
        }>;
        statusHistory: Array<{
            id: string;
            statusFrom: string | null;
            statusTo: string;
            notes: string | null;
            createdAt: string;
        }>;
    };
}

export default function ApplicationDetails({ application }: ApplicationDetailsProps) {
    const [status, setStatus] = useState(application.status);
    const [notes, setNotes] = useState('');

    const handleStatusUpdate = (newStatus: string) => {
        router.patch(`/admin/housing/applications/${application.id}/status`, {
            status: newStatus,
            notes,
        });
    };

    return (
        <AdminLayout
            title="Application Details"
            description="Review and manage application details"
            backButton={{
                href: '/admin/housing/applications',
                label: 'Back to Applications',
            }}
        >
            <AdminContentCard padding="lg" className="mb-6">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <p className="text-gray-600 dark:text-gray-400 mb-2">
                                    Application Number: <span className="font-mono font-semibold text-gray-900 dark:text-white">{application.applicationNumber}</span>
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="inline-block px-4 py-2 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-semibold">
                                    {application.status}
                                </div>
                            </div>
                        </div>

                        {/* Status Update Section */}
                        <div className="mb-6 p-4 bg-gray-50 dark:bg-dark-bg rounded-lg">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Update Status</h3>
                            <div className="flex gap-4 mb-4">
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="px-4 py-2 border rounded-lg dark:bg-dark-surface dark:border-gray-700 dark:text-white"
                                >
                                    <option value="draft">Draft</option>
                                    <option value="submitted">Submitted</option>
                                    <option value="under_review">Under Review</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                                <Button variant="primary" onClick={() => handleStatusUpdate(status)}>
                                    Update Status
                                </Button>
                            </div>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Add notes..."
                                className="w-full px-4 py-2 border rounded-lg dark:bg-dark-surface dark:border-gray-700 dark:text-white"
                                rows={3}
                            />
                        </div>

                        {/* Documents Section */}
                        <div className="mb-6">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Documents</h3>
                            <div className="space-y-2">
                                {application.documents.map((doc) => (
                                    <div
                                        key={doc.id}
                                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-bg rounded-lg"
                                    >
                                        <div>
                                            <div className="font-medium text-gray-900 dark:text-white">
                                                {doc.documentType}
                                            </div>
                                            {doc.fileName && (
                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                    {doc.fileName}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`px-3 py-1 rounded text-sm ${
                                                    doc.status === 'approved'
                                                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                                        : doc.status === 'rejected'
                                                        ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                                                        : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                                                }`}
                                            >
                                                {doc.status}
                                            </span>
                                            {doc.url && (
                                                <a
                                                    href={doc.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 dark:text-blue-400 hover:underline"
                                                >
                                                    View
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Status History */}
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Status History</h3>
                            <div className="space-y-3">
                                {application.statusHistory.map((history) => (
                                    <div
                                        key={history.id}
                                        className="p-4 bg-gray-50 dark:bg-dark-bg rounded-lg border-l-4 border-blue-500"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="font-medium text-gray-900 dark:text-white">
                                                {history.statusFrom
                                                    ? `${history.statusFrom} → ${history.statusTo}`
                                                    : history.statusTo}
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                {history.createdAt}
                                            </div>
                                        </div>
                                        {history.notes && (
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{history.notes}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
            </AdminContentCard>
        </AdminLayout>
    );
}
