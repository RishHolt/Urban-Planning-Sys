import { Link } from '@inertiajs/react';
import AdminLayout from '../../../../components/AdminLayout';
import AdminContentCard from '../../../../components/AdminContentCard';
import Button from '../../../../components/Button';
import { ArrowLeft, Edit, Home, Users, AlertTriangle, FileWarning, ClipboardCheck } from 'lucide-react';

interface UnitShowProps {
    unit: {
        id: number;
        unit_no: string;
        floor_number: number;
        unit_type: string;
        floor_area_sqm?: number;
        max_occupants?: number;
        current_occupant_count: number;
        status: string;
        current_occupant_name?: string;
        occupancy_start_date?: string;
        last_inspection_date?: string;
        next_inspection_date?: string;
        building?: {
            id: number;
            building_code: string;
            building_name?: string;
        };
        occupancy_records?: any[];
        inspections?: any[];
        violations?: any[];
        complaints?: any[];
    };
}

export default function UnitShow({ unit }: UnitShowProps) {
    const isOvercrowded = unit.max_occupants && unit.current_occupant_count > unit.max_occupants;

    return (
        <AdminLayout
            title={`Unit ${unit.unit_no}`}
            description={unit.building ? `Building: ${unit.building.building_code}` : 'Unit Details'}
        >
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <Link href="/admin/occupancy/units" className="inline-flex items-center text-primary hover:underline">
                        <ArrowLeft className="mr-2 w-4 h-4" />
                        Back to Units
                    </Link>
                    <Link href={`/admin/occupancy/units/${unit.id}/edit`}>
                        <Button variant="primary">
                            <Edit className="mr-2 w-4 h-4" />
                            Edit Unit
                        </Button>
                    </Link>
                </div>

                {/* Unit Details */}
                <AdminContentCard>
                    <h2 className="mb-6 font-semibold text-gray-900 dark:text-white text-xl">Unit Information</h2>
                    <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
                        <div>
                            <label className="block mb-1 font-medium text-gray-500 dark:text-gray-400 text-sm">Unit Number</label>
                            <p className="font-medium text-gray-900 dark:text-white text-lg">{unit.unit_no}</p>
                        </div>

                        <div>
                            <label className="block mb-1 font-medium text-gray-500 dark:text-gray-400 text-sm">Building</label>
                            {unit.building ? (
                                <Link href={`/admin/occupancy/buildings/${unit.building.id}`} className="text-primary text-lg hover:underline">
                                    {unit.building.building_code} - {unit.building.building_name || 'N/A'}
                                </Link>
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400 text-lg">N/A</p>
                            )}
                        </div>

                        <div>
                            <label className="block mb-1 font-medium text-gray-500 dark:text-gray-400 text-sm">Floor Number</label>
                            <p className="text-gray-900 dark:text-white text-lg">{unit.floor_number}</p>
                        </div>

                        <div>
                            <label className="block mb-1 font-medium text-gray-500 dark:text-gray-400 text-sm">Unit Type</label>
                            <p className="text-gray-900 dark:text-white text-lg capitalize">{unit.unit_type.replace('_', ' ')}</p>
                        </div>

                        <div>
                            <label className="block mb-1 font-medium text-gray-500 dark:text-gray-400 text-sm">Floor Area</label>
                            <p className="text-gray-900 dark:text-white text-lg">
                                {unit.floor_area_sqm ? `${unit.floor_area_sqm} sqm` : 'N/A'}
                            </p>
                        </div>

                        <div>
                            <label className="block mb-1 font-medium text-gray-500 dark:text-gray-400 text-sm">Status</label>
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium capitalize ${
                                unit.status === 'occupied' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                unit.status === 'vacant' ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' :
                                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            }`}>
                                {unit.status.replace('_', ' ')}
                            </span>
                        </div>

                        <div>
                            <label className="block mb-1 font-medium text-gray-500 dark:text-gray-400 text-sm">Max Occupants</label>
                            <p className="text-gray-900 dark:text-white text-lg">{unit.max_occupants || 'Not Set'}</p>
                        </div>

                        <div>
                            <label className="block mb-1 font-medium text-gray-500 dark:text-gray-400 text-sm">Current Occupants</label>
                            <p className="text-gray-900 dark:text-white text-lg">
                                {unit.current_occupant_count}
                                {isOvercrowded && (
                                    <span className="ml-2 font-semibold text-red-600 dark:text-red-400">
                                        (Overcrowded)
                                    </span>
                                )}
                            </p>
                        </div>

                        <div>
                            <label className="block mb-1 font-medium text-gray-500 dark:text-gray-400 text-sm">Current Occupant Name</label>
                            <p className="text-gray-900 dark:text-white text-lg">{unit.current_occupant_name || 'N/A'}</p>
                        </div>

                        <div>
                            <label className="block mb-1 font-medium text-gray-500 dark:text-gray-400 text-sm">Occupancy Start Date</label>
                            <p className="text-gray-900 dark:text-white text-lg">
                                {unit.occupancy_start_date ? new Date(unit.occupancy_start_date).toLocaleDateString() : 'N/A'}
                            </p>
                        </div>
                    </div>
                </AdminContentCard>

                {/* Quick Stats */}
                <div className="gap-6 grid grid-cols-1 md:grid-cols-4">
                    <AdminContentCard>
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">Occupancy Records</p>
                                <p className="mt-1 font-bold text-gray-900 dark:text-white text-2xl">
                                    {unit.occupancy_records?.length || 0}
                                </p>
                            </div>
                            <Home className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        </div>
                    </AdminContentCard>

                    <AdminContentCard>
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">Inspections</p>
                                <p className="mt-1 font-bold text-gray-900 dark:text-white text-2xl">
                                    {unit.inspections?.length || 0}
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
                                    {unit.violations?.length || 0}
                                </p>
                            </div>
                            <FileWarning className="w-8 h-8 text-red-600 dark:text-red-400" />
                        </div>
                    </AdminContentCard>

                    <AdminContentCard>
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">Complaints</p>
                                <p className="mt-1 font-bold text-gray-900 dark:text-white text-2xl">
                                    {unit.complaints?.length || 0}
                                </p>
                            </div>
                            <AlertTriangle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                        </div>
                    </AdminContentCard>
                </div>

                {/* Quick Actions */}
                <AdminContentCard>
                    <h2 className="mb-4 font-semibold text-gray-900 dark:text-white text-xl">Quick Actions</h2>
                    <div className="flex flex-wrap gap-4">
                        <Link href={`/admin/occupancy/records/create?unit_id=${unit.id}`}>
                            <Button variant="primary">Record Move-In</Button>
                        </Link>
                        <Link href={`/admin/occupancy/inspections/create?unit_id=${unit.id}`}>
                            <Button variant="secondary">Schedule Inspection</Button>
                        </Link>
                        <Link href={`/admin/occupancy/complaints/create?unit_id=${unit.id}`}>
                            <Button variant="secondary">Register Complaint</Button>
                        </Link>
                    </div>
                </AdminContentCard>
            </div>
        </AdminLayout>
    );
}
