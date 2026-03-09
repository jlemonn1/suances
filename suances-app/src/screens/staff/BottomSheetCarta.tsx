import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  FlatList,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { useSalaStore } from '../../store/salaStore';
import { usePlatoStore } from '../../store/platoStore';
import { cartaService } from '../../services/cartaService';
import type { PlatoResponse } from '../../types/plato';

interface BottomSheetCartaProps {
  visible: boolean;
  comandaId: string;
  onClose: () => void;
}

export const BottomSheetCarta: React.FC<BottomSheetCartaProps> = ({
  visible,
  comandaId,
  onClose,
}) => {
  const [platos, setPlatos] = useState<PlatoResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedPlato, setSelectedPlato] = useState<PlatoResponse | null>(null);
  const [cantidad, setCantidad] = useState(1);
  const [notas, setNotas] = useState('');

  const { agregarPedido, loadingAccion } = useSalaStore();

  useEffect(() => {
    if (visible) {
      loadPlatos();
    }
  }, [visible]);

  const loadPlatos = async () => {
    setLoading(true);
    try {
      const data = await cartaService.getPlatos(true);
      setPlatos(data.filter((p) => p.activo));
    } catch (error) {
      console.error('Error loading platos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlato = (plato: PlatoResponse) => {
    setSelectedPlato(plato);
    setCantidad(1);
    setNotas('');
  };

  const handleAgregar = async () => {
    if (!selectedPlato) return;

    try {
      await agregarPedido(comandaId, {
        platoId: selectedPlato.id,
        cantidad,
        notas: notas.trim() || undefined,
      });
      Alert.alert('Éxito', 'Pedido agregado');
      setSelectedPlato(null);
      onClose();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Error al agregar pedido');
    }
  };

  const filteredPlatos = search
    ? platos.filter((p) =>
        p.nombre.toLowerCase().includes(search.toLowerCase())
      )
    : platos;

  const renderPlato = ({ item }: { item: PlatoResponse }) => (
    <TouchableOpacity
      style={[
        styles.platoItem,
        selectedPlato?.id === item.id && styles.platoItemSelected,
      ]}
      onPress={() => handleSelectPlato(item)}
    >
      <View style={styles.platoInfo}>
        <Text style={styles.platoNombre}>{item.nombre}</Text>
        {item.categoria && (
          <Text style={styles.platoCategoria}>{item.categoria.nombre}</Text>
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
            <View style={styles.container}>
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

                  <FlatList
                    data={filteredPlatos}
                    keyExtractor={(item) => item.id}
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
                    style={[styles.agregarButton, loadingAccion && styles.agregarButtonDisabled]}
                    onPress={handleAgregar}
                    disabled={loadingAccion}
                  >
                    {loadingAccion ? (
                      <Text style={styles.agregarButtonText}>Agregando...</Text>
                    ) : (
                      <>
                        <Ionicons name="add-circle" size={20} color={colors.surface} />
                        <Text style={styles.agregarButtonText}>
                          Agregar a la comanda
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>
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
    marginBottom: spacing.md,
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
  label: {
    ...typography.bodySmall,
    fontWeight: '500',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  cantidadContainer: {
    marginBottom: spacing.lg,
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
