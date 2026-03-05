import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card, Button } from '../common';
import { colors, spacing, typography } from '../../theme';
import { Reserva } from '../../types/reservas';
import { ReservationStatusPill } from './ReservationStatusPill';

interface Props {
  reserva: Reserva;
  mesaLabel?: string;
  franjaLabel?: string;
  onPress?: () => void;
  onCancel?: (reserva: Reserva) => void;
  disabled?: boolean;
}

export const ReservationCard: React.FC<Props> = ({
  reserva,
  mesaLabel,
  franjaLabel,
  onPress,
  onCancel,
  disabled,
}) => {
  const canCancel = reserva.estado !== 'CANCELADA' && reserva.estado !== 'FINALIZADA';

  return (
    <Card style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.title}>{reserva.nombreCliente}</Text>
        <ReservationStatusPill estado={reserva.estado} />
      </View>
      <View style={styles.metaRow}>
        <Text style={styles.metaLabel}>📅 {reserva.fecha}</Text>
        {franjaLabel && <Text style={styles.metaLabel}>⏱ {franjaLabel}</Text>}
      </View>
      <View style={styles.metaRow}>
        {mesaLabel && <Text style={styles.metaLabel}>🪑 {mesaLabel}</Text>}
        <Text style={styles.metaLabel}>👥 {reserva.comensales}</Text>
      </View>
      <Text style={styles.metaLabel}>📞 {reserva.telefono}</Text>

      {canCancel && onCancel && (
        <View style={styles.actions}>
          <Button
            title="Cancelar"
            variant="outline"
            size="small"
            onPress={() => onCancel(reserva)}
            disabled={disabled}
          />
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.h3,
    color: colors.text,
    flex: 1,
    marginRight: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  metaLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  actions: {
    marginTop: spacing.sm,
  },
});
