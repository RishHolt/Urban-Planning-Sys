import { useState, useEffect, useRef } from 'react';
import { Search, SlidersHorizontal, ChevronDown, Loader2 } from 'lucide-react';
import Button from './Button';
import Input from './Input';

interface AdminFilterSectionProps {
    searchValue: string;
    onSearchChange: (value: string) => void;
    onSearch: () => void;
    onReset: () => void;
    filterContent?: React.ReactNode;
    actionButtons?: React.ReactNode;
    searchPlaceholder?: string;
    activeFilterCount?: number;
    /** Pass the entire form data object — triggers debounced search on any change */
    filterData?: Record<string, unknown>;
    debounceMs?: number;
}

export default function AdminFilterSection({
    searchValue,
    onSearchChange,
    onSearch,
    onReset,
    filterContent,
    actionButtons,
    searchPlaceholder = 'Search...',
    activeFilterCount = 0,
    filterData,
    debounceMs = 400,
}: AdminFilterSectionProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const isFirstRender = useRef(true);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Auto-open if filters are active on load
    useEffect(() => {
        if (activeFilterCount > 0) setIsOpen(true);
    }, []);

    // Debounced real-time search on any filterData change
    useEffect(() => {
        if (!filterData) return;

        // Skip initial mount
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        setIsSearching(true);

        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            onSearch();
            setIsSearching(false);
        }, debounceMs);

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [JSON.stringify(filterData)]);

    return (
        <div className="bg-white dark:bg-dark-surface shadow-lg rounded-lg mb-6 p-6">
            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Input
                        type="text"
                        name="search"
                        placeholder={searchPlaceholder}
                        value={searchValue}
                        onChange={(e) => onSearchChange(e.target.value)}
                        icon={
                            isSearching
                                ? <Loader2 size={20} className="animate-spin text-primary" />
                                : <Search size={20} />
                        }
                    />
                </div>
                <Button variant="secondary" size="md" onClick={onReset}>
                    Reset
                </Button>
                {filterContent && (
                    <button
                        type="button"
                        onClick={() => setIsOpen((o) => !o)}
                        className="relative flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-surface text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium"
                    >
                        <SlidersHorizontal size={16} />
                        Filters
                        {activeFilterCount > 0 && (
                            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white text-xs font-bold">
                                {activeFilterCount}
                            </span>
                        )}
                        <ChevronDown
                            size={16}
                            className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                        />
                    </button>
                )}
                {actionButtons && (
                    <div className="flex gap-2">{actionButtons}</div>
                )}
            </div>

            {/* Animated filter panel */}
            {filterContent && (
                <div
                    className={`grid transition-all duration-300 ease-in-out ${
                        isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                    }`}
                >
                    <div className="overflow-hidden">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            {filterContent}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
