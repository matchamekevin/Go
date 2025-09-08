import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Ticket } from '../types/api';
import { TicketService } from '../services/ticketService';

interface TicketCardProps {
  ticket: Ticket;
  showQR?: boolean;
}

export default function TicketCard({ ticket, showQR = false }: TicketCardProps) {
  const getStatusColor = () => {
    switch (ticket.status) {
      case 'unused': return '#28a745';
      case 'used': return '#6c757d';
      case 'expired': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusText = () => {
    switch (ticket.status) {
      case 'unused': return 'Valide';
      case 'used': return 'Utilisé';
      case 'expired': return 'Expiré';
      default: return ticket.status;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.productName}>{ticket.product_name || ticket.product_code}</Text>
          <Text style={styles.ticketCode}>#{ticket.code}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.statusText}>{getStatusText()}</Text>
        </View>
      </View>

      {ticket.route_name && (
        <View style={styles.routeInfo}>
          <Text style={styles.routeName}>{ticket.route_name}</Text>
          <Text style={styles.routeDetails}>
            {ticket.route_start_point} → {ticket.route_end_point}
          </Text>
        </View>
      )}

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Prix:</Text>
          <Text style={styles.detailValue}>
            {ticket.product_price?.toLocaleString()} FCFA
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Voyages:</Text>
          <Text style={styles.detailValue}>{ticket.product_rides}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Acheté le:</Text>
          <Text style={styles.detailValue}>{formatDate(ticket.purchased_at)}</Text>
        </View>

        {ticket.used_at && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Utilisé le:</Text>
            <Text style={styles.detailValue}>{formatDate(ticket.used_at)}</Text>
          </View>
        )}

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Méthode:</Text>
          <Text style={styles.detailValue}>
            {ticket.purchase_method || 'Non spécifiée'}
          </Text>
        </View>
      </View>

      {showQR && ticket.code && ticket.status === 'unused' && (
        <View style={styles.qrContainer}>
          <Text style={styles.qrLabel}>QR Code pour validation:</Text>
          <View style={styles.qrWrapper}>
            <QRCode
              value={JSON.stringify({
                type: 'ticket',
                code: ticket.code,
                user_id: ticket.user_id,
                product_code: ticket.product_code,
                route_code: ticket.route_code,
                issued_at: ticket.purchased_at
              })}
              size={150}
              color="#000000"
              backgroundColor="#ffffff"
            />
          </View>
          <Text style={styles.qrInstructions}>
            Présentez ce QR code au contrôleur pour validation
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  ticketCode: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 12,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  routeInfo: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  routeName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  routeDetails: {
    fontSize: 14,
    color: '#666',
  },
  details: {
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingTop: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '400',
  },
  qrContainer: {
    alignItems: 'center',
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingTop: 16,
  },
  qrLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  qrWrapper: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  qrInstructions: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 16,
  },
});
