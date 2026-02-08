import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import AdminContentCard from '../../../components/AdminContentCard';
import Button from '../../../components/Button';
import { FileText, Download, Filter, Calendar, TrendingUp, DollarSign, Building2 } from 'lucide-react';

interface ReportsProps {
    projectStatusReport?: {
        total: number;
        by_status: Record<string, number>;
    };
    budgetReport?: {
        total_allocated: number;
        total_spent: number;
        total_remaining: number;
        by_category: Array<{
            category: string;
            allocated: number;
            spent: number;
            remaining: number;
        }>;
    };
    progressReport?: {
        average_progress: number;
        on_track: number;
        delayed: number;
        by_phase: Array<{
            phase_type: string;
            average_progress: number;
            count: number;
        }>;
    };
    filters?: {
        date_from?: string;
        date_to?: string;
        project_type?: string;
        status?: string;
    };
}

export default function Reports({ projectStatusReport, budgetReport, progressReport, filters: initialFilters = {} }: ReportsProps) {
    const [showFilters, setShowFilters] = useState(false);
    const { data, setData, get } = useForm({
        date_from: initialFilters.date_from || '',
        date_to: initialFilters.date_to || '',
        project_type: initialFilters.project_type || '',
        status: initialFilters.status || '',
    });

    const handleGenerate = () => {
        get('/admin/infrastructure/reports', {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleExport = (reportType: string) => {
        const params = new URLSearchParams();
        if (data.date_from) params.append('date_from', data.date_from);
        if (data.date_to) params.append('date_to', data.date_to);
        if (data.project_type) params.append('project_type', data.project_type);
        if (data.status) params.append('status', data.status);
        params.append('export', reportType);

        window.open(`/admin/infrastructure/reports/export?${params.toString()}`, '_blank');
    };

    return (
        <AdminLayout
            title="Infrastructure Reports"
            description="Generate and view project reports and analytics"
        >
            <div className="mb-6 flex justify-between items-center">
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2"
                >
                    <Filter size={18} />
                    Filters
                </Button>
            </div>

            {/* Filters */}
            {showFilters && (
                <AdminContentCard padding="md" className="mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                Date From
                            </label>
                            <input
                                type="date"
                                value={data.date_from}
                                onChange={(e) => setData('date_from', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-sm"
                            />
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                Date To
                            </label>
                            <input
                                type="date"
                                value={data.date_to}
                                onChange={(e) => setData('date_to', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-sm"
                            />
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                Project Type
                            </label>
                            <select
                                value={data.project_type}
                                onChange={(e) => setData('project_type', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-sm"
                            >
                                <option value="">All Types</option>
                                <option value="road_construction">Road Construction</option>
                                <option value="drainage_system">Drainage System</option>
                                <option value="water_supply">Water Supply</option>
                                <option value="sewerage">Sewerage</option>
                                <option value="electrical">Electrical</option>
                                <option value="multi_utility">Multi-Utility</option>
                            </select>
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                Status
                            </label>
                            <select
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-sm"
                            >
                                <option value="">All Statuses</option>
                                <option value="planning">Planning</option>
                                <option value="approved">Approved</option>
                                <option value="bidding">Bidding</option>
                                <option value="contract_signed">Contract Signed</option>
                                <option value="ongoing">Ongoing</option>
                                <option value="suspended">Suspended</option>
                                <option value="delayed">Delayed</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="secondary" size="sm" onClick={() => {
                            setData({
                                date_from: '',
                                date_to: '',
                                project_type: '',
                                status: '',
                            });
                        }}>
                            Clear
                        </Button>
                        <Button variant="primary" size="sm" onClick={handleGenerate}>
                            Generate Report
                        </Button>
                    </div>
                </AdminContentCard>
            )}

            <div className="space-y-6">
                {/* Project Status Report */}
                <AdminContentCard padding="lg">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                            <Building2 size={20} className="text-primary" />
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Project Status Report</h2>
                        </div>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleExport('status')}
                            className="flex items-center gap-2"
                        >
                            <Download size={16} />
                            Export
                        </Button>
                    </div>
                    {projectStatusReport ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Projects</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                        {projectStatusReport.total}
                                    </p>
                                </div>
                                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                        {projectStatusReport.by_status.completed || 0}
                                    </p>
                                </div>
                                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Delayed</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                        {projectStatusReport.by_status.delayed || 0}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">By Status</h3>
                                <div className="space-y-2">
                                    {Object.entries(projectStatusReport.by_status).map(([status, count]) => (
                                        <div key={status} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                            <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                                                {status.replace('_', ' ')}
                                            </span>
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">{count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">No data available. Generate a report to view statistics.</p>
                    )}
                </AdminContentCard>

                {/* Budget Report */}
                <AdminContentCard padding="lg">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                            <DollarSign size={20} className="text-primary" />
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Budget Report</h2>
                        </div>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleExport('budget')}
                            className="flex items-center gap-2"
                        >
                            <Download size={16} />
                            Export
                        </Button>
                    </div>
                    {budgetReport ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Allocated</p>
                                    <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                                        ₱{budgetReport.total_allocated.toLocaleString()}
                                    </p>
                                </div>
                                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Spent</p>
                                    <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                                        ₱{budgetReport.total_spent.toLocaleString()}
                                    </p>
                                </div>
                                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Remaining</p>
                                    <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                                        ₱{budgetReport.total_remaining.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            {budgetReport.by_category.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">By Category</h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50 dark:bg-gray-800">
                                                <tr>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Category</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Allocated</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Spent</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Remaining</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                {budgetReport.by_category.map((item) => (
                                                    <tr key={item.category}>
                                                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-white capitalize">
                                                            {item.category.replace('_', ' ')}
                                                        </td>
                                                        <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                                                            ₱{item.allocated.toLocaleString()}
                                                        </td>
                                                        <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                                                            ₱{item.spent.toLocaleString()}
                                                        </td>
                                                        <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                                                            ₱{item.remaining.toLocaleString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">No data available. Generate a report to view statistics.</p>
                    )}
                </AdminContentCard>

                {/* Progress Report */}
                <AdminContentCard padding="lg">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                            <TrendingUp size={20} className="text-primary" />
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Progress Report</h2>
                        </div>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleExport('progress')}
                            className="flex items-center gap-2"
                        >
                            <Download size={16} />
                            Export
                        </Button>
                    </div>
                    {progressReport ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Average Progress</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                        {progressReport.average_progress.toFixed(1)}%
                                    </p>
                                </div>
                                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">On Track</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                        {progressReport.on_track}
                                    </p>
                                </div>
                                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Delayed</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                        {progressReport.delayed}
                                    </p>
                                </div>
                            </div>
                            {progressReport.by_phase.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">By Phase Type</h3>
                                    <div className="space-y-2">
                                        {progressReport.by_phase.map((item) => (
                                            <div key={item.phase_type} className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                                                        {item.phase_type.replace('_', ' ')}
                                                    </span>
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                                        {item.count} phases
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                        <div
                                                            className="bg-primary h-2 rounded-full"
                                                            style={{ width: `${item.average_progress}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                                        {item.average_progress.toFixed(1)}%
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">No data available. Generate a report to view statistics.</p>
                    )}
                </AdminContentCard>
            </div>
        </AdminLayout>
    );
}
