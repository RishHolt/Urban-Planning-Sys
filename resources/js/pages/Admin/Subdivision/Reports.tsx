import AdminLayout from '../../../components/AdminLayout';
import AdminContentCard from '../../../components/AdminContentCard';
import { FileText, Award, FileSearch, BarChart3 } from 'lucide-react';

export default function Reports() {
    return (
        <AdminLayout
            title="Subdivision & Building Review Reports"
            description="Analytics and reports for subdivision applications and building reviews"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AdminContentCard>
                    <div className="flex items-center gap-3 mb-4">
                        <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Subdivision Application Reports
                        </h2>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Generate reports for subdivision applications including status breakdown, stage analysis, and approval rates.
                    </p>
                    <div className="space-y-2">
                        <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors">
                            Application Status Report
                        </button>
                        <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors">
                            Stage Review Analysis
                        </button>
                        <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors">
                            Approval Rate Report
                        </button>
                    </div>
                </AdminContentCard>

                <AdminContentCard>
                    <div className="flex items-center gap-3 mb-4">
                        <Award className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Certificate Reports
                        </h2>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Reports on issued subdivision certificates including validity status and expiration tracking.
                    </p>
                    <div className="space-y-2">
                        <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors">
                            Certificate Issuance Report
                        </button>
                        <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors">
                            Expiration Tracking Report
                        </button>
                    </div>
                </AdminContentCard>

                <AdminContentCard>
                    <div className="flex items-center gap-3 mb-4">
                        <FileSearch className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Building Review Reports
                        </h2>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Analytics for building plan reviews including check results, approval rates, and processing times.
                    </p>
                    <div className="space-y-2">
                        <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors">
                            Review Status Report
                        </button>
                        <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors">
                            Plan Check Analysis
                        </button>
                        <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors">
                            Processing Time Report
                        </button>
                    </div>
                </AdminContentCard>

                <AdminContentCard>
                    <div className="flex items-center gap-3 mb-4">
                        <BarChart3 className="w-6 h-6 text-green-600 dark:text-green-400" />
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Combined Analytics
                        </h2>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Comprehensive reports combining subdivision and building review data for overall system performance.
                    </p>
                    <div className="space-y-2">
                        <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors">
                            Monthly Summary Report
                        </button>
                        <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors">
                            Performance Dashboard
                        </button>
                    </div>
                </AdminContentCard>
            </div>
        </AdminLayout>
    );
}
