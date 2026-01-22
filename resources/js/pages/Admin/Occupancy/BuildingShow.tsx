import { Link, router, usePage } from '@inertiajs/react';
import AdminLayout from '../../../components/AdminLayout';
import AdminContentCard from '../../../components/AdminContentCard';
import Button from '../../../components/Button';
import { ArrowLeft, Building, MapPin, Calendar, Eye, Plus, Edit, AlertTriangle, FileWarning, CheckSquare } from 'lucide-react';

interface Unit {
    id: string;
    unit_no: string;
    floor_number: number;
    unit_type: string;
    floor_area_sqm: number | null;
    max_occupants: number | null;
    current_occupant_count: number;
    status: string;
}

interface BuildingShowProps {
    building: {
        id: string;
        building_code: string;
        building_name: string | null;
        address: string;
        pin_lat: number | null;
        pin_lng: number | null;
        owner_name: string | null;
        owner_contact: string | null;
        building_type: string;
        structure_source: string;
        total_floors: number;
        total_units: number;
        total_floor_area_sqm: number | null;
        occupancy_status: string;
        certificate_of_occupancy_date: string | null;
        last_inspection_date: string | null;
        next_inspection_date: string | null;
        sbr_reference_no: string | null;
        building_permit_no: string | null;
        housing_project_code: string | null;
        is_active: boolean;
        registered_at: string | null;
        created_at: string;
        units: Unit[];
        units_count?: number;
        inspections_count?: number;
        violations_count?: number;
        complaints_count?: number;
    };
}

