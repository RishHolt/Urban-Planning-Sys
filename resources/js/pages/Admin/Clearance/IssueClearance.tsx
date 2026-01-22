import { useForm, router } from '@inertiajs/react';
import AdminLayout from '../../../components/AdminLayout';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import { FileText, AlertCircle } from 'lucide-react';

interface ClearanceApplication {
    id: number;
    reference_no: string;
    lot_address: string;
    lot_owner: string;
    status: string;
}

interface IssueClearanceProps {
    application: ClearanceApplication;
}

export default function IssueClearance({ application }: IssueClearanceProps) {
    const { data, setData, post, processing, errors } = useForm({
        application_id: application.id,
        issue_date: new Date().toISOString().split('T')[0],
        valid_until: '',
        conditions: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/clearances', {
            preserveScroll: true,
        });
    };

    if (application.status !== 'approved') {
        return (
            <AdminLayout
                title="Issue Clearance"
                description="Issue zoning clearance certificate"
            >
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="text-yellow-600 dark:text-yellow-400 mt-0.5" size={20} />
                        <div>
                            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                Application Not Ready
                            </h3>
                            <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                                This application must be approved before a clearance can be issued. Current status: <strong>{application.status}</strong>
                            </p>
                        </div>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout
            title="Issue Clearance"
            description="Issue zoning clearance certificate"
        >
            <div className="max-w-3xl mx-auto">
                <div className="bg-white dark:bg-dark-surface rounded-lg shadow-md p-6 space-y-6">
                    {/* Application Info */}
                    <div className="border-b pb-4">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                            Application Information
                        </h2>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-gray-500 dark:text-gray-400">Reference Number:</span>
                                <p className="font-medium text-gray-900 dark:text-white">{application.reference_no}</p>
                            </div>
                            <div>
                                <span className="text-gray-500 dark:text-gray-400">Lot Owner:</span>
                                <p className="font-medium text-gray-900 dark:text-white">{application.lot_owner}</p>
                            </div>
                            <div className="col-span-2">
                                <span className="text-gray-500 dark:text-gray-400">Location:</span>
                                <p className="font-medium text-gray-900 dark:text-white">{application.lot_address}</p>
                            </div>
                        </div>
                    </div>

                    {/* Clearance Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <Input
                                label="Issue Date *"
                                type="date"
                                value={data.issue_date}
                                onChange={(e) => setData('issue_date', e.target.value)}
                                error={errors.issue_date}
                                required
                            />
                        </div>

                        <div>
                            <Input
                                label="Valid Until"
                                type="date"
                                value={data.valid_until}
                                onChange={(e) => setData('valid_until', e.target.value)}
                                error={errors.valid_until}
                                helpText="Leave empty if clearance does not expire"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Conditions
                            </label>
                            <textarea
                                value={data.conditions}
                                onChange={(e) => setData('conditions', e.target.value)}
                                rows={6}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
                                placeholder="Enter any conditions or requirements for this clearance (optional)..."
                            />
                            {errors.conditions && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.conditions}</p>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => router.visit(`/admin/clearance/applications/${application.id}`)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Issuing...' : 'Issue Clearance'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
