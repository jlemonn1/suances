import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useIngredienteStore } from '../../store/ingredienteStore';
import { usePlatoStore } from '../../store/platoStore';

const AlertPanel: React.FC = () => {
  const { stockBajoAlertas, stockCriticoAlertas, fetchIngredientes } = useIngredienteStore();
  const { platosAgotados, fetchPlatos } = usePlatoStore();

  useEffect(() => {
    fetchIngredientes(true);
    fetchPlatos(true);
  }, [fetchIngredientes, fetchPlatos]);

  const ingredientAlerts = useMemo(() => {
    const criticos = stockCriticoAlertas.map((ingrediente) => ({
      id: ingrediente.id,
      label: ingrediente.nombre,
      detail: `Stock: ${ingrediente.stockActual} · Umbral: ${ingrediente.umbralAlerta}`,
      level: 'critico' as const,
    }));

    const bajos = stockBajoAlertas.map((ingrediente) => ({
      id: ingrediente.id,
      label: ingrediente.nombre,
      detail: `Stock: ${ingrediente.stockActual} · Umbral: ${ingrediente.umbralAlerta}`,
      level: 'bajo' as const,
    }));

    return [...criticos, ...bajos].slice(0, 3);
  }, [stockBajoAlertas, stockCriticoAlertas]);

  const dishAlerts = useMemo(() => {
    return platosAgotados.slice(0, 3).map((plato) => {
      const ingredientNames = plato.ingredientesBajos?.map((ing) => ing.nombre) || [];
      const detailText = ingredientNames.length
        ? `${ingredientNames.slice(0, 3).join(', ')}${ingredientNames.length > 3 ? '...' : ''}`
        : 'Sin ingredientes comprometidos';

      return {
        id: plato.id,
        label: plato.nombre,
        detail: detailText,
        level: 'plato' as const,
      };
    });
  }, [platosAgotados]);

  const totalAlerts = ingredientAlerts.length + dishAlerts.length;

  return (
    <View style={styles.panelWrapper}>
      <View style={styles.curveLayer} />
      <View style={styles.panel}>
        <View style={styles.headerRow}> 
          <View>
            <Text style={styles.title}>Alertas en tiempo real</Text>
            <Text style={styles.subtitle}>Actualizado vía SSE y datos en vivo</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{totalAlerts} pendientes</Text>
          </View>
        </View>

        <View style={styles.listRow}>
          <AlertList
            title="Ingredientes"
            items={ingredientAlerts}
            accent={colors.stockLow}
            fallback="Todo en rango saludable"
          />
          <AlertList
            title="Platos"
            items={dishAlerts}
            accent={colors.lavender}
            fallback="Sin platos críticos"
          />
        </View>
      </View>
    </View>
  );
};

interface AlertItemProps {
  id: string;
  label: string;
  detail: string;
  level: 'critico' | 'bajo' | 'plato';
}

const AlertItem: React.FC<AlertItemProps> = ({ label, detail, level }) => {
  const ringColor =
    level === 'critico' ? colors.error : level === 'bajo' ? colors.stockLow : colors.lavender;

  return (
    <View style={styles.alertItem}>
      <View style={[styles.dot, { backgroundColor: ringColor }]} />
      <View style={styles.alertText}>
        <Text style={styles.alertLabel}>{label}</Text>
        <Text style={styles.alertDetail}>{detail}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
    </View>
  );
};

interface AlertListProps {
  title: string;
  items: AlertItemProps[];
  accent: string;
  fallback: string;
}

const AlertList: React.FC<AlertListProps> = ({ title, items, accent, fallback }) => {
  return (
    <View style={styles.listCard}>
      <Text style={[styles.listTitle, { color: accent }]}>{title}</Text>
      {items.length === 0 ? (
        <Text style={styles.emptyText}>{fallback}</Text>
      ) : (
        items.map((item) => (
        <AlertItem
          key={`${title}-${item.id}`}
          label={item.label}
          detail={item.detail}
          level={item.level}
        />
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  panel: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    paddingTop: spacing.lg * 1.5,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
  },
  panelWrapper: {
    borderRadius: borderRadius.xl,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    marginBottom: spacing.md,
    marginTop: spacing.xs,
  },
  curveLayer: {
    position: 'absolute',
    top: -20,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: colors.primaryLight,
    borderRadius: 70,
    transform: [{ scaleX: 1.4 }],
    pointerEvents: 'none',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h3,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  badge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  badgeText: {
    ...typography.caption,
    color: colors.surface,
    fontWeight: '600',
  },
  listRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  listCard: {
    flex: 1,
    backgroundColor: '#f8f5ff',
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(148, 126, 255, 0.2)',
  },
  listTitle: {
    ...typography.bodySmall,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  alertText: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  alertLabel: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.text,
  },
  alertDetail: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export { AlertPanel };
