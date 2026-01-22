import { Link } from '@inertiajs/react';
import AdminLayout from '../../../components/AdminLayout';
import Button from '../../../components/Button';
import { ArrowLeft, Edit, Building2 } from 'lucide-react';

interface ProjectShowProps {
    project: {
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
        scope_of_work: string | null;
        is_active: boolean;
        created_at: string;
        project_manager: {
            id: string;
            profile: {
                full_name: string;
            } | null;
            email: string;
        } | null;
    };
}

export default function ProjectShow({ project }: ProjectShowProps) {
    const getStatusBadge = (status: string) => {
        const statusColors: Record<string, string> = {
            planning: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
            approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
            bidding: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
            contract_signed: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
            ongoing: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
            suspended: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
            delayed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
            completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
            cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
        };

        return (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}`}>
                {status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
        );
    };

    const getProjectTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            road_construction: 'Road Construction',
            drainage_system: 'Drainage System',
            water_supply: 'Water Supply',
            sewerage: 'Sewerage',
            electrical: 'Electrical',
            multi_utility: 'Multi-Utility',
        };
        return labels[type] || type;
    };

    return (
        <AdminLayout
            title={project.project_name}
            description={`Project Code: ${project.project_code}`}
            backButton={{
                href: '/admin/infrastructure/projects',
                label: 'Back to Projects',
            }}
        >
            <div className="mb-6 flex justify-end gap-3">
                <Link href={`/admin/infrastructure/projects/${project.id}/edit`}>
                    <Button variant="primary" className="flex items-center gap-2">
                        <Edit size={18} />
                        Edit Project
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Project Details */}
                    <div className="bg-white dark:bg-dark-surface shadow-lg rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Project Details</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Project Name
                                </label>
                                <p className="text-gray-900 dark:text-white">{project.project_name}</p>
                            </div>
                            {project.project_description && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Description
                                    </label>
                                    <p className="text-gray-900 dark:text-white">{project.project_description}</p>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Project Type
                                    </label>
                                    <p className="text-gray-900 dark:text-white">{getProjectTypeLabel(project.project_type)}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Status
                                    </label>
                                    {getStatusBadge(project.status)}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Location
                                </label>
                                <p className="text-gray-900 dark:text-white">{project.location}</p>
                                {project.barangay && (
                                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Barangay: {project.barangay}</p>
                                )}
                            </div>
                            {project.scope_of_work && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Scope of Work
                                    </label>
                                    <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{project.scope_of_work}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Project Info */}
                    <div className="bg-white dark:bg-dark-surface shadow-lg rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Project Information</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Project Code
                                </label>
                                <p className="text-gray-900 dark:text-white font-mono">{project.project_code}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Budget
                                </label>
                                <p className="text-gray-900 dark:text-white">
                                    ₱{project.budget.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Actual Cost
                                </label>
                                <p className="text-gray-900 dark:text-white">
                                    ₱{project.actual_cost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                            </div>
                            {project.start_date && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Start Date
                                    </label>
                                    <p className="text-gray-900 dark:text-white">
                                        {new Date(project.start_date).toLocaleDateString()}
                                    </p>
                                </div>
                            )}
                            {project.target_completion && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Target Completion
                                    </label>
                                    <p className="text-gray-900 dark:text-white">
                                        {new Date(project.target_completion).toLocaleDateString()}
                                    </p>
                                </div>
                            )}
                            {project.actual_completion && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Actual Completion
                                    </label>
                                    <p className="text-gray-900 dark:text-white">
                                        {new Date(project.actual_completion).toLocaleDateString()}
                                    </p>
                                </div>
                            )}
                            {project.project_manager && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Project Manager
                                    </label>
                                    <p className="text-gray-900 dark:text-white">
                                        {project.project_manager.profile?.full_name || project.project_manager.email}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
