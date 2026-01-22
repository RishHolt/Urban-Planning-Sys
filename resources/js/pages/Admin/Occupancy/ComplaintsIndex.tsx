import { Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import AdminFilterSection from '../../../components/AdminFilterSection';
import AdminEmptyState from '../../../components/AdminEmptyState';
import { AlertTriangle, Eye } from 'lucide-react';

interface ComplaintItem {
    id: string;
    complaint_no: string;
    complainant_name: string;
    complaint_type: string;
    priority: string;
    status: string;
    building: {
        id: string;
        building_code: string;
        building_name: string | null;
    } | null;
    unit: {
        id: string;
        unit_no: string;
    } | null;
    submitted_at: string;
    resolved_at: string | null;
}

interface ComplaintsIndexProps {
    complaints: {
        data: ComplaintItem[];
        links: any;
        meta: any;
    };
    filters: {
        search?: string;
        status?: string;
        priority?: string;
        complaint_type?: string;
    };
}

export default function ComplaintsIndex({ complaints, filters: initialFilters }: ComplaintsIndexProps) {
    const [showFilters, setShowFilters] = useState(false);
    const { data, setData, get } = useForm({
        search: initialFilters.search || '',
        status: initialFilters.status || '',
        priority: initialFilters.priority || '',
        complaint_type: initialFilters.complaint_type || '',
    });

    const handleSearch = (): void => {
        get('/admin/occupancy/complaints', {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleReset = (): void => {
        setData({
            search: '',
            status: '',
            priority: '',
            complaint_type: '',
        });
        router.get('/admin/occupancy/complaints');
    };

    const getPriorityBadge = (priority: string) => {
        const config: Record<string, { label: string; className: string }> = {
            'low': { label: 'Low', className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' },
            'medium': { label: 'Medium', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
            'high': { label: 'High', className: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
            'urgent': { label: 'Urgent', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
        };
        const c = config[priority] || config['medium'];
        return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${c.className}`}>{c.label}</span>;
    };

    const getStatusBadge = (status: string) => {
        const config: Record<string, { label: string; className: string }> = {
            'open': { label: 'Open', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
            'assigned': { label: 'Assigned', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
            'investigated': { label: 'Investigated', className: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
            'resolved': { label: 'Resolved', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
            'closed': { label: 'Closed', className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' },
        };
        const c = config[status] || config['open'];
        return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${c.className}`}>{c.label}</span>;
    };

    const getTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            'noise': 'Noise',
            'sanitation': 'Sanitation',
            'unauthorized_use': 'Unauthorized Use',
            'overcrowding': 'Overcrowding',
            'fire_hazard': 'Fire Hazard',
            'structural': 'Structural',
            'parking': 'Parking',
            'other': 'Other',
        };
        return labels[type] || type;
    };

    return (
        <AdminLayout title="Complaints" description="Manage and track building complaints">
            <div className="space-y-6">

                <AdminFilterSection
                    searchValue={data.search}
                    onSearchChange={(value) => setData('search', value)}
                    onSearch={handleSearch}
                    onReset={handleReset}
                    showFilters={showFilters}
                    onToggleFilters={() => setShowFilters(!showFilters)}
                    searchPlaceholder="Search by complaint number, complainant name..."
                    filterContent={
                        showFilters && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground dark:text-gray-300 mb-1">Status</label>
                                    <select
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-foreground dark:text-white"
                                    >
                                        <option value="">All Statuses</option>
                                        <option value="open">Open</option>
                                        <option value="assigned">Assigned</option>
                                        <option value="investigated">Investigated</option>
                                        <option value="resolved">Resolved</option>
                                        <option value="closed">Closed</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground dark:text-gray-300 mb-1">Priority</label>
                                    <select
                                        value={data.priority}
                                        onChange={(e) => setData('priority', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-foreground dark:text-white"
                                    >
                                        <option value="">All Priorities</option>
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="urgent">Urgent</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground dark:text-gray-300 mb-1">Type</label>
                                    <select
                                        value={data.complaint_type}
                                        onChange={(e) => setData('complaint_type', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-foreground dark:text-white"
                                    >
                                        <option value="">All Types</option>
                                        <option value="noise">Noise</option>
                                        <option value="sanitation">Sanitation</option>
                                        <option value="unauthorized_use">Unauthorized Use</option>
                                        <option value="overcrowding">Overcrowding</option>
                                        <option value="fire_hazard">Fire Hazard</option>
                                        <option value="structural">Structural</option>
                                        <option value="parking">Parking</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                        )
                    }
                />

                {complaints.data.length === 0 ? (
                    <AdminEmptyState
                        icon={AlertTriangle}
                        title="No complaints found"
                        description="No complaints match your search criteria"
                    />
                ) : (
                    <div className="bg-white dark:bg-dark-surface shadow-lg rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Complaint No</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Complainant</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Building / Unit</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Priority</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Submitted</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-dark-surface divide-y divide-gray-200 dark:divide-gray-700">
                                    {complaints.data.map((complaint) => (
                                        <tr key={complaint.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground dark:text-white">
                                                {complaint.complaint_no}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground dark:text-white">
                                                {complaint.complainant_name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground dark:text-white">
                                                {getTypeLabel(complaint.complaint_type)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-foreground dark:text-white">
                                                <div>{complaint.building?.building_code || 'N/A'}</div>
                                                {complaint.unit && (
                                                    <div className="text-xs text-muted-foreground dark:text-gray-400">Unit: {complaint.unit.unit_no}</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">{getPriorityBadge(complaint.priority)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(complaint.status)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground dark:text-white">
                                                {complaint.submitted_at}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link
                                                    href={`/admin/occupancy/complaints/${complaint.id}`}
                                                    className="text-primary hover:text-primary/80 inline-flex items-center gap-1"
                                                >
                                                    <Eye size={16} />
                                                    View
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {complaints.links && complaints.links.length > 3 && (
                            <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-muted-foreground dark:text-gray-400">
                                        Showing {complaints.meta.from} to {complaints.meta.to} of {complaints.meta.total} results
                                    </div>
                                    <div className="flex gap-2">
                                        {complaints.links.map((link: any, index: number) => (
                                            <button
                                                key={index}
                                                onClick={() => link.url && router.get(link.url)}
                                                disabled={!link.url}
                                                className={`px-3 py-1 rounded text-sm ${
                                                    link.active
                                                        ? 'bg-primary text-white'
                                                        : 'bg-white dark:bg-dark-surface text-foreground dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                                                } ${!link.url ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
