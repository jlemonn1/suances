import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';
import type { Sala } from '../../types/sala';

interface Props {
  salas: Sala[];
  salaSeleccionada: string;
  onSalaChange: (salaId: string) => void;
}

export const SalaChipsSelector: React.FC<Props> = ({
  salas,
  salaSeleccionada,
  onSalaChange,
}) => {
  // Encontrar el índice de la sala actual
  const currentIndex = salas.findIndex(s => s.id === salaSeleccionada);
  const salaActual = salas[currentIndex];

  // Obtener las otras salas (no seleccionadas)
  const otrasSalas = salas.filter(s => s.id !== salaSeleccionada);

  // Navegar a la sala anterior (izquierda)
  const handleAnterior = () => {
    if (currentIndex > 0) {
      onSalaChange(salas[currentIndex - 1].id);
    } else {
      // Si estamos en la primera, ir a la última (circular)
      onSalaChange(salas[salas.length - 1].id);
    }
  };

  // Navegar a la siguiente sala (derecha)
  const handleSiguiente = () => {
    if (currentIndex < salas.length - 1) {
      onSalaChange(salas[currentIndex + 1].id);
    } else {
      // Si estamos en la última, ir a la primera (circular)
      onSalaChange(salas[0].id);
    }
  };

  // Cambiar a una sala específica desde los chips
  const handleChipPress = (salaId: string) => {
    onSalaChange(salaId);
  };

  if (!salaActual) return null;

  return (
    <View style={styles.container}>
      {/* Título con sala actual y flechas */}
      <View style={styles.titleRow}>
        <TouchableOpacity 
          style={styles.arrowButton}
          onPress={handleAnterior}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={28} color={colors.primary} />
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <Text style={styles.titleLabel}>Sala</Text>
          <Text style={styles.titleText}>{salaActual.nombre}</Text>
        </View>

        <TouchableOpacity 
          style={styles.arrowButton}
          onPress={handleSiguiente}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-forward" size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Chips de otras salas */}
      {otrasSalas.length > 0 && (
        <View style={styles.chipsContainer}>
          {otrasSalas.map((sala) => (
            <TouchableOpacity
              key={sala.id}
              style={styles.chip}
              onPress={() => handleChipPress(sala.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.chipText}>{sala.nombre}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  arrowButton: {
    padding: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  titleLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  titleText: {
    ...typography.h2,
    color: colors.primary,
    fontWeight: '700',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    justifyContent: 'center',
    paddingTop: spacing.xs,
  },
  chip: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    minWidth: 80,
    alignItems: 'center',
  },
  chipText: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '500',
  },
});
