import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../../components/common';
import { ReservationStatusPill } from '../../../components/reservas';
import { colors, spacing, typography, borderRadius } from '../../../theme';
import { useReservasStore } from '../../../store/reservasStore';

interface Props {
  route: { params: { reservaId: string } };
  navigation: any;
}

interface InfoItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  color?: string;
}

const InfoItem: React.FC<InfoItemProps> = ({ icon, label, value, color }) => (
  <View style={styles.infoItem}>
    <Ionicons name={icon} size={20} color={color || colors.textSecondary} style={styles.infoIcon} />
    <View style={styles.infoContent}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, color && { color }]}>{value}</Text>
    </View>
  </View>
);

interface SectionProps {
  title: string;
  icon?: keyof typeof Ionicons.glyphMap;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, icon, children }) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      {icon && <Ionicons name={icon} size={18} color={colors.accent} style={styles.sectionIcon} />}
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    <View style={styles.sectionContent}>{children}</View>
  </View>
);

export const ReservaDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { reservaId } = route.params;
  const { reservas, franjas, salas, mesasBySala, cancelReserva, fetchSalas, fetchFranjas } = useReservasStore();
  
  useEffect(() => {
    fetchSalas();
    fetchFranjas();
  }, []);

  const reserva = reservas.find((r) => r.id === reservaId);

  const reservaInfo = useMemo(() => {
    if (!reserva) return null;
    
    const franja = franjas.find(f => f.id === reserva.franjaId);
    let mesaInfo: { numero: number; salaNombre: string } | null = null;
    
    for (const salaId in mesasBySala) {
      const mesa = mesasBySala[salaId].find(m => m.id === reserva.mesaId);
      if (mesa) {
        const sala = salas.find(s => s.id === salaId);
        mesaInfo = { numero: mesa.numero, salaNombre: sala?.nombre || 'Sala' };
        break;
      }
    }
    
    return { franja, mesaInfo };
  }, [reserva, franjas, salas, mesasBySala]);

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

  const formatHora = (hora: string) => hora?.substring(0, 5) || '';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{reserva.nombreCliente}</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => navigation.navigate('ReservaEditor', { reservaId: reserva.id })}
            >
              <Ionicons name="create-outline" size={20} color={colors.accent} />
            </TouchableOpacity>
            {reserva.estado !== 'CANCELADA' && reserva.estado !== 'FINALIZADA' && (
              <TouchableOpacity 
                style={[styles.iconButton, styles.deleteButton]}
                onPress={handleCancel}
              >
                <Ionicons name="trash-outline" size={20} color={colors.error} />
              </TouchableOpacity>
            )}
          </View>
        </View>
        <View style={styles.statusRow}>
          <ReservationStatusPill estado={reserva.estado} />
        </View>
      </View>

      <Section title="Datos del Cliente" icon="person">
        <InfoItem 
          icon="call-outline" 
          label="Teléfono" 
          value={reserva.telefono} 
        />
        <InfoItem 
          icon="mail-outline" 
          label="Email" 
          value={reserva.email || 'No especificado'} 
        />
      </Section>

      <Section title="Detalles de la Reserva" icon="calendar">
        <InfoItem 
          icon="calendar-outline" 
          label="Fecha" 
          value={reserva.fecha} 
        />
        {reservaInfo?.franja && (
          <InfoItem 
            icon="time-outline" 
            label="Franja Horaria" 
            value={`${reservaInfo.franja.nombre} (${formatHora(reservaInfo.franja.horaInicio)} - ${formatHora(reservaInfo.franja.horaFin)})`} 
          />
        )}
        <InfoItem 
          icon="people-outline" 
          label="Comensales" 
          value={`${reserva.comensales} ${reserva.comensales === 1 ? 'persona' : 'personas'}`} 
          color={colors.primary}
        />
      </Section>

      <Section title="Ubicación" icon="location">
        {reservaInfo?.mesaInfo ? (
          <>
            <InfoItem 
              icon="home-outline" 
              label="Sala" 
              value={reservaInfo.mesaInfo.salaNombre} 
            />
            <InfoItem 
              icon="grid-outline" 
              label="Mesa" 
              value={`Mesa ${reservaInfo.mesaInfo.numero}`} 
              color={colors.accent}
            />
          </>
        ) : (
          <Text style={styles.noLocation}>Sin asignar</Text>
        )}
      </Section>

      <Section title="Información Adicional" icon="information-circle">
        <InfoItem 
          icon="globe-outline" 
          label="Origen" 
          value={reserva.origen === 'ONLINE' ? 'Reserva Online' : 'Manual'} 
        />
        {reserva.observaciones && (
          <InfoItem 
            icon="document-text-outline" 
            label="Notas" 
            value={reserva.observaciones} 
          />
        )}
      </Section>


    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    ...typography.h1,
    color: colors.text,
    flex: 1,
    marginRight: spacing.sm,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent + '15',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.accent + '30',
  },
  deleteButton: {
    backgroundColor: colors.error + '15',
    borderColor: colors.error + '30',
  },
  statusRow: {
    marginTop: spacing.sm,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionIcon: {
    marginRight: spacing.xs,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
  },
  sectionContent: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoIcon: {
    marginRight: spacing.md,
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    ...typography.body,
    color: colors.text,
  },
  noLocation: {
    ...typography.body,
    color: colors.textSecondary,
    fontStyle: 'italic',
    paddingVertical: spacing.sm,
  },

});
