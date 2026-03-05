import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, RefreshControl, Alert, TouchableOpacity } from 'react-native';
import { AgendaFiltersBar, MetricsSummary, ReservationCard } from '../../../components/reservas';
import { Button, Loading, EmptyState } from '../../../components/common';
import { colors, spacing, typography } from '../../../theme';
import { useReservasStore } from '../../../store/reservasStore';
import { Reserva } from '../../../types/reservas';

interface Props {
  navigation: any;
}

export const ReservasHomeScreen: React.FC<Props> = ({ navigation }) => {
  const {
    reservas,
    franjas,
    salas,
    mesasBySala,
    agendaFilters,
    loading,
    fetchFranjas,
    fetchReservas,
    setAgendaFilters,
    fetchSalas,
    fetchMesas,
    cancelReserva,
    getMetrics,
  } = useReservasStore();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchFranjas();
    fetchSalas();
  }, []);

  useEffect(() => {
    fetchReservas({ fecha: agendaFilters.fecha });
  }, [agendaFilters.fecha]);

  useEffect(() => {
    salas.forEach((sala) => {
      if (!mesasBySala[sala.id]) {
        fetchMesas(sala.id);
      }
    });
  }, [salas]);

  const franjasMap = useMemo(() => {
    const map: Record<string, string> = {};
    franjas.forEach((franja) => {
      map[franja.id] = `${franja.nombre} ${franja.horaInicio}-${franja.horaFin}`;
    });
    return map;
  }, [franjas]);

  const mesasMap = useMemo(() => {
    const map: Record<string, { numero: number; salaName?: string }> = {};
    Object.values(mesasBySala).forEach((mesas) => {
      mesas.forEach((mesa) => {
        map[mesa.id] = { numero: mesa.numero };
      });
    });
    return map;
  }, [mesasBySala]);

  const filteredReservas = useMemo(() => {
    if (!agendaFilters.franjaId) return reservas;
    return reservas.filter((reserva) => reserva.franjaId === agendaFilters.franjaId);
  }, [reservas, agendaFilters.franjaId]);

  const metrics = getMetrics();

  const handleCancel = (reserva: Reserva) => {
    Alert.alert('Cancelar reserva', `¿Seguro de cancelar a ${reserva.nombreCliente}?`, [
      { text: 'No', style: 'cancel' },
      {
        text: 'Sí, cancelar',
        style: 'destructive',
        onPress: () => cancelReserva(reserva.id),
      },
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchReservas();
    setRefreshing(false);
  };

  if (loading.reservas && reservas.length === 0) {
    return <Loading fullScreen message="Cargando reservas..." />;
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Reservas & Sala</Text>
          <Text style={styles.subtitle}>Controla tu capacidad en tiempo real</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Waitlist')}>
          <Text style={styles.link}>Lista de espera →</Text>
        </TouchableOpacity>
      </View>

      <MetricsSummary metrics={metrics} />

      <AgendaFiltersBar
        fecha={agendaFilters.fecha}
        franjas={franjas}
        selectedFranjaId={agendaFilters.franjaId}
        onChangeFecha={(fecha) => setAgendaFilters({ fecha })}
        onSelectFranja={(franjaId) => {
          setAgendaFilters({ franjaId });
          fetchReservas({ franjaId });
        }}
        onRefresh={onRefresh}
      />

      <View style={styles.quickActions}>
        <Button title="Nueva reserva" onPress={() => navigation.navigate('ReservaEditor')} />
        <Button
          title="Reservas online"
          variant="secondary"
          onPress={() => navigation.navigate('ReservasOnline')}
        />
        <Button
          title="Configurar salas"
          variant="outline"
          onPress={() => navigation.navigate('Espacios')}
        />
        <Button
          title="Franjas horarias"
          variant="outline"
          onPress={() => navigation.navigate('Franjas')}
        />
      </View>

      {filteredReservas.length === 0 && (
        <EmptyState
          title="Sin reservas"
          message="No hay reservas para los filtros actuales"
          actionLabel="Crear reserva"
          onAction={() => navigation.navigate('ReservaEditor')}
        />
      )}

      {filteredReservas.map((reserva) => (
        <ReservationCard
          key={reserva.id}
          reserva={reserva}
          franjaLabel={franjasMap[reserva.franjaId]}
          mesaLabel={mesasMap[reserva.mesaId] ? `Mesa ${mesasMap[reserva.mesaId].numero}` : undefined}
          onPress={() => navigation.navigate('ReservaDetail', { reservaId: reserva.id })}
          onCancel={handleCancel}
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.text,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  link: {
    ...typography.bodySmall,
    color: colors.accent,
  },
  quickActions: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
});
