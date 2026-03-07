import React, { useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Accelerometer } from 'expo-sensors';
import { AdminNotificationBar } from './AdminNotificationBar';
import { StaffView } from './StaffView';
import { useAdminModeStore } from '../../store/adminModeStore';
import { useAuthStore } from '../../store/authStore';
import { colors } from '../../theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Altura de la barra de admin (8% para que termine más abajo)
const ADMIN_BAR_HEIGHT = SCREEN_HEIGHT * 0.08;

// Configuración para detección de shake
const SHAKE_THRESHOLD = 2.5; // Umbral de aceleración (en g) - balance entre seguridad y usabilidad
const SHAKE_DEBOUNCE_MS = 500; // Tiempo mínimo entre shakes
const REQUIRED_SHAKES = 3; // Número de shakes requeridos en secuencia
const SHAKE_WINDOW_MS = 800; // Ventana de tiempo para detectar los shakes (750ms)

interface AdminOverlayProps {
  children: React.ReactNode;
}

export const AdminOverlay: React.FC<AdminOverlayProps> = ({ children }) => {
  const { isOwner } = useAuthStore();
  const { isAdminModeOpen, toggleAdminMode } = useAdminModeStore();
  const insets = useSafeAreaInsets();
  
  // Animación para slide desde abajo
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  
  // Refs para detección de shake
  const lastShakeTime = useRef(0);
  const subscriptionRef = useRef<any>(null);
  const shakeCount = useRef(0);
  const shakeWindowStart = useRef(0);
  const lastAcceleration = useRef(0);

  // Función para detectar shake basado en aceleración
  const detectShake = useCallback((data: { x: number; y: number; z: number }) => {
    const { x, y, z } = data;
    
    // Calcular magnitud de la aceleración (excluyendo gravedad)
    const acceleration = Math.sqrt(x * x + y * y + z * z);
    
    const now = Date.now();
    
    // Verificar debounce global
    if (now - lastShakeTime.current < SHAKE_DEBOUNCE_MS) {
      return;
    }
    
    // Detectar shake cuando hay un cambio brusco de aceleración
    // Esto detecta el "rebote" del movimiento
    const accelerationChange = Math.abs(acceleration - lastAcceleration.current);
    lastAcceleration.current = acceleration;
    
    // Shake detectado: aceleración alta Y cambio brusco
    if (acceleration > SHAKE_THRESHOLD && accelerationChange > 1.5) {
      // Iniciar nueva ventana de detección si es el primer shake
      if (shakeCount.current === 0) {
        shakeWindowStart.current = now;
      }
      
      // Verificar si estamos dentro de la ventana de tiempo
      if (now - shakeWindowStart.current <= SHAKE_WINDOW_MS) {
        shakeCount.current++;
        
        // Si alcanzamos el número requerido de shakes, activar
        if (shakeCount.current >= REQUIRED_SHAKES) {
          lastShakeTime.current = now;
          shakeCount.current = 0;
          shakeWindowStart.current = 0;
          toggleAdminMode();
        }
      } else {
        // Ventana expirada, reiniciar contador
        shakeCount.current = 1;
        shakeWindowStart.current = now;
      }
    }
  }, [toggleAdminMode]);

  // Efecto para configurar el acelerómetro
  useEffect(() => {
    if (!isOwner()) return;

    let isMounted = true;

    const setupAccelerometer = async () => {
      try {
        // Solicitar permisos si es necesario (iOS)
        await Accelerometer.requestPermissionsAsync();
        
        // Configurar intervalo de actualización (60fps)
        Accelerometer.setUpdateInterval(16);
        
        // Suscribirse a los datos del acelerómetro
        subscriptionRef.current = Accelerometer.addListener((data) => {
          if (isMounted) {
            detectShake(data);
          }
        });
      } catch (error) {
        console.error('Error setting up accelerometer:', error);
      }
    };

    setupAccelerometer();

    return () => {
      isMounted = false;
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
        subscriptionRef.current = null;
      }
    };
  }, [isOwner, detectShake]);

  // Efecto para animar entrada/salida
  useEffect(() => {
    if (isAdminModeOpen) {
      // Animar entrada
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animar salida
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isAdminModeOpen, slideAnim, opacityAnim]);

  // Si no es OWNER, solo renderizar children sin overlay
  if (!isOwner()) {
    return <>{children}</>;
  }

  return (
    <View style={styles.container}>
      {/* Contenido principal (OwnerNavigator) */}
      <View style={styles.mainContent}>
        {children}
      </View>

      {/* Overlay de Admin (aparece cuando isAdminModeOpen es true) */}
      <Animated.View 
        style={[
          styles.adminOverlay,
          {
            transform: [{ translateY: slideAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        {/* Barra azul que llega hasta arriba (safe area + barra de admin) */}
        <View style={[styles.adminBarContainer, { paddingTop: insets.top }]}>
          <View style={styles.adminBar}>
            <AdminNotificationBar />
          </View>
        </View>

        {/* Vista de Staff (94%) */}
        <View style={styles.staffContent}>
          <StaffView />
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainContent: {
    flex: 1,
  },
  adminOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.background,
    zIndex: 1000,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  adminBarContainer: {
    backgroundColor: '#1E40AF',
  },
  adminBar: {
    height: ADMIN_BAR_HEIGHT,
  },
  staffContent: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
