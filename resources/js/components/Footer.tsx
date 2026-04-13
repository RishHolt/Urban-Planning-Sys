import { Link } from '@inertiajs/react';
import { Mail, MapPin } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-[#1a1f37] dark:bg-[#0f1219] py-8 w-full text-white">
            <div className="mx-auto px-4 max-w-7xl">
                {/* Main Footer Content */}
                <div className="flex flex-col gap-4 mb-6">
                    <h2 className="font-bold text-xl">GoServePH Service Portal</h2>
                    <div className="flex flex-col gap-2 text-sm">
                        <div className="flex items-center gap-2">
                            <MapPin size={16} className="text-pink-400" />
                            <span className="text-gray-300">Government Service Management</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Mail size={16} className="text-gray-400" />
                            <a href="mailto:info@goserveph.com" className="text-gray-300 hover:text-white transition-colors">
                                info@goserveph.com
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom Section - Copyright + Legal Links */}
                <div className="pt-6 border-gray-700 border-t flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-gray-400 text-sm">
                        © 2026 GoServePH. Version 1.0
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                        <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                            Privacy Policy
                        </Link>
                        <span className="text-gray-600">·</span>
                        <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                            Terms of Service
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
