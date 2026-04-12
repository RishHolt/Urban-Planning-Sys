import { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import AdminLayout from '../../../components/AdminLayout';
import AdminFilterSection from '../../../components/AdminFilterSection';
import Button from '../../../components/Button';
import {
    createComplianceRule,
    updateComplianceRule,
    deleteComplianceRule,
    seedComplianceRulesFromConfig,
    type ComplianceRule,
} from '../../../data/services';
import { showSuccess, showError, showConfirm } from '../../../lib/swal';
import { ShieldCheck, Plus, Edit2, Trash2, Download, X } from 'lucide-react';

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

interface Classification {
    id: string;
    code: string;
    name: string;
}

interface ComplianceRulesIndexProps {
    rules: PaginatedData<ComplianceRule>;
    classifications: Classification[];
    filters?: {
        search?: string;
        status?: string;
    };
}

const LAND_USE_OPTIONS = [
    { value: 'residential', label: 'Residential' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'industrial', label: 'Industrial' },
    { value: 'agricultural', label: 'Agricultural' },
    { value: 'institutional', label: 'Institutional' },
    { value: 'mixed_use', label: 'Mixed Use' },
];

const EMPTY_FORM: Omit<ComplianceRule, 'id'> = {
    classification_code: '',
    name: '',
    allowed_uses: [],
    front_setback: 3.0,
    rear_setback: 2.0,
    side_setback: 1.5,
    floor_area_ratio: 0.6,
    max_height: 15.0,
    max_storeys: 5,
    open_space_requirement: 0.2,
    min_lot_area: 100.0,
    is_active: true,
};

export default function ComplianceRulesIndex({
    rules,
    classifications,
    filters: initialFilters = {},
}: ComplianceRulesIndexProps) {
    const [showModal, setShowModal] = useState(false);
    const [editingRule, setEditingRule] = useState<ComplianceRule | null>(null);
    const [formData, setFormData] = useState<Omit<ComplianceRule, 'id'>>(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [seeding, setSeeding] = useState(false);
    const { data, setData } = useForm({
        search: initialFilters.search || '',
        status: initialFilters.status || '',
    });

    const handleSearch = (): void => {
        router.get(
            '/admin/zoning/compliance-rules',
            Object.fromEntries(Object.entries(data).filter(([, v]) => v !== '' && v !== null && v !== undefined)),
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleReset = (): void => {
        setData({ search: '', status: '' });
        router.get('/admin/zoning/compliance-rules');
    };

    const handleCreate = (): void => {
        setEditingRule(null);
        setFormData(EMPTY_FORM);
        setShowModal(true);
    };

    const handleEdit = (rule: ComplianceRule): void => {
        setEditingRule(rule);
        setFormData({
            classification_code: rule.classification_code,
            name: rule.name,
            allowed_uses: rule.allowed_uses,
            front_setback: rule.front_setback,
            rear_setback: rule.rear_setback,
            side_setback: rule.side_setback,
            floor_area_ratio: rule.floor_area_ratio,
            max_height: rule.max_height,
            max_storeys: rule.max_storeys,
            open_space_requirement: rule.open_space_requirement,
            min_lot_area: rule.min_lot_area,
            is_active: rule.is_active,
        });
        setShowModal(true);
    };

    const handleDelete = async (rule: ComplianceRule): Promise<void> => {
        const confirmed = await showConfirm(
            `Are you sure you want to delete the compliance rule for "${rule.classification_code} - ${rule.name}"?`,
            'Delete Compliance Rule',
            'Delete',
            'Cancel',
        );
        if (!confirmed) return;

        try {
            await deleteComplianceRule(rule.id);
            showSuccess('Compliance rule deleted successfully');
            router.reload({ only: ['rules'] });
        } catch (error) {
            showError(error instanceof Error ? error.message : 'Failed to delete compliance rule');
        }
    };

    const handleSave = async (): Promise<void> => {
        setSaving(true);
        try {
            if (editingRule) {
                await updateComplianceRule(editingRule.id, formData);
                showSuccess('Compliance rule updated successfully');
            } else {
                await createComplianceRule(formData);
                showSuccess('Compliance rule created successfully');
            }
            setShowModal(false);
            router.reload({ only: ['rules'] });
        } catch (error) {
            showError(error instanceof Error ? error.message : 'Failed to save compliance rule');
        } finally {
            setSaving(false);
        }
    };

    const handleSeedFromConfig = async (): Promise<void> => {
        const confirmed = await showConfirm(
            'This will import default compliance rules from the configuration file. Existing rules will not be overwritten.',
            'Import Default Rules',
            'Import',
            'Cancel',
        );
        if (!confirmed) return;

        setSeeding(true);
        try {
            const result = await seedComplianceRulesFromConfig();
            showSuccess(result.message);
            router.reload({ only: ['rules'] });
        } catch (error) {
            showError(error instanceof Error ? error.message : 'Failed to import rules');
        } finally {
            setSeeding(false);
        }
    };

    const handleClassificationSelect = (classificationId: string): void => {
        const selected = classifications.find((c) => c.id === classificationId);
        if (selected) {
            setFormData((prev) => ({
                ...prev,
                classification_code: selected.code,
                name: selected.name,
            }));
        }
    };

    const toggleAllowedUse = (use: string) => {
        setFormData((prev) => ({
            ...prev,
            allowed_uses: prev.allowed_uses.includes(use)
                ? prev.allowed_uses.filter((u) => u !== use)
                : [...prev.allowed_uses, use],
        }));
    };

    const getStatusBadge = (isActive: boolean) => {
        if (isActive) {
            return (
                <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-green-600/20 ring-inset dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20">
                    Active
                </span>
            );
        }
        return (
            <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-gray-500/10 ring-inset dark:bg-gray-400/10 dark:text-gray-400 dark:ring-gray-400/20">
                Inactive
            </span>
        );
    };

    const activeFilterCount = [data.status].filter(Boolean).length;

    return (
        <AdminLayout 
            title="Compliance Rules"
            description="Manage zoning compliance rules used to validate applications in Step 3: Project Details"
        >
            <div className="space-y-6">
                {/* Filters */}
                <AdminFilterSection
                    searchValue={data.search}
                    onSearchChange={(value) => setData('search', value)}
                    onSearch={handleSearch}
                    onReset={handleReset}
                    searchPlaceholder="Search by code or name..."
                    activeFilterCount={activeFilterCount}
                    filterData={data}
                    filterContent={
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Status
                                </label>
                                <select
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-dark-surface dark:text-white"
                                >
                                    <option value="">All</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>
                    }
                    actionButtons={
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={handleSeedFromConfig} disabled={seeding}>
                                <Download className="mr-1.5 h-4 w-4" />
                                {seeding ? 'Importing...' : 'Import Defaults'}
                            </Button>
                            <Button size="sm" onClick={handleCreate}>
                                <Plus className="mr-1.5 h-4 w-4" />
                                Add Rule
                            </Button>
                        </div>
                    }
                />

                {/* Table */}
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-dark-surface">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-800/50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Code
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Name
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Allowed Uses
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Setbacks (F/R/S)
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        FAR
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Max Height
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Storeys
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Open Space
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Min Lot
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {rules.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={11} className="px-4 py-12 text-center">
                                            <ShieldCheck className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
                                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                                No compliance rules found. Click "Import Defaults" to load rules from config, or add a new rule.
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    rules.data.map((rule) => (
                                        <tr
                                            key={rule.id}
                                            className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/30"
                                        >
                                            <td className="whitespace-nowrap px-4 py-3">
                                                <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700 ring-1 ring-blue-700/10 ring-inset dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/30">
                                                    {rule.classification_code}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                                                {rule.name}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-wrap gap-1">
                                                    {rule.allowed_uses.map((use) => (
                                                        <span
                                                            key={use}
                                                            className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                                                        >
                                                            {use.replace('_', ' ')}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-center text-sm text-gray-600 dark:text-gray-300">
                                                {rule.front_setback}/{rule.rear_setback}/{rule.side_setback}m
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-center text-sm text-gray-600 dark:text-gray-300">
                                                {rule.floor_area_ratio}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-center text-sm text-gray-600 dark:text-gray-300">
                                                {rule.max_height}m
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-center text-sm text-gray-600 dark:text-gray-300">
                                                {rule.max_storeys}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-center text-sm text-gray-600 dark:text-gray-300">
                                                {(rule.open_space_requirement * 100).toFixed(0)}%
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-center text-sm text-gray-600 dark:text-gray-300">
                                                {rule.min_lot_area} sqm
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-center">
                                                {getStatusBadge(rule.is_active)}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => handleEdit(rule)}
                                                        className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-gray-700 dark:hover:text-blue-400"
                                                        title="Edit"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(rule)}
                                                        className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-red-600 dark:hover:bg-gray-700 dark:hover:text-red-400"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {rules.last_page > 1 && (
                        <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 dark:border-gray-700">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Showing {rules.from} to {rules.to} of {rules.total} rules
                            </p>
                            <div className="flex gap-1">
                                {rules.links.map((link, i) => (
                                    <button
                                        key={i}
                                        onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                        disabled={!link.url}
                                        className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                                            link.active
                                                ? 'bg-primary text-white'
                                                : link.url
                                                  ? 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                                                  : 'cursor-not-allowed text-gray-300 dark:text-gray-600'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="mx-4 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-dark-surface">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {editingRule ? 'Edit Compliance Rule' : 'Add Compliance Rule'}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-5">
                            {/* Classification selector (create) or read-only display (edit) */}
                            {!editingRule ? (
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Zoning Classification *
                                    </label>
                                    <select
                                        value={
                                            classifications.find((c) => c.code === formData.classification_code)?.id ?? ''
                                        }
                                        onChange={(e) => handleClassificationSelect(e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-dark-surface dark:text-white focus:border-primary focus:ring-primary"
                                    >
                                        <option value="">— Select a classification —</option>
                                        {classifications.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.code} — {c.name}
                                            </option>
                                        ))}
                                    </select>
                                    {formData.classification_code && (
                                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                            Code: <strong>{formData.classification_code}</strong>
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/40">
                                    <span className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-1 text-sm font-bold text-blue-700 ring-1 ring-blue-700/10 ring-inset dark:bg-blue-400/10 dark:text-blue-400">
                                        {formData.classification_code}
                                    </span>
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {formData.name}
                                    </span>
                                </div>
                            )}

                            {/* Allowed Uses */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Allowed Land Uses *
                                </label>
                                <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                                    These must match the Land Use Type options in the application form (Step 3: Project Details).
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {LAND_USE_OPTIONS.map((opt) => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => toggleAllowedUse(opt.value)}
                                            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                                                formData.allowed_uses.includes(opt.value)
                                                    ? 'border-primary bg-primary/10 text-primary dark:bg-primary/20'
                                                    : 'border-gray-300 text-gray-500 hover:border-gray-400 dark:border-gray-600 dark:text-gray-400'
                                            }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Setbacks */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Setback Requirements (meters)
                                </label>
                                <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                                    Minimum distances from building to lot boundaries, validated against Step 3 setback fields.
                                </p>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">Front</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={formData.front_setback}
                                            onChange={(e) =>
                                                setFormData((prev) => ({ ...prev, front_setback: parseFloat(e.target.value) || 0 }))
                                            }
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-dark-surface dark:text-white focus:border-primary focus:ring-primary"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">Rear</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={formData.rear_setback}
                                            onChange={(e) =>
                                                setFormData((prev) => ({ ...prev, rear_setback: parseFloat(e.target.value) || 0 }))
                                            }
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-dark-surface dark:text-white focus:border-primary focus:ring-primary"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">Side</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={formData.side_setback}
                                            onChange={(e) =>
                                                setFormData((prev) => ({ ...prev, side_setback: parseFloat(e.target.value) || 0 }))
                                            }
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-dark-surface dark:text-white focus:border-primary focus:ring-primary"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Building Constraints */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Building Constraints
                                </label>
                                <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                                    These are validated against Floor Area, Number of Storeys, and Building Footprint in Step 3.
                                </p>
                                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                                    <div>
                                        <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">
                                            Floor Area Ratio
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={formData.floor_area_ratio}
                                            onChange={(e) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    floor_area_ratio: parseFloat(e.target.value) || 0,
                                                }))
                                            }
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-dark-surface dark:text-white focus:border-primary focus:ring-primary"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">
                                            Max Height (m)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={formData.max_height}
                                            onChange={(e) =>
                                                setFormData((prev) => ({ ...prev, max_height: parseFloat(e.target.value) || 0 }))
                                            }
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-dark-surface dark:text-white focus:border-primary focus:ring-primary"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">
                                            Max Storeys
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={formData.max_storeys}
                                            onChange={(e) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    max_storeys: parseInt(e.target.value) || 1,
                                                }))
                                            }
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-dark-surface dark:text-white focus:border-primary focus:ring-primary"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">
                                            Min Lot Area (sqm)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={formData.min_lot_area}
                                            onChange={(e) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    min_lot_area: parseFloat(e.target.value) || 0,
                                                }))
                                            }
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-dark-surface dark:text-white focus:border-primary focus:ring-primary"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Open Space */}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Open Space Requirement
                                </label>
                                <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                                    Percentage of lot area that must remain open (0 to 1, e.g. 0.3 = 30%). Validated against Lot Area and Building Footprint.
                                </p>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="1"
                                    value={formData.open_space_requirement}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            open_space_requirement: parseFloat(e.target.value) || 0,
                                        }))
                                    }
                                    className="w-48 rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-dark-surface dark:text-white focus:border-primary focus:ring-primary"
                                />
                            </div>

                            {/* Active Toggle */}
                            <div>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_active}
                                        onChange={(e) =>
                                            setFormData((prev) => ({ ...prev, is_active: e.target.checked }))
                                        }
                                        className="rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Active
                                    </span>
                                </label>
                            </div>

                            {/* Compliance Check Mapping Info */}
                            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
                                <p className="text-xs font-medium text-blue-700 dark:text-blue-400">
                                    How these rules map to Step 3: Project Details
                                </p>
                                <ul className="mt-1.5 space-y-0.5 text-xs text-blue-600 dark:text-blue-300">
                                    <li>&bull; <strong>Allowed Uses</strong> &rarr; Land Use Type dropdown</li>
                                    <li>&bull; <strong>Setbacks</strong> &rarr; Front/Rear/Side Setback fields</li>
                                    <li>&bull; <strong>FAR</strong> &rarr; Total Floor Area / Total Lot Area</li>
                                    <li>&bull; <strong>Max Height &amp; Storeys</strong> &rarr; Number of Storeys field</li>
                                    <li>&bull; <strong>Open Space</strong> &rarr; (Lot Area - Building Footprint) / Lot Area</li>
                                    <li>&bull; <strong>Min Lot Area</strong> &rarr; Total Lot Area field</li>
                                </ul>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-6 flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setShowModal(false)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={saving || !formData.classification_code || !formData.name || formData.allowed_uses.length === 0}
                            >
                                {saving ? 'Saving...' : editingRule ? 'Update Rule' : 'Create Rule'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
