import { router, useForm, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import ApplicationTimeline, { TimelineItem } from '../../components/StatusHistory';
import Button from '../../components/Button';
import { getCsrfToken } from '../../data/services';
import { showSuccess, showError, showConfirm } from '../../lib/swal';
import {
    Calendar,
    MapPin,
    User,
    Clock,
    CheckCircle,
    XCircle,
    FileText,
    Camera,
    Upload,
    Plus,
    AlertCircle,
    ClipboardList,
    FileCheck,
    ExternalLink,
    Building,
} from 'lucide-react';
import ApplicationDetailsTabs, { TabPanel } from '../../components/ApplicationDetailsTabs';

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
    uploaded_by?: { id: number; email: string; profile?: { first_name: string; last_name: string } };
}

interface InspectionDoc {
    id: number;
    document_type: string;
    file_name: string;
    file_path: string;
    file_size: number | null;
    description: string | null;
    uploaded_by?: { id: number; email: string; profile?: { first_name: string; last_name: string } };
}

interface StatusHistoryEntry {
    id: number;
    status_to: string;
    notes: string | null;
    created_at: string;
    changed_by?: { profile?: { first_name: string; last_name: string } };
}

interface Inspection {
    id: number;
    application_id: number;
    inspector_id: number;
    scheduled_date: string;
    result: 'pending' | 'passed' | 'failed';
    inspection_status: 'pending' | 'completed' | 'reviewed';
    findings: string | null;
    recommendations: string | null;
    inspected_at: string | null;
    completed_at: string | null;
    reviewed_at: string | null;
    review_notes: string | null;
    clearance_application: {
        id: number;
        reference_no: string;
        lot_address: string;
        lot_owner: string;
        status: string;
        applicant_name?: string;
        municipality?: string;
        barangay?: string;
        status_history?: StatusHistoryEntry[];
    };
    inspector?: {
        id: number;
        email: string;
        profile?: { first_name: string; last_name: string; middle_name?: string };
    };
    reviewer?: {
        id: number;
        email: string;
        profile?: { first_name: string; last_name: string };
    };
    checklist_items?: ChecklistItem[];
    photos?: Photo[];
    documents?: InspectionDoc[];
}

interface InspectionShowProps {
    inspection: Inspection;
}

type Tab = 'report' | 'timeline';

