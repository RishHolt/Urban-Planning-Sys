import { useState } from 'react';
import { router, useForm, Link } from '@inertiajs/react';
import AdminLayout from '../../../components/AdminLayout';
import AdminFilterSection from '../../../components/AdminFilterSection';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import { Download, ArrowLeft } from 'lucide-react';
import ApplicationsTable, { AdminApplication, PaginatedData } from '../../../components/ApplicationsTable';

interface PaginatedApplications extends PaginatedData<AdminApplication> {}

interface ApplicationsIndexProps {
    applications: PaginatedApplications;
    filters?: {
        search?: string;
        status?: string;
        category?: string;
    };
}

export default function ApplicationsIndex({ applications, filters: initialFilters = {} }: ApplicationsIndexProps) {
    const [showFilters, setShowFilters] = useState(false);
    const { data, setData, get } = useForm({
        search: initialFilters.search || '',
        status: initialFilters.status || '',
        category: initialFilters.category || '',
    });

    const handleSearch = (): void => {
        get('/admin/zoning/clearance/applications', {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleReset = (): void => {
        setData({
            search: '',
            status: '',
            category: '',
        });
        router.get('/admin/zoning/clearance/applications');
    };

    const handleExport = (): void => {
        const params = new URLSearchParams();
        Object.entries(data).forEach(([key, value]) => {
            if (value) {
                params.append(key, value as string);
            }
        });
        window.location.href = `/admin/zoning/clearance/applications/export?${params.toString()}`;
    };

    return (
        <AdminLayout
            title="Clearance Applications"
            description="Review and manage all zoning clearance applications"
        >
            <AdminFilterSection
                searchValue={data.search}
                onSearchChange={(value) => setData('search', value)}
                onSearch={handleSearch}
                onReset={handleReset}
                showFilters={showFilters}
                onToggleFilters={() => setShowFilters(!showFilters)}
                searchPlaceholder="Search by reference number, lot owner, or address..."
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
                                <option value="under_review">Under Review</option>
                                <option value="for_inspection">For Inspection</option>
                                <option value="approved">Approved</option>
                                <option value="denied">Denied</option>
                            </select>
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                Category
                            </label>
                            <select
                                value={data.category}
                                onChange={(e) => setData('category', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                                <option value="">All Categories</option>
                                <option value="individual_lot">Individual Lot</option>
                                <option value="subdivision_development">Subdivision Development</option>
                            </select>
                        </div>
                    </>
                }
            />

            {/* Applications Table */}
            <ApplicationsTable<AdminApplication>
                applications={applications as PaginatedData<AdminApplication>}
                viewUrl={(id) => `/admin/zoning/clearance/applications/${id}`}
                columns="admin"
                onPaginationClick={(url) => router.get(url)}
            />
        </AdminLayout>
    );
}
