import { useState } from 'react';
import { Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '../../../components/AdminLayout';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import { FileText, Calendar, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';

interface ReviewDetailsProps {
    review: {
        id: string;
        plReferenceNo: string;
        zoningClearanceNo: string;
        buildingPermitNo: string;
        applicantName: string;
        contactNumber: string;
        projectAddress: string;
        projectDescription: string;
        numberOfStoreys: number | null;
        floorAreaSqm: number | null;
        status: string;
        denialReason: string | null;
        fetchedAt: string | null;
        reviewedAt: string | null;
        postedAt: string | null;
        planChecks: Array<{
            id: number;
            checkType: string;
            result: string;
            findings: string;
            recommendations: string;
            reviewedAt: string;
        }>;
        history: Array<{
            status: string;
            remarks: string;
            updatedAt: string;
        }>;
    };
}

export default function ReviewDetails({ review }: ReviewDetailsProps) {
    const [showCheckModal, setShowCheckModal] = useState(false);
    const { data, setData, post, processing } = useForm({
        building_review_id: review.id,
        check_type: 'safety_sanitation' as 'safety_sanitation' | 'structural' | 'deed_restrictions',
        result: 'passed' as 'passed' | 'failed' | 'conditional',
        findings: '',
        recommendations: '',
    });

    const handleCheckSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/building/reviews/plan-checks', {
            preserveScroll: true,
            onSuccess: () => {
                setShowCheckModal(false);
                setData({
                    building_review_id: review.id,
                    check_type: 'safety_sanitation',
                    result: 'passed',
                    findings: '',
                    recommendations: '',
                });
            },
        });
    };

    const handlePostToPL = () => {
        if (confirm('Are you sure you want to post this review result to Permit & Licensing?')) {
            router.post(`/admin/building/reviews/${review.id}/post-to-pl`, {
                preserveScroll: true,
            });
        }
    };

    const getStatusBadge = (status: string) => {
        const colors: Record<string, string> = {
            fetched: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
            under_review: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
            approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
            denied: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
            posted: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
        };
        return (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
                {status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
        );
    };

    const checkTypes = [
        { value: 'safety_sanitation', label: 'Safety & Sanitation' },
        { value: 'structural', label: 'Structural Integrity' },
        { value: 'deed_restrictions', label: 'Deed Restrictions' },
    ];

    const completedChecks = review.planChecks.map(c => c.checkType);
    const remainingChecks = checkTypes.filter(c => !completedChecks.includes(c.value));

    return (
        <AdminLayout
            title={`Building Review: ${review.plReferenceNo}`}
            description="Review building plans from Permit & Licensing"
            backButton={{
                href: '/admin/building/reviews',
                label: 'Back to Reviews',
            }}
        >
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="mb-2 font-bold text-gray-900 dark:text-white text-2xl">
                            {review.buildingPermitNo}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Applicant: {review.applicantName}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {getStatusBadge(review.status)}
                        {review.status === 'approved' && review.status !== 'posted' && (
                            <Button
                                variant="primary"
                                size="md"
                                onClick={handlePostToPL}
                            >
                                Post to P&L
                            </Button>
                        )}
                        {review.status === 'under_review' && remainingChecks.length > 0 && (
                            <Button
                                variant="primary"
                                size="md"
                                onClick={() => setShowCheckModal(true)}
                            >
                                Add Plan Check
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Project Information */}
                        <div className="bg-white dark:bg-dark-surface shadow-lg rounded-lg p-6">
                            <h3 className="mb-4 font-semibold text-gray-900 dark:text-white text-lg flex items-center gap-2">
                                <FileText size={20} />
                                Project Information
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Building Permit No
                                    </label>
                                    <p className="text-gray-900 dark:text-white">{review.buildingPermitNo}</p>
                                </div>
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Zoning Clearance
                                    </label>
                                    <p className="text-gray-900 dark:text-white">{review.zoningClearanceNo}</p>
                                </div>
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Number of Storeys
                                    </label>
                                    <p className="text-gray-900 dark:text-white">{review.numberOfStoreys || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Floor Area
                                    </label>
                                    <p className="text-gray-900 dark:text-white">
                                        {review.floorAreaSqm ? `${review.floorAreaSqm.toLocaleString()} sqm` : 'N/A'}
                                    </p>
                                </div>
                                <div className="col-span-2">
                                    <label className="block mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Project Address
                                    </label>
                                    <p className="text-gray-900 dark:text-white">{review.projectAddress}</p>
                                </div>
                                {review.projectDescription && (
                                    <div className="col-span-2">
                                        <label className="block mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Description
                                        </label>
                                        <p className="text-gray-900 dark:text-white">{review.projectDescription}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Plan Checks */}
                        <div className="bg-white dark:bg-dark-surface shadow-lg rounded-lg p-6">
                            <h3 className="mb-4 font-semibold text-gray-900 dark:text-white text-lg">
                                Plan Checks
                            </h3>
                            <div className="space-y-4">
                                {review.planChecks.map((check) => (
                                    <div key={check.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-medium text-gray-900 dark:text-white">
                                                {checkTypes.find(c => c.value === check.checkType)?.label || check.checkType}
                                            </h4>
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                check.result === 'passed' ? 'bg-green-100 text-green-800' :
                                                check.result === 'failed' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {check.result.replace(/\b\w/g, l => l.toUpperCase())}
                                            </span>
                                        </div>
                                        {check.findings && <p className="mb-2 text-gray-600 dark:text-gray-400 text-sm"><strong>Findings:</strong> {check.findings}</p>}
                                        {check.recommendations && <p className="text-gray-600 dark:text-gray-400 text-sm"><strong>Recommendations:</strong> {check.recommendations}</p>}
                                        <p className="mt-2 text-gray-500 dark:text-gray-400 text-xs">
                                            {new Date(check.reviewedAt).toLocaleString()}
                                        </p>
                                    </div>
                                ))}
                                {review.planChecks.length === 0 && (
                                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                                        No plan checks completed yet
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Status History */}
                        <div className="bg-white dark:bg-dark-surface shadow-lg rounded-lg p-6">
                            <h3 className="mb-4 font-semibold text-gray-900 dark:text-white text-lg flex items-center gap-2">
                                <Calendar size={20} />
                                Status History
                            </h3>
                            <div className="space-y-3">
                                {review.history.map((h, idx) => (
                                    <div key={idx} className="flex items-start gap-3">
                                        <div className="mt-1 w-2 h-2 bg-primary rounded-full" />
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900 dark:text-white text-sm">
                                                {h.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                            </p>
                                            {h.remarks && <p className="text-gray-500 dark:text-gray-400 text-xs">{h.remarks}</p>}
                                            <p className="text-gray-400 dark:text-gray-500 text-xs">
                                                {new Date(h.updatedAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Plan Check Modal */}
            {showCheckModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white dark:bg-dark-surface rounded-lg p-6 max-w-2xl w-full mx-4">
                        <h3 className="mb-4 font-semibold text-gray-900 dark:text-white text-xl">
                            Add Plan Check
                        </h3>
                        <form onSubmit={handleCheckSubmit} className="space-y-4">
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Check Type *
                                </label>
                                <select
                                    value={data.check_type}
                                    onChange={(e) => setData('check_type', e.target.value as any)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
                                >
                                    {remainingChecks.map((check) => (
                                        <option key={check.value} value={check.value}>
                                            {check.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Result *
                                </label>
                                <select
                                    value={data.result}
                                    onChange={(e) => setData('result', e.target.value as any)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
                                >
                                    <option value="passed">Passed</option>
                                    <option value="failed">Failed</option>
                                    <option value="conditional">Conditional</option>
                                </select>
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Findings
                                </label>
                                <textarea
                                    value={data.findings}
                                    onChange={(e) => setData('findings', e.target.value)}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Recommendations
                                </label>
                                <textarea
                                    value={data.recommendations}
                                    onChange={(e) => setData('recommendations', e.target.value)}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setShowCheckModal(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" variant="primary" disabled={processing}>
                                    {processing ? 'Submitting...' : 'Submit Check'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
