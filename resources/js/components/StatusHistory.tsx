import { CheckCircle, XCircle, Clock, FileText } from 'lucide-react';

export interface StatusHistoryItem {
    id: number;
    statusFrom: string | null;
    statusTo: string;
    changedBy: number;
    notes: string | null;
    createdAt: string;
}

interface StatusHistoryProps {
    history: StatusHistoryItem[];
    className?: string;
}

export default function StatusHistory({ history, className = '' }: StatusHistoryProps) {
    const formatStatusName = (status: string | null): string => {
        if (!status) return 'N/A';
        const statusLabels: Record<string, string> = {
            'pending': 'Pending',
            'in_review': 'In Review',
            'approved': 'Approved',
            'rejected': 'Rejected',
        };
        return statusLabels[status] || status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
    };

    const getStatusLabel = (status: string, notes: string | null): string => {
        // Check if notes indicate a document action
        if (notes) {
            const lowerNotes = notes.toLowerCase();
            // Pattern: "Document 'Document Name' approved" or "Document 'Document Name' approved: notes"
            // Pattern: "Document 'Document Name' rejected: notes"
            // Pattern: "Document 'Document Name' uploaded" or "Document 'Document Name' uploaded (Version X)"
            const documentMatch = notes.match(/^Document\s+'([^']+)'\s+(approved|rejected|uploaded)/i);

            if (documentMatch) {
                const action = documentMatch[2].toLowerCase();
                if (action === 'approved') {
                    return 'Approved';
                }
                if (action === 'rejected') {
                    return 'Rejected';
                }
                if (action === 'uploaded') {
                    return 'Pending';
                }
            }

            // Fallback: check if it starts with "document" and contains approved/rejected/uploaded
            if (lowerNotes.startsWith("document")) {
                if (lowerNotes.includes("approved")) {
                    return 'Approved';
                }
                if (lowerNotes.includes("rejected")) {
                    return 'Rejected';
                }
                if (lowerNotes.includes("uploaded")) {
                    return 'Pending';
                }
            }
        }

        // Map status to readable labels
        const statusLabels: Record<string, string> = {
            'pending': 'Pending',
            'in_review': 'In Review',
            'approved': 'Approved',
            'rejected': 'Rejected',
        };

        return statusLabels[status] || status;
    };

    const getStatusIcon = (status: string, notes: string | null) => {
        // Check if notes indicate a document action
        if (notes) {
            const lowerNotes = notes.toLowerCase();
            if (lowerNotes.startsWith("document")) {
                // For uploaded documents, use upload icon if available, otherwise file icon
                if (lowerNotes.includes("uploaded")) {
                    return <FileText size={16} className="text-yellow-500" />;
                }
                return <FileText size={16} className="text-gray-500 dark:text-gray-400" />;
            }
        }

        switch (status) {
            case 'approved':
                return <CheckCircle size={16} className="text-green-500" />;
            case 'rejected':
                return <XCircle size={16} className="text-red-500" />;
            case 'in_review':
                return <Clock size={16} className="text-blue-500" />;
            default:
                return <Clock size={16} className="text-yellow-500" />;
        }
    };

    const getStatusBadgeColor = (status: string, notes: string | null): string => {
        // Check if notes indicate a document action
        if (notes) {
            const lowerNotes = notes.toLowerCase();
            if (lowerNotes.startsWith("document")) {
                if (lowerNotes.includes("approved")) {
                    return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200';
                }
                if (lowerNotes.includes("rejected")) {
                    return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200';
                }
                if (lowerNotes.includes("uploaded")) {
                    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200';
                }
            }
        }

        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200';
            case 'rejected':
                return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200';
            case 'in_review':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200';
            default:
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200';
        }
    };

    if (history.length === 0) {
        return null;
    }

    return (
        <section className={`bg-white dark:bg-dark-surface shadow-lg p-6 rounded-lg ${className}`}>
            <h2 className="mb-4 font-semibold text-gray-900 dark:text-white text-xl">
                Status History
            </h2>
            <div className="space-y-3">
                {history.map((item, index) => {
                    const statusLabel = getStatusLabel(item.statusTo, item.notes);
                    const statusIcon = getStatusIcon(item.statusTo, item.notes);
                    const badgeColor = getStatusBadgeColor(item.statusTo, item.notes);

                    return (
                        <div key={item.id} className="flex gap-3">
                            <div className="flex flex-col items-center">
                                <div className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                                    }`} />
                                {index < history.length - 1 && (
                                    <div className="w-0.5 h-full bg-gray-300 dark:bg-gray-600 mt-1" />
                                )}
                            </div>
                            <div className="flex-1 pb-3">
                                <div className="flex items-center gap-2 mb-1">
                                    {statusIcon}
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeColor}`}>
                                        {statusLabel}
                                    </span>
                                </div>
                                {/* Show changes for status updates */}
                                {item.statusFrom && item.statusFrom !== item.statusTo && !item.notes?.toLowerCase().includes('document') && (
                                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">
                                        <span className="font-medium">Changes:</span> {formatStatusName(item.statusFrom)} → {formatStatusName(item.statusTo)}
                                    </p>
                                )}
                                {item.notes && (
                                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">
                                        {item.notes}
                                    </p>
                                )}
                                <p className="text-gray-500 dark:text-gray-500 text-xs">
                                    {new Date(item.createdAt).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
