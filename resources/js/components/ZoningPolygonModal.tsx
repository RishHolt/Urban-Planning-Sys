import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { X } from 'lucide-react';
import Button from './Button';
import Input from './Input';

interface Polygon {
    id: string;
    barangay: string | null;
    areaSqm: number | null;
    geometry: Record<string, unknown>;
}

interface ZoningPolygonModalProps {
    isOpen: boolean;
    onClose: () => void;
    zoningId: string;
    polygon?: Polygon;
    onSuccess: () => void;
}

export default function ZoningPolygonModal({
    isOpen,
    onClose,
    zoningId,
    polygon,
    onSuccess,
}: ZoningPolygonModalProps) {
    const [barangay, setBarangay] = useState('');
    const [areaSqm, setAreaSqm] = useState('');
    const [geometryJson, setGeometryJson] = useState('');
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (polygon) {
            setBarangay(polygon.barangay || '');
            setAreaSqm(polygon.areaSqm?.toString() || '');
            setGeometryJson(JSON.stringify(polygon.geometry, null, 2));
        } else {
            setBarangay('');
            setAreaSqm('');
            setGeometryJson('');
        }
        setErrors({});
    }, [polygon, isOpen]);

    if (!isOpen) {
        return null;
    }

    const handleSubmit = (e: React.FormEvent): void => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});
        
        // Parse and validate GeoJSON
        let geometry: Record<string, unknown>;
        try {
            geometry = JSON.parse(geometryJson);
            if (!geometry || typeof geometry !== 'object') {
                setErrors({ geometry: 'Invalid GeoJSON format. Please provide a valid JSON object.' });
                setProcessing(false);
                return;
            }
        } catch (error) {
            setErrors({ geometry: 'Invalid JSON format. Please check your GeoJSON syntax.' });
            setProcessing(false);
            return;
        }

        const formData = {
            zoning_id: zoningId,
            barangay: barangay || null,
            area_sqm: areaSqm ? parseFloat(areaSqm) : null,
            geometry,
        };

        if (polygon) {
            router.patch(`/admin/zoning/clup/polygons/${polygon.id}`, formData, {
                onSuccess: () => {
                    onSuccess();
                    onClose();
                    setProcessing(false);
                },
                onError: (errors) => {
                    setErrors(errors as Record<string, string>);
                    setProcessing(false);
                },
            });
        } else {
            router.post('/admin/zoning/clup/polygons', formData, {
                onSuccess: () => {
                    onSuccess();
                    onClose();
                    setProcessing(false);
                },
                onError: (errors) => {
                    setErrors(errors as Record<string, string>);
                    setProcessing(false);
                },
            });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="fixed inset-0 bg-black/50 transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            />
            <div className="relative bg-white dark:bg-dark-surface rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
                    <h2 className="font-bold text-gray-900 dark:text-white text-xl">
                        {polygon ? 'Edit GIS Polygon' : 'Add GIS Polygon'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <Input
                                type="text"
                                name="barangay"
                                label="Barangay"
                                value={barangay}
                                onChange={(e) => setBarangay(e.target.value)}
                                error={errors.barangay}
                                maxLength={100}
                            />
                        </div>

                        <div>
                            <Input
                                type="number"
                                name="area_sqm"
                                label="Area (sqm)"
                                value={areaSqm}
                                onChange={(e) => setAreaSqm(e.target.value)}
                                error={errors.area_sqm}
                                step="0.01"
                                min="0"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                            Geometry (GeoJSON)
                        </label>
                        <textarea
                            name="geometry"
                            value={geometryJson}
                            onChange={(e) => setGeometryJson(e.target.value)}
                            rows={12}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-sm font-mono focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder='{"type": "Polygon", "coordinates": [[[lng, lat], [lng, lat], ...]]}'
                        />
                        {errors.geometry && (
                            <p className="mt-1 text-red-500 text-sm">{errors.geometry}</p>
                        )}
                        <p className="mt-2 text-gray-500 dark:text-gray-400 text-xs">
                            Enter GeoJSON format polygon geometry. Example: {"{"}"type": "Polygon", "coordinates": [[[120.980, 14.600], [120.982, 14.600], [120.982, 14.602], [120.980, 14.602], [120.980, 14.600]]]{"}"}
                        </p>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <Button type="button" variant="secondary" size="md" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" size="md" disabled={processing}>
                            {processing ? 'Saving...' : polygon ? 'Update' : 'Create'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
