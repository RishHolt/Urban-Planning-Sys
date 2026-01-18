import { useState } from 'react';
import { Link, router, useForm } from '@inertiajs/react';
import AdminHeader from '../../../components/AdminHeader';
import Sidebar from '../../../components/Sidebar';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import { Search, Filter, Download } from 'lucide-react';
import ApplicationsTable, { AdminApplication, PaginatedData } from '../../../components/ApplicationsTable';

interface PaginatedApplications extends PaginatedData<AdminApplication> {}

interface ApplicationsIndexProps {
    applications: PaginatedApplications;
    filters: {
        search?: string;
        status?: string;
        applicantType?: string;
        municipality?: string;
        barangay?: string;
        dateFrom?: string;
        dateTo?: string;
    };
}

export default function ApplicationsIndex({ applications, filters: initialFilters }: ApplicationsIndexProps) {
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
        applicantType: initialFilters.applicantType || '',
        municipality: initialFilters.municipality || '',
        barangay: initialFilters.barangay || '',
        dateFrom: initialFilters.dateFrom || '',
        dateTo: initialFilters.dateTo || '',
    });

    const handleSearch = (): void => {
        get('/admin/zoning/applications', {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleReset = (): void => {
        setData({
            search: '',
            status: '',
            applicantType: '',
            municipality: '',
            barangay: '',
            dateFrom: '',
            dateTo: '',
        });
        router.get('/admin/zoning/applications');
    };

    const handleExport = (): void => {
        const params = new URLSearchParams();
        Object.entries(data).forEach(([key, value]) => {
            if (value) {
                params.append(key, value as string);
            }
        });
        window.location.href = `/admin/zoning/applications/export?${params.toString()}`;
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
                            Applications
                        </h1>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="md"
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center gap-2"
                            >
                                <Filter size={18} />
                                Filters
                            </Button>
                            <Button
                                variant="outline"
                                size="md"
                                onClick={handleExport}
                                className="flex items-center gap-2"
                            >
                                <Download size={18} />
                                Export
                            </Button>
                        </div>
                    </div>

                    {/* Search and Filters */}
                    <div className="bg-white dark:bg-dark-surface shadow-lg mb-6 p-6 rounded-lg">
                        <div className="flex gap-4 mb-4">
                            <div className="flex-1">
                                <Input
                                    type="text"
                                    name="search"
                                    placeholder="Search by application number, applicant name, or company name..."
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
                                        Status
                                    </label>
                                    <select
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                                    >
                                        <option value="">All Statuses</option>
                                        <option value="pending">Pending</option>
                                        <option value="in_review">In Review</option>
                                        <option value="approved">Approved</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Applicant Type
                                    </label>
                                    <select
                                        value={data.applicantType}
                                        onChange={(e) => setData('applicantType', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                                    >
                                        <option value="">All Types</option>
                                        <option value="individual">Individual</option>
                                        <option value="company">Company</option>
                                        <option value="developer">Developer</option>
                                        <option value="Government">Government</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Municipality
                                    </label>
                                    <Input
                                        type="text"
                                        name="municipality"
                                        placeholder="Filter by municipality..."
                                        value={data.municipality}
                                        onChange={(e) => setData('municipality', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Barangay
                                    </label>
                                    <Input
                                        type="text"
                                        name="barangay"
                                        placeholder="Filter by barangay..."
                                        value={data.barangay}
                                        onChange={(e) => setData('barangay', e.target.value)}
                                    />
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

                    {/* Applications Table */}
                    <ApplicationsTable<AdminApplication>
                        applications={applications as PaginatedData<AdminApplication>}
                        viewUrl={(id) => `/admin/zoning/applications/${id}`}
                        columns="admin"
                        onPaginationClick={(url) => router.get(url)}
                    />
                </div>
            </main>
        </div>
    );
}
