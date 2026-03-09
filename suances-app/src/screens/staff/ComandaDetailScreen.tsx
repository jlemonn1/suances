import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Loading, EmptyState, Button } from '../../components/common';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { useSalaStore } from '../../store/salaStore';
import { useAuthStore } from '../../store/authStore';
import type { Pedido, ComandaEstado } from '../../types/sala';
import { BottomSheetCarta } from './BottomSheetCarta';

export const ComandaDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { comandaId } = route.params;

  const [showCarta, setShowCarta] = useState(false);

  const {
    comandaActiva,
    loadingComandas,
    loadingAccion,
    fetchComanda,
    cambiarEstadoPedido,
    cerrarComanda,
  } = useSalaStore();

  const { user } = useAuthStore();

  const isOwnerOrManager = user?.rol === 'OWNER' || user?.rol === 'MANAGER';

  useFocusEffect(
    useCallback(() => {
      fetchComanda(comandaId);
    }, [comandaId, fetchComanda])
  );

  const handleServirPedido = async (pedidoId: string) => {
    try {
      await cambiarEstadoPedido(pedidoId, 'SERVIDO');
    } catch (error) {
      Alert.alert('Error', 'No se pudo marcar el pedido como servido');
    }
  };

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
              fetchComanda(comandaId);
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

  const getEstadoColor = (estado: string): string => {
    switch (estado) {
      case 'PENDIENTE':
        return colors.warning;
      case 'EN_PREPARACION':
        return colors.primary;
      case 'LISTO':
        return colors.success;
      case 'SERVIDO':
        return colors.success;
      case 'CANCELADO':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getEstadoIcon = (estado: string): keyof typeof Ionicons.glyphMap => {
    switch (estado) {
      case 'PENDIENTE':
        return 'time-outline';
      case 'EN_PREPARACION':
        return 'flame-outline';
      case 'LISTO':
        return 'checkmark-circle';
      case 'SERVIDO':
        return 'checkmark-done';
      case 'CANCELADO':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  const renderPedido = ({ item }: { item: Pedido }) => {
    const canServir = item.estado === 'PENDIENTE' || item.estado === 'LISTO';

    return (
      <View style={styles.pedidoCard}>
        <View style={styles.pedidoHeader}>
          <View style={styles.pedidoInfo}>
            <Text style={styles.pedidoNombre}>{item.nombrePlato}</Text>
            <Text style={styles.pedidoCantidad}>x{item.cantidad}</Text>
          </View>
          <View style={[styles.estadoBadge, { backgroundColor: getEstadoColor(item.estado) }]}>
            <Ionicons
              name={getEstadoIcon(item.estado)}
              size={12}
              color={colors.surface}
            />
            <Text style={styles.estadoText}>{item.estado}</Text>
          </View>
        </View>

        {item.notas && (
          <Text style={styles.pedidoNotas}>Nota: {item.notas}</Text>
        )}

        <View style={styles.pedidoFooter}>
          <Text style={styles.pedidoSubtotal}>
            {(item.precioUnitario * item.cantidad).toFixed(2)}€
          </Text>
          {canServir && (
            <Button
              title="Servir"
              size="small"
              variant="outline"
              onPress={() => handleServirPedido(item.id)}
              loading={loadingAccion}
            />
          )}
        </View>
      </View>
    );
  };

  if (loadingComandas || !comandaActiva) {
    return <Loading fullScreen message="Cargando comanda..." />;
  }

  const { estado, total, numeroComensales, pedidos } = comandaActiva;

  const puedeAgregarPedidos = estado === 'ABIERTA' || estado === 'EN_PREPARACION';
  const puedePedirCuenta = estado === 'SERVIDA';
  const puedeCobrar = estado === 'CUENTA';

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <View style={styles.codigoContainer}>
            <Text style={styles.codigo}>{comandaActiva.codigo}</Text>
            <View style={[styles.estadoBadgeHeader, { backgroundColor: getEstadoColor(estado) }]}>
              <Text style={styles.estadoTextHeader}>{estado}</Text>
            </View>
          </View>
          <Text style={styles.mesaInfo}>
            Mesa {comandaActiva.mesaNumero} · {numeroComensales} comensales
          </Text>
          <Text style={styles.camareroInfo}>
            <Ionicons name="person-outline" size={14} color={colors.textSecondary} />{' '}
            {comandaActiva.camareroNombre}
          </Text>
        </View>
      </View>

      <View style={styles.resumenBar}>
        <View style={styles.resumenItem}>
          <Text style={styles.resumenLabel}>Total</Text>
          <Text style={styles.resumenTotal}>{total.toFixed(2)}€</Text>
        </View>
        <View style={styles.resumenItem}>
          <Text style={styles.resumenLabel}>Pedidos</Text>
          <Text style={styles.resumenValue}>{pedidos?.length || 0}</Text>
        </View>
      </View>

      <FlatList
        data={pedidos || []}
        keyExtractor={(item) => item.id}
        renderItem={renderPedido}
        contentContainerStyle={pedidos?.length === 0 ? styles.emptyContainer : styles.list}
        ListEmptyComponent={
          <EmptyState
            title="Sin pedidos"
            message="No hay pedidos en esta comanda"
          />
        }
      />

      <View style={styles.footer}>
        {puedeAgregarPedidos && (
          <Button
            title="Agregar Pedido"
            onPress={() => setShowCarta(true)}
            style={styles.agregarButton}
          />
        )}

        {puedePedirCuenta && (
          <Button
            title="Pedir Cuenta"
            onPress={handlePedirCuenta}
            variant="secondary"
            loading={loadingAccion}
            style={styles.cuentaButton}
          />
        )}

        {puedeCobrar && (
          <Button
            title="Cobrar"
            onPress={handleCobrar}
            style={styles.cobrarButton}
          />
        )}

        {isOwnerOrManager && estado !== 'COBRADA' && estado !== 'CANCELADA' && (
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancelarComanda}>
            <Ionicons name="trash-outline" size={18} color={colors.error} />
            <Text style={styles.cancelText}>Cancelar Comanda</Text>
          </TouchableOpacity>
        )}
      </View>

      <BottomSheetCarta
        visible={showCarta}
        comandaId={comandaId}
        onClose={() => setShowCarta(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerInfo: {
    gap: spacing.xs,
  },
  codigoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  codigo: {
    ...typography.h2,
    color: colors.text,
  },
  estadoBadgeHeader: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  estadoTextHeader: {
    ...typography.caption,
    color: colors.surface,
    fontWeight: '600',
  },
  mesaInfo: {
    ...typography.body,
    color: colors.text,
  },
  camareroInfo: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  resumenBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  resumenItem: {
    flex: 1,
    alignItems: 'center',
  },
  resumenLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  resumenTotal: {
    ...typography.h2,
    color: colors.success,
  },
  resumenValue: {
    ...typography.h3,
    color: colors.text,
  },
  list: {
    padding: spacing.md,
  },
  emptyContainer: {
    flex: 1,
  },
  pedidoCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  pedidoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  pedidoInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  pedidoNombre: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  pedidoCantidad: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  estadoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  estadoText: {
    ...typography.caption,
    color: colors.surface,
    fontWeight: '600',
  },
  pedidoNotas: {
    ...typography.caption,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: spacing.xs,
  },
  pedidoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  pedidoSubtotal: {
    ...typography.body,
    fontWeight: '600',
    color: colors.accent,
  },
  footer: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  agregarButton: {},
  cuentaButton: {},
  cobrarButton: {},
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  cancelText: {
    ...typography.bodySmall,
    color: colors.error,
  },
});
