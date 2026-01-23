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
    purpose: string;
    documents: Document[];
    history: History[];
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
                <section className="bg-white dark:bg-dark-surface rounded-lg shadow-lg p-6">
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
                </section>

                {/* Applicant Information */}
                <section className="bg-white dark:bg-dark-surface rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <User size={20} />
                        Applicant Information
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2">
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
                                Contact Number
                            </label>
                            <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                                <Phone size={14} />
                                <span>{application.contact_number}</span>
                            </div>
                        </div>
                        {application.contact_email && (
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Contact Email
                                </label>
                                <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                                    <Mail size={14} />
                                    <span>{application.contact_email}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* Prerequisites (API Verified) */}
                <section className="bg-white dark:bg-dark-surface rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Shield size={20} />
                        Prerequisites Verification
                    </h2>
                    <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Tax Declaration Ref No.
                                </label>
                                <p className="text-gray-900 dark:text-white">
                                    {application.tax_dec_ref_no}
                                </p>
                            </div>
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Barangay Permit Ref No.
                                </label>
                                <p className="text-gray-900 dark:text-white">
                                    {application.barangay_permit_ref_no}
                                </p>
                            </div>
                        </div>
                        {application.externalVerifications.length > 0 && (
                            <div className="mt-4">
                                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Verification Status</label>
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
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${verification.status === 'verified'
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
                </section>

                {/* Property Information */}
                <section className="bg-white dark:bg-dark-surface rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Building size={20} />
                        Property Information
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2 mb-6">
                        <div>
                            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                Lot Owner
                            </label>
                            <p className="text-gray-900 dark:text-white">
                                {application.lot_owner}
                            </p>
                        </div>
                        <div>
                            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                Lot Area
                            </label>
                            <p className="text-gray-900 dark:text-white">
                                {application.lot_area_total.toLocaleString()} sqm
                            </p>
                        </div>
                        {application.is_subdivision && (
                            <>
                                {application.subdivision_name && (
                                    <div>
                                        <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Subdivision Name
                                        </label>
                                        <p className="text-gray-900 dark:text-white">
                                            {application.subdivision_name}
                                        </p>
                                    </div>
                                )}
                                {application.block_no && (
                                    <div>
                                        <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Block No.
                                        </label>
                                        <p className="text-gray-900 dark:text-white">
                                            {application.block_no}
                                        </p>
                                    </div>
                                )}
                                {application.lot_no && (
                                    <div>
                                        <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Lot No.
                                        </label>
                                        <p className="text-gray-900 dark:text-white">
                                            {application.lot_no}
                                        </p>
                                    </div>
                                )}
                                {application.total_lots_planned && (
                                    <div>
                                        <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Total Lots Planned
                                        </label>
                                        <p className="text-gray-900 dark:text-white">
                                            {application.total_lots_planned}
                                        </p>
                                    </div>
                                )}
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Has Subdivision Plan
                                    </label>
                                    <p className="text-gray-900 dark:text-white">
                                        {application.has_subdivision_plan ? 'Yes' : 'No'}
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                    <div className="mt-6">
                        <PropertyLocation
                            mode="view"
                            pinLat={application.pin_lat}
                            pinLng={application.pin_lng}
                            lotAddress={application.lot_address}
                            province={application.province || undefined}
                            municipality={application.municipality || undefined}
                            barangay={application.barangay || undefined}
                            streetName={application.street_name || undefined}
                            zone={application.zone ? {
                                id: application.zone.id,
                                name: application.zone.name,
                                code: application.zone.code,
                                geometry: application.zone.geometry as any,
                                color: application.zone.color,
                            } : null}
                            showMap={true}
                        />
                    </div>
                </section>

                {/* Project Details */}
                <section className="bg-white dark:bg-dark-surface rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <FileText size={20} />
                        Project Details
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2">
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
                                <p className="text-gray-900 dark:text-white">
                                    {application.building_type}
                                </p>
                            </div>
                        )}
                        <div>
                            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                Existing Structure
                            </label>
                            <p className="text-gray-900 dark:text-white capitalize">
                                {application.existing_structure.replace('_', ' ')}
                            </p>
                        </div>
                        {application.number_of_storeys && (
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Number of Storeys
                                </label>
                                <p className="text-gray-900 dark:text-white">
                                    {application.number_of_storeys}
                                </p>
                            </div>
                        )}
                        {application.floor_area_sqm && (
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Floor Area
                                </label>
                                <p className="text-gray-900 dark:text-white">
                                    {application.floor_area_sqm.toLocaleString()} sqm
                                </p>
                            </div>
                        )}
                        {application.assessed_fee && (
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Assessed Fee
                                </label>
                                <p className="text-gray-900 dark:text-white">
                                    ₱{application.assessed_fee.toLocaleString()}
                                </p>
                            </div>
                        )}
                        {application.project_description && (
                            <div className="md:col-span-2">
                                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Project Description
                                </label>
                                <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                                    {application.project_description}
                                </p>
                            </div>
                        )}
                        {application.purpose && (
                            <div className="md:col-span-2">
                                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Purpose
                                </label>
                                <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                                    {application.purpose}
                                </p>
                            </div>
                        )}
                    </div>
                </section>


                {/* Inspection */}
                {application.inspection && (
                    <section className="bg-white dark:bg-dark-surface rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Search size={20} />
                            Inspection Information
                        </h2>
                        <div className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Scheduled Date
                                    </label>
                                    <p className="text-gray-900 dark:text-white">
                                        {new Date(application.inspection.scheduled_date).toLocaleDateString()}
                                    </p>
                                </div>
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Result
                                    </label>
                                    <div className="mt-1">
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
                                    </div>
                                </div>
                            </div>
                            {application.inspection.findings && (
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Findings
                                    </label>
                                    <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                                        {application.inspection.findings}
                                    </p>
                                </div>
                            )}
                            {application.inspection.inspected_at && (
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Inspected At
                                    </label>
                                    <p className="text-gray-900 dark:text-white">
                                        {new Date(application.inspection.inspected_at).toLocaleString()}
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* Issued Clearance */}
                {application.issuedClearance && (
                    <section className="bg-white dark:bg-dark-surface rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <CheckCircle size={20} />
                            Issued Clearance
                        </h2>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Clearance Number
                                </label>
                                <p className="text-gray-900 dark:text-white">
                                    {application.issuedClearance.clearance_no}
                                </p>
                            </div>
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Issue Date
                                </label>
                                <p className="text-gray-900 dark:text-white">
                                    {new Date(application.issuedClearance.issue_date).toLocaleDateString()}
                                </p>
                            </div>
                            {application.issuedClearance.valid_until && (
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Valid Until
                                    </label>
                                    <p className="text-gray-900 dark:text-white">
                                        {new Date(application.issuedClearance.valid_until).toLocaleDateString()}
                                    </p>
                                </div>
                            )}
                            {application.issuedClearance.status && (
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Status
                                    </label>
                                    <div className="mt-1">
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${application.issuedClearance.status === 'active'
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                            : application.issuedClearance.status === 'expired'
                                                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                            }`}>
                                            {application.issuedClearance.status}
                                        </span>
                                    </div>
                                </div>
                            )}
                            {application.issuedClearance.conditions && (
                                <div className="md:col-span-2">
                                    <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Conditions
                                    </label>
                                    <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                                        {application.issuedClearance.conditions}
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* Documents */}
                <section className="bg-white dark:bg-dark-surface rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
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
                </section>

                {/* History */}
                {application.history.length > 0 && (
                    <section className="bg-white dark:bg-dark-surface rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Clock size={20} />
                            Status History
                        </h2>
                        <StatusHistory history={application.history.map(h => ({
                            id: h.id,
                            statusFrom: null,
                            statusTo: h.status,
                            changedBy: h.updated_by,
                            notes: h.remarks,
                            createdAt: h.updated_at,
                        })) as any} />
                    </section>
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
