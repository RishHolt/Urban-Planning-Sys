import { Link } from '@inertiajs/react';
import AdminLayout from '../../../../components/AdminLayout';
import AdminContentCard from '../../../../components/AdminContentCard';
import Button from '../../../../components/Button';
import { ArrowLeft, Edit, MapPin, Building, Home, AlertTriangle, FileWarning, ClipboardCheck } from 'lucide-react';

interface BuildingShowProps {
    building: {
        id: number;
        building_code: string;
        building_name?: string;
        address: string;
        pin_lat?: number;
        pin_lng?: number;
        owner_name?: string;
        owner_contact?: string;
        building_type: string;
        structure_source: string;
        total_floors?: number;
        total_units?: number;
        total_floor_area_sqm?: number;
        occupancy_status: string;
        certificate_of_occupancy_date?: string;
        last_inspection_date?: string;
        next_inspection_date?: string;
        sbr_reference_no?: string;
        building_permit_no?: string;
        housing_project_code?: string;
        is_active: boolean;
        registered_at?: string;
        units?: Array<{ id: number; unit_no: string; status: string }>;
        occupancy_records?: any[];
        inspections?: any[];
        violations?: any[];
        complaints?: any[];
    };
}

export default function BuildingShow({ building }: BuildingShowProps) {
    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            vacant: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
            partially_occupied: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            fully_occupied: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            under_construction: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            condemned: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <AdminLayout
            title={building.building_name || building.building_code}
            description={`Building Code: ${building.building_code}`}
        >
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <Link href="/admin/occupancy/buildings" className="inline-flex items-center text-primary hover:underline">
                        <ArrowLeft className="mr-2 w-4 h-4" />
                        Back to Buildings
                    </Link>
                    <Link href={`/admin/occupancy/buildings/${building.id}/edit`}>
                        <Button variant="primary">
                            <Edit className="mr-2 w-4 h-4" />
                            Edit Building
                        </Button>
                    </Link>
                </div>

                {/* Building Details */}
                <AdminContentCard>
                    <h2 className="mb-6 font-semibold text-gray-900 dark:text-white text-xl">Building Information</h2>
                    <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
                        <div>
                            <label className="block mb-1 font-medium text-gray-500 dark:text-gray-400 text-sm">Building Code</label>
                            <p className="font-mono text-gray-900 dark:text-white text-lg">{building.building_code}</p>
                        </div>

                        <div>
                            <label className="block mb-1 font-medium text-gray-500 dark:text-gray-400 text-sm">Building Name</label>
                            <p className="text-gray-900 dark:text-white text-lg">{building.building_name || 'N/A'}</p>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block mb-1 font-medium text-gray-500 dark:text-gray-400 text-sm">Address</label>
                            <p className="flex items-center text-gray-900 dark:text-white text-lg">
                                <MapPin className="mr-2 w-4 h-4" />
                                {building.address}
                            </p>
                        </div>

                        <div>
                            <label className="block mb-1 font-medium text-gray-500 dark:text-gray-400 text-sm">Building Type</label>
                            <p className="text-gray-900 dark:text-white text-lg capitalize">{building.building_type.replace('_', ' ')}</p>
                        </div>

                        <div>
                            <label className="block mb-1 font-medium text-gray-500 dark:text-gray-400 text-sm">Occupancy Status</label>
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(building.occupancy_status)}`}>
                                {building.occupancy_status.replace('_', ' ')}
                            </span>
                        </div>

                        <div>
                            <label className="block mb-1 font-medium text-gray-500 dark:text-gray-400 text-sm">Owner Name</label>
                            <p className="text-gray-900 dark:text-white text-lg">{building.owner_name || 'N/A'}</p>
                        </div>

                        <div>
                            <label className="block mb-1 font-medium text-gray-500 dark:text-gray-400 text-sm">Owner Contact</label>
                            <p className="text-gray-900 dark:text-white text-lg">{building.owner_contact || 'N/A'}</p>
                        </div>

                        <div>
                            <label className="block mb-1 font-medium text-gray-500 dark:text-gray-400 text-sm">Total Floors</label>
                            <p className="text-gray-900 dark:text-white text-lg">{building.total_floors || 'N/A'}</p>
                        </div>

                        <div>
                            <label className="block mb-1 font-medium text-gray-500 dark:text-gray-400 text-sm">Total Units</label>
                            <p className="text-gray-900 dark:text-white text-lg">{building.total_units || 0}</p>
                        </div>

                        <div>
                            <label className="block mb-1 font-medium text-gray-500 dark:text-gray-400 text-sm">Total Floor Area</label>
                            <p className="text-gray-900 dark:text-white text-lg">
                                {building.total_floor_area_sqm ? `${building.total_floor_area_sqm} sqm` : 'N/A'}
                            </p>
                        </div>

                        <div>
                            <label className="block mb-1 font-medium text-gray-500 dark:text-gray-400 text-sm">Structure Source</label>
                            <p className="text-gray-900 dark:text-white text-lg capitalize">{building.structure_source.replace('_', ' ')}</p>
                        </div>
                    </div>
                </AdminContentCard>

                {/* Quick Stats */}
                <div className="gap-6 grid grid-cols-1 md:grid-cols-4">
                    <AdminContentCard>
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">Units</p>
                                <p className="mt-1 font-bold text-gray-900 dark:text-white text-2xl">
                                    {building.units?.length || building.total_units || 0}
                                </p>
                            </div>
                            <Home className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        </div>
                    </AdminContentCard>

                    <AdminContentCard>
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">Occupancy Records</p>
                                <p className="mt-1 font-bold text-gray-900 dark:text-white text-2xl">
                                    {building.occupancy_records?.length || 0}
                                </p>
                            </div>
                            <Building className="w-8 h-8 text-green-600 dark:text-green-400" />
                        </div>
                    </AdminContentCard>

                    <AdminContentCard>
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">Inspections</p>
                                <p className="mt-1 font-bold text-gray-900 dark:text-white text-2xl">
                                    {building.inspections?.length || 0}
                                </p>
                            </div>
                            <ClipboardCheck className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                        </div>
                    </AdminContentCard>

                    <AdminContentCard>
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">Violations</p>
                                <p className="mt-1 font-bold text-gray-900 dark:text-white text-2xl">
                                    {building.violations?.length || 0}
                                </p>
                            </div>
                            <FileWarning className="w-8 h-8 text-red-600 dark:text-red-400" />
                        </div>
                    </AdminContentCard>
                </div>

                {/* Units */}
                {building.units && building.units.length > 0 && (
                    <AdminContentCard>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="font-semibold text-gray-900 dark:text-white text-xl">Units</h2>
                            <Link href={`/admin/occupancy/units?building_id=${building.id}`}>
                                <Button variant="secondary">View All Units</Button>
                            </Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-gray-200 dark:border-gray-700 border-b">
                                        <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white text-sm text-left">Unit No.</th>
                                        <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white text-sm text-left">Status</th>
                                        <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white text-sm text-left">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {building.units.slice(0, 10).map((unit) => (
                                        <tr key={unit.id} className="border-gray-200 dark:border-gray-700 border-b">
                                            <td className="px-4 py-3 text-gray-900 dark:text-white">{unit.unit_no}</td>
                                            <td className="px-4 py-3">
                                                <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-800 dark:text-gray-200 text-xs capitalize">
                                                    {unit.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Link href={`/admin/occupancy/units/${unit.id}`} className="text-primary text-sm hover:underline">
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

                {/* Quick Actions */}
                <AdminContentCard>
                    <h2 className="mb-4 font-semibold text-gray-900 dark:text-white text-xl">Quick Actions</h2>
                    <div className="flex flex-wrap gap-4">
                        <Link href={`/admin/occupancy/units/create?building_id=${building.id}`}>
                            <Button variant="primary">Add Unit</Button>
                        </Link>
                        <Link href={`/admin/occupancy/records/create?building_id=${building.id}`}>
                            <Button variant="secondary">Record Move-In</Button>
                        </Link>
                        <Link href={`/admin/occupancy/inspections/create?building_id=${building.id}`}>
                            <Button variant="secondary">Schedule Inspection</Button>
                        </Link>
                        <Link href={`/admin/occupancy/complaints/create?building_id=${building.id}`}>
                            <Button variant="secondary">Register Complaint</Button>
                        </Link>
                    </div>
                </AdminContentCard>
            </div>
        </AdminLayout>
    );
}
