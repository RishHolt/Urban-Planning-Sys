import { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import AdminLayout from '../../../components/AdminLayout';
import AdminFilterSection from '../../../components/AdminFilterSection';
import AdminEmptyState from '../../../components/AdminEmptyState';
import Button from '../../../components/Button';
import { Plus, Users } from 'lucide-react';

export default function BeneficiariesIndex() {
    const [showFilters, setShowFilters] = useState(false);
    const { data, setData, get } = useForm({
        search: '',
        status: '',
    });

    const handleSearch = (): void => {
        get('/admin/housing/beneficiaries', {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleReset = (): void => {
        setData({
            search: '',
            status: '',
        });
        router.get('/admin/housing/beneficiaries');
    };

    return (
        <AdminLayout
            title="Housing Beneficiaries"
            description="Manage all registered housing beneficiaries"
        >
            <AdminFilterSection
                searchValue={data.search}
                onSearchChange={(value) => setData('search', value)}
                onSearch={handleSearch}
                onReset={handleReset}
                showFilters={showFilters}
                onToggleFilters={() => setShowFilters(!showFilters)}
                searchPlaceholder="Search by name, ID..."
                actionButtons={
                    <Button variant="primary" className="flex items-center gap-2">
                        <Plus size={18} />
                        Add Beneficiary
                    </Button>
                }
                filterContent={
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
                }
            />

            {/* Beneficiaries Table */}
            <div className="bg-white dark:bg-dark-surface shadow-lg rounded-lg overflow-hidden">
                <AdminEmptyState
                    icon={Users}
                    title="No Beneficiaries Yet"
                    description="Beneficiaries will appear here once applications are approved."
                />
            </div>
        </AdminLayout>
    );
}
