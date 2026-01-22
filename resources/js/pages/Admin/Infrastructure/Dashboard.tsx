import AdminLayout from '../../../components/AdminLayout';
import { Building2, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function Dashboard() {
    return (
        <AdminLayout
            title="Infrastructure Project Coordination"
            description="Track and coordinate infrastructure projects from planning to completion"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white dark:bg-dark-surface p-6 rounded-lg shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Projects</p>
                            <p className="text-gray-900 dark:text-white text-2xl font-bold mt-1">0</p>
                        </div>
                        <Building2 size={40} className="text-primary" />
                    </div>
                </div>

                <div className="bg-white dark:bg-dark-surface p-6 rounded-lg shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Ongoing Projects</p>
                            <p className="text-gray-900 dark:text-white text-2xl font-bold mt-1">0</p>
                        </div>
                        <TrendingUp size={40} className="text-blue-500" />
                    </div>
                </div>

                <div className="bg-white dark:bg-dark-surface p-6 rounded-lg shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Delayed Projects</p>
                            <p className="text-gray-900 dark:text-white text-2xl font-bold mt-1">0</p>
                        </div>
                        <Clock size={40} className="text-orange-500" />
                    </div>
                </div>

                <div className="bg-white dark:bg-dark-surface p-6 rounded-lg shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Completed Projects</p>
                            <p className="text-gray-900 dark:text-white text-2xl font-bold mt-1">0</p>
                        </div>
                        <CheckCircle size={40} className="text-green-500" />
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-dark-surface p-6 rounded-lg shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link
                        href="/admin/infrastructure/projects/create"
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        <h3 className="font-medium text-gray-900 dark:text-white mb-1">Create New Project</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Register a new infrastructure project</p>
                    </Link>
                    <Link
                        href="/admin/infrastructure/projects"
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        <h3 className="font-medium text-gray-900 dark:text-white mb-1">View All Projects</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Browse and manage all projects</p>
                    </Link>
                    <Link
                        href="/admin/infrastructure/reports"
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        <h3 className="font-medium text-gray-900 dark:text-white mb-1">View Reports</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Generate project reports and analytics</p>
                    </Link>
                </div>
            </div>
        </AdminLayout>
    );
}
