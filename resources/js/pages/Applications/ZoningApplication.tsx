import { useState, useEffect, useMemo } from 'react';
import { useForm, Link } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Button from '../../components/Button';
import { ChevronLeft, ChevronRight, AlertCircle, ArrowLeft } from 'lucide-react';
import StepProgress from '../../components/StepProgress';
import ApplicantInformationStep from '../../components/Applications/ApplicantInformationStep';
import PropertyOwnerStep from '../../components/Applications/PropertyOwnerStep';
import PropertyLocationStep from '../../components/Applications/PropertyLocationStep';
import LandDetailsStep from '../../components/Applications/LandDetailsStep';
import ProposedDevelopmentStep from '../../components/Applications/ProposedDevelopmentStep';
import DocumentsStep from '../../components/Applications/DocumentsStep';
import DeclarationsStep from '../../components/Applications/DeclarationsStep';
import { validateStep, ValidationErrors } from '../../lib/formValidation';

export interface ZoningApplicationData {
    // Step 1: Applicant Information
    applicantType: 'individual' | 'company' | 'developer' | 'Government';
    applicantName?: string;
    applicantEmail?: string;
    applicantContact?: string;
    validId?: File | null;
    companyName?: string;
    secDtiRegNo?: string;
    authorizedRepresentative?: string;
    isPropertyOwner: boolean;
    authorizationLetter?: File | null;
    
    // Step 2: Property Owner Information
    ownerName?: string;
    ownerAddress?: string;
    ownerContact?: string;
    proofOfOwnership?: File | null;
    taxDeclarationType?: 'manual' | 'upload';
    taxDeclarationId?: string;
    taxDeclaration?: File | null;
    
    // Step 3: Property Location
    barangay: string;
    municipality: string;
    province: string;
    lotNo?: string;
    blockNo?: string;
    streetName?: string;
    useMap: boolean;
    latitude?: number;
    longitude?: number;
    
    // Step 4: Land & Property Details
    landType: string;
    hasExistingStructure: boolean;
    numberOfBuildings?: number;
    lotArea: number;
    
    // Step 5: Proposed Development
    applicationType: 'new_construction' | 'renovation' | 'change_of_use' | 'others';
    proposedUse: 'residential' | 'commercial' | 'mixed_use' | 'institutional';
    projectDescription?: string;
    siteDevelopmentPlan?: File | null;
    existingBuildingPhotos?: File[] | null;
    previousUse?: string;
    justification?: string;
    
    // Step 6: Documents
    locationMap?: File | null;
    vicinityMap?: File | null;
    barangayClearanceType?: 'manual' | 'upload';
    barangayClearanceId?: string;
    barangayClearance?: File | null;
    letterOfIntent?: File | null;
    proofOfLegalAuthority?: File | null;
    endorsementsApprovals?: File | null;
    environmentalCompliance?: File | null;
    otherDocuments?: File[] | null;
    
    // Step 7: Declarations
    declarationOfTruthfulness: boolean;
    agreementToComply: boolean;
    dataPrivacyConsent: boolean;
    signature?: File | null;
    applicationDate: string;
}

const ALL_STEPS = [
    'Applicant Information',
    'Property Owner',
    'Property Location',
    'Land Details',
    'Proposed Development',
    'Documents',
    'Declarations',
];

