import { useState, useEffect, useMemo, useRef } from 'react';
import MapPicker from '../MapPicker';
import MapDisplay from '../MapDisplay';
import CoordinateDisplay from '../CoordinateDisplay';
import Input from '../Input';
import { detectZoneFromPin, Zone } from '../../lib/zoneDetection';
import { searchAddressSuggestions, reverseGeocode } from '../../lib/geocoding';
import { MapPin, CheckCircle, AlertCircle, Search, Loader2 } from 'lucide-react';

interface PropertyLocationProps {
    mode: 'form' | 'edit' | 'view';
    // Form/Edit mode props
    pinLat?: number | null;
    pinLng?: number | null;
    lotAddress?: string;
    province?: string;
    municipality?: string;
    barangay?: string;
    streetName?: string;
    zone?: Zone | null;
    zones?: Zone[]; // For zone detection in form mode
    onLocationSelect?: (lat: number, lng: number) => void;
    onAddressChange?: (field: string, value: string) => void;
    errors?: Record<string, string>;
    // View mode props
    showMap?: boolean;
}

export default function PropertyLocation({
    mode,
    pinLat,
    pinLng,
    lotAddress = '',
    province = '',
    municipality = '',
    barangay = '',
    streetName = '',
    zone,
    zones = [],
    onLocationSelect,
    onAddressChange,
    errors = {},
    showMap = true,
}: PropertyLocationProps) {
    const [detectedZone, setDetectedZone] = useState<Zone | null>(zone || null);
    const [loadingZones, setLoadingZones] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState<Array<{ lat: number; lng: number; displayName: string }>>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [geocoding, setGeocoding] = useState(false);
    const [geocodingError, setGeocodingError] = useState<string | null>(null);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Detect zone when pin location changes (form mode)
    useEffect(() => {
        if (mode === 'form' && pinLat && pinLng && zones.length > 0) {
            const detected = detectZoneFromPin(pinLat, pinLng, zones);
            setDetectedZone(detected);
        } else if (zone) {
            setDetectedZone(zone);
        }
    }, [pinLat, pinLng, zones, mode, zone]);

    // Reverse geocode when pin is selected
    useEffect(() => {
        if (mode === 'form' && pinLat && pinLng && onAddressChange) {
            const timeoutId = setTimeout(async () => {
                setGeocoding(true);
                setGeocodingError(null);

                try {
                    const result = await reverseGeocode(pinLat, pinLng);

                    if (result && onAddressChange) {
                        // Populate the full address field
                        if (result.displayName) {
                            onAddressChange('lot_address', result.displayName);
                        }

                        // Populate structured address fields in the background
                        if (result.address.province) onAddressChange('province', result.address.province);
                        if (result.address.municipality) onAddressChange('municipality', result.address.municipality);
                        if (result.address.barangay) onAddressChange('barangay', result.address.barangay);
                        if (result.address.street) onAddressChange('street_name', result.address.street);

                        setGeocodingError(null);
                    }
                } catch (error) {
                    console.error('Reverse geocoding failed:', error);
                    setGeocodingError('Failed to fetch address details. You can still type it manually.');
                } finally {
                    setGeocoding(false);
                }
            }, 800);

            return () => clearTimeout(timeoutId);
        }
    }, [pinLat, pinLng, mode, onAddressChange]);

    const handleLocationSelect = (lat: number, lng: number) => {
        if (onLocationSelect) {
            onLocationSelect(lat, lng);
        }
    };

    const handleAddressSearch = async (query: string) => {
        setSearchQuery(query);
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

        if (query.length < 3) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        searchTimeoutRef.current = setTimeout(async () => {
            try {
                const results = await searchAddressSuggestions(query, 10);
                setSuggestions(results);
                setShowSuggestions(results.length > 0);
            } catch (error) {
                console.error('Search failed:', error);
            }
        }, 600);
    };

    const handleSuggestionSelect = async (suggestion: { lat: number; lng: number; displayName: string }) => {
        setSearchQuery(suggestion.displayName);
        setShowSuggestions(false);

        if (onAddressChange) onAddressChange('lot_address', suggestion.displayName);
        if (onLocationSelect) onLocationSelect(suggestion.lat, suggestion.lng);

        try {
            const result = await reverseGeocode(suggestion.lat, suggestion.lng);
            if (result && onAddressChange) {
                if (result.address.province) onAddressChange('province', result.address.province);
                if (result.address.municipality) onAddressChange('municipality', result.address.municipality);
                if (result.address.barangay) onAddressChange('barangay', result.address.barangay);
                if (result.address.street) onAddressChange('street_name', result.address.street);
            }
        } catch (error) {
            console.error('Geocoding details failed:', error);
        }
    };

    // View Mode
    if (mode === 'view') {
        return (
            <div className="space-y-4">
                {showMap && pinLat && pinLng && (
                    <MapDisplay
                        latitude={pinLat}
                        longitude={pinLng}
                        zone={detectedZone || undefined}
                        height="300px"
                    />
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <span className="flex items-center gap-1 mb-1 text-gray-500 dark:text-gray-400 text-sm">
                            <MapPin size={14} />
                            Property Address
                        </span>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                            {lotAddress || `${streetName}, ${barangay}, ${municipality}, ${province}`.replace(/^[ ,]+|[ ,]+$/g, '')}
                        </p>
                    </div>
                    {detectedZone && (
                        <div>
                            <span className="block mb-1 text-gray-500 dark:text-gray-400 text-sm">Zone</span>
                            <p className="font-medium text-gray-900 dark:text-white text-sm">
                                {detectedZone.name} ({detectedZone.code})
                            </p>
                        </div>
                    )}
                </div>
                {pinLat && pinLng && <CoordinateDisplay latitude={pinLat} longitude={pinLng} />}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Map Picker */}
            <div>
                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                    Pin Location on Map *
                </label>
                <MapPicker
                    latitude={pinLat || undefined}
                    longitude={pinLng || undefined}
                    onLocationSelect={handleLocationSelect}
                    error={errors.pin_lat || errors.pin_lng}
                    zones={zones}
                />

                {geocoding && (
                    <div className="flex items-center gap-2 mt-2 text-blue-600 dark:text-blue-400 text-xs">
                        <Loader2 size={12} className="animate-spin" />
                        <span>Autofilling address details...</span>
                    </div>
                )}

                {detectedZone && (
                    <div className="flex items-center gap-2 mt-2 text-green-600 dark:text-green-400 text-sm font-medium">
                        <CheckCircle size={16} />
                        <span>Zone detected: {detectedZone.name} ({detectedZone.code})</span>
                    </div>
                )}
            </div>

            {/* Address Search */}
            <div>
                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                    Search or Type Address *
                </label>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        id="lot_address"
                        name="lot_address"
                        type="text"
                        value={lotAddress}
                        onChange={(e) => {
                            onAddressChange?.('lot_address', e.target.value);
                            handleAddressSearch(e.target.value);
                        }}
                        placeholder="Search for an address or type manually..."
                        className={`w-full pl-10 pr-3 py-2 bg-white dark:bg-dark-surface border rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent ${errors.lot_address ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                    />

                    {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                            {suggestions.map((s, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => handleSuggestionSelect(s)}
                                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm text-gray-700 dark:text-gray-300"
                                >
                                    {s.displayName}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                {errors.lot_address && <p className="mt-1 text-red-500 text-xs">{errors.lot_address}</p>}
            </div>

            {/* Zone Display (Fallback/Info) */}
            {detectedZone && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                        Zoning Information Loaded
                    </h4>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                        Location: {detectedZone.name}
                    </p>
                </div>
            )}
        </div>
    );
}
