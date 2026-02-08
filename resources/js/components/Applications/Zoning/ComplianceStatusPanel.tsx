import { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Loader2, Info } from 'lucide-react';
import axios from 'axios';

interface ComplianceResult {
    violations: string[];
    warnings: string[];
    compliant: boolean;
    score: number;
    classification?: string;
    zone_name?: string;
    recommendations?: string[];
}

interface ComplianceStatusPanelProps {
    applicationData: {
        zone_id?: number | null;
        lot_area_total?: number;
        lot_area_used?: number;
        floor_area_sqm?: number | null;
        number_of_storeys?: number | null;
        front_setback_m?: number | null;
        rear_setback_m?: number | null;
        side_setback_m?: number | null;
        building_footprint_sqm?: number | null;
        land_use_type?: string;
        building_height_m?: number | null;
    };
    onComplianceChange?: (result: ComplianceResult) => void;
}

export default function ComplianceStatusPanel({
    applicationData,
    onComplianceChange,
}: ComplianceStatusPanelProps) {
    const [compliance, setCompliance] = useState<ComplianceResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState(true);

    useEffect(() => {
        const checkCompliance = async () => {
            // Only check if we have minimum required data
            if (!applicationData.zone_id || !applicationData.lot_area_total) {
                setCompliance(null);
                return;
            }

            setLoading(true);
            try {
                // Use axios which automatically includes CSRF token
                const response = await axios.post('/api/zoning/check-compliance', applicationData);
                setCompliance(response.data);
                onComplianceChange?.(response.data);
            } catch (error) {
                console.error('Error checking compliance:', error);
            } finally {
                setLoading(false);
            }
        };

        // Debounce compliance checks
        const timeoutId = setTimeout(checkCompliance, 1000);
        return () => clearTimeout(timeoutId);
    }, [applicationData, onComplianceChange]);

    if (!compliance && !loading) {
        return null;
    }

    const getStatusColor = () => {
        if (!compliance) {
            return 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700';
        }

        if (compliance.compliant) {
            return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
        }

        if (compliance.violations.length > 0) {
            return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
        }

        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
    };

    const getStatusIcon = () => {
        if (loading) {
            return <Loader2 size={20} className="animate-spin text-gray-600 dark:text-gray-400" />;
        }

        if (!compliance) {
            return null;
        }

        if (compliance.compliant) {
            return <CheckCircle size={20} className="text-green-600 dark:text-green-400" />;
        }

        if (compliance.violations.length > 0) {
            return <XCircle size={20} className="text-red-600 dark:text-red-400" />;
        }

        return <AlertTriangle size={20} className="text-yellow-600 dark:text-yellow-400" />;
    };

    const getStatusText = () => {
        if (loading) {
            return 'Checking compliance...';
        }

        if (!compliance) {
            return 'Compliance check unavailable';
        }

        if (compliance.compliant) {
            return 'Compliant';
        }

        if (compliance.violations.length > 0) {
            return `${compliance.violations.length} Violation${compliance.violations.length > 1 ? 's' : ''}`;
        }

        return `${compliance.warnings.length} Warning${compliance.warnings.length > 1 ? 's' : ''}`;
    };

    return (
        <div className={`border rounded-lg p-4 ${getStatusColor()}`}>
            <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between"
            >
                <div className="flex items-center gap-3">
                    {getStatusIcon()}
                    <div className="text-left">
                        <div className="font-semibold text-gray-900 dark:text-white">Compliance Status</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{getStatusText()}</div>
                        {compliance && (
                            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                Score: {compliance.score}% | Zone: {compliance.classification || 'N/A'}
                            </div>
                        )}
                    </div>
                </div>
                {compliance && (
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {expanded ? '▼' : '▶'}
                    </div>
                )}
            </button>

            {expanded && compliance && (
                <div className="mt-4 space-y-4">
                    {/* Violations */}
                    {compliance.violations.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <XCircle size={16} className="text-red-600 dark:text-red-400" />
                                <h4 className="font-semibold text-red-900 dark:text-red-200">Violations</h4>
                            </div>
                            <ul className="list-disc list-inside space-y-1 text-sm text-red-800 dark:text-red-300">
                                {compliance.violations.map((violation, index) => (
                                    <li key={index}>{violation}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Warnings */}
                    {compliance.warnings.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle size={16} className="text-yellow-600 dark:text-yellow-400" />
                                <h4 className="font-semibold text-yellow-900 dark:text-yellow-200">Warnings</h4>
                            </div>
                            <ul className="list-disc list-inside space-y-1 text-sm text-yellow-800 dark:text-yellow-300">
                                {compliance.warnings.map((warning, index) => (
                                    <li key={index}>{warning}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Recommendations */}
                    {compliance.recommendations && compliance.recommendations.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Info size={16} className="text-blue-600 dark:text-blue-400" />
                                <h4 className="font-semibold text-blue-900 dark:text-blue-200">Recommendations</h4>
                            </div>
                            <ul className="list-disc list-inside space-y-1 text-sm text-blue-800 dark:text-blue-300">
                                {compliance.recommendations.map((recommendation, index) => (
                                    <li key={index}>{recommendation}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* All Clear */}
                    {compliance.compliant && compliance.violations.length === 0 && compliance.warnings.length === 0 && (
                        <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
                            <CheckCircle size={16} />
                            <span className="text-sm font-medium">
                                All compliance checks passed. Your application meets zoning requirements.
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
