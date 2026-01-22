import { useState, useEffect } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Button from '../components/Button';
import Input from '../components/Input';
import { Mail, Lock, ArrowLeft } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface VerifyOtpProps {
    email?: string;
    type?: string;
}

export default function VerifyOtp() {
    const { email: pageEmail, type: pageType } = usePage<VerifyOtpProps>().props;
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [resendCooldown, setResendCooldown] = useState(0);

    const { data, setData, post, processing, errors } = useForm({
        email: pageEmail || '',
        code: '',
        type: pageType || 'registration',
    });

    // Update code when OTP input changes
    useEffect(() => {
        setData('code', otp.join(''));
    }, [otp, setData]);

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
        post('/verify-otp');
    };

    if (!data.email) {
        return (
            <div className="flex flex-col bg-background dark:bg-dark-bg w-full min-h-dvh transition-colors">
                <Header />
                <div className="flex flex-col justify-center items-center mt-16 py-12 min-h-[calc(100vh-4rem)]">
                    <div className="bg-white dark:bg-dark-surface shadow-xl p-8 rounded-2xl w-full max-w-md text-center">
                        <p className="mb-4 text-gray-600 dark:text-gray-400">
                            No verification session found.
                        </p>
                        <Link href="/login">
                            <Button variant="primary">Go to Login</Button>
                        </Link>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="flex flex-col bg-background dark:bg-dark-bg w-full min-h-dvh transition-colors">
            <Header />

            <div className="flex flex-col justify-center items-center mt-16 py-12 min-h-[calc(100vh-4rem)]">
                <div className="bg-white dark:bg-dark-surface shadow-xl p-8 rounded-2xl w-full max-w-md">
                    <div className="mb-6">
                        <Link href="/login" className="flex items-center gap-2 mb-4 text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">
                            <ArrowLeft size={20} />
                            <span>Back to Login</span>
                        </Link>
                        <h2 className="mb-2 font-bold text-primary dark:text-white text-2xl text-center">
                            Verify Your Email
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 text-sm text-center">
                            We've sent a 6-digit verification code to
                        </p>
                        <p className="font-semibold text-primary dark:text-white text-center">
                            {data.email}
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

            <Footer />
        </div>
    );
}
