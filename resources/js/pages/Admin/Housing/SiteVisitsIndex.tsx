import { router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import AdminFilterSection from '../../../components/AdminFilterSection';
import AdminEmptyState from '../../../components/AdminEmptyState';
import Button from '../../../components/Button';
import { Calendar, CheckCircle, XCircle, Clock, User, FileText, X } from 'lucide-react';

interface SiteVisit {
    id: string;
    application_id: string;
    beneficiary: string;
    application_no: string;
    scheduled_date: string;
    visit_date: string | null;
    status: string;
    recommendation: string | null;
}

interface SiteVisitsIndexProps {
    siteVisits: {
        data: SiteVisit[];
        links: any;
        meta: any;
    };
    filters?: {
        status?: string;
    };
}

export default function SiteVisitsIndex({ siteVisits, filters: initialFilters = {} }: SiteVisitsIndexProps) {
    const { flash } = usePage<{ flash?: { success?: string; error?: string } }>().props;
    const [showFilters, setShowFilters] = useState(false);
    const [showCompleteModal, setShowCompleteModal] = useState<string | null>(null);
    const { data, setData, get } = useForm({
        status: initialFilters.status || '',
    });

    const { data: completeData, setData: setCompleteData, post: postComplete, processing: completing } = useForm({
        living_conditions: '',
        findings: '',
        recommendation: 'eligible' as 'eligible' | 'not_eligible' | 'needs_followup',
        remarks: '',
    });

    const handleSearch = (): void => {
        get('/admin/housing/site-visits', {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleReset = (): void => {
        setData({ status: '' });
        router.get('/admin/housing/site-visits');
    };

    const handleComplete = (visitId: string) => {
        postComplete(`/admin/housing/site-visits/${visitId}/complete`, {
            preserveScroll: true,
            onSuccess: () => {
                setShowCompleteModal(null);
                setCompleteData({
                    living_conditions: '',
                    findings: '',
                    recommendation: 'eligible',
                    remarks: '',
                });
            },
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'scheduled':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        <Clock size={14} />
                        Scheduled
                    </span>
                );
            case 'completed':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        <CheckCircle size={14} />
                        Completed
                    </span>
                );
            case 'cancelled':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                        <XCircle size={14} />
                        Cancelled
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                        <Clock size={14} />
                        {status}
                    </span>
                );
        }
    };

    const getRecommendationBadge = (recommendation: string | null) => {
        if (!recommendation) return null;
        switch (recommendation) {
            case 'eligible':
                return (
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                        Eligible
                    </span>
                );
            case 'not_eligible':
                return (
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
                        Not Eligible
                    </span>
                );
            case 'needs_followup':
                return (
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                        Needs Follow-up
                    </span>
                );
            default:
                return null;
        }
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
            title="Site Visits"
            description="Manage and track site visits for housing applications"
        >
            {/* Flash Messages */}
            {flash?.success && (
                <div className="mb-6 p-4 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg">
                    {flash.success}
                </div>
            )}
            {flash?.error && (
                <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg">
                    {flash.error}
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
                            <option value="scheduled">Scheduled</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                }
            />

            {/* Site Visits Table */}
            <div className="bg-white dark:bg-dark-surface shadow-lg rounded-lg overflow-hidden">
                {siteVisits.data.length === 0 ? (
                    <AdminEmptyState
                        icon={Calendar}
                        title="No Site Visits Found"
                        description="No site visits match your filter criteria."
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
                                            Scheduled Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Visit Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Recommendation
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-dark-surface divide-y divide-gray-200 dark:divide-gray-700">
                                    {siteVisits.data.map((visit) => (
                                        <tr key={visit.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-mono text-sm text-gray-900 dark:text-white">
                                                    {visit.application_no}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900 dark:text-white font-medium">
                                                    {visit.beneficiary}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                                {formatDate(visit.scheduled_date)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                                {formatDate(visit.visit_date)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(visit.status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getRecommendationBadge(visit.recommendation)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <div className="flex items-center gap-2">
                                                    {visit.status === 'scheduled' && (
                                                        <Button
                                                            variant="primary"
                                                            size="sm"
                                                            onClick={() => setShowCompleteModal(visit.id)}
                                                            className="flex items-center gap-1"
                                                        >
                                                            <CheckCircle size={14} />
                                                            Complete
                                                        </Button>
                                                    )}
                                                    <a
                                                        href={`/admin/housing/applications/${visit.application_id}`}
                                                        className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline font-medium"
                                                    >
                                                        <FileText size={14} />
                                                        View Application
                                                    </a>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination */}
                        {siteVisits.links && siteVisits.links.length > 3 && (
                            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    Showing {siteVisits.meta?.from ?? 'N/A'} to {siteVisits.meta?.to ?? 'N/A'} of {siteVisits.meta?.total ?? 'N/A'} results
                                </div>
                                <div className="flex gap-2">
                                    {siteVisits.links.map((link: any, index: number) => (
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

            {/* Complete Site Visit Modal */}
            {showCompleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm">
                    <div className="bg-white dark:bg-dark-surface rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Complete Site Visit</h3>
                            <button
                                onClick={() => setShowCompleteModal(null)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            handleComplete(showCompleteModal);
                        }}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Living Conditions <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={completeData.living_conditions}
                                        onChange={(e) => setCompleteData('living_conditions', e.target.value)}
                                        required
                                        rows={4}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                        placeholder="Describe the living conditions observed..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Findings <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={completeData.findings}
                                        onChange={(e) => setCompleteData('findings', e.target.value)}
                                        required
                                        rows={4}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                        placeholder="Enter findings from the site visit..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Recommendation <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={completeData.recommendation}
                                        onChange={(e) => setCompleteData('recommendation', e.target.value as 'eligible' | 'not_eligible' | 'needs_followup')}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                    >
                                        <option value="eligible">Eligible</option>
                                        <option value="not_eligible">Not Eligible</option>
                                        <option value="needs_followup">Needs Follow-up</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Remarks
                                    </label>
                                    <textarea
                                        value={completeData.remarks}
                                        onChange={(e) => setCompleteData('remarks', e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                        placeholder="Additional remarks..."
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <Button type="submit" variant="primary" disabled={completing} className="flex-1">
                                        {completing ? 'Completing...' : 'Complete Visit'}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => setShowCompleteModal(null)}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
