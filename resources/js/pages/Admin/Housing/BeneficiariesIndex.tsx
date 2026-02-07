import { useState } from 'react';
import { Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '../../../components/AdminLayout';
import AdminFilterSection from '../../../components/AdminFilterSection';
import AdminEmptyState from '../../../components/AdminEmptyState';
import Button from '../../../components/Button';
import { Plus, Users, Eye, Tag, Archive, RotateCcw } from 'lucide-react';

interface Beneficiary {
    id: string;
    beneficiary_no: string;
    full_name: string;
    email: string;
    contact_number: string;
    barangay: string;
    sectors: string[];
    status: string | null;
    total_applications: number;
    registered_at: string;
}

interface BeneficiariesIndexProps {
    beneficiaries?: {
        data: Beneficiary[];
        links: any;
        meta: {
            current_page: number;
            last_page: number;
            per_page: number;
            total: number;
        };
    };
    filters?: {
        search?: string;
        status?: string;
        sector?: string;
        barangay?: string;
    };
}

export default function BeneficiariesIndex({ beneficiaries, filters: initialFilters = {} }: BeneficiariesIndexProps) {
    const [showFilters, setShowFilters] = useState(false);
    const { data, setData, get } = useForm({
        search: initialFilters.search || '',
        status: initialFilters.status || '',
        sector: initialFilters.sector || '',
        barangay: initialFilters.barangay || '',
    });

    // Default empty beneficiaries if not provided
    const beneficiariesData = beneficiaries || {
        data: [],
        links: [],
        meta: {
            current_page: 1,
            last_page: 1,
            per_page: 15,
            total: 0,
        },
    };

    const handleSearch = (): void => {
        get('/admin/housing/beneficiaries', {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleReset = (): void => {
        setData({
            search: '',
            status: '',
            sector: '',
            barangay: '',
        });
        router.get('/admin/housing/beneficiaries');
    };

    const handlePagination = (url: string): void => {
        router.visit(url, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const getStatusBadge = (status: string | null | undefined): React.ReactNode => {
        if (!status) {
            return (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                    N/A
                </span>
            );
        }

        const statusColors: Record<string, string> = {
            applicant: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            qualified: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            waitlisted: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            awarded: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
            disqualified: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
            archived: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
        };

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status.toLowerCase()] || statusColors.archived}`}>
                {status}
            </span>
        );
    };

    return (
        <AdminLayout
            title="Housing Beneficiaries"
            description="Manage all registered housing beneficiaries"
        >
            <AdminFilterSection
                searchValue={data.search}
                onSearchChange={(value) => setData('search', value)}
                onSearch={handleSearch}
                onReset={handleReset}
                showFilters={showFilters}
                onToggleFilters={() => setShowFilters(!showFilters)}
                searchPlaceholder="Search by name, beneficiary number, email..."
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
                                <option value="applicant">Applicant</option>
                                <option value="qualified">Qualified</option>
                                <option value="waitlisted">Waitlisted</option>
                                <option value="awarded">Awarded</option>
                                <option value="disqualified">Disqualified</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                Sector
                            </label>
                            <select
                                value={data.sector}
                                onChange={(e) => setData('sector', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                                <option value="">All Sectors</option>
                                <option value="isf">Informal Settler</option>
                                <option value="pwd">Person with Disability</option>
                                <option value="senior_citizen">Senior Citizen</option>
                                <option value="solo_parent">Solo Parent</option>
                                <option value="low_income">Low-income Family</option>
                                <option value="disaster_affected">Disaster-affected</option>
                            </select>
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                Barangay
                            </label>
                            <input
                                type="text"
                                value={data.barangay}
                                onChange={(e) => setData('barangay', e.target.value)}
                                placeholder="Enter barangay"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                    </>
                }
            />

            {/* Beneficiaries Table */}
            <div className="bg-white dark:bg-dark-surface shadow-lg rounded-lg overflow-hidden">
                {!beneficiariesData.data || beneficiariesData.data.length === 0 ? (
                    <AdminEmptyState
                        icon={Users}
                        title="No Beneficiaries Found"
                        description="Try adjusting your search or filter criteria."
                    />
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Beneficiary No.
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Contact
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Barangay
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Sectors
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Applications
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-dark-surface divide-y divide-gray-200 dark:divide-gray-700">
                                    {beneficiariesData.data.map((beneficiary) => (
                                        <tr key={beneficiary.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                {beneficiary.beneficiary_no}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                {beneficiary.full_name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                <div>{beneficiary.email}</div>
                                                <div className="text-xs">{beneficiary.contact_number}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {beneficiary.barangay}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                <div className="flex flex-wrap gap-1">
                                                    {beneficiary.sectors && beneficiary.sectors.length > 0 ? (
                                                        beneficiary.sectors.map((sector, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs"
                                                            >
                                                                {sector}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-gray-400 dark:text-gray-500 text-xs">None</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(beneficiary.status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {beneficiary.total_applications}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <Link
                                                    href={`/admin/housing/beneficiaries/${beneficiary.id}`}
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
                        {beneficiariesData.meta && beneficiariesData.meta.last_page > 1 && (
                            <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                                <div className="text-sm text-gray-700 dark:text-gray-300">
                                    Showing {((beneficiariesData.meta.current_page - 1) * beneficiariesData.meta.per_page) + 1} to{' '}
                                    {Math.min(beneficiariesData.meta.current_page * beneficiariesData.meta.per_page, beneficiariesData.meta.total)} of{' '}
                                    {beneficiariesData.meta.total} results
                                </div>
                                <div className="flex gap-2">
                                    {beneficiariesData.links && beneficiariesData.links.map((link: any, index: number) => {
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
                                        if (index === (beneficiariesData.links?.length ?? 0) - 1) {
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
