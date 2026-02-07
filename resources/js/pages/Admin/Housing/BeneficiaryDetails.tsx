import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import AdminContentCard from '../../../components/AdminContentCard';
import Button from '../../../components/Button';
import { 
    ArrowLeft, 
    User, 
    Mail, 
    Phone, 
    MapPin, 
    Calendar,
    Tag,
    Archive,
    RotateCcw,
    CheckCircle,
    XCircle,
    AlertCircle,
    Building,
    FileText,
    Award as AwardIcon,
    X
} from 'lucide-react';

interface BeneficiaryDetailsProps {
    beneficiary: {
        id: string;
        beneficiary_no: string;
        first_name: string;
        middle_name: string | null;
        last_name: string;
        suffix: string | null;
        full_name: string;
        birth_date: string;
        age: number;
        gender: string;
        civil_status: string;
        email: string;
        contact_number: string;
        mobile_number: string | null;
        telephone_number: string | null;
        current_address: string;
        address: string | null;
        street: string | null;
        barangay: string;
        city: string | null;
        province: string | null;
        zip_code: string | null;
        years_of_residency: number;
        employment_status: string;
        occupation: string | null;
        employer_name: string | null;
        monthly_income: number;
        household_income: number | null;
        has_existing_property: boolean;
        priority_status: string;
        priority_id_no: string | null;
        id_type: string | null;
        id_number: string | null;
        sector_tags: string[];
        sectors: Array<{
            value: string;
            label: string;
        }>;
        beneficiary_status: string;
        beneficiary_status_label: string;
        special_eligibility_notes: string | null;
        is_active: boolean;
        archived_at: string | null;
        registered_at: string;
        applications: any[];
        household_members: any[];
        awards: any[];
    };
}

