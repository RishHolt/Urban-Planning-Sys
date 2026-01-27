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
    base_fee: number;
    variable_fee: number;
    variable_unit?: string;
    variable_rate?: number;
    quantity?: number;
    total: number;
}

export default function FeeAssessmentStep({ data, setData, errors }: FeeAssessmentStepProps) {
    const [loading, setLoading] = useState(true);
    const [assessment, setAssessment] = useState<{ amount: number, breakdown: FeeBreakdown } | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAssessment = async () => {
            setLoading(true);
            setError(null);
            try {
                // Prepare payload with only necessary fields
                const payload = {
                    zone_id: data.zone_id,
                    is_subdivision: data.is_subdivision,
                    total_lots_planned: data.total_lots_planned,
                    floor_area_sqm: data.floor_area_sqm,
                    project_type: data.project_type,
                };

                const response = await axios.post('/zoning-applications/assess-fees', payload);
                setAssessment(response.data);
                // Save fee to form data just in case, though backend recalculates it
                setData('assessed_fee', response.data.amount);
            } catch (err) {
                console.error('Fee assessment failed:', err);
                setError('Failed to calculate fees. Please try again or contact support.');
            } finally {
                setLoading(false);
            }
        };

        fetchAssessment();
    }, []); // Run once on mount

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(amount);
    };

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
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                        <span className="font-medium text-gray-700">Project Type</span>
                        <span className="font-bold text-gray-900">{assessment.breakdown.type}</span>
                    </div>

                    <div className="p-6 space-y-4">
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-600">Zoning Classification</span>
                            <span className="font-medium text-gray-900">{assessment.breakdown.classification || 'N/A'}</span>
                        </div>

                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-600">Base Fee</span>
                            <span className="font-medium text-gray-900">{formatCurrency(assessment.breakdown.base_fee)}</span>
                        </div>

                        {assessment.breakdown.variable_fee > 0 && (
                            <div className="py-2 border-b border-gray-100">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-gray-600">Variable Fee</span>
                                    <span className="font-medium text-gray-900">{formatCurrency(assessment.breakdown.variable_fee)}</span>
                                </div>
                                <div className="text-xs text-gray-500 text-right">
                                    {assessment.breakdown.quantity} {assessment.breakdown.variable_unit} × {formatCurrency(assessment.breakdown.variable_rate || 0)}
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between items-center pt-4 mt-2">
                            <span className="text-lg font-bold text-gray-900">Total Fee</span>
                            <span className="text-2xl font-bold text-blue-600">{formatCurrency(assessment.amount)}</span>
                        </div>
                    </div>
                </div>
            )}

            <div className="text-sm text-gray-500 italic">
                * Fees are subject to final verification by the Zoning Administrator. Additional fees may apply during processing.
            </div>
        </div>
    );
}
