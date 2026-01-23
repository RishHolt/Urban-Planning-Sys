import { useState, useEffect, useMemo, useRef } from 'react';
import MapPicker from '../MapPicker';
import MapDisplay from '../MapDisplay';
import CoordinateDisplay from '../CoordinateDisplay';
import Input from '../Input';
import { detectZoneFromPin, Zone } from '../../lib/zoneDetection';
import { searchAddressSuggestions, reverseGeocode } from '../../lib/geocoding';
import { MapPin, CheckCircle, AlertCircle, Search, Loader2 } from 'lucide-react';

// Address data (same as PropertyLocationStep)
const PROVINCES = ['Metro Manila', 'Cavite', 'Laguna', 'Rizal', 'Bulacan'];
const MUNICIPALITIES: Record<string, string[]> = {
    'Metro Manila': ['Manila', 'Quezon City', 'Makati', 'Pasig', 'Taguig'],
    'Cavite': ['Bacoor', 'Imus', 'Dasmarinas', 'General Trias'],
    'Laguna': ['Calamba', 'San Pedro', 'Biñan', 'Santa Rosa'],
    'Rizal': ['Antipolo', 'Taytay', 'Cainta', 'Angono'],
    'Bulacan': ['Malolos', 'Meycauayan', 'Marilao', 'San Jose del Monte'],
};

