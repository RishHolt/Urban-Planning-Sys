import { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import Button from '../Button';
import { 
    getMunicipalBoundary, 
    importMunicipalityGeoJson,
    type MunicipalBoundary 
} from '../../data/services';
import { showSuccess, showError, showConfirm } from '../../lib/swal';
import { Shield, Upload, Edit2, Trash2 } from 'lucide-react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import { geoJSONToLeaflet } from '../../lib/mapUtils';
import { getCookie } from '../../lib/utils';

function getCsrfToken(): string {
    const metaToken = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content;
    if (metaToken) return metaToken;
    const cookieToken = getCookie('XSRF-TOKEN');
    if (cookieToken) {
        return decodeURIComponent(cookieToken);
    }
    return '';
}

interface MunicipalBoundaryPanelProps {
    initialBoundary?: MunicipalBoundary | null;
}

export default function MunicipalBoundaryPanel({ initialBoundary }: MunicipalBoundaryPanelProps) {
    const [boundary, setBoundary] = useState<MunicipalBoundary | null>(initialBoundary || null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadBoundary();
    }, []);

    const loadBoundary = async () => {
        try {
            const data = await getMunicipalBoundary();
            setBoundary(data);
        } catch (error) {
            console.error('Failed to load municipal boundary:', error);
        }
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            return;
        }

        const confirmed = await showConfirm(
            'This will replace the current municipality boundary. Continue?',
            'Import Municipality Boundary',
            'Yes, import',
            'Cancel'
        );

        if (!confirmed) {
            e.target.value = '';
            return;
        }

        setLoading(true);
        try {
            const result = await importMunicipalityGeoJson(file);
            showSuccess(result.message || 'Municipality boundary imported successfully.');
            await loadBoundary();
        } catch (error: any) {
            showError(error.message || 'Failed to import municipality boundary');
        } finally {
            setLoading(false);
            e.target.value = '';
        }
    };

    const handleDelete = async () => {
        if (!boundary) {
            return;
        }

        const confirmed = await showConfirm(
            'Are you sure you want to delete the municipal boundary?',
            'Delete Municipal Boundary',
            'Delete',
            'Cancel'
        );

        if (!confirmed) {
            return;
        }

        setLoading(true);
        try {
            // Delete via zone endpoint
            const response = await fetch(`/admin/zoning/zones/${boundary.id}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete boundary');
            }

            showSuccess('Municipal boundary deleted successfully.');
            setBoundary(null);
        } catch (error: any) {
            showError(error.message || 'Failed to delete municipal boundary');
        } finally {
            setLoading(false);
        }
    };

    // Map component to render boundary
    function BoundaryMap() {
        const map = useMap();
        const layerRef = useRef<L.Layer | null>(null);

        useEffect(() => {
            if (boundary?.geometry) {
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
                    
                    // Safely check layer type and fit bounds
                    try {
                        if (typeof (layer as any).getBounds === 'function') {
                            const bounds = (layer as any).getBounds();
                            if (bounds && typeof bounds.getNorthEast === 'function') {
                                map.fitBounds(bounds);
                            }
                        }
                    } catch (error) {
                        console.warn('Could not fit bounds for boundary layer:', error);
                    }
                }
            }

            return () => {
                if (layerRef.current) {
                    map.removeLayer(layerRef.current);
                }
            };
        }, [map, boundary]);

        return null;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Municipal Boundary
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Manage the administrative boundary of the municipality
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <input
                            type="file"
                            id="municipal-import"
                            className="hidden"
                            accept=".json,.geojson,application/json,application/geo+json"
                            onChange={handleImport}
                            disabled={loading}
                        />
                        <Button
                            variant="primary"
                            size="md"
                            onClick={() => document.getElementById('municipal-import')?.click()}
                            disabled={loading}
                            className="flex items-center gap-2"
                        >
                            <Upload size={18} />
                            {boundary ? 'Re-import' : 'Import'}
                        </Button>
                    </div>
                    {boundary && (
                        <>
                            <Button
                                variant="secondary"
                                size="md"
                                onClick={() => router.visit(`/admin/zoning/map?boundary=municipal`)}
                                className="flex items-center gap-2"
                            >
                                <Edit2 size={18} />
                                Edit
                            </Button>
                            <Button
                                variant="danger"
                                size="md"
                                onClick={handleDelete}
                                disabled={loading}
                                className="flex items-center gap-2"
                            >
                                <Trash2 size={18} />
                                Delete
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {boundary ? (
                <div className="bg-white dark:bg-dark-surface rounded-lg shadow p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                                Boundary Information
                            </h4>
                            <dl className="space-y-3">
                                <div>
                                    <dt className="text-sm text-gray-500 dark:text-gray-400">Label</dt>
                                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                                        {boundary.label || 'Municipality Boundary'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-gray-500 dark:text-gray-400">Status</dt>
                                    <dd className="mt-1">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            boundary.is_active
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                        }`}>
                                            {boundary.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </dd>
                                </div>
                            </dl>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                                Map Preview
                            </h4>
                            <div className="h-64 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
                                <MapContainer
                                    center={[14.5995, 120.9842]}
                                    zoom={11}
                                    style={{ height: '100%', width: '100%' }}
                                >
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    <BoundaryMap />
                                </MapContainer>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white dark:bg-dark-surface rounded-lg shadow p-12 text-center">
                    <Shield className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                        No municipal boundary
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Import a GeoJSON file to set the municipal boundary.
                    </p>
                </div>
            )}
        </div>
    );
}
