import { Link, usePage } from '@inertiajs/react';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import Button from '../../../components/Button';
import StatusBadge from '../../../components/StatusBadge';
import StatusHistory from '../../../components/StatusHistory';
import { ArrowLeft, CheckCircle, XCircle, Clock, User, Mail, Phone, MapPin, FileText, Eye, Download } from 'lucide-react';

interface Document {
    id: number;
    documentType: string;
    type: 'upload' | 'manual' | null;
    manualId: string | null;
    fileName: string | null;
    fileSize: number | null;
    mimeType: string | null;
    url: string | null;
    status?: 'pending' | 'approved' | 'rejected';
    version?: number;
}

interface ApplicationDetailsProps {
    application: {
        id: string;
        applicationNumber: string;
        applicationType: string;
        status: 'pending' | 'in_review' | 'approved' | 'rejected';
        submittedAt: string | null;
        createdAt: string;
        updatedAt: string;
        beneficiary: any;
        household: any;
        applicationNotes: string | null;
        rejectionReason: string | null;
        documents: Document[];
        statusHistory: Array<{
            id: number;
            statusFrom: string | null;
            statusTo: string;
            changedBy: number;
            notes: string | null;
            createdAt: string;
        }>;
    };
}

export default function ApplicationDetails({ application }: ApplicationDetailsProps) {
    const { flash } = usePage<{ flash?: { success?: string; error?: string } }>().props;

    const getStatusIcon = (status: ApplicationDetailsProps['application']['status']) => {
        switch (status) {
            case 'approved':
                return <CheckCircle size={20} className="text-green-500" />;
            case 'rejected':
                return <XCircle size={20} className="text-red-500" />;
            case 'in_review':
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
                                {application.applicationNumber}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            {getStatusIcon(application.status)}
                            <StatusBadge status={application.status as 'pending' | 'in_review' | 'approved' | 'rejected'} />
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
                            {/* Beneficiary/Household Information */}
                            <section className="bg-white dark:bg-dark-surface shadow-lg p-6 rounded-lg">
                                <h2 className="flex items-center gap-2 mb-4 font-semibold text-gray-900 dark:text-white text-xl">
                                    <User size={20} />
                                    {application.applicationType === 'Individual' ? 'Beneficiary Information' : 'Household Information'}
                                </h2>
                                {application.beneficiary && (
                                    <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                                        <div>
                                            <p className="mb-1 text-gray-500 dark:text-gray-400 text-sm">Full Name</p>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {application.beneficiary.first_name} {application.beneficiary.middle_name} {application.beneficiary.last_name} {application.beneficiary.suffix || ''}
                                            </p>
                                        </div>
                                        {application.beneficiary.birth_date && (
                                            <div>
                                                <p className="mb-1 text-gray-500 dark:text-gray-400 text-sm">Birth Date</p>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {formatDate(application.beneficiary.birth_date)}
                                                </p>
                                            </div>
                                        )}
                                        {application.beneficiary.email && (
                                            <div>
                                                <p className="mb-1 text-gray-500 dark:text-gray-400 text-sm">Email</p>
                                                <p className="flex items-center gap-2 font-medium text-gray-900 dark:text-white">
                                                    <Mail size={16} />
                                                    {application.beneficiary.email}
                                                </p>
                                            </div>
                                        )}
                                        {application.beneficiary.mobile_number && (
                                            <div>
                                                <p className="mb-1 text-gray-500 dark:text-gray-400 text-sm">Contact Number</p>
                                                <p className="flex items-center gap-2 font-medium text-gray-900 dark:text-white">
                                                    <Phone size={16} />
                                                    {application.beneficiary.mobile_number}
                                                </p>
                                            </div>
                                        )}
                                        {application.beneficiary.address && (
                                            <div className="md:col-span-2">
                                                <p className="mb-1 text-gray-500 dark:text-gray-400 text-sm">Address</p>
                                                <p className="flex items-center gap-2 font-medium text-gray-900 dark:text-white">
                                                    <MapPin size={16} />
                                                    {application.beneficiary.address}
                                                    {application.beneficiary.barangay && `, ${application.beneficiary.barangay}`}
                                                    {application.beneficiary.city && `, ${application.beneficiary.city}`}
                                                    {application.beneficiary.province && `, ${application.beneficiary.province}`}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {application.household && (
                                    <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                                        <div>
                                            <p className="mb-1 text-gray-500 dark:text-gray-400 text-sm">Household Name</p>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {application.household.household_name || application.household.household_number}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="mb-1 text-gray-500 dark:text-gray-400 text-sm">Household Size</p>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {application.household.household_size} members
                                            </p>
                                        </div>
                                        {application.household.primary_contact_mobile && (
                                            <div>
                                                <p className="mb-1 text-gray-500 dark:text-gray-400 text-sm">Contact Number</p>
                                                <p className="flex items-center gap-2 font-medium text-gray-900 dark:text-white">
                                                    <Phone size={16} />
                                                    {application.household.primary_contact_mobile}
                                                </p>
                                            </div>
                                        )}
                                        {application.household.address && (
                                            <div className="md:col-span-2">
                                                <p className="mb-1 text-gray-500 dark:text-gray-400 text-sm">Address</p>
                                                <p className="flex items-center gap-2 font-medium text-gray-900 dark:text-white">
                                                    <MapPin size={16} />
                                                    {application.household.address}
                                                    {application.household.barangay && `, ${application.household.barangay}`}
                                                    {application.household.city && `, ${application.household.city}`}
                                                    {application.household.province && `, ${application.household.province}`}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </section>

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
                                                    doc.status === 'approved'
                                                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                                        : doc.status === 'rejected'
                                                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                                        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-bg'
                                                }`}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <FileText size={18} className="text-gray-400" />
                                                            <h3 className="font-medium text-gray-900 dark:text-white">
                                                                {doc.documentType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                            </h3>
                                                            {doc.version && doc.version > 1 && (
                                                                <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                                                                    v{doc.version}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {doc.fileName && (
                                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                                                {doc.fileName}
                                                            </p>
                                                        )}
                                                        {doc.fileSize && (
                                                            <p className="text-xs text-gray-500 dark:text-gray-500">
                                                                {formatFileSize(doc.fileSize)}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 ml-4">
                                                        <StatusBadge 
                                                            status={doc.status as 'pending' | 'approved' | 'rejected'} 
                                                            showIcon={false}
                                                        />
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

                            {/* Application Notes */}
                            {application.applicationNotes && (
                                <section className="bg-white dark:bg-dark-surface shadow-lg p-6 rounded-lg">
                                    <h2 className="mb-4 font-semibold text-gray-900 dark:text-white text-xl">
                                        Application Notes
                                    </h2>
                                    <p className="text-gray-700 dark:text-gray-300">
                                        {application.applicationNotes}
                                    </p>
                                </section>
                            )}

                            {/* Rejection Reason */}
                            {application.rejectionReason && (
                                <section className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 shadow-lg p-6 rounded-lg">
                                    <h2 className="mb-4 font-semibold text-red-800 dark:text-red-200 text-xl">
                                        Rejection Reason
                                    </h2>
                                    <p className="text-red-700 dark:text-red-300">
                                        {application.rejectionReason}
                                    </p>
                                </section>
                            )}
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
                                        <p className="mb-1 text-gray-500 dark:text-gray-400 text-sm">Application Type</p>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {application.applicationType}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="mb-1 text-gray-500 dark:text-gray-400 text-sm">Submitted At</p>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {application.submittedAt ? formatDate(application.submittedAt) : 'Not submitted'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="mb-1 text-gray-500 dark:text-gray-400 text-sm">Created At</p>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {formatDate(application.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Status History */}
                            <StatusHistory 
                                history={application.statusHistory.map(h => ({
                                    id: h.id,
                                    statusFrom: h.statusFrom,
                                    statusTo: h.statusTo,
                                    changedBy: h.changedBy,
                                    notes: h.notes,
                                    createdAt: h.createdAt,
                                }))} 
                            />
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
