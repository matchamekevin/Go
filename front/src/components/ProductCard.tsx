import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TicketProduct } from '../types/api';
import Button from './Button';

interface ProductCardProps {
  product: TicketProduct;
  onPurchase: (product: TicketProduct) => void;
  disabled?: boolean;
}

export default function ProductCard({ product, onPurchase, disabled = false }: ProductCardProps) {
  const handlePurchase = () => {
    onPurchase(product);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.code}>{product.code}</Text>
      </View>
      
      <View style={styles.details}>
        <Text style={styles.price}>{product.price.toLocaleString()} FCFA</Text>
        <Text style={styles.rides}>
          {product.rides} voyage{product.rides > 1 ? 's' : ''}
        </Text>
      </View>

      <View style={styles.footer}>
        <Button
          title="Acheter"
          onPress={handlePurchase}
          disabled={disabled || !product.is_active}
          size="small"
        />
      </View>

      {!product.is_active && (
        <View style={styles.inactiveOverlay}>
          <Text style={styles.inactiveText}>Indisponible</Text>
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
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
  },
  code: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: '#007AFF',
  },
  rides: {
    fontSize: 14,
    color: '#666',
  },
  footer: {
    alignItems: 'flex-end',
  },
  inactiveOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inactiveText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
