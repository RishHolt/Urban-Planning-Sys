import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ variant = 'primary', size = 'md', className = '', children, ...props }, ref) => {
        const baseStyles = 'inline-flex items-center justify-center font-bold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95';

        const variantStyles = {
            primary: 'bg-gradient-to-br from-primary to-primary/80 text-white shadow-[0_4px_14px_0_rgba(var(--primary-rgb),0.39)] hover:shadow-[0_6px_20px_rgba(var(--primary-rgb),0.23)] hover:brightness-110 -translate-y-[1px]',
            secondary: 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 -translate-y-[1px]',
            accent: 'bg-gradient-to-br from-accent to-accent/90 text-white shadow-[0_4px_14px_0_rgba(var(--accent-rgb),0.39)] hover:shadow-[0_6px_20px_rgba(var(--accent-rgb),0.23)] hover:brightness-110 -translate-y-[1px]',
            outline: 'border-2 border-primary/20 text-primary bg-transparent hover:border-primary hover:bg-primary/5 active:bg-primary/10 dark:border-primary/20 dark:text-primary dark:hover:bg-primary/5 -translate-y-[1px]',
            ghost: 'bg-transparent text-primary hover:bg-primary/5 active:bg-primary/10 dark:text-primary dark:hover:bg-primary/10',
            danger: 'bg-gradient-to-br from-red-600 to-red-700 text-white shadow-[0_4px_14px_0_rgba(220,38,38,0.39)] hover:shadow-[0_6px_20px_rgba(220,38,38,0.23)] hover:brightness-110 -translate-y-[1px]',
        };

        const sizeStyles = {
            sm: 'px-3 py-1.5 text-sm',
            md: 'px-4 py-2 text-base',
            lg: 'px-6 py-3 text-lg',
        };

        const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

        return (
            <button ref={ref} className={combinedClassName} {...props}>
                {children}
            </button>
        );
    }
);


Button.displayName = 'Button';

export default Button;
