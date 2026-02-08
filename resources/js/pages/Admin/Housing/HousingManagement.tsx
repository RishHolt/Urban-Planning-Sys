import { Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import AdminFilterSection from '../../../components/AdminFilterSection';
import AdminEmptyState from '../../../components/AdminEmptyState';
import Input from '../../../components/Input';
import { FileText, Eye, CheckCircle, XCircle, Clock, Calendar, List, Home, Trophy, ArrowUpDown, Users, Tag, Archive, RotateCcw } from 'lucide-react';

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
    priority_score?: number;
    rank?: number;
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

interface HousingManagementProps {
    applications?: {
        data: Application[];
        links: any;
        meta: any;
    };
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
        view?: 'applications' | 'beneficiaries';
        search?: string;
        status?: string;
        housing_program?: string;
        eligibility_status?: string;
        sector?: string;
        barangay?: string;
        dateFrom?: string;
        dateTo?: string;
        ranked?: boolean;
    };
}

export default function HousingManagement({ 
    applications, 
    beneficiaries, 
    filters: initialFilters = {} 
}: HousingManagementProps) {
    const [activeTab, setActiveTab] = useState<'applications' | 'beneficiaries'>(
        (initialFilters.view as 'applications' | 'beneficiaries') || 'applications'
    );
    const [showFilters, setShowFilters] = useState(false);
    const [showRanked, setShowRanked] = useState(false);

    // Applications form
    const { data: appData, setData: setAppData, get: appGet } = useForm({
        search: initialFilters.search || '',
        status: initialFilters.status || '',
        housing_program: initialFilters.housing_program || '',
        eligibility_status: initialFilters.eligibility_status || '',
        dateFrom: initialFilters.dateFrom || '',
        dateTo: initialFilters.dateTo || '',
        ranked: initialFilters.ranked || false,
    });

    // Beneficiaries form
    const { data: benData, setData: setBenData, get: benGet } = useForm({
        search: initialFilters.search || '',
        status: initialFilters.status || '',
        sector: initialFilters.sector || '',
        barangay: initialFilters.barangay || '',
    });

    const handleTabChange = (tab: 'applications' | 'beneficiaries') => {
        setActiveTab(tab);
        // Update URL and load data for the selected tab
        router.get(`/admin/housing/management`, {
            view: tab,
            preserveState: false,
            preserveScroll: true,
        });
    };

    const handleApplicationsSearch = (): void => {
        router.get('/admin/housing/management', {
            ...appData,
            view: 'applications',
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleApplicationsReset = (): void => {
        setAppData({
            search: '',
            status: '',
            housing_program: '',
            eligibility_status: '',
            dateFrom: '',
            dateTo: '',
            ranked: false,
        });
        router.get('/admin/housing/management', {
            view: 'applications',
        });
    };

    const handleToggleRanked = (): void => {
        const newRanked = !appData.ranked;
        setAppData('ranked', newRanked);
        setShowRanked(newRanked);
        router.get('/admin/housing/management', {
            ...appData,
            ranked: newRanked,
            view: 'applications',
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleBeneficiariesSearch = (): void => {
        router.get('/admin/housing/management', {
            ...benData,
            view: 'beneficiaries',
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleBeneficiariesReset = (): void => {
        setBenData({
            search: '',
            status: '',
            sector: '',
            barangay: '',
        });
        router.get('/admin/housing/management', {
            view: 'beneficiaries',
        });
    };

    const getStatusBadge = (status: string) => {
        const configs: Record<string, { className: string; icon: any; label: string }> = {
            submitted: { className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', icon: Clock, label: 'Submitted' },
            under_review: { className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', icon: Clock, label: 'Under Review' },
            site_visit_scheduled: { className: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200', icon: Calendar, label: 'Site Visit Scheduled' },
            site_visit_completed: { className: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200', icon: CheckCircle, label: 'Site Visit Completed' },
            eligible: { className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', icon: CheckCircle, label: 'Eligible' },
            not_eligible: { className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', icon: XCircle, label: 'Not Eligible' },
            waitlisted: { className: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200', icon: List, label: 'Waitlisted' },
            allocated: { className: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200', icon: Home, label: 'Allocated' },
            cancelled: { className: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', icon: XCircle, label: 'Cancelled' },
        };

        const config = configs[status] || { className: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', icon: FileText, label: status };
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.className}`}>
                <Icon size={14} />
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

    const getBeneficiaryStatusBadge = (status: string | null) => {
        if (!status) return null;

        const statusColors: Record<string, string> = {
            applicant: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
            qualified: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            waitlisted: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
            awarded: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            disqualified: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
            archived: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
        };

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status.toLowerCase()] || statusColors.archived}`}>
                {status}
            </span>
        );
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

    const applicationsData = applications || { data: [], links: [], meta: {} };
    const beneficiariesData = beneficiaries || {
        data: [],
        links: [],
        meta: { current_page: 1, last_page: 1, per_page: 15, total: 0 },
    };

    return (
        <AdminLayout
            title="Housing Management"
            description="Manage applications and beneficiaries in one place"
        >
            {/* Tabs */}
            <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
                <nav className="flex gap-4" aria-label="Tabs">
                    <button
                        onClick={() => handleTabChange('applications')}
                        className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                            activeTab === 'applications'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <FileText size={18} />
                            Applications
                            {applicationsData.data && applicationsData.data.length > 0 && (
                                <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                                    {applicationsData.meta?.total || applicationsData.data.length}
                                </span>
                            )}
                        </div>
                    </button>
                    <button
                        onClick={() => handleTabChange('beneficiaries')}
                        className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                            activeTab === 'beneficiaries'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <Users size={18} />
                            Beneficiaries
                            {beneficiariesData.data && beneficiariesData.data.length > 0 && (
                                <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                                    {beneficiariesData.meta?.total || beneficiariesData.data.length}
                                </span>
                            )}
                        </div>
                    </button>
                </nav>
            </div>

            {/* Applications Tab Content */}
            {activeTab === 'applications' && (
                <>
                    <div className="mb-6 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleToggleRanked}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                                    showRanked
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                            >
                                <Trophy size={18} />
                                {showRanked ? 'Show Ranked' : 'Show Standard View'}
                            </button>
                            {showRanked && (
                                <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                    <ArrowUpDown size={16} />
                                    Applications sorted by priority score
                                </span>
                            )}
                        </div>
                    </div>

                    <AdminFilterSection
                        searchValue={appData.search}
                        onSearchChange={(value) => setAppData('search', value)}
                        onSearch={handleApplicationsSearch}
                        onReset={handleApplicationsReset}
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
                                    </select>
                                </div>
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Date From
                                    </label>
                                    <Input
                                        type="date"
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
                                        value={appData.dateTo}
                                        onChange={(e) => setAppData('dateTo', e.target.value)}
                                    />
                                </div>
                            </>
                        }
                    />

                    {/* Applications Table */}
                    <div className="bg-white dark:bg-dark-surface shadow-lg rounded-lg overflow-hidden">
                        {!applicationsData.data || applicationsData.data.length === 0 ? (
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
                                                {showRanked && (
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        Rank
                                                    </th>
                                                )}
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Application No.
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Applicant
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Program
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Eligibility
                                                </th>
                                                {showRanked && (
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        Priority Score
                                                    </th>
                                                )}
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Submitted
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-dark-surface divide-y divide-gray-200 dark:divide-gray-700">
                                            {applicationsData.data.map((application) => (
                                                <tr key={application.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                                    {showRanked && (
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {application.rank ? (
                                                                <span className="px-2 py-1 bg-primary/10 text-primary rounded font-semibold">
                                                                    #{application.rank}
                                                                </span>
                                                            ) : (
                                                                <span className="text-gray-400">-</span>
                                                            )}
                                                        </td>
                                                    )}
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="font-mono text-sm text-gray-900 dark:text-white">
                                                            {application.applicationNumber}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {application.applicantName}
                                                        </div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                            {application.beneficiary_no}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                        {getHousingProgramLabel(application.projectType)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {getStatusBadge(application.status)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {getEligibilityBadge(application.eligibility_status)}
                                                    </td>
                                                    {showRanked && (
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                            {application.priority_score?.toFixed(2) || '-'}
                                                        </td>
                                                    )}
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                        {formatDate(application.submittedAt)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <Link
                                                            href={`/admin/housing/applications/${application.id}`}
                                                            className="text-primary hover:text-primary/80 flex items-center justify-end gap-1"
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
                                {applicationsData.links && applicationsData.links.length > 3 && (
                                    <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                        <div className="text-sm text-gray-700 dark:text-gray-300">
                                            Showing page {applicationsData.meta?.current_page || 1} of {applicationsData.meta?.last_page || 1}
                                        </div>
                                        <div className="flex gap-2">
                                            {applicationsData.links.map((link: any, index: number) => (
                                                <button
                                                    key={index}
                                                    onClick={() => link.url && router.visit(link.url, { preserveState: true, preserveScroll: true })}
                                                    disabled={!link.url}
                                                    className={`px-3 py-1 rounded text-sm ${
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

            {/* Beneficiaries Tab Content */}
            {activeTab === 'beneficiaries' && (
                <>
                    <AdminFilterSection
                        searchValue={benData.search}
                        onSearchChange={(value) => setBenData('search', value)}
                        onSearch={handleBeneficiariesSearch}
                        onReset={handleBeneficiariesReset}
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
                                        value={benData.status}
                                        onChange={(e) => setBenData('status', e.target.value)}
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
                                        value={benData.sector}
                                        onChange={(e) => setBenData('sector', e.target.value)}
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
                                        value={benData.barangay}
                                        onChange={(e) => setBenData('barangay', e.target.value)}
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
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-dark-surface divide-y divide-gray-200 dark:divide-gray-700">
                                            {beneficiariesData.data.map((beneficiary) => (
                                                <tr key={beneficiary.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="font-mono text-sm text-gray-900 dark:text-white">
                                                            {beneficiary.beneficiary_no}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {beneficiary.full_name}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm text-gray-900 dark:text-white">
                                                            {beneficiary.email}
                                                        </div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                            {beneficiary.contact_number}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                        {beneficiary.barangay}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-wrap gap-1">
                                                            {beneficiary.sectors.slice(0, 2).map((sector, idx) => (
                                                                <span
                                                                    key={idx}
                                                                    className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs"
                                                                >
                                                                    {sector}
                                                                </span>
                                                            ))}
                                                            {beneficiary.sectors.length > 2 && (
                                                                <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded text-xs">
                                                                    +{beneficiary.sectors.length - 2}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {getBeneficiaryStatusBadge(beneficiary.status)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                        {beneficiary.total_applications}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <Link
                                                            href={`/admin/housing/beneficiaries/${beneficiary.id}`}
                                                            className="text-primary hover:text-primary/80 flex items-center justify-end gap-1"
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
                                {beneficiariesData.links && beneficiariesData.links.length > 3 && (
                                    <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                        <div className="text-sm text-gray-700 dark:text-gray-300">
                                            Showing page {beneficiariesData.meta?.current_page || 1} of {beneficiariesData.meta?.last_page || 1}
                                        </div>
                                        <div className="flex gap-2">
                                            {beneficiariesData.links.map((link: any, index: number) => (
                                                <button
                                                    key={index}
                                                    onClick={() => link.url && router.visit(link.url, { preserveState: true, preserveScroll: true })}
                                                    disabled={!link.url}
                                                    className={`px-3 py-1 rounded text-sm ${
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
