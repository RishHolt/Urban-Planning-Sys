import AdminLayout from '../../components/AdminLayout';
import AdminContentCard from '../../components/AdminContentCard';
import { BarChart3 } from 'lucide-react';

export default function Reports() {
    return (
        <AdminLayout
            title="Reports"
            description="View and generate reports for all system modules"
        >
            <AdminContentCard padding="lg">
                <div className="flex flex-col justify-center items-center py-12 text-center">
                    <BarChart3 size={64} className="mb-4 text-gray-400 dark:text-gray-600" />
                    <h2 className="mb-2 font-semibold text-gray-900 dark:text-white text-xl">
                        Reports & Analytics
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300">
                        Application statistics, zone statistics, approval/rejection rates, and charts will be displayed here.
                    </p>
                </div>
            </AdminContentCard>
        </AdminLayout>
    );
}
