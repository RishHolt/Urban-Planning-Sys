import Input from '../../Input';
import { HousingApplicationFormData } from '../../../pages/Applications/Housing/types';

interface ContactAddressStepProps {
    data: HousingApplicationFormData;
    errors: Record<string, string>;
    onFieldChange: (key: keyof HousingApplicationFormData['beneficiary'], value: any) => void;
    onBlur: (fieldKey: string) => void;
}

export default function ContactAddressStep({ data, errors, onFieldChange, onBlur }: ContactAddressStepProps) {
    const getError = (key: string): string | undefined => {
        return errors[key];
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="mb-2 font-bold text-gray-900 dark:text-white text-2xl">
                    Contact & Address
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Provide your contact information and address details.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                    label="Contact Number"
                    placeholder="09XXXXXXXXX"
                    value={data.beneficiary.contactNumber}
                    onChange={(e) => onFieldChange('contactNumber', e.target.value)}
                    onBlur={() => onBlur('beneficiary.contactNumber')}
                    error={getError('beneficiary.contactNumber')}
                    required
                />
                <Input
                    label="Email"
                    type="email"
                    value={data.beneficiary.email}
                    onChange={(e) => onFieldChange('email', e.target.value)}
                    onBlur={() => onBlur('beneficiary.email')}
                    error={getError('beneficiary.email')}
                    required
                />
                <div className="md:col-span-2">
                    <Input
                        label="Current Address"
                        value={data.beneficiary.currentAddress}
                        onChange={(e) => onFieldChange('currentAddress', e.target.value)}
                        onBlur={() => onBlur('beneficiary.currentAddress')}
                        error={getError('beneficiary.currentAddress')}
                        required
                    />
                </div>
                <Input
                    label="Barangay"
                    value={data.beneficiary.barangay}
                    onChange={(e) => onFieldChange('barangay', e.target.value)}
                    onBlur={() => onBlur('beneficiary.barangay')}
                    error={getError('beneficiary.barangay')}
                    required
                />
                <Input
                    label="Years of Residency"
                    type="number"
                    value={data.beneficiary.yearsOfResidency}
                    onChange={(e) => onFieldChange('yearsOfResidency', e.target.value)}
                    onBlur={() => onBlur('beneficiary.yearsOfResidency')}
                    error={getError('beneficiary.yearsOfResidency')}
                    required
                />
            </div>
        </div>
    );
}
