import { useState } from 'react';
import { router, Link } from '@inertiajs/react';
import AdminLayout from '../../../../components/AdminLayout';
import AdminContentCard from '../../../../components/AdminContentCard';
import Button from '../../../../components/Button';
import { Plus, Search, Filter, Eye, ClipboardCheck, Calendar } from 'lucide-react';

interface Inspection {
    id: number;
    inspection_type: string;
    scheduled_date: string;
    inspection_date?: string;
    result?: string;
    building?: {
        id: number;
        building_code: string;
    };
    unit?: {
        id: number;
        unit_no: string;
    };
    inspector?: {
        id: number;
        name: string;
    };
}

interface InspectionsIndexProps {
    inspections: {
        data: Inspection[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    filters?: {
        search?: string;
        inspection_type?: string;
        result?: string;
        upcoming?: string;
    };
}

export default function InspectionsIndex({ inspections, filters = {} }: InspectionsIndexProps) {
    const [showFilters, setShowFilters] = useState(false);
    const [search, setSearch] = useState(filters.search || '');
    const [inspectionType, setInspectionType] = useState(filters.inspection_type || '');
    const [result, setResult] = useState(filters.result || '');
    const [upcoming, setUpcoming] = useState(filters.upcoming || '');

    const handleSearch = () => {
        router.get('/admin/occupancy/inspections', {
            search,
            inspection_type: inspectionType || undefined,
            result: result || undefined,
            upcoming: upcoming || undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleReset = () => {
        setSearch('');
        setInspectionType('');
        setResult('');
        setUpcoming('');
        router.get('/admin/occupancy/inspections');
    };

    const getResultColor = (result?: string) => {
        if (!result) return 'bg-gray-100 text-gray-800';
        const colors: Record<string, string> = {
            compliant: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            non_compliant: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
            conditional: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            pending_correction: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
        };
        return colors[result] || 'bg-gray-100 text-gray-800';
    };

    return (
        <AdminLayout
            title="Inspections"
            description="Schedule and manage building inspections"
        >
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <p className="text-gray-600 dark:text-gray-400">
                        Total: {inspections.total} inspections
                    </p>
                    <Link href="/admin/occupancy/inspections/create">
                        <Button variant="primary">
                            <Plus className="mr-2 w-4 h-4" />
                            Schedule Inspection
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
                        <div className="gap-4 grid grid-cols-1 md:grid-cols-3">
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
                                        placeholder="Building code, unit..."
                                        className="bg-white dark:bg-gray-800 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg w-full text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                    Inspection Type
                                </label>
                                <select
                                    value={inspectionType}
                                    onChange={(e) => setInspectionType(e.target.value)}
                                    className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg w-full text-gray-900 dark:text-white"
                                >
                                    <option value="">All Types</option>
                                    <option value="annual">Annual</option>
                                    <option value="periodic">Periodic</option>
                                    <option value="pre_occupancy">Pre-Occupancy</option>
                                    <option value="complaint_based">Complaint-Based</option>
                                    <option value="follow_up">Follow-Up</option>
                                    <option value="random">Random</option>
                                </select>
                            </div>

                            <div>
                                <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                    Result
                                </label>
                                <select
                                    value={result}
                                    onChange={(e) => setResult(e.target.value)}
                                    className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg w-full text-gray-900 dark:text-white"
                                >
                                    <option value="">All Results</option>
                                    <option value="compliant">Compliant</option>
                                    <option value="non_compliant">Non-Compliant</option>
                                    <option value="conditional">Conditional</option>
                                    <option value="pending_correction">Pending Correction</option>
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

                {/* Inspections Table */}
                <AdminContentCard>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-gray-200 dark:border-gray-700 border-b">
                                    <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white text-sm text-left">Type</th>
                                    <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white text-sm text-left">Building/Unit</th>
                                    <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white text-sm text-left">Scheduled Date</th>
                                    <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white text-sm text-left">Inspector</th>
                                    <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white text-sm text-left">Result</th>
                                    <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white text-sm text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inspections.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-gray-500 dark:text-gray-400 text-center">
                                            No inspections found
                                        </td>
                                    </tr>
                                ) : (
                                    inspections.data.map((inspection) => (
                                        <tr key={inspection.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700 border-b">
                                            <td className="px-4 py-3">
                                                <span className="text-gray-600 dark:text-gray-400 text-sm capitalize">
                                                    {inspection.inspection_type.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="text-sm">
                                                    <p className="text-gray-900 dark:text-white">
                                                        {inspection.building?.building_code || 'N/A'}
                                                    </p>
                                                    {inspection.unit && (
                                                        <p className="text-gray-500 dark:text-gray-400 text-xs">
                                                            Unit {inspection.unit.unit_no}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="text-sm">
                                                    <p className="text-gray-900 dark:text-white">
                                                        {new Date(inspection.scheduled_date).toLocaleDateString()}
                                                    </p>
                                                    {inspection.inspection_date && (
                                                        <p className="text-gray-500 dark:text-gray-400 text-xs">
                                                            Completed: {new Date(inspection.inspection_date).toLocaleDateString()}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-sm">
                                                {inspection.inspector?.name || 'N/A'}
                                            </td>
                                            <td className="px-4 py-3">
                                                {inspection.result ? (
                                                    <span className={`text-xs px-2 py-1 rounded capitalize ${getResultColor(inspection.result)}`}>
                                                        {inspection.result.replace('_', ' ')}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-500 dark:text-gray-400 text-xs">Pending</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Link href={`/admin/occupancy/inspections/${inspection.id}`}>
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
                    {inspections.last_page > 1 && (
                        <div className="flex justify-center gap-2 mt-4">
                            {inspections.links.map((link, index) => (
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
