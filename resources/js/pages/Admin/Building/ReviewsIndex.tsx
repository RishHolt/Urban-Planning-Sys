import { useState } from 'react';
import { router, useForm, Link } from '@inertiajs/react';
import AdminLayout from '../../../components/AdminLayout';
import AdminFilterSection from '../../../components/AdminFilterSection';
import Button from '../../../components/Button';
import { Download } from 'lucide-react';

interface Review {
    id: string;
    plReferenceNo: string;
    buildingPermitNo: string;
    applicantName: string;
    status: string;
    fetchedAt: string | null;
    reviewedAt: string | null;
}

interface PaginatedReviews {
    data: Review[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
    current_page: number;
    last_page: number;
}

interface ReviewsIndexProps {
    reviews: PaginatedReviews;
    filters?: {
        search?: string;
        status?: string;
    };
}

export default function ReviewsIndex({ reviews, filters: initialFilters = {} }: ReviewsIndexProps) {
    const [showFilters, setShowFilters] = useState(false);
    const { data, setData, get } = useForm({
        search: initialFilters.search || '',
        status: initialFilters.status || '',
    });

    const handleSearch = (): void => {
        get('/admin/building/reviews', {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleReset = (): void => {
        setData({
            search: '',
            status: '',
        });
        router.get('/admin/building/reviews');
    };

    const getStatusBadge = (status: string) => {
        const statusColors: Record<string, string> = {
            fetched: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
            under_review: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
            approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
            denied: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
            posted: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
        };

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}`}>
                {status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
        );
    };

    return (
        <AdminLayout
            title="Building Reviews"
            description="Review and manage building plan reviews from Permit & Licensing"
        >
            <AdminFilterSection
                searchValue={data.search}
                onSearchChange={(value) => setData('search', value)}
                onSearch={handleSearch}
                onReset={handleReset}
                showFilters={showFilters}
                onToggleFilters={() => setShowFilters(!showFilters)}
                searchPlaceholder="Search by reference number, permit number, or applicant..."
                actionButtons={
                    <Button
                        variant="outline"
                        size="md"
                        onClick={() => {}}
                        className="flex items-center gap-2"
                    >
                        <Download size={18} />
                        Export
                    </Button>
                }
                filterContent={
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Status
                        </label>
                        <select
                            value={data.status}
                            onChange={(e) => setData('status', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                            <option value="">All Statuses</option>
                            <option value="fetched">Fetched</option>
                            <option value="under_review">Under Review</option>
                            <option value="approved">Approved</option>
                            <option value="denied">Denied</option>
                            <option value="posted">Posted to P&L</option>
                        </select>
                    </div>
                }
            />

            {/* Reviews Table */}
            <div className="bg-white dark:bg-dark-surface shadow-lg rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    P&L Reference
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Building Permit
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Applicant
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Fetched
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-dark-surface divide-y divide-gray-200 dark:divide-gray-700">
                            {reviews.data.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <p className="text-gray-500 dark:text-gray-400">No reviews found</p>
                                    </td>
                                </tr>
                            ) : (
                                reviews.data.map((review) => (
                                    <tr key={review.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium text-gray-900 dark:text-white text-sm">
                                                {review.plReferenceNo}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-gray-900 dark:text-white text-sm">
                                                {review.buildingPermitNo}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-gray-900 dark:text-white text-sm">
                                                {review.applicantName}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(review.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400 text-sm">
                                            {review.fetchedAt ? new Date(review.fetchedAt).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Link
                                                href={`/admin/building/reviews/${review.id}`}
                                                className="text-primary hover:text-primary-dark font-medium text-sm"
                                            >
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {reviews.links && reviews.links.length > 3 && (
                    <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                            Showing page {reviews.current_page} of {reviews.last_page}
                        </div>
                        <div className="flex gap-2">
                            {reviews.links.map((link, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => link.url && router.get(link.url)}
                                    disabled={!link.url || link.active}
                                    className={`px-3 py-2 rounded text-sm ${
                                        link.active
                                            ? 'bg-primary text-white'
                                            : link.url
                                            ? 'bg-white dark:bg-dark-surface border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
