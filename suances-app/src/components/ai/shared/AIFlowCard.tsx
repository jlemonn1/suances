import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../../theme';
import { AIFlowStep } from './AIFlowStep';

interface FlowItem {
  title: string;
  description?: string;
}

interface AIFlowCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  steps: FlowItem[];
  accentColor?: string;
}

export const AIFlowCard: React.FC<AIFlowCardProps> = ({
  icon,
  title,
  subtitle,
  steps,
  accentColor = colors.primary,
}) => {
  return (
    <View style={[styles.container, { borderLeftColor: accentColor }]}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: accentColor + '15' }]}>
          <Ionicons name={icon} size={22} color={accentColor} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.stepsContainer}>
        {steps.map((step, index) => (
          <AIFlowStep
            key={index}
            step={index + 1}
            title={step.title}
            description={step.description}
            isLast={index === steps.length - 1}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  headerText: {
    flex: 1,
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
  stepsContainer: {
    marginTop: spacing.sm,
  },
});
