import { useEffect, useRef, useState, useCallback } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    Menu,
    X,
    LayoutDashboard,
    ClipboardList,
    Map,
    ListChecks,
    History,
    BarChart3,
    ChevronDown,
    ChevronRight,
    Home,
    ClipboardCheck,
    FileCheck,
    Receipt,
    Tags,
    Calendar,
    Building,
    List,
    Key,
    Shield,
    Users,
    Building2,
    AlertTriangle,
    FileWarning,
    CheckSquare,
    FileSearch,
    Wrench,
} from 'lucide-react';
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
    badge?: string | number;
}

// Menu items configuration
const MENU_ITEMS: MenuItem[] = [
    { href: '/admin', icon: LayoutDashboard, label: 'Main Dashboard' },
    {
        icon: ClipboardList,
        label: 'Zoning Administration',
        children: [
            { href: '/admin/zoning/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { href: '/admin/zoning/applications', icon: ListChecks, label: 'Applications' },
            { href: '/inspections', icon: ClipboardCheck, label: 'Inspections' },
            { href: '/clearances', icon: FileCheck, label: 'Issued Clearances' },
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
    {
        icon: FileSearch,
        label: 'Subdivision & Building Review',
        children: [
            { href: '/admin/subdivision/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { href: '/admin/subdivision/applications', icon: ListChecks, label: 'Subdivision Applications' },
            { href: '/admin/building/reviews', icon: FileSearch, label: 'Building Reviews' },
            { href: '/admin/subdivision/reports', icon: BarChart3, label: 'Reports' },
        ],
    },
    {
        icon: Building2,
        label: 'Occupancy Monitoring',
        children: [
            { href: '/admin/occupancy/buildings', icon: Building2, label: 'Buildings' },
            { href: '/admin/occupancy/inspections', icon: ClipboardCheck, label: 'Inspections' },
            { href: '/admin/occupancy/complaints', icon: AlertTriangle, label: 'Complaints' },
            { href: '/admin/occupancy/violations', icon: FileWarning, label: 'Violations' },
            { href: '/admin/occupancy/reports', icon: CheckSquare, label: 'Compliance Reports' },
        ],
    },
    {
        icon: Wrench,
        label: 'Infrastructure Projects',
        children: [
            { href: '/admin/infrastructure/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { href: '/admin/infrastructure/projects', icon: Building2, label: 'Projects' },
            { href: '/admin/infrastructure/reports', icon: BarChart3, label: 'Reports' },
        ],
    },
    { href: '/admin/audit-logs', icon: History, label: 'Audit Logs' },
    { href: '/admin/reports', icon: BarChart3, label: 'Reports' },
];

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
    const page = usePage<SharedData>();
    const url = (page.url || '') as string;
    const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());
    const [openPopover, setOpenPopover] = useState<string | null>(null);
    const popoverContainerRef = useRef<HTMLDivElement | null>(null);
    const popoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Check if a menu item is active based on current URL
    const isActive = useCallback(
        (href?: string): boolean => {
            if (!href) {
                return false;
            }
            if (href === '/admin') {
                return url === '/admin' || url === '/admin/';
            }
            return url.startsWith(href);
        },
        [url]
    );

    // Check if any child menu item is active
    const isParentActive = useCallback(
        (children?: MenuItem[]): boolean => {
            if (!children) {
                return false;
            }
            return children.some((child) => isActive(child.href));
        },
        [isActive]
    );

    // Toggle menu expansion
    const toggleMenu = useCallback((label: string): void => {
        setExpandedMenus((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(label)) {
                newSet.delete(label);
            } else {
                newSet.add(label);
            }
            return newSet;
        });
    }, []);

    // Check if a menu is expanded
    const isExpanded = useCallback(
        (label: string): boolean => {
            const menuItem = MENU_ITEMS.find((item) => item.label === label);
            return expandedMenus.has(label) || isParentActive(menuItem?.children);
        },
        [expandedMenus, isParentActive]
    );

    // Handle popover open with debounce
    const handlePopoverOpen = useCallback((label: string): void => {
        if (popoverTimeoutRef.current) {
            clearTimeout(popoverTimeoutRef.current);
        }
        popoverTimeoutRef.current = setTimeout(() => {
            if (!isOpen) {
                setOpenPopover(label);
            }
        }, 150);
    }, [isOpen]);

    // Handle popover close
    const handlePopoverClose = useCallback((): void => {
        if (popoverTimeoutRef.current) {
            clearTimeout(popoverTimeoutRef.current);
        }
        setOpenPopover(null);
    }, []);

    // Auto-expand menus with active children on mount
    useEffect(() => {
        const activeMenus = new Set<string>();
        MENU_ITEMS.forEach((item) => {
            if (item.children && isParentActive(item.children)) {
                activeMenus.add(item.label);
            }
        });
        if (activeMenus.size > 0) {
            setExpandedMenus(activeMenus);
        }
    }, [isParentActive]);

    // Handle popover interactions
    useEffect(() => {
        if (!openPopover) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent): void => {
            if (event.key === 'Escape') {
                handlePopoverClose();
            }
        };

        const handleMouseDown = (event: MouseEvent): void => {
            const container = popoverContainerRef.current;
            if (!container || !container.contains(event.target as Node)) {
                handlePopoverClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('mousedown', handleMouseDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('mousedown', handleMouseDown);
        };
    }, [openPopover, handlePopoverClose]);

    // Close popover when sidebar opens
    useEffect(() => {
        if (isOpen) {
            handlePopoverClose();
        }
    }, [isOpen, handlePopoverClose]);

    // Close popover on route change
    useEffect(() => {
        handlePopoverClose();
    }, [url, handlePopoverClose]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (popoverTimeoutRef.current) {
                clearTimeout(popoverTimeoutRef.current);
            }
        };
    }, []);

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={`lg:hidden z-40 fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-out motion-reduce:transition-none ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={onToggle}
                onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                        onToggle();
                    }
                }}
                aria-hidden="true"
            />

            {/* Mobile Toggle Button */}
            {!isOpen && (
                <button
                    onClick={onToggle}
                    className="lg:hidden top-4 left-4 z-50 fixed bg-white hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-dark-surface shadow-lg hover:shadow-xl p-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 text-gray-700 dark:text-gray-300 transition-all motion-reduce:transition-none duration-200 ease-out"
                    aria-label="Open sidebar"
                    aria-expanded="false"
                >
                    <Menu size={20} aria-hidden="true" />
                </button>
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 z-40 h-screen bg-white dark:bg-dark-surface border-r border-gray-200 dark:border-gray-700 shadow-lg transition-[transform,width] duration-300 ease-out motion-reduce:transition-none ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    } ${isOpen ? 'w-64' : 'w-0 lg:w-20'} overflow-hidden`}
                aria-label="Main navigation"
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div
                        className={`flex items-center h-16 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 transition-[padding,justify-content] duration-300 ease-out motion-reduce:transition-none ${isOpen ? 'justify-between px-4' : 'justify-center px-0'
                            }`}
                    >
                        <div
                            className={`flex items-center gap-2 transition-all duration-300 ease-out motion-reduce:transition-none ${isOpen ? 'w-auto opacity-100' : 'w-0 opacity-0 lg:w-0 lg:opacity-0 overflow-hidden'
                                }`}
                        >
                            <div className="flex justify-center items-center bg-primary/10 dark:bg-primary/20 rounded-lg w-8 h-8">
                                <LayoutDashboard size={18} className="text-primary" aria-hidden="true" />
                            </div>
                            <h2 className="font-semibold text-gray-900 dark:text-white text-base whitespace-nowrap">
                                Admin Panel
                            </h2>
                        </div>
                        <button
                            onClick={onToggle}
                            className="flex-shrink-0 hover:bg-gray-100 active:bg-gray-200 dark:hover:bg-gray-700 dark:active:bg-gray-600 p-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 text-gray-700 dark:text-gray-300 transition-all motion-reduce:transition-none duration-200 ease-out"
                            aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                            aria-expanded={isOpen}
                        >
                            <span className="transition-transform motion-reduce:transition-none duration-200 ease-out">
                                {isOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
                            </span>
                        </button>
                    </div>

                    {/* Navigation Items */}
                    <nav
                        className={`flex-1 overflow-y-auto overscroll-contain transition-[padding] duration-300 ease-out motion-reduce:transition-none scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent hover:scrollbar-thumb-primary/30 ${isOpen ? 'px-3 py-4' : 'px-2 py-3 lg:px-2 lg:py-3'
                            }`}
                        aria-label="Main navigation"
                    >
                        <ul className="space-y-1.5" role="menubar">
                            {MENU_ITEMS.map((item) => {
                                const Icon = item.icon;
                                const hasChildren = item.children && item.children.length > 0;
                                const active = isActive(item.href) || isParentActive(item.children);
                                const expanded = hasChildren ? isExpanded(item.label) : false;
                                const itemPopoverId = `sidebar-popover-${item.label.replace(/\s+/g, '-').toLowerCase()}`;

                                return (
                                    <li key={item.href || item.label} role="none">
                                        {hasChildren ? (
                                            <>
                                                <div
                                                    ref={!isOpen && openPopover === item.label ? popoverContainerRef : undefined}
                                                    className="relative"
                                                    onMouseEnter={() => handlePopoverOpen(item.label)}
                                                    onMouseLeave={handlePopoverClose}
                                                >
                                                    <button
                                                        onClick={() => {
                                                            if (isOpen) {
                                                                toggleMenu(item.label);
                                                            } else {
                                                                setOpenPopover((current) => (current === item.label ? null : item.label));
                                                            }
                                                        }}
                                                        className={`group relative flex items-center w-full rounded-xl text-sm font-medium transition-all duration-200 ease-out motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 ${isOpen ? 'gap-3 px-3 h-11' : 'justify-center px-0 h-11'
                                                            } ${active
                                                                ? 'bg-primary/10 text-primary dark:text-primary shadow-sm ring-1 ring-primary/20 dark:ring-primary/30'
                                                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 active:bg-gray-200 dark:active:bg-gray-600'
                                                            }`}
                                                        aria-expanded={isOpen ? expanded : openPopover === item.label}
                                                        aria-controls={isOpen ? undefined : itemPopoverId}
                                                        aria-haspopup={!isOpen ? 'menu' : undefined}
                                                        aria-label={!isOpen ? item.label : undefined}
                                                        role="menuitem"
                                                    >
                                                        <span
                                                            className={`absolute left-0 top-1/2 h-8 -translate-y-1/2 rounded-r-full ${active ? 'w-1 bg-primary shadow-sm' : 'w-0'
                                                                } transition-all duration-300 ease-out motion-reduce:transition-none`}
                                                            aria-hidden="true"
                                                        />

                                                        <Icon
                                                            size={20}
                                                            className={`flex-shrink-0 transition-transform duration-200 ease-out motion-reduce:transition-none ${active ? 'scale-110' : 'group-hover:scale-105'
                                                                }`}
                                                            aria-hidden="true"
                                                        />
                                                        <span
                                                            className={`flex-1 text-left whitespace-nowrap transition-opacity duration-300 ease-out motion-reduce:transition-none ${isOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'
                                                                }`}
                                                        >
                                                            {item.label}
                                                        </span>

                                                        {isOpen && (
                                                            <span
                                                                className={`transition-transform motion-reduce:transition-none duration-200 ease-out ${expanded ? 'rotate-0' : '-rotate-90'
                                                                    }`}
                                                                aria-hidden="true"
                                                            >
                                                                <ChevronDown size={16} />
                                                            </span>
                                                        )}

                                                        {!isOpen && (
                                                            <span
                                                                className="top-1/2 left-full z-50 absolute opacity-0 group-focus-visible:opacity-100 group-hover:opacity-100 ml-3 transition-opacity motion-reduce:transition-none -translate-y-1/2 duration-200 ease-out pointer-events-none"
                                                                aria-hidden="true"
                                                            >
                                                                <span className="block bg-white dark:bg-dark-surface shadow-xl backdrop-blur-sm px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg font-medium text-gray-900 dark:text-white text-xs whitespace-nowrap">
                                                                    {item.label}
                                                                </span>
                                                            </span>
                                                        )}
                                                    </button>

                                                    {/* Collapsed Popover Submenu */}
                                                    {!isOpen && openPopover === item.label && item.children && (
                                                        <div
                                                            id={itemPopoverId}
                                                            className="top-0 left-full z-50 absolute bg-white dark:bg-dark-surface shadow-2xl backdrop-blur-sm ml-3 border border-gray-200 dark:border-gray-700 rounded-xl w-64 overflow-hidden transition-all motion-reduce:transition-none duration-200 ease-out"
                                                            role="menu"
                                                            aria-label={`${item.label} submenu`}
                                                        >
                                                            <div className="bg-gray-50/50 dark:bg-gray-800/50 px-4 py-3 border-gray-200 dark:border-gray-700 border-b">
                                                                <div className="flex items-center gap-2">
                                                                    <Icon size={18} className="flex-shrink-0 text-primary" aria-hidden="true" />
                                                                    <div className="font-semibold text-gray-900 dark:text-white text-sm">
                                                                        {item.label}
                                                                    </div>
                                                                </div>
                                                                <div className="mt-0.5 ml-6 text-gray-500 dark:text-gray-400 text-xs">
                                                                    {item.children.length} items
                                                                </div>
                                                            </div>

                                                            <ul className="p-2 max-h-[calc(100vh-8rem)] overflow-y-auto">
                                                                {item.children.map((child) => {
                                                                    const ChildIcon = child.icon;
                                                                    const childActive = isActive(child.href);

                                                                    return (
                                                                        <li key={child.href || child.label} role="none">
                                                                            <Link
                                                                                href={child.href || '#'}
                                                                                onClick={handlePopoverClose}
                                                                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ease-out motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${childActive
                                                                                    ? 'bg-primary/10 text-primary dark:text-primary shadow-sm ring-1 ring-primary/20'
                                                                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 active:bg-gray-200 dark:active:bg-gray-600'
                                                                                    }`}
                                                                                role="menuitem"
                                                                            >
                                                                                <ChildIcon
                                                                                    size={18}
                                                                                    className={`flex-shrink-0 transition-transform duration-200 ease-out motion-reduce:transition-none ${childActive ? 'scale-110' : ''
                                                                                        }`}
                                                                                    aria-hidden="true"
                                                                                />
                                                                                <span className="whitespace-nowrap">{child.label}</span>
                                                                            </Link>
                                                                        </li>
                                                                    );
                                                                })}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Expanded Submenu */}
                                                {expanded && isOpen && item.children && (
                                                    <ul
                                                        className="space-y-1 mt-1.5 ml-3 pl-6 border-gray-200 dark:border-gray-700 border-l-2"
                                                        role="menu"
                                                        aria-label={`${item.label} submenu`}
                                                    >
                                                        {item.children.map((child) => {
                                                            const ChildIcon = child.icon;
                                                            const childActive = isActive(child.href);

                                                            return (
                                                                <li key={child.href || child.label} role="none">
                                                                    <Link
                                                                        href={child.href || '#'}
                                                                        className={`flex items-center gap-3 px-3 h-10 rounded-lg text-sm font-medium transition-all duration-200 ease-out motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${childActive
                                                                            ? 'bg-primary/10 text-primary dark:text-primary shadow-sm ring-1 ring-primary/20'
                                                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 active:bg-gray-200 dark:active:bg-gray-600'
                                                                            }`}
                                                                        role="menuitem"
                                                                    >
                                                                        <ChildIcon
                                                                            size={18}
                                                                            className={`flex-shrink-0 transition-transform duration-200 ease-out motion-reduce:transition-none ${childActive ? 'scale-110' : ''
                                                                                }`}
                                                                            aria-hidden="true"
                                                                        />
                                                                        <span className="whitespace-nowrap">{child.label}</span>
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
                                                className={`group relative flex items-center w-full rounded-xl text-sm font-medium transition-all duration-200 ease-out motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 ${isOpen ? 'gap-3 px-3 h-11' : 'justify-center px-0 h-11'
                                                    } ${active
                                                        ? 'bg-primary/10 text-primary dark:text-primary shadow-sm ring-1 ring-primary/20 dark:ring-primary/30'
                                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 active:bg-gray-200 dark:active:bg-gray-600'
                                                    }`}
                                                role="menuitem"
                                            >
                                                <span
                                                    className={`absolute left-0 top-1/2 h-8 -translate-y-1/2 rounded-r-full ${active ? 'w-1 bg-primary shadow-sm' : 'w-0'
                                                        } transition-all duration-300 ease-out motion-reduce:transition-none`}
                                                    aria-hidden="true"
                                                />

                                                <Icon
                                                    size={20}
                                                    className={`flex-shrink-0 transition-transform duration-200 ease-out motion-reduce:transition-none ${active ? 'scale-110' : 'group-hover:scale-105'
                                                        }`}
                                                    aria-hidden="true"
                                                />
                                                <span
                                                    className={`whitespace-nowrap transition-opacity duration-300 ease-out motion-reduce:transition-none ${isOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'
                                                        }`}
                                                >
                                                    {item.label}
                                                </span>

                                                {!isOpen && (
                                                    <span
                                                        className="top-1/2 left-full z-50 absolute opacity-0 group-focus-visible:opacity-100 group-hover:opacity-100 ml-3 transition-opacity motion-reduce:transition-none -translate-y-1/2 duration-200 ease-out pointer-events-none"
                                                        aria-hidden="true"
                                                    >
                                                        <span className="block bg-white dark:bg-dark-surface shadow-xl backdrop-blur-sm px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg font-medium text-gray-900 dark:text-white text-xs whitespace-nowrap">
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
