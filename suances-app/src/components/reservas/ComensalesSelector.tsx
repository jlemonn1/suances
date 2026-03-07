import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../theme';

interface Props {
  value: number;
  onChange: (value: number) => void;
  label?: string;
}

const COMENSALES_OPTIONS = Array.from({ length: 20 }, (_, i) => i + 1);

export const ComensalesSelector: React.FC<Props> = ({ value, onChange, label }) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {COMENSALES_OPTIONS.map((num) => {
          const isActive = value === num;
          return (
            <TouchableOpacity
              key={num}
              style={[styles.option, isActive && styles.optionActive]}
              onPress={() => onChange(num)}
            >
              <Text style={[styles.optionText, isActive && styles.optionTextActive]}>
                {num}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.bodySmall,
    color: colors.text,
    marginBottom: spacing.xs,
    fontWeight: '500',
  },
  scrollContent: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  option: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  optionTextActive: {
    color: colors.surface,
    fontWeight: '600',
  },
});
