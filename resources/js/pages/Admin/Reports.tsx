import { useState } from 'react';
import AdminHeader from '../../components/AdminHeader';
import Sidebar from '../../components/Sidebar';
import { BarChart3 } from 'lucide-react';

export default function Reports() {
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
                        Reports
                    </h1>
                    <div className="bg-white dark:bg-dark-surface shadow-lg p-8 rounded-lg">
                        <div className="flex flex-col justify-center items-center py-12 text-center">
                            <BarChart3 size={64} className="mb-4 text-gray-400 dark:text-gray-600" />
                            <h2 className="mb-2 font-semibold text-gray-900 dark:text-white text-xl">
                                Reports & Analytics
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300">
                                Application statistics, zone statistics, approval/rejection rates, and charts will be displayed here.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
