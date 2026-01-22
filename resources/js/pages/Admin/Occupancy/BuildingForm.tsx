import { Link, useForm } from '@inertiajs/react';
import AdminLayout from '../../../components/AdminLayout';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import { ArrowLeft, Building } from 'lucide-react';

interface BuildingFormProps {
    building?: {
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
    };
}

export default function BuildingForm({ building }: BuildingFormProps) {
    const isEdit = !!building;

    const { data, setData, post, put, processing, errors } = useForm({
        building_code: building?.building_code || '',
        building_name: building?.building_name || '',
        address: building?.address || '',
        pin_lat: building?.pin_lat?.toString() || '',
        pin_lng: building?.pin_lng?.toString() || '',
        owner_name: building?.owner_name || '',
        owner_contact: building?.owner_contact || '',
        building_type: building?.building_type || 'residential',
        structure_source: building?.structure_source || 'manual',
        total_floors: building?.total_floors?.toString() || '1',
        total_units: building?.total_units?.toString() || '0',
        total_floor_area_sqm: building?.total_floor_area_sqm?.toString() || '',
        occupancy_status: building?.occupancy_status || 'vacant',
        certificate_of_occupancy_date: building?.certificate_of_occupancy_date || '',
        last_inspection_date: building?.last_inspection_date || '',
        next_inspection_date: building?.next_inspection_date || '',
        sbr_reference_no: building?.sbr_reference_no || '',
        building_permit_no: building?.building_permit_no || '',
        housing_project_code: building?.housing_project_code || '',
        is_active: building?.is_active ?? true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const submitData = {
            ...data,
            pin_lat: data.pin_lat ? parseFloat(data.pin_lat) : null,
            pin_lng: data.pin_lng ? parseFloat(data.pin_lng) : null,
            total_floors: parseInt(data.total_floors),
            total_units: parseInt(data.total_units),
            total_floor_area_sqm: data.total_floor_area_sqm ? parseFloat(data.total_floor_area_sqm) : null,
            is_active: data.is_active,
        };

        if (isEdit) {
            put(`/admin/occupancy/buildings/${building.id}`, {
                preserveScroll: true,
            });
        } else {
            post('/admin/occupancy/buildings', {
                preserveScroll: true,
            });
        }
    };

    return (
        <AdminLayout
            title={isEdit ? 'Edit Building' : 'Register Building'}
            description={isEdit ? 'Update building information' : 'Register a new building for occupancy monitoring'}
            backButton={{
                href: isEdit ? `/admin/occupancy/buildings/${building.id}` : '/admin/occupancy/buildings',
                label: 'Back',
            }}
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white dark:bg-dark-surface shadow-lg rounded-lg p-6">
                    <h2 className="text-lg font-semibold text-foreground dark:text-white mb-4 flex items-center gap-2">
                        <Building size={20} />
                        Basic Information
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Building Code *"
                            value={data.building_code}
                            onChange={(e) => setData('building_code', e.target.value)}
                            error={errors.building_code}
                            required
                        />

                        <Input
                            label="Building Name"
                            value={data.building_name}
                            onChange={(e) => setData('building_name', e.target.value)}
                            error={errors.building_name}
                        />

                        <div className="md:col-span-2">
                            <Input
                                label="Address *"
                                value={data.address}
                                onChange={(e) => setData('address', e.target.value)}
                                error={errors.address}
                                required
                            />
                        </div>

                        <Input
                            label="Latitude"
                            type="number"
                            step="any"
                            value={data.pin_lat}
                            onChange={(e) => setData('pin_lat', e.target.value)}
                            error={errors.pin_lat}
                        />

                        <Input
                            label="Longitude"
                            type="number"
                            step="any"
                            value={data.pin_lng}
                            onChange={(e) => setData('pin_lng', e.target.value)}
                            error={errors.pin_lng}
                        />
                    </div>
                </div>

                <div className="bg-white dark:bg-dark-surface shadow-lg rounded-lg p-6">
                    <h2 className="text-lg font-semibold text-foreground dark:text-white mb-4">
                        Building Details
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                Building Type *
                            </label>
                            <select
                                value={data.building_type}
                                onChange={(e) => setData('building_type', e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-surface text-foreground dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            >
                                <option value="residential">Residential</option>
                                <option value="commercial">Commercial</option>
                                <option value="industrial">Industrial</option>
                                <option value="mixed_use">Mixed Use</option>
                                <option value="institutional">Institutional</option>
                            </select>
                            {errors.building_type && (
                                <p className="mt-1 text-red-500 text-sm">{errors.building_type}</p>
                            )}
                        </div>

                        <div>
                            <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                Structure Source *
                            </label>
                            <select
                                value={data.structure_source}
                                onChange={(e) => setData('structure_source', e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-surface text-foreground dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            >
                                <option value="sbr">S&B Review</option>
                                <option value="housing">Housing</option>
                                <option value="building_permit">Building Permit</option>
                                <option value="manual">Manual</option>
                            </select>
                            {errors.structure_source && (
                                <p className="mt-1 text-red-500 text-sm">{errors.structure_source}</p>
                            )}
                        </div>

                        <Input
                            label="Total Floors *"
                            type="number"
                            min="1"
                            value={data.total_floors}
                            onChange={(e) => setData('total_floors', e.target.value)}
                            error={errors.total_floors}
                            required
                        />

                        <Input
                            label="Total Units *"
                            type="number"
                            min="0"
                            value={data.total_units}
                            onChange={(e) => setData('total_units', e.target.value)}
                            error={errors.total_units}
                            required
                        />

                        <Input
                            label="Total Floor Area (sqm)"
                            type="number"
                            step="0.01"
                            min="0"
                            value={data.total_floor_area_sqm}
                            onChange={(e) => setData('total_floor_area_sqm', e.target.value)}
                            error={errors.total_floor_area_sqm}
                        />

                        <div>
                            <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                Occupancy Status *
                            </label>
                            <select
                                value={data.occupancy_status}
                                onChange={(e) => setData('occupancy_status', e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-surface text-foreground dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            >
                                <option value="vacant">Vacant</option>
                                <option value="partially_occupied">Partially Occupied</option>
                                <option value="fully_occupied">Fully Occupied</option>
                                <option value="under_construction">Under Construction</option>
                                <option value="condemned">Condemned</option>
                            </select>
                            {errors.occupancy_status && (
                                <p className="mt-1 text-red-500 text-sm">{errors.occupancy_status}</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-dark-surface shadow-lg rounded-lg p-6">
                    <h2 className="text-lg font-semibold text-foreground dark:text-white mb-4">
                        Owner Information
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Owner Name"
                            value={data.owner_name}
                            onChange={(e) => setData('owner_name', e.target.value)}
                            error={errors.owner_name}
                        />

                        <Input
                            label="Owner Contact"
                            value={data.owner_contact}
                            onChange={(e) => setData('owner_contact', e.target.value)}
                            error={errors.owner_contact}
                        />
                    </div>
                </div>

                <div className="bg-white dark:bg-dark-surface shadow-lg rounded-lg p-6">
                    <h2 className="text-lg font-semibold text-foreground dark:text-white mb-4">
                        Reference Numbers
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Input
                            label="S&B Reference No"
                            value={data.sbr_reference_no}
                            onChange={(e) => setData('sbr_reference_no', e.target.value)}
                            error={errors.sbr_reference_no}
                        />

                        <Input
                            label="Building Permit No"
                            value={data.building_permit_no}
                            onChange={(e) => setData('building_permit_no', e.target.value)}
                            error={errors.building_permit_no}
                        />

                        <Input
                            label="Housing Project Code"
                            value={data.housing_project_code}
                            onChange={(e) => setData('housing_project_code', e.target.value)}
                            error={errors.housing_project_code}
                        />
                    </div>
                </div>

                <div className="bg-white dark:bg-dark-surface shadow-lg rounded-lg p-6">
                    <h2 className="text-lg font-semibold text-foreground dark:text-white mb-4">
                        Dates
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Input
                            label="Certificate of Occupancy Date"
                            type="date"
                            value={data.certificate_of_occupancy_date}
                            onChange={(e) => setData('certificate_of_occupancy_date', e.target.value)}
                            error={errors.certificate_of_occupancy_date}
                        />

                        <Input
                            label="Last Inspection Date"
                            type="date"
                            value={data.last_inspection_date}
                            onChange={(e) => setData('last_inspection_date', e.target.value)}
                            error={errors.last_inspection_date}
                        />

                        <Input
                            label="Next Inspection Date"
                            type="date"
                            value={data.next_inspection_date}
                            onChange={(e) => setData('next_inspection_date', e.target.value)}
                            error={errors.next_inspection_date}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <Link
                        href={isEdit ? `/admin/occupancy/buildings/${building.id}` : '/admin/occupancy/buildings'}
                        className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-foreground dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        Cancel
                    </Link>
                    <Button type="submit" disabled={processing}>
                        {processing ? 'Saving...' : isEdit ? 'Update Building' : 'Register Building'}
                    </Button>
                </div>
            </form>
        </AdminLayout>
    );
}
