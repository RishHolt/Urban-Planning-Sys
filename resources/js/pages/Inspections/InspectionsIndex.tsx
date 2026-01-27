import { Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import Button from '../../components/Button';
import { Calendar, MapPin, FileText, CheckCircle, XCircle, Clock, Plus, Camera, Upload, FileCheck, Eye, Download, CheckSquare, AlertCircle, X } from 'lucide-react';

interface ChecklistItem {
    id: number;
    item_name: string;
    description: string | null;
    compliance_status: 'compliant' | 'non_compliant' | 'not_applicable' | 'pending';
    notes: string | null;
}

interface Photo {
    id: number;
    photo_path: string;
    photo_description: string | null;
    taken_at: string | null;
}

interface Document {
    id: number;
    document_type: string;
    file_name: string;
    file_path: string;
    description: string | null;
}

interface Inspection {
    id: number;
    application_id: number;
    inspector_id: number;
    scheduled_date: string;
    findings: string | null;
    recommendations: string | null;
    result: 'pending' | 'passed' | 'failed';
    inspection_status: 'pending' | 'completed' | 'reviewed';
    inspected_at: string | null;
    completed_at: string | null;
    reviewed_at: string | null;
    clearanceApplication: {
        id: number;
        reference_no: string;
        lot_address: string;
        lot_owner: string;
        status: string;
    };
    checklistItems?: ChecklistItem[];
    photos?: Photo[];
    documents?: Document[];
}

interface Inspector {
    id: number;
    name: string;
    email: string;
}

interface Application {
    id: number;
    reference_no: string;
    lot_address: string;
    lot_owner: string;
    status?: string;
    display_label?: string;
}

interface InspectionsIndexProps {
    inspections: Inspection[];
    inspectors?: Inspector[];
    applications?: Application[];
}

export default function InspectionsIndex({ inspections, inspectors = [], applications = [] }: InspectionsIndexProps) {
    const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);
    const [showRecordModal, setShowRecordModal] = useState(false);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showChecklistModal, setShowChecklistModal] = useState(false);
    const [showPhotoModal, setShowPhotoModal] = useState(false);
    const [showDocumentModal, setShowDocumentModal] = useState(false);
    const [reportData, setReportData] = useState<any>(null);

    const { data, setData, put, post, processing } = useForm({
        findings: '',
        recommendations: '',
        result: 'passed' as 'passed' | 'failed',
    });

    const scheduleForm = useForm({
        application_id: '',
        inspector_id: '',
        scheduled_date: '',
        notes: '',
    });

    const [scheduleFormErrors, setScheduleFormErrors] = useState<Record<string, string>>({});

    const checklistForm = useForm({
        item_name: '',
        description: '',
    });

    const photoForm = useForm({
        photo: null as File | null,
        photo_description: '',
    });

    const documentForm = useForm({
        document: null as File | null,
        document_type: '',
        description: '',
    });

    const handleRecordResults = (inspection: Inspection) => {
        setSelectedInspection(inspection);
        setData({
            findings: inspection.findings || '',
            recommendations: inspection.recommendations || '',
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

    const handleScheduleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Clear previous errors
        setScheduleFormErrors({});

        // Client-side validation
        const errors: Record<string, string> = {};

        if (!scheduleForm.data.application_id) {
            errors.application_id = 'Please select an application.';
        }

        if (!scheduleForm.data.inspector_id) {
            errors.inspector_id = 'Please select an inspector.';
        }

        if (!scheduleForm.data.scheduled_date) {
            errors.scheduled_date = 'Please select a scheduled date.';
        } else {
            const selectedDate = new Date(scheduleForm.data.scheduled_date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (selectedDate < today) {
                errors.scheduled_date = 'The scheduled date must be today or a future date.';
            }
        }

        // If there are validation errors, set them and stop submission
        if (Object.keys(errors).length > 0) {
            setScheduleFormErrors(errors);
            return;
        }

        // Submit the form - Inertia will handle the data conversion
        scheduleForm.post('/inspections', {
            preserveScroll: true,
            onSuccess: () => {
                setShowScheduleModal(false);
                scheduleForm.reset();
                setScheduleFormErrors({});
            },
            onError: (errors: Record<string, string>) => {
                // Backend errors are automatically handled by Inertia form
                // Merge with any client-side errors
                if (errors) {
                    setScheduleFormErrors((prev) => ({ ...prev, ...errors }));
                }
            },
        });
    };

    const handleViewDetails = async (inspectionId: number) => {
        router.visit(`/inspections/${inspectionId}`);
    };

    const handleGenerateReport = async (inspectionId: number) => {
        try {
            const response = await fetch(`/inspections/${inspectionId}/report`);
            const data = await response.json();
            setReportData(data);
            setShowDetailModal(true);
        } catch (error) {
            console.error('Error generating report:', error);
        }
    };

    const handleAddChecklistItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedInspection) {
            post(`/inspections/${selectedInspection.id}/checklist-items`, {
                preserveScroll: true,
                onSuccess: () => {
                    checklistForm.reset();
                },
            });
        }
    };

    const handleUpdateChecklistItem = async (itemId: number, status: string, notes?: string) => {
        if (selectedInspection) {
            try {
                await fetch(`/inspections/${selectedInspection.id}/checklist-items/${itemId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    },
                    body: JSON.stringify({
                        compliance_status: status,
                        notes: notes || '',
                    }),
                });
                router.reload({ only: ['inspections'] });
            } catch (error) {
                console.error('Error updating checklist item:', error);
            }
        }
    };

    const handleUploadPhoto = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedInspection) {
            post(`/inspections/${selectedInspection.id}/photos`, {
                preserveScroll: true,
                forceFormData: true,
                onSuccess: () => {
                    photoForm.reset();
                    setShowPhotoModal(false);
                },
            });
        }
    };

    const handleUploadDocument = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedInspection) {
            post(`/inspections/${selectedInspection.id}/documents`, {
                preserveScroll: true,
                forceFormData: true,
                onSuccess: () => {
                    documentForm.reset();
                    setShowDocumentModal(false);
                },
            });
        }
    };

    const getStatusBadge = (result: string, inspectionStatus?: string) => {
        if (inspectionStatus === 'reviewed') {
            return (
                <span className="inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded-full font-medium text-blue-800 dark:text-blue-200 text-xs">
                    <FileCheck size={12} />
                    Reviewed
                </span>
            );
        }
        if (inspectionStatus === 'completed') {
            return (
                <span className="inline-flex items-center gap-1 bg-purple-100 dark:bg-purple-900 px-2 py-1 rounded-full font-medium text-purple-800 dark:text-purple-200 text-xs">
                    <CheckCircle size={12} />
                    Completed
                </span>
            );
        }
        switch (result) {
            case 'passed':
                return (
                    <span className="inline-flex items-center gap-1 bg-green-100 dark:bg-green-900 px-2 py-1 rounded-full font-medium text-green-800 dark:text-green-200 text-xs">
                        <CheckCircle size={12} />
                        Passed
                    </span>
                );
            case 'failed':
                return (
                    <span className="inline-flex items-center gap-1 bg-red-100 dark:bg-red-900 px-2 py-1 rounded-full font-medium text-red-800 dark:text-red-200 text-xs">
                        <XCircle size={12} />
                        Failed
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900 px-2 py-1 rounded-full font-medium text-yellow-800 dark:text-yellow-200 text-xs">
                        <Clock size={12} />
                        Pending
                    </span>
                );
        }
    };

    const isAdminOrStaff = inspectors.length > 0;

    return (
        <>
            <AdminLayout
                title="Inspections"
                description="Manage site inspections for clearance applications"
            >
                <div className="space-y-6">
                    {isAdminOrStaff && (
                        <div className="flex justify-end">
                            <Button onClick={() => setShowScheduleModal(true)}>
                                <Plus size={16} className="mr-2" />
                                Schedule Inspection
                            </Button>
                        </div>
                    )}

                    {inspections.length === 0 ? (
                        <div className="bg-white dark:bg-dark-surface shadow py-12 rounded-lg text-center">
                            <FileText className="mx-auto w-12 h-12 text-gray-400" />
                            <h3 className="mt-2 font-medium text-gray-900 dark:text-white text-sm">
                                No inspections scheduled
                            </h3>
                            <p className="mt-1 text-gray-500 dark:text-gray-400 text-sm">
                                {isAdminOrStaff
                                    ? 'Schedule an inspection to get started.'
                                    : "You don't have any inspections assigned yet."}
                            </p>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-dark-surface shadow rounded-lg overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="divide-y divide-gray-200 dark:divide-gray-700 min-w-full">
                                    <thead className="bg-gray-50 dark:bg-gray-800">
                                        <tr>
                                            <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400 text-xs text-left uppercase tracking-wider">
                                                Application
                                            </th>
                                            <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400 text-xs text-left uppercase tracking-wider">
                                                Location
                                            </th>
                                            <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400 text-xs text-left uppercase tracking-wider">
                                                Scheduled Date
                                            </th>
                                            <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400 text-xs text-left uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400 text-xs text-left uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-dark-surface divide-y divide-gray-200 dark:divide-gray-700">
                                        {inspections.map((inspection) => (
                                            <tr key={inspection.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="font-medium text-gray-900 dark:text-white text-sm">
                                                        {inspection.clearanceApplication.reference_no}
                                                    </div>
                                                    <div className="text-gray-500 dark:text-gray-400 text-sm">
                                                        {inspection.clearanceApplication.lot_owner}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                                                        <MapPin size={14} className="mr-1" />
                                                        {inspection.clearanceApplication.lot_address}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                                                        <Calendar size={14} className="mr-1" />
                                                        {new Date(inspection.scheduled_date).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getStatusBadge(inspection.result, inspection.inspection_status)}
                                                </td>
                                                <td className="px-6 py-4 font-medium text-sm whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="secondary"
                                                            onClick={() => handleViewDetails(inspection.id)}
                                                        >
                                                            <Eye size={14} className="mr-1" />
                                                            View
                                                        </Button>
                                                        {inspection.result === 'pending' && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => {
                                                                    setSelectedInspection(inspection);
                                                                    setShowChecklistModal(true);
                                                                }}
                                                            >
                                                                <CheckSquare size={14} className="mr-1" />
                                                                Checklist
                                                            </Button>
                                                        )}
                                                        {inspection.inspection_status === 'completed' && (
                                                            <Button
                                                                size="sm"
                                                                variant="secondary"
                                                                onClick={() => handleGenerateReport(inspection.id)}
                                                            >
                                                                <Download size={14} className="mr-1" />
                                                                Report
                                                            </Button>
                                                        )}
                                                    </div>
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

            {/* Schedule Inspection Modal */}
            {showScheduleModal && (
                <div
                    className="z-50 fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-sm p-4"
                    onClick={() => {
                        setShowScheduleModal(false);
                        scheduleForm.reset();
                    }}
                >
                    <div
                        className="relative flex flex-col bg-white dark:bg-dark-surface shadow-2xl rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="top-0 z-10 sticky flex justify-between items-center bg-white dark:bg-dark-surface px-6 py-4 border-gray-200 dark:border-gray-700 border-b">
                            <div>
                                <h2 className="font-bold text-gray-900 dark:text-white text-2xl">
                                    Schedule Inspection
                                </h2>
                                <p className="mt-1 text-gray-600 dark:text-gray-400 text-sm">
                                    Schedule a new inspection for a zoning application
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowScheduleModal(false);
                                    scheduleForm.reset();
                                    setScheduleFormErrors({});
                                }}
                                className="hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors"
                                aria-label="Close modal"
                            >
                                <X size={24} className="text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 px-6 py-6 overflow-y-auto">
                            <form onSubmit={handleScheduleSubmit} className="space-y-4">
                                <div>
                                    <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                        Application *
                                    </label>
                                    <select
                                        value={scheduleForm.data.application_id}
                                        onChange={(e) => {
                                            scheduleForm.setData('application_id', e.target.value);
                                            if (scheduleFormErrors.application_id) {
                                                setScheduleFormErrors((prev) => {
                                                    const updated = { ...prev };
                                                    delete updated.application_id;
                                                    return updated;
                                                });
                                            }
                                        }}
                                        className="bg-white dark:bg-dark-surface px-3 py-2 border border-gray-300 focus:border-transparent dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary w-full text-gray-900 dark:text-white"
                                        required
                                    >
                                        <option value="">Select Application</option>
                                        {applications.map((app) => (
                                            <option key={app.id} value={app.id} title={app.lot_address}>
                                                {app.display_label || `${app.reference_no} - ${app.lot_owner}`}
                                            </option>
                                        ))}
                                    </select>
                                    {(scheduleForm.errors.application_id || scheduleFormErrors.application_id) && (
                                        <p className="mt-1 text-red-600 dark:text-red-400 text-sm">
                                            {scheduleForm.errors.application_id || scheduleFormErrors.application_id}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                        Inspector *
                                    </label>
                                    <select
                                        value={scheduleForm.data.inspector_id}
                                        onChange={(e) => {
                                            scheduleForm.setData('inspector_id', e.target.value);
                                            if (scheduleFormErrors.inspector_id) {
                                                setScheduleFormErrors((prev) => {
                                                    const updated = { ...prev };
                                                    delete updated.inspector_id;
                                                    return updated;
                                                });
                                            }
                                        }}
                                        className="bg-white dark:bg-dark-surface px-3 py-2 border border-gray-300 focus:border-transparent dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary w-full text-gray-900 dark:text-white"
                                        required
                                    >
                                        <option value="">Select Inspector</option>
                                        {inspectors.map((inspector) => (
                                            <option key={inspector.id} value={inspector.id}>
                                                {inspector.name} ({inspector.email})
                                            </option>
                                        ))}
                                    </select>
                                    {(scheduleForm.errors.inspector_id || scheduleFormErrors.inspector_id) && (
                                        <p className="mt-1 text-red-600 dark:text-red-400 text-sm">
                                            {scheduleForm.errors.inspector_id || scheduleFormErrors.inspector_id}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                        Scheduled Date *
                                    </label>
                                    <input
                                        type="date"
                                        value={scheduleForm.data.scheduled_date}
                                        onChange={(e) => {
                                            scheduleForm.setData('scheduled_date', e.target.value);
                                            if (scheduleFormErrors.scheduled_date) {
                                                setScheduleFormErrors((prev) => {
                                                    const updated = { ...prev };
                                                    delete updated.scheduled_date;
                                                    return updated;
                                                });
                                            }
                                        }}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="bg-white dark:bg-dark-surface px-3 py-2 border border-gray-300 focus:border-transparent dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary w-full text-gray-900 dark:text-white"
                                        required
                                    />
                                    {(scheduleForm.errors.scheduled_date || scheduleFormErrors.scheduled_date) && (
                                        <p className="mt-1 text-red-600 dark:text-red-400 text-sm">
                                            {scheduleForm.errors.scheduled_date || scheduleFormErrors.scheduled_date}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                        Notes
                                    </label>
                                    <textarea
                                        value={scheduleForm.data.notes}
                                        onChange={(e) => scheduleForm.setData('notes', e.target.value)}
                                        rows={3}
                                        className="bg-white dark:bg-dark-surface px-3 py-2 border border-gray-300 focus:border-transparent dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary w-full text-gray-900 dark:text-white"
                                        placeholder="Additional notes for the inspector..."
                                    />
                                </div>
                                <div className="flex justify-end gap-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => {
                                            setShowScheduleModal(false);
                                            scheduleForm.reset();
                                            setScheduleFormErrors({});
                                        }}
                                        disabled={scheduleForm.processing}
                                    >
                                        Cancel
                                    </Button>
                                    <Button 
                                        type="submit" 
                                        disabled={scheduleForm.processing || !scheduleForm.data.application_id || !scheduleForm.data.inspector_id || !scheduleForm.data.scheduled_date}
                                    >
                                        {scheduleForm.processing ? 'Scheduling...' : 'Schedule Inspection'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Record Results Modal */}
            {showRecordModal && selectedInspection && (
                <div className="z-50 fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-dark-surface shadow-xl rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <h2 className="mb-4 font-bold text-gray-900 dark:text-white text-2xl">
                                Record Inspection Results
                            </h2>
                            <div className="bg-gray-50 dark:bg-gray-800 mb-4 p-4 rounded-lg">
                                <p className="text-gray-600 dark:text-gray-400 text-sm">
                                    <strong>Application:</strong> {selectedInspection.clearanceApplication.reference_no}
                                </p>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">
                                    <strong>Location:</strong> {selectedInspection.clearanceApplication.lot_address}
                                </p>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">
                                    <strong>Scheduled Date:</strong> {new Date(selectedInspection.scheduled_date).toLocaleDateString()}
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                        Inspection Result *
                                    </label>
                                    <select
                                        value={data.result}
                                        onChange={(e) => setData('result', e.target.value as 'passed' | 'failed')}
                                        className="bg-white dark:bg-dark-surface px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg w-full text-gray-900 dark:text-white"
                                        required
                                    >
                                        <option value="passed">Passed</option>
                                        <option value="failed">Failed</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                        Findings
                                    </label>
                                    <textarea
                                        value={data.findings}
                                        onChange={(e) => setData('findings', e.target.value)}
                                        rows={6}
                                        className="bg-white dark:bg-dark-surface px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg w-full text-gray-900 dark:text-white"
                                        placeholder="Enter inspection findings, observations, and any issues found..."
                                    />
                                </div>

                                <div>
                                    <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                        Recommendations
                                    </label>
                                    <textarea
                                        value={data.recommendations}
                                        onChange={(e) => setData('recommendations', e.target.value)}
                                        rows={4}
                                        className="bg-white dark:bg-dark-surface px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg w-full text-gray-900 dark:text-white"
                                        placeholder="Enter recommendations for improvements or follow-up actions..."
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

            {/* Checklist Modal */}
            {showChecklistModal && selectedInspection && (
                <div className="z-50 fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-dark-surface shadow-xl rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="font-bold text-gray-900 dark:text-white text-2xl">
                                    Inspection Checklist
                                </h2>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={() => setShowPhotoModal(true)}
                                    >
                                        <Camera size={14} className="mr-1" />
                                        Add Photo
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={() => setShowDocumentModal(true)}
                                    >
                                        <Upload size={14} className="mr-1" />
                                        Add Document
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={() => handleRecordResults(selectedInspection)}
                                    >
                                        Complete Inspection
                                    </Button>
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-800 mb-4 p-4 rounded-lg">
                                <p className="text-gray-600 dark:text-gray-400 text-sm">
                                    <strong>Application:</strong> {selectedInspection.clearanceApplication.reference_no}
                                </p>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">
                                    <strong>Location:</strong> {selectedInspection.clearanceApplication.lot_address}
                                </p>
                            </div>

                            {/* Add Checklist Item Form */}
                            <form onSubmit={handleAddChecklistItem} className="bg-gray-50 dark:bg-gray-800 mb-6 p-4 rounded-lg">
                                <h3 className="mb-3 font-semibold text-gray-900 dark:text-white text-lg">
                                    Add Checklist Item
                                </h3>
                                <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                                    <div>
                                        <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                            Item Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={checklistForm.data.item_name}
                                            onChange={(e) => checklistForm.setData('item_name', e.target.value)}
                                            className="bg-white dark:bg-dark-surface px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg w-full text-gray-900 dark:text-white"
                                            placeholder="e.g., Zoning Compliance"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                            Description
                                        </label>
                                        <input
                                            type="text"
                                            value={checklistForm.data.description}
                                            onChange={(e) => checklistForm.setData('description', e.target.value)}
                                            className="bg-white dark:bg-dark-surface px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg w-full text-gray-900 dark:text-white"
                                            placeholder="Brief description"
                                        />
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <Button type="submit" size="sm" disabled={checklistForm.processing}>
                                        <Plus size={14} className="mr-1" />
                                        Add Item
                                    </Button>
                                </div>
                            </form>

                            {/* Checklist Items */}
                            <div className="space-y-3">
                                <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                                    Checklist Items
                                </h3>
                                {selectedInspection.checklistItems && selectedInspection.checklistItems.length > 0 ? (
                                    selectedInspection.checklistItems.map((item) => (
                                        <div
                                            key={item.id}
                                            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                                        {item.item_name}
                                                    </h4>
                                                    {item.description && (
                                                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                                                            {item.description}
                                                        </p>
                                                    )}
                                                </div>
                                                <select
                                                    value={item.compliance_status}
                                                    onChange={(e) =>
                                                        handleUpdateChecklistItem(
                                                            item.id,
                                                            e.target.value,
                                                            item.notes || undefined
                                                        )
                                                    }
                                                    className="bg-white dark:bg-dark-surface px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-sm"
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="compliant">Compliant</option>
                                                    <option value="non_compliant">Non-Compliant</option>
                                                    <option value="not_applicable">Not Applicable</option>
                                                </select>
                                            </div>
                                            {item.notes && (
                                                <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">
                                                    <strong>Notes:</strong> {item.notes}
                                                </p>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                                        No checklist items yet. Add items above.
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 mt-6 pt-4">
                                <Button
                                    variant="secondary"
                                    onClick={() => {
                                        setShowChecklistModal(false);
                                        setSelectedInspection(null);
                                    }}
                                >
                                    Close
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Photo Upload Modal */}
            {showPhotoModal && selectedInspection && (
                <div className="z-50 fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-dark-surface shadow-xl rounded-lg w-full max-w-md">
                        <div className="p-6">
                            <h2 className="mb-4 font-bold text-gray-900 dark:text-white text-xl">
                                Upload Photo
                            </h2>
                            <form onSubmit={handleUploadPhoto} className="space-y-4">
                                <div>
                                    <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                        Photo *
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                photoForm.setData('photo', file);
                                            }
                                        }}
                                        className="bg-white dark:bg-dark-surface px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg w-full text-gray-900 dark:text-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                        Description
                                    </label>
                                    <textarea
                                        value={photoForm.data.photo_description}
                                        onChange={(e) => photoForm.setData('photo_description', e.target.value)}
                                        rows={3}
                                        className="bg-white dark:bg-dark-surface px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg w-full text-gray-900 dark:text-white"
                                        placeholder="Describe what this photo shows..."
                                    />
                                </div>
                                <div className="flex justify-end gap-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => setShowPhotoModal(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={photoForm.processing}>
                                        {photoForm.processing ? 'Uploading...' : 'Upload Photo'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Document Upload Modal */}
            {showDocumentModal && selectedInspection && (
                <div className="z-50 fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-dark-surface shadow-xl rounded-lg w-full max-w-md">
                        <div className="p-6">
                            <h2 className="mb-4 font-bold text-gray-900 dark:text-white text-xl">
                                Upload Document
                            </h2>
                            <form onSubmit={handleUploadDocument} className="space-y-4">
                                <div>
                                    <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                        Document Type *
                                    </label>
                                    <select
                                        value={documentForm.data.document_type}
                                        onChange={(e) => documentForm.setData('document_type', e.target.value)}
                                        className="bg-white dark:bg-dark-surface px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg w-full text-gray-900 dark:text-white"
                                        required
                                    >
                                        <option value="">Select Type</option>
                                        <option value="inspection_report">Inspection Report</option>
                                        <option value="evidence">Evidence</option>
                                        <option value="correspondence">Correspondence</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                        Document *
                                    </label>
                                    <input
                                        type="file"
                                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                documentForm.setData('document', file);
                                            }
                                        }}
                                        className="bg-white dark:bg-dark-surface px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg w-full text-gray-900 dark:text-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                        Description
                                    </label>
                                    <textarea
                                        value={documentForm.data.description}
                                        onChange={(e) => documentForm.setData('description', e.target.value)}
                                        rows={3}
                                        className="bg-white dark:bg-dark-surface px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg w-full text-gray-900 dark:text-white"
                                        placeholder="Describe the document..."
                                    />
                                </div>
                                <div className="flex justify-end gap-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => setShowDocumentModal(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={documentForm.processing}>
                                        {documentForm.processing ? 'Uploading...' : 'Upload Document'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Report Modal */}
            {showDetailModal && reportData && (
                <div className="z-50 fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-dark-surface shadow-xl rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="font-bold text-gray-900 dark:text-white text-2xl">
                                    Inspection Report
                                </h2>
                                <Button
                                    variant="secondary"
                                    onClick={() => {
                                        const printWindow = window.open('', '_blank');
                                        if (printWindow) {
                                            printWindow.document.write(`
                                                <html>
                                                    <head><title>Inspection Report</title></head>
                                                    <body>
                                                        <h1>Inspection Report</h1>
                                                        <pre>${JSON.stringify(reportData, null, 2)}</pre>
                                                    </body>
                                                </html>
                                            `);
                                            printWindow.document.close();
                                            printWindow.print();
                                        }
                                    }}
                                >
                                    <Download size={16} className="mr-2" />
                                    Print/Download
                                </Button>
                            </div>
                            <div className="space-y-4">
                                <div className="gap-4 grid grid-cols-2">
                                    <div>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm">Application Reference</p>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {reportData.application_reference}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm">Scheduled Date</p>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {reportData.scheduled_date}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm">Inspector</p>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {reportData.inspector}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm">Result</p>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {reportData.result}
                                        </p>
                                    </div>
                                </div>
                                {reportData.findings && (
                                    <div>
                                        <p className="mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                            Findings
                                        </p>
                                        <p className="text-gray-900 dark:text-white">{reportData.findings}</p>
                                    </div>
                                )}
                                {reportData.recommendations && (
                                    <div>
                                        <p className="mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                            Recommendations
                                        </p>
                                        <p className="text-gray-900 dark:text-white">{reportData.recommendations}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                        Checklist Summary
                                    </p>
                                    <div className="gap-4 grid grid-cols-4">
                                        <div>
                                            <p className="text-gray-600 dark:text-gray-400 text-sm">Total Items</p>
                                            <p className="font-bold text-gray-900 dark:text-white text-2xl">
                                                {reportData.checklist_summary.total_items}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600 dark:text-gray-400 text-sm">Compliant</p>
                                            <p className="font-bold text-green-600 text-2xl">
                                                {reportData.checklist_summary.compliant}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600 dark:text-gray-400 text-sm">Non-Compliant</p>
                                            <p className="font-bold text-red-600 text-2xl">
                                                {reportData.checklist_summary.non_compliant}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600 dark:text-gray-400 text-sm">Pending</p>
                                            <p className="font-bold text-yellow-600 text-2xl">
                                                {reportData.checklist_summary.pending}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end mt-6 pt-4">
                                <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
                                    Close
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
