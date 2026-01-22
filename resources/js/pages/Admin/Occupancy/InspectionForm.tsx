import { Link, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import { ArrowLeft, ClipboardCheck } from 'lucide-react';

interface Building {
    id: string;
    building_code: string;
    building_name: string | null;
}

interface InspectionFormProps {
    buildings: Building[];
    building_id?: string;
    unit_id?: string;
    complaint_id?: string;
}

export default function InspectionForm({ buildings, building_id, unit_id, complaint_id }: InspectionFormProps) {
    const [selectedBuildingId, setSelectedBuildingId] = useState<string>(building_id || '');
    const [units, setUnits] = useState<any[]>([]);
    const [loadingUnits, setLoadingUnits] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        building_id: building_id || '',
        unit_id: unit_id || '',
        inspection_type: complaint_id ? 'complaint_based' : 'annual',
        inspector_id: '',
        complaint_id: complaint_id || '',
        scheduled_date: '',
        findings: '',
        compliance_notes: '',
        result: '',
        recommendations: '',
        next_inspection_date: '',
    });

    useEffect(() => {
        if (selectedBuildingId) {
            setLoadingUnits(true);
            // Fetch units for selected building
            fetch(`/admin/occupancy/api/buildings/${selectedBuildingId}/units`)
                .then((res) => res.json())
                .then((data) => {
                    setUnits(data.units || []);
                    setLoadingUnits(false);
                })
                .catch(() => {
                    setLoadingUnits(false);
                });
        } else {
            setUnits([]);
        }
    }, [selectedBuildingId]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/occupancy/inspections', {
            preserveScroll: true,
        });
    };

    return (
        <AdminLayout
            title="Schedule Inspection"
            description="Schedule a new building or unit inspection"
            backButton={{
                href: '/admin/occupancy/inspections',
                label: 'Back to Inspections',
            }}
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white dark:bg-dark-surface shadow-lg rounded-lg p-6">
                    <h2 className="text-lg font-semibold text-foreground dark:text-white mb-4 flex items-center gap-2">
                        <ClipboardCheck size={20} />
                        Inspection Details
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                Building *
                            </label>
                            <select
                                value={data.building_id}
                                onChange={(e) => {
                                    setData('building_id', e.target.value);
                                    setSelectedBuildingId(e.target.value);
                                    setData('unit_id', '');
                                }}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-surface text-foreground dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
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
                                <p className="mt-1 text-red-500 text-sm">{errors.building_id}</p>
                            )}
                        </div>

                        <div>
                            <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                Unit (Optional)
                            </label>
                            <select
                                value={data.unit_id}
                                onChange={(e) => setData('unit_id', e.target.value)}
                                disabled={!data.building_id || loadingUnits}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-surface text-foreground dark:text-white focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                            >
                                <option value="">Select Unit (Optional)</option>
                                {units.map((unit) => (
                                    <option key={unit.id} value={unit.id}>
                                        {unit.unit_no}
                                    </option>
                                ))}
                            </select>
                            {errors.unit_id && (
                                <p className="mt-1 text-red-500 text-sm">{errors.unit_id}</p>
                            )}
                        </div>

                        <div>
                            <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                Inspection Type *
                            </label>
                            <select
                                value={data.inspection_type}
                                onChange={(e) => setData('inspection_type', e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-surface text-foreground dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
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
                                <p className="mt-1 text-red-500 text-sm">{errors.inspection_type}</p>
                            )}
                        </div>

                        <Input
                            label="Inspector ID *"
                            type="number"
                            value={data.inspector_id}
                            onChange={(e) => setData('inspector_id', e.target.value)}
                            error={errors.inspector_id}
                            required
                        />

                        <Input
                            label="Scheduled Date *"
                            type="date"
                            value={data.scheduled_date}
                            onChange={(e) => setData('scheduled_date', e.target.value)}
                            error={errors.scheduled_date}
                            required
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

                {complaint_id && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                            This inspection is linked to a complaint. The complaint will be automatically updated when the inspection is completed.
                        </p>
                    </div>
                )}

                <div className="flex justify-end gap-4">
                    <Link
                        href="/admin/occupancy/inspections"
                        className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-foreground dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        Cancel
                    </Link>
                    <Button type="submit" disabled={processing}>
                        {processing ? 'Scheduling...' : 'Schedule Inspection'}
                    </Button>
                </div>
            </form>
        </AdminLayout>
    );
}
