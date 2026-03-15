import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, GestureResponderEvent } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { CartaPublicaScreen } from '../screens/staff/CartaPublicaScreen';
import { PerfilScreen } from '../screens/staff/PerfilScreen';
import { SalaScreen } from '../screens/staff/SalaScreen';
import { ComandaDetailScreen } from '../screens/staff/ComandaDetailScreen';
import { CobroScreen } from '../screens/staff/CobroScreen';
import { TicketScreen } from '../screens/staff/TicketScreen';
import { SalaEnVivoScreen } from '../screens/owner/SalaEnVivoScreen';

import { colors, spacing, typography } from '../theme';
import { useSalaStore } from '../store/salaStore';
import { WaiterSwitcherGallery } from '../components/staff/WaiterSwitcherGallery';

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
      <SalaStack.Screen name="Ticket" component={TicketScreen} />
      <SalaStack.Screen name="Cobro" component={CobroScreen} />
      <SalaStack.Screen name="SalaEnVivo" component={SalaEnVivoScreen} />
    </SalaStack.Navigator>
  );
};

// Botón personalizado para el tab de Sala con long press
const SalaTabButton = (props: any) => {
  const navigation = useNavigation<any>();
  
  const handleLongPress = () => {
    navigation.navigate('Sala', { screen: 'SalaEnVivo' });
  };
  
  return (
    <TouchableOpacity
      {...props}
      onLongPress={handleLongPress}
      delayLongPress={500}
    />
  );
};

// Componente del título del header con indicador de conexión SSE
const HeaderTitle: React.FC<{ title: string }> = ({ title }) => {
  const { sseConnected } = useSalaStore();

  return (
    <View style={styles.headerWrapper}>
      <View style={styles.headerTopRow}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>{title}</Text>
          {!sseConnected && (
            <View style={styles.offlineIndicator}>
              <View style={styles.ledRed} />
              <Text style={styles.offlineText}>canal en vivo caído</Text>
            </View>
          )}
        </View>
        <WaiterSwitcherGallery style={styles.galleryPosition} />
      </View>
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
          title: 'Sala',
          tabBarButton: (props) => <SalaTabButton {...props} />
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
  headerWrapper: {
    alignItems: 'stretch',
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  galleryPosition: {
    flexShrink: 1,
    marginLeft: spacing.md,
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
