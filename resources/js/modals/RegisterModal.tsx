import { useState, useEffect } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import Input from '../components/Input';
import Button from '../components/Button';
import VerifyOtpModal from './VerifyOtpModal';
import Recaptcha from '../components/Recaptcha';
import { showError } from '../lib/swal';
import { X, Mail, Lock, User, Phone, MapPin, Eye, EyeOff } from 'lucide-react';

interface RegisterModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function RegisterModal({ isOpen, onClose }: RegisterModalProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [noMiddleName, setNoMiddleName] = useState(false);
    const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
    const [registrationEmail, setRegistrationEmail] = useState('');
    const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);

    const { flash, recaptcha_site_key } = usePage().props as any;

    // Check for email in flash data (from backend redirect)
    useEffect(() => {
        if (flash?.email && isOpen && !isOtpModalOpen) {
            setRegistrationEmail(flash.email);
            setIsOtpModalOpen(true);
            
            // Log OTP code to browser console for testing
            if (flash?.otp_code) {
                console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #4CAF50; font-weight: bold; font-size: 14px;');
                console.log('%c🔐 OTP CODE FOR TESTING', 'color: #4CAF50; font-weight: bold; font-size: 16px;');
                console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #4CAF50; font-weight: bold; font-size: 14px;');
                console.log(`%cEmail: ${flash.email}`, 'color: #2196F3; font-size: 14px;');
                console.log(`%cCode: ${flash.otp_code}`, 'color: #FF9800; font-weight: bold; font-size: 18px;');
                console.log(`%cType: registration`, 'color: #2196F3; font-size: 14px;');
                console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #4CAF50; font-weight: bold; font-size: 14px;');
            }
        }
    }, [flash, isOpen, isOtpModalOpen]);

    const { data, setData, post, processing, errors, reset } = useForm({
        first_name: '',
        last_name: '',
        middle_name: '',
        suffix: '',
        email: '',
        mobile_number: '',
        address: '',
        street: '',
        barangay: '',
        city: '',
        password: '',
        password_confirmation: '',
        'g-recaptcha-response': '',
    });

    if (!isOpen) {
        return null;
    }

    const validatePassword = (password: string): string[] => {
        const errors: string[] = [];
        if (password.length < 8) {
            errors.push('At least 8 characters');
        }
        if (!/[A-Z]/.test(password)) {
            errors.push('Has uppercase letter');
        }
        if (!/[0-9]/.test(password)) {
            errors.push('Has a number');
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            errors.push('Has a special character');
        }
        return errors;
    };

    const passwordErrors = validatePassword(data.password);
    const isPasswordValid = passwordErrors.length === 0;

    return (
        <div className="z-50 fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-sm">
            <div className="relative flex flex-col bg-white dark:bg-dark-surface shadow-2xl rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                {/* Sticky Header */}
                <div className="top-0 z-10 sticky flex justify-between items-center bg-white dark:bg-dark-surface px-6 py-4 border-gray-200 dark:border-gray-700 border-b">
                    <h2 className="font-bold text-gray-900 dark:text-white text-xl">
                        Create your GoServePH account
                    </h2>
                    <button
                        onClick={onClose}
                        className="hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors"
                        aria-label="Close modal"
                    >
                        <X size={24} className="text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 px-6 py-4 overflow-y-auto">
                    <form
                        onSubmit={async (e) => {
                            e.preventDefault();
                            if (data.password !== data.password_confirmation) {
                                await showError('Passwords do not match');
                                return;
                            }
                            if (!recaptchaToken) {
                                await showError('Please complete the reCAPTCHA verification');
                                return;
                            }
                            setData('g-recaptcha-response', recaptchaToken);
                            post('/register', {
                                preserveState: true,
                                preserveScroll: true,
                                onSuccess: (page) => {
                                    // Check if email is in flash or use form email
                                    const flashData = (page.props as any)?.flash;
                                    const email = flashData?.email || data.email;
                                    
                                    // Debug: log entire response
                                    console.log('Registration response:', { flashData, pageProps: page.props });
                                    
                                    if (email && !isOtpModalOpen) {
                                        setRegistrationEmail(email);
                                        setIsOtpModalOpen(true);
                                        
                                        // Log OTP code to browser console for testing
                                        if (flashData?.otp_code) {
                                            console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #4CAF50; font-weight: bold; font-size: 14px;');
                                            console.log('%c🔐 OTP CODE FOR TESTING', 'color: #4CAF50; font-weight: bold; font-size: 16px;');
                                            console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #4CAF50; font-weight: bold; font-size: 14px;');
                                            console.log(`%cEmail: ${email}`, 'color: #2196F3; font-size: 14px;');
                                            console.log(`%cCode: ${flashData.otp_code}`, 'color: #FF9800; font-weight: bold; font-size: 18px;');
                                            console.log(`%cType: registration`, 'color: #2196F3; font-size: 14px;');
                                            console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #4CAF50; font-weight: bold; font-size: 14px;');
                                        } else {
                                            // Fetch OTP from API if not in flash
                                            fetch(`/api/otp/${email}`)
                                                .then(res => res.json())
                                                .then(result => {
                                                    if (result.code) {
                                                        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #4CAF50; font-weight: bold; font-size: 14px;');
                                                        console.log('%c🔐 OTP CODE FOR TESTING', 'color: #4CAF50; font-weight: bold; font-size: 16px;');
                                                        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #4CAF50; font-weight: bold; font-size: 14px;');
                                                        console.log(`%cEmail: ${email}`, 'color: #2196F3; font-size: 14px;');
                                                        console.log(`%cCode: ${result.code}`, 'color: #FF9800; font-weight: bold; font-size: 18px;');
                                                        console.log(`%cType: registration`, 'color: #2196F3; font-size: 14px;');
                                                        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #4CAF50; font-weight: bold; font-size: 14px;');
                                                    }
                                                })
                                                .catch(() => {});
                                        }
                                    }
                                    reset();
                                },
                            });
                        }}
                        className="space-y-4"
                    >
                        {/* Name Fields */}
                        <div className="gap-4 grid grid-cols-2">
                            <Input
                                type="text"
                                name="first_name"
                                label="First Name"
                                placeholder="Enter first name"
                                icon={<User size={20} />}
                                value={data.first_name}
                                onChange={(e) => setData('first_name', e.target.value)}
                                error={errors.first_name}
                                required
                            />
                            <Input
                                type="text"
                                name="last_name"
                                label="Last Name"
                                placeholder="Enter last name"
                                icon={<User size={20} />}
                                value={data.last_name}
                                onChange={(e) => setData('last_name', e.target.value)}
                                error={errors.last_name}
                                required
                            />
                        </div>

                        {/* Middle Name with Checkbox */}
                        <div className="space-y-2">
                            <Input
                                type="text"
                                name="middle_name"
                                label="Middle Name"
                                placeholder="Enter middle name"
                                icon={<User size={20} />}
                                value={data.middle_name}
                                onChange={(e) => setData('middle_name', e.target.value)}
                                error={errors.middle_name}
                                disabled={noMiddleName}
                                className={noMiddleName ? 'opacity-50' : ''}
                            />
                            <label className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                                <input
                                    type="checkbox"
                                    checked={noMiddleName}
                                    onChange={(e) => {
                                        setNoMiddleName(e.target.checked);
                                        if (e.target.checked) {
                                            setData('middle_name', '');
                                        }
                                    }}
                                    className="border-gray-300 rounded focus:ring-primary text-primary"
                                />
                                <span>No middle name</span>
                            </label>
                        </div>

                        {/* Suffix */}
                        <Input
                            type="text"
                            name="suffix"
                            label="Suffix (Optional)"
                            placeholder="e.g., Jr., Sr., III"
                            icon={<User size={20} />}
                            value={data.suffix}
                            onChange={(e) => setData('suffix', e.target.value)}
                            error={errors.suffix}
                        />

                        {/* Email */}
                        <Input
                            type="email"
                            name="email"
                            label="Email"
                            placeholder="Enter your email"
                            icon={<Mail size={20} />}
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            error={errors.email}
                            required
                            autoComplete="email"
                        />

                        {/* Mobile Number */}
                        <Input
                            type="tel"
                            name="mobile_number"
                            label="Mobile Number"
                            placeholder="09XX XXX XXXX"
                            icon={<Phone size={20} />}
                            value={data.mobile_number}
                            onChange={(e) => setData('mobile_number', e.target.value)}
                            error={errors.mobile_number}
                            required
                        />

                        {/* Address Fields */}
                        <Input
                            type="text"
                            name="address"
                            label="Address"
                            placeholder="Enter address"
                            icon={<MapPin size={20} />}
                            value={data.address}
                            onChange={(e) => setData('address', e.target.value)}
                            error={errors.address}
                            required
                        />

                        <Input
                            type="text"
                            name="street"
                            label="Street"
                            placeholder="Enter street"
                            icon={<MapPin size={20} />}
                            value={data.street}
                            onChange={(e) => setData('street', e.target.value)}
                            error={errors.street}
                            required
                        />

                        <div className="gap-4 grid grid-cols-2">
                            <Input
                                type="text"
                                name="barangay"
                                label="Barangay"
                                placeholder="Enter barangay"
                                icon={<MapPin size={20} />}
                                value={data.barangay}
                                onChange={(e) => setData('barangay', e.target.value)}
                                error={errors.barangay}
                                required
                            />
                            <Input
                                type="text"
                                name="city"
                                label="City"
                                placeholder="Enter city"
                                icon={<MapPin size={20} />}
                                value={data.city}
                                onChange={(e) => setData('city', e.target.value)}
                                error={errors.city}
                                required
                            />
                        </div>

                        {/* Password */}
                        <div className="relative">
                            <Input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                label="Password"
                                placeholder="Enter password"
                                icon={<Lock size={20} />}
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                error={errors.password}
                                required
                                autoComplete="new-password"
                                className="pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="top-[2.75rem] right-3 absolute text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        {/* Password Requirements */}
                        {data.password && (
                            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                                <p className="mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                    Password Requirements:
                                </p>
                                <ul className="space-y-1 text-xs">
                                    {[
                                        { check: data.password.length >= 8, text: 'At least 8 characters' },
                                        { check: /[A-Z]/.test(data.password), text: 'Has uppercase letter' },
                                        { check: /[0-9]/.test(data.password), text: 'Has a number' },
                                        { check: /[!@#$%^&*(),.?":{}|<>]/.test(data.password), text: 'Has a special character' },
                                    ].map((req, index) => (
                                        <li
                                            key={index}
                                            className={`flex items-center gap-2 ${
                                                req.check
                                                    ? 'text-green-600 dark:text-green-400'
                                                    : 'text-gray-500 dark:text-gray-400'
                                            }`}
                                        >
                                            <span>{req.check ? '✓' : '○'}</span>
                                            <span>{req.text}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Confirm Password */}
                        <div className="relative">
                            <Input
                                type={showConfirmPassword ? 'text' : 'password'}
                                name="password_confirmation"
                                label="Confirm Password"
                                placeholder="Confirm your password"
                                icon={<Lock size={20} />}
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                error={errors.password_confirmation}
                                required
                                autoComplete="new-password"
                                className="pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="top-[2.75rem] right-3 absolute text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                            >
                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        {recaptcha_site_key && (
                            <div className="flex justify-center">
                                <Recaptcha
                                    siteKey={recaptcha_site_key}
                                    onChange={setRecaptchaToken}
                                    onError={() => setRecaptchaToken(null)}
                                />
                            </div>
                        )}
                        {errors['g-recaptcha-response'] && (
                            <p className="text-red-500 text-sm">{errors['g-recaptcha-response']}</p>
                        )}

                        {/* Submit Button */}
                        <div className="pt-4">
                            <Button
                                type="submit"
                                variant="primary"
                                size="lg"
                                className="w-full"
                                disabled={processing || !isPasswordValid || (recaptcha_site_key && !recaptchaToken)}
                            >
                                {processing ? 'Creating Account...' : 'Create Account'}
                            </Button>
                            {recaptcha_site_key && !recaptchaToken && (
                                <p className="mt-2 text-center text-red-500 text-sm">
                                    Please complete the reCAPTCHA verification
                                </p>
                            )}
                        </div>
                    </form>
                </div>
            </div>

            {/* OTP Verification Modal */}
            <VerifyOtpModal
                isOpen={isOtpModalOpen}
                onClose={() => setIsOtpModalOpen(false)}
                email={registrationEmail}
                type="registration"
            />
        </div>
    );
}
