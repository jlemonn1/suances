import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';

import { DashboardScreen } from '../screens/owner/DashboardScreen';
import { CartaManagerScreen } from '../screens/owner/CartaManagerScreen';
import { InventarioScreen } from '../screens/owner/InventarioScreen';
import { PlatoListScreen } from '../screens/owner/PlatoListScreen';
import { IngredienteListScreen } from '../screens/owner/IngredienteListScreen';
import { TiposCartaListScreen } from '../screens/owner/TiposCartaListScreen';
import { TipoCartaFormScreen } from '../screens/owner/TipoCartaFormScreen';
import { TipoCartaDetailScreen } from '../screens/owner/TipoCartaDetailScreen';
import { IngredienteFormScreen } from '../screens/owner/IngredienteFormScreen';
import { PlatoWizardScreen } from '../screens/owner/PlatoWizardScreen';
import { PlatoDetailScreen } from '../screens/owner/PlatoDetailScreen';
import { EscandalloScreen } from '../screens/owner/EscandalloScreen';
import { DistribuidoresScreen } from '../screens/owner/DistribuidoresScreen';
import { PersonalListScreen } from '../screens/owner/PersonalListScreen';
import { PersonalDetailScreen } from '../screens/owner/PersonalDetailScreen';
import { PersonalFormScreen } from '../screens/owner/PersonalFormScreen';
import { ReservasHomeScreen } from '../screens/owner/reservas/ReservasHomeScreen';
import { EspaciosScreen } from '../screens/owner/reservas/EspaciosScreen';
import { SalaDetailScreen } from '../screens/owner/reservas/SalaDetailScreen';
import { FranjasScreen } from '../screens/owner/reservas/FranjasScreen';
import { ReservaEditorScreen } from '../screens/owner/reservas/ReservaEditorScreen';
import { ReservaDetailScreen } from '../screens/owner/reservas/ReservaDetailScreen';
import { ReservasOnlineScreen } from '../screens/owner/reservas/ReservasOnlineScreen';
import { WaitlistScreen } from '../screens/owner/reservas/WaitlistScreen';

import { colors } from '../theme';

const Tab = createBottomTabNavigator<any>();
const Stack = createNativeStackNavigator<any>();

const screenOptions = {
  headerStyle: { backgroundColor: colors.primary },
  headerTintColor: colors.surface,
  headerTitleStyle: { fontWeight: '600' as const },
};

const CartaStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen
      name="CartaMain"
      component={CartaManagerScreen}
      options={{ title: 'Carta' }}
    />
    <Stack.Screen
      name="TiposCarta"
      component={TiposCartaListScreen}
      options={{ title: 'Tipos de Carta' }}
    />
    <Stack.Screen
      name="TipoCartaForm"
      component={TipoCartaFormScreen}
      options={{ title: 'Tipo de Carta', presentation: 'modal' }}
    />
    <Stack.Screen
      name="TipoCartaDetail"
      component={TipoCartaDetailScreen}
      options={{ title: 'Detalle Tipo de Carta' }}
    />
    <Stack.Screen
      name="Platos"
      component={PlatoListScreen}
      options={{ title: 'Platos' }}
    />
    <Stack.Screen
      name="PlatoWizard"
      component={PlatoWizardScreen}
      options={{ title: 'Nuevo Plato', presentation: 'modal' }}
    />
    <Stack.Screen
      name="PlatoDetail"
      component={PlatoDetailScreen}
      options={{ title: 'Detalle Plato' }}
    />
    <Stack.Screen
      name="Ingredientes"
      component={IngredienteListScreen}
      options={{ title: 'Ingredientes' }}
    />
    <Stack.Screen
      name="IngredienteForm"
      component={IngredienteFormScreen}
      options={{ title: 'Ingrediente', presentation: 'modal' }}
    />
    <Stack.Screen
      name="Escandallos"
      component={EscandalloScreen}
      options={{ title: 'Escandallos' }}
    />
    <Stack.Screen
      name="Distribuidores"
      component={DistribuidoresScreen}
      options={{ title: 'Distribuidores' }}
    />
  </Stack.Navigator>
);

const PersonalStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen
      name="PersonalList"
      component={PersonalListScreen}
      options={{ title: 'Personal' }}
    />
    <Stack.Screen
      name="PersonalDetail"
      component={PersonalDetailScreen}
      options={{ title: 'Detalle Usuario' }}
    />
    <Stack.Screen
      name="PersonalForm"
      component={PersonalFormScreen}
      options={{ title: 'Usuario', presentation: 'modal' }}
    />
  </Stack.Navigator>
);

const ReservasStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen
      name="ReservasHome"
      component={ReservasHomeScreen}
      options={{ title: 'Reservas' }}
    />
    <Stack.Screen
      name="ReservaEditor"
      component={ReservaEditorScreen}
      options={{ title: 'Nueva Reserva' }}
    />
    <Stack.Screen
      name="ReservaDetail"
      component={ReservaDetailScreen as any}
      options={{ title: 'Detalle Reserva' }}
    />
    <Stack.Screen
      name="ReservasOnline"
      component={ReservasOnlineScreen}
      options={{ title: 'Reservas Online' }}
    />
    <Stack.Screen
      name="Waitlist"
      component={WaitlistScreen}
      options={{ title: 'Lista de Espera' }}
    />
    <Stack.Screen
      name="Espacios"
      component={EspaciosScreen}
      options={{ title: 'Salas y Mesas' }}
    />
    <Stack.Screen
      name="SalaDetail"
      component={SalaDetailScreen as any}
      options={{ title: 'Detalle Sala' }}
    />
    <Stack.Screen
      name="Franjas"
      component={FranjasScreen}
      options={{ title: 'Franjas Horarias' }}
    />
  </Stack.Navigator>
);

export const OwnerNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let icon = '';
           if (route.name === 'Dashboard') icon = '📊';
           else if (route.name === 'Reservas') icon = '🪑';
           else if (route.name === 'Carta') icon = '📋';
           else if (route.name === 'Inventario') icon = '📦';
           else if (route.name === 'Personal') icon = '👥';
          
          return <Text style={{ fontSize: size }}>{icon}</Text>;
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: { backgroundColor: colors.surface },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Reservas" component={ReservasStack} />
      <Tab.Screen name="Carta" component={CartaStack} />
      <Tab.Screen name="Inventario" component={InventarioScreen} />
      <Tab.Screen name="Personal" component={PersonalStack} />
    </Tab.Navigator>
  );
};
