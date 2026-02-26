import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

import { CartaPublicaScreen } from '../screens/staff/CartaPublicaScreen';
import { PerfilScreen } from '../screens/staff/PerfilScreen';

import { colors } from '../theme';

const Tab = createBottomTabNavigator();

export const StaffNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let icon = '';
          if (route.name === 'Carta') icon = '📖';
          else if (route.name === 'Perfil') icon = '👤';
          
          return <Text style={{ fontSize: size }}>{icon}</Text>;
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
        name="Carta" 
        component={CartaPublicaScreen}
        options={{ title: 'Carta' }}
      />
      <Tab.Screen 
        name="Perfil" 
        component={PerfilScreen}
        options={{ title: 'Perfil' }}
      />
    </Tab.Navigator>
  );
};
