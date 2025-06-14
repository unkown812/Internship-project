import React from 'react';
import { NavLink } from 'react-router-dom';
import '../../index.css'
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  CalendarCheck, 
  TrendingUp, 
  CreditCard, 
  Settings, 
  LogOut, 
  X
} from 'lucide-react';
import { useUser } from '../../context/UserContext';
import './layout.css';

interface SidebarProps {
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const { logout } = useUser();
  
  return (
    <div className="flex h-full flex-col bg-grey-500 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between px-4 lg:justify-center">
        <div className="flex items-center">
          <img src="/src/assets/Sk logo.png" alt="" class="size-20 mt-4"/>
          <h1 className="ml-2 text-xl font-bold text-gray-900 font-quicksand" >SK Tutorials</h1>
        </div>
        <button
          title='close'
          onClick={onClose}
          className="rounded-md p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <nav className="space-y-1">
          <NavLink 
            to="/" 
            end
            className={({ isActive }) => 
              `flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-primary text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <LayoutDashboard className="mr-3 h-5 w-5" />
            <span>Dashboard</span>
          </NavLink>
          
          <NavLink 
            to="/students" 
            className={({ isActive }) => 
              `flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-primary text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <Users className="mr-3 h-5 w-5" />
            <span>Students</span>
          </NavLink>
          
          {/* <NavLink 
            to="/fees" 
            className={({ isActive }) => 
              `flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-primary text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <CreditCard className="mr-3 h-5 w-5" />
            <span>Fees</span>
          </NavLink> */}
          
          <NavLink 
            to="/attendance" 
            className={({ isActive }) => 
              `flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-primary text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <CalendarCheck className="mr-3 h-5 w-5" />
            <span>Attendance</span>
          </NavLink>
          
          <NavLink 
            to="/performance" 
            className={({ isActive }) => 
              `flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-primary text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <TrendingUp className="mr-3 h-5 w-5" />
            <span>Performance</span>
          </NavLink>
          
          <NavLink 
            to="/courses" 
            className={({ isActive }) => 
              `flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-primary text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <BookOpen className="mr-3 h-5 w-5" />
            <span>Courses</span>
          </NavLink>
          
          <NavLink 
            to="/settings" 
            className={({ isActive }) => 
              `flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-primary text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <Settings className="mr-3 h-5 w-5" />
            <span>Settings</span>
          </NavLink>
        </nav>
      </div>
      
      <div className="border-t border-gray-200 p-4">
        <button 
          onClick={logout}
          className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          <LogOut className="mr-3 h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;