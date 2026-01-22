import { useState } from 'react';
import { Copy, Check, MapPin } from 'lucide-react';
import Button from './Button';

interface CoordinateDisplayProps {
    latitude: number | null;
    longitude: number | null;
    className?: string;
    showLabel?: boolean;
}

export default function CoordinateDisplay({
    latitude,
    longitude,
    className = '',
    showLabel = true,
}: CoordinateDisplayProps) {
    const [copied, setCopied] = useState(false);

    // Convert to numbers if they're strings, and check for null/undefined
    const lat = typeof latitude === 'string' ? parseFloat(latitude) : latitude;
    const lng = typeof longitude === 'string' ? parseFloat(longitude) : longitude;

    if (lat === null || lng === null || isNaN(lat) || isNaN(lng)) {
        return null;
    }

    const coordinates = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    const fullText = `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(coordinates);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy coordinates:', error);
        }
    };

    return (
        <div className={`bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 ${className}`}>
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    {showLabel && <MapPin size={16} className="text-gray-500 dark:text-gray-400" />}
                    <div>
                        {showLabel ? (
                            <div className="text-sm">
                                <span className="text-gray-500 dark:text-gray-400">Coordinates:</span>
                                <span className="ml-2 font-mono text-gray-900 dark:text-white">{coordinates}</span>
                            </div>
                        ) : (
                            <span className="font-mono text-gray-900 dark:text-white text-sm">{fullText}</span>
                        )}
                    </div>
                </div>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    className="px-2 h-8"
                    title="Copy coordinates"
                >
                    {copied ? (
                        <Check size={14} className="text-green-600 dark:text-green-400" />
                    ) : (
                        <Copy size={14} className="text-gray-500 dark:text-gray-400" />
                    )}
                </Button>
            </div>
        </div>
    );
}
