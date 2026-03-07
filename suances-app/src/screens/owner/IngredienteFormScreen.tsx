import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Button, Input, Loading, UnitConverter, ConverterButton } from '../../components/common';
import { colors, spacing, typography } from '../../theme';
import { cartaService } from '../../services/cartaService';
import { IngredienteRequest, IngredienteResponse, CategoriaResponse, CategoriaTipo } from '../../types/ingrediente';
import { UnidadMedida } from '../../types/plato';
import { useIngredienteStore } from '../../store/ingredienteStore';
import { useCategoriaStore } from '../../store/categoriaStore';
import { UnitConverterService } from '../../services/unitConverter';

interface IngredienteFormScreenProps {
  navigation: any;
  route: { params?: { ingrediente?: any } };
}

const UNIDADES: { value: UnidadMedida; label: string }[] = [
  { value: 'GRAMO', label: 'Gramos (g)' },
  { value: 'ML', label: 'Mililitros (ml)' },
  { value: 'UNIDAD', label: 'Unidades' },
];

export const IngredienteFormScreen: React.FC<IngredienteFormScreenProps> = ({
  navigation,
  route,
}) => {
  const { addIngrediente, updateIngrediente } = useIngredienteStore();
  const { categorias, fetchCategorias } = useCategoriaStore();
  const editing = !!route.params?.ingrediente;
  const initialData = route.params?.ingrediente;

  const [nombre, setNombre] = useState(initialData?.nombre || '');
  const [unidadMedida, setUnidadMedida] = useState<UnidadMedida>(initialData?.unidadMedida || 'GRAMO');
  const [precioPorUnidad, setPrecioPorUnidad] = useState(initialData?.precioPorUnidad?.toString() || '');
  const [stockActual, setStockActual] = useState(initialData?.stockActual?.toString() || '0');
  const [umbralAlerta, setUmbralAlerta] = useState(initialData?.umbralAlerta?.toString() || '10');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<CategoriaResponse | null>(
    initialData?.categoria || null
  );
  const [activo, setActivo] = useState(initialData?.activo ?? true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ nombre?: string; precio?: string }>({});

  const [showCategoriaModal, setShowCategoriaModal] = useState(false);
  const [nuevaCategoria, setNuevaCategoria] = useState('');
  const [loadingCategoria, setLoadingCategoria] = useState(false);

  // Estados para el conversor de unidades
  const [showUnitConverter, setShowUnitConverter] = useState(false);
  const [converterTipo, setConverterTipo] = useState<'peso' | 'volumen' | 'unidad'>('peso');
  const [converterTarget, setConverterTarget] = useState<'stock' | 'precio'>('stock');

  useEffect(() => {
    fetchCategorias(true, 'INGREDIENTE');
  }, []);

  const validate = (): boolean => {
    const newErrors: { nombre?: string; precio?: string } = {};
    
    if (!nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    }
    
    const precio = parseFloat(precioPorUnidad);
    if (isNaN(precio) || precio < 0) {
      newErrors.precio = 'Precio válido obligatorio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const data: IngredienteRequest = {
        nombre: nombre.trim(),
        unidadMedida,
        precioPorUnidad: parseFloat(precioPorUnidad),
        stockActual: parseFloat(stockActual) || 0,
        umbralAlerta: parseFloat(umbralAlerta) || 10,
        categoriaId: categoriaSeleccionada?.id,
      };

      if (editing) {
        const updated = await cartaService.actualizarIngrediente(initialData.id, data);
        updateIngrediente(updated);
      } else {
        const created = await cartaService.crearIngrediente(data);
        addIngrediente(created);
      }
      
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el ingrediente');
    } finally {
      setLoading(false);
    }
  };

  const handleCrearCategoria = async () => {
    if (!nuevaCategoria.trim()) {
      Alert.alert('Error', 'El nombre de la categoría es obligatorio');
      return;
    }

    setLoadingCategoria(true);
    try {
      const created = await cartaService.crearCategoria({
        nombre: nuevaCategoria.trim(),
        tipo: 'INGREDIENTE' as CategoriaTipo
      });
      await fetchCategorias(true, 'INGREDIENTE');
      setCategoriaSeleccionada(created);
      setNuevaCategoria('');
      setShowCategoriaModal(false);
    } catch (error: any) {
      if (error?.response?.status === 400) {
        Alert.alert('Error', 'Ya existe una categoría con ese nombre');
      } else {
        Alert.alert('Error', 'No se pudo crear la categoría');
      }
    } finally {
      setLoadingCategoria(false);
    }
  };

  const openUnitConverter = (target: 'stock' | 'precio') => {
    let tipo: 'peso' | 'volumen' | 'unidad' = 'peso';
    if (unidadMedida === 'GRAMO') {
      tipo = 'peso';
    } else if (unidadMedida === 'ML') {
      tipo = 'volumen';
    } else {
      tipo = 'unidad';
    }
    setConverterTipo(tipo);
    setConverterTarget(target);
    setShowUnitConverter(true);
  };

  const handleConversionComplete = (cantidadBase: number, precioBase: number) => {
    if (converterTarget === 'stock') {
      setStockActual(cantidadBase.toString());
    } else if (converterTarget === 'precio' && precioBase > 0) {
      setPrecioPorUnidad(precioBase.toFixed(4));
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Input
        label="Nombre"
        value={nombre}
        onChangeText={setNombre}
        placeholder="Ej: Pollo, Lechuga, Aceite..."
        error={errors.nombre}
      />

      <Text style={styles.sectionTitle}>Unidad de Medida</Text>
      <View style={styles.unidadesRow}>
        {UNIDADES.map((u) => (
          <TouchableOpacity
            key={u.value}
            style={[
              styles.unidadOption,
              unidadMedida === u.value && styles.unidadSelected,
            ]}
            onPress={() => setUnidadMedida(u.value)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.unidadText,
                unidadMedida === u.value && styles.unidadTextSelected,
              ]}
            >
              {u.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.inputWithHelper}>
        <View style={styles.inputWrapper}>
          <Input
            label="Precio por unidad (€)"
            value={precioPorUnidad}
            onChangeText={setPrecioPorUnidad}
            placeholder="0.00"
            keyboardType="decimal-pad"
            error={errors.precio}
          />
        </View>
        {unidadMedida !== 'UNIDAD' && (
          <ConverterButton onPress={() => openUnitConverter('precio')} />
        )}
      </View>
      {unidadMedida !== 'UNIDAD' && (
        <Text style={styles.helperHint}>
          Pulsa ⚡ para convertir desde {unidadMedida === 'GRAMO' ? 'kg/€' : 'L/€'}
        </Text>
      )}

      <View style={styles.row}>
        <View style={styles.halfInput}>
          <View style={styles.inputWithHelper}>
            <View style={styles.inputWrapper}>
              <Input
                label="Stock inicial"
                value={stockActual}
                onChangeText={setStockActual}
                placeholder="0"
                keyboardType="decimal-pad"
              />
            </View>
            {unidadMedida !== 'UNIDAD' && (
              <ConverterButton onPress={() => openUnitConverter('stock')} />
            )}
          </View>
          {unidadMedida !== 'UNIDAD' && (
            <Text style={styles.helperHintSmall}>
              ⚡ convertir desde {unidadMedida === 'GRAMO' ? 'kg' : 'L'}
            </Text>
          )}
        </View>
        <View style={styles.halfInput}>
          <Input
            label="Umbral alerta"
            value={umbralAlerta}
            onChangeText={setUmbralAlerta}
            placeholder="10"
            keyboardType="decimal-pad"
          />
        </View>
      </View>

      <Text style={styles.sectionTitle}>Categoría</Text>
      
      <TouchableOpacity
        style={styles.categoriaSelector}
        onPress={() => setShowCategoriaModal(true)}
        activeOpacity={0.7}
      >
        <Text style={categoriaSeleccionada ? styles.categoriaText : styles.categoriaPlaceholder}>
          {categoriaSeleccionada ? categoriaSeleccionada.nombre : 'Seleccionar o crear categoría'}
        </Text>
      </TouchableOpacity>

      {categoriaSeleccionada && (
        <TouchableOpacity
          style={styles.clearCategoria}
          onPress={() => setCategoriaSeleccionada(null)}
        >
          <Text style={styles.clearCategoriaText}>Quitar categoría</Text>
        </TouchableOpacity>
      )}

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Activo</Text>
        <Switch
          value={activo}
          onValueChange={setActivo}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={colors.surface}
        />
      </View>

      <Button
        title={editing ? 'Actualizar' : 'Crear Ingrediente'}
        onPress={handleSave}
        loading={loading}
        style={styles.saveButton}
      />

      <UnitConverter
        visible={showUnitConverter}
        onClose={() => setShowUnitConverter(false)}
        tipo={converterTipo}
        onConversionComplete={handleConversionComplete}
        titulo={converterTarget === 'stock' ? 'Convertir cantidad' : 'Convertir precio'}
        showPrecio={converterTarget !== 'stock'}
      />

      <Modal
        visible={showCategoriaModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCategoriaModal(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Seleccionar Categoría</Text>
            
            <ScrollView style={styles.categoriaList} keyboardShouldPersistTaps="handled">
              {categorias.length === 0 && (
                <Text style={styles.noCategorias}>No hay categorías. Crea una nueva:</Text>
              )}
              {categorias.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoriaOption,
                    categoriaSeleccionada?.id === cat.id && styles.categoriaOptionSelected,
                  ]}
                  onPress={() => {
                    setCategoriaSeleccionada(cat);
                    setShowCategoriaModal(false);
                  }}
                >
                  <Text
                    style={[
                      styles.categoriaOptionText,
                      categoriaSeleccionada?.id === cat.id && styles.categoriaOptionTextSelected,
                    ]}
                  >
                    {cat.nombre}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.newCategoriaSection}>
              <Text style={styles.newCategoriaLabel}>Nueva categoría:</Text>
              <View style={styles.newCategoriaRow}>
                <Input
                  value={nuevaCategoria}
                  onChangeText={setNuevaCategoria}
                  placeholder="Nombre de categoría"
                  style={styles.newCategoriaInput}
                />
                <Button
                  title="+"
                  onPress={handleCrearCategoria}
                  loading={loadingCategoria}
                  style={styles.addCategoriaButton}
                />
              </View>
            </View>

            <Button
              title="Cerrar"
              onPress={() => setShowCategoriaModal(false)}
              style={styles.closeModalButton}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  unidadesRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  unidadOption: {
    flex: 1,
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  unidadSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  unidadText: {
    ...typography.caption,
    color: colors.text,
  },
  unidadTextSelected: {
    color: colors.surface,
    fontWeight: '600',
  },
  categoriaSelector: {
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  categoriaText: {
    ...typography.body,
    color: colors.text,
  },
  categoriaPlaceholder: {
    ...typography.body,
    color: colors.textSecondary,
  },
  clearCategoria: {
    marginTop: spacing.sm,
  },
  clearCategoriaText: {
    ...typography.caption,
    color: colors.error,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  switchLabel: {
    ...typography.body,
    color: colors.text,
  },
  saveButton: {
    marginTop: spacing.xl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.lg,
    maxHeight: '70%',
  },
  modalTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  categoriaList: {
    maxHeight: 200,
    marginBottom: spacing.md,
  },
  noCategorias: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginVertical: spacing.md,
  },
  categoriaOption: {
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  categoriaOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoriaOptionText: {
    ...typography.body,
    color: colors.text,
  },
  categoriaOptionTextSelected: {
    color: colors.surface,
    fontWeight: '600',
  },
  newCategoriaSection: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  newCategoriaLabel: {
    ...typography.body,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  newCategoriaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  newCategoriaInput: {
    flex: 1,
  },
  addCategoriaButton: {
    width: 50,
  },
  closeModalButton: {
    marginTop: spacing.md,
  },
  inputWithHelper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  inputWrapper: {
    flex: 1,
  },
  helperHint: {
    ...typography.caption,
    color: colors.primary,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  helperHintSmall: {
    ...typography.caption,
    color: colors.primary,
    marginTop: spacing.xs,
    fontSize: 11,
  },
});
