import { useState } from 'react';
import { router, Link } from '@inertiajs/react';
import AdminLayout from '../../../../components/AdminLayout';
import AdminContentCard from '../../../../components/AdminContentCard';
import Button from '../../../../components/Button';
import { Plus, Search, Filter, Eye, ClipboardList } from 'lucide-react';

interface OccupancyRecord {
    id: number;
    record_type: string;
    start_date: string;
    end_date?: string;
    occupancy_type: string;
    compliance_status: string;
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
    occupants?: Array<{ id: number; full_name: string }>;
}

interface RecordsIndexProps {
    records: {
        data: OccupancyRecord[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    buildings?: Array<{ id: number; building_code: string; building_name?: string }>;
    filters?: {
        search?: string;
        record_type?: string;
        compliance_status?: string;
        building_id?: string;
    };
}

export default function RecordsIndex({ records, buildings = [], filters = {} }: RecordsIndexProps) {
    const [showFilters, setShowFilters] = useState(false);
    const [search, setSearch] = useState(filters.search || '');
    const [recordType, setRecordType] = useState(filters.record_type || '');
    const [complianceStatus, setComplianceStatus] = useState(filters.compliance_status || '');
    const [buildingId, setBuildingId] = useState(filters.building_id || '');

    const handleSearch = () => {
        router.get('/admin/occupancy/records', {
            search,
            record_type: recordType || undefined,
            compliance_status: complianceStatus || undefined,
            building_id: buildingId || undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleReset = () => {
        setSearch('');
        setRecordType('');
        setComplianceStatus('');
        setBuildingId('');
        router.get('/admin/occupancy/records');
    };

    const getRecordTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            move_in: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            move_out: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
            transfer: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            renewal: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
            update: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        };
        return colors[type] || 'bg-gray-100 text-gray-800';
    };

    return (
        <AdminLayout
            title="Occupancy Records"
            description="Track move-in, move-out, and occupancy changes"
        >
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <p className="text-gray-600 dark:text-gray-400">
                        Total: {records.total} records
                    </p>
                    <Link href="/admin/occupancy/records/create">
                        <Button variant="primary">
                            <Plus className="mr-2 w-4 h-4" />
                            Record Move-In
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <AdminContentCard>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-semibold text-gray-900 dark:text-white text-lg">Filters</h2>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="text-primary hover:underline"
                        >
                            <Filter className="inline mr-1 w-4 h-4" />
                            {showFilters ? 'Hide' : 'Show'} Filters
                        </button>
                    </div>

                    {showFilters && (
                        <div className="gap-4 grid grid-cols-1 md:grid-cols-4">
                            <div>
                                <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                    Search
                                </label>
                                <div className="relative">
                                    <Search className="top-1/2 left-3 absolute w-4 h-4 text-gray-400 -translate-y-1/2 transform" />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Building, unit, occupant..."
                                        className="bg-white dark:bg-gray-800 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg w-full text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            {buildings.length > 0 && (
                                <div>
                                    <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                        Building
                                    </label>
                                    <select
                                        value={buildingId}
                                        onChange={(e) => setBuildingId(e.target.value)}
                                        className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg w-full text-gray-900 dark:text-white"
                                    >
                                        <option value="">All Buildings</option>
                                        {buildings.map((b) => (
                                            <option key={b.id} value={b.id}>
                                                {b.building_code}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                    Record Type
                                </label>
                                <select
                                    value={recordType}
                                    onChange={(e) => setRecordType(e.target.value)}
                                    className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg w-full text-gray-900 dark:text-white"
                                >
                                    <option value="">All Types</option>
                                    <option value="move_in">Move-In</option>
                                    <option value="move_out">Move-Out</option>
                                    <option value="transfer">Transfer</option>
                                    <option value="renewal">Renewal</option>
                                    <option value="update">Update</option>
                                </select>
                            </div>

                            <div>
                                <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                    Compliance Status
                                </label>
                                <select
                                    value={complianceStatus}
                                    onChange={(e) => setComplianceStatus(e.target.value)}
                                    className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg w-full text-gray-900 dark:text-white"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="compliant">Compliant</option>
                                    <option value="non_compliant">Non-Compliant</option>
                                    <option value="pending_review">Pending Review</option>
                                    <option value="conditional">Conditional</option>
                                </select>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-2 mt-4">
                        <Button variant="primary" onClick={handleSearch}>
                            Search
                        </Button>
                        <Button variant="secondary" onClick={handleReset}>
                            Reset
                        </Button>
                    </div>
                </AdminContentCard>

                {/* Records Table */}
                <AdminContentCard>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-gray-200 dark:border-gray-700 border-b">
                                    <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white text-sm text-left">Type</th>
                                    <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white text-sm text-left">Building/Unit</th>
                                    <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white text-sm text-left">Occupancy Type</th>
                                    <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white text-sm text-left">Start Date</th>
                                    <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white text-sm text-left">Compliance</th>
                                    <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white text-sm text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-gray-500 dark:text-gray-400 text-center">
                                            No records found
                                        </td>
                                    </tr>
                                ) : (
                                    records.data.map((record) => (
                                        <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700 border-b">
                                            <td className="px-4 py-3">
                                                <span className={`text-xs px-2 py-1 rounded capitalize ${getRecordTypeColor(record.record_type)}`}>
                                                    {record.record_type.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="text-sm">
                                                    <p className="text-gray-900 dark:text-white">
                                                        {record.building?.building_code || 'N/A'}
                                                    </p>
                                                    {record.unit && (
                                                        <p className="text-gray-500 dark:text-gray-400 text-xs">
                                                            Unit {record.unit.unit_no}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-gray-600 dark:text-gray-400 text-sm capitalize">
                                                    {record.occupancy_type.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-sm">
                                                {new Date(record.start_date).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`text-xs px-2 py-1 rounded ${
                                                    record.compliance_status === 'compliant' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                                    record.compliance_status === 'non_compliant' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                }`}>
                                                    {record.compliance_status.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Link href={`/admin/occupancy/records/${record.id}`}>
                                                    <button className="text-primary hover:text-primary/80">
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {records.last_page > 1 && (
                        <div className="flex justify-center gap-2 mt-4">
                            {records.links.map((link, index) => (
                                <button
                                    key={index}
                                    onClick={() => link.url && router.get(link.url)}
                                    disabled={!link.url || link.active}
                                    className={`px-3 py-1 rounded ${
                                        link.active
                                            ? 'bg-primary text-white'
                                            : link.url
                                                ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                                : 'bg-gray-50 dark:bg-gray-900 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </AdminContentCard>
            </div>
        </AdminLayout>
    );
}
