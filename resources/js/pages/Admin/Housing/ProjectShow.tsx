import { Link, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import AdminContentCard from '../../../components/AdminContentCard';
import Button from '../../../components/Button';
import { ArrowLeft, Building, Home, MapPin, Calendar, CheckCircle, Clock, XCircle, Plus, Edit } from 'lucide-react';

interface Unit {
    id: string;
    unit_no: string;
    block_no: string | null;
    lot_no: string | null;
    unit_type: string;
    floor_area_sqm: number;
    status: string;
}

interface ProjectShowProps {
    project: {
        id: string;
        project_code: string;
        project_name: string;
        location: string;
        barangay: string;
        housing_program: string;
        project_source: string;
        project_status: string;
        total_units: number;
        available_units: number;
        allocated_units: number;
        occupied_units: number;
        lot_area_sqm: number | null;
        unit_floor_area_sqm: number | null;
        unit_price: number | null;
        monthly_amortization: number | null;
        units: Unit[];
    };
}

export default function ProjectShow({ project }: ProjectShowProps) {
    const { flash } = usePage<{ flash?: { success?: string; error?: string } }>().props;
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAddUnitModal, setShowAddUnitModal] = useState(false);

    const { data: editData, setData: setEditData, patch, processing: updating } = useForm({
        project_name: project.project_name,
        project_status: project.project_status,
        total_units: project.total_units,
    });

    const { data: unitData, setData: setUnitData, post: postUnit, processing: creatingUnit, reset: resetUnit } = useForm({
        unit_no: '',
        block_no: '',
        lot_no: '',
        floor_number: '',
        unit_type: 'single_detached',
        floor_area_sqm: '',
    });

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        patch(`/admin/housing/projects/${project.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setShowEditModal(false);
            },
        });
    };

    const handleAddUnit = (e: React.FormEvent) => {
        e.preventDefault();
        postUnit(`/admin/housing/projects/${project.id}/units`, {
            preserveScroll: true,
            onSuccess: () => {
                setShowAddUnitModal(false);
                resetUnit();
            },
        });
    };

    const handleUnitStatusUpdate = (unitId: string, newStatus: string) => {
        router.patch(`/admin/housing/projects/${project.id}/units/${unitId}`, {
            status: newStatus,
        }, {
            preserveScroll: true,
        });
    };

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
            'planning': {
                label: 'Planning',
                className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
                icon: <Clock size={16} />
            },
            'under_construction': {
                label: 'Under Construction',
                className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
                icon: <Building size={16} />
            },
            'completed': {
                label: 'Completed',
                className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
                icon: <CheckCircle size={16} />
            },
            'fully_allocated': {
                label: 'Fully Allocated',
                className: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
                icon: <Home size={16} />
            },
        };

        const config = statusConfig[status] || {
            label: status,
            className: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
            icon: <Clock size={16} />
        };

        return (
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.className}`}>
                {config.icon}
                {config.label}
            </span>
        );
    };

    const getUnitStatusBadge = (status: string) => {
        const statusConfig: Record<string, { label: string; className: string }> = {
            'available': {
                label: 'Available',
                className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            },
            'reserved': {
                label: 'Reserved',
                className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            },
            'allocated': {
                label: 'Allocated',
                className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            },
            'occupied': {
                label: 'Occupied',
                className: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
            },
            'maintenance': {
                label: 'Maintenance',
                className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
            },
        };

        const config = statusConfig[status] || {
            label: status,
            className: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
        };

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
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
            title="Project Details"
            description="View and manage project details and units"
            backButton={{
                href: '/admin/housing/projects',
                label: 'Back to Projects',
            }}
        >
            {/* Flash Messages */}
            {flash?.success && (
                <div className="mb-6 p-4 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg">
                    {flash.success}
                </div>
            )}

            <div className="space-y-6">
                {/* Project Header */}
                <AdminContentCard padding="lg">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                {project.project_name}
                            </h2>
                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                <span className="font-mono">{project.project_code}</span>
                                <span className="flex items-center gap-1">
                                    <MapPin size={14} />
                                    {project.location}, {project.barangay}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {getStatusBadge(project.project_status)}
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setShowEditModal(true)}
                                className="flex items-center gap-2"
                            >
                                <Edit size={16} />
                                Edit
                            </Button>
                        </div>
                    </div>

                    {/* Project Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-gray-50 dark:bg-dark-bg rounded-lg">
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">{project.total_units}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Total Units</div>
                        </div>
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{project.available_units}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Available</div>
                        </div>
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{project.allocated_units}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Allocated</div>
                        </div>
                        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{project.occupied_units}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Occupied</div>
                        </div>
                    </div>
                </AdminContentCard>

                {/* Project Details */}
                <AdminContentCard padding="lg">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Project Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Housing Program</label>
                            <p className="text-gray-900 dark:text-white">{getHousingProgramLabel(project.housing_program)}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Project Source</label>
                            <p className="text-gray-900 dark:text-white capitalize">{project.project_source.replace('_', ' ')}</p>
                        </div>
                        {project.lot_area_sqm && (
                            <div>
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Lot Area</label>
                                <p className="text-gray-900 dark:text-white">{project.lot_area_sqm} sqm</p>
                            </div>
                        )}
                        {project.unit_floor_area_sqm && (
                            <div>
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Unit Floor Area</label>
                                <p className="text-gray-900 dark:text-white">{project.unit_floor_area_sqm} sqm</p>
                            </div>
                        )}
                        {project.unit_price && (
                            <div>
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Unit Price</label>
                                <p className="text-gray-900 dark:text-white">₱{project.unit_price.toLocaleString()}</p>
                            </div>
                        )}
                        {project.monthly_amortization && (
                            <div>
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Amortization</label>
                                <p className="text-gray-900 dark:text-white">₱{project.monthly_amortization.toLocaleString()}</p>
                            </div>
                        )}
                    </div>
                </AdminContentCard>

                {/* Units Section */}
                <AdminContentCard padding="lg">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Units</h3>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setShowAddUnitModal(true)}
                            className="flex items-center gap-2"
                        >
                            <Plus size={16} />
                            Add Unit
                        </Button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Unit No</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Block/Lot</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Floor Area</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {project.units.map((unit) => (
                                    <tr key={unit.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                        <td className="px-4 py-3 font-mono text-sm text-gray-900 dark:text-white">{unit.unit_no}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                            {unit.block_no && `Block ${unit.block_no}`}
                                            {unit.block_no && unit.lot_no && ' / '}
                                            {unit.lot_no && `Lot ${unit.lot_no}`}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 capitalize">{unit.unit_type.replace('_', ' ')}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{unit.floor_area_sqm} sqm</td>
                                        <td className="px-4 py-3">{getUnitStatusBadge(unit.status)}</td>
                                        <td className="px-4 py-3">
                                            <select
                                                value={unit.status}
                                                onChange={(e) => handleUnitStatusUpdate(unit.id, e.target.value)}
                                                className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
                                            >
                                                <option value="available">Available</option>
                                                <option value="reserved">Reserved</option>
                                                <option value="allocated">Allocated</option>
                                                <option value="occupied">Occupied</option>
                                                <option value="maintenance">Maintenance</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </AdminContentCard>
            </div>

            {/* Edit Modal */}
            {showEditModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm">
                    <div className="bg-white dark:bg-dark-surface rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Edit Project</h3>
                        <form onSubmit={handleUpdate}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Project Name</label>
                                    <input
                                        type="text"
                                        value={editData.project_name}
                                        onChange={(e) => setEditData('project_name', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                                    <select
                                        value={editData.project_status}
                                        onChange={(e) => setEditData('project_status', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
                                    >
                                        <option value="planning">Planning</option>
                                        <option value="under_construction">Under Construction</option>
                                        <option value="completed">Completed</option>
                                        <option value="fully_allocated">Fully Allocated</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Total Units</label>
                                    <input
                                        type="number"
                                        value={editData.total_units}
                                        onChange={(e) => setEditData('total_units', parseInt(e.target.value) || 0)}
                                        min="0"
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <Button type="submit" variant="primary" disabled={updating} className="flex-1">
                                    {updating ? 'Updating...' : 'Update'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setShowEditModal(false)}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Unit Modal */}
            {showAddUnitModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm">
                    <div className="bg-white dark:bg-dark-surface rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add Unit</h3>
                        <form onSubmit={handleAddUnit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Unit Number *</label>
                                    <input
                                        type="text"
                                        value={unitData.unit_no}
                                        onChange={(e) => setUnitData('unit_no', e.target.value)}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Block No</label>
                                        <input
                                            type="text"
                                            value={unitData.block_no}
                                            onChange={(e) => setUnitData('block_no', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Lot No</label>
                                        <input
                                            type="text"
                                            value={unitData.lot_no}
                                            onChange={(e) => setUnitData('lot_no', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Unit Type *</label>
                                    <select
                                        value={unitData.unit_type}
                                        onChange={(e) => setUnitData('unit_type', e.target.value)}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
                                    >
                                        <option value="single_detached">Single Detached</option>
                                        <option value="duplex">Duplex</option>
                                        <option value="rowhouse">Rowhouse</option>
                                        <option value="apartment">Apartment</option>
                                        <option value="condominium">Condominium</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Floor Area (sqm) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={unitData.floor_area_sqm}
                                        onChange={(e) => setUnitData('floor_area_sqm', e.target.value)}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <Button type="submit" variant="primary" disabled={creatingUnit} className="flex-1">
                                    {creatingUnit ? 'Creating...' : 'Create Unit'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => {
                                        setShowAddUnitModal(false);
                                        resetUnit();
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
