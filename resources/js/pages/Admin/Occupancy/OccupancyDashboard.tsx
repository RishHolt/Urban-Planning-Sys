import AdminLayout from '../../../components/AdminLayout';
import OccupancyDashboard from '../../../components/OccupancyDashboard';

interface OccupancyDashboardPageProps {
    buildingId?: number;
}

export default function OccupancyDashboardPage({ buildingId }: OccupancyDashboardPageProps) {
    return (
        <AdminLayout
            title="Real-Time Occupancy Dashboard"
            description="Monitor current occupancy and entry/exit events in real-time"
        >
            <OccupancyDashboard buildingId={buildingId} />
        </AdminLayout>
    );
}
