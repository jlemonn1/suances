import React, { useState, useEffect, useRef } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View, Animated, TouchableOpacity, StyleSheet, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { DashboardScreen } from '../screens/owner/DashboardScreen';
import { ComandasHoyScreen } from '../screens/owner/ComandasHoyScreen';
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
import { SalaEnVivoScreen } from '../screens/owner/SalaEnVivoScreen';
import { ReservasHomeScreen } from '../screens/owner/reservas/ReservasHomeScreen';
import { EspaciosScreen } from '../screens/owner/reservas/EspaciosScreen';
import { SalaDetailScreen } from '../screens/owner/reservas/SalaDetailScreen';
import { FranjasScreen } from '../screens/owner/reservas/FranjasScreen';
import { ReservaEditorScreen } from '../screens/owner/reservas/ReservaEditorScreen';
import { SalaEditorScreen } from '../screens/owner/reservas/SalaEditorScreen';
import { ReservaDetailScreen } from '../screens/owner/reservas/ReservaDetailScreen';
import { ReservasOnlineScreen } from '../screens/owner/reservas/ReservasOnlineScreen';
import { WaitlistScreen } from '../screens/owner/reservas/WaitlistScreen';
import { ReservaEventsProvider } from '../components/ReservaEventsProvider';
import { CartaEventsProvider } from '../components/CartaEventsProvider';
import { AIChatModal } from '../components/ai/AIChatModal';
import { useAIStore, AIScreen } from '../store/aiStore';
import { useIngredienteStore } from '../store/ingredienteStore';
import { usePlatoStore } from '../store/platoStore';

import { colors, typography, spacing } from '../theme';
import { liquidDropTransition } from './LiquidTransition';
import { withScreenAnimation } from './withScreenAnimation';

const Tab = createBottomTabNavigator<any>();
const Stack = createNativeStackNavigator<any>();

// Pantallas con animación de entrada
const DashboardScreenAnimated = withScreenAnimation(DashboardScreen);
const ComandasHoyScreenAnimated = withScreenAnimation(ComandasHoyScreen);
const CartaManagerScreenAnimated = withScreenAnimation(CartaManagerScreen);
const PlatoListScreenAnimated = withScreenAnimation(PlatoListScreen);
const IngredienteListScreenAnimated = withScreenAnimation(IngredienteListScreen);
const TiposCartaListScreenAnimated = withScreenAnimation(TiposCartaListScreen);
const TipoCartaFormScreenAnimated = withScreenAnimation(TipoCartaFormScreen);
const TipoCartaDetailScreenAnimated = withScreenAnimation(TipoCartaDetailScreen);
const IngredienteFormScreenAnimated = withScreenAnimation(IngredienteFormScreen);
const PlatoWizardScreenAnimated = withScreenAnimation(PlatoWizardScreen);
const PlatoDetailScreenAnimated = withScreenAnimation(PlatoDetailScreen);
const EscandalloScreenAnimated = withScreenAnimation(EscandalloScreen);
const DistribuidoresScreenAnimated = withScreenAnimation(DistribuidoresScreen);
const PersonalListScreenAnimated = withScreenAnimation(PersonalListScreen);
const PersonalDetailScreenAnimated = withScreenAnimation(PersonalDetailScreen);
const PersonalFormScreenAnimated = withScreenAnimation(PersonalFormScreen);
const SalaEnVivoScreenAnimated = withScreenAnimation(SalaEnVivoScreen);
const ReservasHomeScreenAnimated = withScreenAnimation(ReservasHomeScreen);
const EspaciosScreenAnimated = withScreenAnimation(EspaciosScreen);
const SalaDetailScreenAnimated = withScreenAnimation(SalaDetailScreen);
const FranjasScreenAnimated = withScreenAnimation(FranjasScreen);
const ReservaEditorScreenAnimated = withScreenAnimation(ReservaEditorScreen);
const SalaEditorScreenAnimated = withScreenAnimation(SalaEditorScreen);
const ReservaDetailScreenAnimated = withScreenAnimation(ReservaDetailScreen);
const ReservasOnlineScreenAnimated = withScreenAnimation(ReservasOnlineScreen);
const WaitlistScreenAnimated = withScreenAnimation(WaitlistScreen);
const InventarioScreenAnimated = withScreenAnimation(InventarioScreen);

// Opciones de transición tipo "liquid" al estilo Apple - AHORA MÁS VISIBLE
const liquidScreenOptions = {
  ...liquidDropTransition,
  headerStyle: {
    backgroundColor: colors.primary,
  },
  headerTintColor: colors.surface,
  headerTitleStyle: { fontWeight: '600' as const },
  headerTitleAlign: 'left' as const,
  // Desactivamos la animación nativa porque usamos nuestra propia animación
  animation: 'none' as const,
};

