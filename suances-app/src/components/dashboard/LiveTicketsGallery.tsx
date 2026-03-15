import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, borderRadius, shadows } from '../../theme';
import { useSalaStore } from '../../store/salaStore';
import { useComandasSSE } from '../../hooks/useComandasSSE';
import type { ComandaHoyResponse, ComandaEstado } from '../../types/sala';

// Colores según estado de comanda
const getEstadoColor = (estado: ComandaEstado): string => {
  switch (estado) {
    case 'ABIERTA':
      return '#FFC107'; // Amarillo
    case 'EN_PREPARACION':
      return '#FF9800'; // Naranja
    case 'SERVIDA':
      return '#4CAF50'; // Verde
    case 'CUENTA':
      return '#F44336'; // Rojo
    case 'COBRADA':
      return '#2196F3'; // Azul
    case 'CANCELADA':
      return '#9E9E9E'; // Gris
    default:
      return '#757575';
  }
};

interface TicketCardProps {
  comanda: ComandaHoyResponse;
  onPress: () => void;
  index: number;
}

const TicketCard: React.FC<TicketCardProps> = ({ comanda, onPress, index }) => {
  const color = getEstadoColor(comanda.estado);
  const rotation = useRef(new Animated.Value(Math.random() * 4 - 2)).current;
  
  // Animación de entrada "como si se imprimiera"
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-30)).current;
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 100, // Efecto escalonado
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index]);

  const tiempoTranscurrido = () => {
    const apertura = new Date(comanda.fechaApertura);
    const ahora = new Date();
    const diffMs = ahora.getTime() - apertura.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMins % 60}m`;
    }
    return `${diffMins}m`;
  };

  return (
    <Animated.View
      style={[
        styles.ticketContainer,
        {
          opacity: fadeAnim,
          transform: [
            { translateY },
            { rotate: rotation.interpolate({
              inputRange: [-2, 2],
              outputRange: ['-2deg', '2deg'],
            }) },
          ],
        },
      ]}
    >
      <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
        {/* Chincheta */}
        <View style={[styles.ticketPin, { backgroundColor: color }]}>
          <View style={styles.pinHead} />
        </View>
        
        {/* Ticket */}
        <View style={styles.ticketPaper}>
          {/* Header */}
          <View style={styles.ticketHeader}>
            <View style={[styles.estadoBadge, { backgroundColor: color + '20' }]}>
              <View style={[styles.estadoDot, { backgroundColor: color }]} />
            </View>
            <Text style={styles.ticketTiempo}>{tiempoTranscurrido()}</Text>
          </View>

          {/* Info principal */}
          <View style={styles.ticketMain}>
            <Text style={styles.ticketMesa}>Mesa {comanda.mesaNumero}</Text>
            <Text style={styles.ticketCodigo}>{comanda.codigo}</Text>
          </View>

          {/* Footer */}
          <View style={styles.ticketFooter}>
            <Text style={styles.ticketSala}>{comanda.nombreSala || 'Sala'}</Text>
            <Text style={[styles.ticketTotal, { color }]}>
              {comanda.total.toFixed(0)}€
            </Text>
          </View>

          {/* Efecto de perforación */}
          <View style={styles.ticketPerforation}>
            {[...Array(6)].map((_, i) => (
              <View key={i} style={styles.perforationDot} />
            ))}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export const LiveTicketsGallery: React.FC = () => {
  const navigation = useNavigation<any>();
  const { comandasHoy, loadingComandasHoy, fetchComandasHoy } = useSalaStore();

  // Cargar comandas al montar
  useEffect(() => {
    fetchComandasHoy();
  }, [fetchComandasHoy]);

  // SSE para actualizaciones en tiempo real de comandas
  useComandasSSE({ enabled: true });

  // Filtrar solo comandas activas (pinchadas) - excluir COBRADA y CANCELADA
  const comandasActivas = comandasHoy.filter(
    (c) => c.estado === 'ABIERTA' || c.estado === 'EN_PREPARACION' || c.estado === 'SERVIDA' || c.estado === 'CUENTA'
  );

  const handleTicketPress = (comanda: ComandaHoyResponse) => {
    // Navegar a Sala En Vivo
    navigation.navigate('SalaEnVivo');
  };

  const handleVerTodas = () => {
    navigation.navigate('SalaEnVivo');
  };

  if (loadingComandasHoy) {
    return (
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <View style={styles.titleRow}>
            <Ionicons name="pin" size={20} color={colors.accent} />
            <Text style={styles.title}>Sala En Vivo</Text>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      </View>
    );
  }

  if (comandasActivas.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <View style={styles.titleRow}>
            <Ionicons name="pin" size={20} color={colors.accent} />
            <Text style={styles.title}>Sala En Vivo</Text>
          </View>
          <TouchableOpacity onPress={handleVerTodas} style={styles.verTodasButton}>
            <Text style={styles.verTodasText}>Ver todas</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="pin-outline" size={32} color={colors.textSecondary} />
          <Text style={styles.emptyText}>No hay comandas activas</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <Ionicons name="pin" size={20} color={colors.accent} />
          <Text style={styles.title}>Sala En Vivo</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{comandasActivas.length}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleVerTodas} style={styles.verTodasButton}>
          <Text style={styles.verTodasText}>Ver todas</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {comandasActivas.map((comanda, idx) => (
          <TicketCard
            key={comanda.id}
            comanda={comanda}
            onPress={() => handleTicketPress(comanda)}
            index={idx}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  badge: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginLeft: spacing.xs,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  verTodasButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  verTodasText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  loadingContainer: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.md,
  },
  emptyText: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    fontSize: 14,
  },
  // Ticket styles
  ticketContainer: {
    width: 140,
    marginRight: spacing.md,
  },
  ticketPin: {
    width: 14,
    height: 14,
    borderRadius: 7,
    alignSelf: 'center',
    marginBottom: -7,
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.small,
  },
  pinHead: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  ticketPaper: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    ...shadows.medium,
    minHeight: 140,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  estadoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  estadoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  ticketTiempo: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  ticketMain: {
    alignItems: 'center',
    marginVertical: spacing.sm,
  },
  ticketMesa: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  ticketCodigo: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
    fontFamily: 'monospace',
  },
  ticketFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    borderStyle: 'dashed',
    paddingTop: spacing.xs,
    marginTop: 'auto',
    alignItems: 'center',
  },
  ticketSala: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  ticketTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 2,
  },
  ticketPerforation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    bottom: -6,
    left: spacing.sm,
    right: spacing.sm,
  },
  perforationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.background,
  },
});
