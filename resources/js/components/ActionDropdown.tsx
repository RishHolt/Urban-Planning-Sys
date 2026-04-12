import { useState, useRef, useEffect, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { MoreVertical } from 'lucide-react';

interface ActionItem {
    label: string | ReactNode;
    icon?: ReactNode;
    onClick?: () => void;
    className?: string;
    show?: boolean;
}

interface ActionDropdownProps {
    actions: ActionItem[];
    align?: 'left' | 'right';
}

export default function ActionDropdown({ actions, align = 'right' }: ActionDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const triggerRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const visibleActions = actions.filter(action => action.show !== false);

    const updateCoords = () => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            // Default to right alignment logic
            const left = align === 'right' 
                ? rect.left + rect.width - 192 // 192px is w-48
                : rect.left;
            
            setCoords({
                top: rect.top + rect.height + window.scrollY,
                left: left + window.scrollX,
            });
        }
    };

    const toggleDropdown = () => {
        if (!isOpen) {
            updateCoords();
        }
        setIsOpen(!isOpen);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                triggerRef.current && !triggerRef.current.contains(event.target as Node) &&
                dropdownRef.current && !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        const handleScrollOrResize = () => {
            if (isOpen) setIsOpen(false);
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            window.addEventListener('scroll', handleScrollOrResize, true);
            window.addEventListener('resize', handleScrollOrResize);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('scroll', handleScrollOrResize, true);
            window.removeEventListener('resize', handleScrollOrResize);
        };
    }, [isOpen]);

    if (visibleActions.length === 0) return null;

    const menuContent = (
        <div 
            ref={dropdownRef}
            style={{ 
                position: 'absolute', 
                top: `${coords.top}px`, 
                left: `${coords.left}px`,
                width: '12rem', // w-48
            }}
            className="z-[9999] mt-1 rounded-lg bg-white dark:bg-dark-surface shadow-xl border border-gray-200 dark:border-gray-700 ring-1 ring-black ring-opacity-5 focus:outline-none transition-all duration-150 origin-top-right animate-in fade-in zoom-in-95"
            role="menu"
            aria-orientation="vertical"
        >
            <div className="py-1" role="none">
                {visibleActions.map((action, index) => (
                    <button
                        key={index}
                        onClick={() => {
                            if (action.onClick) action.onClick();
                            setIsOpen(false);
                        }}
                        className={`flex items-center w-full px-4 py-2 text-sm text-left transition-colors duration-150 ${
                            action.className || 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                        role="menuitem"
                    >
                        {action.icon && <span className="mr-3 text-gray-400 dark:text-gray-500">{action.icon}</span>}
                        {action.label}
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <>
            <button
                ref={triggerRef}
                type="button"
                onClick={toggleDropdown}
                className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-all focus:outline-none focus:ring-2 focus:ring-primary/20"
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                <MoreVertical size={18} />
            </button>

            {isOpen && createPortal(menuContent, document.body)}
        </>
    );
}
