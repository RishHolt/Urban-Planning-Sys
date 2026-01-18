import Button from '../Button';
import Input from '../Input';
import FileUpload from '../FileUpload';
import { CheckCircle, XCircle, FileText } from 'lucide-react';

interface DeclarationsStepProps {
    data: {
        declarationOfTruthfulness: boolean;
        agreementToComply: boolean;
        dataPrivacyConsent: boolean;
        signature?: File | null;
        applicationDate: string;
    };
    setData: (key: string, value: unknown) => void;
    errors: Record<string, string>;
    onSubmit: () => void;
    processing: boolean;
}

export default function DeclarationsStep({
    data,
    setData,
    errors,
    onSubmit,
    processing,
}: DeclarationsStepProps) {
    const allDeclarationsChecked =
        data.declarationOfTruthfulness &&
        data.agreementToComply &&
        data.dataPrivacyConsent &&
        data.signature !== null &&
        data.signature !== undefined;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="mb-2 font-bold text-gray-900 dark:text-white text-2xl">
                    Declarations & Undertaking
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Please read and acknowledge the following declarations.
                </p>
            </div>

            {/* Declaration of Truthfulness */}
            <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <input
                    type="checkbox"
                    id="declarationOfTruthfulness"
                    checked={data.declarationOfTruthfulness}
                    onChange={(e) => setData('declarationOfTruthfulness', e.target.checked)}
                    className="mt-1 border-gray-300 rounded focus:ring-primary text-primary"
                    required
                />
                <label
                    htmlFor="declarationOfTruthfulness"
                    className="flex-1 text-gray-700 dark:text-gray-300 text-sm cursor-pointer"
                >
                    <span className="font-semibold">Declaration of Truthfulness</span>
                    <p className="mt-1 text-gray-600 dark:text-gray-400">
                        I hereby declare that all information provided in this application is true,
                        accurate, and complete to the best of my knowledge. I understand that
                        providing false or misleading information may result in the rejection of
                        this application or legal consequences.
                    </p>
                </label>
            </div>
            {errors.declarationOfTruthfulness && (
                <p className="text-red-500 text-sm">{errors.declarationOfTruthfulness}</p>
            )}

            {/* Agreement to Comply */}
            <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <input
                    type="checkbox"
                    id="agreementToComply"
                    checked={data.agreementToComply}
                    onChange={(e) => setData('agreementToComply', e.target.checked)}
                    className="mt-1 border-gray-300 rounded focus:ring-primary text-primary"
                    required
                />
                <label
                    htmlFor="agreementToComply"
                    className="flex-1 text-gray-700 dark:text-gray-300 text-sm cursor-pointer"
                >
                    <span className="font-semibold">Agreement to Comply with Zoning Laws</span>
                    <p className="mt-1 text-gray-600 dark:text-gray-400">
                        I agree to comply with all applicable zoning laws, regulations, and
                        ordinances. I understand that any violation of these laws may result in
                        penalties, fines, or revocation of permits.
                    </p>
                </label>
            </div>
            {errors.agreementToComply && (
                <p className="text-red-500 text-sm">{errors.agreementToComply}</p>
            )}

            {/* Data Privacy Consent */}
            <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <input
                    type="checkbox"
                    id="dataPrivacyConsent"
                    checked={data.dataPrivacyConsent}
                    onChange={(e) => setData('dataPrivacyConsent', e.target.checked)}
                    className="mt-1 border-gray-300 rounded focus:ring-primary text-primary"
                    required
                />
                <label
                    htmlFor="dataPrivacyConsent"
                    className="flex-1 text-gray-700 dark:text-gray-300 text-sm cursor-pointer"
                >
                    <span className="font-semibold">Data Privacy Consent</span>
                    <p className="mt-1 text-gray-600 dark:text-gray-400">
                        I consent to the collection, processing, and storage of my personal
                        information for the purpose of processing this zoning application. I
                        understand that my information will be handled in accordance with the
                        Data Privacy Act of 2012.
                    </p>
                </label>
            </div>
            {errors.dataPrivacyConsent && (
                <p className="text-red-500 text-sm">{errors.dataPrivacyConsent}</p>
            )}

            {/* Digital Signature */}
            <FileUpload
                label="Digital Signature"
                accept="image/*,.pdf"
                maxSizeMB={5}
                value={data.signature}
                onChange={(file) => setData('signature', file)}
                error={errors.signature}
                required
                allowedTypes={['image/*', 'application/pdf']}
            />
            <p className="text-gray-500 dark:text-gray-400 text-xs">
                Upload a scanned image or PDF of your signature.
            </p>

            {/* Application Date */}
            <Input
                type="date"
                name="applicationDate"
                label="Date of Application"
                value={data.applicationDate}
                onChange={(e) => setData('applicationDate', e.target.value)}
                error={errors.applicationDate}
                required
                disabled
            />

            {/* Submit Button */}
            <div className="pt-4 border-gray-200 dark:border-gray-700 border-t">
                {allDeclarationsChecked ? (
                    <div className="flex items-center gap-2 mb-4 text-green-600 dark:text-green-400 text-sm">
                        <CheckCircle size={20} />
                        <span>All declarations have been acknowledged. You may now submit your application.</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 mb-4 text-orange-600 dark:text-orange-400 text-sm">
                        <XCircle size={20} />
                        <span>Please acknowledge all declarations and provide your signature to proceed.</span>
                    </div>
                )}

                <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    onClick={onSubmit}
                    disabled={!allDeclarationsChecked || processing}
                    className="w-full"
                >
                    {processing ? 'Submitting Application...' : 'Submit Application'}
                </Button>
            </div>
        </div>
    );
}
