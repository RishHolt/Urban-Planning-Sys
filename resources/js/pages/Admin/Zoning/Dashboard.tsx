import AdminLayout from '../../../components/AdminLayout';
import AdminContentCard from '../../../components/AdminContentCard';

export default function ZoningDashboard() {
    return (
        <AdminLayout
            title="Zoning Clearance Dashboard"
            description="Overview of zoning clearance applications and statistics"
        >
            <AdminContentCard padding="lg">
                <p className="text-gray-600 dark:text-gray-300">
                    Dashboard content will be added here.
                </p>
            </AdminContentCard>
        </AdminLayout>
    );
}
