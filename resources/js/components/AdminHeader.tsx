import { Link, usePage, Form } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import Time from './Time';
import ThemeToggle from './ThemeToggle';
import { CircleUserRound, ChevronDown, User, Settings, LogOut, ChevronRight, Home } from 'lucide-react';
import type { SharedData, Profile } from '../types';

interface AdminHeaderProps {
    sidebarOpen?: boolean;
}

export default function AdminHeader({ sidebarOpen = true }: AdminHeaderProps) {
    const page = usePage<SharedData>();
    const url = (page.url || '') as string;
    const { auth } = page.props;
    const user = auth?.user;
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen]);

    const getUserDisplayName = () => {
        if (!user) {
            return 'User';
        }

        // Try to get name from profile if available
        const profile = user.profile as Profile | undefined;
        if (profile?.first_name) {
            return `${profile.first_name} ${profile.last_name || ''}`.trim();
        }

        // Fallback to username or email
        return user.username || user.email?.split('@')[0] || 'User';
    };

    // Generate breadcrumbs from URL
    const generateBreadcrumbs = () => {
        const breadcrumbs = [
            { label: 'Admin', href: '/admin' },
        ];

        if (url === '/admin' || url === '/admin/') {
            return breadcrumbs;
        }

        const parts = url.replace('/admin', '').split('/').filter(Boolean);
        
        parts.forEach((part, index) => {
            const href = '/admin/' + parts.slice(0, index + 1).join('/');
            const label = part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ');
            breadcrumbs.push({ label, href });
        });

        return breadcrumbs;
    };

    const breadcrumbs = generateBreadcrumbs();

    return (
        <div className={`top-0 right-0 z-50 fixed flex bg-background dark:bg-dark-bg shadow-md border-accent border-b-2 h-16 transition-all duration-300 ease-in-out ${
            sidebarOpen ? 'left-0 lg:left-64' : 'left-0 lg:left-20'
        }`}>
            <div className="flex flex-row justify-between items-center px-4 w-full">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
                    <ol className="flex items-center gap-2">
                        {breadcrumbs.map((crumb, index) => (
                            <li key={crumb.href} className="flex items-center gap-2">
                                {index > 0 && (
                                    <ChevronRight size={16} className="text-gray-400 dark:text-gray-500" />
                                )}
                                {index === breadcrumbs.length - 1 ? (
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {crumb.label}
                                    </span>
                                ) : (
                                    <Link
                                        href={crumb.href}
                                        className="text-gray-600 hover:text-gray-900 dark:hover:text-white dark:text-gray-400 transition-colors"
                                    >
                                        {index === 0 ? (
                                            <span className="flex items-center gap-1">
                                                <Home size={16} />
                                                {crumb.label}
                                            </span>
                                        ) : (
                                            crumb.label
                                        )}
                                    </Link>
                                )}
                            </li>
                        ))}
                    </ol>
                </nav>

                {/* Right Side - Controls and Button */}
                <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3">
                    {/* Time - Hidden on mobile */}
                    <div className="hidden md:block">
                        <Time />
                    </div>
                    
                    {/* Theme Toggle */}
                    <ThemeToggle />
                    
                    {/* User Menu */}
                    {user && (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-2 rounded-lg transition-colors"
                            >
                                <CircleUserRound size={20} className="text-primary" />
                                <span className="hidden sm:inline font-medium text-gray-700 dark:text-gray-300 text-sm">
                                    {getUserDisplayName()}
                                </span>
                                <ChevronDown 
                                    size={16} 
                                    className={`text-gray-500 dark:text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                                />
                            </button>

                            {/* Dropdown Menu */}
                            {isDropdownOpen && (
                                <div className="right-0 z-50 absolute bg-white dark:bg-dark-surface shadow-lg mt-2 py-1 border border-gray-200 dark:border-gray-700 rounded-lg w-48">
                                    <Link
                                        href="/profile"
                                        className="flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 px-4 py-2 text-gray-700 dark:text-gray-300 transition-colors"
                                        onClick={() => setIsDropdownOpen(false)}
                                    >
                                        <User size={18} />
                                        <span>Profile</span>
                                    </Link>
                                    <Link
                                        href="/settings"
                                        className="flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 px-4 py-2 text-gray-700 dark:text-gray-300 transition-colors"
                                        onClick={() => setIsDropdownOpen(false)}
                                    >
                                        <Settings size={18} />
                                        <span>Settings</span>
                                    </Link>
                                    <div className="my-1 border-gray-200 dark:border-gray-700 border-t"></div>
                                    <Form
                                        action="/logout"
                                        method="post"
                                        className="w-full"
                                        onSubmit={() => setIsDropdownOpen(false)}
                                    >
                                        {({ processing }) => (
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 px-4 py-2 w-full text-red-600 dark:text-red-400 transition-colors"
                                            >
                                                <LogOut size={18} />
                                                <span>{processing ? 'Logging out...' : 'Logout'}</span>
                                            </button>
                                        )}
                                    </Form>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
