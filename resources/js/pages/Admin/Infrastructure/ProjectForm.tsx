import { Link, useForm } from '@inertiajs/react';
import AdminLayout from '../../../components/AdminLayout';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import { ArrowLeft, Building2 } from 'lucide-react';

interface ProjectFormProps {
    project?: {
        id: string;
        project_code: string;
        project_name: string;
        project_description: string | null;
        project_type: string;
        location: string;
        pin_lat: number | null;
        pin_lng: number | null;
        barangay: string | null;
        budget: number;
        actual_cost: number;
        start_date: string | null;
        target_completion: string | null;
        actual_completion: string | null;
        status: string;
        project_manager_id: string;
        scope_of_work: string | null;
        sbr_reference_no: string | null;
        is_active: boolean;
    };
    projectManagers: Array<{
        id: string;
        name: string;
    }>;
}

export default function ProjectForm({ project, projectManagers }: ProjectFormProps) {
    const isEdit = !!project;

    const { data, setData, post, put, processing, errors } = useForm({
        project_name: project?.project_name || '',
        project_description: project?.project_description || '',
        project_type: project?.project_type || 'road_construction',
        location: project?.location || '',
        pin_lat: project?.pin_lat?.toString() || '',
        pin_lng: project?.pin_lng?.toString() || '',
        barangay: project?.barangay || '',
        budget: project?.budget?.toString() || '0',
        actual_cost: project?.actual_cost?.toString() || '0',
        start_date: project?.start_date || '',
        target_completion: project?.target_completion || '',
        actual_completion: project?.actual_completion || '',
        status: project?.status || 'planning',
        project_manager_id: project?.project_manager_id || '',
        scope_of_work: project?.scope_of_work || '',
        sbr_reference_no: project?.sbr_reference_no || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit) {
            put(`/admin/infrastructure/projects/${project.id}`, {
                preserveScroll: true,
            });
        } else {
            post('/admin/infrastructure/projects', {
                preserveScroll: true,
            });
        }
    };

    return (
        <AdminLayout
            title={isEdit ? 'Edit Infrastructure Project' : 'Create Infrastructure Project'}
            description={isEdit ? 'Update project information' : 'Register a new infrastructure project'}
            backButton={{
                href: isEdit ? `/admin/infrastructure/projects/${project.id}` : '/admin/infrastructure/projects',
                label: 'Back',
            }}
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white dark:bg-dark-surface shadow-lg rounded-lg p-6">
                    <h2 className="text-lg font-semibold text-foreground dark:text-white mb-4 flex items-center gap-2">
                        <Building2 size={20} />
                        Basic Information
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <Input
                                label="Project Name *"
                                type="text"
                                value={data.project_name}
                                onChange={(e) => setData('project_name', e.target.value)}
                                error={errors.project_name}
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                Project Description
                            </label>
                            <textarea
                                value={data.project_description}
                                onChange={(e) => setData('project_description', e.target.value)}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                            {errors.project_description && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.project_description}</p>
                            )}
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                Project Type *
                            </label>
                            <select
                                value={data.project_type}
                                onChange={(e) => setData('project_type', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                                required
                            >
                                <option value="road_construction">Road Construction</option>
                                <option value="drainage_system">Drainage System</option>
                                <option value="water_supply">Water Supply</option>
                                <option value="sewerage">Sewerage</option>
                                <option value="electrical">Electrical</option>
                                <option value="multi_utility">Multi-Utility</option>
                            </select>
                            {errors.project_type && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.project_type}</p>
                            )}
                        </div>

                        <div>
                            <Input
                                label="SBR Reference No"
                                type="text"
                                value={data.sbr_reference_no}
                                onChange={(e) => setData('sbr_reference_no', e.target.value)}
                                error={errors.sbr_reference_no}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <Input
                                label="Location *"
                                type="text"
                                value={data.location}
                                onChange={(e) => setData('location', e.target.value)}
                                error={errors.location}
                                required
                            />
                        </div>

                        <div>
                            <Input
                                label="Barangay"
                                type="text"
                                value={data.barangay}
                                onChange={(e) => setData('barangay', e.target.value)}
                                error={errors.barangay}
                            />
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                Project Manager *
                            </label>
                            <select
                                value={data.project_manager_id}
                                onChange={(e) => setData('project_manager_id', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                                required
                            >
                                <option value="">Select Project Manager</option>
                                {projectManagers.map((manager) => (
                                    <option key={manager.id} value={manager.id}>
                                        {manager.name}
                                    </option>
                                ))}
                            </select>
                            {errors.project_manager_id && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.project_manager_id}</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-dark-surface shadow-lg rounded-lg p-6">
                    <h2 className="text-lg font-semibold text-foreground dark:text-white mb-4">Financial Information</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Budget *"
                            type="number"
                            step="0.01"
                            min="0"
                            value={data.budget}
                            onChange={(e) => setData('budget', e.target.value)}
                            error={errors.budget}
                            required
                        />

                        {isEdit && (
                            <Input
                                label="Actual Cost"
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.actual_cost}
                                onChange={(e) => setData('actual_cost', e.target.value)}
                                error={errors.actual_cost}
                            />
                        )}
                    </div>
                </div>

                <div className="bg-white dark:bg-dark-surface shadow-lg rounded-lg p-6">
                    <h2 className="text-lg font-semibold text-foreground dark:text-white mb-4">Timeline</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Start Date"
                            type="date"
                            value={data.start_date}
                            onChange={(e) => setData('start_date', e.target.value)}
                            error={errors.start_date}
                        />

                        <Input
                            label="Target Completion"
                            type="date"
                            value={data.target_completion}
                            onChange={(e) => setData('target_completion', e.target.value)}
                            error={errors.target_completion}
                        />

                        {isEdit && (
                            <Input
                                label="Actual Completion"
                                type="date"
                                value={data.actual_completion}
                                onChange={(e) => setData('actual_completion', e.target.value)}
                                error={errors.actual_completion}
                            />
                        )}

                        {isEdit && (
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Status *
                                </label>
                                <select
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                                    required
                                >
                                    <option value="planning">Planning</option>
                                    <option value="approved">Approved</option>
                                    <option value="bidding">Bidding</option>
                                    <option value="contract_signed">Contract Signed</option>
                                    <option value="ongoing">Ongoing</option>
                                    <option value="suspended">Suspended</option>
                                    <option value="delayed">Delayed</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                                {errors.status && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.status}</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white dark:bg-dark-surface shadow-lg rounded-lg p-6">
                    <h2 className="text-lg font-semibold text-foreground dark:text-white mb-4">Additional Information</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                Scope of Work
                            </label>
                            <textarea
                                value={data.scope_of_work}
                                onChange={(e) => setData('scope_of_work', e.target.value)}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                            {errors.scope_of_work && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.scope_of_work}</p>
                            )}
                        </div>

                        <Input
                            label="Latitude"
                            type="number"
                            step="0.00000001"
                            value={data.pin_lat}
                            onChange={(e) => setData('pin_lat', e.target.value)}
                            error={errors.pin_lat}
                        />

                        <Input
                            label="Longitude"
                            type="number"
                            step="0.00000001"
                            value={data.pin_lng}
                            onChange={(e) => setData('pin_lng', e.target.value)}
                            error={errors.pin_lng}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <Link href={isEdit ? `/admin/infrastructure/projects/${project.id}` : '/admin/infrastructure/projects'}>
                        <Button variant="outline" type="button">
                            Cancel
                        </Button>
                    </Link>
                    <Button variant="primary" type="submit" disabled={processing}>
                        {processing ? 'Saving...' : isEdit ? 'Update Project' : 'Create Project'}
                    </Button>
                </div>
            </form>
        </AdminLayout>
    );
}
