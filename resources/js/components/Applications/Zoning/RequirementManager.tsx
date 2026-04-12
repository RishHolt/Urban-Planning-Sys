import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { PlusCircle, FileCheck, AlertCircle, HelpCircle, Upload, Loader2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
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
    { type: 'land_title', label: 'Lot Title / TCT', description: 'Transfer Certificate of Title or Proof of Ownership', required: true },
    { type: 'tax_declaration', label: 'Certified True Copy of Tax Declaration', description: 'Most recent tax declaration from the Assessor\'s Office', required: true },
    { type: 'barangay_permit', label: 'Barangay Clearance/Permit', description: 'Clearance from the barangay where the property is located', required: true },
    { type: 'vicinity_map', label: 'Vicinity Map', description: 'Map showing the location relative to landmarks', required: true },
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
    if (applicantType === 'corporation' || applicantType === 'business' || applicantType === 'developer') {
        requirements.push({ type: 'business_permit', label: 'Business Registration (SEC/DTI)', description: 'Company registration documents', required: true });
    }
    if (isRepresentative) {
        requirements.push({ type: 'spa_authorization', label: 'SPA / Authorization Letter', description: 'Legal document authorizing the representative', required: true });
    }

    // Grouping Logic
    const groups = [
        {
            id: 'who_can_apply',
            title: 'Who Can Apply',
            description: 'Eligibility documents based on applicant type',
            types: ['business_permit', 'spa_authorization']
        },
        {
            id: 'primary',
            title: 'Primary Documents',
            description: 'Essential property ownership and legal clearances',
            types: ['land_title', 'tax_declaration', 'barangay_permit']
        },
        {
            id: 'project',
            title: 'Project Documents',
            description: 'Technical plans and maps for zoning evaluation',
            types: ['vicinity_map', 'site_development_plan', 'building_plans', 'bill_of_materials']
        }
    ];

    const getDocumentForRequirement = (type: string) => {
        return documents.find(d => d.documentType === type && d.isCurrent);
    };

    const handleUpload = (type: string, file: File) => {
        setProcessing(true);
        setUploadingFor(type);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('document_type', type);

        router.post(`/zoning-applications/${applicationId}/documents`, formData, {
            onSuccess: () => {
                setUploadingFor(null);
                setProcessing(false);
            },
            onError: () => {
                setUploadingFor(null);
                setProcessing(false);
            },
            onFinish: () => {
                setUploadingFor(null);
                setProcessing(false);
            },
        });
    };

    return (
        <div className="bg-white dark:bg-dark-surface shadow-md p-4 sm:p-8 rounded-2xl border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <FileCheck className="text-emerald-500" size={28} />
                        Required Documents
                    </h2>
                    <p className="text-sm text-gray-500 mt-1 font-medium">Manage your application requirements and track local approvals.</p>
                </div>

                {isAdmin && (
                    <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-xs font-bold uppercase tracking-wider">
                        <AlertCircle size={14} />
                        Administrative View
                    </div>
                )}
            </div>

            <div className="space-y-12">
                {groups.map((group) => {
                    const groupReqs = requirements.filter(req => group.types.includes(req.type));
                    
                    if (groupReqs.length === 0) {
                        return null;
                    }

                    return (
                        <div key={group.id} className="space-y-6">
                            <div className="border-b border-gray-100 dark:border-gray-800 pb-2">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                    <div className="w-1.5 h-6 bg-primary rounded-full" />
                                    {group.title}
                                </h3>
                                <p className="text-xs text-gray-500 mt-1 font-medium">{group.description}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {groupReqs.map((req) => {
                                    const doc = getDocumentForRequirement(req.type);
                                    const isUploading = uploadingFor === req.type;

                                    return (
                                        <div key={req.type} className="h-full">
                                            {doc && !isUploading ? (
                                                <DocumentCard
                                                    document={doc}
                                                    onView={() => setSelectedDoc({
                                                        ...doc,
                                                        versions: documents.filter(d => d.documentType === req.type).sort((a, b) => b.version - a.version)
                                                    } as any)}
                                                    onDownload={() => window.location.href = `/zoning-applications/${applicationId}/documents/${doc.id}/download`}
                                                    onUploadNew={!isAdmin ? () => setUploadingFor(req.type) : undefined}
                                                />
                                            ) : (
                                                <div className="h-full">
                                                    <RequirementDropzone
                                                        label={req.label}
                                                        description={doc ? `Replacing: ${doc.fileName}` : req.description}
                                                        onUpload={(file) => handleUpload(req.type, file)}
                                                        isProcessing={processing && uploadingFor === req.type}
                                                        isAdmin={isAdmin}
                                                        onCancel={doc ? () => setUploadingFor(null) : undefined}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
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
        </div>
    );
}

interface RequirementDropzoneProps {
    label: string;
    description: string;
    onUpload: (file: File) => void;
    isProcessing: boolean;
    isAdmin: boolean;
    onCancel?: () => void;
}

function RequirementDropzone({ label, description, onUpload, isProcessing, isAdmin, onCancel }: RequirementDropzoneProps) {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: (files) => files.length > 0 && onUpload(files[0]),
        accept: {
            'application/pdf': ['.pdf'],
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/png': ['.png'],
        },
        maxFiles: 1,
        disabled: isProcessing || isAdmin,
    });

    return (
        <div
            {...getRootProps()}
            className={`
                relative border-2 border-dashed rounded-xl p-6 h-full flex flex-col items-center justify-center text-center group transition-all duration-300
                ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-gray-800 hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-gray-800/50'}
                ${isProcessing ? 'cursor-not-allowed' : (isAdmin ? 'cursor-default' : 'cursor-pointer')}
            `}
        >
            <input {...getInputProps()} />

            {onCancel && !isProcessing && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onCancel();
                    }}
                    className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all z-30"
                    title="Cancel upload"
                >
                    <PlusCircle className="rotate-45" size={20} />
                </button>
            )}

            <div className={`p-4 rounded-full mb-4 transition-colors ${isDragActive ? 'bg-primary text-white font-bold' : 'bg-gray-50 dark:bg-gray-800 text-gray-400 group-hover:text-primary'}`}>
                {isProcessing ? (
                    <Loader2 className="animate-spin" size={32} />
                ) : isDragActive ? (
                    <Upload size={32} />
                ) : (
                    <PlusCircle size={32} />
                )}
            </div>

            <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{label}</h4>
            <p className="text-[10px] text-gray-500 line-clamp-2 px-4 mb-4">
                {isDragActive ? 'Drop file to upload' : description}
            </p>

            {!isAdmin ? (
                <div className="text-xs font-bold tracking-tight text-primary px-4 py-2 rounded-lg bg-primary/5 group-hover:bg-primary group-hover:text-white transition-all">
                    {isProcessing ? 'Uploading...' : 'Click or Drop to Upload'}
                </div>
            ) : (
                <div className="flex items-center gap-1 text-[10px] font-bold text-yellow-600 bg-yellow-50 dark:bg-yellow-900/10 px-3 py-1 rounded-full uppercase">
                    <HelpCircle size={10} />
                    Awaiting Submission
                </div>
            )}

            {isProcessing && (
                <div className="absolute inset-0 bg-white/60 dark:bg-dark-surface/60 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl z-20">
                    <Loader2 className="animate-spin text-primary mb-2" size={24} />
                    <span className="text-xs font-bold text-primary uppercase animate-pulse">Uploading</span>
                </div>
            )}
        </div>
    );
}
