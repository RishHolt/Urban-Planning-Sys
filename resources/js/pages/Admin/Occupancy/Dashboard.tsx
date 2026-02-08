import { Link } from '@inertiajs/react';
import AdminLayout from '../../../components/AdminLayout';
import AdminContentCard from '../../../components/AdminContentCard';
import Button from '../../../components/Button';
import { Building, Home, AlertTriangle, FileWarning, ClipboardCheck, Eye, Users, TrendingUp } from 'lucide-react';

interface DashboardProps {
    stats: {
        total_buildings: number;
        total_units: number;
        occupied_units: number;
        vacant_units: number;
        active_complaints: number;
        open_violations: number;
        upcoming_inspections: number;
        overcrowded_units: number;
    };
    recentRecords?: any[];
    recentInspections?: any[];
    recentComplaints?: any[];
    recentViolations?: any[];
}

export default function Dashboard({ stats, recentRecords = [], recentInspections = [], recentComplaints = [], recentViolations = [] }: DashboardProps) {
    const occupancyRate = stats.total_units > 0 
        ? ((stats.occupied_units / stats.total_units) * 100).toFixed(1)
        : '0.0';

    return (
        <AdminLayout
            title="Occupancy Monitoring Dashboard"
            description="Monitor building occupancy, inspections, complaints, and violations"
        >
            {/* Statistics Cards */}
            <div className="gap-6 grid grid-cols-1 md:grid-cols-4 mb-8">
                <AdminContentCard>
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">Total Buildings</p>
                            <p className="mt-1 font-bold text-gray-900 dark:text-white text-2xl">{stats.total_buildings}</p>
                        </div>
                        <Building className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                </AdminContentCard>

                <AdminContentCard>
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">Total Units</p>
                            <p className="mt-1 font-bold text-gray-900 dark:text-white text-2xl">{stats.total_units}</p>
                            <p className="mt-1 text-gray-500 dark:text-gray-400 text-xs">
                                {stats.occupied_units} occupied ({occupancyRate}%)
                            </p>
                        </div>
                        <Home className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                </AdminContentCard>

                <AdminContentCard>
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">Open Violations</p>
                            <p className="mt-1 font-bold text-gray-900 dark:text-white text-2xl">{stats.open_violations}</p>
                            {stats.overcrowded_units > 0 && (
                                <p className="mt-1 text-red-500 dark:text-red-400 text-xs">
                                    {stats.overcrowded_units} overcrowded
                                </p>
                            )}
                        </div>
                        <FileWarning className="w-8 h-8 text-red-600 dark:text-red-400" />
                    </div>
                </AdminContentCard>

                <AdminContentCard>
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">Active Complaints</p>
                            <p className="mt-1 font-bold text-gray-900 dark:text-white text-2xl">{stats.active_complaints}</p>
                            <p className="mt-1 text-gray-500 dark:text-gray-400 text-xs">
                                {stats.upcoming_inspections} inspections scheduled
                            </p>
                        </div>
                        <AlertTriangle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                    </div>
                </AdminContentCard>
            </div>

            {/* Quick Actions */}
            <div className="gap-6 grid grid-cols-1 md:grid-cols-2 mb-8">
                <AdminContentCard>
                    <h2 className="mb-4 font-semibold text-gray-900 dark:text-white text-xl">Quick Actions</h2>
                    <div className="flex flex-wrap gap-4">
                        <Link href="/admin/occupancy/buildings/create">
                            <Button variant="primary">Register Building</Button>
                        </Link>
                        <Link href="/admin/occupancy/records/create">
                            <Button variant="secondary">Record Move-In</Button>
                        </Link>
                        <Link href="/admin/occupancy/inspections/create">
                            <Button variant="secondary">Schedule Inspection</Button>
                        </Link>
                        <Link href="/admin/occupancy/complaints/create">
                            <Button variant="secondary">Register Complaint</Button>
                        </Link>
                    </div>
                </AdminContentCard>

                <AdminContentCard>
                    <h2 className="mb-4 font-semibold text-gray-900 dark:text-white text-xl">Quick Links</h2>
                    <div className="space-y-2">
                        <Link href="/admin/occupancy/buildings" className="block text-primary hover:underline">
                            View All Buildings
                        </Link>
                        <Link href="/admin/occupancy/units" className="block text-primary hover:underline">
                            View All Units
                        </Link>
                        <Link href="/admin/occupancy/violations?open=1" className="block text-primary hover:underline">
                            View Open Violations
                        </Link>
                        <Link href="/admin/occupancy/inspections?upcoming=1" className="block text-primary hover:underline">
                            View Upcoming Inspections
                        </Link>
                        <Link href="/admin/occupancy/reports" className="block text-primary hover:underline">
                            View Reports
                        </Link>
                    </div>
                </AdminContentCard>
            </div>

            {/* Recent Activities */}
            <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
                {recentRecords && recentRecords.length > 0 && (
                    <AdminContentCard>
                        <h2 className="mb-4 font-semibold text-gray-900 dark:text-white text-xl">Recent Occupancy Records</h2>
                        <div className="space-y-3">
                            {recentRecords.slice(0, 5).map((record) => (
                                <div key={record.id} className="pb-3 border-gray-200 dark:border-gray-700 last:border-0 border-b">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {record.record_type === 'move_in' ? 'Move-In' : 'Move-Out'}
                                            </p>
                                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                                {record.building?.building_code} - {record.unit?.unit_no || 'N/A'}
                                            </p>
                                        </div>
                                        <span className="text-gray-500 dark:text-gray-400 text-xs">
                                            {new Date(record.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Link href="/admin/occupancy/records" className="inline-block mt-4 text-primary text-sm hover:underline">
                            View All Records →
                        </Link>
                    </AdminContentCard>
                )}

                {recentViolations && recentViolations.length > 0 && (
                    <AdminContentCard>
                        <h2 className="mb-4 font-semibold text-gray-900 dark:text-white text-xl">Recent Violations</h2>
                        <div className="space-y-3">
                            {recentViolations.slice(0, 5).map((violation) => (
                                <div key={violation.id} className="pb-3 border-gray-200 dark:border-gray-700 last:border-0 border-b">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {violation.violation_no}
                                            </p>
                                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                                {violation.violation_type} - {violation.building?.building_code}
                                            </p>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded ${
                                            violation.severity === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                            violation.severity === 'major' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                        }`}>
                                            {violation.severity}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Link href="/admin/occupancy/violations" className="inline-block mt-4 text-primary text-sm hover:underline">
                            View All Violations →
                        </Link>
                    </AdminContentCard>
                )}
            </div>
        </AdminLayout>
    );
}
