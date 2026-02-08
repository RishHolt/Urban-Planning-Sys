import { useForm } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import AdminLayout from '../../../../components/AdminLayout';
import AdminContentCard from '../../../../components/AdminContentCard';
import Button from '../../../../components/Button';
import Input from '../../../../components/Input';
import { ArrowLeft } from 'lucide-react';

interface ComplaintFormProps {
    buildings: Array<{ id: number; building_code: string; building_name?: string }>;
    units?: Array<{ id: number; unit_no: string }>;
    building_id?: string;
    unit_id?: string;
}

export default function ComplaintForm({ buildings, units = [], building_id, unit_id }: ComplaintFormProps) {
    const { data, setData, post, processing, errors } = useForm({
        building_id: building_id || '',
        unit_id: unit_id || '',
        complainant_name: '',
        complainant_contact: '',
        complaint_type: 'noise',
        description: '',
        priority: 'medium',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/occupancy/complaints');
    };

    return (
        <AdminLayout
            title="Register Complaint"
            description="Register a new occupancy-related complaint"
        >
            <div className="space-y-6">
                <Link href="/admin/occupancy/complaints" className="inline-flex items-center mb-4 text-primary hover:underline">
                    <ArrowLeft className="mr-2 w-4 h-4" />
                    Back to Complaints
                </Link>

                <form onSubmit={handleSubmit}>
                    <AdminContentCard>
                        <h2 className="mb-6 font-semibold text-gray-900 dark:text-white text-xl">Complaint Information</h2>

                        <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
                            <div>
                                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                    Building <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={data.building_id}
                                    onChange={(e) => {
                                        setData('building_id', e.target.value);
                                        setData('unit_id', ''); // Reset unit when building changes
                                    }}
                                    className="bg-white dark:bg-gray-800 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg w-full text-gray-900 dark:text-white"
                                    required
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
                                    Unit <span className="text-gray-500">(optional)</span>
                                </label>
                                <select
                                    value={data.unit_id}
                                    onChange={(e) => setData('unit_id', e.target.value)}
                                    className="bg-white dark:bg-gray-800 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg w-full text-gray-900 dark:text-white"
                                    disabled={!data.building_id}
                                >
                                    <option value="">No Specific Unit</option>
                                    {units.map((unit) => (
                                        <option key={unit.id} value={unit.id}>
                                            {unit.unit_no}
                                        </option>
                                    ))}
                                </select>
                                {errors.unit_id && (
                                    <p className="mt-1 text-red-600 dark:text-red-400 text-sm">{errors.unit_id}</p>
                                )}
                            </div>

                            <div>
                                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                    Complainant Name <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="text"
                                    value={data.complainant_name}
                                    onChange={(e) => setData('complainant_name', e.target.value)}
                                    error={errors.complainant_name}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                    Complainant Contact
                                </label>
                                <Input
                                    type="text"
                                    value={data.complainant_contact}
                                    onChange={(e) => setData('complainant_contact', e.target.value)}
                                    error={errors.complainant_contact}
                                />
                            </div>

                            <div>
                                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                    Complaint Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={data.complaint_type}
                                    onChange={(e) => setData('complaint_type', e.target.value)}
                                    className="bg-white dark:bg-gray-800 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg w-full text-gray-900 dark:text-white"
                                    required
                                >
                                    <option value="noise">Noise</option>
                                    <option value="sanitation">Sanitation</option>
                                    <option value="unauthorized_use">Unauthorized Use</option>
                                    <option value="overcrowding">Overcrowding</option>
                                    <option value="fire_hazard">Fire Hazard</option>
                                    <option value="structural">Structural</option>
                                    <option value="parking">Parking</option>
                                    <option value="other">Other</option>
                                </select>
                                {errors.complaint_type && (
                                    <p className="mt-1 text-red-600 dark:text-red-400 text-sm">{errors.complaint_type}</p>
                                )}
                            </div>

                            <div>
                                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                    Priority <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={data.priority}
                                    onChange={(e) => setData('priority', e.target.value)}
                                    className="bg-white dark:bg-gray-800 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg w-full text-gray-900 dark:text-white"
                                    required
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="urgent">Urgent</option>
                                </select>
                                {errors.priority && (
                                    <p className="mt-1 text-red-600 dark:text-red-400 text-sm">{errors.priority}</p>
                                )}
                            </div>

                            <div className="md:col-span-2">
                                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                    Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows={5}
                                    className="bg-white dark:bg-gray-800 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg w-full text-gray-900 dark:text-white"
                                    required
                                />
                                {errors.description && (
                                    <p className="mt-1 text-red-600 dark:text-red-400 text-sm">{errors.description}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-4 mt-8">
                            <Button type="submit" variant="primary" disabled={processing}>
                                {processing ? 'Registering...' : 'Register Complaint'}
                            </Button>
                            <Link href="/admin/occupancy/complaints">
                                <Button type="button" variant="secondary">Cancel</Button>
                            </Link>
                        </div>
                    </AdminContentCard>
                </form>
            </div>
        </AdminLayout>
    );
}
