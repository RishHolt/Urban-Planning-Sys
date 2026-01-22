import { Link, usePage } from '@inertiajs/react';
import AdminLayout from '../../../components/AdminLayout';
import AdminContentCard from '../../../components/AdminContentCard';
import { ArrowLeft, CheckSquare, Building } from 'lucide-react';

interface ComplianceReportShowProps {
    report: {
        id: string;
        building: { id: string; building_code: string; building_name: string | null } | null;
        unit: { id: string; unit_no: string } | null;
        year: number;
        quarter: number | null;
        compliance_status: string;
        violations_count: number;
        inspections_count: number;
        summary: string | null;
        generated_at: string;
    };
}

export default function ComplianceReportShow({ report }: ComplianceReportShowProps) {
    const { flash } = usePage<{ flash?: { success?: string } }>().props;

    const getStatusBadge = (status: string) => {
        const config: Record<string, { label: string; className: string }> = {
            'compliant': { label: 'Compliant', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
            'non_compliant': { label: 'Non-Compliant', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
            'conditional': { label: 'Conditional', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
            'pending_review': { label: 'Pending Review', className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' },
        };
        const c = config[status] || config['pending_review'];
        return <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${c.className}`}>{c.label}</span>;
    };

    return (
        <AdminLayout
            title={`Compliance Report ${report.year}${report.quarter ? ` Q${report.quarter}` : ''}`}
            description="Compliance Report Details"
            backButton={{
                href: '/admin/occupancy/reports',
                label: 'Back to Reports',
            }}
        >
            {flash?.success && (
                <div className="mb-4 p-4 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg">
                    {flash.success}
                </div>
            )}

            <div className="space-y-6">
                <AdminContentCard>
                    <h2 className="text-lg font-semibold text-foreground dark:text-white mb-4 flex items-center gap-2">
                        <CheckSquare size={20} />
                        Report Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-sm font-medium text-muted-foreground dark:text-gray-400 flex items-center gap-2">
                                <Building size={16} />
                                Building
                            </label>
                            <p className="text-foreground dark:text-white font-medium">
                                {report.building?.building_code || 'N/A'}
                            </p>
                            {report.building?.building_name && (
                                <p className="text-sm text-muted-foreground dark:text-gray-400">
                                    {report.building.building_name}
                                </p>
                            )}
                        </div>
                        {report.unit && (
                            <div>
                                <label className="text-sm font-medium text-muted-foreground dark:text-gray-400">Unit</label>
                                <p className="text-foreground dark:text-white">{report.unit.unit_no}</p>
                            </div>
                        )}
                        <div>
                            <label className="text-sm font-medium text-muted-foreground dark:text-gray-400">Period</label>
                            <p className="text-foreground dark:text-white">
                                {report.year} {report.quarter ? `Q${report.quarter}` : 'Annual'}
                            </p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground dark:text-gray-400">Compliance Status</label>
                            <div className="mt-1">{getStatusBadge(report.compliance_status)}</div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground dark:text-gray-400">Violations Count</label>
                            <p className="text-foreground dark:text-white text-2xl font-bold">{report.violations_count}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground dark:text-gray-400">Inspections Count</label>
                            <p className="text-foreground dark:text-white text-2xl font-bold">{report.inspections_count}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground dark:text-gray-400">Generated At</label>
                            <p className="text-foreground dark:text-white">{report.generated_at}</p>
                        </div>
                    </div>
                </AdminContentCard>

                {report.summary && (
                    <AdminContentCard>
                        <h2 className="text-lg font-semibold text-foreground dark:text-white mb-4">Summary</h2>
                        <p className="text-foreground dark:text-white whitespace-pre-wrap">{report.summary}</p>
                    </AdminContentCard>
                )}
            </div>
        </AdminLayout>
    );
}
