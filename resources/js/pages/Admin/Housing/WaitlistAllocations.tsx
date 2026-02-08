import { Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import AdminFilterSection from '../../../components/AdminFilterSection';
import AdminEmptyState from '../../../components/AdminEmptyState';
import { List, Eye, TrendingUp, Home, CheckCircle, Clock, XCircle, Key } from 'lucide-react';

interface WaitlistEntry {
    id: string;
    beneficiary: string;
    beneficiary_no: string;
    application_no: string;
    housing_program: string;
    priority_score: number;
    queue_position: number;
    waitlist_date: string;
}

interface Allocation {
    id: string;
    allocation_no: string;
    beneficiary: string;
    unit_no: string;
    allocation_status: string;
    allocation_date: string;
    acceptance_deadline: string;
}

interface WaitlistAllocationsProps {
    waitlist?: {
        data: WaitlistEntry[];
        links: any;
        meta: any;
    };
    allocations?: {
        data: Allocation[];
        links: any;
        meta: any;
    };
    filters?: {
        view?: 'waitlist' | 'allocations';
        housing_program?: string;
        status?: string;
    };
}

export default function WaitlistAllocations({ waitlist, allocations, filters: initialFilters = {} }: WaitlistAllocationsProps) {
    const [activeTab, setActiveTab] = useState<'waitlist' | 'allocations'>(
        (initialFilters.view as 'waitlist' | 'allocations') || 'waitlist'
    );
    const [showFilters, setShowFilters] = useState(false);

    // Waitlist form
    const { data: waitlistData, setData: setWaitlistData, get: waitlistGet } = useForm({
        housing_program: initialFilters.housing_program || '',
    });

    // Allocations form
    const { data: allocData, setData: setAllocData, get: allocGet } = useForm({
        status: initialFilters.status || '',
    });

    const handleTabChange = (tab: 'waitlist' | 'allocations'): void => {
        setActiveTab(tab);
        router.get('/admin/housing/waitlist', {
            view: tab,
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleWaitlistSearch = (): void => {
        waitlistGet('/admin/housing/waitlist', {
            data: { ...waitlistData, view: 'waitlist' },
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleAllocSearch = (): void => {
        allocGet('/admin/housing/waitlist', {
            data: { ...allocData, view: 'allocations' },
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleWaitlistReset = (): void => {
        setWaitlistData({ housing_program: '' });
        router.get('/admin/housing/waitlist', { view: 'waitlist' });
    };

    const handleAllocReset = (): void => {
        setAllocData({ status: '' });
        router.get('/admin/housing/waitlist', { view: 'allocations' });
    };

    const getHousingProgramLabel = (program: string): string => {
        const labels: Record<string, string> = {
            'socialized_housing': 'Socialized Housing',
            'relocation': 'Relocation',
            'rental_subsidy': 'Rental Subsidy',
            'housing_loan': 'Housing Loan',
        };
        return labels[program] || program;
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
            title="Waitlist & Allocations"
            description="Manage housing waitlist queue and unit allocations"
        >
            {/* Tabs */}
            <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
                <nav className="flex gap-4">
                    <button
                        onClick={() => handleTabChange('waitlist')}
                        className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                            activeTab === 'waitlist'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <List size={18} />
                            Waitlist
                        </div>
                    </button>
                    <button
                        onClick={() => handleTabChange('allocations')}
                        className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                            activeTab === 'allocations'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <Key size={18} />
                            Allocations
                        </div>
                    </button>
                </nav>
            </div>

            {activeTab === 'waitlist' && (
                <>
                    <AdminFilterSection
                        searchValue=""
                        onSearchChange={() => {}}
                        onSearch={handleWaitlistSearch}
                        onReset={handleWaitlistReset}
                        showFilters={showFilters}
                        onToggleFilters={() => setShowFilters(!showFilters)}
                        searchPlaceholder=""
                        hideSearch={true}
                        filterContent={
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Housing Program
                                </label>
                                <select
                                    value={waitlistData.housing_program}
                                    onChange={(e) => setWaitlistData('housing_program', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                                >
                                    <option value="">All Programs</option>
                                    <option value="socialized_housing">Socialized Housing</option>
                                    <option value="relocation">Relocation</option>
                                    <option value="rental_subsidy">Rental Subsidy</option>
                                    <option value="housing_loan">Housing Loan</option>
                                </select>
                            </div>
                        }
                    />

                    {/* Waitlist Table */}
                    <div className="bg-white dark:bg-dark-surface shadow-lg rounded-lg overflow-hidden">
                        {!waitlist || waitlist.data.length === 0 ? (
                            <AdminEmptyState
                                icon={List}
                                title="No Waitlist Entries"
                                description="No entries found in the waitlist."
                            />
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Queue Position
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Beneficiary
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Application Number
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Housing Program
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Priority Score
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Waitlist Date
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-dark-surface divide-y divide-gray-200 dark:divide-gray-700">
                                            {waitlist.data.map((entry) => (
                                                <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-2xl font-bold text-primary">
                                                                #{entry.queue_position}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm text-gray-900 dark:text-white font-medium">
                                                            {entry.beneficiary}
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                                                            {entry.beneficiary_no}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="font-mono text-sm text-gray-900 dark:text-white">
                                                            {entry.application_no}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                                        {getHousingProgramLabel(entry.housing_program)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-1">
                                                            <TrendingUp size={16} className="text-green-500" />
                                                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                                                {entry.priority_score}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                                        {formatDate(entry.waitlist_date)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        <Link
                                                            href={`/admin/housing/waitlist/${entry.id}`}
                                                            className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline font-medium"
                                                        >
                                                            <Eye size={16} />
                                                            View Details
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {/* Pagination */}
                                {waitlist.links && waitlist.links.length > 3 && (
                                    <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            Showing {waitlist.meta.from} to {waitlist.meta.to} of {waitlist.meta.total} results
                                        </div>
                                        <div className="flex gap-2">
                                            {waitlist.links.map((link: any, index: number) => (
                                                <button
                                                    key={index}
                                                    onClick={() => {
                                                        if (link.url) {
                                                            router.get(link.url, { view: 'waitlist' }, { preserveState: true, preserveScroll: true });
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
                </>
            )}

            {activeTab === 'allocations' && (
                <>
                    <AdminFilterSection
                        searchValue=""
                        onSearchChange={() => {}}
                        onSearch={handleAllocSearch}
                        onReset={handleAllocReset}
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
                                    value={allocData.status}
                                    onChange={(e) => setAllocData('status', e.target.value)}
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
                        {!allocations || allocations.data.length === 0 ? (
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
                                                            router.get(link.url, { view: 'allocations' }, { preserveState: true, preserveScroll: true });
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
                </>
            )}
        </AdminLayout>
    );
}
