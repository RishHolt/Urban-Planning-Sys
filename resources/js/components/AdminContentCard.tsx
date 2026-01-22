interface AdminContentCardProps {
    children: React.ReactNode;
    padding?: 'sm' | 'md' | 'lg';
    className?: string;
}

export default function AdminContentCard({
    children,
    padding = 'md',
    className = '',
}: AdminContentCardProps) {
    const paddingClasses = {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
    };

    return (
        <div className={`bg-white dark:bg-dark-surface shadow-lg rounded-lg ${paddingClasses[padding]} ${className}`}>
            {children}
        </div>
    );
}
