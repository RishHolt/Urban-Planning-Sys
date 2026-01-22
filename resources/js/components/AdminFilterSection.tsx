import { Search, Filter } from 'lucide-react';
import Button from './Button';
import Input from './Input';

interface AdminFilterSectionProps {
    searchValue: string;
    onSearchChange: (value: string) => void;
    onSearch: () => void;
    onReset: () => void;
    showFilters: boolean;
    onToggleFilters: () => void;
    filterContent?: React.ReactNode;
    actionButtons?: React.ReactNode;
    collapsible?: boolean;
    searchPlaceholder?: string;
}

export default function AdminFilterSection({
    searchValue,
    onSearchChange,
    onSearch,
    onReset,
    showFilters,
    onToggleFilters,
    filterContent,
    actionButtons,
    collapsible = true,
    searchPlaceholder = 'Search...',
}: AdminFilterSectionProps) {
    return (
        <div className="bg-white dark:bg-dark-surface shadow-lg rounded-lg mb-6 p-6">
            <div className="flex gap-4 mb-4">
                <div className="flex-1">
                    <Input
                        type="text"
                        name="search"
                        placeholder={searchPlaceholder}
                        value={searchValue}
                        onChange={(e) => onSearchChange(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                onSearch();
                            }
                        }}
                        icon={<Search size={20} />}
                    />
                </div>
                <Button variant="primary" size="md" onClick={onSearch}>
                    Search
                </Button>
                <Button variant="secondary" size="md" onClick={onReset}>
                    Reset
                </Button>
                {collapsible && (
                    <Button
                        variant="outline"
                        size="md"
                        onClick={onToggleFilters}
                        className="flex items-center gap-2"
                    >
                        <Filter size={18} />
                        Filters
                    </Button>
                )}
                {actionButtons && (
                    <div className="flex gap-2">
                        {actionButtons}
                    </div>
                )}
            </div>

            {showFilters && filterContent && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    {filterContent}
                </div>
            )}
        </div>
    );
}
