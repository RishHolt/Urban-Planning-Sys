import { Link } from '@inertiajs/react';
import AdminLayout from '../../../components/AdminLayout';
import AdminContentCard from '../../../components/AdminContentCard';
import { Building2, TrendingUp, Clock, CheckCircle, DollarSign, AlertTriangle, Users, FileText } from 'lucide-react';

interface DashboardProps {
    stats: {
        total_projects: number;
        ongoing_projects: number;
        delayed_projects: number;
        completed_projects: number;
        total_budget: number;
        total_spent: number;
        active_contractors: number;
        pending_inspections: number;
    };
    recentProjects?: Array<{
        id: string;
        project_code: string;
        project_name: string;
        status: string;
        progress_percentage: number | null;
    }>;
    upcomingInspections?: Array<{
        id: string;
        inspection_type: string;
        scheduled_date: string;
        project: {
            id: string;
            project_code: string;
            project_name: string;
        };
    }>;
}

export default function Dashboard({ stats, recentProjects = [], upcomingInspections = [] }: DashboardProps) {
    const budgetUsage = stats.total_budget > 0
        ? ((stats.total_spent / stats.total_budget) * 100).toFixed(1)
        : '0.0';

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
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}`}>
                {status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
        );
    };

    return (
        <AdminLayout
            title="Infrastructure Project Coordination"
            description="Track and coordinate infrastructure projects from planning to completion"
        >
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <AdminContentCard padding="md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Projects</p>
                            <p className="text-gray-900 dark:text-white text-2xl font-bold mt-1">{stats.total_projects}</p>
                        </div>
                        <Building2 size={40} className="text-primary" />
                    </div>
                </AdminContentCard>

                <AdminContentCard padding="md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Ongoing Projects</p>
                            <p className="text-gray-900 dark:text-white text-2xl font-bold mt-1">{stats.ongoing_projects}</p>
                        </div>
                        <TrendingUp size={40} className="text-blue-500" />
                    </div>
                </AdminContentCard>

                <AdminContentCard padding="md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Delayed Projects</p>
                            <p className="text-gray-900 dark:text-white text-2xl font-bold mt-1">{stats.delayed_projects}</p>
                        </div>
                        <Clock size={40} className="text-orange-500" />
                    </div>
                </AdminContentCard>

                <AdminContentCard padding="md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Completed Projects</p>
                            <p className="text-gray-900 dark:text-white text-2xl font-bold mt-1">{stats.completed_projects}</p>
                        </div>
                        <CheckCircle size={40} className="text-green-500" />
                    </div>
                </AdminContentCard>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <AdminContentCard padding="md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Budget</p>
                            <p className="text-gray-900 dark:text-white text-xl font-bold mt-1">
                                ₱{(stats.total_budget / 1000000).toFixed(1)}M
                            </p>
                        </div>
                        <DollarSign size={32} className="text-green-500" />
                    </div>
                </AdminContentCard>

                <AdminContentCard padding="md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Spent</p>
                            <p className="text-gray-900 dark:text-white text-xl font-bold mt-1">
                                ₱{(stats.total_spent / 1000000).toFixed(1)}M
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {budgetUsage}% used
                            </p>
                        </div>
                        <DollarSign size={32} className="text-blue-500" />
                    </div>
                </AdminContentCard>

                <AdminContentCard padding="md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Active Contractors</p>
                            <p className="text-gray-900 dark:text-white text-2xl font-bold mt-1">{stats.active_contractors}</p>
                        </div>
                        <Users size={32} className="text-purple-500" />
                    </div>
                </AdminContentCard>

                <AdminContentCard padding="md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Pending Inspections</p>
                            <p className="text-gray-900 dark:text-white text-2xl font-bold mt-1">{stats.pending_inspections}</p>
                        </div>
                        <FileText size={32} className="text-orange-500" />
                    </div>
                </AdminContentCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Projects */}
                <AdminContentCard padding="lg">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Projects</h2>
                        <Link
                            href="/admin/infrastructure/projects"
                            className="text-sm text-primary hover:text-primary/80"
                        >
                            View All
                        </Link>
                    </div>
                    {recentProjects.length === 0 ? (
                        <div className="text-center py-8">
                            <Building2 className="mx-auto h-8 w-8 text-gray-400" />
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No projects yet</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {recentProjects.map((project) => (
                                <Link
                                    key={project.id}
                                    href={`/admin/infrastructure/projects/${project.id}`}
                                    className="block p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900 dark:text-white">{project.project_name}</p>
                                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-mono">
                                                {project.project_code}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {project.progress_percentage !== null && (
                                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                                    {project.progress_percentage}%
                                                </span>
                                            )}
                                            {getStatusBadge(project.status)}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </AdminContentCard>

                {/* Upcoming Inspections */}
                <AdminContentCard padding="lg">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Inspections</h2>
                        <Link
                            href="/admin/infrastructure/projects"
                            className="text-sm text-primary hover:text-primary/80"
                        >
                            View All
                        </Link>
                    </div>
                    {upcomingInspections.length === 0 ? (
                        <div className="text-center py-8">
                            <FileText className="mx-auto h-8 w-8 text-gray-400" />
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No upcoming inspections</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {upcomingInspections.map((inspection) => (
                                <Link
                                    key={inspection.id}
                                    href={`/admin/infrastructure/projects/${inspection.project.id}`}
                                    className="block p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900 dark:text-white capitalize">
                                                {inspection.inspection_type.replace('_', ' ')}
                                            </p>
                                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                                {inspection.project.project_code} - {inspection.project.project_name}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                                {new Date(inspection.scheduled_date).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </AdminContentCard>
            </div>

            {/* Quick Actions */}
            <AdminContentCard padding="lg" className="mt-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link
                        href="/admin/infrastructure/projects/create"
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        <h3 className="font-medium text-gray-900 dark:text-white mb-1">Create New Project</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Register a new infrastructure project</p>
                    </Link>
                    <Link
                        href="/admin/infrastructure/projects"
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        <h3 className="font-medium text-gray-900 dark:text-white mb-1">View All Projects</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Browse and manage all projects</p>
                    </Link>
                    <Link
                        href="/admin/infrastructure/reports"
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        <h3 className="font-medium text-gray-900 dark:text-white mb-1">View Reports</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Generate project reports and analytics</p>
                    </Link>
                </div>
            </AdminContentCard>
        </AdminLayout>
    );
}
