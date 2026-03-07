import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../common';
import { useIngredienteStore } from '../../store/ingredienteStore';
import { colors, spacing, typography, borderRadius } from '../../theme';

interface IngredientesKpiCardProps {
  navigation: any;
}

export const IngredientesKpiCard: React.FC<IngredientesKpiCardProps> = ({ navigation }) => {
  const { ingredientes, fetchIngredientes } = useIngredienteStore();

  useEffect(() => {
    fetchIngredientes(true);
  }, []);

  const ingredientesStockBajo = useMemo(() => {
    return ingredientes
      .filter((i) => i.stockActual < (i.umbralAlerta || 0) && i.stockActual > 0)
      .slice(0, 5);
  }, [ingredientes]);

  const getUnidadLabel = (unidad: string) => {
    switch (unidad) {
      case 'GRAMO':
        return 'g';
      case 'ML':
        return 'ml';
      case 'UNIDAD':
        return 'ud';
      default:
        return '';
    }
  };

  return (
    <Card style={styles.container} onPress={() => navigation.navigate('Ingredientes')}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons name="leaf" size={20} color={colors.warning} />
          <Text style={styles.title}>Ingredientes</Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('IngredienteForm')}
          >
            <Ionicons name="add" size={20} color={colors.accent} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('Ingredientes')}
          >
            <Ionicons name="arrow-forward" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.chipsContainer}
        contentContainerStyle={styles.chipsContent}
      >
        {ingredientesStockBajo.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-circle" size={24} color={colors.success} />
            <Text style={styles.emptyText}>Stock OK</Text>
          </View>
        ) : (
          ingredientesStockBajo.map((ingrediente) => (
            <View key={ingrediente.id} style={styles.chip}>
              <Text style={styles.chipName} numberOfLines={1}>
                {ingrediente.nombre}
              </Text>
              <Text style={styles.chipQuantity}>
                {ingrediente.stockActual}{getUnidadLabel(ingrediente.unidadMedida)}
              </Text>
            </View>
          ))
        )}
      </ScrollView>

      {ingredientesStockBajo.length > 0 && (
        <View style={styles.alertContainer}>
          <Ionicons name="alert-circle" size={14} color={colors.warning} />
          <Text style={styles.alertText}>
            {ingredientesStockBajo.length} ingrediente{ingredientesStockBajo.length !== 1 ? 's' : ''} con stock bajo
          </Text>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    minHeight: 140,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  iconButton: {
    padding: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
  },
  chipsContainer: {
    flex: 1,
  },
  chipsContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    paddingRight: spacing.md,
  },
  chip: {
    backgroundColor: colors.warningLight,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: colors.warning,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  chipName: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '500',
    maxWidth: 100,
  },
  chipQuantity: {
    ...typography.caption,
    color: colors.warning,
    fontWeight: '600',
  },
  emptyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.md,
  },
  emptyText: {
    ...typography.body,
    color: colors.success,
    fontWeight: '500',
  },
  alertContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  alertText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
