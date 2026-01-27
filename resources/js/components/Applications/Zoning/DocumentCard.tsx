import { FileText, Eye, CheckCircle2, XCircle, Clock, RotateCcw, Info } from 'lucide-react';
import Button from '@/components/Button';

export type DocumentStatus = 'pending' | 'approved' | 'rejected' | 'under_review';

export interface Document {
    id: number;
    fileName: string;
    filePath: string;
    fileType: string;
    documentType: string;
    status: DocumentStatus;
    version: number;
    isCurrent: boolean;
    notes?: string | null;
    reviewedAt?: string | null;
    uploadedAt: string;
    versions?: Document[];
}

interface DocumentCardProps {
    document: Document;
    onView: () => void;
    onUploadNew?: () => void;
}

export default function DocumentCard({ document, onView, onUploadNew }: DocumentCardProps) {
    const isApproved = document.status === 'approved';
    const isRejected = document.status === 'rejected';
    const isPending = document.status === 'pending';

    const getStatusStyles = () => {
        if (isApproved) return 'border-green-500 bg-green-50 dark:bg-green-900/10 dark:border-green-800';
        if (isRejected) return 'border-red-500 bg-red-50 dark:bg-red-900/10 dark:border-red-800';
        if (isPending && document.version > 1) return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10 dark:border-yellow-800';
        return 'border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-surface';
    };

    const getStatusIcon = () => {
        if (isApproved) return <CheckCircle2 className="text-green-600 dark:text-green-400" size={18} />;
        if (isRejected) return <XCircle className="text-red-600 dark:text-red-400" size={18} />;
        if (isPending && document.version > 1) return <RotateCcw className="text-yellow-600 dark:text-yellow-400" size={18} />;
        return <Clock className="text-gray-400" size={18} />;
    };

    return (
        <div className={`border-2 rounded-xl p-4 transition-all duration-300 ${getStatusStyles()} h-full flex flex-col justify-between group shadow-sm hover:shadow-md`}>
            <div>
                <div className="flex justify-between items-start mb-3">
                    <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                        <FileText className="text-primary" size={24} />
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                            v{document.version}
                        </span>
                        {getStatusIcon()}
                    </div>
                </div>

                <h4 className="font-semibold text-gray-900 dark:text-white truncate text-sm mb-1" title={document.fileName}>
                    {document.fileName}
                </h4>

                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-tighter font-medium mb-3">
                    {document.documentType.replace(/_/g, ' ')}
                </p>

                {isRejected && document.notes && (
                    <div className="mt-2 p-2 bg-red-100/50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 flex gap-2">
                        <Info size={14} className="text-red-600 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-red-800 dark:text-red-300 line-clamp-2">
                            {document.notes}
                        </p>
                    </div>
                )}
            </div>

            <div className="mt-4 flex flex-col gap-2">
                <Button
                    variant="secondary"
                    size="sm"
                    className="w-full text-[11px] h-9"
                    onClick={onView}
                >
                    <Eye size={14} className="mr-2 text-primary" />
                    View Details
                </Button>

                {isRejected && onUploadNew && (
                    <Button
                        size="sm"
                        variant="primary"
                        className="w-full text-[11px] h-9"
                        onClick={onUploadNew}
                    >
                        <RotateCcw size={14} className="mr-2" />
                        Re-upload Version {document.version + 1}
                    </Button>
                )}
            </div>
        </div>
    );
}
