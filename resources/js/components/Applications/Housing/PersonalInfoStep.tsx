import Input from '../../Input';
import { HousingApplicationFormData, Gender, CivilStatus } from '../../../pages/Applications/Housing/types';

interface PersonalInfoStepProps {
    data: HousingApplicationFormData;
    errors: Record<string, string>;
    onFieldChange: (key: keyof HousingApplicationFormData['beneficiary'], value: any) => void;
    onBlur: (fieldKey: string) => void;
}

export default function PersonalInfoStep({ data, errors, onFieldChange, onBlur }: PersonalInfoStepProps) {
    const getError = (key: string): string | undefined => errors[key];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="mb-2 font-bold text-gray-900 dark:text-white text-2xl">
                    Personal Information
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Provide your personal details.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                    label="First Name"
                    value={data.beneficiary.firstName}
                    onChange={(e) => onFieldChange('firstName', e.target.value)}
                    onBlur={() => onBlur('beneficiary.firstName')}
                    error={getError('beneficiary.firstName')}
                    required
                />
                <Input
                    label="Last Name"
                    value={data.beneficiary.lastName}
                    onChange={(e) => onFieldChange('lastName', e.target.value)}
                    onBlur={() => onBlur('beneficiary.lastName')}
                    error={getError('beneficiary.lastName')}
                    required
                />
                <Input
                    label="Middle Name"
                    value={data.beneficiary.middleName}
                    onChange={(e) => onFieldChange('middleName', e.target.value)}
                    onBlur={() => onBlur('beneficiary.middleName')}
                    error={getError('beneficiary.middleName')}
                />
                <Input
                    type="date"
                    label="Birth Date"
                    value={data.beneficiary.birthDate}
                    onChange={(e) => onFieldChange('birthDate', e.target.value)}
                    onBlur={() => onBlur('beneficiary.birthDate')}
                    error={getError('beneficiary.birthDate')}
                    required
                />
                <div className="w-full">
                    <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                        Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={data.beneficiary.gender}
                        onChange={(e) => onFieldChange('gender', e.target.value as Gender)}
                        onBlur={() => onBlur('beneficiary.gender')}
                        className={`
                            w-full px-4 py-3 rounded-lg border transition-colors
                            ${getError('beneficiary.gender')
                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                : 'border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary'
                            }
                            bg-white dark:bg-dark-surface
                            text-gray-900 dark:text-white
                            focus:outline-none focus:ring-2 focus:ring-opacity-20
                        `}
                    >
                        <option value="">Select...</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                    </select>
                    {getError('beneficiary.gender') && <p className="mt-1 text-red-500 text-sm">{getError('beneficiary.gender')}</p>}
                </div>
                <div className="w-full">
                    <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                        Civil Status <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={data.beneficiary.civilStatus}
                        onChange={(e) => onFieldChange('civilStatus', e.target.value as CivilStatus)}
                        onBlur={() => onBlur('beneficiary.civilStatus')}
                        className={`
                            w-full px-4 py-3 rounded-lg border transition-colors
                            ${getError('beneficiary.civilStatus')
                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                : 'border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary'
                            }
                            bg-white dark:bg-dark-surface
                            text-gray-900 dark:text-white
                            focus:outline-none focus:ring-2 focus:ring-opacity-20
                        `}
                        required
                    >
                        <option value="">Select...</option>
                        <option value="single">Single</option>
                        <option value="married">Married</option>
                        <option value="widowed">Widowed</option>
                        <option value="separated">Separated</option>
                        <option value="live_in">Live-in</option>
                    </select>
                    {getError('beneficiary.civilStatus') && <p className="mt-1 text-red-500 text-sm">{getError('beneficiary.civilStatus')}</p>}
                </div>
            </div>
        </div>
    );
}
