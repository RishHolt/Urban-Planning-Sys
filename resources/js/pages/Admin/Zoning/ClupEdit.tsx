import { useState, useEffect } from 'react';
import { Link, useForm, router } from '@inertiajs/react';
import AdminHeader from '../../../components/AdminHeader';
import Sidebar from '../../../components/Sidebar';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import { ArrowLeft } from 'lucide-react';

interface Clup {
    id: string;
    lguName: string;
    coverageStartYear: number;
    coverageEndYear: number;
    approvalDate: string;
    approvingBody: string | null;
    resolutionNo: string | null;
    status: 'Active' | 'Archived';
}

interface ClupEditProps {
    clup: Clup;
}

export default function ClupEdit({ clup }: ClupEditProps) {
    const [sidebarOpen, setSidebarOpen] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth >= 1024;
        }
        return true;
    });

    // Convert year to date format (January 1st of the year)
    const yearToDate = (year: number): string => {
        return `${year}-01-01`;
    };

    const { data, setData, patch, processing, errors } = useForm({
        lgu_name: clup.lguName,
        coverage_start_year: yearToDate(clup.coverageStartYear),
        coverage_end_year: yearToDate(clup.coverageEndYear),
        approval_date: clup.approvalDate,
        approving_body: clup.approvingBody || '',
        resolution_no: clup.resolutionNo || '',
        status: clup.status,
    });

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

    const handleSubmit = (e: React.FormEvent): void => {
        e.preventDefault();
        
        if (localErrors.coverage_start_year || localErrors.coverage_end_year) {
            return;
        }
        
        // Extract year from date inputs
        const startYear = data.coverage_start_year ? new Date(data.coverage_start_year).getFullYear().toString() : '';
        const endYear = data.coverage_end_year ? new Date(data.coverage_end_year).getFullYear().toString() : '';
        
        // Transform and submit
        router.patch(`/admin/zoning/clup/${clup.id}`, {
            ...data,
            coverage_start_year: startYear,
            coverage_end_year: endYear,
        });
    };

    return (
        <div className="flex flex-col bg-background dark:bg-dark-bg w-full min-h-dvh transition-colors">
            <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
            <AdminHeader sidebarOpen={sidebarOpen} />

            <main className={`flex-1 transition-all duration-300 ease-in-out ${
                sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
            } mt-16`}>
                <div className="mx-auto px-4 py-8 max-w-4xl">
                    <div className="mb-6">
                        <Link href={`/admin/zoning/clup/${clup.id}`}>
                            <Button variant="secondary" size="sm" className="flex items-center gap-2">
                                <ArrowLeft size={18} />
                                Back to CLUP Details
                            </Button>
                        </Link>
                    </div>

                    <div className="bg-white dark:bg-dark-surface shadow-lg p-8 rounded-lg">
                        <h1 className="mb-6 font-bold text-gray-900 dark:text-white text-2xl">
                            Edit CLUP
                        </h1>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
                                <div className="md:col-span-2">
                                    <Input
                                        type="text"
                                        name="lgu_name"
                                        label="LGU Name"
                                        value={data.lgu_name}
                                        onChange={(e) => setData('lgu_name', e.target.value)}
                                        error={errors.lgu_name}
                                        required
                                    />
                                </div>

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

                                <div>
                                    <Input
                                        type="date"
                                        name="approval_date"
                                        label="Approval Date"
                                        value={data.approval_date}
                                        onChange={(e) => setData('approval_date', e.target.value)}
                                        error={errors.approval_date}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                        Status
                                    </label>
                                    <select
                                        name="status"
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value as 'Active' | 'Archived')}
                                        className="bg-white dark:bg-dark-surface px-4 py-3 border border-gray-300 focus:border-transparent dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary w-full text-gray-900 dark:text-white text-sm"
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Archived">Archived</option>
                                    </select>
                                    {errors.status && (
                                        <p className="mt-1 text-red-500 text-sm">{errors.status}</p>
                                    )}
                                </div>

                                <div>
                                    <Input
                                        type="text"
                                        name="approving_body"
                                        label="Approving Body"
                                        value={data.approving_body}
                                        onChange={(e) => setData('approving_body', e.target.value)}
                                        error={errors.approving_body}
                                    />
                                </div>

                                <div>
                                    <Input
                                        type="text"
                                        name="resolution_no"
                                        label="Resolution Number"
                                        value={data.resolution_no}
                                        onChange={(e) => setData('resolution_no', e.target.value)}
                                        error={errors.resolution_no}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-gray-200 dark:border-gray-700 border-t">
                                <Link href={`/admin/zoning/clup/${clup.id}`}>
                                    <Button type="button" variant="secondary" size="md">
                                        Cancel
                                    </Button>
                                </Link>
                                <Button type="submit" variant="primary" size="md" disabled={processing}>
                                    {processing ? 'Updating...' : 'Update CLUP'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}
