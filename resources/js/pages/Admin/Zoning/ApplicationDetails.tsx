import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import AdminLayout from '../../../components/AdminLayout';
import Button from '../../../components/Button';
import AdminDocumentViewerModal from '../../../components/AdminDocumentViewerModal';
import VersionHistoryModal from '../../../components/VersionHistoryModal';
import StatusHistory from '../../../components/StatusHistory';
import RequirementManager from '../../../components/Applications/Zoning/RequirementManager';
import PropertyLocation from '../../../components/Applications/PropertyLocation';
import StatusBadge from '../../../components/StatusBadge';
import ApplicationDetailsTabs, { TabPanel } from '../../../components/ApplicationDetailsTabs';
import { showDocumentApproved, showDocumentRejected, showError, showNotesRequired } from '../../../lib/swal';
import { getCsrfToken } from '../../../data/services';
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
    Info
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

interface StatusHistoryEntry {
    id: number;
    statusFrom: string | null;
    statusTo: string;
    changedBy: number;
    notes: string | null;
    createdAt: string;
}

interface ExternalVerification {
    id: number;
    verificationType: string;
    referenceNo: string;
    status: string;
    responseData: any;
    externalSystem: string;
    verifiedAt: string | null;
}

interface Application {
    id: string;
    applicationNumber: string;
    referenceNo: string;
    status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'under_review' | 'for_inspection';
    submittedAt: string | null;
    createdAt: string;
    updatedAt: string;
    projectType: string;
    landUseType: string;
    buildingType: string | null;
    applicantType: string;
    isRepresentative: boolean;
    representativeName: string | null;
    applicantName: string;
    applicantEmail: string;
    applicantContact: string;
    contactNumber: string;
    contactEmail: string | null;
    taxDecRefNo: string;
    barangayPermitRefNo: string;
    lotAddress: string;
    province: string;
    municipality: string;
    barangay: string;
    streetName: string | null;
    lotAreaTotal: number;
    lotAreaUsed: number | null;
    lotOwner: string;
    lotOwnerContactNumber: string | null;
    lotOwnerContactEmail: string | null;
    isSubdivision: boolean;
    subdivisionName: string | null;
    blockNo: string | null;
    lotNo: string | null;
    pinLat: number | null;
    pinLng: number | null;
    numberOfStoreys: number | null;
    floorAreaSqm: number | null;
    numberOfUnits: number | null;
    projectDescription: string;
    purpose: string;
    assessedFee: number | null;
    rejectionReason: string | null;
    reviewedBy: number | null;
    reviewedAt: string | null;
    approvedBy: number | null;
    approvedAt: string | null;
    documents: Document[];
    statusHistory: StatusHistoryEntry[];
    externalVerifications?: ExternalVerification[];
    zone?: any;
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

    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [statusForm, setStatusForm] = useState({
        status: application.status,
        notes: '',
        rejection_reason: application.rejectionReason || '',
    });

