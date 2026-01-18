import Input from '../Input';
import FileUpload from '../FileUpload';
import { FileText, Map, CheckCircle } from 'lucide-react';

interface DocumentsStepProps {
    data: {
        locationMap?: File | null;
        vicinityMap?: File | null;
        barangayClearanceType?: 'manual' | 'upload';
        barangayClearanceId?: string;
        barangayClearance?: File | null;
        letterOfIntent?: File | null;
        proofOfLegalAuthority?: File | null;
        endorsementsApprovals?: File | null;
        environmentalCompliance?: File | null;
        otherDocuments?: File[] | null;
    };
    setData: (key: string, value: unknown) => void;
    errors: Record<string, string>;
    applicantType?: 'individual' | 'company' | 'developer' | 'Government';
    serviceId?: string;
}

export default function DocumentsStep({
    data,
    setData,
    errors,
    applicantType,
}: DocumentsStepProps) {
    const barangayClearanceType = data.barangayClearanceType || 'manual';
    const isGovernment = applicantType === 'Government';

    const handleBarangayClearanceTypeChange = (type: 'manual' | 'upload') => {
        setData('barangayClearanceType', type);
        // Clear the other field when switching
        if (type === 'manual') {
            setData('barangayClearance', null);
        } else {
            setData('barangayClearanceId', '');
        }
    };

    // Build required documents list based on applicant type
    const requiredDocuments = [
        { key: 'locationMap', label: 'Location Map / Vicinity Map', required: true },
        { key: 'vicinityMap', label: 'Vicinity Map', required: true },
    ];

    if (isGovernment) {
        // Government-specific documents
        requiredDocuments.push(
            { key: 'letterOfIntent', label: 'Letter of Intent / Application', required: true },
            { key: 'proofOfLegalAuthority', label: 'Proof of Legal Authority', required: true },
            { key: 'endorsementsApprovals', label: 'Endorsements / Approvals', required: true }
            // environmentalCompliance is optional, not added to required list
        );
    } else {
        // Barangay Clearance for non-Government applicants
        requiredDocuments.push({
            key: barangayClearanceType === 'manual' ? 'barangayClearanceId' : 'barangayClearance',
            label: 'Barangay Clearance',
            required: true,
        });
    }

    const allRequiredDocumentsUploaded = requiredDocuments.every((doc) => {
        const value = data[doc.key as keyof typeof data];
        if (doc.key === 'barangayClearanceId') {
            return value !== null && value !== undefined && (value as string).trim().length > 0;
        }
        return value !== null && value !== undefined;
    });

    return (
        <div className="space-y-6">
            <div>
                <h2 className="mb-2 font-bold text-gray-900 dark:text-white text-2xl">
                    Required Documents
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Upload supporting documents for your application.
                </p>
            </div>

            {/* Required Documents Status */}
            {allRequiredDocumentsUploaded ? (
                <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 p-4 border border-green-200 dark:border-green-800 rounded-lg">
                    <CheckCircle size={20} className="text-green-500" />
                    <p className="text-green-800 dark:text-green-200 text-sm">
                        All required documents have been uploaded.
                    </p>
                </div>
            ) : (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                        ⚠️ Please upload all required documents before proceeding.
                    </p>
                </div>
            )}

            {/* Location Map */}
            <FileUpload
                label="Location Map / Vicinity Map"
                accept="image/*,.pdf"
                maxSizeMB={10}
                value={data.locationMap}
                onChange={(file) => setData('locationMap', file)}
                error={errors.locationMap}
                required
                allowedTypes={['image/*', 'application/pdf']}
            />

            {/* Vicinity Map */}
            <FileUpload
                label="Vicinity Map"
                accept="image/*,.pdf"
                maxSizeMB={10}
                value={data.vicinityMap}
                onChange={(file) => setData('vicinityMap', file)}
                error={errors.vicinityMap}
                required
                allowedTypes={['image/*', 'application/pdf']}
            />

            {/* Barangay Clearance - Only for non-Government applicants */}
            {!isGovernment && (
                <div>
                    <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                        Barangay Clearance <span className="text-red-500">*</span>
                    </label>

                    {/* Type Selection */}
                    <div className="gap-4 grid grid-cols-2 mb-4">
                        <label className="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg transition-colors cursor-pointer">
                            <input
                                type="radio"
                                name="barangayClearanceType"
                                value="manual"
                                checked={barangayClearanceType === 'manual'}
                                onChange={() => handleBarangayClearanceTypeChange('manual')}
                                className="text-primary"
                            />
                            <span className="text-gray-700 dark:text-gray-300">Barangay Clearance ID</span>
                        </label>
                        <label className="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg transition-colors cursor-pointer">
                            <input
                                type="radio"
                                name="barangayClearanceType"
                                value="upload"
                                checked={barangayClearanceType === 'upload'}
                                onChange={() => handleBarangayClearanceTypeChange('upload')}
                                className="text-primary"
                            />
                            <span className="text-gray-700 dark:text-gray-300">Upload Document</span>
                        </label>
                    </div>

                    {/* Manual Input */}
                    {barangayClearanceType === 'manual' && (
                        <Input
                            type="text"
                            name="barangayClearanceId"
                            label="Barangay Clearance ID"
                            placeholder="Enter Barangay Clearance ID"
                            value={data.barangayClearanceId || ''}
                            onChange={(e) => setData('barangayClearanceId', e.target.value)}
                            icon={<FileText size={20} />}
                            error={errors.barangayClearanceId}
                            required
                        />
                    )}

                    {/* File Upload */}
                    {barangayClearanceType === 'upload' && (
                        <FileUpload
                            label="Barangay Clearance Document"
                            accept="image/*,.pdf"
                            maxSizeMB={5}
                            value={data.barangayClearance}
                            onChange={(file) => setData('barangayClearance', file)}
                            error={errors.barangayClearance}
                            required
                            allowedTypes={['image/*', 'application/pdf']}
                        />
                    )}
                </div>
            )}

            {/* Government-Specific Documents */}
            {isGovernment && (
                <>
                    {/* Letter of Intent / Application */}
                    <div>
                        <FileUpload
                            label="Letter of Intent / Application"
                            accept="image/*,.pdf"
                            maxSizeMB={10}
                            value={data.letterOfIntent}
                            onChange={(file) => setData('letterOfIntent', file)}
                            error={errors.letterOfIntent}
                            required
                            allowedTypes={['image/*', 'application/pdf']}
                        />
                        <p className="mt-1 text-gray-500 dark:text-gray-400 text-xs">
                            From government agency requesting zoning clearance, signed by authorized official.
                        </p>
                    </div>

                    {/* Proof of Legal Authority */}
                    <div>
                        <FileUpload
                            label="Proof of Legal Authority"
                            accept="image/*,.pdf"
                            maxSizeMB={10}
                            value={data.proofOfLegalAuthority}
                            onChange={(file) => setData('proofOfLegalAuthority', file)}
                            error={errors.proofOfLegalAuthority}
                            required
                            allowedTypes={['image/*', 'application/pdf']}
                        />
                        <p className="mt-1 text-gray-500 dark:text-gray-400 text-xs">
                            Government charter, enabling law, executive order, or agency mandate.
                        </p>
                    </div>

                    {/* Endorsements / Approvals */}
                    <div>
                        <FileUpload
                            label="Endorsements / Approvals"
                            accept="image/*,.pdf"
                            maxSizeMB={10}
                            value={data.endorsementsApprovals}
                            onChange={(file) => setData('endorsementsApprovals', file)}
                            error={errors.endorsementsApprovals}
                            required
                            allowedTypes={['image/*', 'application/pdf']}
                        />
                        <p className="mt-1 text-gray-500 dark:text-gray-400 text-xs">
                            Endorsement from municipal/city planning office and other regulatory approvals.
                        </p>
                    </div>

                    {/* Environmental Compliance Certificate (ECC) - Optional */}
                    <div>
                        <FileUpload
                            label="Environmental Compliance Certificate (ECC)"
                            accept="image/*,.pdf"
                            maxSizeMB={10}
                            value={data.environmentalCompliance}
                            onChange={(file) => setData('environmentalCompliance', file)}
                            error={errors.environmentalCompliance}
                            allowedTypes={['image/*', 'application/pdf']}
                        />
                        <p className="mt-1 text-gray-500 dark:text-gray-400 text-xs">
                            From DENR if project falls under environmental regulation. (Optional)
                        </p>
                    </div>
                </>
            )}

            {/* Other Supporting Documents */}
            <div>
                <FileUpload
                    label="Other Supporting Documents (Optional)"
                    accept="image/*,.pdf"
                    maxSizeMB={10}
                    multiple
                    value={data.otherDocuments}
                    onChange={(files) => setData('otherDocuments', files)}
                    error={errors.otherDocuments}
                    allowedTypes={['image/*', 'application/pdf']}
                />
                <p className="mt-1 text-gray-500 dark:text-gray-400 text-xs">
                    You can upload additional documents that support your application.
                </p>
            </div>

            {/* Document Requirements Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h3 className="mb-2 font-semibold text-blue-900 dark:text-blue-200 text-sm">
                    Document Requirements:
                </h3>
                <ul className="space-y-1 text-blue-800 dark:text-blue-200 text-xs list-disc list-inside">
                    <li>All documents must be clear and legible</li>
                    <li>Maximum file size: 10MB per document</li>
                    <li>Accepted formats: PDF, JPG, PNG</li>
                    {isGovernment ? (
                        <li>Government applications require Letter of Intent, Proof of Legal Authority, and Endorsements/Approvals. ECC is optional if applicable.</li>
                    ) : (
                        <li>Documents should be recent (within 6 months for clearances)</li>
                    )}
                </ul>
            </div>
        </div>
    );
}
