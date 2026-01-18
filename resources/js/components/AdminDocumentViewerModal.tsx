import { useState } from 'react';
import { X, Download, CheckCircle, XCircle, History } from 'lucide-react';
import Button from './Button';
import { confirmDocumentApproval, confirmDocumentRejection, showNotesRequired } from '../lib/swal';

interface AdminDocumentViewerModalProps {
    isOpen: boolean;
    onClose: () => void;
    url: string;
    fileName: string;
    mimeType?: string;
    documentId: number;
    documentStatus?: 'pending' | 'approved' | 'rejected';
    version?: number;
    documentType?: string;
    onApprove: (documentId: number, notes: string) => void;
    onReject: (documentId: number, notes: string) => void;
    isProcessing?: boolean;
    onViewVersionHistory?: (documentId: number, documentType: string) => void;
}

export default function AdminDocumentViewerModal({
    isOpen,
    onClose,
    url,
    fileName,
    mimeType,
    documentId,
    documentStatus = 'pending',
    version,
    documentType,
    onApprove,
    onReject,
    isProcessing = false,
    onViewVersionHistory,
}: AdminDocumentViewerModalProps) {
    const [showNotesModal, setShowNotesModal] = useState(false);
    const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
    const [notes, setNotes] = useState('');

    if (!isOpen) {
        return null;
    }

    const isImage = mimeType?.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
    const isPdf = mimeType === 'application/pdf' || /\.pdf$/i.test(url);

    const handleApproveClick = (): void => {
        setActionType('approve');
        setShowNotesModal(true);
    };

    const handleRejectClick = (): void => {
        setActionType('reject');
        setShowNotesModal(true);
    };

    const handleProceed = async (): Promise<void> => {
        // Validate notes for rejection
        if (actionType === 'reject' && !notes.trim()) {
            await showNotesRequired();
            return;
        }

        let isConfirmed = false;
        if (actionType === 'approve') {
            isConfirmed = await confirmDocumentApproval();
        } else if (actionType === 'reject') {
            isConfirmed = await confirmDocumentRejection();
        }

        if (isConfirmed) {
            if (actionType === 'approve') {
                onApprove(documentId, notes.trim());
            } else if (actionType === 'reject') {
                onReject(documentId, notes.trim());
            }
            setShowNotesModal(false);
            setNotes('');
            setActionType(null);
        }
    };

    const handleCancelNotes = (): void => {
        setShowNotesModal(false);
        setNotes('');
        setActionType(null);
    };

    return (
        <>
            <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm"
                onClick={onClose}
            >
                <div
                    className="relative bg-white dark:bg-dark-surface rounded-lg shadow-xl max-w-7xl max-h-[90vh] w-full mx-4 overflow-hidden flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                        <div className="flex-1 mr-4 min-w-0">
                            <h3 className="font-semibold text-gray-900 dark:text-white text-lg truncate">
                                {fileName}
                            </h3>
                            {version && version > 1 && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Version {version}
                                </p>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {documentId && documentType && onViewVersionHistory && (
                                <button
                                    onClick={() => onViewVersionHistory(documentId, documentType)}
                                    className="flex-shrink-0 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                                    aria-label="View Version History"
                                    title="View Version History"
                                >
                                    <History size={20} />
                                </button>
                            )}
                            <button
                                onClick={onClose}
                                className="flex-shrink-0 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                                aria-label="Close"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 overflow-auto flex-1">
                        {isImage ? (
                            <div className="flex items-center justify-center">
                                <img
                                    src={url}
                                    alt={fileName}
                                    className="max-w-full max-h-[calc(90vh-200px)] object-contain rounded-lg"
                                />
                            </div>
                        ) : isPdf ? (
                            <div className="w-full h-[calc(90vh-200px)]">
                                <iframe
                                    src={url}
                                    className="w-full h-full border-0 rounded-lg"
                                    title={fileName}
                                />
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <p className="mb-4 text-gray-600 dark:text-gray-400">
                                    This file type cannot be previewed in the browser.
                                </p>
                                <a
                                    href={url}
                                    download
                                    className="inline-flex items-center gap-2 px-4 py-2 text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
                                >
                                    <Download size={18} />
                                    Download File
                                </a>
                            </div>
                        )}
                    </div>

                    {/* Footer with Download and Approve/Reject Buttons */}
                    <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                        <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                            <Download size={16} />
                            Download
                        </a>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                size="md"
                                onClick={handleRejectClick}
                                disabled={isProcessing || documentStatus === 'approved' || documentStatus === 'rejected' || documentId === 0}
                                className="flex items-center gap-2 text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                                <XCircle size={18} />
                                Reject
                            </Button>
                            <Button
                                variant="primary"
                                size="md"
                                onClick={handleApproveClick}
                                disabled={isProcessing || documentStatus === 'approved' || documentStatus === 'rejected' || documentId === 0}
                                className="flex items-center gap-2"
                            >
                                <CheckCircle size={18} />
                                Approve
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Notes Modal */}
            {showNotesModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 backdrop-blur-sm">
                    <div
                        className="relative bg-white dark:bg-dark-surface rounded-lg shadow-xl max-w-md w-full mx-4 p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="mb-4 font-semibold text-gray-900 dark:text-white text-xl">
                            {actionType === 'approve' ? 'Approve Document' : 'Reject Document'}
                        </h3>
                        <div className="mb-4">
                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                Notes {actionType === 'reject' && <span className="text-red-500">*</span>}
                            </label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={4}
                                required={actionType === 'reject'}
                                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent ${
                                    actionType === 'reject' && !notes.trim() 
                                        ? 'border-red-300 dark:border-red-600' 
                                        : 'border-gray-300 dark:border-gray-600'
                                }`}
                                placeholder={actionType === 'approve' ? 'Add notes (optional)...' : 'Please provide a reason for rejection (required)...'}
                            />
                            {actionType === 'reject' && !notes.trim() && (
                                <p className="mt-1 text-red-500 text-xs">Notes are required for rejection.</p>
                            )}
                        </div>
                        <div className="flex justify-end gap-3">
                            <Button
                                variant="outline"
                                size="md"
                                onClick={handleCancelNotes}
                                disabled={isProcessing}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant={actionType === 'approve' ? 'primary' : 'danger'}
                                size="md"
                                onClick={handleProceed}
                                disabled={isProcessing || (actionType === 'reject' && !notes.trim())}
                            >
                                {isProcessing ? 'Processing...' : 'Proceed'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
