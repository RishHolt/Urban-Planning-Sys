import { useState } from 'react';
import { router, useForm, Link } from '@inertiajs/react';
import AdminLayout from '../../../components/AdminLayout';
import AdminFilterSection from '../../../components/AdminFilterSection';
import Button from '../../../components/Button';
import { Building2, Eye, Plus, Download } from 'lucide-react';

interface Project {
    id: string;
    projectCode: string;
    projectName: string;
    projectType: string;
    location: string;
    status: string;
    budget: number;
    actualCost: number;
    targetCompletion: string | null;
    projectManager: {
        id: string;
        name: string;
    } | null;
    createdAt: string;
}

interface PaginatedProjects {
    data: Project[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
    current_page: number;
    last_page: number;
}

interface ProjectsIndexProps {
    projects: PaginatedProjects;
    filters?: {
        search?: string;
        project_type?: string;
        status?: string;
        is_active?: string;
    };
}

export default function ProjectsIndex({ projects, filters: initialFilters = {} }: ProjectsIndexProps) {
    const [showFilters, setShowFilters] = useState(false);
    const { data, setData, get } = useForm({
        search: initialFilters.search || '',
        project_type: initialFilters.project_type || '',
        status: initialFilters.status || '',
        is_active: initialFilters.is_active || '',
    });

    const handleSearch = (): void => {
        get('/admin/infrastructure/projects', {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleReset = (): void => {
        setData({
            search: '',
            project_type: '',
            status: '',
            is_active: '',
        });
        router.get('/admin/infrastructure/projects');
    };

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
            title="Infrastructure Projects"
            description="Manage and track infrastructure projects from planning to completion"
        >
            <div className="mb-6 flex justify-between items-center">
                <div></div>
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        size="md"
                        onClick={() => {}}
                        className="flex items-center gap-2"
                    >
                        <Download size={18} />
                        Export
                    </Button>
                    <Link href="/admin/infrastructure/projects/create">
                        <Button
                            variant="primary"
                            className="flex items-center gap-2"
                        >
                            <Plus size={18} />
                            Create Project
                        </Button>
                    </Link>
                </div>
            </div>

            <AdminFilterSection
                searchValue={data.search}
                onSearchChange={(value) => setData('search', value)}
                onSearch={handleSearch}
                onReset={handleReset}
                showFilters={showFilters}
                onToggleFilters={() => setShowFilters(!showFilters)}
                searchPlaceholder="Search by project code, name, or location..."
                filterContent={
                    <>
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                Project Type
                            </label>
                            <select
                                value={data.project_type}
                                onChange={(e) => setData('project_type', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                                <option value="">All Types</option>
                                <option value="road_construction">Road Construction</option>
                                <option value="drainage_system">Drainage System</option>
                                <option value="water_supply">Water Supply</option>
                                <option value="sewerage">Sewerage</option>
                                <option value="electrical">Electrical</option>
                                <option value="multi_utility">Multi-Utility</option>
                            </select>
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                Status
                            </label>
                            <select
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                                <option value="">All Statuses</option>
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
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                Active Status
                            </label>
                            <select
                                value={data.is_active}
                                onChange={(e) => setData('is_active', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                                <option value="">All</option>
                                <option value="1">Active</option>
                                <option value="0">Inactive</option>
                            </select>
                        </div>
                    </>
                }
            />

            {/* Projects Table */}
            <div className="bg-white dark:bg-dark-surface shadow-lg rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Project Code
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Project Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Location
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Budget
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Project Manager
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-dark-surface divide-y divide-gray-200 dark:divide-gray-700">
                            {projects.data.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Building2 size={48} className="text-gray-400 dark:text-gray-600" />
                                            <p className="text-gray-500 dark:text-gray-400">No projects found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                projects.data.map((project) => (
                                    <tr key={project.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium text-gray-900 dark:text-white text-sm">
                                                {project.projectCode}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-gray-900 dark:text-white text-sm font-medium">
                                                {project.projectName}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-gray-900 dark:text-white text-sm">
                                                {getProjectTypeLabel(project.projectType)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-gray-900 dark:text-white text-sm max-w-xs truncate">
                                                {project.location}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(project.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-gray-900 dark:text-white text-sm">
                                                ₱{project.budget.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-gray-900 dark:text-white text-sm">
                                                {project.projectManager?.name || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Link
                                                href={`/admin/infrastructure/projects/${project.id}`}
                                                className="text-primary hover:text-primary-dark font-medium text-sm flex items-center gap-1"
                                            >
                                                <Eye size={16} />
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {projects.links && projects.links.length > 3 && (
                    <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                            Showing page {projects.current_page} of {projects.last_page}
                        </div>
                        <div className="flex gap-2">
                            {projects.links.map((link, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => link.url && router.get(link.url)}
                                    disabled={!link.url || link.active}
                                    className={`px-3 py-2 rounded text-sm ${
                                        link.active
                                            ? 'bg-primary text-white'
                                            : link.url
                                            ? 'bg-white dark:bg-dark-surface border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
