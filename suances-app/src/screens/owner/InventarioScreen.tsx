import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  RefreshControl,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  Keyboard,
  TouchableWithoutFeedback,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card, Loading, Button, ConverterButton } from '../../components/common';
import { colors, spacing, typography } from '../../theme';
import { useIngredienteStore } from '../../store/ingredienteStore';
import { useCartaSSE } from '../../hooks/useCartaSSE';
import { cartaService } from '../../services/cartaService';
import { salaService } from '../../services/salaService';
import { IngredienteResponse } from '../../types/ingrediente';
import { PlatoOperativo } from '../../types/carta';
import { UnitConverterService, UnidadConversor } from '../../services/unitConverter';

interface InventarioScreenProps {
  navigation: any;
}

interface Section {
  title: string;
  data: IngredienteResponse[];
}

export const InventarioScreen: React.FC<InventarioScreenProps> = ({
  navigation,
}) => {
  // Usar el store de ingredientes para datos y estado de carga
  const { 
    ingredientes, 
    isLoading: loading, 
    fetchIngredientes,
    stockBajoAlertas,
    stockCriticoAlertas,
    recentlyUpdated,
    clearRecentlyUpdated
  } = useIngredienteStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [showAlertsOnly, setShowAlertsOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedIngrediente, setSelectedIngrediente] = useState<IngredienteResponse | null>(null);
  const [newStock, setNewStock] = useState('');
  const [savingStock, setSavingStock] = useState(false);
  const [showPlatosAfectadosModal, setShowPlatosAfectadosModal] = useState(false);
  const [platosAfectados, setPlatosAfectados] = useState<PlatoOperativo[]>([]);
  const [loadingPlatosAfectados, setLoadingPlatosAfectados] = useState(false);

  // Estados para el conversor de unidades inline
  const [showInlineConverter, setShowInlineConverter] = useState(false);
  const [converterCantidad, setConverterCantidad] = useState('');
  const [converterUnidad, setConverterUnidad] = useState<UnidadConversor>('KG');

  // Cargar datos iniciales
  useEffect(() => {
    fetchIngredientes(true);
  }, [fetchIngredientes]);

  const loadPlatosAfectados = async () => {
    setLoadingPlatosAfectados(true);
    try {
      const platos = await salaService.getPlatosStockBajoAfectados();
      setPlatosAfectados(platos);
    } catch (error) {
      console.error('[Inventario] Error cargando platos afectados:', error);
    } finally {
      setLoadingPlatosAfectados(false);
    }
  };

  const handleShowPlatosAfectados = () => {
    loadPlatosAfectados();
    setShowPlatosAfectadosModal(true);
  };

  // Activar SSE para recibir actualizaciones de stock en tiempo real
  useCartaSSE({ enabled: true });

  // Limpiar el highlight de recentlyUpdated después de 3 segundos
  useEffect(() => {
    if (recentlyUpdated.length > 0) {
      const timers = recentlyUpdated.map(({ ingredienteId }) => {
        return setTimeout(() => {
          clearRecentlyUpdated(ingredienteId);
        }, 3000);
      });

      return () => {
        timers.forEach(timer => clearTimeout(timer));
      };
    }
  }, [recentlyUpdated, clearRecentlyUpdated]);

  // Filtrar ingredientes según búsqueda y alertas
  const filteredIngredients = useMemo(() => {
    let result = ingredientes;

    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((i) =>
        i.nombre.toLowerCase().includes(query)
      );
    }

    // Filtrar por alertas
    if (showAlertsOnly) {
      result = result.filter((i) => i.stockActual <= i.umbralAlerta);
    }

    return result;
  }, [ingredientes, searchQuery, showAlertsOnly]);

  // Agrupar ingredientes por categoría
  const sections: Section[] = useMemo(() => {
    const grouped = new Map<string, IngredienteResponse[]>();

    filteredIngredients.forEach((ingrediente) => {
      const categoriaNombre = ingrediente.categoria?.nombre || 'Sin categoría';
      if (!grouped.has(categoriaNombre)) {
        grouped.set(categoriaNombre, []);
      }
      grouped.get(categoriaNombre)!.push(ingrediente);
    });

    // Convertir a array y ordenar alfabéticamente por categoría
    const sortedSections = Array.from(grouped.entries())
      .map(([title, data]) => ({ title, data }))
      .sort((a, b) => a.title.localeCompare(b.title));

    return sortedSections;
  }, [filteredIngredients]);

  const alertCount = ingredientes.filter((i) => i.stockActual <= i.umbralAlerta).length;
  const totalValue = ingredientes.reduce((sum, i) => sum + (i.stockActual * i.precioPorUnidad), 0);
  const lowStockCount = ingredientes.filter((i) => i.stockActual <= i.umbralAlerta && i.stockActual > 0).length;
  const outOfStockCount = ingredientes.filter((i) => i.stockActual === 0).length;

  const openStockModal = (ingrediente: IngredienteResponse) => {
    setSelectedIngrediente(ingrediente);
    setNewStock(ingrediente.stockActual.toString());
    setShowStockModal(true);
  };

  // Normaliza el separador decimal (coma o punto) a punto para parseFloat
  const normalizeDecimal = (value: string): string => {
    return value.replace(',', '.');
  };

  const handleUpdateStock = async () => {
    if (!selectedIngrediente) return;

    const stock = parseFloat(normalizeDecimal(newStock));
    if (isNaN(stock) || stock < 0) {
      Alert.alert('Error', 'Stock inválido');
      return;
    }

    setSavingStock(true);
    try {
      await cartaService.actualizarIngrediente(selectedIngrediente.id, {
        nombre: selectedIngrediente.nombre,
        unidadMedida: selectedIngrediente.unidadMedida,
        precioPorUnidad: selectedIngrediente.precioPorUnidad,
        stockActual: stock,
        umbralAlerta: selectedIngrediente.umbralAlerta,
      });
      setShowStockModal(false);
      fetchIngredientes(true);
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el stock');
    } finally {
      setSavingStock(false);
    }
  };

  const openInlineConverter = () => {
    setShowInlineConverter(true);
    setConverterCantidad('');
    // Establecer unidad por defecto según el tipo
    if (selectedIngrediente?.unidadMedida === 'GRAMO') {
      setConverterUnidad('KG');
    } else if (selectedIngrediente?.unidadMedida === 'ML') {
      setConverterUnidad('L');
    }
  };

  const closeInlineConverter = () => {
    setShowInlineConverter(false);
    setConverterCantidad('');
  };

  const applyConversion = () => {
    // Reemplazar coma por punto para manejar decimales correctamente
    const cantidad = parseFloat(converterCantidad.replace(',', '.'));
    if (isNaN(cantidad) || cantidad <= 0) {
      Alert.alert('Error', 'Cantidad inválida');
      return;
    }

    const conversion = UnitConverterService.convertir(
      cantidad,
      converterUnidad
    );

    setNewStock(conversion.cantidadBase.toString());
    closeInlineConverter();
  };

  const getConverterOpciones = () => {
    if (selectedIngrediente?.unidadMedida === 'GRAMO') {
      return [
        { value: 'KG' as UnidadConversor, label: 'kg' },
        { value: 'G' as UnidadConversor, label: 'g' },
      ];
    } else if (selectedIngrediente?.unidadMedida === 'ML') {
      return [
        { value: 'L' as UnidadConversor, label: 'L' },
        { value: 'ML' as UnidadConversor, label: 'ml' },
      ];
    }
    return [];
  };



  const handleConversionComplete = (cantidadBase: number, precioBase: number) => {
    setNewStock(cantidadBase.toString());
  };

  const getStockStatus = (item: IngredienteResponse): 'ok' | 'low' | 'out' => {
    if (item.stockActual === 0) return 'out';
    if (item.stockActual <= item.umbralAlerta) return 'low';
    return 'ok';
  };

  const getStockColor = (status: 'ok' | 'low' | 'out') => {
    switch (status) {
      case 'out': return colors.error;
      case 'low': return colors.warning;
      default: return colors.success;
    }
  };

  const renderItem = ({ item }: { item: IngredienteResponse }) => {
    const status = getStockStatus(item);
    const stockColor = getStockColor(status);
    const isRecentlyUpdated = recentlyUpdated.some(r => r.ingredienteId === item.id);

    return (
      <Card style={styles.card} onPress={() => openStockModal(item)}>
        <View style={styles.cardRow}>
          <View style={styles.cardInfo}>
            <Text style={styles.cardNombre}>{item.nombre}</Text>
            <Text style={styles.cardUnidad}>{item.unidadMedida}</Text>
          </View>
          <View style={styles.stockContainer}>
            <View style={[
              styles.stockBadge, 
              { backgroundColor: stockColor },
              isRecentlyUpdated && styles.stockBadgeHighlight
            ]}>
              <Text style={styles.stockValue}>{item.stockActual}</Text>
            </View>
            <Text style={styles.umbralText}>Min: {item.umbralAlerta}</Text>
          </View>
        </View>
        <View style={styles.cardFooter}>
          <Text style={styles.precioText}>
            {item.precioPorUnidad.toFixed(2)} €/ {item.unidadMedida.toLowerCase()}
          </Text>
          <Text style={[styles.statusText, { color: stockColor }]}>
            {status === 'out' ? 'SIN STOCK' : status === 'low' ? 'BAJO STOCK' : 'OK'}
          </Text>
        </View>
      </Card>
    );
  };

  const renderSectionHeader = ({ section }: { section: Section }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <Text style={styles.sectionCount}>{section.data.length} items</Text>
    </View>
  );



  if (loading) {
    return <Loading fullScreen message="Cargando inventario..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <View style={styles.kpiContainer}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiValue}>{ingredientes.length}</Text>
          <Text style={styles.kpiLabel}>Ingredientes</Text>
        </View>
        <View style={[styles.kpiCard, { backgroundColor: colors.primaryLight }]}>
          <Text style={[styles.kpiValue, { color: colors.surface }]}>{totalValue.toFixed(2)}€</Text>
          <Text style={[styles.kpiLabel, { color: colors.surface }]}>Valor Stock</Text>
        </View>
        <View style={[styles.kpiCard, { backgroundColor: colors.warningLight }]}>
          <Text style={[styles.kpiValue, { color: colors.warning }]}>{lowStockCount}</Text>
          <Text style={[styles.kpiLabel, { color: colors.warning }]}>Bajo Stock</Text>
        </View>
        <View style={[styles.kpiCard, { backgroundColor: colors.errorLight }]}>
          <Text style={[styles.kpiValue, { color: colors.error }]}>{outOfStockCount}</Text>
          <Text style={[styles.kpiLabel, { color: colors.error }]}>Sin Stock</Text>
        </View>
      </View>

      <View style={styles.header}>
        {/* Buscador */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Buscar ingrediente..."
            placeholderTextColor={colors.textSecondary}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {alertCount > 0 && (
          <TouchableOpacity
            style={styles.platosAfectadosButton}
            onPress={handleShowPlatosAfectados}
          >
            <Ionicons name="restaurant" size={18} color={colors.error} />
            <Text style={styles.platosAfectadosText}>
              Ver {alertCount} platos afectados
            </Text>
          </TouchableOpacity>
        )}

        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, !showAlertsOnly && styles.tabActive]}
            onPress={() => setShowAlertsOnly(false)}
          >
            <Text style={[styles.tabText, !showAlertsOnly && styles.tabTextActive]}>
              Todo ({ingredientes.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, showAlertsOnly && styles.tabActive]}
            onPress={() => setShowAlertsOnly(true)}
          >
            <Text style={[styles.tabText, showAlertsOnly && styles.tabTextActive]}>
              <Ionicons name="warning" size={14} color={showAlertsOnly ? colors.accent : colors.textSecondary} /> Alertas ({alertCount})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}

        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={() => { 
              setRefreshing(true); 
              fetchIngredientes(true).finally(() => setRefreshing(false));
            }} 
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery.trim() 
                ? 'No se encontraron ingredientes' 
                : showAlertsOnly 
                  ? 'No hay alertas de stock' 
                  : 'No hay ingredientes'}
            </Text>
          </View>
        }
      />

      <Modal visible={showStockModal} animationType="slide" presentationStyle="pageSheet">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Actualizar Stock</Text>
            {selectedIngrediente && (
              <>
                <Text style={styles.modalNombre}>{selectedIngrediente.nombre}</Text>
                <View style={styles.modalInfo}>
                  <Text style={styles.modalInfoText}>
                    Stock actual: {selectedIngrediente.stockActual} {selectedIngrediente.unidadMedida}
                  </Text>
                  <Text style={styles.modalInfoText}>
                    Umbral alerta: {selectedIngrediente.umbralAlerta}
                  </Text>
                </View>
              <View style={styles.stockInputContainer}>
                <TextInput
                  style={styles.modalInput}
                  value={newStock}
                  onChangeText={setNewStock}
                  keyboardType="decimal-pad"
                  placeholder="Nueva cantidad"
                  autoFocus
                />
                {selectedIngrediente.unidadMedida !== 'UNIDAD' && !showInlineConverter && (
                  <ConverterButton onPress={openInlineConverter} />
                )}
              </View>
              {selectedIngrediente.unidadMedida !== 'UNIDAD' && !showInlineConverter && (
                <Text style={styles.helperHint}>
                  Pulsa ⚡ para convertir desde {selectedIngrediente.unidadMedida === 'GRAMO' ? 'kg' : 'L'}
                </Text>
              )}

              {/* Conversor inline */}
              {showInlineConverter && selectedIngrediente.unidadMedida !== 'UNIDAD' && (
                <View style={styles.inlineConverterContainer}>
                  <Text style={styles.inlineConverterTitle}>Conversor de unidades</Text>
                  
                  <View style={styles.inlineConverterRow}>
                    <Text style={styles.inlineConverterLabel}>Cantidad:</Text>
                    <TextInput
                      style={styles.inlineConverterInput}
                      value={converterCantidad}
                      onChangeText={setConverterCantidad}
                      keyboardType="decimal-pad"
                      placeholder="0"
                      autoFocus
                    />
                    <View style={styles.inlineConverterUnidades}>
                      {getConverterOpciones().map((opt) => (
                        <TouchableOpacity
                          key={opt.value}
                          style={[
                            styles.inlineUnidadButton,
                            converterUnidad === opt.value && styles.inlineUnidadButtonActive,
                          ]}
                          onPress={() => setConverterUnidad(opt.value)}
                        >
                          <Text
                            style={[
                              styles.inlineUnidadText,
                              converterUnidad === opt.value && styles.inlineUnidadTextActive,
                            ]}
                          >
                            {opt.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {(() => {
                    const cantidad = parseFloat(converterCantidad.replace(',', '.'));
                    if (!isNaN(cantidad) && cantidad > 0) {
                      const conversion = UnitConverterService.convertir(
                        cantidad,
                        converterUnidad
                      );
                      // Mostrar con hasta 4 decimales, eliminando ceros innecesarios
                      const cantidadFormateada = conversion.cantidadBase.toLocaleString('es-ES', {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 4,
                      });
                      return (
                        <View style={styles.inlineResultado}>
                          <Text style={styles.inlineResultadoText}>
                            = {cantidadFormateada} {conversion.unidadBaseLabel}
                          </Text>
                        </View>
                      );
                    }
                    return null;
                  })()}

                  <View style={styles.inlineConverterButtons}>
                    <TouchableOpacity
                      style={[styles.inlineConverterBtn, styles.inlineConverterBtnCancel]}
                      onPress={closeInlineConverter}
                    >
                      <Text style={styles.inlineConverterBtnCancelText}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.inlineConverterBtn, styles.inlineConverterBtnApply]}
                      onPress={applyConversion}
                    >
                      <Text style={styles.inlineConverterBtnApplyText}>Aplicar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              <View style={styles.modalButtons}>
                <Button
                  title="Cancelar"
                  onPress={() => setShowStockModal(false)}
                  variant="secondary"
                  style={styles.modalButton}
                />
                <Button
                  title="Guardar"
                  onPress={handleUpdateStock}
                  loading={savingStock}
                  style={styles.modalButton}
                />
              </View>
            </>
          )}
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Modal de platos con stock bajo afectados */}
      <Modal
        visible={showPlatosAfectadosModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPlatosAfectadosModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.platosAfectadosModal}>
            <View style={styles.platosAfectadosHeader}>
              <View style={styles.platosAfectadosTitleRow}>
                <Ionicons name="warning" size={24} color={colors.error} />
                <Text style={styles.platosAfectadosTitle}>Platos con stock bajo</Text>
              </View>
              <TouchableOpacity onPress={() => setShowPlatosAfectadosModal(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {loadingPlatosAfectados ? (
              <Loading message="Cargando platos..." />
            ) : (
              <FlatList
                data={platosAfectados}
                keyExtractor={(item) => item.platoId}
                renderItem={({ item }) => (
                  <View style={styles.platoAfectadoItem}>
                    <Text style={styles.platoAfectadoNombre}>{item.nombre}</Text>
                    <View style={styles.platoAfectadoDetalles}>
                      {item.ingredientesBajos?.map((ing, idx) => (
                        <Text key={idx} style={styles.platoAfectadoIng}>
                          • {ing.nombre}: {ing.stockActual}/{ing.umbralAlerta} {ing.unidadMedida}
                        </Text>
                      ))}
                    </View>
                  </View>
                )}
                ListEmptyComponent={
                  <View style={styles.platosAfectadosEmpty}>
                    <Ionicons name="checkmark-circle" size={48} color={colors.success} />
                    <Text style={styles.platosAfectadosEmptyText}>
                      No hay platos con stock bajo
                    </Text>
                  </View>
                }
              />
            )}
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
  kpiContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.surface,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  kpiValue: {
    ...typography.h3,
    color: colors.text,
  },
  kpiLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  header: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.sm,
    ...typography.body,
    color: colors.text,
  },
  clearButton: {
    padding: spacing.xs,
  },
  tabs: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tab: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    backgroundColor: colors.background,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.surface,
  },
  list: {
    padding: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.primary + '10',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    borderRadius: 8,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: '700',
  },
  sectionCount: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },

  card: {
    marginBottom: spacing.sm,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  cardNombre: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  cardUnidad: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  stockContainer: {
    alignItems: 'flex-end',
  },
  stockBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  stockBadgeHighlight: {
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 10,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  stockValue: {
    ...typography.h3,
    color: colors.surface,
  },
  umbralText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  precioText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  modalContainer: {
    flex: 1,
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  modalTitle: {
    ...typography.h2,
    color: colors.text,
  },
  modalNombre: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.lg,
  },
  modalInfo: {
    marginTop: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 8,
  },
  modalInfoText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  modalInput: {
    ...typography.h2,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    textAlign: 'center',
    flex: 1,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  modalButton: {
    flex: 1,
  },
  stockInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  helperHint: {
    ...typography.caption,
    color: colors.primary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  inlineConverterContainer: {
    backgroundColor: colors.primary + '10',
    borderRadius: 12,
    padding: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  inlineConverterTitle: {
    ...typography.h3,
    color: colors.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  inlineConverterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  inlineConverterLabel: {
    ...typography.body,
    color: colors.text,
    width: 100,
  },
  inlineConverterInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.sm,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  inlineConverterUnidades: {
    flexDirection: 'row',
    marginLeft: spacing.sm,
    gap: spacing.xs,
  },
  inlineUnidadButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  inlineUnidadButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  inlineUnidadText: {
    ...typography.body,
    color: colors.text,
  },
  inlineUnidadTextActive: {
    color: colors.surface,
    fontWeight: '600',
  },
  inlineResultado: {
    backgroundColor: colors.primary + '20',
    borderRadius: 8,
    padding: spacing.md,
    marginVertical: spacing.sm,
    alignItems: 'center',
  },
  inlineResultadoText: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: '700',
  },

  inlineConverterButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  inlineConverterBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  inlineConverterBtnCancel: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inlineConverterBtnCancelText: {
    ...typography.body,
    color: colors.text,
  },
  inlineConverterBtnApply: {
    backgroundColor: colors.primary,
  },
  inlineConverterBtnApplyText: {
    ...typography.body,
    color: colors.surface,
    fontWeight: '600',
  },
  platosAfectadosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.error + '15',
    borderRadius: 8,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.error + '30',
  },
  platosAfectadosText: {
    ...typography.body,
    color: colors.error,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  platosAfectadosModal: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: spacing.xl,
  },
  platosAfectadosHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  platosAfectadosTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  platosAfectadosTitle: {
    ...typography.h3,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  platoAfectadoItem: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  platoAfectadoNombre: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  platoAfectadoDetalles: {
    marginLeft: spacing.sm,
  },
  platoAfectadoIng: {
    ...typography.caption,
    color: colors.error,
  },
  platosAfectadosEmpty: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  platosAfectadosEmptyText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
});
