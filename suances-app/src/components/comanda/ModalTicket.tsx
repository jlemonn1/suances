import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../../theme';
import type { TicketResponse, TipoTicket } from '../../types/sala';

interface ModalTicketProps {
  visible: boolean;
  onClose: () => void;
  ticket: TicketResponse | null;
  onImprimir?: () => void;
  tituloPersonalizado?: string;
}

const formatearTipoRonda = (tipo: string): string => {
  const tipos: Record<string, string> = {
    'ENTRANTE': 'Entrantes',
    'PRIMERO': 'Primeros',
    'SEGUNDO': 'Segundos',
    'BEBIDA': 'Bebidas',
    'POSTRE': 'Postres',
    'SIN_ORDEN': 'Sin orden',
  };
  return tipos[tipo] || tipo;
};

const getTituloTicket = (tipo: TipoTicket): string => {
  switch (tipo) {
    case 'COBRO':
      return 'Ticket de Cuenta';
    case 'CORRECCION':
      return 'Ticket de Corrección';
    case 'CANCELACION':
      return 'Ticket de Cancelación';
    default:
      return 'Ticket';
  }
};

const getColorTipo = (tipo: TipoTicket): string => {
  switch (tipo) {
    case 'COBRO':
      return colors.success;
    case 'CORRECCION':
      return colors.warning;
    case 'CANCELACION':
      return colors.error;
    default:
      return colors.primary;
  }
};

