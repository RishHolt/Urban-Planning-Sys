import { useState, useEffect, useCallback, useRef } from 'react';
import AdminHeader from '../../../components/AdminHeader';
import Sidebar from '../../../components/Sidebar';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useLeafletDraw } from '../../../hooks/useLeafletDraw';
import {
    getZones,
    getZone,
    createZone,
    updateZone,
    deleteZone,
    getZoningClassifications,
    createZoningClassification,
    type Zone,
    type ZoningClassification,
} from '../../../data/services';
import { generatePolygonColor, leafletToGeoJSON, geoJSONToLeaflet, calculatePolygonArea, hslToRgba } from '../../../lib/mapUtils';
import { checkZoneOverlap } from '../../../lib/zoneOverlapDetection';
import { showSuccess, showError, showConfirm } from '../../../lib/swal';
import { Loader2, Plus, Search, X } from 'lucide-react';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import ZoneCard from '../../../components/Zones/ZoneCard';
import ZoneDetailsPanel from '../../../components/Zones/ZoneDetailsPanel';
import CreateZoneModal from '../../../components/Zones/CreateZoneModal';

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

// Map component that uses the draw hook
function MapWithDraw({
    selectedZone,
    selectedClassification,
    zones,
    isDrawing,
    isEditing,
    onPolygonCreated,
    onPolygonEdited,
    onPolygonDeleted,
}: {
    selectedZone: Zone | null;
    selectedClassification: ZoningClassification | null;
    zones: Zone[];
    isDrawing: boolean;
    isEditing: boolean;
    onPolygonCreated: (layer: L.Layer) => void;
    onPolygonEdited: (layers: L.LayerGroup) => void;
    onPolygonDeleted: (layers: L.LayerGroup) => void;
}) {
    const map = useMap();
    const polygonLayersRef = useRef<Map<string, L.Layer>>(new Map());
    const layerToZoneIdRef = useRef<Map<L.Layer, string>>(new Map());

    // Get the color for the selected classification or zone
    const drawColor = selectedClassification?.color || selectedZone?.color || generatePolygonColor(selectedClassification?.code || selectedZone?.code || 'UNKNOWN');

    const { featureGroup, drawControl } = useLeafletDraw({
        enabled: isDrawing || isEditing,
        drawColor,
        onDrawCreated: (layer) => {
            if (isDrawing && selectedClassification) {
                // Remove layer immediately (handled in hook, but double-check)
                if (map && map.hasLayer(layer)) {
                    map.removeLayer(layer);
                }
                if (featureGroup && featureGroup.hasLayer(layer)) {
                    featureGroup.removeLayer(layer);
                }
                onPolygonCreated(layer);
            }
        },
        onDrawDeleted: (layers) => {
            onPolygonDeleted(layers);
        },
    });

    // Render existing zones on map
    useEffect(() => {
        if (!map) {
            return;
        }

        // Clear existing layers
        polygonLayersRef.current.forEach((layer) => {
            if (map.hasLayer(layer)) {
                map.removeLayer(layer);
            }
        });
        polygonLayersRef.current.clear();
        layerToZoneIdRef.current.clear();

        // Add all active zones with geometry
        zones.forEach((zone) => {
            if (!zone.geometry) {
                return;
            }

            try {
                const color = zone.color || generatePolygonColor(zone.code);
                const rgbaColor = hslToRgba(color, 0.3);

                const layer = geoJSONToLeaflet(zone.geometry, {
                    color,
                    fillColor: color,
                    fillOpacity: 0.3,
                    weight: 2,
                    opacity: 0.8,
                });

                if (layer) {
                    // Add to map
                    if (layer instanceof L.LayerGroup) {
                        layer.addTo(map);
                    } else {
                        layer.addTo(map);
                    }

                    // Store reference
                    polygonLayersRef.current.set(zone.id, layer);
                    if (layer instanceof L.LayerGroup) {
                        layer.eachLayer((sublayer) => {
                            layerToZoneIdRef.current.set(sublayer, zone.id);
                        });
                    } else {
                        layerToZoneIdRef.current.set(layer, zone.id);
                    }

                    // Add popup
                    const popupContent = `
                        <div class="p-2">
                            <strong>${zone.code}</strong><br/>
                            ${zone.name}
                        </div>
                    `;
                    if (layer instanceof L.LayerGroup) {
                        layer.eachLayer((sublayer) => {
                            if (sublayer instanceof L.Polygon) {
                                sublayer.bindPopup(popupContent);
                            }
                        });
                    } else if (layer instanceof L.Polygon) {
                        layer.bindPopup(popupContent);
                    }
                }
            } catch (error) {
                console.error(`Error rendering zone ${zone.code}:`, error);
            }
        });

        // Cleanup
        return () => {
            polygonLayersRef.current.forEach((layer) => {
                if (map.hasLayer(layer)) {
                    map.removeLayer(layer);
                }
            });
            polygonLayersRef.current.clear();
            layerToZoneIdRef.current.clear();
        };
    }, [map, zones]);

    // Handle editing
    useEffect(() => {
        if (!map || !featureGroup || !isEditing || !selectedZone) {
            return;
        }

        // Add selected zone's geometry to featureGroup for editing
        if (selectedZone.geometry) {
            const layer = polygonLayersRef.current.get(selectedZone.id);
            if (layer) {
                // Remove layer from featureGroup first if it exists (to ensure clean state)
                if (layer instanceof L.LayerGroup) {
                    layer.eachLayer((sublayer) => {
                        if (featureGroup.hasLayer(sublayer)) {
                            featureGroup.removeLayer(sublayer);
                        }
                    });
                } else {
                    if (featureGroup.hasLayer(layer)) {
                        featureGroup.removeLayer(layer);
                    }
                }
                
                // Add layer to featureGroup for editing
                if (layer instanceof L.LayerGroup) {
                    layer.eachLayer((sublayer) => {
                        featureGroup.addLayer(sublayer);
                    });
                } else {
                    featureGroup.addLayer(layer);
                }
                
                // Force Leaflet Draw to enable edit mode by programmatically clicking the edit button
                // Leaflet Draw automatically enables edit mode when layers are in featureGroup,
                // but we need to click the edit button to activate the editing handles
                setTimeout(() => {
                    if (drawControl) {
                        // Try clicking the edit button programmatically
                        const container = drawControl.getContainer();
                        if (container) {
                            // Leaflet Draw uses different class names for edit buttons
                            // Try multiple selectors to find the edit button
                            const editButton = container.querySelector('.leaflet-draw-edit-edit, a[title*="Edit"], button[title*="Edit"]') as HTMLElement;
                            if (editButton) {
                                editButton.click();
                            } else {
                                // Try accessing the edit handler directly through the draw control
                                const drawControlAny = drawControl as any;
                                const editToolbar = drawControlAny._toolbars?.edit;
                                if (editToolbar && typeof editToolbar.reinit === 'function') {
                                    editToolbar.reinit();
                                }
                            }
                        }
                    }
                }, 100);
            }
        }

        const handleDrawEdited = (e: L.DrawEvents.Edited) => {
            onPolygonEdited(e.layers);
        };

        const handleDrawDeleted = (e: L.DrawEvents.Deleted) => {
            onPolygonDeleted(e.layers);
        };

        map.on(L.Draw.Event.EDITED, handleDrawEdited as any);
        map.on(L.Draw.Event.DELETED, handleDrawDeleted as any);

        return () => {
            map.off(L.Draw.Event.EDITED, handleDrawEdited as any);
            map.off(L.Draw.Event.DELETED, handleDrawDeleted as any);
        };
    }, [map, featureGroup, isEditing, selectedZone, onPolygonEdited, drawControl]);

    return null;
}

