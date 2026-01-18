import { useState } from 'react';
import AdminHeader from "../../components/AdminHeader";
import Sidebar from "../../components/Sidebar";

export default function AdminHome() {
    const [sidebarOpen, setSidebarOpen] = useState(() => {
        // Check if we're on desktop (lg breakpoint) - default to open on desktop, closed on mobile
        if (typeof window !== 'undefined') {
            return window.innerWidth >= 1024;
        }
        return true;
    });

    return (
        <div className="flex flex-col bg-background dark:bg-dark-bg w-full min-h-dvh transition-colors">
            <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
            <AdminHeader sidebarOpen={sidebarOpen} />
            
            {/* Main Content Area */}
            <main className={`flex-1 transition-all duration-300 ease-in-out ${
                sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
            } mt-16`}>
                {/* Admin Dashboard Section */}
                <section className="flex flex-col justify-center items-center py-20 md:py-32 w-full">
                    <div className="z-10 relative space-y-8 mx-auto px-4 max-w-7xl text-center">
                        {/* Main Heading */}
                        <h1 className="drop-shadow-lg font-bold text-foreground dark:text-white text-4xl md:text-6xl lg:text-7xl leading-tight">
                            Admin Dashboard
                        </h1>

                        {/* Description */}
                        <p className="drop-shadow-md mx-auto max-w-2xl text-foreground/80 dark:text-white/80 text-base md:text-xl leading-relaxed">
                            Welcome to the administrative panel. Manage your urban planning services and resources.
                        </p>

                        {/* Admin Content Placeholder */}
                        <div className="bg-white dark:bg-dark-surface shadow-lg mt-12 p-8 rounded-lg">
                            <h2 className="mb-4 font-semibold text-gray-800 dark:text-white text-2xl">
                                Admin Features
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300">
                                Administrative features and controls will be available here.
                            </p>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
