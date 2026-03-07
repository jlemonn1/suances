import React, { useEffect, useMemo } from 'react';
import { ScrollView, View, Text, StyleSheet, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ReservationCard, MetricsSummary } from '../../../components/reservas';
import { Button, EmptyState } from '../../../components/common';
import { colors, spacing, typography } from '../../../theme';
import { useReservasStore } from '../../../store/reservasStore';

export const ReservasOnlineScreen = ({ navigation }: any) => {
  const {
    reservas,
    franjas,
    disponibilidad,
    agendaFilters,
    fetchReservas,
    fetchFranjas,
    fetchDisponibilidad,
    cancelReserva,
  } = useReservasStore();

  useEffect(() => {
    fetchFranjas();
    fetchReservas({ fecha: agendaFilters.fecha });
    fetchDisponibilidad(agendaFilters.fecha);
  }, []);

  const onlineReservas = reservas.filter((r) => r.origen === 'ONLINE');
  const pending = onlineReservas.filter((r) => r.estado === 'PENDIENTE');

  const refresh = () => {
    fetchReservas({ fecha: agendaFilters.fecha });
    fetchDisponibilidad(agendaFilters.fecha);
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={false} onRefresh={refresh} />}
    >
      <Text style={styles.title}>Reservas Online</Text>
      <Text style={styles.subtitle}>Visibilidad de peticiones web</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Disponibilidad por franja</Text>
        {disponibilidad.length === 0 ? (
          <EmptyState
            title="Sin datos"
            message="Consulta disponibilidad para ver el estado"
            actionLabel="Actualizar"
            onAction={refresh}
          />
        ) : (
          disponibilidad.map((slot) => {
            const franja = franjas.find((f) => f.id === slot.franjaId);
            return (
              <View key={slot.franjaId} style={styles.availabilityCard}>
                <Text style={styles.availabilityTitle}>{franja?.nombre ?? slot.franjaId}</Text>
                <Text style={styles.availabilityMeta}>{slot.mesasDisponibles} mesas libres</Text>
                <Text style={styles.availabilityMeta}>{slot.capacidadTotal} plazas</Text>
              </View>
            );
          })
        )}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Pendientes</Text>
        <Button title="Nueva manual" size="small" onPress={() => navigation.navigate('ReservaEditor')} />
      </View>

      {pending.length === 0 ? (
        <EmptyState title="Sin pendientes" message="No hay reservas online pendientes" />
      ) : (
        pending.map((reserva) => (
          <ReservationCard
            key={reserva.id}
            reserva={reserva}
            onPress={() => navigation.navigate('ReservaDetail', { reservaId: reserva.id })}
            onCancel={(item) => cancelReserva(item.id)}
          />
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  title: {
    ...typography.h1,
    color: colors.text,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.text,
  },
  availabilityCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: spacing.md,
    marginBottom: spacing.sm,
  },
  availabilityTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  availabilityMeta: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
