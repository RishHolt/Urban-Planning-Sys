import { useState } from 'react';
import { router, Link } from '@inertiajs/react';
import AdminLayout from '../../../../components/AdminLayout';
import AdminContentCard from '../../../../components/AdminContentCard';
import Button from '../../../../components/Button';
import { Plus, Search, Filter, Eye, FileWarning } from 'lucide-react';

interface Violation {
    id: number;
    violation_no: string;
    violation_type: string;
    severity: string;
    status: string;
    violation_date: string;
    compliance_deadline?: string;
    description: string;
    building?: {
        id: number;
        building_code: string;
    };
    unit?: {
        id: number;
        unit_no: string;
    };
    issued_by?: {
        id: number;
        name: string;
    };
}

interface ViolationsIndexProps {
    violations: {
        data: Violation[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    filters?: {
        search?: string;
        status?: string;
        violation_type?: string;
        severity?: string;
        open?: string;
    };
}

export default function ViolationsIndex({ violations, filters = {} }: ViolationsIndexProps) {
    const [showFilters, setShowFilters] = useState(false);
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [violationType, setViolationType] = useState(filters.violation_type || '');
    const [severity, setSeverity] = useState(filters.severity || '');

    const handleSearch = () => {
        router.get('/admin/occupancy/violations', {
            search,
            status: status || undefined,
            violation_type: violationType || undefined,
            severity: severity || undefined,
            open: filters.open || undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleReset = () => {
        setSearch('');
        setStatus('');
        setViolationType('');
        setSeverity('');
        router.get('/admin/occupancy/violations');
    };

    const getSeverityColor = (severity: string) => {
        const colors: Record<string, string> = {
            critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
            major: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
            minor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        };
        return colors[severity] || 'bg-gray-100 text-gray-800';
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            open: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
            under_review: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            resolved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            appealed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            closed: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <AdminLayout
            title="Violations"
            description="Track and manage compliance violations"
        >
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <p className="text-gray-600 dark:text-gray-400">
                        Total: {violations.total} violations
                    </p>
                    <Link href="/admin/occupancy/violations/create">
                        <Button variant="primary">
                            <Plus className="mr-2 w-4 h-4" />
                            Issue Violation
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
                                        placeholder="Violation no., description..."
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
                                    <option value="under_review">Under Review</option>
                                    <option value="resolved">Resolved</option>
                                    <option value="appealed">Appealed</option>
                                    <option value="closed">Closed</option>
                                </select>
                            </div>

                            <div>
                                <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                    Violation Type
                                </label>
                                <select
                                    value={violationType}
                                    onChange={(e) => setViolationType(e.target.value)}
                                    className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg w-full text-gray-900 dark:text-white"
                                >
                                    <option value="">All Types</option>
                                    <option value="unauthorized_use">Unauthorized Use</option>
                                    <option value="overcrowding">Overcrowding</option>
                                    <option value="structural_modification">Structural Modification</option>
                                    <option value="fire_safety">Fire Safety</option>
                                    <option value="sanitation">Sanitation</option>
                                    <option value="noise">Noise</option>
                                    <option value="parking">Parking</option>
                                    <option value="maintenance">Maintenance</option>
                                    <option value="documentation">Documentation</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                    Severity
                                </label>
                                <select
                                    value={severity}
                                    onChange={(e) => setSeverity(e.target.value)}
                                    className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg w-full text-gray-900 dark:text-white"
                                >
                                    <option value="">All Severities</option>
                                    <option value="critical">Critical</option>
                                    <option value="major">Major</option>
                                    <option value="minor">Minor</option>
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

                {/* Violations Table */}
                <AdminContentCard>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-gray-200 dark:border-gray-700 border-b">
                                    <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white text-sm text-left">Violation No.</th>
                                    <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white text-sm text-left">Type</th>
                                    <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white text-sm text-left">Building/Unit</th>
                                    <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white text-sm text-left">Severity</th>
                                    <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white text-sm text-left">Status</th>
                                    <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white text-sm text-left">Date</th>
                                    <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white text-sm text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {violations.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-8 text-gray-500 dark:text-gray-400 text-center">
                                            No violations found
                                        </td>
                                    </tr>
                                ) : (
                                    violations.data.map((violation) => (
                                        <tr key={violation.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700 border-b">
                                            <td className="px-4 py-3">
                                                <span className="font-mono text-gray-900 dark:text-white text-sm">
                                                    {violation.violation_no}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-gray-600 dark:text-gray-400 text-sm capitalize">
                                                    {violation.violation_type.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="text-sm">
                                                    <p className="text-gray-900 dark:text-white">
                                                        {violation.building?.building_code || 'N/A'}
                                                    </p>
                                                    {violation.unit && (
                                                        <p className="text-gray-500 dark:text-gray-400 text-xs">
                                                            Unit {violation.unit.unit_no}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`text-xs px-2 py-1 rounded capitalize ${getSeverityColor(violation.severity)}`}>
                                                    {violation.severity}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`text-xs px-2 py-1 rounded capitalize ${getStatusColor(violation.status)}`}>
                                                    {violation.status.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-sm">
                                                {new Date(violation.violation_date).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Link href={`/admin/occupancy/violations/${violation.id}`}>
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
                    {violations.last_page > 1 && (
                        <div className="flex justify-center gap-2 mt-4">
                            {violations.links.map((link, index) => (
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
