import { useState } from 'react';
import { Link, useForm, router, usePage } from '@inertiajs/react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Button from '../../components/Button';
import FileUpload from '../../components/FileUpload';
import DocumentViewerModal from '../../components/DocumentViewerModal';
import VersionHistoryModal from '../../components/VersionHistoryModal';
import RequiredDocumentCard from '../../components/RequiredDocumentCard';
import AdditionalDocumentCard from '../../components/AdditionalDocumentCard';
import { showDocumentUploaded, showDocumentReplaced, showError } from '../../lib/swal';
import StatusHistory from '../../components/StatusHistory';
import {
    ArrowLeft,
    FileText,
    Calendar,
    CheckCircle,
    Clock,
    XCircle,
    MapPin,
    Building,
    User,
    Mail,
    Phone,
    Download,
    File,
    Eye,
    Upload,
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
        documentId?: number;
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

    const { data: formData, setData, post, processing, errors, reset } = useForm<{
        requestedDocuments: File[] | null;
    }>({
        requestedDocuments: null,
    });

    const [replacingDocument, setReplacingDocument] = useState<number | null>(null);
    const [isReplacing, setIsReplacing] = useState(false);

    const handleViewDocument = (url: string, fileName: string, mimeType?: string, documentId?: number, version?: number, documentType?: string) => {
        setViewingDocument({ url, fileName, mimeType, documentId, version, documentType });
    };

    const handleViewVersionHistory = async (documentId: number, documentType: string) => {
        try {
            const response = await fetch(`/applications/zoning/${application.id}/documents/${documentId}/versions`, {
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
            console.log('Version history data:', data); // Debug log
            
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

    const handleUploadDocuments = () => {
        if (!formData.requestedDocuments || formData.requestedDocuments.length === 0) {
            return;
        }

        post(`/applications/zoning/${application.id}/documents`, {
            onSuccess: async () => {
                reset();
                await showDocumentUploaded('Documents have been uploaded successfully.');
                // Reload the page to show new documents
                router.reload({ only: ['application'] });
            },
            onError: async (errors) => {
                const errorMessage = errors?.requestedDocuments 
                    ? (Array.isArray(errors.requestedDocuments) ? errors.requestedDocuments[0] : errors.requestedDocuments)
                    : errors?.error 
                    ? (Array.isArray(errors.error) ? errors.error[0] : errors.error)
                    : 'An error occurred while uploading documents. Please try again.';
                await showError(errorMessage);
            },
        });
    };

    const handleReplaceDocument = (documentId: number, file: File): void => {
        setIsReplacing(true);
        const formData = new FormData();
        formData.append('file', file);

        router.post(`/applications/zoning/${application.id}/documents/${documentId}/replace`, formData, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: async () => {
                setReplacingDocument(null);
                setIsReplacing(false);
                await showDocumentReplaced('Document has been replaced successfully. The new version is pending review.');
                router.reload({ only: ['application'] });
            },
            onError: async (errors) => {
                setIsReplacing(false);
                console.error('Error replacing document:', errors);
                const errorMessage = errors?.file 
                    ? (Array.isArray(errors.file) ? errors.file[0] : errors.file)
                    : errors?.error 
                    ? (Array.isArray(errors.error) ? errors.error[0] : errors.error)
                    : 'An error occurred while replacing the document. Please try again.';
                await showError(errorMessage);
            },
        });
    };

    const handleReplaceDocumentClick = (documentId: number): void => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf,.jpg,.jpeg,.png';
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                // Validate file size (10MB)
                if (file.size > 10 * 1024 * 1024) {
                    await showError('File size must not exceed 10MB.');
                    return;
                }
                // Validate file type
                const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
                if (!validTypes.includes(file.type)) {
                    await showError('Invalid file type. Please upload a PDF or image file.');
                    return;
                }
                handleReplaceDocument(documentId, file);
            }
        };
        input.click();
    };

    const getStatusIcon = (status: Application['status']) => {
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

    const getStatusLabel = (status: Application['status']) => {
        switch (status) {
            case 'approved':
                return 'Approved';
            case 'rejected':
                return 'Rejected';
            case 'in_review':
                return 'In Review';
            default:
                return 'Pending';
        }
    };

    const getStatusColor = (status: Application['status']) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200';
            case 'rejected':
                return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200';
            case 'in_review':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200';
            default:
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200';
        }
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

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) {
            return `${bytes} B`;
        }
        if (bytes < 1024 * 1024) {
            return `${(bytes / 1024).toFixed(2)} KB`;
        }
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    };

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatDateTime = (dateString: string): string => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const canViewFile = (url: string, mimeType?: string): boolean => {
        if (mimeType) {
            return mimeType.startsWith('image/') || mimeType === 'application/pdf';
        }
        const extension = url.split('.').pop()?.toLowerCase();
        return ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'webp'].includes(extension || '');
    };

    // Helper function to get document by type
    const getDocumentByType = (documentType: string): Document | undefined => {
        return application.documents.find((doc) => doc.documentType === documentType);
    };

    const data = application.data;

    return (
        <div className="flex flex-col bg-background dark:bg-dark-bg w-full min-h-dvh transition-colors">
            <Header />
            <main className="flex-1 mt-16 py-8 md:py-12">
                <div className="mx-auto px-4 max-w-7xl">
                    <div className="mb-6">
                        <Link href="/applications/zoning">
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
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                                {getStatusLabel(application.status)}
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
                            {/* Applicant Information */}
                            <section className="bg-white dark:bg-dark-surface shadow-lg p-6 rounded-lg">
                                <h2 className="flex items-center gap-2 mb-4 font-semibold text-gray-900 dark:text-white text-xl">
                                    <User size={20} />
                                    Applicant Information
                                </h2>
                                <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                                    <div>
                                        <p className="mb-1 text-gray-500 dark:text-gray-400 text-sm">Applicant Type</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{application.applicantType}</p>
                                    </div>
                                    {data.applicant_name && (
                                        <div>
                                            <p className="mb-1 text-gray-500 dark:text-gray-400 text-sm">Full Name</p>
                                            <p className="font-medium text-gray-900 dark:text-white">{String(data.applicant_name)}</p>
                                        </div>
                                    )}
                                    {data.company_name && (
                                        <div>
                                            <p className="mb-1 text-gray-500 dark:text-gray-400 text-sm">Company Name</p>
                                            <p className="font-medium text-gray-900 dark:text-white">{String(data.company_name)}</p>
                                        </div>
                                    )}
                                    {data.sec_dti_reg_no && (
                                        <div>
                                            <p className="mb-1 text-gray-500 dark:text-gray-400 text-sm">SEC/DTI Registration No.</p>
                                            <p className="font-medium text-gray-900 dark:text-white">{String(data.sec_dti_reg_no)}</p>
                                        </div>
                                    )}
                                    {data.authorized_representative && (
                                        <div>
                                            <p className="mb-1 text-gray-500 dark:text-gray-400 text-sm">Authorized Representative</p>
                                            <p className="font-medium text-gray-900 dark:text-white">{String(data.authorized_representative)}</p>
                                        </div>
                                    )}
                                    <div>
                                        <p className="mb-1 text-gray-500 dark:text-gray-400 text-sm">Email</p>
                                        <p className="flex items-center gap-2 font-medium text-gray-900 dark:text-white">
                                            <Mail size={16} />
                                            {String(data.applicant_email)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="mb-1 text-gray-500 dark:text-gray-400 text-sm">Contact Number</p>
                                        <p className="flex items-center gap-2 font-medium text-gray-900 dark:text-white">
                                            <Phone size={16} />
                                            {String(data.applicant_contact)}
                                        </p>
                                    </div>
                                    {data.valid_id_path && (
                                        <div className="md:col-span-2">
                                            <p className="mb-1 text-gray-500 dark:text-gray-400 text-sm">Valid ID</p>
                                            <div className="flex items-center gap-3">
                                                {canViewFile(String(data.valid_id_path_url)) && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleViewDocument(
                                                            String(data.valid_id_path_url),
                                                            'Valid ID',
                                                            undefined
                                                        )}
                                                        className="flex items-center gap-2 text-primary hover:text-primary/80"
                                                    >
                                                        <Eye size={16} />
                                                        View
                                                    </button>
                                                )}
                                                <a
                                                    href={String(data.valid_id_path_url)}
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
                                                <p className="mb-1 text-gray-500 dark:text-gray-400 text-sm">Authorization Letter</p>
                                                <div className="flex items-center gap-3">
                                                    {canViewFile(doc.url, doc.mimeType || undefined) && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleViewDocument(
                                                                doc.url!,
                                                                doc.fileName || getDocumentDisplayName(doc.documentType, doc.version),
                                                                doc.mimeType || undefined,
                                                                doc.id,
                                                                doc.version,
                                                                doc.documentType
                                                            )}
                                                            className="flex items-center gap-2 text-primary hover:text-primary/80"
                                                        >
                                                            <Eye size={16} />
                                                            View
                                                        </button>
                                                    )}
                                                    {doc.status === 'rejected' && (
                                                        <button
                                                            type="button"
                                                            className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm"
                                                            onClick={() => handleReplaceDocumentClick(doc.id)}
                                                            disabled={processing || isReplacing}
                                                        >
                                                            <Upload size={16} />
                                                            Upload New
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ) : null;
                                    })()}
                                </div>
                            </section>

                            {/* Property Owner Information */}
                            <section className="bg-white dark:bg-dark-surface shadow-lg p-6 rounded-lg">
                                <h2 className="flex items-center gap-2 mb-4 font-semibold text-gray-900 dark:text-white text-xl">
                                    <Building size={20} />
                                    Property Owner Information
                                </h2>
                                <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                                    <div>
                                        <p className="mb-1 text-gray-500 dark:text-gray-400 text-sm">Owner Name</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{String(data.owner_name)}</p>
                                    </div>
                                    <div>
                                        <p className="mb-1 text-gray-500 dark:text-gray-400 text-sm">Contact Number</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{String(data.owner_contact)}</p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <p className="mb-1 text-gray-500 dark:text-gray-400 text-sm">Address</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{String(data.owner_address)}</p>
                                    </div>
                                    {(() => {
                                        const doc = getDocumentByType('proof_of_ownership');
                                        return doc && doc.type === 'upload' && doc.url ? (
                                            <div>
                                                <p className="mb-1 text-gray-500 dark:text-gray-400 text-sm">Transfer Certificate of Title (TCT)</p>
                                                <div className="flex items-center gap-3">
                                                    {canViewFile(doc.url, doc.mimeType || undefined) && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleViewDocument(
                                                                doc.url!,
                                                                doc.fileName || getDocumentDisplayName(doc.documentType, doc.version),
                                                                doc.mimeType || undefined,
                                                                doc.id,
                                                                doc.version,
                                                                doc.documentType
                                                            )}
                                                            className="flex items-center gap-2 text-primary hover:text-primary/80"
                                                        >
                                                            <Eye size={16} />
                                                            View
                                                        </button>
                                                    )}
                                                    {doc.status === 'rejected' && (
                                                        <button
                                                            type="button"
                                                            className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm"
                                                            onClick={() => handleReplaceDocumentClick(doc.id)}
                                                            disabled={processing || isReplacing}
                                                        >
                                                            <Upload size={16} />
                                                            Upload New
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
                                                    <p className="mb-1 text-gray-500 dark:text-gray-400 text-sm">Tax Declaration ID</p>
                                                    <p className="font-medium text-gray-900 dark:text-white">{doc.manualId}</p>
                                                </div>
                                            ) : doc.type === 'upload' && doc.url ? (
                                                <div>
                                                    <p className="mb-1 text-gray-500 dark:text-gray-400 text-sm">Tax Declaration</p>
                                                    <div className="flex items-center gap-3">
                                                        {canViewFile(doc.url, doc.mimeType || undefined) && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleViewDocument(
                                                                    doc.url!,
                                                                    doc.fileName || getDocumentDisplayName(doc.documentType, doc.version),
                                                                    doc.mimeType || undefined,
                                                                    doc.id,
                                                                    doc.version,
                                                                    doc.documentType
                                                                )}
                                                                className="flex items-center gap-2 text-primary hover:text-primary/80"
                                                            >
                                                                <Eye size={16} />
                                                                View
                                                            </button>
                                                        )}
                                                        {doc.status === 'rejected' && (
                                                            <button
                                                                type="button"
                                                                className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm"
                                                                onClick={() => handleReplaceDocumentClick(doc.id)}
                                                                disabled={processing}
                                                            >
                                                                <Upload size={16} />
                                                                Upload New
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : null
                                        ) : null;
                                    })()}
                                </div>
                            </section>

                            {/* Property Location */}
                            <section className="bg-white dark:bg-dark-surface shadow-lg p-6 rounded-lg">
                                <h2 className="flex items-center gap-2 mb-4 font-semibold text-gray-900 dark:text-white text-xl">
                                    <MapPin size={20} />
                                    Property Location
                                </h2>
                                <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                                    <div>
                                        <p className="mb-1 text-gray-500 dark:text-gray-400 text-sm">Province</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{String(data.province)}</p>
                                    </div>
                                    <div>
                                        <p className="mb-1 text-gray-500 dark:text-gray-400 text-sm">Municipality/City</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{String(data.municipality)}</p>
                                    </div>
                                    <div>
                                        <p className="mb-1 text-gray-500 dark:text-gray-400 text-sm">Barangay</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{String(data.barangay)}</p>
                                    </div>
                                    {data.street_name && (
                                        <div>
                                            <p className="mb-1 text-gray-500 dark:text-gray-400 text-sm">Street Name</p>
                                            <p className="font-medium text-gray-900 dark:text-white">{String(data.street_name)}</p>
                                        </div>
                                    )}
                                    {data.lot_no && (
                                        <div>
                                            <p className="mb-1 text-gray-500 dark:text-gray-400 text-sm">Lot No.</p>
                                            <p className="font-medium text-gray-900 dark:text-white">{String(data.lot_no)}</p>
                                        </div>
                                    )}
                                    {data.block_no && (
                                        <div>
                                            <p className="mb-1 text-gray-500 dark:text-gray-400 text-sm">Block No.</p>
                                            <p className="font-medium text-gray-900 dark:text-white">{String(data.block_no)}</p>
                                        </div>
                                    )}
                                    <div className="md:col-span-2">
                                        <p className="mb-1 text-gray-500 dark:text-gray-400 text-sm">GPS Coordinates</p>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {Number(data.latitude).toFixed(6)}, {Number(data.longitude).toFixed(6)}
                                        </p>
                                    </div>
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
                                        <p className="mb-1 text-gray-500 dark:text-gray-400 text-sm">Land Type</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{application.landType}</p>
                                    </div>
                                    <div>
                                        <p className="mb-1 text-gray-500 dark:text-gray-400 text-sm">Lot Area</p>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {Number(data.lot_area).toLocaleString()} sqm
                                        </p>
                                    </div>
                                    {data.has_existing_structure && (
                                        <div>
                                            <p className="mb-1 text-gray-500 dark:text-gray-400 text-sm">Number of Buildings</p>
                                            <p className="font-medium text-gray-900 dark:text-white">{String(data.number_of_buildings)}</p>
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
                                        <p className="mb-1 text-gray-500 dark:text-gray-400 text-sm">Project Type</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{application.projectType}</p>
                                    </div>
                                    <div>
                                        <p className="mb-1 text-gray-500 dark:text-gray-400 text-sm">Proposed Use</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{application.proposedUse}</p>
                                    </div>
                                    {data.project_description && (
                                        <div>
                                            <p className="mb-1 text-gray-500 dark:text-gray-400 text-sm">Project Description</p>
                                            <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{String(data.project_description)}</p>
                                        </div>
                                    )}
                                    {data.previous_use && (
                                        <div>
                                            <p className="mb-1 text-gray-500 dark:text-gray-400 text-sm">Previous Use</p>
                                            <p className="font-medium text-gray-900 dark:text-white">{String(data.previous_use)}</p>
                                        </div>
                                    )}
                                    {data.justification && (
                                        <div>
                                            <p className="mb-1 text-gray-500 dark:text-gray-400 text-sm">Justification</p>
                                            <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{String(data.justification)}</p>
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
                                            <div className={`flex justify-between items-center p-3 border-2 rounded-lg ${getDocumentStatusColor(doc.status, doc.version)}`}>
                                                <div className="flex items-center gap-3">
                                                    <FileText size={18} className="text-gray-400" />
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                                                            {getDocumentDisplayName(doc.documentType, doc.version)}
                                                        </p>
                                                        <p className="text-gray-500 dark:text-gray-400 text-xs">Required document</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    {canViewFile(doc.url, doc.mimeType || undefined) && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleViewDocument(
                                                                doc.url!,
                                                                doc.fileName || getDocumentDisplayName(doc.documentType, doc.version),
                                                                doc.mimeType || undefined,
                                                                doc.id,
                                                                doc.version,
                                                                doc.documentType
                                                            )}
                                                            className="flex items-center gap-2 text-primary hover:text-primary/80 text-sm"
                                                        >
                                                            <Eye size={16} />
                                                            View
                                                        </button>
                                                    )}
                                                    {doc.status === 'rejected' && (
                                                        <button
                                                            type="button"
                                                            className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm"
                                                            onClick={() => handleReplaceDocumentClick(doc.id)}
                                                            disabled={processing || isReplacing}
                                                        >
                                                            <Upload size={16} />
                                                            Upload New
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ) : null;
                                    })()}

                                    {/* Vicinity Map */}
                                    {(() => {
                                        const doc = getDocumentByType('vicinity_map');
                                        return doc && doc.url ? (
                                            <div className={`flex justify-between items-center p-3 border-2 rounded-lg ${getDocumentStatusColor(doc.status, doc.version)}`}>
                                                <div className="flex items-center gap-3">
                                                    <FileText size={18} className="text-gray-400" />
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                                                            {getDocumentDisplayName(doc.documentType, doc.version)}
                                                        </p>
                                                        <p className="text-gray-500 dark:text-gray-400 text-xs">Required document</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    {canViewFile(doc.url, doc.mimeType || undefined) && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleViewDocument(
                                                                doc.url!,
                                                                doc.fileName || getDocumentDisplayName(doc.documentType, doc.version),
                                                                doc.mimeType || undefined,
                                                                doc.id,
                                                                doc.version,
                                                                doc.documentType
                                                            )}
                                                            className="flex items-center gap-2 text-primary hover:text-primary/80 text-sm"
                                                        >
                                                            <Eye size={16} />
                                                            View
                                                        </button>
                                                    )}
                                                    {doc.status === 'rejected' && (
                                                        <button
                                                            type="button"
                                                            className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm"
                                                            onClick={() => handleReplaceDocumentClick(doc.id)}
                                                            disabled={processing || isReplacing}
                                                        >
                                                            <Upload size={16} />
                                                            Upload New
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
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
                                                <div className={`flex justify-between items-center p-3 border-2 rounded-lg ${getDocumentStatusColor(doc.status, doc.version)}`}>
                                                    <div className="flex items-center gap-3">
                                                        <FileText size={18} className="text-gray-400" />
                                                        <div>
                                                            <p className="font-medium text-gray-900 dark:text-white text-sm">
                                                                {getDocumentDisplayName(doc.documentType, doc.version)}
                                                            </p>
                                                            <p className="text-gray-500 dark:text-gray-400 text-xs">Required document</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        {canViewFile(doc.url, doc.mimeType || undefined) && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleViewDocument(
                                                                    doc.url!,
                                                                    doc.fileName || getDocumentDisplayName(doc.documentType, doc.version),
                                                                    doc.mimeType || undefined,
                                                                    doc.id,
                                                                    doc.version,
                                                                    doc.documentType
                                                                )}
                                                                className="flex items-center gap-2 text-primary hover:text-primary/80 text-sm"
                                                            >
                                                                <Eye size={16} />
                                                                View
                                                            </button>
                                                        )}
                                                        {doc.status === 'rejected' && (
                                                            <button
                                                                type="button"
                                                                className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm"
                                                                onClick={() => handleReplaceDocumentClick(doc.id)}
                                                                disabled={processing}
                                                            >
                                                                <Upload size={16} />
                                                                Upload New
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
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
                                                    <div className={`flex justify-between items-center p-3 border-2 rounded-lg ${getDocumentStatusColor(doc.status, doc.version)}`}>
                                                        <div className="flex items-center gap-3">
                                                            <FileText size={18} className="text-gray-400" />
                                                            <div>
                                                                <p className="font-medium text-gray-900 dark:text-white text-sm">
                                                                {getDocumentDisplayName(doc.documentType, doc.version)}
                                                            </p>
                                                                <p className="text-gray-500 dark:text-gray-400 text-xs">Required document</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            {canViewFile(doc.url, doc.mimeType || undefined) && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleViewDocument(
                                                                        doc.url!,
                                                                        doc.fileName || getDocumentDisplayName(doc.documentType, doc.version),
                                                                        doc.mimeType || undefined,
                                                                        doc.id,
                                                                        doc.version,
                                                                        doc.documentType
                                                                    )}
                                                                    className="flex items-center gap-2 text-primary hover:text-primary/80 text-sm"
                                                                >
                                                                    <Eye size={16} />
                                                                    View
                                                                </button>
                                                            )}
                                                            {doc.status === 'rejected' && (
                                                                <button
                                                                    type="button"
                                                                    className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm"
                                                                    onClick={() => handleReplaceDocumentClick(doc.id)}
                                                                    disabled={processing}
                                                                >
                                                                    <Upload size={16} />
                                                                    Upload New
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ) : null;
                                            })()}

                                            {/* Proof of Legal Authority */}
                                            {(() => {
                                                const doc = getDocumentByType('proof_of_legal_authority');
                                                return doc && doc.url ? (
                                                    <div className={`flex justify-between items-center p-3 border-2 rounded-lg ${getDocumentStatusColor(doc.status, doc.version)}`}>
                                                        <div className="flex items-center gap-3">
                                                            <FileText size={18} className="text-gray-400" />
                                                            <div>
                                                                <p className="font-medium text-gray-900 dark:text-white text-sm">
                                                                {getDocumentDisplayName(doc.documentType, doc.version)}
                                                            </p>
                                                                <p className="text-gray-500 dark:text-gray-400 text-xs">Required document</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            {canViewFile(doc.url, doc.mimeType || undefined) && (
                                                                <button
                                                                    type="button"
                                                                onClick={() => handleViewDocument(
                                                                    doc.url!,
                                                                    doc.fileName || getDocumentDisplayName(doc.documentType, doc.version),
                                                                    doc.mimeType || undefined,
                                                                    doc.id,
                                                                    doc.version,
                                                                    doc.documentType
                                                                )}
                                                                    className="flex items-center gap-2 text-primary hover:text-primary/80 text-sm"
                                                                >
                                                                    <Eye size={16} />
                                                                    View
                                                                </button>
                                                            )}
                                                            {doc.status === 'rejected' && (
                                                                <button
                                                                    type="button"
                                                                    className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm"
                                                                    onClick={() => handleReplaceDocumentClick(doc.id)}
                                                                    disabled={processing}
                                                                >
                                                                    <Upload size={16} />
                                                                    Upload New
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ) : null;
                                            })()}

                                            {/* Endorsements / Approvals */}
                                            {(() => {
                                                const doc = getDocumentByType('endorsements_approvals');
                                                return doc && doc.url ? (
                                                    <div className={`flex justify-between items-center p-3 border-2 rounded-lg ${getDocumentStatusColor(doc.status, doc.version)}`}>
                                                        <div className="flex items-center gap-3">
                                                            <FileText size={18} className="text-gray-400" />
                                                            <div>
                                                                <p className="font-medium text-gray-900 dark:text-white text-sm">
                                                                {getDocumentDisplayName(doc.documentType, doc.version)}
                                                            </p>
                                                                <p className="text-gray-500 dark:text-gray-400 text-xs">Required document</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            {canViewFile(doc.url, doc.mimeType || undefined) && (
                                                                <button
                                                                    type="button"
                                                                onClick={() => handleViewDocument(
                                                                    doc.url!,
                                                                    doc.fileName || getDocumentDisplayName(doc.documentType, doc.version),
                                                                    doc.mimeType || undefined,
                                                                    doc.id,
                                                                    doc.version,
                                                                    doc.documentType
                                                                )}
                                                                    className="flex items-center gap-2 text-primary hover:text-primary/80 text-sm"
                                                                >
                                                                    <Eye size={16} />
                                                                    View
                                                                </button>
                                                            )}
                                                            {doc.status === 'rejected' && (
                                                                <button
                                                                    type="button"
                                                                    className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm"
                                                                    onClick={() => handleReplaceDocumentClick(doc.id)}
                                                                    disabled={processing}
                                                                >
                                                                    <Upload size={16} />
                                                                    Upload New
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ) : null;
                                            })()}

                                            {/* Environmental Compliance Certificate (ECC) - Optional */}
                                            {(() => {
                                                const doc = getDocumentByType('environmental_compliance');
                                                return doc && doc.url ? (
                                                    <div className={`flex justify-between items-center p-3 border-2 rounded-lg ${getDocumentStatusColor(doc.status, doc.version)}`}>
                                                        <div className="flex items-center gap-3">
                                                            <FileText size={18} className="text-gray-400" />
                                                            <div>
                                                                <p className="font-medium text-gray-900 dark:text-white text-sm">
                                                                {getDocumentDisplayName(doc.documentType, doc.version)}
                                                            </p>
                                                                <p className="text-gray-500 dark:text-gray-400 text-xs">Optional document</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            {canViewFile(doc.url, doc.mimeType || undefined) && (
                                                                <button
                                                                    type="button"
                                                                onClick={() => handleViewDocument(
                                                                    doc.url!,
                                                                    doc.fileName || getDocumentDisplayName(doc.documentType, doc.version),
                                                                    doc.mimeType || undefined,
                                                                    doc.id,
                                                                    doc.version,
                                                                    doc.documentType
                                                                )}
                                                                    className="flex items-center gap-2 text-primary hover:text-primary/80 text-sm"
                                                                >
                                                                    <Eye size={16} />
                                                                    View
                                                                </button>
                                                            )}
                                                            {doc.status === 'rejected' && (
                                                                <button
                                                                    type="button"
                                                                    className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm"
                                                                    onClick={() => handleReplaceDocumentClick(doc.id)}
                                                                    disabled={processing}
                                                                >
                                                                    <Upload size={16} />
                                                                    Upload New
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ) : null;
                                            })()}
                                        </>
                                    )}

                                    {/* Digital Signature */}
                                    {(() => {
                                        const doc = getDocumentByType('signature');
                                        return doc && doc.url ? (
                                            <div className={`flex justify-between items-center p-3 border-2 rounded-lg ${getDocumentStatusColor(doc.status, doc.version)}`}>
                                                <div className="flex items-center gap-3">
                                                    <FileText size={18} className="text-gray-400" />
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                                                            {getDocumentDisplayName(doc.documentType, doc.version)}
                                                        </p>
                                                        <p className="text-gray-500 dark:text-gray-400 text-xs">Required document</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    {canViewFile(doc.url, doc.mimeType || undefined) && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleViewDocument(
                                                                doc.url!,
                                                                doc.fileName || getDocumentDisplayName(doc.documentType, doc.version),
                                                                doc.mimeType || undefined,
                                                                doc.id,
                                                                doc.version,
                                                                doc.documentType
                                                            )}
                                                            className="flex items-center gap-2 text-primary hover:text-primary/80 text-sm"
                                                        >
                                                            <Eye size={16} />
                                                            View
                                                        </button>
                                                    )}
                                                    {doc.status === 'rejected' && (
                                                        <button
                                                            type="button"
                                                            className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm"
                                                            onClick={() => handleReplaceDocumentClick(doc.id)}
                                                            disabled={processing || isReplacing}
                                                        >
                                                            <Upload size={16} />
                                                            Upload New
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ) : null;
                                    })()}

                                    {/* Site Development Plan */}
                                    {(() => {
                                        const doc = getDocumentByType('site_development_plan');
                                        return doc && doc.url ? (
                                            <div className={`flex justify-between items-center p-3 border-2 rounded-lg ${getDocumentStatusColor(doc.status)}`}>
                                                <div className="flex items-center gap-3">
                                                    <FileText size={18} className="text-gray-400" />
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white text-sm">Site Development Plan</p>
                                                        <p className="text-gray-500 dark:text-gray-400 text-xs">Required document</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    {canViewFile(doc.url, doc.mimeType || undefined) && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleViewDocument(
                                                                doc.url!,
                                                                doc.fileName || getDocumentDisplayName(doc.documentType, doc.version),
                                                                doc.mimeType || undefined,
                                                                doc.id,
                                                                doc.version,
                                                                doc.documentType
                                                            )}
                                                            className="flex items-center gap-2 text-primary hover:text-primary/80 text-sm"
                                                        >
                                                            <Eye size={16} />
                                                            View
                                                        </button>
                                                    )}
                                                    {doc.status === 'rejected' && (
                                                        <button
                                                            type="button"
                                                            className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm"
                                                            onClick={() => handleReplaceDocumentClick(doc.id)}
                                                            disabled={processing || isReplacing}
                                                        >
                                                            <Upload size={16} />
                                                            Upload New
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
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
                                                    onReplace={handleReplaceDocumentClick}
                                                    canViewFile={canViewFile}
                                                    getDocumentStatusColor={getDocumentStatusColor}
                                                    formatFileSize={formatFileSize}
                                                    isProcessing={processing}
                                                    isReplacing={isReplacing}
                                                    showUploadNew={true}
                                                />
                                            ))}
                                        </div>
                                    </section>
                                ) : null;
                            })()}

                            {/* Upload Requested Documents */}
                            <section className="bg-white dark:bg-dark-surface shadow-lg p-6 rounded-lg">
                                <h2 className="flex items-center gap-2 mb-4 font-semibold text-gray-900 dark:text-white text-xl">
                                    <Upload size={20} />
                                    Upload Requested Documents
                                </h2>
                                <p className="mb-4 text-gray-600 dark:text-gray-400 text-sm">
                                    If additional documents have been requested by the reviewer, you can upload them here.
                                </p>
                                <div className="space-y-4">
                                    <FileUpload
                                        label="Additional Documents"
                                        accept="image/*,.pdf"
                                        maxSizeMB={10}
                                        multiple
                                        value={formData.requestedDocuments}
                                        onChange={(files) => setData('requestedDocuments', files as File[] | null)}
                                        error={errors.requestedDocuments}
                                        allowedTypes={['image/*', 'application/pdf']}
                                    />
                                    <Button
                                        variant="primary"
                                        size="md"
                                        onClick={handleUploadDocuments}
                                        disabled={!formData.requestedDocuments || formData.requestedDocuments.length === 0 || processing}
                                        className="flex items-center gap-2"
                                    >
                                        <Upload size={18} />
                                        {processing ? 'Uploading...' : 'Upload Documents'}
                                    </Button>
                                </div>
                            </section>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Application Info */}
                            <section className="bg-white dark:bg-dark-surface shadow-lg p-6 rounded-lg">
                                <h2 className="mb-4 font-semibold text-gray-900 dark:text-white text-lg">Application Information</h2>
                                <div className="space-y-3">
                                    <div>
                                        <p className="mb-1 text-gray-500 dark:text-gray-400 text-sm">Application Number</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{application.applicationNumber}</p>
                                    </div>
                                    <div>
                                        <p className="mb-1 text-gray-500 dark:text-gray-400 text-sm">Submitted</p>
                                        <p className="flex items-center gap-2 font-medium text-gray-900 dark:text-white text-sm">
                                            <Calendar size={16} />
                                            {formatDateTime(application.submittedAt)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="mb-1 text-gray-500 dark:text-gray-400 text-sm">Last Updated</p>
                                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                                            {formatDateTime(application.updatedAt)}
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Status History */}
                            <StatusHistory history={application.statusHistory} />
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
            {viewingDocument && (
                <DocumentViewerModal
                    isOpen={!!viewingDocument}
                    onClose={() => setViewingDocument(null)}
                    url={viewingDocument.url}
                    fileName={viewingDocument.fileName}
                    mimeType={viewingDocument.mimeType}
                    version={viewingDocument.version}
                    documentId={viewingDocument.documentId}
                    documentType={viewingDocument.documentType}
                    onViewVersionHistory={viewingDocument.documentId && viewingDocument.documentType ? handleViewVersionHistory : undefined}
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
                        handleViewDocument(url, fileName, mimeType);
                    }}
                />
            )}
        </div>
    );
}
