import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../../theme';

interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  prefix?: string;
  showQuickAdd?: boolean;
  quickAddValues?: number[];
  readOnly?: boolean;
}

export const AmountInput: React.FC<AmountInputProps> = ({
  value,
  onChange,
  label,
  placeholder = '0.00',
  prefix = '€',
  showQuickAdd = false,
  quickAddValues = [10, 20, 50],
  readOnly = false,
}) => {
  const parseAmount = (text: string): number => {
    if (!text) return 0;
    return parseFloat(text.replace(',', '.')) || 0;
  };

  const handleQuickAdd = (amount: number) => {
    const current = parseAmount(value);
    onChange((current + amount).toFixed(2));
  };

  const handleChangeText = (text: string) => {
    const normalized = text.replace(',', '.');
    if (/^\d*\.?\d{0,2}$/.test(normalized) || normalized === '') {
      onChange(normalized);
    }
  };

  const handleClear = () => {
    onChange('');
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={styles.inputContainer}>
        <Text style={styles.prefix}>{prefix}</Text>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={handleChangeText}
          keyboardType="decimal-pad"
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          editable={!readOnly}
          selectTextOnFocus
        />
        {value && !readOnly && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {showQuickAdd && !readOnly && (
        <View style={styles.quickAddContainer}>
          {quickAddValues.map((val) => (
            <TouchableOpacity
              key={val}
              style={styles.quickAddButton}
              onPress={() => handleQuickAdd(val)}
            >
              <Text style={styles.quickAddText}>+{val}€</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.sm,
  },
  label: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    height: 44,
  },
  prefix: {
    ...typography.body,
    color: colors.textSecondary,
    marginRight: spacing.xs,
    fontWeight: '600',
  },
  input: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    paddingVertical: 0,
  },
  clearButton: {
    padding: spacing.xs,
  },
  quickAddContainer: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  quickAddButton: {
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.success + '15',
    borderRadius: borderRadius.full,
  },
  quickAddText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.success,
  },
});
