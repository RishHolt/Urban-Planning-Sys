import { router, useForm, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import { getCsrfToken, setCsrfToken } from '../../../data/services';
import type { SharedData } from '../../../types';
import AdminContentCard from '../../../components/AdminContentCard';
import Button from '../../../components/Button';
import AdminDocumentViewerModal from '../../../components/AdminDocumentViewerModal';
import ApplicationDetailsTabs, { TabPanel } from '../../../components/ApplicationDetailsTabs';
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
    Send,
    CheckSquare,
    Shield,
    AlertTriangle
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
        case_officer_id: number | null;
        case_officer: {
            id: number;
            name: string;
            email: string;
        } | null;
        project_id: number | null;
        project: {
            id: number;
            project_name: string;
            project_code: string;
        } | null;
        submitted_at: string | null;
        reviewed_at: string | null;
        approved_at: string | null;
        beneficiary: {
            id: number;
            beneficiary_no: string;
            first_name: string;
            middle_name: string | null;
            last_name: string;
            suffix?: string | null;
            full_name?: string;
            birth_date?: string | null;
            age?: number | null;
            gender?: string;
            civil_status?: string;
            email: string;
            contact_number: string;
            mobile_number?: string | null;
            telephone_number?: string | null;
            current_address: string;
            address?: string | null;
            street?: string | null;
            barangay: string;
            city?: string | null;
            province?: string | null;
            zip_code?: string | null;
            years_of_residency?: number | null;
            employment_status?: string;
            occupation?: string | null;
            employer_name?: string | null;
            monthly_income?: number | null;
            household_income?: number | null;
            has_existing_property?: boolean;
            priority_status: string;
            priority_id_no: string | null;
            sector_tags?: string[];
        };
        household_members?: Array<{
            id: string;
            full_name: string;
            relationship: string;
            birth_date: string | null;
            age: number | null;
            gender: string;
            occupation: string | null;
            monthly_income: number;
            is_dependent: boolean;
        }>;
        documents: Document[];
        document_summary?: {
            total_uploaded: number;
            total_required: number;
            missing: string[];
            verified: number;
            pending: number;
            invalid: number;
        };
        site_visits: SiteVisit[];
        waitlist: Waitlist | null;
        allocation: Allocation | null;
        allocation_history: AllocationHistory[];
    };
    case_officers?: Array<{
        id: number;
        name: string;
        email: string;
        role: string;
    }>;
}

