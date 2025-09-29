import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Download, Filter } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { ReportService } from '../services/reportService';
import jsPDF from 'jspdf';

interface RevenueData {
  period: string;
  revenue: number;
  tickets_sold: number;
  active_users: number;
  average_price?: number;
}

interface ReportStats {
  total_revenue: number;
  total_tickets: number;
  total_users: number;
  average_ticket_price: number;
  period_revenue: RevenueData[];
  // Propriétés spécifiques aux différents types de rapports
  verified_users?: number;
  active_users?: number;
  used_tickets?: number;
  active_tickets?: number;
  total_routes?: number;
  top_routes?: number;
}

const ReportsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState('30d');
  const [reportType, setReportType] = useState('financial');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ReportStats | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchReportData();
  }, [dateRange, reportType]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const response = await ReportService.getReports({ period: dateRange, type: reportType });
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        setStats(null);
        console.warn('Aucune donnée reçue pour les rapports:', response);
        toast.error('Aucune donnée disponible pour cette période');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des rapports:', error);
      toast.error('Erreur lors du chargement des rapports');
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF', // Code ISO pour Franc CFA
      minimumFractionDigits: 0,
    }).format(amount).replace('XOF', 'FCFA');
  };

  const exportReport = async () => {
    if (!reportRef.current || !stats) {
      toast.error('Aucune donnée à exporter');
      return;
    }

    try {
      toast.loading('Génération du PDF en cours...', { id: 'export-pdf' });

      // Créer un nouveau document PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;

      // Nom de la société
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(6, 84, 70); // Couleur verte SOTRAL
      pdf.text('GoSOTRAL', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      // Sous-titre société
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0); // Couleur noire
      pdf.text('Société de Transport Lomé', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 20;

      // Titre du rapport
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      const title = reportType === 'financial' ? 'Rapport Financier' :
                   reportType === 'users' ? 'Rapport Utilisateurs' :
                   reportType === 'tickets' ? 'Rapport Tickets' : 'Lignes de Transport';
      pdf.text(title, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      // Période
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      const periodText = `Période: ${dateRange === '7d' ? '7 derniers jours' :
                                   dateRange === '30d' ? '30 derniers jours' :
                                   dateRange === '90d' ? '3 derniers mois' : '12 derniers mois'}`;
      pdf.text(periodText, 20, yPosition);
      yPosition += 10;

      // Date de génération
      const now = new Date();
      pdf.text(`Généré le: ${now.toLocaleDateString('fr-FR')} à ${now.toLocaleTimeString('fr-FR')}`, 20, yPosition);
      yPosition += 20;

      // Statistiques principales
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Statistiques Principales', 20, yPosition);
      yPosition += 15;

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');

      if (reportType === 'financial') {
        pdf.text(`Revenus Totaux: ${formatCurrency(stats.total_revenue)}`, 20, yPosition);
        yPosition += 8;
        pdf.text(`Tickets Vendus: ${stats.total_tickets}`, 20, yPosition);
        yPosition += 8;
        pdf.text(`Utilisateurs Actifs: ${stats.total_users}`, 20, yPosition);
        yPosition += 8;
        pdf.text(`Prix Moyen: ${formatCurrency(stats.average_ticket_price)}`, 20, yPosition);
      } else if (reportType === 'users') {
        pdf.text(`Total Utilisateurs: ${stats.total_users}`, 20, yPosition);
        yPosition += 8;
        pdf.text(`Utilisateurs Vérifiés: ${stats.verified_users ?? 0}`, 20, yPosition);
        yPosition += 8;
        pdf.text(`Utilisateurs Actifs: ${stats.active_users ?? 0}`, 20, yPosition);
        yPosition += 8;
        const verificationRate = stats.total_users > 0 ? Math.round(((stats.verified_users ?? 0) / stats.total_users) * 100) : 0;
        pdf.text(`Taux de Vérification: ${verificationRate}%`, 20, yPosition);
      } else if (reportType === 'tickets') {
        pdf.text(`Total Tickets: ${stats.total_tickets}`, 20, yPosition);
        yPosition += 8;
        pdf.text(`Tickets Utilisés: ${stats.used_tickets ?? 0}`, 20, yPosition);
        yPosition += 8;
        pdf.text(`Tickets Actifs: ${stats.active_tickets ?? 0}`, 20, yPosition);
        yPosition += 8;
        const usageRate = stats.total_tickets > 0 ? Math.round(((stats.used_tickets ?? 0) / stats.total_tickets) * 100) : 0;
        pdf.text(`Taux d'Utilisation: ${usageRate}%`, 20, yPosition);
      } else if (reportType === 'routes') {
        pdf.text(`Total Routes: ${stats.total_routes ?? 0}`, 20, yPosition);
        yPosition += 8;
        pdf.text(`Tickets par Routes: ${stats.total_tickets}`, 20, yPosition);
        yPosition += 8;
        pdf.text(`Top Routes: ${stats.top_routes ?? 0}`, 20, yPosition);
        yPosition += 8;
        pdf.text(`Revenus Totaux: ${formatCurrency(stats.total_revenue)}`, 20, yPosition);
      }

      yPosition += 20;

      // Tableau des données
      if (stats.period_revenue && stats.period_revenue.length > 0) {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Détail par Période', 20, yPosition);
        yPosition += 15;

        // En-têtes du tableau
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        let xPosition = 20;

        if (reportType === 'routes') {
          pdf.text('Route', xPosition, yPosition);
          xPosition += 40;
          pdf.text('Tickets', xPosition, yPosition);
          xPosition += 30;
          pdf.text('Revenus', xPosition, yPosition);
          xPosition += 40;
          pdf.text('Classement', xPosition, yPosition);
        } else {
          pdf.text('Date', xPosition, yPosition);
          xPosition += 35;

          if (reportType === 'financial') {
            pdf.text('Revenus', xPosition, yPosition);
            xPosition += 35;
            pdf.text('Tickets', xPosition, yPosition);
            xPosition += 30;
            pdf.text('Utilisateurs', xPosition, yPosition);
            xPosition += 35;
            pdf.text('Prix Moyen', xPosition, yPosition);
          } else if (reportType === 'users') {
            pdf.text('Nouveaux', xPosition, yPosition);
            xPosition += 30;
            pdf.text('Vérifiés', xPosition, yPosition);
            xPosition += 30;
            pdf.text('Actifs', xPosition, yPosition);
          } else if (reportType === 'tickets') {
            pdf.text('Total', xPosition, yPosition);
            xPosition += 25;
            pdf.text('Utilisés', xPosition, yPosition);
            xPosition += 30;
            pdf.text('Actifs', xPosition, yPosition);
            xPosition += 25;
            pdf.text('Revenus', xPosition, yPosition);
          }
        }

        yPosition += 8;

        // Lignes du tableau
        pdf.setFont('helvetica', 'normal');
        stats.period_revenue.forEach((item) => {
          if (yPosition > pageHeight - 30) {
            pdf.addPage();
            yPosition = 20;
          }

          xPosition = 20;

          if (reportType === 'routes') {
            pdf.text(item.period, xPosition, yPosition);
            xPosition += 40;
            pdf.text(item.tickets_sold.toString(), xPosition, yPosition);
            xPosition += 30;
            pdf.text(formatCurrency(item.revenue), xPosition, yPosition);
            xPosition += 40;
            pdf.text(`#${item.active_users}`, xPosition, yPosition);
          } else {
            pdf.text(new Date(item.period).toLocaleDateString('fr-FR'), xPosition, yPosition);
            xPosition += 35;

            if (reportType === 'financial') {
              pdf.text(formatCurrency(item.revenue), xPosition, yPosition);
              xPosition += 35;
              pdf.text(item.tickets_sold.toString(), xPosition, yPosition);
              xPosition += 30;
              pdf.text(item.active_users.toString(), xPosition, yPosition);
              xPosition += 35;
              pdf.text(formatCurrency(item.average_price ?? 0), xPosition, yPosition);
            } else if (reportType === 'users') {
              pdf.text(item.tickets_sold.toString(), xPosition, yPosition);
              xPosition += 30;
              pdf.text(item.active_users.toString(), xPosition, yPosition);
              xPosition += 30;
              pdf.text(item.active_users.toString(), xPosition, yPosition);
            } else if (reportType === 'tickets') {
              pdf.text(item.tickets_sold.toString(), xPosition, yPosition);
              xPosition += 25;
              pdf.text(item.tickets_sold.toString(), xPosition, yPosition);
              xPosition += 30;
              pdf.text(item.active_users.toString(), xPosition, yPosition);
              xPosition += 25;
              pdf.text(formatCurrency(item.revenue), xPosition, yPosition);
            }
          }

          yPosition += 6;
        });
      }

      // Générer le nom du fichier
      const fileName = `${title.toLowerCase().replace(/\s+/g, '_')}_${dateRange}_${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2,'0')}${now.getDate().toString().padStart(2,'0')}.pdf`;

      // Télécharger le PDF
      pdf.save(fileName);

      toast.success('PDF exporté avec succès !', { id: 'export-pdf' });
    } catch (error) {
      console.error('Erreur lors de l\'export PDF:', error);
      toast.error('Erreur lors de l\'export du PDF', { id: 'export-pdf' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#065f46]"></div>
        <span className="ml-2 text-gray-600">Chargement des rapports...</span>
      </div>
    );
  }

  return (
    <div ref={reportRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {reportType === 'financial' && 'Rapports Financiers'}
              {reportType === 'users' && 'Rapports Utilisateurs'}
              {reportType === 'tickets' && 'Rapports Tickets'}
              {reportType === 'routes' && 'Lignes de Transport'}
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              {reportType === 'financial' && 'Analysez les performances financières et les métriques de votre plateforme'}
              {reportType === 'users' && 'Suivez l\'évolution des utilisateurs et leur engagement'}
              {reportType === 'tickets' && 'Analysez les ventes de tickets et leur utilisation'}
              {reportType === 'routes' && 'Évaluez les performances des différentes lignes de transport'}
            </p>
          </div>
          <button 
            onClick={exportReport}
            className="flex items-center px-4 py-2 bg-[#065f46] text-white rounded-lg hover:bg-[#10b981] transition-colors"
          >
            <Download className="h-5 w-5 mr-2" />
            Exporter PDF
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="mb-6 bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-400" />
            <select 
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#065f46]"
            >
              <option value="7d">7 derniers jours</option>
              <option value="30d">30 derniers jours</option>
              <option value="90d">3 derniers mois</option>
              <option value="1y">12 derniers mois</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select 
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#065f46]"
            >
              <option value="financial">Rapport Financier</option>
              <option value="users">Rapport Utilisateurs</option>
              <option value="tickets">Rapport Tickets</option>
              <option value="routes">Lignes de Transport</option>
            </select>
          </div>
        </div>
      </div>


      {/* Tableau détaillé */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {reportType === 'financial' && 'Détail par Période - Financier'}
            {reportType === 'users' && 'Détail par Période - Utilisateurs'}
            {reportType === 'tickets' && 'Détail par Période - Tickets'}
            {reportType === 'routes' && 'Top Lignes de Transport par Performances'}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {reportType === 'routes' ? (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Route
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tickets Vendus
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenus (FCFA)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Classement
                    </th>
                  </>
                ) : (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    {reportType === 'financial' && (
                      <>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Revenus (FCFA)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tickets Vendus
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Utilisateurs Actifs
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Prix Moyen
                        </th>
                      </>
                    )}
                    {reportType === 'users' && (
                      <>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nouveaux Utilisateurs
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Utilisateurs Vérifiés
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Utilisateurs Actifs
                        </th>
                      </>
                    )}
                    {reportType === 'tickets' && (
                      <>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Tickets
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tickets Utilisés
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tickets Actifs
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Revenus (FCFA)
                        </th>
                      </>
                    )}
                  </>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats?.period_revenue && stats.period_revenue.length > 0 ? (
                // LES DONNÉES DU TABLEAU PROVIENNENT DIRECTEMENT DE LA BASE DE DONNÉES VIA LE BACKEND
                stats.period_revenue.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    {reportType === 'routes' ? (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.period}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.tickets_sold}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(item.revenue)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          #{item.active_users}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(item.period).toLocaleDateString('fr-FR')}
                        </td>
                        {reportType === 'financial' && (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {formatCurrency(item.revenue)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.tickets_sold}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.active_users}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatCurrency(item.average_price ?? 0)}
                            </td>
                          </>
                        )}
                        {reportType === 'users' && (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.tickets_sold}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.active_users}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.active_users}
                            </td>
                          </>
                        )}
                        {reportType === 'tickets' && (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.tickets_sold}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.tickets_sold}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.active_users}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {formatCurrency(item.revenue)}
                            </td>
                          </>
                        )}
                      </>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={reportType === 'routes' ? 4 : 5} className="px-6 py-8 text-center text-sm text-gray-500">
                    Aucune donnée disponible pour cette période
                  </td>
                </tr>
              )}

              {/* Ligne de total */}
              {stats?.period_revenue && stats.period_revenue.length > 0 && reportType === 'financial' && (
                <tr className="bg-gray-50 border-t-2 border-gray-300">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    Total
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    {formatCurrency(stats.period_revenue.reduce((sum, item) => sum + item.revenue, 0))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    {stats.period_revenue.reduce((sum, item) => sum + item.tickets_sold, 0)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    {stats.period_revenue.reduce((sum, item) => sum + item.active_users, 0)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    {formatCurrency(
                      stats.period_revenue.length > 0
                        ? Math.round(stats.period_revenue.reduce((sum, item) => sum + (item.average_price ?? 0), 0) / stats.period_revenue.length)
                        : 0
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;