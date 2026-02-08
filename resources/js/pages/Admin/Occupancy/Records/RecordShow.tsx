import { Link, router } from '@inertiajs/react';
import AdminLayout from '../../../../components/AdminLayout';
import AdminContentCard from '../../../../components/AdminContentCard';
import Button from '../../../../components/Button';
import { ArrowLeft, Users, Calendar, Building, Home } from 'lucide-react';

interface RecordShowProps {
    record: {
        id: number;
        record_type: string;
        start_date: string;
        end_date?: string;
        occupancy_type: string;
        purpose_of_use?: string;
        compliance_status: string;
        remarks?: string;
        building?: {
            id: number;
            building_code: string;
            building_name?: string;
        };
        unit?: {
            id: number;
            unit_no: string;
        };
        recorded_by?: {
            id: number;
            name: string;
        };
        occupants?: Array<{
            id: number;
            full_name: string;
            contact_number?: string;
            email?: string;
            relationship_to_owner: string;
            move_in_date: string;
            is_primary_occupant: boolean;
        }>;
        history?: any[];
    };
}

export default function RecordShow({ record }: RecordShowProps) {
    const handleMoveOut = () => {
        if (confirm('Are you sure you want to record move-out for this occupancy?')) {
            router.post(`/admin/occupancy/records/${record.id}/move-out`, {
                end_date: new Date().toISOString().split('T')[0],
            });
        }
    };

    return (
        <AdminLayout
            title={`Occupancy Record - ${record.record_type.replace('_', ' ').toUpperCase()}`}
            description={`Building: ${record.building?.building_code || 'N/A'}`}
        >
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <Link href="/admin/occupancy/records" className="inline-flex items-center text-primary hover:underline">
                        <ArrowLeft className="mr-2 w-4 h-4" />
                        Back to Records
                    </Link>
                    {!record.end_date && record.record_type === 'move_in' && (
                        <Button variant="secondary" onClick={handleMoveOut}>
                            Record Move-Out
                        </Button>
                    )}
                </div>

                {/* Record Details */}
                <AdminContentCard>
                    <h2 className="mb-6 font-semibold text-gray-900 dark:text-white text-xl">Record Information</h2>
                    <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
                        <div>
                            <label className="block mb-1 font-medium text-gray-500 dark:text-gray-400 text-sm">Record Type</label>
                            <p className="text-gray-900 dark:text-white text-lg capitalize">{record.record_type.replace('_', ' ')}</p>
                        </div>

                        <div>
                            <label className="block mb-1 font-medium text-gray-500 dark:text-gray-400 text-sm">Building</label>
                            {record.building ? (
                                <Link href={`/admin/occupancy/buildings/${record.building.id}`} className="text-primary text-lg hover:underline">
                                    {record.building.building_code} - {record.building.building_name || 'N/A'}
                                </Link>
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400 text-lg">N/A</p>
                            )}
                        </div>

                        <div>
                            <label className="block mb-1 font-medium text-gray-500 dark:text-gray-400 text-sm">Unit</label>
                            {record.unit ? (
                                <Link href={`/admin/occupancy/units/${record.unit.id}`} className="text-primary text-lg hover:underline">
                                    {record.unit.unit_no}
                                </Link>
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400 text-lg">N/A</p>
                            )}
                        </div>

                        <div>
                            <label className="block mb-1 font-medium text-gray-500 dark:text-gray-400 text-sm">Occupancy Type</label>
                            <p className="text-gray-900 dark:text-white text-lg capitalize">{record.occupancy_type.replace('_', ' ')}</p>
                        </div>

                        <div>
                            <label className="block mb-1 font-medium text-gray-500 dark:text-gray-400 text-sm">Start Date</label>
                            <p className="text-gray-900 dark:text-white text-lg">
                                {new Date(record.start_date).toLocaleDateString()}
                            </p>
                        </div>

                        {record.end_date && (
                            <div>
                                <label className="block mb-1 font-medium text-gray-500 dark:text-gray-400 text-sm">End Date</label>
                                <p className="text-gray-900 dark:text-white text-lg">
                                    {new Date(record.end_date).toLocaleDateString()}
                                </p>
                            </div>
                        )}

                        <div>
                            <label className="block mb-1 font-medium text-gray-500 dark:text-gray-400 text-sm">Compliance Status</label>
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                                record.compliance_status === 'compliant' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                record.compliance_status === 'non_compliant' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            }`}>
                                {record.compliance_status.replace('_', ' ')}
                            </span>
                        </div>

                        <div>
                            <label className="block mb-1 font-medium text-gray-500 dark:text-gray-400 text-sm">Recorded By</label>
                            <p className="text-gray-900 dark:text-white text-lg">{record.recorded_by?.name || 'N/A'}</p>
                        </div>

                        {record.purpose_of_use && (
                            <div className="md:col-span-2">
                                <label className="block mb-1 font-medium text-gray-500 dark:text-gray-400 text-sm">Purpose of Use</label>
                                <p className="text-gray-900 dark:text-white text-lg">{record.purpose_of_use}</p>
                            </div>
                        )}

                        {record.remarks && (
                            <div className="md:col-span-2">
                                <label className="block mb-1 font-medium text-gray-500 dark:text-gray-400 text-sm">Remarks</label>
                                <p className="text-gray-900 dark:text-white text-lg">{record.remarks}</p>
                            </div>
                        )}
                    </div>
                </AdminContentCard>

                {/* Occupants */}
                {record.occupants && record.occupants.length > 0 && (
                    <AdminContentCard>
                        <h2 className="mb-6 font-semibold text-gray-900 dark:text-white text-xl">Occupants</h2>
                        <div className="space-y-4">
                            {record.occupants.map((occupant) => (
                                <div key={occupant.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {occupant.full_name}
                                                {occupant.is_primary_occupant && (
                                                    <span className="ml-2 text-primary text-xs">(Primary)</span>
                                                )}
                                            </p>
                                            <p className="mt-1 text-gray-600 dark:text-gray-400 text-sm capitalize">
                                                {occupant.relationship_to_owner.replace('_', ' ')}
                                            </p>
                                            {occupant.contact_number && (
                                                <p className="mt-1 text-gray-600 dark:text-gray-400 text-sm">
                                                    {occupant.contact_number}
                                                </p>
                                            )}
                                            {occupant.email && (
                                                <p className="text-gray-600 dark:text-gray-400 text-sm">
                                                    {occupant.email}
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-gray-500 dark:text-gray-400 text-xs">
                                                Move-In: {new Date(occupant.move_in_date).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </AdminContentCard>
                )}
            </div>
        </AdminLayout>
    );
}
