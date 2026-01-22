import { Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import AdminFilterSection from '../../../components/AdminFilterSection';
import AdminEmptyState from '../../../components/AdminEmptyState';
import { CheckSquare, Eye } from 'lucide-react';

interface ReportItem {
    id: string;
    building: { id: string; building_code: string; building_name: string | null } | null;
    unit: { id: string; unit_no: string } | null;
    year: number;
    quarter: number | null;
    compliance_status: string;
    violations_count: number;
    inspections_count: number;
    generated_at: string;
}

interface ComplianceReportsIndexProps {
    reports: {
        data: ReportItem[];
        links: any;
        meta: any;
    };
    filters: {
        year?: string;
        quarter?: string;
        compliance_status?: string;
    };
}

export default function ComplianceReportsIndex({ reports, filters: initialFilters }: ComplianceReportsIndexProps) {
    const [showFilters, setShowFilters] = useState(false);
    const { data, setData, get } = useForm({
        year: initialFilters.year || '',
        quarter: initialFilters.quarter || '',
        compliance_status: initialFilters.compliance_status || '',
    });

    const handleSearch = (): void => {
        get('/admin/occupancy/reports', {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleReset = (): void => {
        setData({ year: '', quarter: '', compliance_status: '' });
        router.get('/admin/occupancy/reports');
    };

    const getStatusBadge = (status: string) => {
        const config: Record<string, { label: string; className: string }> = {
            'compliant': { label: 'Compliant', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
            'non_compliant': { label: 'Non-Compliant', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
            'conditional': { label: 'Conditional', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
            'pending_review': { label: 'Pending Review', className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' },
        };
        const c = config[status] || config['pending_review'];
        return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${c.className}`}>{c.label}</span>;
    };

    return (
        <AdminLayout title="Compliance Reports" description="View compliance reports for buildings and units">
            <div className="space-y-6">

                <AdminFilterSection
                    searchValue=""
                    onSearchChange={() => {}}
                    onSearch={handleSearch}
                    onReset={handleReset}
                    showFilters={showFilters}
                    onToggleFilters={() => setShowFilters(!showFilters)}
                    searchPlaceholder=""
                    filterContent={
                        showFilters && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground dark:text-gray-300 mb-1">Year</label>
                                    <input
                                        type="number"
                                        value={data.year}
                                        onChange={(e) => setData('year', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-foreground dark:text-white"
                                        placeholder="e.g., 2026"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground dark:text-gray-300 mb-1">Quarter</label>
                                    <select
                                        value={data.quarter}
                                        onChange={(e) => setData('quarter', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-foreground dark:text-white"
                                    >
                                        <option value="">All Quarters</option>
                                        <option value="1">Q1</option>
                                        <option value="2">Q2</option>
                                        <option value="3">Q3</option>
                                        <option value="4">Q4</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground dark:text-gray-300 mb-1">Status</label>
                                    <select
                                        value={data.compliance_status}
                                        onChange={(e) => setData('compliance_status', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-foreground dark:text-white"
                                    >
                                        <option value="">All Statuses</option>
                                        <option value="compliant">Compliant</option>
                                        <option value="non_compliant">Non-Compliant</option>
                                        <option value="conditional">Conditional</option>
                                        <option value="pending_review">Pending Review</option>
                                    </select>
                                </div>
                            </div>
                        )
                    }
                />

                {reports.data.length === 0 ? (
                    <AdminEmptyState icon={CheckSquare} title="No reports found" />
                ) : (
                    <div className="bg-white dark:bg-dark-surface shadow-lg rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Building / Unit</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Period</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Violations</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Inspections</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Generated</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-dark-surface divide-y divide-gray-200 dark:divide-gray-700">
                                    {reports.data.map((report) => (
                                        <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-foreground dark:text-white">
                                                    {report.building?.building_code || 'N/A'}
                                                </div>
                                                {report.building?.building_name && (
                                                    <div className="text-xs text-muted-foreground dark:text-gray-400">
                                                        {report.building.building_name}
                                                    </div>
                                                )}
                                                {report.unit && (
                                                    <div className="text-xs text-muted-foreground dark:text-gray-400">
                                                        Unit: {report.unit.unit_no}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground dark:text-white">
                                                {report.year} {report.quarter ? `Q${report.quarter}` : ''}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(report.compliance_status)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground dark:text-white">
                                                {report.violations_count}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground dark:text-white">
                                                {report.inspections_count}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground dark:text-white">
                                                {report.generated_at}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link
                                                    href={`/admin/occupancy/reports/${report.id}`}
                                                    className="text-primary hover:text-primary/80 inline-flex items-center gap-1"
                                                >
                                                    <Eye size={16} />
                                                    View
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {reports.links && reports.links.length > 3 && (
                            <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-muted-foreground dark:text-gray-400">
                                        Showing {reports.meta.from} to {reports.meta.to} of {reports.meta.total} results
                                    </div>
                                    <div className="flex gap-2">
                                        {reports.links.map((link: any, index: number) => (
                                            <button
                                                key={index}
                                                onClick={() => link.url && router.get(link.url)}
                                                disabled={!link.url}
                                                className={`px-3 py-1 rounded text-sm ${
                                                    link.active
                                                        ? 'bg-primary text-white'
                                                        : 'bg-white dark:bg-dark-surface text-foreground dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                                                } ${!link.url ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
