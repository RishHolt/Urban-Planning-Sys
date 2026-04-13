import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '../../components/AdminLayout';
import AdminContentCard from '../../components/AdminContentCard';
import {
    FileText,
    ClipboardCheck,
    Clock,
    ArrowRight,
    Eye,
    User,
    Calendar,
    Map,
    Plus,
    Activity,
    CheckCircle,
    Users,
    Shield,
    TrendingUp,
    BarChart3,
} from 'lucide-react';
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
    AreaChart, Area, CartesianGrid, XAxis,
} from 'recharts';

interface Props {
    stats: {
        totalApplications: number;
        pendingCount: number;
        underReviewCount: number;
        approvedCount: number;
        forInspectionCount: number;
        clearancesIssued: number;
        registeredCitizens: number;
        totalInspections: number;
        applicationsThisMonth: number;
        clearancesThisMonth: number;
        inspectionsThisMonth: number;
        inspectionsToday: number;
        applicationsByStatus: Array<{ name: string; value: number }>;
    };
    weeklyTrend: Array<{ day: string; count: number }>;
    recentApplications: any[];
    todayInspections: any[];
}

const STATUS_COLORS: Record<string, string> = {
    'Submitted': '#6366f1',
    'Pending': '#f59e0b',
    'Under review': '#3b82f6',
    'For inspection': '#8b5cf6',
    'Approved': '#10b981',
    'Rejected': '#ef4444',
    'For approval': '#06b6d4',
};

const FALLBACK_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6', '#06b6d4', '#ec4899'];

