import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { IngredienteResponse } from '../../types/ingrediente';
import { colors, spacing, typography } from '../../theme';
import { Card } from '../common/Card';

interface IngredienteItemProps {
  ingrediente: IngredienteResponse;
  onPress?: () => void;
}

export const IngredienteItem: React.FC<IngredienteItemProps> = ({
  ingrediente,
  onPress,
}) => {
  const isLowStock = ingrediente.stockActual <= ingrediente.umbralAlerta;

  const getUnidadLabel = (unidad: string) => {
    switch (unidad) {
      case 'GRAMO': return 'g';
      case 'ML': return 'ml';
      case 'UNIDAD': return 'u';
      default: return '';
    }
  };

  return (
    <Card style={styles.card} onPress={onPress}>
      <View style={styles.container}>
        <View style={styles.info}>
          <Text style={styles.nombre}>{ingrediente.nombre}</Text>
          <Text style={styles.precio}>
            {ingrediente.precioPorUnidad.toFixed(4)}€/{getUnidadLabel(ingrediente.unidadMedida)}
          </Text>
          {ingrediente.categoria && (
            <Text style={styles.categoria}>{ingrediente.categoria.nombre}</Text>
          )}
        </View>
        <View style={styles.stockContainer}>
          <Text style={[styles.stock, isLowStock && styles.stockLow]}>
            {ingrediente.stockActual} {getUnidadLabel(ingrediente.unidadMedida)}
          </Text>
          <Text style={styles.umbral}>
            Alerta: {ingrediente.umbralAlerta}
          </Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  info: {
    flex: 1,
  },
  nombre: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  precio: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  categoria: {
    ...typography.caption,
    color: colors.primary,
    marginTop: 2,
  },
  stockContainer: {
    alignItems: 'flex-end',
  },
  stock: {
    ...typography.body,
    fontWeight: '600',
    color: colors.success,
  },
  stockLow: {
    color: colors.error,
  },
  umbral: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
