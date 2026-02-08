import { router, useForm } from '@inertiajs/react';
import AdminLayout from '../../../components/AdminLayout';
import Button from '../../../components/Button';
import { Save } from 'lucide-react';

interface MilestoneFormProps {
    project: {
        id: string;
        project_code: string;
        project_name: string;
    };
    phase: {
        id: string;
        phase_name: string;
    };
    milestone?: {
        id: string;
        milestone_name: string;
        description: string | null;
        target_date: string;
        status: string;
        remarks: string | null;
    } | null;
}

export default function MilestoneForm({ project, phase, milestone }: MilestoneFormProps) {
    const isEdit = !!milestone;

    const { data, setData, post, put, processing, errors } = useForm({
        milestone_name: milestone?.milestone_name || '',
        description: milestone?.description || '',
        target_date: milestone?.target_date || '',
        remarks: milestone?.remarks || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit) {
            put(`/admin/infrastructure/projects/${project.id}/phases/${phase.id}/milestones/${milestone.id}`, {
                preserveScroll: true,
            });
        } else {
            post(`/admin/infrastructure/projects/${project.id}/phases/${phase.id}/milestones`, {
                preserveScroll: true,
            });
        }
    };

    return (
        <AdminLayout
            title={isEdit ? 'Edit Milestone' : 'Create Milestone'}
            description={`Phase: ${phase.phase_name}`}
            backButton={{
                href: `/admin/infrastructure/projects/${project.id}`,
                label: 'Back to Project',
            }}
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white dark:bg-dark-surface shadow-lg rounded-lg p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Milestone Information</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Milestone Name *
                            </label>
                            <input
                                type="text"
                                value={data.milestone_name}
                                onChange={(e) => setData('milestone_name', e.target.value)}
                                required
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
                            />
                            {errors.milestone_name && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.milestone_name}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Description
                            </label>
                            <textarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows={4}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
                            />
                            {errors.description && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Target Date *
                            </label>
                            <input
                                type="date"
                                value={data.target_date}
                                onChange={(e) => setData('target_date', e.target.value)}
                                required
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
                            />
                            {errors.target_date && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.target_date}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Remarks
                            </label>
                            <textarea
                                value={data.remarks}
                                onChange={(e) => setData('remarks', e.target.value)}
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
                            />
                            {errors.remarks && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.remarks}</p>
                            )}
                        </div>
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
                        {processing ? 'Saving...' : isEdit ? 'Update Milestone' : 'Create Milestone'}
                    </Button>
                </div>
            </form>
        </AdminLayout>
    );
}
