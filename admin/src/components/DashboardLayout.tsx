import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, Bell, Search } from 'lucide-react';
import Sidebar from './Sidebar';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="h-screen flex overflow-hidden bg-[#f5f5f5]">
      {/* Sidebar mobile */}
      <Sidebar isMobile isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Sidebar desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <Sidebar />
      </div>

      {/* Contenu principal */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Header */}
        <div className="relative z-10 flex-shrink-0 flex h-20 bg-[#23272b] shadow-md">
          <button
            type="button"
            className="px-4 text-gray-400 focus:outline-none md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
            <div className="flex-1 px-6 flex items-center justify-center">
              <div className="w-full max-w-xl mx-auto">
                <div className="relative w-full text-gray-400">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-[#065f46]" />
                  </div>
                  <input
                    type="search"
                    className="w-full h-12 pl-12 pr-4 py-2 text-base rounded-xl bg-white text-black border border-[#d1fae5] placeholder:text-gray-500 focus:border-[#065f46]"
                    placeholder="Rechercher un ticket, utilisateur, route..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="ml-4 flex items-center">
                <button
                  type="button"
                  className="p-2 rounded-xl text-white bg-[#065f46] focus:outline-none focus:ring-2 focus:ring-[#065f46] relative"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 transform translate-x-0 -translate-y-0"></span>
                </button>
              </div>
          </div>
        </div>

        {/* Contenu de la page */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none custom-scrollbar">
          <div className="py-8 px-6 sm:px-8 lg:px-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
