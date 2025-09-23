import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Ticket,
  Package,
  Settings,
  LogOut,
  X,
  FileText,
  PieChart,
  MessageSquare,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '../hooks/useNavigation';

interface SidebarProps {
  isMobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

const iconMap = {
  LayoutDashboard,
  Users,
  CreditCard,
  Ticket,
  Package,
  Settings,
  FileText,
  PieChart,
  MessageSquare,
  HelpCircle,
};

const Sidebar: React.FC<SidebarProps> = ({ isMobile = false, isOpen = true, onClose }) => {
  const { user, logout } = useAuth();
  const { isCurrentPath, navigationCategories } = useNavigation();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const sidebarContent = (
    <>
      {/* Header */}
      <div className="flex items-center justify-center flex-shrink-0 px-4 mb-6">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-[#065f46]">
            <LayoutDashboard className="h-6 w-6 text-[#065f46]" />
          </div>
          <span className="ml-3 text-2xl font-bold text-[#065f46]">GoSOTRAL</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-4 flex-1 px-4 space-y-6">
        {navigationCategories.map((category, idx) => (
          <div key={idx} className="space-y-3">
            <h3 className="text-xs font-semibold text-[#065f46] uppercase tracking-wider px-2">
              {category.category}
            </h3>
            <div className="space-y-1">
              {category.items.map((item) => {
                const Icon = iconMap[item.iconName as keyof typeof iconMap] || LayoutDashboard;
                const active = isCurrentPath(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-4 py-3 text-base rounded-xl font-semibold
                      ${active ? 'bg-[#065f46] text-white' : 'text-[#065f46]'}
                    `}
                    onClick={isMobile ? onClose : undefined}
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

      {/* Footer */}
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
    </>
  );

  if (isMobile) {
    return (
      <div className={`fixed inset-0 flex z-40 md:hidden ${isOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black bg-opacity-75" onClick={onClose} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full glass-container">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={onClose}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto custom-scrollbar">
            {sidebarContent}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-72">
      <div className="flex flex-col h-0 flex-1 glass-container border-r border-white border-opacity-20">
        <div className="flex-1 flex flex-col pt-8 pb-4 overflow-y-auto custom-scrollbar">
          {sidebarContent}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;