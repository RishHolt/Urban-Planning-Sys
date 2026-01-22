import { useState } from 'react';
import { router, useForm, Link } from '@inertiajs/react';
import AdminLayout from '../../../components/AdminLayout';
import AdminFilterSection from '../../../components/AdminFilterSection';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import { Receipt, Download } from 'lucide-react';

interface Payment {
    id: string;
    or_number: string;
    reference_no: string;
    amount: string;
    payment_date: string;
    treasury_ref: string | null;
    application_id: string;
}

interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

interface PaymentRecordsIndexProps {
    payments: PaginatedData<Payment>;
    filters?: {
        search?: string;
        dateFrom?: string;
        dateTo?: string;
    };
}

export default function PaymentRecordsIndex({ payments, filters: initialFilters = {} }: PaymentRecordsIndexProps) {
    const [showFilters, setShowFilters] = useState(false);
    const { data, setData, get } = useForm({
        search: initialFilters.search || '',
        dateFrom: initialFilters.dateFrom || '',
        dateTo: initialFilters.dateTo || '',
    });

    const handleSearch = (): void => {
        get('/payments', {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleReset = (): void => {
        setData({
            search: '',
            dateFrom: '',
            dateTo: '',
        });
        router.get('/payments');
    };

    return (
        <AdminLayout
            title="Payment Records"
            description="View and manage all payment records for clearance applications"
        >
            <AdminFilterSection
                searchValue={data.search}
                onSearchChange={(value) => setData('search', value)}
                onSearch={handleSearch}
                onReset={handleReset}
                showFilters={showFilters}
                onToggleFilters={() => setShowFilters(!showFilters)}
                searchPlaceholder="Search by OR number, reference number, or treasury ref..."
                filterContent={
                    <>
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                Date From
                            </label>
                            <Input
                                type="date"
                                value={data.dateFrom}
                                onChange={(e) => setData('dateFrom', e.target.value)}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                Date To
                            </label>
                            <Input
                                type="date"
                                value={data.dateTo}
                                onChange={(e) => setData('dateTo', e.target.value)}
                                className="w-full"
                            />
                        </div>
                    </>
                }
            />

            {/* Payments Table */}
            <div className="bg-white dark:bg-dark-surface rounded-lg shadow overflow-hidden">
                {payments.data.length === 0 ? (
                    <div className="text-center py-12">
                        <Receipt className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                            No payment records found
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            No payment records match your search criteria.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            OR Number
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Reference No
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Payment Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Treasury Ref
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-dark-surface divide-y divide-gray-200 dark:divide-gray-700">
                                    {payments.data.map((payment) => (
                                        <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                {payment.or_number}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {payment.reference_no}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                ₱{payment.amount}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {payment.payment_date}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {payment.treasury_ref || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link
                                                    href={`/admin/zoning/clearance/applications/${payment.application_id}`}
                                                    className="text-primary hover:text-primary/80"
                                                >
                                                    View Application
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {payments.last_page > 1 && (
                            <div className="bg-white dark:bg-dark-surface px-4 py-3 border-t border-gray-200 dark:border-gray-700 sm:px-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 flex justify-between sm:hidden">
                                        {payments.links.map((link, index) => {
                                            if (link.url === null) {
                                                return (
                                                    <span
                                                        key={index}
                                                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-surface"
                                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                                    />
                                                );
                                            }
                                            return (
                                                <button
                                                    key={index}
                                                    onClick={() => router.get(link.url!)}
                                                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-surface hover:bg-gray-50 dark:hover:bg-gray-800"
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            );
                                        })}
                                    </div>
                                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                        <div>
                                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                                Showing <span className="font-medium">{payments.from}</span> to{' '}
                                                <span className="font-medium">{payments.to}</span> of{' '}
                                                <span className="font-medium">{payments.total}</span> results
                                            </p>
                                        </div>
                                        <div>
                                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                                {payments.links.map((link, index) => {
                                                    if (link.url === null) {
                                                        return (
                                                            <span
                                                                key={index}
                                                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-500 dark:text-gray-400 bg-white dark:bg-dark-surface"
                                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                                            />
                                                        );
                                                    }
                                                    return (
                                                        <button
                                                            key={index}
                                                            onClick={() => router.get(link.url!)}
                                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md ${
                                                                link.active
                                                                    ? 'z-10 bg-primary border-primary text-white'
                                                                    : 'bg-white dark:bg-dark-surface border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                                            }`}
                                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                                        />
                                                    );
                                                })}
                                            </nav>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </AdminLayout>
    );
}
