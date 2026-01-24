import { useEffect } from 'react';
import PropertyLocation from '../PropertyLocation';
import Input from '../../Input';
import { Zone, detectZoneFromPin } from '../../../lib/zoneDetection';

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
        building_type: string;
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
    const handleLocationSelect = (lat: number, lng: number) => {
        setData('pin_lat', lat);
        setData('pin_lng', lng);
    };

    const handleAddressChange = (field: string, value: string) => {
        setData(field, value);
    };

    // Detect zone when location is selected
    useEffect(() => {
        if (data.pin_lat && data.pin_lng && zones.length > 0) {
            const detectedZone = detectZoneFromPin(data.pin_lat, data.pin_lng, zones);
            if (detectedZone) {
                setData('zone_id', detectedZone.id);
            } else {
                setData('zone_id', null);
            }
        }
    }, [data.pin_lat, data.pin_lng, zones]);

    return (
        <div className="space-y-8">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-blue-800 dark:text-blue-200 text-sm">
                    <strong>Phase 2: Location & Project Info</strong> - Pin your location and specify the type of project.
                </p>
            </div>

            <PropertyLocation
                mode="form"
                pinLat={data.pin_lat}
                pinLng={data.pin_lng}
                lotAddress={data.lot_address}
                province={data.province}
                municipality={data.municipality}
                barangay={data.barangay}
                streetName={data.street_name}
                zones={zones}
                onLocationSelect={handleLocationSelect}
                onAddressChange={handleAddressChange}
                errors={errors}
            />

            <div className="pt-6 border-t border-gray-200 dark:border-gray-700 space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Project Classification</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Land Use Type
                        </label>
                        <select
                            value={data.land_use_type}
                            onChange={(e) => setData('land_use_type', e.target.value)}
                            className="w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-dark-surface focus:ring-primary focus:border-primary"
                        >
                            <option value="residential">Residential</option>
                            <option value="commercial">Commercial</option>
                            <option value="industrial">Industrial</option>
                            <option value="agricultural">Agricultural</option>
                            <option value="institutional">Institutional</option>
                            <option value="mixed_use">Mixed Use</option>
                        </select>
                        {errors.land_use_type && <p className="mt-1 text-sm text-red-500">{errors.land_use_type}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Project Type
                        </label>
                        <select
                            value={data.project_type}
                            onChange={(e) => setData('project_type', e.target.value)}
                            className="w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-dark-surface focus:ring-primary focus:border-primary"
                        >
                            <option value="new_construction">New Construction</option>
                            <option value="renovation">Renovation</option>
                            <option value="addition">Addition/Extension</option>
                            <option value="change_of_use">Change of Use</option>
                        </select>
                        {errors.project_type && <p className="mt-1 text-sm text-red-500">{errors.project_type}</p>}
                    </div>

                    <Input
                        label="Building Type"
                        value={data.building_type}
                        onChange={(e) => setData('building_type', e.target.value)}
                        error={errors.building_type}
                        placeholder="e.g. Apartment, Factory, Single-detached House"
                        required
                    />
                </div>
            </div>
        </div>
    );
}
