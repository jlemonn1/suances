import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Button, Input, Loading } from '../../components/common';
import { colors, spacing, typography } from '../../theme';
import { cartaService } from '../../services/cartaService';
import { TipoCarta, TipoCartaRequest, TipoCartaResponse, PlatoInfo } from '../../types/carta';
import { PlatoResponse } from '../../types/plato';
import { useTipoCartaStore } from '../../store/tipoCartaStore';
import { usePlatoStore } from '../../store/platoStore';

interface TipoCartaFormScreenProps {
  navigation: any;
  route: { params?: { tipoCarta?: TipoCartaResponse } };
}

export const TipoCartaFormScreen: React.FC<TipoCartaFormScreenProps> = ({
  navigation,
  route,
}) => {
  const { addTipoCarta, updateTipoCarta } = useTipoCartaStore();
  const { platos, fetchPlatos } = usePlatoStore();
  const editing = !!route.params?.tipoCarta;
  const initialData = route.params?.tipoCarta;

  const [nombre, setNombre] = useState(initialData?.nombre || '');
  const [horaInicio, setHoraInicio] = useState(initialData?.horaInicio || '08:00');
  const [horaFin, setHoraFin] = useState(initialData?.horaFin || '23:00');
  const [activo, setActivo] = useState(initialData?.activo ?? true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ nombre?: string; hora?: string }>({});
  
  const [platosAsociados, setPlatosAsociados] = useState<PlatoInfo[]>(initialData?.platos || []);
  const [loadingPlatos, setLoadingPlatos] = useState(false);
  const [showPlatosSelector, setShowPlatosSelector] = useState(false);

  useEffect(() => {
    if (editing && initialData?.id) {
      loadPlatosAsociados();
    }
    fetchPlatos(false);
  }, []);

  const loadPlatosAsociados = async () => {
    setLoadingPlatos(true);
    try {
      const tipo = await cartaService.getTipoCarta(initialData!.id);
      setPlatosAsociados(tipo.platos || []);
    } catch (error) {
      console.error('Error loading platos:', error);
    } finally {
      setLoadingPlatos(false);
    }
  };

  const handleAgregarPlato = async (plato: PlatoInfo) => {
    if (!initialData?.id) return;
    
    const PlatoYaAsociado = platosAsociados.some(p => p.id === plato.id);
    if (PlatoYaAsociado) {
      Alert.alert('Información', 'Este plato ya está asociado');
      return;
    }

    setLoading(true);
    try {
      const currentPlatoIds = platosAsociados.map(p => p.id);
      console.log('Asociando platos a tipoCarta:', initialData.id, 'platos:', [...currentPlatoIds, plato.id]);
      await cartaService.asociarPlatosATipoCarta(initialData.id, [...currentPlatoIds, plato.id]);
      setPlatosAsociados([...platosAsociados, plato]);
      setShowPlatosSelector(false);
    } catch (error: any) {
      console.error('Error associating plato:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'No se pudo asociar el plato';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarPlato = async (platoId: string) => {
    if (!initialData?.id) return;

    Alert.alert(
      'Desasociar plato',
      '¿Quieres desasociar este plato del tipo de carta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desasociar',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const currentPlatoIds = platosAsociados.filter(p => p.id !== platoId).map(p => p.id);
              console.log('Desasociando plato:', platoId, 'tipoCarta:', initialData.id, 'platos restantes:', currentPlatoIds);
              await cartaService.asociarPlatosATipoCarta(initialData.id, currentPlatoIds);
              setPlatosAsociados(platosAsociados.filter(p => p.id !== platoId));
            } catch (error: any) {
              console.error('Error desasociando plato:', error);
              const errorMessage = error?.response?.data?.message || error?.message || 'No se pudo desasociar el plato';
              Alert.alert('Error', errorMessage);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const platosNoAsociados = platos.filter(p => !platosAsociados.some(pa => pa.id === p.id));

  const validate = (): boolean => {
    const newErrors: { nombre?: string; hora?: string } = {};
    
    if (!nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    }
    
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(horaInicio) || !timeRegex.test(horaFin)) {
      newErrors.hora = 'Formato de hora inválido (HH:MM)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const data: TipoCartaRequest = {
        nombre: nombre.trim(),
        horaInicio,
        horaFin,
      };

      if (editing) {
        const updated = await cartaService.actualizarTipoCarta(initialData!.id, data);
        updateTipoCarta(updated);
      } else {
        const created = await cartaService.crearTipoCarta(data);
        addTipoCarta(created);
      }
      
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el tipo de carta');
    } finally {
      setLoading(false);
    }
  };

  const presetRanges = [
    { label: 'Desayuno', inicio: '08:00', fin: '12:00' },
    { label: 'Comida', inicio: '12:00', fin: '16:00' },
    { label: 'Merienda', inicio: '16:00', fin: '19:00' },
    { label: 'Cena', inicio: '19:00', fin: '23:00' },
    { label: 'Todo el día', inicio: '08:00', fin: '23:00' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Input
        label="Nombre"
        value={nombre}
        onChangeText={setNombre}
        placeholder="Ej: Desayuno, Comida, Cena..."
        error={errors.nombre}
      />

      <Text style={styles.sectionTitle}>Horario</Text>
      
      <View style={styles.timeRow}>
        <View style={styles.timeInput}>
          <Input
            label="Inicio"
            value={horaInicio}
            onChangeText={setHoraInicio}
            placeholder="HH:MM"
            keyboardType="numbers-and-punctuation"
          />
        </View>
        <View style={styles.timeInput}>
          <Input
            label="Fin"
            value={horaFin}
            onChangeText={setHoraFin}
            placeholder="HH:MM"
            keyboardType="numbers-and-punctuation"
          />
        </View>
      </View>
      {errors.hora && <Text style={styles.errorText}>{errors.hora}</Text>}

      <Text style={styles.sectionTitle}>Horarios predefinidos</Text>
      <View style={styles.presets}>
        {presetRanges.map((preset) => (
          <TouchableOpacity
            key={preset.label}
            style={styles.presetChip}
            onPress={() => {
              setHoraInicio(preset.inicio);
              setHoraFin(preset.fin);
            }}
          >
            <Text style={styles.presetText}>{preset.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Activo</Text>
        <Switch
          value={activo}
          onValueChange={setActivo}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={colors.surface}
        />
      </View>

      {editing && (
        <View style={styles.platosSection}>
          <View style={styles.platosSectionHeader}>
            <Text style={styles.sectionTitle}>Platos asociados</Text>
            <TouchableOpacity onPress={() => setShowPlatosSelector(true)}>
              <Text style={styles.addPlatoText}>+ Agregar</Text>
            </TouchableOpacity>
          </View>

          {loadingPlatos ? (
            <Loading message="Cargando platos..." />
          ) : platosAsociados.length === 0 ? (
            <Text style={styles.emptyText}>No hay platos asociados</Text>
          ) : (
            <View style={styles.platosList}>
              {platosAsociados.map((plato) => (
                <View key={plato.id} style={styles.platoItem}>
                  <View style={styles.platoInfo}>
                    <Text style={styles.platoNombre}>{plato.nombre}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleEliminarPlato(plato.id)}>
                    <Text style={styles.removeText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {showPlatosSelector && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Agregar plato</Text>
            {platosNoAsociados.length === 0 ? (
              <Text style={styles.emptyText}>No hay más platos disponibles</Text>
            ) : (
              <FlatList
                data={platosNoAsociados}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.platoOption}
                    onPress={() => handleAgregarPlato({ id: item.id, nombre: item.nombre })}
                  >
                    <Text style={styles.platoNombre}>{item.nombre}</Text>
                    <Text style={styles.platoPrecio}>{item.precioVenta?.toFixed(2)} €</Text>
                  </TouchableOpacity>
                )}
                style={styles.platosSelectorList}
              />
            )}
            <Button
              title="Cerrar"
              onPress={() => setShowPlatosSelector(false)}
              variant="secondary"
              style={styles.modalCloseButton}
            />
          </View>
        </View>
      )}

      <Button
        title={editing ? 'Actualizar' : 'Crear Tipo de Carta'}
        onPress={handleSave}
        loading={loading}
        style={styles.saveButton}
      />
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
  timeRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  timeInput: {
    flex: 1,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },
  presets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  presetChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primaryLight,
    borderRadius: 20,
  },
  presetText: {
    ...typography.body,
    color: colors.primary,
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
  platosSection: {
    marginTop: spacing.lg,
  },
  platosSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  addPlatoText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  platosList: {
    gap: spacing.sm,
  },
  platoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  platoInfo: {
    flex: 1,
  },
  platoNombre: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
  },
  platoPrecio: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    padding: spacing.md,
  },
  removeText: {
    color: colors.error,
    fontSize: 18,
    paddingLeft: spacing.md,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    width: '85%',
    maxHeight: '70%',
  },
  modalTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  modalCloseButton: {
    marginTop: spacing.md,
  },
  platosSelectorList: {
    maxHeight: 300,
  },
  platoOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
});
