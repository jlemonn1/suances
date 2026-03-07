import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { CartaPublicaScreen } from '../screens/staff/CartaPublicaScreen';
import { PerfilScreen } from '../screens/staff/PerfilScreen';

import { colors } from '../theme';

const Tab = createBottomTabNavigator();

export const StaffNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';
          if (route.name === 'Carta') {
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