// Agente IA animado
const AIAgentButton = ({ onPress }: { onPress?: () => void }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animación de pulso suave y continuo tipo "respiración"
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    // Animación de flotación más suave
    const float = Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: -3,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 3,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    // Animación de rotación muy suave y fluida
    const rotate = Animated.loop(
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: -1,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    pulse.start();
    float.start();
    rotate.start();

    return () => {
      pulse.stop();
      float.stop();
      rotate.stop();
    };
  }, []);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-6deg', '6deg'],
  });

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Animated.View
        style={[
          styles.aiButton,
          {
            transform: [
              { scale: pulseAnim },
              { translateY },
              { rotate: rotateInterpolate },
            ],
          },
        ]}
      >
        <View style={styles.aiInner}>
          <Ionicons name="sparkles" size={18} color={colors.primary} />
        </View>
        <View style={styles.aiBadge}>
          <Text style={styles.aiBadgeText}>IA</Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const HeaderTitle = ({ 
  title, 
  subtitle,
  screen
}: { 
  title: string; 
  subtitle?: string;
  screen: AIScreen;
}) => {
  const { openModal } = useAIStore();
  
  const handleAIPress = () => {
    openModal(screen);
  };
  
  return (
    <View style={styles.headerContainer}>
      <View style={styles.titleSection}>
        <Text style={styles.headerTitle}>{title}</Text>
        {subtitle && (
          <Text style={styles.headerSubtitle}>{subtitle}</Text>
        )}
      </View>
      <AIAgentButton onPress={handleAIPress} />
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingRight: 8,
  },
  titleSection: {
    flex: 1,
  },
  headerTitle: {
    color: colors.surface,
    fontWeight: '600',
    fontSize: 17,
  },
  headerSubtitle: {
    color: colors.surface,
    fontSize: 12,
    opacity: 0.8,
  },
  aiButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  aiInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  aiBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.accent,
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
    minWidth: 18,
    alignItems: 'center',
  },
  aiBadgeText: {
    color: colors.surface,
    fontSize: 9,
    fontWeight: 'bold',
  },
});

const DashboardStack = () => (
  <Stack.Navigator screenOptions={liquidScreenOptions}>
    <Stack.Screen
      name="DashboardHome"
      component={DashboardScreenAnimated}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="SalaEnVivo"
      component={SalaEnVivoScreenAnimated}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="ComandasHoy"
      component={ComandasHoyScreenAnimated}
      options={{ title: 'Comandas del Día' }}
    />
  </Stack.Navigator>
);

const CartaStack = () => (
  <CartaEventsProvider>
    <Stack.Navigator screenOptions={liquidScreenOptions}>
      <Stack.Screen
        name="CartaMain"
        component={CartaManagerScreenAnimated}
        options={{
          headerTitle: () => <HeaderTitle title="Gestión de Carta" subtitle="Administra todos los elementos de tu carta" screen="carta" />
        }}
      />
      <Stack.Screen
        name="TiposCarta"
        component={TiposCartaListScreenAnimated}
        options={{ title: 'Tipos de Carta' }}
      />
      <Stack.Screen
        name="TipoCartaForm"
        component={TipoCartaFormScreenAnimated}
        options={({ navigation }) => ({
          title: 'Tipo de Carta',
          presentation: 'modal',
          headerRight: () => (
            <Ionicons
              name="close"
              size={24}
              color={colors.surface}
              onPress={() => navigation.goBack()}
              style={{ marginRight: 8 }}
            />
          )
        })}
      />
      <Stack.Screen
        name="TipoCartaDetail"
        component={TipoCartaDetailScreenAnimated}
        options={{ title: 'Detalle Tipo de Carta' }}
      />
      <Stack.Screen
        name="Platos"
        component={PlatoListScreenAnimated}
        options={{ title: 'Platos' }}
      />
      <Stack.Screen
        name="PlatoWizard"
        component={PlatoWizardScreenAnimated}
        options={{ title: 'Nuevo Plato', presentation: 'modal' }}
      />
      <Stack.Screen
        name="PlatoDetail"
        component={PlatoDetailScreenAnimated}
        options={{ title: 'Detalle Plato' }}
      />
      <Stack.Screen
        name="Ingredientes"
        component={IngredienteListScreenAnimated}
        options={{ title: 'Ingredientes' }}
      />
      <Stack.Screen
        name="IngredienteForm"
        component={IngredienteFormScreenAnimated}
        options={({ navigation }) => ({
          title: 'Ingrediente',
          presentation: 'modal',
          headerRight: () => (
            <Ionicons
              name="close"
              size={24}
              color={colors.surface}
              onPress={() => navigation.goBack()}
              style={{ marginRight: 8 }}
            />
          )
        })}
      />
      <Stack.Screen
        name="Escandallos"
        component={EscandalloScreenAnimated}
        options={{ title: 'Escandallos' }}
      />
      <Stack.Screen
        name="Distribuidores"
        component={DistribuidoresScreenAnimated}
        options={{ title: 'Distribuidores' }}
      />
    </Stack.Navigator>
  </CartaEventsProvider>
);

