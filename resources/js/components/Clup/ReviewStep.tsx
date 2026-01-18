interface ReviewStepProps {
    data: {
        lgu_name: string;
        coverage_start_year: string;
        coverage_end_year: string;
    };
    classifications: Array<{
        zoningCode: string;
        zoneName: string;
        landUseCategory: string | null;
    }>;
}

export default function ReviewStep({ data, classifications }: ReviewStepProps) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="mb-2 font-bold text-gray-900 dark:text-white text-2xl">
                    Review & Submit
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Please review all information before submitting. You can go back to make changes if needed.
                </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 space-y-6">
                <div>
                    <h3 className="mb-4 font-semibold text-gray-900 dark:text-white text-lg">
                        CLUP Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                                LGU Name
                            </label>
                            <p className="text-gray-900 dark:text-white font-medium">
                                {data.lgu_name || 'Not provided'}
                            </p>
                        </div>

                        <div>
                            <label className="block mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                                Coverage Period
                            </label>
                            <p className="text-gray-900 dark:text-white font-medium">
                                {data.coverage_start_year && data.coverage_end_year
                                    ? `${new Date(data.coverage_start_year).getFullYear()} - ${new Date(data.coverage_end_year).getFullYear()}`
                                    : 'Not provided'}
                            </p>
                        </div>


                    </div>
                </div>

                {classifications.length > 0 && (
                    <div>
                        <h3 className="mb-4 font-semibold text-gray-900 dark:text-white text-lg">
                            Zoning Classifications ({classifications.length})
                        </h3>
                        <div className="space-y-2">
                            {classifications.map((classification, index) => (
                                <div
                                    key={index}
                                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-dark-surface"
                                >
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {classification.zoningCode} - {classification.zoneName}
                                    </p>
                                    {classification.landUseCategory && (
                                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                                            {classification.landUseCategory}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
