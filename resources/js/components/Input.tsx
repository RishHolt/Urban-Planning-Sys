import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, icon, className = '', ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {icon && (
                        <div className="top-1/2 left-3 absolute text-gray-400 -translate-y-1/2">
                            {icon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={`
                            w-full px-4 py-3 rounded-lg border transition-colors
                            ${icon ? 'pl-10' : ''}
                            ${error 
                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                                : 'border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary'
                            }
                            bg-white dark:bg-dark-surface
                            text-gray-900 dark:text-white
                            placeholder:text-gray-400 dark:placeholder:text-gray-500
                            focus:outline-none focus:ring-2 focus:ring-opacity-20
                            ${className}
                        `}
                        {...props}
                    />
                </div>
                {error && (
                    <p className="mt-1 text-red-500 text-sm">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export default Input;
