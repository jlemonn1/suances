import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { PlatoResponse } from '../../types/plato';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { Card } from '../common/Card';

interface PlatoCardProps {
  plato: PlatoResponse;
  onPress?: () => void;
  showDetails?: boolean;
}

export const PlatoCard: React.FC<PlatoCardProps> = ({
  plato,
  onPress,
  showDetails = true,
}) => {
  const imageUrl = plato.imagenes?.[0]?.url;

  return (
    <Card style={styles.card} onPress={onPress}>
      <View style={styles.container}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>🍽</Text>
          </View>
        )}
        <View style={styles.content}>
          <Text style={styles.nombre} numberOfLines={1}>
            {plato.nombre}
          </Text>
          {plato.categoria && (
            <Text style={styles.categoria}>{plato.categoria.nombre}</Text>
          )}
          {showDetails && plato.descripcion && (
            <Text style={styles.descripcion} numberOfLines={2}>
              {plato.descripcion}
            </Text>
          )}
          <View style={styles.footer}>
            <Text style={styles.precio}>{plato.precioVenta.toFixed(2)}€</Text>
            {showDetails && (
              <Text style={styles.contador}>📊 {plato.contadorPedidos}</Text>
            )}
          </View>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.sm,
  },
  container: {
    flexDirection: 'row',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderText: {
    fontSize: 32,
  },
  content: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'space-between',
  },
  nombre: {
    ...typography.h3,
    fontSize: 16,
    color: colors.text,
  },
  categoria: {
    ...typography.caption,
    color: colors.primary,
    marginTop: 2,
  },
  descripcion: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  precio: {
    ...typography.body,
    fontWeight: '600',
    color: colors.accent,
  },
  contador: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
