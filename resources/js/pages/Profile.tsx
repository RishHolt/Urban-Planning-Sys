import { useState } from 'react';
import { usePage, Link, useForm } from '@inertiajs/react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Button from '../components/Button';
import Input from '../components/Input';
import type { SharedData, User, Profile } from '../types';
import { User as UserIcon, Mail, Phone, MapPin, Calendar, Building, Briefcase, Shield, ArrowLeft, Edit2, X, Hash } from 'lucide-react';

export default function Profile() {
    const { user } = usePage<SharedData & { user: User }>().props;
    const profile = user?.profile as Profile | undefined;
    const [isEditing, setIsEditing] = useState(false);

    const formatDateForInput = (dateString: string | null) => {
        if (!dateString) {
            return '';
        }
        return new Date(dateString).toISOString().split('T')[0];
    };

    const { data, setData, put, processing, errors, reset } = useForm({
        email: profile?.email || user?.email || '',
        first_name: profile?.first_name || '',
        last_name: profile?.last_name || '',
        middle_name: profile?.middle_name || '',
        suffix: profile?.suffix || '',
        birthday: formatDateForInput(profile?.birthday || null),
        mobile_number: profile?.mobile_number || '',
        address: profile?.address || '',
        street: profile?.street || '',
        barangay: profile?.barangay || '',
        city: profile?.city || '',
    });

    const formatDate = (dateString: string | null) => {
        if (!dateString) {
            return 'Not provided';
        }
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getFullName = () => {
        if (!profile) {
            return user?.username || user?.email?.split('@')[0] || 'User';
        }

        const parts = [profile.first_name];
        if (profile.middle_name) {
            parts.push(profile.middle_name);
        }
        parts.push(profile.last_name);
        if (profile.suffix) {
            parts.push(profile.suffix);
        }

        return parts.join(' ');
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'superadmin':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            case 'admin':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
            case 'staff':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            default:
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        }
    };

    return (
        <div className="flex flex-col bg-background dark:bg-dark-bg w-full min-h-dvh transition-colors">
            <Header />

            {/* Main Content */}
            <div className="mt-16 py-8 md:py-12 pb-16 md:pb-24 w-full">
                <div className="mx-auto px-4 max-w-7xl">
                    {/* Page Header */}
                    <div className="mb-8">
                        <div className="flex sm:flex-row flex-col justify-between items-start sm:items-center gap-4 mb-2">
                            <div>
                                <h1 className="mb-2 font-bold text-gray-900 dark:text-white text-3xl md:text-4xl">
                                    My Profile
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400">
                                    {isEditing ? 'Edit your account information' : 'View and manage your account information'}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                {isEditing ? (
                                    <Button
                                        variant="outline"
                                        size="md"
                                        onClick={() => setIsEditing(false)}
                                        className="flex items-center gap-2"
                                    >
                                        <X size={18} />
                                        <span>Cancel</span>
                                    </Button>
                                ) : (
                                    <>
                                        <Button
                                            variant="primary"
                                            size="md"
                                            onClick={() => setIsEditing(true)}
                                            className="flex items-center gap-2"
                                        >
                                            <Edit2 size={18} />
                                            <span>Edit</span>
                                        </Button>
                                        <Link href="/">
                                            <Button variant="primary" size="md" className="flex items-center gap-2">
                                                <ArrowLeft size={18} />
                                                <span>Return</span>
                                            </Button>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Profile Card */}
                    <div className="bg-white dark:bg-dark-surface shadow-lg rounded-2xl overflow-hidden">
                        {/* Profile Header */}
                        <div className="bg-gradient-to-r from-primary/20 dark:from-primary/10 via-secondary/20 dark:via-secondary/10 to-accent/20 dark:to-accent/10 px-6 md:px-8 py-8 md:py-10">
                            <div className="flex sm:flex-row flex-col items-center sm:items-start gap-6">
                                {/* Avatar */}
                                <div className="flex justify-center items-center bg-primary/20 dark:bg-primary/10 rounded-full w-24 md:w-32 h-24 md:h-32">
                                    <UserIcon className="w-12 md:w-16 h-12 md:h-16 text-primary" />
                                </div>

                                {/* Name and Role */}
                                <div className="flex-1 sm:text-left text-center">
                                    <h2 className="mb-2 font-bold text-gray-900 dark:text-white text-2xl md:text-3xl">
                                        {getFullName()}
                                    </h2>
                                    {user?.role && (
                                        <span
                                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(user.role)}`}
                                        >
                                            {user.role.toUpperCase()}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Profile Content */}
                        <div className="p-6 md:p-8">
                            {isEditing ? (
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        put('/profile', {
                                            onSuccess: () => {
                                                setIsEditing(false);
                                            },
                                        });
                                    }}
                                    className="space-y-6"
                                >
                                    <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
                                        {/* Personal Information */}
                                        <div className="space-y-4">
                                            <h3 className="mb-4 pb-2 border-gray-200 dark:border-gray-700 border-b font-semibold text-gray-900 dark:text-white text-xl">
                                                Personal Information
                                            </h3>

                                            {/* Email */}
                                            <Input
                                                type="email"
                                                name="email"
                                                label="Email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                icon={<Mail size={20} />}
                                                error={errors.email}
                                                required
                                            />

                                            {/* First Name */}
                                            <Input
                                                type="text"
                                                name="first_name"
                                                label="First Name"
                                                value={data.first_name}
                                                onChange={(e) => setData('first_name', e.target.value)}
                                                icon={<UserIcon size={20} />}
                                                error={errors.first_name}
                                                required
                                            />

                                            {/* Middle Name */}
                                            <Input
                                                type="text"
                                                name="middle_name"
                                                label="Middle Name"
                                                value={data.middle_name}
                                                onChange={(e) => setData('middle_name', e.target.value)}
                                                icon={<UserIcon size={20} />}
                                                error={errors.middle_name}
                                            />

                                            {/* Last Name */}
                                            <Input
                                                type="text"
                                                name="last_name"
                                                label="Last Name"
                                                value={data.last_name}
                                                onChange={(e) => setData('last_name', e.target.value)}
                                                icon={<UserIcon size={20} />}
                                                error={errors.last_name}
                                                required
                                            />

                                            {/* Suffix */}
                                            <Input
                                                type="text"
                                                name="suffix"
                                                label="Suffix"
                                                placeholder="Jr., Sr., III, etc."
                                                value={data.suffix}
                                                onChange={(e) => setData('suffix', e.target.value)}
                                                icon={<UserIcon size={20} />}
                                                error={errors.suffix}
                                            />

                                            {/* Birthday */}
                                            <Input
                                                type="date"
                                                name="birthday"
                                                label="Birthday"
                                                value={data.birthday}
                                                onChange={(e) => setData('birthday', e.target.value)}
                                                icon={<Calendar size={20} />}
                                                error={errors.birthday}
                                                required
                                            />

                                            {/* Mobile Number */}
                                            <Input
                                                type="tel"
                                                name="mobile_number"
                                                label="Mobile Number"
                                                value={data.mobile_number}
                                                onChange={(e) => setData('mobile_number', e.target.value)}
                                                icon={<Phone size={20} />}
                                                error={errors.mobile_number}
                                                required
                                            />
                                        </div>

                                        {/* Address Information */}
                                        <div className="space-y-4">
                                            <h3 className="mb-4 pb-2 border-gray-200 dark:border-gray-700 border-b font-semibold text-gray-900 dark:text-white text-xl">
                                                Address Information
                                            </h3>

                                            {/* Address */}
                                            <Input
                                                type="text"
                                                name="address"
                                                label="Address"
                                                value={data.address}
                                                onChange={(e) => setData('address', e.target.value)}
                                                icon={<MapPin size={20} />}
                                                error={errors.address}
                                                required
                                            />

                                            {/* Street */}
                                            <Input
                                                type="text"
                                                name="street"
                                                label="Street"
                                                value={data.street}
                                                onChange={(e) => setData('street', e.target.value)}
                                                icon={<MapPin size={20} />}
                                                error={errors.street}
                                                required
                                            />

                                            {/* Barangay */}
                                            <Input
                                                type="text"
                                                name="barangay"
                                                label="Barangay"
                                                value={data.barangay}
                                                onChange={(e) => setData('barangay', e.target.value)}
                                                icon={<MapPin size={20} />}
                                                error={errors.barangay}
                                                required
                                            />

                                            {/* City */}
                                            <Input
                                                type="text"
                                                name="city"
                                                label="City"
                                                value={data.city}
                                                onChange={(e) => setData('city', e.target.value)}
                                                icon={<MapPin size={20} />}
                                                error={errors.city}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="flex justify-end gap-3 pt-4 border-gray-200 dark:border-gray-700 border-t">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setIsEditing(false);
                                                reset();
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            variant="primary"
                                            disabled={processing}
                                        >
                                            {processing ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                    </div>
                                </form>
                            ) : (
                                <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
                                    {/* Personal Information */}
                                    <div className="space-y-6">
                                        <h3 className="mb-4 pb-2 border-gray-200 dark:border-gray-700 border-b font-semibold text-gray-900 dark:text-white text-xl">
                                            Personal Information
                                        </h3>

                                        {/* Email */}
                                        <div className="flex items-start gap-3">
                                            <Mail className="flex-shrink-0 mt-1 w-5 h-5 text-primary" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-gray-500 dark:text-gray-400 text-sm">Email</p>
                                                <p className="mt-1 text-gray-900 dark:text-white break-words">
                                                    {profile?.email || user?.email || 'Not provided'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Birthday */}
                                        <div className="flex items-start gap-3">
                                            <Calendar className="flex-shrink-0 mt-1 w-5 h-5 text-primary" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-gray-500 dark:text-gray-400 text-sm">Birthday</p>
                                                <p className="mt-1 text-gray-900 dark:text-white">
                                                    {formatDate(profile?.birthday || null)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Mobile Number */}
                                        <div className="flex items-start gap-3">
                                            <Phone className="flex-shrink-0 mt-1 w-5 h-5 text-primary" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-gray-500 dark:text-gray-400 text-sm">Mobile Number</p>
                                                <p className="mt-1 text-gray-900 dark:text-white">
                                                    {profile?.mobile_number || 'Not provided'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Address Information */}
                                    <div className="space-y-6">
                                        <h3 className="mb-4 pb-2 border-gray-200 dark:border-gray-700 border-b font-semibold text-gray-900 dark:text-white text-xl">
                                            Address Information
                                        </h3>

                                        {/* Full Address */}
                                        <div className="flex items-start gap-3">
                                            <MapPin className="flex-shrink-0 mt-1 w-5 h-5 text-primary" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-gray-500 dark:text-gray-400 text-sm">Address</p>
                                                <div className="space-y-1 mt-1 text-gray-900 dark:text-white">
                                                    {profile?.address && <p>{profile.address}</p>}
                                                    {profile?.street && <p>{profile.street}</p>}
                                                    {profile?.barangay && <p>{profile.barangay}</p>}
                                                    {profile?.city && <p>{profile.city}</p>}
                                                    {!profile?.address && !profile?.street && !profile?.barangay && !profile?.city && (
                                                        <p>Not provided</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Account Information */}
                                    <div className="space-y-6 md:col-span-2">
                                        <h3 className="mb-4 pb-2 border-gray-200 dark:border-gray-700 border-b font-semibold text-gray-900 dark:text-white text-xl">
                                            Account Information
                                        </h3>

                                        <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
                                            {/* Account Number */}
                                            <div className="flex items-start gap-3">
                                                <Hash className="flex-shrink-0 mt-1 w-5 h-5 text-primary" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-gray-500 dark:text-gray-400 text-sm">Account Number</p>
                                                    <p className="mt-1 font-mono text-gray-900 dark:text-white">
                                                        {user?.account_no || 'Not assigned'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Username */}
                                            <div className="flex items-start gap-3">
                                                <UserIcon className="flex-shrink-0 mt-1 w-5 h-5 text-primary" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-gray-500 dark:text-gray-400 text-sm">Username</p>
                                                    <p className="mt-1 text-gray-900 dark:text-white">
                                                        {user?.username || 'Not set'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Department */}
                                            {user?.department && (
                                                <div className="flex items-start gap-3">
                                                    <Building className="flex-shrink-0 mt-1 w-5 h-5 text-primary" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-gray-500 dark:text-gray-400 text-sm">Department</p>
                                                        <p className="mt-1 text-gray-900 dark:text-white">
                                                            {user.department_relation?.name || user.department}
                                                        </p>
                                                        {user.department_relation && (
                                                            <p className="mt-0.5 text-gray-500 dark:text-gray-400 text-xs">
                                                                ({user.department})
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Position */}
                                            {user?.position && (
                                                <div className="flex items-start gap-3">
                                                    <Briefcase className="flex-shrink-0 mt-1 w-5 h-5 text-primary" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-gray-500 dark:text-gray-400 text-sm">Position</p>
                                                        <p className="mt-1 text-gray-900 dark:text-white">{user.position}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Email Verified */}
                                            <div className="flex items-start gap-3">
                                                <Shield className="flex-shrink-0 mt-1 w-5 h-5 text-primary" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-gray-500 dark:text-gray-400 text-sm">Email Verified</p>
                                                    <p className="mt-1 text-gray-900 dark:text-white">
                                                        {user?.email_verified ? (
                                                            <span className="text-green-600 dark:text-green-400">Verified</span>
                                                        ) : (
                                                            <span className="text-red-600 dark:text-red-400">Not Verified</span>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
