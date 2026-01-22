import { Link, usePage } from '@inertiajs/react';
import AdminLayout from '../../../components/AdminLayout';
import AdminContentCard from '../../../components/AdminContentCard';
import { ArrowLeft, FileWarning, Building, Eye } from 'lucide-react';

interface ViolationShowProps {
    violation: {
        id: string;
        violation_no: string;
        violation_type: string;
        description: string;
        severity: string;
        status: string;
        building: { id: string; building_code: string } | null;
        unit: { id: string; unit_no: string } | null;
        inspection: { id: string } | null;
        violation_date: string;
        compliance_deadline: string | null;
        resolved_date: string | null;
        resolution: string | null;
        fine_amount: number | null;
        created_at: string;
    };
}

export default function ViolationShow({ violation }: ViolationShowProps) {
    const { flash } = usePage<{ flash?: { success?: string } }>().props;

    const getSeverityBadge = (severity: string) => {
        const config: Record<string, { label: string; className: string }> = {
            'minor': { label: 'Minor', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
            'major': { label: 'Major', className: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
            'critical': { label: 'Critical', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
        };
        const c = config[severity] || config['minor'];
        return <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${c.className}`}>{c.label}</span>;
    };

    const getStatusBadge = (status: string) => {
        const config: Record<string, { label: string; className: string }> = {
            'open': { label: 'Open', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
            'under_review': { label: 'Under Review', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
            'resolved': { label: 'Resolved', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
            'appealed': { label: 'Appealed', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
            'closed': { label: 'Closed', className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' },
        };
        const c = config[status] || config['open'];
        return <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${c.className}`}>{c.label}</span>;
    };

    return (
        <AdminLayout
            title={`Violation ${violation.violation_no}`}
            description="Violation Details"
            backButton={{
                href: '/admin/occupancy/violations',
                label: 'Back to Violations',
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
                        <FileWarning size={20} />
                        Violation Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-sm font-medium text-muted-foreground dark:text-gray-400">Violation Number</label>
                            <p className="text-foreground dark:text-white font-medium">{violation.violation_no}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground dark:text-gray-400">Status</label>
                            <div className="mt-1">{getStatusBadge(violation.status)}</div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground dark:text-gray-400">Severity</label>
                            <div className="mt-1">{getSeverityBadge(violation.severity)}</div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground dark:text-gray-400">Type</label>
                            <p className="text-foreground dark:text-white">{violation.violation_type.replace('_', ' ')}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground dark:text-gray-400 flex items-center gap-2">
                                <Building size={16} />
                                Building
                            </label>
                            <p className="text-foreground dark:text-white">{violation.building?.building_code || 'N/A'}</p>
                        </div>
                        {violation.unit && (
                            <div>
                                <label className="text-sm font-medium text-muted-foreground dark:text-gray-400">Unit</label>
                                <p className="text-foreground dark:text-white">{violation.unit.unit_no}</p>
                            </div>
                        )}
                        <div>
                            <label className="text-sm font-medium text-muted-foreground dark:text-gray-400">Violation Date</label>
                            <p className="text-foreground dark:text-white">{violation.violation_date}</p>
                        </div>
                        {violation.compliance_deadline && (
                            <div>
                                <label className="text-sm font-medium text-muted-foreground dark:text-gray-400">Compliance Deadline</label>
                                <p className="text-foreground dark:text-white font-medium text-red-600">{violation.compliance_deadline}</p>
                            </div>
                        )}
                        {violation.fine_amount && (
                            <div>
                                <label className="text-sm font-medium text-muted-foreground dark:text-gray-400">Fine Amount</label>
                                <p className="text-foreground dark:text-white font-medium">₱{violation.fine_amount.toLocaleString()}</p>
                            </div>
                        )}
                        {violation.inspection && (
                            <div>
                                <label className="text-sm font-medium text-muted-foreground dark:text-gray-400">Related Inspection</label>
                                <Link
                                    href={`/admin/occupancy/inspections/${violation.inspection.id}`}
                                    className="text-primary hover:text-primary/80 inline-flex items-center gap-1"
                                >
                                    <Eye size={16} />
                                    View Inspection
                                </Link>
                            </div>
                        )}
                    </div>
                </AdminContentCard>

                <AdminContentCard>
                    <h2 className="text-lg font-semibold text-foreground dark:text-white mb-4">Description</h2>
                    <p className="text-foreground dark:text-white whitespace-pre-wrap">{violation.description}</p>
                </AdminContentCard>

                {violation.resolution && (
                    <AdminContentCard>
                        <h2 className="text-lg font-semibold text-foreground dark:text-white mb-4">Resolution</h2>
                        <p className="text-foreground dark:text-white whitespace-pre-wrap">{violation.resolution}</p>
                        {violation.resolved_date && (
                            <p className="text-sm text-muted-foreground dark:text-gray-400 mt-2">
                                Resolved on: {violation.resolved_date}
                            </p>
                        )}
                    </AdminContentCard>
                )}
            </div>
        </AdminLayout>
    );
}
