import * as turf from '@turf/turf';

export interface Zone {
    id: number;
    code: string;
    name: string;
    label?: string;
    geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon;
    color?: string;
    boundary_type?: 'municipal' | 'barangay' | 'zoning';
}

// Cache for zone bounding boxes (spatial indexing)
const zoneBoundsCache = new Map<number, any>();

/**
 * Helper to ensure a polygon ring is closed (first and last positions are identical).
 */
export function closeRing(ring: number[][]): number[][] {
    if (ring.length === 0) {
        return ring;
    }
    const [fx, fy] = ring[0];
    const [lx, ly] = ring[ring.length - 1];
    return (fx === lx && fy === ly) ? ring : [...ring, ring[0]];
}

/**
 * Helper to close all rings in a Polygon or MultiPolygon geometry.
 */
export function closeGeometry(geom: GeoJSON.Polygon | GeoJSON.MultiPolygon): number[][] | number[][][] | number[][][][] {
    if (geom.type === 'Polygon') {
        return geom.coordinates.map(closeRing);
    } else {
        return (geom.coordinates as number[][][][]).map(poly => poly.map(closeRing));
    }
}

/**
 * Get bounding box for a zone (cached).
 */
function getZoneBounds(zone: Zone): any | null {
    if (!zone.geometry) {
        return null;
    }

    if (zoneBoundsCache.has(zone.id)) {
        return zoneBoundsCache.get(zone.id)!;
    }

    try {
        let feature: any;

        if (zone.geometry.type === 'Polygon') {
            feature = turf.polygon(closeGeometry(zone.geometry) as number[][][]);
        } else {
            feature = turf.multiPolygon(closeGeometry(zone.geometry) as number[][][][]);
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
function pointInBBox(lng: number, lat: number, bbox: any): boolean {
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
        if (isPointInZone(lat, lng, zone)) {
            return zone;
        }
    }

    return null;
}

/**
 * Detect which barangay a pin location falls within.
 */
export function detectBarangayFromPin(
    lat: number,
    lng: number,
    zones: Zone[]
): Zone | null {
    const barangayZones = zones.filter(z => z.boundary_type === 'barangay');
    
    for (const zone of barangayZones) {
        if (isPointInZone(lat, lng, zone)) {
            return zone;
        }
    }

    return null;
}

/**
 * Check if a point is within a zone's geometry.
 */
export function isPointInZone(lat: number, lng: number, zone: Zone): boolean {
    if (!zone.geometry) {
        return false;
    }

    try {
        const point = turf.point([lng, lat]);
        // Handle both Polygon and MultiPolygon
        if (zone.geometry.type === 'Polygon') {
            const polygon = turf.polygon(closeGeometry(zone.geometry) as number[][][]);
            return turf.booleanPointInPolygon(point, polygon);
        } else if (zone.geometry.type === 'MultiPolygon') {
            const multiPolygon = turf.multiPolygon(closeGeometry(zone.geometry) as number[][][][]);
            return turf.booleanPointInPolygon(point, multiPolygon);
        }
    } catch (error) {
        console.error('Error checking if point is in zone:', error, zone);
    }
    return false;
}

/**
 * Check if a pin location is within the municipal boundary zone.
 * Returns true if no municipal boundary exists (no restriction).
 */
export function isPinWithinMunicipality(lat: number, lng: number, municipalBoundary: Zone | null): boolean {
    if (!municipalBoundary || !municipalBoundary.geometry) {
        return true; // No boundary defined — allow anywhere
    }

    try {
        const pt = turf.point([lng, lat]);
        if (municipalBoundary.geometry.type === 'Polygon') {
            return turf.booleanPointInPolygon(pt, turf.polygon(closeGeometry(municipalBoundary.geometry) as number[][][]));
        } else if (municipalBoundary.geometry.type === 'MultiPolygon') {
            return turf.booleanPointInPolygon(pt, turf.multiPolygon(closeGeometry(municipalBoundary.geometry) as number[][][][]));
        }
    } catch {
        // Geometry error — don't block the user
        return true;
    }

    return true;
}

/**
 * Clear the zone bounds cache (useful when zones are updated).
 */
export function clearZoneBoundsCache(): void {
    zoneBoundsCache.clear();
}
