import Input from '../Input';
import FileUpload from '../FileUpload';
import { User, MapPin, Phone, FileText } from 'lucide-react';

interface PropertyOwnerStepProps {
    data: {
        isPropertyOwner: boolean;
        applicantName?: string;
        applicantContact?: string;
        ownerName?: string;
        ownerAddress?: string;
        ownerContact?: string;
        proofOfOwnership?: File | null;
        taxDeclarationType?: 'manual' | 'upload';
        taxDeclarationId?: string;
        taxDeclaration?: File | null;
    };
    setData: (key: string, value: unknown) => void;
    errors: Record<string, string>;
}

export default function PropertyOwnerStep({
    data,
    setData,
    errors,
}: PropertyOwnerStepProps) {
    const taxDeclarationType = data.taxDeclarationType || 'manual';

    const handleTaxDeclarationTypeChange = (type: 'manual' | 'upload') => {
        setData('taxDeclarationType', type);
        // Clear the other field when switching
        if (type === 'manual') {
            setData('taxDeclaration', null);
        } else {
            setData('taxDeclarationId', '');
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="mb-2 font-bold text-gray-900 dark:text-white text-2xl">
                    Property Owner Information
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Identify the legal owner of the property.
                </p>
            </div>

            {data.isPropertyOwner ? (
                <div className="bg-green-50 dark:bg-green-900/20 p-4 border border-green-200 dark:border-green-800 rounded-lg">
                    <p className="text-green-800 dark:text-green-200 text-sm">
                        Since you are the property owner, your information will be used automatically.
                        Please verify the details below.
                    </p>
                </div>
            ) : (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-blue-800 dark:text-blue-200 text-sm">
                        Please provide the property owner's information below.
                    </p>
                </div>
            )}

            <Input
                type="text"
                name="ownerName"
                label="Owner Name"
                placeholder="Enter owner name"
                value={data.isPropertyOwner ? data.applicantName || '' : data.ownerName || ''}
                onChange={(e) => setData('ownerName', e.target.value)}
                icon={<User size={20} />}
                error={errors.ownerName}
                required
                disabled={data.isPropertyOwner}
            />

            <Input
                type="text"
                name="ownerAddress"
                label="Owner Address"
                placeholder="Enter owner address"
                value={data.ownerAddress || ''}
                onChange={(e) => setData('ownerAddress', e.target.value)}
                icon={<MapPin size={20} />}
                error={errors.ownerAddress}
                required
            />

            <Input
                type="tel"
                name="ownerContact"
                label="Owner Contact Number"
                placeholder="09XX XXX XXXX"
                value={data.isPropertyOwner ? data.applicantContact || '' : data.ownerContact || ''}
                onChange={(e) => setData('ownerContact', e.target.value)}
                icon={<Phone size={20} />}
                error={errors.ownerContact}
                required
                disabled={data.isPropertyOwner}
            />

            <FileUpload
                label="Transfer Certificate of Title (TCT)"
                accept="image/*,.pdf"
                maxSizeMB={10}
                value={data.proofOfOwnership}
                onChange={(file) => setData('proofOfOwnership', file)}
                error={errors.proofOfOwnership}
                required
                allowedTypes={['image/*', 'application/pdf']}
            />

            {/* Tax Declaration */}
            <div>
                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                    Tax Declaration <span className="text-red-500">*</span>
                </label>
                
                {/* Type Selection */}
                <div className="gap-4 grid grid-cols-2 mb-4">
                    <label className="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg transition-colors cursor-pointer">
                        <input
                            type="radio"
                            name="taxDeclarationType"
                            value="manual"
                            checked={taxDeclarationType === 'manual'}
                            onChange={() => handleTaxDeclarationTypeChange('manual')}
                            className="text-primary"
                        />
                        <span className="text-gray-700 dark:text-gray-300">Tax Declaration ID</span>
                    </label>
                    <label className="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg transition-colors cursor-pointer">
                        <input
                            type="radio"
                            name="taxDeclarationType"
                            value="upload"
                            checked={taxDeclarationType === 'upload'}
                            onChange={() => handleTaxDeclarationTypeChange('upload')}
                            className="text-primary"
                        />
                        <span className="text-gray-700 dark:text-gray-300">Upload Document</span>
                    </label>
                </div>

                {/* Manual Input */}
                {taxDeclarationType === 'manual' && (
                    <Input
                        type="text"
                        name="taxDeclarationId"
                        label="Tax Declaration ID"
                        placeholder="Enter Tax Declaration ID"
                        value={data.taxDeclarationId || ''}
                        onChange={(e) => setData('taxDeclarationId', e.target.value)}
                        icon={<FileText size={20} />}
                        error={errors.taxDeclarationId}
                        required
                    />
                )}

                {/* File Upload */}
                {taxDeclarationType === 'upload' && (
                    <FileUpload
                        label="Tax Declaration Document"
                        accept="image/*,.pdf"
                        maxSizeMB={10}
                        value={data.taxDeclaration}
                        onChange={(file) => setData('taxDeclaration', file)}
                        error={errors.taxDeclaration}
                        required
                        allowedTypes={['image/*', 'application/pdf']}
                    />
                )}
            </div>
        </div>
    );
}
