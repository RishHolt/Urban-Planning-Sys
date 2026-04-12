import { Link } from '@inertiajs/react';
import AdminLayout from '../../../components/AdminLayout';
import Button from '../../../components/Button';
import { Edit2, Mail, Calendar, CheckCircle, XCircle, MapPin, Phone, User as UserIcon, Shield, Clock } from 'lucide-react';

interface User {
    id: number;
    email: string;
    role: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    profile?: {
        first_name?: string;
        last_name?: string;
        middle_name?: string;
        suffix?: string;
        mobile_number?: string;
        address?: string; // Legacy field if any
        street?: string;
        barangay?: string;
        city?: string;
    };
}

interface UserShowProps {
    user: User;
}

export default function UserShow({ user }: UserShowProps) {
    const getUserFullName = (): string => {
        const { first_name, middle_name, last_name, suffix } = user.profile || {};
        return [first_name, middle_name, last_name, suffix].filter(Boolean).join(' ') || user.email;
    };

    const formatRoleName = (role: string): string =>
        role.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    return (
        <AdminLayout
            title="User Details"
            description={`View details for ${getUserFullName()}`}
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
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Personal Information */}
                <div className="xl:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                            <h2 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                                <UserIcon size={16} className="text-primary" />
                                Personal Information
                            </h2>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tighter mb-1">First Name</label>
                                <p className="text-gray-900 dark:text-white font-medium">{user.profile?.first_name || '-'}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tighter mb-1">Middle Name</label>
                                <p className="text-gray-900 dark:text-white font-medium">{user.profile?.middle_name || '-'}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tighter mb-1">Last Name</label>
                                <p className="text-gray-900 dark:text-white font-medium">{user.profile?.last_name || '-'}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tighter mb-1">Suffix</label>
                                <p className="text-gray-900 dark:text-white font-medium">{user.profile?.suffix || '-'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                            <h2 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                                <MapPin size={16} className="text-primary" />
                                Address Details
                            </h2>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tighter mb-1">Street</label>
                                <p className="text-gray-900 dark:text-white font-medium">{user.profile?.street || '-'}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tighter mb-1">Barangay</label>
                                <p className="text-gray-900 dark:text-white font-medium">{user.profile?.barangay || '-'}</p>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tighter mb-1">City / Municipality</label>
                                <p className="text-gray-900 dark:text-white font-medium">{user.profile?.city || '-'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Account & Contact */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                            <h2 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                                <Shield size={16} className="text-primary" />
                                Account Details
                            </h2>
                        </div>
                        <div className="p-6 space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tighter mb-1">Email Address</label>
                                <p className="text-gray-900 dark:text-white font-medium flex items-center gap-2">
                                    <Mail size={14} className="text-gray-400" />
                                    {user.email}
                                </p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tighter mb-1">Mobile Number</label>
                                <p className="text-gray-900 dark:text-white font-medium flex items-center gap-2">
                                    <Phone size={14} className="text-gray-400" />
                                    {user.profile?.mobile_number || 'Not provided'}
                                </p>
                            </div>
                            <div className="flex justify-between items-center py-2 border-t border-gray-100 dark:border-gray-800">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Role</span>
                                <span className="px-2 py-1 text-[10px] font-bold uppercase rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                    {formatRoleName(user.role)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-t border-gray-100 dark:border-gray-800">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Status</span>
                                <span className={`inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase rounded-md ${
                                    user.is_active
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                }`}>
                                    {user.is_active ? 'Active' : 'Deactivated'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <Calendar size={18} className="text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Registered On</p>
                                    <p className="text-sm text-gray-900 dark:text-white font-medium">
                                        {new Date(user.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}
                                    </p>
                                    <p className="text-[10px] text-gray-400">{new Date(user.created_at).toLocaleTimeString()}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 pt-4 border-t border-gray-50 dark:border-gray-800">
                                <Clock size={18} className="text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Last Profile Update</p>
                                    <p className="text-sm text-gray-900 dark:text-white font-medium">
                                        {new Date(user.updated_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
