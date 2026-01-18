import { FileText, Eye, Upload } from 'lucide-react';

interface Document {
    id: number;
    documentType: string;
    type: 'upload' | 'manual' | null;
    manualId: string | null;
    fileName: string | null;
    fileSize: number | null;
    mimeType: string | null;
    url: string | null;
    status?: 'pending' | 'approved' | 'rejected';
    version?: number;
}

interface RequiredDocumentCardProps {
    document: Document;
    displayName: string;
    onView: (url: string, fileName: string, mimeType: string | undefined, documentId: number, documentStatus?: 'pending' | 'approved' | 'rejected', version?: number, documentType?: string) => void;
    onReplace?: (documentId: number) => void;
    canViewFile: (url: string | null, mimeType?: string) => boolean;
    getDocumentStatusColor: (status?: 'pending' | 'approved' | 'rejected', version?: number) => string;
    getDocumentDisplayName: (documentType: string, version?: number) => string;
    isProcessing?: boolean;
    isReplacing?: boolean;
    showUploadNew?: boolean;
}

export default function RequiredDocumentCard({
    document: doc,
    displayName,
    onView,
    onReplace,
    canViewFile,
    getDocumentStatusColor,
    getDocumentDisplayName,
    isProcessing = false,
    isReplacing = false,
    showUploadNew = true,
}: RequiredDocumentCardProps) {
    if (!doc || !doc.url) {
        return null;
    }

    return (
        <div className={`flex justify-between items-center p-3 border-2 rounded-lg ${getDocumentStatusColor(doc.status, doc.version)}`}>
            <div className="flex items-center gap-3">
                <FileText size={18} className="text-gray-400" />
                <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                        {getDocumentDisplayName(doc.documentType, doc.version)}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">Required document</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                {canViewFile(doc.url, doc.mimeType || undefined) && (
                    <button
                        type="button"
                        onClick={() => onView(
                            doc.url!,
                            doc.fileName || getDocumentDisplayName(doc.documentType, doc.version),
                            doc.mimeType || undefined,
                            doc.id,
                            doc.status,
                            doc.version,
                            doc.documentType
                        )}
                        className="flex items-center gap-2 text-primary hover:text-primary/80 text-sm"
                    >
                        <Eye size={16} />
                        View
                    </button>
                )}
                {showUploadNew && doc.status === 'rejected' && onReplace && (
                    <button
                        type="button"
                        className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm"
                        onClick={() => onReplace(doc.id)}
                        disabled={isProcessing || isReplacing}
                    >
                        <Upload size={16} />
                        Upload New
                    </button>
                )}
            </div>
        </div>
    );
}
