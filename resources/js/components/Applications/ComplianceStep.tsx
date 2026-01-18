import { useMemo } from 'react';
import Input from '../Input';
import { CheckCircle, XCircle, AlertCircle, Ruler } from 'lucide-react';

interface ComplianceStepProps {
    data: {
        clupConformance: boolean;
        zoningConformance: boolean;
        frontSetback?: number;
        sideSetback?: number;
        rearSetback?: number;
        distanceFromRoad?: number;
        proposedUse?: 'residential' | 'commercial' | 'mixed_use' | 'institutional';
        landType?: 'residential' | 'commercial' | 'industrial' | 'agricultural';
    };
    setData: (key: string, value: unknown) => void;
    errors: Record<string, string>;
}

// Simplified compliance logic - in production, this would check against actual zoning rules
function calculateComplianceStatus(
    proposedUse: string | undefined,
    landType: string | undefined,
    clupConformance: boolean,
    zoningConformance: boolean
): { status: 'compliant' | 'conditional' | 'non_compliant'; message: string } {
    if (!clupConformance || !zoningConformance) {
        return {
            status: 'non_compliant',
            message: 'Non-Compliant: Does not conform to CLUP or Zoning Ordinance',
        };
    }

    // Simplified: If proposed use matches land type, it's compliant
    if (proposedUse === landType) {
        return {
            status: 'compliant',
            message: 'Compliant: Proposed use is allowed in this zone',
        };
    }

    // Mixed-use and institutional might be conditional
    if (proposedUse === 'mixed_use' || proposedUse === 'institutional') {
        return {
            status: 'conditional',
            message: 'For Technical Review: Conditional use requires additional review',
        };
    }

    return {
        status: 'non_compliant',
        message: 'Non-Compliant: Proposed use is not allowed in this zone',
    };
}

export default function ComplianceStep({
    data,
    setData,
    errors,
}: ComplianceStepProps) {
    const complianceStatus = useMemo(
        () =>
            calculateComplianceStatus(
                data.proposedUse,
                data.landType,
                data.clupConformance,
                data.zoningConformance
            ),
        [data.proposedUse, data.landType, data.clupConformance, data.zoningConformance]
    );

    const getStatusIcon = () => {
        switch (complianceStatus.status) {
            case 'compliant':
                return <CheckCircle size={24} className="text-green-500" />;
            case 'conditional':
                return <AlertCircle size={24} className="text-yellow-500" />;
            case 'non_compliant':
                return <XCircle size={24} className="text-red-500" />;
        }
    };

    const getStatusColor = () => {
        switch (complianceStatus.status) {
            case 'compliant':
                return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200';
            case 'conditional':
                return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200';
            case 'non_compliant':
                return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200';
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="mb-2 font-bold text-gray-900 dark:text-white text-2xl">
                    Compliance & Planning Information
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Check zoning rules and planning compliance.
                </p>
            </div>

            {/* Compliance Status Display */}
            <div className={`flex items-center gap-3 p-4 border rounded-lg ${getStatusColor()}`}>
                {getStatusIcon()}
                <div>
                    <p className="font-semibold">Status: {complianceStatus.status.replace('_', ' ').toUpperCase()}</p>
                    <p className="text-sm">{complianceStatus.message}</p>
                </div>
            </div>

            {/* CLUP Conformance */}
            <div className="flex items-center gap-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <input
                    type="checkbox"
                    id="clupConformance"
                    checked={data.clupConformance}
                    onChange={(e) => setData('clupConformance', e.target.checked)}
                    className="border-gray-300 rounded focus:ring-primary text-primary"
                />
                <label
                    htmlFor="clupConformance"
                    className="text-gray-700 dark:text-gray-300 text-sm cursor-pointer"
                >
                    Conformance with Comprehensive Land Use Plan (CLUP) <span className="text-red-500">*</span>
                </label>
            </div>
            {errors.clupConformance && (
                <p className="text-red-500 text-sm">{errors.clupConformance}</p>
            )}

            {/* Zoning Conformance */}
            <div className="flex items-center gap-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <input
                    type="checkbox"
                    id="zoningConformance"
                    checked={data.zoningConformance}
                    onChange={(e) => setData('zoningConformance', e.target.checked)}
                    className="border-gray-300 rounded focus:ring-primary text-primary"
                />
                <label
                    htmlFor="zoningConformance"
                    className="text-gray-700 dark:text-gray-300 text-sm cursor-pointer"
                >
                    Conformance with Zoning Ordinance <span className="text-red-500">*</span>
                </label>
            </div>
            {errors.zoningConformance && (
                <p className="text-red-500 text-sm">{errors.zoningConformance}</p>
            )}

            {/* Setbacks */}
            <div>
                <h3 className="mb-4 font-semibold text-gray-900 dark:text-white text-lg">
                    Setbacks (in meters)
                </h3>
                <div className="gap-4 grid grid-cols-1 md:grid-cols-3">
                    <Input
                        type="number"
                        name="frontSetback"
                        label="Front Setback"
                        placeholder="Enter front setback"
                        min={0}
                        step="0.01"
                        value={data.frontSetback?.toString() || ''}
                        onChange={(e) => setData('frontSetback', parseFloat(e.target.value) || undefined)}
                        icon={<Ruler size={20} />}
                        error={errors.frontSetback}
                    />
                    <Input
                        type="number"
                        name="sideSetback"
                        label="Side Setback"
                        placeholder="Enter side setback"
                        min={0}
                        step="0.01"
                        value={data.sideSetback?.toString() || ''}
                        onChange={(e) => setData('sideSetback', parseFloat(e.target.value) || undefined)}
                        icon={<Ruler size={20} />}
                        error={errors.sideSetback}
                    />
                    <Input
                        type="number"
                        name="rearSetback"
                        label="Rear Setback"
                        placeholder="Enter rear setback"
                        min={0}
                        step="0.01"
                        value={data.rearSetback?.toString() || ''}
                        onChange={(e) => setData('rearSetback', parseFloat(e.target.value) || undefined)}
                        icon={<Ruler size={20} />}
                        error={errors.rearSetback}
                    />
                </div>
            </div>

            {/* Distance from Road */}
            <Input
                type="number"
                name="distanceFromRoad"
                label="Distance from Road / Easement (meters)"
                placeholder="Enter distance from road"
                min={0}
                step="0.01"
                value={data.distanceFromRoad?.toString() || ''}
                onChange={(e) => setData('distanceFromRoad', parseFloat(e.target.value) || undefined)}
                icon={<Ruler size={20} />}
                error={errors.distanceFromRoad}
            />
        </div>
    );
}
