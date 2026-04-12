import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import {
    X, FileText, Users, MapPin, Folder, ChevronDown, ChevronUp,
    LucideIcon, Target, Clock, DollarSign, AlertCircle, CheckCircle,
    ListChecks, Info,
} from 'lucide-react';
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

type TabId = 'overview' | 'requirements' | 'fees';

// ─── Small reusable pieces ─────────────────────────────────────────────────

const SectionHeader = ({
    icon: Icon,
    iconBg,
    iconColor,
    label,
}: {
    icon: LucideIcon;
    iconBg: string;
    iconColor: string;
    label: string;
}) => (
    <div className="flex items-center gap-3 mb-3">
        <div className={`flex items-center justify-center rounded-lg w-9 h-9 shrink-0 ${iconBg}`}>
            <Icon size={18} className={iconColor} />
        </div>
        <h3 className="font-semibold text-gray-900 dark:text-white text-base">{label}</h3>
    </div>
);

const InfoCard = ({
    icon: Icon,
    iconBg,
    iconColor,
    label,
    value,
    note,
}: {
    icon: LucideIcon;
    iconBg: string;
    iconColor: string;
    label: string;
    value: string;
    note?: string;
}) => (
    <div className="flex gap-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700/50">
        <div className={`flex items-center justify-center rounded-lg w-10 h-10 shrink-0 ${iconBg}`}>
            <Icon size={20} className={iconColor} />
        </div>
        <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
            <p className="font-semibold text-gray-900 dark:text-white text-sm">{value}</p>
            {note && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{note}</p>}
        </div>
    </div>
);

const BulletList = ({ items, ordered = false }: { items: string[]; ordered?: boolean }) => {
    const Tag = ordered ? 'ol' : 'ul';
    return (
        <Tag className={`space-y-1.5 ${ordered ? 'list-decimal' : 'list-disc'} pl-5`}>
            {items.map((item, i) => (
                <li key={i} className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                    {item}
                </li>
            ))}
        </Tag>
    );
};

// ─── Tabs ──────────────────────────────────────────────────────────────────

const OverviewTab = ({ serviceDetails }: { serviceDetails: ServiceDetails }) => (
    <div className="space-y-6">
        {serviceDetails.description && (
            <section>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                    {serviceDetails.description}
                </p>
            </section>
        )}

        {serviceDetails.purpose && serviceDetails.purpose.length > 0 && (
            <section>
                <SectionHeader icon={Target} iconBg="bg-primary/10 dark:bg-primary/20" iconColor="text-primary" label="Purpose" />
                <BulletList items={serviceDetails.purpose} />
            </section>
        )}

        {serviceDetails.activitiesCovered && serviceDetails.activitiesCovered.length > 0 && (
            <section>
                <SectionHeader icon={ListChecks} iconBg="bg-indigo-100 dark:bg-indigo-900/30" iconColor="text-indigo-600 dark:text-indigo-400" label="Activities Covered" />
                <BulletList items={serviceDetails.activitiesCovered} />
            </section>
        )}

        {serviceDetails.considerations && (
            <section>
                <SectionHeader icon={MapPin} iconBg="bg-green-100 dark:bg-green-900/30" iconColor="text-green-600 dark:text-green-400" label={serviceDetails.considerations.title} />
                <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Approval is evaluated based on:</p>
                <BulletList items={serviceDetails.considerations.items} />
            </section>
        )}

        {serviceDetails.evaluationProcess && serviceDetails.evaluationProcess.length > 0 && (
            <section>
                <SectionHeader icon={Info} iconBg="bg-blue-100 dark:bg-blue-900/30" iconColor="text-blue-600 dark:text-blue-400" label="Evaluation Process" />
                <BulletList items={serviceDetails.evaluationProcess} ordered />
            </section>
        )}
    </div>
);

