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
 */
export async function searchAddressSuggestions(query: string, limit: number = 5): Promise<GeocodeResult[]> {
    if (!query || query.length < 3) {
        return [];
    }

    try {
        const encodedQuery = encodeURIComponent(`${query}, Philippines`);
        const url = `https://nominatim.openstreetmap.org/search?q=${encodedQuery}&format=json&limit=${limit}&addressdetails=1&countrycodes=ph`;

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Urban-User-Application/1.0',
            },
        });

        if (!response.ok) {
            return [];
        }

        const data = await response.json();
        if (!data || !Array.isArray(data)) {
            return [];
        }

        return data.map((item) => {
            const addressParts = item.address || {};
            return {
                lat: parseFloat(item.lat),
                lng: parseFloat(item.lon),
                displayName: item.display_name,
                address: {
                    province: addressParts.state || addressParts.province,
                    municipality: addressParts.city || addressParts.municipality || addressParts.town,
                    city: addressParts.city,
                    barangay: addressParts.suburb || addressParts.village || addressParts.neighbourhood,
                    street: addressParts.road || addressParts.street,
                    houseNumber: addressParts.house_number,
                },
            };
        });
    } catch (error) {
        console.error('Address search error:', error);
        return [];
    }
}
