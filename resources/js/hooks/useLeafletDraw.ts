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

    const onDrawCreatedRef = useRef(onDrawCreated);
    const onDrawEditedRef = useRef(onDrawEdited);
    const onDrawDeletedRef = useRef(onDrawDeleted);
    const onDrawStartRef = useRef(onDrawStart);
    const onDrawStopRef = useRef(onDrawStop);

    useEffect(() => {
        onDrawCreatedRef.current = onDrawCreated;
        onDrawEditedRef.current = onDrawEdited;
        onDrawDeletedRef.current = onDrawDeleted;
        onDrawStartRef.current = onDrawStart;
        onDrawStopRef.current = onDrawStop;
    }, [onDrawCreated, onDrawEdited, onDrawDeleted, onDrawStart, onDrawStop]);

    useEffect(() => {
        if (!map) {
            return;
        }

        // Create feature group for editing existing polygons
        if (!featureGroupRef.current) {
            featureGroupRef.current = new L.FeatureGroup();
        }

        const featureGroup = featureGroupRef.current;

        if (!map.hasLayer(featureGroup)) {
            map.addLayer(featureGroup);
        }

        const handleLayerAdd = (e: L.LayerEvent) => {
            const addedLayer = e.layer;
            if (isDrawingNewLayerRef.current) {
                if (featureGroup.hasLayer(addedLayer)) {
                    featureGroup.removeLayer(addedLayer);
                }
                if (map.hasLayer(addedLayer)) {
                    map.removeLayer(addedLayer);
                }
            }
        };

        featureGroup.on('layeradd', handleLayerAdd);

        // ONLY recreate control if drawColor changes or it doesn't exist
        // Changing 'enabled' should not recreate the control
        if (drawControlRef.current && (drawControlRef.current as any)._lastColor !== drawColor) {
            map.removeControl(drawControlRef.current);
            drawControlRef.current = null;
            isControlAddedRef.current = false;
        }

        if (!drawControlRef.current) {
            const drawControl = new L.Control.Draw({
                edit: {
                    featureGroup,
                    remove: true,
                },
                draw: {
                    polygon: {
                        allowIntersection: false,
                        showArea: false,
                        shapeOptions: {
                            color: drawColor,
                            fillColor: drawColor,
                            fillOpacity: 0.3,
                            weight: 2,
                            opacity: 0.8,
                        },
                        metric: true,
                        feet: false,
                    },
                    rectangle: {
                        showArea: false,
                    },
                    circle: {
                        showRadius: true,
                    },
                    circlemarker: false,
                    polyline: false,
                    marker: false,
                },
            });
            (drawControl as any)._lastColor = drawColor;
            drawControlRef.current = drawControl;
            map.addControl(drawControl);
            isControlAddedRef.current = true;
        }

        const drawControl = drawControlRef.current;

        // Handle visibility without re-initializing tools
        const updateVisibility = () => {
            const controlContainer = drawControl.getContainer();
            if (controlContainer) {
                controlContainer.style.display = enabled ? '' : 'none';
            }
        };

        updateVisibility();

        // Event handlers using refs to stay stable
        const handleDrawStart = () => {
            isDrawingNewLayerRef.current = true;
            onDrawStartRef.current?.();
        };

        const handleDrawCreated = (e: L.DrawEvents.Created) => {
            const { layer } = e;
            const removeLayer = () => {
                if (featureGroup.hasLayer(layer)) featureGroup.removeLayer(layer);
                if (map.hasLayer(layer)) map.removeLayer(layer);
            };
            removeLayer();
            requestAnimationFrame(removeLayer);
            setTimeout(removeLayer, 0);
            isDrawingNewLayerRef.current = false;
            onDrawCreatedRef.current?.(layer);
        };

        const handleDrawStop = () => {
            isDrawingNewLayerRef.current = false;
            onDrawStopRef.current?.();
        };

        const handleDrawEdited = (e: L.DrawEvents.Edited) => {
            const { layers } = e;
            isDrawingNewLayerRef.current = false;
            onDrawEditedRef.current?.(layers);
        };

        const handleDrawDeleted = (e: L.DrawEvents.Deleted) => {
            const { layers } = e;
            isDrawingNewLayerRef.current = false;
            onDrawDeletedRef.current?.(layers);
        };

        map.on(L.Draw.Event.CREATED as any, handleDrawCreated as any);
        map.on(L.Draw.Event.EDITED as any, handleDrawEdited as any);
        map.on(L.Draw.Event.DELETED as any, handleDrawDeleted as any);
        map.on(L.Draw.Event.DRAWSTART as any, handleDrawStart as any);
        map.on(L.Draw.Event.DRAWSTOP as any, handleDrawStop as any);

        return () => {
            map.off(L.Draw.Event.CREATED as any, handleDrawCreated as any);
            map.off(L.Draw.Event.EDITED as any, handleDrawEdited as any);
            map.off(L.Draw.Event.DELETED as any, handleDrawDeleted as any);
            map.off(L.Draw.Event.DRAWSTART as any, handleDrawStart as any);
            map.off(L.Draw.Event.DRAWSTOP as any, handleDrawStop as any);
            featureGroup.off('layeradd', handleLayerAdd);
        };
    }, [map, enabled, drawColor]);

    return {
        drawControl: drawControlRef.current,
        featureGroup: featureGroupRef.current,
    };
}
