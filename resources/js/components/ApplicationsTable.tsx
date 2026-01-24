import { Link } from '@inertiajs/react';
import { FileText, Eye } from 'lucide-react';
import StatusBadge from './StatusBadge';

export type ApplicationStatus = 'pending' | 'in_review' | 'approved' | 'rejected';

export interface BaseApplication {
    id: string;
    applicationNumber: string;
    projectType: string;
    status: ApplicationStatus;
    submittedAt: string;
}

export interface AdminApplication extends BaseApplication {
    applicantName: string;
    companyName: string | null;
    applicantType: string;
    municipality: string;
    barangay: string;
    createdAt: string;
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: PaginationLink[];
}

interface ApplicationsTableProps<T extends BaseApplication> {
    applications: T[] | PaginatedData<T>;
    viewUrl: (id: string) => string;
    columns?: 'admin' | 'user' | 'custom';
    customColumns?: Array<{
        key: string;
        label: string;
        render: (application: T) => React.ReactNode;
    }>;
    emptyState?: {
        title: string;
        message: string;
        action?: React.ReactNode;
    };
    onPaginationClick?: (url: string) => void;
}

export default function ApplicationsTable<T extends BaseApplication>({
    applications,
    viewUrl,
    columns = 'user',
    customColumns,
    emptyState,
    onPaginationClick,
}: ApplicationsTableProps<T>) {
    const isPaginated = 'data' in applications && 'current_page' in applications;
    const apps = isPaginated ? (applications.data || []) : (Array.isArray(applications) ? applications : []);
    const pagination = isPaginated ? applications : null;

    const isAdminView = columns === 'admin' || (customColumns && customColumns.length > 0);

    const defaultEmptyState = {
        title: 'No Applications Found',
        message: isAdminView
            ? 'Try adjusting your search or filter criteria.'
            : 'You haven\'t submitted any applications. Start by creating a new application.',
    };

    const emptyStateConfig = emptyState || defaultEmptyState;

    if (!Array.isArray(apps) || apps.length === 0) {
        return (
            <div className="bg-white dark:bg-dark-surface shadow-lg rounded-lg p-12 text-center">
                <FileText size={64} className="mx-auto mb-4 text-gray-400 dark:text-gray-600" />
                <h2 className="mb-2 font-semibold text-gray-900 dark:text-white text-xl">
                    {emptyStateConfig.title}
                </h2>
                <p className="mb-6 text-gray-600 dark:text-gray-400">
                    {emptyStateConfig.message}
                </p>
                {emptyStateConfig.action}
            </div>
        );
    }

    const renderCell = (application: T, columnKey: string): React.ReactNode => {
        if (customColumns) {
            const customColumn = customColumns.find(col => col.key === columnKey);
            if (customColumn) {
                return customColumn.render(application);
            }
        }

        switch (columnKey) {
            case 'applicationNumber':
                return (
                    <div className="flex items-center gap-2">
                        <FileText size={18} className="text-gray-400" />
                        <span className="font-medium text-gray-900 dark:text-white">
                            {application.applicationNumber}
                        </span>
                    </div>
                );

            case 'applicant':
                if (isAdminView && 'applicantName' in application) {
                    const adminApp = application as AdminApplication;
                    return (
                        <div className="text-sm">
                            <div className="font-medium text-gray-900 dark:text-white">
                                {adminApp.companyName || adminApp.applicantName}
                            </div>
                            <div className="text-gray-500 dark:text-gray-400 text-xs">
                                {adminApp.applicantType}
                            </div>
                        </div>
                    );
                }
                return null;

            case 'projectType':
                return (
                    <span className="text-gray-700 dark:text-gray-300 text-sm">
                        {application.projectType}
                    </span>
                );

            case 'location':
                if ('municipality' in application && 'barangay' in application) {
                    const appWithLocation = application as AdminApplication | (BaseApplication & { municipality: string; barangay: string });
                    return (
                        <div className="text-sm">
                            <div className="text-gray-700 dark:text-gray-300">
                                {appWithLocation.municipality}
                            </div>
                            <div className="text-gray-500 dark:text-gray-400 text-xs">
                                {appWithLocation.barangay}
                            </div>
                        </div>
                    );
                }
                return null;

            case 'status':
                return <StatusBadge status={application.status} />;

            case 'submitted':
                return (
                    <span className="text-gray-600 dark:text-gray-400 text-sm">
                        {new Date(application.submittedAt).toLocaleDateString()}
                    </span>
                );

            case 'actions':
                return (
                    <Link
                        href={viewUrl(application.id)}
                        className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium"
                    >
                        <Eye size={16} />
                        View
                    </Link>
                );

            default:
                return null;
        }
    };

    const getColumns = (): Array<{ key: string; label: string }> => {
        if (customColumns) {
            return customColumns.map(col => ({ key: col.key, label: col.label }));
        }

        if (columns === 'admin') {
            return [
                { key: 'applicationNumber', label: 'Application Number' },
                { key: 'applicant', label: 'Applicant' },
                { key: 'projectType', label: 'Project Type' },
                { key: 'location', label: 'Location' },
                { key: 'status', label: 'Status' },
                { key: 'submitted', label: 'Submitted' },
                { key: 'actions', label: 'Actions' },
            ];
        }

        // User columns - match admin layout
        return [
            { key: 'applicationNumber', label: 'Application Number' },
            { key: 'projectType', label: 'Project Type' },
            { key: 'location', label: 'Location' },
            { key: 'status', label: 'Status' },
            { key: 'submitted', label: 'Submitted' },
            { key: 'actions', label: 'Actions' },
        ];
    };

    const tableColumns = getColumns();

    return (
        <div className="bg-white dark:bg-dark-surface shadow-lg rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                            {tableColumns.map((column) => (
                                <th
                                    key={column.key}
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                                >
                                    {column.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-dark-surface divide-y divide-gray-200 dark:divide-gray-700">
                        {apps.map((application) => (
                            <tr
                                key={application.id}
                                className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                {tableColumns.map((column) => (
                                    <td
                                        key={column.key}
                                        className="px-6 py-4 whitespace-nowrap"
                                    >
                                        {renderCell(application, column.key)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.last_page > 1 && onPaginationClick && (
                <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                        Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to{' '}
                        {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of{' '}
                        {pagination.total} results
                    </div>
                    <div className="flex gap-2">
                        {pagination.links.map((link, index) => {
                            if (index === 0) {
                                return (
                                    <button
                                        key={index}
                                        onClick={() => link.url && onPaginationClick(link.url)}
                                        disabled={!link.url}
                                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-700 dark:text-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
                                    >
                                        Previous
                                    </button>
                                );
                            }
                            if (index === pagination.links.length - 1) {
                                return (
                                    <button
                                        key={index}
                                        onClick={() => link.url && onPaginationClick(link.url)}
                                        disabled={!link.url}
                                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-700 dark:text-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
                                    >
                                        Next
                                    </button>
                                );
                            }
                            return (
                                <button
                                    key={index}
                                    onClick={() => link.url && onPaginationClick(link.url)}
                                    className={`px-3 py-2 border rounded-lg text-sm ${link.active
                                            ? 'bg-primary text-white border-primary'
                                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-surface text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                        }`}
                                >
                                    {link.label.replace('&laquo;', '').replace('&raquo;', '').trim()}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