export const ModalTicket: React.FC<ModalTicketProps> = ({
  visible,
  onClose,
  ticket,
  onImprimir,
  tituloPersonalizado,
}) => {
  const insets = useSafeAreaInsets();

  if (!ticket) return null;

  const titulo = tituloPersonalizado || getTituloTicket(ticket.tipoTicket);
  const colorTipo = getColorTipo(ticket.tipoTicket);
  const esCorreccion = ticket.tipoTicket === 'CORRECCION';
  const esCancelacion = ticket.tipoTicket === 'CANCELACION';

  const handleImprimir = () => {
    // TODO: Implementar llamada a servicio de impresión
    console.log('[ModalTicket] Solicitando impresión de ticket:', {
      comandaId: ticket.comandaId,
      tipo: ticket.tipoTicket,
      total: ticket.total,
    });
    onImprimir?.();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="fullScreen"
      statusBarTranslucent
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colorTipo }]}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={28} color={colors.surface} />
          </TouchableOpacity>
          
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>{titulo}</Text>
            <Text style={styles.headerSubtitle}>
              Mesa {ticket.mesaNumero} • {ticket.codigo}
            </Text>
          </View>

          <TouchableOpacity style={styles.printButton} onPress={handleImprimir}>
            <Ionicons name="print-outline" size={24} color={colors.surface} />
          </TouchableOpacity>
        </View>

        {/* Ticket Content */}
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {/* Info General */}
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Código</Text>
                <Text style={styles.infoValue}>{ticket.codigo}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Mesa</Text>
                <Text style={styles.infoValue}>{ticket.mesaNumero}</Text>
              </View>
            </View>
            <View style={[styles.infoRow, styles.infoRowMargin]}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Camarero</Text>
                <Text style={styles.infoValue}>{ticket.camareroNombre || '-'}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Comensales</Text>
                <Text style={styles.infoValue}>{ticket.comensales}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Fecha Apertura</Text>
                <Text style={styles.infoValue}>
                  {new Date(ticket.fechaApertura).toLocaleString('es-ES')}
                </Text>
              </View>
            </View>
          </View>

          {/* Badge de tipo */}
          <View style={[styles.tipoBadge, { backgroundColor: colorTipo + '20' }]}>
            <Text style={[styles.tipoBadgeText, { color: colorTipo }]}>
              {ticket.tipoTicket}
            </Text>
          </View>

          {/* Items eliminados (para corrección/cancelación) */}
          {(esCorreccion || esCancelacion) && ticket.itemsEliminados && ticket.itemsEliminados.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {esCorreccion ? 'Items Eliminados' : 'Items Cancelados'}
              </Text>
              <View style={styles.itemsCard}>
                {ticket.itemsEliminados.map((item, index) => (
                  <View key={`eliminado-${index}`} style={styles.itemRow}>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemCantidad}>{item.cantidad}x</Text>
                      <Text style={[styles.itemNombre, styles.itemTachado]}>
                        {item.nombrePlato}
                      </Text>
                    </View>
                    <Text style={[styles.itemPrecio, styles.itemTachado]}>
                      -{item.subtotal.toFixed(2)}€
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Rondas */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Detalle por Rondas</Text>
            {ticket.rondas.map((ronda, rondaIndex) => (
              <View key={`ronda-${rondaIndex}`} style={styles.rondaCard}>
                <View style={styles.rondaHeader}>
                  <Text style={styles.rondaTitle}>{formatearTipoRonda(ronda.tipoRonda)}</Text>
                  <Text style={styles.rondaSubtotal}>{ronda.subtotalRonda.toFixed(2)}€</Text>
                </View>
                {ronda.items.map((item, itemIndex) => (
                  <View key={`item-${rondaIndex}-${itemIndex}`} style={styles.itemRow}>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemCantidad}>{item.cantidad}x</Text>
                      <View style={styles.itemDetails}>
                        <Text style={styles.itemNombre}>{item.nombrePlato}</Text>
                        {item.notas && (
                          <Text style={styles.itemNotas}>{item.notas}</Text>
                        )}
                      </View>
                    </View>
                    <Text style={styles.itemPrecio}>{item.subtotal.toFixed(2)}€</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>

          {/* Totales */}
          <View style={styles.totalesCard}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>{ticket.subtotal.toFixed(2)}€</Text>
            </View>
            
            {ticket.descuento > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Descuento</Text>
                <Text style={[styles.totalValue, styles.descuentoText]}>
                  -{ticket.descuento.toFixed(2)}€
                </Text>
              </View>
            )}

            {esCorreccion && ticket.totalAnterior && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Anterior</Text>
                <Text style={[styles.totalValue, styles.totalTachado]}>
                  {ticket.totalAnterior.toFixed(2)}€
                </Text>
              </View>
            )}

            <View style={[styles.totalRow, styles.totalFinal]}>
              <Text style={styles.totalLabelFinal}>
                {esCancelacion ? 'Total Cancelado' : 'Total'}
              </Text>
              <Text style={[styles.totalValueFinal, { color: colorTipo }]}>
                {ticket.total.toFixed(2)}€
              </Text>
            </View>
          </View>

          {/* Info adicional para corrección/cancelación */}
          {(esCorreccion || esCancelacion) && (
            <View style={styles.infoExtraCard}>
              {ticket.motivo && (
                <View style={styles.infoExtraRow}>
                  <Text style={styles.infoExtraLabel}>Motivo:</Text>
                  <Text style={styles.infoExtraValue}>{ticket.motivo}</Text>
                </View>
              )}
              {ticket.usuarioAccion && (
                <View style={styles.infoExtraRow}>
                  <Text style={styles.infoExtraLabel}>Realizado por:</Text>
                  <Text style={styles.infoExtraValue}>{ticket.usuarioAccion}</Text>
                </View>
              )}
              {ticket.fechaAccion && (
                <View style={styles.infoExtraRow}>
                  <Text style={styles.infoExtraLabel}>Fecha:</Text>
                  <Text style={styles.infoExtraValue}>
                    {new Date(ticket.fechaAccion).toLocaleString('es-ES')}
                  </Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={[styles.footerButton, styles.footerButtonSecondary]} onPress={onClose}>
            <Text style={styles.footerButtonTextSecondary}>Cerrar</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.footerButton, styles.footerButtonPrimary, { backgroundColor: colorTipo }]} 
            onPress={handleImprimir}
          >
            <Ionicons name="print-outline" size={20} color={colors.surface} />
            <Text style={styles.footerButtonTextPrimary}>Imprimir Ticket</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  printButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
    color: colors.surface,
  },
  headerSubtitle: {
    fontSize: typography.caption.fontSize,
    color: colors.surface,
    opacity: 0.8,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoRowMargin: {
    marginTop: spacing.sm,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: typography.caption.fontSize,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  infoValue: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.text,
  },
  tipoBadge: {
    alignSelf: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginBottom: spacing.md,
  },
  tipoBadgeText: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  itemsCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  rondaCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  rondaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.sm,
  },
  rondaTitle: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.text,
  },
  rondaSubtotal: {
    fontSize: typography.body.fontSize,
    fontWeight: '700',
    color: colors.primary,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  itemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemCantidad: {
    fontSize: typography.body.fontSize,
    fontWeight: '700',
    color: colors.primary,
    minWidth: 30,
  },
  itemDetails: {
    flex: 1,
  },
  itemNombre: {
    fontSize: typography.body.fontSize,
    color: colors.text,
  },
  itemTachado: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  itemNotas: {
    fontSize: typography.caption.fontSize,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 2,
  },
  itemPrecio: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.text,
  },
  totalesCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  totalLabel: {
    fontSize: typography.body.fontSize,
    color: colors.textSecondary,
  },
  totalValue: {
    fontSize: typography.body.fontSize,
    color: colors.text,
  },
  descuentoText: {
    color: colors.error,
  },
  totalTachado: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  totalFinal: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
  },
  totalLabelFinal: {
    fontSize: typography.h3.fontSize,
    fontWeight: '600',
    color: colors.text,
  },
  totalValueFinal: {
    fontSize: typography.h1.fontSize,
    fontWeight: '700',
  },
  infoExtraCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  infoExtraRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  infoExtraLabel: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '600',
    color: colors.textSecondary,
    minWidth: 100,
  },
  infoExtraValue: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.text,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  footerButtonSecondary: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  footerButtonPrimary: {
    gap: spacing.sm,
  },
  footerButtonTextSecondary: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.text,
  },
  footerButtonTextPrimary: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.surface,
  },
});
