import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  InteractionManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Loading, EmptyState, Button } from '../../components/common';
import { RondaCard } from '../../components/comanda/RondaCard';
import { ComandaHeader } from '../../components/comanda/ComandaHeader';
import { ModalRondaActual } from '../../components/comanda/ModalRondaActual';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { useSalaStore } from '../../store/salaStore';
import { useAuthStore } from '../../store/authStore';

export const ComandaDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { comandaId } = route.params;

  const [showModalRonda, setShowModalRonda] = useState(false);

  const {
    comandaConRondas,
    loadingComandas,
    loadingAccion,
    fetchComandaConRondas,
    cerrarComanda,
    itemsSeleccionadosEliminar,
    modoEdicionEliminar,
    toggleSeleccionItemEliminar,
    limpiarSeleccionEliminar,
    setModoEdicionEliminar,
    eliminarItems,
  } = useSalaStore();

  const { user } = useAuthStore();
  const isOwnerOrManager = user?.rol === 'OWNER' || user?.rol === 'MANAGER';

  const getRondaActual = (): number => {
    return comandaConRondas?.numeroRondaActual || 1;
  };

  useFocusEffect(
    useCallback(() => {
      console.log('[ComandaDetail] Cargando comanda:', comandaId);
      fetchComandaConRondas(comandaId).catch((error) => {
        console.error('[ComandaDetail] Error cargando comanda:', error);
      });
      // Limpiar modo edición al salir
      return () => {
        limpiarSeleccionEliminar();
      };
    }, [comandaId])
  );

  const handlePedirCuenta = async () => {
    Alert.alert(
      'Pedir Cuenta',
      '¿Confirmas que quieres pedir la cuenta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              await cerrarComanda(comandaId, 'TARJETA');
              fetchComandaConRondas(comandaId);
            } catch (error) {
              Alert.alert('Error', 'No se pudo pedir la cuenta');
            }
          },
        },
      ]
    );
  };

  const handleCobrar = () => {
    navigation.navigate('Cobro', { comandaId });
  };

  const handleToggleEdicion = () => {
    setModoEdicionEliminar(!modoEdicionEliminar);
  };

  const handleCancelarEdicion = () => {
    limpiarSeleccionEliminar();
  };

  const handleEliminarSeleccionados = () => {
    if (itemsSeleccionadosEliminar.length === 0) return;

    Alert.prompt(
      'Eliminar Items',
      `¿Motivo para eliminar ${itemsSeleccionadosEliminar.length} item(s)?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async (motivo?: string) => {
            if (motivo && motivo.trim()) {
              try {
                await eliminarItems(comandaId, motivo);
                Alert.alert('Éxito', 'Items eliminados correctamente');
              } catch (error) {
                Alert.alert('Error', 'No se pudieron eliminar los items');
              }
            } else {
              Alert.alert('Error', 'Debes indicar un motivo');
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const handleCancelarComanda = () => {
    if (!isOwnerOrManager) {
      Alert.alert('Sin permisos', 'Solo el manager o owner puede cancelar comandas');
      return;
    }

    Alert.prompt(
      'Cancelar Comanda',
      '¿Motivo de cancelación?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async (motivo?: string) => {
            if (motivo && motivo.trim()) {
              try {
                await useSalaStore.getState().cancelarComanda(comandaId, motivo);
                navigation.goBack();
              } catch (error) {
                Alert.alert('Error', 'No se pudo cancelar la comanda');
              }
            }
          },
        },
      ],
      'plain-text'
    );
  };

  if (loadingComandas) {
    return <Loading fullScreen message="Cargando comanda..." />;
  }

  if (!comandaConRondas || !comandaConRondas.id) {
    console.error('[ComandaDetail] comandaConRondas es null o inválida:', comandaConRondas);
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
          <Text style={styles.errorText}>Error al cargar la comanda</Text>
          <Button
            title="Reintentar"
            onPress={() => fetchComandaConRondas(comandaId)}
            style={styles.retryButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  console.log('[ComandaDetail] Renderizando comanda:', { 
    id: comandaConRondas.id, 
    estado: comandaConRondas.estado, 
    rondasCount: comandaConRondas.rondas?.length 
  });
  
  const { 
    estado = 'ABIERTA', 
    rondas = [] 
  } = comandaConRondas;
  const puedeAgregarPedidos = estado === 'ABIERTA' || estado === 'EN_PREPARACION';
  const puedePedirCuenta = estado === 'SERVIDA';
  const puedeCobrar = estado === 'CUENTA';

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      {/* Header compacto con toda la info */}
      <ComandaHeader
        comanda={comandaConRondas}
        isOwnerOrManager={isOwnerOrManager}
        modoEdicion={modoEdicionEliminar}
        itemsSeleccionados={itemsSeleccionadosEliminar}
        puedeAgregarPedidos={puedeAgregarPedidos}
        puedePedirCuenta={puedePedirCuenta}
        onAddPlatos={() => setShowModalRonda(true)}
        onFinalizar={handlePedirCuenta}
        onToggleEdicion={handleToggleEdicion}
        onCancelarEdicion={handleCancelarEdicion}
        onEliminarSeleccionados={handleEliminarSeleccionados}
        onCerrar={() => navigation.goBack()}
      />

      {/* Lista de Rondas - ocupa todo el espacio */}
      <View style={styles.contentContainer}>
        <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollContentContainer}>
          {!rondas || rondas.length === 0 ? (
            <EmptyState
              title="Sin pedidos"
              message="No hay pedidos en esta comanda"
            />
          ) : (
            rondas.filter(ronda => ronda && typeof ronda.numeroRonda === 'number').map((ronda) => (
              <RondaCard
                key={`ronda-${ronda.numeroRonda}`}
                ronda={ronda}
                modoEdicion={modoEdicionEliminar}
                itemsSeleccionados={itemsSeleccionadosEliminar}
                onSeleccionarItem={toggleSeleccionItemEliminar}
              />
            ))
          )}
        </ScrollView>

        {/* Botón Cancelar Comanda - flotante, solo para OWNER/MANAGER */}
        {isOwnerOrManager && estado !== 'COBRADA' && estado !== 'CANCELADA' && (
          <TouchableOpacity style={styles.cancelButtonFloating} onPress={handleCancelarComanda}>
            <Ionicons name="trash-outline" size={16} color={colors.error} />
            <Text style={styles.cancelTextFloating}>Cancelar</Text>
          </TouchableOpacity>
        )}
      </View>

      

    
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    flex: 1,
    position: 'relative',
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingTop: spacing.md,
    minHeight: '100%',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    ...typography.h3,
    color: colors.error,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  retryButton: {
    marginTop: spacing.md,
  },
  cancelButtonFloating: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.md,
    width: '30%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.error,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cancelTextFloating: {
    ...typography.bodySmall,
    color: colors.error,
    marginLeft: spacing.xs,
    fontWeight: '600',
  },
});
