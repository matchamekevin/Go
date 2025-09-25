import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard,
  Route as RouteIcon,
  Ticket,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Bus,
  Plus
} from 'lucide-react';
import { clsx } from 'clsx';

const navigation = [
  {
    name: 'Tableau de bord',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Vue d\'ensemble et statistiques'
  },
  {
    name: 'Gestion des lignes',
    href: '/lines',
    icon: RouteIcon,
    description: 'Créer et gérer les lignes SOTRAL'
  },
  {
    name: 'Gestion des tickets',
    href: '/tickets',
    icon: Ticket,
    description: 'Voir et supprimer les tickets'
  },
  {
    name: 'Génération de tickets',
    href: '/tickets/generate',
    icon: Plus,
    description: 'Générer des tickets pour les lignes'
  },
];

const secondaryNavigation = [
  {
    name: 'Paramètres',
    href: '/settings',
    icon: Settings,
  },
];

interface DashboardLayoutProps {}

export const DashboardLayout: React.FC<DashboardLayoutProps> = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const currentPage = navigation.find(item => item.href === location.pathname);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={clsx(
        'fixed inset-0 z-50 lg:hidden',
        sidebarOpen ? 'block' : 'hidden'
      )}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed top-0 left-0 flex flex-col w-64 h-full bg-white shadow-xl">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 bg-emerald-600 rounded-lg">
                <Bus className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-gray-900">SOTRAL Admin</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;
              
              return (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(item.href);
                    setSidebarOpen(false);
                  }}
                  className={clsx(
                    'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                    isActive
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </a>
              );
            })}
          </nav>
          
          <div className="p-4 border-t border-gray-200">
            {secondaryNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100"
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </a>
              );
            })}
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex flex-col flex-1 min-h-0 bg-white border-r border-gray-200 shadow-sm">
          {/* Logo */}
          <div className="flex items-center px-6 py-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-emerald-600 rounded-xl shadow-lg">
                <Bus className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">SOTRAL</h1>
                <p className="text-sm text-gray-500">Administration</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;
              
              return (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(item.href);
                  }}
                  className={clsx(
                    'group flex flex-col px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200',
                    isActive
                      ? 'bg-emerald-100 text-emerald-700 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <div className="flex items-center">
                    <Icon className={clsx(
                      'w-5 h-5 mr-3 transition-colors',
                      isActive ? 'text-emerald-600' : 'text-gray-400 group-hover:text-gray-600'
                    )} />
                    <span>{item.name}</span>
                  </div>
                  <p className={clsx(
                    'mt-1 ml-8 text-xs',
                    isActive ? 'text-emerald-600' : 'text-gray-500'
                  )}>
                    {item.description}
                  </p>
                </a>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            {secondaryNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className="flex items-center px-3 py-2 mb-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-white"
                >
                  <Icon className="w-5 h-5 mr-3 text-gray-400" />
                  {item.name}
                </a>
              );
            })}
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Déconnexion
            </button>
            
            {/* Version info */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                Version 2.0.0
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="lg:pl-72">
        {/* Top navigation */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-2">
                <Bus className="w-6 h-6 text-emerald-600" />
                <span className="text-lg font-semibold text-gray-900">SOTRAL</span>
              </div>
            </div>
          </div>
        </div>

        {/* Page header */}
        <header className="bg-white border-b border-gray-200">
          <div className="px-6 py-6">
            {currentPage && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-xl">
                  <currentPage.icon className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {currentPage.name}
                  </h1>
                  <p className="mt-1 text-sm text-gray-500">
                    {currentPage.description}
                  </p>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1">
          <div className="px-6 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};