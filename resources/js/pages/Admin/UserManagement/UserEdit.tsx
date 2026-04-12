import { Link, useForm } from '@inertiajs/react';
import AdminLayout from '../../../components/AdminLayout';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import { User as UserIcon, MapPin, Shield } from 'lucide-react';
import { showSuccess, showConfirm } from '../../../lib/swal';

interface User {
    id: number;
    email: string;
    role: string;
    is_active: boolean;
    profile?: {
        first_name: string;
        middle_name: string | null;
        last_name: string;
        suffix: string | null;
        mobile_number: string;
        street: string;
        barangay: string;
        city: string;
    } | null;
}

interface UserEditProps {
    user: User;
}

export default function UserEdit({ user }: UserEditProps) {
    const { data, setData, put, processing, errors } = useForm({
        // Account info
        email: user.email || '',
        password: '',
        password_confirmation: '',
        role: user.role || 'user',
        is_active: user.is_active ?? true,

        // Profile info
        first_name: user.profile?.first_name || '',
        middle_name: user.profile?.middle_name || '',
        last_name: user.profile?.last_name || '',
        suffix: user.profile?.suffix || '',
        mobile_number: user.profile?.mobile_number || '',
        street: user.profile?.street || '',
        barangay: user.profile?.barangay || '',
        city: user.profile?.city || '',
    });

    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();

        const confirmed = await showConfirm(
            'Are you sure you want to update this user account?',
            'Update User',
            'Update',
            'Cancel'
        );

        if (confirmed) {
            put(`/admin/user-management/${user.id}`, {
                onSuccess: () => {
                    showSuccess('User has been updated successfully.');
                },
            });
        }
    };

    return (
        <AdminLayout
            title="Edit User"
            description="Update user information"
            backButton={{
                href: `/admin/user-management/${user.id}`,
                label: 'Back to User',
            }}
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-6">
                        {/* Personal Information */}
                        <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                                <h2 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                                    <UserIcon size={16} className="text-primary" />
                                    Personal Information
                                </h2>
                            </div>
                            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Input
                                    label="First Name"
                                    value={data.first_name}
                                    onChange={(e) => setData('first_name', e.target.value)}
                                    error={errors.first_name}
                                    required
                                />
                                <Input
                                    label="Middle Name"
                                    value={data.middle_name}
                                    onChange={(e) => setData('middle_name', e.target.value)}
                                    error={errors.middle_name}
                                />
                                <Input
                                    label="Last Name"
                                    value={data.last_name}
                                    onChange={(e) => setData('last_name', e.target.value)}
                                    error={errors.last_name}
                                    required
                                />
                                <Input
                                    label="Suffix"
                                    value={data.suffix}
                                    onChange={(e) => setData('suffix', e.target.value)}
                                    error={errors.suffix}
                                    placeholder="e.g. Jr., III"
                                />
                                <div className="sm:col-span-2">
                                    <Input
                                        label="Mobile Number"
                                        value={data.mobile_number}
                                        onChange={(e) => setData('mobile_number', e.target.value)}
                                        error={errors.mobile_number}
                                        required
                                        placeholder="e.g. 09123456789"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Address Details */}
                        <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                                <h2 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                                    <MapPin size={16} className="text-primary" />
                                    Address Details
                                </h2>
                            </div>
                            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Input
                                    label="Street"
                                    value={data.street}
                                    onChange={(e) => setData('street', e.target.value)}
                                    error={errors.street}
                                    required
                                />
                                <Input
                                    label="Barangay"
                                    value={data.barangay}
                                    onChange={(e) => setData('barangay', e.target.value)}
                                    error={errors.barangay}
                                    required
                                />
                                <div className="sm:col-span-2">
                                    <Input
                                        label="City / Municipality"
                                        value={data.city}
                                        onChange={(e) => setData('city', e.target.value)}
                                        error={errors.city}
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Account Settings */}
                        <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                                <h2 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                                    <Shield size={16} className="text-primary" />
                                    Account Settings
                                </h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <Input
                                    label="Email Address"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    error={errors.email}
                                    required
                                />
                                <div>
                                    <label className="block mb-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tighter">
                                        Role
                                    </label>
                                    <select
                                        value={data.role}
                                        onChange={(e) => setData('role', e.target.value)}
                                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-surface text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                    >
                                        <option value="user">Citizen / User</option>
                                        <option value="official">Official</option>
                                        <option value="staff">Staff</option>
                                        <option value="admin">Admin</option>
                                        <option value="super_admin">Super Admin</option>
                                    </select>
                                </div>
                                <Input
                                    label="Password (leave blank to keep current)"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    error={errors.password}
                                />
                                <Input
                                    label="Confirm Password"
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    error={errors.password_confirmation}
                                />
                                <label className="flex items-center gap-2 pt-2">
                                    <input
                                        type="checkbox"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Account Active</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-4">
                    <Link
                        href={`/admin/user-management/${user.id}`}
                        className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    >
                        Cancel
                    </Link>
                    <Button type="submit" disabled={processing}>
                        {processing ? 'Updating...' : 'Update User'}
                    </Button>
                </div>
            </form>
        </AdminLayout>
    );
}
