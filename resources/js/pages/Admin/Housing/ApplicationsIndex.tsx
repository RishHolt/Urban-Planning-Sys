import { Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import AdminFilterSection from '../../../components/AdminFilterSection';
import AdminEmptyState from '../../../components/AdminEmptyState';
import Input from '../../../components/Input';
import { FileText, Eye, CheckCircle, XCircle, Clock, Calendar, List, Home } from 'lucide-react';

interface Application {
    id: string;
    application_no: string;
    beneficiary: string;
    beneficiary_no: string;
    housing_program: string;
    application_status: string;
    eligibility_status: string;
    submitted_at: string | null;
    created_at: string;
}

interface ApplicationsIndexProps {
    applications: {
        data: Application[];
        links: any;
        meta: any;
    };
    filters: {
        search?: string;
        status?: string;
        housing_program?: string;
        eligibility_status?: string;
        dateFrom?: string;
        dateTo?: string;
    };
}

export default function ApplicationsIndex({ applications, filters: initialFilters }: ApplicationsIndexProps) {
    const [showFilters, setShowFilters] = useState(false);
    const { data, setData, get } = useForm({
        search: initialFilters.search || '',
        status: initialFilters.status || '',
        housing_program: initialFilters.housing_program || '',
        eligibility_status: initialFilters.eligibility_status || '',
        dateFrom: initialFilters.dateFrom || '',
        dateTo: initialFilters.dateTo || '',
    });

    const handleSearch = (): void => {
        get('/admin/housing/applications', {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleReset = (): void => {
        setData({
            search: '',
            status: '',
            housing_program: '',
            eligibility_status: '',
            dateFrom: '',
            dateTo: '',
        });
        router.get('/admin/housing/applications');
    };

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
            'submitted': {
                label: 'Submitted',
                className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
                icon: <Clock size={14} />
            },
            'under_review': {
                label: 'Under Review',
                className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
                icon: <Clock size={14} />
            },
            'site_visit_scheduled': {
                label: 'Site Visit Scheduled',
                className: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
                icon: <Calendar size={14} />
            },
            'site_visit_completed': {
                label: 'Site Visit Completed',
                className: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
                icon: <CheckCircle size={14} />
            },
            'eligible': {
                label: 'Eligible',
                className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
                icon: <CheckCircle size={14} />
            },
            'not_eligible': {
                label: 'Not Eligible',
                className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
                icon: <XCircle size={14} />
            },
            'waitlisted': {
                label: 'Waitlisted',
                className: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
                icon: <List size={14} />
            },
            'allocated': {
                label: 'Allocated',
                className: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
                icon: <Home size={14} />
            },
            'cancelled': {
                label: 'Cancelled',
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

    const getEligibilityBadge = (status: string) => {
        switch (status) {
            case 'eligible':
                return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">Eligible</span>;
            case 'not_eligible':
                return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">Not Eligible</span>;
            default:
                return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">Pending</span>;
        }
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

    const formatDate = (dateString: string | null): string => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <AdminLayout
            title="Housing Applications"
            description="Review and manage all housing beneficiary applications"
        >
            <AdminFilterSection
                searchValue={data.search}
                onSearchChange={(value) => setData('search', value)}
                onSearch={handleSearch}
                onReset={handleReset}
                showFilters={showFilters}
                onToggleFilters={() => setShowFilters(!showFilters)}
                searchPlaceholder="Search by application number, beneficiary name, or beneficiary number..."
                filterContent={
                    <>
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                Application Status
                            </label>
                            <select
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                                <option value="">All Statuses</option>
                                <option value="submitted">Submitted</option>
                                <option value="under_review">Under Review</option>
                                <option value="site_visit_scheduled">Site Visit Scheduled</option>
                                <option value="site_visit_completed">Site Visit Completed</option>
                                <option value="eligible">Eligible</option>
                                <option value="not_eligible">Not Eligible</option>
                                <option value="waitlisted">Waitlisted</option>
                                <option value="allocated">Allocated</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                Housing Program
                            </label>
                            <select
                                value={data.housing_program}
                                onChange={(e) => setData('housing_program', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                                <option value="">All Programs</option>
                                <option value="socialized_housing">Socialized Housing</option>
                                <option value="relocation">Relocation</option>
                                <option value="rental_subsidy">Rental Subsidy</option>
                                <option value="housing_loan">Housing Loan</option>
                            </select>
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                Eligibility Status
                            </label>
                            <select
                                value={data.eligibility_status}
                                onChange={(e) => setData('eligibility_status', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                                <option value="">All Eligibility Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="eligible">Eligible</option>
                                <option value="not_eligible">Not Eligible</option>
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
                    </>
                }
            />

            {/* Applications Table */}
            <div className="bg-white dark:bg-dark-surface shadow-lg rounded-lg overflow-hidden">
                {applications.data.length === 0 ? (
                    <AdminEmptyState
                        icon={FileText}
                        title="No Applications Found"
                        description="Try adjusting your search or filter criteria."
                    />
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Application Number
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Beneficiary
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Housing Program
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Application Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Eligibility Status
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
                                    {applications.data.map((application) => (
                                        <tr key={application.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-mono text-sm text-gray-900 dark:text-white">
                                                    {application.application_no}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900 dark:text-white font-medium">
                                                    {application.beneficiary}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                                                    {application.beneficiary_no}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                    {getHousingProgramLabel(application.housing_program)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(application.application_status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getEligibilityBadge(application.eligibility_status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                                {formatDate(application.submitted_at)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <Link
                                                    href={`/admin/housing/applications/${application.id}`}
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
                        {applications.links && applications.links.length > 3 && (
                            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    Showing {applications.meta?.from ?? 'N/A'} to {applications.meta?.to ?? 'N/A'} of {applications.meta?.total ?? 'N/A'} results
                                </div>
                                <div className="flex gap-2">
                                    {applications.links.map((link: any, index: number) => (
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
