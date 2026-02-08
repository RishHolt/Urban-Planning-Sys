import { Link, useForm } from '@inertiajs/react';
import AdminLayout from '../../../components/AdminLayout';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import { ArrowLeft } from 'lucide-react';

interface Role {
    id: number;
    name: string;
}

interface UserCreateProps {
    roles: Role[];
}

export default function UserCreate({ roles }: UserCreateProps) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        password_confirmation: '',
        role: 'user',
        role_ids: [] as number[],
        is_active: true,
    });

    const handleSubmit = (e: React.FormEvent): void => {
        e.preventDefault();
        post('/admin/user-management');
    };

    const handleRoleToggle = (roleId: number): void => {
        const currentRoles = data.role_ids || [];
        if (currentRoles.includes(roleId)) {
            setData('role_ids', currentRoles.filter((id) => id !== roleId));
        } else {
            setData('role_ids', [...currentRoles, roleId]);
        }
    };

    return (
        <AdminLayout
            title="Create User"
            description="Add a new user to the system"
            backButton={{
                href: '/admin/user-management',
                label: 'Back to Users',
            }}
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white dark:bg-dark-surface rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">User Information</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            error={errors.email}
                            required
                        />

                        <div>
                            <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                Enum Role
                            </label>
                            <select
                                value={data.role}
                                onChange={(e) => setData('role', e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-surface text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                                <option value="user">User</option>
                                <option value="staff">Staff</option>
                                <option value="admin">Admin</option>
                                <option value="super_admin">Super Admin</option>
                            </select>
                        </div>

                        <Input
                            label="Password"
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            error={errors.password}
                            required
                        />

                        <Input
                            label="Confirm Password"
                            type="password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            error={errors.password_confirmation}
                            required
                        />
                    </div>

                    <div className="mt-6">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={data.is_active}
                                onChange={(e) => setData('is_active', e.target.checked)}
                                className="rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active</span>
                        </label>
                    </div>
                </div>

                <div className="bg-white dark:bg-dark-surface rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Dynamic Roles</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Select one or more roles to assign to this user. Roles determine module access.
                    </p>
                    <div className="space-y-2">
                        {roles.map((role) => (
                            <label key={role.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.role_ids?.includes(role.id) || false}
                                    onChange={() => handleRoleToggle(role.id)}
                                    className="rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <span className="text-sm font-medium text-gray-900 dark:text-white">{role.name}</span>
                            </label>
                        ))}
                        {roles.length === 0 && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">No roles available. Create roles first.</p>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-end gap-4">
                    <Link
                        href="/admin/user-management"
                        className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    >
                        Cancel
                    </Link>
                    <Button type="submit" disabled={processing}>
                        {processing ? 'Creating...' : 'Create User'}
                    </Button>
                </div>
            </form>
        </AdminLayout>
    );
}
