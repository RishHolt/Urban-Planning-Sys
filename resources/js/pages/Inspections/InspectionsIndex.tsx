import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import Button from '../../components/Button';
import {
    Calendar,
    MapPin,
    CheckCircle,
    XCircle,
    Clock,
    Plus,
    FileCheck,
    ChevronRight,
    X,
    ClipboardList,
    User,
} from 'lucide-react';

interface ChecklistItem {
    id: number;
    item_name: string;
    compliance_status: 'compliant' | 'non_compliant' | 'not_applicable' | 'pending';
}

interface Inspection {
    id: number;
    application_id: number;
    inspector_id: number;
    scheduled_date: string;
    result: 'pending' | 'passed' | 'failed';
    inspection_status: 'pending' | 'completed' | 'reviewed';
    clearance_application: {
        id: number;
        reference_no: string;
        lot_address: string;
        lot_owner: string;
        status: string;
    };
    inspector?: {
        id: number;
        email: string;
        profile?: {
            first_name: string;
            last_name: string;
        };
    };
    checklistItems?: ChecklistItem[];
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

function StatusBadge({ result, status }: { result: string; status: string }) {
    if (status === 'reviewed') {
        return (
            <span className="inline-flex items-center gap-1.5 bg-blue-100 dark:bg-blue-900/40 px-2.5 py-1 rounded-full font-semibold text-blue-800 dark:text-blue-300 text-xs uppercase tracking-wide">
                <FileCheck size={11} />
                Reviewed
            </span>
        );
    }
    if (status === 'completed') {
        return (
            <span className="inline-flex items-center gap-1.5 bg-purple-100 dark:bg-purple-900/40 px-2.5 py-1 rounded-full font-semibold text-purple-800 dark:text-purple-300 text-xs uppercase tracking-wide">
                <CheckCircle size={11} />
                Completed
            </span>
        );
    }
    if (result === 'passed') {
        return (
            <span className="inline-flex items-center gap-1.5 bg-green-100 dark:bg-green-900/40 px-2.5 py-1 rounded-full font-semibold text-green-800 dark:text-green-300 text-xs uppercase tracking-wide">
                <CheckCircle size={11} />
                Passed
            </span>
        );
    }
    if (result === 'failed') {
        return (
            <span className="inline-flex items-center gap-1.5 bg-red-100 dark:bg-red-900/40 px-2.5 py-1 rounded-full font-semibold text-red-800 dark:text-red-300 text-xs uppercase tracking-wide">
                <XCircle size={11} />
                Failed
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1.5 bg-yellow-100 dark:bg-yellow-900/40 px-2.5 py-1 rounded-full font-semibold text-yellow-800 dark:text-yellow-300 text-xs uppercase tracking-wide">
            <Clock size={11} />
            Pending
        </span>
    );
}

export default function InspectionsIndex({ inspections, inspectors = [], applications = [] }: InspectionsIndexProps) {
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [scheduleFormErrors, setScheduleFormErrors] = useState<Record<string, string>>({});

    const scheduleForm = useForm({
        application_id: '',
        inspector_id: '',
        scheduled_date: '',
        notes: '',
    });

    const isAdminOrStaff = inspectors.length > 0;

    const stats = {
        total: inspections.length,
        pending: inspections.filter((i) => i.inspection_status === 'pending').length,
        completed: inspections.filter((i) => i.inspection_status === 'completed').length,
        reviewed: inspections.filter((i) => i.inspection_status === 'reviewed').length,
    };

    const handleScheduleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setScheduleFormErrors({});

        const errors: Record<string, string> = {};
        if (!scheduleForm.data.application_id) errors.application_id = 'Please select an application.';
        if (!scheduleForm.data.inspector_id) errors.inspector_id = 'Please select an inspector.';
        if (!scheduleForm.data.scheduled_date) {
            errors.scheduled_date = 'Please select a date.';
        } else {
            const selected = new Date(scheduleForm.data.scheduled_date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (selected < today) errors.scheduled_date = 'Date must be today or in the future.';
        }

        if (Object.keys(errors).length > 0) {
            setScheduleFormErrors(errors);
            return;
        }

        scheduleForm.post('/admin/zoning/inspections', {
            preserveScroll: true,
            onSuccess: () => {
                setShowScheduleModal(false);
                scheduleForm.reset();
                setScheduleFormErrors({});
            },
            onError: (errs) => {
                setScheduleFormErrors((prev) => ({ ...prev, ...errs }));
            },
        });
    };

    const closeScheduleModal = () => {
        setShowScheduleModal(false);
        scheduleForm.reset();
        setScheduleFormErrors({});
    };

    return (
        <>
            <AdminLayout
                title="Inspections"
                description="Manage and conduct site inspections for zoning clearance applications"
                action={
                    isAdminOrStaff ? (
                        <Button onClick={() => setShowScheduleModal(true)} icon={<Plus size={16} />}>
                            Schedule Inspection
                        </Button>
                    ) : undefined
                }
            >
                {/* Stats Row */}
                <div className="gap-4 grid grid-cols-2 lg:grid-cols-4 mb-6">
                    {[
                        { label: 'Total', value: stats.total, color: 'text-gray-900 dark:text-white', bg: 'bg-white dark:bg-dark-surface' },
                        { label: 'Pending', value: stats.pending, color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/10' },
                        { label: 'Completed', value: stats.completed, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/10' },
                        { label: 'Reviewed', value: stats.reviewed, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/10' },
                    ].map(({ label, value, color, bg }) => (
                        <div key={label} className={`${bg} rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800`}>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{label}</p>
                            <p className={`text-3xl font-bold ${color}`}>{value}</p>
                        </div>
                    ))}
                </div>

                {/* Inspections List */}
                {inspections.length === 0 ? (
                    <div className="bg-white dark:bg-dark-surface shadow-sm border border-gray-100 dark:border-gray-800 py-16 rounded-2xl text-center">
                        <ClipboardList className="mx-auto w-14 h-14 text-gray-300 dark:text-gray-600 mb-4" />
                        <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-1">No inspections yet</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            {isAdminOrStaff ? 'Schedule the first inspection to get started.' : "You don't have any inspections assigned."}
                        </p>
                        {isAdminOrStaff && (
                            <Button className="mt-6" onClick={() => setShowScheduleModal(true)} icon={<Plus size={16} />}>
                                Schedule Inspection
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-dark-surface shadow-sm border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="divide-y divide-gray-100 dark:divide-gray-800 min-w-full">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-900/50">
                                        {['Application', 'Location', 'Inspector', 'Scheduled', 'Status', ''].map((h) => (
                                            <th
                                                key={h}
                                                className="px-6 py-3.5 text-left text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest"
                                            >
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                                    {inspections.map((inspection) => {
                                        const checklist = inspection.checklistItems ?? [];
                                        const done = checklist.filter((c) => c.compliance_status !== 'pending').length;
                                        const pct = checklist.length > 0 ? Math.round((done / checklist.length) * 100) : 0;

                                        return (
                                            <tr
                                                key={inspection.id}
                                                className="hover:bg-gray-50/80 dark:hover:bg-gray-800/30 transition-colors cursor-pointer group"
                                                onClick={() => router.visit(`/admin/zoning/inspections/${inspection.id}`)}
                                            >
                                                <td className="px-6 py-4">
                                                    <p className="font-semibold text-gray-900 dark:text-white text-sm">
                                                        {inspection.clearance_application?.reference_no ?? 'N/A'}
                                                    </p>
                                                    <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
                                                        {inspection.clearance_application?.lot_owner ?? '—'}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-start gap-1.5 text-gray-500 dark:text-gray-400 text-sm max-w-[200px]">
                                                        <MapPin size={13} className="flex-shrink-0 mt-0.5 text-gray-400" />
                                                        <span className="truncate">{inspection.clearance_application?.lot_address ?? '—'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 text-sm">
                                                        <User size={13} className="text-gray-400" />
                                                        {inspection.inspector?.profile 
                                                            ? `${inspection.inspector.profile.first_name} ${inspection.inspector.profile.last_name}`
                                                            : inspection.inspector?.email ?? `Inspector #${inspection.inspector_id}`}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 text-sm">
                                                        <Calendar size={13} className="text-gray-400" />
                                                        {new Date(inspection.scheduled_date).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric',
                                                        })}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="space-y-1.5">
                                                        <StatusBadge result={inspection.result} status={inspection.inspection_status} />
                                                        {checklist.length > 0 && (
                                                            <div className="flex items-center gap-2">
                                                                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 max-w-[80px]">
                                                                    <div
                                                                        className="bg-primary rounded-full h-1.5 transition-all"
                                                                        style={{ width: `${pct}%` }}
                                                                    />
                                                                </div>
                                                                <span className="text-[10px] text-gray-400">{pct}%</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <span className="text-xs text-primary font-semibold">
                                                            {inspection.inspection_status === 'pending' ? 'Conduct' : 'View'}
                                                        </span>
                                                        <ChevronRight size={14} className="text-primary" />
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </AdminLayout>

            {/* Schedule Inspection Modal */}
            {showScheduleModal && (
                <div
                    className="z-50 fixed inset-0 flex justify-center items-center bg-black/60 backdrop-blur-sm p-4"
                    onClick={closeScheduleModal}
                >
                    <div
                        className="relative flex flex-col bg-white dark:bg-dark-surface shadow-2xl rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100 dark:border-gray-800">
                            <div>
                                <h2 className="font-bold text-gray-900 dark:text-white text-xl">Schedule Inspection</h2>
                                <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Assign an inspector to a pending application</p>
                            </div>
                            <button
                                onClick={closeScheduleModal}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                <X size={20} className="text-gray-400" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6 py-6">
                            <form onSubmit={handleScheduleSubmit} className="space-y-5">
                                {/* Application */}
                                <div>
                                    <label className="block mb-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Application <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={scheduleForm.data.application_id}
                                        onChange={(e) => {
                                            scheduleForm.setData('application_id', e.target.value);
                                            setScheduleFormErrors((p) => { const n = { ...p }; delete n.application_id; return n; });
                                        }}
                                        className="w-full bg-white dark:bg-dark-surface border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                        required
                                    >
                                        <option value="">Select application...</option>
                                        {applications.map((app) => (
                                            <option key={app.id} value={app.id}>
                                                {app.display_label || `${app.reference_no} — ${app.lot_owner}`}
                                            </option>
                                        ))}
                                    </select>
                                    {(scheduleForm.errors.application_id || scheduleFormErrors.application_id) && (
                                        <p className="mt-1 text-xs text-red-600">{scheduleForm.errors.application_id || scheduleFormErrors.application_id}</p>
                                    )}
                                    {applications.length === 0 && (
                                        <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-400">
                                            No eligible applications. Applications must be in "For Inspection" or "Under Review" status and not yet have an inspection.
                                        </p>
                                    )}
                                </div>

                                {/* Inspector */}
                                <div>
                                    <label className="block mb-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Inspector <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={scheduleForm.data.inspector_id}
                                        onChange={(e) => {
                                            scheduleForm.setData('inspector_id', e.target.value);
                                            setScheduleFormErrors((p) => { const n = { ...p }; delete n.inspector_id; return n; });
                                        }}
                                        className="w-full bg-white dark:bg-dark-surface border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                        required
                                    >
                                        <option value="">Select inspector...</option>
                                        {inspectors.map((i) => (
                                            <option key={i.id} value={i.id}>
                                                {i.name} ({i.email})
                                            </option>
                                        ))}
                                    </select>
                                    {(scheduleForm.errors.inspector_id || scheduleFormErrors.inspector_id) && (
                                        <p className="mt-1 text-xs text-red-600">{scheduleForm.errors.inspector_id || scheduleFormErrors.inspector_id}</p>
                                    )}
                                </div>

                                {/* Date */}
                                <div>
                                    <label className="block mb-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Scheduled Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={scheduleForm.data.scheduled_date}
                                        min={new Date().toISOString().split('T')[0]}
                                        onChange={(e) => {
                                            scheduleForm.setData('scheduled_date', e.target.value);
                                            setScheduleFormErrors((p) => { const n = { ...p }; delete n.scheduled_date; return n; });
                                        }}
                                        className="w-full bg-white dark:bg-dark-surface border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent dark:[color-scheme:dark]"
                                        required
                                    />
                                    {(scheduleForm.errors.scheduled_date || scheduleFormErrors.scheduled_date) && (
                                        <p className="mt-1 text-xs text-red-600">{scheduleForm.errors.scheduled_date || scheduleFormErrors.scheduled_date}</p>
                                    )}
                                </div>

                                {/* Notes */}
                                <div>
                                    <label className="block mb-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Notes <span className="text-gray-400 font-normal">(optional)</span>
                                    </label>
                                    <textarea
                                        value={scheduleForm.data.notes}
                                        onChange={(e) => scheduleForm.setData('notes', e.target.value)}
                                        rows={3}
                                        className="w-full bg-white dark:bg-dark-surface border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                                        placeholder="Instructions or context for the inspector..."
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-2">
                                    <Button type="button" variant="outline" onClick={closeScheduleModal} disabled={scheduleForm.processing}>
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        isLoading={scheduleForm.processing}
                                        disabled={scheduleForm.processing || !scheduleForm.data.application_id || !scheduleForm.data.inspector_id || !scheduleForm.data.scheduled_date}
                                    >
                                        Schedule
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