export default function ApplicationDetails({ application, case_officers = [] }: ApplicationDetailsProps) {
    const page = usePage<SharedData>();
    const { flash } = page.props;
    
    // Set CSRF token from Inertia shared props
    useEffect(() => {
        if (page.props.csrf_token) {
            setCsrfToken(page.props.csrf_token);
        }
    }, [page.props.csrf_token]);
    const [showSiteVisitModal, setShowSiteVisitModal] = useState(false);
    const [showEligibilityModal, setShowEligibilityModal] = useState(false);
    const [showValidationModal, setShowValidationModal] = useState(false);
    const [showEligibilityCheckModal, setShowEligibilityCheckModal] = useState(false);
    const [showCompleteVisitModal, setShowCompleteVisitModal] = useState<string | null>(null);
    const [viewingDocument, setViewingDocument] = useState<{
        url: string;
        fileName: string;
        documentId: number;
        documentType: string;
        documentStatus: 'pending' | 'verified' | 'invalid';
    } | null>(null);
    const [validationResult, setValidationResult] = useState<any>(null);
    const [eligibilityResult, setEligibilityResult] = useState<any>(null);
    const [loadingValidation, setLoadingValidation] = useState(false);
    const [loadingEligibility, setLoadingEligibility] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [eligibilityError, setEligibilityError] = useState<string | null>(null);

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

    const { data: caseOfficerData, setData: setCaseOfficerData, post: postCaseOfficer, processing: caseOfficerProcessing } = useForm({
        case_officer_id: application.case_officer_id || '',
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
                router.reload({ only: ['application'] });
            },
        });
    };

    const handleMarkEligible = () => {
        // Use router.patch directly with the data
        router.patch(`/admin/housing/applications/${application.id}/status`, {
            application_status: 'eligible',
            eligibility_status: 'eligible',
            eligibility_remarks: statusData.eligibility_remarks || 'Application marked as eligible after review.',
            denial_reason: '',
        }, {
            preserveScroll: false,
            onSuccess: () => {
                router.reload({ only: ['application'] });
            },
            onError: (errors) => {
                console.error('Error marking as eligible:', errors);
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

    const handleAssignCaseOfficer = (e: React.FormEvent) => {
        e.preventDefault();
        postCaseOfficer(`/admin/housing/applications/${application.id}/assign-case-officer`, {
            preserveScroll: true,
            onSuccess: () => {
                router.reload({ only: ['application'] });
            },
        });
    };

    const handleAutoAssignCaseOfficer = () => {
        router.post(`/admin/housing/applications/${application.id}/auto-assign-case-officer`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                router.reload({ only: ['application'] });
            },
        });
    };

    const canScheduleSiteVisit = ['under_review', 'submitted'].includes(application.application_status);
    // Only allow marking eligibility after a site visit has been completed
    const hasCompletedSiteVisit = application.site_visits.some(v => v.status === 'completed');
    const canMarkEligibility = hasCompletedSiteVisit || application.application_status === 'site_visit_completed';

    const handleValidateApplication = async () => {
        setLoadingValidation(true);
        setValidationError(null);
        try {
            const csrfToken = getCsrfToken();
            if (!csrfToken) {
                throw new Error('CSRF token not available. Please refresh the page and try again.');
            }

            const response = await fetch(`/admin/housing/applications/${application.id}/validate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Server error: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            if (result.success) {
                setValidationResult(result.data);
                setShowValidationModal(true);
            } else {
                setValidationError(result.message || 'Validation failed. Please try again.');
            }
        } catch (error) {
            console.error('Validation error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to validate application. Please check your connection and try again.';
            setValidationError(errorMessage);
        } finally {
            setLoadingValidation(false);
        }
    };

    // Calculate document status for Required Documents tab
    const getDocumentStatus = (): 'red' | 'yellow' | 'green' => {
        if (!application.document_summary) {
            return 'red'; // No document summary available
        }

        const { total_uploaded, total_required, missing, invalid } = application.document_summary;

        if (total_uploaded === 0) {
            return 'red'; // No documents uploaded
        }

        if (missing.length > 0 || invalid > 0) {
            return 'yellow'; // Has missing or invalid/rejected documents
        }

        // All documents uploaded and verified
        return 'green';
    };

    const documentStatus = getDocumentStatus();

    const handleCheckEligibility = async (autoUpdate: boolean = false) => {
        setLoadingEligibility(true);
        setEligibilityError(null);
        try {
            const csrfToken = getCsrfToken();
            if (!csrfToken) {
                throw new Error('CSRF token not available. Please refresh the page and try again.');
            }

            const response = await fetch(`/admin/housing/applications/${application.id}/check-eligibility`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'include',
                body: JSON.stringify({ auto_update: autoUpdate }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Server error: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            if (result.success) {
                setEligibilityResult(result.data);
                setShowEligibilityCheckModal(true);
                if (result.auto_updated) {
                    router.reload({ only: ['application'] });
                }
            } else {
                setEligibilityError(result.message || 'Eligibility check failed. Please try again.');
            }
        } catch (error) {
            console.error('Eligibility check error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to check eligibility. Please check your connection and try again.';
            setEligibilityError(errorMessage);
        } finally {
            setLoadingEligibility(false);
        }
    };

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
            {validationError && (
                <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg">
                    <strong>Validation Error:</strong> {validationError}
                </div>
            )}
            {eligibilityError && (
                <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg">
                    <strong>Eligibility Check Error:</strong> {eligibilityError}
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
                    <div className="flex flex-wrap gap-3">
                        <Button
                            variant="secondary"
                            onClick={handleValidateApplication}
                            disabled={loadingValidation}
                            className="flex items-center gap-2"
                        >
                            <CheckSquare size={18} />
                            {loadingValidation ? 'Validating...' : 'Validate Application'}
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => handleCheckEligibility(false)}
                            disabled={loadingEligibility}
                            className="flex items-center gap-2"
                        >
                            <Shield size={18} />
                            {loadingEligibility ? 'Checking...' : 'Check Eligibility'}
                        </Button>
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
                                onClick={handleMarkEligible}
                                disabled={statusProcessing}
                                className="flex items-center gap-2"
                            >
                                <CheckCircle size={18} />
                                {statusProcessing ? 'Marking...' : 'Mark as Eligible'}
                            </Button>
                        )}
                    </div>
                </AdminContentCard>

                {/* Case Officer Assignment */}
                <AdminContentCard padding="lg">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <User size={20} />
                            Case Officer Assignment
                        </h3>
                    </div>
                    {application.case_officer ? (
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Assigned Case Officer</p>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{application.case_officer.name}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{application.case_officer.email}</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800 mb-4">
                            <p className="text-sm text-yellow-800 dark:text-yellow-200">No case officer assigned yet.</p>
                        </div>
                    )}
                    <form onSubmit={handleAssignCaseOfficer} className="space-y-4">
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                Assign Case Officer
                            </label>
                            <div className="flex gap-3">
                                <select
                                    value={caseOfficerData.case_officer_id}
                                    onChange={(e) => setCaseOfficerData('case_officer_id', e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                                >
                                    <option value="">Select Case Officer</option>
                                    {case_officers.map((officer) => (
                                        <option key={officer.id} value={officer.id}>
                                            {officer.name} ({officer.email}) - {officer.role}
                                        </option>
                                    ))}
                                </select>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    disabled={!caseOfficerData.case_officer_id || caseOfficerProcessing}
                                    className="flex items-center gap-2"
                                >
                                    {caseOfficerProcessing ? 'Assigning...' : 'Assign'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={handleAutoAssignCaseOfficer}
                                    disabled={case_officers.length === 0}
                                    className="flex items-center gap-2"
                                >
                                    Auto Assign
                                </Button>
                            </div>
                        </div>
                    </form>
                </AdminContentCard>

                {/* Tabs for Application Details */}
                <ApplicationDetailsTabs defaultTab="overview">
                    {/* Overview Tab */}
                    <TabPanel tabId="overview">
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
                                {application.beneficiary.full_name || `${application.beneficiary.first_name} ${application.beneficiary.middle_name || ''} ${application.beneficiary.last_name}`.trim()}
                                {application.beneficiary.suffix && ` ${application.beneficiary.suffix}`}
                            </p>
                        </div>
                        {application.beneficiary.birth_date && (
                            <div>
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Birth Date</label>
                                <p className="text-gray-900 dark:text-white">
                                    {formatDate(application.beneficiary.birth_date)}
                                    {application.beneficiary.age && ` (Age: ${application.beneficiary.age})`}
                                </p>
                            </div>
                        )}
                        {application.beneficiary.gender && (
                            <div>
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Gender</label>
                                <p className="text-gray-900 dark:text-white capitalize">{application.beneficiary.gender}</p>
                            </div>
                        )}
                        {application.beneficiary.civil_status && (
                            <div>
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Civil Status</label>
                                <p className="text-gray-900 dark:text-white capitalize">{application.beneficiary.civil_status.replace('_', ' ')}</p>
                            </div>
                        )}
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
                                <p className="text-gray-900 dark:text-white">
                                    {application.beneficiary.mobile_number || application.beneficiary.contact_number}
                                    {application.beneficiary.telephone_number && ` / ${application.beneficiary.telephone_number}`}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 md:col-span-2">
                            <MapPin size={16} className="text-gray-400" />
                            <div className="flex-1">
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Address</label>
                                <p className="text-gray-900 dark:text-white">
                                    {application.beneficiary.current_address || application.beneficiary.address}
                                    {application.beneficiary.street && `, ${application.beneficiary.street}`}
                                    {application.beneficiary.barangay && `, ${application.beneficiary.barangay}`}
                                    {application.beneficiary.city && `, ${application.beneficiary.city}`}
                                    {application.beneficiary.province && `, ${application.beneficiary.province}`}
                                    {application.beneficiary.zip_code && ` ${application.beneficiary.zip_code}`}
                                </p>
                            </div>
                        </div>
                        {application.beneficiary.years_of_residency !== null && application.beneficiary.years_of_residency !== undefined && (
                            <div>
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Years of Residency</label>
                                <p className="text-gray-900 dark:text-white">{application.beneficiary.years_of_residency} years</p>
                            </div>
                        )}
                        {application.beneficiary.employment_status && (
                            <div>
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Employment Status</label>
                                <p className="text-gray-900 dark:text-white capitalize">{application.beneficiary.employment_status.replace('_', ' ')}</p>
                            </div>
                        )}
                        {application.beneficiary.occupation && (
                            <div>
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Occupation</label>
                                <p className="text-gray-900 dark:text-white">{application.beneficiary.occupation}</p>
                            </div>
                        )}
                        {application.beneficiary.employer_name && (
                            <div>
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Employer</label>
                                <p className="text-gray-900 dark:text-white">{application.beneficiary.employer_name}</p>
                            </div>
                        )}
                        {application.beneficiary.monthly_income !== null && application.beneficiary.monthly_income !== undefined && (
                            <div>
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Income</label>
                                <p className="text-gray-900 dark:text-white">₱{application.beneficiary.monthly_income.toLocaleString()}</p>
                            </div>
                        )}
                        {application.beneficiary.household_income !== null && application.beneficiary.household_income !== undefined && (
                            <div>
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Household Income</label>
                                <p className="text-gray-900 dark:text-white">₱{application.beneficiary.household_income.toLocaleString()}</p>
                            </div>
                        )}
                        {application.beneficiary.has_existing_property !== undefined && (
                            <div>
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Has Existing Property</label>
                                <p className="text-gray-900 dark:text-white">{application.beneficiary.has_existing_property ? 'Yes' : 'No'}</p>
                            </div>
                        )}
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
                        {application.beneficiary.sector_tags && application.beneficiary.sector_tags.length > 0 && (
                            <div className="md:col-span-2">
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Sectors</label>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {application.beneficiary.sector_tags.map((sector: string, index: number) => (
                                        <span key={index} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs capitalize">
                                            {sector.replace('_', ' ')}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    {application.household_members && application.household_members.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">Household Members</h4>
                            <div className="space-y-3">
                                {application.household_members.map((member) => (
                                    <div key={member.id} className="p-3 bg-gray-50 dark:bg-dark-bg rounded-lg border border-gray-200 dark:border-gray-700">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                                            <div>
                                                <span className="font-medium text-gray-900 dark:text-white">{member.full_name}</span>
                                                <span className="text-gray-600 dark:text-gray-400 ml-2">({member.relationship})</span>
                                            </div>
                                            <div className="text-gray-600 dark:text-gray-400">
                                                {member.birth_date && `Born: ${formatDate(member.birth_date)}`}
                                                {member.age !== null && ` (Age: ${member.age})`}
                                            </div>
                                            <div className="text-gray-600 dark:text-gray-400">
                                                {member.occupation && `Occupation: ${member.occupation}`}
                                                {member.monthly_income > 0 && ` | Income: ₱${member.monthly_income.toLocaleString()}`}
                                                {member.is_dependent && <span className="ml-2 text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-0.5 rounded">Dependent</span>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
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
                    </TabPanel>

                    {/* Required Documents Tab */}
                    <TabPanel tabId="required_documents" status={documentStatus}>
                        <AdminContentCard padding="lg">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <FileText size={20} />
                                    Required Documents
                                </h3>
                        {application.document_summary && (
                            <div className="flex items-center gap-4 text-sm">
                                <span className={`px-3 py-1 rounded-full font-medium ${
                                    application.document_summary.missing.length === 0
                                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                        : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                                }`}>
                                    {application.document_summary.total_uploaded}/{application.document_summary.total_required} Documents
                                </span>
                                {application.document_summary.missing.length > 0 && (
                                    <span className="text-red-600 dark:text-red-400 flex items-center gap-1">
                                        <AlertTriangle size={16} />
                                        {application.document_summary.missing.length} Missing
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
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
                    </TabPanel>
                </ApplicationDetailsTabs>

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
                <AdminContentCard padding="lg" id="status-update-form">
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
                <div
                    className="z-50 fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-sm p-4"
                    onClick={() => setShowSiteVisitModal(false)}
                >
                    <div
                        className="relative flex flex-col bg-white dark:bg-dark-surface shadow-2xl rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="top-0 z-10 sticky flex justify-between items-center bg-white dark:bg-dark-surface px-6 py-4 border-gray-200 dark:border-gray-700 border-b">
                            <div>
                                <h2 className="font-bold text-gray-900 dark:text-white text-xl">
                                    Schedule Site Visit
                                </h2>
                                <p className="mt-1 text-gray-500 dark:text-gray-400 text-sm">
                                    Schedule a home verification visit
                                </p>
                            </div>
                            <button
                                onClick={() => setShowSiteVisitModal(false)}
                                className="hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors"
                                aria-label="Close modal"
                            >
                                <X size={24} className="text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 px-6 py-6 overflow-y-auto">
                            <form onSubmit={handleScheduleSiteVisit} className="space-y-4">
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
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Complete Site Visit Modal */}
            {showCompleteVisitModal !== null && (
                <div
                    className="z-50 fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-sm p-4"
                    onClick={() => setShowCompleteVisitModal(null)}
                >
                    <div
                        className="relative flex flex-col bg-white dark:bg-dark-surface shadow-2xl rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="top-0 z-10 sticky flex justify-between items-center bg-white dark:bg-dark-surface px-6 py-4 border-gray-200 dark:border-gray-700 border-b">
                            <div>
                                <h2 className="font-bold text-gray-900 dark:text-white text-xl">
                                    Complete Site Visit
                                </h2>
                                <p className="mt-1 text-gray-500 dark:text-gray-400 text-sm">
                                    Record findings from the site visit
                                </p>
                            </div>
                            <button
                                onClick={() => setShowCompleteVisitModal(null)}
                                className="hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors"
                                aria-label="Close modal"
                            >
                                <X size={24} className="text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 px-6 py-6 overflow-y-auto">
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                handleCompleteVisit(showCompleteVisitModal);
                            }} className="space-y-4">
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
                            </form>
                        </div>
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

            {/* Validation Results Modal */}
            {showValidationModal && validationResult && (
                <div
                    className="z-50 fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-sm p-4"
                    onClick={() => {
                        setShowValidationModal(false);
                        setValidationError(null);
                    }}
                >
                    <div
                        className="relative flex flex-col bg-white dark:bg-dark-surface shadow-2xl rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="top-0 z-10 sticky flex justify-between items-center bg-white dark:bg-dark-surface px-6 py-4 border-gray-200 dark:border-gray-700 border-b">
                            <div>
                                <h2 className="font-bold text-gray-900 dark:text-white text-xl">
                                    Application Validation Results
                                </h2>
                                <p className="mt-1 text-gray-500 dark:text-gray-400 text-sm">
                                    Review validation assessment
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowValidationModal(false);
                                    setValidationError(null);
                                }}
                                className="hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors"
                                aria-label="Close modal"
                            >
                                <X size={24} className="text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 px-6 py-6 overflow-y-auto">
                            {validationError && (
                                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                    <p className="text-sm text-red-800 dark:text-red-200">{validationError}</p>
                                </div>
                            )}
                            <div className="space-y-4">
                            <div className={`p-4 rounded-lg ${
                                validationResult.is_valid
                                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                                    : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
                            }`}>
                                <div className="flex items-center gap-2 mb-2">
                                    {validationResult.is_valid ? (
                                        <CheckCircle className="text-green-600 dark:text-green-400" size={20} />
                                    ) : (
                                        <AlertCircle className="text-yellow-600 dark:text-yellow-400" size={20} />
                                    )}
                                    <span className={`font-semibold ${
                                        validationResult.is_valid
                                            ? 'text-green-800 dark:text-green-200'
                                            : 'text-yellow-800 dark:text-yellow-200'
                                    }`}>
                                        {validationResult.is_valid ? 'Application is Valid' : 'Application Needs Attention'}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    Status: <strong className="capitalize">{validationResult.readiness_status.replace('_', ' ')}</strong>
                                </p>
                                {validationResult.summary && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{validationResult.summary}</p>
                                )}
                            </div>

                            {validationResult.missing_fields && validationResult.missing_fields.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Missing Fields:</h4>
                                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
                                        {validationResult.missing_fields.map((field: any, index: number) => (
                                            <li key={index}>{field.label || field.field}: {field.message}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {validationResult.missing_documents && validationResult.missing_documents.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Missing Documents:</h4>
                                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
                                        {validationResult.missing_documents.map((doc: any, index: number) => (
                                            <li key={index}>{doc.label || doc.document_type}: {doc.message}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {validationResult.duplicate_warnings && validationResult.duplicate_warnings.length > 0 && (
                                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                    <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2 flex items-center gap-2">
                                        <AlertTriangle size={18} />
                                        Potential Duplicates Found
                                    </h4>
                                    <ul className="space-y-2 text-sm text-red-700 dark:text-red-300">
                                        {validationResult.duplicate_warnings.map((dup: any, index: number) => (
                                            <li key={index} className="flex items-start gap-2">
                                                <span className="font-medium">{dup.name}</span>
                                                <span className="text-xs">({dup.beneficiary_no})</span>
                                                <span className="text-xs opacity-75">- {dup.details}</span>
                                                <span className="text-xs opacity-75">(Confidence: {Math.round(dup.confidence * 100)}%)</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <Button
                                variant="secondary"
                                onClick={() => {
                                    setShowValidationModal(false);
                                    setValidationError(null);
                                }}
                                className="w-full"
                            >
                                Close
                            </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Eligibility Check Results Modal */}
            {showEligibilityCheckModal && eligibilityResult && (
                <div
                    className="z-50 fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-sm p-4"
                    onClick={() => {
                        setShowEligibilityCheckModal(false);
                        setEligibilityError(null);
                    }}
                >
                    <div
                        className="relative flex flex-col bg-white dark:bg-dark-surface shadow-2xl rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="top-0 z-10 sticky flex justify-between items-center bg-white dark:bg-dark-surface px-6 py-4 border-gray-200 dark:border-gray-700 border-b">
                            <div>
                                <h2 className="font-bold text-gray-900 dark:text-white text-xl">
                                    Eligibility Check Results
                                </h2>
                                <p className="mt-1 text-gray-500 dark:text-gray-400 text-sm">
                                    Review eligibility assessment
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowEligibilityCheckModal(false);
                                    setEligibilityError(null);
                                }}
                                className="hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors"
                                aria-label="Close modal"
                            >
                                <X size={24} className="text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 px-6 py-6 overflow-y-auto">
                            {eligibilityError && (
                                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                    <p className="text-sm text-red-800 dark:text-red-200">{eligibilityError}</p>
                                </div>
                            )}
                            <div className="space-y-4">
                            <div className={`p-4 rounded-lg ${
                                eligibilityResult.is_eligible
                                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                                    : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                            }`}>
                                <div className="flex items-center gap-2 mb-2">
                                    {eligibilityResult.is_eligible ? (
                                        <CheckCircle className="text-green-600 dark:text-green-400" size={20} />
                                    ) : (
                                        <XCircle className="text-red-600 dark:text-red-400" size={20} />
                                    )}
                                    <span className={`font-semibold ${
                                        eligibilityResult.is_eligible
                                            ? 'text-green-800 dark:text-green-200'
                                            : 'text-red-800 dark:text-red-200'
                                    }`}>
                                        {eligibilityResult.determination === 'eligible' ? 'Eligible' : 
                                         eligibilityResult.determination === 'conditional' ? 'Conditionally Eligible' : 
                                         'Not Eligible'}
                                    </span>
                                </div>
                                {eligibilityResult.remarks && (
                                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">{eligibilityResult.remarks}</p>
                                )}
                            </div>

                            {eligibilityResult.passed_criteria && eligibilityResult.passed_criteria.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">Passed Criteria:</h4>
                                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
                                        {eligibilityResult.passed_criteria.map((criteria: string, index: number) => (
                                            <li key={index} className="capitalize">{criteria.replace('_', ' ')}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {eligibilityResult.failed_criteria && eligibilityResult.failed_criteria.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">Failed Criteria:</h4>
                                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
                                        {eligibilityResult.failed_criteria.map((criteria: string, index: number) => (
                                            <li key={index} className="capitalize">{criteria.replace('_', ' ')}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {eligibilityResult.reasons && eligibilityResult.reasons.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Reasons:</h4>
                                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
                                        {eligibilityResult.reasons.map((reason: string, index: number) => (
                                            <li key={index}>{reason}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <Button
                                    variant="primary"
                                    onClick={() => {
                                        handleCheckEligibility(true);
                                    }}
                                    className="flex-1"
                                >
                                    Auto-Update Eligibility Status
                                </Button>
                                <Button
                                    variant="secondary"
                                    onClick={() => {
                                        setShowEligibilityCheckModal(false);
                                        setEligibilityError(null);
                                    }}
                                    className="flex-1"
                                >
                                    Close
                                </Button>
                            </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
