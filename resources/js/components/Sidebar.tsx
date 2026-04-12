import { useEffect, useRef, useState, useCallback } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    ClipboardList,
    Map,
    ListChecks,
    History,
    BarChart3,
    ChevronDown,
    Home,
    ClipboardCheck,
    FileCheck,
    Tags,
    ShieldCheck,
    Building,
    List,
    Users,
    Building2,
    AlertTriangle,
    FileWarning,
    FileSearch,
    Wrench,
    Eye,
    UserCog,
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
}

const MENU_ITEMS: MenuItem[] = [
    { href: '/admin', icon: LayoutDashboard, label: 'Main Dashboard' },
    {
        icon: ClipboardList,
        label: 'Zoning Clearance',
        children: [
            { href: '/admin/zoning/applications', icon: ListChecks, label: 'Applications' },
            { href: '/admin/zoning/inspections', icon: ClipboardCheck, label: 'Inspections' },
            { href: '/admin/zoning/clearances', icon: FileCheck, label: 'Issued Clearances' },
            { href: '/admin/zoning/classifications', icon: Tags, label: 'Classifications' },
            { href: '/admin/zoning/compliance-rules', icon: ShieldCheck, label: 'Compliance Rules' },
            { href: '/admin/zoning/map', icon: Map, label: 'Zoning Map' },
        ],
    },
    {
        icon: Home,
        label: 'Housing Beneficiary',
        children: [
            { href: '/admin/housing/applications', icon: ListChecks, label: 'Applications & Beneficiaries' },
            { href: '/admin/housing/projects', icon: Building, label: 'Projects & Units' },
            { href: '/admin/housing/waitlist', icon: List, label: 'Waitlist & Allocations' },
        ],
    },
    {
        icon: FileSearch,
        label: 'Subdivision & Building',
        children: [
            { href: '/admin/development-clearance/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { href: '/admin/development-clearance/applications', icon: ListChecks, label: 'Applications' },
            { href: '/admin/subdivision/certificates', icon: FileCheck, label: 'Issued Certificates' },
            { href: '/admin/subdivision/reports', icon: BarChart3, label: 'Reports' },
        ],
    },
    {
        icon: Wrench,
        label: 'Infrastructure Projects',
        children: [
            { href: '/admin/infrastructure/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { href: '/admin/infrastructure/projects', icon: Building2, label: 'Projects' },
            { href: '/admin/infrastructure/contractors', icon: Users, label: 'Contractors' },
            { href: '/admin/infrastructure/reports', icon: BarChart3, label: 'Reports' },
        ],
    },
    {
        icon: Eye,
        label: 'Occupancy Monitoring',
        children: [
            { href: '/admin/occupancy/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { href: '/admin/occupancy/buildings', icon: Building, label: 'Buildings' },
            { href: '/admin/occupancy/units', icon: Home, label: 'Units' },
            { href: '/admin/occupancy/records', icon: ClipboardList, label: 'Occupancy Records' },
            { href: '/admin/occupancy/inspections', icon: ClipboardCheck, label: 'Inspections' },
            { href: '/admin/occupancy/complaints', icon: AlertTriangle, label: 'Complaints' },
            { href: '/admin/occupancy/violations', icon: FileWarning, label: 'Violations' },
            { href: '/admin/occupancy/reports', icon: BarChart3, label: 'Reports' },
        ],
    },
    { href: '/admin/user-management', icon: UserCog, label: 'User Management' },
    { href: '/admin/audit-logs', icon: History, label: 'System Logs' },
    { href: '/admin/reports', icon: BarChart3, label: 'Reports' },
];

const INSPECTOR_MENU: MenuItem[] = [
    { href: '/admin', icon: LayoutDashboard, label: 'Main Dashboard' },
    { href: '/admin/zoning/inspections', icon: ClipboardCheck, label: 'My Inspections' },
];

// Collapsed sidebar inner width = 72px - 2×8px (px-2 nav padding) = 56px = w-14
// Icon wrapper is always w-14 so the icon never moves regardless of open/closed state
const ICON_ZONE = 'flex-shrink-0 w-14 h-10 flex items-center justify-center';

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
    const page = usePage<SharedData>();
    const url = (page.url || '') as string;
    const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
    const [openPopover, setOpenPopover] = useState<string | null>(null);
    const popoverContainerRef = useRef<HTMLDivElement | null>(null);
    const popoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const isActive = useCallback(
        (href?: string): boolean => {
            if (!href) return false;
            if (href === '/admin') return url === '/admin' || url === '/admin/';
            return url.startsWith(href);
        },
        [url],
    );

    const isParentActive = useCallback(
        (children?: MenuItem[]): boolean => children?.some((c) => isActive(c.href)) ?? false,
        [isActive],
    );

    const toggleMenu = useCallback((label: string) => {
        setExpandedMenu((prev) => (prev === label ? null : label));
    }, []);

    const isExpanded = useCallback(
        (label: string): boolean => {
            const item = MENU_ITEMS.find((m) => m.label === label);
            return expandedMenu === label || isParentActive(item?.children);
        },
        [expandedMenu, isParentActive],
    );

    const handlePopoverOpen = useCallback(
        (label: string) => {
            if (popoverTimeoutRef.current) clearTimeout(popoverTimeoutRef.current);
            popoverTimeoutRef.current = setTimeout(() => {
                if (!isOpen) setOpenPopover(label);
            }, 120);
        },
        [isOpen],
    );

    const handlePopoverClose = useCallback(() => {
        if (popoverTimeoutRef.current) clearTimeout(popoverTimeoutRef.current);
        setOpenPopover(null);
    }, []);

    // Auto-expand menu whose children are active
    useEffect(() => {
        const activeItem = MENU_ITEMS.find((item) => item.children && isParentActive(item.children));
        if (activeItem) {
            setExpandedMenu(activeItem.label);
        }
    }, [isParentActive]);

    // Close popover when sidebar opens or url changes
    useEffect(() => {
        if (isOpen) handlePopoverClose();
    }, [isOpen, handlePopoverClose]);

    useEffect(() => {
        handlePopoverClose();
        // Close sidebar on mobile when navigating
        if (isOpen && window.innerWidth < 1024) {
            onToggle();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [url, handlePopoverClose]);

    // Click-outside for popover
    useEffect(() => {
        if (!openPopover) return;
        const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') handlePopoverClose(); };
        const handleMouseDown = (e: MouseEvent) => {
            if (popoverContainerRef.current && !popoverContainerRef.current.contains(e.target as Node))
                handlePopoverClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('mousedown', handleMouseDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('mousedown', handleMouseDown);
        };
    }, [openPopover, handlePopoverClose]);

    useEffect(() => () => { if (popoverTimeoutRef.current) clearTimeout(popoverTimeoutRef.current); }, []);

    const user = page.props.auth.user;
    const isInspector = user?.role === 'inspector';
    const menuItems = isInspector ? INSPECTOR_MENU : MENU_ITEMS;

    return (
        <>
            {/* Mobile overlay */}
            <div
                className={`lg:hidden fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm transition-opacity duration-300 ease-out motion-reduce:transition-none ${
                    isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={onToggle}
                aria-hidden="true"
            />

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 z-[60] h-screen flex flex-col bg-white dark:bg-dark-surface border-r border-gray-200 dark:border-gray-700 overflow-hidden transition-[width,transform] duration-300 ease-out motion-reduce:transition-none ${
                    isOpen ? 'w-64 translate-x-0' : 'w-[72px] -translate-x-full lg:translate-x-0'
                }`}
                aria-label="Main navigation"
            >
                {/* Brand header — px-2 matches the nav ul padding so icon aligns perfectly */}
                <div className="flex-shrink-0 flex items-center h-16 px-2 border-b border-gray-200 dark:border-gray-700 overflow-hidden">
                    <span className="flex-shrink-0 w-14 h-16 flex items-center justify-center" aria-hidden="true">
                        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 dark:bg-primary/20">
                            <LayoutDashboard size={16} className="text-primary" />
                        </span>
                    </span>
                    <span
                        className={`font-semibold text-gray-900 dark:text-white text-sm whitespace-nowrap overflow-hidden transition-[max-width,opacity] duration-300 ease-out motion-reduce:transition-none ${
                            isOpen ? 'max-w-[160px] opacity-100' : 'max-w-0 opacity-0'
                        }`}
                    >
                        Admin Panel
                    </span>
                </div>

                {/* Navigation */}
                <nav
                    className="flex-1 overflow-y-auto overscroll-contain py-3 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent"
                    aria-label="Main navigation"
                >
                    <ul className="px-2 space-y-0.5" role="menubar">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const hasChildren = !!item.children?.length;
                            const active = isActive(item.href) || isParentActive(item.children);
                            const expanded = hasChildren ? isExpanded(item.label) : false;

                            return (
                                <li key={item.href ?? item.label} role="none">
                                    {hasChildren ? (
                                        <div
                                            className="relative"
                                            ref={!isOpen && openPopover === item.label ? popoverContainerRef : undefined}
                                            onMouseEnter={() => handlePopoverOpen(item.label)}
                                            onMouseLeave={handlePopoverClose}
                                        >
                                            {/* Parent button */}
                                            <button
                                                onClick={() =>
                                                    isOpen
                                                        ? toggleMenu(item.label)
                                                        : setOpenPopover((c) => (c === item.label ? null : item.label))
                                                }
                                                className={`group flex items-center w-full h-10 rounded-lg text-sm font-medium transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                                                    active
                                                        ? 'bg-primary/10 text-primary dark:text-primary'
                                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                                                }`}
                                                aria-expanded={isOpen ? expanded : openPopover === item.label}
                                                role="menuitem"
                                            >
                                                {/* Fixed icon zone — never moves */}
                                                <span className={ICON_ZONE} aria-hidden="true">
                                                    <Icon size={18} />
                                                </span>

                                                {/* Label */}
                                                <span
                                                    className={`flex-1 text-left whitespace-nowrap overflow-hidden transition-[max-width,opacity] duration-300 ease-out motion-reduce:transition-none ${
                                                        isOpen ? 'max-w-[140px] opacity-100' : 'max-w-0 opacity-0'
                                                    }`}
                                                >
                                                    {item.label}
                                                </span>

                                                {/* Chevron */}
                                                <span
                                                    className={`flex-shrink-0 overflow-hidden transition-[max-width,opacity,transform] duration-300 ease-out motion-reduce:transition-none mr-3 ${
                                                        isOpen ? 'max-w-[16px] opacity-100' : 'max-w-0 opacity-0'
                                                    } ${expanded ? 'rotate-180' : 'rotate-0'}`}
                                                    aria-hidden="true"
                                                >
                                                    <ChevronDown size={14} />
                                                </span>

                                                {/* Hover tooltip (collapsed only) */}
                                                {!isOpen && (
                                                    <span
                                                        className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                                                        aria-hidden="true"
                                                    >
                                                        <span className="block bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs font-medium px-2.5 py-1.5 rounded-md shadow-lg whitespace-nowrap">
                                                            {item.label}
                                                        </span>
                                                    </span>
                                                )}
                                            </button>

                                            {/* Collapsed flyout popover */}
                                            {!isOpen && openPopover === item.label && item.children && (
                                                <div
                                                    className="absolute top-0 left-full ml-2 z-50 w-52 bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden"
                                                    role="menu"
                                                    aria-label={`${item.label} submenu`}
                                                >
                                                    <div className="px-3 py-2.5 border-b border-gray-100 dark:border-gray-700/60">
                                                        <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                                                            {item.label}
                                                        </p>
                                                    </div>
                                                    <ul className="p-1.5 max-h-[calc(100vh-8rem)] overflow-y-auto">
                                                        {item.children.map((child) => {
                                                            const ChildIcon = child.icon;
                                                            const childActive = isActive(child.href);
                                                            return (
                                                                <li key={child.href ?? child.label} role="none">
                                                                    <Link
                                                                        href={child.href ?? '#'}
                                                                        onClick={handlePopoverClose}
                                                                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors duration-100 ${
                                                                            childActive
                                                                                ? 'bg-primary/10 text-primary dark:text-primary font-medium'
                                                                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60'
                                                                        }`}
                                                                        role="menuitem"
                                                                    >
                                                                        <ChildIcon size={15} className="flex-shrink-0" aria-hidden="true" />
                                                                        <span className="whitespace-nowrap">{child.label}</span>
                                                                    </Link>
                                                                </li>
                                                            );
                                                        })}
                                                    </ul>
                                                </div>
                                            )}

                                            {/* Expanded submenu — smooth grid-rows animation */}
                                            <div
                                                className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${
                                                    expanded && isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                                                }`}
                                            >
                                                <ul className="overflow-hidden" role="menu" aria-label={`${item.label} submenu`}>
                                                    <li className="pt-0.5 pb-1">
                                                        {item.children?.map((child) => {
                                                            const ChildIcon = child.icon;
                                                            const childActive = isActive(child.href);
                                                            return (
                                                                <Link
                                                                    key={child.href ?? child.label}
                                                                    href={child.href ?? '#'}
                                                                    className={`flex items-center gap-2.5 h-9 pl-14 pr-3 rounded-lg text-sm transition-colors duration-100 motion-reduce:transition-none ${
                                                                        childActive
                                                                            ? 'text-primary dark:text-primary bg-primary/5 font-medium'
                                                                            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                                                                    }`}
                                                                    role="menuitem"
                                                                >
                                                                    <ChildIcon size={15} className="flex-shrink-0" aria-hidden="true" />
                                                                    <span className="whitespace-nowrap">{child.label}</span>
                                                                </Link>
                                                            );
                                                        })}
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    ) : (
                                        /* Leaf item */
                                        <Link
                                            href={item.href ?? '#'}
                                            className={`group relative flex items-center w-full h-10 rounded-lg text-sm font-medium transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                                                active
                                                    ? 'bg-primary/10 text-primary dark:text-primary'
                                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                                            }`}
                                            role="menuitem"
                                        >
                                            {/* Fixed icon zone */}
                                            <span className={ICON_ZONE} aria-hidden="true">
                                                <Icon size={18} />
                                            </span>

                                            {/* Label */}
                                            <span
                                                className={`flex-1 whitespace-nowrap overflow-hidden transition-[max-width,opacity] duration-300 ease-out motion-reduce:transition-none ${
                                                    isOpen ? 'max-w-[200px] opacity-100' : 'max-w-0 opacity-0'
                                                }`}
                                            >
                                                {item.label}
                                            </span>

                                            {/* Hover tooltip (collapsed only) */}
                                            {!isOpen && (
                                                <span
                                                    className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                                                    aria-hidden="true"
                                                >
                                                    <span className="block bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs font-medium px-2.5 py-1.5 rounded-md shadow-lg whitespace-nowrap">
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
            </aside>
        </>
    );
}
