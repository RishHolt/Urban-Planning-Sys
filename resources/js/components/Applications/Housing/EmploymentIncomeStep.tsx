import Input from '../../Input';
import { HousingApplicationFormData, EmploymentStatus } from '../../../pages/Applications/Housing/types';

interface EmploymentIncomeStepProps {
    data: HousingApplicationFormData;
    errors: Record<string, string>;
    onFieldChange: (key: keyof HousingApplicationFormData['beneficiary'], value: any) => void;
    onBlur: (fieldKey: string) => void;
}

export default function EmploymentIncomeStep({ data, errors, onFieldChange, onBlur }: EmploymentIncomeStepProps) {
    const getError = (key: string): string | undefined => errors[key];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="mb-2 font-bold text-gray-900 dark:text-white text-2xl">
                    Employment & Income
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Provide your employment and income information.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="w-full">
                    <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                        Employment Status <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={data.beneficiary.employmentStatus}
                        onChange={(e) => onFieldChange('employmentStatus', e.target.value as EmploymentStatus)}
                        onBlur={() => onBlur('beneficiary.employmentStatus')}
                        className={`
                            w-full px-4 py-3 rounded-lg border transition-colors
                            ${getError('beneficiary.employmentStatus')
                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                : 'border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary'
                            }
                            bg-white dark:bg-dark-surface
                            text-gray-900 dark:text-white
                            focus:outline-none focus:ring-2 focus:ring-opacity-20
                        `}
                    >
                        <option value="">Select...</option>
                        <option value="employed">Employed</option>
                        <option value="self_employed">Self-employed</option>
                        <option value="unemployed">Unemployed</option>
                        <option value="retired">Retired</option>
                        <option value="student">Student</option>
                    </select>
                    {getError('beneficiary.employmentStatus') && <p className="mt-1 text-red-500 text-sm">{getError('beneficiary.employmentStatus')}</p>}
                </div>
                <Input
                                        label="Monthly Income"
                                        type="number"
                                        value={data.beneficiary.monthlyIncome}
                                        onChange={(e) => onFieldChange('monthlyIncome', e.target.value)}
                                        onBlur={() => onBlur('beneficiary.monthlyIncome')}
                                        error={getError('beneficiary.monthlyIncome')}
                                        required
                                    />
                <div className="md:col-span-2">
                    <label className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={data.beneficiary.hasExistingProperty} 
                            onChange={(e) => onFieldChange('hasExistingProperty', e.target.checked)}
                            className="border-gray-300 rounded focus:ring-primary text-primary"
                        />
                        <span className="text-gray-700 dark:text-gray-300">I have existing property</span>
                    </label>
                </div>
            </div>
        </div>
    );
}
