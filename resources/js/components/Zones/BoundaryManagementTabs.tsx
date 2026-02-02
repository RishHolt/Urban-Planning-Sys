import { useState, ReactNode, isValidElement, Children } from 'react';

interface BoundaryManagementTabsProps {
    children: ReactNode;
    defaultTab?: 'classifications' | 'municipal' | 'barangay' | 'zoning';
}

interface TabPanelProps {
    tabId: string;
    children: ReactNode;
}

export function TabPanel({ children }: TabPanelProps) {
    return <>{children}</>;
}

export default function BoundaryManagementTabs({ 
    children, 
    defaultTab = 'classifications' 
}: BoundaryManagementTabsProps) {
    const [activeTab, setActiveTab] = useState<string>(defaultTab);

    const tabs = [
        { id: 'classifications', label: 'Classifications' },
        { id: 'municipal', label: 'Municipal Boundary' },
        { id: 'barangay', label: 'Barangay Boundaries' },
        { id: 'zoning', label: 'Zoning Boundaries' },
    ];

    return (
        <div className="w-full">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                                ${
                                    activeTab === tab.id
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                }
                            `}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="mt-6">
                {Children.map(children, (child) => {
                    if (isValidElement(child) && child.type === TabPanel) {
                        const props = child.props as TabPanelProps;
                        if (props.tabId === activeTab) {
                            return props.children;
                        }
                    }
                    return null;
                })}
            </div>
        </div>
    );
}
