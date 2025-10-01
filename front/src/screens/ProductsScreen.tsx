import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { TicketProduct, Route } from '../types/api';
import { TicketService } from '../services/ticketService';
import ProductCard from '../components/ProductCard';
import Button from '../components/Button';
import { useSotralRealtime } from '../hooks/useSotralRealtime';

export default function ProductsScreen() {
  const [products, setProducts] = useState<TicketProduct[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = ['T100', 'T150', 'T200', 'T250', 'T300'];

  // Hook pour la synchronisation temps réel
  const { isConnected } = useSotralRealtime({
    baseUrl: 'http://192.168.1.100:3000', // À adapter selon votre configuration réseau
    clientId: 'mobile_products_screen',
    onLineCreated: (data) => {
      console.log('🚌 Line created in realtime:', data);
      // Recharger les données quand une ligne est créée
      loadData();
    },
    onLineUpdated: (data) => {
      console.log('🚌 Line updated in realtime:', data);
      // Recharger les données quand une ligne est modifiée
      loadData();
    },
    onLineDeleted: (data) => {
      console.log('🚌 Line deleted in realtime:', data);
      // Recharger les données quand une ligne est supprimée
      loadData();
    },
    onAnyEvent: (event) => {
      console.log('📱 Realtime event in products screen:', event);
    }
  });

  const loadData = async () => {
    try {
      const [productsData, routesData] = await Promise.all([
        TicketService.getAllProducts(),
        TicketService.getAllRoutes(),
      ]);
      setProducts(productsData);
      setRoutes(routesData);
    } catch (error) {
      Alert.alert(
        'Erreur',
        error instanceof Error ? error.message : 'Erreur lors du chargement des données'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadRoutesByCategory = async (category: string) => {
    try {
      setLoading(true);
      const routesData = await TicketService.getRoutesByCategory(category);
      setRoutes(routesData);
      setSelectedCategory(category);
    } catch (error) {
      Alert.alert(
        'Erreur',
        error instanceof Error ? error.message : 'Erreur lors du chargement des trajets'
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = (product: TicketProduct) => {
    // Ici, on naviguerait vers l'écran d'achat ou on ouvrirait un modal
    Alert.alert(
      'Achat de ticket',
      `Vous souhaitez acheter: ${product.name}\nPrix: ${product.price.toLocaleString()} FCFA`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Continuer', 
          onPress: () => {
            // TODO: Naviguer vers l'écran d'achat
            console.log('Purchase product:', product);
          }
        },
      ]
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    setSelectedCategory(null);
    loadData();
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Chargement des produits...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Billets disponibles</Text>
        <View style={styles.realtimeIndicator}>
          <View style={[styles.realtimeDot, { backgroundColor: isConnected ? '#4CAF50' : '#FF9800' }]} />
          <Text style={styles.realtimeText}>
            {isConnected ? 'Synchronisation active' : 'Synchronisation hors ligne'}
          </Text>
        </View>
      </View>
      
      {/* Filtres par catégorie */}
      <View style={styles.categoryContainer}>
        <Button
          title="Tous les trajets"
          onPress={() => {
            setSelectedCategory(null);
            loadData();
          }}
          variant={selectedCategory === null ? 'primary' : 'secondary'}
          size="small"
        />
        {categories.map((category) => (
          <Button
            key={category}
            title={category}
            onPress={() => loadRoutesByCategory(category)}
            variant={selectedCategory === category ? 'primary' : 'secondary'}
            size="small"
          />
        ))}
      </View>

      {/* Liste des produits */}
      <FlatList
        data={products.filter(p => p.is_active)}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPurchase={handlePurchase}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007AFF']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucun produit disponible</Text>
          </View>
        }
        contentContainerStyle={styles.listContainer}
      />

      {/* Info trajets */}
      {routes.length > 0 && (
        <View style={styles.routesInfo}>
          <Text style={styles.routesTitle}>
            {selectedCategory ? `Trajets ${selectedCategory}` : 'Tous les trajets'} 
            ({routes.length})
          </Text>
          <Text style={styles.routesSubtitle}>
            Trajets disponibles pour vos billets
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginVertical: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
  },
  realtimeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  realtimeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  realtimeText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  listContainer: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  routesInfo: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  routesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  routesSubtitle: {
    fontSize: 14,
    color: '#666',
  },
});
