import { useState, ReactNode, isValidElement, Children } from 'react';

interface ApplicationDetailsTabsProps {
    children: ReactNode;
    defaultTab?: string;
    tabStatuses?: Record<string, 'red' | 'yellow' | 'green'>;
}

interface TabPanelProps {
    tabId: string;
    children: ReactNode;
    status?: 'red' | 'yellow' | 'green';
}

export function TabPanel({ children }: TabPanelProps) {
    return <>{children}</>;
}

export default function ApplicationDetailsTabs({ 
    children, 
    defaultTab = 'overview',
    tabStatuses = {}
}: ApplicationDetailsTabsProps) {
    const [activeTab, setActiveTab] = useState<string>(defaultTab);

    // Extract tab definitions from children
    const tabs: Array<{ id: string; label: string; status?: 'red' | 'yellow' | 'green' }> = [];
    Children.forEach(children, (child) => {
        if (isValidElement(child) && child.type === TabPanel) {
            const props = child.props as TabPanelProps;
            const tabId = props.tabId;
            const label = tabId.split('_').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
            const status = props.status || tabStatuses[tabId];
            tabs.push({ id: tabId, label, status });
        }
    });

    return (
        <div className="w-full">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
                    {tabs.map((tab) => {
                        const statusColor = tab.status === 'red' 
                            ? 'bg-red-500' 
                            : tab.status === 'yellow' 
                            ? 'bg-yellow-500' 
                            : tab.status === 'green' 
                            ? 'bg-green-500' 
                            : null;

                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2
                                    ${
                                        activeTab === tab.id
                                            ? 'border-primary text-primary dark:text-primary'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                    }
                                `}
                            >
                                {tab.status && (
                                    <span className={`w-2 h-2 rounded-full ${statusColor} flex-shrink-0`} />
                                )}
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Tab Content */}
            <div>
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
