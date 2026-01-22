import Button from '../Button';

interface Zone {
    id: string;
    zoning_classification_id: string;
    label?: string | null;
    code: string; // From classification
    name: string; // From classification
    color?: string | null; // From classification
    is_active: boolean;
    has_geometry?: boolean;
}

interface ZoneCardProps {
    zone: Zone;
    isSelected: boolean;
    onSelect: (zone: Zone) => void;
}

export default function ZoneCard({ zone, isSelected, onSelect }: ZoneCardProps) {
    const statusBadge = zone.has_geometry
        ? (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Active
            </span>
        )
        : (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                No Boundaries
            </span>
        );

    return (
        <div
            className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                isSelected
                    ? 'border-primary bg-primary/5 dark:bg-primary/10'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-surface hover:border-primary/50'
            }`}
            onClick={() => onSelect(zone)}
        >
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        {zone.color && (
                            <div
                                className="w-4 h-4 rounded border border-gray-300 dark:border-gray-600 flex-shrink-0"
                                style={{ backgroundColor: zone.color }}
                            />
                        )}
                        <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                            {zone.label || 'N/A'}
                        </h3>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate mb-2">
                        {zone.code}
                    </p>
                    {statusBadge}
                </div>
            </div>
        </div>
    );
}
