import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '../../components/AdminLayout';
import AdminContentCard from '../../components/AdminContentCard';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import {
    Users, FileText, ClipboardCheck, Clock, Shield, TrendingUp, MapPin, Eye, ArrowRight, CheckCircle, Activity,
} from 'lucide-react';

interface StatItem {
    name: string;
    value: number;
}

interface MonthlyItem {
    month: string;
    total: number;
}

interface ResultItem {
    name: string;
    total: number;
}

interface Props {
    stats: {
        applications: {
            total: number;
            byStatus: StatItem[];
            byProjectType: StatItem[];
            byLandUse: ResultItem[];
            monthly: MonthlyItem[];
            byBarangay: ResultItem[];
            avgProcessingTime: number;
            approvalRate: number;
        };
        inspections: {
            total: number;
            byResult: ResultItem[];
        };
        clearances: {
            total: number;
            monthly: MonthlyItem[];
        };
        users: {
            admins: number;
            normal: number;
        };
    };
    recentApplications: any[];
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6', '#06b6d4', '#ec4899'];

const STATUS_COLORS: Record<string, string> = {
    'Submitted': '#6366f1',
    'Pending': '#f59e0b',
    'Under review': '#3b82f6',
    'For inspection': '#8b5cf6',
    'Approved': '#10b981',
    'Rejected': '#ef4444',
    'For approval': '#06b6d4',
};

export default function Analytics({ stats, recentApplications }: Props) {
    return (
        <AdminLayout
            title="Analytics Dashboard"
            description="Comprehensive insights and statistics for the Zoning Clearance System."
        >
            <Head title="Admin Analytics" />

            <div className="space-y-8 mt-6">
                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <KPICard
                        title="Total Applications"
                        value={stats.applications.total.toLocaleString()}
                        icon={<FileText className="w-6 h-6 text-indigo-500" />}
                    />
                    <KPICard
                        title="Avg. Processing"
                        value={`${stats.applications.avgProcessingTime} Days`}
                        icon={<Clock className="w-6 h-6 text-amber-500" />}
                        trend="Submitted to Processed"
                    />
                    <KPICard
                        title="Clearances Issued"
                        value={stats.clearances.total.toLocaleString()}
                        icon={<Shield className="w-6 h-6 text-emerald-500" />}
                    />
                    <KPICard
                        title="Approval Rate"
                        value={`${stats.applications.approvalRate}%`}
                        icon={<CheckCircle className="w-6 h-6 text-green-500" />}
                        trend="Of processed applications"
                    />
                </div>

                {/* Row 2: Registered Citizens + Inspections mini stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <MiniStat label="Registered Citizens" value={stats.users.normal} icon={<Users size={16} />} color="text-blue-600 bg-blue-50 dark:bg-blue-900/20" />
                    <MiniStat label="Admin Users" value={stats.users.admins} icon={<Shield size={16} />} color="text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20" />
                    <MiniStat label="Total Inspections" value={stats.inspections.total} icon={<ClipboardCheck size={16} />} color="text-purple-600 bg-purple-50 dark:bg-purple-900/20" />
                    <MiniStat label="Barangays Active" value={stats.applications.byBarangay.length} icon={<MapPin size={16} />} color="text-amber-600 bg-amber-50 dark:bg-amber-900/20" />
                </div>

                {/* Row 3: Application Volume Trend + Status Mix */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8">
                        <AdminContentCard>
                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Application Volume (Last 6 Months)</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Monthly submission trends</p>
                            <div className="h-80 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={stats.applications.monthly}>
                                        <defs>
                                            <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                                        <Tooltip
                                            formatter={(value: any) => [value, 'Applications']}
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Area type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorVolume)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </AdminContentCard>
                    </div>

                    <div className="lg:col-span-4">
                        <AdminContentCard className="h-full">
                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Current Status Mix</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Application distribution</p>
                            <div className="h-72 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={stats.applications.byStatus}
                                            cx="50%"
                                            cy="45%"
                                            innerRadius={55}
                                            outerRadius={85}
                                            fill="#8884d8"
                                            paddingAngle={4}
                                            dataKey="value"
                                        >
                                            {stats.applications.byStatus.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '10px' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </AdminContentCard>
                    </div>
                </div>

                {/* Row 4: Project Type + Barangay Distribution */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <AdminContentCard>
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Applications by Project Type</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Volume breakdown</p>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.applications.byProjectType}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 10 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                                    <Tooltip cursor={{ fill: '#F1F5F9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </AdminContentCard>

                    <AdminContentCard>
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Top 10 Active Barangays</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Geographic distribution</p>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.applications.byBarangay} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 10 }} width={120} />
                                    <Tooltip cursor={{ fill: '#F1F5F9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Bar dataKey="total" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={15} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </AdminContentCard>
                </div>

                {/* Row 5: Land Use + Clearances Monthly + Inspections */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Land Use Type Distribution */}
                    <AdminContentCard>
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Land Use Types</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Application distribution by land use</p>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.applications.byLandUse}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 10 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                                    <Tooltip cursor={{ fill: '#F1F5F9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Bar dataKey="total" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={35} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </AdminContentCard>

                    {/* Clearances Issued Monthly */}
                    <AdminContentCard>
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Clearances Issued (Monthly)</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Last 6 months</p>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.clearances.monthly}>
                                    <defs>
                                        <linearGradient id="colorClearance" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                                    <Tooltip
                                        formatter={(value: any) => [value, 'Clearances']}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Area type="monotone" dataKey="total" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorClearance)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </AdminContentCard>

                    {/* Inspection Outcomes */}
                    <AdminContentCard>
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Inspection Outcomes</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Result distribution</p>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.inspections.byResult}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                                    <Tooltip cursor={{ fill: '#F1F5F9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Bar dataKey="total" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </AdminContentCard>
                </div>

                {/* Row 6: Recent Application Activity */}
                <AdminContentCard>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Recent Application Activity</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Latest submissions</p>
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
                                    <th className="py-3 px-4 font-semibold text-sm text-gray-600 dark:text-gray-400">Ref No.</th>
                                    <th className="py-3 px-4 font-semibold text-sm text-gray-600 dark:text-gray-400">Applicant</th>
                                    <th className="py-3 px-4 font-semibold text-sm text-gray-600 dark:text-gray-400">Status</th>
                                    <th className="py-3 px-4 font-semibold text-sm text-gray-600 dark:text-gray-400">Date</th>
                                    <th className="py-3 px-4 font-semibold text-sm text-gray-600 dark:text-gray-400 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                                {recentApplications.map((app) => (
                                    <tr key={app.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="py-3 px-4 text-sm font-medium text-indigo-600">{app.reference_no}</td>
                                        <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{app.applicant_name}</td>
                                        <td className="py-3 px-4 text-sm">
                                            <StatusPill status={app.status} />
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-500">
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
                                ))}
                            </tbody>
                        </table>
                    </div>
                </AdminContentCard>
            </div>
        </AdminLayout>
    );
}

/* ──── Sub-components ──── */

function KPICard({ title, value, icon, trend }: { title: string; value: string | number; icon: React.ReactNode; trend?: string }) {
    return (
        <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800">
                    {icon}
                </div>
                {trend && (
                    <span className="text-xs font-semibold text-gray-500 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-lg">
                        {trend}
                    </span>
                )}
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
            </div>
        </div>
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
