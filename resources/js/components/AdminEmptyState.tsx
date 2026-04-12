import { LucideIcon } from 'lucide-react';
import Button from './Button';

interface AdminEmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: React.ReactNode | {
        label: string;
        onClick: () => void;
    };
}

export default function AdminEmptyState({
    icon: Icon,
    title,
    description,
    action,
}: AdminEmptyStateProps) {
    const renderAction = () => {
        if (!action) return null;

        if (typeof action === 'object' && 'label' in action && 'onClick' in action) {
            return (
                <Button variant="primary" onClick={action.onClick}>
                    {action.label}
                </Button>
            );
        }

        return action as React.ReactNode;
    };

    return (
        <div className="text-center py-12">
            <Icon size={64} className="mx-auto mb-4 text-gray-400 dark:text-gray-600" />
            <h2 className="mb-2 font-semibold text-gray-900 dark:text-white text-xl">
                {title}
            </h2>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
                {description}
            </p>
            {renderAction()}
        </div>
    );
}
