import { useState } from 'react';
import { Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '../../../components/AdminLayout';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import { FileText, MapPin, Calendar, CheckCircle, XCircle, Clock, ArrowLeft } from 'lucide-react';

interface ApplicationDetailsProps {
    application: {
        id: string;
        referenceNo: string;
        zoningClearanceNo: string;
        applicantType: string;
        contactNumber: string;
        contactEmail: string;
        pinLat: number;
        pinLng: number;
        projectAddress: string;
        developerName: string;
        subdivisionName: string;
        projectDescription: string;
        totalAreaSqm: number;
        totalLotsPlanned: number;
        openSpacePercentage: number;
        currentStage: string;
        status: string;
        denialReason: string | null;
        submittedAt: string | null;
        approvedAt: string | null;
        documents: Array<{
            id: number;
            documentType: string;
            stage: string;
            fileName: string;
            filePath: string;
            uploadedAt: string;
        }>;
        stageReviews: Array<{
            id: number;
            stage: string;
            result: string;
            findings: string;
            recommendations: string;
            reviewedAt: string;
        }>;
        issuedCertificate: {
            certificateNo: string;
            issueDate: string;
            validUntil: string | null;
            status: string;
        } | null;
        history: Array<{
            status: string;
            remarks: string;
            updatedAt: string;
        }>;
    };
}

export default function ApplicationDetails({ application }: ApplicationDetailsProps) {
    const [showReviewModal, setShowReviewModal] = useState(false);
    const { data, setData, post, processing } = useForm({
        stage: application.currentStage,
        result: 'approved' as 'approved' | 'revision_required' | 'denied',
        findings: '',
        recommendations: '',
    });

    const handleReviewSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/admin/subdivision/applications/${application.id}/review-stage`, {
            preserveScroll: true,
            onSuccess: () => {
                setShowReviewModal(false);
                setData({ stage: application.currentStage, result: 'approved', findings: '', recommendations: '' });
            },
        });
    };

    const getStatusBadge = (status: string) => {
        const colors: Record<string, string> = {
            submitted: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
            concept_review: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
            preliminary_review: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
            improvement_review: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
            final_review: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
            approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
            denied: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
            revision: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
        };
        return (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
                {status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
        );
    };

    return (
        <AdminLayout
            title={`Subdivision Application: ${application.referenceNo}`}
            description="Review and manage subdivision application"
            backButton={{
                href: '/admin/subdivision/applications',
                label: 'Back to Applications',
            }}
        >
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="mb-2 font-bold text-gray-900 dark:text-white text-2xl">
                            {application.subdivisionName}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            {application.developerName}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {getStatusBadge(application.status)}
                        {application.status.includes('review') && (
                            <Button
                                variant="primary"
                                size="md"
                                onClick={() => setShowReviewModal(true)}
                            >
                                Review Stage
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
                                        Total Area
                                    </label>
                                    <p className="text-gray-900 dark:text-white">{application.totalAreaSqm.toLocaleString()} sqm</p>
                                </div>
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Total Lots
                                    </label>
                                    <p className="text-gray-900 dark:text-white">{application.totalLotsPlanned}</p>
                                </div>
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Open Space
                                    </label>
                                    <p className="text-gray-900 dark:text-white">{application.openSpacePercentage}%</p>
                                </div>
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Current Stage
                                    </label>
                                    <p className="text-gray-900 dark:text-white capitalize">{application.currentStage}</p>
                                </div>
                            </div>
                            {application.projectDescription && (
                                <div className="mt-4">
                                    <label className="block mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Description
                                    </label>
                                    <p className="text-gray-900 dark:text-white">{application.projectDescription}</p>
                                </div>
                            )}
                        </div>

                        {/* Stage Reviews */}
                        {application.stageReviews.length > 0 && (
                            <div className="bg-white dark:bg-dark-surface shadow-lg rounded-lg p-6">
                                <h3 className="mb-4 font-semibold text-gray-900 dark:text-white text-lg">
                                    Stage Reviews
                                </h3>
                                <div className="space-y-4">
                                    {application.stageReviews.map((review) => (
                                        <div key={review.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-medium text-gray-900 dark:text-white capitalize">
                                                    {review.stage} Review
                                                </h4>
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                    review.result === 'approved' ? 'bg-green-100 text-green-800' :
                                                    review.result === 'revision_required' ? 'bg-orange-100 text-orange-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    {review.result.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                </span>
                                            </div>
                                            {review.findings && <p className="mb-2 text-gray-600 dark:text-gray-400 text-sm"><strong>Findings:</strong> {review.findings}</p>}
                                            {review.recommendations && <p className="text-gray-600 dark:text-gray-400 text-sm"><strong>Recommendations:</strong> {review.recommendations}</p>}
                                            <p className="mt-2 text-gray-500 dark:text-gray-400 text-xs">
                                                {new Date(review.reviewedAt).toLocaleString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Documents */}
                        {application.documents.length > 0 && (
                            <div className="bg-white dark:bg-dark-surface shadow-lg rounded-lg p-6">
                                <h3 className="mb-4 font-semibold text-gray-900 dark:text-white text-lg">
                                    Documents
                                </h3>
                                <div className="space-y-2">
                                    {application.documents.map((doc) => (
                                        <div key={doc.id} className="flex justify-between items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white text-sm">
                                                    {doc.documentType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                </p>
                                                <p className="text-gray-500 dark:text-gray-400 text-xs">{doc.fileName}</p>
                                            </div>
                                            <a href={doc.filePath} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-dark text-sm">
                                                View
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
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
                                {application.history.map((h, idx) => (
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

                        {/* Certificate */}
                        {application.issuedCertificate && (
                            <div className="bg-white dark:bg-dark-surface shadow-lg rounded-lg p-6">
                                <h3 className="mb-4 font-semibold text-gray-900 dark:text-white text-lg">
                                    Certificate
                                </h3>
                                <div className="space-y-2">
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {application.issuedCertificate.certificateNo}
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                                        Issued: {new Date(application.issuedCertificate.issueDate).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Review Modal */}
            {showReviewModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white dark:bg-dark-surface rounded-lg p-6 max-w-2xl w-full mx-4">
                        <h3 className="mb-4 font-semibold text-gray-900 dark:text-white text-xl">
                            Review {application.currentStage.replace(/\b\w/g, l => l.toUpperCase())} Stage
                        </h3>
                        <form onSubmit={handleReviewSubmit} className="space-y-4">
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Result *
                                </label>
                                <select
                                    value={data.result}
                                    onChange={(e) => setData('result', e.target.value as any)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
                                >
                                    <option value="approved">Approved</option>
                                    <option value="revision_required">Revision Required</option>
                                    <option value="denied">Denied</option>
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
                                    onClick={() => setShowReviewModal(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" variant="primary" disabled={processing}>
                                    {processing ? 'Submitting...' : 'Submit Review'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
