import { useEffect, useState, useMemo } from 'react';
import Input from '../Input';
import MapPicker from '../MapPicker';
import StreetAutocomplete from '../StreetAutocomplete';
import { MapPin } from 'lucide-react';

interface PropertyLocationStepProps {
    data: {
        barangay: string;
        municipality: string;
        province: string;
        lotNo?: string;
        blockNo?: string;
        streetName?: string;
        useMap: boolean;
        latitude?: number;
        longitude?: number;
    };
    setData: (key: string, value: unknown) => void;
    errors: Record<string, string>;
}

// Sample data - in production, these would come from an API or database
const PROVINCES = ['Metro Manila', 'Cavite', 'Laguna', 'Rizal', 'Bulacan'];
const MUNICIPALITIES: Record<string, string[]> = {
    'Metro Manila': ['Manila', 'Quezon City', 'Makati', 'Pasig', 'Taguig'],
    'Cavite': ['Bacoor', 'Imus', 'Dasmarinas', 'General Trias'],
    'Laguna': ['Calamba', 'San Pedro', 'Biñan', 'Santa Rosa'],
    'Rizal': ['Antipolo', 'Taytay', 'Cainta', 'Angono'],
    'Bulacan': ['Malolos', 'Meycauayan', 'Marilao', 'San Jose del Monte'],
};

const BARANGAYS: Record<string, string[]> = {
    'Manila': ['Ermita', 'Malate', 'Intramuros', 'Binondo', 'Quiapo'],
    'Quezon City': ['Diliman', 'Cubao', 'Kamuning', 'Project 4', 'Project 6'],
    'Makati': ['Bel-Air', 'Poblacion', 'San Antonio', 'Guadalupe'],
    'Pasig': ['Ortigas', 'San Antonio', 'Rosario', 'Santolan'],
    'Taguig': ['Fort Bonifacio', 'Upper Bicutan', 'Lower Bicutan', 'Tuktukan'],
};

// Coordinates for municipalities/cities (approximate centers)
const MUNICIPALITY_COORDINATES: Record<string, [number, number]> = {
    'Manila': [14.5995, 120.9842],
    'Quezon City': [14.6760, 121.0437],
    'Makati': [14.5547, 121.0244],
    'Pasig': [14.5764, 121.0851],
    'Taguig': [14.5176, 121.0509],
    'Bacoor': [14.4592, 120.9300],
    'Imus': [14.4297, 120.9369],
    'Dasmarinas': [14.3294, 120.9369],
    'General Trias': [14.3866, 120.8808],
    'Calamba': [14.2117, 121.1653],
    'San Pedro': [14.3583, 121.0583],
    'Biñan': [14.3333, 121.0833],
    'Santa Rosa': [14.3167, 121.1167],
    'Antipolo': [14.6255, 121.1245],
    'Taytay': [14.5694, 121.1325],
    'Cainta': [14.5786, 121.1222],
    'Angono': [14.5261, 121.1536],
    'Malolos': [14.8433, 120.8114],
    'Meycauayan': [14.7369, 120.9603],
    'Marilao': [14.7581, 120.9481],
    'San Jose del Monte': [14.8139, 121.0456],
};

// Coordinates for barangays (approximate centers, using municipality center as fallback)
const BARANGAY_COORDINATES: Record<string, [number, number]> = {
    // Manila barangays
    'Ermita': [14.5842, 120.9822],
    'Malate': [14.5667, 120.9833],
    'Intramuros': [14.5906, 120.9750],
    'Binondo': [14.6011, 120.9708],
    'Quiapo': [14.5981, 120.9842],
    // Quezon City barangays
    'Diliman': [14.6500, 121.0500],
    'Cubao': [14.6194, 121.0569],
    'Kamuning': [14.6333, 121.0333],
    'Project 4': [14.6167, 121.0500],
    'Project 6': [14.6500, 121.0333],
    // Makati barangays
    'Bel-Air': [14.5547, 121.0244],
    'Poblacion': [14.5547, 121.0244],
    'San Antonio': [14.5547, 121.0244],
    'Guadalupe': [14.5547, 121.0244],
    // Pasig barangays
    'Ortigas': [14.5764, 121.0851],
    'San Antonio': [14.5764, 121.0851],
    'Rosario': [14.5764, 121.0851],
    'Santolan': [14.5764, 121.0851],
    // Taguig barangays
    'Fort Bonifacio': [14.5176, 121.0509],
    'Upper Bicutan': [14.5176, 121.0509],
    'Lower Bicutan': [14.5176, 121.0509],
    'Tuktukan': [14.5176, 121.0509],
};

