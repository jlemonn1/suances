import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, LayoutChangeEvent } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AISectionTitle } from '../shared/AISectionTitle';
import { AIFlowCard } from '../shared/AIFlowCard';
import { AIDataStat } from '../shared/AIDataStat';
import { AIIndexItem } from '../shared/AIIndexItem';
import { AITipBox, AITipText } from '../shared/AITipBox';
import { AIDivider } from '../shared/AIDivider';
import { useReservasStore } from '../../../store/reservasStore';
import { colors, spacing } from '../../../theme';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

interface ReservasGuideProps {
  onScrollToSection: (sectionId: string) => void;
  onRegisterSection: (sectionId: string, y: number) => void;
}

export const ReservasGuide: React.FC<ReservasGuideProps> = ({
  onScrollToSection,
  onRegisterSection,
}) => {
  const navigation = useNavigation();
  const {
    reservas,
    salas,
    franjas,
    waitlist,
    mesasBySala,
    agendaFilters,
    fetchReservas,
    fetchSalas,
    fetchFranjas,
    getMetrics,
  } = useReservasStore();

  // Refs para medir posiciones
  const sectionRefs = useRef<Record<string, View>>({});
  const contentY = useRef(0);

  useEffect(() => {
    fetchReservas({ fecha: agendaFilters.fecha });
    fetchSalas();
    fetchFranjas();
  }, []);

  const handleLayout = (sectionId: string) => (event: LayoutChangeEvent) => {
    const { y } = event.nativeEvent.layout;
    onRegisterSection(sectionId, y + contentY.current);
  };

  const metrics = getMetrics();
  const hoy = agendaFilters.fecha;
  
  // Calcular estadísticas
  const reservasHoy = reservas.filter(r => r.fecha === hoy);
  const confirmadasHoy = reservasHoy.filter(r => r.estado === 'CONFIRMADA').length;
  const pendientesHoy = reservasHoy.filter(r => r.estado === 'PENDIENTE').length;
  const waitlistCount = waitlist.length;
  
  // Calcular mesas totales y ocupadas
  const totalMesas = Object.values(mesasBySala).flat().length;
  const mesasOcupadas = reservasHoy.filter(r => r.estado === 'CONFIRMADA').length;
  const mesasLibres = totalMesas - mesasOcupadas;

  return (
    <View
      onLayout={(event) => {
        contentY.current = event.nativeEvent.layout.y;
      }}
    >
      {/* Estadísticas en tiempo real */}
      <View onLayout={handleLayout('estadisticas')}>
        <AISectionTitle
          title="Estado Actual"
          subtitle={`Datos en tiempo real para hoy (${hoy})`}
        />
        
        <View style={[styles.statsGrid, isTablet && styles.statsGridTablet]}>
          <AIDataStat
            icon="calendar"
            value={reservasHoy.length}
            label="Reservas hoy"
            color={colors.primary}
          />
          <AIDataStat
            icon="checkmark-circle"
            value={confirmadasHoy}
            label="Confirmadas"
            color="#10B981"
          />
          <AIDataStat
            icon="time"
            value={pendientesHoy}
            label="Pendientes"
            color="#F59E0B"
          />
          <AIDataStat
            icon="people"
            value={mesasLibres}
            label="Mesas libres"
            color="#3B82F6"
          />
          {waitlistCount > 0 && (
            <AIDataStat
              icon="hourglass"
              value={waitlistCount}
              label="En lista de espera"
              color="#EF4444"
            />
          )}
        </View>
      </View>

      <AIDivider />

      {/* Índice de secciones */}
      <View onLayout={handleLayout('indice')}>
        <AISectionTitle title="Índice de Guía" subtitle="Toca para ir a la sección" />
        <AIIndexItem
          icon="add-circle"
          title="Crear Reserva"
          sectionId="crear-reserva"
          onPress={onScrollToSection}
          color={colors.primary}
        />
        <AIIndexItem
          icon="business"
          title="Configurar Espacios"
          sectionId="espacios"
          onPress={onScrollToSection}
          color="#8B5CF6"
        />
        <AIIndexItem
          icon="list"
          title="Lista de Espera"
          sectionId="waitlist"
          onPress={onScrollToSection}
          color="#EF4444"
        />
        <AIIndexItem
          icon="lock-closed"
          title="Bloquear Mesas"
          sectionId="bloqueos"
          onPress={onScrollToSection}
          color="#F59E0B"
        />
        <AIIndexItem
          icon="time-outline"
          title="Franjas Horarias"
          sectionId="franjas"
          onPress={onScrollToSection}
          color="#3B82F6"
        />
        <AIIndexItem
          icon="bulb"
          title="Consejos Útiles"
          sectionId="consejos"
          onPress={onScrollToSection}
          color="#10B981"
        />
      </View>

      <AIDivider />

      {/* Flujos principales */}
      <AISectionTitle
        title="Flujos Principales"
        subtitle="Guía paso a paso para las acciones más comunes"
      />

      <View onLayout={handleLayout('crear-reserva')}>
        <AIFlowCard
          icon="add-circle"
          title="Crear Reserva Rápida"
          subtitle="Proceso completo para registrar una nueva reserva"
          accentColor={colors.primary}
          steps={[
            { title: 'Seleccionar fecha', description: 'Hoy o cualquier fecha futura' },
            { title: 'Elegir franja horaria', description: 'Comida (ej: 13:00-16:00) o Cena (ej: 20:00-23:00)' },
            { title: 'Seleccionar sala', description: 'Terraza, Salón, Barra u otras salas configuradas' },
            { title: 'Escoger mesa disponible', description: 'Las mesas en verde están libres, en rojo ocupadas' },
            { title: 'Datos del cliente', description: 'Nombre, teléfono y número de comensales' },
            { title: 'Guardar reserva', description: 'La reserva aparecerá en la agenda automáticamente' },
          ]}
        />
      </View>

      <View onLayout={handleLayout('espacios')}>
        <AIFlowCard
          icon="business"
          title="Configurar Espacios"
          subtitle="Crear salas, añadir mesas y configurar el plano"
          accentColor="#8B5CF6"
          steps={[
            { title: 'Acceder a Salas', description: 'Desde "Gestionar Salas" o el menú de acciones rápidas' },
            { title: 'Crear nueva sala', description: 'Nombre, capacidad total y visibilidad para reservas online' },
            { title: 'Añadir mesas', description: 'Número, capacidad (comensales) y posición inicial' },
            { title: 'Posicionar en el plano', description: 'Arrastra las mesas en el canvas para organizar el espacio' },
            { title: 'Configurar visibilidad', description: 'Decide qué mesas aparecen para reservas online' },
          ]}
        />
      </View>

      <View onLayout={handleLayout('waitlist')}>
        <AIFlowCard
          icon="list"
          title="Gestionar Lista de Espera"
          subtitle="Cuando no hay mesas disponibles"
          accentColor="#EF4444"
          steps={[
            { title: 'Añadir a waitlist', description: 'Nombre, teléfono, comensales y franja deseada' },
            { title: 'Estados de espera', description: 'WAITING: esperando | NOTIFIED: avisado | CONFIRMED: convertido' },
            { title: 'Liberar mesa', description: 'Cuando se cancela una reserva o termina un servicio' },
            { title: 'Notificar cliente', description: 'Cambiar estado a NOTIFIED para indicar que hay mesa' },
            { title: 'Convertir a reserva', description: 'El cliente confirma → se crea reserva oficial automáticamente' },
          ]}
        />
      </View>

      <View onLayout={handleLayout('bloqueos')}>
        <AIFlowCard
          icon="lock-closed"
          title="Bloquear Mesas"
          subtitle="Diferentes tipos de bloqueos según necesidad"
          accentColor="#F59E0B"
          steps={[
            { title: 'ONLINE', description: 'La mesa no aparece en reservas web, pero sí para reservas manuales' },
            { title: 'TOTAL', description: 'Mesa completamente fuera de servicio (evento privado)' },
            { title: 'MANTENIMIENTO', description: 'Temporalmente no disponible por reparaciones' },
            { title: 'EVENTO', description: 'Reservada para eventos especiales con fechas específicas' },
          ]}
        />
      </View>

      <AIDivider />

      {/* Franjas horarias */}
      <View onLayout={handleLayout('franjas')}>
        <AISectionTitle
          title="Franjas Horarias"
          subtitle={`Actualmente configuradas: ${franjas.length} franjas`}
        />
        
        {franjas.length > 0 ? (
          <View style={styles.franjasList}>
            {franjas.slice(0, 3).map((franja) => (
              <View key={franja.id} style={styles.franjaItem}>
                <Text style={styles.franjaName}>{franja.nombre}</Text>
                <Text style={styles.franjaTime}>
                  {franja.horaInicio.substring(0, 5)} - {franja.horaFin.substring(0, 5)}
                </Text>
                <View style={[styles.franjaBadge, { 
                  backgroundColor: franja.activa ? '#10B98120' : '#EF444420' 
                }]}>
                  <Text style={[styles.franjaBadgeText, { 
                    color: franja.activa ? '#10B981' : '#EF4444' 
                  }]}>
                    {franja.activa ? 'Activa' : 'Inactiva'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <AITipBox type="warning">
            <AITipText>
              No hay franjas horarias configuradas. Debes crear al menos una franja (Comida/Cena) 
              para poder gestionar reservas.
            </AITipText>
          </AITipBox>
        )}
      </View>

      <AIDivider />

      {/* Tips */}
      <View onLayout={handleLayout('consejos')}>
        <AISectionTitle title="Consejos Útiles" />
        
        <View style={styles.tipsContainer}>
          <AITipBox type="info">
            <AITipText>
              <Text style={styles.tipHighlight}>💡 Forzar reserva:</Text> Puedes asignar una mesa 
              ocupada si es necesario. El sistema te avisará pero te dejará continuar.
            </AITipText>
          </AITipBox>

          <AITipBox type="success">
            <AITipText>
              <Text style={styles.tipHighlight}>✅ Reservas online:</Text> Las reservas realizadas 
              por clientes desde la web se marcan automáticamente con etiqueta "Web".
            </AITipText>
          </AITipBox>

          <AITipBox type="warning">
            <AITipText>
              <Text style={styles.tipHighlight}>⚠️ Mesas bloqueadas:</Text> Las mesas con bloqueos 
              aparecen con icono de candado. Pasa el dedo sobre ellas para ver el motivo.
            </AITipText>
          </AITipBox>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statsGridTablet: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  franjasList: {
    gap: spacing.sm,
  },
  franjaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: 8,
  },
  franjaName: {
    flex: 1,
    fontWeight: '600',
    color: colors.text,
  },
  franjaTime: {
    color: colors.textSecondary,
    marginRight: spacing.sm,
  },
  franjaBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 4,
  },
  franjaBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tipsContainer: {
    gap: spacing.sm,
  },
  tipHighlight: {
    fontWeight: '700',
  },
});
