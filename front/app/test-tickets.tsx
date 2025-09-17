import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { theme } from '../src/styles/theme';
import { TicketService } from '../src/services/ticketService';
import type { TicketProduct, Route, Ticket } from '../src/types/api';

export default function TestTicketsScreen() {
  const [products, setProducts] = useState<TicketProduct[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [myTickets, setMyTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [testUserId, setTestUserId] = useState('1');

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await TicketService.getAllProducts();
      setProducts(data);
      Alert.alert('Succès', `${data.length} produits chargés`);
    } catch (error: any) {
      Alert.alert('Erreur Products', error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadRoutes = async () => {
    setLoading(true);
    try {
      const data = await TicketService.getAllRoutes();
      setRoutes(data);
      Alert.alert('Succès', `${data.length} trajets chargés`);
    } catch (error: any) {
      Alert.alert('Erreur Routes', error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadMyTickets = async () => {
    setLoading(true);
    try {
      const data = await TicketService.getMyTickets();
      setMyTickets(data);
      Alert.alert('Succès', `${data.length} tickets trouvés`);
    } catch (error: any) {
      Alert.alert('Erreur My Tickets', error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadUserTicketsById = async () => {
    if (!testUserId) {
      Alert.alert('Erreur', 'Veuillez saisir un ID utilisateur');
      return;
    }
    setLoading(true);
    try {
      const data = await TicketService.getUserTicketsById(parseInt(testUserId));
      Alert.alert('Succès', `${data.length} tickets trouvés pour l'utilisateur ${testUserId}`);
    } catch (error: any) {
      Alert.alert('Erreur User Tickets', error.message);
    } finally {
      setLoading(false);
    }
  };

  const testPurchase = async () => {
    if (products.length === 0 || routes.length === 0) {
      Alert.alert('Erreur', 'Veuillez d\'abord charger les produits et trajets');
      return;
    }

    setLoading(true);
    try {
      const purchase = {
        product_code: products[0].code,
        route_code: routes[0].code,
        quantity: 1,
        purchase_method: 'mobile_money' as const,
        payment_details: { external_id: `TEST_${Date.now()}` }
      };
      
      const ticket = await TicketService.purchaseTicket(purchase);
      Alert.alert('Achat réussi', `Ticket créé: ${ticket.code}`);
      loadMyTickets(); // Recharger mes tickets
    } catch (error: any) {
      Alert.alert('Erreur Purchase', error.message);
    } finally {
      setLoading(false);
    }
  };

  const testValidation = async () => {
    if (myTickets.length === 0) {
      Alert.alert('Erreur', 'Aucun ticket à valider. Achetez d\'abord un ticket.');
      return;
    }

    const ticketCode = myTickets[0].code;
    if (!ticketCode) {
      Alert.alert('Erreur', 'Code ticket invalide');
      return;
    }

    setLoading(true);
    try {
      const validation = {
        ticket_code: ticketCode,
      };
      
      const result = await TicketService.validateTicket(validation);
      Alert.alert('Validation réussie', JSON.stringify(result, null, 2));
    } catch (error: any) {
      Alert.alert('Erreur Validation', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.primary[600]} />
        </TouchableOpacity>
        <Text style={styles.title}>Test Tickets Service</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tests de base</Text>
          
          <TouchableOpacity style={styles.testButton} onPress={loadProducts} disabled={loading}>
            <Ionicons name="pricetag" size={20} color={theme.colors.white} />
            <Text style={styles.buttonText}>Charger Products ({products.length})</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.testButton} onPress={loadRoutes} disabled={loading}>
            <Ionicons name="map" size={20} color={theme.colors.white} />
            <Text style={styles.buttonText}>Charger Routes ({routes.length})</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.testButton} onPress={loadMyTickets} disabled={loading}>
            <Ionicons name="ticket" size={20} color={theme.colors.white} />
            <Text style={styles.buttonText}>Mes Tickets ({myTickets.length})</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tests utilisateur spécifique</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>User ID à tester:</Text>
            <TextInput
              style={styles.input}
              value={testUserId}
              onChangeText={setTestUserId}
              keyboardType="numeric"
              placeholder="1"
            />
          </View>

          <TouchableOpacity style={styles.testButton} onPress={loadUserTicketsById} disabled={loading}>
            <Ionicons name="person" size={20} color={theme.colors.white} />
            <Text style={styles.buttonText}>Tickets User #{testUserId}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tests avancés</Text>
          
          <TouchableOpacity 
            style={[styles.testButton, { backgroundColor: theme.colors.success[600] }]} 
            onPress={testPurchase} 
            disabled={loading}
          >
            <Ionicons name="card" size={20} color={theme.colors.white} />
            <Text style={styles.buttonText}>Test Purchase</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.testButton, { backgroundColor: theme.colors.warning[600] }]} 
            onPress={testValidation} 
            disabled={loading}
          >
            <Ionicons name="checkmark-circle" size={20} color={theme.colors.white} />
            <Text style={styles.buttonText}>Test Validation</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Données chargées</Text>
          
          {products.length > 0 && (
            <View style={styles.dataBox}>
              <Text style={styles.dataTitle}>Products ({products.length}):</Text>
              {products.slice(0, 3).map((product, i) => (
                <Text key={i} style={styles.dataItem}>
                  • {product.name} - {product.price} FCFA
                </Text>
              ))}
              {products.length > 3 && <Text style={styles.dataItem}>... et {products.length - 3} autres</Text>}
            </View>
          )}

          {routes.length > 0 && (
            <View style={styles.dataBox}>
              <Text style={styles.dataTitle}>Routes ({routes.length}):</Text>
              {routes.slice(0, 3).map((route, i) => (
                <Text key={i} style={styles.dataItem}>
                  • {route.start_point} → {route.end_point} ({route.price_category})
                </Text>
              ))}
              {routes.length > 3 && <Text style={styles.dataItem}>... et {routes.length - 3} autres</Text>}
            </View>
          )}

          {myTickets.length > 0 && (
            <View style={styles.dataBox}>
              <Text style={styles.dataTitle}>Mes Tickets ({myTickets.length}):</Text>
              {myTickets.slice(0, 3).map((ticket, i) => (
                <Text key={i} style={styles.dataItem}>
                  • {ticket.code} - {ticket.status}
                </Text>
              ))}
              {myTickets.length > 3 && <Text style={styles.dataItem}>... et {myTickets.length - 3} autres</Text>}
            </View>
          )}
        </View>
      </ScrollView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.colors.primary[600]} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.secondary[50],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.secondary[200],
    backgroundColor: theme.colors.white,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.secondary[900],
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.secondary[900],
    marginBottom: 12,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary[600],
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  buttonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.secondary[900],
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.secondary[300],
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: theme.colors.white,
  },
  dataBox: {
    backgroundColor: theme.colors.white,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary[600],
  },
  dataTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.secondary[900],
    marginBottom: 4,
  },
  dataItem: {
    fontSize: 12,
    color: theme.colors.secondary[600],
    marginBottom: 2,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
