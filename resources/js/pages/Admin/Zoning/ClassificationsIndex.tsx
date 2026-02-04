import { useState, useEffect, useRef } from 'react';
import { router, useForm } from '@inertiajs/react';
import AdminLayout from '../../../components/AdminLayout';
import AdminFilterSection from '../../../components/AdminFilterSection';
import Button from '../../../components/Button';
import ClassificationModal from '../../../components/Zones/ClassificationModal';
import BoundaryManagementTabs, { TabPanel } from '../../../components/Zones/BoundaryManagementTabs';
import MunicipalBoundaryPanel from '../../../components/Zones/MunicipalBoundaryPanel';
import BarangayBoundariesPanel from '../../../components/Zones/BarangayBoundariesPanel';
import ZoningBoundariesPanel from '../../../components/Zones/ZoningBoundariesPanel';
import {
    deleteZoningClassification,
    getMunicipalBoundary,
    type ZoningClassification,
    type MunicipalBoundary,
    type BarangayBoundary,
} from '../../../data/services';
import { showSuccess, showError, showConfirm } from '../../../lib/swal';
import { Tags, Plus, Edit2, Trash2, Map, Eye, EyeOff } from 'lucide-react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import { geoJSONToLeaflet } from '../../../lib/mapUtils';

interface Classification {
    id: string;
    code: string;
    name: string;
    description: string | null;
    allowed_uses: string | null;
    color: string | null;
    is_active: boolean;
}

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

interface ClassificationsIndexProps {
    classifications: PaginatedData<Classification>;
    municipalBoundary?: MunicipalBoundary | null;
    barangayBoundaries?: BarangayBoundary[];
    zoningCounts?: Record<string, number>;
    filters?: {
        search?: string;
        status?: string;
    };
}

// Fix for default marker icon in React-Leaflet
if (typeof window !== 'undefined' && !(L.Icon.Default.prototype as any)._iconUrlFixed) {
    delete (L.Icon.Default.prototype as unknown as { _getIconUrl: unknown })._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    });
    (L.Icon.Default.prototype as any)._iconUrlFixed = true;
}

// Map component to display municipality boundary
function MunicipalityBoundaryMap({ 
    boundary, 
    showBoundary 
}: { 
    boundary: MunicipalBoundary | null; 
    showBoundary: boolean;
}) {
    const map = useMap();
    const layerRef = useRef<L.Layer | null>(null);

    useEffect(() => {
        if (!showBoundary || !boundary?.geometry) {
            // Remove layer if hidden or no boundary
            if (layerRef.current) {
                map.removeLayer(layerRef.current);
                layerRef.current = null;
            }
            return;
        }

        // Clear existing layer
        if (layerRef.current) {
            map.removeLayer(layerRef.current);
        }

        // Add boundary layer
        const layer = geoJSONToLeaflet(boundary.geometry, {
            color: '#000000',
            fillColor: '#000000',
            fillOpacity: 0,
            weight: 3,
            opacity: 0.8,
            dashArray: '5, 10',
        });

        if (layer) {
            map.addLayer(layer);
            layerRef.current = layer;
            
            // Fit bounds to boundary
            try {
                if (layer instanceof L.LayerGroup) {
                    const layers = layer.getLayers();
                    if (layers.length > 0) {
                        const bounds = L.featureGroup(layers).getBounds();
                        if (bounds.isValid()) {
                            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
                        }
                    }
                } else if (typeof (layer as any).getBounds === 'function') {
                    const bounds = (layer as any).getBounds();
                    if (bounds && typeof bounds.getNorthEast === 'function' && bounds.isValid()) {
                        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
                    }
                }
            } catch (error) {
                console.warn('Could not fit bounds for boundary layer:', error);
            }
        }

        return () => {
            if (layerRef.current) {
                map.removeLayer(layerRef.current);
                layerRef.current = null;
            }
        };
    }, [map, boundary, showBoundary]);

    return null;
}

