import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { X, FileText, Users, MapPin, Building, Folder, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, LucideIcon, Target, Clock, DollarSign, AlertCircle } from 'lucide-react';
import type { DocumentItem, DocumentCategory, WhoCanApplyItem, ServiceDetails } from '../data/services';
import Button from '../components/Button';

interface ServiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    serviceId?: string;
    whoCanApply?: WhoCanApplyItem[];
    documents?: DocumentCategory[];
    serviceDetails?: ServiceDetails;
}

interface SectionConfig {
    icon: LucideIcon;
    iconBg: string;
    iconColor: string;
    title: string;
    subtitle: string;
    borderColor?: string;
}

interface CollapsibleSectionProps {
    config: SectionConfig;
    isOpen: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}

interface DocumentSectionProps {
    config: SectionConfig;
    category: DocumentCategory;
    isOpen: boolean;
    onToggle: () => void;
}

interface WhoCanApplySectionProps {
    items: WhoCanApplyItem[];
    isOpen: boolean;
    onToggle: () => void;
    expandedItems: Record<number, boolean>;
    onToggleItem: (index: number) => void;
}

const CollapsibleSection = ({ config, isOpen, onToggle, children }: CollapsibleSectionProps) => {
    const { icon: Icon, iconBg, iconColor, title, subtitle } = config;

    return (
        <section>
            <button
                onClick={onToggle}
                className="flex justify-between items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 mb-4 p-2 rounded-lg w-full transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className={`flex justify-center items-center ${iconBg} rounded-lg w-10 h-10`}>
                        <Icon size={20} className={iconColor} />
                    </div>
                    <div className="text-left">
                        <h3 className="font-bold text-gray-900 dark:text-white text-xl">
                            {title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            {subtitle}
                        </p>
                    </div>
                </div>
                {isOpen ? (
                    <ChevronUp size={20} className="text-gray-500 dark:text-gray-400" />
                ) : (
                    <ChevronDown size={20} className="text-gray-500 dark:text-gray-400" />
                )}
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-out ${
                isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
            }`}>
                <div className="space-y-3 pt-2 pl-14">
                    {children}
                </div>
            </div>
        </section>
    );
};

const DocumentSection = ({ config, category, isOpen, onToggle }: DocumentSectionProps) => {
    const { borderColor = 'border-primary/30 dark:border-primary/50' } = config;

    return (
        <CollapsibleSection config={config} isOpen={isOpen} onToggle={onToggle}>
            {category.items.map((item, index) => (
                <div key={index} className={`pl-4 ${borderColor} border-l-2`}>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                        {item.title}
                    </h4>
                    {item.description && (
                        <p className="mt-1 text-gray-600 dark:text-gray-400 text-sm">
                            {item.description}
                        </p>
                    )}
                </div>
            ))}
        </CollapsibleSection>
    );
};

const WhoCanApplySection = ({ items, isOpen, onToggle, expandedItems, onToggleItem }: WhoCanApplySectionProps) => {
    const config: SectionConfig = {
        icon: Users,
        iconBg: 'bg-primary/10 dark:bg-primary/20',
        iconColor: 'text-primary',
        title: 'Who Can Apply',
        subtitle: 'Click to expand and see required documents',
    };

    return (
        <CollapsibleSection config={config} isOpen={isOpen} onToggle={onToggle}>
            {items.map((item, index) => {
                const isExpanded = expandedItems[index] || false;
                const hasDocuments = item.documents && item.documents.length > 0;

                return (
                    <div key={index} className="pl-4 border-primary/30 dark:border-primary/50 border-l-2">
                        <button
                            type="button"
                            onClick={() => hasDocuments && onToggleItem(index)}
                            className={`w-full text-left flex justify-between items-start gap-3 transition-colors ${
                                hasDocuments
                                    ? 'hover:bg-gray-50 dark:hover:bg-gray-800/30 cursor-pointer'
                                    : 'cursor-default'
                            } rounded-lg p-3`}
                        >
                            <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                    {item.title}
                                </h4>
                                {item.description && (
                                    <p className="mt-1 text-gray-600 dark:text-gray-400 text-sm">
                                        {item.description}
                                    </p>
                                )}
                            </div>
                            {hasDocuments && (
                                <div className="flex-shrink-0">
                                    {isExpanded ? (
                                        <ChevronUp size={20} className="text-gray-500 dark:text-gray-400" />
                                    ) : (
                                        <ChevronDown size={20} className="text-gray-500 dark:text-gray-400" />
                                    )}
                                </div>
                            )}
                        </button>
                        {hasDocuments && (
                            <div className={`overflow-hidden transition-all duration-300 ease-out ${
                                isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                            }`}>
                            <div className="space-y-3 pt-3 pl-4">
                                <h5 className="mb-2 font-semibold text-gray-800 dark:text-gray-200 text-sm">
                                    Required Documents:
                                </h5>
                                {item.documents?.map((doc, docIndex) => (
                                    <div key={docIndex} className="pl-4 border-indigo-200 dark:border-indigo-800 border-l-2">
                                        <h6 className="font-medium text-gray-900 dark:text-white text-sm">
                                            {doc.title}
                                        </h6>
                                        {doc.description && (
                                            <p className="mt-1 text-gray-600 dark:text-gray-400 text-xs">
                                                {doc.description}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                        )}
                    </div>
                );
            })}
        </CollapsibleSection>
    );
};

export default function ServiceModal({
    isOpen,
    onClose,
    title,
    description,
    serviceId = 'zoning-clearance',
    whoCanApply = [],
    documents = [],
    serviceDetails,
}: ServiceModalProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({
        whoCanApply: true,
    });
    const [expandedApplicantItems, setExpandedApplicantItems] = useState<Record<number, boolean>>({});
    
    // Initialize document sections as open
    useEffect(() => {
        if (documents.length > 0) {
            const initialSections: Record<string, boolean> = { whoCanApply: true };
            documents.forEach((doc) => {
                initialSections[doc.id] = true;
            });
            setOpenSections(initialSections);
        }
    }, [documents]);

    const toggleSection = (key: string) => {
        setOpenSections((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const toggleApplicantItem = (index: number) => {
        setExpandedApplicantItems((prev) => ({
            ...prev,
            [index]: !prev[index],
        }));
    };

    // Reset expanded items and page when modal closes
    useEffect(() => {
        if (!isOpen) {
            setExpandedApplicantItems({});
            setCurrentPage(1);
        }
    }, [isOpen]);

    // Calculate total pages based on content
    const hasServiceDetails = serviceDetails && (
        serviceDetails.description ||
        serviceDetails.purpose ||
        serviceDetails.activitiesCovered ||
        serviceDetails.considerations ||
        serviceDetails.evaluationProcess ||
        serviceDetails.processingTime ||
        serviceDetails.fees ||
        serviceDetails.importantReminders
    );
    const hasDocumentsPage = whoCanApply.length > 0 || documents.length > 0;
    // If we have both service details and documents, show 2 pages
    // Otherwise show 1 page (either details or documents)
    const totalPages = hasServiceDetails && hasDocumentsPage ? 2 : 1;
    // Determine which page to show: page 1 = service details (if exists), page 2 = documents
    const showServiceDetails = currentPage === 1 && hasServiceDetails;
    const showDocuments = (currentPage === 2 && hasServiceDetails) || (currentPage === 1 && !hasServiceDetails && hasDocumentsPage);

    const nextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };
    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    if (!isOpen) {
        return null;
    }

    const getDocumentSectionConfig = (category: DocumentCategory): SectionConfig => {
        const iconMap: Record<string, { icon: LucideIcon; iconBg: string; iconColor: string }> = {
            'legal-ownership': {
                icon: FileText,
                iconBg: 'bg-blue-100 dark:bg-blue-900/30',
                iconColor: 'text-blue-600 dark:text-blue-400',
            },
            'zoning-requirements': {
            icon: MapPin,
            iconBg: 'bg-green-100 dark:bg-green-900/30',
            iconColor: 'text-green-600 dark:text-green-400',
            },
            'subdivision-building-review': {
                icon: Building,
                iconBg: 'bg-purple-100 dark:bg-purple-900/30',
                iconColor: 'text-purple-600 dark:text-purple-400',
        },
        };

        const defaultConfig = {
            icon: Folder,
            iconBg: 'bg-gray-100 dark:bg-gray-800',
            iconColor: 'text-gray-600 dark:text-gray-400',
        };

        const config = iconMap[category.id] || defaultConfig;

        return {
            ...config,
            title: category.title,
            subtitle: category.subtitle || 'Required documents',
            borderColor: 'border-primary/30 dark:border-primary/50',
        };
    };

    return (
        <div 
            className="z-50 fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div 
                className="relative flex flex-col bg-white dark:bg-dark-surface shadow-2xl rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="top-0 z-10 sticky flex justify-between items-center bg-white dark:bg-dark-surface px-6 py-4 border-gray-200 dark:border-gray-700 border-b">
                    <div>
                        <h2 className="font-bold text-gray-900 dark:text-white text-2xl">
                            {title}
                        </h2>
                        {description && (
                            <p className="mt-1 text-gray-600 dark:text-gray-400 text-sm">
                                {description}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors"
                        aria-label="Close modal"
                    >
                        <X size={24} className="text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 px-6 py-6 overflow-y-auto">
                    {showServiceDetails ? (
                        <div className="space-y-6">
                            {/* Service Description */}
                            {serviceDetails.description && (
                            <section>
                                <h3 className="mb-3 font-bold text-gray-900 dark:text-white text-xl">
                                    Service Description
                                </h3>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                        {serviceDetails.description}
                                </p>
                            </section>
                            )}

                            {/* Purpose of the Service */}
                            {serviceDetails.purpose && serviceDetails.purpose.length > 0 && (
                            <section>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="flex justify-center items-center bg-primary/10 dark:bg-primary/20 rounded-lg w-10 h-10">
                                        <Target size={20} className="text-primary" />
                                    </div>
                                    <h3 className="font-bold text-gray-900 dark:text-white text-xl">
                                        Purpose of the Service
                                    </h3>
                                </div>
                                <p className="mb-3 text-gray-700 dark:text-gray-300">
                                    This service is required to:
                                </p>
                                <ul className="space-y-2 pl-14 list-disc">
                                        {serviceDetails.purpose.map((item, index) => (
                                            <li key={index} className="text-gray-700 dark:text-gray-300">
                                                {item}
                                            </li>
                                        ))}
                                </ul>
                            </section>
                            )}

                            {/* Types of Activities Covered */}
                            {serviceDetails.activitiesCovered && serviceDetails.activitiesCovered.length > 0 && (
                            <section>
                                <h3 className="mb-3 font-bold text-gray-900 dark:text-white text-xl">
                                    Types of Activities Covered
                                </h3>
                                <ul className="space-y-2 pl-6 list-disc">
                                        {serviceDetails.activitiesCovered.map((item, index) => (
                                            <li key={index} className="text-gray-700 dark:text-gray-300">
                                                {item}
                                            </li>
                                        ))}
                                </ul>
                            </section>
                            )}

                            {/* Considerations */}
                            {serviceDetails.considerations && (
                            <section>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="flex justify-center items-center bg-green-100 dark:bg-green-900/30 rounded-lg w-10 h-10">
                                        <MapPin size={20} className="text-green-600 dark:text-green-400" />
                                    </div>
                                    <h3 className="font-bold text-gray-900 dark:text-white text-xl">
                                            {serviceDetails.considerations.title}
                                    </h3>
                                </div>
                                <p className="mb-3 text-gray-700 dark:text-gray-300">
                                    Approval is evaluated based on:
                                </p>
                                <ul className="space-y-2 pl-14 list-disc">
                                        {serviceDetails.considerations.items.map((item, index) => (
                                            <li key={index} className="text-gray-700 dark:text-gray-300">
                                                {item}
                                            </li>
                                        ))}
                                </ul>
                            </section>
                            )}

                            {/* Evaluation Process */}
                            {serviceDetails.evaluationProcess && serviceDetails.evaluationProcess.length > 0 && (
                            <section>
                                <h3 className="mb-3 font-bold text-gray-900 dark:text-white text-xl">
                                    Evaluation Process
                                </h3>
                                <ol className="space-y-2 pl-6 list-decimal">
                                        {serviceDetails.evaluationProcess.map((item, index) => (
                                            <li key={index} className="text-gray-700 dark:text-gray-300">
                                                {item}
                                            </li>
                                        ))}
                                </ol>
                            </section>
                            )}

                            {/* Processing Time */}
                            {serviceDetails.processingTime && (
                            <section>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="flex justify-center items-center bg-blue-100 dark:bg-blue-900/30 rounded-lg w-10 h-10">
                                        <Clock size={20} className="text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <h3 className="font-bold text-gray-900 dark:text-white text-xl">
                                        Processing Time
                                    </h3>
                                </div>
                                <p className="text-gray-700 dark:text-gray-300">
                                        Estimated processing time: <span className="font-semibold">{serviceDetails.processingTime}</span>
                                </p>
                                    {serviceDetails.processingTimeNote && (
                                <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">
                                            {serviceDetails.processingTimeNote}
                                </p>
                                    )}
                            </section>
                            )}

                            {/* Fees */}
                            {serviceDetails.fees && (
                            <section>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="flex justify-center items-center bg-yellow-100 dark:bg-yellow-900/30 rounded-lg w-10 h-10">
                                        <DollarSign size={20} className="text-yellow-600 dark:text-yellow-400" />
                                    </div>
                                    <h3 className="font-bold text-gray-900 dark:text-white text-xl">
                                        Fees
                                    </h3>
                                </div>
                                <p className="text-gray-700 dark:text-gray-300">
                                        {serviceDetails.fees}
                                </p>
                                    {serviceDetails.feesNote && (
                                <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">
                                            {serviceDetails.feesNote}
                                </p>
                                    )}
                            </section>
                            )}

                            {/* Important Reminders */}
                            {serviceDetails.importantReminders && serviceDetails.importantReminders.length > 0 && (
                            <section>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="flex justify-center items-center bg-orange-100 dark:bg-orange-900/30 rounded-lg w-10 h-10">
                                        <AlertCircle size={20} className="text-orange-600 dark:text-orange-400" />
                                    </div>
                                    <h3 className="font-bold text-gray-900 dark:text-white text-xl">
                                        Important Reminders
                                    </h3>
                                </div>
                                <ul className="space-y-2 pl-14 list-disc">
                                        {serviceDetails.importantReminders.map((item, index) => (
                                            <li key={index} className="text-gray-700 dark:text-gray-300">
                                                {item}
                                            </li>
                                        ))}
                                </ul>
                            </section>
                            )}
                        </div>
                    ) : showDocuments ? (
                        <div className="space-y-8">
                            {whoCanApply.length > 0 && (
                                <WhoCanApplySection
                                    items={whoCanApply}
                                    isOpen={openSections.whoCanApply}
                                    onToggle={() => toggleSection('whoCanApply')}
                                    expandedItems={expandedApplicantItems}
                                    onToggleItem={toggleApplicantItem}
                                />
                            )}

                            {documents.map((category) => (
                                <DocumentSection
                                    key={category.id}
                                    config={getDocumentSectionConfig(category)}
                                    category={category}
                                    isOpen={openSections[category.id] ?? true}
                                    onToggle={() => toggleSection(category.id)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="py-12 text-center">
                            <p className="text-gray-500 dark:text-gray-400">
                                No additional information available for this service.
                            </p>
                        </div>
                    )}
                </div>

                {/* Pagination Footer */}
                <div className="bottom-0 sticky flex justify-between items-center bg-white dark:bg-dark-surface px-6 py-4 border-gray-200 dark:border-gray-700 border-t">
                    <button
                        onClick={prevPage}
                        disabled={currentPage === 1}
                        className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 disabled:opacity-50 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 transition-colors disabled:cursor-not-allowed"
                    >
                        <ChevronLeft size={20} />
                        Previous
                    </button>

                    <div className="flex items-center gap-2">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`w-8 h-8 rounded-lg transition-colors ${
                                    currentPage === page
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                                aria-label={`Go to page ${page}`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>

                    {currentPage === totalPages ? (
                        <Button
                            variant="primary"
                            size="md"
                            onClick={() => {
                                onClose();
                                // Route based on service ID
                                const applicationRoute = serviceId === 'housing-beneficiary' 
                                    ? '/applications/housing/create'
                                    : '/applications/zoning/create';
                                router.visit(applicationRoute);
                            }}
                        >
                            Apply now
                        </Button>
                    ) : (
                        <button
                            onClick={nextPage}
                            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 transition-colors"
                        >
                            Next
                            <ChevronRight size={20} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
