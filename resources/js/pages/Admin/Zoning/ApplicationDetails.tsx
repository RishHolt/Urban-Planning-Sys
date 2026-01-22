import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import AdminLayout from '../../../components/AdminLayout';
import Button from '../../../components/Button';
import AdminDocumentViewerModal from '../../../components/AdminDocumentViewerModal';
import VersionHistoryModal from '../../../components/VersionHistoryModal';
import StatusHistory from '../../../components/StatusHistory';
import RequiredDocumentCard from '../../../components/RequiredDocumentCard';
import AdditionalDocumentCard from '../../../components/AdditionalDocumentCard';
import StatusBadge from '../../../components/StatusBadge';
import { showDocumentApproved, showDocumentRejected, showError, showNotesRequired } from '../../../lib/swal';
import {
    ArrowLeft,
    FileText,
    CheckCircle,
    Clock,
    XCircle,
    MapPin,
    Building,
    User,
    Mail,
    Phone,
    Download,
    Eye,
    File,
} from 'lucide-react';

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

interface StatusHistory {
    id: number;
    statusFrom: string | null;
    statusTo: string;
    changedBy: number;
    notes: string | null;
    createdAt: string;
}

interface Application {
    id: string;
    applicationNumber: string;
    status: 'pending' | 'in_review' | 'approved' | 'rejected';
    submittedAt: string;
    createdAt: string;
    updatedAt: string;
    projectType: string;
    landType: string;
    proposedUse: string;
    applicantType: string;
    data: Record<string, unknown>;
    documents: Document[];
    statusHistory: StatusHistory[];
}

interface ApplicationDetailsProps {
    application: Application;
}

