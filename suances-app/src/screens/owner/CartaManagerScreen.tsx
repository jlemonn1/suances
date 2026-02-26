import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Card } from '../../components/common';
import { colors, spacing, typography } from '../../theme';

interface CartaManagerScreenProps {
  navigation: any;
}

const menuItems = [
  {
    title: 'Tipos de Carta',
    subtitle: 'Desayuno, Comida, Cena...',
    icon: '📋',
    screen: 'TiposCarta',
  },
  {
    title: 'Platos',
    subtitle: 'Gestiona tu menú',
    icon: '🍽️',
    screen: 'Platos',
  },
  {
    title: 'Ingredientes',
    subtitle: 'Stock y proveedores',
    icon: '🥬',
    screen: 'Ingredientes',
  },
  {
    title: 'Distribuidores',
    subtitle: 'Proveedores',
    icon: '🚚',
    screen: 'Distribuidores',
  },
];

export const CartaManagerScreen: React.FC<CartaManagerScreenProps> = ({
  navigation,
}) => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Gestión de Carta</Text>
      <Text style={styles.subtitle}>Administra todos los elementos de tu carta</Text>

      <View style={styles.grid}>
        {menuItems.map((item) => (
          <Card
            key={item.screen}
            style={styles.card}
            onPress={() => navigation.navigate(item.screen)}
          >
            <Text style={styles.icon}>{item.icon}</Text>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
          </Card>
        ))}
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
  title: {
    ...typography.h1,
    color: colors.text,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  card: {
    width: '47%',
    alignItems: 'center',
    padding: spacing.lg,
  },
  icon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  cardTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  cardSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
});
