import { Link, useForm } from '@inertiajs/react';
import AdminLayout from '../../../components/AdminLayout';
import Input from '../../../components/Input';
import Button from '../../../components/Button';

interface Module {
    id: number;
    code: string;
    name: string;
    description?: string;
}

interface Role {
    id: number;
    name: string;
    description?: string;
    is_system: boolean;
    modules?: Array<{
        code: string;
        name: string;
    }>;
}

interface RoleEditProps {
    role: Role;
    modules: Module[];
}

export default function RoleEdit({ role, modules }: RoleEditProps) {
    const { data, setData, put, processing, errors } = useForm({
        name: role.name || '',
        description: role.description || '',
        module_codes: role.modules?.map((m) => m.code) || [],
    });

    const handleSubmit = (e: React.FormEvent): void => {
        e.preventDefault();
        put(`/admin/role-management/${role.id}`);
    };

    const handleModuleToggle = (moduleCode: string): void => {
        const currentModules = data.module_codes || [];
        if (currentModules.includes(moduleCode)) {
            setData('module_codes', currentModules.filter((code) => code !== moduleCode));
        } else {
            setData('module_codes', [...currentModules, moduleCode]);
        }
    };

    if (role.is_system) {
        return (
            <AdminLayout
                title="Edit Role"
                description="System roles cannot be edited"
                backButton={{
                    href: `/admin/role-management/${role.id}`,
                    label: 'Back to Role',
                }}
            >
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
                    <p className="text-yellow-800 dark:text-yellow-200">
                        This is a system role and cannot be modified. System roles are protected to ensure system integrity.
                    </p>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout
            title="Edit Role"
            description="Update role information and module access"
            backButton={{
                href: `/admin/role-management/${role.id}`,
                label: 'Back to Role',
            }}
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white dark:bg-dark-surface rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Role Information</h2>

                    <div className="space-y-6">
                        <Input
                            label="Role Name"
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            error={errors.name}
                            required
                        />

                        <div>
                            <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                Description
                            </label>
                            <textarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows={4}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-surface text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-dark-surface rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Module Access</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Select the modules this role should have access to.
                    </p>
                    <div className="space-y-2">
                        {modules.map((module) => (
                            <label
                                key={module.id}
                                className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                            >
                                <input
                                    type="checkbox"
                                    checked={data.module_codes?.includes(module.code) || false}
                                    onChange={() => handleModuleToggle(module.code)}
                                    className="mt-1 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <div className="flex-1">
                                    <div className="font-medium text-gray-900 dark:text-white">
                                        {module.code} - {module.name}
                                    </div>
                                    {module.description && (
                                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            {module.description}
                                        </div>
                                    )}
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="flex items-center justify-end gap-4">
                    <Link
                        href={`/admin/role-management/${role.id}`}
                        className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    >
                        Cancel
                    </Link>
                    <Button type="submit" disabled={processing}>
                        {processing ? 'Updating...' : 'Update Role'}
                    </Button>
                </div>
            </form>
        </AdminLayout>
    );
}
