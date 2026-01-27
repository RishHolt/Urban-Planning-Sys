import { useState, useEffect } from 'react';
import { useForm, router, Link } from '@inertiajs/react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Button from '@/components/Button';
import StepProgress from '@/components/StepProgress';
import ApplicantInformationStep from '@/components/Applications/Zoning/ApplicantInformationStep';
import LocationAndProjectInfoStep from '@/components/Applications/Zoning/LocationAndProjectInfoStep';
import ProjectDetailsStep from '@/components/Applications/Zoning/ProjectDetailsStep';
import DocumentDetailsStep from '@/components/Applications/Zoning/DocumentDetailsStep';
import FeeAssessmentStep from '@/components/Applications/Zoning/FeeAssessmentStep';
import ReviewStep from '@/components/Applications/Zoning/ReviewStep';
import { Zone } from '@/lib/zoneDetection';
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';

const STEPS = [
    'Applicant Information',
    'Location & Project Info',
    'Project Details',
    'Document Details',
    'Fee Assessment',
    'Review & Submit',
];

export default function ZoningApplication() {
    // No more category prop/query needed

    const [currentStep, setCurrentStep] = useState(1);
    const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
    const [zones, setZones] = useState<Zone[]>([]);
    const [loadingZones, setLoadingZones] = useState(true);

    const { data, setData, post, processing, errors } = useForm({
        // Step 1: Applicant Information
        applicant_type: 'individual' as 'individual' | 'business' | 'developer' | 'institution',
        is_representative: false,
        representative_name: '',
        lot_owner_contact_number: '',
        lot_owner_contact_email: '',
        contact_number: '',
        contact_email: '',
        tax_dec_ref_no: '',
        barangay_permit_ref_no: '',
        is_td_verified: false,
        is_bp_verified: false,

        // Step 2: Location & Project Info
        pin_lat: null as number | null,
        pin_lng: null as number | null,
        land_use_type: 'residential' as 'residential' | 'commercial' | 'industrial' | 'agricultural' | 'institutional' | 'mixed_use',
        project_type: 'new_construction' as 'new_construction' | 'renovation' | 'addition' | 'change_of_use',
        building_type: '', // e.g. new house, store

        // Step 3: Project Details
        lot_address: '',
        province: '',
        municipality: '',
        barangay: '',
        street_name: '',
        zone_id: null as number | null,
        lot_owner: '',
        lot_area_total: 0,
        lot_area_used: 0,
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

        // Step 4: Documents (Placeholder for now)
        // documents: [],

        // Fee Assessment
        assessed_fee: 0,
    });

    // Load zones for detection
    useEffect(() => {
        fetch('/api/zones', {
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
        })
            .then(res => res.json())
            .then(data => {
                const zones = data.success && data.zones ? data.zones : (Array.isArray(data) ? data : []);
                setZones(zones);
                setLoadingZones(false);
            })
            .catch((error) => {
                console.error('Failed to load zones:', error);
                setLoadingZones(false);
            });
    }, []);

    const isStepValid = () => {
        switch (currentStep) {
            case 1:
                const basicInfo = !!(data.lot_owner && data.contact_number && data.is_td_verified && data.is_bp_verified);
                const repInfo = data.is_representative ? !!data.representative_name : true;
                return basicInfo && repInfo;
            case 2:
                return !!(data.lot_address && data.zone_id && data.land_use_type && data.project_type && data.building_type);
            case 3:
                const basicDetails = !!(data.lot_area_total > 0 && data.project_description && data.purpose);
                const subDetails = data.is_subdivision ? !!data.subdivision_name : true;
                return basicDetails && subDetails;
            case 4:
                return true; // Informational step
            case 5:
                return data.assessed_fee > 0; // Ensure fee calculation finished
            default:
                return true;
        }
    };

    const handleNext = () => {
        if (currentStep < STEPS.length && isStepValid()) {
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
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
                        data={data}
                        setData={setData}
                        errors={errors}
                        zones={zones}
                        loadingZones={loadingZones}
                    />
                );
            case 3:
                return (
                    <ProjectDetailsStep
                        data={data}
                        setData={setData}
                        errors={errors}
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
                    <ReviewStep
                        data={data as any}
                    />
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
                        onSubmit={currentStep === STEPS.length ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}
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

                        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <Button
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
                                    id="next_button"
                                    type="submit"
                                    disabled={!isStepValid()}
                                >
                                    Next
                                    <ChevronRight size={16} className="ml-2" />
                                </Button>
                            ) : (
                                <Button id="submit_button" type="submit" disabled={processing || !isStepValid()}>
                                    {processing ? 'Submitting...' : 'Submit Application'}
                                </Button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
            <Footer />
        </>
    );
}
