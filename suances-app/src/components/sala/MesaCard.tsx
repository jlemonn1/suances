import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MesaOperativa, MesaEstadoOperativo } from '../../types/sala';
import { colors, spacing, borderRadius, typography } from '../../theme';

interface MesaCardProps {
  mesa: MesaOperativa;
  onPress: () => void;
}

const getEstadoColor = (estado: MesaEstadoOperativo, tieneComanda: boolean): string => {
  switch (estado) {
    case 'LIBRE':
      return colors.success;
    case 'OCUPADA':
      return colors.warning;
    case 'RESERVADA':
      return tieneComanda ? colors.warning : colors.primary;
    case 'BLOQUEADA':
      return colors.error;
    case 'MANTENIMIENTO':
      return colors.disabled;
    default:
      return colors.textSecondary;
  }
};

const getEstadoIcon = (estado: MesaEstadoOperativo): keyof typeof Ionicons.glyphMap => {
  switch (estado) {
    case 'LIBRE':
      return 'checkmark-circle';
    case 'OCUPADA':
      return 'time';
    case 'RESERVADA':
      return 'calendar';
    case 'BLOQUEADA':
      return 'close-circle';
    case 'MANTENIMIENTO':
      return 'construct';
    default:
      return 'help-circle';
  }
};

export const MesaCard: React.FC<MesaCardProps> = ({ mesa, onPress }) => {
  const estadoColor = getEstadoColor(mesa.estadoOperativo, !!mesa.comandaActivaId);
  const estadoIcon = getEstadoIcon(mesa.estadoOperativo);

  return (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: estadoColor }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={styles.numero}>Mesa {mesa.numero}</Text>
        <View style={[styles.estadoBadge, { backgroundColor: estadoColor }]}>
          <Ionicons name={estadoIcon} size={12} color={colors.surface} />
        </View>
      </View>

      <Text style={styles.sala}>{mesa.nombreSala}</Text>

      {mesa.estadoOperativo === 'OCUPADA' && (
        <View style={styles.infoContainer}>
          {mesa.codigoComanda && (
            <Text style={styles.codigoComanda}>{mesa.codigoComanda}</Text>
          )}
          {mesa.nombreCamarero && (
            <Text style={styles.camarero}>{mesa.nombreCamarero}</Text>
          )}
          {mesa.totalComandaActual !== undefined && (
            <Text style={styles.total}>{mesa.totalComandaActual.toFixed(2)}€</Text>
          )}
          {mesa.numeroComensales && (
            <Text style={styles.comensales}>
              <Ionicons name="people" size={12} color={colors.textSecondary} />{' '}
              {mesa.numeroComensales}
            </Text>
          )}
          {mesa.tiempoOcupadaMinutos !== undefined && (
            <Text style={styles.tiempo}>
              <Ionicons name="time-outline" size={12} color={colors.textSecondary} />{' '}
              {mesa.tiempoOcupadaMinutos}m
            </Text>
          )}
        </View>
      )}

      {mesa.estadoOperativo === 'RESERVADA' && mesa.nombreClienteReserva && (
        <View style={styles.infoContainer}>
          <Text style={styles.reserva}>
            <Ionicons name="person" size={12} color={colors.textSecondary} />{' '}
            {mesa.nombreClienteReserva}
          </Text>
        </View>
      )}

      {mesa.estadoOperativo === 'LIBRE' && (
        <View style={styles.infoContainer}>
          <Text style={styles.capacidad}>
            <Ionicons name="people-outline" size={12} color={colors.textSecondary} />{' '}
            Capacidad: {mesa.capacidad}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 150,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  numero: {
    ...typography.h3,
    fontSize: 18,
    color: colors.text,
  },
  estadoBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sala: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  infoContainer: {
    marginTop: spacing.sm,
  },
  codigoComanda: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.accent,
  },
  camarero: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  total: {
    ...typography.body,
    fontWeight: '600',
    color: colors.success,
  },
  comensales: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  tiempo: {
    ...typography.caption,
    color: colors.warning,
    marginTop: 2,
  },
  reserva: {
    ...typography.bodySmall,
    color: colors.text,
  },
  capacidad: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
