import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../../theme';

export type PaymentMethod = 'EFECTIVO' | 'TARJETA' | 'MESA' | 'TRANSFERENCIA';

interface PaymentMethodSelectorProps {
  selected: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
  methods?: PaymentMethod[];
}

const ALL_METHODS: { value: PaymentMethod; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'TARJETA', label: 'Tarjeta', icon: 'card-outline' },
  { value: 'EFECTIVO', label: 'Efectivo', icon: 'cash-outline' },
  { value: 'MESA', label: 'En Mesa', icon: 'time-outline' },
];

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selected,
  onSelect,
  methods = ['TARJETA', 'EFECTIVO', 'MESA'],
}) => {
  const availableMethods = ALL_METHODS.filter(m => methods.includes(m.value));

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Método de pago</Text>
      <View style={styles.methodsContainer}>
        {availableMethods.map((method) => (
          <TouchableOpacity
            key={method.value}
            style={[
              styles.methodChip,
              selected === method.value && styles.methodChipActive,
            ]}
            onPress={() => onSelect(method.value)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={method.icon}
              size={18}
              color={selected === method.value ? colors.surface : colors.textSecondary}
            />
            <Text
              style={[
                styles.methodLabel,
                selected === method.value && styles.methodLabelActive,
              ]}
            >
              {method.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    fontWeight: '500',
  },
  methodsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  methodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  methodChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  methodLabel: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '500',
  },
  methodLabelActive: {
    color: colors.surface,
  },
});
