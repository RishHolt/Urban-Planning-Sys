import { X, Download, History } from 'lucide-react';

interface DocumentViewerModalProps {
    isOpen: boolean;
    onClose: () => void;
    url: string;
    fileName: string;
    mimeType?: string;
    version?: number;
    documentId?: number;
    documentType?: string;
    onViewVersionHistory?: (documentId: number, documentType: string) => void;
}

export default function DocumentViewerModal({
    isOpen,
    onClose,
    url,
    fileName,
    mimeType,
    version,
    documentId,
    documentType,
    onViewVersionHistory,
}: DocumentViewerModalProps) {
    if (!isOpen) {
        return null;
    }

    const isImage = mimeType?.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
    const isPdf = mimeType === 'application/pdf' || /\.pdf$/i.test(url);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm"
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

                {/* Footer with Download Button */}
                <div className="flex items-center justify-start p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
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
                </div>
            </div>
        </div>
    );
}
