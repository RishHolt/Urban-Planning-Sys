import { Link } from '@inertiajs/react';
import AdminLayout from '../../../../components/AdminLayout';
import AdminContentCard from '../../../../components/AdminContentCard';
import Button from '../../../../components/Button';
import { BarChart3, FileText, TrendingUp, AlertTriangle, Download } from 'lucide-react';

export default function ReportsIndex() {
    const reportTypes = [
        {
            title: 'Occupancy Summary',
            description: 'View occupancy rates, trends, and statistics by building type and area',
            icon: BarChart3,
            href: '/admin/occupancy/reports/occupancy',
            color: 'text-blue-600 dark:text-blue-400',
            bgColor: 'bg-blue-100 dark:bg-blue-900',
        },
        {
            title: 'Compliance Report',
            description: 'Generate compliance status reports for buildings and units',
            icon: FileText,
            href: '/admin/occupancy/reports/compliance',
            color: 'text-green-600 dark:text-green-400',
            bgColor: 'bg-green-100 dark:bg-green-900',
        },
        {
            title: 'Violations Report',
            description: 'View violation statistics, trends, and resolution rates',
            icon: AlertTriangle,
            href: '/admin/occupancy/reports/violations',
            color: 'text-red-600 dark:text-red-400',
            bgColor: 'bg-red-100 dark:bg-red-900',
        },
    ];

    return (
        <AdminLayout
            title="Reports"
            description="Generate and view occupancy monitoring reports"
        >
            <div className="space-y-6">
                <p className="text-gray-600 dark:text-gray-400">
                    Generate comprehensive reports on occupancy, compliance, and violations
                </p>

                <div className="gap-6 grid grid-cols-1 md:grid-cols-3">
                    {reportTypes.map((report) => {
                        const Icon = report.icon;
                        return (
                            <Link key={report.href} href={report.href}>
                                <AdminContentCard className="hover:shadow-lg transition-shadow cursor-pointer">
                                    <div className={`w-12 h-12 ${report.bgColor} rounded-lg flex items-center justify-center mb-4`}>
                                        <Icon className={`w-6 h-6 ${report.color}`} />
                                    </div>
                                    <h3 className="mb-2 font-semibold text-gray-900 dark:text-white text-lg">
                                        {report.title}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                                        {report.description}
                                    </p>
                                </AdminContentCard>
                            </Link>
                        );
                    })}
                </div>

                <AdminContentCard>
                    <h2 className="mb-4 font-semibold text-gray-900 dark:text-white text-xl">Export Data</h2>
                    <p className="mb-4 text-gray-600 dark:text-gray-400">
                        Export occupancy data for external analysis or reporting
                    </p>
                    <Link href="/admin/occupancy/reports/export">
                        <Button variant="primary">
                            <Download className="mr-2 w-4 h-4" />
                            Export Data
                        </Button>
                    </Link>
                </AdminContentCard>
            </div>
        </AdminLayout>
    );
}
