interface AdminPageHeaderProps {
    title: string;
    description?: string;
    action?: React.ReactNode;
}

export default function AdminPageHeader({ title, description, action }: AdminPageHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
                <h1 className="font-bold text-gray-900 dark:text-white text-3xl mb-2">
                    {title}
                </h1>
                {description && (
                    <p className="text-gray-600 dark:text-gray-400">
                        {description}
                    </p>
                )}
            </div>
            {action && (
                <div className="flex items-center gap-3">
                    {action}
                </div>
            )}
        </div>
    );
}
