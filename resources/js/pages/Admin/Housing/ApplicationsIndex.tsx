import { Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import AdminFilterSection from '../../../components/AdminFilterSection';
import AdminEmptyState from '../../../components/AdminEmptyState';
import Input from '../../../components/Input';
import { FileText, Eye, CheckCircle, XCircle, Clock, Calendar, List, Home, Users, ListChecks } from 'lucide-react';

interface Application {
    id: string;
    applicationNumber: string;
    applicantName: string;
    beneficiary_no: string;
    projectType: string;
    status: string;
    eligibility_status: string;
    submittedAt: string | null;
    createdAt: string;
}

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

interface ApplicationsIndexProps {
    applications?: {
        data: Application[];
        links: any;
        meta: any;
    };
    beneficiaries?: {
        data: Beneficiary[];
        links: any;
        meta: any;
    };
    filters: {
        view?: 'applications' | 'beneficiaries';
        search?: string;
        status?: string;
        housing_program?: string;
        eligibility_status?: string;
        sector?: string;
        barangay?: string;
        dateFrom?: string;
        dateTo?: string;
    };
}

export default function ApplicationsIndex({ applications, beneficiaries, filters: initialFilters }: ApplicationsIndexProps) {
    const [activeTab, setActiveTab] = useState<'applications' | 'beneficiaries'>(
        (initialFilters.view as 'applications' | 'beneficiaries') || 'applications'
    );
    const [showFilters, setShowFilters] = useState(false);
    
    // Applications form
    const { data: appData, setData: setAppData, get: appGet } = useForm({
        search: initialFilters.search || '',
        status: initialFilters.status || '',
        housing_program: initialFilters.housing_program || '',
        eligibility_status: initialFilters.eligibility_status || '',
        dateFrom: initialFilters.dateFrom || '',
        dateTo: initialFilters.dateTo || '',
    });

    // Beneficiaries form
    const { data: benData, setData: setBenData, get: benGet } = useForm({
        search: initialFilters.search || '',
        status: initialFilters.status || '',
        sector: initialFilters.sector || '',
        barangay: initialFilters.barangay || '',
    });

    const handleTabChange = (tab: 'applications' | 'beneficiaries'): void => {
        setActiveTab(tab);
        router.get('/admin/housing/applications', {
            view: tab,
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleAppSearch = (): void => {
        appGet('/admin/housing/applications', {
            data: { ...appData, view: 'applications' },
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleBenSearch = (): void => {
        benGet('/admin/housing/applications', {
            data: { ...benData, view: 'beneficiaries' },
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleAppReset = (): void => {
        setAppData({
            search: '',
            status: '',
            housing_program: '',
            eligibility_status: '',
            dateFrom: '',
            dateTo: '',
        });
        router.get('/admin/housing/applications', { view: 'applications' });
    };

    const handleBenReset = (): void => {
        setBenData({
            search: '',
            status: '',
            sector: '',
            barangay: '',
        });
        router.get('/admin/housing/applications', { view: 'beneficiaries' });
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
            'verified': {
                label: 'Verified',
                className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
                icon: <CheckCircle size={14} />
            },
            'approved': {
                label: 'Approved',
                className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
                icon: <CheckCircle size={14} />
            },
            'rejected': {
                label: 'Rejected',
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
            case 'conditional':
                return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200">Conditional</span>;
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
            title="Applications & Beneficiaries"
            description="Manage housing applications and beneficiary records"
        >
            {/* Tabs */}
            <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
                <nav className="flex gap-4">
                    <button
                        onClick={() => handleTabChange('applications')}
                        className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                            activeTab === 'applications'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <ListChecks size={18} />
                            Applications
                        </div>
                    </button>
                    <button
                        onClick={() => handleTabChange('beneficiaries')}
                        className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                            activeTab === 'beneficiaries'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <Users size={18} />
                            Beneficiaries
                        </div>
                    </button>
                </nav>
            </div>

            {activeTab === 'applications' && (
                <>
                    <AdminFilterSection
                        searchValue={appData.search}
                        onSearchChange={(value) => setAppData('search', value)}
                        onSearch={handleAppSearch}
                        onReset={handleAppReset}
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
                                value={appData.status}
                                onChange={(e) => setAppData('status', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                                <option value="">All Statuses</option>
                                <option value="submitted">Submitted</option>
                                <option value="under_review">Under Review</option>
                                <option value="site_visit_scheduled">Site Visit Scheduled</option>
                                <option value="site_visit_completed">Site Visit Completed</option>
                                <option value="verified">Verified</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
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
                                value={appData.housing_program}
                                onChange={(e) => setAppData('housing_program', e.target.value)}
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
                                value={appData.eligibility_status}
                                onChange={(e) => setAppData('eligibility_status', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                                <option value="">All Eligibility Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="eligible">Eligible</option>
                                <option value="not_eligible">Not Eligible</option>
                                <option value="conditional">Conditional</option>
                            </select>
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                Date From
                            </label>
                            <Input
                                type="date"
                                name="dateFrom"
                                value={appData.dateFrom}
                                onChange={(e) => setAppData('dateFrom', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                Date To
                            </label>
                            <Input
                                type="date"
                                name="dateTo"
                                value={appData.dateTo}
                                onChange={(e) => setAppData('dateTo', e.target.value)}
                            />
                        </div>
                    </>
                }
            />

                    {/* Applications Table */}
                    <div className="bg-white dark:bg-dark-surface shadow-lg rounded-lg overflow-hidden">
                        {!applications || applications.data.length === 0 ? (
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
                                                    {application.applicationNumber}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900 dark:text-white font-medium">
                                                    {application.applicantName}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                                                    {application.beneficiary_no}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                    {application.projectType}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(application.status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getEligibilityBadge(application.eligibility_status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                                {formatDate(application.submittedAt)}
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
                                                    router.get(link.url, { view: 'applications' }, { preserveState: true, preserveScroll: true });
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

            {activeTab === 'beneficiaries' && (
                <>
                    <AdminFilterSection
                        searchValue={benData.search}
                        onSearchChange={(value) => setBenData('search', value)}
                        onSearch={handleBenSearch}
                        onReset={handleBenReset}
                        showFilters={showFilters}
                        onToggleFilters={() => setShowFilters(!showFilters)}
                        searchPlaceholder="Search by beneficiary name, number, or email..."
                        filterContent={
                            <>
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Status
                                    </label>
                                    <select
                                        value={benData.status}
                                        onChange={(e) => setBenData('status', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                                    >
                                        <option value="">All Statuses</option>
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
                                        value={benData.sector}
                                        onChange={(e) => setBenData('sector', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                                    >
                                        <option value="">All Sectors</option>
                                        <option value="indigent">Indigent</option>
                                        <option value="informal_settler">Informal Settler</option>
                                        <option value="relocatee">Relocatee</option>
                                        <option value="ofw">OFW</option>
                                        <option value="senior_citizen">Senior Citizen</option>
                                        <option value="pwd">PWD</option>
                                        <option value="solo_parent">Solo Parent</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Barangay
                                    </label>
                                    <Input
                                        type="text"
                                        name="barangay"
                                        value={benData.barangay}
                                        onChange={(e) => setBenData('barangay', e.target.value)}
                                        placeholder="Enter barangay"
                                    />
                                </div>
                            </>
                        }
                    />

                    {/* Beneficiaries Table */}
                    <div className="bg-white dark:bg-dark-surface shadow-lg rounded-lg overflow-hidden">
                        {!beneficiaries || beneficiaries.data.length === 0 ? (
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
                                                    Beneficiary
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Contact
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Location
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
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-dark-surface divide-y divide-gray-200 dark:divide-gray-700">
                                            {beneficiaries.data.map((beneficiary) => (
                                                <tr key={beneficiary.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                                {beneficiary.full_name}
                                                            </div>
                                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                                {beneficiary.beneficiary_no}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900 dark:text-white">{beneficiary.email}</div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">{beneficiary.contact_number}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                        {beneficiary.barangay}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-wrap gap-1">
                                                            {beneficiary.sectors.map((sector, idx) => (
                                                                <span
                                                                    key={idx}
                                                                    className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                                                >
                                                                    {sector}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                            {beneficiary.status || 'N/A'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                        {beneficiary.total_applications}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <Link
                                                            href={`/admin/housing/beneficiaries/${beneficiary.id}`}
                                                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                        >
                                                            <Eye size={16} />
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {/* Pagination */}
                                {beneficiaries.links && beneficiaries.links.length > 3 && (
                                    <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            Showing {beneficiaries.meta?.from ?? 'N/A'} to {beneficiaries.meta?.to ?? 'N/A'} of {beneficiaries.meta?.total ?? 'N/A'} results
                                        </div>
                                        <div className="flex gap-2">
                                            {beneficiaries.links.map((link: any, index: number) => (
                                                <button
                                                    key={index}
                                                    onClick={() => {
                                                        if (link.url) {
                                                            router.get(link.url, { view: 'beneficiaries' }, { preserveState: true, preserveScroll: true });
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
