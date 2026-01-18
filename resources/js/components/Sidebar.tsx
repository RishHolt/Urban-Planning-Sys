import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Menu, X, LayoutDashboard, ClipboardList, Map, ListChecks, History, BarChart3, ChevronDown, ChevronRight, FileText } from 'lucide-react';
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

    const menuItems: MenuItem[] = [
        { href: '/admin', icon: LayoutDashboard, label: 'Main Dashboard' },
        {
            icon: ClipboardList,
            label: 'Zoning Clearance',
            children: [
                { href: '/admin/zoning/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
                { href: '/admin/zoning/applications', icon: ListChecks, label: 'Applications' },
                { href: '/admin/zoning/map', icon: Map, label: 'Zoning Map' },
                { href: '/admin/zoning/clup', icon: FileText, label: 'CLUP' },
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

    return (
        <>
            {/* Overlay for mobile */}
            <div
                className={`lg:hidden z-40 fixed inset-0 bg-black/50 transition-opacity duration-300 ease-in-out ${
                    isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={onToggle}
                aria-hidden="true"
            />

            {/* Mobile Toggle Button - Always visible on mobile when sidebar is closed */}
            {!isOpen && (
                <button
                    onClick={onToggle}
                    className="lg:hidden top-4 left-4 z-50 fixed bg-white hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-dark-surface shadow-lg p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-300 transition-colors"
                    aria-label="Open sidebar"
                >
                    <Menu size={20} />
                </button>
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 z-40 h-screen bg-white dark:bg-dark-surface border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-out ${
                    isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                } ${isOpen ? 'w-64' : 'w-0 lg:w-20'} overflow-hidden`}
            >
                <div className="flex flex-col h-full">
                    {/* Toggle Button */}
                    <div className={`flex items-center h-16 border-accent border-b-2 shadow-md transition-all duration-300 ease-out ${
                        isOpen ? 'justify-between px-4' : 'justify-center lg:justify-center px-0'
                    }`}>
                        <div className={`flex items-center transition-all duration-300 ease-out ${
                            isOpen ? 'w-auto opacity-100' : 'w-0 opacity-0 lg:w-0 lg:opacity-0 overflow-hidden'
                        }`}
                        style={{
                            transitionDelay: isOpen ? '100ms' : '0ms'
                        }}>
                            <h2 className="font-bold text-gray-800 dark:text-white text-lg whitespace-nowrap">
                                Admin Menu
                            </h2>
                        </div>
                        <button
                            onClick={onToggle}
                            className="flex-shrink-0 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-lg text-gray-600 dark:text-gray-300 transition-all duration-200 ease-out"
                            aria-label="Toggle sidebar"
                        >
                            <span className="transition-transform duration-300 ease-out">
                                {isOpen ? <X size={20} /> : <Menu size={20} />}
                            </span>
                        </button>
                    </div>

                    {/* Navigation Items */}
                    <nav className={`flex-1 overflow-y-auto transition-all duration-300 ease-out ${
                        isOpen ? 'p-4' : 'p-2 lg:p-2'
                    }`}>
                        <ul className="space-y-2">
                            {menuItems.map((item, index) => {
                                const Icon = item.icon;
                                const hasChildren = item.children && item.children.length > 0;
                                const active = isActive(item.href) || isParentActive(item.children);
                                const expanded = hasChildren ? isExpanded(item.label) : false;
                                const delay = isOpen ? index * 20 : 0;
                                
                                return (
                                    <li key={item.href || item.label}>
                                        {hasChildren ? (
                                            <>
                                                <button
                                                    onClick={() => toggleMenu(item.label)}
                                                    className={`flex items-center w-full py-3 rounded-lg transition-all duration-300 ease-out ${
                                                        isOpen ? 'gap-3 px-4' : 'justify-center lg:justify-center px-0'
                                                    } ${
                                                        active
                                                            ? 'bg-primary text-white dark:bg-primary'
                                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                    }`}
                                                    style={{
                                                        transitionDelay: `${delay}ms`
                                                    }}
                                                    title={!isOpen ? item.label : undefined}
                                                >
                                                    <Icon size={20} className="flex-shrink-0 transition-transform duration-300 ease-out" />
                                                    <span className={`flex-1 font-medium whitespace-nowrap transition-all duration-300 ease-out ${
                                                        isOpen 
                                                            ? 'opacity-100 max-w-full w-auto' 
                                                            : 'opacity-0 max-w-0 w-0 lg:opacity-0 lg:max-w-0 lg:w-0 overflow-hidden'
                                                    }`}
                                                    style={{
                                                        transitionDelay: isOpen ? `${delay + 50}ms` : '0ms'
                                                    }}>
                                                        {item.label}
                                                    </span>
                                                    {isOpen && hasChildren && (
                                                        <span className="transition-transform duration-300 ease-out">
                                                            {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                                        </span>
                                                    )}
                                                </button>
                                                {expanded && isOpen && item.children && (
                                                    <ul className="ml-4 mt-1 space-y-1">
                                                        {item.children.map((child, childIndex) => {
                                                            const ChildIcon = child.icon;
                                                            const childActive = isActive(child.href);
                                                            const childDelay = delay + (childIndex + 1) * 20;
                                                            
                                                            return (
                                                                <li key={child.href || child.label}>
                                                                    <Link
                                                                        href={child.href || '#'}
                                                                        className={`flex items-center py-2 rounded-lg transition-all duration-300 ease-out gap-3 px-4 ${
                                                                            childActive
                                                                                ? 'bg-primary/20 text-primary dark:text-primary'
                                                                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                                        }`}
                                                                        style={{
                                                                            transitionDelay: `${childDelay}ms`
                                                                        }}
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
                                                className={`flex items-center py-3 rounded-lg transition-all duration-300 ease-out ${
                                                    isOpen ? 'gap-3 px-4' : 'justify-center lg:justify-center px-0'
                                                } ${
                                                    active
                                                        ? 'bg-primary text-white dark:bg-primary'
                                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                }`}
                                                style={{
                                                    transitionDelay: `${delay}ms`
                                                }}
                                                title={!isOpen ? item.label : undefined}
                                            >
                                                <Icon size={20} className="flex-shrink-0 transition-transform duration-300 ease-out" />
                                                <span className={`font-medium whitespace-nowrap transition-all duration-300 ease-out ${
                                                    isOpen 
                                                        ? 'opacity-100 max-w-full w-auto' 
                                                        : 'opacity-0 max-w-0 w-0 lg:opacity-0 lg:max-w-0 lg:w-0 overflow-hidden'
                                                }`}
                                                style={{
                                                    transitionDelay: isOpen ? `${delay + 50}ms` : '0ms'
                                                }}>
                                                    {item.label}
                                                </span>
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
