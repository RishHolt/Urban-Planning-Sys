import { Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import AdminFilterSection from '../../../components/AdminFilterSection';
import AdminEmptyState from '../../../components/AdminEmptyState';
import Button from '../../../components/Button';
import { Building, Eye, Plus, CheckCircle, Clock, XCircle, Home } from 'lucide-react';

interface Project {
    id: string;
    project_code: string;
    project_name: string;
    location: string;
    housing_program: string;
    total_units: number;
    available_units: number;
    project_status: string;
}

interface ProjectsIndexProps {
    projects: {
        data: Project[];
        links: any;
        meta: any;
    };
    filters?: {
        status?: string;
        housing_program?: string;
    };
}

export default function ProjectsIndex({ projects, filters: initialFilters = {} }: ProjectsIndexProps) {
    const [showFilters, setShowFilters] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const { data, setData, get } = useForm({
        status: initialFilters.status || '',
        housing_program: initialFilters.housing_program || '',
    });

    const { data: createData, setData: setCreateData, post: postCreate, processing: creating, reset: resetCreate } = useForm({
        project_code: '',
        project_name: '',
        location: '',
        barangay: '',
        zoning_clearance_no: '',
        project_source: 'lgu_built',
        housing_program: 'socialized_housing',
        total_units: 0,
        lot_area_sqm: '',
        unit_floor_area_sqm: '',
        unit_price: '',
        monthly_amortization: '',
    });

    const handleSearch = (): void => {
        get('/admin/housing/projects', {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleReset = (): void => {
        setData({ status: '', housing_program: '' });
        router.get('/admin/housing/projects');
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        postCreate('/admin/housing/projects', {
            preserveScroll: true,
            onSuccess: () => {
                setShowCreateModal(false);
                resetCreate();
            },
        });
    };

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
            'planning': {
                label: 'Planning',
                className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
                icon: <Clock size={14} />
            },
            'under_construction': {
                label: 'Under Construction',
                className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
                icon: <Building size={14} />
            },
            'completed': {
                label: 'Completed',
                className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
                icon: <CheckCircle size={14} />
            },
            'fully_allocated': {
                label: 'Fully Allocated',
                className: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
                icon: <Home size={14} />
            },
        };

        const config = statusConfig[status] || {
            label: status,
            className: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
            icon: <Clock size={14} />
        };

        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
                {config.icon}
                {config.label}
            </span>
        );
    };

    const getHousingProgramLabel = (program: string): string => {
        const labels: Record<string, string> = {
            'socialized_housing': 'Socialized Housing',
            'relocation': 'Relocation',
            'rental_subsidy': 'Rental Subsidy',
            'housing_loan': 'Housing Loan',
        };
        return labels[program] || program;
    };

    return (
        <AdminLayout
            title="Housing Projects"
            description="Manage housing projects and units"
        >
            <div className="mb-6 flex justify-between items-center">
                <div></div>
                <Button
                    variant="primary"
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2"
                >
                    <Plus size={18} />
                    Create Project
                </Button>
            </div>

            <AdminFilterSection
                searchValue=""
                onSearchChange={() => {}}
                onSearch={handleSearch}
                onReset={handleReset}
                showFilters={showFilters}
                onToggleFilters={() => setShowFilters(!showFilters)}
                searchPlaceholder=""
                hideSearch={true}
                filterContent={
                    <>
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                Project Status
                            </label>
                            <select
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                                <option value="">All Statuses</option>
                                <option value="planning">Planning</option>
                                <option value="under_construction">Under Construction</option>
                                <option value="completed">Completed</option>
                                <option value="fully_allocated">Fully Allocated</option>
                            </select>
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                Housing Program
                            </label>
                            <select
                                value={data.housing_program}
                                onChange={(e) => setData('housing_program', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                                <option value="">All Programs</option>
                                <option value="socialized_housing">Socialized Housing</option>
                                <option value="relocation">Relocation</option>
                                <option value="rental_subsidy">Rental Subsidy</option>
                                <option value="housing_loan">Housing Loan</option>
                            </select>
                        </div>
                    </>
                }
            />

            {/* Projects Table */}
            <div className="bg-white dark:bg-dark-surface shadow-lg rounded-lg overflow-hidden">
                {projects.data.length === 0 ? (
                    <AdminEmptyState
                        icon={Building}
                        title="No Projects Found"
                        description="Create a new project to get started."
                    />
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Project Code
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Project Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Location
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Housing Program
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Units
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-dark-surface divide-y divide-gray-200 dark:divide-gray-700">
                                    {projects.data.map((project) => (
                                        <tr key={project.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-mono text-sm text-gray-900 dark:text-white">
                                                    {project.project_code}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {project.project_name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                                {project.location}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                                {getHousingProgramLabel(project.housing_program)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900 dark:text-white">
                                                    <span className="font-semibold">{project.available_units}</span>
                                                    <span className="text-gray-500 dark:text-gray-400"> / {project.total_units}</span>
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">available</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(project.project_status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <Link
                                                    href={`/admin/housing/projects/${project.id}`}
                                                    className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline font-medium"
                                                >
                                                    <Eye size={16} />
                                                    View
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination */}
                        {projects.links && projects.links.length > 3 && (
                            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    Showing {projects.meta.from} to {projects.meta.to} of {projects.meta.total} results
                                </div>
                                <div className="flex gap-2">
                                    {projects.links.map((link: any, index: number) => (
                                        <button
                                            key={index}
                                            onClick={() => {
                                                if (link.url) {
                                                    router.get(link.url, {}, { preserveState: true, preserveScroll: true });
                                                }
                                            }}
                                            disabled={!link.url}
                                            className={`px-3 py-2 text-sm rounded-lg ${
                                                link.active
                                                    ? 'bg-primary text-white'
                                                    : link.url
                                                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                                    : 'bg-gray-50 dark:bg-gray-900 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Create Project Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm">
                    <div className="bg-white dark:bg-dark-surface rounded-lg shadow-xl max-w-3xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create New Project</h3>
                            <button
                                onClick={() => {
                                    setShowCreateModal(false);
                                    resetCreate();
                                }}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            >
                                <XCircle size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleCreate}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Project Code <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={createData.project_code}
                                        onChange={(e) => setCreateData('project_code', e.target.value)}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Project Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={createData.project_name}
                                        onChange={(e) => setCreateData('project_name', e.target.value)}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Location <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={createData.location}
                                        onChange={(e) => setCreateData('location', e.target.value)}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Barangay <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={createData.barangay}
                                        onChange={(e) => setCreateData('barangay', e.target.value)}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Zoning Clearance No
                                    </label>
                                    <input
                                        type="text"
                                        value={createData.zoning_clearance_no}
                                        onChange={(e) => setCreateData('zoning_clearance_no', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Project Source <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={createData.project_source}
                                        onChange={(e) => setCreateData('project_source', e.target.value)}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                    >
                                        <option value="lgu_built">LGU Built</option>
                                        <option value="nha">NHA</option>
                                        <option value="shfc">SHFC</option>
                                        <option value="private_developer">Private Developer</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Housing Program <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={createData.housing_program}
                                        onChange={(e) => setCreateData('housing_program', e.target.value)}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                    >
                                        <option value="socialized_housing">Socialized Housing</option>
                                        <option value="relocation">Relocation</option>
                                        <option value="rental_subsidy">Rental Subsidy</option>
                                        <option value="housing_loan">Housing Loan</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Total Units <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={createData.total_units}
                                        onChange={(e) => setCreateData('total_units', parseInt(e.target.value) || 0)}
                                        required
                                        min="1"
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Lot Area (sqm)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={createData.lot_area_sqm}
                                        onChange={(e) => setCreateData('lot_area_sqm', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Unit Floor Area (sqm)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={createData.unit_floor_area_sqm}
                                        onChange={(e) => setCreateData('unit_floor_area_sqm', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Unit Price
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={createData.unit_price}
                                        onChange={(e) => setCreateData('unit_price', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Monthly Amortization
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={createData.monthly_amortization}
                                        onChange={(e) => setCreateData('monthly_amortization', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <Button type="submit" variant="primary" disabled={creating} className="flex-1">
                                    {creating ? 'Creating...' : 'Create Project'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        resetCreate();
                                    }}
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
