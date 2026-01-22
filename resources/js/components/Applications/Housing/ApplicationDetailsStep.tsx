import { HousingApplicationFormData, HousingProgram } from '../../../pages/Applications/Housing/types';

interface ApplicationDetailsStepProps {
    data: HousingApplicationFormData;
    errors: Record<string, string>;
    onFieldChange: (key: keyof HousingApplicationFormData['application'], value: any) => void;
    onBlur: (fieldKey: string) => void;
}

export default function ApplicationDetailsStep({ data, errors, onFieldChange, onBlur }: ApplicationDetailsStepProps) {
    const getError = (key: string): string | undefined => errors[key];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="mb-2 font-bold text-gray-900 dark:text-white text-2xl">
                    Application Details
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Select the housing program and provide your application reason.
                </p>
            </div>

            <div className="space-y-6">
                <div className="w-full">
                    <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                        Housing Program <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={data.application.housingProgram}
                        onChange={(e) => onFieldChange('housingProgram', e.target.value as HousingProgram)}
                        onBlur={() => onBlur('housing_program')}
                        className={`
                            w-full px-4 py-3 rounded-lg border transition-colors
                            ${getError('housing_program')
                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                : 'border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary'
                            }
                            bg-white dark:bg-dark-surface
                            text-gray-900 dark:text-white
                            focus:outline-none focus:ring-2 focus:ring-opacity-20
                        `}
                    >
                        <option value="">Select...</option>
                        <option value="socialized_housing">Socialized Housing</option>
                        <option value="relocation">Relocation</option>
                        <option value="rental_subsidy">Rental Subsidy</option>
                        <option value="housing_loan">Housing Loan</option>
                    </select>
                    {getError('housing_program') && <p className="mt-1 text-red-500 text-sm">{getError('housing_program')}</p>}
                </div>
                <div>
                    <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                        Application Reason <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        value={data.application.applicationReason}
                        onChange={(e) => onFieldChange('applicationReason', e.target.value)}
                        onBlur={() => onBlur('application_reason')}
                        rows={5}
                        className={`
                            w-full px-4 py-3 rounded-lg border transition-colors
                            ${getError('application_reason')
                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                : 'border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary'
                            }
                            bg-white dark:bg-dark-surface
                            text-gray-900 dark:text-white
                            placeholder:text-gray-400 dark:placeholder:text-gray-500
                            focus:outline-none focus:ring-2 focus:ring-opacity-20
                        `}
                        placeholder="Explain why you are applying for housing assistance..."
                        required
                    />
                    {getError('application_reason') && <p className="mt-1 text-red-500 text-sm">{getError('application_reason')}</p>}
                </div>
            </div>
        </div>
    );
}
