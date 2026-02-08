import { Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import AdminFilterSection from '../../../components/AdminFilterSection';
import AdminEmptyState from '../../../components/AdminEmptyState';
import { Shield, Plus, Eye, Edit2, Trash2, Users, Lock } from 'lucide-react';
import { showSuccess, showError, showConfirm } from '../../../lib/swal';
import { getCsrfToken } from '../../../data/services';

interface Module {
    code: string;
    name: string;
}

interface Role {
    id: number;
    name: string;
    description?: string;
    is_system: boolean;
    users_count: number;
    modules?: Module[];
}

interface RolesIndexProps {
    roles: {
        data: Role[];
        links: any;
        meta: any;
    };
    modules: Module[];
    filters: {
        search?: string;
        module_code?: string;
    };
}

export default function RolesIndex({ roles, modules, filters: initialFilters }: RolesIndexProps) {
    const [showFilters, setShowFilters] = useState(false);
    const { data, setData, get } = useForm({
        search: initialFilters.search || '',
        module_code: initialFilters.module_code || '',
    });

    const handleSearch = (): void => {
        get('/admin/role-management', {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleReset = (): void => {
        setData({
            search: '',
            module_code: '',
        });
        router.get('/admin/role-management');
    };

    const handleDelete = async (role: Role): Promise<void> => {
        if (role.is_system) {
            showError('System roles cannot be deleted.');
            return;
        }

        if (role.users_count > 0) {
            showError('This role cannot be deleted because it has assigned users.');
            return;
        }

        const confirmed = await showConfirm(
            `Are you sure you want to delete role "${role.name}"?`,
            'Delete Role',
            'Delete',
            'Cancel'
        );

        if (!confirmed) {
            return;
        }

        try {
            const response = await fetch(`/admin/role-management/${role.id}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete role');
            }

            showSuccess('Role deleted successfully');
            router.reload({ only: ['roles'] });
        } catch (error) {
            console.error('Error deleting role:', error);
            showError('Failed to delete role');
        }
    };

    return (
        <AdminLayout
            title="Role Management"
            description="Manage system roles and module access"
            action={
                <Link
                    href="/admin/role-management/create"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                    <Plus size={18} />
                    Create Role
                </Link>
            }
        >
            <AdminFilterSection
                searchValue={data.search}
                onSearchChange={(value) => setData('search', value)}
                onSearch={handleSearch}
                onReset={handleReset}
                showFilters={showFilters}
                onToggleFilters={() => setShowFilters(!showFilters)}
                searchPlaceholder="Search by role name or description..."
                filterContent={
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Module Access
                        </label>
                        <select
                            value={data.module_code}
                            onChange={(e) => setData('module_code', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                            <option value="">All Modules</option>
                            {modules.map((module) => (
                                <option key={module.code} value={module.code}>
                                    {module.code} - {module.name}
                                </option>
                            ))}
                        </select>
                    </div>
                }
            />

            {roles.data.length === 0 ? (
                <AdminEmptyState
                    icon={Shield}
                    title="No roles found"
                    description="Get started by creating a new role"
                    action={
                        <Link
                            href="/admin/role-management/create"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            <Plus size={18} />
                            Create Role
                        </Link>
                    }
                />
            ) : (
                <div className="bg-white dark:bg-dark-surface rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Description
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Modules
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Users
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-dark-surface divide-y divide-gray-200 dark:divide-gray-700">
                                {roles.data.map((role) => (
                                    <tr key={role.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                {role.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {role.description || 'No description'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {role.modules && role.modules.length > 0 ? (
                                                    role.modules.map((module) => (
                                                        <span
                                                            key={module.code}
                                                            className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                                                        >
                                                            {module.code}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">None</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-white">
                                                <Users size={16} />
                                                {role.users_count || 0}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {role.is_system ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                                    <Lock size={12} />
                                                    System
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                                                    Custom
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/admin/role-management/${role.id}`}
                                                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                    title="View"
                                                >
                                                    <Eye size={18} />
                                                </Link>
                                                {!role.is_system && (
                                                    <Link
                                                        href={`/admin/role-management/${role.id}/edit`}
                                                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                                        title="Edit"
                                                    >
                                                        <Edit2 size={18} />
                                                    </Link>
                                                )}
                                                {!role.is_system && role.users_count === 0 && (
                                                    <button
                                                        onClick={() => handleDelete(role)}
                                                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {roles.links && roles.links.length > 3 && (
                        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                            <div className="flex-1 flex justify-between sm:hidden">
                                {roles.links[0]?.url && (
                                    <Link
                                        href={roles.links[0].url}
                                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-surface hover:bg-gray-50 dark:hover:bg-gray-800"
                                    >
                                        Previous
                                    </Link>
                                )}
                                {roles.links[roles.links.length - 1]?.url && (
                                    <Link
                                        href={roles.links[roles.links.length - 1].url}
                                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-surface hover:bg-gray-50 dark:hover:bg-gray-800"
                                    >
                                        Next
                                    </Link>
                                )}
                            </div>
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        Showing <span className="font-medium">{roles.meta?.from || 0}</span> to{' '}
                                        <span className="font-medium">{roles.meta?.to || 0}</span> of{' '}
                                        <span className="font-medium">{roles.meta?.total || 0}</span> results
                                    </p>
                                </div>
                                <div>
                                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                        {roles.links.map((link: any, idx: number) => (
                                            <Link
                                                key={idx}
                                                href={link.url || '#'}
                                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                    link.active
                                                        ? 'z-10 bg-primary border-primary text-white'
                                                        : 'bg-white dark:bg-dark-surface border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                                } ${idx === 0 ? 'rounded-l-md' : ''} ${
                                                    idx === roles.links.length - 1 ? 'rounded-r-md' : ''
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </nav>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </AdminLayout>
    );
}
