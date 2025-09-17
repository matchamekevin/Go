import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Ticket,
  Package,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  MessageSquare,
  PieChart,
  FileText,
  HelpCircle
} from 'lucide-react';

// Catégories de menu
const navigationCategories = [
  {
    category: "Général",
    items: [
      { name: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Utilisateurs', href: '/users', icon: Users },
      { name: 'Rapports', href: '/reports', icon: FileText },
    ]
  },
  {
    category: "Transport",
    items: [
      { name: 'SOTRAL', href: '/sotral', icon: Ticket },
      { name: 'Tickets', href: '/tickets', icon: Ticket },
      { name: 'Produits', href: '/products', icon: Package },
    ]
  },
  {
    category: "Finance",
    items: [
      { name: 'Paiements', href: '/payments', icon: CreditCard },
      { name: 'Statistiques', href: '/statistics', icon: PieChart },
    ]
  },
  {
    category: "Support",
    items: [
      { name: 'Messages', href: '/messages', icon: MessageSquare },
      { name: 'Aide', href: '/help', icon: HelpCircle },
      { name: 'Paramètres', href: '/settings', icon: Settings },
    ]
  }
];

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }       
  };

  const isCurrentPath = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="h-screen flex overflow-hidden bg-[#f5f5f5]">
      {/* Sidebar mobile */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full glass-container">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto custom-scrollbar">
            <div className="flex-shrink-0 flex items-center px-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-[#065f46]">
                  <LayoutDashboard className="h-6 w-6 text-[#065f46]" />
                </div>
                <span className="ml-3 text-xl font-bold text-[#065f46]">GoSOTRAL</span>
              </div>
            </div>
            <nav className="mt-4 flex-1 px-4 space-y-6">
              {navigationCategories.map((category, idx) => (
                <div key={idx} className="space-y-3">
                  <h3 className="text-xs font-semibold text-[#065f46] uppercase tracking-wider px-2">
                    {category.category}
                  </h3>
                  <div className="space-y-1">
                    {category.items.map((item) => {
                      const Icon = item.icon;
                      const active = isCurrentPath(item.href);
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          className={`group flex items-center px-4 py-3 text-base rounded-xl font-semibold
                            ${active ? 'bg-[#065f46] text-white' : 'text-[#065f46]'}
                          `}
                        >
                          <Icon className={`mr-3 h-5 w-5 ${active ? 'text-white' : 'text-[#065f46]'}`} />
                          {item.name}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </div>
          <div className="flex-shrink-0 border-t border-white border-opacity-20 p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-white border border-[#065f46] rounded-full flex items-center justify-center shadow-md">
                <span className="text-sm font-bold text-[#065f46]">A</span>
              </div>
                <div className="ml-3">
                <p className="text-sm font-bold text-[#065f46]">{user?.name ?? 'Administrator'}</p>
                <p className="text-xs font-bold text-[#065f46]">{user?.role ?? 'admin'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-72">
          <div className="flex flex-col h-0 flex-1 glass-container border-r border-white border-opacity-20">
            <div className="flex-1 flex flex-col pt-8 pb-4 overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-center flex-shrink-0 px-4 mb-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-[#065f46]">
                    <LayoutDashboard className="h-6 w-6 text-[#065f46]" />
                  </div>
                  <span className="ml-3 text-2xl font-bold text-[#065f46]">GoSOTRAL</span>
                </div>
              </div>
              <nav className="mt-4 flex-1 px-4 space-y-6">
                {navigationCategories.map((category, idx) => (
                  <div key={idx} className="space-y-3">
                    <h3 className="text-xs font-semibold text-[#065f46] uppercase tracking-wider px-2">
                      {category.category}
                    </h3>
                    <div className="space-y-1">
                      {category.items.map((item) => {
                        const Icon = item.icon;
                        const active = isCurrentPath(item.href);
                        return (
                          <Link
                            key={item.name}
                            to={item.href}
                            className={`group flex items-center px-4 py-3 text-base rounded-xl font-semibold
                              ${active ? 'bg-[#065f46] text-white' : 'text-[#065f46]'}
                            `}
                          >
                            <Icon className={`mr-3 h-5 w-5 ${active ? 'text-white' : 'text-[#065f46]'}`} />
                            {item.name}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </nav>
            </div>
            <div className="flex-shrink-0 border-t border-white border-opacity-20 p-4">
              <div className="flex items-center w-full">
                <div className="w-10 h-10 bg-white border border-[#065f46] rounded-full flex items-center justify-center shadow-md">
                  <span className="text-sm font-bold text-[#065f46]">A</span>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-bold text-[#065f46]">{user?.name ?? 'Administrator'}</p>
                  <p className="text-xs font-bold text-[#065f46]">{user?.role ?? 'admin'}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="btn-secondary p-2 rounded-xl text-secondary-600 hover:text-secondary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                  title="Se déconnecter"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
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
