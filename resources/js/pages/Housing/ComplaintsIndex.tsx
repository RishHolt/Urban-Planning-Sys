import { Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import AdminFilterSection from '../../components/AdminFilterSection';
import AdminEmptyState from '../../components/AdminEmptyState';
import Button from '../../components/Button';
import { AlertCircle, Eye, Plus, CheckCircle, Clock, XCircle } from 'lucide-react';

interface Complaint {
    id: string;
    complaint_no: string;
    beneficiary: string;
    unit_no: string;
    complaint_type: string;
    priority: string;
    status: string;
    submitted_at: string;
}

interface ComplaintsIndexProps {
    complaints: {
        data: Complaint[];
        links: any;
        meta: any;
    };
    filters?: {
        status?: string;
        priority?: string;
    };
    isAdmin?: boolean;
}

export default function ComplaintsIndex({ complaints, filters: initialFilters = {}, isAdmin = false }: ComplaintsIndexProps) {
    const [showFilters, setShowFilters] = useState(false);
    const { data, setData, get } = useForm({
        status: initialFilters.status || '',
        priority: initialFilters.priority || '',
    });

    const handleSearch = (): void => {
        const route = isAdmin ? '/admin/housing/complaints' : '/complaints';
        get(route, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleReset = (): void => {
        setData({ status: '', priority: '' });
        const route = isAdmin ? '/admin/housing/complaints' : '/complaints';
        router.get(route);
    };

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
            'open': {
                label: 'Open',
                className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
                icon: <Clock size={14} />
            },
            'in_progress': {
                label: 'In Progress',
                className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
                icon: <Clock size={14} />
            },
            'resolved': {
                label: 'Resolved',
                className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
                icon: <CheckCircle size={14} />
            },
            'closed': {
                label: 'Closed',
                className: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
                icon: <XCircle size={14} />
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

    const getPriorityBadge = (priority: string) => {
        const priorityConfig: Record<string, { label: string; className: string }> = {
            'low': {
                label: 'Low',
                className: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
            },
            'medium': {
                label: 'Medium',
                className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            },
            'high': {
                label: 'High',
                className: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
            },
            'urgent': {
                label: 'Urgent',
                className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
            },
        };

        const config = priorityConfig[priority] || {
            label: priority,
            className: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
        };

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
                {config.label}
            </span>
        );
    };

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const Layout = isAdmin ? AdminLayout : ({ children, title, description }: any) => (
        <div className="min-h-screen bg-background dark:bg-dark-bg">
            <div className="mx-auto px-4 py-8 max-w-7xl">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{title}</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{description}</p>
                {children}
            </div>
        </div>
    );

    return (
        <Layout
            title={isAdmin ? 'Complaints Management' : 'My Complaints'}
            description={isAdmin ? 'Manage and track housing complaints' : 'View and submit housing complaints'}
        >
            {!isAdmin && (
                <div className="mb-6">
                    <Button
                        variant="primary"
                        href="/complaints/create"
                        className="flex items-center gap-2"
                    >
                        <Plus size={18} />
                        Submit Complaint
                    </Button>
                </div>
            )}

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
                    <>
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
                                <option value="open">Open</option>
                                <option value="in_progress">In Progress</option>
                                <option value="resolved">Resolved</option>
                                <option value="closed">Closed</option>
                            </select>
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                Priority
                            </label>
                            <select
                                value={data.priority}
                                onChange={(e) => setData('priority', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                                <option value="">All Priorities</option>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                            </select>
                        </div>
                    </>
                }
            />

            {/* Complaints Table */}
            <div className="bg-white dark:bg-dark-surface shadow-lg rounded-lg overflow-hidden">
                {complaints.data.length === 0 ? (
                    <AdminEmptyState
                        icon={AlertCircle}
                        title="No Complaints Found"
                        description={isAdmin ? "No complaints match your filter criteria." : "You haven't submitted any complaints yet."}
                    />
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Complaint Number
                                        </th>
                                        {isAdmin && (
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Beneficiary
                                            </th>
                                        )}
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Unit Number
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Type
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Priority
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Submitted At
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-dark-surface divide-y divide-gray-200 dark:divide-gray-700">
                                    {complaints.data.map((complaint) => (
                                        <tr key={complaint.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-mono text-sm text-gray-900 dark:text-white">
                                                    {complaint.complaint_no}
                                                </div>
                                            </td>
                                            {isAdmin && (
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900 dark:text-white font-medium">
                                                        {complaint.beneficiary}
                                                    </div>
                                                </td>
                                            )}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-mono text-sm text-gray-900 dark:text-white">
                                                    {complaint.unit_no}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 capitalize">
                                                {complaint.complaint_type.replace('_', ' ')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getPriorityBadge(complaint.priority)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(complaint.status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                                {formatDate(complaint.submitted_at)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <Link
                                                    href={isAdmin ? `/admin/housing/complaints/${complaint.id}` : `/complaints/${complaint.id}`}
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
                        {complaints.links && complaints.links.length > 3 && (
                            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    Showing {complaints.meta.from} to {complaints.meta.to} of {complaints.meta.total} results
                                </div>
                                <div className="flex gap-2">
                                    {complaints.links.map((link: any, index: number) => (
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
        </Layout>
    );
}
