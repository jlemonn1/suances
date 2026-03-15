import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../theme';

interface SummaryRowProps {
  label: string;
  value: string;
  variant?: 'default' | 'emphasis' | 'total' | 'discount';
  showBorder?: boolean;
}

export const SummaryRow: React.FC<SummaryRowProps> = ({
  label,
  value,
  variant = 'default',
  showBorder = false,
}) => {
  const getValueColor = () => {
    switch (variant) {
      case 'total':
        return colors.success;
      case 'discount':
        return colors.error;
      case 'emphasis':
        return colors.text;
      default:
        return colors.textSecondary;
    }
  };

  return (
    <View style={[styles.container, showBorder && styles.withBorder]}>
      <Text 
        style={[
          styles.label, 
          variant === 'total' && styles.labelTotal,
          variant === 'emphasis' && styles.labelEmphasis,
        ]}
      >
        {label}
      </Text>
      <Text 
        style={[
          styles.value,
          { color: getValueColor() },
          variant === 'total' && styles.valueTotal,
        ]}
      >
        {value}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  withBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: spacing.xs,
    paddingTop: spacing.sm,
  },
  label: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  labelEmphasis: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
  },
  labelTotal: {
    ...typography.h3,
    color: colors.text,
    fontWeight: '600',
  },
  value: {
    ...typography.body,
    fontWeight: '500',
  },
  valueTotal: {
    ...typography.h2,
    fontWeight: '700',
  },
});
