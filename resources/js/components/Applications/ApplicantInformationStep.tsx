import { useEffect } from 'react';
import Input from '../Input';
import FileUpload from '../FileUpload';
import { User, Mail, Phone, Building, FileText } from 'lucide-react';
import { validateEmail, validatePhone } from '../../lib/validation';

interface ApplicantInformationStepProps {
    data: {
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
    };
    setData: (key: string, value: unknown) => void;
    errors: Record<string, string>;
}

export default function ApplicantInformationStep({
    data,
    setData,
    errors,
}: ApplicantInformationStepProps) {
    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const email = e.target.value;
        setData('applicantEmail', email);
        if (email && !validateEmail(email)) {
            // Email validation will be handled by backend
        }
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const phone = e.target.value;
        setData('applicantContact', phone);
    };

    // Automatically set isPropertyOwner to true for Government applicants
    useEffect(() => {
        if (data.applicantType === 'Government' && !data.isPropertyOwner) {
            setData('isPropertyOwner', true);
        }
    }, [data.applicantType, data.isPropertyOwner, setData]);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="mb-2 font-bold text-gray-900 dark:text-white text-2xl">
                    Applicant Information
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Identify the person or entity applying for zoning clearance.
                </p>
            </div>

            {/* Applicant Type */}
            <div>
                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                    Applicant Type <span className="text-red-500">*</span>
                </label>
                <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                    <label className="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg transition-colors cursor-pointer">
                        <input
                            type="radio"
                            name="applicantType"
                            value="individual"
                            checked={data.applicantType === 'individual'}
                            onChange={(e) => setData('applicantType', e.target.value)}
                            className="text-primary"
                        />
                        <span className="text-gray-700 dark:text-gray-300">Individual</span>
                    </label>
                    <label className="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg transition-colors cursor-pointer">
                        <input
                            type="radio"
                            name="applicantType"
                            value="company"
                            checked={data.applicantType === 'company'}
                            onChange={(e) => setData('applicantType', e.target.value)}
                            className="text-primary"
                        />
                        <span className="text-gray-700 dark:text-gray-300">Company</span>
                    </label>
                    <label className="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg transition-colors cursor-pointer">
                        <input
                            type="radio"
                            name="applicantType"
                            value="developer"
                            checked={data.applicantType === 'developer'}
                            onChange={(e) => setData('applicantType', e.target.value)}
                            className="text-primary"
                        />
                        <span className="text-gray-700 dark:text-gray-300">Developer</span>
                    </label>
                    <label className="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg transition-colors cursor-pointer">
                        <input
                            type="radio"
                            name="applicantType"
                            value="Government"
                            checked={data.applicantType === 'Government'}
                            onChange={(e) => setData('applicantType', e.target.value)}
                            className="text-primary"
                        />
                        <span className="text-gray-700 dark:text-gray-300">Government</span>
                    </label>
                </div>
            </div>

            {/* Individual Fields */}
            {data.applicantType === 'individual' && (
                <>
                    <Input
                        type="text"
                        name="applicantName"
                        label="Full Name"
                        placeholder="Enter full name"
                        value={data.applicantName || ''}
                        onChange={(e) => setData('applicantName', e.target.value)}
                        icon={<User size={20} />}
                        error={errors.applicantName}
                        required
                    />
                    <FileUpload
                        label="Valid ID"
                        accept="image/*,.pdf"
                        maxSizeMB={5}
                        value={data.validId}
                        onChange={(file) => setData('validId', file)}
                        error={errors.validId}
                        required
                        allowedTypes={['image/*', 'application/pdf']}
                    />
                </>
            )}

            {/* Company, Developer, and Government Fields */}
            {(data.applicantType === 'company' || data.applicantType === 'developer' || data.applicantType === 'Government') && (
                <>
                    <Input
                        type="text"
                        name="companyName"
                        label={
                            data.applicantType === 'developer' 
                                ? 'Developer Name' 
                                : data.applicantType === 'Government' 
                                ? 'Government Agency Name' 
                                : 'Company Name'
                        }
                        placeholder={
                            data.applicantType === 'developer' 
                                ? 'Enter developer name' 
                                : data.applicantType === 'Government' 
                                ? 'Enter government agency name' 
                                : 'Enter company name'
                        }
                        value={data.companyName || ''}
                        onChange={(e) => setData('companyName', e.target.value)}
                        icon={<Building size={20} />}
                        error={errors.companyName}
                        required
                    />
                    {data.applicantType !== 'Government' && (
                        <Input
                            type="text"
                            name="secDtiRegNo"
                            label="SEC/DTI Registration Number"
                            placeholder="Enter registration number"
                            value={data.secDtiRegNo || ''}
                            onChange={(e) => setData('secDtiRegNo', e.target.value)}
                            icon={<FileText size={20} />}
                            error={errors.secDtiRegNo}
                            required
                        />
                    )}
                    <Input
                        type="text"
                        name="authorizedRepresentative"
                        label="Authorized Representative"
                        placeholder="Enter representative name"
                        value={data.authorizedRepresentative || ''}
                        onChange={(e) => setData('authorizedRepresentative', e.target.value)}
                        icon={<User size={20} />}
                        error={errors.authorizedRepresentative}
                        required
                    />
                </>
            )}

            {/* Common Fields */}
            <Input
                type="email"
                name="applicantEmail"
                label="Email"
                placeholder="Enter email address"
                value={data.applicantEmail || ''}
                onChange={handleEmailChange}
                icon={<Mail size={20} />}
                error={errors.applicantEmail}
                required
            />

            <Input
                type="tel"
                name="applicantContact"
                label="Contact Number"
                placeholder="09XX XXX XXXX"
                value={data.applicantContact || ''}
                onChange={handlePhoneChange}
                icon={<Phone size={20} />}
                error={errors.applicantContact}
                required
            />

            {/* Property Owner Checkbox */}
            {data.applicantType !== 'Government' && (
                <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <input
                        type="checkbox"
                        id="isNotPropertyOwner"
                        checked={!data.isPropertyOwner}
                        onChange={(e) => setData('isPropertyOwner', !e.target.checked)}
                        className="border-gray-300 rounded focus:ring-primary text-primary"
                    />
                    <label
                        htmlFor="isNotPropertyOwner"
                        className="text-gray-700 dark:text-gray-300 text-sm cursor-pointer"
                    >
                        I am not the property owner
                    </label>
                </div>
            )}

            {/* Authorization Letter if not owner */}
            {!data.isPropertyOwner && data.applicantType !== 'Government' && (
                <FileUpload
                    label="Authorization Letter"
                    accept="image/*,.pdf"
                    maxSizeMB={5}
                    value={data.authorizationLetter}
                    onChange={(file) => setData('authorizationLetter', file)}
                    error={errors.authorizationLetter}
                    required
                    allowedTypes={['image/*', 'application/pdf']}
                />
            )}
        </div>
    );
}
