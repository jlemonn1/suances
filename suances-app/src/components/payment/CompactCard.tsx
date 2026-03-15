import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity, StyleProp } from 'react-native';
import { colors, spacing, borderRadius } from '../../theme';

interface CompactCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  variant?: 'default' | 'outlined' | 'filled';
  padding?: 'none' | 'xs' | 'sm' | 'md';
}

const PADDING_MAP = {
  none: 0,
  xs: spacing.xs,
  sm: spacing.sm,
  md: spacing.md,
};

export const CompactCard: React.FC<CompactCardProps> = ({ 
  children, 
  style, 
  onPress, 
  variant = 'default',
  padding = 'sm',
}) => {
  const cardStyles = [
    styles.base,
    styles[variant],
    { padding: PADDING_MAP[padding] },
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity style={cardStyles} onPress={onPress} activeOpacity={0.7}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyles}>{children}</View>;
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  default: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  outlined: {
    backgroundColor: 'transparent',
    borderStyle: 'dashed',
  },
  filled: {
    backgroundColor: colors.background,
    borderWidth: 0,
  },
});
