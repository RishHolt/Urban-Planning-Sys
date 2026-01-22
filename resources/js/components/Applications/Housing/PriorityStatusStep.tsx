import Input from '../../Input';
import { HousingApplicationFormData, PriorityStatus } from '../../../pages/Applications/Housing/types';

interface PriorityStatusStepProps {
    data: HousingApplicationFormData;
    errors: Record<string, string>;
    onFieldChange: (key: keyof HousingApplicationFormData['beneficiary'], value: any) => void;
    onBlur: (fieldKey: string) => void;
}

export default function PriorityStatusStep({ data, errors, onFieldChange, onBlur }: PriorityStatusStepProps) {
    const getError = (key: string): string | undefined => errors[key];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="mb-2 font-bold text-gray-900 dark:text-white text-2xl">
                    Priority Status
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Select your priority status if applicable.
                </p>
            </div>

            <div className="space-y-4">
                <div className="w-full">
                    <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                        Priority Status
                    </label>
                    <select
                        value={data.beneficiary.priorityStatus}
                        onChange={(e) => onFieldChange('priorityStatus', e.target.value as PriorityStatus)}
                        onBlur={() => onBlur('beneficiary.priorityStatus')}
                        className={`
                            w-full px-4 py-3 rounded-lg border transition-colors
                            ${getError('beneficiary.priorityStatus')
                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                : 'border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary'
                            }
                            bg-white dark:bg-dark-surface
                            text-gray-900 dark:text-white
                            focus:outline-none focus:ring-2 focus:ring-opacity-20
                        `}
                    >
                        <option value="none">None</option>
                        <option value="pwd">PWD</option>
                        <option value="senior_citizen">Senior Citizen</option>
                        <option value="solo_parent">Solo Parent</option>
                        <option value="disaster_victim">Disaster Victim</option>
                        <option value="indigenous">Indigenous</option>
                    </select>
                    {getError('beneficiary.priorityStatus') && <p className="mt-1 text-red-500 text-sm">{getError('beneficiary.priorityStatus')}</p>}
                </div>
                {data.beneficiary.priorityStatus !== 'none' && (
                                        <Input
                                            label="Priority ID Number"
                                            value={data.beneficiary.priorityIdNo}
                                            onChange={(e) => onFieldChange('priorityIdNo', e.target.value)}
                                            onBlur={() => onBlur('beneficiary.priorityIdNo')}
                                            error={getError('beneficiary.priorityIdNo')}
                                            placeholder="Enter your priority ID number"
                                        />
                )}
            </div>
        </div>
    );
}
