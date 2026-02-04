import { Link, usePage } from '@inertiajs/react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Button from '../../components/Button';
import StatusBadge from '../../components/StatusBadge';
import StatusHistory from '../../components/StatusHistory';
import PropertyLocation from '../../components/Applications/PropertyLocation';
import RequirementManager from '../../components/Applications/Zoning/RequirementManager';
import ApplicationDetailsTabs, { TabPanel } from '../../components/ApplicationDetailsTabs';
import { ArrowLeft, CheckCircle, XCircle, Clock, FileText, Eye, Download, MapPin, Building, User, Mail, Phone } from 'lucide-react';

interface Document {
    id: number;
    fileName: string;
    filePath: string;
    fileType?: string;
    fileSize?: number;
    uploadedAt: string;
}

interface History {
    id: number;
    status: string;
    remarks: string | null;
    updatedBy?: number;
    updatedAt: string;
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
    id: number;
    referenceNo: string;
    applicationNumber: string;
    status: string;
    rejectionReason?: string | null;
    assessedFee?: number | null;
    applicantType: string;
    isRepresentative: boolean;
    representativeName?: string | null;
    contactNumber: string;
    contactEmail?: string | null;
    taxDecRefNo: string;
    barangayPermitRefNo: string;
    pinLat: number | null;
    pinLng: number | null;
    lotAddress: string;
    province?: string | null;
    municipality?: string | null;
    barangay?: string | null;
    streetName?: string | null;
    lotOwner: string;
    lotOwnerContactNumber?: string | null;
    lotOwnerContactEmail?: string | null;
    lotAreaTotal: number;
    lotAreaUsed?: number | null;
    isSubdivision: boolean;
    subdivisionName?: string | null;
    blockNo?: string | null;
    lotNo?: string | null;
    landUseType: string;
    projectType: string;
    buildingType?: string | null;
    projectDescription: string;
    numberOfStoreys?: number | null;
    floorAreaSqm?: number | null;
    numberOfUnits?: number | null;
    purpose: string;
    zone?: any;
    documents: Document[];
    externalVerifications: ExternalVerification[];
    history: History[];
    submittedAt: string | null;
    createdAt: string;
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

