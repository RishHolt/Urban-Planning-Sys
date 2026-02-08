import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import AdminContentCard from '../../../components/AdminContentCard';
import Button from '../../../components/Button';
import { Plus, Camera, X, Filter } from 'lucide-react';
import { showSuccess, showError, showConfirm } from '../../../lib/swal';
import { getCsrfToken } from '../../../data/services';

interface PhotoGalleryProps {
    project: {
        id: string;
        project_code: string;
        project_name: string;
    };
    photos: Array<{
        id: string;
        photo_path: string;
        photo_url: string;
        photo_description: string | null;
        photo_category: string;
        taken_at: string | null;
        phase: {
            id: string;
            phase_name: string;
        } | null;
        milestone: {
            id: string;
            milestone_name: string;
        } | null;
        inspection: {
            id: string;
            inspection_type: string;
        } | null;
        taken_by: {
            id: string;
            name: string;
        } | null;
    }>;
    phases: Array<{
        id: string;
        phase_name: string;
    }>;
    milestones: Array<{
        id: string;
        milestone_name: string;
        phase_name: string;
    }>;
    inspections: Array<{
        id: string;
        inspection_type: string;
        scheduled_date: string | null;
    }>;
    filters?: {
        photo_category?: string;
        phase_id?: string;
        milestone_id?: string;
        inspection_id?: string;
    };
}

