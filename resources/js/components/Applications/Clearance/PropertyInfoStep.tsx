import Input from '../../Input';

interface PropertyInfoStepProps {
    data: {
        lot_owner: string;
        lot_area_total: number;
        is_subdivision: boolean;
        subdivision_name: string;
        block_no: string;
        lot_no: string;
        total_lots_planned: number | null;
        has_subdivision_plan: boolean;
    };
    setData: (key: string, value: unknown) => void;
    errors: Record<string, string>;
    category: 'individual_lot' | 'subdivision_development';
}

export default function PropertyInfoStep({
    data,
    setData,
    errors,
    category,
}: PropertyInfoStepProps) {
    return (
        <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-blue-800 dark:text-blue-200 text-sm">
                    <strong>Phase 1: Property Information</strong> - Provide details about the property.
                </p>
            </div>

            <Input
                label="Lot Owner / Developer Name *"
                value={data.lot_owner}
                onChange={(e) => setData('lot_owner', e.target.value)}
                error={errors.lot_owner}
                required
            />

            <Input
                label="Total Lot Area (sqm) *"
                type="number"
                step="0.01"
                value={data.lot_area_total || ''}
                onChange={(e) => setData('lot_area_total', parseFloat(e.target.value) || 0)}
                error={errors.lot_area_total}
                required
            />

            {category === 'individual_lot' && (
                <>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Is this lot within a subdivision?
                        </label>
                        <select
                            value={data.is_subdivision ? 'yes' : 'no'}
                            onChange={(e) => setData('is_subdivision', e.target.value === 'yes')}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
                        >
                            <option value="no">No</option>
                            <option value="yes">Yes</option>
                        </select>
                    </div>

                    {data.is_subdivision && (
                        <>
                            <Input
                                label="Subdivision Name *"
                                value={data.subdivision_name}
                                onChange={(e) => setData('subdivision_name', e.target.value)}
                                error={errors.subdivision_name}
                                required
                            />
                            <Input
                                label="Block Number *"
                                value={data.block_no}
                                onChange={(e) => setData('block_no', e.target.value)}
                                error={errors.block_no}
                                required
                            />
                            <Input
                                label="Lot Number *"
                                value={data.lot_no}
                                onChange={(e) => setData('lot_no', e.target.value)}
                                error={errors.lot_no}
                                required
                            />
                        </>
                    )}
                </>
            )}

            {category === 'subdivision_development' && (
                <>
                    <Input
                        label="Proposed Subdivision Name *"
                        value={data.subdivision_name}
                        onChange={(e) => setData('subdivision_name', e.target.value)}
                        error={errors.subdivision_name}
                        required
                    />
                    <Input
                        label="Total Lots Planned *"
                        type="number"
                        value={data.total_lots_planned || ''}
                        onChange={(e) => setData('total_lots_planned', parseInt(e.target.value) || null)}
                        error={errors.total_lots_planned}
                        required
                    />
                    <div>
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={data.has_subdivision_plan}
                                onChange={(e) => setData('has_subdivision_plan', e.target.checked)}
                                className="rounded"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                I have uploaded the subdivision plan
                            </span>
                        </label>
                        {errors.has_subdivision_plan && (
                            <p className="text-red-500 text-sm mt-1">{errors.has_subdivision_plan}</p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
