import { HousingApplicationFormData } from '../../../pages/Applications/Housing/types';

interface ReviewStepProps {
    data: HousingApplicationFormData;
}

export default function ReviewStep({ data }: ReviewStepProps) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="mb-2 font-bold text-gray-900 dark:text-white text-2xl">
                    Review & Submit
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Review your application before submitting.
                </p>
            </div>

            <div className="space-y-4">
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Housing Program</div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                        {data.application.housingProgram.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                </div>
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Priority Status</div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                        {data.beneficiary.priorityStatus.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                    By submitting, you confirm that the information you provided is accurate to the best of your knowledge.
                </p>
            </div>
        </div>
    );
}
