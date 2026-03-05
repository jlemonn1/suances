import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Input } from '../common';
import { colors, spacing, typography } from '../../theme';
import { FranjaHoraria } from '../../types/reservas';

interface Props {
  fecha: string;
  franjas: FranjaHoraria[];
  selectedFranjaId?: string;
  onChangeFecha: (value: string) => void;
  onSelectFranja: (id?: string) => void;
  onRefresh?: () => void;
}

export const AgendaFiltersBar: React.FC<Props> = ({
  fecha,
  franjas,
  selectedFranjaId,
  onChangeFecha,
  onSelectFranja,
  onRefresh,
}) => {
  return (
    <View style={styles.container}>
      <Input
        label="Fecha"
        placeholder="YYYY-MM-DD"
        value={fecha}
        onChangeText={onChangeFecha}
        keyboardType="numbers-and-punctuation"
      />

      <View style={styles.franjasHeader}>
        <Text style={styles.sectionTitle}>Franjas</Text>
        {onRefresh && (
          <TouchableOpacity onPress={onRefresh}>
            <Text style={styles.refresh}>↻ Actualizar</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
        <TouchableOpacity
          style={[styles.chip, !selectedFranjaId && styles.chipActive]}
          onPress={() => onSelectFranja(undefined)}
        >
          <Text style={[styles.chipLabel, !selectedFranjaId && styles.chipLabelActive]}>Todas</Text>
        </TouchableOpacity>
        {franjas.map((franja) => {
          const active = selectedFranjaId === franja.id;
          return (
            <TouchableOpacity
              key={franja.id}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => onSelectFranja(franja.id)}
            >
              <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
                {franja.nombre} {franja.horaInicio}-{franja.horaFin}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  franjasHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  refresh: {
    ...typography.bodySmall,
    color: colors.accent,
  },
  chipsRow: {
    flexGrow: 0,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
    backgroundColor: colors.surface,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  chipLabelActive: {
    color: colors.surface,
  },
});
