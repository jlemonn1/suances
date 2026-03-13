import React, { useCallback, useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  InteractionManager,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Loading, EmptyState, Button, CustomAlert, CustomPrompt } from '../../components/common';
import { RondaCard } from '../../components/comanda/RondaCard';
import { ComandaHeader } from '../../components/comanda/ComandaHeader';
import { ModalRondaActual } from '../../components/comanda/ModalRondaActual';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { useSalaStore } from '../../store/salaStore';
import { useAuthStore } from '../../store/authStore';
import { usePersonalStore } from '../../store/personalStore';
import { personalService } from '../../services/personalService';
import { CreateAnotacionRequest } from '../../types/personal';

export const ComandaDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { comandaId } = route.params;

  const [showModalRonda, setShowModalRonda] = useState(false);
  const [fetchAttempted, setFetchAttempted] = useState(false);
  
  // Estado para alertas personalizadas
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    buttons: { text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' }[];
  }>({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    buttons: [{ text: 'OK' }],
  });

  // Estado para prompts personalizados
  const [promptConfig, setPromptConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error';
    placeholder: string;
    onConfirm: (text: string) => void;
  }>({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    placeholder: '',
    onConfirm: () => {},
  });

  const showAlert = useCallback((
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info',
    buttons: { text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' }[] = [{ text: 'OK' }]
  ) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      type,
      buttons,
    });
  }, []);

  const hideAlert = useCallback(() => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
  }, []);

  const showPrompt = useCallback((
    title: string,
    message: string,
    type: 'info' | 'warning' | 'error' = 'info',
    placeholder: string,
    onConfirm: (text: string) => void
  ) => {
    setPromptConfig({
      visible: true,
      title,
      message,
      type,
      placeholder,
      onConfirm,
    });
  }, []);

  const hidePrompt = useCallback(() => {
    setPromptConfig(prev => ({ ...prev, visible: false }));
  }, []);

  const {
    comandaConRondas,
    loadingComandas,
    errorComandas,
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
  const { registrarAnotacion } = usePersonalStore();
  const isOwnerOrManager = user?.rol === 'OWNER' || user?.rol === 'MANAGER';
  const [modoEspiaActivo, setModoEspiaActivo] = useState(false);

  useEffect(() => {
    const checkModoEspia = async () => {
      if (user?.id && (user.rol === 'WAITER' || user.rol === 'MANAGER')) {
        try {
          const personnel = await personalService.getPersonnelById(user.id);
          setModoEspiaActivo(personnel.modoEspia || false);
        } catch (error) {
          console.error('Error checking modo espía:', error);
        }
      }
    };
    checkModoEspia();
  }, [user]);

  const getRondaActual = (): number => {
    return comandaConRondas?.numeroRondaActual || 1;
  };

  useFocusEffect(
    useCallback(() => {
      console.log('[ComandaDetail] Cargando comanda:', comandaId);
      setFetchAttempted(true);
      fetchComandaConRondas(comandaId).catch((error) => {
        console.error('[ComandaDetail] Error cargando comanda:', error);
      });
      // Limpiar modo edición al salir
      return () => {
        limpiarSeleccionEliminar();
      };
    }, [comandaId])
  );

  const handlePedirCuenta = () => {
    // Navegar directamente a TicketScreen sin modal de resumen
    navigation.navigate('Ticket', { comandaId, modo: 'cerrar' });
  };

  const handleVerTicket = () => {
    navigation.navigate('Ticket', { comandaId, modo: 'ver' });
  };

  const handleCobrar = () => {
    navigation.navigate('Cobro', { comandaId });
  };

  const handleToggleEdicion = async () => {
    if (modoEspiaActivo) {
      await registrarIntentoEdicion();
      return;
    }
    setModoEdicionEliminar(!modoEdicionEliminar);
  };

  const handleCancelarEdicion = () => {
    limpiarSeleccionEliminar();
  };

  const handleEliminarSeleccionados = () => {
    if (modoEspiaActivo) {
      registrarIntentoEliminarItems();
      return;
    }
    
    if (itemsSeleccionadosEliminar.length === 0) return;

    showPrompt(
      'Eliminar Items',
      `¿Motivo para eliminar ${itemsSeleccionadosEliminar.length} item(s)?`,
      'warning',
      'Escribe el motivo...',
      async (motivo: string) => {
        if (motivo && motivo.trim()) {
          try {
            await eliminarItems(comandaId, motivo);
            showAlert('Éxito', 'Items eliminados correctamente', 'success');
          } catch (error) {
            showAlert('Error', 'No se pudieron eliminar los items', 'error');
          }
        } else {
          showAlert('Error', 'Debes indicar un motivo', 'warning');
        }
      }
    );
  };

  const handleCancelarComanda = () => {
    if (modoEspiaActivo) {
      registrarIntentoCancelar();
      return;
    }

    if (!isOwnerOrManager) {
      showAlert('Sin permisos', 'Solo el manager o owner puede cancelar comandas', 'warning');
      return;
    }

    showPrompt(
      'Cancelar Comanda',
      '¿Motivo de cancelación?',
      'warning',
      'Escribe el motivo...',
      async (motivo: string) => {
        if (motivo && motivo.trim()) {
          try {
            await useSalaStore.getState().cancelarComanda(comandaId, motivo);
            navigation.goBack();
          } catch (error) {
            showAlert('Error', 'No se pudo cancelar la comanda', 'error');
          }
        }
      }
    );
  };

  const registrarIntentoEdicion = async () => {
    if (!user?.id || !comandaConRondas) return;

    try {
      const data: CreateAnotacionRequest = {
        usuarioId: user.id,
        tipoAccion: 'EDITAR_COMANDA',
        comandaId: comandaId,
        mesaNumero: comandaConRondas.mesaNumero,
        reservaId: comandaConRondas.reservaId,
        detalle: `Intento de editar comanda ${comandaConRondas.codigo}`,
        exitoso: false,
      };

      await registrarAnotacion(data);
      showAlert(
        'Error',
        'No se pudo completar la acción. Inténtalo de nuevo más tarde.',
        'error'
      );
    } catch (error) {
      console.error('Error registrando anotación:', error);
      showAlert('Error', 'No se pudo completar la acción', 'error');
    }
  };

  const registrarIntentoCancelar = async () => {
    if (!user?.id || !comandaConRondas) return;

    showPrompt(
      'Cancelar Comanda',
      '¿Motivo de cancelación?',
      'warning',
      'Escribe el motivo...',
      async (motivo: string) => {
        if (motivo && motivo.trim()) {
          try {
            const data: CreateAnotacionRequest = {
              usuarioId: user.id,
              tipoAccion: 'CANCELAR_COMANDA',
              comandaId: comandaId,
              mesaNumero: comandaConRondas?.mesaNumero,
              reservaId: comandaConRondas?.reservaId,
              detalle: `Intento de cancelar comanda ${comandaConRondas?.codigo}. Motivo: ${motivo}`,
              exitoso: false,
            };

            await registrarAnotacion(data);
            showAlert(
              'Error',
              'No se pudo cancelar la comanda. Inténtalo de nuevo más tarde.',
              'error'
            );
          } catch (error) {
            console.error('Error registrando anotación:', error);
            showAlert('Error', 'No se pudo completar la acción', 'error');
          }
        }
      }
    );
  };

  const registrarIntentoEliminarItems = async () => {
    if (!user?.id || !comandaConRondas || itemsSeleccionadosEliminar.length === 0) return;

    showPrompt(
      'Eliminar Items',
      `¿Motivo para eliminar ${itemsSeleccionadosEliminar.length} item(s)?`,
      'warning',
      'Escribe el motivo...',
      async (motivo: string) => {
        if (motivo && motivo.trim()) {
          try {
            const data: CreateAnotacionRequest = {
              usuarioId: user.id,
              tipoAccion: 'ELIMINAR_ITEMS',
              comandaId: comandaId,
              mesaNumero: comandaConRondas?.mesaNumero,
              reservaId: comandaConRondas?.reservaId,
              detalle: `Intento de eliminar ${itemsSeleccionadosEliminar.length} item(s). Motivo: ${motivo}`,
              exitoso: false,
            };

            await registrarAnotacion(data);
            showAlert(
              'Error',
              'No se pudieron eliminar los items. Inténtalo de nuevo más tarde.',
              'error'
            );
            limpiarSeleccionEliminar();
          } catch (error) {
            console.error('Error registrando anotación:', error);
            showAlert('Error', 'No se pudo completar la acción', 'error');
          }
        }
      }
    );
  };

  // Botón flotante de añadir con animación
  const AddButton: React.FC = () => {
    const shimmerValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      const shimmerAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerValue, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.delay(1000),
        ])
      );
      shimmerAnimation.start();
      return () => shimmerAnimation.stop();
    }, [shimmerValue]);

    const shimmerTranslate = shimmerValue.interpolate({
      inputRange: [0, 1],
      outputRange: [-50, 70],
    });

    return (
      <TouchableOpacity 
        style={styles.addButtonFloating} 
        onPress={() => setShowModalRonda(true)} 
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color={colors.surface} />
        <Animated.View style={[styles.shimmer, { transform: [{ translateX: shimmerTranslate }] }]} />
      </TouchableOpacity>
    );
  };

  // Botón flotante de pedir cuenta con animación
  const PedirCuentaButton: React.FC = () => {
    const shimmerValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      const shimmerAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerValue, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.delay(500),
        ])
      );
      shimmerAnimation.start();
      return () => shimmerAnimation.stop();
    }, [shimmerValue]);

    const shimmerTranslate = shimmerValue.interpolate({
      inputRange: [0, 1],
      outputRange: [-50, 70],
    });

    // Si también está visible el botón de añadir, posicionar más arriba
    const buttonStyle = puedeAgregarPedidos 
      ? [styles.cuentaButtonFloating, styles.cuentaButtonWithAdd]
      : styles.cuentaButtonFloating;

    return (
      <TouchableOpacity 
        style={buttonStyle} 
        onPress={handlePedirCuenta} 
        activeOpacity={0.8}
      >
        <Ionicons name="receipt-outline" size={24} color={colors.surface} />
        <Animated.View style={[styles.shimmer, { transform: [{ translateX: shimmerTranslate }] }]} />
      </TouchableOpacity>
    );
  };

  // Botón flotante de cobrar (solo cuando cuenta está cerrada)
  const CobrarButton: React.FC = () => {
    return (
      <TouchableOpacity 
        style={styles.cobrarButtonFloating} 
        onPress={handleCobrar} 
        activeOpacity={0.8}
      >
        <Ionicons name="cash-outline" size={24} color={colors.surface} />
        <Text style={styles.cobrarButtonText}>Cobrar</Text>
      </TouchableOpacity>
    );
  };



  if (!fetchAttempted || loadingComandas) {
    return <Loading fullScreen message="Cargando comanda..." />;
  }

  if (!comandaConRondas || !comandaConRondas.id) {
    console.error('[ComandaDetail] comandaConRondas es null o inválida después de cargar:', {
      comandaConRondas,
      error: errorComandas,
    });
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
          <Text style={styles.errorText}>{errorComandas || 'Error al cargar la comanda'}</Text>
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
  
  // Verificar si hay items enviados a cocina (no pendientes)
  const tieneItemsEnviados = rondas.some(ronda => 
    ronda.pedidos.some(pedido => pedido.estado !== 'PENDIENTE')
  );
  
  const esCuentaCerrada = estado === 'CUENTA';
  const puedeAgregarPedidos = estado === 'ABIERTA' || estado === 'EN_PREPARACION';
  // Botón pedir cuenta visible en SERVIDA o EN_PREPARACION (con items enviados)
  const puedePedirCuenta = (estado === 'SERVIDA' || estado === 'EN_PREPARACION') && tieneItemsEnviados;
  const puedeCobrar = esCuentaCerrada;
  const puedeEditar = isOwnerOrManager || modoEspiaActivo;
  // Solo se puede cancelar cuando NO está en CUENTA ni COBRADA
  const puedeCancelar = isOwnerOrManager && estado !== 'CUENTA' && estado !== 'COBRADA';
  const puedeVerTicket = esCuentaCerrada;

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      {/* Header compacto con toda la info */}
      <ComandaHeader
        comanda={comandaConRondas}
        isOwnerOrManager={puedeEditar}
        modoEdicion={modoEdicionEliminar}
        itemsSeleccionados={itemsSeleccionadosEliminar}
        puedePedirCuenta={puedePedirCuenta}
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

        {/* Botón Añadir - flotante redondo, solo cuando se pueden agregar pedidos */}
        {puedeAgregarPedidos && <AddButton />}

        {/* Botón Pedir Cuenta - flotante redondo, solo cuando se puede pedir cuenta */}
        {puedePedirCuenta && <PedirCuentaButton />}

        {/* Botón Cobrar - flotante, solo cuando la cuenta está cerrada */}
        {puedeCobrar && <CobrarButton />}

        {/* Botón Ver Ticket - flotante, solo cuando la cuenta está cerrada */}
        {puedeVerTicket && (
          <TouchableOpacity 
            style={styles.verTicketButtonFloating}
            onPress={handleVerTicket}
            activeOpacity={0.8}
          >
            <Ionicons name="receipt-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
        )}

        {/* Botón Cancelar Comanda - flotante, solo para OWNER/MANAGER (NO cuando está en CUENTA) */}
        {puedeCancelar && (
          <TouchableOpacity 
            style={[
              styles.cancelCircleFloating,
              (puedeAgregarPedidos || puedePedirCuenta || puedeCobrar || puedeVerTicket) && styles.cancelButtonWithAdd
            ]} 
            onPress={handleCancelarComanda}
            activeOpacity={0.8}
          >
            <Ionicons name="trash-outline" size={20} color={colors.error} />
          </TouchableOpacity>
        )}
      </View>

      {/* Modal para añadir platos */}
      <ModalRondaActual
        visible={showModalRonda}
        onClose={() => setShowModalRonda(false)}
        comandaId={comandaId}
        numeroRonda={getRondaActual()}
        onRondaEnviada={() => {
          // Refrescar la comanda después de enviar
          fetchComandaConRondas(comandaId);
        }}
      />

      {/* Alerta personalizada */}
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        buttons={alertConfig.buttons}
        onDismiss={hideAlert}
      />

      {/* Prompt personalizado */}
      <CustomPrompt
        visible={promptConfig.visible}
        title={promptConfig.title}
        message={promptConfig.message}
        type={promptConfig.type}
        placeholder={promptConfig.placeholder}
        onConfirm={promptConfig.onConfirm}
        onCancel={hidePrompt}
        confirmStyle="destructive"
      />
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
  addButtonFloating: {
    position: 'absolute',
    bottom: 60,
    right: spacing.md,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    zIndex: 10,
  },
  cuentaButtonFloating: {
    position: 'absolute',
    bottom: 60,
    right: spacing.md,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    zIndex: 10,
  },
  cuentaButtonWithAdd: {
    bottom: 130, // Posicionar arriba del botón de añadir
  },
  cobrarButtonFloating: {
    position: 'absolute',
    bottom: 60,
    right: spacing.md,
    width: 'auto',
    minWidth: 100,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.success,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    zIndex: 10,
  },
  cobrarButtonText: {
    color: colors.surface,
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '600',
  },
  verTicketButtonFloating: {
    position: 'absolute',
    bottom: 130, // Arriba del botón de cobrar
    right: spacing.md,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    zIndex: 10,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    transform: [{ skewX: '-20deg' }],
  },
  cancelButtonWithAdd: {
    bottom: 200, // Mover arriba cuando hay botones FAB
  },
  cancelCircleFloating: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.md,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
});
