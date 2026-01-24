import { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import AdminLayout from '../../../components/AdminLayout';
import AdminFilterSection from '../../../components/AdminFilterSection';
import Button from '../../../components/Button';
import ClassificationModal from '../../../components/Zones/ClassificationModal';
import {
    deleteZoningClassification,
    importMunicipalityGeoJson,
    type ZoningClassification,
} from '../../../data/services';
import { showSuccess, showError, showConfirm } from '../../../lib/swal';
import { Tags, Plus, Edit2, Trash2, Shield } from 'lucide-react';

interface Classification {
    id: string;
    code: string;
    name: string;
    description: string | null;
    allowed_uses: string | null;
    color: string | null;
    is_active: boolean;
}

interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

interface ClassificationsIndexProps {
    classifications: PaginatedData<Classification>;
    filters?: {
        search?: string;
        status?: string;
    };
}

export default function ClassificationsIndex({ classifications, filters: initialFilters = {} }: ClassificationsIndexProps) {
    const [showFilters, setShowFilters] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingClassification, setEditingClassification] = useState<Classification | null>(null);
    const { data, setData, get } = useForm({
        search: initialFilters.search || '',
        status: initialFilters.status || '',
    });

    const handleSearch = (): void => {
        get('/admin/zoning/classifications', {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleReset = (): void => {
        setData({
            search: '',
            status: '',
        });
        router.get('/admin/zoning/classifications');
    };

    const handleCreate = (): void => {
        setEditingClassification(null);
        setShowModal(true);
    };

    const handleEdit = (classification: Classification): void => {
        setEditingClassification(classification);
        setShowModal(true);
    };

    const handleDelete = async (classification: Classification): Promise<void> => {
        const confirmed = await showConfirm(
            `Are you sure you want to delete classification "${classification.code} - ${classification.name}"?`,
            'Delete Classification',
            'Delete',
            'Cancel'
        );

        if (!confirmed) {
            return;
        }

        try {
            await deleteZoningClassification(classification.id);
            showSuccess('Classification deleted successfully');
            router.reload({ only: ['classifications'] });
        } catch (error: any) {
            console.error('Error deleting classification:', error);
            showError(error.message || 'Failed to delete classification');
        }
    };

    const handleMunicipalityImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            return;
        }

        const confirmed = await showConfirm(
            'This will clear the current municipality boundary and import a new one from the selected file. Continue?',
            'Import Municipality Boundary',
            'Yes, import',
            'Cancel'
        );

        if (!confirmed) {
            e.target.value = '';
            return;
        }

        try {
            const result = await importMunicipalityGeoJson(file);
            if (result.success) {
                showSuccess(result.message);
                router.reload();
            } else {
                showError(result.message || 'Failed to import municipality');
            }
        } catch (error: any) {
            showError('An error occurred during import');
            console.error(error);
        } finally {
            e.target.value = '';
        }
    };

    const handleModalSuccess = (): void => {
        router.reload({ only: ['classifications'] });
    };

    const getStatusBadge = (isActive: boolean) => {
        if (isActive) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    Active
                </span>
            );
        }
        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                Inactive
            </span>
        );
    };

    return (
        <>
            <AdminLayout
                title="Zoning Classifications"
                description="Manage zoning classifications and their properties"
                action={
                    <div className="relative">
                        <input
                            type="file"
                            id="municipality-import-header"
                            className="hidden"
                            accept=".json,.geojson,application/json,application/geo+json"
                            onChange={handleMunicipalityImport}
                        />
                        <Button
                            variant="primary"
                            size="md"
                            onClick={() => document.getElementById('municipality-import-header')?.click()}
                            className="flex items-center gap-2"
                            title="Import Municipality Boundary"
                        >
                            <Shield size={18} />
                            Import Municipality
                        </Button>
                    </div>
                }
            >
                <AdminFilterSection
                    searchValue={data.search}
                    onSearchChange={(value) => setData('search', value)}
                    onSearch={handleSearch}
                    onReset={handleReset}
                    showFilters={showFilters}
                    onToggleFilters={() => setShowFilters(!showFilters)}
                    searchPlaceholder="Search by code, name, or description..."
                    actionButtons={
                        <Button
                            variant="primary"
                            size="md"
                            onClick={handleCreate}
                            className="flex items-center gap-2"
                        >
                            <Plus size={18} />
                            Create Classification
                        </Button>
                    }
                    filterContent={
                        <>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Status
                                </label>
                                <select
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </>
                    }
                />

                {/* Classifications Table */}
                <div className="bg-white dark:bg-dark-surface rounded-lg shadow overflow-hidden">
                    {classifications.data.length === 0 ? (
                        <div className="text-center py-12">
                            <Tags className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                                No classifications found
                            </h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                {data.search || data.status
                                    ? 'No classifications match your search criteria.'
                                    : 'Get started by creating a new classification.'}
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-800">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Code
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Name
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Description
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Color
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-dark-surface divide-y divide-gray-200 dark:divide-gray-700">
                                        {classifications.data
                                            .filter(c => c.code?.toUpperCase() !== 'BOUNDARY' && c.name?.toUpperCase() !== 'BOUNDARY')
                                            .map((classification) => (
                                                <tr key={classification.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                        {classification.code}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                        {classification.name}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                                                        {classification.description || '—'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {classification.color ? (
                                                            <div className="flex items-center gap-2">
                                                                <div
                                                                    className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600"
                                                                    style={{ backgroundColor: classification.color }}
                                                                />
                                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                    {classification.color}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-sm text-gray-400">—</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {getStatusBadge(classification.is_active)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => handleEdit(classification)}
                                                                className="text-primary hover:text-primary/80 p-1 rounded transition-colors"
                                                                title="Edit"
                                                            >
                                                                <Edit2 size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(classification)}
                                                                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1 rounded transition-colors"
                                                                title="Delete"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {classifications.last_page > 1 && (
                                <div className="bg-white dark:bg-dark-surface px-4 py-3 border-t border-gray-200 dark:border-gray-700 sm:px-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 flex justify-between sm:hidden">
                                            {classifications.links.map((link, index) => {
                                                if (link.url === null) {
                                                    return (
                                                        <span
                                                            key={index}
                                                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-surface"
                                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                                        />
                                                    );
                                                }
                                                return (
                                                    <button
                                                        key={index}
                                                        onClick={() => router.get(link.url!)}
                                                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-surface hover:bg-gray-50 dark:hover:bg-gray-800"
                                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                                    />
                                                );
                                            })}
                                        </div>
                                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                            <div>
                                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                                    Showing <span className="font-medium">{classifications.from}</span> to{' '}
                                                    <span className="font-medium">{classifications.to}</span> of{' '}
                                                    <span className="font-medium">{classifications.total}</span> results
                                                </p>
                                            </div>
                                            <div>
                                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                                    {classifications.links.map((link, index) => {
                                                        if (link.url === null) {
                                                            return (
                                                                <span
                                                                    key={index}
                                                                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-500 dark:text-gray-400 bg-white dark:bg-dark-surface"
                                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                                />
                                                            );
                                                        }
                                                        return (
                                                            <button
                                                                key={index}
                                                                onClick={() => router.get(link.url!)}
                                                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md ${link.active
                                                                    ? 'z-10 bg-primary border-primary text-white'
                                                                    : 'bg-white dark:bg-dark-surface border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                                                    }`}
                                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                                            />
                                                        );
                                                    })}
                                                </nav>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </AdminLayout>

            <ClassificationModal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    setEditingClassification(null);
                }}
                onSuccess={handleModalSuccess}
                classification={editingClassification}
            />
        </>
    );
}
