import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, typography, spacing } from '../../theme';
import { ReservaEstado } from '../../types/reservas';

interface Props {
  estado: ReservaEstado;
  style?: ViewStyle;
}

const statusColors: Record<ReservaEstado, { background: string; color: string; label: string }> = {
  PENDIENTE: {
    background: '#fff3e0',
    color: colors.warning,
    label: 'Pendiente',
  },
  CONFIRMADA: {
    background: colors.successLight,
    color: colors.success,
    label: 'Confirmada',
  },
  CANCELADA: {
    background: colors.errorLight,
    color: colors.error,
    label: 'Cancelada',
  },
  NO_SHOW: {
    background: '#fdecea',
    color: colors.error,
    label: 'No Show',
  },
  FINALIZADA: {
    background: '#e0f7fa',
    color: colors.primary,
    label: 'Finalizada',
  },
};

export const ReservationStatusPill: React.FC<Props> = ({ estado, style }) => {
  const config = statusColors[estado];
  return (
    <View style={[styles.pill, { backgroundColor: config.background }, style]}>
      <Text style={[styles.label, { color: config.color }]}>{config.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.lg,
    alignSelf: 'flex-start',
  },
  label: {
    ...typography.caption,
    fontWeight: '600',
  },
});
