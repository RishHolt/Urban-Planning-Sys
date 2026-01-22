import { Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import AdminFilterSection from '../../../components/AdminFilterSection';
import AdminEmptyState from '../../../components/AdminEmptyState';
import Input from '../../../components/Input';
import { Building, Eye, Plus, Search } from 'lucide-react';

interface BuildingItem {
    id: string;
    building_code: string;
    building_name: string | null;
    address: string;
    building_type: string;
    occupancy_status: string;
    structure_source: string;
    total_units: number;
    units_count: number;
    inspections_count: number;
    violations_count: number;
    complaints_count: number;
    is_active: boolean;
    next_inspection_date: string | null;
    created_at: string;
}

interface BuildingsIndexProps {
    buildings: {
        data: BuildingItem[];
        links: any;
        meta: any;
    };
    filters: {
        search?: string;
        building_type?: string;
        occupancy_status?: string;
        structure_source?: string;
        is_active?: string;
    };
}

export default function BuildingsIndex({ buildings, filters: initialFilters }: BuildingsIndexProps) {
    const [showFilters, setShowFilters] = useState(false);
    const { data, setData, get } = useForm({
        search: initialFilters.search || '',
        building_type: initialFilters.building_type || '',
        occupancy_status: initialFilters.occupancy_status || '',
        structure_source: initialFilters.structure_source || '',
        is_active: initialFilters.is_active ?? '',
    });

    const handleSearch = (): void => {
        get('/admin/occupancy/buildings', {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleReset = (): void => {
        setData({
            search: '',
            building_type: '',
            occupancy_status: '',
            structure_source: '',
            is_active: '',
        });
        router.get('/admin/occupancy/buildings');
    };

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { label: string; className: string }> = {
            'vacant': {
                label: 'Vacant',
                className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
            },
            'partially_occupied': {
                label: 'Partially Occupied',
                className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            },
            'fully_occupied': {
                label: 'Fully Occupied',
                className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            },
            'under_construction': {
                label: 'Under Construction',
                className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            },
            'condemned': {
                label: 'Condemned',
                className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
            },
        };

        const config = statusConfig[status] || statusConfig['vacant'];
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
                {config.label}
            </span>
        );
    };

    const getTypeBadge = (type: string) => {
        const typeLabels: Record<string, string> = {
            'residential': 'Residential',
            'commercial': 'Commercial',
            'industrial': 'Industrial',
            'mixed_use': 'Mixed Use',
            'institutional': 'Institutional',
        };
        return typeLabels[type] || type;
    };

    return (
        <AdminLayout title="Buildings" description="Manage and monitor all buildings">
            <div className="space-y-6">
                <div className="flex justify-end">
                    <Link
                        href="/admin/occupancy/buildings/create"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        <Plus size={20} />
                        Register Building
                    </Link>
                </div>

                <AdminFilterSection
                    searchValue={data.search}
                    onSearchChange={(value) => setData('search', value)}
                    onSearch={handleSearch}
                    onReset={handleReset}
                    showFilters={showFilters}
                    onToggleFilters={() => setShowFilters(!showFilters)}
                    searchPlaceholder="Search by code, name, address..."
                    filterContent={
                        showFilters && (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground dark:text-gray-300 mb-1">
                                        Building Type
                                    </label>
                                    <select
                                        value={data.building_type}
                                        onChange={(e) => setData('building_type', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-foreground dark:text-white"
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
                                    <label className="block text-sm font-medium text-foreground dark:text-gray-300 mb-1">
                                        Occupancy Status
                                    </label>
                                    <select
                                        value={data.occupancy_status}
                                        onChange={(e) => setData('occupancy_status', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-foreground dark:text-white"
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
                                    <label className="block text-sm font-medium text-foreground dark:text-gray-300 mb-1">
                                        Source
                                    </label>
                                    <select
                                        value={data.structure_source}
                                        onChange={(e) => setData('structure_source', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-foreground dark:text-white"
                                    >
                                        <option value="">All Sources</option>
                                        <option value="sbr">S&B Review</option>
                                        <option value="housing">Housing</option>
                                        <option value="building_permit">Building Permit</option>
                                        <option value="manual">Manual</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground dark:text-gray-300 mb-1">
                                        Status
                                    </label>
                                    <select
                                        value={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-foreground dark:text-white"
                                    >
                                        <option value="">All</option>
                                        <option value="1">Active</option>
                                        <option value="0">Inactive</option>
                                    </select>
                                </div>
                            </div>
                        )
                    }
                />

                {buildings.data.length === 0 ? (
                    <AdminEmptyState
                        icon={Building}
                        title="No buildings found"
                        description="Get started by registering a new building"
                        action={
                            <Link
                                href="/admin/occupancy/buildings/create"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                            >
                                <Plus size={20} />
                                Register Building
                            </Link>
                        }
                    />
                ) : (
                    <div className="bg-white dark:bg-dark-surface shadow-lg rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Building Code
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Name / Address
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Type
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Units
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Metrics
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Next Inspection
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-dark-surface divide-y divide-gray-200 dark:divide-gray-700">
                                    {buildings.data.map((building) => (
                                        <tr key={building.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-foreground dark:text-white">
                                                    {building.building_code}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-foreground dark:text-white">
                                                    {building.building_name || 'N/A'}
                                                </div>
                                                <div className="text-sm text-muted-foreground dark:text-gray-400">
                                                    {building.address}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-foreground dark:text-white">
                                                    {getTypeBadge(building.building_type)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(building.occupancy_status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground dark:text-white">
                                                {building.units_count} / {building.total_units}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-xs text-muted-foreground dark:text-gray-400 space-y-1">
                                                    <div>Inspections: {building.inspections_count}</div>
                                                    <div>Violations: {building.violations_count}</div>
                                                    <div>Complaints: {building.complaints_count}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground dark:text-white">
                                                {building.next_inspection_date || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link
                                                    href={`/admin/occupancy/buildings/${building.id}`}
                                                    className="text-primary hover:text-primary/80 inline-flex items-center gap-1"
                                                >
                                                    <Eye size={16} />
                                                    View
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {buildings.links && buildings.links.length > 3 && (
                            <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-muted-foreground dark:text-gray-400">
                                        Showing {buildings.meta.from} to {buildings.meta.to} of {buildings.meta.total} results
                                    </div>
                                    <div className="flex gap-2">
                                        {buildings.links.map((link: any, index: number) => (
                                            <button
                                                key={index}
                                                onClick={() => link.url && router.get(link.url)}
                                                disabled={!link.url}
                                                className={`px-3 py-1 rounded text-sm ${
                                                    link.active
                                                        ? 'bg-primary text-white'
                                                        : 'bg-white dark:bg-dark-surface text-foreground dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                                                } ${!link.url ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
