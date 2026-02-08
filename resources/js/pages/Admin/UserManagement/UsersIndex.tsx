import { Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import AdminFilterSection from '../../../components/AdminFilterSection';
import AdminEmptyState from '../../../components/AdminEmptyState';
import Input from '../../../components/Input';
import { Users, Plus, Eye, Edit2, Trash2, Power, Search } from 'lucide-react';
import { showSuccess, showError, showConfirm } from '../../../lib/swal';
import { getCsrfToken } from '../../../data/services';

interface User {
    id: number;
    email: string;
    role: string;
    is_active: boolean;
    created_at: string;
    roles?: Array<{
        id: number;
        name: string;
        modules?: Array<{
            code: string;
            name: string;
        }>;
    }>;
    profile?: {
        first_name?: string;
        last_name?: string;
    };
}

interface Role {
    id: number;
    name: string;
}

interface UsersIndexProps {
    users: {
        data: User[];
        links: any;
        meta: any;
    };
    roles: Role[];
    filters: {
        search?: string;
        role?: string;
        role_id?: number;
        module_code?: string;
        status?: string;
    };
}

export default function UsersIndex({ users, roles, filters: initialFilters }: UsersIndexProps) {
    const [showFilters, setShowFilters] = useState(false);
    const { data, setData, get } = useForm({
        search: initialFilters.search || '',
        role: initialFilters.role || '',
        role_id: initialFilters.role_id || '',
        module_code: initialFilters.module_code || '',
        status: initialFilters.status || '',
    });

    const handleSearch = (): void => {
        get('/admin/user-management', {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleReset = (): void => {
        setData({
            search: '',
            role: '',
            role_id: '',
            module_code: '',
            status: '',
        });
        router.get('/admin/user-management');
    };

    const handleToggleActive = async (user: User): Promise<void> => {
        try {
            const response = await fetch(`/admin/user-management/${user.id}/toggle-active`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
            });

            if (!response.ok) {
                throw new Error('Failed to toggle user status');
            }

            showSuccess(`User ${user.is_active ? 'deactivated' : 'activated'} successfully`);
            router.reload({ only: ['users'] });
        } catch (error) {
            console.error('Error toggling user status:', error);
            showError('Failed to toggle user status');
        }
    };

    const handleDelete = async (user: User): Promise<void> => {
        const confirmed = await showConfirm(
            `Are you sure you want to delete user "${user.email}"?`,
            'Delete User',
            'Delete',
            'Cancel'
        );

        if (!confirmed) {
            return;
        }

        try {
            const response = await fetch(`/admin/user-management/${user.id}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete user');
            }

            showSuccess('User deleted successfully');
            router.reload({ only: ['users'] });
        } catch (error) {
            console.error('Error deleting user:', error);
            showError('Failed to delete user');
        }
    };

    const getUserName = (user: User): string => {
        if (user.profile?.first_name || user.profile?.last_name) {
            return `${user.profile.first_name || ''} ${user.profile.last_name || ''}`.trim();
        }
        return user.email;
    };

    const getUserModules = (user: User): string[] => {
        const modules: string[] = [];
        if (user.roles) {
            user.roles.forEach((role) => {
                if (role.modules) {
                    role.modules.forEach((module) => {
                        if (!modules.includes(module.code)) {
                            modules.push(module.code);
                        }
                    });
                }
            });
        }
        // Super admin, admin and staff have access to all modules
        if (['super_admin', 'admin', 'staff'].includes(user.role)) {
            return ['All Modules'];
        }
        return modules.length > 0 ? modules : ['None'];
    };

    const formatRoleName = (role: string): string => {
        return role
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    return (
        <AdminLayout
            title="User Management"
            description="Manage system users, roles, and module access"
            action={
                <Link
                    href="/admin/user-management/create"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                    <Plus size={18} />
                    Create User
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
                searchPlaceholder="Search by email or name..."
                filterContent={
                    <>
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                Enum Role
                            </label>
                            <select
                                value={data.role}
                                onChange={(e) => setData('role', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                                <option value="">All Roles</option>
                                <option value="user">User</option>
                                <option value="staff">Staff</option>
                                <option value="admin">Admin</option>
                                <option value="super_admin">Super Admin</option>
                            </select>
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                Dynamic Role
                            </label>
                            <select
                                value={data.role_id}
                                onChange={(e) => setData('role_id', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                                <option value="">All Roles</option>
                                {roles.map((role) => (
                                    <option key={role.id} value={role.id}>
                                        {role.name}
                                    </option>
                                ))}
                            </select>
                        </div>
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
                                <option value="ZCS">ZCS - Zoning Clearance</option>
                                <option value="HBR">HBR - Housing Beneficiary</option>
                                <option value="SBR">SBR - Subdivision & Building</option>
                                <option value="IPC">IPC - Infrastructure</option>
                                <option value="OMT">OMT - Occupancy Monitoring</option>
                            </select>
                        </div>
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
                    </>
                }
            />

            {users.data.length === 0 ? (
                <AdminEmptyState
                    icon={Users}
                    title="No users found"
                    description="Get started by creating a new user"
                    action={
                        <Link
                            href="/admin/user-management/create"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            <Plus size={18} />
                            Create User
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
                                        User
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Enum Role
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Dynamic Roles
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Module Access
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-dark-surface divide-y divide-gray-200 dark:divide-gray-700">
                                {users.data.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {getUserName(user)}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {user.email}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                {formatRoleName(user.role)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-wrap gap-1">
                                                {user.roles && user.roles.length > 0 ? (
                                                    user.roles.map((role) => (
                                                        <span
                                                            key={role.id}
                                                            className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                        >
                                                            {role.name}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">None</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {getUserModules(user).map((module, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                                                    >
                                                        {module}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                    user.is_active
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                }`}
                                            >
                                                {user.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/admin/user-management/${user.id}`}
                                                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                    title="View"
                                                >
                                                    <Eye size={18} />
                                                </Link>
                                                <Link
                                                    href={`/admin/user-management/${user.id}/edit`}
                                                    className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={18} />
                                                </Link>
                                                <button
                                                    onClick={() => handleToggleActive(user)}
                                                    className={`${
                                                        user.is_active
                                                            ? 'text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300'
                                                            : 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300'
                                                    }`}
                                                    title={user.is_active ? 'Deactivate' : 'Activate'}
                                                >
                                                    <Power size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user)}
                                                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {users.links && users.links.length > 3 && (
                        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                            <div className="flex-1 flex justify-between sm:hidden">
                                {users.links[0]?.url && (
                                    <Link
                                        href={users.links[0].url}
                                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-surface hover:bg-gray-50 dark:hover:bg-gray-800"
                                    >
                                        Previous
                                    </Link>
                                )}
                                {users.links[users.links.length - 1]?.url && (
                                    <Link
                                        href={users.links[users.links.length - 1].url}
                                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-surface hover:bg-gray-50 dark:hover:bg-gray-800"
                                    >
                                        Next
                                    </Link>
                                )}
                            </div>
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        Showing <span className="font-medium">{users.meta?.from || 0}</span> to{' '}
                                        <span className="font-medium">{users.meta?.to || 0}</span> of{' '}
                                        <span className="font-medium">{users.meta?.total || 0}</span> results
                                    </p>
                                </div>
                                <div>
                                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                        {users.links.map((link: any, idx: number) => (
                                            <Link
                                                key={idx}
                                                href={link.url || '#'}
                                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                    link.active
                                                        ? 'z-10 bg-primary border-primary text-white'
                                                        : 'bg-white dark:bg-dark-surface border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                                } ${idx === 0 ? 'rounded-l-md' : ''} ${
                                                    idx === users.links.length - 1 ? 'rounded-r-md' : ''
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
