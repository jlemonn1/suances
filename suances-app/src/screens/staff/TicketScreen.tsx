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

// Datos del restaurante (inventados)
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

  const handleImprimir = async () => {
    if (modo === 'cerrar') {
      setImprimiendo(true);
      try {
        await cerrarComanda(comandaId);
        Alert.alert(
          'Cuenta Cerrada',
          'Ticket impreso. La mesa está lista para cobrar.',
          [
            {
              text: 'Cobrar Ahora',
              onPress: () => navigation.replace('Cobro', { comandaId }),
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
    } else {
      try {
        await reenviarTicket(comandaId);
        Alert.alert('Éxito', 'Ticket reimpreso');
      } catch (error: any) {
        Alert.alert('Error', error.message || 'No se pudo reimprimir');
      }
    }
  };

  const handleCobrar = () => {
    navigation.navigate('Cobro', { comandaId });
  };

  if (loading || !comandaConRondas) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { codigo, mesaNumero, camareroNombre, rondas = [], fechaApertura } = comandaConRondas;
  const total = calcularTotal();
  const esCuentaCerrada = comandaConRondas.estado === 'CUENTA';

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {esCuentaCerrada ? 'Ticket' : 'Cerrar Cuenta'}
        </Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Ticket */}
        <View style={styles.ticketContainer}>
          {/* Cabecera */}
          <View style={styles.ticketHeader}>
            <Text style={styles.restaurantName}>{RESTAURANTE.nombre}</Text>
            <Text style={styles.restaurantInfo}>{RESTAURANTE.direccion}</Text>
            <Text style={styles.restaurantInfo}>{RESTAURANTE.ciudad} - {RESTAURANTE.cp}</Text>
            <Text style={styles.restaurantInfo}>Tel: {RESTAURANTE.telefono}</Text>
            <Text style={styles.restaurantInfo}>CIF: {RESTAURANTE.cif}</Text>
            
            <View style={styles.divider} />
            
            <View style={styles.ticketMeta}>
              <Text style={styles.metaText}>Mesa: <Text style={styles.metaValue}>{mesaNumero}</Text></Text>
              <Text style={styles.metaText}>Comanda: <Text style={styles.metaValue}>{codigo}</Text></Text>
              <Text style={styles.metaText}>Camarero: <Text style={styles.metaValue}>{camareroNombre || '-'}</Text></Text>
              <Text style={styles.metaText}>Fecha: <Text style={styles.metaValue}>
                {new Date(fechaApertura).toLocaleString('es-ES')}
              </Text></Text>
            </View>
            
            <View style={styles.divider} />
          </View>

          {/* Items */}
          <View style={styles.itemsContainer}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCell, styles.tableCellCantidad]}>UD</Text>
              <Text style={[styles.tableCell, styles.tableCellProducto]}>PRODUCTO</Text>
              <Text style={[styles.tableCell, styles.tableCellPrecio]}>PRECIO</Text>
            </View>

            {rondas.map((ronda) => {
              const itemsValidos = ronda.pedidos.filter(p => p.estado !== 'CANCELADO');
              if (itemsValidos.length === 0) return null;
              
              return (
                <View key={ronda.numeroRonda}>
                  <Text style={styles.rondaTitle}>Ronda {ronda.numeroRonda}</Text>
                  {itemsValidos.map((item) => (
                    <View key={item.id} style={styles.itemRow}>
                      <Text style={[styles.tableCell, styles.tableCellCantidad]}>
                        {item.cantidad}
                      </Text>
                      <View style={[styles.tableCell, styles.tableCellProducto]}>
                        <Text style={styles.itemNombre}>{item.nombrePlato}</Text>
                        {item.notas && <Text style={styles.itemNotas}>{item.notas}</Text>}
                      </View>
                      <Text style={[styles.tableCell, styles.tableCellPrecio]}>
                        {item.subtotal?.toFixed(2)}€
                      </Text>
                    </View>
                  ))}
                </View>
              );
            })}
          </View>

          {/* Totales */}
          <View style={styles.totalesContainer}>
            <View style={styles.divider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>SUBTOTAL</Text>
              <Text style={styles.totalValue}>{total.toFixed(2)} €</Text>
            </View>
            <View style={[styles.totalRow, styles.totalFinal]}>
              <Text style={styles.totalLabelFinal}>TOTAL</Text>
              <Text style={styles.totalValueFinal}>{total.toFixed(2)} €</Text>
            </View>
            <View style={styles.divider} />
            <Text style={styles.ticketFooter}>Gracias por su visita</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        {esCuentaCerrada ? (
          // Cuenta ya cerrada - opciones: Reimprimir o Cobrar
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={handleImprimir}
            >
              <Ionicons name="print-outline" size={20} color={colors.primary} />
              <Text style={styles.secondaryButtonText}>Reimprimir</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.primaryButton]}
              onPress={handleCobrar}
            >
              <Ionicons name="card-outline" size={20} color={colors.surface} />
              <Text style={styles.primaryButtonText}>Cobrar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Modo cerrar cuenta
          <>
            <Text style={styles.footerNote}>
              Al imprimir se cerrará la cuenta
            </Text>
            <TouchableOpacity 
              style={[styles.imprimirButton, imprimiendo && styles.imprimirButtonDisabled]}
              onPress={handleImprimir}
              disabled={imprimiendo}
            >
              {imprimiendo ? (
                <ActivityIndicator color={colors.surface} />
              ) : (
                <>
                  <Ionicons name="print-outline" size={24} color={colors.surface} />
                  <Text style={styles.imprimirButtonText}>Imprimir Ticket</Text>
                </>
              )}
            </TouchableOpacity>
          </>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  content: {
    flex: 1,
  },
  ticketContainer: {
    backgroundColor: colors.surface,
    margin: spacing.md,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ticketHeader: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  restaurantInfo: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  ticketMeta: {
    width: '100%',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  metaValue: {
    color: colors.text,
    fontWeight: '500',
  },
  itemsContainer: {
    marginBottom: spacing.md,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.xs,
  },
  tableCell: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  tableCellCantidad: {
    width: 40,
    textAlign: 'center',
  },
  tableCellProducto: {
    flex: 1,
  },
  tableCellPrecio: {
    width: 60,
    textAlign: 'right',
  },
  rondaTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  itemNombre: {
    fontSize: 13,
    color: colors.text,
  },
  itemNotas: {
    fontSize: 10,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  totalesContainer: {
    marginTop: spacing.sm,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  totalLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  totalValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  totalFinal: {
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabelFinal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  totalValueFinal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.success,
  },
  ticketFooter: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  footer: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: spacing.md,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  secondaryButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: colors.success,
  },
  primaryButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  footerNote: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  imprimirButton: {
    backgroundColor: colors.success,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  imprimirButtonDisabled: {
    opacity: 0.6,
  },
  imprimirButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
});
