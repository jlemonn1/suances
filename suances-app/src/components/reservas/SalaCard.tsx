import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../common';
import { colors, spacing, typography } from '../../theme';
import { Sala } from '../../types/reservas';

interface Props {
  sala: Sala;
  totalMesas?: number;
  mesasVisibles?: number;
  capacidad?: number;
  onPress?: () => void;
}

export const SalaCard: React.FC<Props> = ({ sala, totalMesas, mesasVisibles, capacidad, onPress }) => {
  return (
    <Card style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.title}>{sala.nombre}</Text>
        <Text style={[styles.badge, sala.activa ? styles.badgeActive : styles.badgeInactive]}>
          {sala.activa ? 'Activa' : 'Inactiva'}
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.meta}>Mesas: {totalMesas ?? '-'}</Text>
        <Text style={styles.meta}>Visibles: {mesasVisibles ?? '-'}</Text>
      </View>
      <Text style={styles.meta}>Capacidad: {capacidad ?? sala.capacidadMaxima ?? '-'}</Text>
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
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.lg,
    ...typography.caption,
    fontWeight: '600',
  },
  badgeActive: {
    backgroundColor: colors.successLight,
    color: colors.success,
  },
  badgeInactive: {
    backgroundColor: colors.errorLight,
    color: colors.error,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  meta: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
