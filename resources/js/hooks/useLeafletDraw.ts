import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-draw';

interface UseLeafletDrawOptions {
    enabled: boolean;
    drawColor?: string;
    onDrawCreated?: (layer: L.Layer) => void;
    onDrawEdited?: (layers: L.LayerGroup) => void;
    onDrawDeleted?: (layers: L.LayerGroup) => void;
    onDrawStart?: () => void;
    onDrawStop?: () => void;
}

export function useLeafletDraw({
    enabled,
    drawColor = '#3388ff',
    onDrawCreated,
    onDrawEdited,
    onDrawDeleted,
    onDrawStart,
    onDrawStop,
}: UseLeafletDrawOptions): {
    drawControl: L.Control.Draw | null;
    featureGroup: L.FeatureGroup | null;
} {
    const map = useMap();
    const drawControlRef = useRef<L.Control.Draw | null>(null);
    const featureGroupRef = useRef<L.FeatureGroup | null>(null);
    const isControlAddedRef = useRef<boolean>(false);
    // Track if we're currently in a drawing session
    // This helps distinguish new drawings from edits
    const isDrawingNewLayerRef = useRef<boolean>(false);

    useEffect(() => {
        if (!map) {
            return;
        }

        // Create feature group for editing existing polygons
        // We need it on the map for editing to work, but we'll remove new drawings immediately
        if (!featureGroupRef.current) {
            featureGroupRef.current = new L.FeatureGroup();
        }

        const featureGroup = featureGroupRef.current;
        
        // Add featureGroup to map (needed for editing to work)
        // We'll remove newly drawn layers immediately to prevent blue layers
        if (!map.hasLayer(featureGroup)) {
            map.addLayer(featureGroup);
        }

        // Listen for layeradd events to immediately remove newly drawn layers
        // This prevents the blue layer from appearing
        const handleLayerAdd = (e: L.LayerEvent) => {
            const addedLayer = e.layer;
            
            // If we're drawing a new layer (not editing), remove it immediately
            // The layeradd event fires when Leaflet Draw adds the layer to featureGroup
            if (isDrawingNewLayerRef.current) {
                // Remove immediately before it renders
                if (featureGroup.hasLayer(addedLayer)) {
                    featureGroup.removeLayer(addedLayer);
                }
                // Also remove from map if it was added
                if (map.hasLayer(addedLayer)) {
                    map.removeLayer(addedLayer);
                }
            }
        };

        featureGroup.on('layeradd', handleLayerAdd);

        // Remove existing draw control if it exists to recreate with new color
        if (drawControlRef.current) {
            map.removeControl(drawControlRef.current);
            drawControlRef.current = null;
        }

        // Create draw control with dynamic color
        const drawControl = new L.Control.Draw({
            edit: {
                featureGroup,
                remove: true,
            },
            draw: {
                polygon: {
                    allowIntersection: false,
                    showArea: false, // Disabled due to leaflet-draw bug: "type is not defined" in readableArea
                    shapeOptions: {
                        color: drawColor,
                        fillColor: drawColor,
                        fillOpacity: 0.3,
                        weight: 2,
                        opacity: 0.8,
                    },
                        // Explicitly allow unlimited points - no maximum limit
                        // Minimum is 3 points (required for a valid polygon)
                        // Polygon completes ONLY when: double-click, click first point, or press Enter
                        // Users can keep clicking to add more points after the 3rd point
                        // Note: Area is calculated and saved when polygon is created, even though showArea is false
                        metric: true, // Use metric units
                        feet: false, // Don't use feet
                    },
                    rectangle: {
                        showArea: false, // Disabled due to leaflet-draw bug
                    },
                    circle: {
                        showRadius: true,
                    },
                    circlemarker: false,
                    polyline: false,
                    marker: false,
                },
            });

        drawControlRef.current = drawControl;

        // Always add draw control to map so handlers are available
        // Hide/show it based on enabled state
        if (!isControlAddedRef.current) {
            map.addControl(drawControl);
            isControlAddedRef.current = true;
        }
        
        // Hide/show the draw control based on enabled state
        // This keeps handlers available while controlling visibility
        const updateVisibility = () => {
            const controlContainer = drawControl.getContainer();
            if (controlContainer) {
                if (enabled) {
                    controlContainer.style.display = '';
                } else {
                    controlContainer.style.display = 'none';
                }
            }
        };
        
        // Update visibility immediately and after a frame (in case container isn't ready)
        updateVisibility();
        requestAnimationFrame(updateVisibility);

        // Event handlers
        const handleDrawStart = () => {
            // Mark that we're starting a new drawing
            isDrawingNewLayerRef.current = true;
            onDrawStart?.();
        };

        const handleDrawCreated = (e: L.DrawEvents.Created) => {
            const { layer } = e;
            
            // Leaflet Draw automatically adds the layer to featureGroup
            // The layeradd event handler will remove it, but we also remove it here as backup
            const removeLayer = () => {
                // Remove from featureGroup (this is critical!)
                if (featureGroup.hasLayer(layer)) {
                    featureGroup.removeLayer(layer);
                }
                // Also remove from map directly
                if (map.hasLayer(layer)) {
                    map.removeLayer(layer);
                }
            };
            
            // Remove immediately - this must happen before the layer renders
            removeLayer();
            
            // Remove in next frame (after Leaflet Draw's internal handling)
            requestAnimationFrame(removeLayer);
            
            // Remove with multiple timeouts to catch any re-additions
            setTimeout(removeLayer, 0);
            setTimeout(removeLayer, 10);
            setTimeout(removeLayer, 50);
            
            // Reset drawing flag
            isDrawingNewLayerRef.current = false;
            
            // Call the callback which will handle saving
            // The saved polygon will be rendered with correct color
            onDrawCreated?.(layer);
        };

        const handleDrawStop = () => {
            // Reset drawing flag when drawing stops
            isDrawingNewLayerRef.current = false;
            onDrawStop?.();
        };

        const handleDrawEdited = (e: L.DrawEvents.Edited) => {
            const { layers } = e;
            // Reset drawing flag when editing (not a new drawing)
            isDrawingNewLayerRef.current = false;
            onDrawEdited?.(layers);
        };

        const handleDrawDeleted = (e: L.DrawEvents.Deleted) => {
            const { layers } = e;
            // Reset drawing flag when deleting
            isDrawingNewLayerRef.current = false;
            onDrawDeleted?.(layers);
        };

        // Prevent premature polygon completion
        // This ensures the polygon only completes when user explicitly finishes it
        const handleDrawVertex = (e: L.DrawEvents.DrawVertex) => {
            // This event fires for each vertex added
            // We can use this to ensure drawing continues
        };

        // Add event listeners
        map.on(L.Draw.Event.CREATED as any, handleDrawCreated);
        map.on(L.Draw.Event.EDITED as any, handleDrawEdited);
        map.on(L.Draw.Event.DELETED as any, handleDrawDeleted);
        map.on(L.Draw.Event.DRAWSTART as any, handleDrawStart);
        map.on(L.Draw.Event.DRAWSTOP as any, handleDrawStop);
        map.on(L.Draw.Event.DRAWVERTEX as any, handleDrawVertex);

        // Cleanup
        return () => {
            map.off(L.Draw.Event.CREATED as any, handleDrawCreated);
            map.off(L.Draw.Event.EDITED as any, handleDrawEdited);
            map.off(L.Draw.Event.DELETED as any, handleDrawDeleted);
            map.off(L.Draw.Event.DRAWSTART as any, handleDrawStart);
            map.off(L.Draw.Event.DRAWSTOP as any, handleDrawStop);
            map.off(L.Draw.Event.DRAWVERTEX as any, handleDrawVertex);
            
            // Remove layeradd listener
            featureGroup.off('layeradd', handleLayerAdd);

            // Remove draw control on cleanup
            if (isControlAddedRef.current) {
                map.removeControl(drawControl);
                isControlAddedRef.current = false;
            }
        };
    }, [map, enabled, drawColor, onDrawCreated, onDrawEdited, onDrawDeleted, onDrawStart, onDrawStop]);

    return {
        drawControl: drawControlRef.current,
        featureGroup: featureGroupRef.current,
    };
}
