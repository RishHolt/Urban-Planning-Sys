import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import AdminContentCard from '../../../components/AdminContentCard';
import Button from '../../../components/Button';
import { Plus, FileText, Download, Trash2, Filter } from 'lucide-react';
import { showSuccess, showError, showConfirm } from '../../../lib/swal';
import { getCsrfToken } from '../../../data/services';

interface DocumentsIndexProps {
    project: {
        id: string;
        project_code: string;
        project_name: string;
    };
    documents: Array<{
        id: string;
        document_type: string;
        file_name: string;
        file_path: string;
        file_url: string;
        file_type: string;
        file_size: number;
        uploaded_at: string | null;
    }>;
    filters?: {
        document_type?: string;
    };
}

export default function DocumentsIndex({ project, documents, filters: initialFilters = {} }: DocumentsIndexProps) {
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    const { data, setData, post } = useForm({
        document: null as File | null,
        document_type: 'project_plan',
    });

    const filterData = useForm({
        document_type: initialFilters.document_type || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/admin/infrastructure/projects/${project.id}/documents`, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                setShowUploadModal(false);
                setData({
                    document: null,
                    document_type: 'project_plan',
                });
            },
        });
    };

    const handleDelete = async (documentId: string) => {
        const confirmed = await showConfirm(
            'Are you sure you want to delete this document?',
            'Delete Document',
            'Delete',
            'Cancel'
        );

        if (!confirmed) {
            return;
        }

        try {
            const response = await fetch(`/admin/infrastructure/projects/${project.id}/documents/${documentId}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete document');
            }

            showSuccess('Document deleted successfully');
            router.reload({ only: ['documents'] });
        } catch (error) {
            console.error('Error deleting document:', error);
            showError('Failed to delete document');
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const getDocumentTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            project_plan: 'Project Plan',
            engineering_design: 'Engineering Design',
            budget_allocation: 'Budget Allocation',
            contract: 'Contract',
            progress_report: 'Progress Report',
            inspection_report: 'Inspection Report',
            completion_report: 'Completion Report',
            as_built_drawings: 'As-Built Drawings',
        };
        return labels[type] || type;
    };

    const filteredDocuments = documents.filter((doc) => {
        if (filterData.data.document_type && doc.document_type !== filterData.data.document_type) {
            return false;
        }
        return true;
    });

    return (
        <AdminLayout
            title="Project Documents"
            description={`${project.project_code} - ${project.project_name}`}
            backButton={{
                href: `/admin/infrastructure/projects/${project.id}`,
                label: 'Back to Project',
            }}
        >
            <div className="mb-6 flex justify-between items-center">
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2"
                >
                    <Filter size={18} />
                    Filters
                </Button>
                <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setShowUploadModal(true)}
                    className="flex items-center gap-2"
                >
                    <Plus size={18} />
                    Upload Document
                </Button>
            </div>

            {/* Filters */}
            {showFilters && (
                <AdminContentCard padding="md" className="mb-6">
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Document Type
                        </label>
                        <select
                            value={filterData.data.document_type}
                            onChange={(e) => filterData.setData('document_type', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-sm"
                        >
                            <option value="">All Types</option>
                            <option value="project_plan">Project Plan</option>
                            <option value="engineering_design">Engineering Design</option>
                            <option value="budget_allocation">Budget Allocation</option>
                            <option value="contract">Contract</option>
                            <option value="progress_report">Progress Report</option>
                            <option value="inspection_report">Inspection Report</option>
                            <option value="completion_report">Completion Report</option>
                            <option value="as_built_drawings">As-Built Drawings</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="secondary" size="sm" onClick={() => filterData.setData('document_type', '')}>
                            Clear
                        </Button>
                    </div>
                </AdminContentCard>
            )}

            <AdminContentCard padding="lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Documents ({filteredDocuments.length})
                </h3>
                {filteredDocuments.length === 0 ? (
                    <div className="text-center py-12">
                        <FileText className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No documents found</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {filterData.data.document_type
                                ? 'No documents match your filter.'
                                : 'Upload documents to manage project files.'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {filteredDocuments.map((document) => (
                            <div
                                key={document.id}
                                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                <div className="flex items-center gap-3 flex-1">
                                    <FileText size={24} className="text-gray-400" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{document.file_name}</p>
                                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-600 dark:text-gray-400">
                                            <span className="capitalize">{getDocumentTypeLabel(document.document_type)}</span>
                                            <span>•</span>
                                            <span>{formatFileSize(document.file_size)}</span>
                                            {document.uploaded_at && (
                                                <>
                                                    <span>•</span>
                                                    <span>{new Date(document.uploaded_at).toLocaleDateString()}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <a
                                        href={`/admin/infrastructure/projects/${project.id}/documents/${document.id}`}
                                        className="p-2 text-primary hover:text-primary/80 rounded transition-colors"
                                        title="Download"
                                    >
                                        <Download size={18} />
                                    </a>
                                    <button
                                        onClick={() => handleDelete(document.id)}
                                        className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 rounded transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </AdminContentCard>

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm">
                    <div className="bg-white dark:bg-dark-surface rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Upload Document</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Document *
                                    </label>
                                    <input
                                        type="file"
                                        onChange={(e) => setData('document', e.target.files?.[0] || null)}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Document Type *
                                    </label>
                                    <select
                                        value={data.document_type}
                                        onChange={(e) => setData('document_type', e.target.value)}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
                                    >
                                        <option value="project_plan">Project Plan</option>
                                        <option value="engineering_design">Engineering Design</option>
                                        <option value="budget_allocation">Budget Allocation</option>
                                        <option value="contract">Contract</option>
                                        <option value="progress_report">Progress Report</option>
                                        <option value="inspection_report">Inspection Report</option>
                                        <option value="completion_report">Completion Report</option>
                                        <option value="as_built_drawings">As-Built Drawings</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <Button type="submit" variant="primary" disabled={post.processing} className="flex-1">
                                    {post.processing ? 'Uploading...' : 'Upload Document'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setShowUploadModal(false)}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
