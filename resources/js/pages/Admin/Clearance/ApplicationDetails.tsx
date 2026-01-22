import { useState } from 'react';
import { Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '../../../components/AdminLayout';
import Button from '../../../components/Button';
import PropertyLocation from '../../../components/Applications/PropertyLocation';
import StatusHistory from '../../../components/StatusHistory';
import { 
    FileText, MapPin, Calendar, CheckCircle, XCircle, Clock, Building, User, Mail, Phone, 
    Download, Eye, Shield, CreditCard, Search, AlertCircle, Edit, Send, X
} from 'lucide-react';

interface Zone {
    id: number;
    name: string;
    code: string;
    geometry?: string;
    color?: string;
}

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

interface ExternalVerification {
    id: number;
    verification_type: string;
    reference_no: string;
    status: string;
    external_system: string;
    verified_at: string | null;
}

interface PaymentRecord {
    or_number: string;
    amount: number;
    payment_date: string;
    treasury_ref?: string;
    recorded_by?: number;
}

interface Inspection {
    id: number;
    inspector_id?: number;
    scheduled_date: string;
    findings: string | null;
    result: 'pending' | 'passed' | 'failed';
    inspected_at: string | null;
}

interface IssuedClearance {
    id: number;
    clearance_no: string;
    issue_date: string;
    valid_until?: string | null;
    conditions?: string | null;
    status?: string;
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
    externalVerifications: ExternalVerification[];
    pin_lat: number;
    pin_lng: number;
    zone: Zone | null;
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
    total_lots_planned?: number | null;
    has_subdivision_plan: boolean;
    land_use_type: string;
    project_type: string;
    building_type?: string | null;
    project_description: string;
    existing_structure: string;
    number_of_storeys?: number | null;
    floor_area_sqm?: number | null;
    estimated_cost?: number | null;
    purpose: string;
    documents: Document[];
    history: History[];
    paymentRecord: PaymentRecord | null;
    inspection: Inspection | null;
    issuedClearance: IssuedClearance | null;
    submitted_at: string | null;
    processed_at?: string | null;
    created_at: string;
}

interface ApplicationDetailsProps {
    application: Application;
}

export default function ApplicationDetails({ application }: ApplicationDetailsProps) {
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [showDocumentRequestModal, setShowDocumentRequestModal] = useState(false);
    const { data: statusData, setData: setStatusData, patch, processing } = useForm({
        status: application.status,
        remarks: '',
        denial_reason: '',
    });
    const { data: documentRequestData, setData: setDocumentRequestData, post } = useForm({
        message: '',
        requested_document_types: [] as string[],
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        <CheckCircle size={16} />
                        Approved
                    </span>
                );
            case 'denied':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                        <XCircle size={16} />
                        Denied
                    </span>
                );
            case 'for_inspection':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        <Search size={16} />
                        For Inspection
                    </span>
                );
            case 'under_review':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                        <Clock size={16} />
                        Under Review
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                        <Clock size={16} />
                        Pending
                    </span>
                );
        }
    };

    const handleStatusUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        patch(`/admin/zoning/clearance/applications/${application.id}/status`, {
            preserveScroll: true,
            onSuccess: () => {
                setShowStatusModal(false);
                setStatusData({ status: application.status, remarks: '', denial_reason: '' });
            },
        });
    };

    const handleDocumentRequest = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/admin/zoning/clearance/applications/${application.id}/request-documents`, {
            preserveScroll: true,
            onSuccess: () => {
                setShowDocumentRequestModal(false);
                setDocumentRequestData({ message: '', requested_document_types: [] });
            },
        });
    };

    const canRequestDocuments = ['pending', 'under_review'].includes(application.status);
    const canUpdateStatus = ['pending', 'under_review', 'for_inspection'].includes(application.status);

    return (
        <AdminLayout
            title="Application Details"
            description="View and manage clearance application"
            backButton={{
                href: '/admin/zoning/clearance/applications',
                label: 'Back to Clearance Applications',
            }}
        >
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white dark:bg-dark-surface rounded-lg shadow-md p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                {application.reference_no}
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 capitalize">
                                {application.application_category.replace('_', ' ')}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            {getStatusBadge(application.status)}
                            {canUpdateStatus && (
                                <Button onClick={() => setShowStatusModal(true)} variant="outline" size="sm">
                                    <Edit size={16} className="mr-2" />
                                    Update Status
                                </Button>
                            )}
                            {canRequestDocuments && (
                                <Button onClick={() => setShowDocumentRequestModal(true)} variant="outline" size="sm">
                                    <Send size={16} className="mr-2" />
                                    Request Documents
                                </Button>
                            )}
                            {application.status === 'approved' && !application.issuedClearance && (
                                <Link href={`/admin/zoning/clearance/applications/${application.id}/issue`}>
                                    <Button>
                                        Issue Clearance
                                    </Button>
                                </Link>
                            )}
                            {application.issuedClearance && (
                                <Link href={`/admin/zoning/clearance/${application.issuedClearance.id}`}>
                                    <Button variant="outline">
                                        View Clearance
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>
                    {application.denial_reason && (
                        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <div className="flex items-start gap-2">
                                <AlertCircle size={20} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-red-800 dark:text-red-200">Denial Reason</p>
                                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">{application.denial_reason}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Applicant Information */}
                <div className="bg-white dark:bg-dark-surface rounded-lg shadow-md p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <User size={20} />
                        Applicant Information
                    </h2>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">Applicant Type</span>
                            <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white capitalize">
                                {application.applicant_type.replace('_', ' ')}
                            </p>
                        </div>
                        <div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">Contact Number</span>
                            <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                <Phone size={14} />
                                {application.contact_number}
                            </p>
                        </div>
                        {application.contact_email && (
                            <div>
                                <span className="text-sm text-gray-500 dark:text-gray-400">Contact Email</span>
                                <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                    <Mail size={14} />
                                    {application.contact_email}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Prerequisites (API Verified) */}
                <div className="bg-white dark:bg-dark-surface rounded-lg shadow-md p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Shield size={20} />
                        Prerequisites Verification
                    </h2>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <span className="text-sm text-gray-500 dark:text-gray-400">Tax Declaration Ref No.</span>
                                <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                                    {application.tax_dec_ref_no}
                                </p>
                            </div>
                            <div>
                                <span className="text-sm text-gray-500 dark:text-gray-400">Barangay Permit Ref No.</span>
                                <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                                    {application.barangay_permit_ref_no}
                                </p>
                            </div>
                        </div>
                        {application.externalVerifications.length > 0 && (
                            <div className="mt-4">
                                <span className="text-sm text-gray-500 dark:text-gray-400 block mb-2">Verification Status</span>
                                <div className="space-y-2">
                                    {application.externalVerifications.map((verification) => (
                                        <div key={verification.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                                                    {verification.verification_type.replace('_', ' ')}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {verification.external_system} • {verification.reference_no}
                                                </p>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                verification.status === 'verified' 
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                    : verification.status === 'failed'
                                                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                            }`}>
                                                {verification.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Property Information */}
                <div className="bg-white dark:bg-dark-surface rounded-lg shadow-md p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Building size={20} />
                        Property Information
                    </h2>
                    <div className="grid grid-cols-2 gap-6 mb-6">
                        <div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">Lot Owner</span>
                            <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                                {application.lot_owner}
                            </p>
                        </div>
                        <div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">Lot Area</span>
                            <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                                {application.lot_area_total.toLocaleString()} sqm
                            </p>
                        </div>
                        {application.is_subdivision && (
                            <>
                                {application.subdivision_name && (
                                    <div>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">Subdivision Name</span>
                                        <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                                            {application.subdivision_name}
                                        </p>
                                    </div>
                                )}
                                {application.block_no && (
                                    <div>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">Block No.</span>
                                        <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                                            {application.block_no}
                                        </p>
                                    </div>
                                )}
                                {application.lot_no && (
                                    <div>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">Lot No.</span>
                                        <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                                            {application.lot_no}
                                        </p>
                                    </div>
                                )}
                                {application.total_lots_planned && (
                                    <div>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">Total Lots Planned</span>
                                        <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                                            {application.total_lots_planned}
                                        </p>
                                    </div>
                                )}
                                <div>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Has Subdivision Plan</span>
                                    <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                                        {application.has_subdivision_plan ? 'Yes' : 'No'}
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                    <div className="col-span-2">
                        <PropertyLocation
                            mode="view"
                            pinLat={application.pin_lat}
                            pinLng={application.pin_lng}
                            lotAddress={application.lot_address}
                            province={application.province}
                            municipality={application.municipality}
                            barangay={application.barangay}
                            streetName={application.street_name}
                            zone={application.zone ? {
                                id: application.zone.id,
                                name: application.zone.name,
                                code: application.zone.code,
                                geometry: application.zone.geometry,
                                color: application.zone.color,
                            } : null}
                            showMap={true}
                        />
                    </div>
                </div>

                {/* Project Details */}
                <div className="bg-white dark:bg-dark-surface rounded-lg shadow-md p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <FileText size={20} />
                        Project Details
                    </h2>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">Land Use Type</span>
                            <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white capitalize">
                                {application.land_use_type.replace('_', ' ')}
                            </p>
                        </div>
                        <div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">Project Type</span>
                            <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white capitalize">
                                {application.project_type.replace('_', ' ')}
                            </p>
                        </div>
                        {application.building_type && (
                            <div>
                                <span className="text-sm text-gray-500 dark:text-gray-400">Building Type</span>
                                <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                                    {application.building_type}
                                </p>
                            </div>
                        )}
                        <div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">Existing Structure</span>
                            <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white capitalize">
                                {application.existing_structure.replace('_', ' ')}
                            </p>
                        </div>
                        {application.number_of_storeys && (
                            <div>
                                <span className="text-sm text-gray-500 dark:text-gray-400">Number of Storeys</span>
                                <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                                    {application.number_of_storeys}
                                </p>
                            </div>
                        )}
                        {application.floor_area_sqm && (
                            <div>
                                <span className="text-sm text-gray-500 dark:text-gray-400">Floor Area</span>
                                <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                                    {application.floor_area_sqm.toLocaleString()} sqm
                                </p>
                            </div>
                        )}
                        {application.estimated_cost && (
                            <div>
                                <span className="text-sm text-gray-500 dark:text-gray-400">Estimated Cost</span>
                                <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                                    ₱{application.estimated_cost.toLocaleString()}
                                </p>
                            </div>
                        )}
                        {application.assessed_fee && (
                            <div>
                                <span className="text-sm text-gray-500 dark:text-gray-400">Assessed Fee</span>
                                <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                                    ₱{application.assessed_fee.toLocaleString()}
                                </p>
                            </div>
                        )}
                        <div className="col-span-2">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Project Description</span>
                            <p className="mt-1 text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                                {application.project_description}
                            </p>
                        </div>
                        <div className="col-span-2">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Purpose</span>
                            <p className="mt-1 text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                                {application.purpose}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Payment Record */}
                {application.paymentRecord && (
                    <div className="bg-white dark:bg-dark-surface rounded-lg shadow-md p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <CreditCard size={20} />
                            Payment Information
                        </h2>
                        <div className="grid grid-cols-3 gap-6">
                            <div>
                                <span className="text-sm text-gray-500 dark:text-gray-400">OR Number</span>
                                <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                                    {application.paymentRecord.or_number}
                                </p>
                            </div>
                            <div>
                                <span className="text-sm text-gray-500 dark:text-gray-400">Amount</span>
                                <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                                    ₱{application.paymentRecord.amount.toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <span className="text-sm text-gray-500 dark:text-gray-400">Payment Date</span>
                                <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                                    {new Date(application.paymentRecord.payment_date).toLocaleDateString()}
                                </p>
                            </div>
                            {application.paymentRecord.treasury_ref && (
                                <div>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Treasury Reference</span>
                                    <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                                        {application.paymentRecord.treasury_ref}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Inspection */}
                {application.inspection && (
                    <div className="bg-white dark:bg-dark-surface rounded-lg shadow-md p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Inspection Information
                        </h2>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Scheduled Date</span>
                                    <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                                        {new Date(application.inspection.scheduled_date).toLocaleDateString()}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Result</span>
                                    <p className="mt-1">
                                        {application.inspection.result === 'passed' ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                <CheckCircle size={12} />
                                                Passed
                                            </span>
                                        ) : application.inspection.result === 'failed' ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                                <XCircle size={12} />
                                                Failed
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                                <Clock size={12} />
                                                Pending
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>
                            {application.inspection.findings && (
                                <div>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Findings</span>
                                    <p className="mt-1 text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                                        {application.inspection.findings}
                                    </p>
                                </div>
                            )}
                            {application.inspection.inspected_at && (
                                <div>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Inspected At</span>
                                    <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                                        {new Date(application.inspection.inspected_at).toLocaleString()}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Issued Clearance */}
                {application.issuedClearance && (
                    <div className="bg-white dark:bg-dark-surface rounded-lg shadow-md p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Issued Clearance
                        </h2>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <span className="text-sm text-gray-500 dark:text-gray-400">Clearance Number</span>
                                <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                                    {application.issuedClearance.clearance_no}
                                </p>
                            </div>
                            <div>
                                <span className="text-sm text-gray-500 dark:text-gray-400">Issue Date</span>
                                <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                                    {new Date(application.issuedClearance.issue_date).toLocaleDateString()}
                                </p>
                            </div>
                            {application.issuedClearance.valid_until && (
                                <div>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Valid Until</span>
                                    <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                                        {new Date(application.issuedClearance.valid_until).toLocaleDateString()}
                                    </p>
                                </div>
                            )}
                            {application.issuedClearance.status && (
                                <div>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Status</span>
                                    <p className="mt-1">
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                            application.issuedClearance.status === 'active'
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                : application.issuedClearance.status === 'expired'
                                                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                        }`}>
                                            {application.issuedClearance.status}
                                        </span>
                                    </p>
                                </div>
                            )}
                            {application.issuedClearance.conditions && (
                                <div className="col-span-2">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Conditions</span>
                                    <p className="mt-1 text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                                        {application.issuedClearance.conditions}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Documents */}
                <div className="bg-white dark:bg-dark-surface rounded-lg shadow-md p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <FileText size={20} />
                        Documents
                    </h2>
                    {application.documents.length === 0 ? (
                        <div className="text-center py-8">
                            <FileText size={48} className="text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                            <p className="text-gray-500 dark:text-gray-400">No documents uploaded yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {application.documents.map((doc) => (
                                <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <FileText size={16} className="text-gray-400" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                {doc.file_name}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {doc.file_type && `${doc.file_type} • `}
                                                {doc.file_size && `${(doc.file_size / 1024).toFixed(2)} KB • `}
                                                Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <a
                                        href={`/storage/${doc.file_path}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline text-sm flex items-center gap-1"
                                    >
                                        <Eye size={16} />
                                        View
                                    </a>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* History */}
                {application.history.length > 0 && (
                    <div className="bg-white dark:bg-dark-surface rounded-lg shadow-md p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Calendar size={20} />
                            Status History
                        </h2>
                        <StatusHistory history={application.history.map(h => ({
                            id: h.id,
                            statusFrom: null,
                            statusTo: h.status,
                            changedBy: h.updated_by,
                            notes: h.remarks,
                            createdAt: h.updated_at,
                        }))} />
                    </div>
                )}

                {/* Status Update Modal */}
                {showStatusModal && (
                    <div
                        className="z-50 fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-sm"
                        onClick={() => setShowStatusModal(false)}
                    >
                        <div
                            className="relative flex flex-col bg-white dark:bg-dark-surface shadow-2xl mx-4 rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex flex-shrink-0 justify-between items-center px-6 py-4 border-gray-200 dark:border-gray-700 border-b">
                                <div>
                                    <h2 className="font-bold text-gray-900 dark:text-white text-xl">
                                        Update Status
                                    </h2>
                                    <p className="mt-1 text-gray-500 dark:text-gray-400 text-sm">
                                        Change the application status
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowStatusModal(false)}
                                    className="hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors"
                                    aria-label="Close modal"
                                >
                                    <X size={24} className="text-gray-500 dark:text-gray-400" />
                                </button>
                            </div>

                            {/* Scrollable Content */}
                            <div className="flex-1 px-6 py-6 overflow-y-auto">
                                <form onSubmit={handleStatusUpdate}>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                New Status
                                            </label>
                                            <select
                                                value={statusData.status}
                                                onChange={(e) => setStatusData('status', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
                                                required
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="under_review">Under Review</option>
                                                <option value="for_inspection">For Inspection</option>
                                                <option value="approved">Approved</option>
                                                <option value="denied">Denied</option>
                                            </select>
                                        </div>
                                        {statusData.status === 'denied' && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Denial Reason
                                                </label>
                                                <textarea
                                                    value={statusData.denial_reason}
                                                    onChange={(e) => setStatusData('denial_reason', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
                                                    rows={3}
                                                    required
                                                />
                                            </div>
                                        )}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Remarks
                                            </label>
                                            <textarea
                                                value={statusData.remarks}
                                                onChange={(e) => setStatusData('remarks', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
                                                rows={3}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-3 mt-6">
                                        <Button type="submit" disabled={processing}>
                                            Update Status
                                        </Button>
                                        <Button type="button" variant="outline" onClick={() => setShowStatusModal(false)}>
                                            Cancel
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Document Request Modal */}
                {showDocumentRequestModal && (
                    <div
                        className="z-50 fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-sm"
                        onClick={() => setShowDocumentRequestModal(false)}
                    >
                        <div
                            className="relative flex flex-col bg-white dark:bg-dark-surface shadow-2xl mx-4 rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex flex-shrink-0 justify-between items-center px-6 py-4 border-gray-200 dark:border-gray-700 border-b">
                                <div>
                                    <h2 className="font-bold text-gray-900 dark:text-white text-xl">
                                        Request Documents
                                    </h2>
                                    <p className="mt-1 text-gray-500 dark:text-gray-400 text-sm">
                                        Request additional documents from the applicant
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowDocumentRequestModal(false)}
                                    className="hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors"
                                    aria-label="Close modal"
                                >
                                    <X size={24} className="text-gray-500 dark:text-gray-400" />
                                </button>
                            </div>

                            {/* Scrollable Content */}
                            <div className="flex-1 px-6 py-6 overflow-y-auto">
                                <form onSubmit={handleDocumentRequest}>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Message
                                            </label>
                                            <textarea
                                                value={documentRequestData.message}
                                                onChange={(e) => setDocumentRequestData('message', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
                                                rows={4}
                                                required
                                                placeholder="Specify which documents are needed..."
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-3 mt-6">
                                        <Button type="submit" disabled={processing}>
                                            Send Request
                                        </Button>
                                        <Button type="button" variant="outline" onClick={() => setShowDocumentRequestModal(false)}>
                                            Cancel
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
