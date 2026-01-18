import { useState, useEffect, useCallback, useRef } from 'react';
import AdminHeader from '../../../components/AdminHeader';
import Sidebar from '../../../components/Sidebar';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useLeafletDraw } from '../../../hooks/useLeafletDraw';
import {
    getClups,
    getClassifications,
    getPolygons,
    getAllPolygonsForClup,
    savePolygon,
    updatePolygon,
    deletePolygon as deletePolygonService,
    type Clup,
    type ZoningClassification,
    type ZoningPolygon,
} from '../../../data/services';
import { generatePolygonColor, leafletToGeoJSON, geoJSONToLeaflet, calculatePolygonArea, hslToRgba } from '../../../lib/mapUtils';
import { showSuccess, showError } from '../../../lib/swal';
import { Loader2, MapPin, X, Search, Filter } from 'lucide-react';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import ZoningClassificationCard from '../../../components/ZoningClassificationCard';
import ZoningClassificationDetailsModal from '../../../components/ZoningClassificationDetailsModal';

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
    selectedClassification,
    polygons,
    selectedPolygonId,
    onPolygonCreated,
    onPolygonEdited,
    onPolygonDeleted,
}: {
    selectedClassification: ZoningClassification | null;
    polygons: ZoningPolygon[];
    selectedPolygonId: string | null;
    onPolygonCreated: (layer: L.Layer) => void;
    onPolygonEdited: (layers: L.LayerGroup, polygonId: string) => void;
    onPolygonDeleted: (layers: L.LayerGroup) => void;
}) {
    const map = useMap();
    const polygonLayersRef = useRef<Map<string, L.Layer>>(new Map());
    const layerToPolygonIdRef = useRef<Map<L.Layer, string>>(new Map());
    const isEditingRef = useRef<boolean>(false);
    const [isEditing, setIsEditing] = useState(false); // State to trigger re-render for tool visibility

    // Get the color for the selected classification
    const drawColor = selectedClassification 
        ? generatePolygonColor(selectedClassification.zoningCode || 'UNKNOWN')
        : '#3388ff';

    const { featureGroup, drawControl } = useLeafletDraw({
        enabled: !!selectedClassification || isEditing, // Show when classification selected OR when editing
        drawColor,
        onDrawCreated: (layer) => {
            if (selectedClassification) {
                // Mark that we're not editing (this is a new drawing)
                isEditingRef.current = false;
                
                // Layer removal is handled in the hook, but double-check here
                if (map && map.hasLayer(layer)) {
                    map.removeLayer(layer);
                }
                
                // Also ensure it's removed from featureGroup
                if (featureGroup && featureGroup.hasLayer(layer)) {
                    featureGroup.removeLayer(layer);
                }
                
                // Call the handler to save the polygon
                // The saved polygon will be rendered with correct color
                onPolygonCreated(layer);
            }
        },
        onDrawDeleted: (layers) => {
            isEditingRef.current = false;
            setIsEditing(false); // Hide tools after delete
            onPolygonDeleted(layers);
        },
    });

    // Render existing polygons
    useEffect(() => {
        if (!map) {
            return;
        }

        if (!polygons || polygons.length === 0) {
            // Clear existing polygons
            polygonLayersRef.current.forEach((layer) => {
                try {
                    if (map.hasLayer(layer)) {
                        map.removeLayer(layer);
                    }
                } catch (error) {
                    console.error('Error removing layer:', error);
                }
            });
            polygonLayersRef.current.clear();
            layerToPolygonIdRef.current.clear();
            return;
        }

        // Clear existing polygons
        polygonLayersRef.current.forEach((layer) => {
            map.removeLayer(layer);
        });
        polygonLayersRef.current.clear();
        layerToPolygonIdRef.current.clear();

        // Ensure featureGroup is completely removed from map to prevent blue layers from showing
        // This is important when polygons are re-rendered after saving
        if (featureGroup && map) {
            featureGroup.clearLayers();
            if (map.hasLayer(featureGroup)) {
                map.removeLayer(featureGroup);
            }
        }

        // Add polygons to map
        polygons.forEach((polygon) => {
            if (!polygon || !polygon.geometry) {
                return;
            }

            try {
                const zoningCode = polygon.zoningCode || 'UNKNOWN';
                const zoneName = polygon.zoneName || 'Unknown Zone';
                const color = generatePolygonColor(zoningCode);
                const layer = geoJSONToLeaflet(polygon.geometry, {
                    color,
                    fillColor: color,
                    fillOpacity: 0.3,
                    weight: 2,
                    opacity: 0.8,
                });

                if (layer && map) {
                    map.addLayer(layer);
                    polygonLayersRef.current.set(polygon.id, layer);
                    layerToPolygonIdRef.current.set(layer, polygon.id);

                    // Add popup with polygon info
                    const popupContent = `
                        <div class="p-2">
                            <h3 class="font-semibold text-sm mb-1">${zoneName}</h3>
                            <p class="text-xs text-gray-600">Code: ${zoningCode}</p>
                            ${polygon.barangay ? `<p class="text-xs text-gray-600">Barangay: ${polygon.barangay}</p>` : ''}
                            ${polygon.areaSqm ? `<p class="text-xs text-gray-600">Area: ${polygon.areaSqm.toLocaleString()} m²</p>` : ''}
                            <div class="mt-2 flex gap-1">
                                <button 
                                    class="edit-polygon-btn text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600" 
                                    data-polygon-id="${polygon.id}"
                                >
                                    Edit
                                </button>
                                <button 
                                    class="delete-polygon-btn text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600" 
                                    data-polygon-id="${polygon.id}"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    `;
                    layer.bindPopup(popupContent);

                    // Handle edit/delete button clicks
                    layer.on('popupopen', () => {
                        const editBtn = document.querySelector(`.edit-polygon-btn[data-polygon-id="${polygon.id}"]`);
                        const deleteBtn = document.querySelector(`.delete-polygon-btn[data-polygon-id="${polygon.id}"]`);

                        editBtn?.addEventListener('click', (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            
                            if (featureGroup && map) {
                                // Mark that we're editing (not drawing)
                                isEditingRef.current = true;
                                setIsEditing(true); // Trigger re-render to show tools
                                
                                // Stop any active drawing handlers
                                const drawHandlers = (map as any)._drawHandlers;
                                if (drawHandlers) {
                                    Object.keys(drawHandlers).forEach((key) => {
                                        if (drawHandlers[key] && drawHandlers[key].enabled()) {
                                            drawHandlers[key].disable();
                                        }
                                    });
                                }
                                
                                // Ensure featureGroup is on map (needed for editing)
                                if (!map.hasLayer(featureGroup)) {
                                    map.addLayer(featureGroup);
                                }
                                
                                // Remove layer from map first to avoid duplicate
                                // Then add to featureGroup for editing
                                if (map.hasLayer(layer)) {
                                    map.removeLayer(layer);
                                }
                                
                                // Clear featureGroup and add the layer
                                // Leaflet Draw's edit controls will work with layers in featureGroup
                                featureGroup.clearLayers();
                                featureGroup.addLayer(layer);
                                
                                // Close the popup
                                layer.closePopup();
                                
                                // Enable Leaflet Draw's edit mode
                                // Since draw control is always available, handlers should be accessible
                                const enableEditMode = () => {
                                    // Method 1: Access handlers via map (most direct)
                                    const handlers = (map as any)._drawHandlers;
                                    if (handlers?.edit) {
                                        handlers.edit.enable();
                                        return true;
                                    }
                                    
                                    // Method 2: Access via draw control's internal structure
                                    if (drawControl) {
                                        const dc = drawControl as any;
                                        // Try different paths to the edit handler
                                        if (dc._toolbars?.edit?._modes?.edit?.handler) {
                                            dc._toolbars.edit._modes.edit.handler.enable();
                                            return true;
                                        }
                                        // Alternative path
                                        if (dc._toolbars?.edit?._activeMode) {
                                            dc._toolbars.edit._activeMode.disable();
                                        }
                                        if (dc._toolbars?.edit?._modes) {
                                            const editMode = Object.values(dc._toolbars.edit._modes).find((mode: any) => 
                                                mode.type === 'edit' || mode.handler?.enabled
                                            ) as any;
                                            if (editMode?.handler) {
                                                editMode.handler.enable();
                                                return true;
                                            }
                                        }
                                    }
                                    
                                    // Method 3: Find and click the edit button in toolbar (fallback)
                                    const toolbars = document.querySelectorAll('.leaflet-draw-toolbar');
                                    for (const toolbar of Array.from(toolbars)) {
                                        const allButtons = toolbar.querySelectorAll('a');
                                        for (const btn of Array.from(allButtons)) {
                                            const title = (btn.getAttribute('title') || '').toLowerCase();
                                            const classes = Array.from(btn.classList).join(' ').toLowerCase();
                                            
                                            // Check if this is an edit button
                                            if ((title.includes('edit') || classes.includes('edit')) 
                                                && !btn.classList.contains('leaflet-disabled')) {
                                                (btn as HTMLElement).click();
                                                return true;
                                            }
                                        }
                                    }
                                    
                                    return false;
                                };
                                
                                // Try with multiple delays to account for initialization timing
                                const tryEnable = (attempt = 0) => {
                                    if (enableEditMode()) {
                                        return; // Success!
                                    }
                                    
                                    if (attempt < 4) {
                                        setTimeout(() => tryEnable(attempt + 1), [50, 100, 200, 500][attempt]);
                                    } else {
                                        // Final attempt failed - log debug info
                                        const handlers = (map as any)._drawHandlers;
                                        const toolbar = document.querySelector('.leaflet-draw-toolbar');
                                        console.error('Edit handler not found after all attempts.', {
                                            hasDrawControl: !!drawControl,
                                            hasMapHandlers: !!handlers,
                                            handlerKeys: handlers ? Object.keys(handlers) : [],
                                            drawControlStructure: drawControl ? {
                                                hasToolbars: !!(drawControl as any)._toolbars,
                                                toolbarKeys: (drawControl as any)._toolbars ? Object.keys((drawControl as any)._toolbars) : [],
                                            } : null,
                                            hasToolbar: !!toolbar,
                                            toolbarButtons: toolbar ? Array.from(toolbar.querySelectorAll('a')).map(b => ({
                                                title: b.getAttribute('title'),
                                                classes: Array.from(b.classList),
                                                disabled: b.classList.contains('leaflet-disabled')
                                            })) : [],
                                        });
                                    }
                                };
                                
                                tryEnable();
                            }
                        });

                        deleteBtn?.addEventListener('click', async () => {
                            if (window.confirm('Are you sure you want to delete this polygon?')) {
                                try {
                                    await deletePolygonService(polygon.id);
                                    map.removeLayer(layer);
                                    polygonLayersRef.current.delete(polygon.id);
                                    layerToPolygonIdRef.current.delete(layer);
                                    showSuccess('Polygon deleted successfully');
                                    // Trigger refresh
                                    window.dispatchEvent(new CustomEvent('polygon-deleted', { detail: { id: polygon.id } }));
                                } catch (error) {
                                    showError('Failed to delete polygon');
                                }
                            }
                        });
                    });
                }
            } catch (error) {
                console.error('Error adding polygon to map:', error, polygon);
            }
        });

        // Update polygon styles based on selection
        // Note: Map.forEach signature is (value, key) => void
        // polygonLayersRef is Map<string (polygonId), L.Layer>
        polygonLayersRef.current.forEach((layer, polygonId) => {
            const isSelected = selectedPolygonId === polygonId;
            
            // Update styles for polygon layers
            if (layer instanceof L.Polygon || layer instanceof L.Path) {
                if (isSelected) {
                    layer.setStyle({
                        weight: 4,
                        opacity: 1,
                        fillOpacity: 0.5,
                    });
                } else {
                    layer.setStyle({
                        weight: 2,
                        opacity: 0.8,
                        fillOpacity: 0.3,
                    });
                }
            } else if (layer instanceof L.LayerGroup) {
                // Update styles for all layers in the group
                const group = layer as L.LayerGroup;
                group.eachLayer((l) => {
                    if (l instanceof L.Polygon || l instanceof L.Path) {
                        if (isSelected) {
                            l.setStyle({
                                weight: 4,
                                opacity: 1,
                                fillOpacity: 0.5,
                            });
                        } else {
                            l.setStyle({
                                weight: 2,
                                opacity: 0.8,
                                fillOpacity: 0.3,
                            });
                        }
                    }
                });
            }
        });

        // Fit map to show all polygons (only if no polygon is selected)
        if (!selectedPolygonId && polygons.length > 0 && polygonLayersRef.current.size > 0 && map) {
            const group = new L.FeatureGroup(Array.from(polygonLayersRef.current.values()));
            const bounds = group.getBounds();
            if (bounds.isValid()) {
                map.fitBounds(bounds.pad(0.1));
            }
        }

        // Cleanup
        return () => {
            polygonLayersRef.current.forEach((layer) => {
                map.removeLayer(layer);
            });
            polygonLayersRef.current.clear();
            layerToPolygonIdRef.current.clear();
        };
    }, [map, polygons, featureGroup]);

    // Keep featureGroup on map (needed for editing), but remove any new drawings immediately
    // The handleDrawCreated event in the hook will remove newly drawn layers
    useEffect(() => {
        if (!featureGroup || !map) {
            return;
        }
        
        // Ensure featureGroup is on map (needed for editing to work)
        if (!map.hasLayer(featureGroup)) {
            map.addLayer(featureGroup);
        }
        
        // When polygons are re-rendered (after save/edit), we need to handle layers in featureGroup
        // If we're editing, keep the layer in featureGroup
        // If we're not editing, clear featureGroup (new drawings are already removed in handleDrawCreated)
        if (!isEditingRef.current) {
            // Only clear if there are layers that shouldn't be there
            // (This is a safety net - new drawings should already be removed)
            const timeout = setTimeout(() => {
                if (!isEditingRef.current) {
                    // Check if any layers in featureGroup are not being edited
                    const layers = featureGroup.getLayers();
                    if (layers.length > 0) {
                        // These might be leftover - but be careful not to clear during active editing
                        // The layers will be re-added when edit button is clicked
                        featureGroup.clearLayers();
                    }
                }
            }, 200);
            return () => clearTimeout(timeout);
        }
    }, [map, featureGroup, polygons]);

    // Fit map to selected polygon when selection changes
    useEffect(() => {
        if (!map || !selectedPolygonId) {
            return;
        }

        const layer = polygonLayersRef.current.get(selectedPolygonId);
        if (!layer) {
            return;
        }

        try {
            let bounds: L.LatLngBounds | null = null;
            
            // Handle different layer types
            if (layer instanceof L.LayerGroup) {
                // For LayerGroup (MultiPolygon), get bounds from all layers
                const group = layer as L.LayerGroup;
                const layers: L.Layer[] = [];
                group.eachLayer((l) => {
                    if (l instanceof L.Polygon || l instanceof L.Path) {
                        layers.push(l);
                    }
                });
                if (layers.length > 0) {
                    const featureGroup = new L.FeatureGroup(layers);
                    bounds = featureGroup.getBounds();
                }
            } else if (layer instanceof L.Polygon || layer instanceof L.Path) {
                bounds = layer.getBounds();
            }
            
            if (bounds && bounds.isValid()) {
                map.fitBounds(bounds.pad(0.1));
            }
        } catch (error) {
            console.error('Error fitting bounds to selected polygon:', error);
        }
    }, [map, selectedPolygonId]);

    // Handle draw edited event with polygon ID tracking
    useEffect(() => {
        if (!map || !featureGroup) {
            return;
        }

        const handleDrawEdited = (e: L.DrawEvents.Edited) => {
            const { layers } = e;
            layers.eachLayer((layer) => {
                const polygonId = layerToPolygonIdRef.current.get(layer);
                if (polygonId) {
                    onPolygonEdited(layers, polygonId);
                    // Reset editing flag after edit is processed
                    isEditingRef.current = false;
                    setIsEditing(false); // Hide tools after edit completes
                }
            });
        };

        map.on(L.Draw.Event.EDITED as any, handleDrawEdited);

        return () => {
            map.off(L.Draw.Event.EDITED as any, handleDrawEdited);
        };
    }, [map, featureGroup, onPolygonEdited]);

    return null;
}

