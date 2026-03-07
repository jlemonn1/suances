import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../theme';
import { Mesa, SalaLayout, TABLE_SIZE, CELL_SIZE } from '../../types/reservas';

interface Props {
  layout?: SalaLayout | null;
  mesas: Mesa[];
  editable?: boolean;
  onPositionChange?: (mesaId: string, pos: { posX: number; posY: number }) => void;
}

interface MesaPosition {
  id: string;
  x: number;
  y: number;
  numero: number;
  capacidad: number;
  visibleOnline: boolean;
}

type Direction = 'up' | 'down' | 'left' | 'right';

const { width: screenWidth } = Dimensions.get('window');

export const LayoutCanvas: React.FC<Props> = ({
  layout,
  mesas,
  editable = false,
  onPositionChange,
}) => {
  const [container, setContainer] = useState({ width: 0, height: 0 });
  const [mesaPositions, setMesaPositions] = useState<MesaPosition[]>([]);
  const [selectedMesaId, setSelectedMesaId] = useState<string | null>(null);
  
  // Calcular dimensiones basadas en el layout o usar defaults
  const anchoUnidades = layout?.ancho || (layout?.mesasAncho || 5) * TABLE_SIZE;
  const altoUnidades = layout?.alto || (layout?.mesasAlto || 4) * TABLE_SIZE;
  const cellSize = layout?.cellSize || CELL_SIZE;
  
  // Inicializar posiciones de mesas
  useEffect(() => {
    const positions = mesas.map((mesa) => ({
      id: mesa.id,
      x: mesa.posX ?? 0,
      y: mesa.posY ?? 0,
      numero: mesa.numero,
      capacidad: mesa.capacidad,
      visibleOnline: mesa.visibleOnline,
    }));
    setMesaPositions(positions);
    
    // Si la mesa seleccionada ya no existe, deseleccionar
    if (selectedMesaId && !mesas.find(m => m.id === selectedMesaId)) {
      setSelectedMesaId(null);
    }
  }, [mesas, selectedMesaId]);

  // Escalar de unidades a píxeles
  const scaleX = container.width > 0 ? container.width / anchoUnidades : 1;
  const scaleY = container.height > 0 ? container.height / altoUnidades : 1;

  // Mover mesa en una dirección (un paso de celda)
  const moveMesa = useCallback((direction: Direction) => {
    if (!selectedMesaId || !editable) return;
    
    const mesa = mesaPositions.find(m => m.id === selectedMesaId);
    if (!mesa) return;

    let newX = mesa.x;
    let newY = mesa.y;

    switch (direction) {
      case 'up':
        newY = Math.max(0, mesa.y - cellSize);
        break;
      case 'down':
        newY = Math.min(altoUnidades - TABLE_SIZE, mesa.y + cellSize);
        break;
      case 'left':
        newX = Math.max(0, mesa.x - cellSize);
        break;
      case 'right':
        newX = Math.min(anchoUnidades - TABLE_SIZE, mesa.x + cellSize);
        break;
    }

    // Actualizar posición local
    setMesaPositions(prev =>
      prev.map(m => m.id === selectedMesaId ? { ...m, x: newX, y: newY } : m)
    );

    // Notificar cambio
    onPositionChange?.(selectedMesaId, { posX: Math.round(newX), posY: Math.round(newY) });
  }, [selectedMesaId, mesaPositions, editable, cellSize, anchoUnidades, altoUnidades, onPositionChange]);

  // Seleccionar mesa
  const selectMesa = (mesaId: string) => {
    if (!editable) return;
    setSelectedMesaId(mesaId === selectedMesaId ? null : mesaId);
  };

  // Generar líneas del grid
  const getGridLines = () => {
    if (!layout || container.width === 0) return null;

    const lines = [];
    const cols = Math.ceil(anchoUnidades / cellSize);
    const rows = Math.ceil(altoUnidades / cellSize);

    // Líneas verticales
    for (let i = 0; i <= cols; i++) {
      const x = (i * cellSize / anchoUnidades) * container.width;
      const isMajor = i % 4 === 0;
      lines.push(
        <View
          key={`v-${i}`}
          style={[
            styles.gridLineVertical,
            { left: x },
            isMajor && styles.gridLineMajor,
          ]}
        />
      );
    }

    // Líneas horizontales
    for (let i = 0; i <= rows; i++) {
      const y = (i * cellSize / altoUnidades) * container.height;
      const isMajor = i % 4 === 0;
      lines.push(
        <View
          key={`h-${i}`}
          style={[
            styles.gridLineHorizontal,
            { top: y },
            isMajor && styles.gridLineMajor,
          ]}
        />
      );
    }

    return lines;
  };

  // Dibujar bordes del área (polígono)
  const getPolygonBorders = () => {
    if (!layout?.vertices || layout.vertices.length < 3) return null;

    return layout.vertices.map(([x, y], idx) => {
      const next = layout.vertices![(idx + 1) % layout.vertices!.length];
      const x1 = (x / anchoUnidades) * container.width;
      const y1 = (y / altoUnidades) * container.height;
      const x2 = (next[0] / anchoUnidades) * container.width;
      const y2 = (next[1] / altoUnidades) * container.height;
      const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
      const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);

      return (
        <View
          key={`border-${idx}`}
          style={[
            styles.polygonBorder,
            {
              left: x1,
              top: y1,
              width: length,
              transform: [{ rotate: `${angle}deg` }],
            },
          ]}
        />
      );
    });
  };

  const mesaWidth = (TABLE_SIZE / anchoUnidades) * container.width;
  const mesaHeight = (TABLE_SIZE / altoUnidades) * container.height;

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={styles.hint}>
          {editable 
            ? selectedMesaId 
              ? 'Usa los controles para mover la mesa seleccionada'
              : 'Toca una mesa para seleccionarla y moverla'
            : 'Vista del plano de la sala'
          }
        </Text>
      </View>
      
      <View
        style={styles.canvas}
        onLayout={(event) => {
          const { width, height } = event.nativeEvent.layout;
          setContainer({ width, height });
        }}
      >
        {/* Grid */}
        <View style={styles.gridLayer}>
          {getGridLines()}
        </View>

        {/* Bordes del área */}
        <View style={styles.polygonLayer}>
          {getPolygonBorders()}
        </View>

        {/* Mesas */}
        <View style={styles.mesasLayer}>
          {mesaPositions.map((mesa) => {
            const left = (mesa.x / anchoUnidades) * container.width;
            const top = (mesa.y / altoUnidades) * container.height;
            const isSelected = mesa.id === selectedMesaId;

            return (
              <Pressable
                key={mesa.id}
                style={[
                  styles.mesa,
                  {
                    width: mesaWidth,
                    height: mesaHeight,
                    left,
                    top,
                    backgroundColor: mesa.visibleOnline ? colors.accentLight : colors.textSecondary + '33',
                    borderColor: isSelected ? colors.primary : (editable ? colors.border : colors.border),
                    borderWidth: isSelected ? 3 : 1,
                    zIndex: isSelected ? 10 : 1,
                  },
                ]}
                onPress={() => selectMesa(mesa.id)}
                disabled={!editable}
              >
                <Text style={styles.mesaLabel}>Mesa {mesa.numero}</Text>
                <Text style={styles.mesaCaption}>{mesa.capacidad} pax</Text>
                {isSelected && (
                  <View style={styles.selectedIndicator}>
                    <Ionicons name="checkmark" size={14} color={colors.surface} />
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        {/* Indicador de modo edición */}
        {editable && (
          <View style={styles.editModeIndicator}>
            <Ionicons name="create" size={14} color={colors.surface} />
            <Text style={styles.editModeText}>Modo edición</Text>
          </View>
        )}
      </View>

      {/* Controles direccionales (solo en modo edición) */}
      {editable && selectedMesaId && (
        <View style={styles.controlsContainer}>
          <View style={styles.controlsRow}>
            <Pressable 
              style={[styles.controlButton, styles.controlButtonUp]}
              onPress={() => moveMesa('up')}
            >
              <Text style={styles.controlButtonText}>▲</Text>
            </Pressable>
          </View>
          <View style={styles.controlsRow}>
            <Pressable 
              style={[styles.controlButton, styles.controlButtonLeft]}
              onPress={() => moveMesa('left')}
            >
              <Text style={styles.controlButtonText}>◀</Text>
            </Pressable>
            <View style={styles.controlCenter}>
              <Text style={styles.controlCenterText}>
                {mesaPositions.find(m => m.id === selectedMesaId)?.numero}
              </Text>
            </View>
            <Pressable 
              style={[styles.controlButton, styles.controlButtonRight]}
              onPress={() => moveMesa('right')}
            >
              <Text style={styles.controlButtonText}>▶</Text>
            </Pressable>
          </View>
          <View style={styles.controlsRow}>
            <Pressable 
              style={[styles.controlButton, styles.controlButtonDown]}
              onPress={() => moveMesa('down')}
            >
              <Text style={styles.controlButtonText}>▼</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Botón para deseleccionar */}
      {editable && selectedMesaId && (
        <Pressable 
          style={styles.deselectButton}
          onPress={() => setSelectedMesaId(null)}
        >
          <Text style={styles.deselectButtonText}>Deseleccionar mesa</Text>
        </Pressable>
      )}

      {/* Leyenda */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.accentLight, borderColor: colors.primary }]} />
          <Text style={styles.legendText}>Visible online</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.textSecondary + '33', borderColor: colors.border }]} />
          <Text style={styles.legendText}>Solo presencial</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: spacing.md,
  },
  header: {
    marginBottom: spacing.sm,
  },
  hint: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  canvas: {
    height: 320,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.md,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    position: 'relative',
  },
  gridLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  gridLineHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.border + '20',
  },
  gridLineVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: colors.border + '20',
  },
  gridLineMajor: {
    backgroundColor: colors.border + '60',
    height: 2,
    width: 2,
  },
  polygonLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
  },
  polygonBorder: {
    position: 'absolute',
    height: 3,
    backgroundColor: colors.primary,
    transformOrigin: 'left center',
  },
  mesasLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 3,
  },
  mesa: {
    position: 'absolute',
    borderRadius: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mesaLabel: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primary,
    fontSize: 12,
  },
  mesaCaption: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: colors.primary,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedText: {
    color: colors.surface,
    fontSize: 10,
    fontWeight: '700',
  },
  editModeIndicator: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.sm,
    zIndex: 10,
  },
  editModeText: {
    ...typography.caption,
    color: colors.surface,
    fontWeight: '600',
  },
  controlsContainer: {
    alignItems: 'center',
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  controlButtonUp: {
    marginBottom: spacing.xs,
  },
  controlButtonDown: {
    marginTop: spacing.xs,
  },
  controlButtonLeft: {
    marginRight: spacing.xs,
  },
  controlButtonRight: {
    marginLeft: spacing.xs,
  },
  controlButtonText: {
    color: colors.surface,
    fontSize: 24,
    fontWeight: '700',
  },
  controlCenter: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accentLight,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlCenterText: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: '700',
  },
  deselectButton: {
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.textSecondary + '20',
    borderRadius: spacing.sm,
    alignSelf: 'center',
  },
  deselectButtonText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
    marginTop: spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1,
  },
  legendText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
