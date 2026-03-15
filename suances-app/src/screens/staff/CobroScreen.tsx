import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Loading, Button } from '../../components/common';
import { 
  CompactHeader, 
  CompactCard, 
  SummaryRow, 
  PaymentMethodSelector,
  PaymentMethod,
  AmountInput 
} from '../../components/payment';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { useSalaStore } from '../../store/salaStore';
import { useAuthStore } from '../../store/authStore';
import type { TipoPago } from '../../types/sala';

// Tipos de propina sugeridos
const PROPINA_OPCIONES = [
  { label: 'Sin propina', value: 0 },
  { label: '5%', value: 0.05 },
  { label: '10%', value: 0.10 },
  { label: 'Otro', value: -1 },
];

// Helper para parsear montos (soporta coma y punto)
const parseAmount = (text: string): number => {
  if (!text) return 0;
  return parseFloat(text.replace(',', '.')) || 0;
};

export const CobroScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { comandaId, total: totalFromParams } = route.params || {};

  const [metodoPago, setMetodoPago] = useState<PaymentMethod>('TARJETA');
  const [montoRecibido, setMontoRecibido] = useState<string | null>(null);
  const [propina, setPropina] = useState('');
  const [propinaPorcentaje, setPropinaPorcentaje] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [numPagos, setNumPagos] = useState(2);
  const [pagosCompletados, setPagosCompletados] = useState(0);

  const {
    cuenta,
    loadingCuenta,
    loadingAccion,
    fetchCuenta,
    cobrarComanda,
  } = useSalaStore();

  const { user } = useAuthStore();
  const isOwnerOrManager = user?.rol === 'OWNER' || user?.rol === 'MANAGER';

  useFocusEffect(
    useCallback(() => {
      fetchCuenta(comandaId);
    }, [comandaId, fetchCuenta])
  );

  // Calcular el total base y valores derivados
  const totalBase = cuenta?.total ?? totalFromParams ?? 0;
  const cantidadPropina = parseAmount(propina);
  const totalConPropina = totalBase + cantidadPropina;

  // Inicializar monto cuando cambia el total (cuenta o params)
  useEffect(() => {
    if (totalBase > 0 && !montoRecibido) {
      const montoInicial = showSplitModal && numPagos > 1 
        ? (totalBase / numPagos) 
        : totalBase;
      setMontoRecibido(montoInicial.toFixed(2));
    }
  }, [totalBase]);

  // Cuando cambia el número de pagos o modo split, recalcular monto
  useEffect(() => {
    if (totalBase > 0 && montoRecibido) {
      const nuevoMonto = showSplitModal && numPagos > 1 
        ? (totalConPropina / numPagos) 
        : totalConPropina;
      setMontoRecibido(nuevoMonto.toFixed(2));
    }
  }, [showSplitModal, numPagos]);

  // Propina - calcular cuando cambia el porcentaje
  useEffect(() => {
    if (totalBase && cantidadPropina > 0) {
      const montoPropina = totalBase * cantidadPropina;
      setPropina(montoPropina.toFixed(2));
    }
  }, [cantidadPropina, totalBase]);

  const total = totalBase;
  const monto = parseAmount(montoRecibido || '');
  const montoPorPago = numPagos > 0 ? totalConPropina / numPagos : totalConPropina;
  const cambio = Math.max(0, monto - (showSplitModal ? montoPorPago : totalConPropina));

  const handlePropinaSelect = (opcion: typeof PROPINA_OPCIONES[0]) => {
    if (opcion.value === -1) {
      // Modo manual
      setPropinaPorcentaje(-1);
      setPropina('');
    } else if (opcion.value === 0) {
      setPropinaPorcentaje(0);
      setPropina('');
    } else {
      setPropinaPorcentaje(opcion.value);
    }
  };

  const handleCobrar = () => {
    const montoAConfirmar = showSplitModal ? montoPorPago : totalConPropina;
    
    // Para tarjeta, siempre permitir (el terminal gestiona el monto)
    // Para efectivo, verificar que el monto recibido sea suficiente
    if (metodoPago === 'EFECTIVO') {
      if (!montoRecibido || monto < montoAConfirmar) {
        Alert.alert('Error', `El monto recibido es menor que el importe a cobrar (${montoAConfirmar.toFixed(2)}€)`);
        return;
      }
    }
    setShowConfirmModal(true);
  };

  const handleConfirmarPago = async () => {
    setShowConfirmModal(false);
    
    try {
      // Para tarjeta, usar el totalConPropina como monto
      // Para efectivo, usar el monto introducido (o el total si está vacío)
      const montoAPagar = metodoPago === 'TARJETA' 
        ? totalConPropina 
        : (showSplitModal ? montoPorPago : (monto > 0 ? monto : totalConPropina));
      
      const resultado = await cobrarComanda(comandaId, {
        tipoPago: metodoPago,
        montoRecibido: montoAPagar,
        propina: (!showSplitModal && cantidadPropina > 0) ? cantidadPropina : undefined,
      });

      if (showSplitModal) {
        const nuevosPagos = pagosCompletados + 1;
        setPagosCompletados(nuevosPagos);
        
        if (nuevosPagos >= numPagos) {
          Alert.alert(
            'Cobro completado',
            `Se han realizado ${nuevosPagos} pagos por un total de ${totalConPropina.toFixed(2)}€`,
            [{ text: 'Aceptar', onPress: () => navigation.replace('SalaMain') }]
          );
        } else {
          Alert.alert(
            'Pago registrado',
            `${nuevosPagos} de ${numPagos} pagos completados\nFaltan: ${((totalConPropina) - (montoPorPago * nuevosPagos)).toFixed(2)}€`,
            [{ text: 'Continuar', onPress: () => setMontoRecibido(montoPorPago.toFixed(2)) }]
          );
        }
      } else {
        const cambioReal = metodoPago === 'TARJETA' ? 0 : cambio;
        Alert.alert(
          'Cobro completado',
          `Total: ${totalConPropina.toFixed(2)}€\n${cambioReal > 0 ? `Cambio: ${cambioReal.toFixed(2)}€\n` : ''}${cantidadPropina > 0 ? `Propina: ${cantidadPropina.toFixed(2)}€` : ''}`,
          [
            {
              text: 'Aceptar',
              onPress: () => navigation.replace('SalaMain'),
            },
          ]
        );
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Error al cobrar');
    }
  };

  const handleMontoExacto = () => {
    if (showSplitModal) {
      setMontoRecibido(montoPorPago.toFixed(2));
    } else {
      setMontoRecibido(totalConPropina.toFixed(2));
    }
  };

  if (loadingCuenta || !cuenta) {
    return (
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        <CompactHeader title="Cobro" />
        <Loading fullScreen message="Cargando cuenta..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <CompactHeader 
        title="Cobro"
        subtitle={`Mesa ${cuenta.mesaNumero} · ${cuenta.codigo}`}
      />

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Total Destacado */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total a cobrar</Text>
          <Text style={styles.totalAmount}>{total.toFixed(2)}€</Text>
          {cuenta?.items && (
            <Text style={styles.totalItems}>
              {cuenta.items.reduce((sum, item) => sum + item.cantidad, 0)} artículos
            </Text>
          )}
        </View>

        {/* Dividir Cuenta */}
        <CompactCard padding="sm" style={[styles.splitCard, showSplitModal && styles.splitCardActive]}>
          <TouchableOpacity 
            style={styles.splitHeader}
            onPress={() => {
              setShowSplitModal(!showSplitModal);
              if (!showSplitModal) {
                setPagosCompletados(0);
                setNumPagos(2);
              }
            }}
          >
            <View style={styles.splitHeaderLeft}>
              <Ionicons 
                name={showSplitModal ? 'checkbox' : 'checkbox-outline'} 
                size={20} 
                color={showSplitModal ? colors.success : colors.primary} 
              />
              <Text style={[styles.splitTitle, showSplitModal && styles.splitTitleActive]}>
                Dividir cuenta
              </Text>
            </View>
            {showSplitModal && (
              <Text style={styles.splitSubtitle}>
                {pagosCompletados}/{numPagos} pagos
              </Text>
            )}
          </TouchableOpacity>
          
          {showSplitModal && (
            <View style={styles.splitContent}>
              <View style={styles.splitControls}>
                <TouchableOpacity 
                  style={styles.splitButton}
                  onPress={() => setNumPagos(Math.max(1, numPagos - 1))}
                >
                  <Ionicons name="remove" size={16} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.splitNumber}>{numPagos}</Text>
                <TouchableOpacity 
                  style={styles.splitButton}
                  onPress={() => setNumPagos(numPagos + 1)}
                >
                  <Ionicons name="add" size={16} color={colors.text} />
              </TouchableOpacity>
              <Text style={styles.splitLabel}>pagos</Text>
            </View>
            <Text style={styles.splitAmount}>
              {montoPorPago.toFixed(2)}€/pago
            </Text>
          </View>
        )}
        </CompactCard>

        {/* Método de Pago */}
        <CompactCard padding="sm">
          <PaymentMethodSelector 
            selected={metodoPago}
            onSelect={setMetodoPago}
          />
        </CompactCard>

        {/* Efectivo */}
        {metodoPago === 'EFECTIVO' && (
          <CompactCard padding="sm">
            <AmountInput
              label="Monto recibido"
              value={montoRecibido || ''}
              onChange={setMontoRecibido}
              showQuickAdd
              quickAddValues={[5, 10, 20, 50]}
            />
            
            <TouchableOpacity 
              style={styles.exactButton}
              onPress={handleMontoExacto}
            >
              <Text style={styles.exactButtonText}>
                {showSplitModal 
                  ? `Pago exacto (${montoPorPago.toFixed(2)}€)` 
                  : `Pago exacto (${totalConPropina.toFixed(2)}€)`}
              </Text>
            </TouchableOpacity>

            {cambio > 0 && (
              <View style={styles.cambioContainer}>
                <Text style={styles.cambioLabel}>Cambio a devolver</Text>
                <Text style={styles.cambioValue}>{cambio.toFixed(2)}€</Text>
              </View>
            )}
          </CompactCard>
        )}

        {/* Propina */}
        <CompactCard padding="sm">
          <Text style={styles.sectionTitle}>Propina</Text>
          <View style={styles.propinaOptions}>
            {PROPINA_OPCIONES.map((opcion) => (
              <TouchableOpacity
                key={opcion.label}
                style={[
                  styles.propinaChip,
                  ((opcion.value === 0 && propinaPorcentaje === 0) || 
                   (opcion.value > 0 && propinaPorcentaje === opcion.value)) && 
                   styles.propinaChipActive,
                  opcion.value === -1 && propinaPorcentaje === -1 && styles.propinaChipActive,
                ]}
                onPress={() => handlePropinaSelect(opcion)}
              >
                <Text style={[
                  styles.propinaChipText,
                  ((opcion.value === 0 && propinaPorcentaje === 0) || 
                   (opcion.value > 0 && propinaPorcentaje === opcion.value)) && 
                   styles.propinaChipTextActive,
                  opcion.value === -1 && propinaPorcentaje === -1 && styles.propinaChipTextActive,
                ]}>
                  {opcion.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {propinaPorcentaje === -1 && (
            <AmountInput
              label="Otra cantidad"
              value={propina}
              onChange={setPropina}
              placeholder="0.00"
            />
          )}
          
          {cantidadPropina > 0 && (
            <View style={styles.propinaResumen}>
              <Text style={styles.propinaResumenText}>
                Propina: {cantidadPropina.toFixed(2)}€
              </Text>
            </View>
          )}
        </CompactCard>

        {/* Espacio para footer */}
        <View style={styles.footerSpace} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerRow}>
          <View>
            <Text style={styles.footerLabel}>
              {showSplitModal 
                ? `Pago ${pagosCompletados + 1} de ${numPagos}` 
                : 'Total a cobrar'}
            </Text>
            <Text style={styles.footerTotal}>
              {showSplitModal ? `${montoPorPago.toFixed(2)}€` : `${totalConPropina.toFixed(2)}€`}
            </Text>
          </View>
          <Button
            title={showSplitModal ? 'Cobrar' : 'Confirmar'}
            onPress={handleCobrar}
            loading={loadingAccion}
            disabled={metodoPago === 'EFECTIVO' && monto < (showSplitModal ? montoPorPago : totalConPropina)}
            variant="primary"
            size="medium"
          />
        </View>
      </View>

      {/* Modal de Confirmación */}
      <Modal
        visible={showConfirmModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirmar Pago</Text>
            
            <View style={styles.modalDetail}>
              <Text style={styles.modalLabel}>Total:</Text>
              <Text style={styles.modalAmount}>{totalConPropina.toFixed(2)}€</Text>
            </View>
            
            {metodoPago === 'EFECTIVO' && cambio > 0 && (
              <View style={styles.modalDetail}>
                <Text style={styles.modalLabel}>Cambio:</Text>
                <Text style={[styles.modalAmount, styles.modalAmountHighlight]}>
                  {cambio.toFixed(2)}€
                </Text>
              </View>
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
                <Text style={styles.modalButtonTextConfirm}>Confirmar</Text>
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
    flex: 1,
  },
  scrollContent: {
    padding: spacing.sm,
    gap: spacing.sm,
  },
  totalCard: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  totalLabel: {
    ...typography.body,
    color: colors.surface,
    opacity: 0.8,
    marginBottom: spacing.xs,
  },
  totalAmount: {
    ...typography.h1,
    color: colors.surface,
    fontWeight: '700',
    fontSize: 42,
  },
  totalItems: {
    ...typography.caption,
    color: colors.surface,
    opacity: 0.7,
    marginTop: spacing.xs,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3,
  },
  itemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemCantidad: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textSecondary,
    marginRight: spacing.xs,
    minWidth: 28,
  },
  itemNombre: {
    ...typography.bodySmall,
    color: colors.text,
    flex: 1,
  },
  itemSubtotal: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.text,
  },
  emptyText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.sm,
  },
  splitCard: {
    backgroundColor: colors.primary + '08',
  },
  splitCardActive: {
    backgroundColor: colors.success + '10',
    borderColor: colors.success,
    borderWidth: 1,
  },
  splitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  splitHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  splitTitle: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.primary,
  },
  splitTitleActive: {
    color: colors.success,
  },
  splitSubtitle: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '600',
  },
  splitContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  splitControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  splitButton: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  splitNumber: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text,
    minWidth: 24,
    textAlign: 'center',
  },
  splitLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  splitAmount: {
    ...typography.h3,
    fontWeight: '700',
    color: colors.success,
  },
  exactButton: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.primary + '10',
    borderRadius: borderRadius.full,
    marginTop: spacing.xs,
  },
  exactButtonText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  cambioContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cambioLabel: {
    ...typography.body,
    color: colors.text,
  },
  cambioValue: {
    ...typography.h2,
    color: colors.success,
    fontWeight: '700',
  },
  propinaOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  propinaChip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  propinaChipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  propinaChipText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  propinaChipTextActive: {
    color: colors.surface,
  },
  propinaResumen: {
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  propinaResumenText: {
    ...typography.bodySmall,
    color: colors.accent,
    fontWeight: '600',
  },
  footerSpace: {
    height: 80,
  },
  footer: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: spacing.sm,
    paddingBottom: spacing.md,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  footerTotal: {
    ...typography.h2,
    fontWeight: '700',
    color: colors.text,
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
    padding: spacing.lg,
    width: '85%',
    maxWidth: 320,
  },
  modalTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  modalDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  modalLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  modalAmount: {
    ...typography.h2,
    color: colors.text,
    fontWeight: '700',
  },
  modalAmountHighlight: {
    color: colors.success,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  modalButton: {
    flex: 1,
    paddingVertical: spacing.sm,
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
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
  },
  modalButtonTextConfirm: {
    ...typography.bodySmall,
    color: colors.surface,
    fontWeight: '600',
  },
});
