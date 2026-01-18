import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ variant = 'primary', size = 'md', className = '', children, ...props }, ref) => {
        const baseStyles = 'font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

        const variantStyles = {
            primary: 'bg-primary text-white hover:bg-primary/90 active:bg-primary/80 dark:bg-primary dark:hover:bg-primary/90',
            secondary: 'bg-secondary text-white hover:bg-secondary/90 active:bg-secondary/80 dark:bg-secondary dark:hover:bg-secondary/90',
            accent: 'bg-accent text-white hover:bg-accent/90 active:bg-accent/80 dark:bg-accent dark:hover:bg-accent/90',
            outline: 'border-2 border-primary text-primary bg-transparent hover:bg-primary hover:text-white active:bg-primary/90 dark:border-primary dark:text-primary dark:hover:bg-primary',
            ghost: 'bg-transparent text-primary hover:bg-primary/10 active:bg-primary/20 dark:text-primary dark:hover:bg-primary/20',
            danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 dark:bg-red-600 dark:hover:bg-red-700',
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
