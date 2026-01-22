import { useState } from 'react';
import { useForm, router, Link } from '@inertiajs/react';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import Button from '../../../components/Button';
import StepProgress from '../../../components/StepProgress';
import Input from '../../../components/Input';
import { ChevronLeft, ChevronRight, ArrowLeft, AlertCircle } from 'lucide-react';

const STEPS = [
    'Zoning Clearance',
    'Project Information',
    'Location Details',
    'Review & Submit',
];

interface SubdivisionApplicationFormData {
    zoning_clearance_no: string;
    applicant_type: 'developer' | 'authorized_rep';
    contact_number: string;
    contact_email: string;
    pin_lat: number | null;
    pin_lng: number | null;
    project_address: string;
    developer_name: string;
    subdivision_name: string;
    project_description: string;
    total_area_sqm: number;
    total_lots_planned: number;
    open_space_percentage: number;
}

export default function ApplicationForm() {
    const [currentStep, setCurrentStep] = useState(1);
    const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
    const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

    const { data, setData, post, processing, errors } = useForm<SubdivisionApplicationFormData>({
        zoning_clearance_no: '',
        applicant_type: 'developer',
        contact_number: '',
        contact_email: '',
        pin_lat: null,
        pin_lng: null,
        project_address: '',
        developer_name: '',
        subdivision_name: '',
        project_description: '',
        total_area_sqm: 0,
        total_lots_planned: 0,
        open_space_percentage: 0,
    });

    const validateStep = (step: number): boolean => {
        const stepErrors: Record<string, string> = {};

        switch (step) {
            case 1:
                if (!data.zoning_clearance_no) stepErrors.zoning_clearance_no = 'Zoning clearance number is required';
                if (!data.applicant_type) stepErrors.applicant_type = 'Applicant type is required';
                if (!data.contact_number) stepErrors.contact_number = 'Contact number is required';
                break;
            case 2:
                if (!data.developer_name) stepErrors.developer_name = 'Developer name is required';
                if (!data.subdivision_name) stepErrors.subdivision_name = 'Subdivision name is required';
                if (!data.total_area_sqm || data.total_area_sqm <= 0) stepErrors.total_area_sqm = 'Total area must be greater than 0';
                if (!data.total_lots_planned || data.total_lots_planned <= 0) stepErrors.total_lots_planned = 'Total lots planned must be greater than 0';
                if (!data.open_space_percentage || data.open_space_percentage < 30) {
                    stepErrors.open_space_percentage = 'Open space must be at least 30%';
                }
                break;
            case 3:
                if (!data.pin_lat || !data.pin_lng) stepErrors.pin_lat = 'Please select a location on the map';
                if (!data.project_address) stepErrors.project_address = 'Project address is required';
                break;
        }

        setLocalErrors(stepErrors);
        return Object.keys(stepErrors).length === 0;
    };

    const nextStep = () => {
        if (currentStep < STEPS.length && validateStep(currentStep)) {
            setCompletedSteps((prev) => new Set([...prev, currentStep]));
            setCurrentStep(currentStep + 1);
            setLocalErrors({});
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setLocalErrors({});
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateStep(currentStep)) {
            post('/subdivision-applications', {
                preserveScroll: true,
            });
        }
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-6">
                        <div>
                            <h2 className="mb-4 font-semibold text-gray-900 dark:text-white text-xl">
                                Zoning Clearance & Contact Information
                            </h2>
                            <p className="mb-6 text-gray-600 dark:text-gray-400 text-sm">
                                Please provide your zoning clearance number and contact details.
                            </p>
                        </div>

                        <Input
                            label="Zoning Clearance Number *"
                            value={data.zoning_clearance_no}
                            onChange={(e) => setData('zoning_clearance_no', e.target.value)}
                            error={localErrors.zoning_clearance_no || errors.zoning_clearance_no}
                            placeholder="Enter zoning clearance number"
                        />

                        <div>
                            <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                Applicant Type *
                            </label>
                            <select
                                value={data.applicant_type}
                                onChange={(e) => setData('applicant_type', e.target.value as 'developer' | 'authorized_rep')}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                                <option value="developer">Developer</option>
                                <option value="authorized_rep">Authorized Representative</option>
                            </select>
                            {(localErrors.applicant_type || errors.applicant_type) && (
                                <p className="mt-1 text-red-500 text-sm">{localErrors.applicant_type || errors.applicant_type}</p>
                            )}
                        </div>

                        <Input
                            label="Contact Number *"
                            value={data.contact_number}
                            onChange={(e) => setData('contact_number', e.target.value)}
                            error={localErrors.contact_number || errors.contact_number}
                            placeholder="Enter contact number"
                        />

                        <Input
                            label="Contact Email"
                            type="email"
                            value={data.contact_email}
                            onChange={(e) => setData('contact_email', e.target.value)}
                            error={errors.contact_email}
                            placeholder="Enter email address"
                        />
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-6">
                        <div>
                            <h2 className="mb-4 font-semibold text-gray-900 dark:text-white text-xl">
                                Project Information
                            </h2>
                            <p className="mb-6 text-gray-600 dark:text-gray-400 text-sm">
                                Provide details about your subdivision project.
                            </p>
                        </div>

                        <Input
                            label="Developer Name *"
                            value={data.developer_name}
                            onChange={(e) => setData('developer_name', e.target.value)}
                            error={localErrors.developer_name || errors.developer_name}
                            placeholder="Enter developer/company name"
                        />

                        <Input
                            label="Subdivision Name *"
                            value={data.subdivision_name}
                            onChange={(e) => setData('subdivision_name', e.target.value)}
                            error={localErrors.subdivision_name || errors.subdivision_name}
                            placeholder="Enter proposed subdivision name"
                        />

                        <div>
                            <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                Project Description
                            </label>
                            <textarea
                                value={data.project_description}
                                onChange={(e) => setData('project_description', e.target.value)}
                                rows={4}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="Describe your subdivision project..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Input
                                label="Total Area (sqm) *"
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.total_area_sqm || ''}
                                onChange={(e) => setData('total_area_sqm', parseFloat(e.target.value) || 0)}
                                error={localErrors.total_area_sqm || errors.total_area_sqm}
                                placeholder="0.00"
                            />

                            <Input
                                label="Total Lots Planned *"
                                type="number"
                                min="1"
                                value={data.total_lots_planned || ''}
                                onChange={(e) => setData('total_lots_planned', parseInt(e.target.value) || 0)}
                                error={localErrors.total_lots_planned || errors.total_lots_planned}
                                placeholder="0"
                            />

                            <Input
                                label="Open Space (%) *"
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                value={data.open_space_percentage || ''}
                                onChange={(e) => setData('open_space_percentage', parseFloat(e.target.value) || 0)}
                                error={localErrors.open_space_percentage || errors.open_space_percentage}
                                placeholder="30.00"
                            />
                        </div>

                        {data.open_space_percentage > 0 && data.open_space_percentage < 30 && (
                            <div className="flex items-start gap-2 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                <AlertCircle className="mt-0.5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" size={20} />
                                <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                                    Open space must be at least 30% to comply with regulations.
                                </p>
                            </div>
                        )}
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-6">
                        <div>
                            <h2 className="mb-4 font-semibold text-gray-900 dark:text-white text-xl">
                                Location Details
                            </h2>
                            <p className="mb-6 text-gray-600 dark:text-gray-400 text-sm">
                                Select the project location on the map and provide the address.
                            </p>
                        </div>

                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                            <p className="text-blue-800 dark:text-blue-200 text-sm">
                                Map picker will be integrated here. For now, please enter coordinates manually.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Latitude *"
                                type="number"
                                step="0.00000001"
                                value={data.pin_lat || ''}
                                onChange={(e) => setData('pin_lat', parseFloat(e.target.value) || null)}
                                error={localErrors.pin_lat || errors.pin_lat}
                                placeholder="0.00000000"
                            />

                            <Input
                                label="Longitude *"
                                type="number"
                                step="0.00000001"
                                value={data.pin_lng || ''}
                                onChange={(e) => setData('pin_lng', parseFloat(e.target.value) || null)}
                                error={errors.pin_lng}
                                placeholder="0.00000000"
                            />
                        </div>

                        <Input
                            label="Project Address *"
                            value={data.project_address}
                            onChange={(e) => setData('project_address', e.target.value)}
                            error={localErrors.project_address || errors.project_address}
                            placeholder="Enter complete project address"
                        />
                    </div>
                );

            case 4:
                return (
                    <div className="space-y-6">
                        <div>
                            <h2 className="mb-4 font-semibold text-gray-900 dark:text-white text-xl">
                                Review & Submit
                            </h2>
                            <p className="mb-6 text-gray-600 dark:text-gray-400 text-sm">
                                Please review your information before submitting.
                            </p>
                        </div>

                        <div className="p-6 bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-700 rounded-lg space-y-4">
                            <div>
                                <h3 className="mb-2 font-medium text-gray-900 dark:text-white">Zoning Clearance</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">{data.zoning_clearance_no}</p>
                            </div>
                            <div>
                                <h3 className="mb-2 font-medium text-gray-900 dark:text-white">Developer</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">{data.developer_name}</p>
                            </div>
                            <div>
                                <h3 className="mb-2 font-medium text-gray-900 dark:text-white">Subdivision Name</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">{data.subdivision_name}</p>
                            </div>
                            <div>
                                <h3 className="mb-2 font-medium text-gray-900 dark:text-white">Total Area</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">{data.total_area_sqm.toLocaleString()} sqm</p>
                            </div>
                            <div>
                                <h3 className="mb-2 font-medium text-gray-900 dark:text-white">Total Lots</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">{data.total_lots_planned}</p>
                            </div>
                            <div>
                                <h3 className="mb-2 font-medium text-gray-900 dark:text-white">Open Space</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">{data.open_space_percentage}%</p>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col bg-background dark:bg-dark-bg w-full min-h-dvh transition-colors">
            <Header />

            <div className="flex-1 mt-16 py-8 w-full">
                <div className="mx-auto px-4 max-w-4xl">
                    <div className="mb-6">
                        <Link href="/subdivision-applications">
                            <Button variant="secondary" size="sm" className="flex items-center gap-2">
                                <ArrowLeft size={18} />
                                Back to Applications
                            </Button>
                        </Link>
                    </div>

                    <div className="mb-8">
                        <h1 className="mb-2 font-bold text-gray-900 dark:text-white text-3xl">
                            Subdivision Application
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Submit a new subdivision development application
                        </p>
                    </div>

                    <div className="mb-8">
                        <StepProgress steps={STEPS} currentStep={currentStep} completedSteps={completedSteps} />
                    </div>

                    <form onSubmit={handleSubmit} className="bg-white dark:bg-dark-surface shadow-lg rounded-lg p-6 md:p-8">
                        {renderStep()}

                        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <Button
                                type="button"
                                variant="secondary"
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
                                    type="button"
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
                                    type="submit"
                                    variant="primary"
                                    size="md"
                                    disabled={processing}
                                    className="flex items-center gap-2"
                                >
                                    {processing ? 'Submitting...' : 'Submit Application'}
                                </Button>
                            )}
                        </div>
                    </form>
                </div>
            </div>

            <Footer />
        </div>
    );
}
