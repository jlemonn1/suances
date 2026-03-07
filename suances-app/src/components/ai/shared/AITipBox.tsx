import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../../theme';

interface AITipBoxProps {
  children: React.ReactNode;
  type?: 'info' | 'warning' | 'success';
}

export const AITipBox: React.FC<AITipBoxProps> = ({
  children,
  type = 'info',
}) => {
  const getColors = () => {
    switch (type) {
      case 'info':
        return {
          bg: '#EFF6FF',
          border: '#3B82F6',
          icon: '#3B82F6',
        };
      case 'warning':
        return {
          bg: '#FFFBEB',
          border: '#F59E0B',
          icon: '#F59E0B',
        };
      case 'success':
        return {
          bg: '#ECFDF5',
          border: '#10B981',
          icon: '#10B981',
        };
    }
  };

  const colorScheme = getColors();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colorScheme.bg,
          borderLeftColor: colorScheme.border,
        },
      ]}
    >
      <Ionicons
        name="bulb-outline"
        size={20}
        color={colorScheme.icon}
        style={styles.icon}
      />
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: spacing.sm,
    borderRadius: 8,
    borderLeftWidth: 3,
    marginVertical: spacing.sm,
  },
  icon: {
    marginRight: spacing.sm,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  tipText: {
    ...typography.bodySmall,
    color: colors.text,
    lineHeight: 20,
  },
});

// Helper component for tip text
export const AITipText: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Text style={styles.tipText}>{children}</Text>
);
