import { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import AdminLayout from '../../../components/AdminLayout';
import AdminFilterSection from '../../../components/AdminFilterSection';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import { Download } from 'lucide-react';
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
        <AdminLayout
            title="Applications"
            description="Review and manage all zoning clearance applications"
        >
            <AdminFilterSection
                searchValue={data.search}
                onSearchChange={(value) => setData('search', value)}
                onSearch={handleSearch}
                onReset={handleReset}
                showFilters={showFilters}
                onToggleFilters={() => setShowFilters(!showFilters)}
                searchPlaceholder="Search by application number, applicant name, or company name..."
                actionButtons={
                    <Button
                        variant="outline"
                        size="md"
                        onClick={handleExport}
                        className="flex items-center gap-2"
                    >
                        <Download size={18} />
                        Export
                    </Button>
                }
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
                    </>
                }
            />

            {/* Applications Table */}
            <ApplicationsTable<AdminApplication>
                applications={applications as PaginatedData<AdminApplication>}
                viewUrl={(id) => `/admin/zoning/applications/${id}`}
                columns="admin"
                onPaginationClick={(url) => router.get(url)}
            />
        </AdminLayout>
    );
}
