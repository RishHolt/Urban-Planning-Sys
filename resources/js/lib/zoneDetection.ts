import * as turf from '@turf/turf';

export interface Zone {
    id: number;
    code: string;
    name: string;
    geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon;
    color?: string;
}

/**
 * Detect which zone a pin location falls within.
 * @param lat Latitude of the pin
 * @param lng Longitude of the pin
 * @param zones Array of zones with geometry
 * @returns The first matching zone or null
 */
export function detectZoneFromPin(
    lat: number,
    lng: number,
    zones: Zone[]
): Zone | null {
    const point = turf.point([lng, lat]);

    for (const zone of zones) {
        if (!zone.geometry) {
            continue;
        }

        try {
            // Handle both Polygon and MultiPolygon
            if (zone.geometry.type === 'Polygon') {
                const polygon = turf.polygon(zone.geometry.coordinates);
                if (turf.booleanPointInPolygon(point, polygon)) {
                    return zone;
                }
            } else if (zone.geometry.type === 'MultiPolygon') {
                const multiPolygon = turf.multiPolygon(zone.geometry.coordinates);
                if (turf.booleanPointInPolygon(point, multiPolygon)) {
                    return zone;
                }
            }
        } catch (error) {
            console.error('Error checking zone:', error, zone);
            continue;
        }
    }

    return null;
}
