import { SelectHTMLAttributes, forwardRef } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, error, icon, className = '', children, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {icon && (
                        <div className="top-1/2 left-3 absolute text-gray-400 -translate-y-1/2 pointer-events-none">
                            {icon}
                        </div>
                    )}
                    <select
                        ref={ref}
                        className={`
                            w-full px-4 py-3 rounded-lg border transition-colors appearance-none
                            ${icon ? 'pl-10' : ''}
                            ${error 
                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                                : 'border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary'
                            }
                            bg-white dark:bg-dark-surface
                            text-gray-900 dark:text-white
                            focus:outline-none focus:ring-2 focus:ring-opacity-20
                            ${className}
                        `}
                        {...props}
                    >
                        {children}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </div>
                </div>
                {error && (
                    <p className="mt-1 text-red-500 text-sm">{error}</p>
                )}
            </div>
        );
    }
);

Select.displayName = 'Select';

export default Select;
