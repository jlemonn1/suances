import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../common';
import { colors, spacing, typography } from '../../theme';
import { ReservasMetrics } from '../../types/reservas';

interface Props {
  metrics: ReservasMetrics;
}

const metricConfig = [
  { key: 'reservasTotales', label: 'Total Reservas' },
  { key: 'reservasConfirmadas', label: 'Confirmadas' },
  { key: 'reservasPendientes', label: 'Pendientes' },
  { key: 'reservasCanceladas', label: 'Canceladas' },
  { key: 'waitlistSize', label: 'En Espera' },
  { key: 'mesasBloqueadas', label: 'Mesas Bloqueadas' },
] as const;

export const MetricsSummary: React.FC<Props> = ({ metrics }) => {
  return (
    <View style={styles.grid}>
      {metricConfig.map((metric) => (
        <Card key={metric.key} style={styles.card}>
          <Text style={styles.value}>{(metrics as any)[metric.key]}</Text>
          <Text style={styles.label}>{metric.label}</Text>
        </Card>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  card: {
    width: '47%',
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  value: {
    ...typography.h1,
    color: colors.primary,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});
