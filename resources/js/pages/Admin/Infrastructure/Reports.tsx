import AdminLayout from '../../../components/AdminLayout';
import { FileText } from 'lucide-react';

export default function Reports() {
    return (
        <AdminLayout
            title="Infrastructure Reports"
            description="Generate and view infrastructure project reports"
        >
            <div className="bg-white dark:bg-dark-surface p-6 rounded-lg shadow-lg">
                <div className="flex flex-col items-center justify-center py-12">
                    <FileText size={64} className="text-gray-400 dark:text-gray-600 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Reports Coming Soon</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
                        Infrastructure project reports and analytics will be available here.
                    </p>
                </div>
            </div>
        </AdminLayout>
    );
}
