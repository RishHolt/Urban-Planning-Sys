import AdminLayout from '../../../components/AdminLayout';
import AdminContentCard from '../../../components/AdminContentCard';
import { Link } from '@inertiajs/react';
import Button from '../../../components/Button';
import { FileText, Users, CheckCircle, Clock } from 'lucide-react';

export default function Dashboard() {
    return (
        <AdminLayout
            title="Housing Beneficiary Registry Dashboard"
            description="Manage housing beneficiary applications and records"
        >
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <AdminContentCard>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">Total Applications</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">0</p>
                        </div>
                        <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                </AdminContentCard>
                <AdminContentCard>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">Pending Review</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">0</p>
                        </div>
                        <Clock className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                    </div>
                </AdminContentCard>
                <AdminContentCard>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">Approved</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">0</p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                </AdminContentCard>
                <AdminContentCard>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">Total Beneficiaries</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">0</p>
                        </div>
                        <Users className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                    </div>
                </AdminContentCard>
            </div>

            {/* Quick Actions */}
            <AdminContentCard>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
                <div className="flex flex-wrap gap-4">
                    <Link href="/admin/housing/applications">
                        <Button variant="primary">View Applications</Button>
                    </Link>
                    <Link href="/admin/housing/reports">
                        <Button variant="secondary">View Reports</Button>
                    </Link>
                </div>
            </AdminContentCard>
        </AdminLayout>
    );
}
