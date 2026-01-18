import { useState } from 'react';
import { Link, useForm, router } from '@inertiajs/react';
import AdminHeader from '../../../components/AdminHeader';
import Sidebar from '../../../components/Sidebar';
import Button from '../../../components/Button';
import StepProgress from '../../../components/StepProgress';
import BasicInformationStep from '../../../components/Clup/BasicInformationStep';
import ZoningClassificationsStep from '../../../components/Clup/ZoningClassificationsStep';
import ReviewStep from '../../../components/Clup/ReviewStep';
import { showSuccess, showError } from '../../../lib/swal';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';

const STEPS = [
    'Basic Information',
    'Zoning Classifications',
    'Review & Submit',
];

interface Classification {
    zoningCode: string;
    zoneName: string;
    landUseCategory: string | null;
    allowedUses: string | null;
    conditionalUses: string | null;
    prohibitedUses: string | null;
}

export default function ClupCreate() {
    const [sidebarOpen, setSidebarOpen] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth >= 1024;
        }
        return true;
    });

    const [currentStep, setCurrentStep] = useState(1);
    const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
    const [classifications, setClassifications] = useState<Classification[]>([]);
    const [createdClupId, setCreatedClupId] = useState<string | null>(null);
    const [stepValidationErrors, setStepValidationErrors] = useState<Record<string, string>>({});

    const { data, setData, processing, errors } = useForm({
        lgu_name: '',
        coverage_start_year: '',
        coverage_end_year: '',
        approving_body: '',
        resolution_no: '',
        status: 'Active',
    });

    const validateStep = (step: number): { isValid: boolean; validationErrors: Record<string, string> } => {
        const validationErrors: Record<string, string> = {};

        if (step === 1) {
            if (!data.lgu_name || data.lgu_name.trim() === '') {
                validationErrors.lgu_name = 'The LGU name field is required.';
            }
            if (!data.coverage_start_year || data.coverage_start_year.trim() === '') {
                validationErrors.coverage_start_year = 'The coverage start year field is required.';
            }
            if (!data.coverage_end_year || data.coverage_end_year.trim() === '') {
                validationErrors.coverage_end_year = 'The coverage end year field is required.';
            }
        }

        return {
            isValid: Object.keys(validationErrors).length === 0,
            validationErrors,
        };
    };

    const nextStep = (): void => {
        const validation = validateStep(currentStep);
        
        if (!validation.isValid) {
            setStepValidationErrors(validation.validationErrors);
            return;
        }

        // Clear validation errors if validation passes
        setStepValidationErrors({});

        if (currentStep < STEPS.length) {
            setCompletedSteps((prev) => new Set([...prev, currentStep]));
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = (): void => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const goToStep = (step: number): void => {
        if (step >= 1 && step <= STEPS.length) {
            setCurrentStep(step);
        }
    };

    const createClupIfNeeded = async (): Promise<string | null> => {
        if (createdClupId) {
            return createdClupId;
        }

        if (!data.lgu_name || !data.coverage_start_year || !data.coverage_end_year) {
            setCurrentStep(1);
            return null;
        }

        const startYear = new Date(data.coverage_start_year).getFullYear();
        const endYear = new Date(data.coverage_end_year).getFullYear();
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

        try {
            const response = await fetch('/admin/zoning/clup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({
                    lgu_name: data.lgu_name,
                    coverage_start_year: startYear.toString(),
                    coverage_end_year: endYear.toString(),
                    approving_body: data.approving_body || null,
                    resolution_no: data.resolution_no || null,
                    status: data.status || 'Active',
                }),
            });

            const result = await response.json();
            if (result.success && result.clup) {
                setCreatedClupId(result.clup.id);
                return result.clup.id;
            } else {
                if (response.status === 422 && result.errors) {
                    // Validation errors will be handled by Inertia
                    return null;
                }
                console.error('Failed to create CLUP:', result.message);
            }
        } catch (error) {
            console.error('Error creating CLUP:', error);
        }

        return null;
    };

    const handleAddClassification = (classification: Classification): void => {
        setClassifications((prev) => [...prev, classification]);
    };

    const handleRemoveClassification = (index: number): void => {
        setClassifications((prev) => prev.filter((_, i) => i !== index));
    };

    const handleUpdateClassification = (index: number, classification: Classification): void => {
        setClassifications((prev) => {
            const updated = [...prev];
            updated[index] = classification;
            return updated;
        });
    };

    const createClassifications = async (clupId: string): Promise<void> => {
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
        
        const promises = classifications.map(async (classification) => {
            try {
                const response = await fetch('/admin/zoning/clup/classifications', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': csrfToken,
                    },
                    body: JSON.stringify({
                        clup_id: clupId,
                        zoning_code: classification.zoningCode,
                        zone_name: classification.zoneName,
                        land_use_category: classification.landUseCategory || null,
                        allowed_uses: classification.allowedUses || null,
                        conditional_uses: classification.conditionalUses || null,
                        prohibited_uses: classification.prohibitedUses || null,
                    }),
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Failed to create classification');
                }

                return await response.json();
            } catch (error) {
                console.error('Error creating classification:', error);
                throw error;
            }
        });

        try {
            await Promise.all(promises);
        } catch (error) {
            console.error('Some classifications failed to create:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();

        if (!data.lgu_name || !data.coverage_start_year || !data.coverage_end_year) {
            setCurrentStep(1);
            return;
        }

        let clupId = createdClupId;
        if (!clupId) {
            clupId = await createClupIfNeeded();
            if (!clupId) {
                setCurrentStep(1);
                return;
            }
        }

        if (classifications.length > 0 && clupId) {
            await createClassifications(clupId);
        }

        if (clupId) {
            await showSuccess('CLUP has been created successfully.', 'CLUP Created');
            router.visit(`/admin/zoning/clup/${clupId}`);
        }
    };

    const renderStep = (): React.ReactNode => {
        switch (currentStep) {
            case 1:
                return (
                    <BasicInformationStep
                        data={data}
                        setData={setData}
                        errors={{ ...errors, ...stepValidationErrors }}
                        onClearStepError={(field) => {
                            setStepValidationErrors((prev) => {
                                const updated = { ...prev };
                                delete updated[field];
                                return updated;
                            });
                        }}
                    />
                );
            case 2:
                return (
                    <ZoningClassificationsStep
                        classifications={classifications}
                        onAddClassification={handleAddClassification}
                        onRemoveClassification={handleRemoveClassification}
                        onUpdateClassification={handleUpdateClassification}
                    />
                );
            case 3:
                return (
                    <ReviewStep
                        data={data}
                        classifications={classifications}
                    />
                );
            default:
                return null;
        }
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
                        <Link href="/admin/zoning/clup">
                            <Button variant="secondary" size="sm" className="flex items-center gap-2">
                                <ArrowLeft size={18} />
                                Back to CLUP List
                            </Button>
                        </Link>
                    </div>

                    <div className="bg-white dark:bg-dark-surface shadow-lg p-8 rounded-lg">
                        <h1 className="mb-6 font-bold text-gray-900 dark:text-white text-2xl">
                            Create New CLUP
                        </h1>

                        <StepProgress
                            steps={STEPS}
                            currentStep={currentStep}
                            completedSteps={completedSteps}
                            onStepClick={goToStep}
                        />

                        <form 
                            onSubmit={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (currentStep === STEPS.length) {
                                    handleSubmit(e);
                                } else {
                                    nextStep();
                                }
                            }}
                            className="space-y-6"
                            id="clup-create-form"
                            noValidate
                        >
                            {renderStep()}

                            <div className="flex justify-between items-center pt-6 border-gray-200 dark:border-gray-700 border-t">
                                <div>
                                    {currentStep > 1 && (
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="md"
                                            onClick={prevStep}
                                            className="flex items-center gap-2"
                                        >
                                            <ChevronLeft size={18} />
                                            Previous
                                        </Button>
                                    )}
                                </div>

                                <div className="flex gap-3">
                                    <Link href="/admin/zoning/clup">
                                        <Button type="button" variant="secondary" size="md">
                                            Cancel
                                        </Button>
                                    </Link>
                                    {currentStep < STEPS.length ? (
                                        <Button
                                            type="submit"
                                            variant="primary"
                                            size="md"
                                            className="flex items-center gap-2"
                                        >
                                            Next
                                            <ChevronRight size={18} />
                                        </Button>
                                    ) : (
                                        <Button type="submit" variant="primary" size="md" disabled={processing}>
                                            {processing ? 'Creating...' : 'Create CLUP'}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}
