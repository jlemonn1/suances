import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card, Button } from '../common';
import { colors, spacing, typography } from '../../theme';
import { WaitlistEntry, WaitlistEstado } from '../../types/reservas';

interface Props {
  entry: WaitlistEntry;
  franjaLabel?: string;
  onUpdateEstado?: (entry: WaitlistEntry, next: WaitlistEstado) => void;
  onConvert?: (entry: WaitlistEntry) => void;
}

const estadoLabels: Record<WaitlistEstado, string> = {
  WAITING: 'En espera',
  NOTIFIED: 'Notificado',
  CONFIRMED: 'Confirmado',
  CANCELLED: 'Cancelado',
};

export const WaitlistEntryCard: React.FC<Props> = ({ entry, franjaLabel, onUpdateEstado, onConvert }) => {
  const canNotify = entry.estado === 'WAITING';
  const canConfirm = entry.estado === 'NOTIFIED';
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{entry.nombreCliente}</Text>
        <Text style={styles.estado}>{estadoLabels[entry.estado]}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.meta}>📞 {entry.telefono}</Text>
        <Text style={styles.meta}>👥 {entry.comensales}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.meta}>🎯 Prioridad {entry.prioridad}</Text>
        {franjaLabel && <Text style={styles.meta}>⏱ {franjaLabel}</Text>}
      </View>

      <View style={styles.actions}>
        {canNotify && onUpdateEstado && (
          <Button
            title="Notificar"
            size="small"
            variant="secondary"
            onPress={() => onUpdateEstado(entry, 'NOTIFIED')}
            style={styles.actionButton}
          />
        )}
        {canConfirm && onUpdateEstado && (
          <Button
            title="Confirmar"
            size="small"
            onPress={() => onUpdateEstado(entry, 'CONFIRMED')}
            style={styles.actionButton}
          />
        )}
        {onConvert && (
          <Button
            title="Crear Reserva"
            size="small"
            variant="outline"
            onPress={() => onConvert(entry)}
          />
        )}
      </View>
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
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  estado: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  meta: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  actionButton: {
    flexBasis: '45%',
  },
});