export default function AdminHome({ stats, weeklyTrend, recentApplications, todayInspections }: Props) {
    return (
        <AdminLayout
            title="Admin Dashboard"
            description="Overview of zoning clearance operations, applications, and inspections."
        >
            <Head title="Admin Dashboard" />

            <div className="space-y-8 mt-6">
                {/* Primary KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <KPICard
                        title="Total Applications"
                        value={stats.totalApplications}
                        icon={<FileText className="w-6 h-6 text-indigo-500" />}
                        color="indigo"
                        subtitle={`${stats.applicationsThisMonth} this month`}
                    />
                    <KPICard
                        title="Pending Review"
                        value={stats.pendingCount + stats.underReviewCount}
                        icon={<Clock className="w-6 h-6 text-amber-500" />}
                        color="amber"
                        subtitle={`${stats.pendingCount} new · ${stats.underReviewCount} in review`}
                    />
                    <KPICard
                        title="Clearances Issued"
                        value={stats.clearancesIssued}
                        icon={<Shield className="w-6 h-6 text-emerald-500" />}
                        color="emerald"
                        subtitle={`${stats.clearancesThisMonth} this month`}
                    />
                    <KPICard
                        title="Registered Citizens"
                        value={stats.registeredCitizens}
                        icon={<Users className="w-6 h-6 text-blue-500" />}
                        color="blue"
                        subtitle="Active accounts"
                    />
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <QuickActionLink
                        href="/admin/zoning/applications"
                        icon={<Plus size={20} />}
                        label="Applications"
                        subLabel="Review queue"
                        color="bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30"
                    />
                    <QuickActionLink
                        href="/admin/zoning/inspections"
                        icon={<Calendar size={20} />}
                        label="Inspections"
                        subLabel="Manage schedule"
                        color="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30"
                    />
                    <QuickActionLink
                        href="/admin/zoning/map"
                        icon={<Map size={20} />}
                        label="Zoning Map"
                        subLabel="Geospatial view"
                        color="bg-amber-50 text-amber-600 dark:bg-amber-900/30"
                    />
                    <QuickActionLink
                        href="/admin/analytics"
                        icon={<BarChart3 size={20} />}
                        label="Full Analytics"
                        subLabel="Detailed reports"
                        color="bg-blue-50 text-blue-600 dark:bg-blue-900/30"
                    />
                </div>

                {/* Charts + Inspections Row */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Weekly Trend */}
                    <div className="lg:col-span-5">
                        <AdminContentCard className="h-full">
                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Weekly Application Trend</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Daily submissions over the last 7 days</p>
                            <div className="h-52">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={weeklyTrend}>
                                        <defs>
                                            <linearGradient id="colorWeekly" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} dy={5} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                                            formatter={(value: any) => [value, 'Applications']}
                                        />
                                        <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2.5} fill="url(#colorWeekly)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </AdminContentCard>
                    </div>

                    {/* Status Breakdown */}
                    <div className="lg:col-span-4">
                        <AdminContentCard className="h-full">
                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Application Status</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Current distribution</p>
                            <div className="h-56">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={stats.applicationsByStatus}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={45}
                                            outerRadius={75}
                                            paddingAngle={4}
                                            dataKey="value"
                                        >
                                            {stats.applicationsByStatus.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || FALLBACK_COLORS[index % FALLBACK_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '10px' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </AdminContentCard>
                    </div>

                    {/* Today's Inspections */}
                    <div className="lg:col-span-3">
                        <AdminContentCard className="flex flex-col h-full">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Today's Inspections</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Scheduled: {stats.inspectionsToday}</p>
                                </div>
                                <span className="px-2 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded text-[10px] font-bold">LIVE</span>
                            </div>
                            <div className="flex-1 space-y-3 max-h-[280px] overflow-y-auto pr-1">
                                {todayInspections.length > 0 ? (
                                    todayInspections.map((inspection) => (
                                        <Link
                                            key={inspection.id}
                                            href={`/admin/zoning/inspections/${inspection.id}`}
                                            className="block p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors"
                                        >
                                            <div className="flex justify-between items-start mb-1.5">
                                                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-tighter">
                                                    {inspection.clearance_application?.reference_no}
                                                </span>
                                                <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase
                                                    ${inspection.completed_at ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                                                    {inspection.completed_at ? 'Done' : 'Pending'}
                                                </span>
                                            </div>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1 mb-1">
                                                {inspection.clearance_application?.applicant_name}
                                            </p>
                                            <div className="flex items-center text-[11px] text-gray-500 dark:text-gray-400">
                                                <User size={11} className="mr-1 opacity-70" />
                                                <span>{inspection.inspector?.name || 'Unassigned'}</span>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="text-center py-8 flex flex-col items-center">
                                        <Calendar className="text-gray-200 dark:text-gray-700 mb-2" size={36} />
                                        <p className="text-sm text-gray-400 dark:text-gray-500">No inspections today</p>
                                    </div>
                                )}
                            </div>
                            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                                <Link
                                    href="/admin/zoning/inspections"
                                    className="text-sm font-semibold text-indigo-600 flex items-center justify-center hover:underline"
                                >
                                    All Inspections <ArrowRight size={14} className="ml-1" />
                                </Link>
                            </div>
                        </AdminContentCard>
                    </div>
                </div>

                {/* Secondary Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <MiniStat label="For Inspection" value={stats.forInspectionCount} icon={<ClipboardCheck size={16} />} color="text-purple-600 bg-purple-50 dark:bg-purple-900/20" />
                    <MiniStat label="Approved" value={stats.approvedCount} icon={<CheckCircle size={16} />} color="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20" />
                    <MiniStat label="Total Inspections" value={stats.totalInspections} icon={<Activity size={16} />} color="text-blue-600 bg-blue-50 dark:bg-blue-900/20" />
                    <MiniStat label="This Month" value={stats.inspectionsThisMonth} icon={<TrendingUp size={16} />} color="text-amber-600 bg-amber-50 dark:bg-amber-900/20" />
                </div>

                {/* Recent Applications Table */}
                <AdminContentCard>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Recent Applications</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Latest submitted applications</p>
                        </div>
                        <Link
                            href="/admin/zoning/applications"
                            className="text-sm font-semibold text-indigo-600 flex items-center hover:underline"
                        >
                            View All <ArrowRight size={14} className="ml-1" />
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-gray-800">
                                    <th className="py-3 px-4 font-semibold text-sm text-gray-600 dark:text-gray-400">Reference</th>
                                    <th className="py-3 px-4 font-semibold text-sm text-gray-600 dark:text-gray-400">Applicant</th>
                                    <th className="py-3 px-4 font-semibold text-sm text-gray-600 dark:text-gray-400">Project Type</th>
                                    <th className="py-3 px-4 font-semibold text-sm text-gray-600 dark:text-gray-400">Status</th>
                                    <th className="py-3 px-4 font-semibold text-sm text-gray-600 dark:text-gray-400">Date</th>
                                    <th className="py-3 px-4 font-semibold text-sm text-gray-600 dark:text-gray-400 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                                {recentApplications.length > 0 ? (
                                    recentApplications.map((app) => (
                                        <tr key={app.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <td className="py-3 px-4 text-sm font-medium text-indigo-600">{app.reference_no}</td>
                                            <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{app.applicant_name || app.lot_owner || '—'}</td>
                                            <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400 capitalize">
                                                {app.project_type?.replace(/_/g, ' ') || '—'}
                                            </td>
                                            <td className="py-3 px-4 text-sm">
                                                <StatusPill status={app.status} />
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">
                                                {app.submitted_at ? new Date(app.submitted_at).toLocaleDateString() : '—'}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-right">
                                                <Link
                                                    href={`/admin/zoning/applications/${app.id}`}
                                                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg inline-flex text-indigo-600"
                                                    title="View Application"
                                                >
                                                    <Eye size={18} />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-gray-500 dark:text-gray-400 italic">
                                            <Activity className="mx-auto mb-2 opacity-20" size={32} />
                                            No applications found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </AdminContentCard>
            </div>
        </AdminLayout>
    );
}

/* ──── Sub-components ──── */

function KPICard({ title, value, icon, color, subtitle }: { title: string; value: number | string; icon: React.ReactNode; color: string; subtitle?: string }) {
    const colorClasses: Record<string, string> = {
        indigo: 'bg-indigo-50 dark:bg-indigo-900/20',
        amber: 'bg-amber-50 dark:bg-amber-900/20',
        emerald: 'bg-emerald-50 dark:bg-emerald-900/20',
        blue: 'bg-blue-50 dark:bg-blue-900/20',
    };

    return (
        <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-[0.07] group-hover:opacity-[0.12] transition-opacity">
                {React.cloneElement(icon as React.ReactElement<any>, { size: 56 })}
            </div>
            <div className="flex items-center gap-3 mb-4">
                <div className={`p-2.5 rounded-xl ${colorClasses[color] || colorClasses.indigo}`}>
                    {icon}
                </div>
            </div>
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">{title}</p>
            <p className="text-3xl font-black text-gray-900 dark:text-white leading-none">
                {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {subtitle && (
                <p className="mt-2 text-[11px] text-gray-500 dark:text-gray-400 font-medium">{subtitle}</p>
            )}
        </div>
    );
}

function QuickActionLink({ href, icon, label, subLabel, color }: { href: string; icon: React.ReactNode; label: string; subLabel: string; color: string }) {
    return (
        <Link
            href={href}
            className="flex flex-col p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-900 transition-all group"
        >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${color} group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <p className="font-bold text-gray-900 dark:text-white text-sm">{label}</p>
            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tight">{subLabel}</p>
        </Link>
    );
}

function MiniStat({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
    return (
        <div className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className={`p-2 rounded-lg ${color}`}>
                {icon}
            </div>
            <div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{value.toLocaleString()}</p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">{label}</p>
            </div>
        </div>
    );
}

function StatusPill({ status }: { status: string }) {
    const configs: Record<string, { label: string; cls: string }> = {
        submitted: { label: 'Submitted', cls: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' },
        pending: { label: 'Pending', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
        under_review: { label: 'Under Review', cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
        for_inspection: { label: 'For Inspection', cls: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
        for_approval: { label: 'For Approval', cls: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400' },
        approved: { label: 'Approved', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
        rejected: { label: 'Rejected', cls: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' },
    };

    const config = configs[status] || { label: status.replace(/_/g, ' '), cls: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' };

    return (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${config.cls}`}>
            {config.label}
        </span>
    );
}
