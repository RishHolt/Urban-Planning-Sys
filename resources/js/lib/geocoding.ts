/**
 * Geocoding utilities using OpenStreetMap Nominatim API
 * Free, no API key required
 */

export interface GeocodeResult {
    lat: number;
    lng: number;
    displayName: string;
    address: {
        province?: string;
        municipality?: string;
        city?: string;
        barangay?: string;
        street?: string;
        houseNumber?: string;
    };
}

/**
 * Geocode an address string to coordinates
 */
export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
    try {
        const encodedAddress = encodeURIComponent(`${address}, Philippines`);
        const url = `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1&addressdetails=1&countrycodes=ph`;

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Urban-User-Application/1.0', // Required by Nominatim
            },
        });

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        if (!data || data.length === 0) {
            return null;
        }

        const result = data[0];
        const addressParts = result.address || {};

        return {
            lat: parseFloat(result.lat),
            lng: parseFloat(result.lon),
            displayName: result.display_name,
            address: {
                province: addressParts.state || addressParts.province,
                municipality: addressParts.city || addressParts.municipality || addressParts.town,
                city: addressParts.city,
                barangay: addressParts.suburb || addressParts.village || addressParts.neighbourhood,
                street: addressParts.road || addressParts.street,
                houseNumber: addressParts.house_number,
            },
        };
    } catch (error) {
        console.error('Geocoding error:', error);
        return null;
    }
}

/**
 * Reverse geocode coordinates to address
 */
export async function reverseGeocode(lat: number, lng: number): Promise<GeocodeResult | null> {
    try {
        const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&countrycodes=ph`;

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Urban-User-Application/1.0',
            },
        });

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        if (!data || !data.address) {
            return null;
        }

        const addressParts = data.address;

        return {
            lat,
            lng,
            displayName: data.display_name,
            address: {
                province: addressParts.state || addressParts.province,
                municipality: addressParts.city || addressParts.municipality || addressParts.town,
                city: addressParts.city,
                barangay: addressParts.suburb || addressParts.village || addressParts.neighbourhood,
                street: addressParts.road || addressParts.street,
                houseNumber: addressParts.house_number,
            },
        };
    } catch (error) {
        console.error('Reverse geocoding error:', error);
        return null;
    }
}


/**
 * Search for address suggestions (autocomplete)
 * Enhanced with better parameters for Philippine addresses
 */
export async function searchAddressSuggestions(query: string, limit: number = 10): Promise<GeocodeResult[]> {
    if (!query || query.length < 3) {
        return [];
    }

    try {
        // Add Philippines to query if not already present
        const searchQuery = query.toLowerCase().includes('philippines')
            ? query
            : `${query}, Philippines`;

        const encodedQuery = encodeURIComponent(searchQuery);

        // Philippine boundaries for more accurate results
        // Approximate bounds: North Luzon to South Mindanao
        const viewbox = '116.8,4.5,126.8,21.2'; // minLon,minLat,maxLon,maxLat

        const url = `https://nominatim.openstreetmap.org/search?` +
            `q=${encodedQuery}` +
            `&format=json` +
            `&limit=${limit}` +
            `&addressdetails=1` +
            `&countrycodes=ph` +
            `&viewbox=${viewbox}` +
            `&bounded=1` + // Prefer results within viewbox
            `&dedupe=1`; // Remove duplicate results

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Urban-User-Application/1.0',
            },
        });

        if (!response.ok) {
            console.warn('Nominatim API error:', response.status);
            return [];
        }

        const data = await response.json();
        if (!data || !Array.isArray(data)) {
            return [];
        }

        // Filter and rank results for Philippine context
        return data
            .filter(item => {
                // Ensure result has valid coordinates
                return item.lat && item.lon && item.address;
            })
            .map((item) => {
                const addressParts = item.address || {};
                return {
                    lat: parseFloat(item.lat),
                    lng: parseFloat(item.lon),
                    displayName: item.display_name,
                    address: {
                        province: addressParts.state || addressParts.province || addressParts.region,
                        municipality: addressParts.city || addressParts.municipality || addressParts.town || addressParts.county,
                        city: addressParts.city,
                        barangay: addressParts.suburb || addressParts.village || addressParts.neighbourhood || addressParts.hamlet,
                        street: addressParts.road || addressParts.street || addressParts.footway,
                        houseNumber: addressParts.house_number,
                    },
                };
            });
    } catch (error) {
        console.error('Address search error:', error);
        return [];
    }
}
