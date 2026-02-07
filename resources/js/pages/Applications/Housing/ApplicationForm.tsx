import { useForm, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import Button from '../../../components/Button';
import StepProgress from '../../../components/StepProgress';
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { Link } from '@inertiajs/react';
import PersonalInfoStep from '../../../components/Applications/Housing/PersonalInfoStep';
import ContactAddressStep from '../../../components/Applications/Housing/ContactAddressStep';
import EmploymentIncomeStep from '../../../components/Applications/Housing/EmploymentIncomeStep';
import PriorityStatusStep from '../../../components/Applications/Housing/PriorityStatusStep';
import HouseholdMembersStep from '../../../components/Applications/Housing/HouseholdMembersStep';
import ApplicationDetailsStep from '../../../components/Applications/Housing/ApplicationDetailsStep';
import DocumentsStep from '../../../components/Applications/Housing/DocumentsStep';
import ReviewStep from '../../../components/Applications/Housing/ReviewStep';
import { HousingApplicationFormData, ValidationErrors, DocumentType, HouseholdMember } from './types';
import { validateStep, validateField } from './utils/validation';
import { prepareFormData } from './utils/formSubmission';

const STEPS = [
    'Beneficiary Information',
    'Contact & Address',
    'Employment & Income',
    'Priority Status',
    'Household Members',
    'Application Details',
    'Documents',
    'Review & Submit',
];

export default function ApplicationForm() {
    const [currentStep, setCurrentStep] = useState(1);
    const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
    const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
    const [backendErrors, setBackendErrors] = useState<ValidationErrors>({});
    const [localErrors, setLocalErrors] = useState<ValidationErrors>({});

    const { data, setData, post, processing, errors } = useForm<HousingApplicationFormData>({
        beneficiary: {
            firstName: '',
            lastName: '',
            middleName: '',
            birthDate: '',
            gender: '',
            civilStatus: '',
            email: '',
            contactNumber: '',
            currentAddress: '',
            barangay: '',
            yearsOfResidency: '',
            employmentStatus: '',
            monthlyIncome: '',
            hasExistingProperty: false,
            priorityStatus: 'none',
            priorityIdNo: '',
        },
        application: {
            housingProgram: '',
            applicationReason: '',
        },
        householdMembers: [],
        documents: {
            valid_id: null,
            birth_certificate: null,
            marriage_certificate: null,
            income_proof: null,
            barangay_certificate: null,
            tax_declaration: null,
            dswd_certification: null,
            pwd_id: null,
            senior_citizen_id: null,
            solo_parent_id: null,
            disaster_certificate: null,
        },
    });

    // Map backend error keys (snake_case) to frontend keys (camelCase)
    // Inertia returns errors with backend keys, we need to map them for display
    const mapBackendErrorKey = (backendKey: string): string => {
        const fieldMap: Record<string, string> = {
            'beneficiary.first_name': 'beneficiary.firstName',
            'beneficiary.last_name': 'beneficiary.lastName',
            'beneficiary.middle_name': 'beneficiary.middleName',
            'beneficiary.birth_date': 'beneficiary.birthDate',
            'beneficiary.civil_status': 'beneficiary.civilStatus',
            'beneficiary.contact_number': 'beneficiary.contactNumber',
            'beneficiary.current_address': 'beneficiary.currentAddress',
            'beneficiary.years_of_residency': 'beneficiary.yearsOfResidency',
            'beneficiary.employment_status': 'beneficiary.employmentStatus',
            'beneficiary.monthly_income': 'beneficiary.monthlyIncome',
            'beneficiary.has_existing_property': 'beneficiary.hasExistingProperty',
            'beneficiary.priority_status': 'beneficiary.priorityStatus',
            'beneficiary.priority_id_no': 'beneficiary.priorityIdNo',
        };
        return fieldMap[backendKey] || backendKey;
    };

    // Map Inertia errors (backend keys) to frontend keys for display
    // router.post errors come through onError callback, useForm errors come from useForm
    const mappedErrors = useMemo(() => {
        const mapped: ValidationErrors = {};
        // Map errors from useForm (if any)
        Object.keys(errors).forEach(backendKey => {
            const frontendKey = mapBackendErrorKey(backendKey);
            mapped[frontendKey] = (errors as any)[backendKey];
        });
        // Map errors from router.post (stored in backendErrors state)
        Object.keys(backendErrors).forEach(backendKey => {
            const frontendKey = mapBackendErrorKey(backendKey);
            mapped[frontendKey] = backendErrors[backendKey];
        });
        // Merge local validation errors
        Object.assign(mapped, localErrors);
        return mapped;
    }, [errors, backendErrors, localErrors]);

    const setBeneficiaryField = (key: keyof HousingApplicationFormData['beneficiary'], value: any) => {
        const updatedBeneficiary = {
            ...data.beneficiary,
            [key]: value,
        };
        setData('beneficiary', updatedBeneficiary);

        // Clear error for this field if it's been touched and is now valid
        const fieldKey = `beneficiary.${key}`;
        if (touchedFields.has(fieldKey) && mappedErrors[fieldKey]) {
            const updatedData = {
                ...data,
                beneficiary: updatedBeneficiary,
            };
            const fieldError = validateField(fieldKey, updatedData);
            if (!fieldError) {
                // Clear from backendErrors if it exists there
                if (backendErrors[fieldKey]) {
                    const updated = { ...backendErrors };
                    delete updated[fieldKey];
                    setBackendErrors(updated);
                }
            }
        }
    };

    const setApplicationField = (key: keyof HousingApplicationFormData['application'], value: any) => {
        const updatedApplication = {
            ...data.application,
            [key]: value,
        };
        setData('application', updatedApplication);

        // Clear error for this field if it's been touched and is now valid
        const fieldKey = key === 'housingProgram' ? 'housing_program' : 'application_reason';
        if (touchedFields.has(fieldKey) && localErrors[fieldKey]) {
            const updatedData = {
                ...data,
                application: updatedApplication,
            };
            const fieldError = validateField(fieldKey, updatedData);
            if (!fieldError) {
                setLocalErrors(prev => {
                    const { [fieldKey]: _, ...rest } = prev;
                    return rest;
                });
            }
        }
    };

    const setDocumentField = (key: DocumentType, value: File | null) => {
        setData('documents', {
            ...data.documents,
            [key]: value,
        });
    };

    const addHouseholdMember = () => {
        setData('householdMembers', [
            ...data.householdMembers,
            {
                full_name: '',
                relationship: 'other',
                birth_date: '',
                gender: '',
                occupation: '',
                monthly_income: '',
                is_dependent: false,
            },
        ]);
    };

    const removeHouseholdMember = (index: number) => {
        setData('householdMembers', data.householdMembers.filter((_, i) => i !== index));
    };

    const updateHouseholdMember = (index: number, field: keyof HouseholdMember, value: any) => {
        const updated = [...data.householdMembers];
        updated[index] = { ...updated[index], [field]: value };
        setData('householdMembers', updated);
    };

    const validateCurrentStep = (markAllAsTouched: boolean = false): boolean => {
        const stepErrors = validateStep(currentStep, data);

        if (markAllAsTouched) {
            // When clicking Next, mark all fields in current step as touched
            const stepFields = Object.keys(stepErrors);
            setTouchedFields(prev => new Set([...prev, ...stepFields]));
        }

        setLocalErrors(stepErrors);
        return Object.keys(stepErrors).length === 0;
    };

    const handleFieldBlur = (fieldKey: string) => {
        // Mark field as touched
        setTouchedFields(prev => new Set([...prev, fieldKey]));

        // Validate only this specific field
        const fieldError = validateField(fieldKey, data);

        setLocalErrors(prev => {
            if (fieldError) {
                return { ...prev, [fieldKey]: fieldError };
            } else {
                // Remove error for this field if it's now valid
                const { [fieldKey]: _, ...rest } = prev;
                return rest;
            }
        });
    };

    const nextStep = () => {
        // Validate and mark all fields as touched when trying to proceed
        if (currentStep < STEPS.length && validateCurrentStep(true)) {
            setCompletedSteps((prev) => new Set([...prev, currentStep]));
            setCurrentStep(currentStep + 1);
            // Clear errors when moving to next step
            setLocalErrors({});
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            // Clear errors when going back
            setLocalErrors({});
            setCurrentStep(currentStep - 1);
        }
    };

    const goToStep = (step: number) => {
        if (step >= 1 && step <= STEPS.length) {
            setCurrentStep(step);
        }
    };

    const handleSubmit = (): void => {

        // Validate all steps before submitting
        const allErrors: ValidationErrors = {};
        for (let step = 1; step <= STEPS.length; step++) {
            const stepErrors = validateStep(step, data);
            Object.assign(allErrors, stepErrors);
        }


        if (Object.keys(allErrors).length > 0) {
            // Mark all fields as touched to show all errors
            setTouchedFields(new Set(Object.keys(allErrors)));
            // Go to first step with errors
            const firstErrorStep = Math.min(
                ...Object.keys(allErrors).map(key => {
                    if (key.startsWith('beneficiary.firstName') || key.startsWith('beneficiary.lastName') ||
                        key.startsWith('beneficiary.birthDate') || key.startsWith('beneficiary.gender') ||
                        key.startsWith('beneficiary.civilStatus')) return 1;
                    if (key.startsWith('beneficiary.contactNumber') || key.startsWith('beneficiary.email') ||
                        key.startsWith('beneficiary.currentAddress') || key.startsWith('beneficiary.barangay') ||
                        key.startsWith('beneficiary.yearsOfResidency')) return 2;
                    if (key.startsWith('beneficiary.employmentStatus') ||
                        key.startsWith('beneficiary.monthlyIncome')) return 3;
                    if (key.startsWith('beneficiary.priorityStatus') || key.startsWith('beneficiary.priorityIdNo')) return 4;
                    if (key.startsWith('housing_program') || key.startsWith('application_reason')) return 6;
                    if (key.startsWith('documents.')) return 7;
                    return 1;
                })
            );
            setCurrentStep(firstErrorStep);
            return;
        }

        // Prepare FormData for file uploads
        const formData = prepareFormData(data);

        // Use router.post with FormData - Inertia handles CSRF automatically
        router.post('/applications/housing', formData, {
            preserveScroll: true,
            onError: (errorBag) => {
                console.error('Submission error:', errorBag);
                console.error('Error keys:', Object.keys(errorBag));
                console.error('Error details:', JSON.stringify(errorBag, null, 2));
                // Store errors in state so they persist and can be displayed
                setBackendErrors(errorBag as ValidationErrors);

                // Navigate to the first step with an error
                const errorKeys = Object.keys(errorBag);
                if (errorKeys.length > 0) {
                    const firstErrorStep = Math.min(
                        ...errorKeys.map(key => {
                            const mappedKey = mapBackendErrorKey(key);
                            if (mappedKey.startsWith('beneficiary.firstName') || mappedKey.startsWith('beneficiary.lastName') ||
                                mappedKey.startsWith('beneficiary.middleName') || mappedKey.startsWith('beneficiary.birthDate') ||
                                mappedKey.startsWith('beneficiary.gender') || mappedKey.startsWith('beneficiary.civilStatus')) return 1;
                            if (mappedKey.startsWith('beneficiary.contactNumber') || mappedKey.startsWith('beneficiary.email') ||
                                mappedKey.startsWith('beneficiary.currentAddress') || mappedKey.startsWith('beneficiary.barangay') ||
                                mappedKey.startsWith('beneficiary.yearsOfResidency')) return 2;
                            if (mappedKey.startsWith('beneficiary.employmentStatus') ||
                                mappedKey.startsWith('beneficiary.monthlyIncome')) return 3;
                            if (mappedKey.startsWith('beneficiary.priorityStatus') || mappedKey.startsWith('beneficiary.priorityIdNo')) return 4;
                            if (key.startsWith('housing_program') || key.startsWith('application_reason')) return 6;
                            if (key.startsWith('documents.') || key.startsWith('documents[')) return 7;
                            return 1;
                        })
                    );
                    setCurrentStep(firstErrorStep);
                }
            },
            onSuccess: () => {
                // Clear errors on success
                setBackendErrors({});
            },
        });
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <PersonalInfoStep
                        data={data}
                        errors={mappedErrors}
                        onFieldChange={setBeneficiaryField}
                        onBlur={handleFieldBlur}
                    />
                );
            case 2:
                return (
                    <ContactAddressStep
                        data={data}
                        errors={mappedErrors}
                        onFieldChange={setBeneficiaryField}
                        onBlur={handleFieldBlur}
                    />
                );
            case 3:
                return (
                    <EmploymentIncomeStep
                        data={data}
                        errors={mappedErrors}
                        onFieldChange={setBeneficiaryField}
                        onBlur={handleFieldBlur}
                    />
                );
            case 4:
                return (
                    <PriorityStatusStep
                        data={data}
                        errors={mappedErrors}
                        onFieldChange={setBeneficiaryField}
                        onBlur={handleFieldBlur}
                    />
                );
            case 5:
                return (
                    <HouseholdMembersStep
                        data={data}
                        onAddMember={addHouseholdMember}
                        onRemoveMember={removeHouseholdMember}
                        onUpdateMember={updateHouseholdMember}
                    />
                );
            case 6:
                return (
                    <ApplicationDetailsStep
                        data={data}
                        errors={mappedErrors}
                        onFieldChange={setApplicationField}
                        onBlur={handleFieldBlur}
                    />
                );
            case 7:
                return (
                    <DocumentsStep
                        data={data}
                        errors={mappedErrors}
                        onDocumentChange={setDocumentField}
                    />
                );
            case 8:
                return <ReviewStep data={data} />;
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col bg-background dark:bg-dark-bg w-full min-h-dvh transition-colors">
            <Header />

            <div className="flex-1 mt-16 py-8 w-full">
                <div className="mx-auto px-4 max-w-7xl h-full">
                    <div className="mb-6">
                        <Link href="/applications/housing">
                            <Button variant="secondary" size="sm">
                                Back to My Applications
                            </Button>
                        </Link>
                    </div>

                    {/* Progress Indicator */}
                    <div className="mb-8">
                        <h1 className="mb-6 font-bold text-gray-900 dark:text-white text-3xl">
                            Housing Beneficiary Application
                        </h1>
                        <StepProgress
                            steps={STEPS}
                            currentStep={currentStep}
                            completedSteps={completedSteps}
                            onStepClick={goToStep}
                        />
                    </div>

                    {/* Form Content */}
                    <div className="bg-white dark:bg-dark-surface shadow-lg p-6 md:p-8 rounded-2xl">
                        {/* Show general error if exists */}
                        {((errors as any).error || backendErrors.error) && (
                            <div className="mb-6 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
                                <div className="flex items-start gap-2">
                                    <AlertCircle size={18} className="mt-0.5 text-red-600 dark:text-red-400" />
                                    <p className="text-sm text-red-800 dark:text-red-200">
                                        {(errors as any).error || backendErrors.error || 'An error occurred while submitting your application.'}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Debug: Show all errors if any exist */}
                        {(Object.keys(errors).length > 0 || Object.keys(backendErrors).length > 0) && (
                            <div className="mb-6 rounded-lg border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 p-4">
                                <div className="flex items-start gap-2">
                                    <AlertCircle size={18} className="mt-0.5 text-yellow-600 dark:text-yellow-400" />
                                    <div className="text-sm text-yellow-800 dark:text-yellow-200">
                                        <p className="font-semibold mb-2">Validation Errors:</p>
                                        <ul className="list-disc list-inside space-y-1">
                                            {Object.entries({ ...errors, ...backendErrors }).slice(0, 10).map(([key, value]) => (
                                                <li key={key}><strong>{key}:</strong> {String(value)}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}

                        {renderStep()}
                    </div>

                    {/* Navigation Buttons */}
                    {currentStep < STEPS.length + 1 && (
                        <div className="flex justify-between items-center mt-6">
                            <Button
                                variant="outline"
                                size="md"
                                onClick={prevStep}
                                disabled={currentStep === 1}
                                className="flex items-center gap-2"
                            >
                                <ChevronLeft size={18} />
                                Previous
                            </Button>
                            {currentStep < STEPS.length ? (
                                <Button
                                    variant="primary"
                                    size="md"
                                    onClick={nextStep}
                                    className="flex items-center gap-2"
                                >
                                    Next
                                    <ChevronRight size={18} />
                                </Button>
                            ) : (
                                <Button
                                    type="button"
                                    variant="primary"
                                    size="md"
                                    className="flex items-center gap-2"
                                    onClick={(e) => {
                                        handleSubmit();
                                    }}
                                    disabled={processing}
                                >
                                    {processing ? 'Submitting...' : 'Submit Application'}
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
}
