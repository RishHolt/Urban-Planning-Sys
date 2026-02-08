import { useState } from 'react';
import { router, Link } from '@inertiajs/react';
import AdminLayout from '../../../../components/AdminLayout';
import AdminContentCard from '../../../../components/AdminContentCard';
import Button from '../../../../components/Button';
import { Plus, Search, Home, Filter, Eye, Edit } from 'lucide-react';

interface BuildingUnit {
    id: number;
    unit_no: string;
    floor_number: number;
    unit_type: string;
    status: string;
    max_occupants?: number;
    current_occupant_count: number;
    current_occupant_name?: string;
    building?: {
        id: number;
        building_code: string;
        building_name?: string;
    };
}

interface UnitsIndexProps {
    units: {
        data: BuildingUnit[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    buildings?: Array<{ id: number; building_code: string; building_name?: string }>;
    building?: any;
    filters?: {
        search?: string;
        building_id?: string;
        status?: string;
        unit_type?: string;
        overcrowded?: string;
    };
}

export default function UnitsIndex({ units, buildings = [], building, filters = {} }: UnitsIndexProps) {
    const [showFilters, setShowFilters] = useState(false);
    const [search, setSearch] = useState(filters.search || '');
    const [buildingId, setBuildingId] = useState(filters.building_id || '');
    const [status, setStatus] = useState(filters.status || '');
    const [unitType, setUnitType] = useState(filters.unit_type || '');
    const [overcrowded, setOvercrowded] = useState(filters.overcrowded || '');

    const handleSearch = () => {
        router.get('/admin/occupancy/units', {
            search,
            building_id: buildingId || undefined,
            status: status || undefined,
            unit_type: unitType || undefined,
            overcrowded: overcrowded || undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleReset = () => {
        setSearch('');
        setBuildingId('');
        setStatus('');
        setUnitType('');
        setOvercrowded('');
        router.get('/admin/occupancy/units');
    };

    const isOvercrowded = (unit: BuildingUnit) => {
        return unit.max_occupants && unit.current_occupant_count > unit.max_occupants;
    };

    return (
        <AdminLayout
            title={building ? `Units - ${building.building_name || building.building_code}` : 'Building Units'}
            description="Manage and monitor building units"
        >
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <p className="text-gray-600 dark:text-gray-400">
                        Total: {units.total} units
                    </p>
                    <Link href="/admin/occupancy/units/create">
                        <Button variant="primary">
                            <Plus className="mr-2 w-4 h-4" />
                            Add Unit
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
                                        placeholder="Unit no., occupant name..."
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
                                                {b.building_code} - {b.building_name || 'N/A'}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                    Status
                                </label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg w-full text-gray-900 dark:text-white"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="vacant">Vacant</option>
                                    <option value="occupied">Occupied</option>
                                    <option value="reserved">Reserved</option>
                                    <option value="under_renovation">Under Renovation</option>
                                    <option value="maintenance">Maintenance</option>
                                </select>
                            </div>

                            <div>
                                <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                    Unit Type
                                </label>
                                <select
                                    value={unitType}
                                    onChange={(e) => setUnitType(e.target.value)}
                                    className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg w-full text-gray-900 dark:text-white"
                                >
                                    <option value="">All Types</option>
                                    <option value="residential">Residential</option>
                                    <option value="commercial">Commercial</option>
                                    <option value="office">Office</option>
                                    <option value="warehouse">Warehouse</option>
                                    <option value="parking">Parking</option>
                                    <option value="storage">Storage</option>
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

                {/* Units Table */}
                <AdminContentCard>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-gray-200 dark:border-gray-700 border-b">
                                    <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white text-sm text-left">Unit No.</th>
                                    <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white text-sm text-left">Building</th>
                                    <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white text-sm text-left">Type</th>
                                    <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white text-sm text-left">Status</th>
                                    <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white text-sm text-left">Occupants</th>
                                    <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white text-sm text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {units.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-gray-500 dark:text-gray-400 text-center">
                                            No units found
                                        </td>
                                    </tr>
                                ) : (
                                    units.data.map((unit) => (
                                        <tr key={unit.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700 border-b">
                                            <td className="px-4 py-3">
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    {unit.unit_no}
                                                </span>
                                                {unit.floor_number > 0 && (
                                                    <span className="ml-2 text-gray-500 dark:text-gray-400 text-xs">
                                                        Floor {unit.floor_number}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {unit.building ? (
                                                    <Link href={`/admin/occupancy/buildings/${unit.building.id}`} className="text-primary hover:underline">
                                                        {unit.building.building_code}
                                                    </Link>
                                                ) : (
                                                    <span className="text-gray-500 dark:text-gray-400">N/A</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-gray-600 dark:text-gray-400 text-sm capitalize">
                                                    {unit.unit_type.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`text-xs px-2 py-1 rounded capitalize ${
                                                    unit.status === 'occupied' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                                    unit.status === 'vacant' ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' :
                                                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                }`}>
                                                    {unit.status.replace('_', ' ')}
                                                </span>
                                                {isOvercrowded(unit) && (
                                                    <span className="ml-2 font-semibold text-red-600 dark:text-red-400 text-xs">
                                                        (Overcrowded)
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-gray-900 dark:text-white">
                                                    {unit.current_occupant_count}
                                                    {unit.max_occupants && ` / ${unit.max_occupants}`}
                                                </span>
                                                {unit.current_occupant_name && (
                                                    <p className="text-gray-500 dark:text-gray-400 text-xs">
                                                        {unit.current_occupant_name}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-2">
                                                    <Link href={`/admin/occupancy/units/${unit.id}`}>
                                                        <button className="text-primary hover:text-primary/80">
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                    </Link>
                                                    <Link href={`/admin/occupancy/units/${unit.id}/edit`}>
                                                        <button className="text-gray-600 hover:text-gray-900 dark:hover:text-white dark:text-gray-400">
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {units.last_page > 1 && (
                        <div className="flex justify-center gap-2 mt-4">
                            {units.links.map((link, index) => (
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
