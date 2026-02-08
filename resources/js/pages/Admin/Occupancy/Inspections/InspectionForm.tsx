import { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import AdminLayout from '../../../../components/AdminLayout';
import AdminContentCard from '../../../../components/AdminContentCard';
import Button from '../../../../components/Button';
import Input from '../../../../components/Input';
import { ArrowLeft } from 'lucide-react';

interface InspectionFormProps {
    buildings: Array<{ id: number; building_code: string; building_name?: string }>;
    units?: Array<{ id: number; unit_no: string }>;
    complaints?: Array<{ id: number; complaint_no: string; complaint_type: string; description: string }>;
    building_id?: string;
    unit_id?: string;
    complaint_id?: string;
}

export default function InspectionForm({ buildings, units = [], complaints = [], building_id, unit_id, complaint_id }: InspectionFormProps) {
    const [selectedBuildingId, setSelectedBuildingId] = useState(building_id || '');
    const [availableUnits, setAvailableUnits] = useState(units);

    const { data, setData, post, processing, errors } = useForm({
        building_id: building_id || '',
        unit_id: unit_id || '',
        inspection_type: 'periodic',
        inspector_id: '',
        complaint_id: complaint_id || '',
        scheduled_date: new Date().toISOString().split('T')[0],
        next_inspection_date: '',
    });

    useEffect(() => {
        if (selectedBuildingId) {
            // In a real app, you'd fetch units for the selected building
            // For now, we'll use the units prop if they match
            const filteredUnits = units.filter(u => u.id.toString() === selectedBuildingId);
            setAvailableUnits(filteredUnits);
        } else {
            setAvailableUnits(units);
        }
    }, [selectedBuildingId, units]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/occupancy/inspections');
    };

    return (
        <AdminLayout
            title="Schedule Inspection"
            description="Schedule a new inspection for a building or unit"
        >
            <div className="space-y-6">
                <Link href="/admin/occupancy/inspections" className="inline-flex items-center mb-4 text-primary hover:underline">
                    <ArrowLeft className="mr-2 w-4 h-4" />
                    Back to Inspections
                </Link>

                <form onSubmit={handleSubmit}>
                    <AdminContentCard>
                        <h2 className="mb-6 font-semibold text-gray-900 dark:text-white text-xl">Inspection Details</h2>

                        <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
                            <div>
                                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                    Building <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={data.building_id}
                                    onChange={(e) => {
                                        setData('building_id', e.target.value);
                                        setSelectedBuildingId(e.target.value);
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
                                    {availableUnits.map((unit) => (
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
                                    Inspection Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={data.inspection_type}
                                    onChange={(e) => setData('inspection_type', e.target.value)}
                                    className="bg-white dark:bg-gray-800 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg w-full text-gray-900 dark:text-white"
                                    required
                                >
                                    <option value="annual">Annual</option>
                                    <option value="periodic">Periodic</option>
                                    <option value="pre_occupancy">Pre-Occupancy</option>
                                    <option value="complaint_based">Complaint-Based</option>
                                    <option value="follow_up">Follow-Up</option>
                                    <option value="random">Random</option>
                                </select>
                                {errors.inspection_type && (
                                    <p className="mt-1 text-red-600 dark:text-red-400 text-sm">{errors.inspection_type}</p>
                                )}
                            </div>

                            <div>
                                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                    Inspector <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="number"
                                    value={data.inspector_id}
                                    onChange={(e) => setData('inspector_id', e.target.value)}
                                    error={errors.inspector_id}
                                    required
                                    placeholder="Inspector User ID"
                                />
                                <p className="mt-1 text-gray-500 dark:text-gray-400 text-xs">
                                    TODO: Replace with user selector
                                </p>
                            </div>

                            <div>
                                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                    Scheduled Date <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="date"
                                    value={data.scheduled_date}
                                    onChange={(e) => setData('scheduled_date', e.target.value)}
                                    error={errors.scheduled_date}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                    Next Inspection Date
                                </label>
                                <Input
                                    type="date"
                                    value={data.next_inspection_date}
                                    onChange={(e) => setData('next_inspection_date', e.target.value)}
                                    error={errors.next_inspection_date}
                                />
                            </div>

                            {complaints.length > 0 && (
                                <div className="md:col-span-2">
                                    <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                        Related Complaint <span className="text-gray-500">(optional)</span>
                                    </label>
                                    <select
                                        value={data.complaint_id}
                                        onChange={(e) => setData('complaint_id', e.target.value)}
                                        className="bg-white dark:bg-gray-800 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg w-full text-gray-900 dark:text-white"
                                    >
                                        <option value="">No Complaint</option>
                                        {complaints.map((complaint) => (
                                            <option key={complaint.id} value={complaint.id}>
                                                {complaint.complaint_no} - {complaint.complaint_type}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.complaint_id && (
                                        <p className="mt-1 text-red-600 dark:text-red-400 text-sm">{errors.complaint_id}</p>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex gap-4 mt-8">
                            <Button type="submit" variant="primary" disabled={processing}>
                                {processing ? 'Scheduling...' : 'Schedule Inspection'}
                            </Button>
                            <Link href="/admin/occupancy/inspections">
                                <Button type="button" variant="secondary">Cancel</Button>
                            </Link>
                        </div>
                    </AdminContentCard>
                </form>
            </div>
        </AdminLayout>
    );
}
