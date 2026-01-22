import { Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import AdminFilterSection from '../../../components/AdminFilterSection';
import AdminEmptyState from '../../../components/AdminEmptyState';
import { FileWarning, Eye } from 'lucide-react';

interface ViolationItem {
    id: string;
    violation_no: string;
    violation_type: string;
    severity: string;
    status: string;
    building: { id: string; building_code: string } | null;
    unit: { id: string; unit_no: string } | null;
    violation_date: string;
    compliance_deadline: string | null;
    fine_amount: number | null;
    created_at: string;
}

interface ViolationsIndexProps {
    violations: {
        data: ViolationItem[];
        links: any;
        meta: any;
    };
    filters: {
        search?: string;
        status?: string;
        severity?: string;
        violation_type?: string;
    };
}

export default function ViolationsIndex({ violations, filters: initialFilters }: ViolationsIndexProps) {
    const [showFilters, setShowFilters] = useState(false);
    const { data, setData, get } = useForm({
        search: initialFilters.search || '',
        status: initialFilters.status || '',
        severity: initialFilters.severity || '',
        violation_type: initialFilters.violation_type || '',
    });

    const handleSearch = (): void => {
        get('/admin/occupancy/violations', {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleReset = (): void => {
        setData({ search: '', status: '', severity: '', violation_type: '' });
        router.get('/admin/occupancy/violations');
    };

    const getSeverityBadge = (severity: string) => {
        const config: Record<string, { label: string; className: string }> = {
            'minor': { label: 'Minor', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
            'major': { label: 'Major', className: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
            'critical': { label: 'Critical', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
        };
        const c = config[severity] || config['minor'];
        return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${c.className}`}>{c.label}</span>;
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
        return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${c.className}`}>{c.label}</span>;
    };

    return (
        <AdminLayout title="Violations" description="Track and manage compliance violations">
            <div className="space-y-6">

                <AdminFilterSection
                    searchValue={data.search}
                    onSearchChange={(value) => setData('search', value)}
                    onSearch={handleSearch}
                    onReset={handleReset}
                    showFilters={showFilters}
                    onToggleFilters={() => setShowFilters(!showFilters)}
                    searchPlaceholder="Search by violation number, description..."
                    filterContent={
                        showFilters && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground dark:text-gray-300 mb-1">Status</label>
                                    <select
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-foreground dark:text-white"
                                    >
                                        <option value="">All Statuses</option>
                                        <option value="open">Open</option>
                                        <option value="under_review">Under Review</option>
                                        <option value="resolved">Resolved</option>
                                        <option value="appealed">Appealed</option>
                                        <option value="closed">Closed</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground dark:text-gray-300 mb-1">Severity</label>
                                    <select
                                        value={data.severity}
                                        onChange={(e) => setData('severity', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-foreground dark:text-white"
                                    >
                                        <option value="">All Severities</option>
                                        <option value="minor">Minor</option>
                                        <option value="major">Major</option>
                                        <option value="critical">Critical</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground dark:text-gray-300 mb-1">Type</label>
                                    <select
                                        value={data.violation_type}
                                        onChange={(e) => setData('violation_type', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-foreground dark:text-white"
                                    >
                                        <option value="">All Types</option>
                                        <option value="unauthorized_use">Unauthorized Use</option>
                                        <option value="overcrowding">Overcrowding</option>
                                        <option value="structural_modification">Structural Modification</option>
                                        <option value="fire_safety">Fire Safety</option>
                                        <option value="sanitation">Sanitation</option>
                                        <option value="noise">Noise</option>
                                        <option value="parking">Parking</option>
                                        <option value="maintenance">Maintenance</option>
                                    </select>
                                </div>
                            </div>
                        )
                    }
                />

                {violations.data.length === 0 ? (
                    <AdminEmptyState icon={FileWarning} title="No violations found" />
                ) : (
                    <div className="bg-white dark:bg-dark-surface shadow-lg rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Violation No</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Building / Unit</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Severity</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Deadline</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Fine</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-dark-surface divide-y divide-gray-200 dark:divide-gray-700">
                                    {violations.data.map((violation) => (
                                        <tr key={violation.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground dark:text-white">
                                                {violation.violation_no}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground dark:text-white">
                                                {violation.violation_type.replace('_', ' ')}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-foreground dark:text-white">
                                                <div>{violation.building?.building_code || 'N/A'}</div>
                                                {violation.unit && (
                                                    <div className="text-xs text-muted-foreground dark:text-gray-400">Unit: {violation.unit.unit_no}</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">{getSeverityBadge(violation.severity)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(violation.status)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground dark:text-white">
                                                {violation.compliance_deadline || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground dark:text-white">
                                                {violation.fine_amount ? `₱${violation.fine_amount.toLocaleString()}` : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link
                                                    href={`/admin/occupancy/violations/${violation.id}`}
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
                        {violations.links && violations.links.length > 3 && (
                            <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-muted-foreground dark:text-gray-400">
                                        Showing {violations.meta.from} to {violations.meta.to} of {violations.meta.total} results
                                    </div>
                                    <div className="flex gap-2">
                                        {violations.links.map((link: any, index: number) => (
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
