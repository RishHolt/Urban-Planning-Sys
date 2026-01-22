import AdminLayout from '../../../components/AdminLayout';
import AdminContentCard from '../../../components/AdminContentCard';
import Button from '../../../components/Button';
import { FileText, Download } from 'lucide-react';

export default function Reports() {
    return (
        <AdminLayout
            title="Housing Beneficiary Reports"
            description="Generate and view reports for housing beneficiary applications"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AdminContentCard>
                    <div className="flex items-center gap-4 mb-4">
                        <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Application Statistics
                        </h2>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        View statistics on total applicants, approval rates, and application trends.
                    </p>
                    <Button variant="primary" className="flex items-center gap-2">
                        <Download size={18} />
                        Generate Report
                    </Button>
                </AdminContentCard>

                <AdminContentCard>
                    <div className="flex items-center gap-4 mb-4">
                        <FileText className="w-8 h-8 text-green-600 dark:text-green-400" />
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Demographic Breakdown
                        </h2>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Analyze beneficiary demographics including age, income, and eligibility criteria.
                    </p>
                    <Button variant="primary" className="flex items-center gap-2">
                        <Download size={18} />
                        Generate Report
                    </Button>
                </AdminContentCard>
            </div>
        </AdminLayout>
    );
}
