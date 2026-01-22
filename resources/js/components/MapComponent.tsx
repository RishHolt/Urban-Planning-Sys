import { useEffect, useState, memo, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { validateCoordinates } from '../lib/validation';
import { geoJSONToLeaflet, generatePolygonColor, hslToRgba } from '../lib/mapUtils';
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
}

const LocationMarker = memo(function LocationMarker({ position, onLocationSelect }: LocationMarkerProps) {
    const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(
        position || null
    );

    const map = useMapEvents({
        click(e) {
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

interface MapComponentProps {
    center: [number, number];
    latitude?: number;
    longitude?: number;
    onLocationSelect: (lat: number, lng: number) => void;
    zoom?: number;
    zones?: Zone[];
}

// Component to update map center and zoom when prop changes
function MapCenterUpdater({ center, zoom }: { center: [number, number]; zoom?: number }) {
    const map = useMap();
    
    useEffect(() => {
        if (map && center) {
            const targetZoom = zoom !== undefined ? zoom : map.getZoom();
            map.setView(center, targetZoom);
        }
    }, [map, center, zoom]);
    
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

                const layer = geoJSONToLeaflet(zone.geometry, {
                    color,
                    fillColor: color,
                    fillOpacity: 0.3,
                    weight: 2,
                    opacity: 0.8,
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

export default memo(function MapComponent({
    center,
    latitude,
    longitude,
    onLocationSelect,
    zoom = 13,
    zones,
}: MapComponentProps) {
    const handleLocationSelect = useCallback((lat: number, lng: number) => {
        onLocationSelect(lat, lng);
    }, [onLocationSelect]);

    return (
        <MapContainer
            center={center}
            zoom={zoom}
            style={{ height: '400px', width: '100%' }}
            className="z-0"
            zoomControl={true}
            scrollWheelZoom={true}
            doubleClickZoom={true}
            dragging={true}
            touchZoom={true}
            boxZoom={true}
            keyboard={true}
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
            <MapCenterUpdater center={center} zoom={zoom} />
            {zones && zones.length > 0 && <ZoneLayers zones={zones} />}
            <LocationMarker
                position={latitude && longitude ? [latitude, longitude] : undefined}
                onLocationSelect={handleLocationSelect}
            />
        </MapContainer>
    );
});
