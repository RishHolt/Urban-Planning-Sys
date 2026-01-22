import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import Button from '../Button';
import Input from '../Input';
import { generatePolygonColor } from '../../lib/mapUtils';
import { hslToHex } from '../../lib/colorUtils';
import { getZoningClassifications, updateZoningClassification, type ZoningClassification } from '../../data/services';
import { Trash2, Edit, MapPin, X } from 'lucide-react';
import type { SharedData } from '../../types';

interface Zone {
    id: string;
    zoning_classification_id: string;
    label?: string | null;
    code: string; // From classification
    name: string; // From classification
    description?: string | null; // From classification
    allowed_uses?: string | null; // From classification
    color?: string | null; // From classification
    is_active: boolean;
    has_geometry?: boolean;
    geometry?: GeoJSON.Polygon | GeoJSON.MultiPolygon | null;
    classification?: ZoningClassification | null;
}

interface ZoneDetailsPanelProps {
    zone: Zone | null;
    onDrawBoundaries: () => void;
    onEditBoundaries: () => void;
    onDelete: () => void;
    onUpdate: (data: Partial<Zone>) => void;
    onClose?: () => void;
}

export default function ZoneDetailsPanel({
    zone,
    onDrawBoundaries,
    onEditBoundaries,
    onDelete,
    onUpdate,
    onClose,
}: ZoneDetailsPanelProps) {
    const page = usePage<SharedData>();
    const user = page.props.auth?.user;
    const canEditLabel = user && ['staff', 'admin'].includes(user.role || '');
    
    const [classifications, setClassifications] = useState<ZoningClassification[]>([]);
    const [isUpdatingClassification, setIsUpdatingClassification] = useState(false);
    const [isEditingLabel, setIsEditingLabel] = useState(false);
    const [labelValue, setLabelValue] = useState('');

    useEffect(() => {
        if (zone) {
            loadClassifications();
            setLabelValue(zone.label || '');
            setIsEditingLabel(false);
        }
    }, [zone]);

    const loadClassifications = async () => {
        try {
            const data = await getZoningClassifications(true);
            setClassifications(data);
        } catch (error) {
            console.error('Failed to load classifications:', error);
        }
    };

    if (!zone) {
        return (
            <div className="p-4 text-gray-500 dark:text-gray-400 text-center">
                Select a zone to view details
            </div>
        );
    }

    const handleColorChange = async (color: string) => {
        if (!zone.classification) {
            return;
        }

        setIsUpdatingClassification(true);
        try {
            await updateZoningClassification(zone.classification.id, { color });
            // Update the zone's color in the parent component
            onUpdate({ color });
        } catch (error) {
            console.error('Failed to update classification color:', error);
        } finally {
            setIsUpdatingClassification(false);
        }
    };

    const handleAutoColor = async () => {
        if (!zone.classification) {
            return;
        }

        const hslColor = generatePolygonColor(zone.code);
        const hexColor = hslToHex(hslColor);
        await handleColorChange(hexColor);
    };

    const handleClassificationChange = async (classificationId: string) => {
        onUpdate({ zoning_classification_id: classificationId });
    };

    return (
        <div className="space-y-4 p-4">
            <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-900 dark:text-white text-lg">Zone Details</h3>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded-md text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 dark:text-gray-400 transition-colors"
                        aria-label="Close"
                    >
                        <X size={20} />
                    </button>
                )}
            </div>

            <div>
                <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300 text-sm">
                    Zone Label
                </label>
                {canEditLabel && isEditingLabel ? (
                    <div className="flex items-center gap-2">
                        <Input
                            type="text"
                            value={labelValue}
                            onChange={(e) => setLabelValue(e.target.value)}
                            placeholder="ZN-12345678"
                            className="flex-1"
                        />
                        <Button
                            type="button"
                            size="sm"
                            onClick={() => {
                                onUpdate({ label: labelValue || null });
                                setIsEditingLabel(false);
                            }}
                        >
                            Save
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setLabelValue(zone.label || '');
                                setIsEditingLabel(false);
                            }}
                        >
                            Cancel
                        </Button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <p className="flex-1 text-gray-900 dark:text-white text-sm">{zone.label || 'N/A'}</p>
                        {canEditLabel && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setIsEditingLabel(true)}
                            >
                                <Edit size={14} />
                            </Button>
                        )}
                    </div>
                )}
            </div>

            <div>
                <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300 text-sm">
                    Classification Code
                </label>
                <p className="font-medium text-gray-900 dark:text-white text-sm">{zone.code}</p>
            </div>

            <div>
                <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300 text-sm">
                    Classification Name
                </label>
                <p className="text-gray-900 dark:text-white text-sm">{zone.name}</p>
            </div>

            <div>
                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                    Change Classification
                </label>
                <select
                    value={zone.zoning_classification_id}
                    onChange={(e) => handleClassificationChange(e.target.value)}
                    className="bg-white dark:bg-dark-surface px-3 py-2 border border-gray-300 focus:border-transparent dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary w-full text-gray-900 dark:text-white text-sm"
                >
                    {classifications.map((classification) => (
                        <option key={classification.id} value={classification.id}>
                            {classification.code} - {classification.name}
                        </option>
                    ))}
                </select>
            </div>

            {zone.description && (
                <div>
                    <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300 text-sm">
                        Description
                    </label>
                    <p className="text-gray-900 dark:text-white text-sm whitespace-pre-wrap">
                        {zone.description}
                    </p>
                </div>
            )}

            {zone.allowed_uses && (
                <div>
                    <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300 text-sm">
                        Allowed Uses
                    </label>
                    <p className="text-gray-900 dark:text-white text-sm whitespace-pre-wrap">
                        {zone.allowed_uses}
                    </p>
                </div>
            )}

            <div>
                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                    Color
                </label>
                <div className="flex items-center gap-3">
                    <input
                        type="color"
                        value={zone.color || '#3388ff'}
                        onChange={(e) => handleColorChange(e.target.value)}
                        className="border border-gray-300 dark:border-gray-600 rounded w-16 h-10 cursor-pointer"
                    />
                    <Input
                        type="text"
                        value={zone.color || ''}
                        onChange={(e) => handleColorChange(e.target.value)}
                        placeholder="Color"
                        className="flex-1"
                    />
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAutoColor}
                    >
                        Auto
                    </Button>
                </div>
            </div>

            <div>
                <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300 text-sm">
                    Status
                </label>
                <div className="flex items-center gap-2">
                    {zone.has_geometry ? (
                        <span className="inline-flex items-center bg-green-100 dark:bg-green-900 px-2 py-1 rounded-full font-medium text-green-800 dark:text-green-200 text-xs">
                            Active
                        </span>
                    ) : (
                        <span className="inline-flex items-center bg-yellow-100 dark:bg-yellow-900 px-2 py-1 rounded-full font-medium text-yellow-800 dark:text-yellow-200 text-xs">
                            No Boundaries
                        </span>
                    )}
                </div>
            </div>

            <div className="space-y-2 pt-4 border-gray-200 dark:border-gray-700 border-t">
                {!zone.has_geometry ? (
                    <Button
                        onClick={onDrawBoundaries}
                        className="flex justify-center items-center gap-2 w-full"
                    >
                        <MapPin size={16} />
                        Draw Boundaries
                    </Button>
                ) : (
                    <Button
                        onClick={onEditBoundaries}
                        variant="outline"
                        className="flex justify-center items-center gap-2 w-full"
                    >
                        <Edit size={16} />
                        Edit Boundaries
                    </Button>
                )}

                <Button
                    onClick={onDelete}
                    variant="outline"
                    className="flex justify-center items-center gap-2 w-full text-red-600 hover:text-red-700 dark:hover:text-red-300 dark:text-red-400"
                >
                    <Trash2 size={16} />
                    Delete Zone
                </Button>
            </div>
        </div>
    );
}
