import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { CartaPublicaScreen } from '../screens/staff/CartaPublicaScreen';
import { PerfilScreen } from '../screens/staff/PerfilScreen';
import { SalaScreen } from '../screens/staff/SalaScreen';
import { ComandaDetailScreen } from '../screens/staff/ComandaDetailScreen';

import { colors, spacing, typography } from '../theme';
import { useSalaStore } from '../store/salaStore';

const Tab = createBottomTabNavigator();
const SalaStack = createNativeStackNavigator();

// Stack Navigator para la sección de Sala
const SalaStackNavigator = () => {
  return (
    <SalaStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <SalaStack.Screen name="SalaMain" component={SalaScreen} />
      <SalaStack.Screen name="ComandaDetail" component={ComandaDetailScreen} />
    </SalaStack.Navigator>
  );
};

// Componente del título del header con indicador de conexión SSE
const HeaderTitle: React.FC<{ title: string }> = ({ title }) => {
  const { sseConnected } = useSalaStore();

  return (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>{title}</Text>
      {!sseConnected && (
        <View style={styles.offlineIndicator}>
          <View style={styles.ledRed} />
          <Text style={styles.offlineText}>canal en vivo caído</Text>
        </View>
      )}
    </View>
  );
};

export const StaffNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';
          if (route.name === 'Sala') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Carta') {
            iconName = focused ? 'restaurant' : 'restaurant-outline';
          } else if (route.name === 'Perfil') {
            iconName = focused ? 'person' : 'person-outline';
          }
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: { backgroundColor: colors.surface },
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.surface,
        headerTitleStyle: { fontWeight: '600' as const },
      })}
    >
      <Tab.Screen 
        name="Sala" 
        component={SalaStackNavigator}
        options={{ 
          headerTitle: () => <HeaderTitle title="Sala" />,
          title: 'Sala' 
        }}
      />
      <Tab.Screen 
        name="Carta" 
        component={CartaPublicaScreen}
        options={{ 
          headerTitle: () => <HeaderTitle title="Carta" />,
          title: 'Carta' 
        }}
      />
      <Tab.Screen 
        name="Perfil" 
        component={PerfilScreen}
        options={{ 
          headerTitle: () => <HeaderTitle title="Perfil" />,
          title: 'Perfil' 
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: colors.surface,
    fontSize: 18,
    fontWeight: '600',
  },
  offlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.sm,
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ledRed: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
    marginRight: 6,
  },
  offlineText: {
    color: colors.errorLight,
    fontSize: 12,
    fontWeight: '500',
  },
});
