import { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import { X, Download, History, CheckCircle2, XCircle, MessageSquare, ExternalLink, ChevronRight, FileText, Loader2 } from 'lucide-react';
import Button from '@/components/Button';
import { Document } from './DocumentCard';

interface DocumentViewModalProps {
    document: Document;
    applicationId: string;
    onClose: () => void;
    isAdmin?: boolean;
}

export default function DocumentViewModal({ document, applicationId, onClose, isAdmin = false }: DocumentViewModalProps) {
    const [showHistory, setShowHistory] = useState(false);
    const [displayedDoc, setDisplayedDoc] = useState<Document>(document);

    const { data, setData, patch, processing } = useForm({
        status: '',
        notes: '',
    });

    const isLatest = displayedDoc.id === document.id;

    const handleStatusUpdate = async (status: 'approved' | 'rejected') => {
        if (status === 'rejected' && (!data.notes || data.notes.trim() === '')) {
            const { showError } = await import('@/lib/swal');
            showError('Notes are required when rejecting a document.');
            return;
        }

        const { confirmDocumentApproval, confirmDocumentRejection } = await import('@/lib/swal');
        const confirmed = status === 'approved'
            ? await confirmDocumentApproval()
            : await confirmDocumentRejection();

        if (!confirmed) return;

        router.patch(`/zoning-applications/${applicationId}/documents/${displayedDoc.id}/status`, {
            status,
            notes: data.notes,
        }, {
            onSuccess: () => {
                onClose();
            },
        });
    };

    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(displayedDoc.fileName);
    const isPDF = /\.(pdf)$/i.test(displayedDoc.fileName);

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-200 dark:border-gray-800">

                {/* Global Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-surface">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate pr-4">
                            {displayedDoc.fileName}
                        </h3>
                        <p className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider">
                            {displayedDoc.documentType.replace(/_/g, ' ')}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {document.versions && document.versions.length > 1 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowHistory(!showHistory)}
                                className={`flex items-center gap-2 font-bold text-sm px-4 h-10 rounded-full transition-all ${showHistory ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                            >
                                <History size={18} />
                                <span>Version History</span>
                                <ChevronRight size={14} className={`transition-transform duration-300 ${showHistory ? 'rotate-90' : ''}`} />
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-full h-10 w-10 flex items-center justify-center shrink-0"
                        >
                            <X size={24} />
                        </Button>
                    </div>
                </div>

                <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                    {/* Preview Area */}
                    <div className="flex-1 bg-gray-100 dark:bg-gray-900 overflow-auto p-4 flex items-center justify-center relative min-h-[300px]">
                        <div className="w-full h-full flex items-center justify-center">
                            {isImage ? (
                                <img
                                    src={`/storage/${displayedDoc.filePath}`}
                                    alt={displayedDoc.fileName}
                                    className="max-w-full max-h-full object-contain shadow-xl rounded"
                                />
                            ) : isPDF ? (
                                <iframe
                                    src={`/storage/${displayedDoc.filePath}#toolbar=0`}
                                    className="w-full h-full min-h-[500px] border-none rounded shadow-xl"
                                    title={displayedDoc.fileName}
                                />
                            ) : (
                                <div className="text-center p-12">
                                    <FileText size={80} className="mx-auto text-gray-400 mb-4" />
                                    <p className="text-gray-600 dark:text-gray-400">Preview not available for this file type.</p>
                                    <a
                                        href={`/zoning-applications/${applicationId}/documents/${displayedDoc.id}/download`}
                                        className="mt-4 inline-flex items-center text-primary font-bold hover:underline"
                                    >
                                        <Download size={16} className="mr-2" />
                                        Download to view
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar Details */}
                    <div className="w-full md:w-[350px] flex flex-col border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-surface p-6 overflow-y-auto">

                        <div className="space-y-6 flex-1">
                            {!isLatest && (
                                <div className="p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800 rounded-lg text-amber-700 dark:text-amber-300 text-xs font-medium flex items-center gap-2">
                                    <History size={16} className="shrink-0" />
                                    Viewing Version {displayedDoc.version} (Older Version)
                                </div>
                            )}

                            {/* Status Badge */}
                            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                                <span className="text-sm font-medium text-gray-500">Document Status</span>
                                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase ${displayedDoc.status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30' :
                                    displayedDoc.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30' :
                                        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30'
                                    }`}>
                                    {displayedDoc.status}
                                </div>
                            </div>

                            {/* File Meta */}
                            <div className="grid grid-cols-2 gap-4 text-xs">
                                <div>
                                    <p className="text-gray-400 mb-1 uppercase tracking-tighter font-bold">Version</p>
                                    <p className="font-semibold text-gray-900 dark:text-white">v{displayedDoc.version}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 mb-1 uppercase tracking-tighter font-bold">Uploaded</p>
                                    <p className="font-semibold text-gray-900 dark:text-white text-[10px]">
                                        {new Date(displayedDoc.uploadedAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>


                            {showHistory && document.versions && (
                                <div className="space-y-3 pl-3 border-l-2 border-primary/20 animate-in slide-in-from-left-2 pb-4">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 text-primary flex items-center gap-1">
                                        <History size={10} />
                                        Version History
                                    </p>
                                    {document.versions.map((v) => (
                                        <button
                                            key={v.id}
                                            onClick={() => setDisplayedDoc(v)}
                                            className={`w-full text-left p-2.5 rounded-xl transition-all border ${v.id === displayedDoc.id
                                                ? 'bg-primary/10 border-primary/20 shadow-sm'
                                                : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-100 dark:hover:border-gray-700'
                                                }`}
                                        >
                                            <div className="flex justify-between items-center mb-1.5">
                                                <span className={`font-bold text-[11px] ${v.id === displayedDoc.id ? 'text-primary' : 'text-gray-700 dark:text-gray-300'}`}>
                                                    Version {v.version} {v.id === document.id && '(Latest)'}
                                                </span>
                                                <div className={`w-2 h-2 rounded-full ${v.status === 'approved' ? 'bg-green-500' : v.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                                            </div>
                                            <div className="flex items-center justify-between text-[10px] text-gray-400">
                                                <span>{new Date(v.uploadedAt).toLocaleDateString()}</span>
                                                <span className="uppercase font-bold tracking-tighter">{v.status.replace('_', ' ')}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Admin Action Section - Only for the LATEST version */}
                            {isAdmin && displayedDoc.status === 'pending' && isLatest && (
                                <div className="pt-6 border-t border-gray-100 dark:border-gray-800 space-y-4">
                                    <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <MessageSquare size={16} />
                                        Internal Review
                                    </h4>
                                    <textarea
                                        className="w-full p-3 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-gray-400"
                                        placeholder="Add feedback or rejection reason..."
                                        rows={4}
                                        value={data.notes}
                                        onChange={e => setData('notes', e.target.value)}
                                    />
                                    <div className="grid grid-cols-2 gap-3">
                                        <Button
                                            variant="outline"
                                            className="h-10 text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-900/20"
                                            onClick={() => handleStatusUpdate('rejected')}
                                            disabled={processing}
                                        >
                                            <XCircle size={16} className="mr-2 text-red-600" />
                                            Reject
                                        </Button>
                                        <Button
                                            onClick={() => handleStatusUpdate('approved')}
                                            disabled={processing}
                                            className="h-10 bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200 dark:shadow-none"
                                        >
                                            <CheckCircle2 size={16} className="mr-2" />
                                            Approve
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Feedback section - for any version that has notes */}
                            {displayedDoc.notes && (
                                <div className="mt-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Reviewer Feedback</p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 italic font-medium leading-relaxed">
                                        "{displayedDoc.notes}"
                                    </p>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

// Helper to determine status
const isPending = (status: string) => status === 'pending' || status === 'under_review';
