import { useForm } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import AdminLayout from '../../../../components/AdminLayout';
import AdminContentCard from '../../../../components/AdminContentCard';
import Button from '../../../../components/Button';
import Input from '../../../../components/Input';
import { ArrowLeft } from 'lucide-react';

interface UnitFormProps {
    unit?: {
        id: number;
        building_id: number;
        unit_no: string;
        floor_number: number;
        unit_type: string;
        floor_area_sqm?: number;
        max_occupants?: number;
        current_occupant_count: number;
        status: string;
        current_occupant_name?: string;
        occupancy_start_date?: string;
    };
    buildings: Array<{ id: number; building_code: string; building_name?: string }>;
    building_id?: string;
}

export default function UnitForm({ unit, buildings, building_id }: UnitFormProps) {
    const { data, setData, post, put, processing, errors } = useForm({
        building_id: unit?.building_id?.toString() || building_id || '',
        unit_no: unit?.unit_no || '',
        floor_number: unit?.floor_number?.toString() || '1',
        unit_type: unit?.unit_type || 'residential',
        floor_area_sqm: unit?.floor_area_sqm?.toString() || '',
        max_occupants: unit?.max_occupants?.toString() || '',
        current_occupant_count: unit?.current_occupant_count?.toString() || '0',
        status: unit?.status || 'vacant',
        current_occupant_name: unit?.current_occupant_name || '',
        occupancy_start_date: unit?.occupancy_start_date || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (unit) {
            put(`/admin/occupancy/units/${unit.id}`);
        } else {
            post('/admin/occupancy/units');
        }
    };

    return (
        <AdminLayout
            title={unit ? 'Edit Unit' : 'Add Unit'}
            description={unit ? 'Update unit information' : 'Add a new unit to a building'}
        >
            <div className="space-y-6">
                <Link href="/admin/occupancy/units" className="inline-flex items-center mb-4 text-primary hover:underline">
                    <ArrowLeft className="mr-2 w-4 h-4" />
                    Back to Units
                </Link>

                <form onSubmit={handleSubmit}>
                    <AdminContentCard>
                        <h2 className="mb-6 font-semibold text-gray-900 dark:text-white text-xl">Unit Information</h2>

                        <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
                            <div>
                                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                    Building <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={data.building_id}
                                    onChange={(e) => setData('building_id', e.target.value)}
                                    className="bg-white dark:bg-gray-800 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg w-full text-gray-900 dark:text-white"
                                    required
                                    disabled={!!unit}
                                >
                                    <option value="">Select Building</option>
                                    {buildings.map((building) => (
                                        <option key={building.id} value={building.id}>
                                            {building.building_code} - {building.building_name || 'N/A'}
                                        </option>
                                    ))}
                                </select>
                                {errors.building_id && (
                                    <p className="mt-1 text-red-600 dark:text-red-400 text-sm">{errors.building_id}</p>
                                )}
                            </div>

                            <div>
                                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                    Unit Number <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="text"
                                    value={data.unit_no}
                                    onChange={(e) => setData('unit_no', e.target.value)}
                                    error={errors.unit_no}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                    Floor Number
                                </label>
                                <Input
                                    type="number"
                                    value={data.floor_number}
                                    onChange={(e) => setData('floor_number', e.target.value)}
                                    error={errors.floor_number}
                                    min="1"
                                />
                            </div>

                            <div>
                                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                    Unit Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={data.unit_type}
                                    onChange={(e) => setData('unit_type', e.target.value)}
                                    className="bg-white dark:bg-gray-800 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg w-full text-gray-900 dark:text-white"
                                    required
                                >
                                    <option value="residential">Residential</option>
                                    <option value="commercial">Commercial</option>
                                    <option value="office">Office</option>
                                    <option value="warehouse">Warehouse</option>
                                    <option value="parking">Parking</option>
                                    <option value="storage">Storage</option>
                                </select>
                                {errors.unit_type && (
                                    <p className="mt-1 text-red-600 dark:text-red-400 text-sm">{errors.unit_type}</p>
                                )}
                            </div>

                            <div>
                                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                    Floor Area (sqm)
                                </label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={data.floor_area_sqm}
                                    onChange={(e) => setData('floor_area_sqm', e.target.value)}
                                    error={errors.floor_area_sqm}
                                    min="0"
                                />
                            </div>

                            <div>
                                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                    Max Occupants
                                </label>
                                <Input
                                    type="number"
                                    value={data.max_occupants}
                                    onChange={(e) => setData('max_occupants', e.target.value)}
                                    error={errors.max_occupants}
                                    min="1"
                                />
                                <p className="mt-1 text-gray-500 dark:text-gray-400 text-xs">
                                    Maximum number of occupants allowed
                                </p>
                            </div>

                            <div>
                                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                    Current Occupant Count
                                </label>
                                <Input
                                    type="number"
                                    value={data.current_occupant_count}
                                    onChange={(e) => setData('current_occupant_count', e.target.value)}
                                    error={errors.current_occupant_count}
                                    min="0"
                                />
                            </div>

                            <div>
                                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                    Status <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                    className="bg-white dark:bg-gray-800 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg w-full text-gray-900 dark:text-white"
                                    required
                                >
                                    <option value="vacant">Vacant</option>
                                    <option value="occupied">Occupied</option>
                                    <option value="reserved">Reserved</option>
                                    <option value="under_renovation">Under Renovation</option>
                                    <option value="maintenance">Maintenance</option>
                                </select>
                                {errors.status && (
                                    <p className="mt-1 text-red-600 dark:text-red-400 text-sm">{errors.status}</p>
                                )}
                            </div>

                            <div>
                                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                    Current Occupant Name
                                </label>
                                <Input
                                    type="text"
                                    value={data.current_occupant_name}
                                    onChange={(e) => setData('current_occupant_name', e.target.value)}
                                    error={errors.current_occupant_name}
                                />
                            </div>

                            <div>
                                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                    Occupancy Start Date
                                </label>
                                <Input
                                    type="date"
                                    value={data.occupancy_start_date}
                                    onChange={(e) => setData('occupancy_start_date', e.target.value)}
                                    error={errors.occupancy_start_date}
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 mt-8">
                            <Button type="submit" variant="primary" disabled={processing}>
                                {processing ? 'Saving...' : unit ? 'Update Unit' : 'Create Unit'}
                            </Button>
                            <Link href="/admin/occupancy/units">
                                <Button type="button" variant="secondary">Cancel</Button>
                            </Link>
                        </div>
                    </AdminContentCard>
                </form>
            </div>
        </AdminLayout>
    );
}