export default function ClassificationsIndex({ 
    classifications, 
    municipalBoundary: initialMunicipalBoundary,
    barangayBoundaries = [],
    zoningCounts = {},
    filters: initialFilters = {} 
}: ClassificationsIndexProps) {
    const [showFilters, setShowFilters] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingClassification, setEditingClassification] = useState<Classification | null>(null);
    const [showBoundary, setShowBoundary] = useState(true);
    const [municipalBoundary, setMunicipalBoundary] = useState<MunicipalBoundary | null>(initialMunicipalBoundary || null);
    const { data, setData, get } = useForm({
        search: initialFilters.search || '',
        status: initialFilters.status || '',
    });

    // Load municipal boundary if not provided
    useEffect(() => {
        if (!municipalBoundary) {
            loadMunicipalBoundary();
        }
    }, []);

    const loadMunicipalBoundary = async () => {
        try {
            const boundary = await getMunicipalBoundary();
            setMunicipalBoundary(boundary);
        } catch (error) {
            console.error('Failed to load municipal boundary:', error);
        }
    };

    const handleSearch = (): void => {
        get('/admin/zoning/classifications', {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleReset = (): void => {
        setData({
            search: '',
            status: '',
        });
        router.get('/admin/zoning/classifications');
    };

    const handleCreate = (): void => {
        setEditingClassification(null);
        setShowModal(true);
    };

    const handleEdit = (classification: Classification): void => {
        setEditingClassification(classification);
        setShowModal(true);
    };

    const handleDelete = async (classification: Classification): Promise<void> => {
        const confirmed = await showConfirm(
            `Are you sure you want to delete classification "${classification.code} - ${classification.name}"?`,
            'Delete Classification',
            'Delete',
            'Cancel'
        );

        if (!confirmed) {
            return;
        }

        try {
            await deleteZoningClassification(classification.id);
            showSuccess('Classification deleted successfully');
            router.reload({ only: ['classifications'] });
        } catch (error) {
            console.error('Error deleting classification:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete classification';
            showError(errorMessage);
        }
    };


    const handleModalSuccess = (): void => {
        router.reload({ only: ['classifications'] });
    };

    const getStatusBadge = (isActive: boolean) => {
        if (isActive) {
            return (
                <span className="inline-flex items-center bg-green-100 dark:bg-green-900 px-2.5 py-0.5 rounded-full font-medium text-green-800 dark:text-green-200 text-xs">
                    Active
                </span>
            );
        }
        return (
            <span className="inline-flex items-center bg-gray-100 dark:bg-gray-700 px-2.5 py-0.5 rounded-full font-medium text-gray-800 dark:text-gray-200 text-xs">
                Inactive
            </span>
        );
    };

    return (
        <>
            <AdminLayout
                title="Zoning Classifications"
                description="Manage zoning classifications and boundary types"
            >
                <BoundaryManagementTabs defaultTab="classifications">
                    {/* Classifications Tab */}
                    <TabPanel tabId="classifications">
                        <AdminFilterSection
                    searchValue={data.search}
                    onSearchChange={(value) => setData('search', value)}
                    onSearch={handleSearch}
                    onReset={handleReset}
                    showFilters={showFilters}
                    onToggleFilters={() => setShowFilters(!showFilters)}
                    searchPlaceholder="Search by code, name, or description..."
                    actionButtons={
                        <>
                            {municipalBoundary && (
                                <Button
                                    variant="outline"
                                    size="md"
                                    onClick={() => setShowBoundary(!showBoundary)}
                                    className="flex items-center gap-2"
                                    title={showBoundary ? 'Hide municipality boundary' : 'Show municipality boundary'}
                                >
                                    {showBoundary ? <EyeOff size={18} /> : <Eye size={18} />}
                                    {showBoundary ? 'Hide Boundary' : 'Show Boundary'}
                                </Button>
                            )}
                            <Button
                                variant="primary"
                                size="md"
                                onClick={handleCreate}
                                className="flex items-center gap-2"
                            >
                                <Plus size={18} />
                                Create Classification
                            </Button>
                        </>
                    }
                    filterContent={
                        <>
                            <div>
                                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                    Status
                                </label>
                                <select
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                    className="bg-white dark:bg-dark-surface px-3 py-2 border border-gray-300 focus:border-transparent dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary w-full text-gray-900 dark:text-white text-sm"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </>
                    }
                />

                {/* Map View with Municipality Boundary */}
                {municipalBoundary && (
                    <div className="bg-white dark:bg-dark-surface shadow mb-6 rounded-lg overflow-hidden">
                        <div className="flex justify-between items-center p-4 border-gray-200 dark:border-gray-700 border-b">
                            <div className="flex items-center gap-2">
                                <Map size={20} className="text-gray-600 dark:text-gray-400" />
                                <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                                    Municipality Boundary Map
                                </h3>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowBoundary(!showBoundary)}
                                className="flex items-center gap-2"
                            >
                                {showBoundary ? <EyeOff size={16} /> : <Eye size={16} />}
                                {showBoundary ? 'Hide' : 'Show'} Boundary
                            </Button>
                        </div>
                        <div className="w-full h-96">
                            <MapContainer
                                center={[14.5995, 120.9842]}
                                zoom={11}
                                style={{ height: '100%', width: '100%' }}
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <MunicipalityBoundaryMap 
                                    boundary={municipalBoundary} 
                                    showBoundary={showBoundary}
                                />
                            </MapContainer>
                        </div>
                    </div>
                )}

                {/* Classifications Table */}
                <div className="bg-white dark:bg-dark-surface shadow rounded-lg overflow-hidden">
                    {classifications.data.length === 0 ? (
                        <div className="py-12 text-center">
                            <Tags className="mx-auto w-12 h-12 text-gray-400" />
                            <h3 className="mt-2 font-medium text-gray-900 dark:text-white text-sm">
                                No classifications found
                            </h3>
                            <p className="mt-1 text-gray-500 dark:text-gray-400 text-sm">
                                {data.search || data.status
                                    ? 'No classifications match your search criteria.'
                                    : 'Get started by creating a new classification.'}
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="divide-y divide-gray-200 dark:divide-gray-700 min-w-full">
                                    <thead className="bg-gray-50 dark:bg-gray-800">
                                        <tr>
                                            <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400 text-xs text-left uppercase tracking-wider">
                                                Code
                                            </th>
                                            <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400 text-xs text-left uppercase tracking-wider">
                                                Name
                                            </th>
                                            <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400 text-xs text-left uppercase tracking-wider">
                                                Description
                                            </th>
                                            <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400 text-xs text-left uppercase tracking-wider">
                                                Color
                                            </th>
                                            <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400 text-xs text-left uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400 text-xs text-right uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-dark-surface divide-y divide-gray-200 dark:divide-gray-700">
                                        {classifications.data
                                            .map((classification) => (
                                                <tr key={classification.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white text-sm whitespace-nowrap">
                                                        {classification.code}
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-sm whitespace-nowrap">
                                                        {classification.name}
                                                    </td>
                                                    <td className="px-6 py-4 max-w-xs text-gray-500 dark:text-gray-400 text-sm truncate">
                                                        {classification.description || '—'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {classification.color ? (
                                                            <div className="flex items-center gap-2">
                                                                <div
                                                                    className="border border-gray-300 dark:border-gray-600 rounded w-6 h-6"
                                                                    style={{ backgroundColor: classification.color }}
                                                                />
                                                                <span className="text-gray-500 dark:text-gray-400 text-xs">
                                                                    {classification.color}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-400 text-sm">—</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {getStatusBadge(classification.is_active)}
                                                    </td>
                                                    <td className="px-6 py-4 font-medium text-sm text-right whitespace-nowrap">
                                                        <div className="flex justify-end items-center gap-2">
                                                            <button
                                                                onClick={() => handleEdit(classification)}
                                                                className="p-1 rounded text-primary hover:text-primary/80 transition-colors"
                                                                title="Edit"
                                                            >
                                                                <Edit2 size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(classification)}
                                                                className="p-1 rounded text-red-600 hover:text-red-800 dark:hover:text-red-300 dark:text-red-400 transition-colors"
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
                            {classifications.last_page > 1 && (
                                <div className="bg-white dark:bg-dark-surface px-4 sm:px-6 py-3 border-gray-200 dark:border-gray-700 border-t">
                                    <div className="flex justify-between items-center">
                                        <div className="sm:hidden flex flex-1 justify-between">
                                            {classifications.links.map((link, index) => {
                                                if (link.url === null) {
                                                    return (
                                                        <span
                                                            key={index}
                                                            className="inline-flex relative items-center bg-white dark:bg-dark-surface px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md font-medium text-gray-700 dark:text-gray-300 text-sm"
                                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                                        />
                                                    );
                                                }
                                                return (
                                                    <button
                                                        key={index}
                                                        onClick={() => router.get(link.url!)}
                                                        className="inline-flex relative items-center bg-white hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-dark-surface px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md font-medium text-gray-700 dark:text-gray-300 text-sm"
                                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                                    />
                                                );
                                            })}
                                        </div>
                                        <div className="hidden sm:flex sm:flex-1 sm:justify-between sm:items-center">
                                            <div>
                                                <p className="text-gray-700 dark:text-gray-300 text-sm">
                                                    Showing <span className="font-medium">{classifications.from}</span> to{' '}
                                                    <span className="font-medium">{classifications.to}</span> of{' '}
                                                    <span className="font-medium">{classifications.total}</span> results
                                                </p>
                                            </div>
                                            <div>
                                                <nav className="inline-flex z-0 relative -space-x-px shadow-sm rounded-md" aria-label="Pagination">
                                                    {classifications.links.map((link, index) => {
                                                        if (link.url === null) {
                                                            return (
                                                                <span
                                                                    key={index}
                                                                    className="inline-flex relative items-center bg-white dark:bg-dark-surface px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md font-medium text-gray-500 dark:text-gray-400 text-sm"
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
                        <MunicipalBoundaryPanel initialBoundary={municipalBoundary} />
                    </TabPanel>

                    {/* Barangay Boundaries Tab */}
                    <TabPanel tabId="barangay">
                        <BarangayBoundariesPanel initialBoundaries={barangayBoundaries} />
                    </TabPanel>

                    {/* Zoning Boundaries Tab */}
                    <TabPanel tabId="zoning">
                        <ZoningBoundariesPanel 
                            classifications={classifications.data}
                            zoningCounts={zoningCounts}
                        />
                    </TabPanel>
                </BoundaryManagementTabs>
            </AdminLayout>

            <ClassificationModal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    setEditingClassification(null);
                }}
                onSuccess={handleModalSuccess}
                classification={editingClassification}
            />
        </>
    );
}
