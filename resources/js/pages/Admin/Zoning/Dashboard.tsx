import { useState } from 'react';
import AdminHeader from '../../../components/AdminHeader';
import Sidebar from '../../../components/Sidebar';

export default function ZoningDashboard() {
    const [sidebarOpen, setSidebarOpen] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth >= 1024;
        }
        return true;
    });

    return (
        <div className="flex flex-col bg-background dark:bg-dark-bg w-full min-h-dvh transition-colors">
            <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
            <AdminHeader sidebarOpen={sidebarOpen} />

            <main className={`flex-1 transition-all duration-300 ease-in-out ${
                sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
            } mt-16`}>
                <div className="mx-auto px-4 py-8 max-w-7xl">
                    <h1 className="mb-6 font-bold text-gray-900 dark:text-white text-3xl">
                        Zoning Clearance Dashboard
                    </h1>
                    <div className="bg-white dark:bg-dark-surface shadow-lg p-8 rounded-lg">
                        <p className="text-gray-600 dark:text-gray-300">
                            Dashboard content will be added here.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