export default function ZoningApplication() {
    const { serviceId } = usePage<{ serviceId: string }>().props;
    const [currentStep, setCurrentStep] = useState(1);
    const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
    const [localErrors, setLocalErrors] = useState<ValidationErrors>({});

    const { data, setData, post, processing, errors: backendErrors } = useForm<ZoningApplicationData & { serviceId?: string }>({
        // Service ID
        serviceId: serviceId || 'zoning-clearance',
        
        // Step 1
        applicantType: 'individual',
        applicantName: '',
        applicantEmail: '',
        applicantContact: '',
        validId: null,
        companyName: '',
        secDtiRegNo: '',
        authorizedRepresentative: '',
        isPropertyOwner: true,
        authorizationLetter: null,
        
        // Step 2
        ownerName: '',
        ownerAddress: '',
        ownerContact: '',
        proofOfOwnership: null,
        taxDeclarationType: 'manual',
        taxDeclarationId: '',
        taxDeclaration: null,
        
        // Step 3
        barangay: '',
        municipality: '',
        province: '',
        lotNo: '',
        blockNo: '',
        streetName: '',
        useMap: true,
        latitude: undefined,
        longitude: undefined,
        
        // Step 4
        landType: 'residential',
        hasExistingStructure: false,
        numberOfBuildings: undefined,
        lotArea: 0,
        
        // Step 5
        applicationType: 'new_construction',
        proposedUse: 'residential',
        projectDescription: '',
        siteDevelopmentPlan: null,
        existingBuildingPhotos: null,
        previousUse: '',
        justification: '',
        
        // Step 6
        locationMap: null,
        vicinityMap: null,
        barangayClearanceType: 'manual',
        barangayClearanceId: '',
        barangayClearance: null,
        letterOfIntent: null,
        proofOfLegalAuthority: null,
        endorsementsApprovals: null,
        environmentalCompliance: null,
        otherDocuments: null,
        
        // Step 7
        declarationOfTruthfulness: false,
        agreementToComply: false,
        dataPrivacyConsent: false,
        signature: null,
        applicationDate: new Date().toISOString().split('T')[0],
    });

    // Merge backend errors with local validation errors
    const errors = useMemo(() => {
        return { ...localErrors, ...backendErrors };
    }, [localErrors, backendErrors]);

    // Helper functions to handle step mapping for Government applicants
    const isGovernment = data.applicantType === 'Government';
    
    // Get steps array based on applicant type (skip Property Owner for Government)
    const getStepsArray = useMemo((): string[] => {
        if (isGovernment) {
            return [
                'Applicant Information',
                'Property Location',
                'Land Details',
                'Proposed Development',
                'Documents',
                'Declarations',
            ];
        }
        return ALL_STEPS;
    }, [isGovernment]);

    // Convert logical step (1-7) to actual step number (accounting for skipped step 2 for Government)
    const getActualStepNumber = (logicalStep: number): number => {
        if (isGovernment && logicalStep > 2) {
            return logicalStep - 1; // Skip step 2
        }
        return logicalStep;
    };

    // Convert actual step number to logical step (1-7)
    const getLogicalStepNumber = (actualStep: number): number => {
        if (isGovernment && actualStep >= 2) {
            return actualStep + 1; // Map back to logical step
        }
        return actualStep;
    };

    const STEPS = getStepsArray;

    // Auto-fill property owner if applicant is owner, clear if not
    useEffect(() => {
        if (data.isPropertyOwner && data.applicantName) {
            // Use individual setData calls to avoid resetting other fields
            if (data.ownerName !== data.applicantName) {
                setData('ownerName', data.applicantName);
            }
            if (data.ownerContact !== (data.applicantContact || '')) {
                setData('ownerContact', data.applicantContact || '');
            }
        } else if (!data.isPropertyOwner) {
            // Clear auto-filled values when user is not the property owner
            // Only clear if they match the applicant info (were auto-filled)
            if (data.ownerName === data.applicantName) {
                setData('ownerName', '');
            }
            if (data.ownerContact === (data.applicantContact || '')) {
                setData('ownerContact', '');
            }
        }
    }, [data.isPropertyOwner, data.applicantName, data.applicantContact]);

    // Clear local errors when step changes
    useEffect(() => {
        setLocalErrors({});
    }, [currentStep]);

    // Auto-skip step 2 when applicant type changes to Government
    // If user is on step 2 (Property Owner) when switching to Government, the step mapping handles it
    // But we need to ensure we're not stuck on an invalid step
    useEffect(() => {
        if (isGovernment && currentStep === 2) {
            // If we're on actual step 2 and it becomes Government, 
            // step 2 now maps to logical step 3 (Property Location), which is correct
            // No action needed - the step mapping handles it
        }
    }, [isGovernment, currentStep]);

    const nextStep = () => {
        // Get logical step number for validation
        const logicalStep = getLogicalStepNumber(currentStep);
        
        // Validate current step before proceeding
        const stepErrors = validateStep(logicalStep, data);
        
        if (Object.keys(stepErrors).length > 0) {
            setLocalErrors(stepErrors);
            return;
        }

        // Clear errors and proceed to next step
        setLocalErrors({});
        if (currentStep < STEPS.length) {
            setCompletedSteps((prev) => new Set([...prev, currentStep]));
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const goToStep = (step: number) => {
        if (step >= 1 && step <= STEPS.length) {
            setCurrentStep(step);
        }
    };

    const handleSubmit = () => {
        // Validate all steps before submission
        const allErrors: ValidationErrors = {};
        const stepErrorsMap: { [step: number]: ValidationErrors } = {};
        
        // Validate all logical steps (1-7), but skip step 2 for Government
        for (let logicalStep = 1; logicalStep <= ALL_STEPS.length; logicalStep++) {
            // Skip step 2 (Property Owner) for Government applicants
            if (isGovernment && logicalStep === 2) {
                continue;
            }
            
            const stepErrors = validateStep(logicalStep, data);
            if (Object.keys(stepErrors).length > 0) {
                stepErrorsMap[logicalStep] = stepErrors;
                Object.assign(allErrors, stepErrors);
            }
        }

        if (Object.keys(allErrors).length > 0) {
            setLocalErrors(allErrors);
            // Navigate to first step with errors (convert logical step to actual step)
            const firstErrorLogicalStep = Math.min(...Object.keys(stepErrorsMap).map(Number));
            const firstErrorActualStep = getActualStepNumber(firstErrorLogicalStep);
            if (firstErrorActualStep >= 1 && firstErrorActualStep <= STEPS.length) {
                setCurrentStep(firstErrorActualStep);
            }
            return;
        }

        // Clear errors and submit
        setLocalErrors({});
        post('/applications/zoning', {
            onSuccess: () => {
                // Navigation handled by backend redirect
            },
        });
    };

    const renderStep = () => {
        // Convert actual step to logical step for rendering
        const logicalStep = getLogicalStepNumber(currentStep);
        
        switch (logicalStep) {
            case 1:
                return (
                    <ApplicantInformationStep
                        data={data}
                        setData={setData}
                        errors={errors}
                    />
                );
            case 2:
                // Step 2 (Property Owner) should not be rendered for Government
                // This is a safety check - navigation should prevent reaching here
                if (isGovernment) {
                    // Skip to next step if somehow we're here
                    return null;
                }
                return (
                    <PropertyOwnerStep
                        data={data}
                        setData={setData}
                        errors={errors}
                    />
                );
            case 3:
                return (
                    <PropertyLocationStep
                        data={data}
                        setData={setData}
                        errors={errors}
                    />
                );
            case 4:
                return (
                    <LandDetailsStep
                        data={data}
                        setData={setData}
                        errors={errors}
                    />
                );
            case 5:
                return (
                    <ProposedDevelopmentStep
                        data={data}
                        setData={setData}
                        errors={errors}
                    />
                );
            case 6:
                return (
                    <DocumentsStep
                        data={data}
                        setData={setData}
                        errors={errors}
                        serviceId={serviceId}
                        applicantType={data.applicantType}
                    />
                );
            case 7:
                return (
                    <DeclarationsStep
                        data={data}
                        setData={setData}
                        errors={errors}
                        onSubmit={handleSubmit}
                        processing={processing}
                    />
                );
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
                        <Link href="/applications/zoning">
                            <Button variant="secondary" size="sm" className="flex items-center gap-2">
                                <ArrowLeft size={18} />
                                Back to My Applications
                            </Button>
                        </Link>
                    </div>

                    {/* Progress Indicator */}
                    <div className="mb-8">
                        <h1 className="mb-6 font-bold text-gray-900 dark:text-white text-3xl">
                            Zoning Clearance Application
                        </h1>
                        <StepProgress
                            steps={STEPS}
                            currentStep={currentStep}
                            completedSteps={completedSteps}
                            onStepClick={goToStep}
                        />
                    </div>

                    {/* Generic Error Message */}
                    {backendErrors.error && (
                        <div className="bg-red-50 dark:bg-red-900/20 mb-6 p-4 border border-red-200 dark:border-red-800 rounded-lg">
                            <div className="flex items-start gap-2">
                                <AlertCircle size={20} className="flex-shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
                                <div className="flex-1">
                                    <p className="font-medium text-red-900 dark:text-red-200 text-sm">
                                        {backendErrors.error}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Validation Error Summary */}
                    {Object.keys(errors).filter(key => key !== 'error').length > 0 && (
                        <div className="bg-red-50 dark:bg-red-900/20 mb-6 p-4 border border-red-200 dark:border-red-800 rounded-lg">
                            <div className="flex items-start gap-2">
                                <AlertCircle size={20} className="flex-shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
                                <div className="flex-1">
                                    <h3 className="mb-2 font-semibold text-red-900 dark:text-red-200 text-sm">
                                        Please fix the following errors:
                                    </h3>
                                    <ul className="space-y-1 text-red-800 dark:text-red-200 text-sm list-disc list-inside">
                                        {Object.entries(errors)
                                            .filter(([key]) => key !== 'error')
                                            .slice(0, 5)
                                            .map(([key, message]) => (
                                                <li key={key}>{message}</li>
                                            ))}
                                        {Object.keys(errors).filter(key => key !== 'error').length > 5 && (
                                            <li>...and {Object.keys(errors).filter(key => key !== 'error').length - 5} more error(s)</li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Form Content */}
                    <div className="bg-white dark:bg-dark-surface shadow-lg p-6 md:p-8 rounded-2xl">
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
                            <Button
                                variant="primary"
                                size="md"
                                onClick={nextStep}
                                className="flex items-center gap-2"
                            >
                                Next
                                <ChevronRight size={18} />
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
}
