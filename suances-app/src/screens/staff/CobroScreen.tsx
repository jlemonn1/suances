import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Loading, Button } from '../../components/common';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { useSalaStore } from '../../store/salaStore';
import { useAuthStore } from '../../store/authStore';
import type { TipoPago, CuentaItem } from '../../types/sala';

const METODOS_PAGO: { label: string; value: TipoPago; icon: keyof typeof Ionicons.glyphMap }[] = [
  { label: 'Efectivo', value: 'EFECTIVO', icon: 'cash-outline' },
  { label: 'Tarjeta', value: 'TARJETA', icon: 'card-outline' },
  { label: 'En Mesa', value: 'MESA', icon: 'swap-horizontal-outline' },
];

const MONEDAS_SUGERIDAS = [10, 20, 50, 100];

export const CobroScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { comandaId } = route.params || {};

  const [metodoPago, setMetodoPago] = useState<TipoPago>('TARJETA');
  const [montoRecibido, setMontoRecibido] = useState('');
  const [propina, setPropina] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const {
    comandaActiva,
    cuenta,
    loadingCuenta,
    loadingAccion,
    fetchComanda,
    fetchCuenta,
    cobrarComanda,
  } = useSalaStore();

  const { user } = useAuthStore();
  const isOwnerOrManager = user?.rol === 'OWNER' || user?.rol === 'MANAGER';

  useFocusEffect(
    useCallback(() => {
      fetchComanda(comandaId);
      fetchCuenta(comandaId);
    }, [comandaId, fetchComanda, fetchCuenta])
  );

  useEffect(() => {
    if (cuenta?.total) {
      setMontoRecibido(cuenta.total.toString());
    }
  }, [cuenta?.total]);

  const total = cuenta?.total || comandaActiva?.total || 0;
  const monto = parseFloat(montoRecibido) || 0;
  const montoPropina = parseFloat(propina) || 0;
  const cambio = Math.max(0, monto - total);

  const handleCobrar = () => {
    if (metodoPago === 'EFECTIVO' && monto < total) {
      Alert.alert('Error', 'El monto recibido es menor que el total');
      return;
    }
    
    // Mostrar modal de confirmación según el método de pago
    setShowConfirmModal(true);
  };

  const handleConfirmarPago = async () => {
    setShowConfirmModal(false);
    
    try {
      const resultado = await cobrarComanda(comandaId, {
        tipoPago: metodoPago,
        montoRecibido: monto,
        propina: montoPropina > 0 ? montoPropina : undefined,
      });

      Alert.alert(
        'Cobro completado',
        `Cambio: ${(resultado.cambio || 0).toFixed(2)}€\nPropina: ${(resultado.propina || 0).toFixed(2)}€`,
        [
          {
            text: 'Aceptar',
            onPress: () => {
              navigation.navigate('Sala');
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Error al cobrar');
    }
  };

  const handleMonedaSugerida = (valor: number) => {
    setMontoRecibido((monto + valor).toString());
  };

  if (loadingCuenta || !cuenta) {
    return <Loading fullScreen message="Cargando cuenta..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Cuenta</Text>
          <Text style={styles.codigo}>{cuenta.codigo}</Text>
          <Text style={styles.mesaInfo}>Mesa {cuenta.mesaNumero}</Text>
        </View>

        <View style={styles.itemsContainer}>
          <Text style={styles.sectionTitle}>Detalle</Text>
          {cuenta.items && cuenta.items.length > 0 ? (
            cuenta.items.map((item: CuentaItem, index: number) => (
              <View key={item.pedidoId || index} style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemCantidad}>{item.cantidad}x</Text>
                  <Text style={styles.itemNombre}>{item.nombrePlato}</Text>
                </View>
                <Text style={styles.itemSubtotal}>{(item.subtotal || 0).toFixed(2)}€</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No hay items en la cuenta</Text>
          )}
        </View>

        <View style={styles.totalesContainer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>{(cuenta.subtotal || 0).toFixed(2)}€</Text>
          </View>

          {cuenta.descuentoPorcentaje > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>
                Descuento ({cuenta.descuentoPorcentaje}%)
              </Text>
              <Text style={[styles.totalValue, { color: colors.error }]}>
                -{(cuenta.descuentoMonto || 0).toFixed(2)}€
              </Text>
            </View>
          )}

          {cuenta.impuestos?.monto > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>
                IVA ({cuenta.impuestos.tasa}%)
              </Text>
              <Text style={styles.totalValue}>
                +{(cuenta.impuestos.monto || 0).toFixed(2)}€
              </Text>
            </View>
          )}

          <View style={[styles.totalRow, styles.totalFinal]}>
            <Text style={styles.totalLabelFinal}>Total</Text>
            <Text style={styles.totalValueFinal}>{total.toFixed(2)}€</Text>
          </View>
        </View>

        <View style={styles.metodoContainer}>
          <Text style={styles.sectionTitle}>Método de pago</Text>
          <View style={styles.metodoRow}>
            {METODOS_PAGO.map((metodo) => (
              <TouchableOpacity
                key={metodo.value}
                style={[
                  styles.metodoOption,
                  metodoPago === metodo.value && styles.metodoOptionActive,
                ]}
                onPress={() => setMetodoPago(metodo.value)}
              >
                <Ionicons
                  name={metodo.icon}
                  size={24}
                  color={metodoPago === metodo.value ? colors.surface : colors.primary}
                />
                <Text
                  style={[
                    styles.metodoLabel,
                    metodoPago === metodo.value && styles.metodoLabelActive,
                  ]}
                >
                  {metodo.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {metodoPago === 'EFECTIVO' && (
          <View style={styles.efectivoContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Monto recibido</Text>
              <View style={styles.inputRow}>
                <Text style={styles.inputPrefix}>€</Text>
                <TextInput
                  style={styles.input}
                  value={montoRecibido}
                  onChangeText={setMontoRecibido}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            </View>

            <View style={styles.sugeridasContainer}>
              <Text style={styles.sugeridasLabel}>Sugeridas:</Text>
              <View style={styles.sugeridasRow}>
                {MONEDAS_SUGERIDAS.map((moneda) => (
                  <TouchableOpacity
                    key={moneda}
                    style={styles.sugeridaButton}
                    onPress={() => handleMonedaSugerida(moneda)}
                  >
                    <Text style={styles.sugeridaText}>+{moneda}€</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.cambioContainer}>
              <Text style={styles.cambioLabel}>Cambio</Text>
              <Text style={styles.cambioValue}>{cambio.toFixed(2)}€</Text>
            </View>
          </View>
        )}

        <View style={styles.propinaContainer}>
          <Text style={styles.inputLabel}>Propina (opcional)</Text>
          <View style={styles.inputRow}>
            <Text style={styles.inputPrefix}>€</Text>
            <TextInput
              style={styles.input}
              value={propina}
              onChangeText={setPropina}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerTotal}>
          <Text style={styles.footerLabel}>Total a cobrar</Text>
          <Text style={styles.footerTotalValue}>
            {(total + montoPropina).toFixed(2)}€
          </Text>
        </View>
        <Button
          title={`Confirmar Cobro ${metodoPago === 'EFECTIVO' ? `(${montoRecibido}€ recibido)` : ''}`}
          onPress={handleCobrar}
          loading={loadingAccion}
          disabled={metodoPago === 'EFECTIVO' && monto < total}
        />
      </View>

      {/* Modal de Confirmación de Pago */}
      <Modal
        visible={showConfirmModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirmar Pago</Text>
            
            {metodoPago === 'TARJETA' && (
              <>
                <Text style={styles.modalText}>Importe a cobrar:</Text>
                <Text style={styles.modalAmount}>{total.toFixed(2)}€</Text>
                <Text style={styles.modalHint}>Se procesará el pago con tarjeta</Text>
              </>
            )}
            
            {metodoPago === 'EFECTIVO' && (
              <>
                <Text style={styles.modalText}>Cantidad recibida:</Text>
                <Text style={styles.modalAmount}>{monto.toFixed(2)}€</Text>
                <Text style={styles.modalText}>Cambio a devolver:</Text>
                <Text style={[styles.modalAmount, styles.modalAmountHighlight]}>
                  {cambio.toFixed(2)}€
                </Text>
              </>
            )}
            
            {metodoPago === 'MESA' && (
              <>
                <Text style={styles.modalText}>Importe pendiente:</Text>
                <Text style={styles.modalAmount}>{total.toFixed(2)}€</Text>
                <Text style={styles.modalHint}>El pago se registrará como "En mesa"</Text>
              </>
            )}

            {montoPropina > 0 && (
              <Text style={styles.modalPropina}>Propina: {montoPropina.toFixed(2)}€</Text>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonCancel]} 
                onPress={() => setShowConfirmModal(false)}
              >
                <Text style={styles.modalButtonTextCancel}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonConfirm]} 
                onPress={handleConfirmarPago}
              >
                <Text style={styles.modalButtonTextConfirm}>Confirmar Pago</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.text,
  },
  codigo: {
    ...typography.h3,
    color: colors.primary,
  },
  mesaInfo: {
    ...typography.body,
    color: colors.textSecondary,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  itemsContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  itemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemCantidad: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textSecondary,
    marginRight: spacing.sm,
    minWidth: 30,
  },
  itemNombre: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  itemSubtotal: {
    ...typography.body,
    color: colors.text,
  },
  totalesContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  totalLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  totalValue: {
    ...typography.body,
    color: colors.text,
  },
  totalFinal: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
  },
  totalLabelFinal: {
    ...typography.h3,
    color: colors.text,
  },
  totalValueFinal: {
    ...typography.h2,
    color: colors.success,
  },
  metodoContainer: {
    marginBottom: spacing.lg,
  },
  metodoRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  metodoOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  metodoOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  metodoLabel: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.primary,
  },
  metodoLabelActive: {
    color: colors.surface,
  },
  efectivoContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    ...typography.bodySmall,
    fontWeight: '500',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
  },
  inputPrefix: {
    ...typography.h3,
    color: colors.textSecondary,
    marginRight: spacing.xs,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.sm,
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
  },
  sugeridasContainer: {
    marginBottom: spacing.md,
  },
  sugeridasLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  sugeridasRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  sugeridaButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.successLight,
    borderRadius: borderRadius.full,
  },
  sugeridaText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.success,
  },
  cambioContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cambioLabel: {
    ...typography.h3,
    color: colors.text,
  },
  cambioValue: {
    ...typography.h2,
    color: colors.success,
  },
  propinaContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  footer: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  footerLabel: {
    ...typography.h3,
    color: colors.text,
  },
  footerTotalValue: {
    ...typography.h1,
    color: colors.success,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    width: '80%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.md,
  },
  modalText: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  modalAmount: {
    ...typography.h1,
    color: colors.primary,
    marginBottom: spacing.md,
  },
  modalAmountHighlight: {
    color: colors.success,
  },
  modalHint: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: spacing.md,
  },
  modalPropina: {
    ...typography.body,
    color: colors.accent,
    marginBottom: spacing.md,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  modalButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalButtonConfirm: {
    backgroundColor: colors.success,
  },
  modalButtonTextCancel: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  modalButtonTextConfirm: {
    ...typography.body,
    color: colors.surface,
    fontWeight: '600',
  },
});
