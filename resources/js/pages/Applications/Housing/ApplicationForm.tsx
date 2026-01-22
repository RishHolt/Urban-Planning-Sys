import { useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import FileUpload from '../../../components/FileUpload';
import StepProgress from '../../../components/StepProgress';
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { Link } from '@inertiajs/react';

const STEPS = [
    'Application Type',
    'Personal Information',
    'Contact & Address',
    'Eligibility Information',
    'Documents',
    'Review & Submit',
];

type ApplicationType = 'individual' | 'household';
type Gender = 'male' | 'female' | 'other' | '';
type EmploymentStatus = 'employed' | 'unemployed' | 'self_employed' | 'retired' | 'student' | 'other' | '';

interface HousingApplicationFormData {
    applicationType: ApplicationType;
    beneficiary: {
        firstName: string;
        lastName: string;
        middleName: string;
        suffix: string;
        birthDate: string;
        gender: Gender;
        civilStatus: string;
        email: string;
        mobileNumber: string;
        telephoneNumber: string;
        address: string;
        street: string;
        barangay: string;
        city: string;
        province: string;
        zipCode: string;
        employmentStatus: EmploymentStatus;
        occupation: string;
        employerName: string;
        monthlyIncome: string;
        householdIncome: string;
        isIndigent: boolean;
        isSeniorCitizen: boolean;
        isPwd: boolean;
        isSingleParent: boolean;
        isVictimOfDisaster: boolean;
        specialEligibilityNotes: string;
    };
    household: {
        householdName: string;
        primaryContactMobile: string;
        primaryContactEmail: string;
        address: string;
        barangay: string;
        city: string;
        province: string;
        householdSize: string;
        totalMonthlyIncome: string;
    };
    documents: {
        proofOfIdentity: File | null;
        proofOfIncome: File | null;
        proofOfResidence: File | null;
        specialEligibilityCertificate: File | null;
    };
    applicationNotes: string;
}

type ValidationErrors = Record<string, string>;

export default function ApplicationForm() {
    const [currentStep, setCurrentStep] = useState(1);
    const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
    const [localErrors, setLocalErrors] = useState<ValidationErrors>({});

    const { data, setData, post, processing, errors: backendErrors } = useForm<HousingApplicationFormData>({
        applicationType: 'individual',
        beneficiary: {
            firstName: '',
            lastName: '',
            middleName: '',
            suffix: '',
            birthDate: '',
            gender: '',
            civilStatus: '',
            email: '',
            mobileNumber: '',
            telephoneNumber: '',
            address: '',
            street: '',
            barangay: '',
            city: '',
            province: '',
            zipCode: '',
            employmentStatus: '',
            occupation: '',
            employerName: '',
            monthlyIncome: '',
            householdIncome: '',
            isIndigent: false,
            isSeniorCitizen: false,
            isPwd: false,
            isSingleParent: false,
            isVictimOfDisaster: false,
            specialEligibilityNotes: '',
        },
        household: {
            householdName: '',
            primaryContactMobile: '',
            primaryContactEmail: '',
            address: '',
            barangay: '',
            city: '',
            province: '',
            householdSize: '',
            totalMonthlyIncome: '',
        },
        documents: {
            proofOfIdentity: null,
            proofOfIncome: null,
            proofOfResidence: null,
            specialEligibilityCertificate: null,
        },
        applicationNotes: '',
    });

    const errors = useMemo(() => {
        return { ...localErrors, ...(backendErrors as unknown as ValidationErrors) };
    }, [localErrors, backendErrors]);

    const setBeneficiaryField = (key: keyof HousingApplicationFormData['beneficiary'], value: any) => {
        setData('beneficiary', {
            ...data.beneficiary,
            [key]: value,
        });
    };

    const setHouseholdField = (key: keyof HousingApplicationFormData['household'], value: any) => {
        setData('household', {
            ...data.household,
            [key]: value,
        });
    };

    const setDocumentField = (key: keyof HousingApplicationFormData['documents'], value: File | null) => {
        setData('documents', {
            ...data.documents,
            [key]: value,
        });
    };

    const getError = (key: string): string | undefined => {
        return errors[key];
    };

    const validateCurrentStep = (): boolean => {
        // Validation disabled temporarily for testing.
        setLocalErrors({});
        return true;
    };

    const nextStep = () => {
        if (currentStep < STEPS.length && validateCurrentStep()) {
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

    const handleSubmit = (): void => {
        setLocalErrors({});
        post('/applications/housing', {
            forceFormData: true,
            preserveScroll: true,
        });
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
                        {errors.error && (
                            <div className="mb-6 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
                                <div className="flex items-start gap-2">
                                    <AlertCircle size={18} className="mt-0.5 text-red-600 dark:text-red-400" />
                                    <p className="text-sm text-red-800 dark:text-red-200">{errors.error}</p>
                                </div>
                            </div>
                        )}

                            {/* Step 1: Application Type */}
                            {currentStep === 1 && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="mb-2 font-bold text-gray-900 dark:text-white text-2xl">
                                            Application Type
                                        </h2>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                                            Select whether you are applying as an individual or as a household.
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                            Application Type <span className="text-red-500">*</span>
                                        </label>
                                        <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                                            <label className="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg transition-colors cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="applicationType"
                                                    value="individual"
                                                    checked={data.applicationType === 'individual'}
                                                    onChange={() => setData('applicationType', 'individual')}
                                                    className="text-primary"
                                                />
                                                <span className="text-gray-700 dark:text-gray-300">Individual</span>
                                            </label>
                                            <label className="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg transition-colors cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="applicationType"
                                                    value="household"
                                                    checked={data.applicationType === 'household'}
                                                    onChange={() => setData('applicationType', 'household')}
                                                    className="text-primary"
                                                />
                                                <span className="text-gray-700 dark:text-gray-300">Household</span>
                                            </label>
                                        </div>
                                        {getError('applicationType') && (
                                            <p className="mt-1 text-red-500 text-sm">{getError('applicationType')}</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Personal / Household Information */}
                            {currentStep === 2 && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="mb-2 font-bold text-gray-900 dark:text-white text-2xl">
                                            {data.applicationType === 'individual' ? 'Personal Information' : 'Household Information'}
                                        </h2>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                                            {data.applicationType === 'individual' 
                                                ? 'Provide your personal details and information.'
                                                : 'Provide your household details and information.'}
                                        </p>
                                    </div>

                                    {data.applicationType === 'individual' ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <Input
                                                label="First Name"
                                                value={data.beneficiary.firstName}
                                                onChange={(e) => setBeneficiaryField('firstName', e.target.value)}
                                                error={getError('beneficiary.firstName')}
                                            />
                                            <Input
                                                label="Last Name"
                                                value={data.beneficiary.lastName}
                                                onChange={(e) => setBeneficiaryField('lastName', e.target.value)}
                                                error={getError('beneficiary.lastName')}
                                            />
                                            <Input
                                                label="Middle Name"
                                                value={data.beneficiary.middleName}
                                                onChange={(e) => setBeneficiaryField('middleName', e.target.value)}
                                                error={getError('beneficiary.middleName')}
                                            />
                                            <Input
                                                label="Suffix"
                                                value={data.beneficiary.suffix}
                                                onChange={(e) => setBeneficiaryField('suffix', e.target.value)}
                                                error={getError('beneficiary.suffix')}
                                            />
                                            <Input
                                                type="date"
                                                label="Birth Date"
                                                value={data.beneficiary.birthDate}
                                                onChange={(e) => setBeneficiaryField('birthDate', e.target.value)}
                                                error={getError('beneficiary.birthDate')}
                                            />
                                            <div className="w-full">
                                                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                                    Gender
                                                </label>
                                                <select
                                                    value={data.beneficiary.gender}
                                                    onChange={(e) => setBeneficiaryField('gender', e.target.value as Gender)}
                                                    className={`
                                                        w-full px-4 py-3 rounded-lg border transition-colors
                                                        ${getError('beneficiary.gender')
                                                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                            : 'border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary'
                                                        }
                                                        bg-white dark:bg-dark-surface
                                                        text-gray-900 dark:text-white
                                                        focus:outline-none focus:ring-2 focus:ring-opacity-20
                                                    `}
                                                >
                                                    <option value="">Select...</option>
                                                    <option value="male">Male</option>
                                                    <option value="female">Female</option>
                                                    <option value="other">Other</option>
                                                </select>
                                                {getError('beneficiary.gender') && <p className="mt-1 text-red-500 text-sm">{getError('beneficiary.gender')}</p>}
                                            </div>
                                            <Input
                                                label="Civil Status"
                                                value={data.beneficiary.civilStatus}
                                                onChange={(e) => setBeneficiaryField('civilStatus', e.target.value)}
                                                error={getError('beneficiary.civilStatus')}
                                            />
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <Input
                                                label="Household Name"
                                                value={data.household.householdName}
                                                onChange={(e) => setHouseholdField('householdName', e.target.value)}
                                                error={getError('household.householdName')}
                                            />
                                            <Input
                                                label="Household Size"
                                                type="number"
                                                value={data.household.householdSize}
                                                onChange={(e) => setHouseholdField('householdSize', e.target.value)}
                                                error={getError('household.householdSize')}
                                            />
                                            <Input
                                                label="Total Monthly Income"
                                                type="number"
                                                value={data.household.totalMonthlyIncome}
                                                onChange={(e) => setHouseholdField('totalMonthlyIncome', e.target.value)}
                                                error={getError('household.totalMonthlyIncome')}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Step 3: Contact & Address */}
                            {currentStep === 3 && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="mb-2 font-bold text-gray-900 dark:text-white text-2xl">
                                            Contact & Address
                                        </h2>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                                            Provide your contact information and address details.
                                        </p>
                                    </div>

                                    {data.applicationType === 'individual' ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <Input
                                                label="Mobile Number"
                                                placeholder="09XXXXXXXXX"
                                                value={data.beneficiary.mobileNumber}
                                                onChange={(e) => setBeneficiaryField('mobileNumber', e.target.value)}
                                                error={getError('beneficiary.mobileNumber')}
                                            />
                                            <Input
                                                label="Email"
                                                type="email"
                                                value={data.beneficiary.email}
                                                onChange={(e) => setBeneficiaryField('email', e.target.value)}
                                                error={getError('beneficiary.email')}
                                            />
                                            <Input
                                                label="Telephone Number"
                                                value={data.beneficiary.telephoneNumber}
                                                onChange={(e) => setBeneficiaryField('telephoneNumber', e.target.value)}
                                                error={getError('beneficiary.telephoneNumber')}
                                            />
                                            <Input
                                                label="Street"
                                                value={data.beneficiary.street}
                                                onChange={(e) => setBeneficiaryField('street', e.target.value)}
                                                error={getError('beneficiary.street')}
                                            />
                                            <div className="md:col-span-2">
                                                <Input
                                                    label="Full Address"
                                                    value={data.beneficiary.address}
                                                    onChange={(e) => setBeneficiaryField('address', e.target.value)}
                                                    error={getError('beneficiary.address')}
                                                />
                                            </div>
                                            <Input
                                                label="Barangay"
                                                value={data.beneficiary.barangay}
                                                onChange={(e) => setBeneficiaryField('barangay', e.target.value)}
                                                error={getError('beneficiary.barangay')}
                                            />
                                            <Input
                                                label="City"
                                                value={data.beneficiary.city}
                                                onChange={(e) => setBeneficiaryField('city', e.target.value)}
                                                error={getError('beneficiary.city')}
                                            />
                                            <Input
                                                label="Province"
                                                value={data.beneficiary.province}
                                                onChange={(e) => setBeneficiaryField('province', e.target.value)}
                                                error={getError('beneficiary.province')}
                                            />
                                            <Input
                                                label="Zip Code"
                                                value={data.beneficiary.zipCode}
                                                onChange={(e) => setBeneficiaryField('zipCode', e.target.value)}
                                                error={getError('beneficiary.zipCode')}
                                            />
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <Input
                                                label="Primary Contact Mobile"
                                                placeholder="09XXXXXXXXX"
                                                value={data.household.primaryContactMobile}
                                                onChange={(e) => setHouseholdField('primaryContactMobile', e.target.value)}
                                                error={getError('household.primaryContactMobile')}
                                            />
                                            <Input
                                                label="Primary Contact Email"
                                                type="email"
                                                value={data.household.primaryContactEmail}
                                                onChange={(e) => setHouseholdField('primaryContactEmail', e.target.value)}
                                                error={getError('household.primaryContactEmail')}
                                            />
                                            <div className="md:col-span-2">
                                                <Input
                                                    label="Household Address"
                                                    value={data.household.address}
                                                    onChange={(e) => setHouseholdField('address', e.target.value)}
                                                    error={getError('household.address')}
                                                />
                                            </div>
                                            <Input
                                                label="Barangay"
                                                value={data.household.barangay}
                                                onChange={(e) => setHouseholdField('barangay', e.target.value)}
                                                error={getError('household.barangay')}
                                            />
                                            <Input
                                                label="City"
                                                value={data.household.city}
                                                onChange={(e) => setHouseholdField('city', e.target.value)}
                                                error={getError('household.city')}
                                            />
                                            <Input
                                                label="Province"
                                                value={data.household.province}
                                                onChange={(e) => setHouseholdField('province', e.target.value)}
                                                error={getError('household.province')}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Step 4: Eligibility Information */}
                            {currentStep === 4 && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="mb-2 font-bold text-gray-900 dark:text-white text-2xl">
                                            Eligibility Information
                                        </h2>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                                            Provide employment and eligibility information.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="w-full">
                                            <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                                Employment Status
                                            </label>
                                            <select
                                                value={data.beneficiary.employmentStatus}
                                                onChange={(e) => setBeneficiaryField('employmentStatus', e.target.value as EmploymentStatus)}
                                                className={`
                                                    w-full px-4 py-3 rounded-lg border transition-colors
                                                    ${getError('beneficiary.employmentStatus')
                                                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                        : 'border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary'
                                                    }
                                                    bg-white dark:bg-dark-surface
                                                    text-gray-900 dark:text-white
                                                    focus:outline-none focus:ring-2 focus:ring-opacity-20
                                                `}
                                            >
                                                <option value="">Select...</option>
                                                <option value="employed">Employed</option>
                                                <option value="unemployed">Unemployed</option>
                                                <option value="self_employed">Self-employed</option>
                                                <option value="retired">Retired</option>
                                                <option value="student">Student</option>
                                                <option value="other">Other</option>
                                            </select>
                                            {getError('beneficiary.employmentStatus') && <p className="mt-1 text-red-500 text-sm">{getError('beneficiary.employmentStatus')}</p>}
                                        </div>
                                        <Input
                                            label="Occupation"
                                            value={data.beneficiary.occupation}
                                            onChange={(e) => setBeneficiaryField('occupation', e.target.value)}
                                            error={getError('beneficiary.occupation')}
                                        />
                                        <Input
                                            label="Employer Name"
                                            value={data.beneficiary.employerName}
                                            onChange={(e) => setBeneficiaryField('employerName', e.target.value)}
                                            error={getError('beneficiary.employerName')}
                                        />
                                        <Input
                                            label="Monthly Income"
                                            type="number"
                                            value={data.beneficiary.monthlyIncome}
                                            onChange={(e) => setBeneficiaryField('monthlyIncome', e.target.value)}
                                            error={getError('beneficiary.monthlyIncome')}
                                        />
                                        <Input
                                            label="Household Income"
                                            type="number"
                                            value={data.beneficiary.householdIncome}
                                            onChange={(e) => setBeneficiaryField('householdIncome', e.target.value)}
                                            error={getError('beneficiary.householdIncome')}
                                        />
                                    </div>

                                    <div>
                                        <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">Eligibility Criteria</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <label className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    checked={data.beneficiary.isIndigent} 
                                                    onChange={(e) => setBeneficiaryField('isIndigent', e.target.checked)}
                                                    className="border-gray-300 rounded focus:ring-primary text-primary"
                                                />
                                                <span className="text-gray-700 dark:text-gray-300">Indigent</span>
                                            </label>
                                            <label className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    checked={data.beneficiary.isSeniorCitizen} 
                                                    onChange={(e) => setBeneficiaryField('isSeniorCitizen', e.target.checked)}
                                                    className="border-gray-300 rounded focus:ring-primary text-primary"
                                                />
                                                <span className="text-gray-700 dark:text-gray-300">Senior Citizen</span>
                                            </label>
                                            <label className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    checked={data.beneficiary.isPwd} 
                                                    onChange={(e) => setBeneficiaryField('isPwd', e.target.checked)}
                                                    className="border-gray-300 rounded focus:ring-primary text-primary"
                                                />
                                                <span className="text-gray-700 dark:text-gray-300">PWD</span>
                                            </label>
                                            <label className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    checked={data.beneficiary.isSingleParent} 
                                                    onChange={(e) => setBeneficiaryField('isSingleParent', e.target.checked)}
                                                    className="border-gray-300 rounded focus:ring-primary text-primary"
                                                />
                                                <span className="text-gray-700 dark:text-gray-300">Single Parent</span>
                                            </label>
                                            <label className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    checked={data.beneficiary.isVictimOfDisaster} 
                                                    onChange={(e) => setBeneficiaryField('isVictimOfDisaster', e.target.checked)}
                                                    className="border-gray-300 rounded focus:ring-primary text-primary"
                                                />
                                                <span className="text-gray-700 dark:text-gray-300">Victim of Disaster</span>
                                            </label>
                                        </div>

                                        <div className="mt-6">
                                            <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                                Special Eligibility Notes
                                            </label>
                                            <textarea
                                                value={data.beneficiary.specialEligibilityNotes}
                                                onChange={(e) => setBeneficiaryField('specialEligibilityNotes', e.target.value)}
                                                rows={4}
                                                className={`
                                                    w-full px-4 py-3 rounded-lg border transition-colors
                                                    ${getError('beneficiary.specialEligibilityNotes')
                                                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                        : 'border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary'
                                                    }
                                                    bg-white dark:bg-dark-surface
                                                    text-gray-900 dark:text-white
                                                    placeholder:text-gray-400 dark:placeholder:text-gray-500
                                                    focus:outline-none focus:ring-2 focus:ring-opacity-20
                                                `}
                                                placeholder="Optional notes..."
                                            />
                                            {getError('beneficiary.specialEligibilityNotes') && (
                                                <p className="mt-1 text-red-500 text-sm">{getError('beneficiary.specialEligibilityNotes')}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 5: Documents */}
                            {currentStep === 5 && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="mb-2 font-bold text-gray-900 dark:text-white text-2xl">
                                            Required Documents
                                        </h2>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                                            Upload supporting documents for your application.
                                        </p>
                                    </div>

                                    <div className="space-y-6">
                                        <FileUpload
                                            label="Proof of Identity (ID)"
                                            accept="image/*,.pdf"
                                            maxSizeMB={5}
                                            value={data.documents.proofOfIdentity}
                                            onChange={(file) => setDocumentField('proofOfIdentity', file)}
                                            error={getError('documents.proofOfIdentity')}
                                            required
                                            allowedTypes={['image/*', 'application/pdf']}
                                        />
                                        <FileUpload
                                            label="Proof of Income / Employment"
                                            accept="image/*,.pdf"
                                            maxSizeMB={5}
                                            value={data.documents.proofOfIncome}
                                            onChange={(file) => setDocumentField('proofOfIncome', file)}
                                            error={getError('documents.proofOfIncome')}
                                            required
                                            allowedTypes={['image/*', 'application/pdf']}
                                        />
                                        <FileUpload
                                            label="Proof of Residence"
                                            accept="image/*,.pdf"
                                            maxSizeMB={5}
                                            value={data.documents.proofOfResidence}
                                            onChange={(file) => setDocumentField('proofOfResidence', file)}
                                            error={getError('documents.proofOfResidence')}
                                            required
                                            allowedTypes={['image/*', 'application/pdf']}
                                        />
                                        <FileUpload
                                            label="Special Eligibility Certificate (Optional)"
                                            accept="image/*,.pdf"
                                            maxSizeMB={5}
                                            value={data.documents.specialEligibilityCertificate}
                                            onChange={(file) => setDocumentField('specialEligibilityCertificate', file)}
                                            error={getError('documents.specialEligibilityCertificate')}
                                            allowedTypes={['image/*', 'application/pdf']}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Step 6: Review & Submit */}
                            {currentStep === 6 && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="mb-2 font-bold text-gray-900 dark:text-white text-2xl">
                                            Review & Submit
                                        </h2>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                                            Review your application and add any final notes before submitting.
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Application Type</div>
                                        <div className="font-semibold text-gray-900 dark:text-white">
                                            {data.applicationType === 'individual' ? 'Individual' : 'Household'}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                            Application Notes (Optional)
                                        </label>
                                        <textarea
                                            value={data.applicationNotes}
                                            onChange={(e) => setData('applicationNotes', e.target.value)}
                                            rows={5}
                                            className={`
                                                w-full px-4 py-3 rounded-lg border transition-colors
                                                ${getError('applicationNotes')
                                                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                    : 'border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary'
                                                }
                                                bg-white dark:bg-dark-surface
                                                text-gray-900 dark:text-white
                                                placeholder:text-gray-400 dark:placeholder:text-gray-500
                                                focus:outline-none focus:ring-2 focus:ring-opacity-20
                                            `}
                                            placeholder="Any additional notes..."
                                        />
                                        {getError('applicationNotes') && <p className="mt-1 text-red-500 text-sm">{getError('applicationNotes')}</p>}
                                    </div>

                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 border border-blue-200 dark:border-blue-800 rounded-lg">
                                        <p className="text-sm text-blue-800 dark:text-blue-200">
                                            By submitting, you confirm that the information you provided is accurate to the best of your knowledge.
                                        </p>
                                    </div>
                                </div>
                            )}
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
                                    onClick={handleSubmit}
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
