import { useState, lazy, Suspense, memo, useCallback, useMemo } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { validateCoordinates, validateBoundary } from '../lib/validation';

// Lazy load the map component to avoid SSR issues
const MapComponent = lazy(() => {
    if (typeof window !== 'undefined') {
        // Preload leaflet CSS and libraries
        return Promise.all([
            import('leaflet'),
            import('react-leaflet'),
            import('./MapComponent'),
        ]).then(([, , mapComponent]) => mapComponent);
    }
    return Promise.resolve({ default: () => null });
});

import { Zone } from '../lib/zoneDetection';

interface MapPickerProps {
    latitude?: number;
    longitude?: number;
    onLocationSelect: (lat: number, lng: number) => void;
    boundary?: { minLat: number; maxLat: number; minLng: number; maxLng: number };
    error?: string;
    className?: string;
    center?: [number, number];
    zoom?: number;
    zones?: Zone[];
}

function MapPicker({
    latitude,
    longitude,
    onLocationSelect,
    boundary,
    error,
    className = '',
    center: propCenter,
    zoom,
    zones,
}: MapPickerProps) {
    const [isValid, setIsValid] = useState(true);
    const [validationError, setValidationError] = useState<string>('');

    const defaultCenter: [number, number] = useMemo(() => [14.5995, 120.9842], []); // Manila, Philippines
    const center: [number, number] = useMemo(
        () => {
            // Prioritize propCenter (street/municipality center) over existing pin
            // This allows street selection to update map view even when pin exists
            if (propCenter) {
                return propCenter;
            }
            if (latitude && longitude) {
                return [latitude, longitude];
            }
            return defaultCenter;
        },
        [latitude, longitude, propCenter, defaultCenter]
    );

    const handleLocationSelect = useCallback((lat: number, lng: number) => {
        if (!validateCoordinates(lat, lng)) {
            setIsValid(false);
            setValidationError('Invalid coordinates');
            return;
        }

        if (boundary && !validateBoundary(lat, lng, boundary)) {
            setIsValid(false);
            setValidationError('Location is outside municipality boundaries');
            return;
        }

        setIsValid(true);
        setValidationError('');
        onLocationSelect(lat, lng);
    }, [boundary, onLocationSelect]);

    return (
        <div className={`w-full ${className}`}>
            <div
                className={`
                    border-2 rounded-lg overflow-hidden
                    ${error || validationError 
                        ? 'border-red-500' 
                        : 'border-gray-300 dark:border-gray-600'
                    }
                `}
            >
                <Suspense
                    fallback={
                        <div className="flex flex-col items-center justify-center h-[400px] bg-gray-100 dark:bg-gray-800">
                            <Loader2 className="mb-2 text-primary animate-spin" size={32} />
                            <p className="text-gray-500 dark:text-gray-400">Loading map...</p>
                        </div>
                    }
                >
                    <MapComponent
                        center={center}
                        latitude={latitude}
                        longitude={longitude}
                        onLocationSelect={handleLocationSelect}
                        zoom={zoom}
                        zones={zones}
                    />
                </Suspense>
            </div>
            {(latitude || longitude) && (
                <div className="mt-2 flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                    <MapPin size={16} />
                    <span>
                        Coordinates: {latitude?.toFixed(6)}, {longitude?.toFixed(6)}
                    </span>
                </div>
            )}
            {(error || validationError) && (
                <p className="mt-1 text-red-500 text-sm">{error || validationError}</p>
            )}
            {!isValid && (
                <p className="mt-1 text-orange-500 text-sm">
                    Please select a valid location within the municipality boundaries.
                </p>
            )}
        </div>
    );
}

export default memo(MapPicker);
