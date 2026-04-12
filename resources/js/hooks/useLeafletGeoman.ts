import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';

interface UseLeafletGeomanOptions {
    enabled: boolean;
    drawColor?: string;
    onDrawCreated?: (layer: L.Layer) => void;
    onDrawEdited?: (layers: L.LayerGroup) => void;
    onDrawDeleted?: (layers: L.LayerGroup) => void;
    onDrawStart?: () => void;
    onDrawStop?: () => void;
}

export function useLeafletGeoman({
    enabled,
    drawColor = '#3388ff',
    onDrawCreated,
    onDrawEdited,
    onDrawDeleted,
    onDrawStart,
    onDrawStop,
}: UseLeafletGeomanOptions) {
    const map = useMap();
    const featureGroupRef = useRef<L.FeatureGroup | null>(null);

    // Sync callbacks using refs
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
        if (!map) return;

        // Initialize Feature Group
        if (!featureGroupRef.current) {
            featureGroupRef.current = new L.FeatureGroup();
            map.addLayer(featureGroupRef.current);
        }

        const featureGroup = featureGroupRef.current;

        // Set Global Geoman Options
        map.pm.setGlobalOptions({
            snappable: true,
            snapDistance: 20,
            allowSelfIntersection: false,
            templineStyle: { color: drawColor },
            hintlineStyle: { color: drawColor, dashArray: [5, 5] },
            pathOptions: {
                color: drawColor,
                fillColor: drawColor,
                fillOpacity: 0.3,
            },
        });

        // Configure Toolbar
        map.pm.addControls({
            position: 'topleft',
            drawMarker: false,
            drawCircleMarker: false,
            drawPolyline: false,
            drawRectangle: true,
            drawPolygon: true,
            drawCircle: true,
            editMode: false,    // Editing is managed via per-layer pm.enable() + Save/Cancel UI
            dragMode: false,
            cutPolygon: false,
            removalMode: true,
            rotateMode: false,
        });

        // Toggle Toolbar Visibility
        const toggleGeomanControls = (show: boolean) => {
            if (show) {
                map.pm.addControls();
            } else {
                map.pm.removeControls();
            }
        };

        toggleGeomanControls(enabled);

        // Event Listeners
        const handleCreate = (e: any) => {
            const { layer } = e;
            // Immediate removal to allow parent to manage the layer state
            map.removeLayer(layer);
            onDrawCreatedRef.current?.(layer);
        };

        const handleEdit = (e: any) => {
            // Geoman emits pm:edit on individual layers OR pm:globaleditmodetoggled
            // For general 'edited' callback, we can listen to pm:change on layers in our featureGroup
        };

        const handleGlobalEditStop = () => {
            // Collect all layers from featureGroup to simulate onDrawEdited
            if (onDrawEditedRef.current) {
                const layers = new L.LayerGroup();
                featureGroup.eachLayer((l) => layers.addLayer(l));
                onDrawEditedRef.current(layers);
            }
        };

        const handleRemove = (e: any) => {
            const { layer } = e;
            const layers = new L.LayerGroup();
            layers.addLayer(layer);
            onDrawDeletedRef.current?.(layers);
        };

        const handleDrawStart = () => onDrawStartRef.current?.();
        const handleDrawEnd = () => onDrawStopRef.current?.();

        const handleGlobalEditToggled = (e: any) => {
            if (!e.enabled) {
                // Reset layerGroup restriction so draw tools work on the full map again
                map.pm.setGlobalOptions({ layerGroup: undefined } as any);
                handleGlobalEditStop();
            }
        };

        map.on('pm:create', handleCreate);
        map.on('pm:remove', handleRemove);
        map.on('pm:drawstart', handleDrawStart);
        map.on('pm:drawend', handleDrawEnd);
        map.on('pm:globaleditmodetoggled', handleGlobalEditToggled);

        return () => {
            map.off('pm:create', handleCreate);
            map.off('pm:remove', handleRemove);
            map.off('pm:drawstart', handleDrawStart);
            map.off('pm:drawend', handleDrawEnd);
            map.off('pm:globaleditmodetoggled', handleGlobalEditToggled);
            map.pm.removeControls();
        };
    }, [map, enabled, drawColor]);

    return {
        featureGroup: featureGroupRef.current,
        pm: map.pm,
    };
}
