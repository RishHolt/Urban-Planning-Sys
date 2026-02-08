import { useState, useEffect, useRef } from 'react';
import { useForm, router, Link } from '@inertiajs/react';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import Button from '../../../components/Button';
import StepProgress from '../../../components/StepProgress';
import Input from '../../../components/Input';
import PropertyLocation from '../../../components/Applications/PropertyLocation';
import { Zone } from '../../../lib/zoneDetection';
import { ChevronLeft, ChevronRight, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';

const STEPS = [
    'Project Type',
    'Zoning Clearance',
    'Applicant Information',
    'Subdivision Details',
    'Building Details',
    'Location Details',
    'Documents',
    'Review & Submit',
];

interface DevelopmentClearanceFormData {
    project_type: 'subdivision_only' | 'subdivision_with_building';
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
    // Building fields (conditional)
    building_type: string;
    number_of_floors: number | null;
    building_footprint_sqm: number | null;
    total_floor_area_sqm: number | null;
    front_setback_m: number | null;
    rear_setback_m: number | null;
    side_setback_m: number | null;
    floor_area_ratio: number | null;
    building_open_space_sqm: number | null;
}

export default function ApplicationForm() {
    const [currentStep, setCurrentStep] = useState(1);
    const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
    const [localErrors, setLocalErrors] = useState<Record<string, string>>({});
    const [zones, setZones] = useState<Zone[]>([]);
    const [loadingZones, setLoadingZones] = useState(true);
    const [verifyingClearance, setVerifyingClearance] = useState(false);
    const [clearanceStatus, setClearanceStatus] = useState<{
        valid: boolean;
        message: string;
        clearance?: any;
    } | null>(null);
    const verificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const { data, setData, post, processing, errors } = useForm<DevelopmentClearanceFormData>({
        project_type: 'subdivision_only',
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
        building_type: '',
        number_of_floors: null,
        building_footprint_sqm: null,
        total_floor_area_sqm: null,
        front_setback_m: null,
        rear_setback_m: null,
        side_setback_m: null,
        floor_area_ratio: null,
        building_open_space_sqm: null,
    });

    // Load zones for map display and zone detection
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

    const validateStep = (step: number): boolean => {
        const stepErrors: Record<string, string> = {};

        switch (step) {
            case 1:
                if (!data.project_type) {
                    stepErrors.project_type = 'Project type is required';
                }
                break;
            case 2:
                if (!data.zoning_clearance_no) {
                    stepErrors.zoning_clearance_no = 'Zoning clearance number is required';
                }
                break;
            case 3:
                if (!data.applicant_type) {
                    stepErrors.applicant_type = 'Applicant type is required';
                }
                if (!data.contact_number) {
                    stepErrors.contact_number = 'Contact number is required';
                }
                break;
            case 4:
                if (!data.developer_name) {
                    stepErrors.developer_name = 'Developer name is required';
                }
                if (!data.subdivision_name) {
                    stepErrors.subdivision_name = 'Subdivision name is required';
                }
                if (!data.total_area_sqm || data.total_area_sqm <= 0) {
                    stepErrors.total_area_sqm = 'Total area must be greater than 0';
                }
                if (!data.total_lots_planned || data.total_lots_planned <= 0) {
                    stepErrors.total_lots_planned = 'Total lots planned must be greater than 0';
                }
                if (!data.open_space_percentage || data.open_space_percentage < 30) {
                    stepErrors.open_space_percentage = 'Open space must be at least 30%';
                }
                break;
            case 5:
                if (data.project_type === 'subdivision_with_building') {
                    if (!data.building_type) {
                        stepErrors.building_type = 'Building type is required';
                    }
                    if (!data.number_of_floors || data.number_of_floors <= 0) {
                        stepErrors.number_of_floors = 'Number of floors is required';
                    }
                    if (!data.building_footprint_sqm || data.building_footprint_sqm <= 0) {
                        stepErrors.building_footprint_sqm = 'Building footprint is required';
                    }
                }
                break;
            case 6:
                if (!data.pin_lat || !data.pin_lng) {
                    stepErrors.pin_lat = 'Please select a location on the map';
                }
                if (!data.project_address) {
                    stepErrors.project_address = 'Project address is required';
                }
                break;
        }

        setLocalErrors(stepErrors);
        return Object.keys(stepErrors).length === 0;
    };

    const nextStep = () => {
        if (currentStep < STEPS.length && validateStep(currentStep)) {
            setCompletedSteps((prev) => new Set([...prev, currentStep]));
            
            // Skip building step if subdivision only
            if (currentStep === 4 && data.project_type === 'subdivision_only') {
                setCurrentStep(6); // Skip to location
            } else {
                setCurrentStep(currentStep + 1);
            }
            
            setLocalErrors({});
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setLocalErrors({});
            
            // Skip building step if going back from location
            if (currentStep === 6 && data.project_type === 'subdivision_only') {
                setCurrentStep(4); // Go back to subdivision
            } else {
                setCurrentStep(currentStep - 1);
            }
        }
    };

    const handleStepClick = (stepNumber: number) => {
        if (stepNumber <= currentStep || completedSteps.has(stepNumber)) {
            setCurrentStep(stepNumber);
            setLocalErrors({});
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateStep(currentStep)) {
            post('/development-clearance', {
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
                                Project Type Selection
                            </h2>
                            <p className="mb-6 text-gray-600 dark:text-gray-400 text-sm">
                                Select the type of development project you are applying for.
                            </p>
                        </div>

                        <div>
                            <label className="block mb-4 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                Project Type *
                            </label>
                            <div className="space-y-4">
                                <div
                                    onClick={() => setData('project_type', 'subdivision_only')}
                                    className={`
                                        p-6 rounded-xl border-2 cursor-pointer transition-all
                                        ${data.project_type === 'subdivision_only'
                                            ? 'border-primary bg-primary/5 dark:bg-primary/10'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
                                        }
                                    `}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`
                                            p-2 rounded-lg
                                            ${data.project_type === 'subdivision_only' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}
                                        `}>
                                            <input
                                                type="radio"
                                                checked={data.project_type === 'subdivision_only'}
                                                onChange={() => setData('project_type', 'subdivision_only')}
                                                className="sr-only"
                                            />
                                            {data.project_type === 'subdivision_only' && '✓'}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className={`font-semibold mb-2 ${data.project_type === 'subdivision_only' ? 'text-primary' : 'text-gray-900 dark:text-gray-100'}`}>
                                                Subdivision Only (Selling Raw Lots)
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                For developers subdividing land and selling raw lots to individual buyers. 
                                                Buyers will apply for building permits separately.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div
                                    onClick={() => setData('project_type', 'subdivision_with_building')}
                                    className={`
                                        p-6 rounded-xl border-2 cursor-pointer transition-all
                                        ${data.project_type === 'subdivision_with_building'
                                            ? 'border-primary bg-primary/5 dark:bg-primary/10'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
                                        }
                                    `}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`
                                            p-2 rounded-lg
                                            ${data.project_type === 'subdivision_with_building' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}
                                        `}>
                                            <input
                                                type="radio"
                                                checked={data.project_type === 'subdivision_with_building'}
                                                onChange={() => setData('project_type', 'subdivision_with_building')}
                                                className="sr-only"
                                            />
                                            {data.project_type === 'subdivision_with_building' && '✓'}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className={`font-semibold mb-2 ${data.project_type === 'subdivision_with_building' ? 'text-primary' : 'text-gray-900 dark:text-gray-100'}`}>
                                                Subdivision + Building (Selling Completed Units)
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                For developers subdividing land AND building structures. 
                                                Selling completed units, not raw lots. Includes building review.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {(localErrors.project_type || errors.project_type) && (
                                <p className="mt-2 text-red-500 text-sm">{localErrors.project_type || errors.project_type}</p>
                            )}
                        </div>
                    </div>
                );

            case 2:
                const handleClearanceInputChange = (value: string) => {
                    // Update the input value immediately
                    setData('zoning_clearance_no', value);
                    
                    // Clear previous status if input is empty
                    if (!value) {
                        setClearanceStatus(null);
                        setLocalErrors((prev) => {
                            const newErrors = { ...prev };
                            delete newErrors.zoning_clearance_no;
                            return newErrors;
                        });
                        return;
                    }

                    // Clear previous timeout
                    if (verificationTimeoutRef.current) {
                        clearTimeout(verificationTimeoutRef.current);
                    }

                    // Clear status while typing
                    setClearanceStatus(null);
                    setLocalErrors((prev) => {
                        const newErrors = { ...prev };
                        delete newErrors.zoning_clearance_no;
                        return newErrors;
                    });

                    // Debounce verification - only verify after user stops typing for 800ms
                    verificationTimeoutRef.current = setTimeout(async () => {
                        // Only verify if the value is long enough and looks like a clearance number
                        if (value.length < 5 || !value.trim()) {
                            return;
                        }

                        // Basic validation - clearance numbers typically start with "ZC" or similar
                        const trimmedValue = value.trim();
                        if (!trimmedValue.match(/^[A-Z0-9-]+$/i)) {
                            return;
                        }

                        setVerifyingClearance(true);
                        try {
                            const response = await fetch(`/api/zoning-clearance/verify/${encodeURIComponent(trimmedValue)}`, {
                                headers: {
                                    'Accept': 'application/json',
                                    'X-Requested-With': 'XMLHttpRequest',
                                },
                            });

                            const result = await response.json();

                            if (result.valid) {
                                setClearanceStatus({
                                    valid: true,
                                    message: result.message,
                                    clearance: result.clearance,
                                });
                                
                                // Auto-populate location from zoning clearance application
                                if (result.clearance?.application) {
                                    const app = result.clearance.application;
                                    if (app.pin_lat && app.pin_lng) {
                                        // Ensure values are numbers
                                        const lat = typeof app.pin_lat === 'string' ? parseFloat(app.pin_lat) : app.pin_lat;
                                        const lng = typeof app.pin_lng === 'string' ? parseFloat(app.pin_lng) : app.pin_lng;
                                        
                                        if (!isNaN(lat) && !isNaN(lng)) {
                                            setData('pin_lat', lat);
                                            setData('pin_lng', lng);
                                        }
                                    }
                                    if (app.lot_address) {
                                        setData('project_address', app.lot_address);
                                    }
                                }
                            } else {
                                setClearanceStatus({
                                    valid: false,
                                    message: result.message,
                                    clearance: result.clearance,
                                });
                                setLocalErrors((prev) => ({
                                    ...prev,
                                    zoning_clearance_no: result.message,
                                }));
                            }
                        } catch (error) {
                            console.error('Failed to verify clearance:', error);
                            setClearanceStatus({
                                valid: false,
                                message: 'Failed to verify zoning clearance. Please try again.',
                            });
                        } finally {
                            setVerifyingClearance(false);
                        }
                    }, 800);
                };

                return (
                    <div className="space-y-6">
                        <div>
                            <h2 className="mb-4 font-semibold text-gray-900 dark:text-white text-xl">
                                Zoning Clearance Reference
                            </h2>
                            <p className="mb-6 text-gray-600 dark:text-gray-400 text-sm">
                                Please provide your zoning clearance number. This is a prerequisite for Development Clearance.
                            </p>
                        </div>

                        <div>
                            <Input
                                label="Zoning Clearance Number *"
                                value={data.zoning_clearance_no}
                                onChange={(e) => handleClearanceInputChange(e.target.value)}
                                error={localErrors.zoning_clearance_no || errors.zoning_clearance_no}
                                placeholder="Enter zoning clearance number (e.g., ZC-CLEAR-2024-00001)"
                            />

                            {verifyingClearance && (
                                <div className="flex items-center gap-2 mt-2 text-blue-600 dark:text-blue-400 text-sm">
                                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                    <span>Verifying clearance number...</span>
                                </div>
                            )}

                            {clearanceStatus && !verifyingClearance && (
                                <div
                                    className={`mt-2 p-3 rounded-lg border ${
                                        clearanceStatus.valid
                                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                                    }`}
                                >
                                    <div className="flex items-start gap-2">
                                        {clearanceStatus.valid ? (
                                            <CheckCircle className="mt-0.5 text-green-600 dark:text-green-400 flex-shrink-0" size={18} />
                                        ) : (
                                            <AlertCircle className="mt-0.5 text-red-600 dark:text-red-400 flex-shrink-0" size={18} />
                                        )}
                                        <div className="flex-1">
                                            <p
                                                className={`text-sm font-medium ${
                                                    clearanceStatus.valid
                                                        ? 'text-green-800 dark:text-green-200'
                                                        : 'text-red-800 dark:text-red-200'
                                                }`}
                                            >
                                                {clearanceStatus.message}
                                            </p>
                                            {clearanceStatus.clearance && (
                                                <div className="mt-2 space-y-1 text-xs">
                                                    {clearanceStatus.clearance.issue_date && (
                                                        <p
                                                            className={
                                                                clearanceStatus.valid
                                                                    ? 'text-green-700 dark:text-green-300'
                                                                    : 'text-red-700 dark:text-red-300'
                                                            }
                                                        >
                                                            Issue Date: {new Date(clearanceStatus.clearance.issue_date).toLocaleDateString()}
                                                        </p>
                                                    )}
                                                    {clearanceStatus.clearance.valid_until && (
                                                        <p
                                                            className={
                                                                clearanceStatus.valid
                                                                    ? 'text-green-700 dark:text-green-300'
                                                                    : 'text-red-700 dark:text-red-300'
                                                            }
                                                        >
                                                            Valid Until: {new Date(clearanceStatus.clearance.valid_until).toLocaleDateString()}
                                                        </p>
                                                    )}
                                                    {clearanceStatus.clearance.application && (
                                                        <p
                                                            className={
                                                                clearanceStatus.valid
                                                                    ? 'text-green-700 dark:text-green-300'
                                                                    : 'text-red-700 dark:text-red-300'
                                                            }
                                                        >
                                                            Application: {clearanceStatus.clearance.application.reference_no}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                            <p className="text-blue-800 dark:text-blue-200 text-sm">
                                <strong>Note:</strong> You must have a valid Zoning Clearance before applying for Development Clearance. 
                                If you don't have one, please apply for Zoning Clearance first.
                            </p>
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-6">
                        <div>
                            <h2 className="mb-4 font-semibold text-gray-900 dark:text-white text-xl">
                                Applicant Information
                            </h2>
                            <p className="mb-6 text-gray-600 dark:text-gray-400 text-sm">
                                Please provide your contact details and applicant type.
                            </p>
                        </div>

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

            case 4:
                return (
                    <div className="space-y-6">
                        <div>
                            <h2 className="mb-4 font-semibold text-gray-900 dark:text-white text-xl">
                                Subdivision Details
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
                                    Open space must be at least 30% to comply with PD 957 regulations.
                                </p>
                            </div>
                        )}
                    </div>
                );

            case 5:
                if (data.project_type === 'subdivision_only') {
                    return null; // This step should be skipped
                }

                return (
                    <div className="space-y-6">
                        <div>
                            <h2 className="mb-4 font-semibold text-gray-900 dark:text-white text-xl">
                                Building Details
                            </h2>
                            <p className="mb-6 text-gray-600 dark:text-gray-400 text-sm">
                                Provide details about the buildings you plan to construct as part of this subdivision.
                            </p>
                        </div>

                        <div>
                            <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                Building Type *
                            </label>
                            <select
                                value={data.building_type}
                                onChange={(e) => setData('building_type', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                                <option value="">Select building type</option>
                                <option value="residential">Residential</option>
                                <option value="commercial">Commercial</option>
                                <option value="industrial">Industrial</option>
                                <option value="mixed_use">Mixed Use</option>
                                <option value="institutional">Institutional</option>
                            </select>
                            {(localErrors.building_type || errors.building_type) && (
                                <p className="mt-1 text-red-500 text-sm">{localErrors.building_type || errors.building_type}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Number of Floors *"
                                type="number"
                                min="1"
                                value={data.number_of_floors || ''}
                                onChange={(e) => setData('number_of_floors', parseInt(e.target.value) || null)}
                                error={localErrors.number_of_floors || errors.number_of_floors}
                                placeholder="0"
                            />

                            <Input
                                label="Building Footprint (sqm) *"
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.building_footprint_sqm || ''}
                                onChange={(e) => setData('building_footprint_sqm', parseFloat(e.target.value) || null)}
                                error={localErrors.building_footprint_sqm || errors.building_footprint_sqm}
                                placeholder="0.00"
                            />

                            <Input
                                label="Total Floor Area (sqm)"
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.total_floor_area_sqm || ''}
                                onChange={(e) => setData('total_floor_area_sqm', parseFloat(e.target.value) || null)}
                                error={errors.total_floor_area_sqm}
                                placeholder="0.00"
                            />

                            <Input
                                label="Floor Area Ratio (FAR)"
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.floor_area_ratio || ''}
                                onChange={(e) => setData('floor_area_ratio', parseFloat(e.target.value) || null)}
                                error={errors.floor_area_ratio}
                                placeholder="0.00"
                            />
                        </div>

                        <div>
                            <h3 className="mb-4 font-medium text-gray-900 dark:text-white">Setbacks (meters)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <Input
                                    label="Front Setback (m)"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={data.front_setback_m || ''}
                                    onChange={(e) => setData('front_setback_m', parseFloat(e.target.value) || null)}
                                    error={errors.front_setback_m}
                                    placeholder="0.00"
                                />

                                <Input
                                    label="Rear Setback (m)"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={data.rear_setback_m || ''}
                                    onChange={(e) => setData('rear_setback_m', parseFloat(e.target.value) || null)}
                                    error={errors.rear_setback_m}
                                    placeholder="0.00"
                                />

                                <Input
                                    label="Side Setback (m)"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={data.side_setback_m || ''}
                                    onChange={(e) => setData('side_setback_m', parseFloat(e.target.value) || null)}
                                    error={errors.side_setback_m}
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        <Input
                            label="Building Open Space (sqm)"
                            type="number"
                            step="0.01"
                            min="0"
                            value={data.building_open_space_sqm || ''}
                            onChange={(e) => setData('building_open_space_sqm', parseFloat(e.target.value) || null)}
                            error={errors.building_open_space_sqm}
                            placeholder="0.00"
                        />
                    </div>
                );

            case 6:
                const locationFromClearance = data.pin_lat && data.pin_lng && data.zoning_clearance_no;

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

                        {locationFromClearance && (
                            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                <p className="text-green-800 dark:text-green-200 text-sm">
                                    <strong>Location pre-filled:</strong> The location has been automatically populated from your Zoning Clearance ({data.zoning_clearance_no}). 
                                    You can adjust the pin location if needed.
                                </p>
                            </div>
                        )}

                        <PropertyLocation
                            mode="form"
                            pinLat={data.pin_lat}
                            pinLng={data.pin_lng}
                            lotAddress={data.project_address}
                            zones={zones}
                            readOnly={locationFromClearance}
                            onLocationSelect={(lat, lng) => {
                                setData('pin_lat', lat);
                                setData('pin_lng', lng);
                            }}
                            onAddressChange={(field, value) => {
                                if (field === 'lot_address') {
                                    setData('project_address', value);
                                }
                            }}
                            errors={{
                                pin_lat: localErrors.pin_lat || errors.pin_lat,
                                pin_lng: errors.pin_lng,
                                lot_address: localErrors.project_address || errors.project_address,
                            }}
                        />
                    </div>
                );

            case 7:
                return (
                    <div className="space-y-6">
                        <div>
                            <h2 className="mb-4 font-semibold text-gray-900 dark:text-white text-xl">
                                Documents Upload
                            </h2>
                            <p className="mb-6 text-gray-600 dark:text-gray-400 text-sm">
                                Upload required documents for your application.
                            </p>
                        </div>

                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                            <p className="text-blue-800 dark:text-blue-200 text-sm">
                                Document upload functionality will be implemented in Phase 3. For now, you can proceed to review and submit.
                            </p>
                        </div>
                    </div>
                );

            case 8:
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
                                <h3 className="mb-2 font-medium text-gray-900 dark:text-white">Project Type</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">
                                    {data.project_type === 'subdivision_only' 
                                        ? 'Subdivision Only (Selling Raw Lots)'
                                        : 'Subdivision + Building (Selling Completed Units)'
                                    }
                                </p>
                            </div>
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
                            {data.project_type === 'subdivision_with_building' && data.building_type && (
                                <>
                                    <div>
                                        <h3 className="mb-2 font-medium text-gray-900 dark:text-white">Building Type</h3>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm capitalize">{data.building_type.replace('_', ' ')}</p>
                                    </div>
                                    {data.number_of_floors && (
                                        <div>
                                            <h3 className="mb-2 font-medium text-gray-900 dark:text-white">Number of Floors</h3>
                                            <p className="text-gray-600 dark:text-gray-400 text-sm">{data.number_of_floors}</p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    // Adjust steps array based on project type
    const getSteps = () => {
        if (data.project_type === 'subdivision_only') {
            return STEPS.filter((_, index) => {
                const stepNum = index + 1;
                return stepNum !== 5; // Remove building details step
            });
        }
        return STEPS;
    };

    const displaySteps = getSteps();

    return (
        <div className="flex flex-col bg-background dark:bg-dark-bg w-full min-h-dvh transition-colors">
            <Header />

            <div className="flex-1 mt-16 py-8 w-full">
                <div className="mx-auto px-4 max-w-4xl">
                    <div className="mb-6">
                        <Link href="/">
                            <Button variant="secondary" size="sm" className="flex items-center gap-2">
                                <ArrowLeft size={18} />
                                Back to Home
                            </Button>
                        </Link>
                    </div>

                    <div className="mb-8">
                        <h1 className="mb-2 font-bold text-gray-900 dark:text-white text-3xl">
                            Development Clearance Application
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Apply for subdivision and building development clearance (PD 957)
                        </p>
                    </div>

                    <div className="mb-8">
                        <StepProgress 
                            steps={displaySteps} 
                            currentStep={currentStep <= displaySteps.length ? currentStep : displaySteps.length}
                            completedSteps={completedSteps}
                            onStepClick={handleStepClick}
                        />
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

                            {currentStep < displaySteps.length ? (
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
