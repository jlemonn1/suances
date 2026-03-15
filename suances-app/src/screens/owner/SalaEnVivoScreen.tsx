import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '../../theme';
import { useSalaStore } from '../../store/salaStore';
import { useAuthStore } from '../../store/authStore';
import { useComandasSSE } from '../../hooks/useComandasSSE';
import { salaService } from '../../services/salaService';
import type { ComandaHoyResponse, ComandaEstado, ComandaDetalleRondas, Ronda, Pedido } from '../../types/sala';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Colores según estado de comanda
const getEstadoColor = (estado: ComandaEstado): string => {
  switch (estado) {
    case 'ABIERTA':
      return '#FFC107'; // Amarillo
    case 'EN_PREPARACION':
      return '#FF9800'; // Naranja
    case 'SERVIDA':
      return '#4CAF50'; // Verde
    case 'CUENTA':
      return '#F44336'; // Rojo
    case 'COBRADA':
      return '#2196F3'; // Azul
    case 'CANCELADA':
      return '#9E9E9E'; // Gris
    default:
      return '#757575';
  }
};

const getEstadoLabel = (estado: ComandaEstado): string => {
  switch (estado) {
    case 'ABIERTA':
      return 'Abierta';
    case 'EN_PREPARACION':
      return 'En Preparación';
    case 'SERVIDA':
      return 'Servida';
    case 'CUENTA':
      return 'Cuenta';
    case 'COBRADA':
      return 'Cobrada';
    case 'CANCELADA':
      return 'Cancelada';
    default:
      return estado;
  }
};

// Ticket Component - Estilo papel pinchado
interface TicketCardProps {
  comanda: ComandaHoyResponse;
  onPress: () => void;
  index: number;
  isCompact?: boolean;
}

