interface DocumentDetailsStepProps {
    data: any;
    setData: (key: string, value: unknown) => void;
    errors: Record<string, string>;
}

export default function DocumentDetailsStep({
    data,
    setData,
    errors,
}: DocumentDetailsStepProps) {
    return (
        <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-blue-800 dark:text-blue-200 text-sm">
                    <strong>Phase 4: Document Requirements</strong> - Please prepare the following documents. Upload functionality will be available in the next phase or via your dashboard after initial submission.
                </p>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Required Documents</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Based on your application type ({data.applicant_type}) and project ({data.project_type}), the following documents are typically required:
                </p>

                <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-dark-surface p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <li>Certified True Copy of Tax Declaration</li>
                    <li>Barangay Clearance/Permit</li>
                    <li>Lot Title / Transfer Certificate of Title (TCT)</li>
                    <li>Building Plans (Site Development Plan, Floor Plans, etc.)</li>
                    <li>Bill of Materials and Cost Estimates</li>
                    {data.applicant_type === 'business' && (
                        <li>Business Permit / DTI / SEC Registration</li>
                    )}
                    {data.is_representative && (
                        <li>Special Power of Attorney (SPA) or Authorization Letter</li>
                    )}
                </ul>

                <div className="text-xs text-gray-500 italic mt-4">
                    Note: You will be prompted to upload these files after submitting this initial application form.
                </div>
            </div>
        </div>
    );
}