export default function ZoningMap() {
    const [sidebarOpen, setSidebarOpen] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth >= 1024;
        }
        return true;
    });

    const [zones, setZones] = useState<Zone[]>([]);
    const [allZones, setAllZones] = useState<Zone[]>([]); // All zones for map rendering
    const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
    const [selectedClassification, setSelectedClassification] = useState<ZoningClassification | null>(null);
    const [classifications, setClassifications] = useState<ZoningClassification[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showZoneDetailsPanel, setShowZoneDetailsPanel] = useState(false);
    const mapCenter: [number, number] = [14.5995, 120.9842]; // Default to Manila
    const mapZoom = 13;

    // Load zones and classifications on mount
    useEffect(() => {
        loadZones();
        loadAllZonesForMap();
        loadClassifications();
    }, []);

    // Auto-activate drawing when classification is selected
    useEffect(() => {
        if (selectedClassification) {
            setIsDrawing(true);
            setIsEditing(false);
            setSelectedZone(null);
        } else {
            setIsDrawing(false);
        }
    }, [selectedClassification]);

    const loadClassifications = async () => {
        try {
            const data = await getZoningClassifications(true); // Only active
            setClassifications(data);
        } catch (error) {
            console.error('Failed to load classifications:', error);
        }
    };

    // Load all zones for map rendering
    const loadAllZonesForMap = async () => {
        try {
            const response = await fetch('/api/zones', {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to load zones');
            }

            const result = await response.json();
            if (result.success && result.zones) {
                setAllZones(result.zones);
            }
        } catch (error) {
            console.error('Failed to load zones for map:', error);
        }
    };

    const loadZones = async () => {
        setLoading(true);
        try {
            const data = await getZones();
            setZones(data);
        } catch (error) {
            showError('Failed to load zones');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleClassificationCreated = async (newClassification: ZoningClassification) => {
        setClassifications((prev) => [...prev, newClassification]);
        setSelectedClassification(newClassification);
        setShowCreateModal(false);
    };

    const handlePolygonCreated = useCallback(
        async (layer: L.Layer) => {
            if (!selectedClassification) {
                return;
            }

            setSaving(true);
            try {
                const geometry = leafletToGeoJSON(layer);
                if (!geometry) {
                    throw new Error('Failed to convert layer to GeoJSON');
                }

                // Check for overlaps
                const overlappingZones = checkZoneOverlap(
                    geometry as GeoJSON.Polygon | GeoJSON.MultiPolygon,
                    allZones.filter((z) => z.geometry),
                    '' // No existing zone ID for new zone
                );

                if (overlappingZones.length > 0) {
                    const overlapList = overlappingZones.map((z) => z.code).join(', ');
                    const shouldProceed = await showConfirm(
                        `This zone overlaps with existing zones: ${overlapList}. Do you want to continue?`,
                        'Zone Overlap Detected',
                        'Yes, continue',
                        'Cancel'
                    );
                    if (!shouldProceed) {
                        setSaving(false);
                        setIsDrawing(false);
                        return;
                    }
                }

                // Auto-create zone with classification (label will be auto-generated on backend)
                const finalGeometry = geometry as GeoJSON.Polygon | GeoJSON.MultiPolygon;
                const newZone = await createZone({
                    zoning_classification_id: selectedClassification.id,
                    geometry: finalGeometry,
                    is_active: true,
                });

                setZones((prev) => [...prev, newZone]);
                setSelectedZone(newZone);
                setSelectedClassification(null); // Clear selection after creating
                await loadAllZonesForMap();
                showSuccess(`Zone ${newZone.label} created successfully`);
                setIsDrawing(false);
            } catch (error: any) {
                console.error('Error creating zone:', error);
                showError(error.message || 'Failed to create zone');
            } finally {
                setSaving(false);
            }
        },
        [selectedClassification, allZones]
    );

    const handlePolygonEdited = useCallback(
        async (layers: L.LayerGroup) => {
            if (!selectedZone || !selectedZone.geometry) {
                return;
            }

            setSaving(true);
            try {
                // Get the edited geometry from the feature group
                const editedLayers: L.Layer[] = [];
                layers.eachLayer((layer) => {
                    editedLayers.push(layer);
                });

                if (editedLayers.length === 0) {
                    return;
                }

                // Convert edited layers to geometry
                const geometries: GeoJSON.Polygon[] = [];
                for (const layer of editedLayers) {
                    const geometry = leafletToGeoJSON(layer);
                    if (geometry && geometry.type === 'Polygon') {
                        geometries.push(geometry);
                    }
                }

                if (geometries.length === 0) {
                    return;
                }

                // Combine into MultiPolygon if multiple, or single Polygon
                let finalGeometry: GeoJSON.Polygon | GeoJSON.MultiPolygon;
                if (geometries.length === 1) {
                    finalGeometry = geometries[0];
                } else {
                    finalGeometry = {
                        type: 'MultiPolygon',
                        coordinates: geometries.map((g) => g.coordinates),
                    };
                }

                // Check for overlaps
                const overlappingZones = checkZoneOverlap(
                    finalGeometry,
                    allZones.filter((z) => z.geometry && z.id !== selectedZone.id),
                    selectedZone.id
                );

                if (overlappingZones.length > 0) {
                    const overlapList = overlappingZones.map((z) => z.code).join(', ');
                    const shouldProceed = await showConfirm(
                        `This zone overlaps with existing zones: ${overlapList}. Do you want to continue?`,
                        'Zone Overlap Detected',
                        'Yes, continue',
                        'Cancel'
                    );
                    if (!shouldProceed) {
                        setSaving(false);
                        setIsEditing(false);
                        setShowZoneDetailsPanel(true); // Show panel again after canceling
                        await loadAllZonesForMap(); // Reload to reset map
                        return;
                    }
                }

                const updatedZone = await updateZone(selectedZone.id, {
                    geometry: finalGeometry,
                });

                setZones((prev) =>
                    prev.map((z) => (z.id === updatedZone.id ? updatedZone : z))
                );
                setSelectedZone(updatedZone);
                setIsEditing(false);
                setShowZoneDetailsPanel(true); // Show panel again after editing
                await loadAllZonesForMap();
                showSuccess('Zone boundaries updated successfully');
            } catch (error) {
                showError('Failed to update zone boundaries');
                console.error(error);
            } finally {
                setSaving(false);
            }
        },
        [selectedZone, allZones]
    );

    const handlePolygonDeleted = useCallback(
        async (layers: L.LayerGroup) => {
            if (!selectedZone) {
                return;
            }

            // If zone has no geometry after deletion, set geometry to null
            const updatedZone = await updateZone(selectedZone.id, {
                geometry: null,
            });

            setZones((prev) =>
                prev.map((z) => (z.id === updatedZone.id ? updatedZone : z))
            );
            setSelectedZone(updatedZone);
            setIsEditing(false);
            await loadAllZonesForMap();
            showSuccess('Zone boundaries deleted');
        },
        [selectedZone]
    );

    const handleDrawBoundaries = () => {
        if (!selectedZone) {
            return;
        }
        setIsDrawing(true);
        setIsEditing(false);
    };

    const handleEditBoundaries = () => {
        if (!selectedZone || !selectedZone.geometry) {
            return;
        }
        setShowZoneDetailsPanel(false); // Close the panel
        setIsEditing(true);
        setIsDrawing(false);
    };

    const handleDeleteZone = async () => {
        if (!selectedZone) {
            return;
        }

        const confirmed = await showConfirm(
            `Are you sure you want to delete zone "${selectedZone.code}"? This action cannot be undone.`,
            'Delete Zone',
            'Yes, delete it',
            'Cancel',
            '#ef4444',
            'warning'
        );

        if (!confirmed) {
            return;
        }

        try {
            await deleteZone(selectedZone.id);
            setZones((prev) => prev.filter((z) => z.id !== selectedZone.id));
            setSelectedZone(null);
            await loadAllZonesForMap();
            showSuccess('Zone deleted successfully');
        } catch (error) {
            showError('Failed to delete zone');
            console.error(error);
        }
    };

    const handleUpdateZone = async (data: Partial<Zone>) => {
        if (!selectedZone) {
            return;
        }

        try {
            const updatedZone = await updateZone(selectedZone.id, data);
            setZones((prev) =>
                prev.map((z) => (z.id === updatedZone.id ? updatedZone : z))
            );
            setSelectedZone(updatedZone);
            showSuccess('Zone updated successfully');
        } catch (error) {
            showError('Failed to update zone');
            console.error(error);
        }
    };

    const filteredZones = zones.filter((zone) => {
        if (!searchQuery) {
            return true;
        }
        const query = searchQuery.toLowerCase();
        return (
            zone.code.toLowerCase().includes(query) ||
            zone.name.toLowerCase().includes(query)
        );
    });

    return (
        <div className="flex flex-col bg-background dark:bg-dark-bg w-full min-h-dvh transition-colors">
            <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
            <AdminHeader sidebarOpen={sidebarOpen} />

            <main className={`flex-1 transition-all duration-300 ease-in-out ${
                sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
            } mt-16`}>
                <div className="relative flex h-[calc(100vh-4rem)]">
                {/* Sidebar */}
                <div
                    className={`${
                        sidebarOpen ? 'w-80' : 'w-0'
                    } transition-all duration-300 overflow-hidden border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-surface flex flex-col`}
                >
                    <div className="p-4 border-gray-200 dark:border-gray-700 border-b">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="font-semibold text-gray-900 dark:text-white text-lg">
                                Zone Management
                            </h2>
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="lg:hidden text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                    Select Classification
                                </label>
                                <select
                                    value={selectedClassification?.id || ''}
                                    onChange={(e) => {
                                        const classification = classifications.find((c) => c.id === e.target.value);
                                        setSelectedClassification(classification || null);
                                    }}
                                    className="bg-white dark:bg-dark-surface px-3 py-2 border border-gray-300 focus:border-transparent dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary w-full text-gray-900 dark:text-white text-sm"
                                >
                                    <option value="">Select a classification...</option>
                                    {classifications.map((classification) => (
                                        <option key={classification.id} value={classification.id}>
                                            {classification.code} - {classification.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <Button
                                onClick={() => setShowCreateModal(true)}
                                variant="outline"
                                className="flex justify-center items-center gap-2 w-full"
                            >
                                <Plus size={16} />
                                Create New Classification
                            </Button>
                            {selectedClassification && (
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 border border-blue-200 dark:border-blue-800 rounded-lg">
                                    <p className="text-blue-800 dark:text-blue-200 text-sm">
                                        <strong>Drawing Mode Active</strong><br />
                                        Selected: {selectedClassification.code} - {selectedClassification.name}
                                        <br />
                                        <span className="text-xs">Draw on the map to create a zone</span>
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {/* Search */}
                        <div className="p-4 border-gray-200 dark:border-gray-700 border-b">
                            <div className="relative">
                                <Search
                                    size={18}
                                    className="top-1/2 left-3 absolute text-gray-400 -translate-y-1/2 transform"
                                />
                                <Input
                                    type="text"
                                    placeholder="Search zones..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        {/* Zone List */}
                        <div className="space-y-2 p-4">
                            {loading ? (
                                <div className="flex justify-center items-center py-8">
                                    <Loader2 size={24} className="text-primary animate-spin" />
                                </div>
                            ) : filteredZones.length === 0 ? (
                                <div className="py-8 text-gray-500 dark:text-gray-400 text-center">
                                    {searchQuery ? 'No zones found' : 'No zones yet. Create one to get started.'}
                                </div>
                            ) : (
                                filteredZones.map((zone) => (
                                    <ZoneCard
                                        key={zone.id}
                                        zone={zone}
                                        isSelected={selectedZone?.id === zone.id}
                                        onSelect={(z) => {
                                            setSelectedZone(z);
                                            setShowZoneDetailsPanel(true);
                                            setIsDrawing(false);
                                            setIsEditing(false);
                                        }}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Map */}
                <div className="z-0 relative flex-1">
                    {/* Floating Zone Details Panel */}
                    {selectedZone && showZoneDetailsPanel && !isEditing && (
                        <div className="top-4 left-4 z-[100] absolute flex flex-col bg-white dark:bg-dark-surface shadow-2xl border border-gray-200 dark:border-gray-700 rounded-lg w-80 max-h-[calc(100vh-8rem)] overflow-hidden">
                            <ZoneDetailsPanel
                                zone={selectedZone}
                                onDrawBoundaries={handleDrawBoundaries}
                                onEditBoundaries={handleEditBoundaries}
                                onDelete={handleDeleteZone}
                                onUpdate={handleUpdateZone}
                                onClose={() => {
                                    setShowZoneDetailsPanel(false);
                                    setSelectedZone(null);
                                }}
                            />
                        </div>
                    )}
                    {!sidebarOpen && (
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className={`top-4 z-[100] absolute bg-white dark:bg-dark-surface shadow-lg p-2 border border-gray-200 dark:border-gray-700 rounded-lg ${
                                selectedZone && showZoneDetailsPanel && !isEditing ? 'left-[21rem]' : 'left-4'
                            }`}
                        >
                            <Plus size={20} />
                        </button>
                    )}

                    {(isDrawing || saving) && (
                        <div className="top-4 right-4 z-[100] absolute bg-white dark:bg-dark-surface shadow-lg p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div className="flex items-center gap-2">
                                {saving && <Loader2 size={16} className="animate-spin" />}
                                <span className="font-medium text-gray-900 dark:text-white text-sm">
                                    {saving ? 'Saving...' : isDrawing ? 'Drawing mode active' : ''}
                                </span>
                                {isDrawing && !saving && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setIsDrawing(false)}
                                    >
                                        Cancel
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}

                    {isEditing && !saving && (
                        <div className="top-4 right-4 z-[100] absolute bg-white dark:bg-dark-surface shadow-lg p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900 dark:text-white text-sm">
                                    Editing mode active
                                </span>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setShowZoneDetailsPanel(true); // Show panel again after canceling edit
                                        loadAllZonesForMap(); // Reload to reset
                                    }}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}

                    <MapContainer
                        center={mapCenter}
                        zoom={mapZoom}
                        style={{ height: '100%', width: '100%', zIndex: 0 }}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <MapWithDraw
                            selectedZone={selectedZone}
                            selectedClassification={selectedClassification}
                            zones={allZones}
                            isDrawing={isDrawing}
                            isEditing={isEditing}
                            onPolygonCreated={handlePolygonCreated}
                            onPolygonEdited={handlePolygonEdited}
                            onPolygonDeleted={handlePolygonDeleted}
                        />
                    </MapContainer>
                </div>
                </div>
            </main>

            {/* Create Zone Modal */}
                <CreateZoneModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={handleClassificationCreated}
                />
        </div>
    );
}
