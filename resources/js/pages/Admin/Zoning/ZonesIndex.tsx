import { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import AdminLayout from '../../../components/AdminLayout';
import AdminFilterSection from '../../../components/AdminFilterSection';
import Button from '../../../components/Button';
import BoundaryManagementTabs, { TabPanel } from '../../../components/Zones/BoundaryManagementTabs';
import MunicipalBoundaryPanel from '../../../components/Zones/MunicipalBoundaryPanel';
import BarangayBoundariesPanel from '../../../components/Zones/BarangayBoundariesPanel';
import { type Zone, type MunicipalBoundary, type BarangayBoundary } from '../../../data/services';
import { showSuccess, showError, showConfirm } from '../../../lib/swal';
import { getCsrfToken } from '../../../data/services';
import { Map, Plus, Edit2, Trash2, Download, Upload } from 'lucide-react';

interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

interface ZonesIndexProps {
    zones: PaginatedData<Zone>;
    municipalBoundary?: Zone | null;
    barangayBoundaries?: Zone[];
    filters?: {
        search?: string;
        status?: string;
        boundary_type?: string;
    };
}

export default function ZonesIndex({ 
    zones, 
    municipalBoundary,
    barangayBoundaries = [],
    filters: initialFilters = {} 
}: ZonesIndexProps) {
    const [showFilters, setShowFilters] = useState(false);
    const { data, setData, get } = useForm({
        search: initialFilters.search || '',
        status: initialFilters.status || '',
        boundary_type: initialFilters.boundary_type || 'zoning',
    });

    const handleSearch = (): void => {
        get('/admin/zoning/zones', {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleReset = (): void => {
        setData({
            search: '',
            status: '',
            boundary_type: 'zoning',
        });
        router.get('/admin/zoning/zones');
    };

    const handleDelete = async (zone: Zone): Promise<void> => {
        const confirmed = await showConfirm(
            `Are you sure you want to delete zone "${zone.label || zone.code}"?`,
            'Delete Zone',
            'Delete',
            'Cancel'
        );

        if (!confirmed) {
            return;
        }

        try {
            const response = await fetch(`/admin/zoning/zones/${zone.id}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete zone');
            }

            showSuccess('Zone deleted successfully');
            router.reload({ only: ['zones'] });
        } catch (error) {
            console.error('Error deleting zone:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete zone';
            showError(errorMessage);
        }
    };

    const getBoundaryTypeBadge = (boundaryType?: string) => {
        switch (boundaryType) {
            case 'municipal':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        Municipal
                    </span>
                );
            case 'barangay':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                        Barangay
                    </span>
                );
            case 'zoning':
            default:
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Zoning
                    </span>
                );
        }
    };

    const getStatusBadge = (isActive: boolean) => {
        if (isActive) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    Active
                </span>
            );
        }
        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                Inactive
            </span>
        );
    };

    return (
        <>
            <AdminLayout
                title="Zone Management"
                description="Manage zoning zones and boundaries"
            >
                <BoundaryManagementTabs defaultTab={data.boundary_type === 'municipal' ? 'municipal' : data.boundary_type === 'barangay' ? 'barangay' : 'zoning'}>
                    {/* Zoning Zones Tab */}
                    <TabPanel tabId="zoning">
                        <AdminFilterSection
                            searchValue={data.search}
                            onSearchChange={(value) => setData('search', value)}
                            onSearch={handleSearch}
                            onReset={handleReset}
                            showFilters={showFilters}
                            onToggleFilters={() => setShowFilters(!showFilters)}
                            searchPlaceholder="Search by code, name, or label..."
                            actionButtons={
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="secondary"
                                        size="md"
                                        onClick={() => router.visit('/admin/zoning/map')}
                                        className="flex items-center gap-2"
                                    >
                                        <Map size={18} />
                                        Open Map
                                    </Button>
                                    <Button
                                        variant="primary"
                                        size="md"
                                        onClick={() => router.visit('/admin/zoning/map')}
                                        className="flex items-center gap-2"
                                    >
                                        <Plus size={18} />
                                        Create Zone
                                    </Button>
                                </div>
                            }
                            filterContent={
                                <>
                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Status
                                        </label>
                                        <select
                                            value={data.status}
                                            onChange={(e) => setData('status', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                                        >
                                            <option value="">All Statuses</option>
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                            <option value="no_boundaries">No Boundaries</option>
                                            <option value="with_boundaries">With Boundaries</option>
                                        </select>
                                    </div>
                                </>
                            }
                        />

                        {/* Zones Table */}
                        <div className="bg-white dark:bg-dark-surface rounded-lg shadow overflow-hidden">
                            {zones.data.length === 0 ? (
                                <div className="text-center py-12">
                                    <Map className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                                        No zones found
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        {data.search || data.status
                                            ? 'No zones match your search criteria.'
                                            : 'Get started by creating a new zone on the map.'}
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                            <thead className="bg-gray-50 dark:bg-gray-800">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        Label
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        Classification
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        Type
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        Has Geometry
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        Status
                                                    </th>
                                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white dark:bg-dark-surface divide-y divide-gray-200 dark:divide-gray-700">
                                                {zones.data.map((zone) => (
                                                    <tr key={zone.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                            {zone.label || '—'}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                            <div>
                                                                <div className="font-medium">{zone.code}</div>
                                                                <div className="text-xs">{zone.name}</div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {getBoundaryTypeBadge(zone.boundary_type)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                            {zone.has_geometry ? (
                                                                <span className="text-green-600 dark:text-green-400">Yes</span>
                                                            ) : (
                                                                <span className="text-gray-400">No</span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {getStatusBadge(zone.is_active)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <button
                                                                    onClick={() => router.visit(`/admin/zoning/map?zone=${zone.id}`)}
                                                                    className="text-primary hover:text-primary/80 p-1 rounded transition-colors"
                                                                    title="Edit"
                                                                >
                                                                    <Edit2 size={16} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(zone)}
                                                                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1 rounded transition-colors"
                                                                    title="Delete"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination */}
                                    {zones.last_page > 1 && (
                                        <div className="bg-white dark:bg-dark-surface px-4 py-3 border-t border-gray-200 dark:border-gray-700 sm:px-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1 flex justify-between sm:hidden">
                                                    {zones.links.map((link, index) => {
                                                        if (link.url === null) {
                                                            return (
                                                                <span
                                                                    key={index}
                                                                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-surface"
                                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                                />
                                                            );
                                                        }
                                                        return (
                                                            <button
                                                                key={index}
                                                                onClick={() => router.get(link.url!)}
                                                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-surface hover:bg-gray-50 dark:hover:bg-gray-800"
                                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                                            />
                                                        );
                                                    })}
                                                </div>
                                                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                                    <div>
                                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                                            Showing <span className="font-medium">{zones.from}</span> to{' '}
                                                            <span className="font-medium">{zones.to}</span> of{' '}
                                                            <span className="font-medium">{zones.total}</span> results
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                                            {zones.links.map((link, index) => {
                                                                if (link.url === null) {
                                                                    return (
                                                                        <span
                                                                            key={index}
                                                                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-500 dark:text-gray-400 bg-white dark:bg-dark-surface"
                                                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                                                        />
                                                                    );
                                                                }
                                                                return (
                                                                    <button
                                                                        key={index}
                                                                        onClick={() => router.get(link.url!)}
                                                                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md ${link.active
                                                                            ? 'z-10 bg-primary border-primary text-white'
                                                                            : 'bg-white dark:bg-dark-surface border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                                                            }`}
                                                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                                                    />
                                                                );
                                                            })}
                                                        </nav>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </TabPanel>

                    {/* Municipal Boundary Tab */}
                    <TabPanel tabId="municipal">
                        <MunicipalBoundaryPanel initialBoundary={municipalBoundary as MunicipalBoundary | null} />
                    </TabPanel>

                    {/* Barangay Boundaries Tab */}
                    <TabPanel tabId="barangay">
                        <BarangayBoundariesPanel initialBoundaries={barangayBoundaries as BarangayBoundary[]} />
                    </TabPanel>
                </BoundaryManagementTabs>
            </AdminLayout>
        </>
    );
}
