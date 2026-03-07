import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../theme';
import { ReservasMetrics } from '../../types/reservas';

interface Props {
  metrics: ReservasMetrics;
}

export const MetricsSummary: React.FC<Props> = ({ metrics }) => {
  return (
    <View style={styles.row}>
      <Text style={styles.text}>
        Total: {metrics.reservasTotales} · Confirmadas: {metrics.reservasConfirmadas} · Canceladas: {metrics.reservasCanceladas} · Espera: {metrics.waitlistSize}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    marginBottom: spacing.md,
  },
  text: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
