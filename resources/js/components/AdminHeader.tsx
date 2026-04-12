import { Link, usePage, Form } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import Time from './Time';
import ThemeToggle from './ThemeToggle';
import { ChevronDown, User, Settings, LogOut, ChevronRight, Home, PanelLeft, PanelLeftClose } from 'lucide-react';
import type { SharedData, Profile } from '../types';

interface AdminHeaderProps {
    sidebarOpen?: boolean;
    onToggle?: () => void;
}

export default function AdminHeader({ sidebarOpen = true, onToggle }: AdminHeaderProps) {
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
        if (isDropdownOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isDropdownOpen]);

    const getUserDisplayName = () => {
        if (!user) return 'User';
        const profile = user.profile as Profile | undefined;
        if (profile?.first_name) return `${profile.first_name} ${profile.last_name || ''}`.trim();
        return user.username || user.email?.split('@')[0] || 'User';
    };

    const getUserInitials = () => {
        const name = getUserDisplayName();
        const parts = name.trim().split(' ').filter(Boolean);
        if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        return name.slice(0, 2).toUpperCase();
    };

    const KNOWN_ROUTES = new Set([
        '/admin',
        '/admin/zoning/applications', '/admin/zoning/inspections', '/admin/zoning/clearances',
        '/admin/zoning/classifications', '/admin/zoning/map',
        '/admin/housing/applications', '/admin/housing/projects', '/admin/housing/waitlist',
        '/admin/development-clearance/dashboard', '/admin/development-clearance/applications',
        '/admin/subdivision/certificates', '/admin/subdivision/reports',
        '/admin/infrastructure/dashboard', '/admin/infrastructure/projects',
        '/admin/infrastructure/contractors', '/admin/infrastructure/reports',
        '/admin/occupancy/dashboard', '/admin/occupancy/buildings', '/admin/occupancy/units',
        '/admin/occupancy/records', '/admin/occupancy/inspections', '/admin/occupancy/complaints',
        '/admin/occupancy/violations', '/admin/occupancy/reports',
        '/admin/user-management',
        '/admin/audit-logs', '/admin/reports',
    ]);

    const generateBreadcrumbs = () => {
        const crumbs = [{ label: 'Dashboard', href: '/admin', isLink: true }];
        if (url === '/admin' || url === '/admin/') return crumbs;
        const parts = url.replace('/admin', '').split('/').filter(Boolean);
        parts.forEach((part, index) => {
            const href = '/admin/' + parts.slice(0, index + 1).join('/');
            crumbs.push({
                href,
                label: part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' '),
                isLink: KNOWN_ROUTES.has(href),
            });
        });
        return crumbs;
    };

    const breadcrumbs = generateBreadcrumbs();
    const displayName = getUserDisplayName();
    const initials = getUserInitials();

    return (
        <header
            className={`top-0 right-0 z-50 fixed flex items-center bg-background dark:bg-dark-bg border-b-2 border-accent h-16 px-3 gap-2 transition-[left] duration-300 ease-out ${
                sidebarOpen ? 'left-0 lg:left-64' : 'left-0 lg:left-[72px]'
            }`}
        >
            {/* Sidebar toggle */}
            <button
                onClick={onToggle}
                className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                aria-expanded={sidebarOpen}
            >
                <span className="hidden lg:block">
                    {sidebarOpen ? <PanelLeftClose size={18} aria-hidden="true" /> : <PanelLeft size={18} aria-hidden="true" />}
                </span>
                <span className="lg:hidden">
                    <PanelLeft size={18} aria-hidden="true" />
                </span>
            </button>

            {/* Breadcrumbs — flex-1 keeps it left-aligned, min-w-0 allows truncation */}
            <nav className="flex-1 min-w-0 flex items-center" aria-label="Breadcrumb">
                <ol className="flex items-center gap-1 min-w-0">
                    {breadcrumbs.map((crumb, index) => {
                        const isLast = index === breadcrumbs.length - 1;
                        const isFirst = index === 0;
                        return (
                            <li key={crumb.href} className="flex items-center gap-1 min-w-0">
                                {index > 0 && (
                                    <ChevronRight size={14} className="flex-shrink-0 text-gray-300 dark:text-gray-600" aria-hidden="true" />
                                )}
                                {isLast ? (
                                    <span className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[200px]">
                                        {crumb.label}
                                    </span>
                                ) : crumb.isLink ? (
                                    <Link
                                        href={crumb.href}
                                        className="flex items-center gap-1 text-sm text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors whitespace-nowrap flex-shrink-0"
                                    >
                                        {isFirst && <Home size={14} aria-hidden="true" />}
                                        <span className={isFirst ? 'hidden sm:inline' : ''}>{crumb.label}</span>
                                    </Link>
                                ) : (
                                    <span className="flex items-center gap-1 text-sm text-gray-400 dark:text-gray-500 whitespace-nowrap flex-shrink-0">
                                        {isFirst && <Home size={14} aria-hidden="true" />}
                                        <span className={isFirst ? 'hidden sm:inline' : ''}>{crumb.label}</span>
                                    </span>
                                )}
                            </li>
                        );
                    })}
                </ol>
            </nav>

            {/* Right controls */}
            <div className="flex-shrink-0 flex items-center gap-1">
                {/* Time */}
                <div className="hidden lg:flex items-center px-3 h-9 text-sm text-gray-500 dark:text-gray-400">
                    <Time />
                </div>

                {/* Divider */}
                <div className="hidden lg:block w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" aria-hidden="true" />

                {/* Theme toggle */}
                <ThemeToggle />

                {/* User menu */}
                {user && (
                    <div className="relative ml-1" ref={dropdownRef}>
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center gap-2 h-9 pl-1 pr-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                            aria-label="User menu"
                            aria-expanded={isDropdownOpen}
                        >
                            {/* Avatar with initials */}
                            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-white text-xs font-semibold flex-shrink-0 select-none">
                                {initials}
                            </span>
                            <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300 max-w-[120px] truncate">
                                {displayName}
                            </span>
                            <ChevronDown
                                size={14}
                                className={`hidden sm:block flex-shrink-0 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                                aria-hidden="true"
                            />
                        </button>

                        {/* Dropdown */}
                        <div
                            className={`absolute right-0 top-full mt-2 w-56 bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden z-50 transition-all duration-150 origin-top-right ${
                                isDropdownOpen
                                    ? 'opacity-100 scale-100 translate-y-0'
                                    : 'opacity-0 scale-95 -translate-y-1 pointer-events-none'
                            }`}
                            role="menu"
                            aria-label="User menu"
                        >
                            {/* User info header */}
                            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700/60">
                                <div className="flex items-center gap-3">
                                    <span className="flex items-center justify-center w-9 h-9 rounded-full bg-primary text-white text-sm font-semibold flex-shrink-0 select-none">
                                        {initials}
                                    </span>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{displayName}</p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{user.email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Menu items */}
                            <div className="py-1.5">
                                <Link
                                    href="/profile"
                                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                    onClick={() => setIsDropdownOpen(false)}
                                    role="menuitem"
                                >
                                    <User size={15} className="flex-shrink-0 text-gray-400" aria-hidden="true" />
                                    Profile
                                </Link>
                                <Link
                                    href="/settings"
                                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                    onClick={() => setIsDropdownOpen(false)}
                                    role="menuitem"
                                >
                                    <Settings size={15} className="flex-shrink-0 text-gray-400" aria-hidden="true" />
                                    Settings
                                </Link>
                            </div>

                            <div className="border-t border-gray-100 dark:border-gray-700/60 py-1.5">
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
                                            className="flex items-center gap-3 px-4 py-2 w-full text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-50 transition-colors"
                                            role="menuitem"
                                        >
                                            <LogOut size={15} className="flex-shrink-0" aria-hidden="true" />
                                            {processing ? 'Signing out…' : 'Sign out'}
                                        </button>
                                    )}
                                </Form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
