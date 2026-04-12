import { CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';

interface ComplianceReport {
    violations: string[];
    warnings: string[];
    compliant: boolean;
    status: 'compliant' | 'needs_review' | 'non_compliant';
    score: number;
    classification?: string;
    zone_name?: string;
    recommendations?: string[];
}

interface ComplianceReportViewProps {
    compliance: ComplianceReport;
}

export default function ComplianceReportView({ compliance }: ComplianceReportViewProps) {
    const getScoreTier = () => {
        if (compliance.status === 'compliant') return 'green';
        if (compliance.status === 'needs_review') return 'yellow';
        return 'red';
    };

    const getStatusColor = () => {
        const tier = getScoreTier();
        if (tier === 'green') return 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800';
        if (tier === 'yellow') return 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800';
        if (tier === 'red') return 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800';
        return 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700';
    };

    const getStatusIcon = () => {
        const tier = getScoreTier();
        if (tier === 'green') return <CheckCircle size={24} className="text-green-600 dark:text-green-400" />;
        if (tier === 'yellow') return <AlertTriangle size={24} className="text-yellow-600 dark:text-yellow-400" />;
        if (tier === 'red') return <XCircle size={24} className="text-red-600 dark:text-red-400" />;
        return <Info size={24} className="text-gray-400" />;
    };

    const getStatusLabel = () => {
        if (compliance.status === 'compliant') return 'Compliant';
        if (compliance.status === 'needs_review') return 'Needs Review';
        return 'Non-Compliant';
    };

    const getScoreBarColor = () => {
        const tier = getScoreTier();
        if (tier === 'green') return 'bg-green-500';
        if (tier === 'yellow') return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const getScoreLabelColor = () => {
        const tier = getScoreTier();
        if (tier === 'green') return 'text-green-700 dark:text-green-400';
        if (tier === 'yellow') return 'text-yellow-700 dark:text-yellow-400';
        if (tier === 'red') return 'text-red-700 dark:text-red-400';
        return 'text-gray-500';
    };

    return (
        <div className={`overflow-hidden border rounded-xl shadow-sm transition-all ${getStatusColor()}`}>
            <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                        <div className="mt-1">{getStatusIcon()}</div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                                Compliance Analysis
                            </h3>
                            <div className={`mt-1 text-sm font-semibold uppercase tracking-wider ${getScoreLabelColor()}`}>
                                {getStatusLabel()}
                            </div>
                            {compliance.zone_name && (
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 font-medium">
                                    Evaluated against <span className="font-bold text-gray-700 dark:text-gray-300">{compliance.zone_name} ({compliance.classification})</span> rules
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col items-end min-w-[140px]">
                        <div className="flex items-baseline gap-1 mb-1">
                            <span className={`text-3xl font-black ${getScoreLabelColor()}`}>
                                {Math.round(compliance.score)}
                            </span>
                            <span className="text-gray-400 text-sm font-bold">%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-1000 ${getScoreBarColor()}`}
                                style={{ width: `${compliance.score}%` }}
                            />
                        </div>
                        <span className="mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                            Compliance Score
                        </span>
                    </div>
                </div>

                {/* Content Sections */}
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Issues Column */}
                    <div className="space-y-6">
                        {compliance.violations.length > 0 && (
                            <div>
                                <h4 className="flex items-center gap-2 text-sm font-bold text-red-700 dark:text-red-400 uppercase tracking-widest mb-3">
                                    <XCircle size={14} /> Violations
                                </h4>
                                <ul className="space-y-2">
                                    {compliance.violations.map((violation, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-red-800 dark:text-red-300 leading-relaxed font-medium">
                                            <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-500" />
                                            {violation}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {compliance.warnings.length > 0 && (
                            <div>
                                <h4 className="flex items-center gap-2 text-sm font-bold text-yellow-700 dark:text-yellow-400 uppercase tracking-widest mb-3">
                                    <AlertTriangle size={14} /> Warnings
                                </h4>
                                <ul className="space-y-2">
                                    {compliance.warnings.map((warning, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-yellow-800 dark:text-yellow-300 leading-relaxed">
                                            <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-yellow-500" />
                                            {warning}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {compliance.status === 'compliant' && compliance.violations.length === 0 && (
                            <div className="flex items-center gap-3 p-4 bg-green-100/50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                <CheckCircle size={20} className="text-green-600" />
                                <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                                    All structural and land use requirements are satisfied for this zone.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Recommendations Column */}
                    <div className="bg-white/40 dark:bg-black/20 p-5 rounded-xl border border-gray-200/50 dark:border-gray-800/50">
                        <h4 className="flex items-center gap-2 text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-widest mb-4">
                            <Info size={14} /> Recommendations
                        </h4>
                        {compliance.recommendations && compliance.recommendations.length > 0 ? (
                            <ul className="space-y-3">
                                {compliance.recommendations.map((rec, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                        <div className="mt-1 flex-shrink-0 h-5 w-5 flex items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                                            {i + 1}
                                        </div>
                                        {rec}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-gray-500 italic">
                                No specific recommendations at this time.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
