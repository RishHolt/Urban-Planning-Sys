import { Link, usePage } from '@inertiajs/react';
import AdminLayout from '../../../components/AdminLayout';
import AdminContentCard from '../../../components/AdminContentCard';
import { ArrowLeft, AlertTriangle, Building, Eye, CheckCircle } from 'lucide-react';

interface ComplaintShowProps {
    complaint: {
        id: string;
        complaint_no: string;
        complainant_name: string;
        complainant_contact: string | null;
        complaint_type: string;
        description: string;
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
        assigned_to: number | null;
        inspection: {
            id: string;
            inspection_date: string | null;
            result: string | null;
            photos: Array<{ id: string; photo_path: string; photo_description: string | null }>;
        } | null;
        resolution: string | null;
        resolved_at: string | null;
        submitted_at: string;
    };
}

export default function ComplaintShow({ complaint }: ComplaintShowProps) {
    const { flash } = usePage<{ flash?: { success?: string } }>().props;

    const getPriorityBadge = (priority: string) => {
        const config: Record<string, { label: string; className: string }> = {
            'low': { label: 'Low', className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' },
            'medium': { label: 'Medium', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
            'high': { label: 'High', className: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
            'urgent': { label: 'Urgent', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
        };
        const c = config[priority] || config['medium'];
        return <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${c.className}`}>{c.label}</span>;
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
        return <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${c.className}`}>{c.label}</span>;
    };

    return (
        <AdminLayout
            title={`Complaint ${complaint.complaint_no}`}
            description="Complaint Details"
            backButton={{
                href: '/admin/occupancy/complaints',
                label: 'Back to Complaints',
            }}
        >
            {flash?.success && (
                <div className="mb-4 p-4 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg">
                    {flash.success}
                </div>
            )}

            <div className="space-y-6">
                <AdminContentCard>
                    <h2 className="text-lg font-semibold text-foreground dark:text-white mb-4 flex items-center gap-2">
                        <AlertTriangle size={20} />
                        Complaint Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-sm font-medium text-muted-foreground dark:text-gray-400">Complaint Number</label>
                            <p className="text-foreground dark:text-white font-medium">{complaint.complaint_no}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground dark:text-gray-400">Status</label>
                            <div className="mt-1">{getStatusBadge(complaint.status)}</div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground dark:text-gray-400">Priority</label>
                            <div className="mt-1">{getPriorityBadge(complaint.priority)}</div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground dark:text-gray-400">Type</label>
                            <p className="text-foreground dark:text-white">{complaint.complaint_type}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground dark:text-gray-400 flex items-center gap-2">
                                <Building size={16} />
                                Building
                            </label>
                            <p className="text-foreground dark:text-white">{complaint.building?.building_code || 'N/A'}</p>
                            {complaint.building?.building_name && (
                                <p className="text-sm text-muted-foreground dark:text-gray-400">{complaint.building.building_name}</p>
                            )}
                        </div>
                        {complaint.unit && (
                            <div>
                                <label className="text-sm font-medium text-muted-foreground dark:text-gray-400">Unit</label>
                                <p className="text-foreground dark:text-white">{complaint.unit.unit_no}</p>
                            </div>
                        )}
                        <div>
                            <label className="text-sm font-medium text-muted-foreground dark:text-gray-400">Complainant</label>
                            <p className="text-foreground dark:text-white">{complaint.complainant_name}</p>
                        </div>
                        {complaint.complainant_contact && (
                            <div>
                                <label className="text-sm font-medium text-muted-foreground dark:text-gray-400">Contact</label>
                                <p className="text-foreground dark:text-white">{complaint.complainant_contact}</p>
                            </div>
                        )}
                        <div>
                            <label className="text-sm font-medium text-muted-foreground dark:text-gray-400">Submitted At</label>
                            <p className="text-foreground dark:text-white">{complaint.submitted_at}</p>
                        </div>
                        {complaint.resolved_at && (
                            <div>
                                <label className="text-sm font-medium text-muted-foreground dark:text-gray-400">Resolved At</label>
                                <p className="text-foreground dark:text-white">{complaint.resolved_at}</p>
                            </div>
                        )}
                    </div>
                </AdminContentCard>

                <AdminContentCard>
                    <h2 className="text-lg font-semibold text-foreground dark:text-white mb-4">Description</h2>
                    <p className="text-foreground dark:text-white whitespace-pre-wrap">{complaint.description}</p>
                </AdminContentCard>

                {complaint.inspection && (
                    <AdminContentCard>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-foreground dark:text-white flex items-center gap-2">
                                <CheckCircle size={20} />
                                Related Inspection
                            </h2>
                            <Link
                                href={`/admin/occupancy/inspections/${complaint.inspection.id}`}
                                className="inline-flex items-center gap-2 text-primary hover:text-primary/80"
                            >
                                <Eye size={16} />
                                View Inspection
                            </Link>
                        </div>
                        <div className="space-y-4">
                            {complaint.inspection.inspection_date && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground dark:text-gray-400">Inspection Date</label>
                                    <p className="text-foreground dark:text-white">{complaint.inspection.inspection_date}</p>
                                </div>
                            )}
                            {complaint.inspection.result && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground dark:text-gray-400">Result</label>
                                    <p className="text-foreground dark:text-white">{complaint.inspection.result}</p>
                                </div>
                            )}
                            {complaint.inspection.photos && complaint.inspection.photos.length > 0 && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground dark:text-gray-400 mb-2 block">Photos</label>
                                    <div className="grid grid-cols-3 gap-4">
                                        {complaint.inspection.photos.map((photo) => (
                                            <img
                                                key={photo.id}
                                                src={`/storage/${photo.photo_path}`}
                                                alt={photo.photo_description || 'Inspection photo'}
                                                className="w-full h-32 object-cover rounded-lg"
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </AdminContentCard>
                )}

                {complaint.resolution && (
                    <AdminContentCard>
                        <h2 className="text-lg font-semibold text-foreground dark:text-white mb-4">Resolution</h2>
                        <p className="text-foreground dark:text-white whitespace-pre-wrap">{complaint.resolution}</p>
                    </AdminContentCard>
                )}

                {!complaint.inspection && complaint.status !== 'resolved' && (
                    <div className="flex justify-end">
                        <Link
                            href={`/admin/occupancy/inspections/create?complaint_id=${complaint.id}&building_id=${complaint.building?.id}&unit_id=${complaint.unit?.id}`}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                        >
                            Schedule Inspection
                        </Link>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
