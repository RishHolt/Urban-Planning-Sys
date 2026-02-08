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

interface RoleCreateProps {
    modules: Module[];
}

export default function RoleCreate({ modules }: RoleCreateProps) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        module_codes: [] as string[],
    });

    const handleSubmit = (e: React.FormEvent): void => {
        e.preventDefault();
        post('/admin/role-management');
    };

    const handleModuleToggle = (moduleCode: string): void => {
        const currentModules = data.module_codes || [];
        if (currentModules.includes(moduleCode)) {
            setData('module_codes', currentModules.filter((code) => code !== moduleCode));
        } else {
            setData('module_codes', [...currentModules, moduleCode]);
        }
    };

    return (
        <AdminLayout
            title="Create Role"
            description="Create a new role with module access"
            backButton={{
                href: '/admin/role-management',
                label: 'Back to Roles',
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
                            placeholder="e.g., Zoning Officer"
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
                                placeholder="Describe the role and its responsibilities..."
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-dark-surface rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Module Access</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Select the modules this role should have access to. Users with this role will inherit access to all selected modules.
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
                        {modules.length === 0 && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">No modules available.</p>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-end gap-4">
                    <Link
                        href="/admin/role-management"
                        className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    >
                        Cancel
                    </Link>
                    <Button type="submit" disabled={processing}>
                        {processing ? 'Creating...' : 'Create Role'}
                    </Button>
                </div>
            </form>
        </AdminLayout>
    );
}
