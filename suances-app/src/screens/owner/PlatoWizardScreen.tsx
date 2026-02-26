import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Button, Input, Loading } from '../../components/common';
import { colors, spacing, typography } from '../../theme';
import { cartaService } from '../../services/cartaService';
import { PlatoRequest, PlatoResponse } from '../../types/plato';
import { TipoCartaResponse } from '../../types/carta';
import { CategoriaResponse, CategoriaTipo } from '../../types/ingrediente';
import { usePlatoStore } from '../../store/platoStore';
import { useCategoriaStore } from '../../store/categoriaStore';

interface PlatoWizardScreenProps {
  navigation: any;
  route: { params?: { plato?: PlatoResponse } };
}

type Step = 1 | 2 | 3;

export const PlatoWizardScreen: React.FC<PlatoWizardScreenProps> = ({
  navigation,
  route,
}) => {
  const { addPlato, updatePlato } = usePlatoStore();
  const editing = !!route.params?.plato;
  const initialData = route.params?.plato;

  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [tiposCarta, setTiposCarta] = useState<TipoCartaResponse[]>([]);
  const [loadingTipos, setLoadingTipos] = useState(true);

  const [nombre, setNombre] = useState(initialData?.nombre || '');
  const [descripcion, setDescripcion] = useState(initialData?.descripcion || '');
  const [precioVenta, setPrecioVenta] = useState(initialData?.precioVenta?.toString() || '');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<CategoriaResponse | null>(
    initialData?.categoria || null
  );
  const [selectedTipos, setSelectedTipos] = useState<string[]>(
    initialData?.tiposCarta?.map((t: any) => t.id) || []
  );
  const [imagenes, setImagenes] = useState<string[]>(
    initialData?.imagenes?.map((i: any) => i.url) || []
  );
  const [newImagen, setNewImagen] = useState('');

  const [errors, setErrors] = useState<{ nombre?: string; precio?: string }>({});

  const { categorias, fetchCategorias } = useCategoriaStore();
  const [showCategoriaModal, setShowCategoriaModal] = useState(false);
  const [nuevaCategoria, setNuevaCategoria] = useState('');
  const [loadingCategoria, setLoadingCategoria] = useState(false);

  useEffect(() => {
    loadTiposCarta();
    fetchCategorias(true, 'PLATO');
  }, []);

  const loadTiposCarta = async () => {
    try {
      const data = await cartaService.getTiposCarta();
      setTiposCarta(data);
    } catch (error) {
      console.error('Error loading tipos carta:', error);
    } finally {
      setLoadingTipos(false);
    }
  };

  const validateStep1 = (): boolean => {
    const newErrors: { nombre?: string; precio?: string } = {};
    
    if (!nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    }
    
    const precio = parseFloat(precioVenta);
    if (isNaN(precio) || precio <= 0) {
      newErrors.precio = 'Precio válido obligatorio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1) {
      if (validateStep1()) {
        setStep(2);
      }
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((step - 1) as Step);
    } else {
      navigation.goBack();
    }
  };

  const toggleTipoCarta = (tipoId: string) => {
    setSelectedTipos((prev) =>
      prev.includes(tipoId)
        ? prev.filter((id) => id !== tipoId)
        : [...prev, tipoId]
    );
  };

  const addImagen = () => {
    if (newImagen.trim()) {
      setImagenes([...imagenes, newImagen.trim()]);
      setNewImagen('');
    }
  };

  const removeImagen = (index: number) => {
    setImagenes(imagenes.filter((_, i) => i !== index));
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
        tipo: 'PLATO' as CategoriaTipo 
      });
      await fetchCategorias(true, 'PLATO');
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

  const handleSave = async () => {
    setLoading(true);
    try {
      const data: PlatoRequest = {
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || undefined,
        precioVenta: parseFloat(precioVenta),
        categoriaId: categoriaSeleccionada?.id,
      };

      let plato: PlatoResponse;
      if (editing) {
        plato = await cartaService.actualizarPlato(initialData.id, data);
      } else {
        plato = await cartaService.crearPlato(data);
      }

      for (const url of imagenes) {
        await cartaService.agregarImagen(plato.id, url);
      }

      if (selectedTipos.length > 0) {
        for (const tipoId of selectedTipos) {
          const tipo = await cartaService.getTipoCarta(tipoId);
          const currentPlatoIds = tipo.platos?.map((p: any) => p.id) || [];
          if (!currentPlatoIds.includes(plato.id)) {
            console.log('Asociando plato a tipoCarta:', tipoId, 'platos:', [...currentPlatoIds, plato.id]);
            await cartaService.asociarPlatosATipoCarta(tipoId, [...currentPlatoIds, plato.id]);
          }
        }
      }

      if (editing) {
        updatePlato(plato);
      } else {
        addPlato(plato);
      }

      navigation.goBack();
    } catch (error: any) {
      console.error('Error guardando plato:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'No se pudo guardar el plato';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3].map((s) => (
        <View key={s} style={styles.stepItem}>
          <View
            style={[
              styles.stepCircle,
              step >= s && styles.stepCircleActive,
            ]}
          >
            <Text style={[styles.stepText, step >= s && styles.stepTextActive]}>
              {s}
            </Text>
          </View>
          <Text style={[styles.stepLabel, step >= s && styles.stepLabelActive]}>
            {s === 1 ? 'Datos' : s === 2 ? 'Carta' : 'Imágenes'}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Input
        label="Nombre del plato"
        value={nombre}
        onChangeText={setNombre}
        placeholder="Ej: Paella Mixta"
        error={errors.nombre}
      />

      <Input
        label="Descripción"
        value={descripcion}
        onChangeText={setDescripcion}
        placeholder="Descripción del plato (opcional)"
        multiline
        numberOfLines={3}
      />

      <Input
        label="Precio de venta (€)"
        value={precioVenta}
        onChangeText={setPrecioVenta}
        placeholder="0.00"
        keyboardType="decimal-pad"
        error={errors.precio}
      />

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
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.sectionTitle}>Asociar a tipos de carta</Text>
      
      {loadingTipos ? (
        <Loading message="Cargando tipos..." />
      ) : tiposCarta.length === 0 ? (
        <Text style={styles.emptyText}>
          No hay tipos de carta. Crea uno primero.
        </Text>
      ) : (
        <View style={styles.tiposList}>
          {tiposCarta.map((tipo) => (
            <TouchableOpacity
              key={tipo.id}
              style={[
                styles.tipoOption,
                selectedTipos.includes(tipo.id) && styles.tipoSelected,
              ]}
              onPress={() => toggleTipoCarta(tipo.id)}
            >
              <Text
                style={[
                  styles.tipoText,
                  selectedTipos.includes(tipo.id) && styles.tipoTextSelected,
                ]}
              >
                {tipo.nombre}
              </Text>
              <Text style={styles.tipoHorario}>
                {tipo.horaInicio} - {tipo.horaFin}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.sectionTitle}>Imágenes del plato</Text>
      
      <View style={styles.addImagenRow}>
        <View style={styles.imagenInput}>
          <Input
            label="URL de imagen"
            value={newImagen}
            onChangeText={setNewImagen}
            placeholder="https://..."
          />
        </View>
        <Button
          title="+"
          onPress={addImagen}
          style={styles.addButton}
        />
      </View>

      {imagenes.length === 0 ? (
        <Text style={styles.emptyText}>
          Añade al menos una imagen para el plato
        </Text>
      ) : (
        <View style={styles.imagenesList}>
          {imagenes.map((url, index) => (
            <View key={index} style={styles.imagenItem}>
              <Text style={styles.imagenUrl} numberOfLines={1}>
                {url}
              </Text>
              <TouchableOpacity onPress={() => removeImagen(index)}>
                <Text style={styles.removeText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {renderStepIndicator()}
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={step === 1 ? 'Cancelar' : 'Atrás'}
          onPress={handleBack}
          variant="secondary"
          style={styles.footerButton}
        />
        
        {step < 3 ? (
          <Button
            title="Siguiente"
            onPress={handleNext}
            style={styles.footerButton}
          />
        ) : (
          <Button
            title={editing ? 'Actualizar' : 'Crear Plato'}
            onPress={handleSave}
            loading={loading}
            style={styles.footerButton}
          />
        )}
      </View>

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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  stepItem: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  stepCircleActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  stepText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  stepTextActive: {
    color: colors.surface,
    fontWeight: '600',
  },
  stepLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  stepLabelActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  stepContent: {
    flex: 1,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  tiposList: {
    gap: spacing.sm,
  },
  tipoOption: {
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tipoSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  tipoText: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  tipoTextSelected: {
    color: colors.primary,
  },
  tipoHorario: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    padding: spacing.lg,
  },
  addImagenRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  imagenInput: {
    flex: 1,
  },
  addButton: {
    width: 48,
    height: 48,
    marginBottom: spacing.xs,
  },
  imagenesList: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  imagenItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  imagenUrl: {
    ...typography.caption,
    color: colors.text,
    flex: 1,
  },
  removeText: {
    color: colors.error,
    fontSize: 18,
    paddingLeft: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  footerButton: {
    flex: 1,
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
});
