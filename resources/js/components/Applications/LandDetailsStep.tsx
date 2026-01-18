import Input from '../Input';
import { Building, MapPin } from 'lucide-react';

interface LandDetailsStepProps {
    data: {
        landType: string;
        hasExistingStructure: boolean;
        numberOfBuildings?: number;
        lotArea: number;
    };
    setData: (key: string, value: unknown) => void;
    errors: Record<string, string>;
}

const LAND_TYPES = [
    { value: 'residential', label: 'Residential' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'industrial', label: 'Industrial' },
    { value: 'agricultural', label: 'Agricultural' },
    { value: 'mixed_use', label: 'Mixed-use' },
    { value: 'institutional', label: 'Institutional' },
    { value: 'open_space', label: 'Open Space / Recreational' },
    { value: 'special_use', label: 'Special Use' },
    { value: 'forest', label: 'Forest' },
    { value: 'mineral', label: 'Mineral' },
    { value: 'water', label: 'Water / Waterways' },
    { value: 'other', label: 'Other' },
];

export default function LandDetailsStep({
    data,
    setData,
    errors,
}: LandDetailsStepProps) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="mb-2 font-bold text-gray-900 dark:text-white text-2xl">
                    Land & Property Details
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Describe the property and any existing structures.
                </p>
            </div>

            {/* Land Type */}
            <div>
                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                    Current Land Type <span className="text-red-500">*</span>
                </label>
                <select
                    name="landType"
                    value={data.landType || ''}
                    onChange={(e) => setData('landType', e.target.value)}
                    className={`
                        w-full px-4 py-3 rounded-lg border transition-colors
                        ${errors.landType 
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                            : 'border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary'
                        }
                        bg-white dark:bg-dark-surface
                        text-gray-900 dark:text-white
                        focus:outline-none focus:ring-2 focus:ring-opacity-20
                    `}
                    required
                >
                    <option value="">Select Land Type</option>
                    {LAND_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                            {type.label}
                        </option>
                    ))}
                </select>
                {errors.landType && (
                    <p className="mt-1 text-red-500 text-sm">{errors.landType}</p>
                )}
            </div>

            {/* Existing Structure */}
            <div className="flex items-center gap-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <input
                    type="checkbox"
                    id="hasExistingStructure"
                    checked={data.hasExistingStructure}
                    onChange={(e) => setData('hasExistingStructure', e.target.checked)}
                    className="border-gray-300 rounded focus:ring-primary text-primary"
                />
                <label
                    htmlFor="hasExistingStructure"
                    className="text-gray-700 dark:text-gray-300 text-sm cursor-pointer"
                >
                    There is an existing structure on the property
                </label>
            </div>

            {/* Conditional Structure Fields */}
            {data.hasExistingStructure && (
                <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <Input
                        type="number"
                        name="numberOfBuildings"
                        label="Number of Buildings"
                        placeholder="Enter number of buildings"
                        min={1}
                        value={data.numberOfBuildings?.toString() || ''}
                        onChange={(e) => setData('numberOfBuildings', parseInt(e.target.value) || undefined)}
                        icon={<Building size={20} />}
                        error={errors.numberOfBuildings}
                        required
                    />
                </div>
            )}

            {/* Lot Area */}
            <Input
                type="number"
                name="lotArea"
                label="Lot Area (sqm)"
                placeholder="Enter lot area in square meters"
                min={0}
                step="0.01"
                value={data.lotArea.toString()}
                onChange={(e) => setData('lotArea', parseFloat(e.target.value) || 0)}
                icon={<MapPin size={20} />}
                error={errors.lotArea}
                required
            />

        </div>
    );
}
