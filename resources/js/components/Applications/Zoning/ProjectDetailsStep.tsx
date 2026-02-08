import Input from '../../Input';
import ComplianceStatusPanel from './ComplianceStatusPanel';
import ZoningTypeSelector from './ZoningTypeSelector';
import { Zone } from '../../../lib/zoneDetection';

interface ProjectDetailsStepProps {
    data: {
        pin_lat?: number | null;
        pin_lng?: number | null;
        zone_id?: number | null;
        lot_area_total: number;
        lot_area_used: number;
        number_of_storeys: number | null;
        floor_area_sqm: number | null;
        number_of_units: number | null;
        project_description: string;
        purpose: string;
        is_subdivision: boolean;
        subdivision_name: string;
        block_no: string;
        lot_no: string;
        total_lots_planned: number | null;
        has_subdivision_plan: boolean;
        land_use_type?: string;
        project_type?: string;
        building_type?: string;
        front_setback_m?: number | null;
        rear_setback_m?: number | null;
        side_setback_m?: number | null;
        building_footprint_sqm?: number | null;
    };
    setData: (key: string, value: unknown) => void;
    errors: Record<string, string>;
    zones?: Zone[];
    loadingZones?: boolean;
}

export default function ProjectDetailsStep({
    data,
    setData,
    errors,
    zones = [],
    loadingZones = false,
}: ProjectDetailsStepProps) {
    return (
        <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-blue-800 dark:text-blue-200 text-sm">
                    <strong>Phase 3: Project Details</strong> - Provide specific details about the lot and the structure. Our AI will analyze your inputs to suggest the best zoning classification.
                </p>
            </div>

            {/* Project Classification Section */}
            <div className="space-y-4 pt-4 border-b border-gray-200 dark:border-gray-700 pb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Project Classification</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Land Use Type
                        </label>
                        <select
                            id="land_use_type"
                            name="land_use_type"
                            value={data.land_use_type || 'residential'}
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
                            id="project_type"
                            name="project_type"
                            value={data.project_type || 'new_construction'}
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
                        id="building_type"
                        name="building_type"
                        label="Building Type"
                        value={data.building_type || ''}
                        onChange={(e) => setData('building_type', e.target.value)}
                        error={errors.building_type}
                        placeholder="e.g. Apartment, Factory, Single-detached House"
                        required
                    />
                </div>
            </div>

            {/* AI-Powered Zone Suggestions */}
            {data.pin_lat && data.pin_lng && zones.length > 0 && (
                <ZoningTypeSelector
                    zones={zones}
                    selectedZoneId={data.zone_id}
                    onZoneSelect={(zoneId) => setData('zone_id', zoneId)}
                    latitude={data.pin_lat}
                    longitude={data.pin_lng}
                    projectDescription={data.project_description || ''}
                    landUseType={data.land_use_type || 'residential'}
                    projectType={data.project_type || 'new_construction'}
                    buildingType={data.building_type || ''}
                    // Additional fields for enhanced AI analysis
                    lotAreaTotal={data.lot_area_total}
                    lotAreaUsed={data.lot_area_used}
                    floorAreaSqm={data.floor_area_sqm}
                    numberOfStoreys={data.number_of_storeys}
                    numberOfUnits={data.number_of_units}
                    purpose={data.purpose || ''}
                    isSubdivision={data.is_subdivision}
                />
            )}

            <div className="space-y-4 pt-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Lot Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                        id="lot_area_total"
                        name="lot_area_total"
                        label="Total Lot Area (sqm)"
                        type="number"
                        step="0.01"
                        value={data.lot_area_total || ''}
                        onChange={(e) => setData('lot_area_total', parseFloat(e.target.value) || 0)}
                        error={errors.lot_area_total}
                        required
                    />
                    <Input
                        id="lot_area_used"
                        name="lot_area_used"
                        label="Lot Area Used (sqm)" // For setbacks/FAR checks
                        type="number"
                        step="0.01"
                        value={data.lot_area_used || ''}
                        onChange={(e) => setData('lot_area_used', parseFloat(e.target.value) || 0)}
                        error={errors.lot_area_used}
                        required
                    />
                </div>

                <div>
                    <label className="flex items-center gap-2 mb-4">
                        <input
                            type="checkbox"
                            checked={data.is_subdivision}
                            onChange={(e) => setData('is_subdivision', e.target.checked)}
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Is this lot within a subdivision?
                        </span>
                    </label>

                    {data.is_subdivision && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-6 border-l-2 border-gray-200 dark:border-gray-700">
                            <Input
                                label="Subdivision Name"
                                value={data.subdivision_name}
                                onChange={(e) => setData('subdivision_name', e.target.value)}
                                error={errors.subdivision_name}
                            />
                            <Input
                                label="Block No."
                                value={data.block_no}
                                onChange={(e) => setData('block_no', e.target.value)}
                                error={errors.block_no}
                            />
                            <Input
                                label="Lot No."
                                value={data.lot_no}
                                onChange={(e) => setData('lot_no', e.target.value)}
                                error={errors.lot_no}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Compliance Status Panel */}
            {data.zone_id && (
                <ComplianceStatusPanel
                    applicationData={{
                        zone_id: data.zone_id,
                        lot_area_total: data.lot_area_total,
                        lot_area_used: data.lot_area_used,
                        floor_area_sqm: data.floor_area_sqm,
                        number_of_storeys: data.number_of_storeys,
                        front_setback_m: data.front_setback_m,
                        rear_setback_m: data.rear_setback_m,
                        side_setback_m: data.side_setback_m,
                        building_footprint_sqm: data.building_footprint_sqm,
                        land_use_type: data.land_use_type,
                    }}
                />
            )}

            <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Building & Structure</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Input
                        id="number_of_storeys"
                        name="number_of_storeys"
                        label="Number of Storeys"
                        type="number"
                        value={data.number_of_storeys || ''}
                        onChange={(e) => setData('number_of_storeys', parseInt(e.target.value) || null)}
                        error={errors.number_of_storeys}
                    />
                    <Input
                        id="floor_area_sqm"
                        name="floor_area_sqm"
                        label="Total Floor Area (sqm)"
                        type="number"
                        step="0.01"
                        value={data.floor_area_sqm || ''}
                        onChange={(e) => setData('floor_area_sqm', parseFloat(e.target.value) || null)}
                        error={errors.floor_area_sqm}
                    />
                    <Input
                        id="number_of_units"
                        name="number_of_units"
                        label="Number of Units"
                        type="number"
                        value={data.number_of_units || ''}
                        onChange={(e) => setData('number_of_units', parseInt(e.target.value) || null)}
                        error={errors.number_of_units}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Project Description
                    </label>
                    <textarea
                        id="project_description"
                        name="project_description"
                        value={data.project_description}
                        onChange={(e) => setData('project_description', e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white focus:ring-primary focus:border-primary"
                        placeholder="Detailed description of the project..."
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Purpose / Intent
                    </label>
                    <textarea
                        id="purpose"
                        name="purpose"
                        value={data.purpose}
                        onChange={(e) => setData('purpose', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white focus:ring-primary focus:border-primary"
                        placeholder="State the purpose of the application..."
                        required
                    />
                </div>
            </div>
        </div>
    );
}
