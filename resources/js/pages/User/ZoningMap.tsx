import { useState, useEffect, useRef, useMemo } from 'react';
import Header from '../../components/Header';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import { generatePolygonColor, geoJSONToLeaflet } from '../../lib/mapUtils';
import { Loader2, Info, MapPin, ArrowLeft, Search } from 'lucide-react';
import { Link } from '@inertiajs/react';
import Button from '../../components/Button';
import Input from '../../components/Input';
import type { Zone, ZoningClassification } from '../../data/services';
import * as turf from '@turf/turf';

// Helper function to ensure polygon rings are closed (first and last position must be the same)
function ensureClosedPolygon(geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon): GeoJSON.Polygon | GeoJSON.MultiPolygon {
    if (geometry.type === 'Polygon') {
        if (!Array.isArray(geometry.coordinates)) {
            return geometry;
        }
        const closedCoordinates = geometry.coordinates.map((ring) => {
            if (!Array.isArray(ring) || ring.length === 0) {
                return ring;
            }
            const first = ring[0];
            const last = ring[ring.length - 1];
            if (!Array.isArray(first) || !Array.isArray(last)) {
                return ring;
            }
            // Check if ring is already closed
            if (first[0] === last[0] && first[1] === last[1]) {
                return ring;
            }
            // Close the ring by adding the first coordinate at the end
            return [...ring, [first[0], first[1]]];
        });
        return {
            type: 'Polygon',
            coordinates: closedCoordinates,
        };
    } else {
        // MultiPolygon
        if (!Array.isArray(geometry.coordinates)) {
            return geometry;
        }
        const closedCoordinates = geometry.coordinates.map((polygon) => {
            if (!Array.isArray(polygon)) {
                return polygon;
            }
            return polygon.map((ring) => {
                if (!Array.isArray(ring) || ring.length === 0) {
                    return ring;
                }
                const first = ring[0];
                const last = ring[ring.length - 1];
                if (!Array.isArray(first) || !Array.isArray(last)) {
                    return ring;
                }
                // Check if ring is already closed
                if (first[0] === last[0] && first[1] === last[1]) {
                    return ring;
                }
                // Close the ring by adding the first coordinate at the end
                return [...ring, [first[0], first[1]]];
            });
        });
        return {
            type: 'MultiPolygon',
            coordinates: closedCoordinates,
        };
    }
}

// Fix for default marker icon in React-Leaflet
if (typeof window !== 'undefined' && !(L.Icon.Default.prototype as any)._iconUrlFixed) {
    delete (L.Icon.Default.prototype as unknown as { _getIconUrl: unknown })._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    });
    (L.Icon.Default.prototype as any)._iconUrlFixed = true;
}