export default function ZoningMap() {
    const [sidebarOpen, setSidebarOpen] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth >= 1024;
        }
        return true;
    });

    const [clups, setClups] = useState<Clup[]>([]);
    const [classifications, setClassifications] = useState<ZoningClassification[]>([]);
    const [polygons, setPolygons] = useState<ZoningPolygon[]>([]);
    const [selectedClupId, setSelectedClupId] = useState<string>('');
    const [selectedClassificationId, setSelectedClassificationId] = useState<string>('');
    const [selectedClassification, setSelectedClassification] = useState<ZoningClassification | null>(null);
    const [selectedPolygonId, setSelectedPolygonId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [filterClassificationId, setFilterClassificationId] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [loadingClassifications, setLoadingClassifications] = useState(false);
    const [loadingPolygons, setLoadingPolygons] = useState(false);
    const [saving, setSaving] = useState(false);
    const [viewingClassification, setViewingClassification] = useState<ZoningClassification | null>(null);
    const mapCenter: [number, number] = [14.5995, 120.9842]; // Default to Manila
    const mapZoom = 13;

    // Load CLUPs on mount
    useEffect(() => {
        loadClups();
    }, []);

    // Load classifications and all polygons when CLUP is selected
    useEffect(() => {
        if (selectedClupId) {
            loadClassifications(selectedClupId);
            loadAllPolygons(selectedClupId);
        } else {
            setClassifications([]);
            setSelectedClassificationId('');
            setSelectedClassification(null);
            setPolygons([]);
            setFilterClassificationId('');
        }
    }, [selectedClupId]);

    // Update selected classification when classification dropdown changes (for drawing only)
    useEffect(() => {
        if (selectedClassificationId && classifications.length > 0) {
            const classification = classifications.find((c) => c.id === selectedClassificationId);
            setSelectedClassification(classification || null);
        } else {
            setSelectedClassification(null);
        }
    }, [selectedClassificationId, classifications]);

    // Listen for polygon deletion events
    useEffect(() => {
        const handlePolygonDeleted = (event: CustomEvent) => {
            setPolygons((prev) => prev.filter((p) => p.id !== event.detail.id));
        };

        window.addEventListener('polygon-deleted', handlePolygonDeleted as EventListener);
        return () => {
            window.removeEventListener('polygon-deleted', handlePolygonDeleted as EventListener);
        };
    }, []);

    const loadClups = async () => {
        setLoading(true);
        try {
            const data = await getClups();
            setClups(data);
        } catch (error) {
            showError('Failed to load CLUPs');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const loadClassifications = async (clupId: string) => {
        setLoadingClassifications(true);
        try {
            const data = await getClassifications(clupId);
            setClassifications(data);
            setSelectedClassificationId('');
        } catch (error) {
            showError('Failed to load classifications');
            console.error(error);
        } finally {
            setLoadingClassifications(false);
        }
    };

    const loadPolygons = async (zoningId: string) => {
        setLoadingPolygons(true);
        try {
            const data = await getPolygons(zoningId);
            setPolygons(data);
        } catch (error) {
            showError('Failed to load polygons');
            console.error(error);
        } finally {
            setLoadingPolygons(false);
        }
    };

    const loadAllPolygons = async (clupId: string) => {
        setLoadingPolygons(true);
        try {
            const data = await getAllPolygonsForClup(clupId);
            setPolygons(data);
        } catch (error) {
            showError('Failed to load polygons');
            console.error(error);
        } finally {
            setLoadingPolygons(false);
        }
    };

    const handlePolygonCreated = useCallback(
        async (layer: L.Layer) => {
            if (!selectedClassification) {
                return;
            }

            setSaving(true);
            try {
                // Debug: Log layer information
                console.log('Layer received:', {
                    type: layer.constructor?.name,
                    hasGetLatLngs: typeof (layer as any).getLatLngs === 'function',
                    isPolygon: layer instanceof L.Polygon,
                    isRectangle: layer instanceof L.Rectangle,
                    isCircle: layer instanceof L.Circle,
                    layer: layer,
                });

                const geometry = leafletToGeoJSON(layer);
                if (!geometry) {
                    console.error('Failed to convert layer to GeoJSON. Layer details:', layer);
                    throw new Error('Failed to convert layer to GeoJSON. Please check the console for details.');
                }

                console.log('Geometry converted:', geometry);

                const area = calculatePolygonArea(geometry as GeoJSON.Polygon);

                const polygon = await savePolygon({
                    zoning_id: selectedClassification.id,
                    barangay: null,
                    area_sqm: area > 0 ? area : null,
                    geometry: geometry as GeoJSON.Polygon,
                });

                setPolygons((prev) => [...prev, polygon]);
                showSuccess('Polygon saved successfully');
                
                // Note: featureGroup cleanup is handled in MapWithDraw component
                // No need to do it here since the polygon will be re-rendered with correct color
            } catch (error) {
                showError('Failed to save polygon');
                console.error(error);
            } finally {
                setSaving(false);
            }
        },
        [selectedClassification]
    );

    const handlePolygonEdited = useCallback(
        async (layers: L.LayerGroup, polygonId: string) => {
            if (!selectedClassification) {
                return;
            }

            setSaving(true);
            try {
                let layerToUpdate: L.Layer | null = null;

                layers.eachLayer((layer) => {
                    layerToUpdate = layer;
                });

                if (!layerToUpdate) {
                    return;
                }

                const geometry = leafletToGeoJSON(layerToUpdate);
                if (!geometry) {
                    return;
                }

                const area = calculatePolygonArea(geometry as GeoJSON.Polygon);

                await updatePolygon(polygonId, {
                    area_sqm: area > 0 ? area : null,
                    geometry: geometry as GeoJSON.Polygon,
                });

                // Refresh polygons after update
                await loadPolygons(selectedClassification.id);
                showSuccess('Polygon updated successfully');
            } catch (error) {
                showError('Failed to update polygon');
                console.error(error);
            } finally {
                setSaving(false);
            }
        },
        [selectedClassification]
    );

    const handlePolygonDeleted = useCallback(
        async (layers: L.LayerGroup) => {
            setSaving(true);
            try {
                // Note: This is handled by the popup delete button
                // This callback is for when using the draw control delete tool
                layers.eachLayer(async (layer) => {
                    // Find polygon by matching geometry
                    const geometry = leafletToGeoJSON(layer);
                    if (!geometry) {
                        return;
                    }

                    const polygon = polygons.find((p) => {
                        // Simple check - in production use better matching
                        return JSON.stringify(p.geometry) === JSON.stringify(geometry);
                    });

                    if (polygon) {
                        await deletePolygonService(polygon.id);
                        setPolygons((prev) => prev.filter((p) => p.id !== polygon.id));
                        showSuccess('Polygon deleted successfully');
                    }
                });
            } catch (error) {
                showError('Failed to delete polygon');
                console.error(error);
            } finally {
                setSaving(false);
            }
        },
        [polygons]
    );

    const handleReset = () => {
        setSelectedClupId('');
        setSelectedClassificationId('');
        setSelectedClassification(null);
        setClassifications([]);
        setPolygons([]);
        setSelectedPolygonId(null);
        setViewingClassification(null);
        setSearchQuery('');
        setFilterClassificationId('');
    };

    // Filter polygons based on search and classification filter
    const filteredPolygons = polygons.filter((polygon) => {
        const matchesSearch = !searchQuery || 
            (polygon.zoningCode?.toLowerCase().includes(searchQuery.toLowerCase()) || 
             polygon.zoneName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
             polygon.barangay?.toLowerCase().includes(searchQuery.toLowerCase()) ||
             polygon.id.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const matchesFilter = !filterClassificationId || polygon.zoningId === filterClassificationId;
        
        return matchesSearch && matchesFilter;
    });

    const handleClassificationSelect = (classificationId: string) => {
        setSelectedClassificationId(classificationId);
        setSelectedPolygonId(null);
    };

    const handlePolygonSelect = (polygonId: string) => {
        setSelectedPolygonId(polygonId === selectedPolygonId ? null : polygonId);
    };


    return (
        <div className="flex flex-col bg-background dark:bg-dark-bg w-full min-h-dvh transition-colors">
            <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
            <AdminHeader sidebarOpen={sidebarOpen} />

            <main
                className={`flex-1 transition-all duration-300 ease-in-out ${
                    sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
                } mt-16 overflow-hidden`}
            >
                <div className="h-[calc(100vh-4rem)] flex flex-col">
                    {/* Header Section */}
                    <div className="px-2 sm:px-4 py-2 sm:py-3">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-3 sm:mb-4">
                            <div>
                                <h1 className="mb-1 font-bold text-gray-900 dark:text-white text-xl sm:text-2xl lg:text-3xl">
                                    Zoning Map
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                                    Manage and visualize zoning classifications on the map
                                </p>
                            </div>
                            {(selectedClupId || selectedClassificationId) && (
                                <Button onClick={handleReset} variant="outline" size="sm">
                                    <X className="w-4 h-4 mr-2" />
                                    Reset
                                </Button>
                            )}
                        </div>

                        {/* CLUP and Classification Selection */}
                        <div className="bg-white dark:bg-dark-surface shadow-lg p-3 sm:p-4 rounded-lg mb-2 sm:mb-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <div>
                                    <label className="block mb-1.5 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                        Select CLUP
                                    </label>
                                    <select
                                        value={selectedClupId}
                                        onChange={(e) => setSelectedClupId(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                                        disabled={loading}
                                    >
                                        <option value="">-- Select CLUP --</option>
                                        {clups.map((clup) => (
                                            <option key={clup.id} value={clup.id}>
                                                {clup.lguName} ({clup.coveragePeriod})
                                            </option>
                                        ))}
                                    </select>
                                    {loading && (
                                        <div className="mt-1.5 flex items-center text-sm text-gray-500 dark:text-gray-400">
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Loading CLUPs...
                                        </div>
                                    )}
                                </div>
                                
                                <div>
                                    <label className="block mb-1.5 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                        Zoning Classification <span className="text-xs text-gray-500">(for drawing)</span>
                                    </label>
                                    <select
                                        value={selectedClassificationId}
                                        onChange={(e) => handleClassificationSelect(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                                        disabled={!selectedClupId || loadingClassifications}
                                    >
                                        <option value="">-- Select Classification to Draw --</option>
                                        {classifications.map((classification) => (
                                            <option key={classification.id} value={classification.id}>
                                                {classification.zoningCode} - {classification.zoneName}
                                            </option>
                                        ))}
                                    </select>
                                    {selectedClassificationId && (
                                        <div className="mt-1.5 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                                            <p className="text-xs text-blue-800 dark:text-blue-200 font-semibold mb-1">
                                                Drawing Instructions:
                                            </p>
                                            <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-0.5 list-disc list-inside">
                                                <li>Click on the map to add points (minimum 3 required)</li>
                                                <li>After 3 points, <strong>keep clicking in different locations</strong> to add more points</li>
                                                <li><strong>Important:</strong> Click away from the first point to add more vertices</li>
                                                <li>To finish: <strong>double-click</strong> anywhere, or <strong>click the first point</strong> again, or press <strong>Enter</strong></li>
                                            </ul>
                                        </div>
                                    )}
                                    {loadingClassifications && (
                                        <div className="mt-1.5 flex items-center text-sm text-gray-500 dark:text-gray-400">
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Loading...
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Split Layout: Polygon Cards (Left) | Map (Right) */}
                    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden px-2 sm:px-4 gap-2 sm:gap-3 pb-2 sm:pb-4">
                        {/* Left Sidebar - Polygon Cards */}
                        <div className="w-full lg:w-64 xl:w-80 bg-white dark:bg-dark-surface shadow-lg flex flex-col flex-shrink-0 rounded-lg overflow-hidden h-48 lg:h-auto">
                            <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
                                <h2 className="font-semibold text-gray-900 dark:text-white text-base sm:text-lg mb-2">
                                    GIS Polygons
                                </h2>
                                {selectedClupId && !loadingPolygons && (
                                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3">
                                        {filteredPolygons.length} of {polygons.length} polygon{polygons.length !== 1 ? 's' : ''}
                                    </p>
                                )}
                                
                                {/* Search and Filter */}
                                {selectedClupId && polygons.length > 0 && (
                                    <div className="space-y-2">
                                        <Input
                                            type="text"
                                            placeholder="Search polygons..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            icon={<Search className="w-4 h-4" />}
                                            className="text-sm"
                                        />
                                        <select
                                            value={filterClassificationId}
                                            onChange={(e) => setFilterClassificationId(e.target.value)}
                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                                        >
                                            <option value="">All Classifications</option>
                                            {classifications.map((classification) => (
                                                <option key={classification.id} value={classification.id}>
                                                    {classification.zoningCode} - {classification.zoneName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-3 sm:p-4">
                                {loadingPolygons ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="w-5 h-5 animate-spin text-gray-400 dark:text-gray-500" />
                                        <span className="ml-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                            Loading...
                                        </span>
                                    </div>
                                ) : !selectedClupId ? (
                                    <div className="flex flex-col items-center justify-center py-8 text-center">
                                        <MapPin className="w-12 h-12 mb-2 text-gray-400 dark:text-gray-600" />
                                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                            Select a CLUP to view polygons
                                        </p>
                                    </div>
                                ) : filteredPolygons.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-8 text-center">
                                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                            {polygons.length === 0 ? 'No polygons found' : 'No polygons match your search/filter'}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {filteredPolygons.map((polygon) => {
                                            const zoneRef = `${polygon.zoningCode || 'UNK'}-${polygon.id.slice(0, 8)}`;
                                            const isSelected = selectedPolygonId === polygon.id;
                                            const polygonColor = polygon.zoningCode ? generatePolygonColor(polygon.zoningCode) : '#666';
                                            
                                            return (
                                                <div
                                                    key={polygon.id}
                                                    onClick={() => handlePolygonSelect(polygon.id)}
                                                    className={`
                                                        relative cursor-pointer transition-all duration-200 
                                                        shadow-lg rounded-lg p-3 border
                                                        ${isSelected 
                                                            ? 'ring-2 ring-primary border-primary' 
                                                            : 'border-gray-200 dark:border-gray-700 hover:shadow-xl hover:border-gray-300 dark:hover:border-gray-600'
                                                        }
                                                    `}
                                                    style={{
                                                        backgroundColor: isSelected 
                                                            ? hslToRgba(polygonColor, 0.15) // 15% opacity when selected
                                                            : hslToRgba(polygonColor, 0.08), // 8% opacity when not selected
                                                    }}
                                                >
                                                    <div className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                                                        Zone Ref: {zoneRef}
                                                    </div>
                                                    {polygon.zoneName && (
                                                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                                            {polygon.zoneName}
                                                        </div>
                                                    )}
                                                    {polygon.zoningCode && (
                                                        <div className="text-xs text-gray-500 dark:text-gray-500 mb-1">
                                                            Code: {polygon.zoningCode}
                                                        </div>
                                                    )}
                                                    {polygon.barangay && (
                                                        <div className="text-xs text-gray-500 dark:text-gray-500">
                                                            Barangay: {polygon.barangay}
                                                        </div>
                                                    )}
                                                    {polygon.areaSqm && (
                                                        <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                                            Area: {polygon.areaSqm.toLocaleString()} m²
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Side - Map */}
                        <div className="flex-1 flex flex-col bg-white dark:bg-dark-surface min-w-0 shadow-lg rounded-lg overflow-hidden min-h-[400px] lg:min-h-0">
                            <div className="flex-1 relative">
                                <MapContainer 
                                    center={mapCenter} 
                                    zoom={mapZoom} 
                                    style={{ height: '100%', width: '100%' }}
                                    doubleClickZoom={false}
                                >
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    <MapWithDraw
                                        selectedClassification={selectedClassification}
                                        polygons={polygons}
                                        selectedPolygonId={selectedPolygonId}
                                        onPolygonCreated={handlePolygonCreated}
                                        onPolygonEdited={handlePolygonEdited}
                                        onPolygonDeleted={handlePolygonDeleted}
                                    />
                                </MapContainer>
                                {saving && (
                                    <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-[1000] bg-white dark:bg-dark-surface p-2 sm:p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 flex items-center gap-1.5 sm:gap-2">
                                        <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin text-primary" />
                                        <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">Saving...</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Classification Details Modal */}
                <ZoningClassificationDetailsModal
                    isOpen={!!viewingClassification}
                    classification={viewingClassification}
                    onClose={() => setViewingClassification(null)}
                />
            </main>
        </div>
    );
}
