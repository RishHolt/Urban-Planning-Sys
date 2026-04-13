import { CheckCircle, XCircle, Clock, FileText, PlusCircle, Edit, FileUp, MessageSquare } from 'lucide-react';

export interface TimelineItem {
    id: number | string;
    status: string;
    eventType: 'created' | 'updated' | 'status_change' | 'document_upload' | 'document_action' | 'document_request';
    remarks: string;
    metadata?: any;
    performerName: string;
    updatedAt: string;
}

interface ApplicationTimelineProps {
    items: TimelineItem[];
    className?: string;
}

export default function ApplicationTimeline({ items, className = '' }: ApplicationTimelineProps) {
    const getEventDetails = (item: TimelineItem) => {
        switch (item.eventType) {
            case 'created':
                return {
                    label: 'Application Created',
                    icon: <PlusCircle size={16} className="text-green-500" />,
                    color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
                };
            case 'updated':
                return {
                    label: 'Application Updated',
                    icon: <Edit size={16} className="text-blue-500" />,
                    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200'
                };
            case 'document_upload':
                return {
                    label: 'Document Uploaded',
                    icon: <FileUp size={16} className="text-purple-500" />,
                    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200'
                };
            case 'document_action':
                const isApproved = item.metadata?.action === 'approved';
                return {
                    label: isApproved ? 'Document Approved' : 'Document Rejected',
                    icon: isApproved ? <CheckCircle size={16} className="text-green-500" /> : <XCircle size={16} className="text-red-500" />,
                    color: isApproved 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200'
                };
            case 'document_request':
                return {
                    label: 'Documents Requested',
                    icon: <MessageSquare size={16} className="text-orange-500" />,
                    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-200'
                };
            case 'status_change':
                const statusStr = (item.status || '').toLowerCase();
                const isFinal = statusStr === 'approved';
                const isDenied = statusStr === 'rejected' || statusStr === 'denied';
                return {
                    label: 'Status Changed',
                    icon: isFinal ? <CheckCircle size={16} className="text-green-600" /> : (isDenied ? <XCircle size={16} className="text-red-600" /> : <Clock size={16} className="text-blue-600" />),
                    color: isFinal 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
                        : (isDenied ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200')
                };
            default:
                return {
                    label: 'System Event',
                    icon: <Clock size={16} className="text-gray-500" />,
                    color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                };
        }
    };

    if (!items || items.length === 0) {
        return (
            <div className={`p-8 text-center bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 ${className}`}>
                <Clock className="mx-auto mb-3 text-gray-300" size={32} />
                <p className="text-gray-500 dark:text-gray-400">No activity recorded yet.</p>
            </div>
        );
    }

    return (
        <section className={`bg-white dark:bg-dark-surface p-2 ${className}`}>
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent dark:before:via-gray-700">
                {items.map((item) => {
                    const { label, icon, color } = getEventDetails(item);

                    return (
                        <div key={String(item.id)} className="relative flex items-start gap-6 group">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-dark-surface border-2 border-gray-200 dark:border-gray-700 group-hover:border-primary transition-colors z-10 shrink-0 shadow-sm">
                                {icon}
                            </div>
                            <div className="flex-1 pt-0.5">
                                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${color}`}>
                                            {label}
                                        </span>
                                        <span className="text-xs font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                                            <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                                            {item.performerName}
                                        </span>
                                    </div>
                                    <time className="text-[10px] font-medium text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800/50 px-2 py-0.5 rounded">
                                        {new Date(item.updatedAt).toLocaleString(undefined, {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </time>
                                </div>
                                
                                {item.eventType === 'status_change' && item.status && (
                                    <p className="text-xs font-bold text-gray-900 dark:text-white mb-2">
                                        Status updated to <span className="text-primary">{item.status.replace(/_/g, ' ')}</span>
                                    </p>
                                )}
                                
                                {item.remarks ? (
                                    <div className="relative">
                                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed bg-gray-50 dark:bg-gray-800/30 p-3 rounded-lg border border-gray-100 dark:border-gray-700/50">
                                            {item.remarks}
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-400 italic">No additional description provided.</p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
