import { LucideIcon } from 'lucide-react';
import { TabId } from '../types';

interface Tab {
  id: TabId;
  label: string;
  icon: LucideIcon;
  badge?: number;
  'data-tour'?: string;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: TabId;
  onChange: (tabId: TabId) => void;
}

export function TabNavigation({ tabs, activeTab, onChange }: TabNavigationProps) {
  return (
    <div className="border-b border-gray-200">
      <div className="sm:hidden mt-4">
        <select
          id="tabs"
          name="tabs"
          className="block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 py-2 px-3"
          value={activeTab}
          onChange={(e) => onChange(e.target.value as TabId)}
        >
          {tabs.map((tab) => (
            <option key={tab.id} value={tab.id}>
              {tab.label} {tab.badge ? `(${tab.badge})` : ''}
            </option>
          ))}
        </select>
      </div>
      
      <div className="hidden sm:block">
        <nav className="flex -mb-px" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                data-tour={tab['data-tour']}
                className={`
                  group relative min-w-0 flex-1 overflow-hidden py-4 px-6 text-sm font-medium text-center 
                  transition-colors duration-200 ease-in-out
                  ${isActive 
                    ? 'text-indigo-600 border-b-2 border-indigo-500' 
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent'}
                `}
                aria-current={isActive ? 'page' : undefined}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Icon 
                    className={`
                      h-5 w-5 transition-colors duration-200
                      ${isActive ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'}
                    `} 
                    aria-hidden="true" 
                  />
                  <span>{tab.label}</span>
                  
                  {tab.badge && (
                    <span 
                      className={`
                        inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium 
                        ${isActive 
                          ? 'bg-indigo-100 text-indigo-800' 
                          : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                        }
                      `}
                    >
                      {tab.badge}
                    </span>
                  )}
                </div>
                
                {/* Active indicator animation */}
                <span 
                  aria-hidden="true"
                  className={`
                    absolute inset-x-0 bottom-0 h-0.5 
                    ${isActive ? 'bg-indigo-500' : 'bg-transparent'}
                  `} 
                />
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
