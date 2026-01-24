import { useState, useEffect, useCallback, useRef } from 'react';
import AdminHeader from '../../../components/AdminHeader';
import Sidebar from '../../../components/Sidebar';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useLeafletDraw } from '../../../hooks/useLeafletDraw';
import { getZones, getZone, createZone, updateZone, deleteZone, getZoningClassifications, exportZonesGeoJson, importZonesGeoJson, importMunicipalityGeoJson, type Zone, type ZoningClassification } from '../../../data/services';
import { generatePolygonColor, leafletToGeoJSON, geoJSONToLeaflet, calculatePolygonArea, hslToRgba } from '../../../lib/mapUtils';
import { checkZoneOverlap } from '../../../lib/zoneOverlapDetection';
import { showSuccess, showError, showConfirm } from '../../../lib/swal';
import { Loader2, Plus, Search, X, Download, Upload, Shield } from 'lucide-react';
import booleanWithin from '@turf/boolean-within';
import intersect from '@turf/intersect';
import difference from '@turf/difference';
import { feature, featureCollection } from '@turf/helpers';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import ZoneCard from '../../../components/Zones/ZoneCard';
import ZoneDetailsPanel from '../../../components/Zones/ZoneDetailsPanel';

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
    onDrawStart,
    onDrawStop,
    onSelectZone,
    mapFocusKey,
    shouldShowPopup,
}: {
    selectedZone: Zone | null;
    selectedClassification: ZoningClassification | null;
    zones: Zone[];
    isDrawing: boolean;
    isEditing: boolean;
    onPolygonCreated: (layer: L.Layer) => void;
    onPolygonEdited: (layers: L.LayerGroup) => void;
    onPolygonDeleted: (layers: L.LayerGroup) => void;
    onDrawStart?: () => void;
    onDrawStop?: () => void;
    onSelectZone: (zone: Zone, startEdit?: boolean) => void;
    mapFocusKey: number;
    shouldShowPopup: boolean;
}) {
    const map = useMap();
    const polygonLayersRef = useRef<Map<string, L.Layer>>(new Map());
    const layerToZoneIdRef = useRef<Map<L.Layer, string>>(new Map());

    // Get the color for the selected classification or zone
    const drawColor = selectedClassification?.color || selectedZone?.color || generatePolygonColor(selectedClassification?.code || selectedZone?.code || 'UNKNOWN');

    const { featureGroup, drawControl } = useLeafletDraw({
        enabled: !!selectedClassification || isEditing,
        drawColor,
        onDrawCreated: (layer) => {
            if ((isDrawing || !!selectedClassification) && selectedClassification) {
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
        onDrawStart,
        onDrawStop,
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
                const isMunicipality = zone.is_municipality;
                const layerColor = isMunicipality ? '#000000' : (zone.color || generatePolygonColor(zone.code));

                const layer = geoJSONToLeaflet(zone.geometry, {
                    color: layerColor,
                    fillColor: layerColor,
                    fillOpacity: isMunicipality ? 0 : 0.3,
                    weight: isMunicipality ? 3 : 2,
                    opacity: 0.8,
                    dashArray: isMunicipality ? '5, 10' : undefined,
                    interactive: !isMunicipality,
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
                        <div class="p-3 min-w-[200px]">
                            <div class="mb-2 pb-2 border-b border-gray-100 dark:border-gray-700">
                                <span class="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-0.5">Zone Label</span>
                                <span class="text-sm font-bold text-gray-700 dark:text-gray-300 block truncate" title="${zone.label || 'N/A'}">
                                    ${zone.label || 'No Label Set'}
                                </span>
                            </div>
                            <div class="mb-3">
                                <span class="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-0.5">Classification</span>
                                <span class="text-xs font-semibold text-primary dark:text-blue-400 block mb-0.5">${zone.code}</span>
                                <span class="text-[11px] text-gray-600 dark:text-gray-300 block line-clamp-2">${zone.name}</span>
                            </div>
                            <button 
                                class="map-edit-zone-btn w-full bg-primary hover:bg-primary-hover text-white text-[11px] font-bold py-2 rounded-md transition-all shadow-sm flex items-center justify-center gap-1.5"
                                data-zone-id="${zone.id}"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                                Edit Zone
                            </button>
                        </div>
                    `;

                    const popup = L.popup({
                        maxWidth: 300,
                        className: 'zone-popup-custom'
                    }).setContent(popupContent);

                    if (layer instanceof L.LayerGroup) {
                        layer.eachLayer((sublayer) => {
                            if (sublayer instanceof L.Polygon) {
                                sublayer.bindPopup(popup);
                                sublayer.on('popupopen', (e) => {
                                    const popup = e.popup;
                                    const container = popup.getElement();
                                    if (container) {
                                        const btn = container.querySelector('.map-edit-zone-btn');
                                        if (btn) {
                                            btn.addEventListener('click', (e) => {
                                                e.preventDefault();
                                                onSelectZone(zone, true); // Pass true to trigger edit mode
                                                sublayer.closePopup();
                                            });
                                        }
                                    }
                                });
                            }
                        });
                    } else if (layer instanceof L.Polygon) {
                        layer.bindPopup(popup);
                        layer.on('popupopen', (e) => {
                            const popup = e.popup;
                            const container = popup.getElement();
                            if (container) {
                                const btn = container.querySelector('.map-edit-zone-btn');
                                if (btn) {
                                    btn.addEventListener('click', (e) => {
                                        e.preventDefault();
                                        onSelectZone(zone, true); // Pass true to trigger edit mode
                                        layer.closePopup();
                                    });
                                }
                            }
                        });
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

    // Pan to selected zone
    useEffect(() => {
        if (!map || !selectedZone) {
            return;
        }

        const layer = polygonLayersRef.current.get(selectedZone.id);
        if (layer) {
            // Only open popup if shouldShowPopup is true
            if (shouldShowPopup) {
                if (layer instanceof L.LayerGroup) {
                    const layers = (layer as L.LayerGroup).getLayers();
                    const firstPolygon = layers.find(l => l instanceof L.Polygon) as L.Polygon;
                    if (firstPolygon) {
                        firstPolygon.openPopup();
                    }
                } else if (layer instanceof L.Layer) {
                    (layer as any).openPopup?.();
                }
            }

            // Fit bounds
            if (layer instanceof L.LayerGroup) {
                const layers = (layer as L.LayerGroup).getLayers();
                if (layers.length > 0) {
                    const bounds = L.featureGroup(layers).getBounds();
                    if (bounds.isValid()) {
                        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 18 });
                    }
                }
            } else if (layer instanceof L.Polyline || layer instanceof L.Polygon) {
                const bounds = (layer as L.Polyline).getBounds();
                if (bounds.isValid()) {
                    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 18 });
                }
            } else if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
                map.setView(layer.getLatLng(), 18);
            }
        }
    }, [map, selectedZone, mapFocusKey, shouldShowPopup]);

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
    const [showZoneDetailsPanel, setShowZoneDetailsPanel] = useState(false);
    const [mapFocusKey, setMapFocusKey] = useState(0);
    const [shouldShowPopup, setShouldShowPopup] = useState(false);
    const [municipalityBoundary, setMunicipalityBoundary] = useState<Zone | null>(null);
    const mapCenter: [number, number] = [14.5995, 120.9842]; // Default to Manila
    const mapZoom = 13;

    // Load zones and classifications on mount
    useEffect(() => {
        loadZones();
        loadAllZonesForMap();
        loadClassifications();
    }, []);

    // Auto-activate drawing tools when classification is selected
    useEffect(() => {
        if (selectedClassification) {
            setIsEditing(false);
            setSelectedZone(null);
        } else {
            setIsDrawing(false);
        }
    }, [selectedClassification]);

    const loadClassifications = async () => {
        try {
            const data = await getZoningClassifications(true); // Only active
            // Filter out BOUNDARY classification if it exists
            const filteredData = data.filter(c => c.code !== 'BOUNDARY' && c.name !== 'BOUNDARY');
            setClassifications(filteredData);
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
                const boundary = result.zones.find((z: Zone) => z.is_municipality);
                setMunicipalityBoundary(boundary || null);
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

                // Spatial constraint: Adjust to be within municipality boundary
                let finalGeometry = geometry as GeoJSON.Polygon | GeoJSON.MultiPolygon;

                if (municipalityBoundary && municipalityBoundary.geometry) {
                    const zoneFeature = feature(geometry);
                    const boundaryFeature = feature(municipalityBoundary.geometry);

                    const intersection = intersect(featureCollection([zoneFeature as any, boundaryFeature as any]));

                    if (!intersection) {
                        showError('The drawn zone is completely outside the municipality boundary.');
                        setSaving(false);
                        return;
                    }

                    finalGeometry = intersection.geometry as GeoJSON.Polygon | GeoJSON.MultiPolygon;
                }

                // Auto-trim overlaps with existing zones
                const zonesWithGeometry = allZones.filter((z) => z.geometry && !z.is_municipality);

                if (zonesWithGeometry.length > 0) {
                    for (const existingZone of zonesWithGeometry) {
                        if (!existingZone.geometry) continue;

                        const currentFeature = feature(finalGeometry);
                        const existingFeature = feature(existingZone.geometry);

                        try {
                            const diff = difference(featureCollection([currentFeature, existingFeature] as any));
                            if (diff) {
                                finalGeometry = diff.geometry as GeoJSON.Polygon | GeoJSON.MultiPolygon;
                            } else {
                                // If difference is null, the new zone is completely covered by an existing one
                                showError('The drawn zone is completely covered by existing zones and cannot be created.');
                                setSaving(false);
                                return;
                            }
                        } catch (err) {
                            console.error('Error calculating difference:', err);
                        }
                    }
                }

                // Auto-create zone with classification (label will be auto-generated on backend)
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

    const handleDrawStart = useCallback(() => {
        setIsDrawing(true);
    }, []);

    const handleDrawStop = useCallback(() => {
        setIsDrawing(false);
    }, []);

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

                // Spatial constraint: Adjust to be within municipality boundary
                if (municipalityBoundary && municipalityBoundary.geometry) {
                    const zoneFeature = feature(finalGeometry);
                    const boundaryFeature = feature(municipalityBoundary.geometry);

                    const intersection = intersect(featureCollection([zoneFeature as any, boundaryFeature as any]));

                    if (!intersection) {
                        showError('The edited zone is completely outside the municipality boundary.');
                        setSaving(false);
                        return;
                    }

                    finalGeometry = intersection.geometry as GeoJSON.Polygon | GeoJSON.MultiPolygon;
                }

                // Auto-trim overlaps with other existing zones
                const otherZonesWithGeometry = allZones.filter(
                    (z) => z.geometry && z.id !== selectedZone.id && !z.is_municipality
                );

                if (otherZonesWithGeometry.length > 0) {
                    for (const existingZone of otherZonesWithGeometry) {
                        if (!existingZone.geometry) continue;

                        const currentFeature = feature(finalGeometry);
                        const existingFeature = feature(existingZone.geometry);

                        try {
                            const diff = difference(featureCollection([currentFeature, existingFeature] as any));
                            if (diff) {
                                finalGeometry = diff.geometry as GeoJSON.Polygon | GeoJSON.MultiPolygon;
                            } else {
                                // If difference is null, the edited zone is completely covered by other zones
                                showError('The edited zone is completely covered by existing zones and cannot be saved.');
                                setSaving(false);
                                return;
                            }
                        } catch (err) {
                            console.error('Error calculating difference:', err);
                        }
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

    const handleExport = async () => {
        try {
            const blob = await exportZonesGeoJson();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'zoning_map.geojson';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            showSuccess('Zoning data exported successfully');
        } catch (error) {
            showError('Failed to export zoning data');
            console.error(error);
        }
    };

    const handleMunicipalityImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            return;
        }

        const confirmed = await showConfirm(
            'This will clear the current municipality boundary and import a new one from the selected file. Continue?',
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
            if (result.success) {
                showSuccess(result.message);
                await loadAllZonesForMap();
            } else {
                showError(result.message || 'Failed to import municipality');
            }
        } catch (error) {
            showError('An error occurred during import');
            console.error(error);
        } finally {
            setLoading(false);
            e.target.value = '';
        }
    };

    const filteredZones = zones.filter((zone) => {
        // Exclude municipality boundary or any boundary-type zones from list
        const isBoundary = zone.is_municipality ||
            zone.code?.toUpperCase() === 'BOUNDARY' ||
            zone.name?.toUpperCase() === 'BOUNDARY';

        if (isBoundary) {
            return false;
        }

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

            <main className={`flex-1 transition-all duration-300 ease-in-out ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
                } mt-16`}>
                <div className="relative flex h-[calc(100vh-4rem)]">
                    {/* Sidebar */}
                    <div
                        className={`${sidebarOpen ? 'w-80' : 'w-0'
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
                                {selectedClassification && (
                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 border border-blue-200 dark:border-blue-800 rounded-lg">
                                        <p className="text-blue-800 dark:text-blue-200 text-sm">
                                            <strong>{isDrawing ? 'Drawing Mode Active' : 'Classification Selected'}</strong><br />
                                            Selected: {selectedClassification.code} - {selectedClassification.name}
                                            <br />
                                            <span className="text-xs">
                                                {isDrawing
                                                    ? 'Click the map to place vertices. Double-click to finish.'
                                                    : 'Select a tool on the map to start drawing'}
                                            </span>
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
                                <div className="grid grid-cols-2 gap-2 mt-3">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex items-center justify-center gap-2"
                                        onClick={handleExport}
                                    >
                                        <Download size={16} />
                                        Export
                                    </Button>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            id="municipality-import"
                                            className="hidden"
                                            accept=".json,.geojson,application/json,application/geo+json"
                                            onChange={handleMunicipalityImport}
                                        />
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="w-full flex items-center justify-center gap-2"
                                            onClick={() => document.getElementById('municipality-import')?.click()}
                                            title="Import Municipality Boundary"
                                        >
                                            <Shield size={16} />
                                            Import
                                        </Button>
                                    </div>
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
                                                setMapFocusKey(Date.now()); // Force map focus even if same zone
                                                setShouldShowPopup(false); // Don't show popup on card click
                                                setShowZoneDetailsPanel(false); // Map focus (hover) only
                                                setIsDrawing(false);
                                                setIsEditing(false);
                                            }}
                                            onEdit={(z) => {
                                                setSelectedZone(z);
                                                setShowZoneDetailsPanel(true); // Open the details panel (modal) for editing
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
                                className={`top-4 z-[100] absolute bg-white dark:bg-dark-surface shadow-lg p-2 border border-gray-200 dark:border-gray-700 rounded-lg ${selectedZone && showZoneDetailsPanel && !isEditing ? 'left-[21rem]' : 'left-4'
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
                                onDrawStart={handleDrawStart}
                                onDrawStop={handleDrawStop}
                                mapFocusKey={mapFocusKey}
                                shouldShowPopup={shouldShowPopup}
                                onSelectZone={(z, startEdit) => {
                                    setSelectedZone(z);
                                    setMapFocusKey(Date.now());
                                    setIsDrawing(false);
                                    if (startEdit) {
                                        // Edit button clicked - activate edit mode directly
                                        setShouldShowPopup(false);
                                        setShowZoneDetailsPanel(false);
                                        // Use setTimeout to ensure state is updated before activating edit mode
                                        setTimeout(() => {
                                            if (z.geometry) {
                                                setIsEditing(true);
                                            } else {
                                                setIsDrawing(true);
                                            }
                                        }, 0);
                                    } else {
                                        // Clicking on map polygon shows popup and info panel
                                        setShouldShowPopup(true);
                                        setShowZoneDetailsPanel(true);
                                        setIsEditing(false);
                                    }
                                }}
                            />
                        </MapContainer>
                    </div>
                </div>
            </main>

            {/* Create Zone Modal */}
        </div>
    );
}
