import { useLocation } from 'react-router-dom';

export const useNavigation = () => {
  const location = useLocation();

  const isCurrentPath = (path: string) => {
    return location.pathname === path;
  };

  const navigationCategories = [
    {
      category: "Général",
      items: [
        { name: 'Tableau de bord', href: '/dashboard', iconName: 'LayoutDashboard' },
        { name: 'Utilisateurs', href: '/users', iconName: 'Users' },
        { name: 'Rapports', href: '/reports', iconName: 'FileText' },
      ]
    },
    {
      category: "Transport",
      items: [
        { name: 'SOTRAL', href: '/sotral', iconName: 'Ticket' },
        { name: 'Tickets', href: '/tickets', iconName: 'Ticket' },
      ]
    },
    {
      category: "Finance",
      items: [
        { name: 'Statistiques', href: '/statistics', iconName: 'PieChart' },
      ]
    },
    {
      category: "Support",
      items: [
        { name: 'Aide', href: '/help', iconName: 'HelpCircle' },
        { name: 'Paramètres', href: '/settings', iconName: 'Settings' },
      ]
    }
  ];

  return {
    isCurrentPath,
    navigationCategories
  };
};