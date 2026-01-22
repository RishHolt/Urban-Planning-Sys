import { Link, usePage } from '@inertiajs/react';
import AdminLayout from '../../../components/AdminLayout';
import AdminContentCard from '../../../components/AdminContentCard';
import { ArrowLeft, User, FileText, TrendingUp, Calendar, List, Home, Mail, Phone, MapPin } from 'lucide-react';

interface WaitlistShowProps {
    waitlist: {
        id: string;
        beneficiary: {
            id: number;
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
        application: {
            id: string;
            application_no: string;
            housing_program: string;
            application_reason: string;
            application_status: string;
            eligibility_status: string;
            submitted_at: string | null;
        };
        housing_program: string;
        priority_score: number;
        queue_position: number;
        waitlist_date: string;
        status: string;
    };
}

export default function WaitlistShow({ waitlist }: WaitlistShowProps) {
    const { flash } = usePage<{ flash?: { success?: string; error?: string } }>().props;

    const getHousingProgramLabel = (program: string): string => {
        const labels: Record<string, string> = {
            'socialized_housing': 'Socialized Housing',
            'relocation': 'Relocation',
            'rental_subsidy': 'Rental Subsidy',
            'housing_loan': 'Housing Loan',
        };
        return labels[program] || program;
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
        <AdminLayout
            title="Waitlist Entry Details"
            description="View detailed information about a waitlist entry"
            backButton={{
                href: '/admin/housing/waitlist',
                label: 'Back to Waitlist',
            }}
        >
            {/* Flash Messages */}
            {flash?.success && (
                <div className="mb-6 p-4 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg">
                    {flash.success}
                </div>
            )}
            {flash?.error && (
                <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg">
                    {flash.error}
                </div>
            )}

            <div className="space-y-6">
                {/* Waitlist Information */}
                <AdminContentCard padding="lg">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                Queue Position #{waitlist.queue_position}
                            </h2>
                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                <span>Waitlist Date: <strong className="text-gray-900 dark:text-white">{formatDate(waitlist.waitlist_date)}</strong></span>
                                <span>Housing Program: <strong className="text-gray-900 dark:text-white">{getHousingProgramLabel(waitlist.housing_program)}</strong></span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg">
                                <TrendingUp size={20} className="text-primary" />
                                <span className="text-2xl font-bold text-primary">{waitlist.priority_score}</span>
                                <span className="text-sm text-gray-600 dark:text-gray-400">Priority Score</span>
                            </div>
                        </div>
                    </div>
                </AdminContentCard>

                {/* Beneficiary Information */}
                <AdminContentCard padding="lg">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <User size={20} />
                        Beneficiary Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Beneficiary Number</label>
                            <p className="text-gray-900 dark:text-white font-mono">{waitlist.beneficiary.beneficiary_no}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Full Name</label>
                            <p className="text-gray-900 dark:text-white">
                                {waitlist.beneficiary.first_name} {waitlist.beneficiary.middle_name} {waitlist.beneficiary.last_name}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Mail size={16} className="text-gray-400" />
                            <div>
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Email</label>
                                <p className="text-gray-900 dark:text-white">{waitlist.beneficiary.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Phone size={16} className="text-gray-400" />
                            <div>
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Contact Number</label>
                                <p className="text-gray-900 dark:text-white">{waitlist.beneficiary.contact_number}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin size={16} className="text-gray-400" />
                            <div>
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Address</label>
                                <p className="text-gray-900 dark:text-white">{waitlist.beneficiary.current_address}</p>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Barangay</label>
                            <p className="text-gray-900 dark:text-white">{waitlist.beneficiary.barangay}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Priority Status</label>
                            <p className="text-gray-900 dark:text-white capitalize">{waitlist.beneficiary.priority_status.replace('_', ' ')}</p>
                        </div>
                    </div>
                </AdminContentCard>

                {/* Application Information */}
                <AdminContentCard padding="lg">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <FileText size={20} />
                        Application Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Application Number</label>
                            <p className="text-gray-900 dark:text-white font-mono">{waitlist.application.application_no}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Housing Program</label>
                            <p className="text-gray-900 dark:text-white">{getHousingProgramLabel(waitlist.application.housing_program)}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Application Status</label>
                            <p className="text-gray-900 dark:text-white capitalize">{waitlist.application.application_status.replace('_', ' ')}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Eligibility Status</label>
                            <p className="text-gray-900 dark:text-white capitalize">{waitlist.application.eligibility_status.replace('_', ' ')}</p>
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Application Reason</label>
                            <p className="text-gray-900 dark:text-white">{waitlist.application.application_reason}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Submitted At</label>
                            <p className="text-gray-900 dark:text-white">{formatDate(waitlist.application.submitted_at)}</p>
                        </div>
                    </div>
                    <div className="mt-4">
                        <Link
                            href={`/admin/housing/applications/${waitlist.application.id}`}
                            className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline font-medium"
                        >
                            <FileText size={16} />
                            View Full Application Details
                        </Link>
                    </div>
                </AdminContentCard>
            </div>
        </AdminLayout>
    );
}
