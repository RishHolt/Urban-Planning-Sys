import AdminLayout from '../../components/AdminLayout';
import AdminContentCard from '../../components/AdminContentCard';

export default function AdminHome() {
    return (
        <AdminLayout
            title="Admin Dashboard"
            description="Welcome to the administrative panel. Manage your urban planning services and resources."
            variant="hero"
        >
            <AdminContentCard padding="lg" className="mt-12">
                <h2 className="mb-4 font-semibold text-gray-800 dark:text-white text-2xl">
                    Admin Features
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                    Administrative features and controls will be available here.
                </p>
            </AdminContentCard>
        </AdminLayout>
    );
}
