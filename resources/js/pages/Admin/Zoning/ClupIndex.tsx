import { useState } from 'react';
import { Link, router, useForm } from '@inertiajs/react';
import AdminHeader from '../../../components/AdminHeader';
import Sidebar from '../../../components/Sidebar';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import { Search, Filter, Plus, Eye, FileText } from 'lucide-react';

interface Clup {
    id: string;
    referenceNo: string | null;
    lguName: string;
    coverageStartYear: number;
    coverageEndYear: number;
    coveragePeriod: string;
    approvalDate: string;
    approvingBody: string | null;
    resolutionNo: string | null;
    status: 'Active' | 'Archived';
    createdAt: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedClups {
    data: Clup[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: PaginationLink[];
}

interface ClupIndexProps {
    clups: PaginatedClups;
    filters: {
        search?: string;
        status?: string;
        yearFrom?: string;
        yearTo?: string;
    };
}

export default function ClupIndex({ clups, filters: initialFilters }: ClupIndexProps) {
    const [sidebarOpen, setSidebarOpen] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth >= 1024;
        }
        return true;
    });

    const [showFilters, setShowFilters] = useState(false);
    const { data, setData, get } = useForm({
        search: initialFilters.search || '',
        status: initialFilters.status || '',
        yearFrom: initialFilters.yearFrom || '',
        yearTo: initialFilters.yearTo || '',
    });

    const handleSearch = (): void => {
        get('/admin/zoning/clup', {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleReset = (): void => {
        setData({
            search: '',
            status: '',
            yearFrom: '',
            yearTo: '',
        });
        router.get('/admin/zoning/clup');
    };


    const handlePageChange = (url: string): void => {
        router.get(url, {}, { preserveScroll: true, preserveState: true });
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
                            CLUP Management
                        </h1>
                        <Link href="/admin/zoning/clup/create">
                            <Button variant="primary" size="md" className="flex items-center gap-2">
                                <Plus size={18} />
                                Create New CLUP
                            </Button>
                        </Link>
                    </div>

                    {/* Search and Filters */}
                    <div className="bg-white dark:bg-dark-surface shadow-lg p-6 rounded-lg mb-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Input
                                type="text"
                                name="search"
                                placeholder="Search by LGU name or resolution number..."
                                value={data.search}
                                onChange={(e) => setData('search', e.target.value)}
                                className="flex-1"
                            />
                            <Button
                                type="button"
                                variant="primary"
                                size="md"
                                onClick={handleSearch}
                                className="flex items-center gap-2"
                            >
                                <Search size={18} />
                                Search
                            </Button>
                            <Button
                                type="button"
                                variant="secondary"
                                size="md"
                                onClick={handleReset}
                            >
                                Reset
                            </Button>
                        </div>

                        {showFilters && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
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
                                        <option value="Active">Active</option>
                                        <option value="Archived">Archived</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Year From
                                    </label>
                                    <Input
                                        type="number"
                                        name="yearFrom"
                                        placeholder="Start year"
                                        value={data.yearFrom}
                                        onChange={(e) => setData('yearFrom', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Year To
                                    </label>
                                    <Input
                                        type="number"
                                        name="yearTo"
                                        placeholder="End year"
                                        value={data.yearTo}
                                        onChange={(e) => setData('yearTo', e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 mt-4"
                        >
                            <Filter size={16} />
                            {showFilters ? 'Hide Filters' : 'Show Filters'}
                        </Button>
                    </div>

                    {/* CLUP Table */}
                    {clups.data.length === 0 ? (
                        <div className="bg-white dark:bg-dark-surface shadow-lg rounded-lg p-12 text-center">
                            <FileText size={64} className="mx-auto mb-4 text-gray-400 dark:text-gray-600" />
                            <h2 className="mb-2 font-semibold text-gray-900 dark:text-white text-xl">
                                No CLUP Records Found
                            </h2>
                            <p className="mb-6 text-gray-600 dark:text-gray-400">
                                Try adjusting your search or filter criteria, or create a new CLUP record.
                            </p>
                            <Link href="/admin/zoning/clup/create">
                                <Button variant="primary" size="md" className="flex items-center gap-2 mx-auto">
                                    <Plus size={20} />
                                    Create New CLUP
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-dark-surface shadow-lg rounded-lg overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Reference No.
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                LGU Name
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Coverage Period
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Approval Date
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
                                        {clups.data.map((clup) => (
                                            <tr key={clup.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="font-mono text-primary dark:text-primary-light font-semibold text-sm">
                                                        {clup.referenceNo || `#${clup.id}`}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <FileText size={18} className="text-gray-400" />
                                                        <span className="font-medium text-gray-900 dark:text-white">
                                                            {clup.lguName}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-gray-700 dark:text-gray-300 text-sm">
                                                        {clup.coveragePeriod}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-gray-600 dark:text-gray-400 text-sm">
                                                        {new Date(clup.approvalDate).toLocaleDateString()}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        clup.status === 'Active'
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
                                                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200'
                                                    }`}>
                                                        {clup.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <Link
                                                        href={`/admin/zoning/clup/${clup.id}`}
                                                        className="flex items-center gap-1 text-primary hover:text-primary/80"
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
                            {clups.last_page > 1 && (
                                <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                                    <div className="text-sm text-gray-700 dark:text-gray-300">
                                        Showing {((clups.current_page - 1) * clups.per_page) + 1} to{' '}
                                        {Math.min(clups.current_page * clups.per_page, clups.total)} of{' '}
                                        {clups.total} results
                                    </div>
                                    <div className="flex gap-2">
                                        {clups.links.map((link, index) => {
                                            if (index === 0) {
                                                return (
                                                    <button
                                                        key={index}
                                                        onClick={() => link.url && handlePageChange(link.url)}
                                                        disabled={!link.url}
                                                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-700 dark:text-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
                                                    >
                                                        Previous
                                                    </button>
                                                );
                                            }
                                            if (index === clups.links.length - 1) {
                                                return (
                                                    <button
                                                        key={index}
                                                        onClick={() => link.url && handlePageChange(link.url)}
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
                                                    onClick={() => link.url && handlePageChange(link.url)}
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
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
