import React, { useEffect, useMemo, useState, useRef } from 'react';
import { ScrollView, View, Text, StyleSheet, RefreshControl, Alert, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AgendaFiltersBar, ReservationCard, QuickActionsBar } from '../../../components/reservas';
import { Loading, EmptyState } from '../../../components/common';
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
  const [searchQuery, setSearchQuery] = useState('');
  const scrollY = useRef(new Animated.Value(0)).current;

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

  const formatHora = (hora: string): string => {
    return hora.substring(0, 5);
  };

  const franjasMap = useMemo(() => {
    const map: Record<string, { nombre: string; horaInicio: string; horaFin: string }> = {};
    franjas.forEach((franja) => {
      const horaInicio = formatHora(franja.horaInicio);
      const horaFin = formatHora(franja.horaFin);
      map[franja.id] = { 
        nombre: franja.nombre, 
        horaInicio: formatHora(franja.horaInicio),
        horaFin: formatHora(franja.horaFin)
      };
    });
    return map;
  }, [franjas]);

  const sortedFranjas = useMemo(() => {
    return [...franjas].sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
  }, [franjas]);

  const mesasMap = useMemo(() => {
    const map: Record<string, { numero: number; salaName?: string }> = {};
    Object.entries(mesasBySala).forEach(([salaId, mesas]) => {
      const sala = salas.find((s) => s.id === salaId);
      const salaName = sala?.nombre || 'Sala';
      mesas.forEach((mesa) => {
        map[mesa.id] = { numero: mesa.numero, salaName };
      });
    });
    return map;
  }, [mesasBySala, salas]);

  const filteredReservas = useMemo(() => {
    let filtered = reservas;
    
    // Filtrar por fecha seleccionada
    if (agendaFilters.fecha) {
      filtered = filtered.filter((reserva) => reserva.fecha === agendaFilters.fecha);
    }
    
    // Filtrar por franja seleccionada
    if (agendaFilters.franjaId) {
      filtered = filtered.filter((reserva) => reserva.franjaId === agendaFilters.franjaId);
    }
    
    // Filtrar por búsqueda (nombre o teléfono)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((reserva) => 
        reserva.nombreCliente.toLowerCase().includes(query) ||
        reserva.telefono.toLowerCase().includes(query)
      );
    }
    
    // Ordenar: canceladas al final
    return [...filtered].sort((a, b) => {
      const aIsCancelled = a.estado === 'CANCELADA';
      const bIsCancelled = b.estado === 'CANCELADA';
      if (aIsCancelled && !bIsCancelled) return 1;
      if (!aIsCancelled && bIsCancelled) return -1;
      return 0;
    });
  }, [reservas, agendaFilters.fecha, agendaFilters.franjaId, searchQuery]);

  const groupedReservas = useMemo(() => {
    const grouped: Record<string, Reserva[]> = {};
    
    filteredReservas.forEach((reserva) => {
      const franjaId = reserva.franjaId || 'sin-franja';
      if (!grouped[franjaId]) {
        grouped[franjaId] = [];
      }
      grouped[franjaId].push(reserva);
    });

    Object.keys(grouped).forEach((franjaId) => {
      grouped[franjaId].sort((a, b) => {
        const aIsCancelled = a.estado === 'CANCELADA';
        const bIsCancelled = b.estado === 'CANCELADA';
        if (aIsCancelled && !bIsCancelled) return 1;
        if (!aIsCancelled && bIsCancelled) return -1;
        
        const aMesa = mesasMap[a.mesaId];
        const bMesa = mesasMap[b.mesaId];
        const aSalaName = aMesa?.salaName || '';
        const bSalaName = bMesa?.salaName || '';
        const salaCompare = aSalaName.localeCompare(bSalaName);
        if (salaCompare !== 0) return salaCompare;
        
        return (aMesa?.numero || 0) - (bMesa?.numero || 0);
      });
    });

    return grouped;
  }, [filteredReservas, mesasMap]);

  const renderFranjaGroup = (franjaId: string) => {
    const reservas = groupedReservas[franjaId];
    if (!reservas || reservas.length === 0) return null;

    const franja = franjasMap[franjaId];
    const horaLabel = franja ? `${franja.horaInicio} - ${franja.horaFin}` : 'Sin horario';

    return (
      <View key={franjaId} style={styles.franjaGroup}>
        <View style={styles.franjaHeader}>
          <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.franjaHeaderText}>{horaLabel}</Text>
        </View>
        {reservas.map((reserva) => (
          <ReservationCard
            key={reserva.id}
            reserva={reserva}
            mesaLabel={mesasMap[reserva.mesaId] ? `${mesasMap[reserva.mesaId].salaName} - Mesa ${mesasMap[reserva.mesaId].numero}` : undefined}
            onPress={() => navigation.navigate('ReservaDetail', { reservaId: reserva.id })}
            onCancel={handleCancel}
          />
        ))}
      </View>
    );
  };

  const metrics = useMemo(() => {
    return {
      reservasTotales: filteredReservas.length,
      reservasConfirmadas: filteredReservas.filter(r => r.estado === 'CONFIRMADA').length,
      reservasPendientes: filteredReservas.filter(r => r.estado === 'PENDIENTE').length,
      reservasCanceladas: filteredReservas.filter(r => r.estado === 'CANCELADA').length,
      waitlistSize: 0, // No aplicamos búsqueda a waitlist
      mesasBloqueadas: 0,
    };
  }, [filteredReservas]);

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
    <View style={styles.container}>
      <QuickActionsBar
        onNuevaReserva={() => navigation.navigate('ReservaEditor')}
        onReservasOnline={() => navigation.navigate('ReservasOnline')}
        onSalas={() => navigation.navigate('Espacios')}
        onFranjas={() => navigation.navigate('Franjas')}
        scrollY={scrollY}
        fecha={agendaFilters.fecha}
        onChangeFecha={(fecha) => setAgendaFilters({ fecha })}
        onSearch={setSearchQuery}
        total={metrics.reservasTotales}
        confirmadas={metrics.reservasConfirmadas}
        canceladas={metrics.reservasCanceladas}
        espera={metrics.waitlistSize}
      />
      <Animated.ScrollView
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.scrollContent}
      >
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

      {filteredReservas.length === 0 && (
        <EmptyState
          title="Sin reservas"
          message="No hay reservas para los filtros actuales"
          actionLabel="Crear reserva"
          onAction={() => navigation.navigate('ReservaEditor')}
        />
      )}

      {agendaFilters.franjaId ? (
        renderFranjaGroup(agendaFilters.franjaId)
      ) : (
        sortedFranjas.map((franja) => renderFranjaGroup(franja.id))
      )}
    </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    opacity: 0.5,
  },
  dividerWithMargin: {
    marginBottom: spacing.sm,
  },
  franjaGroup: {
    marginBottom: spacing.md,
  },
  franjaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    marginBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  franjaHeaderText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
    fontWeight: '600',
  },
});
