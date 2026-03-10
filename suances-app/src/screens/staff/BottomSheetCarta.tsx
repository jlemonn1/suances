import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  FlatList,
  TextInput,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { salaService } from '../../services/salaService';
import type { PlatoOperativo } from '../../types/carta';
import type { TipoRonda, CarritoItem } from '../../types/sala';
import { useCategoriaStore } from '../../store/categoriaStore';

interface BottomSheetCartaProps {
  visible: boolean;
  comandaId: string;
  onClose: () => void;
  onAgregarAlCarrito: (item: CarritoItem) => void;
}

const TIPOS_RONDA: { tipo: TipoRonda; label: string; icon: string }[] = [
  { tipo: 'ENTRANTE', label: 'Entrante', icon: 'restaurant-outline' },
  { tipo: 'BEBIDA', label: 'Bebida', icon: 'wine-outline' },
  { tipo: 'PRIMERO', label: 'Primero', icon: 'soup-outline' },
  { tipo: 'SEGUNDO', label: 'Segundo', icon: 'fish-outline' },
  { tipo: 'POSTRE', label: 'Postre', icon: 'ice-cream-outline' },
];

export const BottomSheetCarta: React.FC<BottomSheetCartaProps> = ({
  visible,
  comandaId,
  onClose,
  onAgregarAlCarrito,
}) => {
  const [platos, setPlatos] = useState<PlatoOperativo[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedPlato, setSelectedPlato] = useState<PlatoOperativo | null>(null);
  const [cantidad, setCantidad] = useState(1);
  const [notas, setNotas] = useState('');
  const [tipoRondaSeleccionado, setTipoRondaSeleccionado] = useState<TipoRonda>('PRIMERO');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string | null>(null);
  
  const { categorias, fetchCategorias } = useCategoriaStore();

  // SSE temporalmente desactivado para evitar bucle de reconexiones
  // TODO: Revisar y reactivar cuando se solucione el problema de bucle
  // useCartaSSE({ 
  //   enabled: visible,
  //   onPlatoChanged: () => {
  //     console.log('[BottomSheetCarta] SSE detectó cambio en platos');
  //     if (visible) {
  //       loadPlatos();
  //     }
  //   }
  // });

  const prevVisibleRef = useRef(visible);
  
  useEffect(() => {
    // Solo ejecutar si visible cambió realmente
    if (visible === prevVisibleRef.current) {
      return;
    }
    prevVisibleRef.current = visible;
    
    if (visible) {
      console.log('[BottomSheetCarta] Modal abierto - cargando platos');
      loadPlatos();
      fetchCategorias(true, 'PLATO');
      // No recargar rondas aquí - ComandaDetailScreen ya las tiene cargadas
    } else {
      console.log('[BottomSheetCarta] Modal cerrado - reseteando estado');
      // Reset state when closing
      setSelectedPlato(null);
      setCantidad(1);
      setNotas('');
      setTipoRondaSeleccionado('PRIMERO');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]); // Solo depende de visible

  const loadPlatos = async () => {
    setLoading(true);
    try {
      // Obtener platos operativos desde sala-service
      const platosOperativos = await salaService.getPlatosOperativos();
      setPlatos(platosOperativos.filter((p) => p.disponible));
    } catch (error) {
      console.error('Error loading platos desde sala:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlato = (plato: PlatoOperativo) => {
    setSelectedPlato(plato);
    setCantidad(1);
    setNotas('');
  };

  const handleAgregar = () => {
    console.log('[BottomSheetCarta] handleAgregar iniciado');
    if (!selectedPlato) {
      console.log('[BottomSheetCarta] No hay plato seleccionado');
      return;
    }

    try {
      console.log('[BottomSheetCarta] Agregando al carrito:', selectedPlato.nombre);
      
      const carritoItem: CarritoItem = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        platoId: selectedPlato.platoId,
        nombrePlato: selectedPlato.nombre,
        cantidad,
        notas: notas.trim() || undefined,
        tipoRonda: tipoRondaSeleccionado,
        precioUnitario: selectedPlato.precioVenta,
      };
      
      onAgregarAlCarrito(carritoItem);
      
      // Reset y cerrar
      setSelectedPlato(null);
      setCantidad(1);
      setNotas('');
      setTipoRondaSeleccionado('PRIMERO');
      onClose();
    } catch (error: any) {
      console.error('[BottomSheetCarta] Error:', error);
    }
  };

  const filteredPlatos = platos.filter((p) => {
    const matchesSearch = !search || p.nombre.toLowerCase().includes(search.toLowerCase());
    const matchesCategoria = !categoriaSeleccionada || p.categoriaId === categoriaSeleccionada;
    return matchesSearch && matchesCategoria;
  });

  const renderPlato = ({ item }: { item: PlatoOperativo }) => (
    <TouchableOpacity
      style={[
        styles.platoItem,
        selectedPlato?.platoId === item.platoId && styles.platoItemSelected,
      ]}
      onPress={() => handleSelectPlato(item)}
    >
      <View style={styles.platoInfo}>
        <Text style={styles.platoNombre}>{item.nombre}</Text>
        {item.categoriaNombre && (
          <Text style={styles.platoCategoria}>{item.categoriaNombre}</Text>
        )}
        {item.stockBajo && (
          <Text style={styles.stockBajo}>Stock bajo</Text>
        )}
      </View>
      <Text style={styles.platoPrecio}>{item.precioVenta.toFixed(2)}€</Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <SafeAreaView style={styles.safeAreaContainer} edges={['top', 'left', 'right']}>
              <View style={styles.handle} />

              {!selectedPlato ? (
                <>
                  <View style={styles.header}>
                    <Text style={styles.title}>Agregar Pedido</Text>
                    <TouchableOpacity onPress={onClose}>
                      <Ionicons name="close" size={24} color={colors.text} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color={colors.textSecondary} />
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Buscar plato..."
                      value={search}
                      onChangeText={setSearch}
                      placeholderTextColor={colors.textSecondary}
                    />
                  </View>

                  {/* Selector de Categorías */}
                  <View style={styles.categoriasContainer}>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.categoriasScroll}
                    >
                      <TouchableOpacity
                        style={[
                          styles.categoriaChip,
                          categoriaSeleccionada === null && styles.categoriaChipSelected,
                        ]}
                        onPress={() => setCategoriaSeleccionada(null)}
                      >
                        <Text
                          style={[
                            styles.categoriaChipText,
                            categoriaSeleccionada === null && styles.categoriaChipTextSelected,
                          ]}
                        >
                          Todas
                        </Text>
                      </TouchableOpacity>
                      {categorias.map((categoria) => (
                        <TouchableOpacity
                          key={categoria.id}
                          style={[
                            styles.categoriaChip,
                            categoriaSeleccionada === categoria.id && styles.categoriaChipSelected,
                          ]}
                          onPress={() => setCategoriaSeleccionada(
                            categoriaSeleccionada === categoria.id ? null : categoria.id
                          )}
                        >
                          <Text
                            style={[
                              styles.categoriaChipText,
                              categoriaSeleccionada === categoria.id && styles.categoriaChipTextSelected,
                            ]}
                          >
                            {categoria.nombre}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>

                  <FlatList
                    data={filteredPlatos}
                    keyExtractor={(item) => item.platoId}
                    renderItem={renderPlato}
                    contentContainerStyle={styles.platoList}
                    showsVerticalScrollIndicator={false}
                  />
                </>
              ) : (
                <View style={styles.selectedContainer}>
                  <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => setSelectedPlato(null)}
                  >
                    <Ionicons name="arrow-back" size={20} color={colors.text} />
                  </TouchableOpacity>

                  <View style={styles.selectedInfo}>
                    <Text style={styles.selectedNombre}>{selectedPlato.nombre}</Text>
                    <Text style={styles.selectedPrecio}>
                      {selectedPlato.precioVenta.toFixed(2)}€ unidad
                    </Text>
                    {selectedPlato.stockBajo && (
                      <Text style={styles.stockBajoWarning}>⚠️ Stock bajo</Text>
                    )}
                  </View>

                  <View style={styles.cantidadContainer}>
                    <Text style={styles.label}>Cantidad</Text>
                    <View style={styles.cantidadControls}>
                      <TouchableOpacity
                        style={styles.cantidadButton}
                        onPress={() => setCantidad(Math.max(1, cantidad - 1))}
                      >
                        <Ionicons name="remove" size={24} color={colors.primary} />
                      </TouchableOpacity>
                      <Text style={styles.cantidadText}>{cantidad}</Text>
                      <TouchableOpacity
                        style={styles.cantidadButton}
                        onPress={() => setCantidad(cantidad + 1)}
                      >
                        <Ionicons name="add" size={24} color={colors.primary} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Selector de Tipo de Ronda */}
                  <View style={styles.tipoRondaContainer}>
                    <Text style={styles.label}>Tipo de pedido</Text>
                    <View style={styles.tipoRondaOptions}>
                      {TIPOS_RONDA.map(({ tipo, label, icon }) => (
                        <TouchableOpacity
                          key={tipo}
                          style={[
                            styles.tipoRondaOption,
                            tipoRondaSeleccionado === tipo && styles.tipoRondaOptionSelected,
                          ]}
                          onPress={() => setTipoRondaSeleccionado(tipo)}
                        >
                          <Ionicons 
                            name={icon as any} 
                            size={20} 
                            color={tipoRondaSeleccionado === tipo ? colors.surface : colors.text} 
                          />
                          <Text
                            style={[
                              styles.tipoRondaText,
                              tipoRondaSeleccionado === tipo && styles.tipoRondaTextSelected,
                            ]}
                          >
                            {label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.notasContainer}>
                    <Text style={styles.label}>Notas (opcional)</Text>
                    <TextInput
                      style={styles.notasInput}
                      placeholder="Ej: Sin cebolla, una porción sin gluten..."
                      value={notas}
                      onChangeText={setNotas}
                      multiline
                      numberOfLines={2}
                      placeholderTextColor={colors.textSecondary}
                    />
                  </View>

                  <View style={styles.totalContainer}>
                    <Text style={styles.label}>Total</Text>
                    <Text style={styles.totalText}>
                      {(selectedPlato.precioVenta * cantidad).toFixed(2)}€
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.agregarButton}
                    onPress={handleAgregar}
                  >
                    <Ionicons name="add-circle" size={20} color={colors.surface} />
                    <Text style={styles.agregarButtonText}>
                      Agregar al carrito
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </SafeAreaView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  safeAreaContainer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '90%',
    minHeight: '50%',
  },
  container: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '90%',
    minHeight: '50%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    marginHorizontal: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  categoriasContainer: {
    marginBottom: spacing.md,
  },
  categoriasScroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  categoriaChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  categoriaChipSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  categoriaChipText: {
    ...typography.bodySmall,
    color: colors.text,
  },
  categoriaChipTextSelected: {
    color: colors.surface,
    fontWeight: '600',
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    fontSize: 16,
    color: colors.text,
  },
  platoList: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  platoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  platoItemSelected: {
    backgroundColor: colors.successLight,
    marginHorizontal: -spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  platoInfo: {
    flex: 1,
  },
  platoNombre: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  platoCategoria: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  platoPrecio: {
    ...typography.body,
    fontWeight: '600',
    color: colors.accent,
  },
  stockBajo: {
    ...typography.caption,
    color: colors.error,
    marginTop: 2,
  },
  selectedContainer: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  backButton: {
    marginBottom: spacing.md,
  },
  selectedInfo: {
    marginBottom: spacing.lg,
  },
  selectedNombre: {
    ...typography.h2,
    color: colors.text,
  },
  selectedPrecio: {
    ...typography.body,
    color: colors.textSecondary,
  },
  stockBajoWarning: {
    ...typography.bodySmall,
    color: colors.error,
    marginTop: spacing.xs,
  },
  label: {
    ...typography.bodySmall,
    fontWeight: '500',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  cantidadContainer: {
    marginBottom: spacing.lg,
  },
  rondaContainer: {
    marginBottom: spacing.lg,
  },
  rondaOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  rondaOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  rondaOptionSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  rondaOptionEnviada: {
    backgroundColor: colors.successLight,
    borderColor: colors.success,
    opacity: 0.6,
  },
  rondaOptionNueva: {
    borderStyle: 'dashed',
    borderColor: colors.accent,
  },
  rondaOptionText: {
    ...typography.bodySmall,
    color: colors.text,
  },
  rondaOptionTextSelected: {
    color: colors.surface,
    fontWeight: '600',
  },
  rondaOptionTextEnviada: {
    color: colors.success,
  },
  rondaOptionNuevaText: {
    color: colors.accent,
    fontWeight: '600',
  },
  tipoRondaContainer: {
    marginBottom: spacing.lg,
  },
  tipoRondaOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tipoRondaOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tipoRondaOptionSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  tipoRondaText: {
    ...typography.bodySmall,
    color: colors.text,
  },
  tipoRondaTextSelected: {
    color: colors.surface,
    fontWeight: '600',
  },
  cantidadControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  cantidadButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  cantidadText: {
    ...typography.h2,
    color: colors.text,
    minWidth: 40,
    textAlign: 'center',
  },
  notasContainer: {
    marginBottom: spacing.lg,
  },
  notasInput: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  totalText: {
    ...typography.h1,
    color: colors.success,
  },
  agregarButton: {
    backgroundColor: colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  agregarButtonDisabled: {
    backgroundColor: colors.disabled,
  },
  agregarButtonText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.surface,
  },
});
