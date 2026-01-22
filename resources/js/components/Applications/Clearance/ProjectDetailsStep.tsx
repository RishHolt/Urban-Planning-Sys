import Input from '../../Input';

interface ProjectDetailsStepProps {
    data: {
        land_use_type: 'residential' | 'commercial' | 'industrial' | 'agricultural' | 'institutional' | 'mixed_use';
        project_type: 'new_construction' | 'renovation' | 'addition' | 'change_of_use';
        building_type: string;
        project_description: string;
        existing_structure: 'none' | 'existing_to_retain' | 'existing_to_demolish' | 'existing_to_renovate';
        number_of_storeys: number | null;
        floor_area_sqm: number | null;
        estimated_cost: number | null;
        purpose: string;
    };
    setData: (key: string, value: unknown) => void;
    errors: Record<string, string>;
    category: 'individual_lot' | 'subdivision_development';
}

export default function ProjectDetailsStep({
    data,
    setData,
    errors,
    category,
}: ProjectDetailsStepProps) {
    return (
        <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-blue-800 dark:text-blue-200 text-sm">
                    <strong>Phase 1: Project Details</strong> - Describe your proposed project.
                </p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Land Use Type *
                </label>
                <select
                    value={data.land_use_type}
                    onChange={(e) => setData('land_use_type', e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
                >
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                    <option value="industrial">Industrial</option>
                    <option value="agricultural">Agricultural</option>
                    <option value="institutional">Institutional</option>
                    <option value="mixed_use">Mixed Use</option>
                </select>
                {errors.land_use_type && (
                    <p className="text-red-500 text-sm mt-1">{errors.land_use_type}</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Project Type *
                </label>
                <select
                    value={data.project_type}
                    onChange={(e) => setData('project_type', e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
                >
                    <option value="new_construction">New Construction</option>
                    <option value="renovation">Renovation</option>
                    <option value="addition">Addition</option>
                    <option value="change_of_use">Change of Use</option>
                </select>
                {errors.project_type && (
                    <p className="text-red-500 text-sm mt-1">{errors.project_type}</p>
                )}
            </div>

            {category === 'individual_lot' && (
                <>
                    <Input
                        label="Building Type"
                        value={data.building_type}
                        onChange={(e) => setData('building_type', e.target.value)}
                        error={errors.building_type}
                        placeholder="e.g., Single Family House, Townhouse"
                    />
                    <Input
                        label="Number of Storeys"
                        type="number"
                        value={data.number_of_storeys || ''}
                        onChange={(e) => setData('number_of_storeys', parseInt(e.target.value) || null)}
                        error={errors.number_of_storeys}
                    />
                    <Input
                        label="Floor Area (sqm)"
                        type="number"
                        step="0.01"
                        value={data.floor_area_sqm || ''}
                        onChange={(e) => setData('floor_area_sqm', parseFloat(e.target.value) || null)}
                        error={errors.floor_area_sqm}
                    />
                </>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Project Description *
                </label>
                <textarea
                    value={data.project_description}
                    onChange={(e) => setData('project_description', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
                    placeholder="Provide a detailed description of the project..."
                    required
                />
                {errors.project_description && (
                    <p className="text-red-500 text-sm mt-1">{errors.project_description}</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Existing Structure *
                </label>
                <select
                    value={data.existing_structure}
                    onChange={(e) => setData('existing_structure', e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
                >
                    <option value="none">None</option>
                    <option value="existing_to_retain">Existing to Retain</option>
                    <option value="existing_to_demolish">Existing to Demolish</option>
                    <option value="existing_to_renovate">Existing to Renovate</option>
                </select>
                {errors.existing_structure && (
                    <p className="text-red-500 text-sm mt-1">{errors.existing_structure}</p>
                )}
            </div>

            <Input
                label="Estimated Cost (₱)"
                type="number"
                step="0.01"
                value={data.estimated_cost || ''}
                onChange={(e) => setData('estimated_cost', parseFloat(e.target.value) || null)}
                error={errors.estimated_cost}
                placeholder="Optional - Enter estimated project cost"
            />

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Purpose *
                </label>
                <textarea
                    value={data.purpose}
                    onChange={(e) => setData('purpose', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
                    placeholder="Describe the purpose and intent of this project..."
                    required
                />
                {errors.purpose && (
                    <p className="text-red-500 text-sm mt-1">{errors.purpose}</p>
                )}
            </div>
        </div>
    );
}
