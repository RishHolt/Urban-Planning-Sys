import { X, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';

interface Version {
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
}

interface VersionHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    documentType: string;
    versions: Version[];
    onViewVersion?: (url: string, fileName: string, mimeType?: string) => void;
}

export default function VersionHistoryModal({
    isOpen,
    onClose,
    documentType,
    versions,
    onViewVersion,
}: VersionHistoryModalProps) {
    if (!isOpen) {
        return null;
    }

    const getDocumentTypeName = (type: string): string => {
        const typeNames: Record<string, string> = {
            'authorization_letter': 'Authorization Letter',
            'proof_of_ownership': 'Proof of Ownership',
            'tax_declaration': 'Tax Declaration',
            'site_development_plan': 'Site Development Plan',
            'location_map': 'Location Map / Vicinity Map',
            'vicinity_map': 'Vicinity Map',
            'barangay_clearance': 'Barangay Clearance',
            'letter_of_intent': 'Letter of Intent',
            'proof_of_legal_authority': 'Proof of Legal Authority',
            'endorsements_approvals': 'Endorsements / Approvals',
            'environmental_compliance': 'Environmental Compliance Certificate',
            'signature': 'Digital Signature',
            'existing_building_photos': 'Existing Building Photos',
            'other_documents': 'Other Documents',
            'requested_documents': 'Requested Documents',
        };
        return typeNames[type] || type.replace(/_/g, ' ');
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-300 rounded-full">
                        <CheckCircle size={12} />
                        Approved
                    </span>
                );
            case 'rejected':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-300 rounded-full">
                        <XCircle size={12} />
                        Rejected
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-yellow-700 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300 rounded-full">
                        <Clock size={12} />
                        Pending
                    </span>
                );
        }
    };

    const formatFileSize = (bytes: number | null): string => {
        if (!bytes) {
            return 'N/A';
        }
        if (bytes < 1024) {
            return `${bytes} B`;
        }
        if (bytes < 1024 * 1024) {
            return `${(bytes / 1024).toFixed(2)} KB`;
        }
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    };

    const formatDate = (dateString: string | null): string => {
        if (!dateString) {
            return 'N/A';
        }
        return new Date(dateString).toLocaleString();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="relative bg-white dark:bg-dark-surface rounded-lg shadow-xl max-w-4xl max-h-[90vh] w-full mx-4 overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                        Version History - {getDocumentTypeName(documentType)}
                    </h3>
                    <button
                        onClick={onClose}
                        className="flex-shrink-0 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                        aria-label="Close"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 overflow-auto flex-1">
                    {versions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <p className="text-gray-600 dark:text-gray-400 mb-2">No version history available</p>
                            <p className="text-sm text-gray-500 dark:text-gray-500">This document has no previous versions.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {versions.map((version) => (
                            <div
                                key={version.id}
                                className={`p-4 rounded-lg border-2 ${
                                    version.isCurrent
                                        ? 'border-primary bg-primary/5 dark:bg-primary/10'
                                        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
                                }`}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3 flex-1">
                                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 dark:bg-primary/20 text-primary font-semibold text-lg">
                                            v{version.version}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 dark:text-white mb-1 truncate">
                                                {version.fileName || 'Unknown File'}
                                            </p>
                                            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                                <span>{formatFileSize(version.fileSize)}</span>
                                                <span>•</span>
                                                <span className="font-medium">Uploaded:</span>
                                                <span>{formatDate(version.createdAt)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                                        {getStatusBadge(version.status)}
                                        {version.isCurrent && (
                                            <span className="px-2 py-1 text-xs font-medium text-primary bg-primary/10 dark:bg-primary/20 rounded-full">
                                                Current
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {version.reviewedAt && (
                                    <div className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                                        <span className="font-medium">Reviewed on:</span> {formatDate(version.reviewedAt)}
                                    </div>
                                )}

                                {version.notes && (
                                    <div className="mb-3 p-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded">
                                        <span className="font-medium">Notes:</span> {version.notes}
                                    </div>
                                )}

                                {version.url && onViewVersion && (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => onViewVersion(version.url!, version.fileName, version.mimeType || undefined)}
                                            className="flex items-center gap-2 px-3 py-1.5 text-sm text-primary hover:text-primary/80 bg-primary/10 dark:bg-primary/20 rounded-lg hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors"
                                        >
                                            <Eye size={16} />
                                            View
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
