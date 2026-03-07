import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../../theme';

interface AIIndexItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  sectionId: string;
  onPress: (sectionId: string) => void;
  color?: string;
}

export const AIIndexItem: React.FC<AIIndexItemProps> = ({
  icon,
  title,
  sectionId,
  onPress,
  color = colors.primary,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(sectionId)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: 10,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  title: {
    flex: 1,
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
});
