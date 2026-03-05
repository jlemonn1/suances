import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, PanResponder, GestureResponderEvent, PanResponderGestureState } from 'react-native';
import { colors, spacing, typography } from '../../theme';
import { Mesa, SalaLayout } from '../../types/reservas';

interface Props {
  layout?: SalaLayout | null;
  mesas: Mesa[];
  onPositionChange?: (mesaId: string, pos: { posX: number; posY: number }) => void;
}

interface PositionState {
  [mesaId: string]: { x: number; y: number };
}

const DEFAULT_SIZE = 80;

export const LayoutCanvas: React.FC<Props> = ({ layout, mesas, onPositionChange }) => {
  const [container, setContainer] = useState({ width: 1, height: 1 });
  const [positions, setPositions] = useState<PositionState>({});
  const dragStart = useRef<PositionState>({});

  useEffect(() => {
    const initial: PositionState = {};
    mesas.forEach((mesa) => {
      initial[mesa.id] = {
        x: mesa.posX ?? 0,
        y: mesa.posY ?? 0,
      };
    });
    setPositions(initial);
  }, [mesas]);

  const scaled = (
    value: number | null | undefined,
    axis: 'x' | 'y'
  ): number => {
    const dimension = axis === 'x' ? container.width : container.height;
    const base = axis === 'x' ? layout?.ancho ?? container.width : layout?.alto ?? container.height;
    if (!base) return value ?? 0;
    return ((value ?? 0) / base) * dimension;
  };

  const toDomain = (value: number, axis: 'x' | 'y'): number => {
    const dimension = axis === 'x' ? container.width : container.height;
    const base = axis === 'x' ? layout?.ancho ?? container.width : layout?.alto ?? container.height;
    if (!dimension) return value;
    return (value / dimension) * base;
  };

  const responders = useMemo(() => {
    const map: Record<string, ReturnType<typeof PanResponder.create>> = {};
    mesas.forEach((mesa) => {
      map[mesa.id] = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          dragStart.current[mesa.id] = positions[mesa.id] ?? { x: mesa.posX ?? 0, y: mesa.posY ?? 0 };
        },
        onPanResponderMove: (_: GestureResponderEvent, gesture: PanResponderGestureState) => {
          const start = dragStart.current[mesa.id] ?? { x: 0, y: 0 };
          const nextX = start.x + toDomain(gesture.dx, 'x');
          const nextY = start.y + toDomain(gesture.dy, 'y');
          const maxX = (layout?.ancho ?? container.width) - (mesa.ancho ?? DEFAULT_SIZE);
          const maxY = (layout?.alto ?? container.height) - (mesa.alto ?? DEFAULT_SIZE);
          setPositions((prev) => ({
            ...prev,
            [mesa.id]: {
              x: Math.max(0, Math.min(nextX, maxX)),
              y: Math.max(0, Math.min(nextY, maxY)),
            },
          }));
        },
        onPanResponderRelease: () => {
          const latest = positions[mesa.id];
          if (latest && onPositionChange) {
            onPositionChange(mesa.id, {
              posX: Math.round(latest.x),
              posY: Math.round(latest.y),
            });
          }
        },
      });
    });
    return map;
  }, [mesas, positions, layout, container, onPositionChange]);

  return (
    <View style={styles.wrapper}>
      <View
        style={styles.canvas}
        onLayout={(event) => {
          const { width, height } = event.nativeEvent.layout;
          setContainer({ width, height });
        }}
      >
        <View style={styles.grid}>
          {Array.from({ length: 5 }).map((_, idx) => (
            <View key={idx} style={styles.gridLine} />
          ))}
        </View>
        {mesas.map((mesa) => {
          const pos = positions[mesa.id] ?? { x: mesa.posX ?? 0, y: mesa.posY ?? 0 };
          const width = scaled(mesa.ancho ?? DEFAULT_SIZE, 'x');
          const height = scaled(mesa.alto ?? DEFAULT_SIZE, 'y');
          const left = scaled(pos.x, 'x');
          const top = scaled(pos.y, 'y');
          return (
            <View
              key={mesa.id}
              style={[
                styles.mesa,
                {
                  width,
                  height,
                  left,
                  top,
                  backgroundColor: mesa.visibleOnline ? colors.accentLight : colors.textSecondary + '33',
                },
              ]}
              {...responders[mesa.id]?.panHandlers}
            >
              <Text style={styles.mesaLabel}>Mesa {mesa.numero}</Text>
              <Text style={styles.mesaCaption}>{mesa.capacidad} pax</Text>
            </View>
          );
        })}
      </View>
      <Text style={styles.hint}>Arrastra las mesas para ajustar el plano. Cambios se guardan al soltar.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: spacing.md,
  },
  canvas: {
    height: 320,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.md,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  grid: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
  },
  gridLine: {
    flex: 1,
    borderLeftWidth: 1,
    borderColor: colors.border,
  },
  mesa: {
    position: 'absolute',
    borderRadius: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mesaLabel: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.primary,
  },
  mesaCaption: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  hint: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});
