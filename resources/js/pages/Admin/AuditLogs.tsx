import { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import AdminHeader from '../../components/AdminHeader';
import Sidebar from '../../components/Sidebar';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { History, Search, Filter } from 'lucide-react';

interface AuditLog {
    id: string;
    userId: number | null;
    action: string;
    resourceType: string;
    resourceId: string | null;
    changes: Record<string, unknown> | null;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: string;
}

interface PaginatedLogs {
    data: AuditLog[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
}

interface AuditLogsProps {
    logs: PaginatedLogs;
    filters: {
        search?: string;
        actionType?: string;
        resourceType?: string;
        userId?: string;
        dateFrom?: string;
        dateTo?: string;
    };
}

export default function AuditLogs({ logs, filters: initialFilters }: AuditLogsProps) {
    const [sidebarOpen, setSidebarOpen] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth >= 1024;
        }
        return true;
    });

    const [showFilters, setShowFilters] = useState(false);
    const { data, setData, get } = useForm({
        search: initialFilters.search || '',
        actionType: initialFilters.actionType || '',
        resourceType: initialFilters.resourceType || '',
        userId: initialFilters.userId || '',
        dateFrom: initialFilters.dateFrom || '',
        dateTo: initialFilters.dateTo || '',
    });

    const handleSearch = (): void => {
        get('/admin/audit-logs', {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleReset = (): void => {
        setData({
            search: '',
            actionType: '',
            resourceType: '',
            userId: '',
            dateFrom: '',
            dateTo: '',
        });
        router.get('/admin/audit-logs');
    };

    return (
        <div className="flex flex-col bg-background dark:bg-dark-bg w-full min-h-dvh transition-colors">
            <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
            <AdminHeader sidebarOpen={sidebarOpen} />

            <main className={`flex-1 transition-all duration-300 ease-in-out ${
                sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
            } mt-16`}>
                <div className="mx-auto px-4 py-8 max-w-7xl">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="font-bold text-gray-900 dark:text-white text-3xl">
                            Audit Logs
                        </h1>
                        <Button
                            variant="outline"
                            size="md"
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2"
                        >
                            <Filter size={18} />
                            Filters
                        </Button>
                    </div>

                    {/* Search and Filters */}
                    <div className="bg-white dark:bg-dark-surface shadow-lg mb-6 p-6 rounded-lg">
                        <div className="flex gap-4 mb-4">
                            <div className="flex-1">
                                <Input
                                    type="text"
                                    name="search"
                                    placeholder="Search by action, resource type, or resource ID..."
                                    value={data.search}
                                    onChange={(e) => setData('search', e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleSearch();
                                        }
                                    }}
                                    icon={<Search size={20} />}
                                />
                            </div>
                            <Button variant="primary" size="md" onClick={handleSearch}>
                                Search
                            </Button>
                            <Button variant="secondary" size="md" onClick={handleReset}>
                                Reset
                            </Button>
                        </div>

                        {showFilters && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Action Type
                                    </label>
                                    <select
                                        value={data.actionType}
                                        onChange={(e) => setData('actionType', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                                    >
                                        <option value="">All Actions</option>
                                        <option value="status_updated">Status Updated</option>
                                        <option value="created">Created</option>
                                        <option value="updated">Updated</option>
                                        <option value="deleted">Deleted</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Resource Type
                                    </label>
                                    <select
                                        value={data.resourceType}
                                        onChange={(e) => setData('resourceType', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                                    >
                                        <option value="">All Resources</option>
                                        <option value="zoning_application">Zoning Application</option>
                                        <option value="zone">Zone</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Date From
                                    </label>
                                    <Input
                                        type="date"
                                        name="dateFrom"
                                        value={data.dateFrom}
                                        onChange={(e) => setData('dateFrom', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Date To
                                    </label>
                                    <Input
                                        type="date"
                                        name="dateTo"
                                        value={data.dateTo}
                                        onChange={(e) => setData('dateTo', e.target.value)}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Audit Logs Table */}
                    <div className="bg-white dark:bg-dark-surface shadow-lg rounded-lg overflow-hidden">
                        {logs.data.length === 0 ? (
                            <div className="p-12 text-center">
                            <History size={64} className="mx-auto mb-4 text-gray-400 dark:text-gray-600" />
                            <h2 className="mb-2 font-semibold text-gray-900 dark:text-white text-xl">
                                No Audit Logs Found
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400">
                                Try adjusting your search or filter criteria.
                            </p>
                        </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Date & Time
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Action
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Resource
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    User ID
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    IP Address
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-dark-surface divide-y divide-gray-200 dark:divide-gray-700">
                                            {logs.data.map((log) => (
                                                <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300 text-sm">
                                                        {new Date(log.createdAt).toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200">
                                                            {log.action}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        <div className="text-gray-900 dark:text-white">
                                                            {log.resourceType}
                                                        </div>
                                                        {log.resourceId && (
                                                            <div className="text-gray-500 dark:text-gray-400 text-xs">
                                                                ID: {log.resourceId}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300 text-sm">
                                                        {log.userId || 'N/A'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300 text-sm">
                                                        {log.ipAddress || 'N/A'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {logs.last_page > 1 && (
                                    <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                                        <div className="text-sm text-gray-700 dark:text-gray-300">
                                            Showing {((logs.current_page - 1) * logs.per_page) + 1} to{' '}
                                            {Math.min(logs.current_page * logs.per_page, logs.total)} of{' '}
                                            {logs.total} results
                                        </div>
                                        <div className="flex gap-2">
                                            {logs.links.map((link, index) => {
                                                if (index === 0) {
                                                    return (
                                                        <button
                                                            key={index}
                                                            onClick={() => link.url && router.get(link.url)}
                                                            disabled={!link.url}
                                                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-700 dark:text-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
                                                        >
                                                            Previous
                                                        </button>
                                                    );
                                                }
                                                if (index === logs.links.length - 1) {
                                                    return (
                                                        <button
                                                            key={index}
                                                            onClick={() => link.url && router.get(link.url)}
                                                            disabled={!link.url}
                                                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-700 dark:text-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
                                                        >
                                                            Next
                                                        </button>
                                                    );
                                                }
                                                return (
                                                    <button
                                                        key={index}
                                                        onClick={() => link.url && router.get(link.url)}
                                                        className={`px-3 py-2 border rounded-lg text-sm ${
                                                            link.active
                                                                ? 'bg-primary text-white border-primary'
                                                                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-surface text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                                        }`}
                                                    >
                                                        {link.label.replace('&laquo;', '').replace('&raquo;', '').trim()}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
