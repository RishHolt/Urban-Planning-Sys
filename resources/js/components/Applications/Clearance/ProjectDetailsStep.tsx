import Input from '../../Input';

interface ProjectDetailsStepProps {
    data: {
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
    };
    setData: (key: string, value: unknown) => void;
    errors: Record<string, string>;
}

export default function ProjectDetailsStep({
    data,
    setData,
    errors,
}: ProjectDetailsStepProps) {
    return (
        <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-blue-800 dark:text-blue-200 text-sm">
                    <strong>Phase 3: Project Details</strong> - Provide specific details about the lot and the structure.
                </p>
            </div>

            <div className="space-y-4 pt-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Lot Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                        label="Total Lot Area (sqm)"
                        type="number"
                        step="0.01"
                        value={data.lot_area_total || ''}
                        onChange={(e) => setData('lot_area_total', parseFloat(e.target.value) || 0)}
                        error={errors.lot_area_total}
                        required
                    />
                    <Input
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

            <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Building & Structure</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Input
                        label="Number of Storeys"
                        type="number"
                        value={data.number_of_storeys || ''}
                        onChange={(e) => setData('number_of_storeys', parseInt(e.target.value) || null)}
                        error={errors.number_of_storeys}
                    />
                    <Input
                        label="Total Floor Area (sqm)"
                        type="number"
                        step="0.01"
                        value={data.floor_area_sqm || ''}
                        onChange={(e) => setData('floor_area_sqm', parseFloat(e.target.value) || null)}
                        error={errors.floor_area_sqm}
                    />
                    <Input
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
