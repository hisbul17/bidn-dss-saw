import React from 'react';
import { 
  Home, 
  Users, 
  ClipboardList, 
  FileText, 
  Settings,
  Award,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const { user } = useAuth();

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      roles: ['admin', 'manager', 'supervisor', 'employee']
    },
    {
      id: 'employees',
      label: 'Employees',
      icon: Users,
      roles: ['admin', 'manager', 'supervisor']
    },
    {
      id: 'evaluations',
      label: 'Evaluations',
      icon: ClipboardList,
      roles: ['admin', 'manager', 'supervisor']
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: FileText,
      roles: ['admin', 'manager', 'supervisor']
    },
    {
      id: 'rankings',
      label: 'Rankings',
      icon: Award,
      roles: ['admin', 'supervisor']
    }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role || '')
  );

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200 h-full">
      <div className="p-4">
        <nav className="space-y-2">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-blue-700' : 'text-gray-400'}`} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;