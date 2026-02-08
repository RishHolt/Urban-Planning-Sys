import { useState } from 'react';
import { Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '../../../components/AdminLayout';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import { FileText, MapPin, Calendar, CheckCircle, XCircle, Clock, ArrowLeft, Building } from 'lucide-react';

interface ApplicationDetailsProps {
    application: {
        id: string;
        referenceNo: string;
        projectType: string;
        zoningClearanceNo: string;
        applicantType: string;
        contactNumber: string;
        contactEmail: string | null;
        pinLat: number;
        pinLng: number;
        projectAddress: string;
        developerName: string;
        subdivisionName: string;
        projectDescription: string | null;
        totalAreaSqm: number;
        totalLotsPlanned: number;
        openSpacePercentage: number;
        buildingType: string | null;
        numberOfFloors: number | null;
        buildingFootprintSqm: number | null;
        totalFloorAreaSqm: number | null;
        frontSetbackM: number | null;
        rearSetbackM: number | null;
        sideSetbackM: number | null;
        floorAreaRatio: number | null;
        buildingOpenSpaceSqm: number | null;
        buildingReviewStatus: string | null;
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
    const [showSubdivisionReview, setShowSubdivisionReview] = useState(false);
    const [showBuildingReview, setShowBuildingReview] = useState(false);
    
    const { data: subdivisionData, setData: setSubdivisionData, post: postSubdivision, processing: processingSubdivision } = useForm({
        review_type: 'subdivision',
        decision: 'approved' as 'approved' | 'revision' | 'denied',
        comments: '',
    });

    const { data: buildingData, setData: setBuildingData, post: postBuilding, processing: processingBuilding } = useForm({
        review_type: 'building',
        decision: 'approved' as 'approved' | 'revision' | 'denied',
        comments: '',
    });

    const handleSubdivisionReview = (e: React.FormEvent) => {
        e.preventDefault();
        postSubdivision(`/admin/development-clearance/applications/${application.id}/review`, {
            preserveScroll: true,
            onSuccess: () => {
                setShowSubdivisionReview(false);
                setSubdivisionData({ review_type: 'subdivision', decision: 'approved', comments: '' });
            },
        });
    };

    const handleBuildingReview = (e: React.FormEvent) => {
        e.preventDefault();
        postBuilding(`/admin/development-clearance/applications/${application.id}/review`, {
            preserveScroll: true,
            onSuccess: () => {
                setShowBuildingReview(false);
                setBuildingData({ review_type: 'building', decision: 'approved', comments: '' });
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
            title={`Development Clearance Application: ${application.referenceNo}`}
            description="Review and manage development clearance application"
        >
            <div className="mb-6">
                <Link href="/admin/development-clearance/applications">
                    <Button variant="secondary" size="sm" className="flex items-center gap-2">
                        <ArrowLeft size={18} />
                        Back to Applications
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Application Info */}
                    <div className="bg-white dark:bg-dark-surface shadow-lg rounded-lg p-6">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="mb-2 font-bold text-gray-900 dark:text-white text-2xl">
                                    {application.subdivisionName}
                                </h2>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Reference: {application.referenceNo}
                                </p>
                            </div>
                            {getStatusBadge(application.status)}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Project Type</p>
                                <p className="font-medium text-gray-900 dark:text-white">
                                    {application.projectType === 'subdivision_only' 
                                        ? 'Subdivision Only' 
                                        : 'Subdivision + Building'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Zoning Clearance</p>
                                <p className="font-medium text-gray-900 dark:text-white">{application.zoningClearanceNo}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Developer</p>
                                <p className="font-medium text-gray-900 dark:text-white">{application.developerName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Contact</p>
                                <p className="font-medium text-gray-900 dark:text-white">{application.contactNumber}</p>
                            </div>
                            <div className="col-span-1 md:col-span-2">
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Project Address</p>
                                <p className="font-medium text-gray-900 dark:text-white">{application.projectAddress}</p>
                            </div>
                        </div>
                    </div>

                    {/* Subdivision Review Panel */}
                    <div className="bg-white dark:bg-dark-surface shadow-lg rounded-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-gray-900 dark:text-white text-lg flex items-center gap-2">
                                <FileText size={20} />
                                Subdivision Review
                            </h3>
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => setShowSubdivisionReview(true)}
                            >
                                Review
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Area</p>
                                <p className="font-medium text-gray-900 dark:text-white">
                                    {application.totalAreaSqm.toLocaleString()} sqm
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Lots</p>
                                <p className="font-medium text-gray-900 dark:text-white">{application.totalLotsPlanned}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Open Space</p>
                                <p className="font-medium text-gray-900 dark:text-white">{application.openSpacePercentage}%</p>
                            </div>
                        </div>
                    </div>

                    {/* Building Review Panel (only if project includes building) */}
                    {application.projectType === 'subdivision_with_building' && (
                        <div className="bg-white dark:bg-dark-surface shadow-lg rounded-lg p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold text-gray-900 dark:text-white text-lg flex items-center gap-2">
                                    <Building size={20} />
                                    Building Review
                                </h3>
                                <div className="flex items-center gap-2">
                                    {application.buildingReviewStatus && getStatusBadge(application.buildingReviewStatus)}
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={() => setShowBuildingReview(true)}
                                    >
                                        Review
                                    </Button>
                                </div>
                            </div>
                            {application.buildingType && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Building Type</p>
                                        <p className="font-medium text-gray-900 dark:text-white capitalize">
                                            {application.buildingType.replace('_', ' ')}
                                        </p>
                                    </div>
                                    {application.numberOfFloors && (
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Number of Floors</p>
                                            <p className="font-medium text-gray-900 dark:text-white">{application.numberOfFloors}</p>
                                        </div>
                                    )}
                                    {application.buildingFootprintSqm && (
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Footprint</p>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {application.buildingFootprintSqm.toLocaleString()} sqm
                                            </p>
                                        </div>
                                    )}
                                    {application.floorAreaRatio && (
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">FAR</p>
                                            <p className="font-medium text-gray-900 dark:text-white">{application.floorAreaRatio}</p>
                                        </div>
                                    )}
                                </div>
                            )}
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
                </div>
            </div>

            {/* Subdivision Review Modal */}
            {showSubdivisionReview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white dark:bg-dark-surface rounded-lg p-6 max-w-2xl w-full mx-4">
                        <h3 className="mb-4 font-semibold text-gray-900 dark:text-white text-xl">
                            Subdivision Review
                        </h3>
                        <form onSubmit={handleSubdivisionReview} className="space-y-4">
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Decision *
                                </label>
                                <select
                                    value={subdivisionData.decision}
                                    onChange={(e) => setSubdivisionData('decision', e.target.value as any)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
                                >
                                    <option value="approved">Approved</option>
                                    <option value="revision">Revision Required</option>
                                    <option value="denied">Denied</option>
                                </select>
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Comments
                                </label>
                                <textarea
                                    value={subdivisionData.comments}
                                    onChange={(e) => setSubdivisionData('comments', e.target.value)}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setShowSubdivisionReview(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" variant="primary" disabled={processingSubdivision}>
                                    {processingSubdivision ? 'Submitting...' : 'Submit Review'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Building Review Modal */}
            {showBuildingReview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white dark:bg-dark-surface rounded-lg p-6 max-w-2xl w-full mx-4">
                        <h3 className="mb-4 font-semibold text-gray-900 dark:text-white text-xl">
                            Building Review
                        </h3>
                        <form onSubmit={handleBuildingReview} className="space-y-4">
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Decision *
                                </label>
                                <select
                                    value={buildingData.decision}
                                    onChange={(e) => setBuildingData('decision', e.target.value as any)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
                                >
                                    <option value="approved">Approved</option>
                                    <option value="revision">Revision Required</option>
                                    <option value="denied">Denied</option>
                                </select>
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Comments
                                </label>
                                <textarea
                                    value={buildingData.comments}
                                    onChange={(e) => setBuildingData('comments', e.target.value)}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setShowBuildingReview(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" variant="primary" disabled={processingBuilding}>
                                    {processingBuilding ? 'Submitting...' : 'Submit Review'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
