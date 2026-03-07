import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { Card } from '../common';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { FranjaHoraria } from '../../types/reservas';

interface Props {
  franca: FranjaHoraria;
  onToggle?: (franja: FranjaHoraria) => void;
  onPress?: () => void;
}

const TIPO_COLORS: Record<string, string> = {
  COMIDA: colors.warning,
  CENA: colors.primary,
  ESPECIAL: colors.accent,
};

const formatHora = (hora: string) => hora?.substring(0, 5) || '';

export const FranjaCard: React.FC<Props> = ({ franca, onToggle, onPress }) => {
  const tipoColor = TIPO_COLORS[franca.tipo] || colors.primary;

  return (
    <Card style={[styles.card, !franca.activa && styles.cardInactive]} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, !franca.activa && styles.textInactive]}>{franca.nombre}</Text>
          <View style={[styles.tipoBadge, { backgroundColor: tipoColor }]}>
            <Text style={styles.tipoBadgeText}>{franca.tipo}</Text>
          </View>
        </View>
        <Switch
          value={franca.activa}
          onValueChange={() => onToggle?.(franca)}
          thumbColor={franca.activa ? colors.accent : colors.surface}
          trackColor={{ true: colors.accentLight, false: colors.border }}
        />
      </View>
      <View style={styles.horaContainer}>
        <View style={styles.horaBox}>
          <Text style={styles.horaLabel}>Inicio</Text>
          <Text style={[styles.horaValue, !franca.activa && styles.textInactive]}>{formatHora(franca.horaInicio)}</Text>
        </View>
        <View style={styles.horaSeparator}>
          <Text style={styles.horaSeparatorText}>→</Text>
        </View>
        <View style={styles.horaBox}>
          <Text style={styles.horaLabel}>Fin</Text>
          <Text style={[styles.horaValue, !franca.activa && styles.textInactive]}>{formatHora(franca.horaFin)}</Text>
        </View>
      </View>
      <View style={styles.editHint}>
        <Text style={styles.editHintText}>Toca para editar</Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  cardInactive: {
    opacity: 0.7,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  textInactive: {
    color: colors.textSecondary,
  },
  tipoBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  tipoBadgeText: {
    ...typography.caption,
    color: colors.surface,
    fontWeight: '600',
  },
  horaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  horaBox: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  horaLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  horaValue: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  horaSeparator: {
    paddingHorizontal: spacing.sm,
  },
  horaSeparatorText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  editHint: {
    alignItems: 'flex-end',
  },
  editHintText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
});
