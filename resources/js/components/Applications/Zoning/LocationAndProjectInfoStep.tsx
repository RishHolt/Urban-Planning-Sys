import { useEffect } from 'react';
import PropertyLocation from '../PropertyLocation';
import { Zone, detectZoneFromPin } from '../../../lib/zoneDetection';
import { AlertCircle } from 'lucide-react';

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
        project_description?: string;
        lot_address?: string;
        province?: string;
        municipality?: string;
        barangay?: string;
        street_name?: string;
    };
    setData: (key: string, value: unknown) => void;
    errors: Record<string, string>;
    zones: Zone[];
    loadingZones: boolean;
}

export default function LocationAndProjectInfoStep({
    data,
    setData,
    errors,
    zones,
    loadingZones,
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

            {/* Error message only if zone is required and not selected */}
            {errors.zone_id && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 rounded-lg flex items-start gap-3">
                    <AlertCircle className="text-red-600 dark:text-red-400 mt-0.5" size={18} />
                    <div className="text-sm text-red-800 dark:text-red-200">
                        <p className="font-semibold">Location Required</p>
                        <p>Please pin a location on the map to continue.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