// Map component that renders zones
function ZoneLayers({
    zones,
    municipalityBoundary,
    barangayBoundaries,
    selectedZone,
    onSelectZone,
}: {
    zones: Zone[];
    municipalityBoundary: Zone | null;
    barangayBoundaries: Zone[];
    selectedZone: Zone | null;
    onSelectZone: (zone: Zone) => void;
}) {
    const map = useMap();
    const polygonLayersRef = useRef<Map<string, L.Layer>>(new Map());
    const layerToZoneIdRef = useRef<Map<L.Layer, string>>(new Map());
    const renderTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Render zones on map
    useEffect(() => {
        if (!map) {
            return;
        }

        // Clear any pending render timeout
        if (renderTimeoutRef.current) {
            clearTimeout(renderTimeoutRef.current);
        }

        // Debounce rendering on map move/zoom
        const renderZones = () => {
            // Clear existing layers
            polygonLayersRef.current.forEach((layer) => {
                if (map.hasLayer(layer)) {
                    map.removeLayer(layer);
                }
            });
            polygonLayersRef.current.clear();
            layerToZoneIdRef.current.clear();

            // Combine all zones including boundaries
            const allZonesToRender: Zone[] = [];

            // Add municipality boundary if it exists
            if (municipalityBoundary) {
                allZonesToRender.push(municipalityBoundary);
            }

            // Add barangay boundaries
            allZonesToRender.push(...barangayBoundaries);

            // Add zoning zones (exclude boundaries)
            const zoningZones = zones.filter((zone) => {
                const isBoundary = zone.boundary_type === 'municipal' || zone.boundary_type === 'barangay';
                return !isBoundary && zone.geometry;
            });
            allZonesToRender.push(...zoningZones);

            // Render all zones
            allZonesToRender.forEach((zone) => {
                if (!zone.geometry) {
                    return;
                }

                try {
                    const isBoundary = zone.boundary_type === 'municipal' || zone.boundary_type === 'barangay';
                    const isMunicipality = zone.boundary_type === 'municipal';
                    const isBarangay = zone.boundary_type === 'barangay';

                    const layerColor = isBoundary
                        ? (isMunicipality ? '#000000' : '#808080')
                        : (zone.color || generatePolygonColor(zone.code));
                    const fillOpacity = isBoundary ? 0 : 0.3;
                    const weight = isBoundary ? 3 : 2;
                    const opacity = 0.8;

                    const layer = geoJSONToLeaflet(zone.geometry, {
                        color: layerColor,
                        fillColor: layerColor,
                        fillOpacity: fillOpacity,
                        weight: weight,
                        opacity: opacity,
                        dashArray: isBoundary ? '5, 10' : undefined,
                        interactive: true,
                    });

                    if (layer) {
                        // Add to map
                        if (layer instanceof L.LayerGroup) {
                            layer.addTo(map);
                        } else {
                            layer.addTo(map);
                        }

                        // Store reference
                        polygonLayersRef.current.set(zone.id, layer);
                        if (layer instanceof L.LayerGroup) {
                            layer.eachLayer((sublayer) => {
                                layerToZoneIdRef.current.set(sublayer, zone.id);
                            });
                        } else {
                            layerToZoneIdRef.current.set(layer, zone.id);
                        }

                        // Add popup with zone information (view-only, no edit button)
                        const popupContent = `
                            <div class="p-3 min-w-[200px]">
                                <div class="mb-2 pb-2 border-gray-100 dark:border-gray-700 border-b">
                                    <span class="block mb-0.5 font-bold text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">Zone Label</span>
                                    <span class="block font-bold text-gray-700 dark:text-gray-300 text-sm truncate" title="${zone.label || 'N/A'}">
                                        ${zone.label || 'No Label Set'}
                                    </span>
                                </div>
                                <div class="mb-2">
                                    <span class="block mb-0.5 font-bold text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider">Classification</span>
                                    <span class="block mb-0.5 font-semibold text-primary dark:text-blue-400 text-xs">${zone.code}</span>
                                    <span class="block text-[11px] text-gray-600 dark:text-gray-300 line-clamp-2">${zone.name}</span>
                                </div>
                                ${zone.description ? `
                                    <div class="mt-2 pt-2 border-gray-100 dark:border-gray-700 border-t">
                                        <span class="block text-[11px] text-gray-600 dark:text-gray-300 line-clamp-3">${zone.description}</span>
                                    </div>
                                ` : ''}
                            </div>
                        `;

                        const popup = L.popup({
                            maxWidth: 300,
                            className: 'zone-popup-custom'
                        }).setContent(popupContent);

                        // Bind popup and click handler
                        const handleClick = () => {
                            onSelectZone(zone);
                        };

                        if (layer instanceof L.LayerGroup) {
                            layer.eachLayer((sublayer) => {
                                if (sublayer instanceof L.Polygon) {
                                    sublayer.bindPopup(popup);
                                    sublayer.on('click', handleClick);
                                }
                            });
                        } else if (layer instanceof L.Polygon) {
                            layer.bindPopup(popup);
                            layer.on('click', handleClick);
                        }
                    }
                } catch (error) {
                    console.error(`Error rendering zone ${zone.code}:`, error);
                }
            });
        };

        // Initial render
        renderZones();

        // Listen to map move/zoom events
        const handleMapMove = () => {
            if (renderTimeoutRef.current) {
                clearTimeout(renderTimeoutRef.current);
            }
            renderTimeoutRef.current = setTimeout(() => {
                renderZones();
            }, 150);
        };

        map.on('moveend', handleMapMove);
        map.on('zoomend', handleMapMove);

        // Cleanup
        return () => {
            if (renderTimeoutRef.current) {
                clearTimeout(renderTimeoutRef.current);
            }
            map.off('moveend', handleMapMove);
            map.off('zoomend', handleMapMove);
            polygonLayersRef.current.forEach((layer) => {
                if (map.hasLayer(layer)) {
                    map.removeLayer(layer);
                }
            });
            polygonLayersRef.current.clear();
            layerToZoneIdRef.current.clear();
        };
    }, [map, zones, municipalityBoundary, barangayBoundaries, onSelectZone]);

    // Pan to selected zone
    useEffect(() => {
        if (!map || !selectedZone) {
            return;
        }

        const layer = polygonLayersRef.current.get(selectedZone.id);
        if (layer) {
            // Open popup
            if (layer instanceof L.LayerGroup) {
                const layers = (layer as L.LayerGroup).getLayers();
                const firstPolygon = layers.find(l => l instanceof L.Polygon) as L.Polygon;
                if (firstPolygon) {
                    firstPolygon.openPopup();
                }
            } else if (layer instanceof L.Layer) {
                (layer as any).openPopup?.();
            }

            // Fit bounds
            if (layer instanceof L.LayerGroup) {
                const layers = (layer as L.LayerGroup).getLayers();
                if (layers.length > 0) {
                    const bounds = L.featureGroup(layers).getBounds();
                    if (bounds.isValid()) {
                        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 18 });
                    }
                }
            } else if (layer instanceof L.Polyline || layer instanceof L.Polygon) {
                const bounds = (layer as L.Polyline).getBounds();
                if (bounds.isValid()) {
                    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 18 });
                }
            }
        }
    }, [map, selectedZone]);

    // Fit map to municipality boundary when it loads
    useEffect(() => {
        if (!map || !municipalityBoundary || !municipalityBoundary.geometry) {
            return;
        }

        try {
            const closedGeometry = ensureClosedPolygon(municipalityBoundary.geometry);
            const feature = closedGeometry.type === 'Polygon'
                ? turf.polygon(closedGeometry.coordinates)
                : turf.multiPolygon(closedGeometry.coordinates);
            
            const bbox = turf.bbox(feature);
            const bounds = L.latLngBounds(
                [bbox[1], bbox[0]], // Southwest
                [bbox[3], bbox[2]]  // Northeast
            );
            
            if (bounds.isValid()) {
                map.fitBounds(bounds, { padding: [50, 50], maxZoom: 18 });
            }
        } catch (error) {
            console.error('Error fitting map to municipality boundary:', error);
        }
    }, [map, municipalityBoundary]);

    return null;
}

