import React from 'react';
import {Search, Menu } from 'lucide-react';
import { useUser } from '../../context/UserContext';
interface HeaderProps {
  openSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ openSidebar }) => {
  const { user } = useUser();

  return (
    <header className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white shadow-sm">
      <button
        type="button"
        className="px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary lg:hidden"
        onClick={openSidebar}
      >
        <span className="sr-only">Open sidebar</span>
        <Menu className="h-6 w-6" />
      </button>

      <div className="flex flex-1 justify-between px-4">
        <div className="flex flex-1">
          <div className="flex w-full md:ml-0">
            <div className="relative w-full max-w-2xl">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                {/* <Search className="h-3 w-3 text-gray-400" /> */}
              </div>
              <input
                type="search"
                placeholder="Search..."
                className="w-full h-full rounded-md border border-gray-200 bg-gray-50 py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        <div className="ml-4 flex items-center space-x-4">

          <div className="relative">
            <button
              className="flex items-center rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              onClick={() => {
                // Open the settings tab logic
                // For example, navigate to the settings page or open a settings modal
                // Assuming navigation to /settings page using window.location or react-router
                window.location.href = '/settings';
              }}>
              <span className="sr-only">Open user menu</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white ">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <span className="ml-2 hidden text-sm font-medium text-gray-700 lg:block">
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;