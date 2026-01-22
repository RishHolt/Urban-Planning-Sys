import { Link, usePage } from '@inertiajs/react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Button from '../../components/Button';
import StatusBadge from '../../components/StatusBadge';
import StatusHistory from '../../components/StatusHistory';
import { ArrowLeft, CheckCircle, XCircle, Clock, FileText, Eye, Download, MapPin, Building, User, Mail, Phone } from 'lucide-react';

interface Document {
    id: number;
    file_name: string;
    file_path: string;
    file_type?: string;
    file_size?: number;
    uploaded_at: string;
}

interface History {
    id: number;
    status: string;
    remarks: string | null;
    updated_by?: number;
    updated_at: string;
}

interface Application {
    id: number;
    reference_no: string;
    application_category: string;
    status: string;
    denial_reason?: string | null;
    assessed_fee?: number | null;
    applicant_type: string;
    contact_number: string;
    contact_email?: string | null;
    tax_dec_ref_no: string;
    barangay_permit_ref_no: string;
    pin_lat: number;
    pin_lng: number;
    lot_address: string;
    province?: string | null;
    municipality?: string | null;
    barangay?: string | null;
    street_name?: string | null;
    lot_owner: string;
    lot_area_total: number;
    is_subdivision: boolean;
    subdivision_name?: string | null;
    block_no?: string | null;
    lot_no?: string | null;
    land_use_type: string;
    project_type: string;
    building_type?: string | null;
    project_description: string;
    purpose: string;
    documents: Document[];
    history: History[];
    submitted_at: string | null;
    created_at: string;
}

interface ApplicationDetailsProps {
    application: Application;
}

