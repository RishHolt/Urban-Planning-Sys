import { Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import AdminFilterSection from '../../../components/AdminFilterSection';
import AdminEmptyState from '../../../components/AdminEmptyState';
import { Home, Eye, CheckCircle, Clock, XCircle, User } from 'lucide-react';

interface Allocation {
    id: string;
    allocation_no: string;
    beneficiary: string;
    unit_no: string;
    allocation_status: string;
    allocation_date: string;
    acceptance_deadline: string;
}

interface AllocationsIndexProps {
    allocations: {
        data: Allocation[];
        links: any;
        meta: any;
    };
    filters?: {
        status?: string;
    };
}

export default function AllocationsIndex({ allocations, filters: initialFilters = {} }: AllocationsIndexProps) {
    const [showFilters, setShowFilters] = useState(false);
    const { data, setData, get } = useForm({
        status: initialFilters.status || '',
    });

    const handleSearch = (): void => {
        get('/admin/housing/allocations', {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleReset = (): void => {
        setData({ status: '' });
        router.get('/admin/housing/allocations');
    };

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
            'proposed': {
                label: 'Proposed',
                className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
                icon: <Clock size={14} />
            },
            'approved': {
                label: 'Approved',
                className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
                icon: <CheckCircle size={14} />
            },
            'rejected': {
                label: 'Rejected',
                className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
                icon: <XCircle size={14} />
            },
            'accepted': {
                label: 'Accepted',
                className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
                icon: <CheckCircle size={14} />
            },
            'declined': {
                label: 'Declined',
                className: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
                icon: <XCircle size={14} />
            },
            'moved_in': {
                label: 'Moved In',
                className: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
                icon: <Home size={14} />
            },
        };

        const config = statusConfig[status] || {
            label: status,
            className: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
            icon: <Clock size={14} />
        };

        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
                {config.icon}
                {config.label}
            </span>
        );
    };

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <AdminLayout
            title="Allocations"
            description="Manage housing unit allocations"
        >
            <AdminFilterSection
                searchValue=""
                onSearchChange={() => {}}
                onSearch={handleSearch}
                onReset={handleReset}
                showFilters={showFilters}
                onToggleFilters={() => setShowFilters(!showFilters)}
                searchPlaceholder=""
                hideSearch={true}
                filterContent={
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Allocation Status
                        </label>
                        <select
                            value={data.status}
                            onChange={(e) => setData('status', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                            <option value="">All Statuses</option>
                            <option value="proposed">Proposed</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                            <option value="accepted">Accepted</option>
                            <option value="declined">Declined</option>
                            <option value="moved_in">Moved In</option>
                        </select>
                    </div>
                }
            />

            {/* Allocations Table */}
            <div className="bg-white dark:bg-dark-surface shadow-lg rounded-lg overflow-hidden">
                {allocations.data.length === 0 ? (
                    <AdminEmptyState
                        icon={Home}
                        title="No Allocations Found"
                        description="No allocations match your filter criteria."
                    />
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Allocation Number
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Beneficiary
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Unit Number
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Allocation Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Acceptance Deadline
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-dark-surface divide-y divide-gray-200 dark:divide-gray-700">
                                    {allocations.data.map((allocation) => (
                                        <tr key={allocation.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-mono text-sm text-gray-900 dark:text-white">
                                                    {allocation.allocation_no}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900 dark:text-white font-medium">
                                                    {allocation.beneficiary}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-mono text-sm text-gray-900 dark:text-white">
                                                    {allocation.unit_no}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(allocation.allocation_status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                                {formatDate(allocation.allocation_date)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                                {formatDate(allocation.acceptance_deadline)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <Link
                                                    href={`/admin/housing/allocations/${allocation.id}`}
                                                    className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline font-medium"
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
                        {/* Pagination */}
                        {allocations.links && allocations.links.length > 3 && (
                            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    Showing {allocations.meta.from} to {allocations.meta.to} of {allocations.meta.total} results
                                </div>
                                <div className="flex gap-2">
                                    {allocations.links.map((link: any, index: number) => (
                                        <button
                                            key={index}
                                            onClick={() => {
                                                if (link.url) {
                                                    router.get(link.url, {}, { preserveState: true, preserveScroll: true });
                                                }
                                            }}
                                            disabled={!link.url}
                                            className={`px-3 py-2 text-sm rounded-lg ${
                                                link.active
                                                    ? 'bg-primary text-white'
                                                    : link.url
                                                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                                    : 'bg-gray-50 dark:bg-gray-900 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </AdminLayout>
    );
}
