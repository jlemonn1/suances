import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Escandallo, EscandalloDetalle } from '../../types/carta';
import { colors, spacing, typography, borderRadius } from '../../theme';

interface EscandalloResumenProps {
  escandallo: Escandallo;
}

export const EscandalloResumen: React.FC<EscandalloResumenProps> = ({ escandallo }) => {
  const renderUnidad = (cantidad: number): string => {
    if (cantidad >= 1000) {
      return `${(cantidad / 1000).toFixed(2)} kg`;
    }
    return `${cantidad.toFixed(0)} g`;
  };

  const formatCoste = (coste: number): string => {
    return `${coste.toFixed(2)} €`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Resumen de Escandallo</Text>
          {escandallo.nombreVersion && (
            <View style={styles.versionBadge}>
              <Text style={styles.versionText}>{escandallo.nombreVersion}</Text>
            </View>
          )}
        </View>
        <View style={styles.totalBadge}>
          <Text style={styles.totalLabel}>Coste Total</Text>
          <Text style={styles.totalValue}>{formatCoste(escandallo.costeTotal)}</Text>
        </View>
      </View>

      <View style={styles.ingredientesContainer}>
        <View style={styles.ingredientesHeader}>
          <Text style={styles.ingredientesTitle}>Ingredientes</Text>
          <Text style={styles.ingredientesCount}>{escandallo.ingredientes.length} items</Text>
        </View>

        <View style={styles.ingredientesList}>
          {escandallo.ingredientes.map((ingrediente: EscandalloDetalle, index: number) => (
            <View 
              key={ingrediente.ingredienteId} 
              style={[
                styles.ingredienteItem,
                index === escandallo.ingredientes.length - 1 && styles.lastItem
              ]}
            >
              <View style={styles.ingredienteInfo}>
                <View style={styles.ingredienteDot} />
                <Text style={styles.ingredienteNombre}>{ingrediente.nombre}</Text>
              </View>
              <View style={styles.ingredienteDatos}>
                <Text style={styles.ingredienteCantidad}>
                  {renderUnidad(ingrediente.cantidad)}
                </Text>
                <Text style={styles.ingredienteCoste}>
                  {formatCoste(ingrediente.coste)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.footerRow}>
          <Text style={styles.footerLabel}>Total ingredientes</Text>
          <Text style={styles.footerValue}>{escandallo.ingredientes.length}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    marginTop: spacing.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    ...typography.h3,
    color: colors.surface,
  },
  versionBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  versionText: {
    ...typography.caption,
    color: colors.surface,
    fontWeight: '600',
  },
  totalBadge: {
    alignItems: 'flex-end',
  },
  totalLabel: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.7)',
  },
  totalValue: {
    ...typography.h2,
    color: colors.accent,
  },
  ingredientesContainer: {
    padding: spacing.md,
  },
  ingredientesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  ingredientesTitle: {
    ...typography.h3,
    color: colors.text,
    fontSize: 16,
  },
  ingredientesCount: {
    ...typography.caption,
    color: colors.textSecondary,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  ingredientesList: {
    gap: 0,
  },
  ingredienteItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  ingredienteInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  ingredienteDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
    marginRight: spacing.sm,
  },
  ingredienteNombre: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  ingredienteDatos: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  ingredienteCantidad: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  ingredienteCoste: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  footer: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  footerValue: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
});
