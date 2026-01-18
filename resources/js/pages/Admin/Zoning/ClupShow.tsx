import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AdminHeader from '../../../components/AdminHeader';
import Sidebar from '../../../components/Sidebar';
import Button from '../../../components/Button';
import { ArrowLeft, Edit, Plus, Trash2 } from 'lucide-react';
import ZoningClassificationModal from '../../../components/ZoningClassificationModal';
import { showConfirm } from '../../../lib/swal';

interface Clup {
    id: string;
    referenceNo: string | null;
    lguName: string;
    coverageStartYear: number;
    coverageEndYear: number;
    coveragePeriod: string;
    approvalDate: string;
    approvingBody: string | null;
    resolutionNo: string | null;
    status: 'Active' | 'Archived';
    createdAt: string;
    updatedAt: string;
}

interface Classification {
    id: string;
    zoningCode: string;
    zoneName: string;
    landUseCategory: string | null;
    allowedUses: string | null;
    conditionalUses: string | null;
    prohibitedUses: string | null;
    polygonCount: number;
}

interface ClupShowProps {
    clup: Clup;
    classifications: Classification[];
}

export default function ClupShow({ clup, classifications }: ClupShowProps) {
    const [sidebarOpen, setSidebarOpen] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth >= 1024;
        }
        return true;
    });

    const [showClassificationModal, setShowClassificationModal] = useState(false);
    const [editingClassification, setEditingClassification] = useState<Classification | null>(null);

    const handleDeleteClup = async (): Promise<void> => {
        const confirmed = await showConfirm(
            'Are you sure you want to delete this CLUP? This will also delete all zoning classifications and polygons. This action cannot be undone.',
            'Delete CLUP',
            'Yes, delete it',
            'Cancel',
            '#ef4444',
            'warning'
        );
        if (confirmed) {
            router.delete(`/admin/zoning/clup/${clup.id}`, {
                onSuccess: () => {
                    router.visit('/admin/zoning/clup');
                },
            });
        }
    };

    const handleDeleteClassification = async (id: string): Promise<void> => {
        const confirmed = await showConfirm(
            'Are you sure you want to delete this zoning classification? This will also delete all associated polygons.',
            'Delete Classification',
            'Yes, delete it',
            'Cancel',
            '#ef4444',
            'warning'
        );
        if (confirmed) {
            router.delete(`/admin/zoning/clup/classifications/${id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    router.reload();
                },
            });
        }
    };

    const handleOpenClassificationModal = (classification?: Classification): void => {
        if (classification) {
            setEditingClassification(classification);
        } else {
            setEditingClassification(null);
        }
        setShowClassificationModal(true);
    };


    return (
        <div className="flex flex-col bg-background dark:bg-dark-bg w-full min-h-dvh transition-colors">
            <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
            <AdminHeader sidebarOpen={sidebarOpen} />

            <main className={`flex-1 transition-all duration-300 ease-in-out ${
                sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
            } mt-16`}>
                <div className="mx-auto px-4 py-8 max-w-7xl">
                    <div className="mb-6">
                        <Link href="/admin/zoning/clup">
                            <Button variant="secondary" size="sm" className="flex items-center gap-2">
                                <ArrowLeft size={18} />
                                Back to CLUP List
                            </Button>
                        </Link>
                    </div>

                    {/* CLUP Details */}
                    <div className="bg-white dark:bg-dark-surface shadow-lg rounded-lg p-8 mb-6">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                {clup.referenceNo && (
                                    <p className="mb-1 font-mono text-primary dark:text-primary-light font-semibold text-sm">
                                        {clup.referenceNo}
                                    </p>
                                )}
                                <h1 className="mb-2 font-bold text-gray-900 dark:text-white text-3xl">
                                    {clup.lguName}
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Comprehensive Land Use Plan
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <Link href={`/admin/zoning/clup/${clup.id}/edit`}>
                                    <Button variant="secondary" size="md" className="flex items-center gap-2">
                                        <Edit size={18} />
                                        Edit
                                    </Button>
                                </Link>
                                <Button 
                                    variant="danger" 
                                    size="md" 
                                    onClick={handleDeleteClup}
                                    className="flex items-center gap-2"
                                >
                                    <Trash2 size={18} />
                                    Delete
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Coverage Period
                                </label>
                                <p className="text-gray-900 dark:text-white font-medium">
                                    {clup.coveragePeriod}
                                </p>
                            </div>
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Approval Date
                                </label>
                                <p className="text-gray-900 dark:text-white font-medium">
                                    {new Date(clup.approvalDate).toLocaleDateString()}
                                </p>
                            </div>
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Status
                                </label>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    clup.status === 'Active'
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200'
                                }`}>
                                    {clup.status}
                                </span>
                            </div>
                            {clup.approvingBody && (
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Approving Body
                                    </label>
                                    <p className="text-gray-900 dark:text-white font-medium">
                                        {clup.approvingBody}
                                    </p>
                                </div>
                            )}
                            {clup.resolutionNo && (
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Resolution Number
                                    </label>
                                    <p className="text-gray-900 dark:text-white font-medium">
                                        {clup.resolutionNo}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Zoning Classifications */}
                    <div className="bg-white dark:bg-dark-surface shadow-lg rounded-lg p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="font-bold text-gray-900 dark:text-white text-2xl">
                                Zoning Classifications
                            </h2>
                            <Button
                                variant="primary"
                                size="md"
                                onClick={() => handleOpenClassificationModal()}
                                className="flex items-center gap-2"
                            >
                                <Plus size={18} />
                                Add Classification
                            </Button>
                        </div>

                        {classifications.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                    No zoning classifications yet.
                                </p>
                                <Button
                                    variant="primary"
                                    size="md"
                                    onClick={() => handleOpenClassificationModal()}
                                    className="flex items-center gap-2 mx-auto"
                                >
                                    <Plus size={18} />
                                    Add First Classification
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {classifications.map((classification) => (
                                    <div
                                        key={classification.id}
                                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="mb-1 font-semibold text-gray-900 dark:text-white text-lg">
                                                    {classification.zoningCode} - {classification.zoneName}
                                                </h3>
                                                {classification.landUseCategory && (
                                                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                                                        Category: {classification.landUseCategory}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => handleOpenClassificationModal(classification)}
                                                    className="flex items-center gap-1"
                                                >
                                                    <Edit size={14} />
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    onClick={() => handleDeleteClassification(classification.id)}
                                                    className="flex items-center gap-1"
                                                >
                                                    <Trash2 size={14} />
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                            {classification.allowedUses && (
                                                <div>
                                                    <label className="block mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                                                        Allowed Uses
                                                    </label>
                                                    <p className="text-gray-700 dark:text-gray-300 text-sm">
                                                        {classification.allowedUses}
                                                    </p>
                                                </div>
                                            )}
                                            {classification.conditionalUses && (
                                                <div>
                                                    <label className="block mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                                                        Conditional Uses
                                                    </label>
                                                    <p className="text-gray-700 dark:text-gray-300 text-sm">
                                                        {classification.conditionalUses}
                                                    </p>
                                                </div>
                                            )}
                                            {classification.prohibitedUses && (
                                                <div>
                                                    <label className="block mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                                                        Prohibited Uses
                                                    </label>
                                                    <p className="text-gray-700 dark:text-gray-300 text-sm">
                                                        {classification.prohibitedUses}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Modals */}
            {showClassificationModal && (
                <ZoningClassificationModal
                    isOpen={showClassificationModal}
                    onClose={() => {
                        setShowClassificationModal(false);
                        setEditingClassification(null);
                    }}
                    clupId={clup.id}
                    classification={editingClassification || undefined}
                    onSuccess={() => {
                        router.reload();
                    }}
                />
            )}

        </div>
    );
}
