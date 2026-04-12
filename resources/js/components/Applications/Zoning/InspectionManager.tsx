import { useState } from 'react';
import { router } from '@inertiajs/react';
import Button from '../../Button';
import Select from '../../Select';
import Input from '../../Input';
import {
    Calendar,
    User,
    Clock,
    CheckCircle,
    XCircle,
    Plus,
    FileText,
    ExternalLink,
    AlertCircle,
    Camera,
    ChevronRight,
    Search
} from 'lucide-react';
import { format } from 'date-fns';

interface Inspection {
    id: number;
    inspector_id: number;
    inspector?: {
        id: number;
        profile?: {
            first_name: string;
            last_name: string;
        };
        email: string;
    };
    scheduled_date: string;
    inspected_at: string | null;
    result: 'pending' | 'passed' | 'failed';
    inspection_status: 'pending' | 'completed' | 'reviewed';
    findings: string | null;
    recommendations: string | null;
    review_notes: string | null;
    photos?: any[];
    checklistItems?: any[];
}

interface InspectionManagerProps {
    applicationId: string;
    inspections: Inspection[];
    inspectors: Array<{ id: number; name: string }>;
}

export default function InspectionManager({ applicationId, inspections = [], inspectors = [] }: InspectionManagerProps) {
    const [isScheduling, setIsScheduling] = useState(false);
    const [schedulingForm, setSchedulingForm] = useState({
        inspector_id: '',
        scheduled_date: '',
        notes: '',
    });
    const [processing, setProcessing] = useState(false);
    const [viewingInspection, setViewingInspection] = useState<Inspection | null>(null);
    const [reviewForm, setReviewForm] = useState({
        notes: '',
    });

    const handleSchedule = () => {
        if (!schedulingForm.inspector_id || !schedulingForm.scheduled_date) return;

        setProcessing(true);
        router.post('/admin/zoning/inspections', {
            application_id: applicationId,
            ...schedulingForm
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsScheduling(false);
                setSchedulingForm({ inspector_id: '', scheduled_date: '', notes: '' });
                setProcessing(false);
            },
            onError: () => setProcessing(false)
        });
    };

    const handleReview = (inspectionId: number) => {
        setProcessing(true);
        router.post(`/admin/zoning/inspections/${inspectionId}/review`, {
            review_notes: reviewForm.notes
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setViewingInspection(null);
                setReviewForm({ notes: '' });
                setProcessing(false);
            },
            onError: () => setProcessing(false)
        });
    };

    const getStatusStyles = (status: string, result: string) => {
        if (status === 'pending') return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400';
        if (result === 'passed') return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400';
        return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400';
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Calendar size={20} className="text-primary" />
                    Inspection History
                </h3>
                {!isScheduling && (
                    <Button
                        variant="primary"
                        size="sm"
                        icon={<Plus size={16} />}
                        onClick={() => setIsScheduling(true)}
                    >
                        Schedule Inspection
                    </Button>
                )}
            </div>

            {isScheduling && (
                <div className="bg-gray-50 dark:bg-dark-surface/50 p-6 rounded-xl border-2 border-primary/20 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-gray-900 dark:text-white uppercase text-xs tracking-wider">New Site Inspection</h4>
                        <button onClick={() => setIsScheduling(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                            Cancel
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:items-start">
                        <div className="min-w-0">
                            <Select
                                label="Assign Inspector"
                                value={schedulingForm.inspector_id}
                                onChange={(e) => setSchedulingForm({ ...schedulingForm, inspector_id: e.target.value })}
                                required
                                className="dark:[color-scheme:dark]"
                            >
                                <option value="">Select Inspector...</option>
                                {inspectors.map((inspector) => (
                                    <option key={inspector.id} value={String(inspector.id)}>
                                        {inspector.name}
                                    </option>
                                ))}
                            </Select>
                            {inspectors.length === 0 && (
                                <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">
                                    No staff or admin users are available to assign. Ensure active users exist with staff, admin, or super admin role.
                                </p>
                            )}
                        </div>
                        <div className="min-w-0">
                            <Input
                                type="date"
                                label="Scheduled Date"
                                value={schedulingForm.scheduled_date}
                                min={new Date().toISOString().split('T')[0]}
                                onChange={(e) => setSchedulingForm({ ...schedulingForm, scheduled_date: e.target.value })}
                                required
                                className="dark:[color-scheme:dark]"
                            />
                        </div>
                    </div>
                    <div className="mt-4">
                        <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">Internal Notes</label>
                        <textarea
                            className="w-full bg-white dark:bg-dark-surface border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:ring-opacity-20 outline-none text-gray-900 dark:text-white"
                            placeholder="Specific instructions for the inspector..."
                            rows={3}
                            value={schedulingForm.notes}
                            onChange={(e) => setSchedulingForm({ ...schedulingForm, notes: e.target.value })}
                        />
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <Button variant="outline" size="sm" onClick={() => setIsScheduling(false)}>Cancel</Button>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={handleSchedule}
                            isLoading={processing}
                            disabled={!schedulingForm.inspector_id || !schedulingForm.scheduled_date}
                        >
                            Confirm Schedule
                        </Button>
                    </div>
                </div>
            )}

            {inspections.length === 0 ? (
                <div className="bg-white dark:bg-dark-surface p-12 rounded-xl text-center border-2 border-dashed border-gray-100 dark:border-gray-800">
                    <Clock size={48} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500 dark:text-gray-400">No inspections scheduled yet.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {inspections.map((inspection) => (
                        <div
                            key={inspection.id}
                            className={`p-4 bg-white dark:bg-dark-surface rounded-xl border border-gray-100 dark:border-gray-800 hover:border-primary/30 transition-all ${viewingInspection?.id === inspection.id ? 'ring-2 ring-primary' : ''}`}
                        >
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-full ${getStatusStyles(inspection.inspection_status, inspection.result)}`}>
                                        {inspection.inspection_status === 'pending' ? <Clock size={20} /> :
                                            inspection.result === 'passed' ? <CheckCircle size={20} /> : <XCircle size={20} />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-gray-900 dark:text-white capitalize">
                                                {inspection.inspection_status} Inspection
                                            </span>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getStatusStyles(inspection.inspection_status, inspection.result)}`}>
                                                {inspection.result}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                                            <span className="flex items-center gap-1.5 font-medium">
                                                <User size={14} />
                                                {inspection.inspector?.profile ?
                                                    `${inspection.inspector.profile.first_name} ${inspection.inspector.profile.last_name}` :
                                                    inspection.inspector?.email || 'Unassigned'}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <Calendar size={14} />
                                                {inspection.scheduled_date}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setViewingInspection(viewingInspection?.id === inspection.id ? null : inspection)}
                                    >
                                        {viewingInspection?.id === inspection.id ? 'Close Details' : 'View Report'}
                                    </Button>

                                    {inspection.inspection_status === 'completed' && inspection.result === 'passed' && (
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => setViewingInspection(inspection)}
                                        >
                                            Review & Move to Approval
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Expanded Details */}
                            {viewingInspection?.id === inspection.id && (
                                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-top-2 duration-300">
                                    <div className="space-y-6">
                                        <section>
                                            <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                <FileText size={14} />
                                                Inspector Findings
                                            </h5>
                                            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg text-sm text-gray-700 dark:text-gray-300 min-h-[100px]">
                                                {inspection.findings || 'No findings reported.'}
                                            </div>
                                        </section>
                                        <section>
                                            <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                <AlertCircle size={14} />
                                                Recommendations
                                            </h5>
                                            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg text-sm text-gray-700 dark:text-gray-300 min-h-[100px]">
                                                {inspection.recommendations || 'No recommendations provided.'}
                                            </div>
                                        </section>
                                    </div>

                                    <div className="space-y-6">
                                        <section>
                                            <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                <Camera size={14} />
                                                Site Photos ({inspection.photos?.length || 0})
                                            </h5>
                                            {inspection.photos && inspection.photos.length > 0 ? (
                                                <div className="grid grid-cols-3 gap-2">
                                                    {inspection.photos.map((photo: any) => (
                                                        <a
                                                            key={photo.id}
                                                            href={photo.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:opacity-80 transition-opacity relative group"
                                                        >
                                                            <img src={photo.url} alt="Site" className="w-full h-full object-cover" />
                                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                                                                <ExternalLink size={16} className="text-white" />
                                                            </div>
                                                        </a>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="p-4 bg-gray-50 dark:bg-gray-800/30 rounded-lg text-sm text-gray-500 italic">
                                                    No photos uploaded.
                                                </div>
                                            )}
                                        </section>

                                        {inspection.inspection_status === 'completed' && (
                                            <section className="bg-primary/5 dark:bg-primary/10 p-5 rounded-xl border border-primary/20">
                                                <h5 className="text-sm font-bold text-primary mb-3">Administrative Review</h5>
                                                <textarea
                                                    className="w-full bg-white dark:bg-dark-surface border border-primary/20 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary outline-none text-gray-900 dark:text-white"
                                                    placeholder="Final review notes for this inspection..."
                                                    rows={3}
                                                    value={reviewForm.notes}
                                                    onChange={(e) => setReviewForm({ notes: e.target.value })}
                                                />
                                                <div className="mt-4 flex flex-col gap-2">
                                                    <Button
                                                        variant="primary"
                                                        fullWidth
                                                        onClick={() => handleReview(inspection.id)}
                                                        isLoading={processing}
                                                        disabled={!reviewForm.notes && inspection.result === 'passed'}
                                                    >
                                                        {inspection.result === 'passed' ? 'Approve & Move to Final Review' : 'Mark as Reviewed'}
                                                    </Button>
                                                    <p className="text-[10px] text-gray-500 text-center italic">
                                                        {inspection.result === 'passed' ?
                                                            "This will move the application status to 'For Approval'." :
                                                            "The application will stay in 'For Inspection' status."}
                                                    </p>
                                                </div>
                                            </section>
                                        )}

                                        {inspection.inspection_status === 'reviewed' && (
                                            <section className="bg-green-50 dark:bg-green-900/10 p-4 rounded-lg border border-green-200 dark:border-green-800">
                                                <h5 className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-widest mb-2">Review Notes</h5>
                                                <p className="text-sm text-gray-700 dark:text-gray-300 italic">"{inspection.review_notes}"</p>
                                            </section>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
