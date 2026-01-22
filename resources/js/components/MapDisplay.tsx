import { lazy, Suspense, memo, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import L from 'leaflet';

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

const ReadOnlyMapComponent = lazy(async () => {
    if (typeof window !== 'undefined') {
        const [{ MapContainer, TileLayer, Marker, useMap }, { useEffect }] = await Promise.all([
            import('react-leaflet'),
            import('react'),
        ]);

        function MapCenterUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
            const map = useMap();
            useEffect(() => {
                if (map && center) {
                    map.setView(center, zoom);
                }
            }, [map, center, zoom]);
            return null;
        }

        return {
            default: function ReadOnlyMap({
                center,
                latitude,
                longitude,
                zoom,
                height,
            }: {
                center: [number, number];
                latitude: number;
                longitude: number;
                zoom: number;
                height: string;
            }) {
                return (
                    <MapContainer
                        center={center}
                        zoom={zoom}
                        style={{ height, width: '100%' }}
                        className="z-0"
                        zoomControl={true}
                        scrollWheelZoom={false}
                        doubleClickZoom={false}
                        dragging={false}
                        touchZoom={false}
                        boxZoom={false}
                        keyboard={false}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            maxZoom={19}
                            minZoom={3}
                        />
                        <MapCenterUpdater center={center} zoom={zoom} />
                        <Marker position={[latitude, longitude]} />
                    </MapContainer>
                );
            },
        };
    }
    return Promise.resolve({ default: () => null });
});

interface MapDisplayProps {
    latitude: number;
    longitude: number;
    zone?: {
        id: number;
        name: string;
        code: string;
        geometry?: GeoJSON.Polygon | GeoJSON.MultiPolygon;
        color?: string;
    } | null;
    className?: string;
    height?: string;
    zoom?: number;
}

function MapDisplay({
    latitude,
    longitude,
    zone,
    className = '',
    height = '400px',
    zoom = 15,
}: MapDisplayProps) {
    const center: [number, number] = [latitude, longitude];

    return (
        <div className={`w-full ${className}`}>
            <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                <Suspense
                    fallback={
                        <div className="flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800" style={{ height }}>
                            <Loader2 className="mb-2 text-primary animate-spin" size={32} />
                            <p className="text-gray-500 dark:text-gray-400">Loading map...</p>
                        </div>
                    }
                >
                    <ReadOnlyMapComponent
                        center={center}
                        latitude={latitude}
                        longitude={longitude}
                        zoom={zoom}
                        height={height}
                    />
                </Suspense>
            </div>
        </div>
    );
}

export default memo(MapDisplay);
