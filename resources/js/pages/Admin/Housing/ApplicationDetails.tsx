import { router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import AdminContentCard from '../../../components/AdminContentCard';
import Button from '../../../components/Button';
import AdminDocumentViewerModal from '../../../components/AdminDocumentViewerModal';
import { 
    ArrowLeft, 
    CheckCircle, 
    XCircle, 
    Clock, 
    User, 
    Mail, 
    Phone, 
    MapPin, 
    FileText, 
    Eye, 
    Download,
    Calendar,
    Home,
    List,
    AlertCircle,
    Building,
    X,
    Send
} from 'lucide-react';

interface Document {
    id: number;
    document_type: string;
    file_name: string | null;
    url: string | null;
    verification_status: 'pending' | 'verified' | 'invalid';
    verified_by?: number | null;
    verified_at?: string | null;
}

interface SiteVisit {
    id: string;
    scheduled_date: string;
    visit_date: string | null;
    status: string;
    address_visited: string;
    living_conditions: string | null;
    findings: string | null;
    recommendation: string | null;
    remarks: string | null;
}

interface Waitlist {
    id: number;
    priority_score: number;
    queue_position: number;
    waitlist_date: string;
    status: string;
}

interface Allocation {
    id: number;
    allocation_no: string;
    allocation_date: string;
    allocation_status: string;
    unit: {
        unit_no: string;
        project: {
            project_name: string;
        };
    } | null;
}

interface AllocationHistory {
    id: string;
    status: string;
    remarks: string | null;
    updated_by?: number | null;
    updated_at: string;
}

interface ApplicationDetailsProps {
    application: {
        id: string;
        application_no: string;
        housing_program: string;
        application_reason: string;
        application_status: string;
        eligibility_status: string;
        eligibility_remarks: string | null;
        denial_reason: string | null;
        submitted_at: string | null;
        reviewed_at: string | null;
        approved_at: string | null;
        beneficiary: {
            id: number;
            beneficiary_no: string;
            first_name: string;
            middle_name: string | null;
            last_name: string;
            email: string;
            contact_number: string;
            current_address: string;
            barangay: string;
            priority_status: string;
            priority_id_no: string | null;
        };
        documents: Document[];
        site_visits: SiteVisit[];
        waitlist: Waitlist | null;
        allocation: Allocation | null;
        allocation_history: AllocationHistory[];
    };
}

export default function ApplicationDetails({ application }: ApplicationDetailsProps) {
    const { flash } = usePage<{ flash?: { success?: string; error?: string } }>().props;
    const [showSiteVisitModal, setShowSiteVisitModal] = useState(false);
    const [showEligibilityModal, setShowEligibilityModal] = useState(false);
    const [showCompleteVisitModal, setShowCompleteVisitModal] = useState<string | null>(null);
    const [viewingDocument, setViewingDocument] = useState<{
        url: string;
        fileName: string;
        documentId: number;
        documentType: string;
        documentStatus: 'pending' | 'verified' | 'invalid';
    } | null>(null);

    const { data: statusData, setData: setStatusData, patch, processing: statusProcessing } = useForm({
        application_status: application.application_status,
        eligibility_status: application.eligibility_status,
        eligibility_remarks: application.eligibility_remarks || '',
        denial_reason: application.denial_reason || '',
    });

    const { data: siteVisitData, setData: setSiteVisitData, post: postSiteVisit, processing: siteVisitProcessing } = useForm({
        application_id: application.id,
        scheduled_date: '',
        address_visited: application.beneficiary.current_address,
    });

    const { data: completeVisitData, setData: setCompleteVisitData, post: postCompleteVisit, processing: completeVisitProcessing } = useForm({
        living_conditions: '',
        findings: '',
        recommendation: 'eligible' as 'eligible' | 'not_eligible' | 'needs_followup',
        remarks: '',
    });

    const formatDate = (dateString: string | null): string => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatDateTime = (dateString: string | null): string => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
            'submitted': {
                label: 'Submitted',
                className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
                icon: <Clock size={16} />
            },
            'under_review': {
                label: 'Under Review',
                className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
                icon: <Clock size={16} />
            },
            'site_visit_scheduled': {
                label: 'Site Visit Scheduled',
                className: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
                icon: <Calendar size={16} />
            },
            'site_visit_completed': {
                label: 'Site Visit Completed',
                className: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
                icon: <CheckCircle size={16} />
            },
            'eligible': {
                label: 'Eligible',
                className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
                icon: <CheckCircle size={16} />
            },
            'not_eligible': {
                label: 'Not Eligible',
                className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
                icon: <XCircle size={16} />
            },
            'waitlisted': {
                label: 'Waitlisted',
                className: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
                icon: <List size={16} />
            },
            'allocated': {
                label: 'Allocated',
                className: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
                icon: <Home size={16} />
            },
            'cancelled': {
                label: 'Cancelled',
                className: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
                icon: <XCircle size={16} />
            },
        };

        const config = statusConfig[status] || {
            label: status,
            className: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
            icon: <Clock size={16} />
        };

        return (
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.className}`}>
                {config.icon}
                {config.label}
            </span>
        );
    };

    const getEligibilityBadge = (status: string) => {
        switch (status) {
            case 'eligible':
                return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">Eligible</span>;
            case 'not_eligible':
                return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">Not Eligible</span>;
            default:
                return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">Pending</span>;
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

    const getDocumentTypeLabel = (type: string): string => {
        return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    const handleStatusUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        patch(`/admin/housing/applications/${application.id}/status`, {
            preserveScroll: true,
            onSuccess: () => {
                setShowEligibilityModal(false);
            },
        });
    };

    const handleScheduleSiteVisit = (e: React.FormEvent) => {
        e.preventDefault();
        postSiteVisit('/admin/housing/site-visits', {
            preserveScroll: false,
            onSuccess: () => {
                setShowSiteVisitModal(false);
                setSiteVisitData({
                    application_id: application.id,
                    scheduled_date: '',
                    address_visited: application.beneficiary.current_address,
                });
            },
        });
    };

    const handleCompleteVisit = (visitId: string) => {
        postCompleteVisit(`/admin/housing/site-visits/${visitId}/complete`, {
            preserveScroll: false,
            onSuccess: () => {
                setShowCompleteVisitModal(null);
                setCompleteVisitData({
                    living_conditions: '',
                    findings: '',
                    recommendation: 'eligible',
                    remarks: '',
                });
            },
        });
    };

    const handleDocumentApprove = (documentId: number, notes: string) => {
        router.patch(`/admin/housing/applications/${application.id}/documents/${documentId}/approve`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                setViewingDocument(null);
            },
        });
    };

    const handleDocumentReject = (documentId: number, notes: string) => {
        router.patch(`/admin/housing/applications/${application.id}/documents/${documentId}/reject`, {
            remarks: notes,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setViewingDocument(null);
            },
        });
    };

    const canScheduleSiteVisit = ['under_review', 'submitted'].includes(application.application_status);
    const canMarkEligibility = ['site_visit_completed', 'under_review'].includes(application.application_status);
    const hasCompletedSiteVisit = application.site_visits.some(v => v.status === 'completed');

    return (
        <AdminLayout
            title="Application Details"
            description="Review and manage application details"
            backButton={{
                href: '/admin/housing/applications',
                label: 'Back to Applications',
            }}
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

            <div className="space-y-6">
                {/* Application Header */}
                <AdminContentCard padding="lg">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                Application #{application.application_no}
                            </h2>
                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                <span>Housing Program: <strong className="text-gray-900 dark:text-white">{getHousingProgramLabel(application.housing_program)}</strong></span>
                                <span>Submitted: <strong className="text-gray-900 dark:text-white">{formatDate(application.submitted_at)}</strong></span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {getEligibilityBadge(application.eligibility_status)}
                            {getStatusBadge(application.application_status)}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        {canScheduleSiteVisit && (
                            <Button
                                variant="primary"
                                onClick={() => setShowSiteVisitModal(true)}
                                className="flex items-center gap-2"
                            >
                                <Calendar size={18} />
                                Schedule Site Visit
                            </Button>
                        )}
                        {canMarkEligibility && (
                            <Button
                                variant="primary"
                                onClick={() => setShowEligibilityModal(true)}
                                className="flex items-center gap-2"
                            >
                                <CheckCircle size={18} />
                                Mark Eligibility
                            </Button>
                        )}
                    </div>
                </AdminContentCard>

                {/* Beneficiary Information */}
                <AdminContentCard padding="lg">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <User size={20} />
                        Beneficiary Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Beneficiary Number</label>
                            <p className="text-gray-900 dark:text-white font-mono">{application.beneficiary.beneficiary_no}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Full Name</label>
                            <p className="text-gray-900 dark:text-white">
                                {application.beneficiary.first_name} {application.beneficiary.middle_name} {application.beneficiary.last_name}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Mail size={16} className="text-gray-400" />
                            <div>
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Email</label>
                                <p className="text-gray-900 dark:text-white">{application.beneficiary.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Phone size={16} className="text-gray-400" />
                            <div>
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Contact Number</label>
                                <p className="text-gray-900 dark:text-white">{application.beneficiary.contact_number}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin size={16} className="text-gray-400" />
                            <div>
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Address</label>
                                <p className="text-gray-900 dark:text-white">{application.beneficiary.current_address}</p>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Barangay</label>
                            <p className="text-gray-900 dark:text-white">{application.beneficiary.barangay}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Priority Status</label>
                            <p className="text-gray-900 dark:text-white capitalize">{application.beneficiary.priority_status.replace('_', ' ')}</p>
                        </div>
                        {application.beneficiary.priority_id_no && (
                            <div>
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Priority ID Number</label>
                                <p className="text-gray-900 dark:text-white">{application.beneficiary.priority_id_no}</p>
                            </div>
                        )}
                    </div>
                </AdminContentCard>

                {/* Application Details */}
                <AdminContentCard padding="lg">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <FileText size={20} />
                        Application Details
                    </h3>
                    <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Application Reason</label>
                        <p className="text-gray-900 dark:text-white mt-1">{application.application_reason}</p>
                    </div>
                    {application.eligibility_remarks && (
                        <div className="mt-4">
                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Eligibility Remarks</label>
                            <p className="text-gray-900 dark:text-white mt-1">{application.eligibility_remarks}</p>
                        </div>
                    )}
                    {application.denial_reason && (
                        <div className="mt-4">
                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Denial Reason</label>
                            <p className="text-red-600 dark:text-red-400 mt-1">{application.denial_reason}</p>
                        </div>
                    )}
                </AdminContentCard>

                {/* Documents Section */}
                <AdminContentCard padding="lg">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <FileText size={20} />
                        Documents
                    </h3>
                    <div className="space-y-3">
                        {application.documents.length === 0 ? (
                            <p className="text-gray-600 dark:text-gray-400">No documents uploaded.</p>
                        ) : (
                            application.documents.map((doc) => (
                                <div
                                    key={doc.id}
                                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-bg rounded-lg border border-gray-200 dark:border-gray-700"
                                >
                                    <div className="flex-1">
                                        <div className="font-medium text-gray-900 dark:text-white">
                                            {getDocumentTypeLabel(doc.document_type)}
                                        </div>
                                        {doc.file_name && (
                                            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                {doc.file_name}
                                            </div>
                                        )}
                                        {doc.verified_at && (
                                            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                                Verified: {formatDateTime(doc.verified_at)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {getEligibilityBadge(doc.verification_status === 'verified' ? 'eligible' : doc.verification_status === 'invalid' ? 'not_eligible' : 'pending')}
                                        {doc.url && (
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => setViewingDocument({
                                                    url: doc.url!,
                                                    fileName: doc.file_name || 'Document',
                                                    documentId: doc.id,
                                                    documentType: doc.document_type,
                                                    documentStatus: doc.verification_status,
                                                })}
                                                className="flex items-center gap-2"
                                            >
                                                <Eye size={16} />
                                                View
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </AdminContentCard>

                {/* Site Visits Section */}
                <AdminContentCard padding="lg">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Calendar size={20} />
                        Site Visits
                    </h3>
                    {application.site_visits.length === 0 ? (
                        <p className="text-gray-600 dark:text-gray-400">No site visits scheduled.</p>
                    ) : (
                        <div className="space-y-4">
                            {application.site_visits.map((visit) => (
                                <div
                                    key={visit.id}
                                    className="p-4 bg-gray-50 dark:bg-dark-bg rounded-lg border border-gray-200 dark:border-gray-700"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <div className="font-medium text-gray-900 dark:text-white">
                                                Scheduled: {formatDate(visit.scheduled_date)}
                                            </div>
                                            {visit.visit_date && (
                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                    Visited: {formatDate(visit.visit_date)}
                                                </div>
                                            )}
                                            <div className="mt-2">
                                                {getStatusBadge(visit.status)}
                                            </div>
                                        </div>
                                        {visit.status === 'scheduled' && (
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                onClick={() => setShowCompleteVisitModal(visit.id)}
                                            >
                                                Complete Visit
                                            </Button>
                                        )}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                        <strong>Address Visited:</strong> {visit.address_visited}
                                    </div>
                                    {visit.living_conditions && (
                                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                            <strong>Living Conditions:</strong> {visit.living_conditions}
                                        </div>
                                    )}
                                    {visit.findings && (
                                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                            <strong>Findings:</strong> {visit.findings}
                                        </div>
                                    )}
                                    {visit.recommendation && (
                                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                            <strong>Recommendation:</strong> <span className="capitalize">{visit.recommendation.replace('_', ' ')}</span>
                                        </div>
                                    )}
                                    {visit.remarks && (
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            <strong>Remarks:</strong> {visit.remarks}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </AdminContentCard>

                {/* Waitlist Information */}
                {application.waitlist && (
                    <AdminContentCard padding="lg">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <List size={20} />
                            Waitlist Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Queue Position</label>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{application.waitlist.queue_position}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Priority Score</label>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{application.waitlist.priority_score}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Waitlist Date</label>
                                <p className="text-gray-900 dark:text-white">{formatDate(application.waitlist.waitlist_date)}</p>
                            </div>
                        </div>
                    </AdminContentCard>
                )}

                {/* Allocation Information */}
                {application.allocation && (
                    <AdminContentCard padding="lg">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Home size={20} />
                            Allocation Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Allocation Number</label>
                                <p className="text-gray-900 dark:text-white font-mono">{application.allocation.allocation_no}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Allocation Date</label>
                                <p className="text-gray-900 dark:text-white">{formatDate(application.allocation.allocation_date)}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</label>
                                <div className="mt-1">{getStatusBadge(application.allocation.allocation_status)}</div>
                            </div>
                            {application.allocation.unit && (
                                <>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Unit Number</label>
                                        <p className="text-gray-900 dark:text-white">{application.allocation.unit.unit_no}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Project</label>
                                        <p className="text-gray-900 dark:text-white">{application.allocation.unit.project.project_name}</p>
                                    </div>
                                </>
                            )}
                        </div>
                        {application.allocation_history.length > 0 && (
                            <div className="mt-6">
                                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Allocation History</h4>
                                <div className="space-y-2">
                                    {application.allocation_history.map((history) => (
                                        <div
                                            key={history.id}
                                            className="p-3 bg-gray-50 dark:bg-dark-bg rounded-lg border-l-4 border-blue-500"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="font-medium text-gray-900 dark:text-white">{history.status}</div>
                                                    {history.remarks && (
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{history.remarks}</p>
                                                    )}
                                                </div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                    {formatDateTime(history.updated_at)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </AdminContentCard>
                )}

                {/* Status Update Section */}
                <AdminContentCard padding="lg">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Update Status</h3>
                    <form onSubmit={handleStatusUpdate}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Application Status
                                </label>
                                <select
                                    value={statusData.application_status}
                                    onChange={(e) => setStatusData('application_status', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                >
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
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Eligibility Status
                                </label>
                                <select
                                    value={statusData.eligibility_status}
                                    onChange={(e) => setStatusData('eligibility_status', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="eligible">Eligible</option>
                                    <option value="not_eligible">Not Eligible</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Eligibility Remarks
                                </label>
                                <textarea
                                    value={statusData.eligibility_remarks}
                                    onChange={(e) => setStatusData('eligibility_remarks', e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="Enter eligibility remarks..."
                                />
                            </div>
                            {statusData.eligibility_status === 'not_eligible' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Denial Reason
                                    </label>
                                    <textarea
                                        value={statusData.denial_reason}
                                        onChange={(e) => setStatusData('denial_reason', e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                        placeholder="Enter denial reason..."
                                    />
                                </div>
                            )}
                            <Button type="submit" variant="primary" disabled={statusProcessing}>
                                {statusProcessing ? 'Updating...' : 'Update Status'}
                            </Button>
                        </div>
                    </form>
                </AdminContentCard>
            </div>

            {/* Site Visit Scheduling Modal */}
            {showSiteVisitModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm">
                    <div className="bg-white dark:bg-dark-surface rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Schedule Site Visit</h3>
                            <button
                                onClick={() => setShowSiteVisitModal(false)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleScheduleSiteVisit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Scheduled Date
                                    </label>
                                    <input
                                        type="date"
                                        value={siteVisitData.scheduled_date}
                                        onChange={(e) => setSiteVisitData('scheduled_date', e.target.value)}
                                        required
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Address to Visit
                                    </label>
                                    <textarea
                                        value={siteVisitData.address_visited}
                                        onChange={(e) => setSiteVisitData('address_visited', e.target.value)}
                                        required
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <Button type="submit" variant="primary" disabled={siteVisitProcessing} className="flex-1">
                                        {siteVisitProcessing ? 'Scheduling...' : 'Schedule Visit'}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => setShowSiteVisitModal(false)}
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

            {/* Complete Site Visit Modal */}
            {showCompleteVisitModal !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm">
                    <div className="bg-white dark:bg-dark-surface rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Complete Site Visit</h3>
                            <button
                                onClick={() => setShowCompleteVisitModal(null)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            handleCompleteVisit(showCompleteVisitModal);
                        }}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Living Conditions <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={completeVisitData.living_conditions}
                                        onChange={(e) => setCompleteVisitData('living_conditions', e.target.value)}
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
                                        value={completeVisitData.findings}
                                        onChange={(e) => setCompleteVisitData('findings', e.target.value)}
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
                                        value={completeVisitData.recommendation}
                                        onChange={(e) => setCompleteVisitData('recommendation', e.target.value as 'eligible' | 'not_eligible' | 'needs_followup')}
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
                                        value={completeVisitData.remarks}
                                        onChange={(e) => setCompleteVisitData('remarks', e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                        placeholder="Additional remarks..."
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <Button type="submit" variant="primary" disabled={completeVisitProcessing} className="flex-1">
                                        {completeVisitProcessing ? 'Completing...' : 'Complete Visit'}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => setShowCompleteVisitModal(null)}
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

            {/* Document Viewer Modal */}
            {viewingDocument && (
                <AdminDocumentViewerModal
                    isOpen={!!viewingDocument}
                    url={viewingDocument.url}
                    fileName={viewingDocument.fileName}
                    documentId={viewingDocument.documentId}
                    documentType={viewingDocument.documentType}
                    documentStatus={viewingDocument.documentStatus}
                    onApprove={handleDocumentApprove}
                    onReject={handleDocumentReject}
                    onClose={() => setViewingDocument(null)}
                />
            )}
        </AdminLayout>
    );
}
