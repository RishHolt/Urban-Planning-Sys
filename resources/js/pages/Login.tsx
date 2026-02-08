import { useState, useEffect } from 'react';
import { useForm, usePage, Link } from '@inertiajs/react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Button from '../components/Button';
import Input from '../components/Input';
import GoogleIcon from '../components/GoogleIcon';
import RegisterModal from '../modals/RegisterModal';
import VerifyOtpModal from '../modals/VerifyOtpModal';
import Recaptcha from '../components/Recaptcha';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
    const [otpEmail, setOtpEmail] = useState('');
    const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);

    const { flash, recaptcha_site_key } = usePage().props as any;
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        'g-recaptcha-response': '',
    });

    // Check for email in flash data (from backend redirect)
    useEffect(() => {
        if (flash?.email && !isOtpModalOpen) {
            setOtpEmail(flash.email);
            setIsOtpModalOpen(true);
            
            // Log OTP code to browser console for testing
            if (flash?.otp_code) {
                console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #4CAF50; font-weight: bold; font-size: 14px;');
                console.log('%c🔐 OTP CODE FOR TESTING', 'color: #4CAF50; font-weight: bold; font-size: 16px;');
                console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #4CAF50; font-weight: bold; font-size: 14px;');
                console.log(`%cEmail: ${flash.email}`, 'color: #2196F3; font-size: 14px;');
                console.log(`%cCode: ${flash.otp_code}`, 'color: #FF9800; font-weight: bold; font-size: 18px;');
                console.log(`%cType: ${flash.type || 'login'}`, 'color: #2196F3; font-size: 14px;');
                console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #4CAF50; font-weight: bold; font-size: 14px;');
            }
        } else if (data.email && !isOtpModalOpen && !flash?.email) {
            // Fallback: use email from form if flash is not available yet
            // This handles the case where the response hasn't updated flash yet
        }
    }, [flash, data.email, isOtpModalOpen]);

    const handleGoogleLogin = () => {
        window.location.href = '/auth/google';
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Only require reCAPTCHA token if site key is configured
        if (recaptcha_site_key && !recaptchaToken) {
            return;
        }

        // Only set reCAPTCHA response if token exists
        if (recaptchaToken) {
            setData('g-recaptcha-response', recaptchaToken);
        }
        
        post('/login', {
            preserveState: true,
            preserveScroll: true,
            onSuccess: (page) => {
                // Check if email is in flash or use form email
                const flashData = (page.props as any)?.flash;
                const email = flashData?.email || data.email;
                
                // Log entire response for debugging
                console.log('Login response:', { flashData, pageProps: page.props });
                
                if (email && !isOtpModalOpen) {
                    setOtpEmail(email);
                    setIsOtpModalOpen(true);
                    
                    // Log OTP code to browser console for testing
                    if (flashData?.otp_code) {
                        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #4CAF50; font-weight: bold; font-size: 14px;');
                        console.log('%c🔐 OTP CODE FOR TESTING', 'color: #4CAF50; font-weight: bold; font-size: 16px;');
                        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #4CAF50; font-weight: bold; font-size: 14px;');
                        console.log(`%cEmail: ${email}`, 'color: #2196F3; font-size: 14px;');
                        console.log(`%cCode: ${flashData.otp_code}`, 'color: #FF9800; font-weight: bold; font-size: 18px;');
                        console.log(`%cType: login`, 'color: #2196F3; font-size: 14px;');
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
                                    console.log(`%cType: login`, 'color: #2196F3; font-size: 14px;');
                                    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #4CAF50; font-weight: bold; font-size: 14px;');
                                }
                            })
                            .catch(() => {});
                    }
                }
            },
        });
    };

    return (
        <div className="flex flex-col bg-background dark:bg-dark-bg w-full transition-colors">
            <Header />

            {/* Main Content */}
            <div className="relative flex flex-col justify-center items-center mt-16 py-12 min-h-[calc(100vh-4rem)]">
                {/* Background Image with Overlay */}
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-20 dark:opacity-10"
                    style={{ backgroundImage: 'url(/background.svg)' }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10" />

                <div className="z-10 relative items-center gap-8 grid grid-cols-1 lg:grid-cols-2 mx-auto px-4 w-full max-w-7xl">
                    {/* Left Section - Branding */}
                    <div className="hidden lg:flex flex-col items-start gap-6 text-white">
                        <h1 className="drop-shadow-lg mb-18 font-bold text-4xl md:text-5xl leading-tight animated-rgb-text">
                            Abot-Kamay mo ang Serbisyong Publiko!
                        </h1>
                    </div>

                    {/* Right Section - Login Form */}
                    <div className="flex justify-center items-center w-full">
                        <div className="bg-white dark:bg-dark-surface shadow-xl p-8 rounded-2xl w-full max-w-md">
                            <h2 className="mb-6 font-bold text-primary dark:text-white text-2xl text-center">
                                GoServePH Login
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

                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="lg"
                                    className="w-full"
                                    disabled={processing || (recaptcha_site_key && !recaptchaToken)}
                                >
                                    {processing ? 'Logging in...' : 'Login'}
                                </Button>
                                {recaptcha_site_key && !recaptchaToken && (
                                    <p className="mt-2 text-center text-red-500 text-sm">
                                        Please complete the reCAPTCHA verification
                                    </p>
                                )}
                            </form>

                            {/* Separator */}
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="border-gray-300 dark:border-gray-600 border-t w-full" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="bg-white dark:bg-dark-surface px-2 text-gray-500">
                                        OR
                                    </span>
                                </div>
                            </div>

                            {/* Google Login Button */}
                            <Button
                                type="button"
                                onClick={handleGoogleLogin}
                                variant="outline"
                                size="lg"
                                className="flex justify-center items-center gap-3 hover:bg-[#4285F4] border-[#4285F4] border-2 w-full text-[#4285F4] hover:text-white"
                            >
                                <GoogleIcon />
                                Continue with Google
                            </Button>

                            {/* Register Link */}
                            <div className="mt-6 text-center">
                                <p className="text-gray-600 dark:text-gray-400 text-sm">
                                    No account yet?{' '}
                                    <button
                                        onClick={() => setIsRegisterModalOpen(true)}
                                        className="font-semibold text-primary hover:text-primary/80 transition-colors"
                                    >
                                        Register here
                                    </button>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />

            {/* Register Modal */}
            <RegisterModal
                isOpen={isRegisterModalOpen}
                onClose={() => setIsRegisterModalOpen(false)}
            />

            {/* OTP Verification Modal */}
            <VerifyOtpModal
                isOpen={isOtpModalOpen}
                onClose={() => setIsOtpModalOpen(false)}
                email={otpEmail}
                type="login"
            />
        </div>
    );
}
