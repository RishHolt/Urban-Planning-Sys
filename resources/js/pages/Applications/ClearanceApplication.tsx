import { useState, useEffect } from 'react';
import { useForm, usePage, router, Link } from '@inertiajs/react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Button from '../../components/Button';
import StepProgress from '../../components/StepProgress';
import PrerequisitesStep from '../../components/Applications/Clearance/PrerequisitesStep';
import PinLocationStep from '../../components/Applications/Clearance/PinLocationStep';
import ApplicantInfoStep from '../../components/Applications/Clearance/ApplicantInfoStep';
import PropertyInfoStep from '../../components/Applications/Clearance/PropertyInfoStep';
import ProjectDetailsStep from '../../components/Applications/Clearance/ProjectDetailsStep';
import ReviewStep from '../../components/Applications/Clearance/ReviewStep';
import { Zone } from '../../lib/zoneDetection';
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';

interface ClearanceApplicationProps {
    category?: 'individual_lot' | 'subdivision_development';
}

const STEPS = [
    'Prerequisites',
    'Pin Location',
    'Applicant Information',
    'Property Information',
    'Project Details',
    'Review & Submit',
];

export default function ClearanceApplication({ category: propCategory }: ClearanceApplicationProps) {
    const { category: queryCategory } = usePage<{ category?: string }>().props;
    const category = (propCategory || queryCategory || 'individual_lot') as 'individual_lot' | 'subdivision_development';
    
    const [currentStep, setCurrentStep] = useState(1);
    const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
    const [zones, setZones] = useState<Zone[]>([]);
    const [loadingZones, setLoadingZones] = useState(true);
    const [prerequisitesVerified, setPrerequisitesVerified] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        // Basic
        application_category: category,
        zone_id: null as number | null,
        applicant_type: 'owner' as 'owner' | 'authorized_rep' | 'contractor',
        contact_number: '',
        contact_email: '',

        // Prerequisites
        tax_dec_ref_no: '',
        barangay_permit_ref_no: '',

        // Location
        pin_lat: null as number | null,
        pin_lng: null as number | null,

        // Property
        lot_address: '',
        province: '',
        municipality: '',
        barangay: '',
        street_name: '',
        lot_owner: '',
        lot_area_total: 0,
        is_subdivision: false,
        subdivision_name: '',
        block_no: '',
        lot_no: '',
        total_lots_planned: null as number | null,
        has_subdivision_plan: false,

        // Project
        land_use_type: 'residential' as 'residential' | 'commercial' | 'industrial' | 'agricultural' | 'institutional' | 'mixed_use',
        project_type: 'new_construction' as 'new_construction' | 'renovation' | 'addition' | 'change_of_use',
        building_type: '',
        project_description: '',
        existing_structure: 'none' as 'none' | 'existing_to_retain' | 'existing_to_demolish' | 'existing_to_renovate',
        number_of_storeys: null as number | null,
        floor_area_sqm: null as number | null,
        estimated_cost: null as number | null,
        purpose: '',
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
                // Handle { success: true, zones: [...] } format
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
        // Validate prerequisites before allowing step 1
        if (currentStep === 1 && !prerequisitesVerified) {
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
        // Can only click on completed steps or current step
        // Step 1 (Pin Location) requires prerequisites to be verified
        if (stepNumber === 1 && !prerequisitesVerified) {
            return;
        }
        
        if (completedSteps.has(stepNumber) || stepNumber < currentStep || stepNumber === currentStep) {
            setCurrentStep(stepNumber);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!prerequisitesVerified) {
            setCurrentStep(1);
            return;
        }

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
                    <PrerequisitesStep
                        data={{
                            tax_dec_ref_no: data.tax_dec_ref_no,
                            barangay_permit_ref_no: data.barangay_permit_ref_no,
                        }}
                        setData={setData}
                        errors={errors}
                        prerequisitesVerified={prerequisitesVerified}
                        onVerificationChange={setPrerequisitesVerified}
                    />
                );

            case 2:
                return (
                    <PinLocationStep
                        data={{
                            pin_lat: data.pin_lat,
                            pin_lng: data.pin_lng,
                            lot_address: data.lot_address,
                            province: data.province,
                            municipality: data.municipality,
                            barangay: data.barangay,
                            street_name: data.street_name,
                            zone_id: data.zone_id,
                        }}
                        setData={setData}
                        errors={errors}
                        zones={zones}
                    />
                );

            case 3:
                return (
                    <ApplicantInfoStep
                        data={{
                            applicant_type: data.applicant_type,
                            contact_number: data.contact_number,
                            contact_email: data.contact_email,
                        }}
                        setData={setData}
                        errors={errors}
                    />
                );

            case 4:
                return (
                    <PropertyInfoStep
                        data={{
                            lot_owner: data.lot_owner,
                            lot_area_total: data.lot_area_total,
                            is_subdivision: data.is_subdivision,
                            subdivision_name: data.subdivision_name,
                            block_no: data.block_no,
                            lot_no: data.lot_no,
                            total_lots_planned: data.total_lots_planned,
                            has_subdivision_plan: data.has_subdivision_plan,
                        }}
                        setData={setData}
                        errors={errors}
                        category={category}
                    />
                );

            case 5:
                return (
                    <ProjectDetailsStep
                        data={{
                            land_use_type: data.land_use_type,
                            project_type: data.project_type,
                            building_type: data.building_type,
                            project_description: data.project_description,
                            existing_structure: data.existing_structure,
                            number_of_storeys: data.number_of_storeys,
                            floor_area_sqm: data.floor_area_sqm,
                            estimated_cost: data.estimated_cost,
                            purpose: data.purpose,
                        }}
                        setData={setData}
                        errors={errors}
                        category={category}
                    />
                );

            case 6:
                return (
                    <ReviewStep
                        data={data as any}
                        category={category}
                    />
                );

            default:
                return null;
        }
    };

    if (!category) {
        router.visit('/clearance-applications/category');
        return null;
    }

    return (
        <>
            <Header />
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 mt-16 py-12 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-6">
                        <Link href="/clearance-applications/category">
                            <Button variant="secondary" size="sm" className="flex items-center gap-2">
                                <ArrowLeft size={18} />
                                Back to Category Selection
                            </Button>
                        </Link>
                    </div>
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Zoning Clearance Application
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            {category === 'individual_lot' ? 'Individual Lot Application' : 'Subdivision Development Application'}
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
                                    disabled={currentStep === 1 && !prerequisitesVerified}
                                >
                                    Next
                                    <ChevronRight size={16} className="ml-2" />
                                </Button>
                            ) : (
                                <Button type="submit" disabled={processing || !prerequisitesVerified}>
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