const RequirementsTab = ({
    whoCanApply,
    documents,
}: {
    whoCanApply: WhoCanApplyItem[];
    documents: DocumentCategory[];
}) => {
    const [openApplicant, setOpenApplicant] = useState<Record<number, boolean>>({});
    const [openDocCat, setOpenDocCat] = useState<Record<string, boolean>>(() => {
        const init: Record<string, boolean> = {};
        documents.forEach((d) => { init[d.id] = true; });
        return init;
    });

    const docCatIcon: Record<string, { icon: LucideIcon; iconBg: string; iconColor: string }> = {
        'legal-ownership': { icon: FileText, iconBg: 'bg-blue-100 dark:bg-blue-900/30', iconColor: 'text-blue-600 dark:text-blue-400' },
        'zoning-requirements': { icon: MapPin, iconBg: 'bg-green-100 dark:bg-green-900/30', iconColor: 'text-green-600 dark:text-green-400' },
    };

    return (
        <div className="space-y-6">
            {/* Who Can Apply */}
            {whoCanApply.length > 0 && (
                <section>
                    <SectionHeader icon={Users} iconBg="bg-primary/10 dark:bg-primary/20" iconColor="text-primary" label="Who Can Apply" />
                    <div className="space-y-2">
                        {whoCanApply.map((item, i) => {
                            const hasDoc = item.documents && item.documents.length > 0;
                            const open = openApplicant[i] ?? false;
                            return (
                                <div key={i} className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                                    <button
                                        type="button"
                                        onClick={() => hasDoc && setOpenApplicant((p) => ({ ...p, [i]: !p[i] }))}
                                        className={`w-full flex justify-between items-start gap-3 p-4 text-left transition-colors ${hasDoc ? 'hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer' : 'cursor-default'}`}
                                    >
                                        <div>
                                            <p className="font-semibold text-gray-900 dark:text-white text-sm">{item.title}</p>
                                            {item.description && (
                                                <p className="mt-0.5 text-gray-500 dark:text-gray-400 text-xs">{item.description}</p>
                                            )}
                                        </div>
                                        {hasDoc && (
                                            open
                                                ? <ChevronUp size={16} className="text-gray-400 shrink-0 mt-0.5" />
                                                : <ChevronDown size={16} className="text-gray-400 shrink-0 mt-0.5" />
                                        )}
                                    </button>
                                    {hasDoc && open && (
                                        <div className="px-4 pb-4 pt-0 border-t border-gray-100 dark:border-gray-700/50 bg-gray-50 dark:bg-gray-800/30">
                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-3 mb-2">Required Documents</p>
                                            <div className="space-y-2">
                                                {item.documents!.map((doc, di) => (
                                                    <DocItem key={di} doc={doc} />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* Document Categories */}
            {documents.map((cat) => {
                const cfg = docCatIcon[cat.id] ?? { icon: Folder, iconBg: 'bg-gray-100 dark:bg-gray-800', iconColor: 'text-gray-500' };
                const open = openDocCat[cat.id] ?? true;
                return (
                    <section key={cat.id}>
                        <button
                            type="button"
                            onClick={() => setOpenDocCat((p) => ({ ...p, [cat.id]: !p[cat.id] }))}
                            className="w-full flex items-center justify-between gap-3 mb-3 group"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`flex items-center justify-center rounded-lg w-9 h-9 shrink-0 ${cfg.iconBg}`}>
                                    <cfg.icon size={18} className={cfg.iconColor} />
                                </div>
                                <div className="text-left">
                                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{cat.title}</p>
                                    {cat.subtitle && <p className="text-xs text-gray-500 dark:text-gray-400">{cat.subtitle}</p>}
                                </div>
                            </div>
                            {open
                                ? <ChevronUp size={16} className="text-gray-400 shrink-0" />
                                : <ChevronDown size={16} className="text-gray-400 shrink-0" />}
                        </button>
                        {open && (
                            <div className="space-y-2 pl-12">
                                {cat.items.map((doc, di) => (
                                    <DocItem key={di} doc={doc} />
                                ))}
                            </div>
                        )}
                    </section>
                );
            })}
        </div>
    );
};

const DocItem = ({ doc }: { doc: DocumentItem }) => (
    <div className="flex gap-3 items-start">
        <CheckCircle size={15} className="text-primary shrink-0 mt-0.5" />
        <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{doc.title}</p>
            {doc.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{doc.description}</p>
            )}
        </div>
    </div>
);

const FeesTab = ({ serviceDetails }: { serviceDetails: ServiceDetails }) => (
    <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
            {serviceDetails.processingTime && (
                <InfoCard
                    icon={Clock}
                    iconBg="bg-blue-100 dark:bg-blue-900/30"
                    iconColor="text-blue-600 dark:text-blue-400"
                    label="Processing Time"
                    value={serviceDetails.processingTime}
                    note={serviceDetails.processingTimeNote}
                />
            )}
            {serviceDetails.fees && (
                <InfoCard
                    icon={DollarSign}
                    iconBg="bg-yellow-100 dark:bg-yellow-900/30"
                    iconColor="text-yellow-600 dark:text-yellow-400"
                    label="Fees"
                    value={serviceDetails.fees}
                    note={serviceDetails.feesNote}
                />
            )}
        </div>

        {serviceDetails.importantReminders && serviceDetails.importantReminders.length > 0 && (
            <section>
                <SectionHeader
                    icon={AlertCircle}
                    iconBg="bg-orange-100 dark:bg-orange-900/30"
                    iconColor="text-orange-600 dark:text-orange-400"
                    label="Important Reminders"
                />
                <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-800/30 rounded-xl p-4 space-y-2">
                    {serviceDetails.importantReminders.map((item, i) => (
                        <div key={i} className="flex gap-2.5 items-start">
                            <AlertCircle size={14} className="text-orange-500 shrink-0 mt-0.5" />
                            <p className="text-sm text-orange-800 dark:text-orange-300">{item}</p>
                        </div>
                    ))}
                </div>
            </section>
        )}
    </div>
);

// ─── Main Modal ────────────────────────────────────────────────────────────

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
    const [activeTab, setActiveTab] = useState<TabId>('overview');

    useEffect(() => {
        if (!isOpen) setActiveTab('overview');
    }, [isOpen]);

    if (!isOpen) return null;

    const hasOverview = !!(
        serviceDetails && (
            serviceDetails.description ||
            (serviceDetails.purpose?.length ?? 0) > 0 ||
            (serviceDetails.activitiesCovered?.length ?? 0) > 0 ||
            serviceDetails.considerations ||
            (serviceDetails.evaluationProcess?.length ?? 0) > 0
        )
    );
    const hasRequirements = whoCanApply.length > 0 || documents.length > 0;
    const hasFees = !!(
        serviceDetails && (
            serviceDetails.processingTime ||
            serviceDetails.fees ||
            (serviceDetails.importantReminders?.length ?? 0) > 0
        )
    );

    const tabs: { id: TabId; label: string; show: boolean }[] = (
        [
            { id: 'overview' as TabId, label: 'Overview', show: hasOverview },
            { id: 'requirements' as TabId, label: 'Requirements', show: hasRequirements },
            { id: 'fees' as TabId, label: 'Fees & Timeline', show: hasFees },
        ] satisfies { id: TabId; label: string; show: boolean }[]
    ).filter((t) => t.show);

    const applicationRoute = serviceId === 'housing-beneficiary'
        ? '/applications/housing'
        : '/zoning-applications';

    return (
        <div
            className="z-50 fixed inset-0 flex justify-center items-end sm:items-center bg-black/50 backdrop-blur-sm p-0 sm:p-4"
            onClick={onClose}
        >
            <div
                className="relative flex flex-col bg-white dark:bg-dark-surface shadow-2xl rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[85vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header + Tabs */}
                <div className="border-b border-gray-100 dark:border-gray-700/50">
                    <div className="flex justify-between items-start px-5 pt-5 pb-3">
                        <div className="pr-4">
                            <h2 className="font-bold text-gray-900 dark:text-white text-lg leading-snug">
                                {title}
                            </h2>
                            {description && (
                                <p className="mt-0.5 text-gray-500 dark:text-gray-400 text-sm">
                                    {description}
                                </p>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="hover:bg-gray-100 dark:hover:bg-gray-700 p-1.5 rounded-lg transition-colors shrink-0"
                            aria-label="Close"
                        >
                            <X size={20} className="text-gray-500 dark:text-gray-400" />
                        </button>
                    </div>

                    {tabs.length > 1 && (
                        <div className="flex gap-1 px-5 pb-2 overflow-x-auto">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-4 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${
                                        activeTab === tab.id
                                            ? 'bg-primary/10 dark:bg-primary/20 text-primary'
                                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 px-5 py-5 overflow-y-auto">
                    {activeTab === 'overview' && hasOverview && serviceDetails && (
                        <OverviewTab serviceDetails={serviceDetails} />
                    )}
                    {activeTab === 'requirements' && hasRequirements && (
                        <RequirementsTab whoCanApply={whoCanApply} documents={documents} />
                    )}
                    {activeTab === 'fees' && hasFees && serviceDetails && (
                        <FeesTab serviceDetails={serviceDetails} />
                    )}
                    {tabs.length === 0 && (
                        <p className="py-12 text-center text-gray-500 dark:text-gray-400 text-sm">
                            No additional information available for this service.
                        </p>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end items-center px-5 py-4 border-t border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/20">
                    <Button
                        variant="primary"
                        size="md"
                        onClick={() => {
                            onClose();
                            router.visit(applicationRoute);
                        }}
                    >
                        Apply Now
                    </Button>
                </div>
            </div>
        </div>
    );
}
