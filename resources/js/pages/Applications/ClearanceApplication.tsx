import { useState, useEffect } from 'react';
import { useForm, router } from '@inertiajs/react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Button from '@/components/Button';
import StepProgress from '@/components/StepProgress';
import ApplicantInformationStep from '@/components/Applications/Clearance/ApplicantInformationStep';
import LocationAndProjectInfoStep from '@/components/Applications/Clearance/LocationAndProjectInfoStep';
import ProjectDetailsStep from '@/components/Applications/Clearance/ProjectDetailsStep';
import DocumentDetailsStep from '@/components/Applications/Clearance/DocumentDetailsStep';
import FeeAssessmentStep from '@/components/Applications/Clearance/FeeAssessmentStep';
import ReviewStep from '@/components/Applications/Clearance/ReviewStep';
import { Zone } from '@/lib/zoneDetection';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const STEPS = [
    'Applicant Information',
    'Location & Project Info',
    'Project Details',
    'Document Details',
    'Fee Assessment',
    'Review & Submit',
];

export default function ClearanceApplication() {
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
        tax_dec_ref_no: '', // Still keeping these but maybe moved?
        barangay_permit_ref_no: '',

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

    const handleNext = () => {
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
        if (completedSteps.has(stepNumber) || stepNumber < currentStep || stepNumber === currentStep) {
            setCurrentStep(stepNumber);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/clearance-applications', {
            onSuccess: () => {
                router.visit('/clearance-applications');
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
                        {renderStepContent()}

                        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <Button
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
                                    type="submit"
                                >
                                    Next
                                    <ChevronRight size={16} className="ml-2" />
                                </Button>
                            ) : (
                                <Button type="submit" disabled={processing}>
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
