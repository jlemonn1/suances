import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Card } from '../../components/common';
import { colors, spacing, typography } from '../../theme';
import { useAuthStore } from '../../store/authStore';

interface PerfilScreenProps {
  navigation: any;
}

export const PerfilScreen: React.FC<PerfilScreenProps> = ({ navigation }) => {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  const getRolLabel = (rol: string) => {
    switch (rol) {
      case 'PROPIETARIO': return 'Propietario';
      case 'GERENTE': return 'Gerente';
      case 'CAMARERO': return 'Camarero';
      default: return rol;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.nombre?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </View>
        <Text style={styles.nombre}>{user?.nombre || 'Usuario'}</Text>
        <Text style={styles.rol}>{getRolLabel(user?.rol || '')}</Text>
      </View>

      <Card style={styles.card}>
        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <Text style={styles.menuText}>🚪 Cerrar Sesión</Text>
        </TouchableOpacity>
      </Card>

      <Text style={styles.version}>Suances v1.0.0</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    fontSize: 32,
    color: colors.surface,
    fontWeight: '600',
  },
  nombre: {
    ...typography.h2,
    color: colors.text,
  },
  rol: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  card: {
    marginTop: spacing.md,
  },
  menuItem: {
    paddingVertical: spacing.md,
  },
  menuText: {
    ...typography.body,
    color: colors.error,
  },
  version: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
