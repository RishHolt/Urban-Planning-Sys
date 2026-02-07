import { useState, useEffect, useCallback, useRef } from 'react';
import { router, usePage } from '@inertiajs/react';
import AdminHeader from '../../../components/AdminHeader';
import Sidebar from '../../../components/Sidebar';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useLeafletDraw } from '../../../hooks/useLeafletDraw';
import { getZones, getZone, createZone, updateZone, deleteZone, getZoningClassifications, exportZonesGeoJson, importZonesGeoJson, importMunicipalityGeoJson, getMunicipalBoundary, createMunicipalBoundary, getBarangayBoundaries, createBarangayBoundary, updateBarangayBoundary, setCsrfToken, type Zone, type ZoningClassification } from '../../../data/services';
import type { SharedData } from '../../../types';
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

// Suppress leaflet-draw deprecation warnings about _flat
if (typeof window !== 'undefined') {
    const originalWarn = console.warn;
    console.warn = function (...args: unknown[]) {
        const message = args[0];
        if (typeof message === 'string' && message.includes('Deprecated use of _flat')) {
            // Suppress this specific warning from leaflet-draw
            return;
        }
        originalWarn.apply(console, args);
    };
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
                const isInteractive = !isBoundary || (isBoundary && (
                    (isMunicipality && editMode === 'municipal') ||
                    (isBarangay && editMode === 'barangay')
                ));

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

                    // Store barangay boundaries for map-level click detection in zoning mode
                    // We don't add click handlers directly to avoid blocking zone clicks

                    // Add popup and edit button for zoning zones (not boundaries)
                    if (!isBoundary) {
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
                    // Remove layer from featureGroup first if it exists
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

                    // Re-add layer to featureGroup for editing
                    if (layer instanceof L.LayerGroup) {
                        layer.eachLayer((sublayer) => {
                            featureGroup.addLayer(sublayer);
                        });
                    } else {
                        featureGroup.addLayer(layer);
                    }

                    // Re-enable edit mode
                    setTimeout(() => {
                        if (drawControl) {
                            const container = drawControl.getContainer();
                            if (container) {
                                const editButton = container.querySelector('.leaflet-draw-edit-edit, a[title*="Edit"], button[title*="Edit"]') as HTMLElement;
                                if (editButton) {
                                    editButton.click();
                                } else {
                                    const drawControlAny = drawControl as any;
                                    const editToolbar = drawControlAny._toolbars?.edit;
                                    if (editToolbar && typeof editToolbar.reinit === 'function') {
                                        editToolbar.reinit();
                                    }
                                }
                            }
                        }
                    }, 200); // Delay to ensure layers are fully rendered
                }
            }
        };

        // Initial render
        renderZones();
        reEnableEditMode();

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

            // Small delay to let zone click handlers fire first
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
                        
                        if (booleanPointInPolygon(clickPoint, featureObj)) {
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
                                    
                                    if (booleanPointInPolygon(clickPoint, zoneFeature)) {
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
        }, [map, zones, municipalityBoundary, barangayBoundaries, editMode, selectedZone, selectedClassification, drawColor, onSelectZone, onSelectBarangay, shouldShowPopup, selectedBarangay, isEditing, featureGroup, drawControl]);

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

        // Store original geometry when entering edit mode
        if (selectedZone.geometry) {
            originalGeometryRef.current = selectedZone.geometry;
        }

        const handleDrawEdited = (e: L.DrawEvents.Edited) => {
            // Save was clicked - process the edited geometry
            try {
                editWasSavedRef.current = true;
                
                // Get layers from the event
                let layersToProcess = e.layers;
                
                // Check if layers are empty
                let layerCount = 0;
                e.layers.eachLayer(() => {
                    layerCount++;
                });
                
                // If event layers are empty, try to get from featureGroup or stored layer reference
                if (layerCount === 0 && selectedZone) {
                    console.warn('handleDrawEdited: Event layers empty, trying fallback');
                    
                    // Try featureGroup first
                    if (featureGroup) {
                        const tempGroup = new L.LayerGroup();
                        featureGroup.eachLayer((layer) => {
                            tempGroup.addLayer(layer);
                        });
                        const fgCount = tempGroup.getLayers().length;
                        if (fgCount > 0) {
                            layersToProcess = tempGroup;
                            console.log('handleDrawEdited: Using layers from featureGroup, count:', fgCount);
                        } else {
                            // Try stored layer reference as last resort
                            const storedLayer = polygonLayersRef.current.get(selectedZone.id);
                            if (storedLayer) {
                                const fallbackGroup = new L.LayerGroup();
                                if (storedLayer instanceof L.LayerGroup) {
                                    storedLayer.eachLayer((sublayer) => {
                                        fallbackGroup.addLayer(sublayer);
                                    });
                                } else {
                                    fallbackGroup.addLayer(storedLayer);
                                }
                                layersToProcess = fallbackGroup;
                                console.log('handleDrawEdited: Using stored layer reference, count:', fallbackGroup.getLayers().length);
                            } else {
                                console.error('handleDrawEdited: No layers found in event, featureGroup, or stored reference');
                            }
                        }
                    }
                } else {
                    console.log('handleDrawEdited: Using layers from event, count:', layerCount);
                }
                
                // Call the async handler - errors will be caught in handlePolygonEdited
                onPolygonEdited(layersToProcess).catch((error) => {
                    console.error('handleDrawEdited: Error in onPolygonEdited:', error);
                    editWasSavedRef.current = false;
                });
                originalGeometryRef.current = null; // Clear stored geometry after save
            } catch (error) {
                console.error('handleDrawEdited: Error processing edited layers:', error);
                editWasSavedRef.current = false;
            }
        };

        const handleDrawDeleted = (e: L.DrawEvents.Deleted) => {
            onPolygonDeleted(e.layers);
        };

        // Listen for when edit toolbar is disabled (either save or cancel clicked)
        const handleEditDisable = () => {
            // Small delay to check if EDITED event fired
            setTimeout(() => {
                if (!editWasSavedRef.current && originalGeometryRef.current) {
                    // Cancel was clicked - Leaflet Draw already reverted the geometry
                    // We just need to exit edit mode
                    if (onEditCancel) {
                        onEditCancel();
                    }
                }
                // Reset flag and clear stored geometry
                editWasSavedRef.current = false;
                originalGeometryRef.current = null;
            }, 100);
        };

        map.on(L.Draw.Event.EDITED as any, handleDrawEdited as any);
        map.on(L.Draw.Event.DELETED as any, handleDrawDeleted as any);

        // Listen for edit toolbar disable event (when save or cancel is clicked)
        if (drawControl) {
            const drawControlAny = drawControl as any;
            const editToolbar = drawControlAny._toolbars?.edit;
            if (editToolbar) {
                editToolbar.on('disable', handleEditDisable);
            }
        }

        return () => {
            map.off(L.Draw.Event.EDITED as any, handleDrawEdited as any);
            map.off(L.Draw.Event.DELETED as any, handleDrawDeleted as any);
            if (drawControl) {
                const drawControlAny = drawControl as any;
                const editToolbar = drawControlAny._toolbars?.edit;
                if (editToolbar) {
                    editToolbar.off('disable', handleEditDisable);
                }
            }
        };
    }, [map, featureGroup, isEditing, selectedZone, onPolygonEdited, drawControl]);

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
    // Get CSRF token from Inertia shared props and cache it
    const page = usePage<SharedData>();
    useEffect(() => {
        if (page.props.csrf_token) {
            setCsrfToken(page.props.csrf_token);
        }
    }, [page.props.csrf_token]);

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
    const [barangayBoundaries, setBarangayBoundaries] = useState<Zone[]>([]);
    const [selectedBarangay, setSelectedBarangay] = useState<Zone | null>(null);
    const [editMode, setEditMode] = useState<'zoning' | 'municipal' | 'barangay'>('zoning');
    const [mapCenter, setMapCenter] = useState<[number, number]>([14.5995, 120.9842]); // Default to Manila
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
                    // For barangay, we need a label - prompt user or use default
                    const label = prompt('Enter barangay name:') || `Barangay ${Date.now()}`;
                    const boundary = await createBarangayBoundary({
                        geometry: finalGeometry,
                        label,
                    });
                    setBarangayBoundaries((prev) => [...prev, boundary as Zone]);
                    await loadAllZonesForMap();
                    await loadBarangayBoundaries();
                    showSuccess(`Barangay boundary "${label}" saved successfully`);
                    setIsDrawing(false);
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
                                        <option value="zoning">Zoning Zones</option>
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

                                {/* Mode Info */}
                                {editMode === 'municipal' && (
                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 border border-blue-200 dark:border-blue-800 rounded-lg">
                                        <p className="text-blue-800 dark:text-blue-200 text-sm">
                                            <strong>Municipal Boundary Mode</strong><br />
                                            {municipalityBoundary
                                                ? 'Click the boundary on the map to edit it, or use the draw tool to create a new one.'
                                                : 'Use the draw tool on the map to create the municipal boundary.'}
                                        </p>
                                    </div>
                                )}

                                {editMode === 'barangay' && (
                                    <div className="bg-purple-50 dark:bg-purple-900/20 p-3 border border-purple-200 dark:border-purple-800 rounded-lg">
                                        <p className="text-purple-800 dark:text-purple-200 text-sm">
                                            <strong>Barangay Boundaries Mode</strong><br />
                                            Click a barangay boundary on the map to edit it, or use the draw tool to create a new one.
                                        </p>
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
                                        placeholder={editMode === 'zoning' ? 'Search zones...' : editMode === 'barangay' ? 'Search barangays...' : 'Search...'}
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
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="flex justify-center items-center gap-2 w-full"
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
                                        {searchQuery 
                                            ? (editMode === 'zoning' ? 'No zones found' : editMode === 'barangay' ? 'No barangays found' : 'No items found')
                                            : (editMode === 'zoning' ? 'No zones yet. Create one to get started.' : editMode === 'barangay' ? 'No barangays yet. Add one to get started.' : 'No items yet.')
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
                                    if (startEdit) {
                                        // Edit button clicked - open modal for editing
                                        setShouldShowPopup(false);
                                        setShowZoneDetailsPanel(true);
                                        setIsEditing(false);
                                    } else {
                                        // Clicking on map polygon shows popup and info panel
                                        setShouldShowPopup(true);
                                        setShowZoneDetailsPanel(true);
                                        setIsEditing(false);
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
                            />
                        </MapContainer>
                    </div>
                </div>
            </main>

            {/* Create Zone Modal */}
        </div>
    );
}
