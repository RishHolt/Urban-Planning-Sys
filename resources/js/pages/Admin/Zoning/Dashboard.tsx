import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '../../../components/AdminLayout';
import AdminContentCard from '../../../components/AdminContentCard';
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
    Shield
} from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area
} from 'recharts';

interface Props {
    stats: {
        pending_applications: number;
        under_review: number;
        inspections_today: number;
        approved_month: number;
        inspections_month: number;
    };
    weeklyTrend: Array<{ day: string, count: number }>;
    recentApplications: any[];
    todayInspections: any[];
}

export default function ZoningDashboard({ stats, weeklyTrend, recentApplications, todayInspections }: Props) {

    return (
        <AdminLayout
            title="Zoning Clearance Dashboard"
            description="Operational hub for managing zoning clearances, inspections, and departmental KPIs."
        >
            <Head title="Zcs Dashboard" />

            <div className="space-y-8 mt-6">
                {/* Upper Management Grid: KPIs + Mini Trend */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Primary Operational Stats */}
                    <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <OperationalCard 
                            title="New Pending" 
                            value={stats.pending_applications} 
                            icon={<FileText className="w-6 h-6 text-indigo-500" />}
                            description="Awaiting initial assessment"
                            color="indigo"
                            trend="+2 from yesterday"
                        />
                        <OperationalCard 
                            title="Under Review" 
                            value={stats.under_review} 
                            icon={<Clock className="w-6 h-6 text-amber-500" />}
                            description="Active evaluations in progress"
                            color="amber"
                        />
                        <OperationalCard 
                            title="Approved This Month" 
                            value={stats.approved_month} 
                            icon={<Shield className="w-6 h-6 text-emerald-500" />}
                            description="Applications approved this month"
                            color="emerald"
                        />
                        <OperationalCard 
                            title="Inspections" 
                            value={stats.inspections_month} 
                            icon={<CheckCircle className="w-6 h-6 text-blue-500" />}
                            description="Completed inspections this month"
                            color="blue"
                        />
                    </div>

                    {/* Weekly Trend Mini Chart */}
                    <div className="lg:col-span-4">
                        <AdminContentCard title="Weekly Volume Trend" className="h-full">
                            <div className="mt-4 h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={weeklyTrend}>
                                        <defs>
                                            <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 10}} dy={5} />
                                        <Tooltip 
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                                        />
                                        <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} fill="url(#colorTrend)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                            <p className="mt-2 text-xs text-center text-gray-500">Daily application volume (last 7 days)</p>
                        </AdminContentCard>
                    </div>
                </div>

                {/* Quick Actions & Shortcut Grid */}
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
                        icon={<Activity size={20} />} 
                        label="Full Analytics" 
                        subLabel="Detailed reports"
                        color="bg-blue-50 text-blue-600 dark:bg-blue-900/30"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Priority Tasks: Oldest Pending Applications */}
                    <div className="lg:col-span-2">
                        <AdminContentCard title="Action Required: Oldest Pending Tasks">
                            <div className="overflow-x-auto mt-4">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-gray-100 dark:border-gray-800">
                                            <th className="py-3 px-4 font-semibold text-sm text-gray-600 dark:text-gray-400">Reference</th>
                                            <th className="py-3 px-4 font-semibold text-sm text-gray-600 dark:text-gray-400">Applicant</th>
                                            <th className="py-3 px-4 font-semibold text-sm text-gray-600 dark:text-gray-400">Status</th>
                                            <th className="py-3 px-4 font-semibold text-sm text-gray-600 dark:text-gray-400">Wait Time</th>
                                            <th className="py-3 px-4 font-semibold text-sm text-gray-600 dark:text-gray-400 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                                        {recentApplications.length > 0 ? (
                                            recentApplications.map((app) => {
                                                const subDate = new Date(app.submitted_at);
                                                const diffDays = Math.floor((new Date().getTime() - subDate.getTime()) / (1000 * 3600 * 24));
                                                
                                                return (
                                                    <tr key={app.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                                        <td className="py-3 px-4 text-sm font-medium text-indigo-600">{app.reference_no}</td>
                                                        <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                                                            <div className="flex flex-col">
                                                                <span>{app.applicant_name}</span>
                                                                <span className="text-xs text-gray-500">{app.project_type}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4 text-sm">
                                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase 
                                                                ${app.status === 'under_review' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                                                                {app.status.replace('_', ' ')}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4 text-sm">
                                                            <span className={`font-medium ${diffDays > 5 ? 'text-red-500' : 'text-gray-500'}`}>
                                                                {diffDays} days
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4 text-sm text-right">
                                                            <Link 
                                                                href={`/admin/zoning/applications/${app.id}`}
                                                                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg inline-flex text-indigo-600"
                                                                title="Review Application"
                                                            >
                                                                <Eye size={18} />
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="py-12 text-center text-gray-500 dark:text-gray-400 italic">
                                                    <Activity className="mx-auto mb-2 opacity-20" size={32} />
                                                    No pending applications found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-4 flex justify-between items-center border-t border-gray-50 pt-4">
                                <span className="text-xs text-gray-500">Showing top 10 oldest pending tasks</span>
                                <Link 
                                    href="/admin/zoning/applications" 
                                    className="text-sm font-semibold text-indigo-600 flex items-center hover:underline"
                                >
                                    Full Queue <ArrowRight size={14} className="ml-1" />
                                </Link>
                            </div>
                        </AdminContentCard>
                    </div>

                    {/* Today's Scheduled Inspections Sidebar */}
                    <div className="lg:col-span-1">
                        <AdminContentCard title="Inspections Today" className="flex flex-col h-full">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-xs font-medium text-gray-500">Scheduled: {stats.inspections_today}</span>
                                <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-[10px] font-bold">LIVE</span>
                            </div>
                            <div className="flex-1 space-y-4 max-h-[500px] overflow-y-auto pr-1">
                                {todayInspections.length > 0 ? (
                                    todayInspections.map((inspection) => (
                                        <div key={inspection.id} className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 group relative">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-tighter">
                                                    {inspection.clearance_application?.reference_no}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase
                                                    ${inspection.completed_at ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                                                    {inspection.completed_at ? 'Done' : 'Pending'}
                                                </span>
                                            </div>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1 mb-2">
                                                {inspection.clearance_application?.applicant_name}
                                            </p>
                                            <div className="space-y-1">
                                                <div className="flex items-center text-[11px] text-gray-500">
                                                    <User size={12} className="mr-1.5 opacity-70" />
                                                    <span>{inspection.inspector?.name || 'Unassigned'}</span>
                                                </div>
                                                <div className="flex items-center text-[11px] text-gray-500">
                                                    <Clock size={12} className="mr-1.5 opacity-70" />
                                                    <span>{inspection.clearance_application?.barangay || 'Area Review'}</span>
                                                </div>
                                            </div>
                                            <Link 
                                                href={`/admin/zoning/inspections/${inspection.id}`}
                                                className="absolute inset-0 z-10"
                                            />
                                            <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="w-full py-1.5 bg-indigo-600 text-white rounded text-[10px] font-bold text-center">
                                                    Open Details
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12 flex flex-col items-center">
                                        <Calendar className="text-gray-200 dark:text-gray-800 mb-2" size={40} />
                                        <p className="text-sm text-gray-400 dark:text-gray-500">No inspections today.</p>
                                    </div>
                                )}
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                                <Link 
                                    href="/admin/zoning/inspections"
                                    className="text-sm font-semibold text-indigo-600 flex items-center justify-center hover:underline"
                                >
                                    Calendar <ArrowRight size={14} className="ml-1" />
                                </Link>
                            </div>
                        </AdminContentCard>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

function OperationalCard({ title, value, icon, description, color, trend }: { title: string, value: string | number, icon: React.ReactNode, description: string, color: string, trend?: string }) {
    const colorClasses: Record<string, string> = {
        indigo: "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400",
        amber: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
        emerald: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
        blue: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
    };

    return (
        <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                {React.cloneElement(icon as React.ReactElement<any>, { size: 48 })}
            </div>
            <div className="flex flex-col h-full justify-between">
                <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-xl ${colorClasses[color] || colorClasses.indigo}`}>
                        {icon}
                    </div>
                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{title}</p>
                </div>
                <div>
                    <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-black text-gray-900 dark:text-white leading-none">{value}</p>
                        {trend && <span className="text-[10px] font-bold text-emerald-600">{trend}</span>}
                    </div>
                    <p className="mt-2 text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                        {description}
                    </p>
                </div>
            </div>
        </div>
    );
}

function QuickActionLink({ href, icon, label, subLabel, color }: { href: string, icon: React.ReactNode, label: string, subLabel: string, color: string }) {
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
