import { Link, usePage, router, Form } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import Time from './Time';
import Button from './Button';
import ThemeToggle from './ThemeToggle';
import { CircleUserRound, ArrowLeft, ChevronDown, User, Settings, LogOut } from 'lucide-react';
import type { SharedData, Profile } from '../types';

export default function Header() {
    const page = usePage<SharedData>();
    const url = (page.url || '') as string;
    const { auth } = page.props;
    const isLoginPage = url === '/login' || url.startsWith('/login');
    const user = auth?.user;
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen]);


    const getUserDisplayName = () => {
        if (!user) {
            return 'User';
        }

        // Try to get name from profile if available
        const profile = user.profile as Profile | undefined;
        if (profile?.first_name) {
            return `${profile.first_name} ${profile.last_name || ''}`.trim();
        }

        // Fallback to username or email
        return user.username || user.email?.split('@')[0] || 'User';
    };

    return (
        <>
        <div className="top-0 right-0 left-0 z-50 fixed flex bg-background dark:bg-dark-bg shadow-md border-accent border-b-2 w-full h-16 transition-colors">
            <div className="flex flex-row justify-between items-center mx-auto px-4 max-w-7xl container">
                {/* Logo and Branding */}
                <div className="flex flex-row flex-shrink items-center gap-2 sm:gap-4 min-w-0">
                    <img src="/logo.svg" className="flex-shrink-0 w-8 sm:w-12 h-8 sm:h-12" alt="GoServePH Logo" />
                    <div className="flex flex-col min-w-0">
                        <h1 className="font-bold text-primary text-sm sm:text-xl truncate">GoServePH</h1>
                        <p className="hidden sm:block text-secondary text-xs sm:text-base">Abot-Kamay mo ang Serbisyong Publiko</p>
                    </div>
                </div>

                {/* Right Side - Controls and Button */}
                <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3">
                    {/* Time - Hidden on mobile */}
                    <div className="hidden md:block">
                        <Time />
                    </div>
                    
                    {/* Theme Toggle */}
                    <ThemeToggle />
                    
                    {/* User Menu or Login/Return Button */}
                    {user ? (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-2 rounded-lg transition-colors"
                            >
                                <CircleUserRound size={20} className="text-primary" />
                                <span className="hidden sm:inline font-medium text-gray-700 dark:text-gray-300 text-sm">
                                    {getUserDisplayName()}
                                </span>
                                <ChevronDown 
                                    size={16} 
                                    className={`text-gray-500 dark:text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                                />
                            </button>

                            {/* Dropdown Menu */}
                            {isDropdownOpen && (
                                <div className="right-0 z-50 absolute bg-white dark:bg-dark-surface shadow-lg mt-2 py-1 border border-gray-200 dark:border-gray-700 rounded-lg w-48">
                                    <Link
                                        href="/profile"
                                        className="flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 px-4 py-2 text-gray-700 dark:text-gray-300 transition-colors"
                                        onClick={() => setIsDropdownOpen(false)}
                                    >
                                        <User size={18} />
                                        <span>Profile</span>
                                    </Link>
                                    <Link
                                        href="/settings"
                                        className="flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 px-4 py-2 text-gray-700 dark:text-gray-300 transition-colors"
                                        onClick={() => setIsDropdownOpen(false)}
                                    >
                                        <Settings size={18} />
                                        <span>Settings</span>
                                    </Link>
                                    <div className="my-1 border-gray-200 dark:border-gray-700 border-t"></div>
                                    <Form
                                        action="/logout"
                                        method="post"
                                        className="w-full"
                                        onSubmit={() => setIsDropdownOpen(false)}
                                    >
                                        {({ processing }) => (
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 px-4 py-2 w-full text-red-600 dark:text-red-400 transition-colors"
                                            >
                                                <LogOut size={18} />
                                                <span>{processing ? 'Logging out...' : 'Logout'}</span>
                                            </button>
                                        )}
                                    </Form>
                                </div>
                            )}
                        </div>
                    ) : (
                        isLoginPage ? (
                            <Link href="/">
                                <Button variant="primary" size="md" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 text-xs sm:text-base">
                                    <ArrowLeft size={16} className="sm:w-5 sm:h-5" />
                                    <span className="hidden sm:inline">Return to Services</span>
                                    <span className="sm:hidden">Back</span>
                                </Button>
                            </Link>
                        ) : (
                            <Link href="/login">
                                <Button variant="primary" size="md" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 text-xs sm:text-base">
                                    <CircleUserRound size={18} className="sm:w-6 sm:h-6" />
                                    <span className="hidden sm:inline">Login</span>
                                </Button>
                            </Link>
                        )
                    )}
                </div>
            </div>
        </div>
        </>
    )
}