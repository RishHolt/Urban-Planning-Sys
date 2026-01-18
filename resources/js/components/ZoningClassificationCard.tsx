import { Eye } from 'lucide-react';
import { generatePolygonColor } from '../lib/mapUtils';
import type { ZoningClassification } from '../data/services';

interface ZoningClassificationCardProps {
    classification: ZoningClassification;
    isSelected: boolean;
    polygonCount?: number;
    onSelect: () => void;
    onView: (e: React.MouseEvent) => void;
}

export default function ZoningClassificationCard({
    classification,
    isSelected,
    polygonCount,
    onSelect,
    onView,
}: ZoningClassificationCardProps) {
    const color = generatePolygonColor(classification.zoningCode);
    
    // Extract HSL values for background with opacity
    const hslMatch = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    const borderColor = color;

    return (
        <div
            onClick={onSelect}
            className={`
                relative cursor-pointer transition-all duration-200 
                bg-white dark:bg-dark-surface 
                shadow-lg rounded-lg p-4 border
                ${isSelected 
                    ? 'ring-2 ring-primary border-primary' 
                    : 'border-gray-200 dark:border-gray-700 hover:shadow-xl hover:border-gray-300 dark:hover:border-gray-600'
                }
            `}
            style={{
                backgroundColor: isSelected 
                    ? `hsla(${hslMatch ? hslMatch[1] : '0'}, ${hslMatch ? hslMatch[2] : '0'}%, ${hslMatch ? hslMatch[3] : '0'}%, 0.1)` 
                    : undefined,
            }}
        >
            {/* View Button */}
            <button
                onClick={onView}
                className="absolute top-2 right-2 p-1.5 rounded-md bg-white dark:bg-dark-surface shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-700 transition-shadow z-10"
                title="View Details"
            >
                <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>

            {/* Content */}
            <div className="pr-8">
                <div 
                    className="font-bold text-lg mb-1"
                    style={{ color: borderColor }}
                >
                    {classification.zoningCode}
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300 font-medium mb-2">
                    {classification.zoneName}
                </div>
                
                {classification.landUseCategory && (
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        {classification.landUseCategory}
                    </div>
                )}

                {polygonCount !== undefined && (
                    <div className="mt-2 inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-700 dark:text-gray-300">
                        {polygonCount} polygon{polygonCount !== 1 ? 's' : ''}
                    </div>
                )}
            </div>

            {/* Selected Indicator */}
            {isSelected && (
                <div 
                    className="absolute bottom-0 left-0 right-0 h-1 rounded-b-lg"
                    style={{ backgroundColor: borderColor }}
                />
            )}
        </div>
    );
}
