import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import { SotralMobileService } from '../services/sotral-service';

interface GeneratedTicket {
  id: number;
  ticket_code: string;
  qr_code: string;
  line_id?: number;
  line_name?: string;
  price_paid_fcfa: number;
  status: string;
  expires_at?: string;
  trips_remaining: number;
  created_at: string;
}

export default function TestTicketsScreen() {
  const [tickets, setTickets] = useState<GeneratedTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);

  useEffect(() => {
    loadGeneratedTickets();
  }, []);

  const loadGeneratedTickets = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await SotralMobileService.getGeneratedTickets();
      if (response.success && response.data) {
        setTickets(response.data);
      } else {
        setError('Erreur lors du chargement des tickets');
      }
    } catch (err) {
      console.error('Erreur chargement tickets:', err);
      setError('Impossible de charger les tickets. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
    }
  };

  const renderTicket = (ticket: GeneratedTicket) => {
    const isSelected = selectedTicket === ticket.ticket_code;
    const statusColor = getStatusColor(ticket.status);

    return (
      <TouchableOpacity
        key={ticket.id}
        style={[styles.ticketCard, isSelected && styles.selectedTicket]}
        onPress={() => setSelectedTicket(isSelected ? null : ticket.ticket_code)}
      >
        {/* En-tête du ticket */}
        <View style={styles.ticketHeader}>
          <View style={styles.ticketInfo}>
            <Text style={styles.ticketCode}>{ticket.ticket_code}</Text>
            {ticket.line_name && (
              <Text style={styles.lineName}>{ticket.line_name}</Text>
            )}
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{getStatusLabel(ticket.status)}</Text>
          </View>
        </View>

        {/* Détails */}
        <View style={styles.ticketDetails}>
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Ionicons name="cash" size={16} color="#666" />
              <Text style={styles.detailValue}>{ticket.price_paid_fcfa} FCFA</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="refresh" size={16} color="#666" />
              <Text style={styles.detailValue}>{ticket.trips_remaining} trajet{ticket.trips_remaining > 1 ? 's' : ''}</Text>
            </View>
          </View>

          {ticket.expires_at && (
            <View style={styles.detailRow}>
              <View style={styles.detailItem}>
                <Ionicons name="time" size={16} color="#666" />
                <Text style={styles.detailValue}>
                  Expire: {new Date(ticket.expires_at).toLocaleString('fr-FR')}
                </Text>
              </View>
            </View>
          )}

          <Text style={styles.createdAt}>
            Créé le {new Date(ticket.created_at).toLocaleString('fr-FR')}
          </Text>
        </View>

        {/* QR Code (affiché seulement si sélectionné) */}
        {isSelected && (
          <View style={styles.qrContainer}>
            <QRCode
              value={ticket.qr_code}
              size={120}
              color="#000"
              backgroundColor="#fff"
            />
            <Text style={styles.qrText}>Présentez ce QR code</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'active': return 'Actif';
      case 'used': return 'Utilisé';
      case 'expired': return 'Expiré';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active': return '#10B981';
      case 'used': return '#6B7280';
      case 'expired': return '#EF4444';
      case 'cancelled': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3F51B5" />
          <Text style={styles.loadingText}>Chargement des tickets générés...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadGeneratedTickets}>
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tickets Générés par l'Admin</Text>
        <TouchableOpacity onPress={loadGeneratedTickets} style={styles.refreshButton}>
          <Ionicons name="refresh" size={24} color="#3F51B5" />
        </TouchableOpacity>
      </View>

      {tickets.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="ticket-outline" size={64} color="#CCC" />
          <Text style={styles.emptyText}>Aucun ticket généré trouvé.</Text>
          <Text style={styles.emptySubtext}>
            Les tickets générés par l'administrateur apparaîtront ici.
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <Text style={styles.totalText}>
            {tickets.length} ticket{tickets.length > 1 ? 's' : ''} généré{tickets.length > 1 ? 's' : ''}
          </Text>

          {tickets.map(renderTicket)}

          <View style={styles.spacer} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#3F51B5',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  refreshButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 20,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 10,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
    padding: 15,
  },
  totalText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
  },
  ticketCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedTicket: {
    borderWidth: 2,
    borderColor: '#3F51B5',
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  ticketInfo: {
    flex: 1,
  },
  ticketCode: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'monospace',
  },
  lineName: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  ticketDetails: {
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  createdAt: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 5,
  },
  qrContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9F9F9',
    padding: 20,
    borderRadius: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  qrText: {
    marginTop: 10,
    fontSize: 12,
    color: '#666',
  },
  spacer: {
    height: 30,
  },
});