const InventarioStack = () => (
  <Stack.Navigator screenOptions={liquidScreenOptions}>
    <Stack.Screen
      name="InventarioHome"
      component={InventarioScreenAnimated}
      options={{
        headerTitle: () => <HeaderTitle title="Inventario" subtitle="Control de stock y gestión de ingredientes" screen="inventario" />
      }}
    />
  </Stack.Navigator>
);

const PersonalStack = () => (
  <Stack.Navigator screenOptions={liquidScreenOptions}>
    <Stack.Screen
      name="PersonalList"
      component={PersonalListScreenAnimated}
      options={{
        headerTitle: () => <HeaderTitle title="Gestión de Personal" subtitle="Administra tu equipo y permisos" screen="personal" />
      }}
    />
    <Stack.Screen
      name="PersonalDetail"
      component={PersonalDetailScreenAnimated}
      options={{ title: 'Detalle Usuario' }}
    />
    <Stack.Screen
      name="PersonalForm"
      component={PersonalFormScreenAnimated}
      options={{ title: 'Usuario', presentation: 'modal' }}
    />
  </Stack.Navigator>
);

const ReservasStack = () => (
  <ReservaEventsProvider>
    <Stack.Navigator screenOptions={liquidScreenOptions}>
      <Stack.Screen
        name="ReservasHome"
        component={ReservasHomeScreenAnimated}
        options={{
          headerTitle: () => <HeaderTitle title="Reservas & Sala" subtitle="Controla tu capacidad en tiempo real" screen="reservas" />
        }}
      />
      <Stack.Screen
        name="ReservaEditor"
        component={ReservaEditorScreenAnimated}
        options={{ title: 'Nueva Reserva' }}
      />
      <Stack.Screen
        name="ReservaDetail"
        component={ReservaDetailScreenAnimated}
        options={{ title: 'Detalle Reserva' }}
      />
      <Stack.Screen
        name="ReservasOnline"
        component={ReservasOnlineScreenAnimated}
        options={{ title: 'Reservas Online' }}
      />
      <Stack.Screen
        name="Waitlist"
        component={WaitlistScreenAnimated}
        options={{ title: 'Lista de Espera' }}
      />
      <Stack.Screen
        name="Espacios"
        component={EspaciosScreenAnimated}
        options={{ title: 'Salas y Mesas' }}
      />
      <Stack.Screen
        name="SalaDetail"
        component={SalaDetailScreenAnimated}
        options={{ title: 'Detalle Sala' }}
      />
      <Stack.Screen
        name="SalaEditor"
        component={SalaEditorScreenAnimated}
        options={{ title: 'Sala' }}
      />
      <Stack.Screen
        name="Franjas"
        component={FranjasScreenAnimated}
        options={{ title: 'Franjas Horarias' }}
      />
    </Stack.Navigator>
  </ReservaEventsProvider>
);

export const OwnerNavigator = () => {
  const { stockCriticoAlertas, stockBajoAlertas } = useIngredienteStore();
  const { platosAgotados } = usePlatoStore();
  
  const alertasCount = stockCriticoAlertas.length + stockBajoAlertas.length;
  const agotadosCount = platosAgotados.length;

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap = 'home';
            let badge = 0;
            
            if (route.name === 'Dashboard') {
              iconName = focused ? 'stats-chart' : 'stats-chart-outline';
            } else if (route.name === 'Reservas') {
              iconName = focused ? 'calendar' : 'calendar-outline';
            } else if (route.name === 'Carta') {
              iconName = focused ? 'restaurant' : 'restaurant-outline';
              badge = agotadosCount;
            } else if (route.name === 'Inventario') {
              iconName = focused ? 'cube' : 'cube-outline';
              badge = alertasCount;
            } else if (route.name === 'Personal') {
              iconName = focused ? 'people' : 'people-outline';
            }
           
            return (
              <View style={{ position: 'relative' }}>
                <Ionicons name={iconName} size={size} color={color} />
                {badge > 0 && (
                  <View style={{
                    position: 'absolute',
                    top: -5,
                    right: -10,
                    backgroundColor: '#EF4444',
                    borderRadius: 8,
                    minWidth: 16,
                    height: 16,
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingHorizontal: 4,
                  }}>
                    <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
                      {badge > 9 ? '9+' : badge}
                    </Text>
                  </View>
                )}
              </View>
            );
          },
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarStyle: { backgroundColor: colors.surface },
          headerShown: false,
        })}
      >
        <Tab.Screen name="Dashboard" component={DashboardStack} />
        <Tab.Screen name="Reservas" component={ReservasStack} />
        <Tab.Screen name="Carta" component={CartaStack} />
        <Tab.Screen name="Inventario" component={InventarioStack} />
        <Tab.Screen name="Personal" component={PersonalStack} />
      </Tab.Navigator>
      
      {/* Modal del Asistente IA */}
      <AIChatModal />
    </View>
  );
};
