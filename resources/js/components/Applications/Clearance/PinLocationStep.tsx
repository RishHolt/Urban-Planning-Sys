import { useEffect } from 'react';
import PropertyLocation from '../PropertyLocation';
import { Zone, detectZoneFromPin } from '../../../lib/zoneDetection';

interface PinLocationStepProps {
    data: {
        pin_lat: number | null;
        pin_lng: number | null;
        lot_address: string;
        province: string;
        municipality: string;
        barangay: string;
        street_name: string;
        zone_id: number | null;
    };
    setData: (key: string, value: unknown) => void;
    errors: Record<string, string>;
    zones: Zone[];
}

export default function PinLocationStep({
    data,
    setData,
    errors,
    zones,
}: PinLocationStepProps) {
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
    }, [data.pin_lat, data.pin_lng, zones, setData]);

    return (
        <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-blue-800 dark:text-blue-200 text-sm">
                    <strong>Phase 1: Pin Location</strong> - Select the exact location of your property on the map. The system will automatically detect the zone.
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
        </div>
    );
}
