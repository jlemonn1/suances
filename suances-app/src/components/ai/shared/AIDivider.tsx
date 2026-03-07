import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../../../theme';

export const AIDivider: React.FC = () => {
  return <View style={styles.divider} />;
};

const styles = StyleSheet.create({
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
});
