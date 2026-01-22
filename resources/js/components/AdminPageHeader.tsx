interface AdminPageHeaderProps {
    title: string;
    description?: string;
}

export default function AdminPageHeader({ title, description }: AdminPageHeaderProps) {
    return (
        <div className="mb-8">
            <h1 className="font-bold text-gray-900 dark:text-white text-3xl mb-2">
                {title}
            </h1>
            {description && (
                <p className="text-gray-600 dark:text-gray-400">
                    {description}
                </p>
            )}
        </div>
    );
}
