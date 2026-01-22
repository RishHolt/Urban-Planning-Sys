import { Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import AdminFilterSection from '../../../components/AdminFilterSection';
import AdminEmptyState from '../../../components/AdminEmptyState';
import { ClipboardCheck, Eye, Plus, Calendar } from 'lucide-react';

interface InspectionItem {
    id: string;
    building: {
        id: string;
        building_code: string;
        building_name: string | null;
    } | null;
    unit: {
        id: string;
        unit_no: string;
    } | null;
    inspection_type: string;
    result: string | null;
    scheduled_date: string | null;
    inspection_date: string | null;
    inspected_at: string | null;
    created_at: string;
}

interface InspectionsIndexProps {
    inspections: {
        data: InspectionItem[];
        links: any;
        meta: any;
    };
    filters: {
        search?: string;
        inspection_type?: string;
        result?: string;
        inspector_id?: string;
        dateFrom?: string;
        dateTo?: string;
    };
}

export default function InspectionsIndex({ inspections, filters: initialFilters }: InspectionsIndexProps) {
    const [showFilters, setShowFilters] = useState(false);
    const { data, setData, get } = useForm({
        search: initialFilters.search || '',
        inspection_type: initialFilters.inspection_type || '',
        result: initialFilters.result || '',
        inspector_id: initialFilters.inspector_id || '',
        dateFrom: initialFilters.dateFrom || '',
        dateTo: initialFilters.dateTo || '',
    });

    const handleSearch = (): void => {
        get('/admin/occupancy/inspections', {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleReset = (): void => {
        setData({
            search: '',
            inspection_type: '',
            result: '',
            inspector_id: '',
            dateFrom: '',
            dateTo: '',
        });
        router.get('/admin/occupancy/inspections');
    };

    const getTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            'annual': 'Annual',
            'periodic': 'Periodic',
            'pre_occupancy': 'Pre-Occupancy',
            'complaint_based': 'Complaint-Based',
            'follow_up': 'Follow-Up',
            'random': 'Random',
        };
        return labels[type] || type;
    };

    const getResultBadge = (result: string | null) => {
        if (!result) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                    Pending
                </span>
            );
        }

        const resultConfig: Record<string, { label: string; className: string }> = {
            'compliant': {
                label: 'Compliant',
                className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            },
            'non_compliant': {
                label: 'Non-Compliant',
                className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
            },
            'conditional': {
                label: 'Conditional',
                className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            },
            'pending_correction': {
                label: 'Pending Correction',
                className: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
            },
        };

        const config = resultConfig[result] || resultConfig['compliant'];
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
                {config.label}
            </span>
        );
    };

    return (
        <AdminLayout title="Inspections" description="Manage and track building inspections">
            <div className="space-y-6">
                <div className="flex justify-end">
                    <Link
                        href="/admin/occupancy/inspections/create"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        <Plus size={20} />
                        Schedule Inspection
                    </Link>
                </div>

                <AdminFilterSection
                    searchValue={data.search}
                    onSearchChange={(value) => setData('search', value)}
                    onSearch={handleSearch}
                    onReset={handleReset}
                    showFilters={showFilters}
                    onToggleFilters={() => setShowFilters(!showFilters)}
                    searchPlaceholder="Search by building code, name..."
                    filterContent={
                        showFilters && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground dark:text-gray-300 mb-1">
                                        Inspection Type
                                    </label>
                                    <select
                                        value={data.inspection_type}
                                        onChange={(e) => setData('inspection_type', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-foreground dark:text-white"
                                    >
                                        <option value="">All Types</option>
                                        <option value="annual">Annual</option>
                                        <option value="periodic">Periodic</option>
                                        <option value="pre_occupancy">Pre-Occupancy</option>
                                        <option value="complaint_based">Complaint-Based</option>
                                        <option value="follow_up">Follow-Up</option>
                                        <option value="random">Random</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground dark:text-gray-300 mb-1">
                                        Result
                                    </label>
                                    <select
                                        value={data.result}
                                        onChange={(e) => setData('result', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-foreground dark:text-white"
                                    >
                                        <option value="">All Results</option>
                                        <option value="compliant">Compliant</option>
                                        <option value="non_compliant">Non-Compliant</option>
                                        <option value="conditional">Conditional</option>
                                        <option value="pending_correction">Pending Correction</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground dark:text-gray-300 mb-1">
                                        Date From
                                    </label>
                                    <input
                                        type="date"
                                        value={data.dateFrom}
                                        onChange={(e) => setData('dateFrom', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-foreground dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground dark:text-gray-300 mb-1">
                                        Date To
                                    </label>
                                    <input
                                        type="date"
                                        value={data.dateTo}
                                        onChange={(e) => setData('dateTo', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-foreground dark:text-white"
                                    />
                                </div>
                            </div>
                        )
                    }
                />

                {inspections.data.length === 0 ? (
                    <AdminEmptyState
                        icon={ClipboardCheck}
                        title="No inspections found"
                        description="Get started by scheduling a new inspection"
                        action={
                            <Link
                                href="/admin/occupancy/inspections/create"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                            >
                                <Plus size={20} />
                                Schedule Inspection
                            </Link>
                        }
                    />
                ) : (
                    <div className="bg-white dark:bg-dark-surface shadow-lg rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Building / Unit
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Type
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Scheduled Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Inspection Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Result
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-dark-surface divide-y divide-gray-200 dark:divide-gray-700">
                                    {inspections.data.map((inspection) => (
                                        <tr key={inspection.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-foreground dark:text-white">
                                                    {inspection.building?.building_code || 'N/A'}
                                                </div>
                                                {inspection.building?.building_name && (
                                                    <div className="text-sm text-muted-foreground dark:text-gray-400">
                                                        {inspection.building.building_name}
                                                    </div>
                                                )}
                                                {inspection.unit && (
                                                    <div className="text-xs text-muted-foreground dark:text-gray-400">
                                                        Unit: {inspection.unit.unit_no}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-foreground dark:text-white">
                                                    {getTypeLabel(inspection.inspection_type)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground dark:text-white">
                                                {inspection.scheduled_date || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground dark:text-white">
                                                {inspection.inspection_date || 'Not Completed'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getResultBadge(inspection.result)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link
                                                    href={`/admin/occupancy/inspections/${inspection.id}`}
                                                    className="text-primary hover:text-primary/80 inline-flex items-center gap-1"
                                                >
                                                    <Eye size={16} />
                                                    View
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {inspections.links && inspections.links.length > 3 && (
                            <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-muted-foreground dark:text-gray-400">
                                        Showing {inspections.meta.from} to {inspections.meta.to} of {inspections.meta.total} results
                                    </div>
                                    <div className="flex gap-2">
                                        {inspections.links.map((link: any, index: number) => (
                                            <button
                                                key={index}
                                                onClick={() => link.url && router.get(link.url)}
                                                disabled={!link.url}
                                                className={`px-3 py-1 rounded text-sm ${
                                                    link.active
                                                        ? 'bg-primary text-white'
                                                        : 'bg-white dark:bg-dark-surface text-foreground dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                                                } ${!link.url ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
