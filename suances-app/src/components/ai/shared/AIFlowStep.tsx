import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../../theme';

interface AIFlowStepProps {
  step: number;
  title: string;
  description?: string;
  isLast?: boolean;
}

export const AIFlowStep: React.FC<AIFlowStepProps> = ({
  step,
  title,
  description,
  isLast = false,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.leftColumn}>
        <View style={styles.stepNumber}>
          <Text style={styles.stepText}>{step}</Text>
        </View>
        {!isLast && <View style={styles.connector} />}
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {description && <Text style={styles.description}>{description}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  leftColumn: {
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: '700',
  },
  connector: {
    width: 2,
    flex: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  content: {
    flex: 1,
    paddingTop: 4,
  },
  title: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  description: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
