import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { useSalaStore } from '../../store/salaStore';
import { Button } from '../../components/common';
import { CompactHeader, CompactCard, SummaryRow } from '../../components/payment';
import { ModalSelectorImpresora } from '../../components/comanda/ModalSelectorImpresora';

// Datos del restaurante
const RESTAURANTE = {
  nombre: 'RESTAURANTE SUANCES',
  direccion: 'Av. de la Constitución, 25',
  ciudad: 'Suances, Cantabria',
  cp: '39340',
  telefono: '942 72 XX XX',
  cif: 'B-12345678',
};

export const TicketScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { comandaId, modo = 'cerrar' } = route.params;
  
  const [loading, setLoading] = useState(true);
  const [imprimiendo, setImprimiendo] = useState(false);
  const [modalImpresoraVisible, setModalImpresoraVisible] = useState(false);
  const [accionPendiente, setAccionPendiente] = useState<'cerrar' | 'reenviar' | null>(null);
  
  const { 
    comandaConRondas, 
    fetchComandaConRondas, 
    cerrarComanda,
    reenviarTicket,
  } = useSalaStore();

  useEffect(() => {
    loadData();
  }, [comandaId]);

  const loadData = async () => {
    try {
      await fetchComandaConRondas(comandaId);
    } finally {
      setLoading(false);
    }
  };

  const calcularTotal = (): number => {
    if (!comandaConRondas?.rondas) return 0;
    return comandaConRondas.rondas.reduce((total, ronda) => {
      return total + ronda.pedidos
        .filter(p => p.estado !== 'CANCELADO')
        .reduce((sum, p) => sum + (p.subtotal || 0), 0);
    }, 0);
  };

  const handleImprimir = () => {
    // Si la cuenta ya está cerrada, siempre es reenviar (reimpresión)
    if (esCuentaCerrada) {
      setAccionPendiente('reenviar');
    } else {
      setAccionPendiente(modo === 'cerrar' ? 'cerrar' : 'reenviar');
    }
    setModalImpresoraVisible(true);
  };

  const handleSeleccionarImpresora = async (impresora: string) => {
    setModalImpresoraVisible(false);
    
    if (accionPendiente === 'cerrar') {
      setImprimiendo(true);
      try {
        await cerrarComanda(comandaId, impresora);
        Alert.alert(
          'Cuenta Cerrada',
          `Ticket impreso en ${impresora}. La mesa está lista para cobrar.`,
          [
            {
              text: 'Cobrar Ahora',
              onPress: () => navigation.replace('Cobro', { comandaId, total }),
            },
            {
              text: 'Volver a Mesas',
              onPress: () => navigation.navigate('Sala'),
            },
          ]
        );
      } catch (error: any) {
        Alert.alert('Error', error.message || 'No se pudo cerrar la cuenta');
      } finally {
        setImprimiendo(false);
      }
    } else if (accionPendiente === 'reenviar') {
      try {
        await reenviarTicket(comandaId, impresora);
        Alert.alert('Éxito', `Ticket reimpreso en ${impresora}`);
      } catch (error: any) {
        Alert.alert('Error', error.message || 'No se pudo reimprimir');
      }
    }
    
    setAccionPendiente(null);
  };

  const handleCobrar = () => {
    navigation.navigate('Cobro', { comandaId, total });
  };

  if (loading || !comandaConRondas) {
    return (
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        <CompactHeader title="Ticket" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando ticket...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { codigo, mesaNumero, camareroNombre, rondas = [], fechaApertura } = comandaConRondas;
  const total = calcularTotal();
  const esCuentaCerrada = comandaConRondas.estado === 'CUENTA';

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <CompactHeader 
        title={esCuentaCerrada ? 'Ticket' : 'Cerrar Cuenta'}
        subtitle={`Mesa ${mesaNumero} · ${codigo}`}
      />

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Info del Restaurante */}
        <CompactCard style={styles.restaurantCard} padding="sm">
          <Text style={styles.restaurantName}>{RESTAURANTE.nombre}</Text>
          <View style={styles.restaurantInfo}>
            <Text style={styles.restaurantInfoText}>{RESTAURANTE.direccion}</Text>
            <Text style={styles.restaurantInfoText}>{RESTAURANTE.ciudad}, {RESTAURANTE.cp}</Text>
            <Text style={styles.restaurantInfoText}>Tel: {RESTAURANTE.telefono}</Text>
          </View>
        </CompactCard>

        {/* Info de la Comanda */}
        <CompactCard style={styles.infoCard} padding="sm">
          <SummaryRow label="Mesa" value={`#${mesaNumero}`} variant="emphasis" />
          <SummaryRow label="Comanda" value={codigo} />
          <SummaryRow label="Camarero" value={camareroNombre || '-'} />
          <SummaryRow 
            label="Fecha" 
            value={new Date(fechaApertura).toLocaleString('es-ES', { 
              day: '2-digit', 
              month: '2-digit', 
              hour: '2-digit', 
              minute: '2-digit' 
            })} 
          />
        </CompactCard>

        {/* Items por Ronda */}
        <CompactCard style={styles.itemsCard} padding="sm">
          <Text style={styles.sectionTitle}>Detalle</Text>
          
          {/* Header de tabla */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCell, styles.colCantidad]}>CANT</Text>
            <Text style={[styles.tableCell, styles.colProducto]}>PRODUCTO</Text>
            <Text style={[styles.tableCell, styles.colPrecio]}>TOTAL</Text>
          </View>

          {rondas.map((ronda) => {
            const itemsValidos = ronda.pedidos.filter(p => p.estado !== 'CANCELADO');
            if (itemsValidos.length === 0) return null;
            
            return (
              <View key={ronda.numeroRonda}>
                <View style={styles.rondaHeader}>
                  <View style={styles.rondaBadge}>
                    <Text style={styles.rondaText}>R{ronda.numeroRonda}</Text>
                  </View>
                </View>
                {itemsValidos.map((item) => (
                  <View key={item.id} style={styles.itemRow}>
                    <Text style={[styles.itemCell, styles.colCantidad]}>
                      {item.cantidad}x
                    </Text>
                    <View style={[styles.itemCell, styles.colProducto]}>
                      <Text style={styles.itemNombre} numberOfLines={1}>
                        {item.nombrePlato}
                      </Text>
                      {item.notas && (
                        <Text style={styles.itemNotas} numberOfLines={1}>
                          {item.notas}
                        </Text>
                      )}
                    </View>
                    <Text style={[styles.itemCell, styles.colPrecio]}>
                      {item.subtotal?.toFixed(2)}€
                    </Text>
                  </View>
                ))}
              </View>
            );
          })}
        </CompactCard>

        {/* Totales */}
        <CompactCard style={styles.totalsCard} padding="sm">
          <SummaryRow 
            label="Subtotal" 
            value={`${total.toFixed(2)} €`} 
          />
          <SummaryRow 
            label="TOTAL" 
            value={`${total.toFixed(2)} €`} 
            variant="total" 
            showBorder 
          />
        </CompactCard>

        {/* Footer del Ticket */}
        <View style={styles.ticketFooter}>
          <Text style={styles.footerText}>Gracias por su visita</Text>
          <Text style={styles.footerCif}>CIF: {RESTAURANTE.cif}</Text>
        </View>

        {/* Espacio para FAB */}
        <View style={styles.fabSpace} />
      </ScrollView>

      {/* Floating Action Button - Imprimir */}
      {!esCuentaCerrada && (
        <View style={styles.fabContainer}>
          <TouchableOpacity
            style={styles.fab}
            onPress={handleImprimir}
            disabled={imprimiendo}
            activeOpacity={0.8}
          >
            {imprimiendo ? (
              <ActivityIndicator size="small" color={colors.surface} />
            ) : (
              <>
                <Ionicons name="print-outline" size={18} color={colors.surface} />
                <Text style={styles.fabText}>Imprimir</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Footer para cuenta cerrada */}
      {esCuentaCerrada && (
        <View style={styles.footer}>
          <View style={styles.footerContent}>
            <TouchableOpacity 
              style={styles.footerSecondaryButton}
              onPress={handleImprimir}
            >
              <Ionicons name="print-outline" size={18} color={colors.primary} />
              <Text style={styles.footerSecondaryText}>Reimprimir</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.footerPrimaryButton}
              onPress={handleCobrar}
            >
              <Ionicons name="card-outline" size={18} color={colors.surface} />
              <Text style={styles.footerPrimaryText}>Cobrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <ModalSelectorImpresora
        visible={modalImpresoraVisible}
        onClose={() => {
          setModalImpresoraVisible(false);
          setAccionPendiente(null);
        }}
        onSelect={handleSeleccionarImpresora}
        titulo={accionPendiente === 'cerrar' ? 'Imprimir Cuenta' : 'Reimprimir Ticket'}
        subtitulo={accionPendiente === 'cerrar' 
          ? '¿Dónde desea imprimir la cuenta?' 
          : '¿Dónde desea reimprimir el ticket?'}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    ...typography.body,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.sm,
    gap: spacing.sm,
  },
  restaurantCard: {
    alignItems: 'center',
  },
  restaurantName: {
    ...typography.h3,
    color: colors.text,
    fontWeight: '700',
  },
  restaurantInfo: {
    marginTop: spacing.xs,
    alignItems: 'center',
  },
  restaurantInfoText: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  infoCard: {
    gap: 2,
  },
  itemsCard: {
    flex: 1,
  },
  sectionTitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.xs,
  },
  tableCell: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  itemCell: {
    ...typography.bodySmall,
    color: colors.text,
  },
  colCantidad: {
    width: 45,
    textAlign: 'center',
  },
  colProducto: {
    flex: 1,
  },
  colPrecio: {
    width: 55,
    textAlign: 'right',
    fontWeight: '600',
  },
  rondaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    marginBottom: 2,
  },
  rondaBadge: {
    backgroundColor: colors.primary + '15',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  rondaText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
    fontSize: 10,
  },
  itemNombre: {
    ...typography.bodySmall,
    color: colors.text,
  },
  itemNotas: {
    ...typography.caption,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  totalsCard: {
    gap: 2,
  },
  ticketFooter: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  footerText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  footerCif: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  fabSpace: {
    height: 80,
  },
  fabContainer: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
    zIndex: 100,
  },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  fabText: {
    ...typography.bodySmall,
    color: colors.surface,
    fontWeight: '600',
  },
  footer: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: spacing.sm,
    paddingBottom: spacing.md,
  },
  footerContent: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  footerSecondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.primary,
    gap: spacing.xs,
  },
  footerSecondaryText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  footerPrimaryButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.success,
    gap: spacing.xs,
  },
  footerPrimaryText: {
    ...typography.bodySmall,
    color: colors.surface,
    fontWeight: '600',
  },
});
