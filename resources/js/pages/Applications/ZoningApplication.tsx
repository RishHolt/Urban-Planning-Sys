import { useState, useEffect } from 'react';
import { useForm, router, Link, usePage } from '@inertiajs/react';
import Header from '@/components/Header';
import Button from '@/components/Button';
import StepProgress from '@/components/StepProgress';
import ApplicantInformationStep from '@/components/Applications/Zoning/ApplicantInformationStep';
import LocationAndProjectInfoStep from '@/components/Applications/Zoning/LocationAndProjectInfoStep';
import ProjectDetailsStep from '@/components/Applications/Zoning/ProjectDetailsStep';
import DocumentDetailsStep from '@/components/Applications/Zoning/DocumentDetailsStep';
import FeeAssessmentStep from '@/components/Applications/Zoning/FeeAssessmentStep';
import ReviewStep from '@/components/Applications/Zoning/ReviewStep';
import { Zone, isPinWithinMunicipality } from '@/lib/zoneDetection';
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { SharedData } from '@/types';

const STEPS = [
    'Applicant Information',
    'Location & Project Info',
    'Project Details',
    'Document Details',
    'Fee Assessment',
    'Review & Submit',
];

export default function ZoningApplication({
    classifications = [],
    municipalBoundary = null,
    barangayBoundaries = [],
}: {
    classifications?: any[];
    municipalBoundary?: any | null;
    barangayBoundaries?: any[];
}) {
    // No more category prop/query needed

    const { props } = usePage<SharedData>();
    const user = props.auth?.user;

    const [currentStep, setCurrentStep] = useState(1);
    const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
    const [zones, setZones] = useState<Zone[]>([]);
    const [loadingZones, setLoadingZones] = useState(true);
    const [complianceStatus, setComplianceStatus] = useState<string | null>(null);

    const { data, setData, post, processing, errors, setError, clearErrors } = useForm({
        // Step 1: Applicant Information
        applicant_type: 'individual' as 'individual' | 'representative' | 'corporation',
        is_representative: false,
        representative_name: '',
        lot_owner_contact_number: '',
        lot_owner_contact_email: '',
        contact_number: '',
        contact_email: '',

        // Step 2: Location & Project Info
        pin_lat: null as number | null,
        pin_lng: null as number | null,
        land_use_type: '' as '' | 'residential' | 'commercial' | 'industrial' | 'agricultural' | 'institutional' | 'mixed_use',
        project_type: '' as '' | 'new_construction' | 'renovation' | 'addition' | 'change_of_use',
        building_type: '', // e.g. new house, store

        // Step 3: Project Details
        lot_address: '',
        province: '',
        municipality: '',
        barangay: '',
        street_name: '',
        zone_id: null as number | null,
        lot_owner: '',
        tct_no: '',
        tax_declaration_no: '',
        lot_area_total: 0,
        is_subdivision: false,
        subdivision_name: '',
        block_no: '',
        lot_no: '',
        total_lots_planned: null as number | null,
        has_subdivision_plan: false,
        number_of_storeys: null as number | null,
        floor_area_sqm: null as number | null,
        number_of_units: null as number | null,
        project_description: '',
        existing_structure: 'none', // Added to prevent ReviewStep crash
        purpose: '',
        front_setback_m: null as number | null,
        rear_setback_m: null as number | null,
        side_setback_left_m: null as number | null,
        side_setback_right_m: null as number | null,
        building_footprint_sqm: null as number | null,
        project_cost: null as number | null,

        // Step 4: Documents (Placeholder for now)
        // documents: [],

        // Fee Assessment
        assessed_fee: 0,

        // Final Review
        declaration_accepted: false,
    });

    // Autofill user info
    useEffect(() => {
        if (user && data.applicant_type === 'individual' && !data.lot_owner) {
            let fullName = '';
            if (user.profile) {
                const parts = [
                    user.profile.first_name,
                    user.profile.middle_name,
                    user.profile.last_name,
                    user.profile.suffix
                ].filter(Boolean);
                fullName = parts.join(' ');
            } else {
                fullName = props.name || '';
            }

            setData({
                ...data,
                lot_owner: fullName,
                contact_number: user.profile?.mobile_number || data.contact_number,
                contact_email: user.email || data.contact_email,
            });
        }
    }, [user, data.applicant_type]);

    // Load zones for detection and merge with boundary layers
    useEffect(() => {
        fetch('/api/zones?zoning_only=true', {
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
        })
            .then(res => res.json())
            .then(data => {
                const zoningZones = data.success && data.zones ? data.zones : (Array.isArray(data) ? data : []);
                const boundaries: Zone[] = [
                    ...(municipalBoundary ? [municipalBoundary] : []),
                    ...barangayBoundaries,
                ];
                setZones([...zoningZones, ...boundaries]);
                setLoadingZones(false);
            })
            .catch((error) => {
                console.error('Failed to load zones:', error);
                // Still show boundaries even if zoning zones fail to load
                const boundaries: Zone[] = [
                    ...(municipalBoundary ? [municipalBoundary] : []),
                    ...barangayBoundaries,
                ];
                setZones(boundaries);
                setLoadingZones(false);
            });
    }, []);

    const validateStep = (): Record<string, string> => {
        const stepErrors: Record<string, string> = {};

        switch (currentStep) {
            case 1:
                if (!data.lot_owner) stepErrors.lot_owner = 'Property Owner name is required.';
                if (!data.contact_number) stepErrors.contact_number = 'Contact Number is required.';
                if ((data.is_representative || data.applicant_type === 'corporation') && !data.representative_name) {
                    stepErrors.representative_name = 'Representative Name is required.';
                }
                break;
            case 2:
                if (!data.lot_address) stepErrors.lot_address = 'Lot address is required.';
                if (!data.pin_lat || !data.pin_lng) {
                    stepErrors.zone_id = 'Please pin the exact location on the map.';
                } else if (!isPinWithinMunicipality(data.pin_lat, data.pin_lng, municipalBoundary)) {
                    stepErrors.zone_id = 'The pinned location is outside the municipality. Please select a location within the municipal boundary.';
                }
                break;
            case 3:
                if (!data.land_use_type) stepErrors.land_use_type = 'Proposed Use is required.';
                if (!data.project_type) stepErrors.project_type = 'Project Type is required.';
                if (!data.lot_area_total || data.lot_area_total <= 0) {
                    stepErrors.lot_area_total = 'Valid Total Lot Area is required.';
                } else if (data.lot_area_total > 9999999999.99) {
                    stepErrors.lot_area_total = 'Lot Area exceeds the maximum allowed value.';
                }
                if (!data.tct_no) stepErrors.tct_no = 'Transfer Certificate of Title (TCT) No. is required.';
                if (!data.tax_declaration_no) stepErrors.tax_declaration_no = 'Tax Declaration No. is required.';
                if (!data.project_cost || data.project_cost <= 0) stepErrors.project_cost = 'Valid Estimated Project Cost is required.';
                if (!data.building_type) stepErrors.building_type = 'Building Type is required.';
                if (!data.floor_area_sqm || data.floor_area_sqm <= 0) {
                    stepErrors.floor_area_sqm = 'Total Floor Area (sqm) is required for processing fee calculation.';
                } else if (data.floor_area_sqm > 99999999.99) {
                    stepErrors.floor_area_sqm = 'Floor Area exceeds the maximum allowed value.';
                }
                if (!data.project_description) stepErrors.project_description = 'Project Description is required.';
                if (!data.purpose) stepErrors.purpose = 'Purpose / Intent is required.';

                if (data.is_subdivision && !data.subdivision_name) stepErrors.subdivision_name = 'Subdivision Name is required since checkbox is checked.';

                if (complianceStatus === 'non_compliant') stepErrors.compliance = 'Project is strictly non-compliant with zoning rules. Adjust your parameters to proceed.';
                break;
            case 5:
                if (!data.assessed_fee || data.assessed_fee <= 0) stepErrors.assessed_fee = 'Fee assessment has not completed.';
                break;
            case 6:
                if (!data.declaration_accepted) {
                    stepErrors.declaration_accepted = 'You must confirm that you have reviewed all information and certify its truthfulness.';
                }
                break;
        }

        return stepErrors;
    };

    const isStepValid = () => Object.keys(validateStep()).length === 0;

    const handleNext = () => {
        clearErrors();
        const stepErrors = validateStep();

        if (Object.keys(stepErrors).length > 0) {
            // Populate inline errors
            Object.entries(stepErrors).forEach(([field, msg]) => {
                setError(field as any, msg);
            });

            // Scroll to first error and focus it
            setTimeout(() => {
                const firstErrorId = Object.keys(stepErrors)[0];
                const errorElement = document.getElementById(firstErrorId) || document.querySelector(`[name="${firstErrorId}"]`);

                if (errorElement) {
                    errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    errorElement.focus?.();
                } else if (firstErrorId === 'compliance') {
                    // Fallback for top-level non-input errors (e.g., compliance failure)
                    import('@/lib/swal').then(({ showError }) => showError(stepErrors[firstErrorId]));
                }
            }, 50);

            return;
        }

        if (currentStep < STEPS.length) {
            setCurrentStep(currentStep + 1);
            setCompletedSteps(new Set([...completedSteps, currentStep]));
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleStepClick = (stepNumber: number) => {
        // Can only jump to steps already completed or the current/previous ones
        if (completedSteps.has(stepNumber) || stepNumber <= currentStep) {
            setCurrentStep(stepNumber);
        }
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (currentStep === STEPS.length) {
            handleSubmit(e);
        } else {
            handleNext();
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (currentStep !== STEPS.length) {
            return;
        }
        if (!isStepValid()) return;

        post('/zoning-applications', {
            onSuccess: () => {
                router.visit('/zoning-applications');
            },
        });
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <ApplicantInformationStep
                        data={data}
                        setData={setData}
                        errors={errors}
                    />
                );
            case 2:
                return (
                    <LocationAndProjectInfoStep
                        data={{
                            ...data,
                            project_description: data.project_description || '',
                        }}
                        setData={setData}
                        errors={errors}
                        zones={zones}
                    />
                );
            case 3:
                return (
                    <ProjectDetailsStep
                        data={data}
                        setData={setData}
                        errors={errors}
                        zones={zones}
                        onComplianceStatusChange={setComplianceStatus}
                    />
                );
            case 4:
                return (
                    <DocumentDetailsStep
                        data={data}
                        setData={setData}
                        errors={errors}
                    />
                );
            case 5:
                return (
                    <FeeAssessmentStep
                        data={data}
                        setData={setData}
                        errors={errors}
                    />
                );
            case 6:
                return (
                    <ReviewStep data={data as any} />
                );
            default:
                return null;
        }
    };

    return (
        <>
            <Header />
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 mt-16 py-12 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-8">
                        <Link
                            href="/zoning-applications"
                            className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
                        >
                            <ChevronLeft size={16} className="mr-1" />
                            Back to Home
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Zoning Clearance Application
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Please fill out the details below to apply for a zoning clearance.
                        </p>
                    </div>

                    <StepProgress
                        steps={STEPS}
                        currentStep={currentStep}
                        completedSteps={completedSteps}
                        onStepClick={handleStepClick}
                    />

                    <form
                        onSubmit={handleFormSubmit}
                        className="bg-white dark:bg-dark-surface rounded-lg shadow-md p-6"
                    >
                        {/* Hidden input for Dusk testing */}
                        <input
                            id="zone_id_input"
                            name="zone_id"
                            type="text"
                            className="sr-only"
                            value={data.zone_id || ''}
                            onChange={(e) => setData('zone_id', parseInt(e.target.value) || null)}
                        />
                        {Object.keys(errors).length > 0 && (
                            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
                                <AlertCircle className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" size={18} />
                                <div>
                                    <h3 className="text-sm font-semibold text-red-800 dark:text-red-200">
                                        Please fix the following errors:
                                    </h3>
                                    <ul className="mt-1 text-sm text-red-700 dark:text-red-300 list-disc list-inside">
                                        {Object.entries(errors).map(([key, error]) => (
                                            <li key={key}>{error}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}

                        {renderStepContent()}

                        {currentStep === STEPS.length && (
                            <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.declaration_accepted}
                                        onChange={(e) => setData('declaration_accepted', e.target.checked)}
                                        className="mt-1 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <span className="text-sm text-blue-800 dark:text-blue-200">
                                        I hereby certify that all information provided above is true and correct to the best of my knowledge. I understand that any false statement or concealment of relevant facts may be grounds for disapproval or revocation of this application.
                                    </span>
                                </label>
                                {errors.declaration_accepted && (
                                    <p className="mt-2 text-sm text-red-600 dark:text-red-400 font-medium">
                                        {errors.declaration_accepted}
                                    </p>
                                )}
                            </div>
                        )}

                        {currentStep === 3 && complianceStatus === 'non_compliant' && (
                            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
                                <AlertCircle className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" size={18} />
                                <div>
                                    <h3 className="text-sm font-semibold text-red-800 dark:text-red-200">
                                        Cannot proceed to Fee Assessment
                                    </h3>
                                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                                        Your project has significant compliance violations that must be resolved before fees can be assessed. Please review the violations above and adjust your project details.
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <Button
                                key={`prev-${currentStep}`}
                                id="prev_button"
                                type="button"
                                variant="secondary"
                                onClick={handlePrevious}
                                disabled={currentStep === 1}
                            >
                                <ChevronLeft size={16} className="mr-2" />
                                Previous
                            </Button>

                            {currentStep < STEPS.length ? (
                                <Button
                                    key={`next-${currentStep}`}
                                    type="button"
                                    onClick={handleNext}
                                >
                                    Next
                                    <ChevronRight size={16} className="ml-2" />
                                </Button>
                            ) : (
                                <Button 
                                    key="submit-btn"
                                    id="submit_button" 
                                    type="submit" 
                                    disabled={processing || !data.declaration_accepted}
                                >
                                    {processing ? 'Submitting...' : 'Submit Application'}
                                </Button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
