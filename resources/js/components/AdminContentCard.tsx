interface AdminContentCardProps {
    children: React.ReactNode;
    padding?: 'sm' | 'md' | 'lg';
    className?: string;
    title?: string;
}

export default function AdminContentCard({
    children,
    padding = 'md',
    className = '',
    title,
}: AdminContentCardProps) {
    const paddingClasses = {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
    };

    return (
        <div className={`bg-white dark:bg-dark-surface shadow-lg rounded-lg ${paddingClasses[padding]} ${className}`}>
            {title && (
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{title}</h3>
            )}
            {children}
        </div>
    );
}
