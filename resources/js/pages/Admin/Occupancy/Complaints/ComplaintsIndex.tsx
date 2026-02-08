import { useState } from 'react';
import { router, Link } from '@inertiajs/react';
import AdminLayout from '../../../../components/AdminLayout';
import AdminContentCard from '../../../../components/AdminContentCard';
import Button from '../../../../components/Button';
import { Plus, Search, Filter, Eye, AlertTriangle } from 'lucide-react';

interface Complaint {
    id: number;
    complaint_no: string;
    complaint_type: string;
    priority: string;
    status: string;
    complainant_name: string;
    description: string;
    submitted_at: string;
    building?: {
        id: number;
        building_code: string;
    };
    unit?: {
        id: number;
        unit_no: string;
    };
    assigned_to?: {
        id: number;
        name: string;
    };
}

interface ComplaintsIndexProps {
    complaints: {
        data: Complaint[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    filters?: {
        search?: string;
        status?: string;
        priority?: string;
        complaint_type?: string;
    };
}

export default function ComplaintsIndex({ complaints, filters = {} }: ComplaintsIndexProps) {
    const [showFilters, setShowFilters] = useState(false);
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [priority, setPriority] = useState(filters.priority || '');
    const [complaintType, setComplaintType] = useState(filters.complaint_type || '');

    const handleSearch = () => {
        router.get('/admin/occupancy/complaints', {
            search,
            status: status || undefined,
            priority: priority || undefined,
            complaint_type: complaintType || undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleReset = () => {
        setSearch('');
        setStatus('');
        setPriority('');
        setComplaintType('');
        router.get('/admin/occupancy/complaints');
    };

    const getPriorityColor = (priority: string) => {
        const colors: Record<string, string> = {
            urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
            high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
            medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            low: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        };
        return colors[priority] || 'bg-gray-100 text-gray-800';
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            open: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
            assigned: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            investigated: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            resolved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            closed: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <AdminLayout
            title="Complaints"
            description="Manage and track occupancy-related complaints"
        >
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <p className="text-gray-600 dark:text-gray-400">
                        Total: {complaints.total} complaints
                    </p>
                    <Link href="/admin/occupancy/complaints/create">
                        <Button variant="primary">
                            <Plus className="mr-2 w-4 h-4" />
                            Register Complaint
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <AdminContentCard>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-semibold text-gray-900 dark:text-white text-lg">Filters</h2>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="text-primary hover:underline"
                        >
                            <Filter className="inline mr-1 w-4 h-4" />
                            {showFilters ? 'Hide' : 'Show'} Filters
                        </button>
                    </div>

                    {showFilters && (
                        <div className="gap-4 grid grid-cols-1 md:grid-cols-4">
                            <div>
                                <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                    Search
                                </label>
                                <div className="relative">
                                    <Search className="top-1/2 left-3 absolute w-4 h-4 text-gray-400 -translate-y-1/2 transform" />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Complaint no., complainant..."
                                        className="bg-white dark:bg-gray-800 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg w-full text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                    Status
                                </label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg w-full text-gray-900 dark:text-white"
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
                                <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                    Priority
                                </label>
                                <select
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value)}
                                    className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg w-full text-gray-900 dark:text-white"
                                >
                                    <option value="">All Priorities</option>
                                    <option value="urgent">Urgent</option>
                                    <option value="high">High</option>
                                    <option value="medium">Medium</option>
                                    <option value="low">Low</option>
                                </select>
                            </div>

                            <div>
                                <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                    Complaint Type
                                </label>
                                <select
                                    value={complaintType}
                                    onChange={(e) => setComplaintType(e.target.value)}
                                    className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg w-full text-gray-900 dark:text-white"
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
                    )}

                    <div className="flex gap-2 mt-4">
                        <Button variant="primary" onClick={handleSearch}>
                            Search
                        </Button>
                        <Button variant="secondary" onClick={handleReset}>
                            Reset
                        </Button>
                    </div>
                </AdminContentCard>

                {/* Complaints Table */}
                <AdminContentCard>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-gray-200 dark:border-gray-700 border-b">
                                    <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white text-sm text-left">Complaint No.</th>
                                    <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white text-sm text-left">Type</th>
                                    <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white text-sm text-left">Complainant</th>
                                    <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white text-sm text-left">Building/Unit</th>
                                    <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white text-sm text-left">Priority</th>
                                    <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white text-sm text-left">Status</th>
                                    <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white text-sm text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {complaints.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-8 text-gray-500 dark:text-gray-400 text-center">
                                            No complaints found
                                        </td>
                                    </tr>
                                ) : (
                                    complaints.data.map((complaint) => (
                                        <tr key={complaint.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700 border-b">
                                            <td className="px-4 py-3">
                                                <span className="font-mono text-gray-900 dark:text-white text-sm">
                                                    {complaint.complaint_no}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-gray-600 dark:text-gray-400 text-sm capitalize">
                                                    {complaint.complaint_type.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-900 dark:text-white text-sm">
                                                {complaint.complainant_name}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="text-sm">
                                                    <p className="text-gray-900 dark:text-white">
                                                        {complaint.building?.building_code || 'N/A'}
                                                    </p>
                                                    {complaint.unit && (
                                                        <p className="text-gray-500 dark:text-gray-400 text-xs">
                                                            Unit {complaint.unit.unit_no}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`text-xs px-2 py-1 rounded capitalize ${getPriorityColor(complaint.priority)}`}>
                                                    {complaint.priority}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`text-xs px-2 py-1 rounded capitalize ${getStatusColor(complaint.status)}`}>
                                                    {complaint.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Link href={`/admin/occupancy/complaints/${complaint.id}`}>
                                                    <button className="text-primary hover:text-primary/80">
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {complaints.last_page > 1 && (
                        <div className="flex justify-center gap-2 mt-4">
                            {complaints.links.map((link, index) => (
                                <button
                                    key={index}
                                    onClick={() => link.url && router.get(link.url)}
                                    disabled={!link.url || link.active}
                                    className={`px-3 py-1 rounded ${
                                        link.active
                                            ? 'bg-primary text-white'
                                            : link.url
                                                ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                                : 'bg-gray-50 dark:bg-gray-900 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </AdminContentCard>
            </div>
        </AdminLayout>
    );
}
