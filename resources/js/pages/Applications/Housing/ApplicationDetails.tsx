import { Link, usePage } from '@inertiajs/react';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import Button from '../../../components/Button';
import StatusBadge from '../../../components/StatusBadge';
import { ArrowLeft, CheckCircle, XCircle, Clock, User, Mail, Phone, MapPin, FileText, Eye, Download, Home, Calendar, List } from 'lucide-react';

interface Document {
    id: number;
    document_type: string;
    file_name: string;
    url: string | null;
    verification_status: 'pending' | 'verified' | 'invalid';
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

interface ApplicationDetailsProps {
    application: {
        id: string;
        application_no: string;
        housing_program: string;
        application_reason: string;
        application_status: string;
        eligibility_status: string;
        eligibility_remarks: string | null;
        submitted_at: string | null;
        beneficiary: {
            beneficiary_no: string;
            first_name: string;
            middle_name: string | null;
            last_name: string;
            email: string;
            contact_number: string;
            current_address: string;
            barangay: string;
            priority_status: string;
        };
        documents: Document[];
        site_visits: SiteVisit[];
        waitlist: Waitlist | null;
        allocation: Allocation | null;
    };
}

export default function ApplicationDetails({ application }: ApplicationDetailsProps) {
    const { flash } = usePage<{ flash?: { success?: string; error?: string } }>().props;

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'allocated':
            case 'moved_in':
                return <CheckCircle size={20} className="text-green-500" />;
            case 'cancelled':
            case 'not_eligible':
                return <XCircle size={20} className="text-red-500" />;
            case 'under_review':
            case 'site_visit_scheduled':
            case 'site_visit_completed':
            case 'eligible':
            case 'waitlisted':
                return <Clock size={20} className="text-blue-500" />;
            default:
                return <Clock size={20} className="text-yellow-500" />;
        }
    };

    const formatFileSize = (bytes: number | null): string => {
        if (!bytes) return 'N/A';
        if (bytes < 1024) {
            return `${bytes} B`;
        }
        if (bytes < 1024 * 1024) {
            return `${(bytes / 1024).toFixed(2)} KB`;
        }
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    };

    const formatDate = (dateString: string | null): string => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getStatusLabel = (status: string): string => {
        const labels: Record<string, string> = {
            'submitted': 'Submitted',
            'under_review': 'Under Review',
            'site_visit_scheduled': 'Site Visit Scheduled',
            'site_visit_completed': 'Site Visit Completed',
            'eligible': 'Eligible',
            'not_eligible': 'Not Eligible',
            'waitlisted': 'Waitlisted',
            'allocated': 'Allocated',
            'cancelled': 'Cancelled',
            'moved_in': 'Moved In',
        };
        return labels[status] || status;
    };

    const getEligibilityStatusBadge = (status: string) => {
        switch (status) {
            case 'eligible':
                return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">Eligible</span>;
            case 'not_eligible':
                return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">Not Eligible</span>;
            default:
                return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">Pending</span>;
        }
    };

    return (
        <div className="flex flex-col bg-background dark:bg-dark-bg w-full min-h-dvh transition-colors">
            <Header />
            <main className="flex-1 mt-16 py-8 md:py-12">
                <div className="mx-auto px-4 max-w-7xl">
                    <div className="mb-6">
                        <Link href="/applications/housing">
                            <Button variant="secondary" size="sm" className="flex items-center gap-2">
                                <ArrowLeft size={18} />
                                Return to Application List
                            </Button>
                        </Link>
                    </div>

                    {/* Header */}
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="mb-2 font-bold text-gray-900 dark:text-white text-3xl">
                                Application Details
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                {application.application_no}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            {getStatusIcon(application.application_status)}
                            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                                {getStatusLabel(application.application_status)}
                            </span>
                        </div>
                    </div>

                    {/* Success Message */}
                    {flash?.success && (
                        <div className="bg-green-50 dark:bg-green-900/20 mb-6 p-4 border border-green-200 dark:border-green-800 rounded-lg">
                            <div className="flex items-start gap-2">
                                <CheckCircle size={20} className="flex-shrink-0 mt-0.5 text-green-600 dark:text-green-400" />
                                <p className="text-green-800 dark:text-green-200 text-sm">
                                    {flash.success}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Error Message */}
                    {flash?.error && (
                        <div className="bg-red-50 dark:bg-red-900/20 mb-6 p-4 border border-red-200 dark:border-red-800 rounded-lg">
                            <div className="flex items-start gap-2">
                                <XCircle size={20} className="flex-shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
                                <p className="text-red-800 dark:text-red-200 text-sm">
                                    {flash.error}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="gap-6 grid grid-cols-1 lg:grid-cols-3">
                        {/* Main Content */}
                        <div className="space-y-6 lg:col-span-2">
                            {/* Application Status */}
                            <section className="bg-white dark:bg-dark-surface shadow-lg p-6 rounded-lg">
                                <h2 className="flex items-center gap-2 mb-4 font-semibold text-gray-900 dark:text-white text-xl">
                                    <Clock size={20} />
                                    Application Status
                                </h2>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 dark:text-gray-400">Status</span>
                                        <span className="font-semibold text-gray-900 dark:text-white">
                                            {getStatusLabel(application.application_status)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 dark:text-gray-400">Eligibility Status</span>
                                        {getEligibilityStatusBadge(application.eligibility_status)}
                                    </div>
                                    {application.eligibility_remarks && (
                                        <div>
                                            <span className="text-gray-600 dark:text-gray-400">Eligibility Remarks</span>
                                            <p className="mt-1 text-gray-900 dark:text-white">{application.eligibility_remarks}</p>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 dark:text-gray-400">Housing Program</span>
                                        <span className="font-semibold text-gray-900 dark:text-white">
                                            {application.housing_program.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 dark:text-gray-400">Submitted At</span>
                                        <span className="font-semibold text-gray-900 dark:text-white">
                                            {formatDate(application.submitted_at)}
                                        </span>
                                    </div>
                                </div>
                            </section>

                            {/* Beneficiary Information */}
                            <section className="bg-white dark:bg-dark-surface shadow-lg p-6 rounded-lg">
                                <h2 className="flex items-center gap-2 mb-4 font-semibold text-gray-900 dark:text-white text-xl">
                                    <User size={20} />
                                    Beneficiary Information
                                </h2>
                                <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                                    <div>
                                        <p className="mb-1 text-gray-500 dark:text-gray-400 text-sm">Beneficiary Number</p>
                                        <p className="font-mono font-medium text-gray-900 dark:text-white">
                                            {application.beneficiary.beneficiary_no}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="mb-1 text-gray-500 dark:text-gray-400 text-sm">Full Name</p>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {application.beneficiary.first_name} {application.beneficiary.middle_name} {application.beneficiary.last_name}
                                        </p>
                                    </div>
                                    {application.beneficiary.email && (
                                        <div>
                                            <p className="mb-1 text-gray-500 dark:text-gray-400 text-sm">Email</p>
                                            <p className="flex items-center gap-2 font-medium text-gray-900 dark:text-white">
                                                <Mail size={16} />
                                                {application.beneficiary.email}
                                            </p>
                                        </div>
                                    )}
                                    {application.beneficiary.contact_number && (
                                        <div>
                                            <p className="mb-1 text-gray-500 dark:text-gray-400 text-sm">Contact Number</p>
                                            <p className="flex items-center gap-2 font-medium text-gray-900 dark:text-white">
                                                <Phone size={16} />
                                                {application.beneficiary.contact_number}
                                            </p>
                                        </div>
                                    )}
                                    {application.beneficiary.current_address && (
                                        <div className="md:col-span-2">
                                            <p className="mb-1 text-gray-500 dark:text-gray-400 text-sm">Address</p>
                                            <p className="flex items-center gap-2 font-medium text-gray-900 dark:text-white">
                                                <MapPin size={16} />
                                                {application.beneficiary.current_address}
                                                {application.beneficiary.barangay && `, ${application.beneficiary.barangay}`}
                                            </p>
                                        </div>
                                    )}
                                    {application.beneficiary.priority_status !== 'none' && (
                                        <div>
                                            <p className="mb-1 text-gray-500 dark:text-gray-400 text-sm">Priority Status</p>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {application.beneficiary.priority_status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Application Reason */}
                            <section className="bg-white dark:bg-dark-surface shadow-lg p-6 rounded-lg">
                                <h2 className="mb-4 font-semibold text-gray-900 dark:text-white text-xl">
                                    Application Reason
                                </h2>
                                <p className="text-gray-700 dark:text-gray-300">
                                    {application.application_reason}
                                </p>
                            </section>

                            {/* Site Visits */}
                            {application.site_visits && application.site_visits.length > 0 && (
                                <section className="bg-white dark:bg-dark-surface shadow-lg p-6 rounded-lg">
                                    <h2 className="flex items-center gap-2 mb-4 font-semibold text-gray-900 dark:text-white text-xl">
                                        <Calendar size={20} />
                                        Site Visits
                                    </h2>
                                    <div className="space-y-3">
                                        {application.site_visits.map((visit) => (
                                            <div key={visit.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white">
                                                            Scheduled: {formatDate(visit.scheduled_date)}
                                                        </p>
                                                        {visit.visit_date && (
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                Visited: {formatDate(visit.visit_date)}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                                                        {visit.status}
                                                    </span>
                                                </div>
                                                {visit.findings && (
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                                        {visit.findings}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Waitlist Information */}
                            {application.waitlist && (
                                <section className="bg-white dark:bg-dark-surface shadow-lg p-6 rounded-lg">
                                    <h2 className="flex items-center gap-2 mb-4 font-semibold text-gray-900 dark:text-white text-xl">
                                        <List size={20} />
                                        Waitlist Information
                                    </h2>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600 dark:text-gray-400">Queue Position</span>
                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                #{application.waitlist.queue_position}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600 dark:text-gray-400">Priority Score</span>
                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                {application.waitlist.priority_score}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600 dark:text-gray-400">Waitlist Date</span>
                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                {formatDate(application.waitlist.waitlist_date)}
                                            </span>
                                        </div>
                                    </div>
                                </section>
                            )}

                            {/* Allocation Information */}
                            {application.allocation && (
                                <section className="bg-white dark:bg-dark-surface shadow-lg p-6 rounded-lg">
                                    <h2 className="flex items-center gap-2 mb-4 font-semibold text-gray-900 dark:text-white text-xl">
                                        <Home size={20} />
                                        Allocation Information
                                    </h2>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600 dark:text-gray-400">Allocation Number</span>
                                            <span className="font-mono font-semibold text-gray-900 dark:text-white">
                                                {application.allocation.allocation_no}
                                            </span>
                                        </div>
                                        {application.allocation.unit && (
                                            <div>
                                                <p className="mb-1 text-gray-600 dark:text-gray-400">Unit</p>
                                                <p className="font-semibold text-gray-900 dark:text-white">
                                                    {application.allocation.unit.unit_no} - {application.allocation.unit.project.project_name}
                                                </p>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600 dark:text-gray-400">Allocation Date</span>
                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                {formatDate(application.allocation.allocation_date)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600 dark:text-gray-400">Status</span>
                                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                                                {application.allocation.allocation_status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                            </span>
                                        </div>
                                    </div>
                                </section>
                            )}

                            {/* Documents Section */}
                            <section className="bg-white dark:bg-dark-surface shadow-lg p-6 rounded-lg">
                                <h2 className="flex items-center gap-2 mb-4 font-semibold text-gray-900 dark:text-white text-xl">
                                    <FileText size={20} />
                                    Documents
                                </h2>
                                {application.documents.length === 0 ? (
                                    <p className="text-gray-600 dark:text-gray-400">No documents uploaded yet.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {application.documents.map((doc) => (
                                            <div
                                                key={doc.id}
                                                className={`p-4 border rounded-lg ${
                                                    doc.verification_status === 'verified'
                                                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                                        : doc.verification_status === 'invalid'
                                                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                                        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-bg'
                                                }`}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <FileText size={18} className="text-gray-400" />
                                                            <h3 className="font-medium text-gray-900 dark:text-white">
                                                                {doc.document_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                            </h3>
                                                        </div>
                                                        {doc.file_name && (
                                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                                                {doc.file_name}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 ml-4">
                                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                                            doc.verification_status === 'verified'
                                                                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                                                : doc.verification_status === 'invalid'
                                                                ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                                                                : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                                                        }`}>
                                                            {doc.verification_status}
                                                        </span>
                                                        {doc.url && (
                                                            <a
                                                                href={doc.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline text-sm"
                                                            >
                                                                <Eye size={16} />
                                                                View
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Application Info */}
                            <section className="bg-white dark:bg-dark-surface shadow-lg p-6 rounded-lg">
                                <h2 className="mb-4 font-semibold text-gray-900 dark:text-white text-xl">
                                    Application Information
                                </h2>
                                <div className="space-y-3">
                                    <div>
                                        <p className="mb-1 text-gray-500 dark:text-gray-400 text-sm">Application Number</p>
                                        <p className="font-mono font-medium text-gray-900 dark:text-white">
                                            {application.application_no}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="mb-1 text-gray-500 dark:text-gray-400 text-sm">Housing Program</p>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {application.housing_program.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="mb-1 text-gray-500 dark:text-gray-400 text-sm">Submitted At</p>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {formatDate(application.submitted_at)}
                                        </p>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
