import { useState, useEffect, useCallback, useRef } from 'react';
import { router } from '@inertiajs/react';
import AdminHeader from '../../../components/AdminHeader';
import Sidebar from '../../../components/Sidebar';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useLeafletGeoman } from '../../../hooks/useLeafletGeoman';
import { getZones, getZone, createZone, updateZone, deleteZone, getZoningClassifications, exportZonesGeoJson, importZonesGeoJson, importMunicipalityGeoJson, importBarangayBoundaries, getMunicipalBoundary, createMunicipalBoundary, deleteMunicipalBoundary, getBarangayBoundaries, createBarangayBoundary, updateBarangayBoundary, deleteBarangayBoundary, type Zone, type ZoningClassification } from '../../../data/services';
import { generatePolygonColor, leafletToGeoJSON, geoJSONToLeaflet, calculatePolygonArea, hslToRgba } from '../../../lib/mapUtils';
import { checkZoneOverlap } from '../../../lib/zoneOverlapDetection';
import { showSuccess, showError, showConfirm } from '../../../lib/swal';
import { Loader2, Plus, Search, X, Download, Upload, Shield } from 'lucide-react';
import booleanWithin from '@turf/boolean-within';
import intersect from '@turf/intersect';
import difference from '@turf/difference';
import bbox from '@turf/bbox';
import centroid from '@turf/centroid';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { feature, featureCollection, point } from '@turf/helpers';
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
    municipalityBoundary,
    barangayBoundaries,
    selectedBarangay,
    editMode,
    isDrawing,
    isEditing,
    onPolygonCreated,
    onPolygonEdited,
    onPolygonDeleted,
    onDrawStart,
    onDrawStop,
    onSelectZone,
    onSelectBarangay,
    onEditCancel,
    registerSaveEdit,
    mapFocusKey,
    shouldShowPopup,
}: {
    selectedZone: Zone | null;
    selectedClassification: ZoningClassification | null;
    zones: Zone[];
    municipalityBoundary: Zone | null;
    barangayBoundaries: Zone[];
    selectedBarangay: Zone | null;
    editMode: 'zoning' | 'municipal' | 'barangay';
    isDrawing: boolean;
    isEditing: boolean;
    onPolygonCreated: (layer: L.Layer) => void;
    onPolygonEdited: (layers: L.LayerGroup) => void;
    onPolygonDeleted: (layers: L.LayerGroup) => void;
    onDrawStart?: () => void;
    onDrawStop?: () => void;
    onSelectZone: (zone: Zone, startEdit?: boolean) => void;
    onSelectBarangay?: (barangay: Zone) => void;
    onEditCancel?: () => void;
    registerSaveEdit?: (saveFn: (() => void) | null) => void;
    mapFocusKey: number;
    shouldShowPopup: boolean;
}) {
    const map = useMap();
    const polygonLayersRef = useRef<Map<string, L.Layer>>(new Map());
    const layerToZoneIdRef = useRef<Map<L.Layer, string>>(new Map());
    const selectedBarangayLayerRef = useRef<L.Layer | null>(null);
    const viewportBoundsRef = useRef<L.LatLngBounds | null>(null);
    const renderTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const originalGeometryRef = useRef<GeoJSON.Polygon | GeoJSON.MultiPolygon | null>(null);
    const editWasSavedRef = useRef(false);
    const zoneClickedRef = useRef(false); // Tracks zone-layer clicks to prevent barangay auto-selection

    // Helper function to ensure polygon rings are closed
    const ensureClosedPolygon = (geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon): GeoJSON.Polygon | GeoJSON.MultiPolygon => {
        if (geometry.type === 'Polygon') {
            if (!Array.isArray(geometry.coordinates)) {
                return geometry;
            }
            const closedCoordinates = geometry.coordinates.map((ring) => {
                if (!Array.isArray(ring) || ring.length === 0) {
                    return ring;
                }
                const first = ring[0];
                const last = ring[ring.length - 1];
                if (!Array.isArray(first) || !Array.isArray(last)) {
                    return ring;
                }
                if (first[0] === last[0] && first[1] === last[1]) {
                    return ring;
                }
                return [...ring, [first[0], first[1]]];
            });
            return { type: 'Polygon', coordinates: closedCoordinates };
        } else {
            if (!Array.isArray(geometry.coordinates)) {
                return geometry;
            }
            const closedCoordinates = geometry.coordinates.map((polygon) => {
                if (!Array.isArray(polygon)) {
                    return polygon;
                }
                return polygon.map((ring) => {
                    if (!Array.isArray(ring) || ring.length === 0) {
                        return ring;
                    }
                    const first = ring[0];
                    const last = ring[ring.length - 1];
                    if (!Array.isArray(first) || !Array.isArray(last)) {
                        return ring;
                    }
                    if (first[0] === last[0] && first[1] === last[1]) {
                        return ring;
                    }
                    return [...ring, [first[0], first[1]]];
                });
            });
            return { type: 'MultiPolygon', coordinates: closedCoordinates };
        }
    };

    // Get the color for the selected classification or zone
    const drawColor = selectedClassification?.color || selectedZone?.color || generatePolygonColor(selectedClassification?.code || selectedZone?.code || 'UNKNOWN');

    const { featureGroup } = useLeafletGeoman({
        enabled: !!selectedClassification || isEditing || isDrawing,
        drawColor,
        onDrawCreated: (layer) => {
            if (isDrawing || !!selectedClassification) {
                // Remove layer immediately (managed by parent state)
                if (map && map.hasLayer(layer)) {
                    map.removeLayer(layer);
                }
                onPolygonCreated(layer);
            }
        },
        onDrawDeleted: (layers) => {
            onPolygonDeleted(layers);
        },
        onDrawStart,
        onDrawStop,
        onDrawEdited: (layers) => {
            onPolygonEdited(layers);
        }
    });

    // Helper function to check if a zone's geometry intersects with viewport bounds
    // Uses expanded bounds to be more lenient and prevent zones from disappearing
    const isZoneInViewport = (zone: Zone, bounds: L.LatLngBounds): boolean => {
        if (!zone.geometry) {
            return false;
        }

        try {
            // Get bounding box of the zone geometry
            const zoneBbox = bbox(zone.geometry);
            const zoneBounds = L.latLngBounds(
                [zoneBbox[1], zoneBbox[0]], // SW
                [zoneBbox[3], zoneBbox[2]]  // NE
            );

            // Expand viewport bounds by 20% to be more lenient
            // This prevents zones from disappearing when they're just outside the viewport
            const sw = bounds.getSouthWest();
            const ne = bounds.getNorthEast();
            const latDiff = (ne.lat - sw.lat) * 0.2;
            const lngDiff = (ne.lng - sw.lng) * 0.2;
            
            const expandedBounds = L.latLngBounds(
                [sw.lat - latDiff, sw.lng - lngDiff],
                [ne.lat + latDiff, ne.lng + lngDiff]
            );

            // Check if zone bounds intersect with expanded viewport bounds
            return expandedBounds.intersects(zoneBounds);
        } catch (error) {
            // If bbox calculation fails, include the zone to be safe
            return true;
        }
    };

    // Render existing zones on map with viewport-based optimization
    useEffect(() => {
        if (!map) {
            return;
        }

        // Clear any pending render timeout
        if (renderTimeoutRef.current) {
            clearTimeout(renderTimeoutRef.current);
        }

        // Debounce rendering on map move/zoom
        const renderZones = () => {
            const currentBounds = map.getBounds();
            const currentZoom = map.getZoom();
            viewportBoundsRef.current = currentBounds;

            // Clear existing layers and remove all event handlers
            // But preserve the layer being edited to maintain edit handles
            polygonLayersRef.current.forEach((layer, zoneId) => {
                // Don't remove the layer if it's currently being edited
                if (isEditing && selectedZone && zoneId === selectedZone.id) {
                    // Keep this layer - just update event handlers if needed
                    return;
                }
                
                if (map.hasLayer(layer)) {
                    // Remove all event handlers before removing layer
                    if (layer instanceof L.LayerGroup) {
                        layer.eachLayer((sublayer) => {
                            if (sublayer instanceof L.Polygon) {
                                sublayer.off('mouseover');
                                sublayer.off('mouseout');
                            }
                        });
                    } else if (layer instanceof L.Polygon) {
                        layer.off('mouseover');
                        layer.off('mouseout');
                    }
                    map.removeLayer(layer);
                }
            });
            
            // Only clear non-edited layers from the refs
            if (!isEditing || !selectedZone) {
                polygonLayersRef.current.clear();
                layerToZoneIdRef.current.clear();
            } else {
                // Keep the edited zone's layer reference
                const editedLayer = polygonLayersRef.current.get(selectedZone.id);
                const newRefs = new Map<string, L.Layer>();
                const newLayerToZoneId = new Map<L.Layer, string>();
                
                if (editedLayer) {
                    newRefs.set(selectedZone.id, editedLayer);
                    if (editedLayer instanceof L.LayerGroup) {
                        editedLayer.eachLayer((sublayer) => {
                            newLayerToZoneId.set(sublayer, selectedZone.id);
                        });
                    } else {
                        newLayerToZoneId.set(editedLayer, selectedZone.id);
                    }
                }
                
                polygonLayersRef.current = newRefs;
                layerToZoneIdRef.current = newLayerToZoneId;
            }

            // Always include municipality boundary if it exists
            const zonesToCheck = [
                ...zones,
                ...(municipalityBoundary ? [municipalityBoundary] : []),
            ];

            // Filter zones based on viewport and edit mode
            let zonesToRender: Zone[] = [];

            if (editMode === 'municipal') {
                // In municipal mode, only show municipality boundary
                zonesToRender = municipalityBoundary ? [municipalityBoundary] : [];
            } else if (editMode === 'barangay') {
                // In barangay mode, always show all barangay boundaries
                zonesToRender = barangayBoundaries;
            } else {
                // In zoning mode
                // Always include municipality boundary
                if (municipalityBoundary) {
                    zonesToRender.push(municipalityBoundary);
                }

                // Filter zoning zones - show all zones at all zoom levels for better UX
                const zoningZones = zones.filter((zone) => {
                    const isBoundary = zone.boundary_type === 'municipal' || zone.boundary_type === 'barangay';
                    return !isBoundary;
                });

                // Always show all zoning zones with geometry
                // Viewport filtering was causing zones to disappear when zooming in
                zonesToRender.push(...zoningZones.filter(zone => zone.geometry));

                // Include barangay boundaries - always show all for better UX
                // Only show selected barangay if zoom is very low (<10)
                if (currentZoom < 10 && selectedBarangay) {
                    // At very low zoom, only show selected barangay
                    zonesToRender.push(selectedBarangay);
                } else {
                    // At normal zoom levels, show all barangays
                    zonesToRender.push(...barangayBoundaries);
                }
            }

            // Combine all zones including boundaries
            const allZonesToRender = zonesToRender;

        // Add all active zones with geometry
        allZonesToRender.forEach((zone) => {
            if (!zone.geometry) {
                return;
            }

            // Skip re-rendering the zone that's currently being edited
            // to preserve edit handles, but only if the layer already exists
            if (isEditing && selectedZone && zone.id === selectedZone.id) {
                const existingLayer = polygonLayersRef.current.get(zone.id);
                if (existingLayer && map.hasLayer(existingLayer)) {
                    // Layer exists and is on map, skip re-rendering to preserve edit handles
                    return;
                }
                // Layer doesn't exist yet, continue to render it
            }

            try {
                const isBoundary = zone.boundary_type === 'municipal' || zone.boundary_type === 'barangay';
                const isMunicipality = zone.boundary_type === 'municipal';
                const isBarangay = zone.boundary_type === 'barangay';
                
                // Don't highlight selected barangay here - it's handled separately
                // All barangays render in default gray, selected one will be overlaid separately
                const layerColor = isBoundary 
                    ? (isMunicipality ? '#000000' : '#808080')
                    : (zone.color || generatePolygonColor(zone.code));
                const fillOpacity = isBoundary ? 0 : 0.3;
                const weight = isBoundary ? 3 : 2;
                const opacity = 0.8;

                // Make boundaries interactive when in boundary editing mode
                // In zoning mode, make barangays non-interactive so they don't block zone clicks
                // Barangay selection will be handled via map click handler
                const isCurrentEditZone = isEditing && selectedZone && zone.id === selectedZone.id;
                const isInteractive = (isCurrentEditZone || (!isDrawing && !isEditing)) && (!isBoundary || (isBoundary && (
                    (isMunicipality && editMode === 'municipal') ||
                    (isBarangay && editMode === 'barangay')
                )));

                const layer = geoJSONToLeaflet(zone.geometry, {
                    color: layerColor,
                    fillColor: layerColor,
                    fillOpacity: fillOpacity,
                    weight: weight,
                    opacity: opacity,
                    dashArray: isBoundary ? '5, 10' : undefined,
                    interactive: isInteractive,
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
                            <div class="mb-2 pb-2 border-gray-100 dark:border-gray-700 border-b">
                                <span class="block mb-0.5 font-bold text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">Zone Label</span>
                                <span class="block font-bold text-gray-700 dark:text-gray-300 text-sm truncate" title="${zone.label || 'N/A'}">
                                    ${zone.label || 'No Label Set'}
                                </span>
                            </div>
                            <div class="mb-3">
                                <span class="block mb-0.5 font-bold text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider">Classification</span>
                                <span class="block mb-0.5 font-semibold text-primary dark:text-blue-400 text-xs">${zone.code}</span>
                                <span class="block text-[11px] text-gray-600 dark:text-gray-300 line-clamp-2">${zone.name}</span>
                            </div>
                            <button 
                                class="flex justify-center items-center gap-1.5 bg-primary hover:bg-primary-hover shadow-sm py-2 rounded-md w-full font-bold text-[11px] text-white transition-all map-edit-zone-btn"
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

                    // In boundary edit modes, clicking a boundary selects it for editing
                    if (isBoundary && (
                        (isMunicipality && editMode === 'municipal') ||
                        (isBarangay && editMode === 'barangay')
                    )) {
                        const addBoundaryClickHandler = (l: L.Layer) => {
                            if (l instanceof L.Polygon) {
                                l.on('click', () => onSelectZone(zone, false));
                            }
                        };
                        if (layer instanceof L.LayerGroup) {
                            layer.eachLayer(addBoundaryClickHandler);
                        } else {
                            addBoundaryClickHandler(layer);
                        }
                    }

                    // Add popup and edit button for land use zones (not boundaries)
                    if (!isBoundary) {
                        const setupLandUseZone = (polyLayer: L.Polygon) => {
                            // Stop propagation so the map-level click handler doesn't fire and accidentally select a barangay
                            polyLayer.on('click', (e: L.LeafletMouseEvent) => {
                                L.DomEvent.stopPropagation(e);
                            });
                            
                            // Double-click to select the underlying barangay (bypassing the click block)
                            polyLayer.on('dblclick', (e: L.LeafletMouseEvent) => {
                                if (editMode !== 'zoning' || !onSelectBarangay || isDrawing || isEditing) return;
                                
                                const clickPoint = point([e.latlng.lng, e.latlng.lat]);
                                for (const barangay of barangayBoundaries) {
                                    if (!barangay.geometry) continue;
                                    try {
                                        const closedGeometry = ensureClosedPolygon(barangay.geometry);
                                        const featureObj = closedGeometry.type === 'Polygon'
                                            ? feature(closedGeometry)
                                            : feature(closedGeometry);
                                        if (booleanPointInPolygon(clickPoint, featureObj as any)) {
                                            onSelectBarangay(barangay);
                                            break;
                                        }
                                    } catch (err) {}
                                }
                            });

                            polyLayer.bindPopup(popup);
                            polyLayer.on('popupopen', (e) => {
                                const popupContainer = e.popup.getElement();
                                if (popupContainer) {
                                    const btn = popupContainer.querySelector('.map-edit-zone-btn');
                                    if (btn) {
                                        btn.addEventListener('click', (ev) => {
                                            ev.preventDefault();
                                            onSelectZone(zone, true);
                                            polyLayer.closePopup();
                                        });
                                    }
                                }
                            });
                        };

                        if (layer instanceof L.LayerGroup) {
                            layer.eachLayer((sublayer) => {
                                if (sublayer instanceof L.Polygon) {
                                    setupLandUseZone(sublayer);
                                }
                            });
                        } else if (layer instanceof L.Polygon) {
                            setupLandUseZone(layer);
                        }
                    }
                }
            } catch (error) {
                console.error(`Error rendering zone ${zone.code}:`, error);
            }
        });
        };

        // Helper to re-enable edit mode after rendering
        const reEnableEditMode = () => {
            if (isEditing && selectedZone && featureGroup) {
                const layer = polygonLayersRef.current.get(selectedZone.id);
                if (layer) {
                    // Clear all stale layers from featureGroup — only the selected zone should be editable
                    featureGroup.clearLayers();

                    // Add only the selected zone's layer
                    if (layer instanceof L.LayerGroup) {
                        layer.eachLayer((sublayer) => {
                            featureGroup.addLayer(sublayer);
                        });
                    } else {
                        featureGroup.addLayer(layer);
                    }

                    // Enable edit mode ONLY on featureGroup sublayers (not global)
                    setTimeout(() => {
                        featureGroup.eachLayer((l: any) => {
                            if (l.pm) {
                                l.pm.enable();
                            }
                        });
                    }, 200); // Delay to ensure layers are fully rendered
                }
            }
        };

        // Initial render
        renderZones();
        reEnableEditMode();

        // Register save function so parent can trigger save from its Save button
        if (registerSaveEdit && isEditing && featureGroup) {
            registerSaveEdit(() => {
                // Disable per-layer edit mode on featureGroup sublayers
                featureGroup.eachLayer((l: any) => {
                    if (l.pm) l.pm.disable();
                });
                // Collect edited layers and trigger onPolygonEdited
                const layers = new L.LayerGroup();
                featureGroup.eachLayer((l) => layers.addLayer(l));
                onPolygonEdited(layers);
            });
        } else if (registerSaveEdit && !isEditing) {
            registerSaveEdit(null);
        }

        // Listen to map move/zoom events for viewport-based rendering
        const handleMapMove = () => {
            if (renderTimeoutRef.current) {
                clearTimeout(renderTimeoutRef.current);
            }
            renderTimeoutRef.current = setTimeout(() => {
                renderZones();
                reEnableEditMode(); // Re-enable edit mode after re-rendering
            }, 150); // Debounce by 150ms
        };

        map.on('moveend', handleMapMove);
        map.on('zoomend', handleMapMove);

        // Map click handler for barangay selection in zoning mode
        // Only triggers if click didn't hit a zone (zones handle their own clicks)
        const handleMapClick = (e: L.LeafletMouseEvent) => {
            if (editMode !== 'zoning' || !onSelectBarangay || isDrawing || isEditing) {
                return;
            }

            // Small delay to let any popup open before checking
            setTimeout(() => {
                // Check if click point is within any barangay boundary
                const clickPoint = point([e.latlng.lng, e.latlng.lat]);
                
                for (const barangay of barangayBoundaries) {
                    if (!barangay.geometry) continue;

                    try {
                        const closedGeometry = ensureClosedPolygon(barangay.geometry);
                        const featureObj = closedGeometry.type === 'Polygon'
                            ? feature(closedGeometry)
                            : feature(closedGeometry);
                        
                        if (booleanPointInPolygon(clickPoint, featureObj as any)) {
                            // Check if click was on a zone (not a barangay boundary)
                            let clickedOnZone = false;
                            for (const zone of zones) {
                                if (zone.boundary_type === 'barangay' || zone.boundary_type === 'municipal') {
                                    continue;
                                }
                                if (!zone.geometry) continue;
                                
                                try {
                                    const closedZoneGeometry = ensureClosedPolygon(zone.geometry);
                                    const zoneFeature = closedZoneGeometry.type === 'Polygon'
                                        ? feature(closedZoneGeometry)
                                        : feature(closedZoneGeometry);
                                    
                                    if (booleanPointInPolygon(clickPoint, zoneFeature as any)) {
                                        clickedOnZone = true;
                                        break;
                                    }
                                } catch (error) {
                                    continue;
                                }
                            }
                            
                            // Only select barangay if click wasn't on a zone
                            if (!clickedOnZone) {
                                onSelectBarangay(barangay);
                            }
                            break;
                        }
                    } catch (error) {
                        // Ignore errors for this barangay
                        continue;
                    }
                }
            }, 50); // Small delay to let zone clicks process first
        };

        map.on('click', handleMapClick);

        // Cleanup
        return () => {
            if (renderTimeoutRef.current) {
                clearTimeout(renderTimeoutRef.current);
            }
            map.off('moveend', handleMapMove);
            map.off('zoomend', handleMapMove);
            map.off('click', handleMapClick);
            polygonLayersRef.current.forEach((layer) => {
                if (map.hasLayer(layer)) {
                    map.removeLayer(layer);
                }
            });
            polygonLayersRef.current.clear();
            layerToZoneIdRef.current.clear();
        };
        }, [map, zones, municipalityBoundary, barangayBoundaries, editMode, selectedZone, selectedClassification, drawColor, onSelectZone, onSelectBarangay, shouldShowPopup, selectedBarangay, isEditing, featureGroup]);

    // Separate effect for selected barangay highlight - independent of classification
    useEffect(() => {
        if (!map || !selectedBarangay || !selectedBarangay.geometry || editMode !== 'zoning') {
            // Remove highlight layer if no barangay is selected or not in zoning mode
            if (selectedBarangayLayerRef.current) {
                map.removeLayer(selectedBarangayLayerRef.current);
                selectedBarangayLayerRef.current = null;
            }
            return;
        }

        // Remove previous highlight layer if it exists
        if (selectedBarangayLayerRef.current) {
            map.removeLayer(selectedBarangayLayerRef.current);
            selectedBarangayLayerRef.current = null;
        }

        // Calculate bounds directly from GeoJSON geometry first
        try {
            const geometry = selectedBarangay.geometry;
            let bounds: L.LatLngBounds | null = null;

            // Calculate bounds from GeoJSON coordinates
            if (geometry.type === 'Polygon' && geometry.coordinates && geometry.coordinates.length > 0) {
                const outerRing = geometry.coordinates[0];
                const latlngs = outerRing.map((coord: number[]) => L.latLng(coord[1], coord[0]));
                bounds = L.latLngBounds(latlngs);
            } else if (geometry.type === 'MultiPolygon' && geometry.coordinates && geometry.coordinates.length > 0) {
                const allLatLngs: L.LatLng[] = [];
                geometry.coordinates.forEach((polygon: number[][][]) => {
                    if (polygon && polygon.length > 0) {
                        const outerRing = polygon[0];
                        outerRing.forEach((coord: number[]) => {
                            allLatLngs.push(L.latLng(coord[1], coord[0]));
                        });
                    }
                });
                if (allLatLngs.length > 0) {
                    bounds = L.latLngBounds(allLatLngs);
                }
            }

            // Fit map to bounds immediately
            if (bounds && bounds.isValid && bounds.isValid()) {
                        map.fitBounds(bounds, {
                            padding: [50, 50],
                            maxZoom: 20,
                        });
            }
        } catch (error) {
            // Silently fail - bounds calculation is optional for map navigation
        }

            // Create green highlight layer for selected barangay
            // Set interactive to false so clicks pass through to zones underneath
            try {
                const highlightLayer = geoJSONToLeaflet(selectedBarangay.geometry, {
                    color: '#22c55e',
                    fillColor: '#22c55e',
                    fillOpacity: 0.1,
                    weight: 4,
                    opacity: 1,
                    dashArray: '5, 10',
                    interactive: false, // Non-interactive so clicks pass through to zones
                });

            if (highlightLayer) {
                // Add to map
                if (highlightLayer instanceof L.LayerGroup) {
                    highlightLayer.addTo(map);
                } else {
                    highlightLayer.addTo(map);
                }

                // Add hover effect
                const addHoverEffect = (l: L.Layer) => {
                    if (l instanceof L.Polygon) {
                        l.on('mouseover', () => {
                            l.setStyle({ 
                                weight: 5, 
                                color: '#16a34a',
                                fillOpacity: 0.2,
                                opacity: 1
                            });
                        });
                        l.on('mouseout', () => {
                            l.setStyle({ 
                                weight: 4, 
                                color: '#22c55e',
                                fillOpacity: 0.1,
                                opacity: 1
                            });
                        });
                    }
                };

                if (highlightLayer instanceof L.LayerGroup) {
                    highlightLayer.eachLayer(addHoverEffect);
                } else if (highlightLayer instanceof L.Polygon) {
                    addHoverEffect(highlightLayer);
                }

                selectedBarangayLayerRef.current = highlightLayer;
            }
        } catch (error) {
            console.error('Error rendering selected barangay highlight:', error);
        }

        // Cleanup
        return () => {
            if (selectedBarangayLayerRef.current) {
                map.removeLayer(selectedBarangayLayerRef.current);
                selectedBarangayLayerRef.current = null;
            }
        };
    }, [map, selectedBarangay, editMode]);

    // Highlight selected boundary layer (municipal / barangay)
    const prevSelectedBoundaryRef = useRef<{ id: string; isMunicipal: boolean } | null>(null);
    useEffect(() => {
        const applyStyle = (id: string, isMunicipal: boolean, selected: boolean) => {
            const layer = polygonLayersRef.current.get(id);
            if (!layer) return;
            const applyToPolygon = (l: L.Layer) => {
                if (!(l instanceof L.Polygon)) return;
                if (selected) {
                    l.setStyle({ color: '#2563eb', weight: 4, opacity: 1, dashArray: undefined });
                } else {
                    l.setStyle({
                        color: isMunicipal ? '#000000' : '#808080',
                        weight: 3,
                        opacity: 0.8,
                        dashArray: '5, 10',
                    });
                }
            };
            if (layer instanceof L.LayerGroup) {
                layer.eachLayer(applyToPolygon);
            } else {
                applyToPolygon(layer);
            }
        };

        const isMunicipal = selectedZone?.boundary_type === 'municipal';
        const isBarangay = selectedZone?.boundary_type === 'barangay';
        const inBoundaryMode = editMode === 'municipal' || editMode === 'barangay';
        const isBoundary = isMunicipal || isBarangay;

        // Always reset previous highlight first
        const prev = prevSelectedBoundaryRef.current;
        if (prev && prev.id !== selectedZone?.id) {
            applyStyle(prev.id, prev.isMunicipal, false);
        }

        // Only highlight if in the matching boundary edit mode
        if (selectedZone && isBoundary && inBoundaryMode) {
            applyStyle(selectedZone.id, isMunicipal, true);
            prevSelectedBoundaryRef.current = { id: selectedZone.id, isMunicipal };
        } else {
            prevSelectedBoundaryRef.current = null;
        }
    }, [selectedZone, editMode]);

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
                        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 22 });
                    }
                }
            } else if (layer instanceof L.Polyline || layer instanceof L.Polygon) {
                const bounds = (layer as L.Polyline).getBounds();
                if (bounds.isValid()) {
                    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 20 });
                }
            } else if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
                map.setView(layer.getLatLng(), 18);
            }
        }
    }, [map, selectedZone, mapFocusKey, shouldShowPopup]);

    // Store original geometry when entering edit mode
    useEffect(() => {
        if (!map || !featureGroup || !isEditing || !selectedZone) {
            return;
        }

        if (selectedZone.geometry) {
            originalGeometryRef.current = selectedZone.geometry;
        }

        return () => {
            originalGeometryRef.current = null;
        };
    }, [map, featureGroup, isEditing, selectedZone]);

    // Fit map to municipality boundary when it loads
    useEffect(() => {
        if (!map || !municipalityBoundary || !municipalityBoundary.geometry) {
            return;
        }

        try {
            // Helper to ensure polygon is closed
            const ensureClosed = (geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon): GeoJSON.Polygon | GeoJSON.MultiPolygon => {
                if (geometry.type === 'Polygon') {
                    if (!Array.isArray(geometry.coordinates)) {
                        return geometry;
                    }
                    const closedCoordinates = geometry.coordinates.map((ring) => {
                        if (!Array.isArray(ring) || ring.length === 0) {
                            return ring;
                        }
                        const first = ring[0];
                        const last = ring[ring.length - 1];
                        if (!Array.isArray(first) || !Array.isArray(last)) {
                            return ring;
                        }
                        if (first[0] === last[0] && first[1] === last[1]) {
                            return ring;
                        }
                        return [...ring, [first[0], first[1]]];
                    });
                    return { type: 'Polygon', coordinates: closedCoordinates };
                } else {
                    if (!Array.isArray(geometry.coordinates)) {
                        return geometry;
                    }
                    const closedCoordinates = geometry.coordinates.map((polygon) => {
                        if (!Array.isArray(polygon)) {
                            return polygon;
                        }
                        return polygon.map((ring) => {
                            if (!Array.isArray(ring) || ring.length === 0) {
                                return ring;
                            }
                            const first = ring[0];
                            const last = ring[ring.length - 1];
                            if (!Array.isArray(first) || !Array.isArray(last)) {
                                return ring;
                            }
                            if (first[0] === last[0] && first[1] === last[1]) {
                                return ring;
                            }
                            return [...ring, [first[0], first[1]]];
                        });
                    });
                    return { type: 'MultiPolygon', coordinates: closedCoordinates };
                }
            };

            const closedGeometry = ensureClosed(municipalityBoundary.geometry);
            const featureObj = feature(closedGeometry);
            const bounds = bbox(featureObj);
            const leafletBounds = L.latLngBounds(
                [bounds[1], bounds[0]], // Southwest
                [bounds[3], bounds[2]]  // Northeast
            );
            
            if (leafletBounds.isValid()) {
                map.fitBounds(leafletBounds, { padding: [50, 50], maxZoom: 18 });
            }
        } catch (error) {
            console.error('Error fitting map to municipality boundary:', error);
        }
    }, [map, municipalityBoundary]);

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
    const saveEditFnRef = useRef<(() => void) | null>(null);
    const [showZoneDetailsPanel, setShowZoneDetailsPanel] = useState(false);
    const [mapFocusKey, setMapFocusKey] = useState(0);
    const [shouldShowPopup, setShouldShowPopup] = useState(false);
    const [municipalityBoundary, setMunicipalityBoundary] = useState<Zone | null>(null);
    const [barangayBoundaries, setBarangayBoundaries] = useState<Zone[]>([]);
    const [selectedBarangay, setSelectedBarangay] = useState<Zone | null>(null);
    const [editMode, setEditMode] = useState<'zoning' | 'municipal' | 'barangay'>('zoning');
    const [mapCenter, setMapCenter] = useState<[number, number]>([14.5995, 120.9842]); // Default to Manila
    const [barangayNameDialog, setBarangayNameDialog] = useState<{
        open: boolean;
        geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon | null;
        name: string;
    }>({ open: false, geometry: null, name: '' });
    const mapZoom = 18;

    // Load zones and classifications on mount
    useEffect(() => {
        loadZones();
        loadAllZonesForMap();
        loadClassifications();
        loadMunicipalBoundary();
        loadBarangayBoundaries();
    }, []);

    // Helper function to ensure polygon rings are closed
    const ensureClosedPolygon = (geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon): GeoJSON.Polygon | GeoJSON.MultiPolygon => {
        if (geometry.type === 'Polygon') {
            if (!Array.isArray(geometry.coordinates)) {
                return geometry;
            }
            const closedCoordinates = geometry.coordinates.map((ring) => {
                if (!Array.isArray(ring) || ring.length === 0) {
                    return ring;
                }
                const first = ring[0];
                const last = ring[ring.length - 1];
                if (!Array.isArray(first) || !Array.isArray(last)) {
                    return ring;
                }
                if (first[0] === last[0] && first[1] === last[1]) {
                    return ring;
                }
                return [...ring, [first[0], first[1]]];
            });
            return {
                type: 'Polygon',
                coordinates: closedCoordinates,
            };
        } else {
            if (!Array.isArray(geometry.coordinates)) {
                return geometry;
            }
            const closedCoordinates = geometry.coordinates.map((polygon) => {
                if (!Array.isArray(polygon)) {
                    return polygon;
                }
                return polygon.map((ring) => {
                    if (!Array.isArray(ring) || ring.length === 0) {
                        return ring;
                    }
                    const first = ring[0];
                    const last = ring[ring.length - 1];
                    if (!Array.isArray(first) || !Array.isArray(last)) {
                        return ring;
                    }
                    if (first[0] === last[0] && first[1] === last[1]) {
                        return ring;
                    }
                    return [...ring, [first[0], first[1]]];
                });
            });
            return {
                type: 'MultiPolygon',
                coordinates: closedCoordinates,
            };
        }
    };

    // Load municipal boundary
    const loadMunicipalBoundary = async () => {
        try {
            const boundary = await getMunicipalBoundary();
            setMunicipalityBoundary(boundary || null);
            
            // Calculate center from municipality boundary if available
            if (boundary && boundary.geometry) {
                try {
                    const closedGeometry = ensureClosedPolygon(boundary.geometry);
                    const featureObj = closedGeometry.type === 'Polygon'
                        ? feature(closedGeometry)
                        : feature(closedGeometry);
                    const centroidPoint = centroid(featureObj);
                    setMapCenter([centroidPoint.geometry.coordinates[1], centroidPoint.geometry.coordinates[0]]);
                } catch (error) {
                    console.error('Error calculating municipality boundary center:', error);
                }
            }
        } catch (error) {
            console.error('Failed to load municipal boundary:', error);
        }
    };

    // Load barangay boundaries
    const loadBarangayBoundaries = async () => {
        try {
            const boundaries = await getBarangayBoundaries();
            setBarangayBoundaries(boundaries || []);
        } catch (error) {
            console.error('Failed to load barangay boundaries:', error);
        }
    };

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
            // Classifications are already filtered at the backend
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
                // Combine all zones including boundaries
                const allZonesList = [...result.zones];
                if (municipalityBoundary && !allZonesList.find(z => z.id === municipalityBoundary.id)) {
                    allZonesList.push(municipalityBoundary);
                }
                barangayBoundaries.forEach(barangay => {
                    if (!allZonesList.find(z => z.id === barangay.id)) {
                        allZonesList.push(barangay);
                    }
                });
                setAllZones(allZonesList);
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
            setSaving(true);
            try {
                const geometry = leafletToGeoJSON(layer);
                if (!geometry) {
                    throw new Error('Failed to convert layer to GeoJSON');
                }

                let finalGeometry = geometry as GeoJSON.Polygon | GeoJSON.MultiPolygon;

                // Handle different edit modes
                if (editMode === 'municipal') {
                    // Save municipal boundary
                    const boundary = await createMunicipalBoundary({
                        geometry: finalGeometry,
                        label: 'Municipality Boundary',
                    });
                    setMunicipalityBoundary(boundary as Zone);
                    await loadAllZonesForMap();
                    await loadMunicipalBoundary();
                    showSuccess('Municipal boundary saved successfully');
                    setIsDrawing(false);
                    return;
                } else if (editMode === 'barangay') {
                    // Show custom dialog instead of native prompt
                    setSaving(false);
                    setBarangayNameDialog({ open: true, geometry: finalGeometry, name: '' });
                    return;
                }

                // Zoning zone creation (existing logic)
                if (!selectedClassification) {
                    return;
                }

                // Barangay selection is required for zoning zones
                if (!selectedBarangay || !selectedBarangay.geometry) {
                    showError('Please select a barangay before drawing a zone.');
                    setSaving(false);
                    return;
                }

                // Spatial constraint: Adjust to be within selected barangay boundary
                if (selectedBarangay.geometry) {
                    const zoneFeature = feature(geometry);
                    const boundaryFeature = feature(selectedBarangay.geometry);

                    const intersection = intersect(featureCollection([zoneFeature as any, boundaryFeature as any]));

                    if (!intersection) {
                        showError(`The drawn zone is completely outside the selected barangay boundary (${selectedBarangay.label || 'barangay'}).`);
                        setSaving(false);
                        return;
                    }

                    finalGeometry = intersection.geometry as GeoJSON.Polygon | GeoJSON.MultiPolygon;
                }

                // Auto-trim overlaps with existing zones
                const zonesWithGeometry = allZones.filter((z) => z.geometry && z.boundary_type !== 'municipal' && z.boundary_type !== 'barangay');

                if (zonesWithGeometry.length > 0) {
                    for (const existingZone of zonesWithGeometry) {
                        if (!existingZone.geometry) continue;

                        const currentFeature = feature(finalGeometry);
                        const existingFeature = feature(existingZone.geometry);

                        try {
                            if (booleanWithin(currentFeature, existingFeature)) {
                                // New zone is completely inside the existing zone
                                // We punch a hole in the existing zone and keep the new zone intact
                                const existingHoled = difference(featureCollection([existingFeature, currentFeature] as any));
                                if (existingHoled && existingHoled.geometry) {
                                    await updateZone(existingZone.id, { geometry: existingHoled.geometry });
                                }
                                continue;
                            }

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
            } catch (error) {
                console.error('Error creating zone:', error);
                const errorMessage = error instanceof Error ? error.message : 'Failed to create zone';
                showError(errorMessage);
            } finally {
                setSaving(false);
            }
        },
        [selectedClassification, allZones, editMode, municipalityBoundary, selectedBarangay]
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
                console.warn('handlePolygonEdited: No selected zone or geometry');
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
                    console.warn('handlePolygonEdited: No edited layers found');
                    setSaving(false);
                    return;
                }

                // Convert edited layers to geometry
                const geometries: GeoJSON.Polygon[] = [];
                for (const layer of editedLayers) {
                    try {
                        const geometry = leafletToGeoJSON(layer);
                        if (geometry) {
                            if (geometry.type === 'Polygon') {
                                geometries.push(geometry);
                            } else if (geometry.type === 'MultiPolygon') {
                                // Extract individual polygons from MultiPolygon
                                const multiPoly = geometry as GeoJSON.MultiPolygon;
                                multiPoly.coordinates.forEach((coords) => {
                                    geometries.push({
                                        type: 'Polygon',
                                        coordinates: coords,
                                    });
                                });
                            } else {
                                console.warn('handlePolygonEdited: Unsupported geometry type:', geometry.type);
                            }
                        } else {
                            console.warn('handlePolygonEdited: Failed to convert layer to GeoJSON');
                        }
                    } catch (err) {
                        console.error('handlePolygonEdited: Error converting layer to GeoJSON:', err, layer);
                    }
                }

                if (geometries.length === 0) {
                    console.error('handlePolygonEdited: No valid geometries found after conversion');
                    showError('Failed to process edited geometry. Please try again.');
                    setSaving(false);
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

                // Handle boundary editing
                if (selectedZone.boundary_type === 'municipal') {
                    const boundary = await createMunicipalBoundary({
                        geometry: finalGeometry,
                        label: selectedZone.label || 'Municipality Boundary',
                    });
                    setMunicipalityBoundary(boundary as Zone);
                    await loadAllZonesForMap();
                    await loadMunicipalBoundary();
                    showSuccess('Municipal boundary updated successfully');
                    setIsEditing(false);
                    setSelectedZone(null);
                    return;
                } else if (selectedZone.boundary_type === 'barangay') {
                    const boundary = await updateBarangayBoundary(selectedZone.id, {
                        geometry: finalGeometry,
                    });
                    setBarangayBoundaries((prev) =>
                        prev.map((b) => (b.id === boundary.id ? boundary as Zone : b))
                    );
                    await loadAllZonesForMap();
                    await loadBarangayBoundaries();
                    showSuccess('Barangay boundary updated successfully');
                    setIsEditing(false);
                    setSelectedZone(null);
                    return;
                }

                // Zoning zone editing (existing logic)
                // Spatial constraint: Adjust to be within selected barangay boundary
                if (selectedBarangay && selectedBarangay.geometry) {
                    const zoneFeature = feature(finalGeometry);
                    const boundaryFeature = feature(selectedBarangay.geometry);

                    const intersection = intersect(featureCollection([zoneFeature as any, boundaryFeature as any]));

                    if (!intersection) {
                        showError(`The edited zone is completely outside the selected barangay boundary (${selectedBarangay.label || 'barangay'}).`);
                        setSaving(false);
                        return;
                    }

                    finalGeometry = intersection.geometry as GeoJSON.Polygon | GeoJSON.MultiPolygon;
                }

                // Auto-trim overlaps with other existing zones
                const otherZonesWithGeometry = allZones.filter(
                    (z) => z.geometry && z.id !== selectedZone.id && z.boundary_type !== 'municipal' && z.boundary_type !== 'barangay'
                );

                if (otherZonesWithGeometry.length > 0) {
                    for (const existingZone of otherZonesWithGeometry) {
                        if (!existingZone.geometry) continue;

                        const currentFeature = feature(finalGeometry);
                        const existingFeature = feature(existingZone.geometry);

                        try {
                            if (booleanWithin(currentFeature, existingFeature)) {
                                // Edited zone is completely inside the existing zone
                                // We punch a hole in the existing zone and keep the edited zone intact
                                const existingHoled = difference(featureCollection([existingFeature, currentFeature] as any));
                                if (existingHoled && existingHoled.geometry) {
                                    await updateZone(existingZone.id, { geometry: existingHoled.geometry });
                                }
                                continue;
                            }

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
                console.error('handlePolygonEdited: Error updating zone:', error);
                const errorMessage = error instanceof Error ? error.message : 'Failed to update zone boundaries';
                showError(errorMessage);
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
        setShowZoneDetailsPanel(false);
        setIsEditing(true);
        setIsDrawing(false);
    };

    // Boundary-mode draw: activate geoman draw tool with no zone required
    const handleDrawBoundary = () => {
        setIsDrawing(true);
        setIsEditing(false);
        setSelectedZone(null);
    };

    // Boundary-mode edit: select the boundary and enable geoman edit mode
    const handleEditBoundary = (zone: Zone) => {
        if (!zone.geometry) return;
        setSelectedZone(zone);
        setIsEditing(true);
        setIsDrawing(false);
    };

    const handleDeleteBoundary = async (zone: Zone) => {
        const label = zone.label || (zone.boundary_type === 'municipal' ? 'Municipal Boundary' : 'Barangay Boundary');
        const confirmed = await showConfirm(
            `Are you sure you want to delete "${label}"? This action cannot be undone.`,
            'Delete Boundary',
            'Yes, delete it',
            'Cancel',
            '#ef4444',
            'warning'
        );
        if (!confirmed) return;

        try {
            if (zone.boundary_type === 'municipal') {
                await deleteMunicipalBoundary();
                setMunicipalityBoundary(null);
            } else {
                await deleteBarangayBoundary(zone.id);
                setBarangayBoundaries((prev) => prev.filter((b) => b.id !== zone.id));
            }
            setSelectedZone(null);
            await loadAllZonesForMap();
            showSuccess(`${label} deleted successfully`);
        } catch (error) {
            showError('Failed to delete boundary');
            console.error(error);
        }
    };

    const handleBarangayNameConfirm = async () => {
        const { geometry, name } = barangayNameDialog;
        if (!geometry) return;
        const label = name.trim() || `Barangay ${Date.now()}`;
        setSaving(true);
        try {
            const boundary = await createBarangayBoundary({ geometry, label });
            setBarangayBoundaries((prev) => [...prev, boundary as Zone]);
            await loadAllZonesForMap();
            await loadBarangayBoundaries();
            showSuccess(`Barangay boundary "${label}" saved successfully`);
            setIsDrawing(false);
        } catch (error) {
            showError('Failed to save barangay boundary');
            console.error(error);
        } finally {
            setSaving(false);
            setBarangayNameDialog({ open: false, geometry: null, name: '' });
        }
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
        router.post('/admin/zoning/zones/import-municipality', {
            file: file
        }, {
            forceFormData: true,
            onSuccess: (page) => {
                const flashMessage = (page as { props?: { flash?: { success?: string } } })?.props?.flash?.success;
                showSuccess(flashMessage || 'Municipality boundary imported successfully.');
                loadAllZonesForMap();
                e.target.value = '';
            },
            onError: (errors) => {
                showError(Object.values(errors)[0] || 'Failed to import municipality');
                e.target.value = '';
            },
            onFinish: () => {
                setLoading(false);
            }
        });
    };

    const handleBarangayImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const confirmed = await showConfirm(
            'This will import barangay boundaries from the selected GeoJSON file. Existing barangays with the same name will be updated. Continue?',
            'Import Barangay Boundaries',
            'Yes, import',
            'Cancel'
        );

        if (!confirmed) {
            e.target.value = '';
            return;
        }

        setLoading(true);
        try {
            const result = await importBarangayBoundaries(file);
            showSuccess(result.message || 'Barangay boundaries imported successfully.');
            await loadBarangayBoundaries();
            await loadAllZonesForMap();
        } catch (error: any) {
            showError(error?.message || 'Failed to import barangay boundaries');
        } finally {
            setLoading(false);
            e.target.value = '';
        }
    };

    // Get zones/boundaries to display based on edit mode
    const getDisplayItems = () => {
        if (editMode === 'municipal') {
            // Only show municipal boundary
            return municipalityBoundary ? [municipalityBoundary] : [];
        } else if (editMode === 'barangay') {
            // Only show barangay boundaries
            return barangayBoundaries;
        } else {
            // Zoning mode - only show zoning zones (exclude all boundaries)
            return zones.filter((zone) => {
                const isBoundary = zone.boundary_type === 'municipal' || zone.boundary_type === 'barangay';
                return !isBoundary;
            });
        }
    };

    // Search function that works for both zones and barangay boundaries
    const searchItems = (items: Zone[], query: string): Zone[] => {
        if (!query) {
            return items;
        }
        const lowerQuery = query.toLowerCase();
        return items.filter((item) => {
            return (
                item.code?.toLowerCase().includes(lowerQuery) ||
                item.name?.toLowerCase().includes(lowerQuery) ||
                item.label?.toLowerCase().includes(lowerQuery) ||
                item.description?.toLowerCase().includes(lowerQuery)
            );
        });
    };

    const filteredZones = searchItems(getDisplayItems(), searchQuery);

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
                                {/* Edit Mode Selector */}
                                <div>
                                    <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                        Edit Mode
                                    </label>
                                    <select
                                        value={editMode}
                                        onChange={(e) => {
                                            const mode = e.target.value as 'zoning' | 'municipal' | 'barangay';
                                            setEditMode(mode);
                                            setSelectedClassification(null);
                                            setSelectedZone(null);
                                            setSelectedBarangay(null);
                                            setIsDrawing(false);
                                            setIsEditing(false);
                                        }}
                                        className="bg-white dark:bg-dark-surface px-3 py-2 border border-gray-300 focus:border-transparent dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary w-full text-gray-900 dark:text-white text-sm"
                                    >
                                        <option value="zoning">Land Use Zones</option>
                                        <option value="municipal">Municipal Boundary</option>
                                        <option value="barangay">Barangay Boundaries</option>
                                    </select>
                                </div>

                                {/* Barangay Selector (only for zoning mode) */}
                                {editMode === 'zoning' && (
                                    <div>
                                        <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                            Select Barangay
                                        </label>
                                        <select
                                            value={selectedBarangay?.id || ''}
                                            onChange={(e) => {
                                                const barangay = barangayBoundaries.find((b) => b.id === e.target.value);
                                                setSelectedBarangay(barangay || null);
                                                setSelectedClassification(null); // Clear classification when barangay changes
                                            }}
                                            className="bg-white dark:bg-dark-surface px-3 py-2 border border-gray-300 focus:border-transparent dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary w-full text-gray-900 dark:text-white text-sm"
                                            required
                                        >
                                            <option value="">Select a barangay...</option>
                                            {barangayBoundaries.map((barangay) => (
                                                <option key={barangay.id} value={barangay.id}>
                                                    {barangay.label || 'Unnamed Barangay'}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {/* Classification Selector (only for zoning mode) */}
                                {editMode === 'zoning' && (
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
                                            className="bg-white dark:bg-dark-surface disabled:opacity-50 px-3 py-2 border border-gray-300 focus:border-transparent dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary w-full text-gray-900 dark:text-white text-sm disabled:cursor-not-allowed"
                                            disabled={!selectedBarangay}
                                        >
                                            <option value="">Select a classification...</option>
                                            {classifications.map((classification) => (
                                                <option key={classification.id} value={classification.id}>
                                                    {classification.code} - {classification.name}
                                                </option>
                                            ))}
                                        </select>
                                        {!selectedBarangay && (
                                            <p className="mt-1 text-amber-600 dark:text-amber-400 text-xs">
                                                Please select a barangay first
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Mode Info + Actions */}
                                {editMode === 'municipal' && (
                                    <div className="space-y-2">
                                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 border border-blue-200 dark:border-blue-800 rounded-lg">
                                            <p className="text-blue-800 dark:text-blue-200 text-sm">
                                                <strong>Municipal Boundary Mode</strong><br />
                                                {municipalityBoundary
                                                    ? 'Click the boundary on the map to select it, then edit or delete. Or draw a new one to replace it.'
                                                    : 'Draw the municipal boundary on the map.'}
                                            </p>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="primary"
                                            className="flex justify-center items-center gap-2 w-full"
                                            onClick={handleDrawBoundary}
                                            disabled={isDrawing || isEditing}
                                        >
                                            <Plus size={14} />
                                            {municipalityBoundary ? 'Replace Boundary' : 'Draw Boundary'}
                                        </Button>
                                        {municipalityBoundary && (
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="flex-1"
                                                    onClick={() => handleEditBoundary(municipalityBoundary)}
                                                    disabled={isDrawing || isEditing}
                                                >
                                                    Edit Shape
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="danger"
                                                    className="flex-1"
                                                    onClick={() => handleDeleteBoundary(municipalityBoundary)}
                                                    disabled={isDrawing || isEditing}
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {editMode === 'barangay' && (
                                    <div className="space-y-2">
                                        <div className="bg-purple-50 dark:bg-purple-900/20 p-3 border border-purple-200 dark:border-purple-800 rounded-lg">
                                            <p className="text-purple-800 dark:text-purple-200 text-sm">
                                                <strong>Barangay Boundaries Mode</strong><br />
                                                Click a barangay on the map to select it, then edit or delete. Or draw a new barangay boundary.
                                            </p>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="primary"
                                            className="flex justify-center items-center gap-2 w-full"
                                            onClick={handleDrawBoundary}
                                            disabled={isDrawing || isEditing}
                                        >
                                            <Plus size={14} />
                                            Draw New Barangay
                                        </Button>
                                        {selectedZone && selectedZone.boundary_type === 'barangay' && (
                                            <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
                                                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 truncate">
                                                    Selected: {selectedZone.label || 'Unnamed Barangay'}
                                                </p>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="flex-1"
                                                        onClick={() => handleEditBoundary(selectedZone)}
                                                        disabled={isDrawing || isEditing}
                                                    >
                                                        Edit Shape
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="danger"
                                                        className="flex-1"
                                                        onClick={() => handleDeleteBoundary(selectedZone)}
                                                        disabled={isDrawing || isEditing}
                                                    >
                                                        Delete
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {editMode === 'zoning' && selectedBarangay && (
                                    <div className="bg-green-50 dark:bg-green-900/20 p-3 border border-green-200 dark:border-green-800 rounded-lg">
                                        <p className="text-green-800 dark:text-green-200 text-sm">
                                            <strong>Barangay Selected</strong><br />
                                            {selectedBarangay.label || 'Selected Barangay'}
                                            <br />
                                            <span className="text-xs">
                                                Drawing will be constrained to this barangay boundary. Hover over the map to see the highlighted boundary.
                                            </span>
                                        </p>
                                    </div>
                                )}

                                {editMode === 'zoning' && selectedClassification && (
                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 border border-blue-200 dark:border-blue-800 rounded-lg">
                                        <p className="text-blue-800 dark:text-blue-200 text-sm">
                                            <strong>{isDrawing ? 'Drawing Mode Active' : 'Classification Selected'}</strong><br />
                                            Selected: {selectedClassification.code} - {selectedClassification.name}
                                            {selectedBarangay && (
                                                <>
                                                    <br />
                                                    <span className="text-green-700 dark:text-green-300 text-xs">
                                                        Constrained to: {selectedBarangay.label || 'Selected Barangay'}
                                                    </span>
                                                </>
                                            )}
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
                                        placeholder={editMode === 'zoning' ? 'Search land use zones...' : editMode === 'barangay' ? 'Search barangays...' : 'Search...'}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <div className="gap-2 grid grid-cols-2 mt-3">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex justify-center items-center gap-2"
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
                                        <input
                                            type="file"
                                            id="barangay-import"
                                            className="hidden"
                                            accept=".json,.geojson,application/json,application/geo+json"
                                            onChange={handleBarangayImport}
                                        />
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="flex justify-center items-center gap-2 w-full"
                                            onClick={() => document.getElementById(editMode === 'barangay' ? 'barangay-import' : 'municipality-import')?.click()}
                                            title={editMode === 'barangay' ? 'Import Barangay Boundaries' : 'Import Municipality Boundary'}
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
                                        {searchQuery 
                                            ? (editMode === 'zoning' ? 'No land use zones found' : editMode === 'barangay' ? 'No barangays found' : 'No items found')
                                            : (editMode === 'zoning' ? 'No land use zones yet. Create one to get started.' : editMode === 'barangay' ? 'No barangays yet. Add one to get started.' : 'No items yet.')
                                        }
                                    </div>
                                ) : (
                                    filteredZones.map((zone) => (
                                        <ZoneCard
                                            key={zone.id}
                                            zone={zone}
                                            isSelected={selectedZone?.id === zone.id}
                                            onSelect={(z) => {
                                                setSelectedZone(z);
                                                setMapFocusKey(Date.now());
                                                setShouldShowPopup(false);
                                                setShowZoneDetailsPanel(false);
                                                setIsDrawing(false);
                                                setIsEditing(false);
                                            }}
                                            onEdit={(z) => {
                                                if (editMode === 'municipal' || editMode === 'barangay') {
                                                    handleEditBoundary(z);
                                                } else {
                                                    setSelectedZone(z);
                                                    setShowZoneDetailsPanel(true);
                                                    setIsDrawing(false);
                                                    setIsEditing(false);
                                                }
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
                                        {editMode === 'municipal' ? 'Editing municipal boundary' :
                                         editMode === 'barangay' ? `Editing ${selectedZone?.label || 'barangay'}` :
                                         'Editing land use zone boundary'}
                                    </span>
                                    <Button
                                        size="sm"
                                        onClick={() => {
                                            if (saveEditFnRef.current) {
                                                saveEditFnRef.current();
                                            }
                                        }}
                                    >
                                        Save
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                            setIsEditing(false);
                                            if (editMode === 'zoning') {
                                                setShowZoneDetailsPanel(true);
                                            }
                                            loadAllZonesForMap();
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
                            maxZoom={19}
                            minZoom={3}
                            style={{ height: '100%', width: '100%', zIndex: 0 }}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                maxZoom={19}
                                minZoom={3}
                                tileSize={256}
                                zoomOffset={0}
                                updateWhenZooming={true}
                                updateWhenIdle={true}
                                keepBuffer={3}
                            />
                            <MapWithDraw
                                selectedZone={selectedZone}
                                selectedClassification={selectedClassification}
                                zones={allZones}
                                municipalityBoundary={municipalityBoundary}
                                barangayBoundaries={barangayBoundaries}
                                selectedBarangay={selectedBarangay}
                                editMode={editMode}
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
                                    setIsEditing(false);

                                    const isBoundary = z.boundary_type === 'municipal' || z.boundary_type === 'barangay';
                                    if (isBoundary) {
                                        // Clicking a boundary in boundary mode just selects it — sidebar shows actions
                                        setShouldShowPopup(false);
                                        setShowZoneDetailsPanel(false);
                                    } else if (startEdit) {
                                        setShouldShowPopup(false);
                                        setShowZoneDetailsPanel(true);
                                    } else {
                                        setShouldShowPopup(true);
                                        setShowZoneDetailsPanel(true);
                                    }
                                }}
                                onSelectBarangay={(barangay) => {
                                    if (editMode === 'zoning') {
                                        setSelectedBarangay(barangay);
                                        setSelectedClassification(null); // Clear classification when barangay changes
                                    }
                                }}
                                onEditCancel={() => {
                                    // Exit edit mode when cancel is clicked
                                    setIsEditing(false);
                                    setShowZoneDetailsPanel(true); // Show panel again after canceling edit
                                }}
                                registerSaveEdit={(fn) => { saveEditFnRef.current = fn; }}
                            />
                        </MapContainer>
                    </div>
                </div>
            </main>

            {/* Create Zone Modal */}

            {/* Barangay Name Dialog */}
            {barangayNameDialog.open && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">
                            Name this Barangay
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            Enter the name for the barangay boundary you just drew.
                        </p>
                        <input
                            type="text"
                            autoFocus
                            value={barangayNameDialog.name}
                            onChange={(e) =>
                                setBarangayNameDialog((prev) => ({ ...prev, name: e.target.value }))
                            }
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleBarangayNameConfirm();
                                if (e.key === 'Escape')
                                    setBarangayNameDialog({ open: false, geometry: null, name: '' });
                            }}
                            placeholder="e.g. Barangay 1"
                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary mb-4"
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() =>
                                    setBarangayNameDialog({ open: false, geometry: null, name: '' })
                                }
                                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleBarangayNameConfirm}
                                disabled={saving}
                                className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary/90 disabled:opacity-50 transition-colors"
                            >
                                {saving ? 'Saving…' : 'Save Boundary'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
