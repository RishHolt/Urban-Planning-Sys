import { Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import Button from '../../components/Button';
import { Calendar, MapPin, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';

interface Inspection {
    id: number;
    application_id: number;
    inspector_id: number;
    scheduled_date: string;
    findings: string | null;
    result: 'pending' | 'passed' | 'failed';
    inspected_at: string | null;
    clearanceApplication: {
        id: number;
        reference_no: string;
        lot_address: string;
        lot_owner: string;
        status: string;
    };
}

interface InspectionsIndexProps {
    inspections: Inspection[];
}

export default function InspectionsIndex({ inspections }: InspectionsIndexProps) {
    const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);
    const [showRecordModal, setShowRecordModal] = useState(false);

    const { data, setData, put, processing } = useForm({
        findings: '',
        result: 'passed' as 'passed' | 'failed',
    });

    const handleRecordResults = (inspection: Inspection) => {
        setSelectedInspection(inspection);
        setData({
            findings: inspection.findings || '',
            result: inspection.result === 'pending' ? 'passed' : inspection.result,
        });
        setShowRecordModal(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedInspection) {
            put(`/inspections/${selectedInspection.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setShowRecordModal(false);
                    setSelectedInspection(null);
                },
            });
        }
    };

    const getStatusBadge = (result: string) => {
        switch (result) {
            case 'passed':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        <CheckCircle size={12} />
                        Passed
                    </span>
                );
            case 'failed':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                        <XCircle size={12} />
                        Failed
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                        <Clock size={12} />
                        Pending
                    </span>
                );
        }
    };

    return (
        <>
            <AdminLayout
                title="Inspections"
                description="Manage site inspections for clearance applications"
            >
                <div className="space-y-6">
                    {inspections.length === 0 ? (
                        <div className="text-center py-12 bg-white dark:bg-dark-surface rounded-lg shadow">
                            <FileText className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                                No inspections scheduled
                            </h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                You don't have any inspections assigned yet.
                            </p>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-dark-surface shadow rounded-lg overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-800">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Application
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Location
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Scheduled Date
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-dark-surface divide-y divide-gray-200 dark:divide-gray-700">
                                        {inspections.map((inspection) => (
                                            <tr key={inspection.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {inspection.clearanceApplication.reference_no}
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        {inspection.clearanceApplication.lot_owner}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                                        <MapPin size={14} className="mr-1" />
                                                        {inspection.clearanceApplication.lot_address}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                                        <Calendar size={14} className="mr-1" />
                                                        {new Date(inspection.scheduled_date).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getStatusBadge(inspection.result)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    {inspection.result === 'pending' ? (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleRecordResults(inspection)}
                                                        >
                                                            Record Results
                                                        </Button>
                                                    ) : (
                                                        <div className="text-gray-500 dark:text-gray-400">
                                                            {inspection.inspected_at
                                                                ? `Completed ${new Date(inspection.inspected_at).toLocaleDateString()}`
                                                                : 'Completed'}
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </AdminLayout>

            {/* Record Results Modal */}
            {showRecordModal && selectedInspection && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-dark-surface rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                Record Inspection Results
                            </h2>
                            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    <strong>Application:</strong> {selectedInspection.clearanceApplication.reference_no}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    <strong>Location:</strong> {selectedInspection.clearanceApplication.lot_address}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    <strong>Scheduled Date:</strong> {new Date(selectedInspection.scheduled_date).toLocaleDateString()}
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Inspection Result *
                                    </label>
                                    <select
                                        value={data.result}
                                        onChange={(e) => setData('result', e.target.value as 'passed' | 'failed')}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
                                        required
                                    >
                                        <option value="passed">Passed</option>
                                        <option value="failed">Failed</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Findings
                                    </label>
                                    <textarea
                                        value={data.findings}
                                        onChange={(e) => setData('findings', e.target.value)}
                                        rows={6}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
                                        placeholder="Enter inspection findings, observations, and any issues found..."
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => {
                                            setShowRecordModal(false);
                                            setSelectedInspection(null);
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Recording...' : 'Record Results'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
