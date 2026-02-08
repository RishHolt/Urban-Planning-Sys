import { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import AdminLayout from '../../../../components/AdminLayout';
import AdminContentCard from '../../../../components/AdminContentCard';
import Button from '../../../../components/Button';
import Input from '../../../../components/Input';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';

interface RecordFormProps {
    buildings: Array<{ id: number; building_code: string; building_name?: string }>;
    units?: Array<{ id: number; unit_no: string; status: string }>;
    building_id?: string;
    unit_id?: string;
}

export default function RecordForm({ buildings, units = [], building_id, unit_id }: RecordFormProps) {
    const [selectedBuildingId, setSelectedBuildingId] = useState(building_id || '');
    const [availableUnits, setAvailableUnits] = useState(units);

    const { data, setData, post, processing, errors } = useForm({
        building_id: building_id || '',
        unit_id: unit_id || '',
        record_type: 'move_in',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        occupancy_type: 'owner_occupied',
        purpose_of_use: '',
        compliance_status: 'pending_review',
        remarks: '',
        occupants: [
            {
                full_name: '',
                contact_number: '',
                email: '',
                relationship_to_owner: 'owner',
                move_in_date: new Date().toISOString().split('T')[0],
                is_primary_occupant: true,
            },
        ],
    });

    useEffect(() => {
        if (selectedBuildingId) {
            // Fetch units for selected building
            // For now, we'll use the units prop if building matches
            const filteredUnits = units.filter(u => u.id.toString() === selectedBuildingId);
            setAvailableUnits(filteredUnits);
        } else {
            setAvailableUnits(units);
        }
    }, [selectedBuildingId, units]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/occupancy/records');
    };

    const addOccupant = () => {
        setData('occupants', [
            ...data.occupants,
            {
                full_name: '',
                contact_number: '',
                email: '',
                relationship_to_owner: 'owner',
                move_in_date: new Date().toISOString().split('T')[0],
                is_primary_occupant: false,
            },
        ]);
    };

    const removeOccupant = (index: number) => {
        if (data.occupants.length > 1) {
            setData('occupants', data.occupants.filter((_, i) => i !== index));
        }
    };

    const updateOccupant = (index: number, field: string, value: any) => {
        const updated = [...data.occupants];
        updated[index] = { ...updated[index], [field]: value };
        setData('occupants', updated);
    };

    return (
        <AdminLayout
            title="Record Move-In"
            description="Record a new occupancy (move-in)"
        >
            <div className="space-y-6">
                <Link href="/admin/occupancy/records" className="inline-flex items-center mb-4 text-primary hover:underline">
                    <ArrowLeft className="mr-2 w-4 h-4" />
                    Back to Records
                </Link>

                <form onSubmit={handleSubmit}>
                    <AdminContentCard>
                        <h2 className="mb-6 font-semibold text-gray-900 dark:text-white text-xl">Occupancy Information</h2>

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
                                            {unit.unit_no} ({unit.status})
                                        </option>
                                    ))}
                                </select>
                                {errors.unit_id && (
                                    <p className="mt-1 text-red-600 dark:text-red-400 text-sm">{errors.unit_id}</p>
                                )}
                            </div>

                            <div>
                                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                    Start Date <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="date"
                                    value={data.start_date}
                                    onChange={(e) => setData('start_date', e.target.value)}
                                    error={errors.start_date}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                    Occupancy Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={data.occupancy_type}
                                    onChange={(e) => setData('occupancy_type', e.target.value)}
                                    className="bg-white dark:bg-gray-800 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg w-full text-gray-900 dark:text-white"
                                    required
                                >
                                    <option value="owner_occupied">Owner Occupied</option>
                                    <option value="rented">Rented</option>
                                    <option value="leased">Leased</option>
                                    <option value="commercial_tenant">Commercial Tenant</option>
                                </select>
                                {errors.occupancy_type && (
                                    <p className="mt-1 text-red-600 dark:text-red-400 text-sm">{errors.occupancy_type}</p>
                                )}
                            </div>

                            <div className="md:col-span-2">
                                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                    Purpose of Use
                                </label>
                                <textarea
                                    value={data.purpose_of_use}
                                    onChange={(e) => setData('purpose_of_use', e.target.value)}
                                    rows={3}
                                    className="bg-white dark:bg-gray-800 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg w-full text-gray-900 dark:text-white"
                                />
                                {errors.purpose_of_use && (
                                    <p className="mt-1 text-red-600 dark:text-red-400 text-sm">{errors.purpose_of_use}</p>
                                )}
                            </div>

                            <div>
                                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                    Compliance Status <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={data.compliance_status}
                                    onChange={(e) => setData('compliance_status', e.target.value)}
                                    className="bg-white dark:bg-gray-800 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg w-full text-gray-900 dark:text-white"
                                    required
                                >
                                    <option value="pending_review">Pending Review</option>
                                    <option value="compliant">Compliant</option>
                                    <option value="non_compliant">Non-Compliant</option>
                                    <option value="conditional">Conditional</option>
                                </select>
                                {errors.compliance_status && (
                                    <p className="mt-1 text-red-600 dark:text-red-400 text-sm">{errors.compliance_status}</p>
                                )}
                            </div>

                            <div className="md:col-span-2">
                                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                    Remarks
                                </label>
                                <textarea
                                    value={data.remarks}
                                    onChange={(e) => setData('remarks', e.target.value)}
                                    rows={3}
                                    className="bg-white dark:bg-gray-800 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg w-full text-gray-900 dark:text-white"
                                />
                                {errors.remarks && (
                                    <p className="mt-1 text-red-600 dark:text-red-400 text-sm">{errors.remarks}</p>
                                )}
                            </div>
                        </div>
                    </AdminContentCard>

                    {/* Occupants */}
                    <AdminContentCard>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="font-semibold text-gray-900 dark:text-white text-xl">Occupants</h2>
                            <Button type="button" variant="secondary" onClick={addOccupant}>
                                <Plus className="mr-2 w-4 h-4" />
                                Add Occupant
                            </Button>
                        </div>

                        {data.occupants.map((occupant, index) => (
                            <div key={index} className="mb-4 p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-medium text-gray-900 dark:text-white text-lg">
                                        Occupant {index + 1}
                                        {occupant.is_primary_occupant && (
                                            <span className="ml-2 text-primary text-xs">(Primary)</span>
                                        )}
                                    </h3>
                                    {data.occupants.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeOccupant(index)}
                                            className="text-red-600 hover:text-red-800 dark:hover:text-red-300 dark:text-red-400"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>

                                <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                                    <div>
                                        <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                            Full Name <span className="text-red-500">*</span>
                                        </label>
                                        <Input
                                            type="text"
                                            value={occupant.full_name}
                                            onChange={(e) => updateOccupant(index, 'full_name', e.target.value)}
                                            error={errors[`occupants.${index}.full_name`]}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                            Contact Number
                                        </label>
                                        <Input
                                            type="text"
                                            value={occupant.contact_number}
                                            onChange={(e) => updateOccupant(index, 'contact_number', e.target.value)}
                                            error={errors[`occupants.${index}.contact_number`]}
                                        />
                                    </div>

                                    <div>
                                        <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                            Email
                                        </label>
                                        <Input
                                            type="email"
                                            value={occupant.email}
                                            onChange={(e) => updateOccupant(index, 'email', e.target.value)}
                                            error={errors[`occupants.${index}.email`]}
                                        />
                                    </div>

                                    <div>
                                        <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                            Relationship to Owner <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={occupant.relationship_to_owner}
                                            onChange={(e) => updateOccupant(index, 'relationship_to_owner', e.target.value)}
                                            className="bg-white dark:bg-gray-800 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg w-full text-gray-900 dark:text-white"
                                            required
                                        >
                                            <option value="owner">Owner</option>
                                            <option value="tenant">Tenant</option>
                                            <option value="family_member">Family Member</option>
                                            <option value="authorized_occupant">Authorized Occupant</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                            Move-In Date <span className="text-red-500">*</span>
                                        </label>
                                        <Input
                                            type="date"
                                            value={occupant.move_in_date}
                                            onChange={(e) => updateOccupant(index, 'move_in_date', e.target.value)}
                                            error={errors[`occupants.${index}.move_in_date`]}
                                            required
                                        />
                                    </div>

                                    <div className="flex items-center pt-6">
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={occupant.is_primary_occupant}
                                                onChange={(e) => {
                                                    // Only allow one primary occupant
                                                    const updated = data.occupants.map((occ, i) => ({
                                                        ...occ,
                                                        is_primary_occupant: i === index ? e.target.checked : false,
                                                    }));
                                                    setData('occupants', updated);
                                                }}
                                                className="border-gray-300 rounded focus:ring-primary text-primary"
                                            />
                                            <span className="ml-2 text-gray-700 dark:text-gray-300 text-sm">Primary Occupant</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </AdminContentCard>

                    <div className="flex gap-4">
                        <Button type="submit" variant="primary" disabled={processing}>
                            {processing ? 'Recording...' : 'Record Move-In'}
                        </Button>
                        <Link href="/admin/occupancy/records">
                            <Button type="button" variant="secondary">Cancel</Button>
                        </Link>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