export default function ApplicationDetails({ application }: ApplicationDetailsProps) {
    const { flash } = usePage<{ flash?: { success?: string; error?: string } }>().props;
    const [viewingDocument, setViewingDocument] = useState<{
        url: string;
        fileName: string;
        mimeType?: string;
        documentId: number;
        documentStatus?: 'pending' | 'approved' | 'rejected';
        version?: number;
        documentType?: string;
    } | null>(null);
    const [versionHistory, setVersionHistory] = useState<{
        isOpen: boolean;
        documentId: number;
        documentType: string;
        versions: Array<{
            id: number;
            version: number;
            fileName: string;
            fileSize: number | null;
            status: string;
            url: string | null;
            mimeType: string | null;
            isCurrent: boolean;
            reviewedAt: string | null;
            notes: string | null;
            createdAt: string | null;
        }>;
    } | null>(null);

    const [processing, setProcessing] = useState(false);

    const handleViewDocument = (url: string, fileName: string, mimeType: string | undefined, documentId: number, documentStatus?: 'pending' | 'approved' | 'rejected', version?: number, documentType?: string): void => {
        setViewingDocument({ url, fileName, mimeType, documentId, documentStatus, version, documentType });
    };

    const handleViewVersionHistory = async (documentId: number, documentType: string) => {
        try {
            const response = await fetch(`/admin/zoning/applications/${application.id}/documents/${documentId}/versions`, {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                credentials: 'include',
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Version history data:', data);
            
            if (data.versions && Array.isArray(data.versions)) {
                setVersionHistory({
                    isOpen: true,
                    documentId,
                    documentType: data.documentType || documentType,
                    versions: data.versions,
                });
            } else {
                console.error('Invalid version history data:', data);
                await showError('Failed to load version history. Invalid data received.');
            }
        } catch (error) {
            console.error('Error fetching version history:', error);
            await showError('Failed to load version history. Please try again.');
        }
    };

    const handleDocumentApprove = (documentId: number, notes: string): void => {
        router.patch(`/admin/zoning/applications/${application.id}/documents/${documentId}/approve`, {
            notes: notes || '',
        }, {
            preserveScroll: true,
            onSuccess: async () => {
                await showDocumentApproved();
                router.reload({ only: ['application'] });
                setViewingDocument(null);
            },
            onError: (errors) => {
                console.error('Error approving document:', errors);
                showError(
                    errors?.notes 
                        ? (Array.isArray(errors.notes) ? errors.notes[0] : errors.notes)
                        : 'An error occurred while approving the document. Please try again.'
                );
            },
        });
    };

    const handleDocumentReject = (documentId: number, notes: string): void => {
        const trimmedNotes = notes?.trim() || '';
        
        if (!trimmedNotes) {
            console.error('Notes are required for rejection');
            showNotesRequired();
            return;
        }

        router.patch(`/admin/zoning/applications/${application.id}/documents/${documentId}/reject`, {
            notes: trimmedNotes,
        }, {
            preserveScroll: true,
            onSuccess: async () => {
                await showDocumentRejected();
                router.reload({ only: ['application'] });
                setViewingDocument(null);
            },
            onError: (errors) => {
                console.error('Error rejecting document:', errors);
                showError(
                    errors?.notes 
                        ? (Array.isArray(errors.notes) ? errors.notes[0] : errors.notes)
                        : 'An error occurred while rejecting the document. Please try again.'
                );
            },
        });
    };



    const getDocumentStatusColor = (status?: 'pending' | 'approved' | 'rejected', version?: number): string => {
        // Yellow for pending documents (new versions)
        if (status === 'pending' && version && version > 1) {
            return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
        }
        switch (status) {
            case 'approved':
                return 'border-green-500 bg-green-50 dark:bg-green-900/20';
            case 'rejected':
                return 'border-red-500 bg-red-50 dark:bg-red-900/20';
            default:
                return 'border-gray-200 dark:border-gray-700';
        }
    };

    const canViewFile = (url: string | null, mimeType?: string): boolean => {
        if (!url) {
            return false;
        }
        const type = mimeType || '';
        return type.startsWith('image/') || type === 'application/pdf';
    };

    const formatFileSize = (bytes: number | null): string => {
        if (!bytes) {
            return 'N/A';
        }
        if (bytes < 1024) {
            return `${bytes} B`;
        }
        if (bytes < 1024 * 1024) {
            return `${(bytes / 1024).toFixed(2)} KB`;
        }
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    };

    const getDocumentByType = (documentType: string): Document | undefined => {
        return application.documents.find((doc) => doc.documentType === documentType);
    };

    const getDocumentDisplayName = (documentType: string, version?: number): string => {
        const typeNames: Record<string, string> = {
            'authorization_letter': 'Authorization Letter',
            'proof_of_ownership': 'Proof of Ownership',
            'tax_declaration': 'Tax Declaration',
            'site_development_plan': 'Site Development Plan',
            'location_map': 'Location Map / Vicinity Map',
            'vicinity_map': 'Vicinity Map',
            'barangay_clearance': 'Barangay Clearance',
            'letter_of_intent': 'Letter of Intent',
            'proof_of_legal_authority': 'Proof of Legal Authority',
            'endorsements_approvals': 'Endorsements / Approvals',
            'environmental_compliance': 'Environmental Compliance Certificate',
            'signature': 'Digital Signature',
            'existing_building_photos': 'Existing Building Photos',
            'other_documents': 'Other Documents',
            'requested_documents': 'Requested Documents',
        };
        const baseName = typeNames[documentType] || documentType.replace(/_/g, ' ');
        return version && version > 1 ? `${baseName} Version-${version}` : baseName;
    };

    const appData = application.data;

    // Helper function to safely get string value from unknown
    const getStringValue = (value: unknown): string => {
        if (value == null) {
            return '';
        }
        return String(value);
    };

    // Helper function to check if value exists
    const hasValue = (value: unknown): boolean => {
        return value != null && value !== '';
    };

    return (
        <AdminLayout
            title="Application Details"
            description={application.applicationNumber}
            backButton={{
                href: '/admin/zoning/applications',
                label: 'Back to Applications',
            }}
        >
            <div className="flex justify-end items-center mb-6">
                <StatusBadge status={application.status} />
            </div>

                    {/* Success/Error Messages */}
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
                            {/* Applicant Information */}
                            <section className="bg-white dark:bg-dark-surface shadow-lg p-6 rounded-lg">
                                <h2 className="flex items-center gap-2 mb-4 font-semibold text-gray-900 dark:text-white text-xl">
                                    <User size={20} />
                                    Applicant Information
                                </h2>
                                <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                                    <div>
                                        <label className="block mb-1 font-medium text-gray-500 dark:text-gray-400 text-sm">
                                            Applicant Type
                                        </label>
                                        <p className="font-medium text-gray-900 dark:text-white">{application.applicantType}</p>
                                    </div>
                                    {hasValue(appData.applicant_name) && (
                                        <div>
                                            <label className="block mb-1 font-medium text-gray-500 dark:text-gray-400 text-sm">
                                                Full Name
                                            </label>
                                            <p className="font-medium text-gray-900 dark:text-white">{getStringValue(appData.applicant_name)}</p>
                                        </div>
                                    )}
                                    {hasValue(appData.company_name) && (
                                        <div>
                                            <label className="block mb-1 font-medium text-gray-500 dark:text-gray-400 text-sm">
                                                Company Name
                                            </label>
                                            <p className="font-medium text-gray-900 dark:text-white">{getStringValue(appData.company_name)}</p>
                                        </div>
                                    )}
                                    {hasValue(appData.sec_dti_reg_no) && (
                                        <div>
                                            <label className="block mb-1 font-medium text-gray-500 dark:text-gray-400 text-sm">
                                                SEC/DTI Registration No.
                                            </label>
                                            <p className="font-medium text-gray-900 dark:text-white">{getStringValue(appData.sec_dti_reg_no)}</p>
                                        </div>
                                    )}
                                    {hasValue(appData.authorized_representative) && (
                                        <div>
                                            <label className="block mb-1 font-medium text-gray-500 dark:text-gray-400 text-sm">
                                                Authorized Representative
                                            </label>
                                            <p className="font-medium text-gray-900 dark:text-white">{getStringValue(appData.authorized_representative)}</p>
                                        </div>
                                    )}
                                    <div>
                                        <label className="block mb-1 font-medium text-gray-500 dark:text-gray-400 text-sm">
                                            Email
                                        </label>
                                        <p className="flex items-center gap-2 font-medium text-gray-900 dark:text-white">
                                            <Mail size={16} />
                                            {getStringValue(appData.applicant_email)}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block mb-1 font-medium text-gray-500 dark:text-gray-400 text-sm">
                                            Contact Number
                                        </label>
                                        <p className="flex items-center gap-2 font-medium text-gray-900 dark:text-white">
                                            <Phone size={16} />
                                            {getStringValue(appData.applicant_contact)}
                                        </p>
                                    </div>
                                    {hasValue(appData.valid_id_path) && hasValue(appData.valid_id_path_url) && (
                                        <div className="md:col-span-2">
                                            <label className="block mb-1 font-medium text-gray-500 dark:text-gray-400 text-sm">
                                                Valid ID
                                            </label>
                                            <div className="flex items-center gap-3">
                                                {canViewFile(getStringValue(appData.valid_id_path_url)) && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleViewDocument(
                                                            getStringValue(appData.valid_id_path_url),
                                                            'Valid ID',
                                                            undefined,
                                                            0, // Valid ID is not in documents table, so no documentId
                                                            undefined // No status for Valid ID
                                                        )}
                                                        className="flex items-center gap-2 text-primary hover:text-primary/80"
                                                    >
                                                        <Eye size={16} />
                                                        View
                                                    </button>
                                                )}
                                                <a
                                                    href={getStringValue(appData.valid_id_path_url)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    download
                                                    className="flex items-center gap-2 text-primary hover:text-primary/80"
                                                >
                                                    <Download size={16} />
                                                    Download Valid ID
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                    {(() => {
                                        const doc = getDocumentByType('authorization_letter');
                                        return doc && doc.url ? (
                                            <div className="md:col-span-2">
                                                <label className="block mb-1 font-medium text-gray-500 dark:text-gray-400 text-sm">
                                                    Authorization Letter
                                                </label>
                                                <div className="flex items-center gap-3">
                                                    {canViewFile(doc.url, doc.mimeType || undefined) && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleViewDocument(
                                                                doc.url!,
                                                                doc.fileName || getDocumentDisplayName(doc.documentType, doc.version),
                                                                doc.mimeType || undefined,
                                                                doc.id,
                                                                doc.status,
                                                                doc.version,
                                                                doc.documentType
                                                            )}
                                                            className="flex items-center gap-2 text-primary hover:text-primary/80"
                                                        >
                                                            <Eye size={16} />
                                                            View
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ) : null;
                                    })()}
                                </div>
                            </section>

                            {/* Property Owner Information - Only for non-Government applicants */}
                            {application.applicantType !== 'Government' && (
                                <section className="bg-white dark:bg-dark-surface shadow-lg p-6 rounded-lg">
                                    <h2 className="flex items-center gap-2 mb-4 font-semibold text-gray-900 dark:text-white text-xl">
                                        <Building size={20} />
                                        Property Owner Information
                                    </h2>
                                    <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                                    {hasValue(appData.owner_name) && (
                                        <div>
                                            <label className="block mb-1 font-medium text-gray-500 dark:text-gray-400 text-sm">
                                                Owner Name
                                            </label>
                                            <p className="font-medium text-gray-900 dark:text-white">{getStringValue(appData.owner_name)}</p>
                                        </div>
                                    )}
                                    {hasValue(appData.owner_contact) && (
                                        <div>
                                            <label className="block mb-1 font-medium text-gray-500 dark:text-gray-400 text-sm">
                                                Contact Number
                                            </label>
                                            <p className="font-medium text-gray-900 dark:text-white">{getStringValue(appData.owner_contact)}</p>
                                        </div>
                                    )}
                                    {hasValue(appData.owner_address) && (
                                        <div className="md:col-span-2">
                                            <label className="block mb-1 font-medium text-gray-500 dark:text-gray-400 text-sm">
                                                Address
                                            </label>
                                            <p className="font-medium text-gray-900 dark:text-white">{getStringValue(appData.owner_address)}</p>
                                        </div>
                                    )}
                                        {(() => {
                                            const doc = getDocumentByType('proof_of_ownership');
                                            return doc && doc.type === 'upload' && doc.url ? (
                                                <div>
                                                    <label className="block mb-1 font-medium text-gray-500 dark:text-gray-400 text-sm">
                                                        Transfer Certificate of Title (TCT)
                                                    </label>
                                                    <div className="flex items-center gap-3">
                                                        {canViewFile(doc.url, doc.mimeType || undefined) && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleViewDocument(
                                                                    doc.url!,
                                                                    doc.fileName || 'Transfer Certificate of Title (TCT)',
                                                                    doc.mimeType || undefined,
                                                                    doc.id,
                                                                    doc.status
                                                                )}
                                                                className="flex items-center gap-2 text-primary hover:text-primary/80"
                                                            >
                                                                <Eye size={16} />
                                                                View
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : null;
                                        })()}
                                        {(() => {
                                            const doc = getDocumentByType('tax_declaration');
                                            return doc ? (
                                                doc.type === 'manual' && doc.manualId ? (
                                                    <div>
                                                        <label className="block mb-1 font-medium text-gray-500 dark:text-gray-400 text-sm">
                                                            Tax Declaration ID
                                                        </label>
                                                        <p className="font-medium text-gray-900 dark:text-white">{doc.manualId}</p>
                                                    </div>
                                                ) : doc.type === 'upload' && doc.url ? (
                                                    <div>
                                                        <label className="block mb-1 font-medium text-gray-500 dark:text-gray-400 text-sm">
                                                            Tax Declaration
                                                        </label>
                                                        <div className="flex items-center gap-3">
                                                            {canViewFile(doc.url, doc.mimeType || undefined) && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleViewDocument(
                                                                        doc.url!,
                                                                        doc.fileName || 'Tax Declaration',
                                                                        doc.mimeType || undefined,
                                                                        doc.id,
                                                                        doc.status
                                                                    )}
                                                                    className="flex items-center gap-2 text-primary hover:text-primary/80"
                                                                >
                                                                    <Eye size={16} />
                                                                    View
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ) : null
                                            ) : null;
                                        })()}
                                    </div>
                                </section>
                            )}

                            {/* Property Location */}
                            <section className="bg-white dark:bg-dark-surface shadow-lg p-6 rounded-lg">
                                <h2 className="flex items-center gap-2 mb-4 font-semibold text-gray-900 dark:text-white text-xl">
                                    <MapPin size={20} />
                                    Property Location
                                </h2>
                                <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                                    <div>
                                        <label className="block mb-1 font-medium text-gray-500 dark:text-gray-400 text-sm">
                                            Province
                                        </label>
                                        <p className="font-medium text-gray-900 dark:text-white">{getStringValue(appData.province)}</p>
                                    </div>
                                    <div>
                                        <label className="block mb-1 font-medium text-gray-500 dark:text-gray-400 text-sm">
                                            Municipality/City
                                        </label>
                                        <p className="font-medium text-gray-900 dark:text-white">{getStringValue(appData.municipality)}</p>
                                    </div>
                                    <div>
                                        <label className="block mb-1 font-medium text-gray-500 dark:text-gray-400 text-sm">
                                            Barangay
                                        </label>
                                        <p className="font-medium text-gray-900 dark:text-white">{getStringValue(appData.barangay)}</p>
                                    </div>
                                    {hasValue(appData.street_name) && (
                                        <div>
                                            <label className="block mb-1 font-medium text-gray-500 dark:text-gray-400 text-sm">
                                                Street Name
                                            </label>
                                            <p className="font-medium text-gray-900 dark:text-white">{getStringValue(appData.street_name)}</p>
                                        </div>
                                    )}
                                    {hasValue(appData.lot_no) && (
                                        <div>
                                            <label className="block mb-1 font-medium text-gray-500 dark:text-gray-400 text-sm">
                                                Lot No.
                                            </label>
                                            <p className="font-medium text-gray-900 dark:text-white">{getStringValue(appData.lot_no)}</p>
                                        </div>
                                    )}
                                    {hasValue(appData.block_no) && (
                                        <div>
                                            <label className="block mb-1 font-medium text-gray-500 dark:text-gray-400 text-sm">
                                                Block No.
                                            </label>
                                            <p className="font-medium text-gray-900 dark:text-white">{getStringValue(appData.block_no)}</p>
                                        </div>
                                    )}
                                    {hasValue(appData.latitude) && hasValue(appData.longitude) && (
                                        <div className="md:col-span-2">
                                            <label className="block mb-1 font-medium text-gray-500 dark:text-gray-400 text-sm">
                                                GPS Coordinates
                                            </label>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {Number(appData.latitude ?? 0).toFixed(6)}, {Number(appData.longitude ?? 0).toFixed(6)}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Land & Property Details */}
                            <section className="bg-white dark:bg-dark-surface shadow-lg p-6 rounded-lg">
                                <h2 className="flex items-center gap-2 mb-4 font-semibold text-gray-900 dark:text-white text-xl">
                                    <Building size={20} />
                                    Land & Property Details
                                </h2>
                                <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                                    <div>
                                        <label className="block mb-1 font-medium text-gray-500 dark:text-gray-400 text-sm">
                                            Land Type
                                        </label>
                                        <p className="font-medium text-gray-900 dark:text-white">{application.landType}</p>
                                    </div>
                                    {hasValue(appData.lot_area) && (
                                        <div>
                                            <label className="block mb-1 font-medium text-gray-500 dark:text-gray-400 text-sm">
                                                Lot Area
                                            </label>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {Number(appData.lot_area ?? 0).toLocaleString()} sqm
                                            </p>
                                        </div>
                                    )}
                                    {hasValue(appData.has_existing_structure) && hasValue(appData.number_of_buildings) && (
                                        <div>
                                            <label className="block mb-1 font-medium text-gray-500 dark:text-gray-400 text-sm">
                                                Number of Buildings
                                            </label>
                                            <p className="font-medium text-gray-900 dark:text-white">{getStringValue(appData.number_of_buildings)}</p>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Proposed Development */}
                            <section className="bg-white dark:bg-dark-surface shadow-lg p-6 rounded-lg">
                                <h2 className="flex items-center gap-2 mb-4 font-semibold text-gray-900 dark:text-white text-xl">
                                    <FileText size={20} />
                                    Proposed Development
                                </h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block mb-1 font-medium text-gray-500 dark:text-gray-400 text-sm">
                                            Project Type
                                        </label>
                                        <p className="font-medium text-gray-900 dark:text-white">{application.projectType}</p>
                                    </div>
                                    <div>
                                        <label className="block mb-1 font-medium text-gray-500 dark:text-gray-400 text-sm">
                                            Proposed Use
                                        </label>
                                        <p className="font-medium text-gray-900 dark:text-white">{application.proposedUse}</p>
                                    </div>
                                    {hasValue(appData.project_description) && (
                                        <div>
                                            <label className="block mb-1 font-medium text-gray-500 dark:text-gray-400 text-sm">
                                                Project Description
                                            </label>
                                            <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{getStringValue(appData.project_description)}</p>
                                        </div>
                                    )}
                                    {hasValue(appData.previous_use) && (
                                        <div>
                                            <label className="block mb-1 font-medium text-gray-500 dark:text-gray-400 text-sm">
                                                Previous Use
                                            </label>
                                            <p className="font-medium text-gray-900 dark:text-white">{getStringValue(appData.previous_use)}</p>
                                        </div>
                                    )}
                                    {hasValue(appData.justification) && (
                                        <div>
                                            <label className="block mb-1 font-medium text-gray-500 dark:text-gray-400 text-sm">
                                                Justification
                                            </label>
                                            <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{getStringValue(appData.justification)}</p>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Project Details */}
                            <section className="bg-white dark:bg-dark-surface shadow-lg p-6 rounded-lg">
                                <h2 className="flex items-center gap-2 mb-4 font-semibold text-gray-900 dark:text-white text-xl">
                                    <Building size={20} />
                                    Project Details
                                </h2>
                                <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                                    <div>
                                        <label className="block mb-1 font-medium text-gray-500 dark:text-gray-400 text-sm">
                                            Project Type
                                        </label>
                                        <p className="font-medium text-gray-900 dark:text-white">{application.projectType}</p>
                                    </div>
                                    <div>
                                        <label className="block mb-1 font-medium text-gray-500 dark:text-gray-400 text-sm">
                                            Land Type
                                        </label>
                                        <p className="font-medium text-gray-900 dark:text-white">{application.landType}</p>
                                    </div>
                                    <div>
                                        <label className="block mb-1 font-medium text-gray-500 dark:text-gray-400 text-sm">
                                            Proposed Use
                                        </label>
                                        <p className="font-medium text-gray-900 dark:text-white">{application.proposedUse}</p>
                                    </div>
                                    {hasValue(appData.lot_area) && (
                                        <div>
                                            <label className="block mb-1 font-medium text-gray-500 dark:text-gray-400 text-sm">
                                                Lot Area
                                            </label>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {Number(appData.lot_area ?? 0).toLocaleString()} sq.m.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Required Documents */}
                            <section className="bg-white dark:bg-dark-surface shadow-lg p-6 rounded-lg">
                                <h2 className="flex items-center gap-2 mb-4 font-semibold text-gray-900 dark:text-white text-xl">
                                    <File size={20} />
                                    Required Documents
                                </h2>
                                <div className="space-y-2">
                                    {/* Location Map */}
                                    {(() => {
                                        const doc = getDocumentByType('location_map');
                                        return doc && doc.url ? (
                                            <RequiredDocumentCard
                                                document={doc}
                                                displayName="Location Map / Vicinity Map"
                                                onView={handleViewDocument}
                                                canViewFile={canViewFile}
                                                getDocumentStatusColor={getDocumentStatusColor}
                                                getDocumentDisplayName={getDocumentDisplayName}
                                                showUploadNew={false}
                                            />
                                        ) : null;
                                    })()}

                                    {/* Vicinity Map */}
                                    {(() => {
                                        const doc = getDocumentByType('vicinity_map');
                                        return doc && doc.url ? (
                                            <RequiredDocumentCard
                                                document={doc}
                                                displayName="Vicinity Map"
                                                onView={handleViewDocument}
                                                canViewFile={canViewFile}
                                                getDocumentStatusColor={getDocumentStatusColor}
                                                getDocumentDisplayName={getDocumentDisplayName}
                                                showUploadNew={false}
                                            />
                                        ) : null;
                                    })()}

                                    {/* Barangay Clearance - Only for non-Government applicants */}
                                    {application.applicantType !== 'Government' && (() => {
                                        const doc = getDocumentByType('barangay_clearance');
                                        return doc ? (
                                            doc.type === 'manual' && doc.manualId ? (
                                                <div className={`flex justify-between items-center p-3 border-2 rounded-lg ${getDocumentStatusColor(doc.status, doc.version)}`}>
                                                    <div className="flex items-center gap-3">
                                                        <FileText size={18} className="text-gray-400" />
                                                        <div>
                                                            <p className="font-medium text-gray-900 dark:text-white text-sm">Barangay Clearance ID</p>
                                                            <p className="text-gray-500 dark:text-gray-400 text-xs">{doc.manualId}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : doc.type === 'upload' && doc.url ? (
                                                <RequiredDocumentCard
                                                    document={doc}
                                                    displayName="Barangay Clearance"
                                                    onView={handleViewDocument}
                                                    canViewFile={canViewFile}
                                                    getDocumentStatusColor={getDocumentStatusColor}
                                                    getDocumentDisplayName={getDocumentDisplayName}
                                                    showUploadNew={false}
                                                />
                                            ) : null
                                        ) : null;
                                    })()}

                                    {/* Government-Specific Documents */}
                                    {application.applicantType === 'Government' && (
                                        <>
                                            {/* Letter of Intent */}
                                            {(() => {
                                                const doc = getDocumentByType('letter_of_intent');
                                                return doc && doc.url ? (
                                                    <RequiredDocumentCard
                                                        document={doc}
                                                        displayName="Letter of Intent"
                                                        onView={handleViewDocument}
                                                        canViewFile={canViewFile}
                                                        getDocumentStatusColor={getDocumentStatusColor}
                                                        getDocumentDisplayName={getDocumentDisplayName}
                                                        showUploadNew={false}
                                                    />
                                                ) : null;
                                            })()}

                                            {/* Proof of Legal Authority */}
                                            {(() => {
                                                const doc = getDocumentByType('proof_of_legal_authority');
                                                return doc && doc.url ? (
                                                    <RequiredDocumentCard
                                                        document={doc}
                                                        displayName="Proof of Legal Authority"
                                                        onView={handleViewDocument}
                                                        canViewFile={canViewFile}
                                                        getDocumentStatusColor={getDocumentStatusColor}
                                                        getDocumentDisplayName={getDocumentDisplayName}
                                                        showUploadNew={false}
                                                    />
                                                ) : null;
                                            })()}

                                            {/* Endorsements / Approvals */}
                                            {(() => {
                                                const doc = getDocumentByType('endorsements_approvals');
                                                return doc && doc.url ? (
                                                    <RequiredDocumentCard
                                                        document={doc}
                                                        displayName="Endorsements / Approvals"
                                                        onView={handleViewDocument}
                                                        canViewFile={canViewFile}
                                                        getDocumentStatusColor={getDocumentStatusColor}
                                                        getDocumentDisplayName={getDocumentDisplayName}
                                                        showUploadNew={false}
                                                    />
                                                ) : null;
                                            })()}

                                            {/* Environmental Compliance Certificate (ECC) - Optional */}
                                            {(() => {
                                                const doc = getDocumentByType('environmental_compliance');
                                                return doc && doc.url ? (
                                                    <RequiredDocumentCard
                                                        document={doc}
                                                        displayName="Environmental Compliance Certificate"
                                                        onView={handleViewDocument}
                                                        canViewFile={canViewFile}
                                                        getDocumentStatusColor={getDocumentStatusColor}
                                                        getDocumentDisplayName={getDocumentDisplayName}
                                                        showUploadNew={false}
                                                    />
                                                ) : null;
                                            })()}
                                        </>
                                    )}

                                    {/* Digital Signature */}
                                    {(() => {
                                        const doc = getDocumentByType('signature');
                                        return doc && doc.url ? (
                                            <RequiredDocumentCard
                                                document={doc}
                                                displayName="Digital Signature"
                                                onView={handleViewDocument}
                                                canViewFile={canViewFile}
                                                getDocumentStatusColor={getDocumentStatusColor}
                                                getDocumentDisplayName={getDocumentDisplayName}
                                                showUploadNew={false}
                                            />
                                        ) : null;
                                    })()}

                                    {/* Site Development Plan */}
                                    {(() => {
                                        const doc = getDocumentByType('site_development_plan');
                                        return doc && doc.url ? (
                                            <RequiredDocumentCard
                                                document={doc}
                                                displayName="Site Development Plan"
                                                onView={handleViewDocument}
                                                canViewFile={canViewFile}
                                                getDocumentStatusColor={getDocumentStatusColor}
                                                getDocumentDisplayName={getDocumentDisplayName}
                                                showUploadNew={false}
                                            />
                                        ) : null;
                                    })()}
                                </div>
                            </section>

                            {/* Additional Documents */}
                            {(() => {
                                const additionalDocs = application.documents.filter(
                                    (doc) => doc.documentType === 'existing_building_photos' || 
                                             doc.documentType === 'other_documents' ||
                                             doc.documentType === 'requested_documents'
                                );
                                return additionalDocs.length > 0 ? (
                                    <section className="bg-white dark:bg-dark-surface shadow-lg p-6 rounded-lg">
                                        <h2 className="flex items-center gap-2 mb-4 font-semibold text-gray-900 dark:text-white text-xl">
                                            <File size={20} />
                                            Additional Documents
                                        </h2>
                                        <div className="space-y-2">
                                            {additionalDocs.map((doc) => (
                                                <AdditionalDocumentCard
                                                    key={doc.id}
                                                    document={doc}
                                                    onView={handleViewDocument}
                                                    canViewFile={canViewFile}
                                                    getDocumentStatusColor={getDocumentStatusColor}
                                                    formatFileSize={formatFileSize}
                                                    showUploadNew={false}
                                                />
                                            ))}
                                        </div>
                                    </section>
                                ) : null;
                            })()}
                        </div>

                        {/* Sidebar - Status Update */}
                        <div className="space-y-6">
                            {/* Status History */}
                            <StatusHistory history={application.statusHistory} />
                        </div>
                    </div>

            {/* Document Viewer Modal */}
            {viewingDocument && (
                <AdminDocumentViewerModal
                    isOpen={!!viewingDocument}
                    url={viewingDocument.url}
                    fileName={viewingDocument.fileName}
                    mimeType={viewingDocument.mimeType}
                    documentId={viewingDocument.documentId}
                    documentStatus={viewingDocument.documentStatus}
                    version={viewingDocument.version}
                    documentType={viewingDocument.documentType}
                    onApprove={handleDocumentApprove}
                    onReject={handleDocumentReject}
                    isProcessing={processing}
                    onClose={() => setViewingDocument(null)}
                    onViewVersionHistory={
                        viewingDocument.documentId && 
                        viewingDocument.documentId > 0 && 
                        viewingDocument.documentType 
                            ? handleViewVersionHistory 
                            : undefined
                    }
                />
            )}
            {versionHistory && (
                <VersionHistoryModal
                    isOpen={versionHistory.isOpen}
                    onClose={() => setVersionHistory(null)}
                    documentType={versionHistory.documentType}
                    versions={versionHistory.versions}
                    onViewVersion={(url, fileName, mimeType) => {
                        setVersionHistory(null);
                        // Find the version data to get version number and status
                        const versionData = versionHistory.versions.find(v => v.url === url);
                        handleViewDocument(
                            url, 
                            fileName, 
                            mimeType, 
                            versionHistory.documentId,
                            versionData?.status as 'pending' | 'approved' | 'rejected' | undefined,
                            versionData?.version,
                            versionHistory.documentType
                        );
                    }}
                />
            )}
        </AdminLayout>
    );
}
