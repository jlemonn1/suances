import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../../theme';

interface AIQuickActionProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'accent';
}

export const AIQuickAction: React.FC<AIQuickActionProps> = ({
  icon,
  label,
  onPress,
  variant = 'primary',
}) => {
  const getColors = () => {
    switch (variant) {
      case 'primary':
        return {
          bg: colors.primary,
          text: colors.surface,
        };
      case 'secondary':
        return {
          bg: colors.surface,
          text: colors.primary,
          border: colors.primary,
        };
      case 'accent':
        return {
          bg: colors.accent,
          text: colors.surface,
        };
    }
  };

  const colorScheme = getColors();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.button,
        {
          backgroundColor: colorScheme.bg,
          borderWidth: variant === 'secondary' ? 1 : 0,
          borderColor: 'border' in colorScheme ? colorScheme.border : undefined,
        },
      ]}
      activeOpacity={0.8}
    >
      <Ionicons name={icon} size={18} color={colorScheme.text} style={styles.icon} />
      <Text style={[styles.label, { color: colorScheme.text }]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    minWidth: 120,
  },
  icon: {
    marginRight: spacing.xs,
  },
  label: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
});
