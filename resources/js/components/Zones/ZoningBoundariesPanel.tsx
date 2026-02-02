import { router } from '@inertiajs/react';
import Button from '../Button';
import { Layers, ExternalLink } from 'lucide-react';

interface ZoningBoundariesPanelProps {
    classifications: Array<{
        id: string;
        code: string;
        name: string;
        description: string | null;
        color: string | null;
        is_active: boolean;
    }>;
    zoningCounts: Record<string, number>;
}

export default function ZoningBoundariesPanel({ 
    classifications, 
    zoningCounts 
}: ZoningBoundariesPanelProps) {
    const filteredClassifications = classifications.filter(
        c => c.code?.toUpperCase() !== 'BOUNDARY' && c.name?.toUpperCase() !== 'BOUNDARY'
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Zoning Boundaries
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        View and manage zoning boundaries by classification
                    </p>
                </div>
                <Button
                    variant="primary"
                    size="md"
                    onClick={() => router.visit('/admin/zoning/map')}
                    className="flex items-center gap-2"
                >
                    <Layers size={18} />
                    Open Zoning Map
                </Button>
            </div>

            {filteredClassifications.length === 0 ? (
                <div className="bg-white dark:bg-dark-surface rounded-lg shadow p-12 text-center">
                    <Layers className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                        No zoning classifications
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Create classifications first to manage zoning boundaries.
                    </p>
                </div>
            ) : (
                <div className="bg-white dark:bg-dark-surface rounded-lg shadow overflow-hidden">
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
                                        Color
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Zones Count
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-dark-surface divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredClassifications.map((classification) => {
                                    const zoneCount = zoningCounts[classification.id] || 0;
                                    return (
                                        <tr key={classification.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                {classification.code}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {classification.name}
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
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {zoneCount} {zoneCount === 1 ? 'zone' : 'zones'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => router.visit(`/admin/zoning/map?classification=${classification.id}`)}
                                                    className="text-primary hover:text-primary/80 p-1 rounded transition-colors flex items-center gap-1"
                                                    title="View on Map"
                                                >
                                                    <ExternalLink size={16} />
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
