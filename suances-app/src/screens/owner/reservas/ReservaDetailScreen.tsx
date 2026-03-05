import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Button } from '../../../components/common';
import { ReservationStatusPill } from '../../../components/reservas';
import { colors, spacing, typography } from '../../../theme';
import { useReservasStore } from '../../../store/reservasStore';

interface Props {
  route: { params: { reservaId: string } };
  navigation: any;
}

export const ReservaDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { reservaId } = route.params;
  const { reservas, cancelReserva } = useReservasStore();
  const reserva = reservas.find((r) => r.id === reservaId);

  if (!reserva) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Reserva no encontrada</Text>
      </View>
    );
  }

  const handleCancel = () => {
    Alert.alert('Cancelar', '¿Deseas cancelar esta reserva?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Cancelar reserva',
        style: 'destructive',
        onPress: async () => {
          await cancelReserva(reserva.id);
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{reserva.nombreCliente}</Text>
      <ReservationStatusPill estado={reserva.estado} style={styles.status} />
      <Text style={styles.meta}>📞 {reserva.telefono}</Text>
      <Text style={styles.meta}>📧 {reserva.email ?? 'sin email'}</Text>
      <Text style={styles.meta}>👥 {reserva.comensales} comensales</Text>
      <Text style={styles.meta}>📅 {reserva.fecha}</Text>
      <Text style={styles.meta}>Origen: {reserva.origen}</Text>
      {reserva.estado !== 'CANCELADA' && (
        <Button title="Cancelar" variant="danger" onPress={handleCancel} style={styles.button} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.text,
  },
  status: {
    marginVertical: spacing.md,
  },
  meta: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  button: {
    marginTop: spacing.xl,
  },
});
