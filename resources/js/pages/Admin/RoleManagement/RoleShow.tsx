import { Link } from '@inertiajs/react';
import AdminLayout from '../../../components/AdminLayout';
import Button from '../../../components/Button';
import { Edit2, Shield, Users, Lock, Calendar } from 'lucide-react';

interface Module {
    code: string;
    name: string;
    description?: string;
}

interface User {
    id: number;
    email: string;
}

interface Role {
    id: number;
    name: string;
    description?: string;
    is_system: boolean;
    created_at: string;
    updated_at: string;
    modules?: Module[];
    users?: User[];
    users_count?: number;
}

interface RoleShowProps {
    role: Role;
}

export default function RoleShow({ role }: RoleShowProps) {
    return (
        <AdminLayout
            title="Role Details"
            description={`View details for ${role.name}`}
            backButton={{
                href: '/admin/role-management',
                label: 'Back to Roles',
            }}
            action={
                !role.is_system && (
                    <Link href={`/admin/role-management/${role.id}/edit`}>
                        <Button variant="primary">
                            <Edit2 size={18} className="mr-2" />
                            Edit Role
                        </Button>
                    </Link>
                )
            }
        >
            <div className="space-y-6">
                <div className="bg-white dark:bg-dark-surface rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <Shield size={20} />
                        Role Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                Role Name
                            </label>
                            <p className="text-base text-gray-900 dark:text-white">{role.name}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                Type
                            </label>
                            <p className="text-base">
                                {role.is_system ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                        <Lock size={12} />
                                        System Role
                                    </span>
                                ) : (
                                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                                        Custom Role
                                    </span>
                                )}
                            </p>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                Description
                            </label>
                            <p className="text-base text-gray-900 dark:text-white">
                                {role.description || 'No description provided'}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                Created At
                            </label>
                            <p className="text-base text-gray-900 dark:text-white flex items-center gap-2">
                                <Calendar size={16} />
                                {new Date(role.created_at).toLocaleString()}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                Updated At
                            </label>
                            <p className="text-base text-gray-900 dark:text-white flex items-center gap-2">
                                <Calendar size={16} />
                                {new Date(role.updated_at).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-dark-surface rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Module Access</h2>
                    {role.modules && role.modules.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {role.modules.map((module) => (
                                <div
                                    key={module.code}
                                    className="p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                                >
                                    <div className="font-medium text-gray-900 dark:text-white mb-1">
                                        {module.code} - {module.name}
                                    </div>
                                    {module.description && (
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            {module.description}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">No module access assigned.</p>
                    )}
                </div>

                <div className="bg-white dark:bg-dark-surface rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <Users size={20} />
                        Assigned Users ({role.users_count || role.users?.length || 0})
                    </h2>
                    {role.users && role.users.length > 0 ? (
                        <div className="space-y-2">
                            {role.users.map((user) => (
                                <div
                                    key={user.id}
                                    className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-between"
                                >
                                    <span className="text-sm text-gray-900 dark:text-white">{user.email}</span>
                                    <Link
                                        href={`/admin/user-management/${user.id}`}
                                        className="text-sm text-primary hover:underline"
                                    >
                                        View User
                                    </Link>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">No users assigned to this role.</p>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
