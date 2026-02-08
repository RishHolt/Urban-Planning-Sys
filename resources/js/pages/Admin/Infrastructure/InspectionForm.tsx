import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import Button from '../../../components/Button';
import { Save, Calendar } from 'lucide-react';

interface InspectionFormProps {
    project: {
        id: string;
        project_code: string;
        project_name: string;
    };
    inspection?: {
        id: string;
        inspection_type: string;
        phase_id: string | null;
        inspector_id: string;
        scheduled_date: string;
    } | null;
    inspectors: Array<{
        id: string;
        name: string;
    }>;
    phases: Array<{
        id: string;
        phase_name: string;
    }>;
    mode?: 'schedule' | 'conduct';
}

export default function InspectionForm({ project, inspection, inspectors, phases, mode = 'schedule' }: InspectionFormProps) {
    const isEdit = !!inspection;
    const isConductMode = mode === 'conduct';

    const { data, setData, post, put, processing, errors } = useForm({
        inspection_type: inspection?.inspection_type || 'progress_inspection',
        phase_id: inspection?.phase_id || '',
        inspector_id: inspection?.inspector_id || '',
        scheduled_date: inspection?.scheduled_date || '',
        inspection_date: '',
        findings: '',
        deficiencies: '',
        result: '',
        recommendations: '',
        next_inspection_date: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isConductMode && inspection) {
            router.post(`/admin/infrastructure/projects/${project.id}/inspections/${inspection.id}/conduct`, data, {
                preserveScroll: true,
            });
        } else if (isEdit) {
            put(`/admin/infrastructure/projects/${project.id}/inspections/${inspection.id}`, {
                preserveScroll: true,
            });
        } else {
            post(`/admin/infrastructure/projects/${project.id}/inspections`, {
                preserveScroll: true,
            });
        }
    };

    return (
        <AdminLayout
            title={isConductMode ? 'Conduct Inspection' : isEdit ? 'Edit Inspection' : 'Schedule Inspection'}
            description={`Project: ${project.project_code} - ${project.project_name}`}
            backButton={{
                href: `/admin/infrastructure/projects/${project.id}`,
                label: 'Back to Project',
            }}
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white dark:bg-dark-surface shadow-lg rounded-lg p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Inspection Information</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Inspection Type *
                            </label>
                            <select
                                value={data.inspection_type}
                                onChange={(e) => setData('inspection_type', e.target.value)}
                                required
                                disabled={isConductMode}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white disabled:opacity-50"
                            >
                                <option value="pre_construction">Pre-Construction</option>
                                <option value="material_inspection">Material Inspection</option>
                                <option value="progress_inspection">Progress Inspection</option>
                                <option value="milestone_inspection">Milestone Inspection</option>
                                <option value="final_inspection">Final Inspection</option>
                                <option value="follow_up">Follow-up</option>
                            </select>
                            {errors.inspection_type && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.inspection_type}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Phase
                            </label>
                            <select
                                value={data.phase_id}
                                onChange={(e) => setData('phase_id', e.target.value)}
                                disabled={isConductMode}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white disabled:opacity-50"
                            >
                                <option value="">Select Phase</option>
                                {phases.map((phase) => (
                                    <option key={phase.id} value={phase.id}>
                                        {phase.phase_name}
                                    </option>
                                ))}
                            </select>
                            {errors.phase_id && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phase_id}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Inspector *
                            </label>
                            <select
                                value={data.inspector_id}
                                onChange={(e) => setData('inspector_id', e.target.value)}
                                required
                                disabled={isConductMode}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white disabled:opacity-50"
                            >
                                <option value="">Select Inspector</option>
                                {inspectors.map((inspector) => (
                                    <option key={inspector.id} value={inspector.id}>
                                        {inspector.name}
                                    </option>
                                ))}
                            </select>
                            {errors.inspector_id && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.inspector_id}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {isConductMode ? 'Inspection Date' : 'Scheduled Date'} *
                            </label>
                            <input
                                type="date"
                                value={isConductMode ? data.inspection_date : data.scheduled_date}
                                onChange={(e) => setData(isConductMode ? 'inspection_date' : 'scheduled_date', e.target.value)}
                                required
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
                            />
                            {errors.scheduled_date && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.scheduled_date}</p>
                            )}
                            {errors.inspection_date && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.inspection_date}</p>
                            )}
                        </div>

                        {isConductMode && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Findings *
                                    </label>
                                    <textarea
                                        value={data.findings}
                                        onChange={(e) => setData('findings', e.target.value)}
                                        required
                                        rows={4}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
                                    />
                                    {errors.findings && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.findings}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Deficiencies
                                    </label>
                                    <textarea
                                        value={data.deficiencies}
                                        onChange={(e) => setData('deficiencies', e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
                                    />
                                    {errors.deficiencies && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.deficiencies}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Result *
                                    </label>
                                    <select
                                        value={data.result}
                                        onChange={(e) => setData('result', e.target.value)}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
                                    >
                                        <option value="">Select Result</option>
                                        <option value="passed">Passed</option>
                                        <option value="failed">Failed</option>
                                        <option value="conditional">Conditional</option>
                                    </select>
                                    {errors.result && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.result}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Recommendations
                                    </label>
                                    <textarea
                                        value={data.recommendations}
                                        onChange={(e) => setData('recommendations', e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
                                    />
                                    {errors.recommendations && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.recommendations}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Next Inspection Date
                                    </label>
                                    <input
                                        type="date"
                                        value={data.next_inspection_date}
                                        onChange={(e) => setData('next_inspection_date', e.target.value)}
                                        min={data.inspection_date}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
                                    />
                                    {errors.next_inspection_date && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.next_inspection_date}</p>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => router.visit(`/admin/infrastructure/projects/${project.id}`)}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" variant="primary" disabled={processing} className="flex items-center gap-2">
                        <Save size={18} />
                        {processing
                            ? 'Saving...'
                            : isConductMode
                            ? 'Record Results'
                            : isEdit
                            ? 'Update Inspection'
                            : 'Schedule Inspection'}
                    </Button>
                </div>
            </form>
        </AdminLayout>
    );
}
