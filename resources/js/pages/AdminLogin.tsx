import { useState, useEffect } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import Header from '../components/Header';
import Button from '../components/Button';
import Input from '../components/Input';
import VerifyOtpModal from '../modals/VerifyOtpModal';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { PageProps } from '../types';

export default function AdminLogin() {
    const [showPassword, setShowPassword] = useState(false);
    const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
    const [otpEmail, setOtpEmail] = useState('');
    const [otpCode, setOtpCode] = useState<string | null>(null);

    const { flash } = usePage<PageProps>().props;
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
    });

    useEffect(() => {
        if (flash?.email && !isOtpModalOpen) {
            setOtpEmail(flash.email);
            setOtpCode((flash as any)?.otp_code ?? null);
            setIsOtpModalOpen(true);
        }
    }, [flash, isOtpModalOpen]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        post('/login/admin', {
            preserveState: true,
            preserveScroll: true,
            onSuccess: (page) => {
                const flashData = (page.props as unknown as PageProps).flash;
                const email = flashData?.email || data.email;

                if (email && !isOtpModalOpen) {
                    setOtpEmail(email);
                    setOtpCode(flashData?.otp_code ?? null);
                    setIsOtpModalOpen(true);
                }
            },
        });
    };

    return (
        <div className="flex flex-col bg-background dark:bg-dark-bg w-full min-h-screen transition-colors">
            <Header />

            <div className="relative flex flex-col justify-center items-center flex-1 mt-16 py-12">
                {/* Background */}
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-20 dark:opacity-10"
                    style={{ backgroundImage: 'url(/background.svg)' }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10" />

                {/* Centered Login Card */}
                <div className="z-10 relative w-full max-w-md px-4">
                    <div className="bg-white dark:bg-dark-surface shadow-xl p-8 rounded-2xl">
                        <h2 className="mb-6 font-bold text-primary dark:text-white text-2xl text-center">
                            GoServePH Admin Login
                        </h2>
                        <form onSubmit={handleLogin} className="space-y-4">
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

                            <div className="relative">
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    label="Password"
                                    placeholder="Enter your password"
                                    icon={<Lock size={20} />}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    error={errors.password}
                                    required
                                    autoComplete="current-password"
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

                            <Button
                                type="submit"
                                variant="primary"
                                size="lg"
                                className="w-full"
                                disabled={processing}
                            >
                                {processing ? 'Logging in...' : 'Login'}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>

            <VerifyOtpModal
                isOpen={isOtpModalOpen}
                onClose={() => setIsOtpModalOpen(false)}
                email={otpEmail}
                type="login"
                initialOtpCode={otpCode}
            />
        </div>
    );
}
