import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Card } from '../../components/common';
import { colors, spacing, typography } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { salaService } from '../../services/salaService';
import { useSalaStore } from '../../store/salaStore';
import { usePlatoStore } from '../../store/platoStore';
import { useIngredienteStore } from '../../store/ingredienteStore';
import { useTipoCartaOperativoStore } from '../../store/tipoCartaOperativoStore';
import { useSalaSSE } from '../../hooks/useSalaSSE';
import { useCartaSSE } from '../../hooks/useCartaSSE';

interface PerfilScreenProps {
  navigation?: any;
}

export const PerfilScreen: React.FC<PerfilScreenProps> = ({ navigation }) => {
  const { user, logout } = useAuthStore();
  const { fetchMesas, setSseConnected: setSalaSseConnected } = useSalaStore();
  const { fetchPlatos } = usePlatoStore();
  const { fetchIngredientes } = useIngredienteStore();
  const { fetchTiposCartaOperativos } = useTipoCartaOperativoStore();
  const [syncing, setSyncing] = useState(false);
  
  // Hooks SSE con key para forzar reconexión
  const { connect: connectSala, disconnect: disconnectSala } = useSalaSSE({ 
    enabled: true, 
    salaId: 'all' 
  });
  
  const { connect: connectCarta, disconnect: disconnectCarta } = useCartaSSE({ 
    enabled: true,
    onPlatoChanged: () => fetchPlatos(true),
    onTipoCartaChanged: () => fetchTiposCartaOperativos(),
  });

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

  const handleSincronizar = async () => {
    setSyncing(true);
    try {
      console.log('[PerfilScreen] Iniciando sincronización completa...');
      
      // 1. Desconectar SSE de sala y carta
      console.log('[PerfilScreen] Desconectando SSE...');
      disconnectSala();
      disconnectCarta();
      setSalaSseConnected(false);
      
      // 2. Llamar al backend para sincronizar carta y catálogo
      console.log('[PerfilScreen] Sincronizando backend...');
      let resultado;
      try {
        resultado = await salaService.sincronizarTodoCompleto();
        console.log('[PerfilScreen] Backend sincronizado:', resultado);
      } catch (syncError: any) {
        console.error('[PerfilScreen] Error en sincronización backend:', syncError);
        const statusCode = syncError?.response?.status;
        const errorMessage = syncError?.response?.data?.message || syncError?.message;
        
        if (statusCode === 403) {
          throw new Error('No tienes permisos para sincronizar. Contacta al administrador.');
        } else if (statusCode === 500) {
          throw new Error('Error en el servidor. Intenta de nuevo más tarde.');
        } else {
          throw new Error(errorMessage || 'Error al sincronizar con el servidor');
        }
      }
      
      // 3. Esperar un momento
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 4. Recargar todos los stores
      console.log('[PerfilScreen] Recargando stores...');
      await Promise.all([
        fetchMesas(true),
        fetchPlatos(true),
        fetchIngredientes(true),
        fetchTiposCartaOperativos(),
      ]);
      
      // 5. Reconectar SSE de sala y carta
      console.log('[PerfilScreen] Reconectando SSE...');
      connectSala();
      connectCarta();
      
      console.log('[PerfilScreen] Sincronización completada');
      Alert.alert(
        'Sincronización Completada',
        `✅ ${resultado.resultados.carta}\n✅ ${resultado.resultados.catalogo}\n\nTodos los datos han sido actualizados y el canal en vivo reconectado.`
      );
    } catch (error: any) {
      console.error('[PerfilScreen] Error en sincronización:', error);
      
      // Intentar reconectar SSE aunque haya fallado
      console.log('[PerfilScreen] Reconectando SSE después de error...');
      connectSala();
      connectCarta();
      
      Alert.alert(
        'Error de Sincronización',
        error?.message || 'No se pudo completar la sincronización'
      );
    } finally {
      setSyncing(false);
    }
  };

  const getRolLabel = (rol: string) => {
    switch (rol) {
      case 'OWNER': return 'Propietario';
      case 'MANAGER': return 'Gerente';
      case 'WAITER': return 'Camarero';
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
        <TouchableOpacity 
          style={[styles.menuItem, styles.syncItem]} 
          onPress={handleSincronizar}
          disabled={syncing}
        >
          {syncing ? (
            <View style={styles.syncingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.syncingText}>🔄 Sincronizando...</Text>
            </View>
          ) : (
            <Text style={styles.syncText}>🔄 Sincronizar Todo</Text>
          )}
        </TouchableOpacity>

        <View style={styles.separator} />

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
  syncItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  syncingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  syncText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  syncingText: {
    ...typography.body,
    color: colors.primary,
    marginLeft: spacing.sm,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
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
