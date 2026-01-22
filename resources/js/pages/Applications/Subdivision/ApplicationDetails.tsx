import { Link } from '@inertiajs/react';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import Button from '../../../components/Button';
import { ArrowLeft, FileText, MapPin, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';

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
    const getStatusIcon = (status: string) => {
        if (status === 'approved') return <CheckCircle className="text-green-500" size={20} />;
        if (status === 'denied') return <XCircle className="text-red-500" size={20} />;
        return <Clock className="text-yellow-500" size={20} />;
    };

    const getStatusColor = (status: string) => {
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
        return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    };

    return (
        <div className="flex flex-col bg-background dark:bg-dark-bg w-full min-h-dvh transition-colors">
            <Header />
            <main className="flex-1 mt-16 py-8 md:py-12">
                <div className="mx-auto px-4 max-w-7xl">
                    <div className="mb-6">
                        <Link href="/subdivision-applications">
                            <Button variant="secondary" size="sm" className="flex items-center gap-2">
                                <ArrowLeft size={18} />
                                Back to Applications
                            </Button>
                        </Link>
                    </div>

                    <div className="mb-8">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="mb-2 font-bold text-gray-900 dark:text-white text-3xl">
                                    {application.subdivisionName}
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Reference: {application.referenceNo}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                {getStatusIcon(application.status)}
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                                    {application.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            {/* Basic Information */}
                            <div className="bg-white dark:bg-dark-surface shadow-lg rounded-lg p-6">
                                <h2 className="mb-4 font-semibold text-gray-900 dark:text-white text-xl flex items-center gap-2">
                                    <FileText size={20} />
                                    Project Information
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Developer Name
                                        </label>
                                        <p className="text-gray-900 dark:text-white">{application.developerName}</p>
                                    </div>
                                    <div>
                                        <label className="block mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Subdivision Name
                                        </label>
                                        <p className="text-gray-900 dark:text-white">{application.subdivisionName}</p>
                                    </div>
                                    <div>
                                        <label className="block mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Total Area
                                        </label>
                                        <p className="text-gray-900 dark:text-white">{application.totalAreaSqm.toLocaleString()} sqm</p>
                                    </div>
                                    <div>
                                        <label className="block mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Total Lots Planned
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
                                            Project Description
                                        </label>
                                        <p className="text-gray-900 dark:text-white">{application.projectDescription}</p>
                                    </div>
                                )}
                            </div>

                            {/* Location */}
                            <div className="bg-white dark:bg-dark-surface shadow-lg rounded-lg p-6">
                                <h2 className="mb-4 font-semibold text-gray-900 dark:text-white text-xl flex items-center gap-2">
                                    <MapPin size={20} />
                                    Location
                                </h2>
                                <div className="space-y-2">
                                    <p className="text-gray-900 dark:text-white">{application.projectAddress}</p>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                                        Coordinates: {application.pinLat}, {application.pinLng}
                                    </p>
                                </div>
                            </div>

                            {/* Stage Reviews */}
                            {application.stageReviews.length > 0 && (
                                <div className="bg-white dark:bg-dark-surface shadow-lg rounded-lg p-6">
                                    <h2 className="mb-4 font-semibold text-gray-900 dark:text-white text-xl">
                                        Stage Reviews
                                    </h2>
                                    <div className="space-y-4">
                                        {application.stageReviews.map((review) => (
                                            <div key={review.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="font-medium text-gray-900 dark:text-white capitalize">
                                                        {review.stage} Review
                                                    </h3>
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                        review.result === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                                        review.result === 'revision_required' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' :
                                                        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                                    }`}>
                                                        {review.result.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                    </span>
                                                </div>
                                                {review.findings && (
                                                    <p className="mb-2 text-gray-600 dark:text-gray-400 text-sm">
                                                        <strong>Findings:</strong> {review.findings}
                                                    </p>
                                                )}
                                                {review.recommendations && (
                                                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                                                        <strong>Recommendations:</strong> {review.recommendations}
                                                    </p>
                                                )}
                                                <p className="mt-2 text-gray-500 dark:text-gray-400 text-xs">
                                                    Reviewed: {new Date(review.reviewedAt).toLocaleString()}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Documents */}
                            {application.documents.length > 0 && (
                                <div className="bg-white dark:bg-dark-surface shadow-lg rounded-lg p-6">
                                    <h2 className="mb-4 font-semibold text-gray-900 dark:text-white text-xl">
                                        Documents
                                    </h2>
                                    <div className="space-y-2">
                                        {application.documents.map((doc) => (
                                            <div key={doc.id} className="flex justify-between items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                                                        {doc.documentType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                    </p>
                                                    <p className="text-gray-500 dark:text-gray-400 text-xs">
                                                        {doc.fileName} • {doc.stage}
                                                    </p>
                                                </div>
                                                <a
                                                    href={doc.filePath}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-primary hover:text-primary-dark font-medium text-sm"
                                                >
                                                    View
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-6">
                            {/* Status Timeline */}
                            <div className="bg-white dark:bg-dark-surface shadow-lg rounded-lg p-6">
                                <h2 className="mb-4 font-semibold text-gray-900 dark:text-white text-xl flex items-center gap-2">
                                    <Calendar size={20} />
                                    Status History
                                </h2>
                                <div className="space-y-3">
                                    {application.history.map((h, idx) => (
                                        <div key={idx} className="flex items-start gap-3">
                                            <div className="mt-1 w-2 h-2 bg-primary rounded-full" />
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900 dark:text-white text-sm">
                                                    {h.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                </p>
                                                {h.remarks && (
                                                    <p className="text-gray-500 dark:text-gray-400 text-xs">{h.remarks}</p>
                                                )}
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
                                    <h2 className="mb-4 font-semibold text-gray-900 dark:text-white text-xl">
                                        Certificate
                                    </h2>
                                    <div className="space-y-2">
                                        <div>
                                            <label className="block mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                                                Certificate No
                                            </label>
                                            <p className="text-gray-900 dark:text-white font-medium">
                                                {application.issuedCertificate.certificateNo}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                                                Issue Date
                                            </label>
                                            <p className="text-gray-900 dark:text-white">
                                                {new Date(application.issuedCertificate.issueDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                        {application.issuedCertificate.validUntil && (
                                            <div>
                                                <label className="block mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                                                    Valid Until
                                                </label>
                                                <p className="text-gray-900 dark:text-white">
                                                    {new Date(application.issuedCertificate.validUntil).toLocaleDateString()}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Contact Information */}
                            <div className="bg-white dark:bg-dark-surface shadow-lg rounded-lg p-6">
                                <h2 className="mb-4 font-semibold text-gray-900 dark:text-white text-xl">
                                    Contact Information
                                </h2>
                                <div className="space-y-2">
                                    <div>
                                        <label className="block mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Contact Number
                                        </label>
                                        <p className="text-gray-900 dark:text-white">{application.contactNumber}</p>
                                    </div>
                                    {application.contactEmail && (
                                        <div>
                                            <label className="block mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                                                Email
                                            </label>
                                            <p className="text-gray-900 dark:text-white">{application.contactEmail}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
