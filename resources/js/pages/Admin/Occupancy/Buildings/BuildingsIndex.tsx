import { useState } from 'react';
import { router, Link } from '@inertiajs/react';
import AdminLayout from '../../../../components/AdminLayout';
import AdminContentCard from '../../../../components/AdminContentCard';
import Button from '../../../../components/Button';
import { Plus, Search, Building, Filter, Eye, Edit, Trash2 } from 'lucide-react';

interface Building {
    id: number;
    building_code: string;
    building_name?: string;
    address: string;
    building_type: string;
    occupancy_status: string;
    total_units: number;
    units_count?: number;
    occupancy_records_count?: number;
    inspections_count?: number;
    violations_count?: number;
}

interface BuildingsIndexProps {
    buildings: {
        data: Building[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    filters?: {
        search?: string;
        building_type?: string;
        occupancy_status?: string;
        structure_source?: string;
    };
}

export default function BuildingsIndex({ buildings, filters = {} }: BuildingsIndexProps) {
    const [showFilters, setShowFilters] = useState(false);
    const [search, setSearch] = useState(filters.search || '');
    const [buildingType, setBuildingType] = useState(filters.building_type || '');
    const [occupancyStatus, setOccupancyStatus] = useState(filters.occupancy_status || '');
    const [structureSource, setStructureSource] = useState(filters.structure_source || '');

    const handleSearch = () => {
        router.get('/admin/occupancy/buildings', {
            search,
            building_type: buildingType || undefined,
            occupancy_status: occupancyStatus || undefined,
            structure_source: structureSource || undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleReset = () => {
        setSearch('');
        setBuildingType('');
        setOccupancyStatus('');
        setStructureSource('');
        router.get('/admin/occupancy/buildings');
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            vacant: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
            partially_occupied: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            fully_occupied: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            under_construction: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            condemned: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <AdminLayout
            title="Buildings"
            description="Manage and monitor all registered buildings"
        >
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <p className="text-gray-600 dark:text-gray-400">
                        Total: {buildings.total} buildings
                    </p>
                    <Link href="/admin/occupancy/buildings/create">
                        <Button variant="primary">
                            <Plus className="mr-2 w-4 h-4" />
                            Register Building
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
                                        placeholder="Building code, name, address..."
                                        className="bg-white dark:bg-gray-800 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg w-full text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                    Building Type
                                </label>
                                <select
                                    value={buildingType}
                                    onChange={(e) => setBuildingType(e.target.value)}
                                    className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg w-full text-gray-900 dark:text-white"
                                >
                                    <option value="">All Types</option>
                                    <option value="residential">Residential</option>
                                    <option value="commercial">Commercial</option>
                                    <option value="industrial">Industrial</option>
                                    <option value="mixed_use">Mixed Use</option>
                                    <option value="institutional">Institutional</option>
                                </select>
                            </div>

                            <div>
                                <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                    Occupancy Status
                                </label>
                                <select
                                    value={occupancyStatus}
                                    onChange={(e) => setOccupancyStatus(e.target.value)}
                                    className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg w-full text-gray-900 dark:text-white"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="vacant">Vacant</option>
                                    <option value="partially_occupied">Partially Occupied</option>
                                    <option value="fully_occupied">Fully Occupied</option>
                                    <option value="under_construction">Under Construction</option>
                                    <option value="condemned">Condemned</option>
                                </select>
                            </div>

                            <div>
                                <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                    Structure Source
                                </label>
                                <select
                                    value={structureSource}
                                    onChange={(e) => setStructureSource(e.target.value)}
                                    className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg w-full text-gray-900 dark:text-white"
                                >
                                    <option value="">All Sources</option>
                                    <option value="sbr">SBR</option>
                                    <option value="housing">Housing</option>
                                    <option value="building_permit">Building Permit</option>
                                    <option value="manual">Manual</option>
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

                {/* Buildings Table */}
                <AdminContentCard>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-gray-200 dark:border-gray-700 border-b">
                                    <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white text-sm text-left">Building Code</th>
                                    <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white text-sm text-left">Name</th>
                                    <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white text-sm text-left">Address</th>
                                    <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white text-sm text-left">Type</th>
                                    <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white text-sm text-left">Status</th>
                                    <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white text-sm text-left">Units</th>
                                    <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white text-sm text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {buildings.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-8 text-gray-500 dark:text-gray-400 text-center">
                                            No buildings found
                                        </td>
                                    </tr>
                                ) : (
                                    buildings.data.map((building) => (
                                        <tr key={building.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700 border-b">
                                            <td className="px-4 py-3">
                                                <span className="font-mono text-gray-900 dark:text-white text-sm">
                                                    {building.building_code}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-900 dark:text-white">
                                                {building.building_name || 'N/A'}
                                            </td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-sm">
                                                {building.address}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-gray-600 dark:text-gray-400 text-sm capitalize">
                                                    {building.building_type.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`text-xs px-2 py-1 rounded capitalize ${getStatusColor(building.occupancy_status)}`}>
                                                    {building.occupancy_status.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                                                {building.units_count || building.total_units || 0}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-2">
                                                    <Link href={`/admin/occupancy/buildings/${building.id}`}>
                                                        <button className="text-primary hover:text-primary/80">
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                    </Link>
                                                    <Link href={`/admin/occupancy/buildings/${building.id}/edit`}>
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
                    {buildings.last_page > 1 && (
                        <div className="flex justify-center gap-2 mt-4">
                            {buildings.links.map((link, index) => (
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