function StatusPill({ result, status }: { result: string; status: string }) {
    if (status === 'reviewed') {
        return (
            <span className="inline-flex items-center gap-1.5 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                <FileCheck size={12} /> Reviewed
            </span>
        );
    }
    if (status === 'completed') {
        return (
            <span className="inline-flex items-center gap-1.5 bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                <CheckCircle size={12} /> Completed
            </span>
        );
    }
    if (result === 'passed') {
        return (
            <span className="inline-flex items-center gap-1.5 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                <CheckCircle size={12} /> Passed
            </span>
        );
    }
    if (result === 'failed') {
        return (
            <span className="inline-flex items-center gap-1.5 bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                <XCircle size={12} /> Failed
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1.5 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
            <Clock size={12} /> Pending
        </span>
    );
}

function ComplianceBadge({ status }: { status: string }) {
    const map = {
        compliant: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
        non_compliant: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
        not_applicable: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
        pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
    };
    const labels = { compliant: 'Compliant', non_compliant: 'Non-Compliant', not_applicable: 'N/A', pending: 'Pending' };
    return (
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${map[status as keyof typeof map] ?? map.pending}`}>
            {labels[status as keyof typeof labels] ?? status}
        </span>
    );
}

export default function InspectionShow({ inspection }: InspectionShowProps) {
    const { props } = usePage<any>();
    const flash = props.flash as { success?: string; error?: string };

    // Handle flash messages with Swal
    useEffect(() => {
        if (flash?.success) {
            showSuccess(flash.success);
        }
        if (flash?.error) {
            showError(flash.error);
        }
    }, [flash]);

    const isCompleted = inspection.inspection_status !== 'pending';

    // Checklist form
    const checklistForm = useForm({ item_name: '', description: '' });
    const [updatingItem, setUpdatingItem] = useState<number | null>(null);

    // Photo upload form
    const photoForm = useForm({ photo: null as File | null, photo_description: '' });

    // Document upload form
    const documentForm = useForm({ document: null as File | null, document_type: '', description: '' });

    // Complete inspection form
    const completeForm = useForm({ findings: inspection.findings ?? '', recommendations: inspection.recommendations ?? '', result: null as 'passed' | 'failed' | null });

    // Review form
    const reviewForm = useForm({ review_notes: '' });

    const inspectorName = inspection.inspector?.profile
        ? `${inspection.inspector.profile.first_name} ${inspection.inspector.profile.last_name}`
        : inspection.inspector?.email ?? `Inspector #${inspection.inspector_id}`;

    const checklistItems = inspection.checklist_items ?? [];
    const checkedItems = checklistItems.filter((c) => c.compliance_status !== 'pending').length;
    const pct = checklistItems.length > 0 ? Math.round((checkedItems / checklistItems.length) * 100) : 0;
    const photos = inspection.photos ?? [];
    const documents = inspection.documents ?? [];

    // --- Handlers ---

    const handleAddChecklistItem = (e: React.FormEvent) => {
        e.preventDefault();
        checklistForm.post(`/admin/zoning/inspections/${inspection.id}/checklist-items`, {
            preserveScroll: true,
            onSuccess: () => checklistForm.reset(),
        });
    };

    const handleUpdateChecklist = (itemId: number, status: string) => {
        setUpdatingItem(itemId);
        router.put(`/admin/zoning/inspections/${inspection.id}/checklist-items/${itemId}`, {
            compliance_status: status,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                showSuccess('Compliance status updated successfully.', 'Status Updated');
            },
            onError: () => {
                showError('Failed to update compliance status.');
            },
            onFinish: () => setUpdatingItem(null),
        });
    };

    const handleUploadPhoto = (e: React.FormEvent) => {
        e.preventDefault();
        photoForm.post(`/admin/zoning/inspections/${inspection.id}/photos`, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => photoForm.reset(),
        });
    };

    const handleUploadDocument = (e: React.FormEvent) => {
        e.preventDefault();
        documentForm.post(`/admin/zoning/inspections/${inspection.id}/documents`, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => documentForm.reset(),
        });
    };

    const handleComplete = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!completeForm.data.result) {
            showError('Please select an inspection result (Pass or Fail) before completing.', 'Result Required');
            return;
        }

        const isPassed = completeForm.data.result === 'passed';
        const confirmed = await showConfirm(
            isPassed
                ? 'This will mark the inspection as completed and move the application to For Approval.'
                : 'This will mark the inspection as completed (failed). The application stays in For Inspection for admin review.',
            `Submit as ${isPassed ? 'Passed' : 'Failed'}?`,
            `Yes, submit as ${isPassed ? 'Passed' : 'Failed'}`,
            'Cancel',
            isPassed ? '#16a34a' : '#dc2626',
            isPassed ? 'question' : 'warning'
        );
        if (!confirmed) return;

        completeForm.put(`/admin/zoning/inspections/${inspection.id}`, {
            preserveScroll: true,
            onSuccess: () => showSuccess(
                isPassed ? 'Application has been moved to For Approval.' : 'Inspection marked as failed. Admin review required.',
                'Inspection Submitted!'
            ),
            onError: () => showError('Failed to submit the inspection report. Please try again.'),
        });
    };

    const handleReview = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(`/admin/zoning/inspections/${inspection.id}/review`, {
            review_notes: reviewForm.data.review_notes,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                showSuccess('Inspection result verified.');
            },
        });
    };

    return (
        <AdminLayout
            title={`Inspection Report`}
            description={`${inspection.clearance_application?.reference_no ?? 'Inspection'} — ${inspection.clearance_application?.lot_owner ?? ''}`}
            backButton={{ href: '/admin/zoning/inspections', label: 'Back to Inspections' }}
        >
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Status Header */}
                <div className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-6">
                        <div className="flex flex-col md:flex-row md:items-center gap-6">
                            <div className="space-y-2">
                                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Current Status</p>
                                <StatusPill result={inspection.result} status={inspection.inspection_status} />
                            </div>
                            
                            <div className="h-10 w-px bg-gray-100 dark:bg-gray-800 hidden md:block" />

                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Reference Number</p>
                                <div className="flex items-center gap-2 text-gray-900 dark:text-white font-mono font-bold text-lg">
                                    <Building size={16} className="text-primary" />
                                    {inspection.clearance_application?.reference_no ?? 'N/A'}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-8">
                            <div className="space-y-1 text-right md:text-left">
                                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Assigned Inspector</p>
                                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-semibold">
                                    <User size={14} className="text-gray-400" />
                                    {inspectorName}
                                </div>
                            </div>
                            
                            <div className="space-y-1 text-right">
                                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Scheduled For</p>
                                <div className="flex items-center justify-end gap-2 text-gray-700 dark:text-gray-300 font-semibold">
                                    <Calendar size={14} className="text-gray-400" />
                                    {new Date(inspection.scheduled_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </div>
                            </div>

                            {!isCompleted && (
                                <div className="flex items-center gap-4 bg-primary/5 dark:bg-primary/10 px-5 py-3 rounded-2xl border border-primary/10">
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold text-primary/60 uppercase tracking-widest mb-0.5">Progress</p>
                                        <p className="text-2xl font-black text-primary leading-none">{pct}%</p>
                                        <p className="text-[10px] text-primary/50 mt-1 font-bold">{checkedItems}/{checklistItems.length} ITEMS</p>
                                    </div>
                                    <div className="relative w-12 h-12 flex items-center justify-center">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-primary/10" />
                                            <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray={125} strokeDashoffset={125 - (125 * pct) / 100} strokeLinecap="round" className="text-primary" />
                                        </svg>
                                        <ClipboardList size={14} className="absolute text-primary" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <ApplicationDetailsTabs defaultTab="report">
                    <TabPanel tabId="report">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Left Column: Main Inspection Data */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Checklist Section */}
                                <section className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
                                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                                        <div className="flex items-center gap-2">
                                            <ClipboardList size={18} className="text-primary" />
                                            <h2 className="font-bold text-gray-900 dark:text-white">Inspection Checklist</h2>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        {!isCompleted && (
                                            <form onSubmit={handleAddChecklistItem} className="space-y-3 mb-8 bg-gray-50/50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                                                <div className="flex flex-col sm:flex-row gap-3">
                                                    <div className="flex-[2]">
                                                        <input
                                                            type="text"
                                                            value={checklistForm.data.item_name}
                                                            onChange={(e) => checklistForm.setData('item_name', e.target.value)}
                                                            placeholder="Item name (e.g., Fire Safety)"
                                                            className="w-full bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 rounded-xl px-4 py-2 text-sm focus:ring-primary focus:border-primary shadow-sm"
                                                            disabled={checklistForm.processing}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="flex-[3]">
                                                        <input
                                                            type="text"
                                                            value={checklistForm.data.description}
                                                            onChange={(e) => checklistForm.setData('description', e.target.value)}
                                                            placeholder="Details or specific requirements..."
                                                            className="w-full bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 rounded-xl px-4 py-2 text-sm focus:ring-primary focus:border-primary shadow-sm"
                                                            disabled={checklistForm.processing}
                                                        />
                                                    </div>
                                                    <Button type="submit" variant="primary" size="sm" isLoading={checklistForm.processing} disabled={!checklistForm.data.item_name} className="h-fit py-2 px-6">
                                                        <Plus size={16} className="mr-1" /> Add Item
                                                    </Button>
                                                </div>
                                            </form>
                                        )}

                                        <div className="space-y-3">
                                            {checklistItems.length === 0 ? (
                                                <div className="text-center py-10 text-gray-400">
                                                    <ClipboardList className="mx-auto mb-2 opacity-20" size={48} />
                                                    <p>No items added yet</p>
                                                </div>
                                            ) : (
                                                checklistItems.map((item) => (
                                                    <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-100 dark:border-gray-800">
                                                        <div className="min-w-0">
                                                            <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{item.item_name}</p>
                                                            {item.description && <p className="text-xs text-gray-500 mt-1">{item.description}</p>}
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <ComplianceBadge status={item.compliance_status} />
                                                            {!isCompleted && (
                                                                <select
                                                                    value={item.compliance_status}
                                                                    onChange={(e) => handleUpdateChecklist(item.id, e.target.value)}
                                                                    disabled={updatingItem === item.id}
                                                                    className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg text-xs font-semibold py-1 px-2 focus:ring-primary focus:border-primary"
                                                                >
                                                                    <option value="pending">Pending</option>
                                                                    <option value="compliant">Pass</option>
                                                                    <option value="non_compliant">Fail</option>
                                                                    <option value="not_applicable">N/A</option>
                                                                </select>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </section>

                                {/* Photos Section */}
                                <section className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
                                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                                        <div className="flex items-center gap-2">
                                            <Camera size={18} className="text-primary" />
                                            <h2 className="font-bold text-gray-900 dark:text-white">Site Photos</h2>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        {!isCompleted && (
                                            <form onSubmit={handleUploadPhoto} className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                                                <div className="flex-1 space-y-3">
                                                    <div className="flex flex-col sm:flex-row gap-3">
                                                        <div className="relative flex-1">
                                                            <input
                                                                type="file"
                                                                id="photo-upload"
                                                                onChange={(e) => photoForm.setData('photo', e.target.files ? e.target.files[0] : null)}
                                                                className="hidden"
                                                                accept="image/*"
                                                                required
                                                            />
                                                            <label
                                                                htmlFor="photo-upload"
                                                                className="flex items-center gap-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-xs font-medium cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
                                                            >
                                                                <Camera size={14} className="text-primary" />
                                                                <span className="truncate text-gray-600 dark:text-gray-400">
                                                                    {photoForm.data.photo ? (photoForm.data.photo as File).name : 'Choose Photo...'}
                                                                </span>
                                                            </label>
                                                        </div>
                                                        <div className="flex-[2]">
                                                            <input
                                                                type="text"
                                                                value={photoForm.data.photo_description}
                                                                onChange={(e) => photoForm.setData('photo_description', e.target.value)}
                                                                placeholder="Add a caption or location details..."
                                                                className="w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-xs focus:ring-primary focus:border-primary shadow-sm"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <Button type="submit" variant="primary" size="sm" isLoading={photoForm.processing} disabled={!photoForm.data.photo} className="h-fit py-2.5">
                                                    <Upload size={14} className="mr-1" /> Upload Photo
                                                </Button>
                                            </form>
                                        )}

                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {photos.map((photo) => (
                                                <div key={photo.id} className="relative group rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 aspect-square">
                                                    <img src={`/storage/${photo.photo_path}`} className="w-full h-full object-cover" alt="Site" />
                                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4">
                                                        <p className="text-white text-xs text-center mb-2">{photo.photo_description}</p>
                                                        <a href={`/storage/${photo.photo_path}`} target="_blank" className="p-2 bg-white/20 rounded-full text-white">
                                                            <ExternalLink size={16} />
                                                        </a>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </section>

                                {/* Documents Section */}
                                <section className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
                                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                                        <div className="flex items-center gap-2">
                                            <FileText size={18} className="text-primary" />
                                            <h2 className="font-bold text-gray-900 dark:text-white">Supporting Documents</h2>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        {!isCompleted && (
                                            <form onSubmit={handleUploadDocument} className="space-y-4 mb-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-1">
                                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Document Type</label>
                                                        <select
                                                            value={documentForm.data.document_type}
                                                            onChange={(e) => documentForm.setData('document_type', e.target.value)}
                                                            className="w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 text-xs font-semibold focus:ring-primary focus:border-primary"
                                                            required
                                                        >
                                                            <option value="">Select type...</option>
                                                            <option value="report">Inspection Report</option>
                                                            <option value="proof">Supporting Proof</option>
                                                            <option value="other">Other</option>
                                                        </select>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">File Attachment</label>
                                                        <div className="relative">
                                                            <input
                                                                type="file"
                                                                id="doc-upload"
                                                                onChange={(e) => documentForm.setData('document', e.target.files ? e.target.files[0] : null)}
                                                                className="hidden"
                                                                required
                                                            />
                                                            <label
                                                                htmlFor="doc-upload"
                                                                className="flex items-center gap-2 w-full bg-gray-50 dark:bg-gray-900 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 text-xs font-medium cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                                            >
                                                                <Upload size={14} className="text-primary" />
                                                                <span className="truncate text-gray-600 dark:text-gray-400">
                                                                    {documentForm.data.document ? (documentForm.data.document as File).name : 'Choose File...'}
                                                                </span>
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col sm:flex-row gap-3">
                                                    <div className="flex-1">
                                                        <input
                                                            type="text"
                                                            value={documentForm.data.description}
                                                            onChange={(e) => documentForm.setData('description', e.target.value)}
                                                            placeholder="Add internal notes or description..."
                                                            className="w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 text-xs"
                                                        />
                                                    </div>
                                                    <Button type="submit" variant="primary" size="sm" isLoading={documentForm.processing} className="whitespace-nowrap">
                                                        <Plus size={14} className="mr-1" /> Add Document
                                                    </Button>
                                                </div>
                                            </form>
                                        )}

                                        <div className="space-y-2">
                                            {documents.map((doc) => (
                                                <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/40 rounded-xl">
                                                    <div className="flex items-center gap-3">
                                                        <FileText size={16} className="text-primary" />
                                                        <div>
                                                            <p className="text-sm font-semibold">{doc.file_name}</p>
                                                            <p className="text-[10px] uppercase text-gray-500">{doc.document_type}</p>
                                                        </div>
                                                    </div>
                                                    <a href={`/storage/${doc.file_path}`} target="_blank" className="p-2 hover:bg-white dark:hover:bg-dark-surface rounded-lg">
                                                        <ExternalLink size={14} />
                                                    </a>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </section>
                            </div>

                            {/* Right Column: Information & Actions */}
                            <div className="space-y-6">
                                {/* Inspection Outcome */}
                                <section className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm p-6">
                                    <h3 className="font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                        <CheckCircle size={18} className="text-primary" />
                                        Outcome
                                    </h3>

                                    {!isCompleted ? (
                                        <form onSubmit={handleComplete} className="space-y-6">
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Findings</label>
                                                    <textarea
                                                        value={completeForm.data.findings}
                                                        onChange={(e) => completeForm.setData('findings', e.target.value)}
                                                        className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl px-4 py-3 text-sm min-h-[120px]"
                                                        placeholder="Inspection findings..."
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Recommendations</label>
                                                    <textarea
                                                        value={completeForm.data.recommendations}
                                                        onChange={(e) => completeForm.setData('recommendations', e.target.value)}
                                                        className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl px-4 py-3 text-sm min-h-[80px]"
                                                        placeholder="Proposed actions..."
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {(['passed', 'failed'] as const).map((r) => (
                                                        <button
                                                            key={r}
                                                            type="button"
                                                            onClick={() => completeForm.setData('result', completeForm.data.result === r ? null : r)}
                                                            className={`py-3 rounded-xl text-xs font-bold uppercase transition-all ${
                                                                completeForm.data.result === r
                                                                    ? r === 'passed' ? 'bg-green-500 text-white' : 'bg-red-500 text-white shadow-lg'
                                                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                                            }`}
                                                        >
                                                            {r === 'passed' ? 'Pass' : 'Fail'}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <Button 
                                                type="submit" 
                                                variant="primary" 
                                                fullWidth 
                                                isLoading={completeForm.processing}
                                                disabled={!completeForm.data.result}
                                            >
                                                Complete Inspection
                                            </Button>
                                        </form>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Recorded Findings</p>
                                                <p className="text-sm whitespace-pre-wrap">{inspection.findings ?? 'None'}</p>
                                            </div>
                                            {inspection.recommendations && (
                                                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Recommendations</p>
                                                    <p className="text-sm whitespace-pre-wrap">{inspection.recommendations}</p>
                                                </div>
                                            )}
                                            
                                            {/* Administrative Review Section */}
                                            {inspection.inspection_status === 'completed' && (
                                                <div className="pt-6 border-t border-gray-100 dark:border-gray-800 mt-6">
                                                    <h4 className="text-sm font-bold text-blue-600 mb-4">Admin Review</h4>
                                                    <form onSubmit={handleReview} className="space-y-4">
                                                        <textarea
                                                            value={reviewForm.data.review_notes}
                                                            onChange={(e) => reviewForm.setData('review_notes', e.target.value)}
                                                            className="w-full bg-blue-50/30 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-xl px-3 py-2 text-sm"
                                                            placeholder="Enter review notes..."
                                                            required
                                                        />
                                                        <Button type="submit" variant="primary" fullWidth isLoading={reviewForm.processing}>
                                                            Verify & Review
                                                        </Button>
                                                    </form>
                                                </div>
                                            )}

                                            {inspection.reviewed_at && (
                                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl">
                                                    <p className="text-[10px] font-bold text-blue-500 uppercase mb-2 flex items-center gap-1">
                                                        <FileCheck size={12} /> Reviewed
                                                    </p>
                                                    <p className="text-sm italic">"{inspection.review_notes}"</p>
                                                    <p className="text-[10px] text-gray-400 mt-2 font-bold">— {inspection.reviewer?.email}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </section>

                                {/* Linked Application Info */}
                                <section className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm p-6">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-4 tracking-widest">Application Details</p>
                                    <h4 className="font-mono font-bold text-gray-900 dark:text-white mb-2">{inspection.clearance_application?.reference_no}</h4>
                                    <p className="text-xs text-gray-500 mb-1">{inspection.clearance_application?.lot_owner}</p>
                                    <p className="text-[10px] text-gray-400 flex items-center gap-1">
                                        <MapPin size={10} />
                                        {inspection.clearance_application?.lot_address}
                                    </p>
                                    <div className="mt-4 pt-4 border-t border-gray-50 dark:border-gray-800">
                                        <a 
                                            href={`/admin/zoning/applications/${inspection.clearance_application?.id}`}
                                            className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
                                        >
                                            View Full Application <ExternalLink size={10} />
                                        </a>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </TabPanel>

                    <TabPanel tabId="timeline">
                        <div className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm p-6">
                            <h2 className="font-bold text-gray-900 dark:text-white mb-8">Application Timeline</h2>
                            <ApplicationTimeline 
                                items={(inspection.clearance_application?.status_history ?? []).map(s => ({
                                    id: `s-${s.id}`,
                                    status: s.status_to,
                                    eventType: 'status_change',
                                    remarks: s.notes ?? '',
                                    performerName: s.changed_by?.profile 
                                        ? `${s.changed_by.profile.first_name} ${s.changed_by.profile.last_name}`
                                        : 'System',
                                    updatedAt: s.created_at
                                }))} 
                            />
                        </div>
                    </TabPanel>
                </ApplicationDetailsTabs>
            </div>
        </AdminLayout>
    );
}