const TicketCard: React.FC<TicketCardProps> = ({ comanda, onPress, index, isCompact = false }) => {
  const color = getEstadoColor(comanda.estado);
  const rotation = useRef(new Animated.Value(Math.random() * 4 - 2)).current;
  
  // Animación de entrada
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        delay: index * 50,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        delay: index * 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const tiempoTranscurrido = () => {
    const apertura = new Date(comanda.fechaApertura);
    const ahora = new Date();
    const diffMs = ahora.getTime() - apertura.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMins % 60}m`;
    }
    return `${diffMins}m`;
  };

  if (isCompact) {
    // Versión compacta para carrusel de cobradas
    return (
      <Animated.View
        style={[
          styles.ticketCompact,
          {
            opacity: fadeAnim,
            transform: [{ translateY }],
          },
        ]}
      >
        <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
          <View style={[styles.ticketPinCompact, { backgroundColor: color }]} />
          <View style={styles.ticketContentCompact}>
            <Text style={styles.ticketMesaCompact}>M{comanda.mesaNumero}</Text>
            <Text style={styles.ticketCodigoCompact}>{comanda.codigo}</Text>
            <Text style={styles.ticketTotalCompact}>{comanda.total.toFixed(0)}€</Text>
            <Text style={styles.ticketTiempoCompact}>{tiempoTranscurrido()}</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  // Versión normal para grid
  return (
    <Animated.View
      style={[
        styles.ticketContainer,
        {
          opacity: fadeAnim,
          transform: [
            { translateY },
            { rotate: rotation.interpolate({
              inputRange: [-2, 2],
              outputRange: ['-2deg', '2deg'],
            }) },
          ],
        },
      ]}
    >
      <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
        {/* Chincheta */}
        <View style={[styles.ticketPin, { backgroundColor: color }]}>
          <View style={styles.pinHead} />
        </View>
        
        {/* Ticket */}
        <View style={styles.ticketPaper}>
          {/* Header */}
          <View style={styles.ticketHeader}>
            <View style={[styles.estadoBadge, { backgroundColor: color + '20' }]}>
              <View style={[styles.estadoDot, { backgroundColor: color }]} />
              <Text style={[styles.estadoText, { color }]}>
                {getEstadoLabel(comanda.estado)}
              </Text>
            </View>
            <Text style={styles.ticketTiempo}>{tiempoTranscurrido()}</Text>
          </View>

          {/* Info principal */}
          <View style={styles.ticketMain}>
            <Text style={styles.ticketMesa}>Mesa {comanda.mesaNumero}</Text>
            <Text style={styles.ticketSala}>{comanda.nombreSala || 'Sala'}</Text>
            <Text style={styles.ticketCodigo}>{comanda.codigo}</Text>
          </View>

          {/* Footer */}
          <View style={styles.ticketFooter}>
            <View style={styles.ticketInfo}>
              <Ionicons name="person-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.ticketInfoText}>{comanda.camareroNombre || '-'}</Text>
            </View>
            <View style={styles.ticketInfo}>
              <Ionicons name="people-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.ticketInfoText}>{comanda.numeroComensales}</Text>
            </View>
            <Text style={[styles.ticketTotal, { color }]}>
              {comanda.total.toFixed(2)}€
            </Text>
          </View>

          {/* Efecto de perforación */}
          <View style={styles.ticketPerforation}>
            {[...Array(8)].map((_, i) => (
              <View key={i} style={styles.perforationDot} />
            ))}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Modal de detalle con rondas
interface ComandaDetalleModalProps {
  comanda: ComandaHoyResponse | null;
  visible: boolean;
  onClose: () => void;
}

const ComandaDetalleModal: React.FC<ComandaDetalleModalProps> = ({ comanda, visible, onClose }) => {
  const [detalle, setDetalle] = useState<ComandaDetalleRondas | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && comanda) {
      cargarDetalle();
    } else {
      setDetalle(null);
    }
  }, [visible, comanda]);

  const cargarDetalle = async () => {
    if (!comanda) return;
    setLoading(true);
    try {
      const data = await salaService.obtenerComandaConRondas(comanda.id);
      setDetalle(data);
    } catch (error) {
      console.error('Error cargando detalle:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!comanda) return null;

  const color = getEstadoColor(comanda.estado);

  const formatearHora = (fechaStr?: string) => {
    if (!fechaStr) return '-';
    const fecha = new Date(fechaStr);
    return fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={[styles.modalHeader, { backgroundColor: color }]}>
            <TouchableOpacity onPress={onClose} style={styles.modalClose}>
              <Ionicons name="close" size={28} color={colors.surface} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Detalle de Comanda</Text>
            <View style={styles.modalClose} />
          </View>

          {/* Content */}
          <ScrollView style={styles.modalBody}>
            {/* Estado badge */}
            <View style={styles.modalEstadoContainer}>
              <View style={[styles.modalEstadoBadge, { backgroundColor: color + '20' }]}>
                <Text style={[styles.modalEstadoText, { color }]}>
                  {getEstadoLabel(comanda.estado)}
                </Text>
              </View>
            </View>

            {/* Info grid */}
            <View style={styles.modalInfoGrid}>
              <View style={styles.modalInfoItem}>
                <Ionicons name="grid-outline" size={24} color={colors.primary} />
                <Text style={styles.modalInfoLabel}>Mesa</Text>
                <Text style={styles.modalInfoValue}>{comanda.mesaNumero}</Text>
              </View>
              <View style={styles.modalInfoItem}>
                <Ionicons name="receipt-outline" size={24} color={colors.primary} />
                <Text style={styles.modalInfoLabel}>Código</Text>
                <Text style={styles.modalInfoValue}>{comanda.codigo}</Text>
              </View>
              <View style={styles.modalInfoItem}>
                <Ionicons name="people-outline" size={24} color={colors.primary} />
                <Text style={styles.modalInfoLabel}>Comensales</Text>
                <Text style={styles.modalInfoValue}>{comanda.numeroComensales}</Text>
              </View>
              <View style={styles.modalInfoItem}>
                <Ionicons name="cash-outline" size={24} color={colors.primary} />
                <Text style={styles.modalInfoLabel}>Total</Text>
                <Text style={[styles.modalInfoValue, { color }]}>
                  {comanda.total.toFixed(2)}€
                </Text>
              </View>
            </View>

            {/* Info adicional */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Información</Text>
              <View style={styles.modalDetailRow}>
                <Text style={styles.modalDetailLabel}>Sala:</Text>
                <Text style={styles.modalDetailValue}>{comanda.nombreSala || '-'}</Text>
              </View>
              <View style={styles.modalDetailRow}>
                <Text style={styles.modalDetailLabel}>Camarero:</Text>
                <Text style={styles.modalDetailValue}>{comanda.camareroNombre || '-'}</Text>
              </View>
              <View style={styles.modalDetailRow}>
                <Text style={styles.modalDetailLabel}>Apertura:</Text>
                <Text style={styles.modalDetailValue}>
                  {new Date(comanda.fechaApertura).toLocaleString('es-ES')}
                </Text>
              </View>
              {comanda.descuentoPorcentaje > 0 && (
                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalDetailLabel}>Descuento:</Text>
                  <Text style={[styles.modalDetailValue, { color: colors.success }]}>
                    {comanda.descuentoPorcentaje}%
                  </Text>
                </View>
              )}
              {comanda.notas && (
                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalDetailLabel}>Notas:</Text>
                  <Text style={styles.modalDetailValue}>{comanda.notas}</Text>
                </View>
              )}
            </View>

            {/* Rondas */}
            {loading ? (
              <View style={styles.loadingRondas}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.loadingRondasText}>Cargando rondas...</Text>
              </View>
            ) : detalle && detalle.rondas.length > 0 ? (
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Rondas ({detalle.rondas.length})</Text>
                {detalle.rondas.map((ronda, index) => (
                  <View key={index} style={styles.rondaContainer}>
                    <View style={styles.rondaHeader}>
                      <View style={styles.rondaNumero}>
                        <Text style={styles.rondaNumeroText}>Ronda {ronda.numeroRonda}</Text>
                        <Text style={styles.rondaTipo}>{ronda.tipoRonda}</Text>
                      </View>
                      <Text style={styles.rondaHora}>{formatearHora(ronda.horaEnvio)}</Text>
                    </View>
                    
                    {/* Pedidos de la ronda */}
                    <View style={styles.pedidosContainer}>
                      {ronda.pedidos.map((pedido, pIndex) => (
                        <View key={pIndex} style={styles.pedidoItem}>
                          <View style={styles.pedidoCantidad}>
                            <Text style={styles.pedidoCantidadText}>{pedido.cantidad}x</Text>
                          </View>
                          <View style={styles.pedidoInfo}>
                            <Text style={styles.pedidoNombre}>{pedido.nombrePlato}</Text>
                            <Text style={styles.pedidoPrecio}>
                              {(pedido.precioUnitario * pedido.cantidad).toFixed(2)}€
                            </Text>
                          </View>
                          {pedido.notas && (
                            <Text style={styles.pedidoNotas}>"{pedido.notas}"</Text>
                          )}
                          <View style={[styles.pedidoEstado, { backgroundColor: getEstadoColor(pedido.estado as ComandaEstado) + '20' }]}>
                            <View style={[styles.pedidoEstadoDot, { backgroundColor: getEstadoColor(pedido.estado as ComandaEstado) }]} />
                            <Text style={[styles.pedidoEstadoText, { color: getEstadoColor(pedido.estado as ComandaEstado) }]}>
                              {pedido.estado}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Rondas</Text>
                <Text style={styles.sinRondasText}>No hay rondas registradas</Text>
              </View>
            )}

            <View style={{ height: 20 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// Filtro de comandas
type FiltroTipo = 'TODAS' | 'SALA' | 'CAMARERO';

export const SalaEnVivoScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { user } = useAuthStore();
  
  const {
    comandasHoy,
    loadingComandasHoy,
    fetchComandasHoy,
    mesas,
    fetchMesas,
  } = useSalaStore();

  const [refreshing, setRefreshing] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState<FiltroTipo>('TODAS');
  const [filtroValor, setFiltroValor] = useState<string>('');
  const [comandaSeleccionada, setComandaSeleccionada] = useState<ComandaHoyResponse | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Cargar comandas al montar
  useEffect(() => {
    loadData();
  }, []);

  // SSE para actualizaciones en tiempo real de comandas
  useComandasSSE({ enabled: true });

  const loadData = useCallback(async () => {
    try {
      await Promise.all([
        fetchComandasHoy(),
        fetchMesas(),
      ]);
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  }, [fetchComandasHoy, fetchMesas]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const handleComandaPress = (comanda: ComandaHoyResponse) => {
    setComandaSeleccionada(comanda);
    setModalVisible(true);
  };

  // Filtrar comandas
  const comandasFiltradas = comandasHoy.filter((comanda) => {
    if (filtroTipo === 'TODAS') return true;
    if (filtroTipo === 'SALA') {
      if (!filtroValor) return true;
      return comanda.nombreSala === filtroValor;
    }
    if (filtroTipo === 'CAMARERO') {
      if (!filtroValor) return true;
      return comanda.camareroNombre === filtroValor;
    }
    return true;
  });

  // Separar comandas activas (pinchadas) y cobradas
  const comandasActivas = comandasFiltradas.filter(
    (c) => c.estado === 'ABIERTA' || c.estado === 'EN_PREPARACION' || c.estado === 'CUENTA'
  );
  const comandasCobradas = comandasFiltradas.filter((c) => c.estado === 'COBRADA');

  // Calcular estadísticas
  const totalVentas = comandasCobradas.reduce((sum, c) => sum + c.total, 0);
  const mesasOcupadas = comandasActivas.length;
  const mesasCuenta = comandasActivas.filter(c => c.estado === 'CUENTA').length;

  // Opciones de filtro
  const salasUnicas = [...new Set(comandasHoy.map((c) => c.nombreSala).filter(Boolean))];
  const camarerosUnicos = [...new Set(comandasHoy.map((c) => c.camareroNombre).filter(Boolean))];

  const hoy = new Date();
  const fechaCompacta = `${hoy.getDate()} ${hoy.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase()}`;

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: 0 }]} edges={['bottom', 'left', 'right']}>
      {/* Nav azul superior */}
      <View style={[styles.navHeader, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={handleGoBack} style={styles.navBackButton}>
          <Ionicons name="chevron-back" size={28} color="white" />
          <Text style={styles.navBackText}>Atrás</Text>
        </TouchableOpacity>
      </View>

      {/* Header compacto blanco */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.headerTitleGroup}>
            <Text style={styles.headerTitle}>Sala en Vivo</Text>
            <Text style={styles.headerDate}>{fechaCompacta}</Text>
          </View>
          
          <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
            <Ionicons name="refresh" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filtros */}
      <View style={styles.filtrosContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.filtroChip, filtroTipo === 'TODAS' && styles.filtroChipActive]}
            onPress={() => {
              setFiltroTipo('TODAS');
              setFiltroValor('');
            }}
          >
            <Text style={[styles.filtroText, filtroTipo === 'TODAS' && styles.filtroTextActive]}>
              Todas ({comandasHoy.length})
            </Text>
          </TouchableOpacity>

          {salasUnicas.length > 0 && (
            <TouchableOpacity
              style={[styles.filtroChip, filtroTipo === 'SALA' && styles.filtroChipActive]}
              onPress={() => setFiltroTipo('SALA')}
            >
              <Text style={[styles.filtroText, filtroTipo === 'SALA' && styles.filtroTextActive]}>
                Por Sala
              </Text>
              {filtroTipo === 'SALA' && (
                <Ionicons name="chevron-down" size={16} color={colors.primary} />
              )}
            </TouchableOpacity>
          )}

          {camarerosUnicos.length > 0 && (
            <TouchableOpacity
              style={[styles.filtroChip, filtroTipo === 'CAMARERO' && styles.filtroChipActive]}
              onPress={() => setFiltroTipo('CAMARERO')}
            >
              <Text style={[styles.filtroText, filtroTipo === 'CAMARERO' && styles.filtroTextActive]}>
                Por Camarero
              </Text>
              {filtroTipo === 'CAMARERO' && (
                <Ionicons name="chevron-down" size={16} color={colors.primary} />
              )}
            </TouchableOpacity>
          )}
        </ScrollView>

        {/* Subfiltros */}
        {filtroTipo === 'SALA' && salasUnicas.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subfiltros}>
            <TouchableOpacity
              style={[styles.subfiltroChip, filtroValor === '' && styles.subfiltroChipActive]}
              onPress={() => setFiltroValor('')}
            >
              <Text style={styles.subfiltroText}>Todas</Text>
            </TouchableOpacity>
            {salasUnicas.map((sala) => (
              <TouchableOpacity
                key={sala}
                style={[styles.subfiltroChip, filtroValor === sala && styles.subfiltroChipActive]}
                onPress={() => setFiltroValor(sala)}
              >
                <Text style={styles.subfiltroText}>{sala}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {filtroTipo === 'CAMARERO' && camarerosUnicos.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subfiltros}>
            <TouchableOpacity
              style={[styles.subfiltroChip, filtroValor === '' && styles.subfiltroChipActive]}
              onPress={() => setFiltroValor('')}
            >
              <Text style={styles.subfiltroText}>Todos</Text>
            </TouchableOpacity>
            {camarerosUnicos.map((camarero) => (
              <TouchableOpacity
                key={camarero}
                style={[styles.subfiltroChip, filtroValor === camarero && styles.subfiltroChipActive]}
                onPress={() => setFiltroValor(camarero)}
              >
                <Text style={styles.subfiltroText}>{camarero}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Estadísticas en tiempo real */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: '#4CAF50' }]}>
            <Ionicons name="cash-outline" size={18} color="white" />
            <Text style={styles.statValue}>{totalVentas.toFixed(0)}€</Text>
            <Text style={styles.statLabel}>Ventas</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#FF9800' }]}>
            <Ionicons name="restaurant-outline" size={18} color="white" />
            <Text style={styles.statValue}>{mesasOcupadas}</Text>
            <Text style={styles.statLabel}>Ocupadas</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#F44336' }]}>
            <Ionicons name="receipt-outline" size={18} color="white" />
            <Text style={styles.statValue}>{mesasCuenta}</Text>
            <Text style={styles.statLabel}>Cuenta</Text>
          </View>
        </View>

        {loadingComandasHoy && comandasHoy.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Cargando comandas...</Text>
          </View>
        ) : (
          <>
            {/* Comandas Activas (Pinchadas) */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="pin-outline" size={20} color={colors.text} />
                <Text style={styles.sectionTitle}>Comandas Activas</Text>
                <View style={styles.sectionBadge}>
                  <Text style={styles.sectionBadgeText}>{comandasActivas.length}</Text>
                </View>
              </View>

              {comandasActivas.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="pin-outline" size={48} color={colors.textSecondary} />
                  <Text style={styles.emptyText}>No hay comandas activas</Text>
                </View>
              ) : (
                <View style={styles.ticketsGrid}>
                  {comandasActivas.map((comanda, index) => (
                    <TicketCard
                      key={comanda.id}
                      comanda={comanda}
                      onPress={() => handleComandaPress(comanda)}
                      index={index}
                    />
                  ))}
                </View>
              )}
            </View>

            {/* Comandas Cobradas (Carrusel) */}
            {comandasCobradas.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="checkmark-circle-outline" size={20} color={colors.success} />
                  <Text style={styles.sectionTitle}>Comandas Cobradas</Text>
                  <View style={[styles.sectionBadge, { backgroundColor: colors.success + '20' }]}>
                    <Text style={[styles.sectionBadgeText, { color: colors.success }]}>
                      {comandasCobradas.length}
                    </Text>
                  </View>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.carruselContainer}
                >
                  {comandasCobradas.map((comanda, index) => (
                    <TicketCard
                      key={comanda.id}
                      comanda={comanda}
                      onPress={() => handleComandaPress(comanda)}
                      index={index}
                      isCompact
                    />
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Espacio al final */}
            <View style={{ height: 40 }} />
          </>
        )}
      </ScrollView>

      {/* Modal de detalle */}
      <ComandaDetalleModal
        comanda={comandaSeleccionada}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f0', // Fondo color corcho
  },
  navHeader: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  navBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navBackText: {
    fontSize: 17,
    color: 'white',
    fontWeight: '600',
    marginLeft: -4,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  headerDate: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  refreshButton: {
    padding: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background,
  },
  filtrosContainer: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filtroChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginHorizontal: 2,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filtroChipActive: {
    backgroundColor: colors.primary + '15',
    borderColor: colors.primary,
  },
  filtroText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  filtroTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  subfiltros: {
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  subfiltroChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    marginRight: 2,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  subfiltroChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  subfiltroText: {
    fontSize: 11,
    color: colors.text,
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  statCard: {
    flex: 1,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    alignItems: 'center',
    ...shadows.small,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 2,
  },
  statLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  sectionBadge: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  sectionBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  ticketsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    gap: spacing.md,
  },
  // Ticket styles
  ticketContainer: {
    width: (SCREEN_WIDTH - spacing.md * 4) / 2,
    marginBottom: spacing.lg,
  },
  ticketPin: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignSelf: 'center',
    marginBottom: -8,
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  pinHead: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  ticketPaper: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...shadows.medium,
    minHeight: 180,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  estadoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    gap: 4,
  },
  estadoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  estadoText: {
    fontSize: 10,
    fontWeight: '600',
  },
  ticketTiempo: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  ticketMain: {
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  ticketMesa: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  ticketSala: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  ticketCodigo: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  ticketFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    borderStyle: 'dashed',
    paddingTop: spacing.sm,
    marginTop: 'auto',
  },
  ticketInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  ticketInfoText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  ticketTotal: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  ticketPerforation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    bottom: -6,
    left: spacing.md,
    right: spacing.md,
  },
  perforationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#f5f5f0',
  },
  // Compact ticket (carrusel)
  ticketCompact: {
    width: 100,
    marginRight: spacing.md,
  },
  ticketPinCompact: {
    width: 12,
    height: 12,
    borderRadius: 6,
    alignSelf: 'center',
    marginBottom: -6,
    zIndex: 10,
  },
  ticketContentCompact: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    alignItems: 'center',
    ...shadows.small,
  },
  ticketMesaCompact: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  ticketCodigoCompact: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  ticketTotalCompact: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: spacing.xs,
  },
  ticketTiempoCompact: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  carruselContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    marginTop: spacing.md,
    color: colors.textSecondary,
    fontSize: 16,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    width: '100%',
    maxHeight: '80%',
    ...shadows.large,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.surface,
  },
  modalClose: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    padding: spacing.md,
  },
  modalEstadoContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalEstadoBadge: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  modalEstadoText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  modalInfoItem: {
    width: '48%',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalInfoLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  modalInfoValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: spacing.xs,
  },
  modalSection: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  modalDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalDetailLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  modalDetailValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
    marginLeft: spacing.md,
  },
  // Estilos para rondas
  loadingRondas: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  loadingRondasText: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    fontSize: 14,
  },
  sinRondasText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  rondaContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  rondaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rondaNumero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rondaNumeroText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  rondaTipo: {
    fontSize: 11,
    color: colors.textSecondary,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  rondaHora: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  pedidosContainer: {
    padding: spacing.sm,
  },
  pedidoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '40',
  },
  pedidoCantidad: {
    minWidth: 28,
    marginRight: spacing.sm,
  },
  pedidoCantidadText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  pedidoInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  pedidoNombre: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
    marginRight: spacing.sm,
  },
  pedidoPrecio: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  pedidoNotas: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginLeft: 28,
    marginTop: 2,
  },
  pedidoEstado: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginLeft: spacing.sm,
  },
  pedidoEstadoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  pedidoEstadoText: {
    fontSize: 10,
    fontWeight: '600',
  },
});
