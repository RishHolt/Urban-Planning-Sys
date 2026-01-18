import L from 'leaflet';
import * as turf from '@turf/turf';

/**
 * Generate a consistent color from a zoning code string.
 * Uses a simple hash function to ensure the same code always gets the same color.
 */
export function generatePolygonColor(zoningCode: string): string {
    let hash = 0;
    for (let i = 0; i < zoningCode.length; i++) {
        hash = zoningCode.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Generate a color with good contrast (avoid too light colors)
    const hue = Math.abs(hash) % 360;
    const saturation = 60 + (Math.abs(hash) % 20); // 60-80%
    const lightness = 40 + (Math.abs(hash) % 15); // 40-55%

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

/**
 * Convert HSL color string to RGB for use with opacity.
 * @param hslColor - HSL color string like "hsl(120, 70%, 50%)"
 * @param opacity - Opacity value between 0 and 1
 * @returns RGBA color string
 */
export function hslToRgba(hslColor: string, opacity: number = 1): string {
    const match = hslColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (!match) {
        return `rgba(128, 128, 128, ${opacity})`; // Fallback gray
    }

    const h = parseInt(match[1]) / 360;
    const s = parseInt(match[2]) / 100;
    const l = parseInt(match[3]) / 100;

    let r: number, g: number, b: number;

    if (s === 0) {
        r = g = b = l; // achromatic
    } else {
        const hue2rgb = (p: number, q: number, t: number): number => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${opacity})`;
}

/**
 * Calculate polygon area in square meters from GeoJSON geometry.
 * Uses Turf.js for accurate area calculation.
 */
export function calculatePolygonArea(geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon): number {
    try {
        if (geometry.type === 'Polygon') {
            const feature = turf.polygon(geometry.coordinates);
            return turf.area(feature); // Returns area in square meters
        } else if (geometry.type === 'MultiPolygon') {
            const feature = turf.multiPolygon(geometry.coordinates);
            return turf.area(feature); // Returns area in square meters
        }
        return 0;
    } catch (error) {
        console.error('Error calculating polygon area:', error);
        return 0;
    }
}

/**
 * Convert Leaflet layer to GeoJSON geometry.
 */
export function leafletToGeoJSON(layer: L.Layer): GeoJSON.Geometry | null {
    try {
        // Check if it's a Polygon (including Leaflet Draw polygons)
        if (layer instanceof L.Polygon || (layer as any).getLatLngs) {
            let latlngs: L.LatLng[] | L.LatLng[][];
            
            // Try to get latlngs using the method available on the layer
            if (typeof (layer as any).getLatLngs === 'function') {
                latlngs = (layer as any).getLatLngs();
            } else if (layer instanceof L.Polygon) {
                latlngs = layer.getLatLngs();
            } else {
                console.error('Layer does not have getLatLngs method:', layer);
                return null;
            }

            if (!latlngs || (Array.isArray(latlngs) && latlngs.length === 0)) {
                console.error('Invalid latlngs:', latlngs);
                return null;
            }

            const coordinates: number[][][] = [];
            
            // Check if first element is a LatLng object (has lat/lng properties) or an array
            const firstElement = latlngs[0];
            const isLatLngObject = firstElement && typeof firstElement === 'object' && 'lat' in firstElement && 'lng' in firstElement;
            
            if (isLatLngObject) {
                // Simple polygon: single array of LatLng objects
                const ring = (latlngs as L.LatLng[]).map((ll) => [ll.lng, ll.lat]);
                // Close the ring if not already closed
                if (ring.length > 0 && (ring[0][0] !== ring[ring.length - 1][0] || ring[0][1] !== ring[ring.length - 1][1])) {
                    ring.push([ring[0][0], ring[0][1]]);
                }
                coordinates.push(ring);
            } else if (Array.isArray(firstElement)) {
                // Check if it's a polygon with holes or multi-polygon
                const firstRing = firstElement[0];
                const isNestedLatLng = firstRing && typeof firstRing === 'object' && 'lat' in firstRing && 'lng' in firstRing;
                
                if (isNestedLatLng) {
                    // Polygon with holes: first array is outer ring, rest are holes
                    (latlngs as L.LatLng[][]).forEach((ring) => {
                        const ringCoords = ring.map((ll) => [ll.lng, ll.lat]);
                        // Close the ring if not already closed
                        if (ringCoords.length > 0 && (ringCoords[0][0] !== ringCoords[ringCoords.length - 1][0] || ringCoords[0][1] !== ringCoords[ringCoords.length - 1][1])) {
                            ringCoords.push([ringCoords[0][0], ringCoords[0][1]]);
                        }
                        coordinates.push(ringCoords);
                    });
                } else {
                    // Multi-polygon: array of arrays of arrays (not fully supported)
                    console.error('Multi-polygon format detected but not fully supported:', latlngs);
                    return null;
                }
            } else {
                console.error('Unexpected latlngs format:', latlngs, 'First element:', firstElement);
                return null;
            }

            if (coordinates.length === 0 || coordinates[0].length === 0) {
                console.error('No valid coordinates generated:', coordinates);
                return null;
            }

            return {
                type: 'Polygon',
                coordinates,
            };
        } else if (layer instanceof L.Rectangle) {
            const bounds = layer.getBounds();
            const sw = bounds.getSouthWest();
            const ne = bounds.getNorthEast();
            
            return {
                type: 'Polygon',
                coordinates: [[
                    [sw.lng, sw.lat],
                    [ne.lng, sw.lat],
                    [ne.lng, ne.lat],
                    [sw.lng, ne.lat],
                    [sw.lng, sw.lat], // Close the ring
                ]],
            };
        } else if (layer instanceof L.Circle) {
            const center = layer.getLatLng();
            const radius = layer.getRadius();
            
            // Convert circle to polygon with 64 points
            const points: number[][] = [];
            for (let i = 0; i < 64; i++) {
                const angle = (i / 64) * 2 * Math.PI;
                const lat = center.lat + (radius / 111320) * Math.cos(angle);
                const lng = center.lng + (radius / (111320 * Math.cos(center.lat * Math.PI / 180))) * Math.sin(angle);
                points.push([lng, lat]);
            }
            points.push(points[0]); // Close the ring

            return {
                type: 'Polygon',
                coordinates: [points],
            };
        }

        // If we get here, the layer type is not recognized
        console.error('Unsupported layer type for GeoJSON conversion:', layer, {
            constructor: layer.constructor?.name,
            hasGetLatLngs: typeof (layer as any).getLatLngs === 'function',
            hasGetBounds: typeof (layer as any).getBounds === 'function',
        });
        return null;
    } catch (error) {
        console.error('Error converting Leaflet layer to GeoJSON:', error, layer);
        return null;
    }
}

/**
 * Convert GeoJSON geometry to Leaflet layer.
 */
export function geoJSONToLeaflet(geometry: GeoJSON.Geometry | Record<string, unknown>, options?: L.PathOptions): L.Layer | null {
    try {
        // Handle case where geometry might be stored as just coordinates
        if (!geometry || typeof geometry !== 'object') {
            console.error('Invalid geometry: not an object', geometry);
            return null;
        }

        // If geometry doesn't have a type, it might be just coordinates - try to construct GeoJSON
        if (!('type' in geometry)) {
            console.warn('Geometry missing type, attempting to construct GeoJSON from coordinates:', geometry);
            if ('coordinates' in geometry && Array.isArray(geometry.coordinates)) {
                geometry = {
                    type: 'Polygon',
                    coordinates: geometry.coordinates,
                } as GeoJSON.Polygon;
            } else {
                console.error('Cannot construct GeoJSON from geometry:', geometry);
                return null;
            }
        }

        if (geometry.type === 'Polygon') {
            // Validate coordinates
            if (!geometry.coordinates || !Array.isArray(geometry.coordinates) || geometry.coordinates.length === 0) {
                console.error('Invalid Polygon coordinates:', geometry);
                return null;
            }
            
            // Convert all rings (first is outer ring, rest are holes)
            const latlngs: L.LatLng[][] = geometry.coordinates.map((ring, ringIndex) => {
                if (!ring || !Array.isArray(ring)) {
                    console.warn(`Polygon ring ${ringIndex} is not an array:`, ring);
                    return [];
                }
                if (ring.length === 0) {
                    console.warn(`Polygon ring ${ringIndex} is empty`);
                    return [];
                }
                const validLatLngs = ring.map((coord, coordIndex) => {
                    if (!Array.isArray(coord) || coord.length < 2) {
                        console.warn(`Polygon ring ${ringIndex}, coordinate ${coordIndex} is invalid:`, coord);
                        return null;
                    }
                    const lng = coord[0];
                    const lat = coord[1];
                    if (typeof lng !== 'number' || typeof lat !== 'number' || isNaN(lng) || isNaN(lat)) {
                        console.warn(`Polygon ring ${ringIndex}, coordinate ${coordIndex} has invalid numbers:`, { lng, lat });
                        return null;
                    }
                    return L.latLng(lat, lng);
                }).filter((ll): ll is L.LatLng => ll !== null);
                
                if (validLatLngs.length === 0) {
                    console.warn(`Polygon ring ${ringIndex} has no valid coordinates after filtering`);
                }
                
                return validLatLngs;
            }).filter(ring => ring.length > 0);
            
            if (latlngs.length === 0) {
                console.error('No valid rings in Polygon:', geometry, 'Original coordinates:', JSON.stringify(geometry.coordinates));
                return null;
            }
            
            // Ensure outer ring has at least 3 points
            if (latlngs[0].length < 3) {
                console.error('Polygon outer ring must have at least 3 points:', geometry);
                return null;
            }
            
            // If only one ring, use simple polygon format, otherwise use polygon with holes
            if (latlngs.length === 1) {
                return L.polygon(latlngs[0], options);
            } else {
                return L.polygon(latlngs, options);
            }
        } else if (geometry.type === 'MultiPolygon') {
            // Validate coordinates
            if (!geometry.coordinates || !Array.isArray(geometry.coordinates) || geometry.coordinates.length === 0) {
                console.error('Invalid MultiPolygon coordinates:', geometry);
                return null;
            }
            
            // MultiPolygon: array of polygons, each polygon has rings
            // For Leaflet, we'll create a LayerGroup with multiple polygons
            const polygons: L.Polygon[] = [];
            
            for (const polygon of geometry.coordinates) {
                if (!polygon || !Array.isArray(polygon) || polygon.length === 0) {
                    continue;
                }
                
                // Convert all rings for this polygon
                const latlngs: L.LatLng[][] = polygon.map((ring) => {
                    if (!ring || !Array.isArray(ring) || ring.length === 0) {
                        return [];
                    }
                    return ring.map((coord) => {
                        if (!Array.isArray(coord) || coord.length < 2) {
                            return null;
                        }
                        return L.latLng(coord[1], coord[0]);
                    }).filter((ll): ll is L.LatLng => ll !== null);
                }).filter(ring => ring.length > 0);
                
                if (latlngs.length === 0) {
                    continue;
                }
                
                // Ensure outer ring has at least 3 points
                if (latlngs[0].length < 3) {
                    console.warn('Skipping polygon with invalid outer ring (less than 3 points)');
                    continue;
                }
                
                // Create polygon (with or without holes)
                if (latlngs.length === 1) {
                    polygons.push(L.polygon(latlngs[0], options));
                } else {
                    polygons.push(L.polygon(latlngs, options));
                }
            }
            
            if (polygons.length === 0) {
                console.error('No valid polygons in MultiPolygon:', geometry);
                return null;
            }
            
            // Return a LayerGroup containing all polygons
            return L.layerGroup(polygons);
        }
    } catch (error) {
        console.error('Error converting GeoJSON to Leaflet:', error, geometry);
        return null;
    }

    return null;
}
