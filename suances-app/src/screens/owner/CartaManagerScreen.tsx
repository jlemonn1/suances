import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { TipoCartaKpiCard, PlatosKpiCard, IngredientesKpiCard, DistribuidoresKpiCard } from '../../components/carta';
import { colors, spacing } from '../../theme';

interface CartaManagerScreenProps {
  navigation: any;
}

export const CartaManagerScreen: React.FC<CartaManagerScreenProps> = ({
  navigation,
}) => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.grid}>
        <TipoCartaKpiCard navigation={navigation} />
        <PlatosKpiCard navigation={navigation} />
        <IngredientesKpiCard navigation={navigation} />
        <DistribuidoresKpiCard navigation={navigation} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  grid: {
    gap: spacing.md,
    marginTop: spacing.sm,
  },

});
