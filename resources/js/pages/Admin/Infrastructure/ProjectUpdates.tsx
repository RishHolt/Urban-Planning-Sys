import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import AdminContentCard from '../../../components/AdminContentCard';
import Button from '../../../components/Button';
import { Plus, TrendingUp, User, Calendar } from 'lucide-react';

interface ProjectUpdatesProps {
    project: {
        id: string;
        project_code: string;
        project_name: string;
    };
    updates: Array<{
        id: string;
        update_description: string;
        progress_percentage: number | null;
        issues: string | null;
        next_steps: string | null;
        updated_by: {
            id: string;
            name: string;
        } | null;
        created_at: string;
    }>;
}

export default function ProjectUpdates({ project, updates }: ProjectUpdatesProps) {
    const [showCreateModal, setShowCreateModal] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        update_description: '',
        progress_percentage: '',
        issues: '',
        next_steps: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/admin/infrastructure/projects/${project.id}/updates`, {
            preserveScroll: true,
            onSuccess: () => {
                setShowCreateModal(false);
                setData({
                    update_description: '',
                    progress_percentage: '',
                    issues: '',
                    next_steps: '',
                });
            },
        });
    };

    return (
        <AdminLayout
            title="Project Updates"
            description={`${project.project_code} - ${project.project_name}`}
            backButton={{
                href: `/admin/infrastructure/projects/${project.id}`,
                label: 'Back to Project',
            }}
        >
            <div className="mb-6 flex justify-end">
                <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2"
                >
                    <Plus size={18} />
                    Create Update
                </Button>
            </div>

            <AdminContentCard padding="lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Update Timeline</h3>
                {updates.length === 0 ? (
                    <div className="text-center py-12">
                        <TrendingUp className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No updates yet</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Create an update to track project progress and communicate with stakeholders.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {updates.map((update, index) => (
                            <div key={update.id} className="relative">
                                {index !== updates.length - 1 && (
                                    <div className="absolute left-4 top-12 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
                                )}
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                                            <TrendingUp size={16} className="text-white" />
                                        </div>
                                    </div>
                                    <div className="flex-1 pb-8">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <User size={16} className="text-gray-400" />
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {update.updated_by?.name || 'System'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                                <Calendar size={14} />
                                                {new Date(update.created_at).toLocaleString()}
                                            </div>
                                        </div>
                                        {update.progress_percentage !== null && (
                                            <div className="mb-2">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Progress</span>
                                                    <span className="text-xs font-bold text-primary">{update.progress_percentage}%</span>
                                                </div>
                                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                    <div
                                                        className="bg-primary h-2 rounded-full transition-all"
                                                        style={{ width: `${update.progress_percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{update.update_description}</p>
                                        {update.issues && (
                                            <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                                <p className="text-xs font-medium text-yellow-800 dark:text-yellow-300 mb-1">Issues:</p>
                                                <p className="text-sm text-yellow-700 dark:text-yellow-400">{update.issues}</p>
                                            </div>
                                        )}
                                        {update.next_steps && (
                                            <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                                <p className="text-xs font-medium text-blue-800 dark:text-blue-300 mb-1">Next Steps:</p>
                                                <p className="text-sm text-blue-700 dark:text-blue-400">{update.next_steps}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </AdminContentCard>

            {/* Create Update Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm">
                    <div className="bg-white dark:bg-dark-surface rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create Project Update</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Update Description *
                                    </label>
                                    <textarea
                                        value={data.update_description}
                                        onChange={(e) => setData('update_description', e.target.value)}
                                        required
                                        rows={4}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
                                    />
                                    {errors.update_description && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.update_description}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Progress Percentage
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max="100"
                                        value={data.progress_percentage}
                                        onChange={(e) => setData('progress_percentage', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
                                    />
                                    {errors.progress_percentage && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.progress_percentage}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Issues
                                    </label>
                                    <textarea
                                        value={data.issues}
                                        onChange={(e) => setData('issues', e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
                                    />
                                    {errors.issues && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.issues}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Next Steps
                                    </label>
                                    <textarea
                                        value={data.next_steps}
                                        onChange={(e) => setData('next_steps', e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
                                    />
                                    {errors.next_steps && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.next_steps}</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <Button type="submit" variant="primary" disabled={processing} className="flex-1">
                                    {processing ? 'Creating...' : 'Create Update'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