export default function PhotoGallery({ project, photos, phases, milestones, inspections, filters: initialFilters = {} }: PhotoGalleryProps) {
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

    const { data, setData, post, get } = useForm({
        photo: null as File | null,
        phase_id: '',
        milestone_id: '',
        inspection_id: '',
        photo_description: '',
        photo_category: 'progress',
        taken_at: new Date().toISOString().split('T')[0],
    });

    const filterData = useForm({
        photo_category: initialFilters.photo_category || '',
        phase_id: initialFilters.phase_id || '',
        milestone_id: initialFilters.milestone_id || '',
        inspection_id: initialFilters.inspection_id || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/admin/infrastructure/projects/${project.id}/photos`, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                setShowUploadModal(false);
                setData({
                    photo: null,
                    phase_id: '',
                    milestone_id: '',
                    inspection_id: '',
                    photo_description: '',
                    photo_category: 'progress',
                    taken_at: new Date().toISOString().split('T')[0],
                });
            },
        });
    };

    const handleDelete = async (photoId: string) => {
        const confirmed = await showConfirm(
            'Are you sure you want to delete this photo?',
            'Delete Photo',
            'Delete',
            'Cancel'
        );

        if (!confirmed) {
            return;
        }

        try {
            const response = await fetch(`/admin/infrastructure/projects/${project.id}/photos/${photoId}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete photo');
            }

            showSuccess('Photo deleted successfully');
            router.reload({ only: ['photos'] });
        } catch (error) {
            console.error('Error deleting photo:', error);
            showError('Failed to delete photo');
        }
    };

    const handleFilter = () => {
        get(`/admin/infrastructure/projects/${project.id}/photos`, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const getCategoryLabel = (category: string) => {
        const labels: Record<string, string> = {
            progress: 'Progress',
            milestone: 'Milestone',
            inspection: 'Inspection',
            before_after: 'Before/After',
            deficiency: 'Deficiency',
            completion: 'Completion',
            as_built: 'As-Built',
            other: 'Other',
        };
        return labels[category] || category;
    };

    const filteredPhotos = photos.filter((photo) => {
        if (filterData.data.photo_category && photo.photo_category !== filterData.data.photo_category) {
            return false;
        }
        if (filterData.data.phase_id && photo.phase?.id !== filterData.data.phase_id) {
            return false;
        }
        if (filterData.data.milestone_id && photo.milestone?.id !== filterData.data.milestone_id) {
            return false;
        }
        if (filterData.data.inspection_id && photo.inspection?.id !== filterData.data.inspection_id) {
            return false;
        }
        return true;
    });

    return (
        <AdminLayout
            title="Photo Gallery"
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
                    Upload Photo
                </Button>
            </div>

            {/* Filters */}
            {showFilters && (
                <AdminContentCard padding="md" className="mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                Category
                            </label>
                            <select
                                value={filterData.data.photo_category}
                                onChange={(e) => filterData.setData('photo_category', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-sm"
                            >
                                <option value="">All Categories</option>
                                <option value="progress">Progress</option>
                                <option value="milestone">Milestone</option>
                                <option value="inspection">Inspection</option>
                                <option value="before_after">Before/After</option>
                                <option value="deficiency">Deficiency</option>
                                <option value="completion">Completion</option>
                                <option value="as_built">As-Built</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                Phase
                            </label>
                            <select
                                value={filterData.data.phase_id}
                                onChange={(e) => filterData.setData('phase_id', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-sm"
                            >
                                <option value="">All Phases</option>
                                {phases.map((phase) => (
                                    <option key={phase.id} value={phase.id}>
                                        {phase.phase_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                Milestone
                            </label>
                            <select
                                value={filterData.data.milestone_id}
                                onChange={(e) => filterData.setData('milestone_id', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-sm"
                            >
                                <option value="">All Milestones</option>
                                {milestones.map((milestone) => (
                                    <option key={milestone.id} value={milestone.id}>
                                        {milestone.milestone_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                Inspection
                            </label>
                            <select
                                value={filterData.data.inspection_id}
                                onChange={(e) => filterData.setData('inspection_id', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-sm"
                            >
                                <option value="">All Inspections</option>
                                {inspections.map((inspection) => (
                                    <option key={inspection.id} value={inspection.id}>
                                        {inspection.inspection_type.replace('_', ' ')} - {inspection.scheduled_date ? new Date(inspection.scheduled_date).toLocaleDateString() : 'N/A'}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="secondary" size="sm" onClick={() => {
                            filterData.setData({
                                photo_category: '',
                                phase_id: '',
                                milestone_id: '',
                                inspection_id: '',
                            });
                        }}>
                            Clear
                        </Button>
                    </div>
                </AdminContentCard>
            )}

            <AdminContentCard padding="lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Photos ({filteredPhotos.length})
                </h3>
                {filteredPhotos.length === 0 ? (
                    <div className="text-center py-12">
                        <Camera className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No photos found</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {filterData.data.photo_category || filterData.data.phase_id || filterData.data.milestone_id || filterData.data.inspection_id
                                ? 'No photos match your filters.'
                                : 'Upload photos to document project progress.'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredPhotos.map((photo) => (
                            <div
                                key={photo.id}
                                className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 cursor-pointer"
                                onClick={() => setSelectedPhoto(photo.id)}
                            >
                                <img
                                    src={photo.photo_url}
                                    alt={photo.photo_description || 'Project photo'}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors">
                                    {photo.photo_description && (
                                        <div className="absolute bottom-0 left-0 right-0 p-2 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                                            {photo.photo_description}
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2">
                                        <span className="px-2 py-1 bg-black/50 text-white text-xs rounded">
                                            {getCategoryLabel(photo.photo_category)}
                                        </span>
                                    </div>
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
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Upload Photo</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Photo *
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setData('photo', e.target.files?.[0] || null)}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Category *
                                    </label>
                                    <select
                                        value={data.photo_category}
                                        onChange={(e) => setData('photo_category', e.target.value)}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
                                    >
                                        <option value="progress">Progress</option>
                                        <option value="milestone">Milestone</option>
                                        <option value="inspection">Inspection</option>
                                        <option value="before_after">Before/After</option>
                                        <option value="deficiency">Deficiency</option>
                                        <option value="completion">Completion</option>
                                        <option value="as_built">As-Built</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Phase
                                    </label>
                                    <select
                                        value={data.phase_id}
                                        onChange={(e) => setData('phase_id', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
                                    >
                                        <option value="">Select Phase (Optional)</option>
                                        {phases.map((phase) => (
                                            <option key={phase.id} value={phase.id}>
                                                {phase.phase_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Milestone
                                    </label>
                                    <select
                                        value={data.milestone_id}
                                        onChange={(e) => setData('milestone_id', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
                                    >
                                        <option value="">Select Milestone (Optional)</option>
                                        {milestones.map((milestone) => (
                                            <option key={milestone.id} value={milestone.id}>
                                                {milestone.milestone_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Inspection
                                    </label>
                                    <select
                                        value={data.inspection_id}
                                        onChange={(e) => setData('inspection_id', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
                                    >
                                        <option value="">Select Inspection (Optional)</option>
                                        {inspections.map((inspection) => (
                                            <option key={inspection.id} value={inspection.id}>
                                                {inspection.inspection_type.replace('_', ' ')}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Description
                                    </label>
                                    <input
                                        type="text"
                                        value={data.photo_description}
                                        onChange={(e) => setData('photo_description', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Taken At
                                    </label>
                                    <input
                                        type="date"
                                        value={data.taken_at}
                                        onChange={(e) => setData('taken_at', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <Button type="submit" variant="primary" disabled={processing} className="flex-1">
                                    {processing ? 'Uploading...' : 'Upload Photo'}
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

            {/* Photo Lightbox */}
            {selectedPhoto && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
                    onClick={() => setSelectedPhoto(null)}
                >
                    <div className="relative max-w-4xl w-full mx-4">
                        <button
                            onClick={() => setSelectedPhoto(null)}
                            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
                        >
                            <X size={24} />
                        </button>
                        {(() => {
                            const photo = photos.find((p) => p.id === selectedPhoto);
                            if (!photo) return null;
                            return (
                                <div>
                                    <img
                                        src={photo.photo_url}
                                        alt={photo.photo_description || 'Project photo'}
                                        className="w-full h-auto rounded-lg"
                                    />
                                    {photo.photo_description && (
                                        <div className="mt-4 text-white text-center">
                                            <p>{photo.photo_description}</p>
                                            <p className="text-sm text-gray-400 mt-1">
                                                {getCategoryLabel(photo.photo_category)} • {photo.taken_at ? new Date(photo.taken_at).toLocaleDateString() : 'N/A'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            );
                        })()}
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