    const handleUpdateStatus = () => {
        setUpdatingStatus(true);
        router.patch(`/admin/zoning/applications/${application.id}/status`, {
            status: statusForm.status,
            notes: statusForm.notes,
            rejection_reason: statusForm.rejection_reason,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setUpdatingStatus(false);
                setStatusForm(prev => ({ ...prev, notes: '' }));
            },
            onError: () => setUpdatingStatus(false),
        });
    };

    const handleViewDocument = (url: string, fileName: string, mimeType: string | undefined, documentId: number, documentStatus?: 'pending' | 'approved' | 'rejected', version?: number, documentType?: string): void => {
        setViewingDocument({ url, fileName, mimeType, documentId, documentStatus, version, documentType });
    };

    const handleViewVersionHistory = async (documentId: number, documentType: string) => {
        try {
            const response = await fetch(`/admin/zoning/applications/${application.id}/documents/${documentId}/versions`, {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

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

    const hasValue = (value: any): boolean => {
        return value != null && value !== '';
    };

    // Calculate document status for Required Documents tab
    const getDocumentStatus = (): 'red' | 'yellow' | 'green' => {
        // Get current documents only
        const currentDocuments = application.documents.filter((doc: any) => doc.isCurrent);
        
        if (currentDocuments.length === 0) {
            return 'red'; // No documents uploaded
        }

        // Define required document types based on applicant type
        const requiredTypes = [
            'tax_declaration',
            'barangay_permit',
            'land_title',
            'site_development_plan',
            'building_plans',
            'bill_of_materials'
        ];
        
        if (application.applicantType === 'business' || application.applicantType === 'developer') {
            requiredTypes.push('business_permit');
        }
        if (application.isRepresentative) {
            requiredTypes.push('spa_authorization');
        }

        // Check for rejected documents
        const hasRejected = currentDocuments.some((doc: any) => doc.status === 'rejected');
        if (hasRejected) {
            return 'yellow'; // Has rejected documents
        }

        // Check if all required documents are uploaded
        const uploadedTypes = currentDocuments.map((doc: any) => doc.documentType);
        const missingTypes = requiredTypes.filter(type => !uploadedTypes.includes(type));
        
        if (missingTypes.length > 0) {
            return 'yellow'; // Has missing documents
        }

        // Check if all documents are approved
        const allApproved = currentDocuments.every((doc: any) => doc.status === 'approved');
        if (allApproved) {
            return 'green'; // All documents approved
        }

        // Has pending documents
        return 'yellow';
    };

    const documentStatus = getDocumentStatus();

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
                <StatusBadge status={application.status as any} />
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
                    <ApplicationDetailsTabs defaultTab="overview">
                        {/* Overview Tab */}
                        <TabPanel tabId="overview">
                            {/* Project Classification (Matched to User View) */}
                            <section className="bg-white dark:bg-dark-surface shadow-lg p-6 rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white text-xl">
                                <Building size={20} />
                                Project Classification
                            </h2>
                            {application.assessedFee && (
                                <div className="text-right">
                                    <p className="text-xs text-gray-500 uppercase font-medium">Assessed Fee</p>
                                    <p className="text-primary font-bold">₱{Number(application.assessedFee).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                </div>
                            )}
                        </div>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Application Type
                                </label>
                                <p className="text-gray-900 dark:text-white capitalize">
                                    {application.applicantType?.replace('_', ' ')}
                                </p>
                            </div>
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Land Use Type
                                </label>
                                <p className="text-gray-900 dark:text-white capitalize">
                                    {application.landUseType?.replace('_', ' ')}
                                </p>
                            </div>
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Project Type
                                </label>
                                <p className="text-gray-900 dark:text-white capitalize">
                                    {application.projectType?.replace('_', ' ')}
                                </p>
                            </div>
                            {application.buildingType && (
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Building Type
                                    </label>
                                    <p className="text-gray-900 dark:text-white">{application.buildingType}</p>
                                </div>
                            )}
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Total Lot Area
                                </label>
                                <p className="text-gray-900 dark:text-white">
                                    {application.lotAreaTotal?.toLocaleString()} sqm
                                </p>
                            </div>
                            {application.lotAreaUsed && (
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Used Lot Area
                                    </label>
                                    <p className="text-gray-900 dark:text-white">
                                        {application.lotAreaUsed?.toLocaleString()} sqm
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 grid gap-4 md:grid-cols-3 pt-6 border-t border-gray-100 dark:border-gray-800">
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    No. of Storeys
                                </label>
                                <p className="text-gray-900 dark:text-white">{application.numberOfStoreys || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Floor Area
                                </label>
                                <p className="text-gray-900 dark:text-white">{application.floorAreaSqm ? `${application.floorAreaSqm.toLocaleString()} sqm` : 'N/A'}</p>
                            </div>
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    No. of Units
                                </label>
                                <p className="text-gray-900 dark:text-white">{application.numberOfUnits || 'N/A'}</p>
                            </div>
                        </div>

                        {application.projectDescription && (
                            <div className="mt-6">
                                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Project Description
                                </label>
                                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">{application.projectDescription}</div>
                            </div>
                        )}
                        {application.purpose && (
                            <div className="mt-4">
                                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Purpose / Intent
                                </label>
                                <p className="text-gray-900 dark:text-white italics">"{application.purpose}"</p>
                            </div>
                        )}
                    </section>

                    {/* Applicant & Property Owner */}
                    <section className="bg-white dark:bg-dark-surface shadow-lg p-6 rounded-lg">
                        <h2 className="flex items-center gap-2 mb-4 font-semibold text-gray-900 dark:text-white text-xl">
                            <User size={20} />
                            Applicant & Property Owner
                        </h2>
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-4">
                                <div>
                                    <label className="block mb-1 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Lot Owner / Title Holder
                                    </label>
                                    <p className="font-semibold text-gray-900 dark:text-white text-lg">
                                        {application.lotOwner}
                                    </p>
                                </div>
                                {application.lotOwnerContactNumber && (
                                    <div>
                                        <label className="block mb-1 text-xs font-medium text-gray-500 uppercase">
                                            Owner Contact Number
                                        </label>
                                        <p className="text-gray-900 dark:text-white flex items-center gap-2">
                                            <Phone size={14} className="text-gray-400" />
                                            {application.lotOwnerContactNumber}
                                        </p>
                                    </div>
                                )}
                                {application.lotOwnerContactEmail && (
                                    <div>
                                        <label className="block mb-1 text-xs font-medium text-gray-500 uppercase">
                                            Owner Contact Email
                                        </label>
                                        <p className="text-gray-900 dark:text-white flex items-center gap-2">
                                            <Mail size={14} className="text-gray-400" />
                                            {application.lotOwnerContactEmail}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4 pt-4 md:pt-0 md:pl-6 md:border-l border-gray-100 dark:border-gray-800">
                                <div>
                                    <label className="block mb-1 text-xs font-medium text-gray-500 uppercase">
                                        Application Filed By
                                    </label>
                                    <p className="text-gray-900 dark:text-white capitalize">
                                        {application.isRepresentative ? 'Authorized Representative' : 'Self / Lot Owner'}
                                    </p>
                                </div>
                                {application.isRepresentative && application.representativeName && (
                                    <div>
                                        <label className="block mb-1 text-xs font-medium text-gray-500 uppercase">
                                            Representative Name
                                        </label>
                                        <p className="text-gray-900 dark:text-white font-medium">
                                            {application.representativeName}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Property Location & Map */}
                    <section className="bg-white dark:bg-dark-surface shadow-lg p-6 rounded-lg">
                        <h2 className="flex items-center gap-2 mb-4 font-semibold text-gray-900 dark:text-white text-xl">
                            <MapPin size={20} />
                            Property Location & Map
                        </h2>

                        <PropertyLocation
                            mode="view"
                            pinLat={application.pinLat ?? undefined}
                            pinLng={application.pinLng ?? undefined}
                            lotAddress={application.lotAddress}
                            province={application.province}
                            municipality={application.municipality}
                            barangay={application.barangay}
                            streetName={application.streetName ?? undefined}
                            zone={application.zone}
                            showMap={true}
                        />

                        {application.isSubdivision && (
                            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Subdivision Details</h4>
                                <div className="grid gap-3 md:grid-cols-3">
                                    {application.subdivisionName && (
                                        <div>
                                            <label className="block mb-1 text-xs font-medium text-gray-500 uppercase">
                                                Subdivision Name
                                            </label>
                                            <p className="text-gray-900 dark:text-white">{application.subdivisionName}</p>
                                        </div>
                                    )}
                                    {application.blockNo && (
                                        <div>
                                            <label className="block mb-1 text-xs font-medium text-gray-500 uppercase">
                                                Block No.
                                            </label>
                                            <p className="text-gray-900 dark:text-white">{application.blockNo}</p>
                                        </div>
                                    )}
                                    {application.lotNo && (
                                        <div>
                                            <label className="block mb-1 text-xs font-medium text-gray-500 uppercase">
                                                Lot No.
                                            </label>
                                            <p className="text-gray-900 dark:text-white">{application.lotNo}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Verified Prerequisites */}
                    {application.externalVerifications && application.externalVerifications.length > 0 && (
                        <section className="bg-white dark:bg-dark-surface shadow-lg p-6 rounded-lg">
                            <h2 className="flex items-center gap-2 mb-4 font-semibold text-gray-900 dark:text-white text-xl">
                                <CheckCircle size={20} />
                                Verified Prerequisites
                            </h2>
                            <div className="space-y-4">
                                {application.externalVerifications.map((verification) => (
                                    <div
                                        key={verification.id}
                                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h3 className="font-semibold text-gray-900 dark:text-white capitalize mb-1">
                                                    {verification.verificationType?.replace('_', ' ')}
                                                </h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    Reference: <span className="font-mono">{verification.referenceNo}</span>
                                                </p>
                                            </div>
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${verification.status === 'verified'
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
                                                : verification.status === 'failed'
                                                    ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200'
                                                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200'
                                                }`}>
                                                {verification.status}
                                            </span>
                                        </div>

                                        {/* Display response data */}
                                        {verification.responseData && (
                                            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Verified Information
                                                </h4>
                                                <div className="grid gap-2 text-sm">
                                                    {verification.verificationType === 'tax_declaration' && (
                                                        <>
                                                            {verification.responseData.owner && (
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-600 dark:text-gray-400">Owner:</span>
                                                                    <span className="text-gray-900 dark:text-white font-medium">
                                                                        {verification.responseData.owner}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {verification.responseData.area && (
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-600 dark:text-gray-400">Area:</span>
                                                                    <span className="text-gray-900 dark:text-white font-medium">
                                                                        {verification.responseData.area} sqm
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {verification.verifiedAt && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                                                Verified on {formatDate(verification.verifiedAt)}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                        )}
                        </TabPanel>

                        {/* Required Documents Tab */}
                        <TabPanel tabId="required_documents" status={documentStatus}>
                            <section className="bg-white dark:bg-dark-surface shadow-lg p-6 rounded-lg">
                                <h2 className="flex items-center gap-2 mb-4 font-semibold text-gray-900 dark:text-white text-xl">
                                    <FileText size={20} />
                                    Required Documents
                                </h2>
                                <RequirementManager
                                    applicationId={application.id}
                                    documents={application.documents as any[]}
                                    applicantType={application.applicantType}
                                    isRepresentative={application.isRepresentative}
                                />
                            </section>
                        </TabPanel>
                    </ApplicationDetailsTabs>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Admin Status Update */}
                    <section className="bg-white dark:bg-dark-surface shadow-lg p-6 rounded-lg border-2 border-primary/20">
                        <h2 className="flex items-center gap-2 mb-4 font-bold text-gray-900 dark:text-white text-lg">
                            Admin Actions
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block mb-1 text-xs font-bold text-gray-500 uppercase">Update Status</label>
                                <select
                                    className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                                    value={statusForm.status}
                                    onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value as any })}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="under_review">Under Review</option>
                                    <option value="for_inspection">For Inspection</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>

                            {statusForm.status === 'rejected' && (
                                <div>
                                    <label className="block mb-1 text-xs font-bold text-red-500 uppercase">Rejection Reason</label>
                                    <textarea
                                        className="w-full p-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                                        rows={3}
                                        value={statusForm.rejection_reason}
                                        onChange={(e) => setStatusForm({ ...statusForm, rejection_reason: e.target.value })}
                                        placeholder="Reason for denial..."
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block mb-1 text-xs font-bold text-gray-500 uppercase">Notes (Internal)</label>
                                <textarea
                                    className="w-full p-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                                    rows={2}
                                    value={statusForm.notes}
                                    onChange={(e) => setStatusForm({ ...statusForm, notes: e.target.value })}
                                    placeholder="Add internal remarks..."
                                />
                            </div>


                            <Button
                                className="w-full"
                                onClick={handleUpdateStatus}
                                disabled={updatingStatus}
                            >
                                {updatingStatus ? 'Updating...' : 'Save Changes'}
                            </Button>

                            {/* Issue Clearance Button - Only show when approved */}
                            {application.status === 'approved' && (
                                <Button
                                    className="w-full"
                                    variant="primary"
                                    onClick={() => router.visit(`/clearances/create?application_id=${application.id}`)}
                                >
                                    <FileText size={16} className="mr-2" />
                                    Issue Clearance
                                </Button>
                            )}
                        </div>
                    </section>

                    {/* Timeline Summary */}
                    <section className="bg-white dark:bg-dark-surface shadow-lg p-6 rounded-lg">
                        <h2 className="flex items-center gap-2 mb-4 font-semibold text-gray-900 dark:text-white text-lg">
                            <Clock size={18} />
                            Timeline
                        </h2>
                        <div className="space-y-4 text-sm">
                            <div>
                                <label className="block text-gray-500 dark:text-gray-400">Created</label>
                                <p className="font-medium text-gray-900 dark:text-white">{formatDate(application.createdAt)}</p>
                            </div>
                            {application.submittedAt && (
                                <div>
                                    <label className="block text-gray-500 dark:text-gray-400">Submitted</label>
                                    <p className="font-medium text-gray-900 dark:text-white">{formatDate(application.submittedAt)}</p>
                                </div>
                            )}
                            {application.reviewedAt && (
                                <div>
                                    <label className="block text-gray-500 dark:text-gray-400">Reviewed</label>
                                    <p className="font-medium text-gray-900 dark:text-white">{formatDate(application.reviewedAt)}</p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Status History */}
                    <section className="bg-white dark:bg-dark-surface shadow-lg p-6 rounded-lg">
                        <h2 className="flex items-center gap-2 mb-4 font-semibold text-gray-900 dark:text-white text-lg">
                            <Clock size={18} />
                            Action History
                        </h2>
                        <StatusHistory
                            history={application.statusHistory?.map(h => ({
                                id: h.id,
                                statusFrom: h.statusFrom,
                                statusTo: h.statusTo,
                                changedBy: h.changedBy,
                                notes: h.notes,
                                createdAt: h.createdAt
                            })) || []}
                        />
                    </section>
                </div>
            </div>

            {/* Modals */}
            {viewingDocument && (
                <AdminDocumentViewerModal
                    isOpen={!!viewingDocument}
                    onClose={() => setViewingDocument(null)}
                    url={viewingDocument.url}
                    fileName={viewingDocument.fileName}
                    mimeType={viewingDocument.mimeType}
                    documentId={viewingDocument.documentId}
                    documentStatus={viewingDocument.documentStatus}
                    onApprove={handleDocumentApprove}
                    onReject={handleDocumentReject}
                    onViewVersionHistory={() => handleViewVersionHistory(viewingDocument.documentId, viewingDocument.documentType || '')}
                    version={viewingDocument.version}
                />
            )}

            {versionHistory && (
                <VersionHistoryModal
                    isOpen={versionHistory.isOpen}
                    onClose={() => setVersionHistory(null)}
                    documentType={versionHistory.documentType}
                    versions={versionHistory.versions}
                />
            )}
        </AdminLayout>
    );
}
