import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../theme';
import { useIngredienteStore } from '../../store/ingredienteStore';
import { usePlatoStore } from '../../store/platoStore';

interface ToastNotificationProps {
  visible: boolean;
  onHide: () => void;
  onPress?: () => void;
}

type NotificationType = 'STOCK_BAJO' | 'STOCK_CRITICO' | 'PLATO_AGOTADO' | 'PLATO_DISPONIBLE';

interface NotificationData {
  type: NotificationType;
  title: string;
  message: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({ visible, onHide, onPress }) => {
  const [currentNotification, setCurrentNotification] = useState<NotificationData | null>(null);
  const { stockCriticoAlertas, stockBajoAlertas } = useIngredienteStore();
  const { platosAgotados } = usePlatoStore();
  
  const [opacity] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      // Priorizar notificaciones: crítico > bajo > agotado
      if (stockCriticoAlertas.length > 0) {
        const item = stockCriticoAlertas[0];
        setCurrentNotification({
          type: 'STOCK_CRITICO',
          title: 'Stock Crítico',
          icon: 'alert-circle' as const,
          iconColor: colors.error,
          message: `${item.nombre}: Stock agotado`,
        });
      } else if (stockBajoAlertas.length > 0) {
        const item = stockBajoAlertas[0];
        setCurrentNotification({
          type: 'STOCK_BAJO',
          title: 'Stock Bajo',
          icon: 'warning' as const,
          iconColor: colors.warning,
          message: `${item.nombre}: ${item.stockActual} ${item.unidadMedida} restantes`,
        });
      } else if (platosAgotados.length > 0) {
        const item = platosAgotados[0];
        setCurrentNotification({
          type: 'PLATO_AGOTADO',
          title: 'Plato Agotado',
          icon: 'restaurant' as const,
          iconColor: colors.textSecondary,
          message: `${item.nombre} no disponible`,
        });
      }

      // Animar entrada
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Auto ocultar después de 5 segundos
      const timer = setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          onHide();
        });
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [visible, stockCriticoAlertas, stockBajoAlertas, platosAgotados]);

  if (!visible || !currentNotification) return null;

  const getBackgroundColor = () => {
    switch (currentNotification.type) {
      case 'STOCK_CRITICO':
        return colors.error || '#EF4444';
      case 'STOCK_BAJO':
        return colors.warning || '#F59E0B';
      case 'PLATO_AGOTADO':
        return colors.textSecondary || '#6B7280';
      default:
        return colors.primary;
    }
  };

  return (
    <Animated.View style={[styles.container, { opacity, backgroundColor: getBackgroundColor() }]}>
      <TouchableOpacity style={styles.content} onPress={onPress} disabled={!onPress}>
        {currentNotification?.icon && (
          <Ionicons 
            name={currentNotification.icon} 
            size={20} 
            color={currentNotification.iconColor || colors.text} 
            style={styles.icon}
          />
        )}
        <View style={styles.textContainer}>
          <Text style={styles.title}>{currentNotification.title}</Text>
          <Text style={styles.message}>{currentNotification.message}</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.closeButton} onPress={onHide}>
        <Ionicons name="close" size={20} color={colors.text} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: spacing.sm,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...typography.body,
    color: colors.surface,
    fontWeight: '600',
  },
  message: {
    ...typography.caption,
    color: colors.surface,
    opacity: 0.9,
    marginTop: spacing.xs,
  },
  closeButton: {
    padding: spacing.sm,
  },
  closeText: {
    color: colors.surface,
    fontSize: 16,
  },
});
