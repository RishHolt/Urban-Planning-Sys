interface DocumentDetailsStepProps {
    data: {
        applicant_type: string;
        is_representative: boolean;
        project_type: string;
        land_use_type: string;
    };
    setData: (key: string, value: unknown) => void;
    errors: Record<string, string>;
}

export default function DocumentDetailsStep({
    data,
}: DocumentDetailsStepProps) {
    return (
        <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-blue-800 dark:text-blue-200 text-sm">
                    <strong>Document Requirements</strong> — Prepare the following documents for your Zoning Clearance application with the Caloocan City Urban Planning and Development Office. Upload functionality will be available after initial submission via your dashboard.
                </p>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Required Documents</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Based on your applicant type and project classification, the following documents are required:
                </p>

                <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-dark-surface p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <p className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Basic Requirements (For All):</p>
                    <ul className="list-disc list-inside space-y-2">
                        <li>Certified True Copy of TCT/OCT</li>
                        <li>Latest Tax Declaration (Certified by City Assessor)</li>
                        <li>Latest Tax Clearance (Real Property Tax Receipt)</li>
                        <li>Barangay Clearance (for construction)</li>
                        <li>Vicinity Map and Site Development Plan</li>
                        <li>Detailed Building/Lot Plans</li>
                    </ul>

                    {data.applicant_type === 'corporation' && (
                        <>
                            <p className="font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-2">Corporation / Entity Requirements:</p>
                            <ul className="list-disc list-inside space-y-2">
                                <li>SEC Certificate of Incorporation / DTI Business Name</li>
                                <li>Secretary's Certificate or Board Resolution authorizing the signatory</li>
                                <li>Mayor's / Business Permit</li>
                            </ul>
                        </>
                    )}

                    {data.is_representative && (
                        <>
                            <p className="font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-2">Authorized Representative Requirements:</p>
                            <ul className="list-disc list-inside space-y-2">
                                <li>Notarized Special Power of Attorney (SPA) or Authorization Letter</li>
                                <li>Valid Government-issued IDs of both the Owner and Representative</li>
                            </ul>
                        </>
                    )}

                    {data.project_type === 'renovation' || data.project_type === 'addition' ? (
                        <>
                            <p className="font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-2">For Renovation / Addition Projects:</p>
                            <ul className="list-disc list-inside space-y-2">
                                <li>Copy of existing Building Permit</li>
                                <li>As-built plans of the existing structure</li>
                            </ul>
                        </>
                    ) : null}

                    {data.project_type === 'change_of_use' && (
                        <>
                            <p className="font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-2">For Change of Use:</p>
                            <ul className="list-disc list-inside space-y-2">
                                <li>Copy of existing Zoning Clearance / Building Permit</li>
                                <li>Justification letter for the proposed change of use</li>
                            </ul>
                        </>
                    )}
                </div>

                <div className="text-xs text-gray-500 dark:text-gray-400 italic mt-2">
                    Note: The Caloocan City Urban Planning and Development Office may require additional documents depending on project specifics. All documents must be submitted in their original or certified true copy form.
                </div>
            </div>
        </div>
    );
}
