import Input from '../../Input';
import Select from '../../Select';
import ComplianceStatusPanel from './ComplianceStatusPanel';
import ZoningTypeSelector from './ZoningTypeSelector';
import { Zone } from '../../../lib/zoneDetection';

interface ProjectDetailsStepProps {
    data: {
        pin_lat?: number | null;
        pin_lng?: number | null;
        zone_id?: number | null;
        lot_area_total: number;
        building_footprint_sqm: number | null;
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
        tct_no: string;
        tax_declaration_no: string;
        project_cost: number | null;
        land_use_type?: string;
        project_type?: string;
        building_type?: string;
        front_setback_m?: number | null;
        rear_setback_m?: number | null;
        side_setback_left_m?: number | null;
        side_setback_right_m?: number | null;
    };
    setData: (key: string, value: unknown) => void;
    errors: Record<string, string>;
    zones?: Zone[];
    onComplianceStatusChange?: (status: string) => void;
}

export default function ProjectDetailsStep({
    data,
    setData,
    errors,
    zones = [],
    onComplianceStatusChange,
}: ProjectDetailsStepProps) {
    return (
        <div className="space-y-6">
            {/* AI-Powered Zone Suggestions */}
            {data.pin_lat && data.pin_lng && zones.length > 0 && (
                <ZoningTypeSelector
                    zones={zones}
                    selectedZoneId={data.zone_id ?? null}
                    onZoneSelect={(zoneId) => setData('zone_id', zoneId)}
                    latitude={data.pin_lat}
                    longitude={data.pin_lng}
                    projectDescription={data.project_description || ''}
                    landUseType={data.land_use_type || 'residential'}
                    projectType={data.project_type || 'new_construction'}
                    buildingType={data.building_type || ''}
                    // Additional fields for enhanced AI analysis
                    lotAreaTotal={data.lot_area_total}
                    lotAreaUsed={data.building_footprint_sqm ?? undefined}
                    floorAreaSqm={data.floor_area_sqm}
                    numberOfStoreys={data.number_of_storeys}
                    numberOfUnits={data.number_of_units}
                    purpose={data.purpose || ''}
                    isSubdivision={data.is_subdivision}
                />
            )}

            {/* Project Classification */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Project Classification</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Select
                        id="land_use_type"
                        name="land_use_type"
                        label="Proposed Use"
                        value={data.land_use_type || ''}
                        onChange={(e) => setData('land_use_type', e.target.value)}
                        error={errors.land_use_type}
                        required
                    >
                        <option value="">Select Proposed Use</option>
                        <option value="residential">Residential</option>
                        <option value="commercial">Commercial</option>
                        <option value="industrial">Industrial</option>
                        <option value="agricultural">Agricultural</option>
                        <option value="institutional">Institutional</option>
                        <option value="mixed_use">Mixed Use</option>
                    </Select>

                    <Select
                        id="project_type"
                        name="project_type"
                        label="Project Type"
                        value={data.project_type || ''}
                        onChange={(e) => setData('project_type', e.target.value)}
                        error={errors.project_type}
                        required
                    >
                        <option value="">Select Project Type</option>
                        <option value="new_construction">New Construction</option>
                        <option value="renovation">Renovation</option>
                        <option value="addition">Addition / Extension</option>
                        <option value="change_of_use">Change of Use</option>
                    </Select>
                </div>
            </div>

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
                        id="building_footprint_sqm"
                        name="building_footprint_sqm"
                        label="Proposed Building Footprint (sqm)"
                        type="number"
                        step="0.01"
                        value={data.building_footprint_sqm || ''}
                        onChange={(e) => setData('building_footprint_sqm', parseFloat(e.target.value) || 0)}
                        error={errors.building_footprint_sqm}
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                        id="tct_no"
                        name="tct_no"
                        label="Transfer Certificate of Title (TCT) No."
                        value={data.tct_no}
                        onChange={(e) => setData('tct_no', e.target.value)}
                        error={errors.tct_no}
                        placeholder="e.g. TCT No. 123456"
                        required
                    />
                    <Input
                        id="tax_declaration_no"
                        name="tax_declaration_no"
                        label="Tax Declaration No."
                        value={data.tax_declaration_no}
                        onChange={(e) => setData('tax_declaration_no', e.target.value)}
                        error={errors.tax_declaration_no}
                        placeholder="e.g. TD-2024-00123"
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

            {/* Project Valuation */}
            <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Project Valuation</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    The estimated project cost is the primary basis for fee assessment.
                </p>
                <Input
                    id="project_cost"
                    name="project_cost"
                    label="Estimated Project Cost (PHP)"
                    type="number"
                    step="0.01"
                    min="0"
                    value={data.project_cost || ''}
                    onChange={(e) => setData('project_cost', parseFloat(e.target.value) || null)}
                    error={errors.project_cost}
                    placeholder="e.g. 500000"
                    required
                />
            </div>

            {/* Setbacks */}
            <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Setbacks</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Minimum distances from the building to the lot boundaries (in meters).
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Input
                        id="front_setback_m"
                        name="front_setback_m"
                        label="Front Setback (m)"
                        type="number"
                        step="0.01"
                        min="0"
                        value={data.front_setback_m || ''}
                        onChange={(e) => setData('front_setback_m', parseFloat(e.target.value) || null)}
                        error={errors.front_setback_m}
                        placeholder="e.g. 3"
                    />
                    <Input
                        id="rear_setback_m"
                        name="rear_setback_m"
                        label="Rear Setback (m)"
                        type="number"
                        step="0.01"
                        min="0"
                        value={data.rear_setback_m || ''}
                        onChange={(e) => setData('rear_setback_m', parseFloat(e.target.value) || null)}
                        error={errors.rear_setback_m}
                        placeholder="e.g. 2"
                    />
                    <Input
                        id="side_setback_left_m"
                        name="side_setback_left_m"
                        label="Side Setback (Left) (m)"
                        type="number"
                        step="0.01"
                        min="0"
                        value={data.side_setback_left_m || ''}
                        onChange={(e) => setData('side_setback_left_m', parseFloat(e.target.value) || null)}
                        error={errors.side_setback_left_m}
                        placeholder="e.g. 1.5"
                    />
                    <Input
                        id="side_setback_right_m"
                        name="side_setback_right_m"
                        label="Side Setback (Right) (m)"
                        type="number"
                        step="0.01"
                        min="0"
                        value={data.side_setback_right_m || ''}
                        onChange={(e) => setData('side_setback_right_m', parseFloat(e.target.value) || null)}
                        error={errors.side_setback_right_m}
                        placeholder="e.g. 1.5"
                    />
                </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Building & Structure</h3>

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

            {/* Compliance Status Panel */}
            <ComplianceStatusPanel
                applicationData={{
                    zone_id: data.zone_id,
                    lot_area_total: data.lot_area_total,
                    lot_area_used: data.building_footprint_sqm ?? undefined,
                    floor_area_sqm: data.floor_area_sqm,
                    number_of_storeys: data.number_of_storeys,
                    front_setback_m: data.front_setback_m,
                    rear_setback_m: data.rear_setback_m,
                    side_setback_left_m: data.side_setback_left_m,
                    side_setback_right_m: data.side_setback_right_m,
                    building_footprint_sqm: data.building_footprint_sqm,
                    land_use_type: data.land_use_type,
                }}
                onComplianceChange={(result) => {
                    onComplianceStatusChange?.(result.status);
                }}
            />
        </div>
    );
}
