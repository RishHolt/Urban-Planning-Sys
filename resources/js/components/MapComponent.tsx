import { useEffect, useState, memo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { validateCoordinates } from '../lib/validation';

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

export default memo(function MapComponent({
    center,
    latitude,
    longitude,
    onLocationSelect,
    zoom = 13,
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
            <LocationMarker
                position={latitude && longitude ? [latitude, longitude] : undefined}
                onLocationSelect={handleLocationSelect}
            />
        </MapContainer>
    );
});
