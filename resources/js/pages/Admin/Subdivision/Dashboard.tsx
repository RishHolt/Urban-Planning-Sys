import AdminLayout from '../../../components/AdminLayout';
import AdminContentCard from '../../../components/AdminContentCard';
import { Link } from '@inertiajs/react';
import Button from '../../../components/Button';
import { FileText, Award, FileSearch, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function Dashboard() {
    return (
        <AdminLayout
            title="Subdivision & Building Review Dashboard"
            description="Overview of subdivision applications and building reviews"
        >
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
                <AdminContentCard>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">Subdivision Applications</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">0</p>
                        </div>
                        <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                </AdminContentCard>
                <AdminContentCard>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">Under Review</p>
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
                            <p className="text-gray-600 dark:text-gray-400 text-sm">Issued Certificates</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">0</p>
                        </div>
                        <Award className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                    </div>
                </AdminContentCard>
                <AdminContentCard>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">Building Reviews</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">0</p>
                        </div>
                        <FileSearch className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                    </div>
                </AdminContentCard>
                <AdminContentCard>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">Denied</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">0</p>
                        </div>
                        <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                    </div>
                </AdminContentCard>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AdminContentCard>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Subdivision Management</h2>
                    <div className="flex flex-wrap gap-4">
                        <Link href="/admin/subdivision/applications">
                            <Button variant="primary">View Applications</Button>
                        </Link>
                        <Link href="/admin/subdivision/certificates">
                            <Button variant="secondary">View Certificates</Button>
                        </Link>
                    </div>
                </AdminContentCard>

                <AdminContentCard>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Building Reviews</h2>
                    <div className="flex flex-wrap gap-4">
                        <Link href="/admin/building/reviews">
                            <Button variant="primary">View Reviews</Button>
                        </Link>
                        <Link href="/admin/subdivision/reports">
                            <Button variant="secondary">View Reports</Button>
                        </Link>
                    </div>
                </AdminContentCard>
            </div>
        </AdminLayout>
    );
}
