import { useForm } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import AdminLayout from '../../../../components/AdminLayout';
import AdminContentCard from '../../../../components/AdminContentCard';
import Button from '../../../../components/Button';
import Input from '../../../../components/Input';
import { ArrowLeft } from 'lucide-react';

interface ViolationFormProps {
    buildings: Array<{ id: number; building_code: string; building_name?: string }>;
    units?: Array<{ id: number; unit_no: string }>;
    inspections?: Array<{ id: number; scheduled_date: string; inspection_date?: string; result?: string }>;
    building_id?: string;
    unit_id?: string;
    inspection_id?: string;
}

export default function ViolationForm({ buildings, units = [], inspections = [], building_id, unit_id, inspection_id }: ViolationFormProps) {
    const { data, setData, post, processing, errors } = useForm({
        building_id: building_id || '',
        unit_id: unit_id || '',
        inspection_id: inspection_id || '',
        violation_type: 'unauthorized_use',
        description: '',
        severity: 'minor',
        violation_date: new Date().toISOString().split('T')[0],
        compliance_deadline: '',
        fine_amount: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/occupancy/violations');
    };

    return (
        <AdminLayout
            title="Issue Violation"
            description="Issue a new compliance violation"
        >
            <div className="space-y-6">
                <Link href="/admin/occupancy/violations" className="inline-flex items-center mb-4 text-primary hover:underline">
                    <ArrowLeft className="mr-2 w-4 h-4" />
                    Back to Violations
                </Link>

                <form onSubmit={handleSubmit}>
                    <AdminContentCard>
                        <h2 className="mb-6 font-semibold text-gray-900 dark:text-white text-xl">Violation Information</h2>

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
                                    Violation Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={data.violation_type}
                                    onChange={(e) => setData('violation_type', e.target.value)}
                                    className="bg-white dark:bg-gray-800 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg w-full text-gray-900 dark:text-white"
                                    required
                                >
                                    <option value="unauthorized_use">Unauthorized Use</option>
                                    <option value="overcrowding">Overcrowding</option>
                                    <option value="structural_modification">Structural Modification</option>
                                    <option value="fire_safety">Fire Safety</option>
                                    <option value="sanitation">Sanitation</option>
                                    <option value="noise">Noise</option>
                                    <option value="parking">Parking</option>
                                    <option value="maintenance">Maintenance</option>
                                    <option value="documentation">Documentation</option>
                                    <option value="other">Other</option>
                                </select>
                                {errors.violation_type && (
                                    <p className="mt-1 text-red-600 dark:text-red-400 text-sm">{errors.violation_type}</p>
                                )}
                            </div>

                            <div>
                                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                    Severity <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={data.severity}
                                    onChange={(e) => setData('severity', e.target.value)}
                                    className="bg-white dark:bg-gray-800 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg w-full text-gray-900 dark:text-white"
                                    required
                                >
                                    <option value="minor">Minor</option>
                                    <option value="major">Major</option>
                                    <option value="critical">Critical</option>
                                </select>
                                {errors.severity && (
                                    <p className="mt-1 text-red-600 dark:text-red-400 text-sm">{errors.severity}</p>
                                )}
                            </div>

                            <div>
                                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                    Violation Date <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="date"
                                    value={data.violation_date}
                                    onChange={(e) => setData('violation_date', e.target.value)}
                                    error={errors.violation_date}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                    Compliance Deadline
                                </label>
                                <Input
                                    type="date"
                                    value={data.compliance_deadline}
                                    onChange={(e) => setData('compliance_deadline', e.target.value)}
                                    error={errors.compliance_deadline}
                                />
                            </div>

                            <div>
                                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                    Fine Amount
                                </label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={data.fine_amount}
                                    onChange={(e) => setData('fine_amount', e.target.value)}
                                    error={errors.fine_amount}
                                    min="0"
                                />
                            </div>

                            {inspections.length > 0 && (
                                <div className="md:col-span-2">
                                    <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                        Related Inspection <span className="text-gray-500">(optional)</span>
                                    </label>
                                    <select
                                        value={data.inspection_id}
                                        onChange={(e) => setData('inspection_id', e.target.value)}
                                        className="bg-white dark:bg-gray-800 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg w-full text-gray-900 dark:text-white"
                                    >
                                        <option value="">No Inspection</option>
                                        {inspections.map((inspection) => (
                                            <option key={inspection.id} value={inspection.id}>
                                                {new Date(inspection.scheduled_date).toLocaleDateString()} - {inspection.result || 'Pending'}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.inspection_id && (
                                        <p className="mt-1 text-red-600 dark:text-red-400 text-sm">{errors.inspection_id}</p>
                                    )}
                                </div>
                            )}

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
                                {processing ? 'Issuing...' : 'Issue Violation'}
                            </Button>
                            <Link href="/admin/occupancy/violations">
                                <Button type="button" variant="secondary">Cancel</Button>
                            </Link>
                        </div>
                    </AdminContentCard>
                </form>
            </div>
        </AdminLayout>
    );
}