export default function ApplicationDetails({ application }: ApplicationDetailsProps) {
    const { flash } = usePage<{ flash?: { success?: string; error?: string } }>().props;

    const formatFileSize = (bytes: number | null | undefined): string => {
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
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'approved':
                return 'success';
            case 'denied':
                return 'danger';
            case 'under_review':
            case 'for_inspection':
                return 'warning';
            default:
                return 'secondary';
        }
    };

    return (
        <div className="flex flex-col bg-background dark:bg-dark-bg w-full min-h-dvh transition-colors">
            <Header />
            <main className="flex-1 mt-16 py-8 md:py-12">
                <div className="mx-auto px-4 max-w-7xl">
                    <div className="mb-6">
                        <Link href="/clearance-applications">
                            <Button variant="secondary" size="sm" className="flex items-center gap-2">
                                <ArrowLeft size={18} />
                                Return to Application List
                            </Button>
                        </Link>
                    </div>

                    {/* Flash Messages */}
                    {flash?.success && (
                        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-800 dark:text-green-200">
                            {flash.success}
                        </div>
                    )}
                    {flash?.error && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200">
                            {flash.error}
                        </div>
                    )}

                    {/* Header */}
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="mb-2 font-bold text-gray-900 dark:text-white text-3xl">
                                Application Details
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Reference Number: <span className="font-mono font-semibold">{application.reference_no}</span>
                            </p>
                        </div>
                        <StatusBadge status={application.status} variant={getStatusBadgeVariant(application.status)} />
                    </div>

                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Application Information */}
                            <section className="bg-white dark:bg-dark-surface shadow-lg p-6 rounded-lg">
                                <h2 className="flex items-center gap-2 mb-4 font-semibold text-gray-900 dark:text-white text-xl">
                                    <Building size={20} />
                                    Application Information
                                </h2>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Category
                                        </label>
                                        <p className="text-gray-900 dark:text-white capitalize">
                                            {application.application_category.replace('_', ' ')}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Applicant Type
                                        </label>
                                        <p className="text-gray-900 dark:text-white capitalize">
                                            {application.applicant_type.replace('_', ' ')}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Land Use Type
                                        </label>
                                        <p className="text-gray-900 dark:text-white capitalize">
                                            {application.land_use_type.replace('_', ' ')}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Project Type
                                        </label>
                                        <p className="text-gray-900 dark:text-white capitalize">
                                            {application.project_type.replace('_', ' ')}
                                        </p>
                                    </div>
                                    {application.building_type && (
                                        <div>
                                            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Building Type
                                            </label>
                                            <p className="text-gray-900 dark:text-white">{application.building_type}</p>
                                        </div>
                                    )}
                                    <div>
                                        <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Lot Area
                                        </label>
                                        <p className="text-gray-900 dark:text-white">
                                            {application.lot_area_total.toLocaleString()} sqm
                                        </p>
                                    </div>
                                </div>
                                {application.project_description && (
                                    <div className="mt-4">
                                        <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Project Description
                                        </label>
                                        <p className="text-gray-900 dark:text-white">{application.project_description}</p>
                                    </div>
                                )}
                                {application.purpose && (
                                    <div className="mt-4">
                                        <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Purpose
                                        </label>
                                        <p className="text-gray-900 dark:text-white">{application.purpose}</p>
                                    </div>
                                )}
                            </section>

                            {/* Property Location */}
                            <section className="bg-white dark:bg-dark-surface shadow-lg p-6 rounded-lg">
                                <h2 className="flex items-center gap-2 mb-4 font-semibold text-gray-900 dark:text-white text-xl">
                                    <MapPin size={20} />
                                    Property Location
                                </h2>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Address
                                        </label>
                                        <p className="text-gray-900 dark:text-white">{application.lot_address}</p>
                                    </div>
                                    {(application.province || application.municipality || application.barangay) && (
                                        <div className="grid gap-3 md:grid-cols-3">
                                            {application.province && (
                                                <div>
                                                    <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Province
                                                    </label>
                                                    <p className="text-gray-900 dark:text-white">{application.province}</p>
                                                </div>
                                            )}
                                            {application.municipality && (
                                                <div>
                                                    <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Municipality
                                                    </label>
                                                    <p className="text-gray-900 dark:text-white">{application.municipality}</p>
                                                </div>
                                            )}
                                            {application.barangay && (
                                                <div>
                                                    <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Barangay
                                                    </label>
                                                    <p className="text-gray-900 dark:text-white">{application.barangay}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {application.street_name && (
                                        <div>
                                            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Street Name
                                            </label>
                                            <p className="text-gray-900 dark:text-white">{application.street_name}</p>
                                        </div>
                                    )}
                                    <div>
                                        <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Coordinates
                                        </label>
                                        <p className="text-gray-900 dark:text-white font-mono text-sm">
                                            {application.pin_lat.toFixed(6)}, {application.pin_lng.toFixed(6)}
                                        </p>
                                    </div>
                                    {application.is_subdivision && (
                                        <div className="grid gap-3 md:grid-cols-3">
                                            {application.subdivision_name && (
                                                <div>
                                                    <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Subdivision Name
                                                    </label>
                                                    <p className="text-gray-900 dark:text-white">{application.subdivision_name}</p>
                                                </div>
                                            )}
                                            {application.block_no && (
                                                <div>
                                                    <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Block No.
                                                    </label>
                                                    <p className="text-gray-900 dark:text-white">{application.block_no}</p>
                                                </div>
                                            )}
                                            {application.lot_no && (
                                                <div>
                                                    <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Lot No.
                                                    </label>
                                                    <p className="text-gray-900 dark:text-white">{application.lot_no}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
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
                                                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-start gap-3 flex-1">
                                                        <FileText size={20} className="text-gray-400 mt-1 flex-shrink-0" />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-medium text-gray-900 dark:text-white mb-1">
                                                                {doc.file_name}
                                                            </p>
                                                            <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
                                                                {doc.file_type && (
                                                                    <span className="capitalize">{doc.file_type}</span>
                                                                )}
                                                                {doc.file_size && (
                                                                    <span>• {formatFileSize(doc.file_size)}</span>
                                                                )}
                                                                <span>• Uploaded {formatDate(doc.uploaded_at)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 ml-4">
                                                        {doc.file_path && (
                                                            <a
                                                                href={`/storage/${doc.file_path}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                                title="View document"
                                                            >
                                                                <Eye size={18} />
                                                            </a>
                                                        )}
                                                        {doc.file_path && (
                                                            <a
                                                                href={`/storage/${doc.file_path}`}
                                                                download
                                                                className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                                title="Download document"
                                                            >
                                                                <Download size={18} />
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>

                            {/* Status History */}
                            {application.history && application.history.length > 0 && (
                                <section className="bg-white dark:bg-dark-surface shadow-lg p-6 rounded-lg">
                                    <h2 className="flex items-center gap-2 mb-4 font-semibold text-gray-900 dark:text-white text-xl">
                                        <Clock size={20} />
                                        Status History
                                    </h2>
                                    <StatusHistory
                                        history={application.history.map((h) => ({
                                            id: h.id,
                                            statusFrom: null,
                                            statusTo: h.status,
                                            changedBy: h.updated_by,
                                            notes: h.remarks,
                                            createdAt: h.updated_at,
                                        }))}
                                    />
                                </section>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Contact Information */}
                            <section className="bg-white dark:bg-dark-surface shadow-lg p-6 rounded-lg">
                                <h2 className="flex items-center gap-2 mb-4 font-semibold text-gray-900 dark:text-white text-lg">
                                    <User size={18} />
                                    Contact Information
                                </h2>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                                            Contact Number
                                        </label>
                                        <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                                            <Phone size={14} />
                                            <span>{application.contact_number}</span>
                                        </div>
                                    </div>
                                    {application.contact_email && (
                                        <div>
                                            <label className="block mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                                                Email
                                            </label>
                                            <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                                                <Mail size={14} />
                                                <span>{application.contact_email}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Application Timeline */}
                            <section className="bg-white dark:bg-dark-surface shadow-lg p-6 rounded-lg">
                                <h2 className="flex items-center gap-2 mb-4 font-semibold text-gray-900 dark:text-white text-lg">
                                    <Clock size={18} />
                                    Timeline
                                </h2>
                                <div className="space-y-3 text-sm">
                                    <div>
                                        <label className="block mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                                            Created
                                        </label>
                                        <p className="text-gray-900 dark:text-white">{formatDate(application.created_at)}</p>
                                    </div>
                                    {application.submitted_at && (
                                        <div>
                                            <label className="block mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                                                Submitted
                                            </label>
                                            <p className="text-gray-900 dark:text-white">{formatDate(application.submitted_at)}</p>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Denial Reason */}
                            {application.denial_reason && (
                                <section className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 shadow-lg p-6 rounded-lg">
                                    <h2 className="flex items-center gap-2 mb-4 font-semibold text-red-900 dark:text-red-200 text-lg">
                                        <XCircle size={18} />
                                        Denial Reason
                                    </h2>
                                    <p className="text-red-800 dark:text-red-200">{application.denial_reason}</p>
                                </section>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
