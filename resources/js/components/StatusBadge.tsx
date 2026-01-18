import { CheckCircle, XCircle, Clock } from 'lucide-react';

type ApplicationStatus = 'pending' | 'in_review' | 'approved' | 'rejected';

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
                return {
                    label: 'In Review',
                    icon: <Clock size={16} className="text-blue-500" />,
                    bgColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200',
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
