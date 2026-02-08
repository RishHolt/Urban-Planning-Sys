import { useForm } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import AdminLayout from '../../../../components/AdminLayout';
import AdminContentCard from '../../../../components/AdminContentCard';
import Button from '../../../../components/Button';
import Input from '../../../../components/Input';
import { ArrowLeft } from 'lucide-react';

interface BuildingFormProps {
    building?: {
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
        sbr_reference_no?: string;
        building_permit_no?: string;
        housing_project_code?: string;
        is_active: boolean;
    };
}

export default function BuildingForm({ building }: BuildingFormProps) {
    const { data, setData, post, put, processing, errors } = useForm({
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
        sbr_reference_no: building?.sbr_reference_no || '',
        building_permit_no: building?.building_permit_no || '',
        housing_project_code: building?.housing_project_code || '',
        is_active: building?.is_active ?? true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (building) {
            put(`/admin/occupancy/buildings/${building.id}`);
        } else {
            post('/admin/occupancy/buildings');
        }
    };

    return (
        <AdminLayout
            title={building ? 'Edit Building' : 'Register Building'}
            description={building ? 'Update building information' : 'Register a new building for occupancy monitoring'}
        >
            <div className="space-y-6">
                <Link href="/admin/occupancy/buildings" className="inline-flex items-center mb-4 text-primary hover:underline">
                    <ArrowLeft className="mr-2 w-4 h-4" />
                    Back to Buildings
                </Link>

                <form onSubmit={handleSubmit}>
                    <AdminContentCard>
                        <h2 className="mb-6 font-semibold text-gray-900 dark:text-white text-xl">Building Information</h2>

                        <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
                            <div>
                                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                    Building Name <span className="text-gray-500">(optional)</span>
                                </label>
                                <Input
                                    type="text"
                                    value={data.building_name}
                                    onChange={(e) => setData('building_name', e.target.value)}
                                    error={errors.building_name}
                                />
                            </div>

                            <div>
                                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                    Address <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="text"
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    error={errors.address}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                    Building Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={data.building_type}
                                    onChange={(e) => setData('building_type', e.target.value)}
                                    className="bg-white dark:bg-gray-800 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg w-full text-gray-900 dark:text-white"
                                    required
                                >
                                    <option value="residential">Residential</option>
                                    <option value="commercial">Commercial</option>
                                    <option value="industrial">Industrial</option>
                                    <option value="mixed_use">Mixed Use</option>
                                    <option value="institutional">Institutional</option>
                                </select>
                                {errors.building_type && (
                                    <p className="mt-1 text-red-600 dark:text-red-400 text-sm">{errors.building_type}</p>
                                )}
                            </div>

                            <div>
                                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                    Structure Source <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={data.structure_source}
                                    onChange={(e) => setData('structure_source', e.target.value)}
                                    className="bg-white dark:bg-gray-800 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg w-full text-gray-900 dark:text-white"
                                    required
                                >
                                    <option value="manual">Manual Registration</option>
                                    <option value="sbr">Subdivision & Building Review</option>
                                    <option value="housing">Housing Beneficiary</option>
                                    <option value="building_permit">Building Permit</option>
                                </select>
                                {errors.structure_source && (
                                    <p className="mt-1 text-red-600 dark:text-red-400 text-sm">{errors.structure_source}</p>
                                )}
                            </div>

                            <div>
                                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                    Owner Name <span className="text-gray-500">(optional)</span>
                                </label>
                                <Input
                                    type="text"
                                    value={data.owner_name}
                                    onChange={(e) => setData('owner_name', e.target.value)}
                                    error={errors.owner_name}
                                />
                            </div>

                            <div>
                                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                    Owner Contact <span className="text-gray-500">(optional)</span>
                                </label>
                                <Input
                                    type="text"
                                    value={data.owner_contact}
                                    onChange={(e) => setData('owner_contact', e.target.value)}
                                    error={errors.owner_contact}
                                />
                            </div>

                            <div>
                                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                    Total Floors
                                </label>
                                <Input
                                    type="number"
                                    value={data.total_floors}
                                    onChange={(e) => setData('total_floors', e.target.value)}
                                    error={errors.total_floors}
                                    min="1"
                                />
                            </div>

                            <div>
                                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                    Total Units
                                </label>
                                <Input
                                    type="number"
                                    value={data.total_units}
                                    onChange={(e) => setData('total_units', e.target.value)}
                                    error={errors.total_units}
                                    min="0"
                                />
                            </div>

                            <div>
                                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                    Total Floor Area (sqm)
                                </label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={data.total_floor_area_sqm}
                                    onChange={(e) => setData('total_floor_area_sqm', e.target.value)}
                                    error={errors.total_floor_area_sqm}
                                    min="0"
                                />
                            </div>

                            <div>
                                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                    Occupancy Status <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={data.occupancy_status}
                                    onChange={(e) => setData('occupancy_status', e.target.value)}
                                    className="bg-white dark:bg-gray-800 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg w-full text-gray-900 dark:text-white"
                                    required
                                >
                                    <option value="vacant">Vacant</option>
                                    <option value="partially_occupied">Partially Occupied</option>
                                    <option value="fully_occupied">Fully Occupied</option>
                                    <option value="under_construction">Under Construction</option>
                                    <option value="condemned">Condemned</option>
                                </select>
                                {errors.occupancy_status && (
                                    <p className="mt-1 text-red-600 dark:text-red-400 text-sm">{errors.occupancy_status}</p>
                                )}
                            </div>

                            <div>
                                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                    Certificate of Occupancy Date
                                </label>
                                <Input
                                    type="date"
                                    value={data.certificate_of_occupancy_date}
                                    onChange={(e) => setData('certificate_of_occupancy_date', e.target.value)}
                                    error={errors.certificate_of_occupancy_date}
                                />
                            </div>

                            <div>
                                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                    Latitude
                                </label>
                                <Input
                                    type="number"
                                    step="0.00000001"
                                    value={data.pin_lat}
                                    onChange={(e) => setData('pin_lat', e.target.value)}
                                    error={errors.pin_lat}
                                />
                            </div>

                            <div>
                                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                    Longitude
                                </label>
                                <Input
                                    type="number"
                                    step="0.00000001"
                                    value={data.pin_lng}
                                    onChange={(e) => setData('pin_lng', e.target.value)}
                                    error={errors.pin_lng}
                                />
                            </div>
                        </div>

                        <h3 className="mt-8 mb-4 font-semibold text-gray-900 dark:text-white text-lg">Reference Numbers</h3>
                        <div className="gap-6 grid grid-cols-1 md:grid-cols-3">
                            <div>
                                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                    SBR Reference No.
                                </label>
                                <Input
                                    type="text"
                                    value={data.sbr_reference_no}
                                    onChange={(e) => setData('sbr_reference_no', e.target.value)}
                                    error={errors.sbr_reference_no}
                                />
                            </div>

                            <div>
                                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                    Building Permit No.
                                </label>
                                <Input
                                    type="text"
                                    value={data.building_permit_no}
                                    onChange={(e) => setData('building_permit_no', e.target.value)}
                                    error={errors.building_permit_no}
                                />
                            </div>

                            <div>
                                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                    Housing Project Code
                                </label>
                                <Input
                                    type="text"
                                    value={data.housing_project_code}
                                    onChange={(e) => setData('housing_project_code', e.target.value)}
                                    error={errors.housing_project_code}
                                />
                            </div>
                        </div>

                        {building && (
                            <div className="mt-6">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                        className="border-gray-300 rounded focus:ring-primary text-primary"
                                    />
                                    <span className="ml-2 text-gray-700 dark:text-gray-300 text-sm">Active</span>
                                </label>
                            </div>
                        )}

                        <div className="flex gap-4 mt-8">
                            <Button type="submit" variant="primary" disabled={processing}>
                                {processing ? 'Saving...' : building ? 'Update Building' : 'Register Building'}
                            </Button>
                            <Link href="/admin/occupancy/buildings">
                                <Button type="button" variant="secondary">Cancel</Button>
                            </Link>
                        </div>
                    </AdminContentCard>
                </form>
            </div>
        </AdminLayout>
    );
}
