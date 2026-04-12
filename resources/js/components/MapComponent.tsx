import { useEffect, useState, memo, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { validateCoordinates } from '../lib/validation';
import { geoJSONToLeaflet, generatePolygonColor } from '../lib/mapUtils';
import { Zone } from '../lib/zoneDetection';

// Fix for default marker icon in React-Leaflet - only run once
if (typeof window !== 'undefined' && !(L.Icon.Default.prototype as any)._iconUrlFixed) {
    delete (L.Icon.Default.prototype as unknown as { _getIconUrl: unknown })._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    });
    (L.Icon.Default.prototype as any)._iconUrlFixed = true;
}

interface LocationMarkerProps {
    position?: [number, number];
    onLocationSelect: (lat: number, lng: number) => void;
    readOnly?: boolean;
}

const LocationMarker = memo(function LocationMarker({ position, onLocationSelect, readOnly = false }: LocationMarkerProps) {
    const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(
        position || null
    );

    useMapEvents({
        click(e) {
            if (readOnly) {
                return; // Don't allow clicking when read-only
            }
            const { lat, lng } = e.latlng;
            if (validateCoordinates(lat, lng)) {
                setMarkerPosition([lat, lng]);
                onLocationSelect(lat, lng);
            }
        },
    });

    useEffect(() => {
        if (position) {
            setMarkerPosition(position);
            // Don't update map view here - let MapCenterUpdater handle it
            // This prevents conflicts when street center is set
        }
    }, [position]);

    if (!markerPosition) {
        return null;
    }

    return <Marker position={markerPosition} />;
});

export interface MapComponentProps {
    center: [number, number];
    latitude?: number;
    longitude?: number;
    onLocationSelect: (lat: number, lng: number) => void;
    mapBounds?: [[number, number], [number, number]];
    zones?: Zone[];
    readOnly?: boolean;
}

// Component to update map center and zoom when prop changes
function MapCenterUpdater({ center, mapBounds }: { center: [number, number]; mapBounds?: [[number, number], [number, number]] }) {
    const map = useMap();
    // Serialize to stable strings so useEffect fires only on real value changes
    const boundsKey = mapBounds ? `${mapBounds[0][0]},${mapBounds[0][1]},${mapBounds[1][0]},${mapBounds[1][1]}` : '';
    const centerKey = `${center[0]},${center[1]}`;

    // Handle mapBounds changes (barangay selection)
    useEffect(() => {
        if (!map || !mapBounds) return;
        map.flyToBounds(mapBounds, {
            padding: [50, 50],
            duration: 1,
            easeLinearity: 0.25,
        });
    }, [map, boundsKey]); // eslint-disable-line react-hooks/exhaustive-deps

    // Handle center changes (pin moved, no bounds)
    useEffect(() => {
        if (!map || mapBounds) return;
        map.setView(center, map.getZoom(), { animate: true });
    }, [map, centerKey]); // eslint-disable-line react-hooks/exhaustive-deps

    return null;
}

// Component to render zone layers on the map
function ZoneLayers({ zones }: { zones?: Zone[] }) {
    const map = useMap();
    const polygonLayersRef = useRef<Map<string, L.Layer>>(new Map());

    useEffect(() => {
        if (!map || !zones || zones.length === 0) {
            return;
        }

        // Clear existing layers
        polygonLayersRef.current.forEach((layer) => {
            if (map.hasLayer(layer)) {
                map.removeLayer(layer);
            }
        });
        polygonLayersRef.current.clear();

        // Add all zones with geometry
        zones.forEach((zone) => {
            if (!zone.geometry) {
                return;
            }

            try {
                const color = zone.color || generatePolygonColor(zone.code || 'UNKNOWN');
                const isBoundary = zone.boundary_type === 'municipal' || zone.boundary_type === 'barangay';
                const isMunicipality = zone.boundary_type === 'municipal';
                const boundaryColor = isMunicipality ? '#000000' : '#808080';

                const layer = geoJSONToLeaflet(zone.geometry, {
                    color: isBoundary ? boundaryColor : color,
                    fillColor: color,
                    fillOpacity: isBoundary ? 0 : 0.3,
                    weight: isBoundary ? 3 : 2,
                    opacity: 0.8,
                    dashArray: isBoundary ? '5, 10' : undefined,
                    interactive: !isBoundary,
                });

                if (layer) {
                    map.addLayer(layer);
                    polygonLayersRef.current.set(zone.id.toString(), layer);
                }
            } catch (error) {
                console.error(`Error rendering zone ${zone.id}:`, error);
            }
        });

        // Cleanup function
        return () => {
            polygonLayersRef.current.forEach((layer) => {
                if (map.hasLayer(layer)) {
                    map.removeLayer(layer);
                }
            });
            polygonLayersRef.current.clear();
        };
    }, [map, zones]);

    return null;
}

export default function MapComponent({
    center,
    latitude,
    longitude,
    onLocationSelect,
    mapBounds,
    zones,
    readOnly = false,
}: MapComponentProps) {
    const handleLocationSelect = useCallback((lat: number, lng: number) => {
        onLocationSelect(lat, lng);
    }, [onLocationSelect]);

    return (
        <MapContainer
            center={center}
            zoom={13}
            style={{ height: '400px', width: '100%' }}
            className="z-0"
            zoomControl={!readOnly}
            scrollWheelZoom={!readOnly}
            doubleClickZoom={!readOnly}
            dragging={!readOnly}
            touchZoom={!readOnly}
            boxZoom={!readOnly}
            keyboard={!readOnly}
            preferCanvas={true}
            fadeAnimation={false}
            zoomAnimation={true}
            markerZoomAnimation={true}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                maxZoom={19}
                minZoom={3}
                tileSize={256}
                zoomOffset={0}
                updateWhenZooming={false}
                updateWhenIdle={true}
                keepBuffer={2}
            />
            <MapCenterUpdater center={center} mapBounds={mapBounds} />
            {zones && zones.length > 0 && <ZoneLayers zones={zones} />}
            <LocationMarker
                position={latitude && longitude ? [latitude, longitude] : undefined}
                onLocationSelect={handleLocationSelect}
                readOnly={readOnly}
            />
        </MapContainer>
    );
}
