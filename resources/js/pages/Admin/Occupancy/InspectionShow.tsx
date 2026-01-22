import { Link, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import AdminContentCard from '../../../components/AdminContentCard';
import Button from '../../../components/Button';
import FileUpload from '../../../components/FileUpload';
import { ArrowLeft, ClipboardCheck, Camera, Eye, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface Photo {
    id: string;
    photo_path: string;
    photo_description: string | null;
    taken_at: string;
}

interface InspectionShowProps {
    inspection: {
        id: string;
        building: {
            id: string;
            building_code: string;
            building_name: string | null;
        } | null;
        unit: {
            id: string;
            unit_no: string;
        } | null;
        inspection_type: string;
        inspector_id: number;
        complaint_id: number | null;
        scheduled_date: string;
        inspection_date: string | null;
        findings: string | null;
        compliance_notes: string | null;
        result: string | null;
        recommendations: string | null;
        next_inspection_date: string | null;
        inspected_at: string | null;
        photos: Photo[];
    };
}

export default function InspectionShow({ inspection }: InspectionShowProps) {
    const { flash } = usePage<{ flash?: { success?: string; error?: string } }>().props;
    const [showCompleteForm, setShowCompleteForm] = useState(!inspection.inspected_at);
    const [photos, setPhotos] = useState<File[]>([]);

    const { data, setData, put, processing, errors } = useForm({
        inspection_date: inspection.inspection_date || '',
        findings: inspection.findings || '',
        compliance_notes: inspection.compliance_notes || '',
        result: inspection.result || '',
        recommendations: inspection.recommendations || '',
        next_inspection_date: inspection.next_inspection_date || '',
    });

    const handleComplete = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('inspection_date', data.inspection_date);
        formData.append('findings', data.findings || '');
        formData.append('compliance_notes', data.compliance_notes || '');
        formData.append('result', data.result);
        formData.append('recommendations', data.recommendations || '');
        formData.append('next_inspection_date', data.next_inspection_date || '');
        
        photos.forEach((photo, index) => {
            formData.append(`photos[${index}]`, photo);
        });

        router.post(`/admin/occupancy/inspections/${inspection.id}/complete`, formData, {
            preserveScroll: true,
            onSuccess: () => {
                setShowCompleteForm(false);
            },
        });
    };

    const getTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            'annual': 'Annual',
            'periodic': 'Periodic',
            'pre_occupancy': 'Pre-Occupancy',
            'complaint_based': 'Complaint-Based',
            'follow_up': 'Follow-Up',
            'random': 'Random',
        };
        return labels[type] || type;
    };

    const getResultBadge = (result: string | null) => {
        if (!result) {
            return (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                    Pending
                </span>
            );
        }

        const resultConfig: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
            'compliant': {
                label: 'Compliant',
                className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
                icon: <CheckCircle size={16} />,
            },
            'non_compliant': {
                label: 'Non-Compliant',
                className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
                icon: <XCircle size={16} />,
            },
            'conditional': {
                label: 'Conditional',
                className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
                icon: <AlertCircle size={16} />,
            },
            'pending_correction': {
                label: 'Pending Correction',
                className: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
                icon: <AlertCircle size={16} />,
            },
        };

        const config = resultConfig[result] || resultConfig['compliant'];
        return (
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.className}`}>
                {config.icon}
                {config.label}
            </span>
        );
    };

    return (
        <AdminLayout
            title={`Inspection ${inspection.id}`}
            description={`${getTypeLabel(inspection.inspection_type)} Inspection`}
            backButton={{
                href: '/admin/occupancy/inspections',
                label: 'Back to Inspections',
            }}
        >
            {flash?.success && (
                <div className="mb-4 p-4 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg">
                    {flash.success}
                </div>
            )}

            <div className="space-y-6">
                {/* Inspection Details */}
                <AdminContentCard>
                    <h2 className="text-lg font-semibold text-foreground dark:text-white mb-4 flex items-center gap-2">
                        <ClipboardCheck size={20} />
                        Inspection Details
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-sm font-medium text-muted-foreground dark:text-gray-400">Building</label>
                            <p className="text-foreground dark:text-white font-medium">
                                {inspection.building?.building_code || 'N/A'}
                            </p>
                            {inspection.building?.building_name && (
                                <p className="text-sm text-muted-foreground dark:text-gray-400">
                                    {inspection.building.building_name}
                                </p>
                            )}
                        </div>
                        {inspection.unit && (
                            <div>
                                <label className="text-sm font-medium text-muted-foreground dark:text-gray-400">Unit</label>
                                <p className="text-foreground dark:text-white font-medium">{inspection.unit.unit_no}</p>
                            </div>
                        )}
                        <div>
                            <label className="text-sm font-medium text-muted-foreground dark:text-gray-400">Inspection Type</label>
                            <p className="text-foreground dark:text-white">{getTypeLabel(inspection.inspection_type)}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground dark:text-gray-400">Scheduled Date</label>
                            <p className="text-foreground dark:text-white">{inspection.scheduled_date}</p>
                        </div>
                        {inspection.inspection_date && (
                            <div>
                                <label className="text-sm font-medium text-muted-foreground dark:text-gray-400">Inspection Date</label>
                                <p className="text-foreground dark:text-white">{inspection.inspection_date}</p>
                            </div>
                        )}
                        <div>
                            <label className="text-sm font-medium text-muted-foreground dark:text-gray-400">Result</label>
                            <div className="mt-1">{getResultBadge(inspection.result)}</div>
                        </div>
                    </div>
                </AdminContentCard>

                {/* Complete Inspection Form */}
                {showCompleteForm && (
                    <AdminContentCard>
                        <h2 className="text-lg font-semibold text-foreground dark:text-white mb-4">Complete Inspection</h2>
                        <form onSubmit={handleComplete} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                        Inspection Date *
                                    </label>
                                    <input
                                        type="date"
                                        value={data.inspection_date}
                                        onChange={(e) => setData('inspection_date', e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-surface text-foreground dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                        required
                                    />
                                    {errors.inspection_date && (
                                        <p className="mt-1 text-red-500 text-sm">{errors.inspection_date}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                        Result *
                                    </label>
                                    <select
                                        value={data.result}
                                        onChange={(e) => setData('result', e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-surface text-foreground dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                        required
                                    >
                                        <option value="">Select Result</option>
                                        <option value="compliant">Compliant</option>
                                        <option value="non_compliant">Non-Compliant</option>
                                        <option value="conditional">Conditional</option>
                                        <option value="pending_correction">Pending Correction</option>
                                    </select>
                                    {errors.result && (
                                        <p className="mt-1 text-red-500 text-sm">{errors.result}</p>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                    Findings
                                </label>
                                <textarea
                                    value={data.findings}
                                    onChange={(e) => setData('findings', e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-surface text-foreground dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                                {errors.findings && (
                                    <p className="mt-1 text-red-500 text-sm">{errors.findings}</p>
                                )}
                            </div>
                            <div>
                                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                    Compliance Notes
                                </label>
                                <textarea
                                    value={data.compliance_notes}
                                    onChange={(e) => setData('compliance_notes', e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-surface text-foreground dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                                {errors.compliance_notes && (
                                    <p className="mt-1 text-red-500 text-sm">{errors.compliance_notes}</p>
                                )}
                            </div>
                            <div>
                                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                    Recommendations
                                </label>
                                <textarea
                                    value={data.recommendations}
                                    onChange={(e) => setData('recommendations', e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-surface text-foreground dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                                {errors.recommendations && (
                                    <p className="mt-1 text-red-500 text-sm">{errors.recommendations}</p>
                                )}
                            </div>
                            <div>
                                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                    Next Inspection Date
                                </label>
                                <input
                                    type="date"
                                    value={data.next_inspection_date}
                                    onChange={(e) => setData('next_inspection_date', e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-surface text-foreground dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                                {errors.next_inspection_date && (
                                    <p className="mt-1 text-red-500 text-sm">{errors.next_inspection_date}</p>
                                )}
                            </div>
                            <div>
                                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm flex items-center gap-2">
                                    <Camera size={16} />
                                    Inspection Photos
                                </label>
                                <FileUpload
                                    multiple
                                    accept="image/*"
                                    maxSizeMB={5}
                                    allowedTypes={['image/jpeg', 'image/png', 'image/jpg']}
                                    value={photos}
                                    onChange={(files) => setPhotos(Array.isArray(files) ? files : files ? [files] : [])}
                                />
                            </div>
                            <div className="flex justify-end gap-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowCompleteForm(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Completing...' : 'Complete Inspection'}
                                </Button>
                            </div>
                        </form>
                    </AdminContentCard>
                )}

                {/* Existing Findings */}
                {inspection.findings && (
                    <AdminContentCard>
                        <h2 className="text-lg font-semibold text-foreground dark:text-white mb-4">Findings</h2>
                        <p className="text-foreground dark:text-white whitespace-pre-wrap">{inspection.findings}</p>
                    </AdminContentCard>
                )}

                {/* Photos */}
                {inspection.photos && inspection.photos.length > 0 && (
                    <AdminContentCard>
                        <h2 className="text-lg font-semibold text-foreground dark:text-white mb-4 flex items-center gap-2">
                            <Camera size={20} />
                            Inspection Photos
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {inspection.photos.map((photo) => (
                                <div key={photo.id} className="relative group">
                                    <img
                                        src={`/storage/${photo.photo_path}`}
                                        alt={photo.photo_description || 'Inspection photo'}
                                        className="w-full h-48 object-cover rounded-lg"
                                    />
                                    {photo.photo_description && (
                                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 rounded-b-lg text-sm">
                                            {photo.photo_description}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </AdminContentCard>
                )}
            </div>
        </AdminLayout>
    );
}
