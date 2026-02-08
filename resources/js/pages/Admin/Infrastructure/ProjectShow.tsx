import { Link, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import AdminContentCard from '../../../components/AdminContentCard';
import Button from '../../../components/Button';
import { ArrowLeft, Edit, Building2, Calendar, MapPin, DollarSign, User, FileText, Camera, Users, TrendingUp, ClipboardList, Image as ImageIcon } from 'lucide-react';

interface ProjectShowProps {
    project: {
        id: string;
        project_code: string;
        sbr_reference_no: string | null;
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
            name: string;
        } | null;
        phases: Array<{
            id: string;
            phase_name: string;
            phase_type: string;
            sequence_order: number;
            start_date: string | null;
            end_date: string | null;
            actual_start_date: string | null;
            actual_end_date: string | null;
            budget: number | null;
            actual_cost: number | null;
            progress_percentage: number | null;
            status: string;
            milestones: Array<{
                id: string;
                milestone_name: string;
                description: string | null;
                target_date: string | null;
                actual_date: string | null;
                status: string;
                remarks: string | null;
            }>;
        }>;
        documents: Array<{
            id: string;
            document_type: string;
            file_name: string;
            file_path: string;
            file_type: string;
            file_size: number;
            uploaded_at: string | null;
        }>;
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
        photos: Array<{
            id: string;
            photo_path: string;
            photo_description: string | null;
            photo_category: string;
            taken_at: string | null;
            phase: {
                id: string;
                phase_name: string;
            } | null;
            milestone: {
                id: string;
                milestone_name: string;
            } | null;
            inspection: {
                id: string;
                inspection_type: string;
            } | null;
            taken_by: {
                id: string;
                name: string;
            } | null;
        }>;
        contractors: Array<{
            id: string;
            contractor: {
                id: string;
                contractor_code: string;
                company_name: string;
                contact_person: string;
            };
            role: string;
            contract_amount: number;
            contract_start_date: string | null;
            contract_end_date: string | null;
            status: string;
            remarks: string | null;
        }>;
        budgetTracking: Array<{
            id: string;
            phase: {
                id: string;
                phase_name: string;
            } | null;
            budget_category: string;
            allocated_amount: number;
            spent_amount: number;
            remaining_amount: number;
            description: string | null;
            year: number;
            quarter: number;
        }>;
        inspections: Array<{
            id: string;
            inspection_type: string;
            phase: {
                id: string;
                phase_name: string;
            } | null;
            inspector: {
                id: string;
                name: string;
            } | null;
            scheduled_date: string | null;
            inspection_date: string | null;
            result: string | null;
            findings: string | null;
            deficiencies: string | null;
        }>;
        overall_progress: number;
        progress_summary: {
            overall_progress: number;
            phases: {
                total: number;
                completed: number;
                in_progress: number;
                pending: number;
            };
            milestones: {
                total: number;
                achieved: number;
                pending: number;
            };
            budget: {
                allocated: number;
                spent: number;
                remaining: number;
                percentage: number;
            };
        };
    };
}

type TabId = 'overview' | 'phases' | 'inspections' | 'contractors' | 'budget' | 'photos' | 'documents' | 'updates';

