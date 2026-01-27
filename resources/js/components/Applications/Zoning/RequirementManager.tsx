import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { PlusCircle, FileCheck, AlertCircle, HelpCircle } from 'lucide-react';
import Button from '@/components/Button';
import DocumentCard, { Document } from './DocumentCard';
import DocumentUploader from './DocumentUploader';
import DocumentViewModal from './DocumentViewModal';

interface Requirement {
    type: string;
    label: string;
    description: string;
    required: boolean;
}

const DEFAULT_REQUIREMENTS: Requirement[] = [
    { type: 'tax_declaration', label: 'Certified True Copy of Tax Declaration', description: 'Most recent tax declaration from the Assessor\'s Office', required: true },
    { type: 'barangay_permit', label: 'Barangay Clearance/Permit', description: 'Clearance from the barangay where the property is located', required: true },
    { type: 'land_title', label: 'Lot Title / TCT', description: 'Transfer Certificate of Title or Proof of Ownership', required: true },
    { type: 'site_development_plan', label: 'Site Development Plan', description: 'Detailed layout of the proposed development', required: true },
    { type: 'building_plans', label: 'Complete Building Plans', description: 'Architectural, Structural, Electrical, and Plumbing plans', required: true },
    { type: 'bill_of_materials', label: 'Bill of Materials', description: 'Cost estimates and quantity of materials', required: true },
];

interface RequirementManagerProps {
    applicationId: string;
    documents: Document[];
    applicantType: string;
    isRepresentative: boolean;
}

export default function RequirementManager({ applicationId, documents, applicantType, isRepresentative }: RequirementManagerProps) {
    const { auth } = usePage().props as any;
    const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
    const [uploadingFor, setUploadingFor] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);

    const isAdmin = auth.user.role === 'admin' || auth.user.role === 'staff';

    // Get unique requirement types based on applicant
    const requirements = [...DEFAULT_REQUIREMENTS];
    if (applicantType === 'business' || applicantType === 'developer') {
        requirements.push({ type: 'business_permit', label: 'Business Registration (SEC/DTI)', description: 'Company registration documents', required: true });
    }
    if (isRepresentative) {
        requirements.push({ type: 'spa_authorization', label: 'SPA / Authorization Letter', description: 'Legal document authorizing the representative', required: true });
    }

    const getDocumentForRequirement = (type: string) => {
        return documents.find(d => d.documentType === type && d.isCurrent);
    };

    const handleUpload = (type: string, file: File) => {
        setProcessing(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('document_type', type);

        // Use template string instead of route() as Ziggy is not defined globally
        router.post(`/zoning-applications/${applicationId}/documents`, formData, {
            onSuccess: () => {
                setUploadingFor(null);
                setProcessing(false);
            },
            onError: () => setProcessing(false),
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <section className="bg-white dark:bg-dark-surface shadow-lg p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <FileCheck className="text-primary" size={28} />
                        Required Documents
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Manage your application requirements and track local approvals.</p>
                </div>

                {isAdmin && (
                    <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wider">
                        <AlertCircle size={14} />
                        Administrative View
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {requirements.map((req) => {
                    const doc = getDocumentForRequirement(req.type);
                    const isUploading = uploadingFor === req.type;

                    return (
                        <div key={req.type} className="h-full">
                            {doc ? (
                                <div className="space-y-4 h-full flex flex-col">
                                    <DocumentCard
                                        document={doc}
                                        onView={() => setSelectedDoc({
                                            ...doc,
                                            versions: documents.filter(d => d.documentType === req.type).sort((a, b) => b.version - a.version)
                                        } as any)}
                                        // Hide the re-upload button on the card if we're already showing the uploader
                                        onUploadNew={!isAdmin && !isUploading ? () => setUploadingFor(req.type) : undefined}
                                    />
                                    {isUploading && (
                                        <div className="animate-in slide-in-from-top-2 duration-300">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-[10px] font-bold text-primary uppercase bg-primary/5 px-2 py-0.5 rounded">Uploading New Version</span>
                                                <button onClick={() => setUploadingFor(null)} className="text-gray-400 hover:text-red-500 transition-colors">
                                                    <PlusCircle className="rotate-45" size={16} />
                                                </button>
                                            </div>
                                            <DocumentUploader
                                                label=""
                                                description="PDF, JPG/PNG up to 10MB"
                                                onUpload={(file) => handleUpload(req.type, file)}
                                                processing={processing}
                                            />
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="h-full">
                                    {isUploading ? (
                                        <div className="animate-in zoom-in-95 duration-200 h-full">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-xs font-bold text-primary uppercase">New Upload</span>
                                                <button onClick={() => setUploadingFor(null)} className="text-gray-400 hover:text-red-500 transition-colors">
                                                    <PlusCircle className="rotate-45" size={20} />
                                                </button>
                                            </div>
                                            <DocumentUploader
                                                label={req.label}
                                                description="PDF, JPG/PNG up to 10MB"
                                                onUpload={(file) => handleUpload(req.type, file)}
                                                processing={processing}
                                            />
                                        </div>
                                    ) : (
                                        <div className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl p-6 h-full flex flex-col items-center justify-center text-center group hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-300">
                                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-full mb-4 text-gray-400 group-hover:text-primary transition-colors">
                                                <PlusCircle size={32} />
                                            </div>
                                            <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{req.label}</h4>
                                            <p className="text-[10px] text-gray-500 line-clamp-2 px-4 mb-4">{req.description}</p>

                                            {!isAdmin ? (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-xs font-bold tracking-tight text-primary hover:bg-primary/5"
                                                    onClick={() => setUploadingFor(req.type)}
                                                >
                                                    Click to Upload
                                                </Button>
                                            ) : (
                                                <div className="flex items-center gap-1 text-[10px] font-bold text-yellow-600 bg-yellow-50 dark:bg-yellow-900/10 px-3 py-1 rounded-full uppercase">
                                                    <HelpCircle size={10} />
                                                    Awaiting Submission
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* View Modal */}
            {selectedDoc && (
                <DocumentViewModal
                    document={selectedDoc}
                    applicationId={applicationId}
                    isAdmin={isAdmin}
                    onClose={() => setSelectedDoc(null)}
                />
            )}
        </section>
    );
}
