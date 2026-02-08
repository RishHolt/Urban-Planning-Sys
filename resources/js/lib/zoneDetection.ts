import * as turf from '@turf/turf';

export interface Zone {
    id: number;
    code: string;
    name: string;
    geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon;
    color?: string;
    boundary_type?: 'municipal' | 'barangay' | 'zoning';
}

// Cache for zone bounding boxes (spatial indexing)
const zoneBoundsCache = new Map<number, turf.BBox>();

/**
 * Get bounding box for a zone (cached).
 */
function getZoneBounds(zone: Zone): turf.BBox | null {
    if (!zone.geometry) {
        return null;
    }

    if (zoneBoundsCache.has(zone.id)) {
        return zoneBoundsCache.get(zone.id)!;
    }

    try {
        let feature: turf.Feature<turf.Polygon | turf.MultiPolygon>;

        if (zone.geometry.type === 'Polygon') {
            feature = turf.polygon(zone.geometry.coordinates);
        } else {
            feature = turf.multiPolygon(zone.geometry.coordinates);
        }

        const bbox = turf.bbox(feature);
        zoneBoundsCache.set(zone.id, bbox);

        return bbox;
    } catch (error) {
        console.error('Error calculating zone bounds:', error);
        return null;
    }
}

/**
 * Quick check if point is within bounding box (faster than full geometry check).
 */
function pointInBBox(lng: number, lat: number, bbox: turf.BBox): boolean {
    return lng >= bbox[0] && lng <= bbox[2] && lat >= bbox[1] && lat <= bbox[3];
}

/**
 * Detect which zone a pin location falls within (optimized with spatial indexing).
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

    // First pass: quick bounding box check to filter zones
    const candidateZones: Zone[] = [];

    for (const zone of zones) {
        if (!zone.geometry) {
            continue;
        }

        // Skip boundary zones (municipal and barangay) from detection
        if (zone.boundary_type === 'municipal' || zone.boundary_type === 'barangay') {
            continue;
        }

        const bbox = getZoneBounds(zone);
        if (bbox && pointInBBox(lng, lat, bbox)) {
            candidateZones.push(zone);
        }
    }

    // Second pass: precise geometry check only on candidates
    for (const zone of candidateZones) {
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

/**
 * Clear the zone bounds cache (useful when zones are updated).
 */
export function clearZoneBoundsCache(): void {
    zoneBoundsCache.clear();
}
