import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';

interface Option {
    value: string;
    label: string;
}

interface SearchableSelectProps {
    id?: string;
    label?: string;
    value: string;
    onChange: (value: string) => void;
    options: Option[];
    placeholder?: string;
    error?: string;
    required?: boolean;
    className?: string;
}

export default function SearchableSelect({
    id,
    label,
    value,
    onChange,
    options,
    placeholder = 'Search...',
    error,
    required = false,
    className = '',
}: SearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleToggle = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            setSearchTerm('');
            setTimeout(() => inputRef.current?.focus(), 0);
        }
    };

    const handleSelect = (optionValue: string) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange('');
        setSearchTerm('');
    };

    return (
        <div className={`w-full relative ${className}`} ref={containerRef}>
            {label && (
                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            
            <div 
                onClick={handleToggle}
                className={`
                    flex items-center justify-between w-full px-4 py-3 rounded-lg border transition-all cursor-pointer bg-white dark:bg-dark-surface
                    ${error 
                        ? 'border-red-500 ring-red-500/10' 
                        : 'border-gray-300 dark:border-gray-600 focus-within:border-primary'
                    }
                    ${isOpen ? 'ring-2 ring-primary/20 border-primary' : ''}
                `}
            >
                <div className="flex-1 min-w-0 overflow-hidden">
                    {selectedOption ? (
                        <span className="text-gray-900 dark:text-white truncate block">
                            {selectedOption.label}
                        </span>
                    ) : (
                        <span className="text-gray-400 dark:text-gray-500 truncate block">
                            {placeholder}
                        </span>
                    )}
                </div>
                
                <div className="flex items-center gap-2 ml-2">
                    {value && (
                        <X 
                            size={16} 
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors" 
                            onClick={handleClear}
                        />
                    )}
                    <ChevronDown 
                        size={18} 
                        className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    />
                </div>
            </div>

            {isOpen && (
                <div className="absolute z-[60] w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-2 border-b border-gray-100 dark:border-gray-700">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                ref={inputRef}
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Filter list..."
                                className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-900 border-none rounded-md focus:ring-1 focus:ring-primary focus:outline-none dark:text-white"
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>
                    
                    <div className="max-h-60 overflow-y-auto py-1">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => (
                                <div
                                    key={option.value}
                                    onClick={() => handleSelect(option.value)}
                                    className={`
                                        flex items-center justify-between px-4 py-2.5 text-sm cursor-pointer transition-colors
                                        ${option.value === value 
                                            ? 'bg-primary/10 text-primary font-medium' 
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                        }
                                    `}
                                >
                                    <span className="truncate">{option.label}</span>
                                    {option.value === value && <Check size={16} />}
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-6 text-center text-gray-500 dark:text-gray-400 text-sm">
                                No results found for "{searchTerm}"
                            </div>
                        )}
                    </div>
                </div>
            )}

            {error && <p className="mt-1 text-red-500 text-sm">{error}</p>}
        </div>
    );
}
