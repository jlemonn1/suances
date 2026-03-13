import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useReservasStore } from '../../store/reservasStore';

const parseMinutes = (time: string): number => {
  if (!time) return 0;
  const [hour, minute] = time.split(':');
  return Number(hour) * 60 + Number(minute);
};

const formatHora = (hora: string): string => hora.substring(0, 5);

interface ReservationEntry {
  id: string;
  mesaNumber?: number;
  nombre: string;
  comensales: number;
}

interface ReservationGroup {
  salaName: string;
  entries: ReservationEntry[];
}

const getToday = (): string => new Date().toISOString().split('T')[0];

const ReservationSummary: React.FC = () => {
  const {
    reservas,
    franjas,
    salas,
    mesasBySala,
    agendaFilters,
    fetchReservas,
    fetchFranjas,
    fetchSalas,
    fetchMesas,
  } = useReservasStore();

  useEffect(() => {
    fetchSalas();
    fetchFranjas();
  }, [fetchSalas, fetchFranjas]);

  useEffect(() => {
    salas.forEach((sala) => {
      if (!mesasBySala[sala.id]) {
        fetchMesas(sala.id);
      }
    });
  }, [salas, mesasBySala, fetchMesas]);

  useEffect(() => {
    const fecha = agendaFilters.fecha || getToday();
    fetchReservas({ fecha });
  }, [agendaFilters.fecha, fetchReservas]);

  const sortedFranjas = useMemo(
    () => [...franjas].sort((a, b) => a.horaInicio.localeCompare(b.horaInicio)),
    [franjas]
  );

  const currentMinutes = useMemo(() => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  }, []);

  const currentFranjaIndex = useMemo(() => {
    return sortedFranjas.findIndex((franja) => {
      const start = parseMinutes(franja.horaInicio);
      const end = parseMinutes(franja.horaFin);
      return currentMinutes >= start && currentMinutes < end;
    });
  }, [sortedFranjas, currentMinutes]);

  const currentFranja = sortedFranjas[currentFranjaIndex >= 0 ? currentFranjaIndex : 0];
  const nextFranjaIndex = sortedFranjas.length
    ? currentFranjaIndex >= 0
      ? (currentFranjaIndex + 1) % sortedFranjas.length
      : 0
    : -1;
  const nextFranja = nextFranjaIndex >= 0 ? sortedFranjas[nextFranjaIndex] : undefined;

  const mesaLookup = useMemo(() => {
    const map: Record<string, { numero?: number; salaName: string }> = {};
    Object.entries(mesasBySala).forEach(([salaId, mesas]) => {
      const salaName = salas.find((s) => s.id === salaId)?.nombre || 'Sala';
      mesas.forEach((mesa) => {
        map[mesa.id] = { numero: mesa.numero, salaName };
      });
    });
    return map;
  }, [mesasBySala, salas]);

  const filterByFranja = (franjaId?: string) => {
    if (!franjaId) return [];
    const fecha = agendaFilters.fecha || getToday();
    return reservas.filter((reserva) => {
      return (
        reserva.fecha === fecha &&
        reserva.franjaId === franjaId &&
        reserva.estado !== 'CANCELADA'
      );
    });
  };

  const groupBySala = (franjaId?: string) => {
    const items = filterByFranja(franjaId);
    const map: Record<string, { salaName: string; entries: ReservationEntry[] }> = {};
    items.forEach((reserva) => {
      const mesa = mesaLookup[reserva.mesaId];
      const salaKey = mesa?.salaName || 'Sin sala';
      if (!map[salaKey]) {
        map[salaKey] = { salaName: salaKey, entries: [] };
      }
      map[salaKey].entries.push({
        id: reserva.id,
        mesaNumber: mesa?.numero,
        nombre: reserva.nombreCliente,
        comensales: reserva.comensales,
      });
    });
    return Object.values(map);
  };

  const currentGroups = useMemo(() => groupBySala(currentFranja?.id), [currentFranja?.id, reservas, mesaLookup, agendaFilters.fecha]);
  const nextGroups = useMemo(() => groupBySala(nextFranja?.id), [nextFranja?.id, reservas, mesaLookup, agendaFilters.fecha]);
  const hasNextFranja = nextFranja && nextFranja.id !== currentFranja?.id;

  return (
    <View style={styles.summaryContainer}>
      <View style={styles.summaryInner}>
        <FranjaSection label="Franja actual" franja={currentFranja} groups={currentGroups} />
        {hasNextFranja ? (
          <FranjaSection label="Siguiente franja" franja={nextFranja} groups={nextGroups} topBorder />
        ) : (
          <Text style={styles.infoText}>No hay siguiente franja definida para hoy.</Text>
        )}
      </View>
    </View>
  );
};

const FranjaSection: React.FC<{
  label: string;
  franja?: { nombre: string; horaInicio: string; horaFin: string };
  groups: ReservationGroup[];
  topBorder?: boolean;
}> = ({ label, franja, groups, topBorder }) => (
  <View style={[styles.sectionWrapper, topBorder && styles.sectionDivider]}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <View style={styles.sectionMeta}>            
        <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
        <Text style={styles.sectionTime}>
          {franja ? `${franja.nombre} · ${formatHora(franja.horaInicio)} - ${formatHora(
            franja.horaFin
          )}` : 'Horario pendiente'}
        </Text>
      </View>
    </View>
    {groups.length === 0 ? (
      <Text style={styles.emptyText}>Sin reservas para esta franja.</Text>
    ) : (
      groups.map((group) => (
        <View style={styles.groupCard} key={group.salaName}>
          <Text style={styles.groupTitle}>{group.salaName}</Text>
  <View style={styles.groupGrid}>
    {group.entries.map((entry) => (
        <View style={styles.entryCard} key={entry.id}>
          <Text style={styles.entryLine} numberOfLines={1}>
            Mesa {entry.mesaNumber ?? '—'} · {entry.comensales} personas · {entry.nombre}
          </Text>
        </View>
    ))}
  </View>
        </View>
      ))
    )}
  </View>
);

const styles = StyleSheet.create({
  summaryContainer: {
    width: '100%',
    marginBottom: spacing.md,
  },
  summaryInner: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
    overflow: 'hidden',
  },
  sectionWrapper: {
    paddingVertical: spacing.sm,
  },
  sectionDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionLabel: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.text,
  },
  sectionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTime: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  emptyText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  groupCard: {
    marginBottom: spacing.sm,
  },
  groupTitle: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  groupGrid: {
    flexDirection: 'column',
    gap: spacing.sm,
  },
  entryCard: {
    width: '100%',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    backgroundColor: '#fff',
    padding: spacing.sm,
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  entryLine: {
    ...typography.bodySmall,
    color: colors.text,
  },
  entryMesa: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  entryName: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.text,
  },
  entryPeople: {
    ...typography.caption,
    color: colors.accent,
  },
  infoText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});

export { ReservationSummary };
