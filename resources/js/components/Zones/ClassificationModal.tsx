import { useState, useEffect } from 'react';
import Button from '../Button';
import Input from '../Input';
import { generatePolygonColor } from '../../lib/mapUtils';
import { hslToHex } from '../../lib/colorUtils';
import {
    createZoningClassification,
    updateZoningClassification,
    type ZoningClassification,
} from '../../data/services';
import { showSuccess, showError } from '../../lib/swal';
import { X, Loader2 } from 'lucide-react';

interface ClassificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    classification?: ZoningClassification | null;
}

export default function ClassificationModal({ isOpen, onClose, onSuccess, classification }: ClassificationModalProps) {
    const isEditMode = !!classification;
    
    const [code, setCode] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [allowedUses, setAllowedUses] = useState('');
    const [color, setColor] = useState('');
    const [isActive, setIsActive] = useState(true);
    
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Reset form when modal opens or classification changes
    useEffect(() => {
        if (isOpen) {
            if (classification) {
                setCode(classification.code);
                setName(classification.name);
                setDescription(classification.description || '');
                setAllowedUses(classification.allowed_uses || '');
                setColor(classification.color || '');
                setIsActive(classification.is_active);
            } else {
                setCode('');
                setName('');
                setDescription('');
                setAllowedUses('');
                setColor('');
                setIsActive(true);
            }
            setErrors({});
        }
    }, [isOpen, classification]);

    if (!isOpen) {
        return null;
    }

    const handleCodeChange = (value: string) => {
        setCode(value);
        if (errors.code) {
            setErrors((prev) => ({ ...prev, code: '' }));
        }
    };

    const handleAutoColor = () => {
        if (code) {
            const hslColor = generatePolygonColor(code);
            const hexColor = hslToHex(hslColor);
            setColor(hexColor);
        } else {
            setColor('#3388ff');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        try {
            if (isEditMode && classification) {
                await updateZoningClassification(classification.id, {
                    code,
                    name,
                    description: description || null,
                    allowed_uses: allowedUses || null,
                    color: color || null,
                    is_active: isActive,
                });
                showSuccess('Classification updated successfully');
            } else {
                await createZoningClassification({
                    code,
                    name,
                    description: description || null,
                    allowed_uses: allowedUses || null,
                    color: color || null,
                    is_active: isActive,
                });
                showSuccess('Classification created successfully');
            }
            
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error(`Error ${isEditMode ? 'updating' : 'creating'} classification:`, error);
            if (error.message) {
                if (error.message.includes('code') || error.message.includes('already exists')) {
                    setErrors({ code: 'This classification code already exists' });
                } else if (error.message.includes('name')) {
                    setErrors({ name: error.message });
                } else {
                    showError(error.message || `Failed to ${isEditMode ? 'update' : 'create'} classification`);
                }
            } else {
                showError(`Failed to ${isEditMode ? 'update' : 'create'} classification`);
            }
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div
            className="z-50 fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="relative flex flex-col bg-white dark:bg-dark-surface shadow-2xl mx-4 rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex flex-shrink-0 justify-between items-center px-6 py-4 border-gray-200 dark:border-gray-700 border-b">
                    <div>
                        <h2 className="font-bold text-gray-900 dark:text-white text-xl">
                            {isEditMode ? 'Edit Classification' : 'Create Classification'}
                        </h2>
                        <p className="mt-1 text-gray-500 dark:text-gray-400 text-sm">
                            {isEditMode ? 'Update zoning classification details' : 'Create a new zoning classification'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors"
                        aria-label="Close modal"
                    >
                        <X size={24} className="text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 px-6 py-6 overflow-y-auto">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                Zone Code <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="text"
                                value={code}
                                onChange={(e) => handleCodeChange(e.target.value)}
                                placeholder="e.g., R-1, C-2, BP-220"
                                required
                                disabled={isEditMode}
                                className={errors.code ? 'border-red-500' : ''}
                            />
                            {errors.code && (
                                <p className="mt-1 text-red-600 dark:text-red-400 text-sm">{errors.code}</p>
                            )}
                            <p className="mt-1 text-gray-500 dark:text-gray-400 text-xs">
                                {isEditMode ? 'Code cannot be changed after creation' : 'Alphanumeric with dashes only (e.g., R-1, C-2)'}
                            </p>
                        </div>

                        <div>
                            <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                Zone Name <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g., Low Density Residential"
                                required
                                className={errors.name ? 'border-red-500' : ''}
                            />
                            {errors.name && (
                                <p className="mt-1 text-red-600 dark:text-red-400 text-sm">{errors.name}</p>
                            )}
                        </div>

                        <div>
                            <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                Description
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Zone description..."
                                rows={3}
                                className="bg-white dark:bg-dark-surface px-3 py-2 border border-gray-300 focus:border-transparent dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary w-full text-gray-900 dark:text-white text-sm"
                            />
                        </div>

                        <div>
                            <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                Allowed Uses
                            </label>
                            <textarea
                                value={allowedUses}
                                onChange={(e) => setAllowedUses(e.target.value)}
                                placeholder="e.g., Single-detached houses, duplex, churches"
                                rows={3}
                                className="bg-white dark:bg-dark-surface px-3 py-2 border border-gray-300 focus:border-transparent dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary w-full text-gray-900 dark:text-white text-sm"
                            />
                        </div>

                        <div>
                            <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                Color
                            </label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={color || '#3388ff'}
                                    onChange={(e) => setColor(e.target.value)}
                                    className="border border-gray-300 dark:border-gray-600 rounded w-16 h-10 cursor-pointer"
                                />
                                <Input
                                    type="text"
                                    value={color || ''}
                                    onChange={(e) => setColor(e.target.value)}
                                    placeholder="Click Auto to generate from code"
                                    className="flex-1"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleAutoColor}
                                    disabled={!code}
                                >
                                    Auto
                                </Button>
                            </div>
                        </div>

                        <div>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={isActive}
                                    onChange={(e) => setIsActive(e.target.checked)}
                                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                                />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Active
                                </span>
                            </label>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button type="submit" disabled={processing} className="flex-1">
                                {processing ? (
                                    <>
                                        <Loader2 size={16} className="mr-2 animate-spin" />
                                        {isEditMode ? 'Updating...' : 'Creating...'}
                                    </>
                                ) : (
                                    isEditMode ? 'Update Classification' : 'Create Classification'
                                )}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                className="flex-1"
                                disabled={processing}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
