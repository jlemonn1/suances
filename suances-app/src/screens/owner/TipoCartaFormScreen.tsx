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
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Input, Loading } from '../../components/common';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { cartaService } from '../../services/cartaService';
import { TipoCarta, TipoCartaRequest, TipoCartaResponse, PlatoInfo } from '../../types/carta';
import { PlatoResponse } from '../../types/plato';
import { useTipoCartaStore } from '../../store/tipoCartaStore';
import { usePlatoStore } from '../../store/platoStore';

const HORAS = Array.from({ length: 24 }, (_, i) =>
  `${i.toString().padStart(2, '0')}:00`
);
const MINUTOS = ['00', '15', '30', '45'];

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
  const [showHoraInicioPicker, setShowHoraInicioPicker] = useState(false);
  const [showHoraFinPicker, setShowHoraFinPicker] = useState(false);

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

  const TimePicker: React.FC<{
    value: string;
    onChange: (value: string) => void;
    visible: boolean;
    onClose: () => void;
    label: string;
  }> = ({ value, onChange, visible: pickerVisible, onClose, label }) => {
    const [hora, minuto] = value.split(':');
    const [h, setH] = useState(hora);
    const [m, setM] = useState(minuto);

    useEffect(() => {
      const [horaVal, minutoVal] = value.split(':');
      setH(horaVal);
      setM(minutoVal);
    }, [value, pickerVisible]);

    if (!pickerVisible) return null;

    return (
      <Modal visible={pickerVisible} transparent animationType="fade" onRequestClose={onClose}>
        <View style={styles.timePickerOverlay}>
          <View style={styles.timePickerContainer}>
            <View style={styles.timePickerHeader}>
              <Text style={styles.timePickerTitle}>{label}</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.timePickerContent}>
              <View style={styles.timeColumn}>
                <Text style={styles.timeColumnLabel}>Hora</Text>
                <ScrollView style={styles.timeScroll} showsVerticalScrollIndicator={false}>
                  {HORAS.map((hItem) => (
                    <TouchableOpacity
                      key={hItem}
                      style={[styles.timeOption, h === hItem.replace(':00', '') && styles.timeOptionSelected]}
                      onPress={() => setH(hItem.replace(':00', ''))}
                    >
                      <Text style={[styles.timeOptionText, h === hItem.replace(':00', '') && styles.timeOptionTextSelected]}>
                        {hItem}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              <View style={styles.timeColumn}>
                <Text style={styles.timeColumnLabel}>Min</Text>
                <ScrollView style={styles.timeScroll} showsVerticalScrollIndicator={false}>
                  {MINUTOS.map((mItem) => (
                    <TouchableOpacity
                      key={mItem}
                      style={[styles.timeOption, m === mItem && styles.timeOptionSelected]}
                      onPress={() => setM(mItem)}
                    >
                      <Text style={[styles.timeOptionText, m === mItem && styles.timeOptionTextSelected]}>
                        :{mItem}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
            <Button
              title="Confirmar"
              onPress={() => {
                onChange(`${h.padStart(2, '0')}:${m}`);
                onClose();
              }}
              style={styles.timePickerConfirm}
            />
          </View>
        </View>
      </Modal>
    );
  };

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
        <View style={styles.timeColumn}>
          <Text style={styles.timeLabel}>Inicio</Text>
          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => setShowHoraInicioPicker(true)}
          >
            <Ionicons name="time-outline" size={20} color={colors.accent} />
            <Text style={styles.timeButtonText}>{horaInicio}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.timeColumn}>
          <Text style={styles.timeLabel}>Fin</Text>
          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => setShowHoraFinPicker(true)}
          >
            <Ionicons name="time-outline" size={20} color={colors.accent} />
            <Text style={styles.timeButtonText}>{horaFin}</Text>
          </TouchableOpacity>
        </View>
      </View>
      {errors.hora && <Text style={styles.errorText}>{errors.hora}</Text>}

      <Text style={styles.sectionTitle}>Horarios predefinidos</Text>
      <View style={styles.presets}>
        {presetRanges.map((preset) => (
          <TouchableOpacity
            key={preset.label}
            style={[
              styles.presetChip,
              horaInicio === preset.inicio && horaFin === preset.fin && styles.presetChipActive
            ]}
            onPress={() => {
              setHoraInicio(preset.inicio);
              setHoraFin(preset.fin);
            }}
          >
            <Text style={[
              styles.presetText,
              horaInicio === preset.inicio && horaFin === preset.fin && styles.presetTextActive
            ]}>
              {preset.label}
            </Text>
            <Text style={[
              styles.presetTime,
              horaInicio === preset.inicio && horaFin === preset.fin && styles.presetTimeActive
            ]}>
              {preset.inicio} - {preset.fin}
            </Text>
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
                    <Ionicons name="close-circle" size={20} color={colors.error} />
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
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Agregar plato</Text>
              <TouchableOpacity onPress={() => setShowPlatosSelector(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
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

      <TimePicker
        value={horaInicio}
        onChange={setHoraInicio}
        visible={showHoraInicioPicker}
        onClose={() => setShowHoraInicioPicker(false)}
        label="Hora de inicio"
      />
      <TimePicker
        value={horaFin}
        onChange={setHoraFin}
        visible={showHoraFinPicker}
        onClose={() => setShowHoraFinPicker(false)}
        label="Hora de fin"
      />

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
  timeColumn: {
    flex: 1,
  },
  timeLabel: {
    ...typography.bodySmall,
    color: colors.text,
    marginBottom: spacing.xs,
    fontWeight: '500',
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  timeButtonText: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },
  presets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  presetChip: {
    width: '48%',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  presetChipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  presetText: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
  },
  presetTextActive: {
    color: colors.surface,
  },
  presetTime: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  presetTimeActive: {
    color: colors.surface,
    opacity: 0.9,
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.text,
    flex: 1,
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
  timePickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timePickerContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: '85%',
    maxHeight: '70%',
  },
  timePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  timePickerTitle: {
    ...typography.h3,
    color: colors.text,
  },
  timePickerContent: {
    flexDirection: 'row',
    gap: spacing.lg,
    height: 250,
  },
  timeColumn: {
    flex: 1,
  },
  timeColumnLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  timeScroll: {
    flex: 1,
  },
  timeOption: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    marginVertical: 2,
  },
  timeOptionSelected: {
    backgroundColor: colors.accent,
  },
  timeOptionText: {
    ...typography.body,
    color: colors.text,
  },
  timeOptionTextSelected: {
    color: colors.surface,
    fontWeight: '600',
  },
  timePickerConfirm: {
    marginTop: spacing.lg,
  },
});
