import { useState, useEffect } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import Input from '../components/Input';
import Button from '../components/Button';
import { X, Mail, Lock } from 'lucide-react';

interface VerifyOtpModalProps {
    isOpen: boolean;
    onClose: () => void;
    email: string;
    type: 'registration' | 'login';
}

export default function VerifyOtpModal({ isOpen, onClose, email, type }: VerifyOtpModalProps) {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [resendCooldown, setResendCooldown] = useState(0);

    const { data, setData, post, processing, errors } = useForm({
        email: email,
        code: '',
        type: type,
    });

    // Update code when OTP input changes
    useEffect(() => {
        setData('code', otp.join(''));
    }, [otp, setData]);

    // Update email and type when props change
    useEffect(() => {
        setData('email', email);
        setData('type', type);
    }, [email, type, setData]);

    // Resend cooldown timer
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) {
            return;
        }

        const newOtp = [...otp];
        newOtp[index] = value.replace(/\D/g, '');
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            nextInput?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            prevInput?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        const newOtp = [...otp];
        for (let i = 0; i < 6; i++) {
            newOtp[i] = pastedData[i] || '';
        }
        setOtp(newOtp);
    };

    const { flash } = usePage().props as any;

    // Log OTP code when received from resend
    useEffect(() => {
        if (flash?.otp_code) {
            console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #4CAF50; font-weight: bold; font-size: 14px;');
            console.log('%c🔐 OTP CODE RESENT', 'color: #4CAF50; font-weight: bold; font-size: 16px;');
            console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #4CAF50; font-weight: bold; font-size: 14px;');
            console.log(`%cEmail: ${email}`, 'color: #2196F3; font-size: 14px;');
            console.log(`%cCode: ${flash.otp_code}`, 'color: #FF9800; font-weight: bold; font-size: 18px;');
            console.log(`%cType: ${type}`, 'color: #2196F3; font-size: 14px;');
            console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #4CAF50; font-weight: bold; font-size: 14px;');
        }
    }, [flash?.otp_code, email, type]);

    const handleResend = () => {
        if (resendCooldown > 0) {
            return;
        }

        post('/resend-otp', {
            onSuccess: () => {
                setResendCooldown(60);
            },
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/verify-otp', {
            onSuccess: () => {
                // Modal will close automatically on redirect
                // The backend will redirect to home page after successful verification
            },
        });
    };

    if (!isOpen || !email) {
        return null;
    }

    return (
        <div className="z-50 fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-sm">
            <div className="relative flex flex-col bg-white dark:bg-dark-surface shadow-2xl rounded-2xl w-full max-w-md overflow-hidden">
                {/* Sticky Header */}
                <div className="top-0 z-10 sticky flex justify-between items-center bg-white dark:bg-dark-surface px-6 py-4 border-gray-200 dark:border-gray-700 border-b">
                    <h2 className="font-bold text-gray-900 dark:text-white text-xl">
                        Verify Your Email
                    </h2>
                    <button
                        onClick={onClose}
                        className="hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors"
                        aria-label="Close modal"
                    >
                        <X size={24} className="text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 px-6 py-4 overflow-y-auto">
                    <div className="mb-4 text-center">
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            We've sent a 6-digit verification code to
                        </p>
                        <p className="mt-1 font-semibold text-primary dark:text-white">
                            {email}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                Enter Verification Code
                            </label>
                            <div className="flex justify-center gap-2">
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        id={`otp-${index}`}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        onPaste={index === 0 ? handlePaste : undefined}
                                        className="w-12 h-12 text-center border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 dark:bg-dark-surface dark:text-white transition-colors"
                                    />
                                ))}
                            </div>
                            {errors.code && (
                                <p className="mt-2 text-red-600 dark:text-red-400 text-sm">{errors.code}</p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            className="w-full"
                            disabled={processing || otp.join('').length !== 6}
                        >
                            {processing ? 'Verifying...' : 'Verify Code'}
                        </Button>

                        <div className="text-center">
                            <p className="mb-2 text-gray-600 dark:text-gray-400 text-sm">
                                Didn't receive the code?
                            </p>
                            <button
                                type="button"
                                onClick={handleResend}
                                disabled={resendCooldown > 0}
                                className="font-semibold text-primary hover:text-primary/80 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                            >
                                {resendCooldown > 0
                                    ? `Resend in ${resendCooldown}s`
                                    : 'Resend Code'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
