import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { Card } from '../common';
import { colors, spacing, typography } from '../../theme';
import { FranjaHoraria } from '../../types/reservas';

interface Props {
  franja: FranjaHoraria;
  onToggle?: (franja: FranjaHoraria) => void;
  onPress?: () => void;
}

export const FranjaCard: React.FC<Props> = ({ franja, onToggle, onPress }) => {
  return (
    <Card style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.title}>{franja.nombre}</Text>
        <Switch
          value={franja.activa}
          onValueChange={() => onToggle?.(franja)}
          thumbColor={franja.activa ? colors.accent : colors.surface}
          trackColor={{ true: colors.accentLight, false: colors.border }}
        />
      </View>
      <Text style={styles.meta}>{franja.tipo}</Text>
      <Text style={styles.meta}>
        {franja.horaInicio} - {franja.horaFin}
      </Text>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  meta: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
