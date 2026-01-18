import { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Search, Loader2 } from 'lucide-react';

interface StreetSuggestion {
    display_name: string;
    lat: string;
    lon: string;
    address?: {
        road?: string;
        suburb?: string;
        city?: string;
        municipality?: string;
    };
}

interface StreetAutocompleteProps {
    value: string;
    onChange: (value: string) => void;
    onStreetSelect?: (street: { name: string; lat: number; lng: number }) => void;
    municipality?: string;
    barangay?: string;
    province?: string;
    placeholder?: string;
    error?: string;
    icon?: React.ReactNode;
    label?: string;
    required?: boolean;
}

export default function StreetAutocomplete({
    value,
    onChange,
    onStreetSelect,
    municipality,
    barangay,
    province,
    placeholder = 'Enter street name',
    error,
    icon,
    label,
    required = false,
}: StreetAutocompleteProps) {
    const [suggestions, setSuggestions] = useState<StreetSuggestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Search using Overpass API to get streets from OpenStreetMap directly
    const searchOverpassStreets = useCallback(async (query: string, bbox: string | null): Promise<StreetSuggestion[]> => {
        if (!bbox || !municipality) {
            return [];
        }

        // Rate limiting: check if we've called Overpass recently
        const lastOverpassCall = sessionStorage.getItem('lastOverpassCall');
        const now = Date.now();
        if (lastOverpassCall && now - parseInt(lastOverpassCall) < 3000) {
            // Wait at least 3 seconds between Overpass calls to avoid rate limits
            return [];
        }

        const [minLat, minLon, maxLat, maxLon] = bbox.split(',').map(Number);
        
        // Overpass query to find ways (streets) with names matching the query
        // Bounding box format: (south,west,north,east)
        const overpassQuery = `
            [out:json][timeout:5];
            (
              way["highway"]["name"~"${query}",i](${minLat},${minLon},${maxLat},${maxLon});
            );
            out center meta;
        `;

        try {
            sessionStorage.setItem('lastOverpassCall', now.toString());
            
            const response = await fetch('https://overpass-api.de/api/interpreter', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `data=${encodeURIComponent(overpassQuery)}`,
            });

            if (!response.ok) {
                if (response.status === 429) {
                    console.warn('Overpass API rate limited');
                    return [];
                }
                throw new Error('Overpass API unavailable');
            }

            const data = await response.json();
            const results: StreetSuggestion[] = [];

            if (data.elements) {
                for (const element of data.elements.slice(0, 5)) {
                    if (element.tags?.name && element.center) {
                        results.push({
                            display_name: `${element.tags.name}, ${municipality || ''}, ${province || 'Philippines'}`,
                            lat: element.center.lat.toString(),
                            lon: element.center.lon.toString(),
                            address: {
                                road: element.tags.name,
                                city: municipality,
                                municipality: municipality,
                            },
                        });
                    }
                }
            }

            return results;
        } catch (err) {
            console.warn('Overpass API search error:', err);
            return [];
        }
    }, [municipality, province]);

    // Get bounding box for the area (municipality/barangay)
    const getBoundingBox = useCallback((): string | null => {
        // These are approximate bounding boxes for municipalities
        // In production, these would come from a database or API
        const municipalityBounds: Record<string, string> = {
            'Manila': '14.5200,120.9500,14.6500,121.0500',
            'Quezon City': '14.6000,121.0000,14.7500,121.1000',
            'Makati': '14.5300,121.0000,14.5800,121.0500',
            'Pasig': '14.5500,121.0500,14.6000,121.1000',
            'Taguig': '14.4800,121.0200,14.5500,121.0800',
        };

        if (municipality && municipalityBounds[municipality]) {
            return municipalityBounds[municipality];
        }

        // Default bounding box for Philippines (Metro Manila area)
        return '14.4000,120.8000,14.8000,121.2000';
    }, [municipality]);

    // Search for streets using Nominatim (OpenStreetMap) with bounding box
    const searchStreets = useCallback(
        async (query: string) => {
            if (!query || query.length < 2) {
                setSuggestions([]);
                return;
            }

            setIsLoading(true);

            try {
                const bbox = getBoundingBox();
                
                // Build search query - just the street name, location context helps but don't overcomplicate
                let searchQuery = query;
                if (municipality) {
                    searchQuery += `, ${municipality}`;
                }
                if (province) {
                    searchQuery += `, ${province}`;
                }
                searchQuery += ', Philippines';

                const encodedQuery = encodeURIComponent(searchQuery);
                
                // Use Nominatim API - try without viewbox first to avoid 400 errors
                let url = `https://nominatim.openstreetmap.org/search?q=${encodedQuery}&format=json&addressdetails=1&limit=10`;
                
                let response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'User-Agent': 'UrbanUserApp/1.0',
                        'Accept': 'application/json',
                        'Referer': window.location.origin,
                    },
                });

                // If first request fails, try with viewbox
                if (!response.ok && bbox) {
                    const [minLat, minLon, maxLat, maxLon] = bbox.split(',').map(Number);
                    const viewboxUrl = `${url}&viewbox=${minLon},${minLat},${maxLon},${maxLat}&bounded=1`;
                    response = await fetch(viewboxUrl, {
                        method: 'GET',
                        headers: {
                            'User-Agent': 'UrbanUserApp/1.0',
                            'Accept': 'application/json',
                            'Referer': window.location.origin,
                        },
                    });
                }

                if (!response.ok) {
                    console.warn('Nominatim API error:', response.status, response.statusText);
                    // Try Overpass API as fallback
                    if (municipality && bbox) {
                        try {
                            const overpassResults = await searchOverpassStreets(query, bbox);
                            if (overpassResults.length > 0) {
                                setSuggestions(overpassResults);
                                setShowSuggestions(true);
                                setIsLoading(false);
                                return;
                            }
                        } catch (overpassErr) {
                            console.warn('Overpass API also failed:', overpassErr);
                        }
                    }
                    setSuggestions([]);
                    setShowSuggestions(false);
                    setIsLoading(false);
                    return;
                }

                const data: StreetSuggestion[] = await response.json();

                // Filter to only include results with road/street names
                const streetResults = data
                    .filter(
                        (item) =>
                            item.address?.road &&
                            item.lat &&
                            item.lon &&
                            item.display_name.toLowerCase().includes(query.toLowerCase())
                    )
                    .slice(0, 5); // Limit to 5 results

                // Also try Overpass API to get street names from the map area (streets visible on map)
                if (streetResults.length < 5 && municipality && bbox) {
                    const overpassResults = await searchOverpassStreets(query, bbox);
                    // Merge and deduplicate results
                    const existingNames = new Set(streetResults.map(r => r.address?.road?.toLowerCase()));
                    const newResults = overpassResults.filter(
                        r => r.address?.road && !existingNames.has(r.address.road.toLowerCase())
                    );
                    streetResults.push(...newResults.slice(0, 5 - streetResults.length));
                }

                setSuggestions(streetResults);
                // Always show dropdown when we have results
                setShowSuggestions(streetResults.length > 0);
            } catch (err) {
                console.error('Error searching streets:', err);
                setSuggestions([]);
                setShowSuggestions(false);
            } finally {
                setIsLoading(false);
            }
        },
        [municipality, province, getBoundingBox, searchOverpassStreets]
    );

    // Debounced search
    useEffect(() => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        if (value && value.length >= 2) {
            debounceTimerRef.current = setTimeout(() => {
                searchStreets(value);
            }, 300);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }

        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [value, searchStreets]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        onChange(newValue);
        setShowSuggestions(true);
        setSelectedIndex(-1);
    };

    const handleStreetSelect = (suggestion: StreetSuggestion) => {
        const streetName = suggestion.address?.road || suggestion.display_name.split(',')[0];
        onChange(streetName);
        setShowSuggestions(false);
        setSuggestions([]);

        if (onStreetSelect && suggestion.lat && suggestion.lon) {
            onStreetSelect({
                name: streetName,
                lat: parseFloat(suggestion.lat),
                lng: parseFloat(suggestion.lon),
            });
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!showSuggestions || suggestions.length === 0) {
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
                    handleStreetSelect(suggestions[selectedIndex]);
                }
                break;
            case 'Escape':
                setShowSuggestions(false);
                break;
        }
    };

    const handleFocus = () => {
        if (suggestions.length > 0) {
            setShowSuggestions(true);
        }
    };

    const handleBlur = () => {
        // Delay to allow click on suggestion
        setTimeout(() => {
            setShowSuggestions(false);
        }, 200);
    };

    return (
        <div className="w-full relative">
            {label && (
                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <div className="top-1/2 left-3 absolute text-gray-400 -translate-y-1/2">
                        {icon}
                    </div>
                )}
                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    className={`
                        w-full px-4 py-3 rounded-lg border transition-colors
                        ${icon ? 'pl-10' : ''}
                        ${error
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                            : 'border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary'
                        }
                        bg-white dark:bg-dark-surface
                        text-gray-900 dark:text-white
                        placeholder:text-gray-400 dark:placeholder:text-gray-500
                        focus:outline-none focus:ring-2 focus:ring-opacity-20
                    `}
                />
                {isLoading && (
                    <div className="top-1/2 right-3 absolute -translate-y-1/2">
                        <Loader2 className="text-gray-400 animate-spin" size={20} />
                    </div>
                )}
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && (suggestions.length > 0 || isLoading) && (
                <div
                    ref={suggestionsRef}
                    className="absolute z-50 w-full mt-1 bg-white dark:bg-dark-surface border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                >
                    {isLoading && suggestions.length === 0 ? (
                        <div className="px-4 py-3 text-center text-gray-500 dark:text-gray-400 text-sm">
                            <Loader2 className="inline-block mr-2 animate-spin" size={16} />
                            Searching streets...
                        </div>
                    ) : suggestions.length > 0 ? (
                        suggestions.map((suggestion, index) => {
                        const streetName = suggestion.address?.road || suggestion.display_name.split(',')[0];
                        const fullAddress = suggestion.display_name;

                        return (
                            <button
                                key={index}
                                type="button"
                                onClick={() => handleStreetSelect(suggestion)}
                                onMouseEnter={() => setSelectedIndex(index)}
                                className={`
                                    w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors
                                    ${selectedIndex === index ? 'bg-gray-50 dark:bg-gray-800' : ''}
                                    ${index !== suggestions.length - 1 ? 'border-b border-gray-200 dark:border-gray-700' : ''}
                                `}
                            >
                                <div className="flex items-start gap-2">
                                    <MapPin size={16} className="text-primary mt-0.5 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                                            {streetName}
                                        </p>
                                        <p className="text-gray-500 dark:text-gray-400 text-xs truncate">
                                            {fullAddress}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        );
                    })
                    ) : (
                        <div className="px-4 py-3 text-center text-gray-500 dark:text-gray-400 text-sm">
                            No streets found. Try a different search term.
                        </div>
                    )}
                </div>
            )}

            {error && <p className="mt-1 text-red-500 text-sm">{error}</p>}
        </div>
    );
}
