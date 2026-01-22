import { useState } from 'react';
import { Link } from '@inertiajs/react';
import AdminHeader from './AdminHeader';
import Sidebar from './Sidebar';
import Button from './Button';
import AdminPageHeader from './AdminPageHeader';
import { ArrowLeft } from 'lucide-react';

interface AdminLayoutProps {
    title: string;
    description?: string;
    backButton?: {
        href: string;
        label: string;
    };
    variant?: 'default' | 'hero';
    children: React.ReactNode;
}

export default function AdminLayout({
    title,
    description,
    backButton,
    variant = 'default',
    children,
}: AdminLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth >= 1024;
        }
        return true;
    });

    if (variant === 'hero') {
        return (
            <div className="flex flex-col bg-background dark:bg-dark-bg w-full min-h-dvh transition-colors">
                <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
                <AdminHeader sidebarOpen={sidebarOpen} />

                <main className={`flex-1 transition-all duration-300 ease-in-out ${
                    sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
                } mt-16`}>
                    <section className="flex flex-col justify-center items-center py-20 md:py-32 w-full">
                        <div className="z-10 relative space-y-8 mx-auto px-4 max-w-7xl text-center">
                            <h1 className="drop-shadow-lg font-bold text-foreground dark:text-white text-4xl md:text-6xl lg:text-7xl leading-tight">
                                {title}
                            </h1>
                            {description && (
                                <p className="drop-shadow-md mx-auto max-w-2xl text-foreground/80 dark:text-white/80 text-base md:text-xl leading-relaxed">
                                    {description}
                                </p>
                            )}
                            {children}
                        </div>
                    </section>
                </main>
            </div>
        );
    }

    return (
        <div className="flex flex-col bg-background dark:bg-dark-bg w-full min-h-dvh transition-colors">
            <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
            <AdminHeader sidebarOpen={sidebarOpen} />

            <main className={`flex-1 transition-all duration-300 ease-in-out ${
                sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
            } mt-16`}>
                <div className="mx-auto px-4 py-8 max-w-7xl">
                    {backButton && (
                        <div className="mb-6">
                            <Link href={backButton.href}>
                                <Button variant="secondary" size="sm" className="flex items-center gap-2">
                                    <ArrowLeft size={18} />
                                    {backButton.label}
                                </Button>
                            </Link>
                        </div>
                    )}

                    <AdminPageHeader title={title} description={description} />

                    {children}
                </div>
            </main>
        </div>
    );
}
