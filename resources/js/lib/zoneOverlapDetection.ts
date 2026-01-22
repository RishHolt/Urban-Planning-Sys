import * as turf from '@turf/turf';

interface Zone {
    id: string;
    code: string;
    geometry?: GeoJSON.Polygon | GeoJSON.MultiPolygon | null;
}

/**
 * Check if a new geometry overlaps with existing zones.
 * @param newGeometry The new geometry to check
 * @param existingZones Array of existing zones with geometry
 * @param excludeZoneId Optional zone ID to exclude from overlap check (for updates)
 * @returns Array of overlapping zone IDs and codes
 */
export function checkZoneOverlap(
    newGeometry: GeoJSON.Polygon | GeoJSON.MultiPolygon,
    existingZones: Zone[],
    excludeZoneId?: string
): Array<{ id: string; code: string }> {
    const overlappingZones: Array<{ id: string; code: string }> = [];

    try {
        const newFeature = newGeometry.type === 'Polygon'
            ? turf.polygon(newGeometry.coordinates)
            : turf.multiPolygon(newGeometry.coordinates);

        for (const zone of existingZones) {
            // Skip if this is the zone being updated
            if (excludeZoneId && zone.id === excludeZoneId) {
                continue;
            }

            // Skip zones without geometry
            if (!zone.geometry) {
                continue;
            }

            try {
                const existingFeature = zone.geometry.type === 'Polygon'
                    ? turf.polygon(zone.geometry.coordinates)
                    : turf.multiPolygon(zone.geometry.coordinates);

                // Check for intersection
                const intersection = turf.intersect(newFeature, existingFeature);

                if (intersection) {
                    // Check if intersection has significant area (not just a point or line)
                    const intersectionArea = turf.area(intersection);
                    const newArea = turf.area(newFeature);
                    const existingArea = turf.area(existingFeature);

                    // Consider it an overlap if intersection is more than 1% of either polygon
                    const threshold = Math.min(newArea, existingArea) * 0.01;

                    if (intersectionArea > threshold) {
                        overlappingZones.push({
                            id: zone.id,
                            code: zone.code,
                        });
                    }
                }
            } catch (error) {
                console.error(`Error checking overlap with zone ${zone.code}:`, error);
                continue;
            }
        }
    } catch (error) {
        console.error('Error in overlap detection:', error);
    }

    return overlappingZones;
}
