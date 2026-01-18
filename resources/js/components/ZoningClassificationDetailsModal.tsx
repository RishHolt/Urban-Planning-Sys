import { X } from 'lucide-react';
import type { ZoningClassification } from '../data/services';

interface ZoningClassificationDetailsModalProps {
    isOpen: boolean;
    classification: ZoningClassification | null;
    onClose: () => void;
}

export default function ZoningClassificationDetailsModal({
    isOpen,
    classification,
    onClose,
}: ZoningClassificationDetailsModalProps) {
    if (!isOpen || !classification) {
        return null;
    }

    return (
        <div className="z-50 fixed inset-0 flex justify-center items-center">
            <div
                className="fixed inset-0 bg-black/50 transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            />
            <div className="relative bg-white dark:bg-dark-surface shadow-xl mx-4 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="top-0 sticky flex justify-between items-center bg-white dark:bg-dark-surface px-6 py-4 border-gray-200 dark:border-gray-700 border-b">
                    <h2 className="font-bold text-gray-900 dark:text-white text-xl">
                        Zoning Classification Details
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Zone Name */}
                    <div>
                        <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-sm mb-1">
                            Zone Name
                        </h3>
                        <p className="text-gray-900 dark:text-white text-base">
                            {classification.zoneName}
                        </p>
                    </div>

                    {/* Zoning Code */}
                    <div>
                        <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-sm mb-1">
                            Zoning Code
                        </h3>
                        <p className="text-gray-900 dark:text-white text-base font-mono">
                            {classification.zoningCode}
                        </p>
                    </div>

                    {/* Land Use Category */}
                    {classification.landUseCategory && (
                        <div>
                            <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-sm mb-1">
                                Land Use Category
                            </h3>
                            <p className="text-gray-900 dark:text-white text-base">
                                {classification.landUseCategory}
                            </p>
                        </div>
                    )}

                    {/* Allowed Uses */}
                    {classification.allowedUses && (
                        <div>
                            <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-sm mb-2">
                                Allowed Uses
                            </h3>
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                                <p className="text-gray-900 dark:text-white text-sm whitespace-pre-wrap">
                                    {classification.allowedUses}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Conditional Uses */}
                    {classification.conditionalUses && (
                        <div>
                            <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-sm mb-2">
                                Conditional Uses
                            </h3>
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                                <p className="text-gray-900 dark:text-white text-sm whitespace-pre-wrap">
                                    {classification.conditionalUses}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Prohibited Uses */}
                    {classification.prohibitedUses && (
                        <div>
                            <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-sm mb-2">
                                Prohibited Uses
                            </h3>
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                                <p className="text-gray-900 dark:text-white text-sm whitespace-pre-wrap">
                                    {classification.prohibitedUses}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Close Button */}
                    <div className="flex justify-end pt-4 border-gray-200 dark:border-gray-700 border-t">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
