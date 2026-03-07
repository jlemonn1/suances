import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../theme';
import { useIngredienteStore } from '../../store/ingredienteStore';
import { usePlatoStore } from '../../store/platoStore';
import { useAdminModeStore } from '../../store/adminModeStore';

interface NotificationItem {
  id: string;
  type: 'STOCK_BAJO' | 'STOCK_CRITICO' | 'PLATO_AGOTADO';
  title: string;
  message: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  bgColor: string;
}

export const AdminNotificationBar: React.FC = () => {
  const { closeAdminMode } = useAdminModeStore();
  const { stockCriticoAlertas, stockBajoAlertas } = useIngredienteStore();
  const { platosAgotados } = usePlatoStore();

  // Construir lista de notificaciones
  const notifications: NotificationItem[] = [
    ...stockCriticoAlertas.map((item) => ({
      id: `critico-${item.id}`,
      type: 'STOCK_CRITICO' as const,
      title: 'Stock Crítico',
      message: `${item.nombre}: Agotado`,
      icon: 'alert-circle' as const,
      iconColor: '#FFFFFF',
      bgColor: colors.error || '#EF4444',
    })),
    ...stockBajoAlertas.map((item) => ({
      id: `bajo-${item.id}`,
      type: 'STOCK_BAJO' as const,
      title: 'Stock Bajo',
      message: `${item.nombre}: ${item.stockActual} ${item.unidadMedida}`,
      icon: 'warning' as const,
      iconColor: '#FFFFFF',
      bgColor: colors.warning || '#F59E0B',
    })),
    ...platosAgotados.map((item) => ({
      id: `agotado-${item.id}`,
      type: 'PLATO_AGOTADO' as const,
      title: 'Plato Agotado',
      message: item.nombre,
      icon: 'restaurant' as const,
      iconColor: '#FFFFFF',
      bgColor: colors.textSecondary || '#6B7280',
    })),
  ];

  const totalNotifications = notifications.length;

  return (
    <View style={styles.container}>
      {/* Indicador visual de modo admin */}
      <TouchableOpacity 
        style={styles.adminIndicator} 
        onPress={closeAdminMode}
        activeOpacity={0.8}
      >
        <View style={styles.indicatorContent}>
          <Ionicons name="shield-checkmark" size={16} color={colors.surface} />
          <Text style={styles.adminText}>ADMIN</Text>
          {totalNotifications > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{totalNotifications}</Text>
            </View>
          )}
        </View>
        <Ionicons name="chevron-down" size={16} color={colors.surface} />
      </TouchableOpacity>

      {/* Scroll horizontal de notificaciones */}
      {totalNotifications > 0 ? (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.notificationsContainer}
        >
          {notifications.map((notification, index) => (
            <View 
              key={notification.id} 
              style={[
                styles.notificationCard,
                { backgroundColor: notification.bgColor }
              ]}
            >
              <Ionicons 
                name={notification.icon} 
                size={14} 
                color={notification.iconColor} 
                style={styles.notificationIcon}
              />
              <View style={styles.notificationTextContainer}>
                <Text style={styles.notificationTitle} numberOfLines={1}>
                  {notification.title}
                </Text>
                <Text style={styles.notificationMessage} numberOfLines={1}>
                  {notification.message}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Sin alertas activas</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E40AF', // Azul administrador
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  adminIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
    paddingBottom: spacing.xs,
  },
  indicatorContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adminText: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: spacing.xs,
    letterSpacing: 1,
  },
  badge: {
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  notificationsContainer: {
    paddingVertical: spacing.xs,
    gap: spacing.xs,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    marginRight: spacing.xs,
    minWidth: 140,
    maxWidth: 200,
  },
  notificationIcon: {
    marginRight: spacing.xs,
  },
  notificationTextContainer: {
    flex: 1,
  },
  notificationTitle: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  notificationMessage: {
    color: '#FFFFFF',
    fontSize: 9,
    opacity: 0.9,
    marginTop: 1,
  },
  emptyContainer: {
    paddingVertical: spacing.xs,
    alignItems: 'center',
  },
  emptyText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
  },
});