export default function ProjectShow({ project }: ProjectShowProps) {
    const { flash } = usePage<{ flash?: { success?: string; error?: string } }>().props;
    const [activeTab, setActiveTab] = useState<TabId>('overview');
    const [showStatusModal, setShowStatusModal] = useState(false);

    const { data: statusData, setData: setStatusData, processing: updatingStatus } = useForm({
        status: project.status,
    });

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

    const getPhaseStatusBadge = (status: string) => {
        const colors: Record<string, string> = {
            pending: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
            in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
            completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
            delayed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
            cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || colors.pending}`}>
                {status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
        );
    };

    const handleStatusUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        router.patch(`/admin/infrastructure/projects/${project.id}/status`, {
            status: statusData.status,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setShowStatusModal(false);
            },
        });
    };

    const tabs: Array<{ id: TabId; label: string; icon: React.ReactNode; count?: number }> = [
        { id: 'overview', label: 'Overview', icon: <Building2 size={18} /> },
        { id: 'phases', label: 'Phases & Milestones', icon: <ClipboardList size={18} />, count: project.phases.length },
        { id: 'inspections', label: 'Inspections', icon: <FileText size={18} />, count: project.inspections.length },
        { id: 'contractors', label: 'Contractors', icon: <Users size={18} />, count: project.contractors.length },
        { id: 'budget', label: 'Budget', icon: <DollarSign size={18} /> },
        { id: 'photos', label: 'Photos', icon: <Camera size={18} />, count: project.photos.length },
        { id: 'documents', label: 'Documents', icon: <FileText size={18} />, count: project.documents.length },
        { id: 'updates', label: 'Updates', icon: <TrendingUp size={18} />, count: project.updates.length },
    ];

    return (
        <AdminLayout
            title={project.project_name}
            description={`Project Code: ${project.project_code}`}
            backButton={{
                href: '/admin/infrastructure/projects',
                label: 'Back to Projects',
            }}
        >
            {/* Flash Messages */}
            {flash?.success && (
                <div className="mb-6 p-4 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg">
                    {flash.success}
                </div>
            )}
            {flash?.error && (
                <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg">
                    {flash.error}
                </div>
            )}

            {/* Header Actions */}
            <div className="mb-6 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    {getStatusBadge(project.status)}
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setShowStatusModal(true)}
                        className="flex items-center gap-2"
                    >
                        Update Status
                    </Button>
                    <Link href={`/admin/infrastructure/projects/${project.id}/edit`}>
                        <Button variant="primary" size="sm" className="flex items-center gap-2">
                            <Edit size={18} />
                            Edit Project
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Tabs */}
            <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2
                                ${
                                    activeTab === tab.id
                                        ? 'border-primary text-primary dark:text-primary'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                }
                            `}
                        >
                            {tab.icon}
                            {tab.label}
                            {tab.count !== undefined && tab.count > 0 && (
                                <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div>
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* Progress Summary */}
                        <AdminContentCard padding="lg">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Progress Summary</h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                        {project.progress_summary.overall_progress.toFixed(1)}%
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Overall Progress</div>
                                </div>
                                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                        {project.progress_summary.phases.completed}/{project.progress_summary.phases.total}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Phases Completed</div>
                                </div>
                                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                        {project.progress_summary.milestones.achieved}/{project.progress_summary.milestones.total}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Milestones Achieved</div>
                                </div>
                                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                        {project.progress_summary.budget.percentage.toFixed(1)}%
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Budget Used</div>
                                </div>
                            </div>
                        </AdminContentCard>

                        {/* Project Details */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-6">
                                <AdminContentCard padding="lg">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Project Details</h3>
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
                                            <p className="text-gray-900 dark:text-white flex items-center gap-2">
                                                <MapPin size={16} />
                                                {project.location}
                                            </p>
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
                                </AdminContentCard>
                            </div>

                            {/* Sidebar */}
                            <div className="space-y-6">
                                <AdminContentCard padding="lg">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Project Information</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Project Code
                                            </label>
                                            <p className="text-gray-900 dark:text-white font-mono">{project.project_code}</p>
                                        </div>
                                        {project.sbr_reference_no && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    SBR Reference
                                                </label>
                                                <p className="text-gray-900 dark:text-white font-mono">{project.sbr_reference_no}</p>
                                            </div>
                                        )}
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
                                                <p className="text-gray-900 dark:text-white flex items-center gap-2">
                                                    <Calendar size={16} />
                                                    {new Date(project.start_date).toLocaleDateString()}
                                                </p>
                                            </div>
                                        )}
                                        {project.target_completion && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Target Completion
                                                </label>
                                                <p className="text-gray-900 dark:text-white flex items-center gap-2">
                                                    <Calendar size={16} />
                                                    {new Date(project.target_completion).toLocaleDateString()}
                                                </p>
                                            </div>
                                        )}
                                        {project.actual_completion && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Actual Completion
                                                </label>
                                                <p className="text-gray-900 dark:text-white flex items-center gap-2">
                                                    <Calendar size={16} />
                                                    {new Date(project.actual_completion).toLocaleDateString()}
                                                </p>
                                            </div>
                                        )}
                                        {project.project_manager && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Project Manager
                                                </label>
                                                <p className="text-gray-900 dark:text-white flex items-center gap-2">
                                                    <User size={16} />
                                                    {project.project_manager.name}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </AdminContentCard>
                            </div>
                        </div>
                    </div>
                )}

                {/* Phases & Milestones Tab */}
                {activeTab === 'phases' && (
                    <AdminContentCard padding="lg">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Phases & Milestones</h3>
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => router.visit(`/admin/infrastructure/projects/${project.id}/phases`)}
                                className="flex items-center gap-2"
                            >
                                Manage Phases
                            </Button>
                        </div>
                        <div className="space-y-6">
                            {project.phases.length === 0 ? (
                                <div className="text-center py-12">
                                    <ClipboardList className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No phases yet</h3>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        Get started by creating the first phase for this project.
                                    </p>
                                </div>
                            ) : (
                                project.phases.map((phase) => (
                                    <div key={phase.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h4 className="font-semibold text-gray-900 dark:text-white">{phase.phase_name}</h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{phase.phase_type.replace('_', ' ')}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {getPhaseStatusBadge(phase.status)}
                                                {phase.progress_percentage !== null && (
                                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                        {phase.progress_percentage.toFixed(1)}%
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {phase.milestones.length > 0 && (
                                            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Milestones:</p>
                                                <div className="space-y-2">
                                                    {phase.milestones.map((milestone) => (
                                                        <div key={milestone.id} className="flex items-center justify-between text-sm">
                                                            <span className="text-gray-900 dark:text-white">{milestone.milestone_name}</span>
                                                            <span className={`px-2 py-1 rounded text-xs ${
                                                                milestone.status === 'achieved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                                                milestone.status === 'missed' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                                                                'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                                                            }`}>
                                                                {milestone.status}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </AdminContentCard>
                )}

                {/* Inspections Tab */}
                {activeTab === 'inspections' && (
                    <AdminContentCard padding="lg">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Inspections</h3>
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => router.visit(`/admin/infrastructure/projects/${project.id}/inspections`)}
                                className="flex items-center gap-2"
                            >
                                Schedule Inspection
                            </Button>
                        </div>
                        {project.inspections.length === 0 ? (
                            <div className="text-center py-12">
                                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No inspections yet</h3>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {project.inspections.map((inspection) => (
                                    <div key={inspection.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-semibold text-gray-900 dark:text-white capitalize">
                                                    {inspection.inspection_type.replace('_', ' ')}
                                                </h4>
                                                {inspection.phase && (
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">Phase: {inspection.phase.phase_name}</p>
                                                )}
                                                {inspection.inspector && (
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">Inspector: {inspection.inspector.name}</p>
                                                )}
                                                {inspection.scheduled_date && (
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        Scheduled: {new Date(inspection.scheduled_date).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </div>
                                            {inspection.result && (
                                                <span className={`px-2 py-1 rounded text-xs ${
                                                    inspection.result === 'passed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                                    inspection.result === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                                                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                                }`}>
                                                    {inspection.result}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </AdminContentCard>
                )}

                {/* Contractors Tab */}
                {activeTab === 'contractors' && (
                    <AdminContentCard padding="lg">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Contractors</h3>
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => router.visit(`/admin/infrastructure/projects/${project.id}/contractors`)}
                                className="flex items-center gap-2"
                            >
                                Manage Contractors
                            </Button>
                        </div>
                        {project.contractors.length === 0 ? (
                            <div className="text-center py-12">
                                <Users className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No contractors assigned</h3>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {project.contractors.map((projectContractor) => (
                                    <div key={projectContractor.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                                    {projectContractor.contractor.company_name}
                                                </h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {projectContractor.contractor.contractor_code} • {projectContractor.contractor.contact_person}
                                                </p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                                                    Role: {projectContractor.role.replace('_', ' ')}
                                                </p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    Contract: ₱{projectContractor.contract_amount.toLocaleString()}
                                                </p>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-xs ${
                                                projectContractor.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                                projectContractor.status === 'completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                                                'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                                            }`}>
                                                {projectContractor.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </AdminContentCard>
                )}

                {/* Budget Tab */}
                {activeTab === 'budget' && (
                    <AdminContentCard padding="lg">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Budget Tracking</h3>
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => router.visit(`/admin/infrastructure/projects/${project.id}/budget`)}
                                className="flex items-center gap-2"
                            >
                                Manage Budget
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                    ₱{project.progress_summary.budget.allocated.toLocaleString()}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Total Allocated</div>
                            </div>
                            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    ₱{project.progress_summary.budget.spent.toLocaleString()}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Total Spent</div>
                            </div>
                            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                    ₱{project.progress_summary.budget.remaining.toLocaleString()}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Remaining</div>
                            </div>
                        </div>
                        {project.budgetTracking.length === 0 ? (
                            <div className="text-center py-12">
                                <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No budget records yet</h3>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 dark:bg-gray-800">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Category</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Allocated</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Spent</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Remaining</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {project.budgetTracking.map((budget) => (
                                            <tr key={budget.id}>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white capitalize">
                                                    {budget.budget_category.replace('_', ' ')}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                                    ₱{budget.allocated_amount.toLocaleString()}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                                    ₱{budget.spent_amount.toLocaleString()}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                                    ₱{budget.remaining_amount.toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </AdminContentCard>
                )}

                {/* Photos Tab */}
                {activeTab === 'photos' && (
                    <AdminContentCard padding="lg">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Photo Gallery</h3>
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => router.visit(`/admin/infrastructure/projects/${project.id}/photos`)}
                                className="flex items-center gap-2"
                            >
                                <Camera size={18} />
                                Upload Photos
                            </Button>
                        </div>
                        {project.photos.length === 0 ? (
                            <div className="text-center py-12">
                                <Camera className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No photos yet</h3>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {project.photos.map((photo) => (
                                    <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                                        <img
                                            src={`/storage/${photo.photo_path}`}
                                            alt={photo.photo_description || 'Project photo'}
                                            className="w-full h-full object-cover"
                                        />
                                        {photo.photo_description && (
                                            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2">
                                                {photo.photo_description}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </AdminContentCard>
                )}

                {/* Documents Tab */}
                {activeTab === 'documents' && (
                    <AdminContentCard padding="lg">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Documents</h3>
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => router.visit(`/admin/infrastructure/projects/${project.id}/documents`)}
                                className="flex items-center gap-2"
                            >
                                Upload Document
                            </Button>
                        </div>
                        {project.documents.length === 0 ? (
                            <div className="text-center py-12">
                                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No documents yet</h3>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {project.documents.map((document) => (
                                    <div key={document.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <FileText size={20} className="text-gray-400" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">{document.file_name}</p>
                                                <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                                                    {document.document_type.replace('_', ' ')}
                                                </p>
                                            </div>
                                        </div>
                                        <a
                                            href={`/admin/infrastructure/projects/${project.id}/documents/${document.id}`}
                                            className="text-sm text-primary hover:underline"
                                        >
                                            Download
                                        </a>
                                    </div>
                                ))}
                            </div>
                        )}
                    </AdminContentCard>
                )}

                {/* Updates Tab */}
                {activeTab === 'updates' && (
                    <AdminContentCard padding="lg">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Project Updates</h3>
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => router.visit(`/admin/infrastructure/projects/${project.id}/updates`)}
                                className="flex items-center gap-2"
                            >
                                Create Update
                            </Button>
                        </div>
                        {project.updates.length === 0 ? (
                            <div className="text-center py-12">
                                <TrendingUp className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No updates yet</h3>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {project.updates.map((update) => (
                                    <div key={update.id} className="border-l-4 border-primary pl-4 py-2">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {update.updated_by?.name || 'System'}
                                                </p>
                                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                                    {new Date(update.created_at).toLocaleString()}
                                                </p>
                                            </div>
                                            {update.progress_percentage !== null && (
                                                <span className="text-sm font-medium text-primary">
                                                    {update.progress_percentage}% Complete
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-700 dark:text-gray-300">{update.update_description}</p>
                                        {update.issues && (
                                            <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-sm">
                                                <strong>Issues:</strong> {update.issues}
                                            </div>
                                        )}
                                        {update.next_steps && (
                                            <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-sm">
                                                <strong>Next Steps:</strong> {update.next_steps}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </AdminContentCard>
                )}
            </div>

            {/* Status Update Modal */}
            {showStatusModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm">
                    <div className="bg-white dark:bg-dark-surface rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Update Project Status</h3>
                        <form onSubmit={handleStatusUpdate}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                                <select
                                    value={statusData.status}
                                    onChange={(e) => setStatusData('status', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
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
                            </div>
                            <div className="flex gap-3">
                                <Button type="submit" variant="primary" disabled={updatingStatus} className="flex-1">
                                    {updatingStatus ? 'Updating...' : 'Update Status'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setShowStatusModal(false)}
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