    // Calculate document status for Required Documents tab
    const getDocumentStatus = (): 'red' | 'yellow' | 'green' => {
        // Get current documents only (DocumentResource includes isCurrent)
        const currentDocuments = application.documents.filter((doc: any) => 
            doc.isCurrent !== false
        );
        
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
        const uploadedTypes = currentDocuments.map((doc: any) => doc.documentType).filter(Boolean);
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
        <div className="flex flex-col bg-background dark:bg-dark-bg w-full min-h-dvh transition-colors">
            <Header />
            <main className="flex-1 mt-16 py-8 md:py-12">
                <div className="mx-auto px-4 max-w-7xl">
                    <div className="mb-6">
                        <Link href="/zoning-applications">
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
                                Reference Number: <span className="font-mono font-semibold">{application.referenceNo}</span>
                            </p>
                        </div>
                        <StatusBadge status={application.status as any} />
                    </div>

                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            <ApplicationDetailsTabs defaultTab="overview">
                                {/* Overview Tab */}
                                <TabPanel tabId="overview">
                                    {/* Application Information */}
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
                                            Individual / Corporate
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
                                        <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                                            {application.projectDescription}
                                        </p>
                                    </div>
                                )}
                                {application.purpose && (
                                    <div className="mt-4">
                                        <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Purpose / Intent
                                        </label>
                                        <p className="text-gray-900 dark:text-white italic">"{application.purpose}"</p>
                                    </div>
                                )}
                            </section>

                            {/* Applicant and Owner Details */}
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

                            {/* Property Location */}
                            <section className="bg-white dark:bg-dark-surface shadow-lg p-6 rounded-lg">
                                <h2 className="flex items-center gap-2 mb-4 font-semibold text-gray-900 dark:text-white text-xl">
                                    <MapPin size={20} />
                                    Property Location & Map
                                </h2>

                                <PropertyLocation
                                    mode="view"
                                    pinLat={application.pinLat}
                                    pinLng={application.pinLng}
                                    lotAddress={application.lotAddress}
                                    province={application.province || ''}
                                    municipality={application.municipality || ''}
                                    barangay={application.barangay || ''}
                                    streetName={application.streetName || ''}
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

                            {/* External Verifications (Tax Declaration & Barangay Permit) */}
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
                                                                    {verification.responseData.property_location && (
                                                                        <div className="flex justify-between">
                                                                            <span className="text-gray-600 dark:text-gray-400">Location:</span>
                                                                            <span className="text-gray-900 dark:text-white font-medium">
                                                                                {verification.responseData.property_location}
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
                                                                    {verification.responseData.assessed_value && (
                                                                        <div className="flex justify-between">
                                                                            <span className="text-gray-600 dark:text-gray-400">Assessed Value:</span>
                                                                            <span className="text-gray-900 dark:text-white font-medium">
                                                                                ₱{Number(verification.responseData.assessed_value).toLocaleString()}
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </>
                                                            )}

                                                            {verification.verificationType === 'barangay_permit' && (
                                                                <>
                                                                    {verification.responseData.applicant_name && (
                                                                        <div className="flex justify-between">
                                                                            <span className="text-gray-600 dark:text-gray-400">Applicant:</span>
                                                                            <span className="text-gray-900 dark:text-white font-medium">
                                                                                {verification.responseData.applicant_name}
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                    {verification.responseData.business_name && (
                                                                        <div className="flex justify-between">
                                                                            <span className="text-gray-600 dark:text-gray-400">Business Name:</span>
                                                                            <span className="text-gray-900 dark:text-white font-medium">
                                                                                {verification.responseData.business_name}
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                    {verification.responseData.business_address && (
                                                                        <div className="flex justify-between">
                                                                            <span className="text-gray-600 dark:text-gray-400">Business Address:</span>
                                                                            <span className="text-gray-900 dark:text-white font-medium">
                                                                                {verification.responseData.business_address}
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                    {verification.responseData.issue_date && (
                                                                        <div className="flex justify-between">
                                                                            <span className="text-gray-600 dark:text-gray-400">Issue Date:</span>
                                                                            <span className="text-gray-900 dark:text-white font-medium">
                                                                                {new Date(verification.responseData.issue_date).toLocaleDateString()}
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                    {verification.responseData.expiry_date && (
                                                                        <div className="flex justify-between">
                                                                            <span className="text-gray-600 dark:text-gray-400">Expiry Date:</span>
                                                                            <span className="text-gray-900 dark:text-white font-medium">
                                                                                {new Date(verification.responseData.expiry_date).toLocaleDateString()}
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
                                            applicationId={application.id.toString()}
                                            documents={application.documents as any[]}
                                            applicantType={application.applicantType}
                                            isRepresentative={application.isRepresentative}
                                        />
                                    </section>
                                </TabPanel>

                                {/* Status History Tab */}
                                <TabPanel tabId="status_history">
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
                                            changedBy: h.updatedBy ?? 0,
                                            notes: h.remarks,
                                            createdAt: h.updatedAt,
                                        }))}
                                    />
                                </section>
                                )}
                                </TabPanel>
                            </ApplicationDetailsTabs>
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
                                            <span>{application.contactNumber}</span>
                                        </div>
                                    </div>
                                    {application.contactEmail && (
                                        <div>
                                            <label className="block mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                                                Email
                                            </label>
                                            <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                                                <Mail size={14} />
                                                <span>{application.contactEmail}</span>
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
                                        <p className="text-gray-900 dark:text-white">{formatDate(application.createdAt)}</p>
                                    </div>
                                    {application.submittedAt && (
                                        <div>
                                            <label className="block mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                                                Submitted
                                            </label>
                                            <p className="text-gray-900 dark:text-white">{formatDate(application.submittedAt)}</p>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Rejection Reason */}
                            {application.rejectionReason && (
                                <section className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 shadow-lg p-6 rounded-lg">
                                    <h2 className="flex items-center gap-2 mb-4 font-semibold text-red-900 dark:text-red-200 text-lg">
                                        <XCircle size={18} />
                                        Rejection Reason
                                    </h2>
                                    <p className="text-red-800 dark:text-red-200">{application.rejectionReason}</p>
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
