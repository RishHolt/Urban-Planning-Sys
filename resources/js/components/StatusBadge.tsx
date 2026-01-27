import { CheckCircle, XCircle, Clock, Search, MapPin } from 'lucide-react';

export type ApplicationStatus = 'pending' | 'in_review' | 'approved' | 'rejected' | 'under_review' | 'for_inspection';

interface StatusBadgeProps {
    status: ApplicationStatus;
    className?: string;
    showIcon?: boolean;
}

export default function StatusBadge({ status, className = '', showIcon = true }: StatusBadgeProps) {
    const getStatusConfig = (status: ApplicationStatus) => {
        switch (status) {
            case 'approved':
                return {
                    label: 'Approved',
                    icon: <CheckCircle size={16} className="text-green-500" />,
                    bgColor: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200',
                };
            case 'rejected':
                return {
                    label: 'Rejected',
                    icon: <XCircle size={16} className="text-red-500" />,
                    bgColor: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200',
                };
            case 'in_review':
            case 'under_review':
                return {
                    label: status === 'under_review' ? 'Under Review' : 'In Review',
                    icon: <Search size={16} className="text-blue-500" />,
                    bgColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200',
                };
            case 'for_inspection':
                return {
                    label: 'For Inspection',
                    icon: <MapPin size={16} className="text-purple-500" />,
                    bgColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200',
                };
            default: // pending
                return {
                    label: 'Pending',
                    icon: <Clock size={16} className="text-yellow-500" />,
                    bgColor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200',
                };
        }
    };

    const config = getStatusConfig(status);

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bgColor} ${className}`}>
            {showIcon && config.icon}
            {config.label}
        </span>
    );
}
