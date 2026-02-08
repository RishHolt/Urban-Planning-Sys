import { Link } from '@inertiajs/react';
import AdminLayout from '../../../components/AdminLayout';
import Button from '../../../components/Button';
import { Edit2, Mail, Shield, Calendar, CheckCircle, XCircle } from 'lucide-react';

interface Module {
    code: string;
    name: string;
}

interface Role {
    id: number;
    name: string;
    description?: string;
    modules?: Module[];
}

interface User {
    id: number;
    email: string;
    role: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    roles?: Role[];
    profile?: {
        first_name?: string;
        last_name?: string;
    };
}

interface UserShowProps {
    user: User;
}

export default function UserShow({ user }: UserShowProps) {
    const getUserName = (): string => {
        if (user.profile?.first_name || user.profile?.last_name) {
            return `${user.profile.first_name || ''} ${user.profile.last_name || ''}`.trim();
        }
        return user.email;
    };

    const getUserModules = (): string[] => {
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
        // Admin and staff have access to all modules
        if (['admin', 'staff'].includes(user.role)) {
            return ['All Modules'];
        }
        return modules.length > 0 ? modules : ['None'];
    };

    return (
        <AdminLayout
            title="User Details"
            description={`View details for ${getUserName()}`}
            backButton={{
                href: '/admin/user-management',
                label: 'Back to Users',
            }}
            action={
                <Link href={`/admin/user-management/${user.id}/edit`}>
                    <Button variant="primary">
                        <Edit2 size={18} className="mr-2" />
                        Edit User
                    </Button>
                </Link>
            }
        >
            <div className="space-y-6">
                <div className="bg-white dark:bg-dark-surface rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">User Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                Name
                            </label>
                            <p className="text-base text-gray-900 dark:text-white">{getUserName()}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                Email
                            </label>
                            <p className="text-base text-gray-900 dark:text-white flex items-center gap-2">
                                <Mail size={16} />
                                {user.email}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                Enum Role
                            </label>
                            <p className="text-base">
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                    {user.role}
                                </span>
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                Status
                            </label>
                            <p className="text-base">
                                <span
                                    className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
                                        user.is_active
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                    }`}
                                >
                                    {user.is_active ? (
                                        <>
                                            <CheckCircle size={14} />
                                            Active
                                        </>
                                    ) : (
                                        <>
                                            <XCircle size={14} />
                                            Inactive
                                        </>
                                    )}
                                </span>
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                Created At
                            </label>
                            <p className="text-base text-gray-900 dark:text-white flex items-center gap-2">
                                <Calendar size={16} />
                                {new Date(user.created_at).toLocaleString()}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                Updated At
                            </label>
                            <p className="text-base text-gray-900 dark:text-white flex items-center gap-2">
                                <Calendar size={16} />
                                {new Date(user.updated_at).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-dark-surface rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <Shield size={20} />
                        Dynamic Roles
                    </h2>
                    {user.roles && user.roles.length > 0 ? (
                        <div className="space-y-4">
                            {user.roles.map((role) => (
                                <div key={role.id} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-medium text-gray-900 dark:text-white">{role.name}</h3>
                                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                            Assigned
                                        </span>
                                    </div>
                                    {role.description && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{role.description}</p>
                                    )}
                                    {role.modules && role.modules.length > 0 && (
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Module Access:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {role.modules.map((module) => (
                                                    <span
                                                        key={module.code}
                                                        className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                                                    >
                                                        {module.code} - {module.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">No dynamic roles assigned.</p>
                    )}
                </div>

                <div className="bg-white dark:bg-dark-surface rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Module Access Summary</h2>
                    <div className="flex flex-wrap gap-2">
                        {getUserModules().map((module, idx) => (
                            <span
                                key={idx}
                                className="px-3 py-1 text-sm font-medium rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                            >
                                {module}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
