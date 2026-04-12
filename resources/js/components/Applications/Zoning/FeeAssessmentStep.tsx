import React, { useEffect, useState } from 'react';

import axios from 'axios';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

interface FeeAssessmentStepProps {
    data: any;
    setData: (key: string, value: any) => void;
    errors: any;
}

interface FeeBreakdown {
    type: string;
    classification: string;
    verification_fee: number;
    inspection_fee: number;
    processing_fee: number;
    processing_rate: number;
    floor_area_sqm: number;
    // Subdivision-only fields
    lots_planned?: number;
    subdivision_base?: number;
    lot_fee?: number;
    total: number;
}

export default function FeeAssessmentStep({ data, setData, errors }: FeeAssessmentStepProps) {
    const [loading, setLoading] = useState(true);
    const [assessment, setAssessment] = useState<{ amount: number, breakdown: FeeBreakdown } | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAssessment = async () => {
            if (!data.zone_id) {
                setError('Please select a zone first to calculate fees.');
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);
            try {
                const payload = {
                    zone_id: data.zone_id,
                    is_subdivision: data.is_subdivision || false,
                    total_lots_planned: data.total_lots_planned || null,
                    floor_area_sqm: data.floor_area_sqm || null,
                    project_type: data.project_type || null,
                };

                const response = await axios.post('/zoning-applications/assess-fees', payload);

                if (response.data.error) {
                    setError(response.data.message || 'Failed to calculate fees. Please try again.');
                    return;
                }

                setAssessment(response.data);
                if (response.data.amount !== undefined) {
                    setData('assessed_fee', response.data.amount);
                }
            } catch (err: any) {
                console.error('Fee assessment failed:', err);
                const errorMessage = err.response?.data?.message
                    || err.response?.data?.error
                    || err.message
                    || 'Failed to calculate fees. Please try again or contact support.';
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        if (data.zone_id) {
            fetchAssessment();
        } else {
            setLoading(false);
            setError('Please select a zone first to calculate fees.');
        }
    }, [data.zone_id, data.is_subdivision, data.total_lots_planned, data.floor_area_sqm, data.project_type]);

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
                <p className="text-gray-500">Calculating applicable fees...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3" />
                <div>
                    <h3 className="text-sm font-medium text-red-800">Calculation Error</h3>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-3 text-sm font-medium text-red-600 hover:text-red-500"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 mr-2" />
                    <h3 className="text-lg font-medium text-blue-900">Fee Assessment</h3>
                </div>
                <p className="text-blue-700 text-sm">
                    Based on your project details and zoning classification, the following fees have been assessed.
                </p>
            </div>

            {assessment && (
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                        <span className="font-medium text-gray-700">Project Type</span>
                        <span className="font-bold text-gray-900">{assessment.breakdown.type}</span>
                    </div>

                    <div className="p-6 space-y-3">
                        {/* Classification */}
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-600">Zoning Classification</span>
                            <span className="font-medium text-gray-900">{assessment.breakdown.classification}</span>
                        </div>

                        {/* Verification Fee */}
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-600">Zoning & Land Use Verification Fee</span>
                            <span className="font-medium text-gray-900">{formatCurrency(assessment.breakdown.verification_fee ?? 0)}</span>
                        </div>

                        {/* Inspection Fee */}
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-600">Inspection Fee</span>
                            <span className="font-medium text-gray-900">{formatCurrency(assessment.breakdown.inspection_fee ?? 0)}</span>
                        </div>

                        {/* Processing Fee */}
                        {assessment.breakdown.type === 'Subdivision Project' ? (
                            <div className="py-2 border-b border-gray-100">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-gray-600">Processing Fee (Subdivision)</span>
                                    <span className="font-medium text-gray-900">{formatCurrency(assessment.breakdown.processing_fee ?? 0)}</span>
                                </div>
                                <div className="text-xs text-gray-500 text-right">
                                    Base ₱1,000 + {assessment.breakdown.lots_planned ?? 0} lots × {formatCurrency(assessment.breakdown.processing_rate ?? 0)}
                                </div>
                            </div>
                        ) : (
                            <div className="py-2 border-b border-gray-100">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-gray-600">Processing Fee (per sqm floor area)</span>
                                    <span className="font-medium text-gray-900">{formatCurrency(assessment.breakdown.processing_fee ?? 0)}</span>
                                </div>
                                <div className="text-xs text-gray-500 text-right">
                                    {assessment.breakdown.floor_area_sqm ?? 0} sqm × {formatCurrency(assessment.breakdown.processing_rate ?? 0)}
                                </div>
                            </div>
                        )}

                        {/* Total */}
                        <div className="flex justify-between items-center pt-4 mt-2 border-t-2 border-gray-200">
                            <span className="text-lg font-bold text-gray-900">Total Fee</span>
                            <span className="text-2xl font-bold text-blue-600">{formatCurrency(assessment.amount)}</span>
                        </div>
                    </div>
                </div>
            )}

            <div className="text-sm text-gray-500 italic">
                * Fees are based on the Caloocan City Revenue Code. Subject to final verification by the Zoning Administrator. Additional fees may apply during processing.
            </div>
        </div>
    );
}
