import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import PropertyLocation from '../PropertyLocation';
import { Zone, detectZoneFromPin, detectBarangayFromPin, closeGeometry } from '../../../lib/zoneDetection';
import { AlertCircle, AlertTriangle, Search, X, ChevronDown, Check } from 'lucide-react';
import * as turf from '@turf/turf';

interface LocationAndProjectInfoStepProps {
    data: {
        pin_lat: number | null;
        pin_lng: number | null;
        lot_address: string;
        province: string;
        municipality: string;
        barangay: string;
        street_name: string;
        zone_id: number | null;
        land_use_type: string;
        project_type: string;
        project_description?: string;
    };
    setData: (key: string, value: unknown) => void;
    errors: Record<string, string>;
    zones: Zone[];
}

export default function LocationAndProjectInfoStep({
    data,
    setData,
    errors,
    zones,
}: LocationAndProjectInfoStepProps) {
    const handleLocationSelect = useCallback((lat: number, lng: number) => {
        setData('pin_lat', lat);
        setData('pin_lng', lng);
    }, [setData]);

    const handleAddressChange = useCallback((field: string, value: string) => {
        setData(field, value);
    }, [setData]);

    // Detect zone and barangay when location is selected
    useEffect(() => {
        if (data.pin_lat && data.pin_lng && zones.length > 0) {
            const detectedZone = detectZoneFromPin(data.pin_lat, data.pin_lng, zones);
            if (detectedZone) {
                setData('zone_id', detectedZone.id);
            } else {
                setData('zone_id', null);
            }

            // Also detect barangay from pin to keep map filtering in sync
            const detectedBarangay = detectBarangayFromPin(data.pin_lat, data.pin_lng, zones);
            if (detectedBarangay) {
                const name = detectedBarangay.label || detectedBarangay.name;
                if (data.barangay !== name) {
                    setData('barangay', name);
                }
            }
        }
    }, [data.pin_lat, data.pin_lng, zones, setData]);

    const [searchTerm, setSearchTerm] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const barangayZones = useMemo(() => {
        return zones
            .filter(z => z.boundary_type === 'barangay')
            .sort((a, b) => (a.label || a.name).localeCompare(b.label || b.name));
    }, [zones]);

    const filteredBarangays = useMemo(() => {
        if (!searchTerm) return barangayZones;
        const term = searchTerm.toLowerCase();
        return barangayZones.filter(z => (z.label || z.name).toLowerCase().includes(term));
    }, [barangayZones, searchTerm]);

    const selectedBarangayZone = useMemo(() => {
        return zones.find(z => z.boundary_type === 'barangay' && (z.label || z.name) === data.barangay) || null;
    }, [zones, data.barangay]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleBarangaySelect = (zone: Zone) => {
        const name = zone.label || zone.name;
        setData('barangay', name);
        setSearchTerm('');
        setIsDropdownOpen(false);
    };

    const handleClearBarangay = () => {
        setData('barangay', '');
        setSearchTerm('');
    };

    const filteredZones = useMemo(() => {
        if (!data.barangay || !selectedBarangayZone || !selectedBarangayZone.geometry) return zones;

        const toTurf = (geom: GeoJSON.Polygon | GeoJSON.MultiPolygon) => {
            if (geom.type === 'Polygon') return turf.polygon(closeGeometry(geom) as number[][][]);
            return turf.multiPolygon(closeGeometry(geom) as number[][][][]);
        };

        try {
            const barangayFeature = toTurf(selectedBarangayZone.geometry);

            return zones.map(zone => {
                // Hide municipality boundaries when a specific barangay is selected
                if (zone.boundary_type === 'municipal') return null;

                // For barangay boundaries, only show the selected one
                if (zone.boundary_type === 'barangay') {
                    return (zone.label || zone.name) === data.barangay ? zone : null;
                }

                // For zoning layers, clip them to the selected barangay boundary
                if (zone.boundary_type === 'zoning' || !zone.boundary_type) {
                    if (!zone.geometry) return null;
                    
                    try {
                        const zoneFeature = toTurf(zone.geometry) as any;
                        const fc = turf.featureCollection([zoneFeature, barangayFeature as any]);
                        const intersection = turf.intersect(fc as any);
                        
                        // If there's an intersection and it's a polygon/multipolygon, use the clipped geometry
                        if (intersection && (intersection.geometry.type === 'Polygon' || intersection.geometry.type === 'MultiPolygon')) {
                            return {
                                ...zone,
                                geometry: intersection.geometry as GeoJSON.Polygon | GeoJSON.MultiPolygon
                            };
                        }
                    } catch (err) {
                        // If clipping fails (e.g. invalid topology), fallback to boolean check
                        try {
                            if (turf.booleanIntersects(toTurf(zone.geometry), barangayFeature)) {
                                return zone;
                            }
                        } catch {
                            return null;
                        }
                    }
                    return null;
                }
                
                return null;
            }).filter((z): z is Zone => z !== null);
        } catch (e) {
            console.error('Error in filteredZones computation:', e);
            return zones;
        }
    }, [zones, selectedBarangayZone, data.barangay]);

    const mapBounds = useMemo<[[number, number], [number, number]] | undefined>(() => {
        if (!selectedBarangayZone || !selectedBarangayZone.geometry) return undefined;
        try {
            const geom = selectedBarangayZone.geometry;

            // Close any open rings (first pos must equal last pos per GeoJSON spec)
            const closeRing = (ring: number[][]) => {
                if (ring.length === 0) return ring;
                const [fx, fy] = ring[0];
                const [lx, ly] = ring[ring.length - 1];
                return (fx === lx && fy === ly) ? ring : [...ring, ring[0]];
            };

            let bbox: number[];
            if (geom.type === 'Polygon') {
                const closed = geom.coordinates.map(closeRing);
                bbox = turf.bbox(turf.polygon(closed));
            } else {
                const closed = (geom.coordinates as number[][][][]).map(poly => poly.map(closeRing));
                bbox = turf.bbox(turf.multiPolygon(closed));
            }

            return [[bbox[1], bbox[0]], [bbox[3], bbox[2]]];
        } catch (e) {
            console.error('[mapBounds] Error computing bounds:', e);
            return undefined;
        }
    }, [selectedBarangayZone]);

    return (
        <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">1</span>
                    Filter Map by Barangay
                </h3>
                <div ref={containerRef} className="relative w-full">
                    <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                        Search and Select Barangay
                    </label>

                    {/* Selected value / trigger */}
                    <div
                        onClick={() => { setIsDropdownOpen(prev => !prev); setSearchTerm(''); }}
                        className={`flex items-center justify-between w-full px-4 py-3 rounded-lg border transition-all cursor-pointer bg-white dark:bg-dark-surface ${
                            errors.barangay ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        } ${isDropdownOpen ? 'ring-2 ring-primary/20 border-primary' : ''}`}
                    >
                        <span className={data.barangay ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}>
                            {data.barangay || 'Type to search barangay...'}
                        </span>
                        <div className="flex items-center gap-2 ml-2">
                            {data.barangay && (
                                <X size={16} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" onClick={(e) => { e.stopPropagation(); handleClearBarangay(); }} />
                            )}
                            <ChevronDown size={18} className={`text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </div>
                    </div>

                    {/* Dropdown */}
                    {isDropdownOpen && (
                        <div className="absolute z-[60] w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden">
                            <div className="p-2 border-b border-gray-100 dark:border-gray-700">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        type="text"
                                        autoFocus
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Filter list..."
                                        className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-900 border-none rounded-md focus:ring-1 focus:ring-primary focus:outline-none dark:text-white"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </div>
                            </div>
                            <div className="max-h-60 overflow-y-auto py-1">
                                {filteredBarangays.length > 0 ? (
                                    filteredBarangays.map((zone) => {
                                        const name = zone.label || zone.name;
                                        const isSelected = name === data.barangay;
                                        return (
                                            <div
                                                key={zone.id}
                                                onClick={() => handleBarangaySelect(zone)}
                                                className={`flex items-center justify-between px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                                                    isSelected
                                                        ? 'bg-primary/10 text-primary font-medium'
                                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                                }`}
                                            >
                                                <span className="truncate">{name}</span>
                                                {isSelected && <Check size={16} />}
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="px-4 py-6 text-center text-gray-500 dark:text-gray-400 text-sm">
                                        No results found for "{searchTerm}"
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {errors.barangay && <p className="mt-1 text-red-500 text-sm">{errors.barangay}</p>}
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">2</span>
                    Pin Property Location
                </h3>
                <PropertyLocation
                    mode="form"
                    pinLat={data.pin_lat}
                    pinLng={data.pin_lng}
                    lotAddress={data.lot_address}
                    province={data.province}
                    municipality={data.municipality}
                    barangay={data.barangay}
                    streetName={data.street_name}
                    zones={filteredZones}
                    onLocationSelect={handleLocationSelect}
                    onAddressChange={handleAddressChange}
                    errors={errors}
                    mapBounds={mapBounds}
                />
            </div>

            {errors.zone_id && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 rounded-lg flex items-start gap-3">
                    <AlertCircle className="text-red-600 dark:text-red-400 mt-0.5" size={18} />
                    <div className="text-sm text-red-800 dark:text-red-200">
                        <p className="font-semibold">Location Required</p>
                        <p>Please pin a location on the map to continue.</p>
                    </div>
                </div>
            )}

            {/* Warn if pin is set but no zone was detected */}
            {data.pin_lat && data.pin_lng && !data.zone_id && (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-300 dark:border-yellow-700 rounded-lg flex items-start gap-3">
                    <AlertTriangle className="text-yellow-600 dark:text-yellow-400 mt-0.5 shrink-0" size={18} />
                    <div className="text-sm text-yellow-800 dark:text-yellow-200">
                        <p className="font-semibold">No Zoning Area Detected</p>
                        <p>
                            The pinned location does not fall within any mapped zoning area. You may still proceed,
                            but your application will require manual review by the zoning office.
                        </p>
                    </div>
                </div>
            )}

        </div>
    );
}
