import FileUpload from '../../FileUpload';
import { HousingApplicationFormData, DocumentType } from '../../../pages/Applications/Housing/types';
import { getDocumentsToShow, isDocumentRequired, documentLabels } from '../../../pages/Applications/Housing/utils/documentUtils';

interface DocumentsStepProps {
    data: HousingApplicationFormData;
    errors: Record<string, string>;
    onDocumentChange: (key: DocumentType, value: File | null) => void;
}

export default function DocumentsStep({ data, errors, onDocumentChange }: DocumentsStepProps) {
    const getError = (key: string): string | undefined => errors[key];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="mb-2 font-bold text-gray-900 dark:text-white text-2xl">
                    Required Documents
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Upload supporting documents for your application. Only documents relevant to your profile are shown.
                </p>
                {data.beneficiary.priorityStatus && data.beneficiary.priorityStatus !== 'none' && (
                    <p className="mt-2 text-blue-600 dark:text-blue-400 text-sm font-medium">
                        Priority Status: {data.beneficiary.priorityStatus.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} - Additional document required
                    </p>
                )}
            </div>

            <div className="space-y-6">
                {getDocumentsToShow(data).map((docType) => {
                    const label = documentLabels[docType];
                    const isRequired = isDocumentRequired(
                        docType, 
                        data.beneficiary.priorityStatus, 
                        data.beneficiary.civilStatus
                    );
                    return (
                        <FileUpload
                            key={docType}
                            label={`${label}${isRequired ? ' *' : ''}`}
                            accept="image/*,.pdf"
                            maxSizeMB={10}
                            value={data.documents[docType]}
                            onChange={(file) => onDocumentChange(docType, file)}
                            error={getError(`documents.${docType}`)}
                            required={isRequired}
                            allowedTypes={['image/*', 'application/pdf']}
                        />
                    );
                })}
            </div>
        </div>
    );
}
