import { useState, useEffect } from 'react';
import Input from '../Input';

interface BasicInformationStepProps {
    data: {
        lgu_name: string;
        coverage_start_year: string;
        coverage_end_year: string;
    };
    setData: (key: string, value: unknown) => void;
    errors: Record<string, string>;
    onClearStepError?: (field: string) => void;
}

export default function BasicInformationStep({
    data,
    setData,
    errors,
    onClearStepError,
}: BasicInformationStepProps) {
    const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

    const validateCoveragePeriod = (startDate: string, endDate: string): void => {
        if (startDate && endDate) {
            const startYear = new Date(startDate).getFullYear();
            const endYear = new Date(endDate).getFullYear();
            const yearsDifference = endYear - startYear;

            // Clear any existing period validation errors first
            setLocalErrors((prev) => {
                const updated = { ...prev };
                // Only clear period-related errors, keep blank validation errors
                if (updated.coverage_end_year && 
                    (updated.coverage_end_year.includes('Coverage period should be 10 to 12 years') ||
                     updated.coverage_end_year.includes('end year must be greater'))) {
                    delete updated.coverage_end_year;
                }
                return updated;
            });

            if (endYear <= startYear) {
                setLocalErrors((prev) => ({
                    ...prev,
                    coverage_end_year: 'Coverage period should be 10 to 12 years. The end year must be greater than the start year.',
                }));
            } else if (yearsDifference < 10) {
                setLocalErrors((prev) => ({
                    ...prev,
                    coverage_end_year: 'Coverage period should be 10 to 12 years.',
                }));
            } else if (yearsDifference > 12) {
                setLocalErrors((prev) => ({
                    ...prev,
                    coverage_end_year: 'Coverage period should be 10 to 12 years.',
                }));
            }
            // If yearsDifference is exactly 10, 11, or 12, no error is set (already cleared above)
        }
    };

    const handleStartYearChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const value = e.target.value;
        setData('coverage_start_year', value);
        
        // Clear step validation error if user starts typing
        if (onClearStepError && errors.coverage_start_year && value) {
            onClearStepError('coverage_start_year');
        }
        
        // Validate blank
        if (!value || value.trim() === '') {
            setLocalErrors((prev) => ({
                ...prev,
                coverage_start_year: 'The coverage start year field is required.',
            }));
        } else {
            setLocalErrors((prev) => {
                const updated = { ...prev };
                delete updated.coverage_start_year;
                return updated;
            });
            
            // Auto-fill end year to 12 years later
            if (value) {
                const startDate = new Date(value);
                const endDate = new Date(startDate);
                endDate.setFullYear(startDate.getFullYear() + 12);
                const endDateString = endDate.toISOString().split('T')[0];
                setData('coverage_end_year', endDateString);
                
                // Validate the auto-filled period
                validateCoveragePeriod(value, endDateString);
                
                // Clear end year error after auto-fill
                if (onClearStepError && errors.coverage_end_year) {
                    onClearStepError('coverage_end_year');
                }
            }
        }
        
        // Validate period if both dates are present
        if (value && data.coverage_end_year) {
            validateCoveragePeriod(value, data.coverage_end_year);
        } else {
            setLocalErrors((prev) => {
                const updated = { ...prev };
                delete updated.coverage_end_year;
                return updated;
            });
        }
    };

    const handleEndYearChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const value = e.target.value;
        setData('coverage_end_year', value);
        
        // Clear step validation error if user starts typing
        if (onClearStepError && errors.coverage_end_year && value) {
            onClearStepError('coverage_end_year');
        }
        
        // Validate blank
        if (!value || value.trim() === '') {
            setLocalErrors((prev) => ({
                ...prev,
                coverage_end_year: 'The coverage end year field is required.',
            }));
        } else {
            setLocalErrors((prev) => {
                const updated = { ...prev };
                delete updated.coverage_end_year;
                return updated;
            });
        }
        
        // Validate period if both dates are present
        if (data.coverage_start_year && value) {
            validateCoveragePeriod(data.coverage_start_year, value);
        }
    };

    const handleStartYearBlur = (): void => {
        if (!data.coverage_start_year || data.coverage_start_year.trim() === '') {
            setLocalErrors((prev) => ({
                ...prev,
                coverage_start_year: 'The coverage start year field is required.',
            }));
        }
    };

    const handleEndYearBlur = (): void => {
        if (!data.coverage_end_year || data.coverage_end_year.trim() === '') {
            setLocalErrors((prev) => ({
                ...prev,
                coverage_end_year: 'The coverage end year field is required.',
            }));
        }
    };

    useEffect(() => {
        if (data.coverage_start_year && data.coverage_end_year) {
            validateCoveragePeriod(data.coverage_start_year, data.coverage_end_year);
        }
    }, []);

    const getEndYearError = (): string | undefined => {
        return localErrors.coverage_end_year || errors.coverage_end_year;
    };

    const getStartYearError = (): string | undefined => {
        return localErrors.coverage_start_year || errors.coverage_start_year;
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="mb-2 font-bold text-gray-900 dark:text-white text-2xl">
                    Basic Information
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Enter the fundamental details of the Comprehensive Land Use Plan.
                </p>
            </div>

            <div>
                <Input
                    type="text"
                    name="lgu_name"
                    label="LGU Name"
                    value={data.lgu_name}
                    onChange={(e) => {
                        setData('lgu_name', e.target.value);
                        if (onClearStepError && errors.lgu_name && e.target.value) {
                            onClearStepError('lgu_name');
                        }
                    }}
                    error={errors.lgu_name}
                    required
                    placeholder="e.g., Caloocan City"
                />
            </div>

            <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
                <div>
                    <Input
                        type="date"
                        name="coverage_start_year"
                        label="Coverage Start Year"
                        value={data.coverage_start_year}
                        onChange={handleStartYearChange}
                        onBlur={handleStartYearBlur}
                        error={getStartYearError()}
                        required
                    />
                </div>

                <div>
                    <Input
                        type="date"
                        name="coverage_end_year"
                        label="Coverage End Year"
                        value={data.coverage_end_year}
                        onChange={handleEndYearChange}
                        onBlur={handleEndYearBlur}
                        error={getEndYearError()}
                        required
                    />
                </div>
            </div>

        </div>
    );
}
