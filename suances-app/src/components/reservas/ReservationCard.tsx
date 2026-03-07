import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button } from '../common';
import { colors, spacing, typography } from '../../theme';
import { Reserva } from '../../types/reservas';
import { ReservationStatusPill } from './ReservationStatusPill';

interface Props {
  reserva: Reserva;
  mesaLabel?: string;
  onPress?: () => void;
  onCancel?: (reserva: Reserva) => void;
  disabled?: boolean;
}

export const ReservationCard: React.FC<Props> = ({
  reserva,
  mesaLabel,
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
        <View style={styles.metaLeft}>
          {mesaLabel && (
            <View style={styles.metaItem}>
              <Ionicons name="restaurant-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.metaLabel}> {mesaLabel}</Text>
            </View>
          )}
          <View style={styles.metaItem}>
            <Ionicons name="people-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.metaLabel}> {reserva.comensales}</Text>
          </View>
        </View>
        <View style={styles.metaRight}>
          <View style={styles.metaItem}>
            <Ionicons name="call-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.metaLabel}> {reserva.telefono}</Text>
          </View>
        </View>
      </View>

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
  metaLeft: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  metaRight: {
    alignItems: 'flex-end',
  },
  metaLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actions: {
    marginTop: spacing.sm,
  },
});