export default function PropertyLocationStep({
    data,
    setData,
    errors,
}: PropertyLocationStepProps) {
    // Preload map component when step is mounted for better performance
    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Preload both react-leaflet and MapComponent
            Promise.all([
                import('react-leaflet'),
                import('leaflet'),
                import('../MapComponent'),
            ]).catch(() => {
                // Silently handle import errors
            });
        }
    }, []);

    // Ensure useMap is always true
    useEffect(() => {
        if (!data.useMap) {
            setData('useMap', true);
        }
    }, [data.useMap, setData]);

    const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setData('province', e.target.value);
        setData('municipality', ''); // Reset municipality
        setData('barangay', ''); // Reset barangay
    };

    const handleMunicipalityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setData('municipality', e.target.value);
        setData('barangay', ''); // Reset barangay
    };

    const handleLocationSelect = (lat: number, lng: number) => {
        setData('latitude', lat);
        setData('longitude', lng);
    };

    const municipalities = data.province ? MUNICIPALITIES[data.province] || [] : [];
    const barangays = data.municipality ? BARANGAYS[data.municipality] || [] : [];

    const [streetMapCenter, setStreetMapCenter] = useState<[number, number] | null>(null);
    const [mapZoom, setMapZoom] = useState<number>(13); // Default zoom for municipality/barangay

    // Calculate map center - prioritize street coordinates, then barangay/municipality
    const mapCenter = useMemo((): [number, number] => {
        if (streetMapCenter) {
            return streetMapCenter;
        }
        // Priority: Barangay > Municipality > Default (Manila)
        if (data.barangay && data.municipality) {
            const coordinates = BARANGAY_COORDINATES[data.barangay];
            if (coordinates) {
                return coordinates;
            }
        }
        
        if (data.municipality) {
            const coordinates = MUNICIPALITY_COORDINATES[data.municipality];
            if (coordinates) {
                return coordinates;
            }
        }
        
        // Default to Manila
        return [14.5995, 120.9842];
    }, [streetMapCenter, data.barangay, data.municipality]);

    // Auto-update map center when municipality or barangay changes
    useEffect(() => {
        if (data.municipality || data.barangay) {
            // Reset street center when location changes
            if (streetMapCenter) {
                setStreetMapCenter(null);
            }
            // Reset zoom to default for municipality/barangay
            setMapZoom(13);
        }
    }, [data.municipality, data.barangay]);

    // Handle street selection and update map center with zoom
    const handleStreetSelect = (street: { name: string; lat: number; lng: number }) => {
        setStreetMapCenter([street.lat, street.lng]);
        // Zoom in to street level (17 is good for street detail)
        setMapZoom(17);
        // Optionally set coordinates to the street location
        // setData('latitude', street.lat);
        // setData('longitude', street.lng);
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="mb-2 font-bold text-gray-900 dark:text-white text-2xl">
                    Property Location Details
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Precisely locate the property using address or GPS coordinates.
                </p>
            </div>

            {/* Province Dropdown */}
            <div>
                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                    Province <span className="text-red-500">*</span>
                </label>
                <select
                    name="province"
                    value={data.province}
                    onChange={handleProvinceChange}
                    className={`
                        w-full px-4 py-3 rounded-lg border transition-colors
                        ${errors.province 
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                            : 'border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary'
                        }
                        bg-white dark:bg-dark-surface
                        text-gray-900 dark:text-white
                        focus:outline-none focus:ring-2 focus:ring-opacity-20
                    `}
                    required
                >
                    <option value="">Select Province</option>
                    {PROVINCES.map((province) => (
                        <option key={province} value={province}>
                            {province}
                        </option>
                    ))}
                </select>
                {errors.province && (
                    <p className="mt-1 text-red-500 text-sm">{errors.province}</p>
                )}
            </div>

            {/* Municipality Dropdown */}
            <div>
                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                    Municipality / City <span className="text-red-500">*</span>
                </label>
                <select
                    name="municipality"
                    value={data.municipality}
                    onChange={handleMunicipalityChange}
                    disabled={!data.province}
                    className={`
                        w-full px-4 py-3 rounded-lg border transition-colors
                        ${errors.municipality 
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                            : 'border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary'
                        }
                        bg-white dark:bg-dark-surface
                        text-gray-900 dark:text-white
                        focus:outline-none focus:ring-2 focus:ring-opacity-20
                        disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                    required
                >
                    <option value="">Select Municipality/City</option>
                    {municipalities.map((municipality) => (
                        <option key={municipality} value={municipality}>
                            {municipality}
                        </option>
                    ))}
                </select>
                {errors.municipality && (
                    <p className="mt-1 text-red-500 text-sm">{errors.municipality}</p>
                )}
            </div>

            {/* Barangay Dropdown */}
            <div>
                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                    Barangay <span className="text-red-500">*</span>
                </label>
                <select
                    name="barangay"
                    value={data.barangay}
                    onChange={(e) => setData('barangay', e.target.value)}
                    disabled={!data.municipality}
                    className={`
                        w-full px-4 py-3 rounded-lg border transition-colors
                        ${errors.barangay 
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                            : 'border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary'
                        }
                        bg-white dark:bg-dark-surface
                        text-gray-900 dark:text-white
                        focus:outline-none focus:ring-2 focus:ring-opacity-20
                        disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                    required
                >
                    <option value="">Select Barangay</option>
                    {barangays.map((barangay) => (
                        <option key={barangay} value={barangay}>
                            {barangay}
                        </option>
                    ))}
                </select>
                {errors.barangay && (
                    <p className="mt-1 text-red-500 text-sm">{errors.barangay}</p>
                )}
            </div>

            {/* Lot/Block/Street */}
            <div className="gap-4 grid grid-cols-1 md:grid-cols-3">
                <Input
                    type="text"
                    name="lotNo"
                    label="Lot No."
                    placeholder="Enter lot number"
                    value={data.lotNo || ''}
                    onChange={(e) => setData('lotNo', e.target.value)}
                    icon={<MapPin size={20} />}
                    error={errors.lotNo}
                />
                <Input
                    type="text"
                    name="blockNo"
                    label="Block No."
                    placeholder="Enter block number"
                    value={data.blockNo || ''}
                    onChange={(e) => setData('blockNo', e.target.value)}
                    icon={<MapPin size={20} />}
                    error={errors.blockNo}
                />
                <StreetAutocomplete
                    value={data.streetName || ''}
                    onChange={(value) => setData('streetName', value)}
                    onStreetSelect={handleStreetSelect}
                    municipality={data.municipality}
                    barangay={data.barangay}
                    province={data.province}
                    placeholder="Type to search for street name"
                    icon={<MapPin size={20} />}
                    error={errors.streetName}
                    label="Street Name"
                />
            </div>

            {/* Interactive Map */}
            <div>
                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                    GPS Coordinates <span className="text-red-500">*</span>
                </label>
                <p className="mb-3 text-gray-600 dark:text-gray-400 text-sm">
                    Click on the map to set the property location coordinates.
                </p>
                <MapPicker
                    latitude={data.latitude}
                    longitude={data.longitude}
                    onLocationSelect={handleLocationSelect}
                    error={errors.latitude || errors.longitude}
                    center={mapCenter}
                    zoom={mapZoom}
                />
            </div>
        </div>
    );
}