export default function ZoningMap() {
    const [zones, setZones] = useState<Zone[]>([]);
    const [allZones, setAllZones] = useState<Zone[]>([]);
    const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
    const [municipalityBoundary, setMunicipalityBoundary] = useState<Zone | null>(null);
    const [barangayBoundaries, setBarangayBoundaries] = useState<Zone[]>([]);
    const [classifications, setClassifications] = useState<ZoningClassification[]>([]);
    const [selectedBarangayId, setSelectedBarangayId] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [mapCenter, setMapCenter] = useState<[number, number]>([14.5995, 120.9842]); // Default to Manila
    const mapZoom = 16;

    // Load zones and classifications on mount
    useEffect(() => {
        loadZones();
        loadClassifications();
    }, []);

    const loadClassifications = async () => {
        try {
            const response = await fetch('/api/classifications/public?active_only=1', {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to load classifications');
            }

            const result = await response.json();
            if (result.success && result.data) {
                setClassifications(result.data);
            }
        } catch (error) {
            console.error('Failed to load classifications:', error);
        }
    };

    const loadZones = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/zones/public', {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to load zones');
            }

            const result = await response.json();
            if (result.success && result.zones) {
                const allZonesList = result.zones;
                setAllZones(allZonesList);

                // Separate zones by type
                const zoningZones = allZonesList.filter((z: Zone) => {
                    const isBoundary = z.boundary_type === 'municipal' || z.boundary_type === 'barangay';
                    return !isBoundary;
                });
                setZones(zoningZones);

                const municipal = allZonesList.find((z: Zone) => z.boundary_type === 'municipal');
                setMunicipalityBoundary(municipal || null);

                // Calculate center from municipality boundary if available
                if (municipal && municipal.geometry) {
                    try {
                        const closedGeometry = ensureClosedPolygon(municipal.geometry);
                        const feature = closedGeometry.type === 'Polygon'
                            ? turf.polygon(closedGeometry.coordinates)
                            : turf.multiPolygon(closedGeometry.coordinates);
                        const centroid = turf.centroid(feature);
                        setMapCenter([centroid.geometry.coordinates[1], centroid.geometry.coordinates[0]]);
                    } catch (error) {
                        console.error('Error calculating municipality boundary center:', error);
                    }
                }

                const barangays = allZonesList.filter((z: Zone) => z.boundary_type === 'barangay');
                setBarangayBoundaries(barangays);
            }
        } catch (error) {
            console.error('Failed to load zones:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBarangaySelect = (barangayId: string) => {
        setSelectedBarangayId(barangayId);
        const barangay = barangayBoundaries.find((b) => b.id === barangayId);
        if (barangay) {
            setSelectedZone(barangay);
        }
    };

    const handleZoneSelect = (zone: Zone) => {
        setSelectedZone(zone);
        if (zone.boundary_type === 'barangay') {
            setSelectedBarangayId(zone.id);
        }
    };

    // Filter barangays to only show those that have zones
    const barangaysWithZones = useMemo(() => {
        if (!barangayBoundaries.length || !zones.length) {
            return [];
        }

        return barangayBoundaries.filter((barangay) => {
            if (!barangay.geometry) {
                return false;
            }

            const barangayGeometry = barangay.geometry;

            // Check if any zone intersects with this barangay boundary
            return zones.some((zone) => {
                if (!zone.geometry) {
                    return false;
                }

                try {
                    // Ensure polygons are properly closed before processing
                    const closedBarangayGeometry = ensureClosedPolygon(barangayGeometry);
                    const closedZoneGeometry = ensureClosedPolygon(zone.geometry);

                    // Quick check: if bounding boxes don't overlap, zones can't intersect
                    const barangayBbox = turf.bbox(closedBarangayGeometry);
                    const zoneBbox = turf.bbox(closedZoneGeometry);
                    
                    // Check if bounding boxes overlap
                    const bboxesOverlap = !(
                        zoneBbox[0] > barangayBbox[2] || // zone is to the right of barangay
                        zoneBbox[2] < barangayBbox[0] || // zone is to the left of barangay
                        zoneBbox[1] > barangayBbox[3] || // zone is above barangay
                        zoneBbox[3] < barangayBbox[1]    // zone is below barangay
                    );
                    
                    if (!bboxesOverlap) {
                        return false;
                    }

                    // Create turf features for both geometries (now properly closed)
                    const barangayFeature = closedBarangayGeometry.type === 'Polygon'
                        ? turf.polygon(closedBarangayGeometry.coordinates)
                        : turf.multiPolygon(closedBarangayGeometry.coordinates);
                    
                    const zoneFeature = closedZoneGeometry.type === 'Polygon'
                        ? turf.polygon(closedZoneGeometry.coordinates)
                        : turf.multiPolygon(closedZoneGeometry.coordinates);

                    // Check if they intersect using booleanIntersects (simpler and more reliable)
                    try {
                        if (turf.booleanIntersects(barangayFeature, zoneFeature)) {
                            return true;
                        }
                    } catch (intersectError) {
                        // If booleanIntersects fails, try other methods
                    }
                    
                    // Also check if zone is completely within barangay using booleanWithin
                    try {
                        if (turf.booleanWithin(zoneFeature, barangayFeature)) {
                            return true;
                        }
                    } catch (withinError) {
                        // Ignore errors from booleanWithin
                    }
                    
                    // Also check if any point of the zone is within the barangay
                    try {
                        // Get centroid of zone and check if it's within barangay
                        const zoneCentroid = turf.centroid(zoneFeature);
                        // booleanPointInPolygon works with both Polygon and MultiPolygon features
                        if (barangayFeature.geometry.type === 'Polygon') {
                            if (turf.booleanPointInPolygon(zoneCentroid, barangayFeature.geometry)) {
                                return true;
                            }
                        } else if (barangayFeature.geometry.type === 'MultiPolygon') {
                            // For MultiPolygon, check each polygon
                            for (const polygonCoords of barangayFeature.geometry.coordinates) {
                                const polygon = turf.polygon(polygonCoords);
                                if (turf.booleanPointInPolygon(zoneCentroid, polygon)) {
                                    return true;
                                }
                            }
                        }
                    } catch (centroidError) {
                        // Ignore errors
                    }
                    
                    return false;
                } catch (error) {
                    console.error(`Error checking zone intersection for barangay ${barangay.label}:`, error, { barangayId: barangay.id, zoneId: zone.id });
                    return false;
                }
            });
        });
    }, [barangayBoundaries, zones]);

    // Filter barangays based on search query
    const filteredBarangays = useMemo(() => {
        if (!searchQuery.trim()) {
            return barangaysWithZones;
        }
        const query = searchQuery.toLowerCase().trim();
        return barangaysWithZones.filter((barangay) => {
            const label = (barangay.label || '').toLowerCase();
            return label.includes(query);
        });
    }, [barangaysWithZones, searchQuery]);

    return (
        <div className="flex flex-col bg-background dark:bg-dark-bg w-full min-h-dvh transition-colors">
            <Header />

            <main className="flex-1 mt-16">
                <div className="relative flex h-[calc(100vh-4rem)]">
                    {/* Left Container - Search and Legend */}
                    <div className="z-[1000] flex flex-col bg-white dark:bg-dark-surface border-gray-200 dark:border-gray-700 border-r w-80 h-full overflow-hidden">
                        <div className="p-4 border-gray-200 dark:border-gray-700 border-b">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="font-semibold text-gray-900 dark:text-white text-lg">
                                    Zoning Map
                                </h2>
                                <Link href="/">
                                    <Button variant="secondary" size="sm" className="flex items-center gap-2">
                                        <ArrowLeft size={16} />
                                        <span className="hidden sm:inline">Return</span>
                                    </Button>
                                </Link>
                            </div>
                            <div>
                                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                    Search Barangay
                                </label>
                                <div className="relative">
                                    <Input
                                        type="text"
                                        placeholder="Search barangay..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        icon={<Search size={18} />}
                                        className="w-full"
                                    />
                                </div>
                                {searchQuery && (
                                    <div className="bg-white dark:bg-dark-surface mt-2 border border-gray-200 dark:border-gray-700 rounded-lg max-h-60 overflow-y-auto">
                                        {filteredBarangays.length > 0 ? (
                                            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                                {filteredBarangays.map((barangay) => (
                                                    <li
                                                        key={barangay.id}
                                                        onClick={() => {
                                                            handleBarangaySelect(barangay.id);
                                                            setSearchQuery('');
                                                        }}
                                                        className={`px-3 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                                                            selectedBarangayId === barangay.id
                                                                ? 'bg-primary/10 dark:bg-primary/20'
                                                                : ''
                                                        }`}
                                                    >
                                                        <div className="font-medium text-gray-900 dark:text-white text-sm">
                                                            {barangay.label || 'Unnamed Barangay'}
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <div className="px-3 py-4 text-gray-500 dark:text-gray-400 text-sm text-center">
                                                No barangays found
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="p-4 border-gray-200 dark:border-gray-700 border-b overflow-y-auto">
                            <h3 className="flex items-center gap-2 mb-3 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                <MapPin size={16} />
                                Legend
                            </h3>
                            <div className="space-y-2">
                                {/* Zoning Classifications */}
                                {classifications.map((classification) => (
                                    <div key={classification.id} className="flex items-center gap-2 text-xs">
                                        <div
                                            className="flex-shrink-0 rounded w-4 h-4"
                                            style={{
                                                backgroundColor: classification.color || generatePolygonColor(classification.code),
                                            }}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-gray-700 dark:text-gray-300 truncate">
                                                {classification.code}
                                            </div>
                                            <div className="text-[10px] text-gray-600 dark:text-gray-400 truncate">
                                                {classification.name}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Info Section */}
                        <div className="p-4">
                            <div className="flex items-start gap-2 text-gray-600 dark:text-gray-400 text-xs">
                                <Info size={16} className="flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="mb-1 font-medium">About this map</p>
                                    <p>This map displays the zoning classifications for the municipality. Click on any zone to view detailed information.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Map */}
                    <div className="z-0 relative flex-1">
                        {loading ? (
                            <div className="flex justify-center items-center bg-gray-100 dark:bg-gray-900 h-full">
                                <div className="text-center">
                                    <Loader2 size={48} className="mx-auto mb-4 text-primary animate-spin" />
                                    <p className="text-gray-600 dark:text-gray-400">Loading zoning map...</p>
                                </div>
                            </div>
                        ) : (
                            <MapContainer
                                center={mapCenter}
                                zoom={mapZoom}
                                maxZoom={19}
                                minZoom={3}
                                style={{ height: '100%', width: '100%', zIndex: 0 }}
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    maxZoom={19}
                                    minZoom={3}
                                    tileSize={256}
                                    zoomOffset={0}
                                    updateWhenZooming={true}
                                    updateWhenIdle={true}
                                    keepBuffer={3}
                                />
                                <ZoneLayers
                                    zones={zones}
                                    municipalityBoundary={municipalityBoundary}
                                    barangayBoundaries={barangayBoundaries}
                                    selectedZone={selectedZone}
                                    onSelectZone={handleZoneSelect}
                                />
                            </MapContainer>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