export default function BuildingShow({ building }: BuildingShowProps) {
    const { flash } = usePage<{ flash?: { success?: string; error?: string } }>().props;

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { label: string; className: string }> = {
            'vacant': {
                label: 'Vacant',
                className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
            },
            'partially_occupied': {
                label: 'Partially Occupied',
                className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            },
            'fully_occupied': {
                label: 'Fully Occupied',
                className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            },
            'under_construction': {
                label: 'Under Construction',
                className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            },
            'condemned': {
                label: 'Condemned',
                className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
            },
        };

        const config = statusConfig[status] || statusConfig['vacant'];
        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.className}`}>
                {config.label}
            </span>
        );
    };

    const getTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            'residential': 'Residential',
            'commercial': 'Commercial',
            'industrial': 'Industrial',
            'mixed_use': 'Mixed Use',
            'institutional': 'Institutional',
        };
        return labels[type] || type;
    };

    const getSourceLabel = (source: string) => {
        const labels: Record<string, string> = {
            'sbr': 'S&B Review',
            'housing': 'Housing',
            'building_permit': 'Building Permit',
            'manual': 'Manual',
        };
        return labels[source] || source;
    };

    return (
        <AdminLayout
            title={building.building_name || building.building_code}
            description={`Building Code: ${building.building_code}`}
            backButton={{
                href: '/admin/occupancy/buildings',
                label: 'Back to Buildings',
            }}
        >
            {flash?.success && (
                <div className="mb-4 p-4 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg">
                    {flash.success}
                </div>
            )}

            <div className="space-y-6">
                {/* Action Buttons */}
                <div className="flex justify-between items-center">
                    <div className="flex gap-3">
                        <Link
                            href={`/admin/occupancy/buildings/${building.id}/edit`}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            <Edit size={20} />
                            Edit Building
                        </Link>
                        <Link
                            href={`/admin/occupancy/inspections/create?building_id=${building.id}`}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus size={20} />
                            Schedule Inspection
                        </Link>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <AdminContentCard>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground dark:text-gray-400">Units</p>
                                <p className="text-2xl font-bold text-foreground dark:text-white">
                                    {building.units_count || building.units.length} / {building.total_units}
                                </p>
                            </div>
                            <Building className="text-primary" size={32} />
                        </div>
                    </AdminContentCard>
                    <AdminContentCard>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground dark:text-gray-400">Inspections</p>
                                <p className="text-2xl font-bold text-foreground dark:text-white">
                                    {building.inspections_count || 0}
                                </p>
                            </div>
                            <CheckSquare className="text-blue-600" size={32} />
                        </div>
                    </AdminContentCard>
                    <AdminContentCard>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground dark:text-gray-400">Violations</p>
                                <p className="text-2xl font-bold text-foreground dark:text-white">
                                    {building.violations_count || 0}
                                </p>
                            </div>
                            <FileWarning className="text-red-600" size={32} />
                        </div>
                    </AdminContentCard>
                    <AdminContentCard>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground dark:text-gray-400">Complaints</p>
                                <p className="text-2xl font-bold text-foreground dark:text-white">
                                    {building.complaints_count || 0}
                                </p>
                            </div>
                            <AlertTriangle className="text-orange-600" size={32} />
                        </div>
                    </AdminContentCard>
                </div>

                {/* Basic Information */}
                <AdminContentCard>
                    <h2 className="text-lg font-semibold text-foreground dark:text-white mb-4 flex items-center gap-2">
                        <Building size={20} />
                        Basic Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-sm font-medium text-muted-foreground dark:text-gray-400">Building Code</label>
                            <p className="text-foreground dark:text-white font-medium">{building.building_code}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground dark:text-gray-400">Building Name</label>
                            <p className="text-foreground dark:text-white">{building.building_name || 'N/A'}</p>
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-sm font-medium text-muted-foreground dark:text-gray-400 flex items-center gap-2">
                                <MapPin size={16} />
                                Address
                            </label>
                            <p className="text-foreground dark:text-white">{building.address}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground dark:text-gray-400">Building Type</label>
                            <p className="text-foreground dark:text-white">{getTypeLabel(building.building_type)}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground dark:text-gray-400">Structure Source</label>
                            <p className="text-foreground dark:text-white">{getSourceLabel(building.structure_source)}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground dark:text-gray-400">Occupancy Status</label>
                            <div className="mt-1">{getStatusBadge(building.occupancy_status)}</div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground dark:text-gray-400">Total Floors</label>
                            <p className="text-foreground dark:text-white">{building.total_floors}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground dark:text-gray-400">Total Units</label>
                            <p className="text-foreground dark:text-white">{building.total_units}</p>
                        </div>
                        {building.total_floor_area_sqm && (
                            <div>
                                <label className="text-sm font-medium text-muted-foreground dark:text-gray-400">Total Floor Area</label>
                                <p className="text-foreground dark:text-white">{building.total_floor_area_sqm} sqm</p>
                            </div>
                        )}
                    </div>
                </AdminContentCard>

                {/* Owner Information */}
                {(building.owner_name || building.owner_contact) && (
                    <AdminContentCard>
                        <h2 className="text-lg font-semibold text-foreground dark:text-white mb-4">Owner Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {building.owner_name && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground dark:text-gray-400">Owner Name</label>
                                    <p className="text-foreground dark:text-white">{building.owner_name}</p>
                                </div>
                            )}
                            {building.owner_contact && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground dark:text-gray-400">Owner Contact</label>
                                    <p className="text-foreground dark:text-white">{building.owner_contact}</p>
                                </div>
                            )}
                        </div>
                    </AdminContentCard>
                )}

                {/* Reference Numbers */}
                {(building.sbr_reference_no || building.building_permit_no || building.housing_project_code) && (
                    <AdminContentCard>
                        <h2 className="text-lg font-semibold text-foreground dark:text-white mb-4">Reference Numbers</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {building.sbr_reference_no && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground dark:text-gray-400">S&B Reference No</label>
                                    <p className="text-foreground dark:text-white">{building.sbr_reference_no}</p>
                                </div>
                            )}
                            {building.building_permit_no && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground dark:text-gray-400">Building Permit No</label>
                                    <p className="text-foreground dark:text-white">{building.building_permit_no}</p>
                                </div>
                            )}
                            {building.housing_project_code && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground dark:text-gray-400">Housing Project Code</label>
                                    <p className="text-foreground dark:text-white">{building.housing_project_code}</p>
                                </div>
                            )}
                        </div>
                    </AdminContentCard>
                )}

                {/* Dates */}
                <AdminContentCard>
                    <h2 className="text-lg font-semibold text-foreground dark:text-white mb-4 flex items-center gap-2">
                        <Calendar size={20} />
                        Important Dates
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {building.certificate_of_occupancy_date && (
                            <div>
                                <label className="text-sm font-medium text-muted-foreground dark:text-gray-400">Certificate of Occupancy Date</label>
                                <p className="text-foreground dark:text-white">{building.certificate_of_occupancy_date}</p>
                            </div>
                        )}
                        {building.last_inspection_date && (
                            <div>
                                <label className="text-sm font-medium text-muted-foreground dark:text-gray-400">Last Inspection Date</label>
                                <p className="text-foreground dark:text-white">{building.last_inspection_date}</p>
                            </div>
                        )}
                        {building.next_inspection_date && (
                            <div>
                                <label className="text-sm font-medium text-muted-foreground dark:text-gray-400">Next Inspection Date</label>
                                <p className="text-foreground dark:text-white font-medium text-primary">{building.next_inspection_date}</p>
                            </div>
                        )}
                    </div>
                </AdminContentCard>

                {/* Units */}
                {building.units && building.units.length > 0 && (
                    <AdminContentCard>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-foreground dark:text-white">Units</h2>
                            <Link
                                href={`/admin/occupancy/buildings/${building.id}/units/create`}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm"
                            >
                                <Plus size={16} />
                                Add Unit
                            </Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Unit No</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Floor</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Type</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Occupancy</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-dark-surface divide-y divide-gray-200 dark:divide-gray-700">
                                    {building.units.map((unit) => (
                                        <tr key={unit.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                            <td className="px-4 py-3 text-sm font-medium text-foreground dark:text-white">{unit.unit_no}</td>
                                            <td className="px-4 py-3 text-sm text-foreground dark:text-white">{unit.floor_number}</td>
                                            <td className="px-4 py-3 text-sm text-foreground dark:text-white">{unit.unit_type}</td>
                                            <td className="px-4 py-3 text-sm">
                                                <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                                                    {unit.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-foreground dark:text-white">
                                                {unit.current_occupant_count} / {unit.max_occupants || 'N/A'}
                                            </td>
                                            <td className="px-4 py-3 text-right text-sm">
                                                <Link
                                                    href={`/admin/occupancy/units/${unit.id}`}
                                                    className="text-primary hover:text-primary/80"
                                                >
                                                    View
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </AdminContentCard>
                )}
            </div>
        </AdminLayout>
    );
}
