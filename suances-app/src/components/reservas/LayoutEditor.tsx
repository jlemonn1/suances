import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, GestureResponderEvent } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../theme';
import { SalaLayout, TABLE_SIZE, CELLS_PER_TABLE, CELL_SIZE, MAX_TABLES } from '../../types/reservas';

interface Props {
  layout?: SalaLayout | null;
  onLayoutChange?: (layout: SalaLayout) => void;
  editable?: boolean;
}

export const LayoutEditor: React.FC<Props> = ({ layout, onLayoutChange, editable = true }) => {
  const [container, setContainer] = useState({ width: 1, height: 1 });
  const [mesasAncho, setMesasAncho] = useState(layout?.mesasAncho ?? 5);
  const [mesasAlto, setMesasAlto] = useState(layout?.mesasAlto ?? 4);
  const [vertices, setVertices] = useState<number[][]>(layout?.vertices ?? []);
  const canvasRef = useRef<View>(null);

  // Calcular dimensiones totales en unidades
  const anchoUnidades = mesasAncho * TABLE_SIZE;
  const altoUnidades = mesasAlto * TABLE_SIZE;

  useEffect(() => {
    if (layout) {
      setMesasAncho(layout.mesasAncho ?? 5);
      setMesasAlto(layout.mesasAlto ?? 4);
      setVertices(layout.vertices);
    }
  }, [layout]);

  const snapToGrid = useCallback((value: number): number => {
    return Math.round(value / CELL_SIZE) * CELL_SIZE;
  }, []);

  const handleDimensionChange = (dim: 'ancho' | 'alto', delta: number) => {
    if (dim === 'ancho') {
      setMesasAncho((prev) => Math.max(1, Math.min(MAX_TABLES, prev + delta)));
    } else {
      setMesasAlto((prev) => Math.max(1, Math.min(MAX_TABLES, prev + delta)));
    }
  };

  const handleCanvasPress = (event: GestureResponderEvent) => {
    if (!editable || !canvasRef.current) return;

    const { locationX, locationY } = event.nativeEvent;
    const scaleX = anchoUnidades / container.width;
    const scaleY = altoUnidades / container.height;

    // Convertir a unidades y aplicar snap a la cuadrícula
    const rawX = locationX * scaleX;
    const rawY = locationY * scaleY;
    const x = snapToGrid(rawX);
    const y = snapToGrid(rawY);

    // Buscar si hay un vértice cercano (dentro de una celda)
    const snapDistance = CELL_SIZE;
    const existingIndex = vertices.findIndex(
      (v) => Math.abs(v[0] - x) < snapDistance && Math.abs(v[1] - y) < snapDistance
    );

    if (existingIndex >= 0) {
      // Eliminar vértice existente
      const newVertices = vertices.filter((_, i) => i !== existingIndex);
      setVertices(newVertices);
    } else {
      // Añadir nuevo vértice con snap a grid
      const newVertices = [...vertices, [x, y]];
      setVertices(newVertices);
    }
  };

  const applyLayout = () => {
    onLayoutChange?.({
      ancho: anchoUnidades,
      alto: altoUnidades,
      vertices,
      mesasAncho,
      mesasAlto,
      cellSize: CELL_SIZE,
    });
  };

  const scaled = (value: number, axis: 'x' | 'y'): number => {
    const dimension = axis === 'x' ? container.width : container.height;
    const base = axis === 'x' ? anchoUnidades : altoUnidades;
    return (value / base) * dimension;
  };

  // Generar líneas del grid (cada celda)
  const getGridLines = () => {
    const lines = [];
    const cols = mesasAncho * CELLS_PER_TABLE;
    const rows = mesasAlto * CELLS_PER_TABLE;

    // Líneas verticales
    for (let i = 0; i <= cols; i++) {
      const x = (i * CELL_SIZE / anchoUnidades) * 100;
      lines.push(
        <View
          key={`v-${i}`}
          style={[
            styles.gridLineVertical,
            { left: `${x}%` },
            i % CELLS_PER_TABLE === 0 && styles.gridLineMajor,
          ]}
        />
      );
    }

    // Líneas horizontales
    for (let i = 0; i <= rows; i++) {
      const y = (i * CELL_SIZE / altoUnidades) * 100;
      lines.push(
        <View
          key={`h-${i}`}
          style={[
            styles.gridLineHorizontal,
            { top: `${y}%` },
            i % CELLS_PER_TABLE === 0 && styles.gridLineMajor,
          ]}
        />
      );
    }

    return lines;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Configuración del espacio</Text>
      <Text style={styles.hint}>
        Define cuántas mesas caben en cada dirección. Toca el canvas para marcar los bordes del área disponible.
      </Text>

      <View style={styles.dimensionsRow}>
        <View style={styles.dimensionInput}>
          <Text style={styles.label}>Mesas en ancho</Text>
          <View style={styles.inputRow}>
            <Pressable
              style={styles.stepButton}
              onPress={() => handleDimensionChange('ancho', -1)}
            >
              <Text style={styles.stepButtonText}>−</Text>
            </Pressable>
            <Text style={styles.dimensionValue}>{mesasAncho}</Text>
            <Pressable
              style={styles.stepButton}
              onPress={() => handleDimensionChange('ancho', 1)}
            >
              <Text style={styles.stepButtonText}>+</Text>
            </Pressable>
          </View>
          <Text style={styles.dimensionHint}>{anchoUnidades}u × {TABLE_SIZE}u</Text>
        </View>
        <View style={styles.dimensionInput}>
          <Text style={styles.label}>Mesas en alto</Text>
          <View style={styles.inputRow}>
            <Pressable
              style={styles.stepButton}
              onPress={() => handleDimensionChange('alto', -1)}
            >
              <Text style={styles.stepButtonText}>−</Text>
            </Pressable>
            <Text style={styles.dimensionValue}>{mesasAlto}</Text>
            <Pressable
              style={styles.stepButton}
              onPress={() => handleDimensionChange('alto', 1)}
            >
              <Text style={styles.stepButtonText}>+</Text>
            </Pressable>
          </View>
          <Text style={styles.dimensionHint}>{altoUnidades}u × {TABLE_SIZE}u</Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoText}>
          Grid: {mesasAncho * CELLS_PER_TABLE} × {mesasAlto * CELLS_PER_TABLE} celdas ({CELL_SIZE}u)
        </Text>
        <Text style={styles.infoText}>
          Total: {mesasAncho * mesasAlto} mesas posibles
        </Text>
      </View>

      <View style={styles.verticesInfo}>
        <Text style={styles.verticesLabel}>Puntos de borde: {vertices.length}</Text>
        {vertices.length >= 3 && (
          <View style={styles.polygonReadyContainer}>
            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
            <Text style={styles.polygonReady}>Área definida</Text>
          </View>
        )}
        {vertices.length > 0 && (
          <Pressable onPress={() => setVertices([])}>
            <Text style={styles.clearLink}>Limpiar</Text>
          </Pressable>
        )}
      </View>

      <View
        ref={canvasRef}
        style={styles.canvas}
        onLayout={(event) => {
          const { width, height } = event.nativeEvent.layout;
          setContainer({ width, height });
        }}
        onStartShouldSetResponder={() => editable}
        onResponderGrant={handleCanvasPress}
      >
        <View style={styles.grid}>
          {getGridLines()}
        </View>

        {/* Área del polígono */}
        {vertices.length >= 3 && (
          <View style={styles.polygonArea}>
            {/* Líneas del polígono */}
            {vertices.map(([x, y], idx) => {
              const next = vertices[(idx + 1) % vertices.length];
              const x1 = scaled(x, 'x');
              const y1 = scaled(y, 'y');
              const x2 = scaled(next[0], 'x');
              const y2 = scaled(next[1], 'y');
              const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
              const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);

              return (
                <View
                  key={`line-${idx}`}
                  style={[
                    styles.polygonLine,
                    {
                      left: x1,
                      top: y1,
                      width: length,
                      transform: [{ rotate: `${angle}deg` }],
                    },
                  ]}
                />
              );
            })}
          </View>
        )}

        {/* Vértices */}
        {vertices.map(([x, y], idx) => {
          const left = scaled(x, 'x') - 10;
          const top = scaled(y, 'y') - 10;
          return (
            <View
              key={idx}
              style={[
                styles.vertexPoint,
                { left, top },
                idx === 0 && styles.firstVertex,
              ]}
            >
              <Text style={styles.vertexLabel}>{idx + 1}</Text>
            </View>
          );
        })}

        {editable && vertices.length === 0 && (
          <View style={styles.canvasHintOverlay}>
            <Text style={styles.canvasHint}>Toca para definir los bordes del área</Text>
          </View>
        )}
      </View>

      {editable && (
        <Pressable style={styles.applyButton} onPress={applyLayout}>
          <Text style={styles.applyButtonText}>Aplicar configuración</Text>
        </Pressable>
      )}

      {vertices.length > 0 && (
        <View style={styles.vertexList}>
          <Text style={styles.vertexListTitle}>Coordenadas del borde:</Text>
          {vertices.map(([x, y], idx) => (
            <Text key={idx} style={styles.vertexCoord}>
              Punto {idx + 1}: ({x}, {y})
            </Text>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  hint: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  dimensionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  dimensionInput: {
    flex: 1,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  stepButton: {
    width: 40,
    height: 40,
    borderRadius: spacing.sm,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  stepButtonText: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: '600',
  },
  dimensionValue: {
    ...typography.h3,
    fontWeight: '700',
    color: colors.text,
    minWidth: 40,
    textAlign: 'center',
  },
  dimensionHint: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  infoText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  verticesInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  verticesLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  polygonReady: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '600',
  },
  clearLink: {
    ...typography.caption,
    color: colors.error,
    fontWeight: '600',
  },
  canvas: {
    height: 280,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.md,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    position: 'relative',
  },
  grid: {
    ...StyleSheet.absoluteFillObject,
  },
  gridLineHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.border + '30',
  },
  gridLineVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: colors.border + '30',
  },
  gridLineMajor: {
    backgroundColor: colors.border + '80',
    height: 2,
    width: 2,
  },
  polygonArea: {
    ...StyleSheet.absoluteFillObject,
  },
  polygonLine: {
    position: 'absolute',
    height: 3,
    backgroundColor: colors.primary,
    transformOrigin: 'left center',
  },
  vertexPoint: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
  firstVertex: {
    backgroundColor: colors.success,
  },
  vertexLabel: {
    ...typography.caption,
    color: colors.surface,
    fontWeight: '700',
    fontSize: 10,
  },
  canvasHintOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background + '40',
  },
  canvasHint: {
    ...typography.caption,
    color: colors.textSecondary,
    backgroundColor: colors.surface + 'EE',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.md,
    textAlign: 'center',
  },
  applyButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  applyButtonText: {
    ...typography.body,
    color: colors.surface,
    fontWeight: '600',
  },
  vertexList: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: spacing.md,
  },
  vertexListTitle: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  vertexCoord: {
    ...typography.caption,
    color: colors.textSecondary,
    fontFamily: 'monospace',
  },
});