export default function BeneficiaryDetails({ beneficiary }: BeneficiaryDetailsProps) {
    const [showSectorModal, setShowSectorModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    
    const { data: sectorData, setData: setSectorData, patch: patchSectors, processing: sectorProcessing } = useForm({
        sectors: beneficiary.sector_tags || [],
    });

    const { data: statusData, setData: setStatusData, patch: patchStatus, processing: statusProcessing } = useForm({
        beneficiary_status: beneficiary.beneficiary_status,
    });

    const handleUpdateSectors = (e: React.FormEvent) => {
        e.preventDefault();
        patchSectors(`/admin/housing/beneficiaries/${beneficiary.id}/sectors`, {
            preserveScroll: true,
            onSuccess: () => {
                setShowSectorModal(false);
                router.reload({ only: ['beneficiary'] });
            },
        });
    };

    const handleAutoDetectSectors = () => {
        router.post(`/admin/housing/beneficiaries/${beneficiary.id}/auto-detect-sectors`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                router.reload({ only: ['beneficiary'] });
            },
        });
    };

    const handleUpdateStatus = (e: React.FormEvent) => {
        e.preventDefault();
        patchStatus(`/admin/housing/beneficiaries/${beneficiary.id}/status`, {
            preserveScroll: true,
            onSuccess: () => {
                setShowStatusModal(false);
                router.reload({ only: ['beneficiary'] });
            },
        });
    };

    const handleArchive = () => {
        if (confirm('Are you sure you want to archive this beneficiary?')) {
            router.post(`/admin/housing/beneficiaries/${beneficiary.id}/archive`, {}, {
                preserveScroll: true,
                onSuccess: () => {
                    router.reload({ only: ['beneficiary'] });
                },
            });
        }
    };

    const handleRestore = () => {
        router.post(`/admin/housing/beneficiaries/${beneficiary.id}/restore`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                router.reload({ only: ['beneficiary'] });
            },
        });
    };

    const getStatusBadge = (status: string) => {
        const statusColors: Record<string, string> = {
            applicant: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            qualified: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            waitlisted: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            awarded: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
            disqualified: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
            archived: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
        };

        return (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[status.toLowerCase()] || statusColors.archived}`}>
                {beneficiary.beneficiary_status_label}
            </span>
        );
    };

    return (
        <AdminLayout
            title="Beneficiary Details"
            description="View and manage beneficiary information"
            backButton={{
                href: '/admin/housing/beneficiaries',
                label: 'Back to Beneficiaries',
            }}
        >
            <div className="space-y-6">
                {/* Beneficiary Header */}
                <AdminContentCard padding="lg">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                {beneficiary.full_name}
                            </h2>
                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                <span>Beneficiary No: <strong className="text-gray-900 dark:text-white font-mono">{beneficiary.beneficiary_no}</strong></span>
                                <span>Age: <strong className="text-gray-900 dark:text-white">{beneficiary.age} years</strong></span>
                                <span>Registered: <strong className="text-gray-900 dark:text-white">{new Date(beneficiary.registered_at).toLocaleDateString()}</strong></span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {getStatusBadge(beneficiary.beneficiary_status)}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                        <Button
                            variant="secondary"
                            onClick={() => setShowSectorModal(true)}
                            className="flex items-center gap-2"
                        >
                            <Tag size={18} />
                            Manage Sectors
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={handleAutoDetectSectors}
                            className="flex items-center gap-2"
                        >
                            <CheckCircle size={18} />
                            Auto-Detect Sectors
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => setShowStatusModal(true)}
                            className="flex items-center gap-2"
                        >
                            <AlertCircle size={18} />
                            Update Status
                        </Button>
                        {beneficiary.archived_at ? (
                            <Button
                                variant="secondary"
                                onClick={handleRestore}
                                className="flex items-center gap-2"
                            >
                                <RotateCcw size={18} />
                                Restore
                            </Button>
                        ) : (
                            <Button
                                variant="secondary"
                                onClick={handleArchive}
                                className="flex items-center gap-2"
                            >
                                <Archive size={18} />
                                Archive
                            </Button>
                        )}
                    </div>
                </AdminContentCard>

                {/* Personal Information */}
                <AdminContentCard padding="lg">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <User size={20} />
                        Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Full Name</label>
                            <p className="text-gray-900 dark:text-white">{beneficiary.full_name}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Date of Birth</label>
                            <p className="text-gray-900 dark:text-white">{new Date(beneficiary.birth_date).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Gender</label>
                            <p className="text-gray-900 dark:text-white capitalize">{beneficiary.gender}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Civil Status</label>
                            <p className="text-gray-900 dark:text-white capitalize">{beneficiary.civil_status}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Mail size={16} className="text-gray-400" />
                            <div>
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Email</label>
                                <p className="text-gray-900 dark:text-white">{beneficiary.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Phone size={16} className="text-gray-400" />
                            <div>
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Contact Number</label>
                                <p className="text-gray-900 dark:text-white">{beneficiary.contact_number}</p>
                            </div>
                        </div>
                        {beneficiary.mobile_number && (
                            <div>
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Mobile Number</label>
                                <p className="text-gray-900 dark:text-white">{beneficiary.mobile_number}</p>
                            </div>
                        )}
                        {beneficiary.telephone_number && (
                            <div>
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Telephone Number</label>
                                <p className="text-gray-900 dark:text-white">{beneficiary.telephone_number}</p>
                            </div>
                        )}
                    </div>
                </AdminContentCard>

                {/* Address Information */}
                <AdminContentCard padding="lg">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <MapPin size={20} />
                        Address Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Address</label>
                            <p className="text-gray-900 dark:text-white">{beneficiary.current_address}</p>
                        </div>
                        {beneficiary.address && (
                            <div>
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Address</label>
                                <p className="text-gray-900 dark:text-white">{beneficiary.address}</p>
                            </div>
                        )}
                        {beneficiary.street && (
                            <div>
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Street</label>
                                <p className="text-gray-900 dark:text-white">{beneficiary.street}</p>
                            </div>
                        )}
                        <div>
                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Barangay</label>
                            <p className="text-gray-900 dark:text-white">{beneficiary.barangay}</p>
                        </div>
                        {beneficiary.city && (
                            <div>
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">City</label>
                                <p className="text-gray-900 dark:text-white">{beneficiary.city}</p>
                            </div>
                        )}
                        {beneficiary.province && (
                            <div>
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Province</label>
                                <p className="text-gray-900 dark:text-white">{beneficiary.province}</p>
                            </div>
                        )}
                        {beneficiary.zip_code && (
                            <div>
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Zip Code</label>
                                <p className="text-gray-900 dark:text-white">{beneficiary.zip_code}</p>
                            </div>
                        )}
                        <div>
                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Years of Residency</label>
                            <p className="text-gray-900 dark:text-white">{beneficiary.years_of_residency} years</p>
                        </div>
                    </div>
                </AdminContentCard>

                {/* Employment & Income */}
                <AdminContentCard padding="lg">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Building size={20} />
                        Employment & Income
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Employment Status</label>
                            <p className="text-gray-900 dark:text-white capitalize">{beneficiary.employment_status.replace('_', ' ')}</p>
                        </div>
                        {beneficiary.occupation && (
                            <div>
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Occupation</label>
                                <p className="text-gray-900 dark:text-white">{beneficiary.occupation}</p>
                            </div>
                        )}
                        {beneficiary.employer_name && (
                            <div>
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Employer Name</label>
                                <p className="text-gray-900 dark:text-white">{beneficiary.employer_name}</p>
                            </div>
                        )}
                        <div>
                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Income</label>
                            <p className="text-gray-900 dark:text-white">₱{beneficiary.monthly_income.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </div>
                        {beneficiary.household_income && (
                            <div>
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Household Income</label>
                                <p className="text-gray-900 dark:text-white">₱{beneficiary.household_income.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            </div>
                        )}
                        <div>
                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Has Existing Property</label>
                            <p className="text-gray-900 dark:text-white">{beneficiary.has_existing_property ? 'Yes' : 'No'}</p>
                        </div>
                    </div>
                </AdminContentCard>

                {/* Sector Classification */}
                <AdminContentCard padding="lg">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Tag size={20} />
                        Sector Classification
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {beneficiary.sectors.length > 0 ? (
                            beneficiary.sectors.map((sector, idx) => (
                                <span
                                    key={idx}
                                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium"
                                >
                                    {sector.label}
                                </span>
                            ))
                        ) : (
                            <span className="text-gray-500 dark:text-gray-400">No sectors assigned</span>
                        )}
                    </div>
                    {beneficiary.special_eligibility_notes && (
                        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Special Eligibility Notes</label>
                            <p className="text-gray-900 dark:text-white mt-1">{beneficiary.special_eligibility_notes}</p>
                        </div>
                    )}
                </AdminContentCard>

                {/* Priority Status */}
                <AdminContentCard padding="lg">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <AlertCircle size={20} />
                        Priority Status
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Priority Status</label>
                            <p className="text-gray-900 dark:text-white capitalize">{beneficiary.priority_status.replace('_', ' ')}</p>
                        </div>
                        {beneficiary.priority_id_no && (
                            <div>
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Priority ID Number</label>
                                <p className="text-gray-900 dark:text-white">{beneficiary.priority_id_no}</p>
                            </div>
                        )}
                        {beneficiary.id_type && (
                            <div>
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">ID Type</label>
                                <p className="text-gray-900 dark:text-white">{beneficiary.id_type}</p>
                            </div>
                        )}
                        {beneficiary.id_number && (
                            <div>
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">ID Number</label>
                                <p className="text-gray-900 dark:text-white">{beneficiary.id_number}</p>
                            </div>
                        )}
                    </div>
                </AdminContentCard>

                {/* Applications */}
                <AdminContentCard padding="lg">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <FileText size={20} />
                        Applications ({beneficiary.applications.length})
                    </h3>
                    {beneficiary.applications.length === 0 ? (
                        <p className="text-gray-600 dark:text-gray-400">No applications submitted.</p>
                    ) : (
                        <div className="space-y-3">
                            {beneficiary.applications.map((app: any) => (
                                <div
                                    key={app.id}
                                    className="p-4 bg-gray-50 dark:bg-dark-bg rounded-lg border border-gray-200 dark:border-gray-700"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">{app.application_no}</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                {app.housing_program} - {app.application_status}
                                            </p>
                                        </div>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => router.visit(`/admin/housing/applications/${app.id}`)}
                                        >
                                            View
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </AdminContentCard>

                {/* Awards */}
                {beneficiary.awards && beneficiary.awards.length > 0 && (
                    <AdminContentCard padding="lg">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <AwardIcon size={20} />
                            Awards ({beneficiary.awards.length})
                        </h3>
                        <div className="space-y-3">
                            {beneficiary.awards.map((award: any) => (
                                <div
                                    key={award.id}
                                    className="p-4 bg-gray-50 dark:bg-dark-bg rounded-lg border border-gray-200 dark:border-gray-700"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">{award.award_no}</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                Status: {award.award_status} - {award.award_date}
                                            </p>
                                        </div>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => router.visit(`/admin/housing/awards/${award.id}`)}
                                        >
                                            View
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </AdminContentCard>
                )}

                {/* Sector Management Modal */}
                {showSectorModal && (
                    <div
                        className="z-50 fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-sm p-4"
                        onClick={() => setShowSectorModal(false)}
                    >
                        <div
                            className="relative flex flex-col bg-white dark:bg-dark-surface shadow-2xl rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="top-0 z-10 sticky flex justify-between items-center bg-white dark:bg-dark-surface px-6 py-4 border-gray-200 dark:border-gray-700 border-b">
                                <div>
                                    <h2 className="font-bold text-gray-900 dark:text-white text-xl">
                                        Manage Sectors
                                    </h2>
                                    <p className="mt-1 text-gray-500 dark:text-gray-400 text-sm">
                                        Select sectors for this beneficiary
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowSectorModal(false)}
                                    className="hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors"
                                    aria-label="Close modal"
                                >
                                    <X size={24} className="text-gray-500 dark:text-gray-400" />
                                </button>
                            </div>

                            {/* Scrollable Content */}
                            <div className="flex-1 px-6 py-6 overflow-y-auto">
                            <form onSubmit={handleUpdateSectors} className="space-y-4">
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Select Sectors
                                    </label>
                                    <div className="space-y-2">
                                        {['isf', 'pwd', 'senior_citizen', 'solo_parent', 'low_income', 'disaster_affected'].map((sector) => (
                                            <label key={sector} className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={sectorData.sectors.includes(sector)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSectorData('sectors', [...sectorData.sectors, sector]);
                                                        } else {
                                                            setSectorData('sectors', sectorData.sectors.filter((s: string) => s !== sector));
                                                        }
                                                    }}
                                                    className="rounded border-gray-300 dark:border-gray-600"
                                                />
                                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                                    {sector.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        disabled={sectorProcessing}
                                        className="flex-1"
                                    >
                                        {sectorProcessing ? 'Updating...' : 'Update Sectors'}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => setShowSectorModal(false)}
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

                {/* Status Update Modal */}
                {showStatusModal && (
                    <div
                        className="z-50 fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-sm p-4"
                        onClick={() => setShowStatusModal(false)}
                    >
                        <div
                            className="relative flex flex-col bg-white dark:bg-dark-surface shadow-2xl rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="top-0 z-10 sticky flex justify-between items-center bg-white dark:bg-dark-surface px-6 py-4 border-gray-200 dark:border-gray-700 border-b">
                                <div>
                                    <h2 className="font-bold text-gray-900 dark:text-white text-xl">
                                        Update Status
                                    </h2>
                                    <p className="mt-1 text-gray-500 dark:text-gray-400 text-sm">
                                        Update beneficiary status
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
                            <form onSubmit={handleUpdateStatus} className="space-y-4">
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Beneficiary Status
                                    </label>
                                    <select
                                        value={statusData.beneficiary_status}
                                        onChange={(e) => setStatusData('beneficiary_status', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                                    >
                                        <option value="applicant">Applicant</option>
                                        <option value="qualified">Qualified</option>
                                        <option value="waitlisted">Waitlisted</option>
                                        <option value="awarded">Awarded</option>
                                        <option value="disqualified">Disqualified</option>
                                        <option value="archived">Archived</option>
                                    </select>
                                </div>
                                <div className="flex gap-3">
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        disabled={statusProcessing}
                                        className="flex-1"
                                    >
                                        {statusProcessing ? 'Updating...' : 'Update Status'}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => setShowStatusModal(false)}
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
            </div>
        </AdminLayout>
    );
}
