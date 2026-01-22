import { useEffect, useRef, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Menu, X, LayoutDashboard, ClipboardList, Map, ListChecks, History, BarChart3, ChevronDown, ChevronRight, FileText, Home, ClipboardCheck, FileCheck, Receipt, Tags, Calendar, Building, List, Key, Shield, Users } from 'lucide-react';
import type { SharedData } from '../types';

interface SidebarProps {
    isOpen: boolean;
    onToggle: () => void;
}

interface MenuItem {
    href?: string;
    icon: typeof LayoutDashboard;
    label: string;
    children?: MenuItem[];
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
    const page = usePage<SharedData>();
    const url = (page.url || '') as string;
    const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());
    const [openPopover, setOpenPopover] = useState<string | null>(null);
    const popoverContainerRef = useRef<HTMLDivElement | null>(null);

    const menuItems: MenuItem[] = [
        { href: '/admin', icon: LayoutDashboard, label: 'Main Dashboard' },
        {
            icon: ClipboardList,
            label: 'Zoning Clearance',
            children: [
                { href: '/admin/zoning/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
                { href: '/admin/zoning/clearance/applications', icon: ListChecks, label: 'Applications' },
                { href: '/inspections', icon: ClipboardCheck, label: 'Inspections' },
                { href: '/clearances', icon: FileCheck, label: 'Issued Clearances' },
                { href: '/payments', icon: Receipt, label: 'Payment Records' },
                { href: '/admin/zoning/classifications', icon: Tags, label: 'Classifications' },
                { href: '/admin/zoning/map', icon: Map, label: 'Zoning Map' },
            ],
        },
        {
            icon: Home,
            label: 'Housing Beneficiary',
            children: [
                { href: '/admin/housing/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
                { href: '/admin/housing/applications', icon: ListChecks, label: 'Applications' },
                { href: '/admin/housing/site-visits', icon: Calendar, label: 'Site Visits' },
                { href: '/admin/housing/projects', icon: Building, label: 'Projects' },
                { href: '/admin/housing/waitlist', icon: List, label: 'Waitlist' },
                { href: '/admin/housing/allocations', icon: Key, label: 'Allocations' },
                { href: '/admin/housing/blacklist', icon: Shield, label: 'Blacklist' },
                { href: '/admin/housing/beneficiaries', icon: Users, label: 'Beneficiaries' },
                { href: '/admin/housing/reports', icon: BarChart3, label: 'Reports' },
            ],
        },
        { href: '/admin/audit-logs', icon: History, label: 'Audit Logs' },
        { href: '/admin/reports', icon: BarChart3, label: 'Reports' },
    ];

    const isActive = (href?: string): boolean => {
        if (!href) {
            return false;
        }
        if (href === '/admin') {
            return url === '/admin' || url === '/admin/';
        }
        return url.startsWith(href);
    };

    const isParentActive = (children?: MenuItem[]): boolean => {
        if (!children) {
            return false;
        }
        return children.some((child) => isActive(child.href));
    };

    const toggleMenu = (label: string): void => {
        setExpandedMenus((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(label)) {
                newSet.delete(label);
            } else {
                newSet.add(label);
            }
            return newSet;
        });
    };

    const isExpanded = (label: string): boolean => {
        return expandedMenus.has(label) || isParentActive(menuItems.find((item) => item.label === label)?.children);
    };

    useEffect(() => {
        if (!openPopover) {
            return;
        }

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setOpenPopover(null);
            }
        };

        const onMouseDown = (event: MouseEvent) => {
            const container = popoverContainerRef.current;
            if (!container) {
                return;
            }
            if (!container.contains(event.target as Node)) {
                setOpenPopover(null);
            }
        };

        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('mousedown', onMouseDown);

        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.removeEventListener('mousedown', onMouseDown);
        };
    }, [openPopover]);

    useEffect(() => {
        if (isOpen) {
            setOpenPopover(null);
        }
    }, [isOpen]);

    useEffect(() => {
        setOpenPopover(null);
    }, [url]);

    return (
        <>
            {/* Overlay for mobile */}
            <div
                className={`lg:hidden z-40 fixed inset-0 bg-black/50 transition-opacity duration-200 ease-out motion-reduce:transition-none ${
                    isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={onToggle}
                aria-hidden="true"
            />

            {/* Mobile Toggle Button - Always visible on mobile when sidebar is closed */}
            {!isOpen && (
                <button
                    onClick={onToggle}
                    className="lg:hidden top-4 left-4 z-50 fixed bg-white hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-dark-surface shadow-lg p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-300 transition-colors duration-200 ease-out motion-reduce:transition-none"
                    aria-label="Open sidebar"
                >
                    <Menu size={20} />
                </button>
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 z-40 h-screen bg-white dark:bg-dark-surface border-r border-gray-200 dark:border-gray-700 transition-[transform,width] duration-200 ease-out motion-reduce:transition-none ${
                    isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                } ${isOpen ? 'w-64' : 'w-0 lg:w-20'} overflow-hidden`}
            >
                <div className="flex flex-col h-full">
                    {/* Toggle Button */}
                    <div
                        className={`flex items-center h-16 border-b border-gray-200 dark:border-gray-700 transition-[padding,justify-content] duration-200 ease-out motion-reduce:transition-none ${
                        isOpen ? 'justify-between px-4' : 'justify-center lg:justify-center px-0'
                        }`}
                    >
                        <div className={`flex items-center transition-all duration-200 ease-out motion-reduce:transition-none ${
                            isOpen ? 'w-auto opacity-100' : 'w-0 opacity-0 lg:w-0 lg:opacity-0 overflow-hidden'
                        }`}
                        style={{
                            transitionDelay: '0ms'
                        }}>
                            <h2 className="font-semibold text-gray-900 dark:text-white text-base whitespace-nowrap">
                                Admin
                            </h2>
                        </div>
                        <button
                            onClick={onToggle}
                            className="flex-shrink-0 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-lg text-gray-700 dark:text-gray-300 transition-colors duration-200 ease-out motion-reduce:transition-none"
                            aria-label="Toggle sidebar"
                        >
                            <span className="transition-transform duration-200 ease-out motion-reduce:transition-none">
                                {isOpen ? <X size={20} /> : <Menu size={20} />}
                            </span>
                        </button>
                    </div>

                    {/* Navigation Items */}
                    <nav className={`flex-1 overflow-y-auto transition-[padding] duration-200 ease-out motion-reduce:transition-none ${
                        isOpen ? 'p-3' : 'p-2 lg:p-2'
                    }`}>
                        <ul className="space-y-1">
                            {menuItems.map((item, index) => {
                                const Icon = item.icon;
                                const hasChildren = item.children && item.children.length > 0;
                                const active = isActive(item.href) || isParentActive(item.children);
                                const expanded = hasChildren ? isExpanded(item.label) : false;
                                const itemPopoverId = `sidebar-popover-${item.label.replace(/\s+/g, '-').toLowerCase()}`;
                                
                                return (
                                    <li key={item.href || item.label}>
                                        {hasChildren ? (
                                            <>
                                                <div
                                                    ref={!isOpen && openPopover === item.label ? popoverContainerRef : undefined}
                                                    className="relative"
                                                    onMouseEnter={() => {
                                                        if (!isOpen) {
                                                            setOpenPopover(item.label);
                                                        }
                                                    }}
                                                    onMouseLeave={() => {
                                                        if (!isOpen) {
                                                            setOpenPopover((current) => (current === item.label ? null : current));
                                                        }
                                                    }}
                                                >
                                                    <button
                                                        onClick={() => {
                                                            if (isOpen) {
                                                                toggleMenu(item.label);
                                                                return;
                                                            }

                                                            setOpenPopover((current) => (current === item.label ? null : item.label));
                                                        }}
                                                        className={`group relative flex items-center w-full rounded-xl text-sm transition-colors duration-200 ease-out motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
                                                            isOpen ? 'gap-3 px-3 h-11' : 'justify-center px-0 h-11'
                                                    } ${
                                                        active
                                                                ? 'bg-primary/10 text-primary dark:text-primary ring-1 ring-primary/20'
                                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                    }`}
                                                        aria-expanded={isOpen ? expanded : openPopover === item.label}
                                                        aria-controls={isOpen ? undefined : itemPopoverId}
                                                        aria-haspopup={!isOpen ? 'menu' : undefined}
                                                        aria-label={!isOpen ? item.label : undefined}
                                                >
                                                        <span
                                                            className={`absolute left-0 top-1/2 h-7 -translate-y-1/2 rounded-r ${
                                                                active ? 'w-1 bg-primary' : 'w-0'
                                                            } transition-all duration-200 ease-out motion-reduce:transition-none`}
                                                            aria-hidden="true"
                                                        />

                                                        <Icon size={20} className="flex-shrink-0" />
                                                        <span className={`flex-1 font-medium whitespace-nowrap transition-opacity duration-200 ease-out motion-reduce:transition-none ${
                                                            isOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'
                                                        }`}>
                                                        {item.label}
                                                        </span>

                                                        {isOpen && (
                                                            <span className="transition-transform duration-200 ease-out motion-reduce:transition-none">
                                                                {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                                            </span>
                                                        )}

                                                        {!isOpen && (
                                                            <span className="pointer-events-none absolute left-full top-1/2 ml-3 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-150 ease-out motion-reduce:transition-none">
                                                                <span className="block rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-surface px-2 py-1 text-xs font-medium text-gray-900 dark:text-white shadow-lg whitespace-nowrap">
                                                                    {item.label}
                                                                </span>
                                                            </span>
                                                        )}
                                                    </button>

                                                    {/* Collapsed popover submenu */}
                                                    {!isOpen && openPopover === item.label && item.children && (
                                                        <div
                                                            id={itemPopoverId}
                                                            className="absolute left-full top-0 ml-3 w-64 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-surface shadow-xl overflow-hidden transition-all duration-150 ease-out motion-reduce:transition-none"
                                                            role="menu"
                                                        >
                                                            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                                                                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                                                    {item.label}
                                                                </div>
                                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                    Quick links
                                                                </div>
                                                            </div>

                                                            <ul className="p-2">
                                                                {item.children.map((child) => {
                                                                    const ChildIcon = child.icon;
                                                                    const childActive = isActive(child.href);

                                                                    return (
                                                                        <li key={child.href || child.label}>
                                                                            <Link
                                                                                href={child.href || '#'}
                                                                                onClick={() => setOpenPopover(null)}
                                                                                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors duration-200 ease-out motion-reduce:transition-none ${
                                                                                    childActive
                                                                                        ? 'bg-primary/10 text-primary dark:text-primary'
                                                                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                                                }`}
                                                                                role="menuitem"
                                                                            >
                                                                                <ChildIcon size={18} className="flex-shrink-0" />
                                                                                <span className="font-medium whitespace-nowrap">
                                                                                    {child.label}
                                                                                </span>
                                                                            </Link>
                                                                        </li>
                                                                    );
                                                                })}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>

                                                {expanded && isOpen && item.children && (
                                                    <ul className="mt-1 space-y-1 pl-9">
                                                        {item.children.map((child) => {
                                                            const ChildIcon = child.icon;
                                                            const childActive = isActive(child.href);
                                                            
                                                            return (
                                                                <li key={child.href || child.label}>
                                                                    <Link
                                                                        href={child.href || '#'}
                                                                        className={`flex items-center gap-3 px-3 h-10 rounded-xl text-sm transition-colors duration-200 ease-out motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
                                                                            childActive
                                                                                ? 'bg-primary/10 text-primary dark:text-primary'
                                                                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                                        }`}
                                                                    >
                                                                        <ChildIcon size={18} className="flex-shrink-0" />
                                                                        <span className="font-medium whitespace-nowrap text-sm">
                                                                            {child.label}
                                                                        </span>
                                                                    </Link>
                                                                </li>
                                                            );
                                                        })}
                                                    </ul>
                                                )}
                                            </>
                                        ) : (
                                            <Link
                                                href={item.href || '#'}
                                                className={`group relative flex items-center w-full rounded-xl text-sm transition-colors duration-200 ease-out motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
                                                    isOpen ? 'gap-3 px-3 h-11' : 'justify-center px-0 h-11'
                                                } ${
                                                    active
                                                        ? 'bg-primary/10 text-primary dark:text-primary ring-1 ring-primary/20'
                                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                }`}
                                            >
                                                <span
                                                    className={`absolute left-0 top-1/2 h-7 -translate-y-1/2 rounded-r ${
                                                        active ? 'w-1 bg-primary' : 'w-0'
                                                    } transition-all duration-200 ease-out motion-reduce:transition-none`}
                                                    aria-hidden="true"
                                                />

                                                <Icon size={20} className="flex-shrink-0" />
                                                <span className={`font-medium whitespace-nowrap transition-opacity duration-200 ease-out motion-reduce:transition-none ${
                                                    isOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'
                                                }`}>
                                                    {item.label}
                                                </span>

                                                {!isOpen && (
                                                    <span className="pointer-events-none absolute left-full top-1/2 ml-3 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-150 ease-out motion-reduce:transition-none">
                                                        <span className="block rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-surface px-2 py-1 text-xs font-medium text-gray-900 dark:text-white shadow-lg whitespace-nowrap">
                                                            {item.label}
                                                        </span>
                                                    </span>
                                                )}
                                            </Link>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>
                </div>
            </aside>
        </>
    );
}