const BARANGAYS: Record<string, string[]> = {
    'Manila': ['Ermita', 'Malate', 'Intramuros', 'Binondo', 'Quiapo'],
    'Quezon City': ['Diliman', 'Cubao', 'Kamuning', 'Project 4', 'Project 6'],
    'Makati': ['Bel-Air', 'Poblacion', 'San Antonio', 'Guadalupe'],
    'Pasig': ['Ortigas', 'San Antonio', 'Rosario', 'Santolan'],
    'Taguig': ['Fort Bonifacio', 'Upper Bicutan', 'Lower Bicutan', 'Tuktukan'],
};

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
    const [addressMode, setAddressMode] = useState<'full' | 'structured'>('full');
    const [detectedZone, setDetectedZone] = useState<Zone | null>(zone || null);
    const [loadingZones, setLoadingZones] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState<Array<{ lat: number; lng: number; displayName: string }>>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [geocoding, setGeocoding] = useState(false);
    const [geocodingError, setGeocodingError] = useState<string | null>(null);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Load zones if not provided and in form mode
    useEffect(() => {
        if (mode === 'form' && zones.length === 0) {
            setLoadingZones(true);
            fetch('/api/zones')
                .then(res => res.json())
                .then(data => {
                    // Zones will be passed via props, this is fallback
                    setLoadingZones(false);
                })
                .catch(() => {
                    setLoadingZones(false);
                });
        }
    }, [mode, zones.length]);

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

                        // Populate structured address fields
                        if (result.address.province) {
                            onAddressChange('province', result.address.province);
                        }
                        if (result.address.municipality) {
                            onAddressChange('municipality', result.address.municipality);
                        }
                        if (result.address.barangay) {
                            onAddressChange('barangay', result.address.barangay);
                        }
                        if (result.address.street) {
                            onAddressChange('street_name', result.address.street);
                        }

                        setGeocodingError(null);
                    } else {
                        setGeocodingError('Unable to determine address for this location.');
                    }
                } catch (error) {
                    console.error('Reverse geocoding failed:', error);
                    setGeocodingError('Failed to fetch address. Please enter manually.');
                } finally {
                    setGeocoding(false);
                }
            }, 800); // Slightly longer debounce for API stability

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

        // Clear previous timeout if exists
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        if (query.length < 3) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        // Debounce the search with 600ms delay to respect Nominatim rate limits
        searchTimeoutRef.current = setTimeout(async () => {
            try {
                const results = await searchAddressSuggestions(query, 10);
                setSuggestions(results);
                setShowSuggestions(results.length > 0);
            } catch (error) {
                console.error('Search failed:', error);
                setSuggestions([]);
                setShowSuggestions(false);
            }
        }, 600);
    };

    const handleSuggestionSelect = async (suggestion: { lat: number; lng: number; displayName: string }) => {
        setSearchQuery(suggestion.displayName);
        setShowSuggestions(false);

        // Immediately update lot_address with the selected suggestion
        if (onAddressChange) {
            onAddressChange('lot_address', suggestion.displayName);
        }

        // Update pin location
        if (onLocationSelect) {
            onLocationSelect(suggestion.lat, suggestion.lng);
        }

        // Then reverse geocode to populate structured fields (province, municipality, etc.)
        // This runs in background and won't overwrite lot_address
        try {
            const result = await reverseGeocode(suggestion.lat, suggestion.lng);
            if (result && onAddressChange) {
                if (result.address.province) onAddressChange('province', result.address.province);
                if (result.address.municipality) onAddressChange('municipality', result.address.municipality);
                if (result.address.barangay) onAddressChange('barangay', result.address.barangay);
                if (result.address.street) onAddressChange('street_name', result.address.street);
                // Note: We don't override lot_address here since user selected a specific address
            }
        } catch (error) {
            console.error('Failed to get address details:', error);
        }
    };

    const municipalitiesList = province ? MUNICIPALITIES[province] || [] : [];
    const barangaysList = municipality ? BARANGAYS[municipality] || [] : [];

    // View Mode
    if (mode === 'view') {
        const formattedAddress = useMemo(() => {
            if (addressMode === 'structured' && (province || municipality || barangay || streetName)) {
                const parts = [];
                if (streetName) parts.push(streetName);
                if (barangay) parts.push(barangay);
                if (municipality) parts.push(municipality);
                if (province) parts.push(province);
                return parts.join(', ') || lotAddress;
            }
            return lotAddress;
        }, [addressMode, province, municipality, barangay, streetName, lotAddress]);

        return (
            <div className="space-y-4">
                {showMap && pinLat && pinLng && (
                    <div>
                        <MapDisplay
                            latitude={pinLat}
                            longitude={pinLng}
                            zone={detectedZone || undefined}
                            height="300px"
                        />
                    </div>
                )}
                <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                    <div>
                        <span className="flex items-center gap-1 mb-1 text-gray-500 dark:text-gray-400 text-sm">
                            <MapPin size={14} />
                            Address
                        </span>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                            {formattedAddress}
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
                {pinLat && pinLng && (
                    <CoordinateDisplay latitude={pinLat} longitude={pinLng} />
                )}
            </div>
        );
    }

    // Form/Edit Mode
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
                    <div className="flex items-center gap-2 mt-2 text-blue-600 dark:text-blue-400 text-sm">
                        <Loader2 size={14} className="animate-spin" />
                        <span>Getting address from location...</span>
                    </div>
                )}
                {geocodingError && (
                    <div className="flex items-center gap-2 mt-2 text-orange-600 dark:text-orange-400 text-sm">
                        <AlertCircle size={14} />
                        <span>{geocodingError}</span>
                    </div>
                )}
                {detectedZone && (
                    <div className="flex items-center gap-2 mt-2 text-green-600 dark:text-green-400">
                        <CheckCircle size={16} />
                        <span>Zone detected: {detectedZone.name} ({detectedZone.code})</span>
                    </div>
                )}
                {pinLat && pinLng && !detectedZone && (
                    <div className="flex items-center gap-2 mt-2 text-orange-600 dark:text-orange-400">
                        <AlertCircle size={16} />
                        <span>No zone detected at this location. Please select a different location.</span>
                    </div>
                )}
            </div>

            {/* Coordinate Display */}
            {pinLat && pinLng && (
                <CoordinateDisplay latitude={pinLat} longitude={pinLng} />
            )}

            {/* Address Search Autocomplete */}
            <div>
                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                    Search Address (Optional)
                </label>
                <div className="relative">
                    <div className="relative">
                        <Search className="top-1/2 left-3 absolute text-gray-400 -translate-y-1/2 transform" size={16} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => handleAddressSearch(e.target.value)}
                            placeholder="Search for an address..."
                            className="bg-white dark:bg-dark-surface py-2 pr-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg w-full text-gray-900 dark:text-white"
                        />
                    </div>
                    {showSuggestions && suggestions.length > 0 && (
                        <div className="z-10 absolute bg-white dark:bg-dark-surface shadow-lg mt-1 border border-gray-300 dark:border-gray-600 rounded-lg w-full max-h-60 overflow-y-auto">
                            {suggestions.map((suggestion, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => handleSuggestionSelect(suggestion)}
                                    className="hover:bg-gray-100 dark:hover:bg-gray-800 px-4 py-2 w-full text-gray-900 dark:text-white text-sm text-left"
                                >
                                    {suggestion.displayName}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Address Input Toggle */}
            <div>
                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                    Address Input Method
                </label>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => setAddressMode('full')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${addressMode === 'full'
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                            }`}
                    >
                        Full Address
                    </button>
                    <button
                        type="button"
                        onClick={() => setAddressMode('structured')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${addressMode === 'structured'
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                            }`}
                    >
                        Structured Address
                    </button>
                </div>
            </div>

            {/* Address Inputs */}
            {addressMode === 'full' ? (
                <div>
                    <Input
                        label="Lot Address *"
                        value={lotAddress}
                        onChange={(e) => onAddressChange?.('lot_address', e.target.value)}
                        error={errors.lot_address}
                        required
                    />
                </div>
            ) : (
                <div className="space-y-4">
                    <div>
                        <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                            Province
                        </label>
                        <select
                            value={province}
                            onChange={(e) => {
                                onAddressChange?.('province', e.target.value);
                                onAddressChange?.('municipality', '');
                                onAddressChange?.('barangay', '');
                            }}
                            className="bg-white dark:bg-dark-surface px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg w-full text-gray-900 dark:text-white"
                        >
                            <option value="">Select Province</option>
                            {PROVINCES.map((p) => (
                                <option key={p} value={p}>
                                    {p}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                            Municipality/City
                        </label>
                        <select
                            value={municipality}
                            onChange={(e) => {
                                onAddressChange?.('municipality', e.target.value);
                                onAddressChange?.('barangay', '');
                            }}
                            disabled={!province}
                            className="bg-white dark:bg-dark-surface disabled:opacity-50 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg w-full text-gray-900 dark:text-white disabled:cursor-not-allowed"
                        >
                            <option value="">Select Municipality</option>
                            {municipalitiesList.map((m) => (
                                <option key={m} value={m}>
                                    {m}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                            Barangay
                        </label>
                        <select
                            value={barangay}
                            onChange={(e) => onAddressChange?.('barangay', e.target.value)}
                            disabled={!municipality}
                            className="bg-white dark:bg-dark-surface disabled:opacity-50 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg w-full text-gray-900 dark:text-white disabled:cursor-not-allowed"
                        >
                            <option value="">Select Barangay</option>
                            {barangaysList.map((b) => (
                                <option key={b} value={b}>
                                    {b}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <Input
                            label="Street Name"
                            value={streetName}
                            onChange={(e) => onAddressChange?.('street_name', e.target.value)}
                            error={errors.street_name}
                            placeholder="e.g., Rizal Street"
                        />
                    </div>
                    <div>
                        <Input
                            label="Lot Address (Additional Details)"
                            value={lotAddress}
                            onChange={(e) => onAddressChange?.('lot_address', e.target.value)}
                            error={errors.lot_address}
                            placeholder="House number, building name, etc."
                        />
                        <p className="mt-1 text-gray-500 dark:text-gray-400 text-xs">Optional - Additional address details</p>
                    </div>
                </div>
            )}

            {/* Zone Display */}
            {detectedZone && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <h4 className="mb-2 font-semibold text-blue-900 dark:text-blue-200 text-sm">
                        Detected Zone: {detectedZone.name}
                    </h4>
                    <p className="text-blue-700 dark:text-blue-300 text-xs">
                        Code: {detectedZone.code}
                    </p>
                    {detectedZone.color && (
                        <div className="flex items-center gap-2 mt-2">
                            <div
                                className="rounded w-4 h-4"
                                style={{ backgroundColor: detectedZone.color }}
                            />
                            <span className="text-blue-700 dark:text-blue-300 text-xs">Zone Color</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
