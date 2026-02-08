import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import AdminContentCard from '../../../components/AdminContentCard';
import Button from '../../../components/Button';
import { Plus, Users, X } from 'lucide-react';
import { showSuccess, showError, showConfirm } from '../../../lib/swal';
import { getCsrfToken } from '../../../data/services';

interface ProjectContractorsProps {
    project: {
        id: string;
        project_code: string;
        project_name: string;
    };
    contractors: Array<{
        id: string;
        contractor: {
            id: string;
            contractor_code: string;
            company_name: string;
            contact_person: string;
        };
        role: string;
        contract_amount: number;
        contract_start_date: string | null;
        contract_end_date: string | null;
        status: string;
        remarks: string | null;
    }>;
    availableContractors: Array<{
        id: string;
        contractor_code: string;
        company_name: string;
    }>;
}

export default function ProjectContractors({ project, contractors, availableContractors }: ProjectContractorsProps) {
    const [showAddModal, setShowAddModal] = useState(false);

    const { data, setData, post, processing } = useForm({
        contractor_id: '',
        role: 'prime_contractor',
        contract_amount: '',
        contract_start_date: '',
        contract_end_date: '',
        remarks: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/admin/infrastructure/projects/${project.id}/contractors`, {
            preserveScroll: true,
            onSuccess: () => {
                setShowAddModal(false);
                setData({
                    contractor_id: '',
                    role: 'prime_contractor',
                    contract_amount: '',
                    contract_start_date: '',
                    contract_end_date: '',
                    remarks: '',
                });
            },
        });
    };

    const handleRemove = async (contractorId: string) => {
        const confirmed = await showConfirm(
            'Are you sure you want to remove this contractor from the project?',
            'Remove Contractor',
            'Remove',
            'Cancel'
        );

        if (!confirmed) {
            return;
        }

        try {
            const response = await fetch(`/admin/infrastructure/projects/${project.id}/contractors/${contractorId}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
            });

            if (!response.ok) {
                throw new Error('Failed to remove contractor');
            }

            showSuccess('Contractor removed successfully');
            router.reload({ only: ['contractors'] });
        } catch (error) {
            console.error('Error removing contractor:', error);
            showError('Failed to remove contractor');
        }
    };

    const getRoleLabel = (role: string) => {
        const labels: Record<string, string> = {
            prime_contractor: 'Prime Contractor',
            subcontractor: 'Subcontractor',
            supplier: 'Supplier',
            consultant: 'Consultant',
        };
        return labels[role] || role;
    };

    return (
        <AdminLayout
            title="Project Contractors"
            description={`${project.project_code} - ${project.project_name}`}
            backButton={{
                href: `/admin/infrastructure/projects/${project.id}`,
                label: 'Back to Project',
            }}
        >
            <div className="mb-6 flex justify-end">
                <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2"
                >
                    <Plus size={18} />
                    Assign Contractor
                </Button>
            </div>

            <AdminContentCard padding="lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Assigned Contractors</h3>
                {contractors.length === 0 ? (
                    <div className="text-center py-12">
                        <Users className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No contractors assigned</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Assign contractors to this project to get started.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {contractors.map((projectContractor) => (
                            <div
                                key={projectContractor.id}
                                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900 dark:text-white">
                                            {projectContractor.contractor.company_name}
                                        </h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {projectContractor.contractor.contractor_code} • {projectContractor.contractor.contact_person}
                                        </p>
                                        <div className="mt-2 space-y-1">
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                <span className="font-medium">Role:</span> {getRoleLabel(projectContractor.role)}
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                <span className="font-medium">Contract Amount:</span> ₱{projectContractor.contract_amount.toLocaleString()}
                                            </p>
                                            {projectContractor.contract_start_date && (
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    <span className="font-medium">Start:</span> {new Date(projectContractor.contract_start_date).toLocaleDateString()}
                                                </p>
                                            )}
                                            {projectContractor.contract_end_date && (
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    <span className="font-medium">End:</span> {new Date(projectContractor.contract_end_date).toLocaleDateString()}
                                                </p>
                                            )}
                                            {projectContractor.remarks && (
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    <span className="font-medium">Remarks:</span> {projectContractor.remarks}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-1 rounded text-xs ${
                                            projectContractor.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                            projectContractor.status === 'completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                                            'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                                        }`}>
                                            {projectContractor.status}
                                        </span>
                                        <button
                                            onClick={() => handleRemove(projectContractor.id)}
                                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1 rounded transition-colors"
                                            title="Remove"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </AdminContentCard>

            {/* Add Contractor Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm">
                    <div className="bg-white dark:bg-dark-surface rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Assign Contractor</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Contractor *
                                    </label>
                                    <select
                                        value={data.contractor_id}
                                        onChange={(e) => setData('contractor_id', e.target.value)}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
                                    >
                                        <option value="">Select Contractor</option>
                                        {availableContractors.map((contractor) => (
                                            <option key={contractor.id} value={contractor.id}>
                                                {contractor.contractor_code} - {contractor.company_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Role *
                                    </label>
                                    <select
                                        value={data.role}
                                        onChange={(e) => setData('role', e.target.value)}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
                                    >
                                        <option value="prime_contractor">Prime Contractor</option>
                                        <option value="subcontractor">Subcontractor</option>
                                        <option value="supplier">Supplier</option>
                                        <option value="consultant">Consultant</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Contract Amount *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.contract_amount}
                                        onChange={(e) => setData('contract_amount', e.target.value)}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Start Date *
                                        </label>
                                        <input
                                            type="date"
                                            value={data.contract_start_date}
                                            onChange={(e) => setData('contract_start_date', e.target.value)}
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            End Date *
                                        </label>
                                        <input
                                            type="date"
                                            value={data.contract_end_date}
                                            onChange={(e) => setData('contract_end_date', e.target.value)}
                                            required
                                            min={data.contract_start_date}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Remarks
                                    </label>
                                    <textarea
                                        value={data.remarks}
                                        onChange={(e) => setData('remarks', e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <Button type="submit" variant="primary" disabled={processing} className="flex-1">
                                    {processing ? 'Assigning...' : 'Assign Contractor'}
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
        </AdminLayout>
    );
}
