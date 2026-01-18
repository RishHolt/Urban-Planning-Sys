import { useState } from 'react';
import { Plus, Trash2, Edit, X } from 'lucide-react';
import Button from '../Button';
import Input from '../Input';
import { useForm } from '@inertiajs/react';
import { showError } from '../../lib/swal';

interface Classification {
    id?: string;
    zoningCode: string;
    zoneName: string;
    landUseCategory: string | null;
    allowedUses: string | null;
    conditionalUses: string | null;
    prohibitedUses: string | null;
}

interface ZoningClassificationsStepProps {
    classifications: Classification[];
    onAddClassification: (classification: Classification) => void;
    onRemoveClassification: (index: number) => void;
    onUpdateClassification: (index: number, classification: Classification) => void;
}

export default function ZoningClassificationsStep({
    classifications,
    onAddClassification,
    onRemoveClassification,
    onUpdateClassification,
}: ZoningClassificationsStepProps) {
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [showForm, setShowForm] = useState(classifications.length === 0);

    const { data, setData, errors, reset } = useForm({
        zoning_code: '',
        zone_name: '',
        land_use_category: '',
        allowed_uses: '',
        conditional_uses: '',
        prohibited_uses: '',
    });

    const handleAddNew = (): void => {
        setEditingIndex(null);
        reset();
        setShowForm(true);
    };

    const handleEdit = (index: number): void => {
        const classification = classifications[index];
        setEditingIndex(index);
        setData({
            zoning_code: classification.zoningCode,
            zone_name: classification.zoneName,
            land_use_category: classification.landUseCategory || '',
            allowed_uses: classification.allowedUses || '',
            conditional_uses: classification.conditionalUses || '',
            prohibited_uses: classification.prohibitedUses || '',
        });
        setShowForm(true);
    };

    const handleCancel = (): void => {
        setShowForm(false);
        setEditingIndex(null);
        reset();
    };

    const handleSaveClassification = async (): Promise<void> => {
        // Validate required fields
        if (!data.zoning_code || !data.zone_name) {
            await showError('Please fill in Zoning Code and Zone Name.');
            return;
        }

        const classification: Classification = {
            zoningCode: data.zoning_code.trim(),
            zoneName: data.zone_name.trim(),
            landUseCategory: data.land_use_category?.trim() || null,
            allowedUses: data.allowed_uses?.trim() || null,
            conditionalUses: data.conditional_uses?.trim() || null,
            prohibitedUses: data.prohibited_uses?.trim() || null,
        };

        if (editingIndex !== null && editingIndex >= 0) {
            onUpdateClassification(editingIndex, classification);
        } else {
            onAddClassification(classification);
        }

        handleCancel();
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="mb-2 font-bold text-gray-900 dark:text-white text-2xl">
                    Zoning Classifications
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Add zoning classifications for this CLUP. You can add more classifications later from the CLUP details page.
                </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-blue-800 dark:text-blue-200 text-sm">
                    Add zoning classifications for this CLUP. Classifications will be saved to the database when you submit the CLUP form. You can add, edit, or remove classifications before submitting.
                </p>
            </div>

            {/* Inline Form */}
            {showForm && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                            {editingIndex !== null ? 'Edit Classification' : 'Add New Classification'}
                        </h3>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCancel}
                            className="flex items-center gap-1"
                        >
                            <X size={18} />
                        </Button>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                type="text"
                                name="zoning_code"
                                label="Zoning Code"
                                value={data.zoning_code}
                                onChange={(e) => setData('zoning_code', e.target.value)}
                                error={errors.zoning_code}
                                required
                                maxLength={10}
                                placeholder="e.g., R1, C1, I1"
                            />

                            <Input
                                type="text"
                                name="zone_name"
                                label="Zone Name"
                                value={data.zone_name}
                                onChange={(e) => setData('zone_name', e.target.value)}
                                error={errors.zone_name}
                                required
                                maxLength={100}
                                placeholder="e.g., Low Density Residential"
                            />
                        </div>

                        <Input
                            type="text"
                            name="land_use_category"
                            label="Land Use Category"
                            value={data.land_use_category}
                            onChange={(e) => setData('land_use_category', e.target.value)}
                            error={errors.land_use_category}
                            maxLength={50}
                            placeholder="e.g., Residential, Commercial, Industrial"
                        />

                        <div>
                            <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                Allowed Uses
                            </label>
                            <textarea
                                name="allowed_uses"
                                value={data.allowed_uses}
                                onChange={(e) => setData('allowed_uses', e.target.value)}
                                rows={3}
                                className="bg-white dark:bg-dark-surface px-4 py-3 border border-gray-300 focus:border-transparent dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary w-full text-gray-900 dark:text-white text-sm"
                                placeholder="e.g., Single-family houses, Churches, Small Parks"
                            />
                            {errors.allowed_uses && (
                                <p className="mt-1 text-red-500 text-sm">{errors.allowed_uses}</p>
                            )}
                        </div>

                        <div>
                            <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                Conditional Uses
                            </label>
                            <textarea
                                name="conditional_uses"
                                value={data.conditional_uses}
                                onChange={(e) => setData('conditional_uses', e.target.value)}
                                rows={3}
                                className="bg-white dark:bg-dark-surface px-4 py-3 border border-gray-300 focus:border-transparent dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary w-full text-gray-900 dark:text-white text-sm"
                                placeholder="e.g., Small neighborhood store, Food kiosks"
                            />
                            {errors.conditional_uses && (
                                <p className="mt-1 text-red-500 text-sm">{errors.conditional_uses}</p>
                            )}
                        </div>

                        <div>
                            <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                Prohibited Uses
                            </label>
                            <textarea
                                name="prohibited_uses"
                                value={data.prohibited_uses}
                                onChange={(e) => setData('prohibited_uses', e.target.value)}
                                rows={3}
                                className="bg-white dark:bg-dark-surface px-4 py-3 border border-gray-300 focus:border-transparent dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary w-full text-gray-900 dark:text-white text-sm"
                                placeholder="e.g., Warehouse, Factory, High-pollution industry"
                            />
                            {errors.prohibited_uses && (
                                <p className="mt-1 text-red-500 text-sm">{errors.prohibited_uses}</p>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <Button 
                                type="button" 
                                variant="secondary" 
                                size="md" 
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleCancel();
                                }}
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="button" 
                                variant="primary" 
                                size="md" 
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleSaveClassification();
                                }}
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                }}
                            >
                                {editingIndex !== null ? 'Update Classification' : 'Add Classification'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Classifications List */}
            {classifications.length > 0 && (
                <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                        Added Classifications ({classifications.length})
                    </h3>
                    {classifications.map((classification, index) => (
                        <div
                            key={index}
                            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow bg-white dark:bg-dark-surface"
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <h4 className="mb-1 font-semibold text-gray-900 dark:text-white text-lg">
                                        {classification.zoningCode} - {classification.zoneName}
                                    </h4>
                                    {classification.landUseCategory && (
                                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                                            Category: {classification.landUseCategory}
                                        </p>
                                    )}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                                        {classification.allowedUses && (
                                            <div>
                                                <span className="font-medium">Allowed:</span> {classification.allowedUses.substring(0, 50)}
                                                {classification.allowedUses.length > 50 && '...'}
                                            </div>
                                        )}
                                        {classification.conditionalUses && (
                                            <div>
                                                <span className="font-medium">Conditional:</span> {classification.conditionalUses.substring(0, 50)}
                                                {classification.conditionalUses.length > 50 && '...'}
                                            </div>
                                        )}
                                        {classification.prohibitedUses && (
                                            <div>
                                                <span className="font-medium">Prohibited:</span> {classification.prohibitedUses.substring(0, 50)}
                                                {classification.prohibitedUses.length > 50 && '...'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2 ml-4">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleEdit(index);
                                        }}
                                        disabled={showForm}
                                        type="button"
                                        className="flex items-center gap-1"
                                    >
                                        <Edit size={14} />
                                        Edit
                                    </Button>
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            onRemoveClassification(index);
                                        }}
                                        disabled={showForm}
                                        type="button"
                                        className="flex items-center gap-1"
                                    >
                                        <Trash2 size={14} />
                                        Remove
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Button */}
            {!showForm && (
                <Button
                    variant="primary"
                    size="md"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleAddNew();
                    }}
                    type="button"
                    className="flex items-center gap-2"
                >
                    <Plus size={18} />
                    {classifications.length === 0 ? 'Add First Classification' : 'Add Another Classification'}
                </Button>
            )}
        </div>
    );
}
