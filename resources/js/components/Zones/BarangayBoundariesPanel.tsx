import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import Button from '../Button';
import { 
    getBarangayBoundaries, 
    createBarangayBoundary, 
    deleteBarangayBoundary,
    deleteAllBarangayBoundaries,
    importBarangayBoundaries,
    type BarangayBoundary 
} from '../../data/services';
import { showSuccess, showError, showConfirm } from '../../lib/swal';
import { MapPin, Plus, Upload, Edit2, Trash2, RotateCcw } from 'lucide-react';

interface BarangayBoundariesPanelProps {
    initialBoundaries?: BarangayBoundary[];
}

export default function BarangayBoundariesPanel({ initialBoundaries = [] }: BarangayBoundariesPanelProps) {
    const [boundaries, setBoundaries] = useState<BarangayBoundary[]>(initialBoundaries);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadBoundaries();
    }, []);

    const loadBoundaries = async () => {
        try {
            const data = await getBarangayBoundaries();
            setBoundaries(data);
        } catch (error) {
            console.error('Failed to load barangay boundaries:', error);
        }
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            return;
        }

        const confirmed = await showConfirm(
            'This will import barangay boundaries from the GeoJSON file. Existing boundaries with the same name will be updated. Continue?',
            'Import Barangay Boundaries',
            'Yes, import',
            'Cancel'
        );

        if (!confirmed) {
            e.target.value = '';
            return;
        }

        setLoading(true);
        try {
            const result = await importBarangayBoundaries(file);
            showSuccess(result.message || 'Barangay boundaries imported successfully.');
            await loadBoundaries();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to import barangay boundaries';
            showError(errorMessage);
        } finally {
            setLoading(false);
            e.target.value = '';
        }
    };

    const handleDelete = async (id: string, label: string) => {
        const confirmed = await showConfirm(
            `Are you sure you want to delete the barangay boundary "${label}"?`,
            'Delete Barangay Boundary',
            'Delete',
            'Cancel'
        );

        if (!confirmed) {
            return;
        }

        setLoading(true);
        try {
            await deleteBarangayBoundary(id);
            showSuccess('Barangay boundary deleted successfully.');
            await loadBoundaries();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete barangay boundary';
            showError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAll = async () => {
        if (boundaries.length === 0) {
            showError('No barangay boundaries to delete.');
            return;
        }

        const confirmed = await showConfirm(
            `Are you sure you want to delete ALL ${boundaries.length} barangay boundary(ies)? This action cannot be undone.`,
            'Delete All Barangay Boundaries',
            'Yes, delete all',
            'Cancel'
        );

        if (!confirmed) {
            return;
        }

        setLoading(true);
        try {
            const result = await deleteAllBarangayBoundaries();
            showSuccess(result.message || 'All barangay boundaries deleted successfully.');
            await loadBoundaries();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete all barangay boundaries';
            showError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="font-medium text-gray-900 dark:text-white text-lg">
                        Barangay Boundaries
                    </h3>
                    <p className="mt-1 text-gray-500 dark:text-gray-400 text-sm">
                        Manage administrative boundaries for barangays
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="secondary"
                        size="md"
                        onClick={() => router.visit('/admin/zoning/map?boundary=barangay')}
                        className="flex items-center gap-2"
                    >
                        <Plus size={18} />
                        Add Barangay
                    </Button>
                    <div className="relative">
                        <input
                            type="file"
                            id="barangay-import"
                            className="hidden"
                            accept=".json,.geojson,application/json,application/geo+json"
                            onChange={handleImport}
                            disabled={loading}
                        />
                        <Button
                            variant="primary"
                            size="md"
                            onClick={() => document.getElementById('barangay-import')?.click()}
                            disabled={loading}
                            className="flex items-center gap-2"
                        >
                            <Upload size={18} />
                            Import
                        </Button>
                    </div>
                    {boundaries.length > 0 && (
                        <Button
                            variant="danger"
                            size="md"
                            onClick={handleDeleteAll}
                            disabled={loading}
                            className="flex items-center gap-2"
                        >
                            <RotateCcw size={18} />
                            Remove All
                        </Button>
                    )}
                </div>
            </div>

            {boundaries.length === 0 ? (
                <div className="bg-white dark:bg-dark-surface shadow p-12 rounded-lg text-center">
                    <MapPin className="mx-auto w-12 h-12 text-gray-400" />
                    <h3 className="mt-2 font-medium text-gray-900 dark:text-white text-sm">
                        No barangay boundaries
                    </h3>
                    <p className="mt-1 text-gray-500 dark:text-gray-400 text-sm">
                        Add or import barangay boundaries to get started.
                    </p>
                </div>
            ) : (
                <div className="bg-white dark:bg-dark-surface shadow rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="divide-y divide-gray-200 dark:divide-gray-700 min-w-full">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400 text-xs text-left uppercase tracking-wider">
                                        Barangay Name
                                    </th>
                                    <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400 text-xs text-left uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400 text-xs text-left uppercase tracking-wider">
                                        Has Geometry
                                    </th>
                                    <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400 text-xs text-right uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-dark-surface divide-y divide-gray-200 dark:divide-gray-700">
                                {boundaries.map((boundary) => (
                                    <tr key={boundary.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white text-sm whitespace-nowrap">
                                            {boundary.label || 'Unnamed Barangay'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                boundary.is_active
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                            }`}>
                                                {boundary.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-sm whitespace-nowrap">
                                            {boundary.geometry ? (
                                                <span className="text-green-600 dark:text-green-400">Yes</span>
                                            ) : (
                                                <span className="text-gray-400">No</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-sm text-right whitespace-nowrap">
                                            <div className="flex justify-end items-center gap-2">
                                                <button
                                                    onClick={() => router.visit(`/admin/zoning/map?boundary=barangay&id=${boundary.id}`)}
                                                    className="p-1 rounded text-primary hover:text-primary/80 transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(boundary.id, boundary.label || 'Unnamed')}
                                                    className="p-1 rounded text-red-600 hover:text-red-800 dark:hover:text-red-300 dark:text-red-400 transition-colors"
                                                    title="Delete"
                                                    disabled={loading}
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
                </div>
            )}
        </div>
    );
}
