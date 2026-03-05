import React, { useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, Alert } from 'react-native';
import { AgendaFiltersBar, WaitlistEntryCard } from '../../../components/reservas';
import { colors, spacing, typography } from '../../../theme';
import { useReservasStore } from '../../../store/reservasStore';
import { WaitlistEntry, WaitlistEstado } from '../../../types/reservas';

export const WaitlistScreen = ({ navigation }: any) => {
  const {
    waitlist,
    franjas,
    agendaFilters,
    setAgendaFilters,
    fetchWaitlist,
    fetchFranjas,
    updateWaitlistEstado,
  } = useReservasStore();

  useEffect(() => {
    fetchFranjas();
  }, []);

  useEffect(() => {
    if (agendaFilters.franjaId) {
      fetchWaitlist();
    }
  }, [agendaFilters.fecha, agendaFilters.franjaId]);

  const handleEstado = async (entry: WaitlistEntry, estado: WaitlistEstado) => {
    await updateWaitlistEstado(entry.id, estado);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Lista de espera</Text>
      <AgendaFiltersBar
        fecha={agendaFilters.fecha}
        franjas={franjas}
        selectedFranjaId={agendaFilters.franjaId}
        onChangeFecha={(fecha) => setAgendaFilters({ fecha })}
        onSelectFranja={(franjaId) => setAgendaFilters({ franjaId })}
        onRefresh={() => fetchWaitlist()}
      />

      {(!agendaFilters.franjaId || waitlist.length === 0) && (
        <Text style={styles.helper}>Selecciona una franja para ver la cola.</Text>
      )}

      {waitlist.map((entry) => (
        <WaitlistEntryCard
          key={entry.id}
          entry={entry}
          onUpdateEstado={handleEstado}
          onConvert={(item) =>
            navigation.navigate('ReservaEditor', {
              waitlistEntry: item,
            })
          }
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
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.md,
  },
  helper: {
    ...typography.body,
    color: colors.textSecondary,
    marginVertical: spacing.md,
  },
});
