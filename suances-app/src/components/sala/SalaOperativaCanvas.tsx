import React from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, ScrollView, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';
import type { MesaOperativa, MesaEstadoOperativo } from '../../types/sala';

interface Props {
  mesas: MesaOperativa[];
  onMesaPress: (mesa: MesaOperativa) => void;
  modo: 'grid' | 'coordenadas';
}

const { width: screenWidth } = Dimensions.get('window');
const TABLE_SIZE = 70;
const TABLE_MARGIN = 8;

const getEstadoColor = (estado: MesaEstadoOperativo, tieneReserva: boolean) => {
  switch (estado) {
    case 'LIBRE':
      return tieneReserva ? colors.primary : colors.success;
    case 'OCUPADA':
      return colors.warning;
    case 'RESERVADA':
      return colors.primary;
    case 'BLOQUEADA':
      return colors.error;
    case 'MANTENIMIENTO':
      return colors.textSecondary;
    default:
      return colors.success;
  }
};

const getEstadoIcon = (estado: MesaEstadoOperativo, tieneReserva: boolean) => {
  switch (estado) {
    case 'LIBRE':
      return tieneReserva ? 'calendar' : 'checkmark-circle';
    case 'OCUPADA':
      return 'time';
    case 'RESERVADA':
      return 'calendar';
    case 'BLOQUEADA':
      return 'close-circle';
    case 'MANTENIMIENTO':
      return 'construct';
    default:
      return 'checkmark-circle';
  }
};

// Componente para una sola mesa
const MesaCard: React.FC<{
  mesa: MesaOperativa;
  onPress: () => void;
  width?: number;
  height?: number;
}> = ({ mesa, onPress, width, height }) => {
  const estadoColor = getEstadoColor(mesa.estadoOperativo, !!mesa.reservaActualId);
  const iconName = getEstadoIcon(mesa.estadoOperativo, !!mesa.reservaActualId);

  return (
    <Pressable
      style={[
        styles.mesa,
        width && { width },
        height && { height },
        {
          backgroundColor: estadoColor + '15',
          borderColor: estadoColor,
        },
      ]}
      onPress={onPress}
    >
      <View style={[styles.iconContainer, { backgroundColor: estadoColor }]}>
        <Ionicons name={iconName as any} size={18} color={colors.surface} />
      </View>
      <Text style={styles.mesaNumero}>Mesa {mesa.numero}</Text>
      <Text style={styles.mesaCapacidad}>{mesa.capacidad} pers.</Text>
      {mesa.nombreClienteReserva && (
        <Text style={styles.clienteText} numberOfLines={1}>
          {mesa.nombreClienteReserva}
        </Text>
      )}
      {mesa.estadoOperativo === 'OCUPADA' && mesa.codigoComanda && (
        <Text style={styles.comandaText}>{mesa.codigoComanda}</Text>
      )}
    </Pressable>
  );
};

// Modo Grid Responsive
const GridMode: React.FC<{
  mesas: MesaOperativa[];
  onMesaPress: (mesa: MesaOperativa) => void;
}> = ({ mesas, onMesaPress }) => {
  const { width } = useWindowDimensions();
  
  // Determinar número de columnas según ancho
  const numColumns = width >= 768 ? 6 : 2;
  const totalMargins = (numColumns + 1) * TABLE_MARGIN;
  const itemWidth = (width - totalMargins) / numColumns;

  // Ordenar mesas por número de forma ascendente
  const mesasOrdenadas = [...mesas].sort((a, b) => a.numero - b.numero);

  return (
    <View style={styles.gridContainer}>
      {mesasOrdenadas.map((mesa) => (
        <MesaCard
          key={mesa.id}
          mesa={mesa}
          onPress={() => onMesaPress(mesa)}
          width={itemWidth}
          height={TABLE_SIZE + 10}
        />
      ))}
    </View>
  );
};

// Modo Coordenadas
const CoordenadasMode: React.FC<{
  mesas: MesaOperativa[];
  onMesaPress: (mesa: MesaOperativa) => void;
}> = ({ mesas, onMesaPress }) => {
  // Ordenar mesas por número de forma ascendente
  const mesasOrdenadas = [...mesas].sort((a, b) => a.numero - b.numero);
  
  // Filtrar mesas que tienen coordenadas
  const mesasConCoords = mesasOrdenadas.filter(m => m.posX !== undefined && m.posY !== undefined);
  
  if (mesasConCoords.length === 0) {
    return (
      <View style={styles.noCoordsContainer}>
        <Ionicons name="warning" size={48} color={colors.warning} />
        <Text style={styles.noCoordsText}>
          Las mesas no tienen posiciones definidas
        </Text>
        <Text style={styles.noCoordsSubtext}>
          Las mesas deben tener coordenadas X e Y configuradas
        </Text>
      </View>
    );
  }

  // Calcular dimensiones del canvas
  const maxX = Math.max(...mesasConCoords.map(m => m.posX || 0));
  const maxY = Math.max(...mesasConCoords.map(m => m.posY || 0));
  const canvasWidth = Math.max(maxX + TABLE_SIZE + 20, screenWidth - 32);
  const canvasHeight = Math.max(maxY + TABLE_SIZE + 20, 300);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator style={styles.coordScroll}>
      <View style={[styles.coordCanvas, { width: canvasWidth, height: canvasHeight }]}>
        {mesasConCoords.map((mesa) => (
          <View
            key={mesa.id}
            style={[
              styles.coordMesaContainer,
              {
                left: mesa.posX,
                top: mesa.posY,
              },
            ]}
          >
            <MesaCard
              mesa={mesa}
              onPress={() => onMesaPress(mesa)}
              width={TABLE_SIZE}
              height={TABLE_SIZE}
            />
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export const SalaOperativaCanvas: React.FC<Props> = ({
  mesas,
  onMesaPress,
  modo,
}) => {
  if (mesas.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="restaurant-outline" size={64} color={colors.textSecondary} />
        <Text style={styles.emptyText}>No hay mesas disponibles</Text>
      </View>
    );
  }

  return modo === 'grid' ? (
    <GridMode mesas={mesas} onMesaPress={onMesaPress} />
  ) : (
    <CoordenadasMode mesas={mesas} onMesaPress={onMesaPress} />
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: TABLE_MARGIN,
    gap: TABLE_MARGIN,
    justifyContent: 'flex-start',
  },
  mesa: {
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xs,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  mesaNumero: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.text,
    fontSize: 11,
  },
  mesaCapacidad: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 9,
  },
  clienteText: {
    ...typography.caption,
    color: colors.primary,
    fontSize: 8,
    marginTop: 1,
    fontWeight: '500',
  },
  comandaText: {
    ...typography.caption,
    color: colors.warning,
    fontSize: 8,
    fontWeight: '600',
  },
  coordScroll: {
    flex: 1,
  },
  coordCanvas: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
    minHeight: 300,
  },
  coordMesaContainer: {
    position: 'absolute',
  },
  noCoordsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    margin: spacing.md,
  },
  noCoordsText: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  noCoordsSubtext: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});
