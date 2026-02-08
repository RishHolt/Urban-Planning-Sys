import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import Button from '../../../components/Button';
import { ArrowLeft, Save } from 'lucide-react';

interface PhaseFormProps {
    project: {
        id: string;
        project_code: string;
        project_name: string;
    };
    phase?: {
        id: string;
        phase_name: string;
        phase_type: string;
        start_date: string | null;
        end_date: string | null;
        budget: number | null;
        status: string;
    } | null;
}

export default function PhaseForm({ project, phase }: PhaseFormProps) {
    const isEdit = !!phase;

    const { data, setData, post, put, processing, errors } = useForm({
        phase_name: phase?.phase_name || '',
        phase_type: phase?.phase_type || 'planning',
        start_date: phase?.start_date || '',
        end_date: phase?.end_date || '',
        budget: phase?.budget?.toString() || '',
        status: phase?.status || 'pending',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit) {
            put(`/admin/infrastructure/projects/${project.id}/phases/${phase.id}`, {
                preserveScroll: true,
            });
        } else {
            post(`/admin/infrastructure/projects/${project.id}/phases`, {
                preserveScroll: true,
            });
        }
    };

    return (
        <AdminLayout
            title={isEdit ? 'Edit Phase' : 'Create Phase'}
            description={`Project: ${project.project_code} - ${project.project_name}`}
            backButton={{
                href: `/admin/infrastructure/projects/${project.id}`,
                label: 'Back to Project',
            }}
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white dark:bg-dark-surface shadow-lg rounded-lg p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Phase Information</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Phase Name *
                            </label>
                            <input
                                type="text"
                                value={data.phase_name}
                                onChange={(e) => setData('phase_name', e.target.value)}
                                required
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
                            />
                            {errors.phase_name && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phase_name}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Phase Type *
                            </label>
                            <select
                                value={data.phase_type}
                                onChange={(e) => setData('phase_type', e.target.value)}
                                required
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
                            >
                                <option value="planning">Planning</option>
                                <option value="procurement">Procurement</option>
                                <option value="construction">Construction</option>
                                <option value="inspection">Inspection</option>
                                <option value="turnover">Turnover</option>
                            </select>
                            {errors.phase_type && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phase_type}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    value={data.start_date}
                                    onChange={(e) => setData('start_date', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
                                />
                                {errors.start_date && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.start_date}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    value={data.end_date}
                                    onChange={(e) => setData('end_date', e.target.value)}
                                    min={data.start_date}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
                                />
                                {errors.end_date && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.end_date}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Budget
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.budget}
                                onChange={(e) => setData('budget', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
                            />
                            {errors.budget && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.budget}</p>
                            )}
                        </div>

                        {isEdit && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Status
                                </label>
                                <select
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                    <option value="delayed">Delayed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                                {errors.status && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.status}</p>
                                )}
                            </div>
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
                        {processing ? 'Saving...' : isEdit ? 'Update Phase' : 'Create Phase'}
                    </Button>
                </div>
            </form>
        </AdminLayout>
    );
}
