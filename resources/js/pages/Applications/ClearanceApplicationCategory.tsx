import { Link } from '@inertiajs/react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Button from '../../components/Button';
import { MapPin, Building2, ArrowLeft } from 'lucide-react';

export default function ClearanceApplicationCategory() {
    return (
        <>
            <Header />
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 mt-16 py-12 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-6">
                        <Link href="/clearance-applications">
                            <Button variant="secondary" size="sm" className="flex items-center gap-2">
                                <ArrowLeft size={18} />
                                Back to Applications
                            </Button>
                        </Link>
                    </div>
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Zoning Clearance Application
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Select the type of application you want to submit
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Individual Lot Option */}
                        <Link
                            href="/clearance-applications/create?category=individual_lot"
                            className="block"
                        >
                            <div className="bg-white dark:bg-dark-surface rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-2 border-transparent hover:border-primary">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                        <MapPin className="text-blue-600 dark:text-blue-400" size={32} />
                                    </div>
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                        Individual Lot
                                    </h2>
                                </div>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                    Apply for zoning clearance for a single lot (regular or within an existing subdivision)
                                </p>
                                <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-1 mb-4">
                                    <li>• Single lot application</li>
                                    <li>• Regular lot or lot in subdivision</li>
                                    <li>• Building construction/renovation</li>
                                </ul>
                                <Button className="w-full">Select Individual Lot</Button>
                            </div>
                        </Link>

                        {/* Subdivision Development Option */}
                        <Link
                            href="/clearance-applications/create?category=subdivision_development"
                            className="block"
                        >
                            <div className="bg-white dark:bg-dark-surface rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-2 border-transparent hover:border-primary">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                                        <Building2 className="text-green-600 dark:text-green-400" size={32} />
                                    </div>
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                        Subdivision Development
                                    </h2>
                                </div>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                    Apply for zoning clearance to create a new subdivision development project
                                </p>
                                <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-1 mb-4">
                                    <li>• New subdivision project</li>
                                    <li>• Multiple lots planned</li>
                                    <li>• Requires subdivision plan</li>
                                </ul>
                                <Button className="w-full">Select Subdivision Development</Button>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}
