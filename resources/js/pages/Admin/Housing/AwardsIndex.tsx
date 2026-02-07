import { useState } from 'react';
import { Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '../../../components/AdminLayout';
import AdminFilterSection from '../../../components/AdminFilterSection';
import AdminEmptyState from '../../../components/AdminEmptyState';
import Button from '../../../components/Button';
import { Trophy, Eye, CheckCircle, XCircle, Clock, Calendar } from 'lucide-react';

interface Award {
    id: string;
    award_no: string;
    beneficiary_name: string;
    beneficiary_no: string;
    project_name: string | null;
    unit_no: string | null;
    award_status: string;
    award_date: string;
    acceptance_deadline: string | null;
    accepted_date: string | null;
}

interface AwardsIndexProps {
    awards: {
        data: Award[];
        links: any;
        meta: any;
    };
    filters: {
        search?: string;
        status?: string;
    };
}

export default function AwardsIndex({ awards, filters: initialFilters }: AwardsIndexProps) {
    const [showFilters, setShowFilters] = useState(false);
    const { data, setData, get } = useForm({
        search: initialFilters.search || '',
        status: initialFilters.status || '',
    });

    const handleSearch = (): void => {
        get('/admin/housing/awards', {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleReset = (): void => {
        setData({
            search: '',
            status: '',
        });
        router.get('/admin/housing/awards');
    };

    const handlePagination = (url: string): void => {
        router.visit(url, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const getStatusBadge = (status: string): React.ReactNode => {
        const statusConfig: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
            'pending': {
                label: 'Pending',
                className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
                icon: <Clock size={14} />
            },
            'accepted': {
                label: 'Accepted',
                className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
                icon: <CheckCircle size={14} />
            },
            'declined': {
                label: 'Declined',
                className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
                icon: <XCircle size={14} />
            },
            'cancelled': {
                label: 'Cancelled',
                className: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
                icon: <XCircle size={14} />
            },
        };

        const config = statusConfig[status.toLowerCase()] || {
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

    return (
        <AdminLayout
            title="Housing Awards"
            description="Manage housing unit awards to beneficiaries"
        >
            <AdminFilterSection
                searchValue={data.search}
                onSearchChange={(value) => setData('search', value)}
                onSearch={handleSearch}
                onReset={handleReset}
                showFilters={showFilters}
                onToggleFilters={() => setShowFilters(!showFilters)}
                searchPlaceholder="Search by award number, beneficiary name, unit number..."
                filterContent={
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Status
                        </label>
                        <select
                            value={data.status}
                            onChange={(e) => setData('status', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                            <option value="">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="accepted">Accepted</option>
                            <option value="declined">Declined</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                }
            />

            {/* Awards Table */}
            <div className="bg-white dark:bg-dark-surface shadow-lg rounded-lg overflow-hidden">
                {awards.data.length === 0 ? (
                    <AdminEmptyState
                        icon={Trophy}
                        title="No Awards Found"
                        description="Try adjusting your search or filter criteria."
                    />
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Award No.
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Beneficiary No.
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Beneficiary Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Unit
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Project
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Award Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-dark-surface divide-y divide-gray-200 dark:divide-gray-700">
                                    {awards.data.map((award) => (
                                        <tr key={award.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white font-mono">
                                                {award.award_no}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-mono">
                                                {award.beneficiary_no}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                {award.beneficiary_name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {award.unit_no || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {award.project_name || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {award.award_date ? new Date(award.award_date).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(award.award_status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <Link
                                                    href={`/admin/housing/awards/${award.id}`}
                                                    className="text-primary hover:text-primary-dark inline-flex items-center gap-1"
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
                        {awards.meta.last_page > 1 && (
                            <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                                <div className="text-sm text-gray-700 dark:text-gray-300">
                                    Showing {((awards.meta.current_page - 1) * awards.meta.per_page) + 1} to{' '}
                                    {Math.min(awards.meta.current_page * awards.meta.per_page, awards.meta.total)} of{' '}
                                    {awards.meta.total} results
                                </div>
                                <div className="flex gap-2">
                                    {awards.links.map((link: any, index: number) => {
                                        if (index === 0) {
                                            return (
                                                <button
                                                    key={index}
                                                    onClick={() => link.url && handlePagination(link.url)}
                                                    disabled={!link.url}
                                                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-700 dark:text-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
                                                >
                                                    Previous
                                                </button>
                                            );
                                        }
                                        if (index === awards.links.length - 1) {
                                            return (
                                                <button
                                                    key={index}
                                                    onClick={() => link.url && handlePagination(link.url)}
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
                                                onClick={() => link.url && handlePagination(link.url)}
                                                disabled={!link.url}
                                                className={`px-3 py-2 border rounded-lg text-sm ${
                                                    link.active
                                                        ? 'bg-primary text-white border-primary'
                                                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-surface text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                                }`}
                                            >
                                                {link.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </AdminLayout>
    );
}
