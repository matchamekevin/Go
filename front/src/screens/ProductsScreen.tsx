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

export default function ProductsScreen() {
  const [products, setProducts] = useState<TicketProduct[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = ['T100', 'T150', 'T200', 'T250', 'T300'];

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
      <Text style={styles.title}>Billets disponibles</Text>
      
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
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginVertical: 20,
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
