import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../../theme';

interface AISectionTitleProps {
  title: string;
  subtitle?: string;
}

export const AISectionTitle: React.FC<AISectionTitleProps> = ({
  title,
  subtitle,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  title: {
    ...typography.h3,
    color: colors.text,
    fontWeight: '700',
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
