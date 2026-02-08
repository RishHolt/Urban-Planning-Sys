import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import AdminContentCard from '../../../components/AdminContentCard';
import Button from '../../../components/Button';
import { Plus, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { showSuccess, showError, showConfirm } from '../../../lib/swal';
import { getCsrfToken } from '../../../data/services';

interface BudgetTrackingProps {
    project: {
        id: string;
        project_code: string;
        project_name: string;
        budget: number;
        actual_cost: number;
    };
    budgetRecords: Array<{
        id: string;
        phase: {
            id: string;
            phase_name: string;
        } | null;
        budget_category: string;
        allocated_amount: number;
        spent_amount: number;
        remaining_amount: number;
        description: string | null;
        year: number;
        quarter: number;
    }>;
    summary: {
        total_allocated: number;
        total_spent: number;
        total_remaining: number;
    };
    phases: Array<{
        id: string;
        phase_name: string;
    }>;
    filters?: {
        budget_category?: string;
        year?: string;
        quarter?: string;
    };
}

export default function BudgetTracking({ project, budgetRecords, summary, phases, filters: initialFilters = {} }: BudgetTrackingProps) {
    const [showAddModal, setShowAddModal] = useState(false);
    const [showExpenseModal, setShowExpenseModal] = useState<string | null>(null);

    const { data, setData, post, processing } = useForm({
        phase_id: '',
        budget_category: 'labor',
        allocated_amount: '',
        description: '',
        year: new Date().getFullYear().toString(),
        quarter: '1',
    });

    const expenseData = useForm({
        expense_amount: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/admin/infrastructure/projects/${project.id}/budget`, {
            preserveScroll: true,
            onSuccess: () => {
                setShowAddModal(false);
                setData({
                    phase_id: '',
                    budget_category: 'labor',
                    allocated_amount: '',
                    description: '',
                    year: new Date().getFullYear().toString(),
                    quarter: '1',
                });
            },
        });
    };

    const handleRecordExpense = async (budgetRecordId: string) => {
        const confirmed = await showConfirm(
            `Record expense of ₱${parseFloat(expenseData.data.expense_amount).toLocaleString()}?`,
            'Record Expense',
            'Record',
            'Cancel'
        );

        if (!confirmed) {
            return;
        }

        try {
            const response = await fetch(`/admin/infrastructure/projects/${project.id}/budget/${budgetRecordId}/expense`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                body: JSON.stringify(expenseData.data),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to record expense');
            }

            showSuccess('Expense recorded successfully');
            setShowExpenseModal(null);
            expenseData.setData('expense_amount', '');
            router.reload({ only: ['budgetRecords', 'summary'] });
        } catch (error) {
            console.error('Error recording expense:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to record expense';
            showError(errorMessage);
        }
    };

    const getCategoryLabel = (category: string) => {
        const labels: Record<string, string> = {
            labor: 'Labor',
            materials: 'Materials',
            equipment: 'Equipment',
            consultancy: 'Consultancy',
            contingency: 'Contingency',
            other: 'Other',
        };
        return labels[category] || category;
    };

    return (
        <AdminLayout
            title="Budget Tracking"
            description={`${project.project_code} - ${project.project_name}`}
            backButton={{
                href: `/admin/infrastructure/projects/${project.id}`,
                label: 'Back to Project',
            }}
        >
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <AdminContentCard padding="md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Allocated</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                ₱{summary.total_allocated.toLocaleString()}
                            </p>
                        </div>
                        <DollarSign size={32} className="text-blue-500" />
                    </div>
                </AdminContentCard>

                <AdminContentCard padding="md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Spent</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                ₱{summary.total_spent.toLocaleString()}
                            </p>
                        </div>
                        <TrendingDown size={32} className="text-red-500" />
                    </div>
                </AdminContentCard>

                <AdminContentCard padding="md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Remaining</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                ₱{summary.total_remaining.toLocaleString()}
                            </p>
                        </div>
                        <TrendingUp size={32} className="text-green-500" />
                    </div>
                </AdminContentCard>

                <AdminContentCard padding="md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Budget Usage</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                {project.budget > 0
                                    ? ((project.actual_cost / project.budget) * 100).toFixed(1)
                                    : 0}%
                            </p>
                        </div>
                        <DollarSign size={32} className="text-orange-500" />
                    </div>
                </AdminContentCard>
            </div>

            <div className="mb-6 flex justify-end">
                <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2"
                >
                    <Plus size={18} />
                    Allocate Budget
                </Button>
            </div>

            <AdminContentCard padding="lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Budget Records</h3>
                {budgetRecords.length === 0 ? (
                    <div className="text-center py-12">
                        <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No budget records yet</h3>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Category</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Phase</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Allocated</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Spent</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Remaining</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Year/Q</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {budgetRecords.map((record) => (
                                    <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white capitalize">
                                            {getCategoryLabel(record.budget_category)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                            {record.phase?.phase_name || '—'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                            ₱{record.allocated_amount.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                            ₱{record.spent_amount.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 text-sm font-medium">
                                            <span className={record.remaining_amount < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}>
                                                ₱{record.remaining_amount.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                            {record.year} Q{record.quarter}
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm">
                                            <button
                                                onClick={() => setShowExpenseModal(record.id)}
                                                className="text-primary hover:text-primary/80"
                                            >
                                                Record Expense
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </AdminContentCard>

            {/* Add Budget Allocation Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm">
                    <div className="bg-white dark:bg-dark-surface rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Allocate Budget</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
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
                                        Budget Category *
                                    </label>
                                    <select
                                        value={data.budget_category}
                                        onChange={(e) => setData('budget_category', e.target.value)}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
                                    >
                                        <option value="labor">Labor</option>
                                        <option value="materials">Materials</option>
                                        <option value="equipment">Equipment</option>
                                        <option value="consultancy">Consultancy</option>
                                        <option value="contingency">Contingency</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Allocated Amount *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.allocated_amount}
                                        onChange={(e) => setData('allocated_amount', e.target.value)}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Year *
                                        </label>
                                        <input
                                            type="number"
                                            min="2020"
                                            max="2100"
                                            value={data.year}
                                            onChange={(e) => setData('year', e.target.value)}
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Quarter *
                                        </label>
                                        <select
                                            value={data.quarter}
                                            onChange={(e) => setData('quarter', e.target.value)}
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
                                        >
                                            <option value="1">Q1</option>
                                            <option value="2">Q2</option>
                                            <option value="3">Q3</option>
                                            <option value="4">Q4</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <Button type="submit" variant="primary" disabled={processing} className="flex-1">
                                    {processing ? 'Allocating...' : 'Allocate Budget'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Record Expense Modal */}
            {showExpenseModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm">
                    <div className="bg-white dark:bg-dark-surface rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Record Expense</h3>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleRecordExpense(showExpenseModal);
                            }}
                        >
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Expense Amount *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={expenseData.data.expense_amount}
                                    onChange={(e) => expenseData.setData('expense_amount', e.target.value)}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
                                />
                            </div>
                            <div className="flex gap-3">
                                <Button type="submit" variant="primary" disabled={expenseData.processing} className="flex-1">
                                    {expenseData.processing ? 'Recording...' : 'Record Expense'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => {
                                        setShowExpenseModal(null);
                                        expenseData.setData('expense_amount', '');
                                    }}
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
