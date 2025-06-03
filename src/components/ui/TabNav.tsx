import React from 'react';

interface TabItem {
  id: string;
  label: string;
}

interface TabNavProps {
  tabs: TabItem[];
  activeTab: string;
  setActiveTab: (tabId: string) => void;
}

const TabNav: React.FC<TabNavProps> = ({ tabs, activeTab, setActiveTab }) => {
  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default TabNav;