import { Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '../../../components/AdminLayout';
import AdminFilterSection from '../../../components/AdminFilterSection';
import AdminEmptyState from '../../../components/AdminEmptyState';
import Select from '../../../components/Select';
import { Users, Plus, Eye, Edit2, Trash2, Power, MoreVertical, ShieldCheck, UserCheck } from 'lucide-react';
import ActionDropdown from '../../../components/ActionDropdown';
import { showSuccess, showError, showConfirm } from '../../../lib/swal';
import { getCsrfToken } from '../../../data/services';

interface User {
    id: number;
    email: string;
    role: string;
    is_active: boolean;
    created_at: string;
    profile?: {
        first_name?: string;
        last_name?: string;
    };
}

interface UsersIndexProps {
    users: {
        data: User[];
        links: any;
        meta: any;
    };
    filters: {
        search?: string;
        role?: string;
        status?: string;
        type?: 'citizen' | 'staff';
    };
}

export default function UsersIndex({ users, filters: initialFilters }: UsersIndexProps) {
    const { data: userData, setData: setUserData } = useForm({
        search: initialFilters.search || '',
        role: initialFilters.role || '',
        status: initialFilters.status || '',
        type: initialFilters.type || 'citizen',
    });

    const handleUserSearch = (): void => {
        router.get('/admin/user-management', Object.fromEntries(Object.entries(userData).filter(([, v]) => v !== '' && v !== null && v !== undefined)), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleUserReset = (): void => {
        setUserData({ search: '', role: '', status: '', type: userData.type });
        router.get('/admin/user-management', { type: userData.type });
    };

    const handleTabChange = (type: 'citizen' | 'staff'): void => {
        setUserData('type', type);
        router.get('/admin/user-management', { ...Object.fromEntries(Object.entries(userData).filter(([, v]) => v !== '' && v !== null && v !== undefined)), type }, {
            preserveState: true,
            preserveScroll: true,
        });
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
            if (!response.ok) throw new Error('Failed to toggle user status');
            showSuccess(`User ${user.is_active ? 'deactivated' : 'activated'} successfully`);
            router.reload({ only: ['users'] });
        } catch {
            showError('Failed to toggle user status');
        }
    };

    const handleDeleteUser = async (user: User): Promise<void> => {
        const confirmed = await showConfirm(`Are you sure you want to delete user "${user.email}"?`, 'Delete User', 'Delete', 'Cancel');
        if (!confirmed) return;
        try {
            const response = await fetch(`/admin/user-management/${user.id}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
            });
            if (!response.ok) throw new Error('Failed to delete user');
            showSuccess('User deleted successfully');
            router.reload({ only: ['users'] });
        } catch {
            showError('Failed to delete user');
        }
    };

    const getUserName = (user: User): string => {
        if (user.profile?.first_name || user.profile?.last_name) {
            return `${user.profile.first_name || ''} ${user.profile.last_name || ''}`.trim();
        }
        return user.email;
    };

    const formatRoleName = (role: string): string =>
        role.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    const userActiveFilterCount = Object.entries(userData).filter(([k, v]) => k !== 'search' && k !== 'type' && v !== '' && v !== null && v !== undefined).length;

    const navAction = (
        <Link href="/admin/user-management/create" className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
            <Plus size={18} />
            Create User
        </Link>
    );

    return (
        <AdminLayout
            title="User Management"
            description="Manage system users and their access levels"
            action={navAction}
        >
            <div className="mb-6 flex items-center border-b border-gray-200 dark:border-gray-800">
                <button
                    onClick={() => handleTabChange('citizen')}
                    className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold transition-all border-b-2 ${
                        userData.type === 'citizen'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                >
                    <UserCheck size={18} />
                    Citizens
                </button>
                <button
                    onClick={() => handleTabChange('staff')}
                    className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold transition-all border-b-2 ${
                        userData.type === 'staff'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                >
                    <ShieldCheck size={18} />
                    Administrators
                </button>
            </div>

            <AdminFilterSection
                filterData={userData}
                activeFilterCount={userActiveFilterCount}
                searchValue={userData.search}
                onSearchChange={(value) => setUserData('search', value)}
                onSearch={handleUserSearch}
                onReset={handleUserReset}
                searchPlaceholder="Search by email or name..."
                filterContent={
                    <>
                        <Select
                            label="Status"
                            value={userData.status}
                            onChange={(e) => setUserData('status', e.target.value)}
                        >
                            <option value="">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </Select>
                    </>
                }
            />

            {users.data.length === 0 ? (
                <AdminEmptyState
                    icon={Users}
                    title="No users found"
                    description="Get started by creating a new user"
                    action={
                        <Link href="/admin/user-management/create" className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-dark-surface divide-y divide-gray-200 dark:divide-gray-700">
                                {users.data.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">{getUserName(user)}</div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                {formatRoleName(user.role)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${user.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                                                {user.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex justify-end">
                                                <ActionDropdown
                                                    actions={[
                                                        {
                                                            label: 'View Details',
                                                            icon: <Eye size={16} />,
                                                            onClick: () => router.get(`/admin/user-management/${user.id}`),
                                                        },
                                                        {
                                                            label: 'Edit User',
                                                            icon: <Edit2 size={16} />,
                                                            onClick: () => router.get(`/admin/user-management/${user.id}/edit`),
                                                        },
                                                        {
                                                            label: user.is_active ? 'Deactivate Account' : 'Activate Account',
                                                            icon: <Power size={16} />,
                                                            onClick: () => handleToggleActive(user),
                                                            className: user.is_active 
                                                                ? 'text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10' 
                                                                : 'text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/10'
                                                        }
                                                    ]}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <Pagination links={users.links} meta={users.meta} />
                </div>
            )}
        </AdminLayout>
    );
}

function Pagination({ links, meta }: { links: any; meta: any }) {
    if (!links || links.length <= 3) return null;
    return (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
                {links[0]?.url && (
                    <Link href={links[0].url} className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-surface hover:bg-gray-50 dark:hover:bg-gray-800">
                        Previous
                    </Link>
                )}
                {links[links.length - 1]?.url && (
                    <Link href={links[links.length - 1].url} className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-surface hover:bg-gray-50 dark:hover:bg-gray-800">
                        Next
                    </Link>
                )}
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                    Showing <span className="font-medium">{meta?.from || 0}</span> to{' '}
                    <span className="font-medium">{meta?.to || 0}</span> of{' '}
                    <span className="font-medium">{meta?.total || 0}</span> results
                </p>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    {links.map((link: any, idx: number) => (
                        <Link
                            key={idx}
                            href={link.url || '#'}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                link.active
                                    ? 'z-10 bg-primary border-primary text-white'
                                    : 'bg-white dark:bg-dark-surface border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                            } ${idx === 0 ? 'rounded-l-md' : ''} ${idx === links.length - 1 ? 'rounded-r-md' : ''}`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </nav>
            </div>
        </div>
    );
}
