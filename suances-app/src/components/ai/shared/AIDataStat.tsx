import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../../theme';

interface AIDataStatProps {
  icon: keyof typeof Ionicons.glyphMap;
  value: string | number;
  label: string;
  color?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export const AIDataStat: React.FC<AIDataStatProps> = ({
  icon,
  value,
  label,
  color = colors.primary,
  trend,
}) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return { name: 'trending-up' as const, color: '#10B981' };
      case 'down':
        return { name: 'trending-down' as const, color: '#EF4444' };
      default:
        return null;
    }
  };

  const trendInfo = getTrendIcon();

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View style={styles.content}>
        <View style={styles.valueRow}>
          <Text style={styles.value}>{value}</Text>
          {trendInfo && (
            <Ionicons
              name={trendInfo.name}
              size={16}
              color={trendInfo.color}
              style={styles.trendIcon}
            />
          )}
        </View>
        <Text style={styles.label}>{label}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: spacing.sm,
    minWidth: 140,
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  content: {
    flex: 1,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  value: {
    ...typography.h2,
    color: colors.text,
    fontWeight: '700',
  },
  trendIcon: {
    marginLeft: spacing.xs,
  },
  label: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
