import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Input } from '../common';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { FranjaHoraria, FranjaRequest, FranjaTipo } from '../../types/reservas';

interface FranjaEditorProps {
  visible: boolean;
  franja?: FranjaHoraria | null;
  onClose: () => void;
  onSave: (data: FranjaRequest) => Promise<void>;
  onDelete?: (franjaId: string) => Promise<void>;
}

const TIPOS: { value: FranjaTipo; label: string; color: string }[] = [
  { value: 'COMIDA', label: 'Comida', color: colors.warning },
  { value: 'CENA', label: 'Cena', color: colors.primary },
  { value: 'ESPECIAL', label: 'Especial', color: colors.accent },
];

const HORAS = Array.from({ length: 24 }, (_, i) => 
  `${i.toString().padStart(2, '0')}:00`
);
const MINUTOS = ['00', '15', '30', '45'];

export const FranjaEditor: React.FC<FranjaEditorProps> = ({
  visible,
  franja,
  onClose,
  onSave,
  onDelete,
}) => {
  const [form, setForm] = useState<FranjaRequest>({
    nombre: '',
    tipo: 'COMIDA',
    horaInicio: '13:00',
    horaFin: '14:00',
    activa: true,
  });
  const [saving, setSaving] = useState(false);
  const [showHoraInicioPicker, setShowHoraInicioPicker] = useState(false);
  const [showHoraFinPicker, setShowHoraFinPicker] = useState(false);

  useEffect(() => {
    if (franja) {
      setForm({
        nombre: franja.nombre,
        tipo:franja.tipo,
        horaInicio:franja.horaInicio,
        horaFin:franja.horaFin,
        activa:franja.activa,
      });
    } else {
      setForm({
        nombre: '',
        tipo: 'COMIDA',
        horaInicio: '13:00',
        horaFin: '14:00',
        activa: true,
      });
    }
  }, [franja, visible]);

  const handleSave = async () => {
    if (!form.nombre.trim()) {
      Alert.alert('Error', 'El nombre es obligatorio');
      return;
    }

    const horaIni = form.horaInicio.split(':');
    const horaFin = form.horaFin.split(':');
    const iniMin = parseInt(horaIni[0]) * 60 + parseInt(horaIni[1] || '0');
    const finMin = parseInt(horaFin[0]) * 60 + parseInt(horaFin[1] || '0');

    if (iniMin >= finMin) {
      Alert.alert('Error', 'La hora de fin debe ser posterior a la hora de inicio');
      return;
    }

    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar la franja');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!franja || !onDelete) return;
    Alert.alert(
      'Eliminar franja',
      `¿Estás seguro de eliminar "${franja.nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await onDelete(franja.id);
              onClose();
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar la franja');
            }
          },
        },
      ]
    );
  };

  const TimePicker: React.FC<{
    value: string;
    onChange: (value: string) => void;
    visible: boolean;
    onClose: () => void;
  }> = ({ value, onChange, visible: pickerVisible, onClose }) => {
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
      <View style={styles.timePickerOverlay}>
        <View style={styles.timePickerContainer}>
          <View style={styles.timePickerHeader}>
            <Text style={styles.timePickerTitle}>Seleccionar hora</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.timePickerDone}>Hecho</Text>
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
              <Text style={styles.timeColumnLabel}>Minuto</Text>
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
    );
  };

  return (
    <Modal 
      visible={visible} 
      animationType="slide" 
      transparent 
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <View style={styles.dragHandle} />
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.modalTitle}>
            {franja ? 'Editar franja' : 'Nueva franja'}
          </Text>
          
          <ScrollView 
            showsVerticalScrollIndicator={false} 
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
            alwaysBounceVertical={false}
          >
            <Input
              label="Nombre"
              value={form.nombre}
              onChangeText={(value) => setForm((prev) => ({ ...prev, nombre: value }))}
              placeholder="ej: Comida weekday"
            />

            <Text style={styles.label}>Tipo</Text>
            <View style={styles.tipoContainer}>
              {TIPOS.map((tipo) => (
                <TouchableOpacity
                  key={tipo.value}
                  style={[
                    styles.tipoButton,
                    form.tipo === tipo.value && { backgroundColor: tipo.color, borderColor: tipo.color },
                  ]}
                  onPress={() => setForm((prev) => ({ ...prev, tipo: tipo.value }))}
                >
                  <Text
                    style={[
                      styles.tipoButtonText,
                      form.tipo === tipo.value && styles.tipoButtonTextSelected,
                    ]}
                  >
                    {tipo.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.horaRow}>
              <View style={styles.horaColumn}>
                <Text style={styles.label}>Hora inicio</Text>
                <TouchableOpacity
                  style={styles.horaButton}
                  onPress={() => setShowHoraInicioPicker(true)}
                >
                  <Text style={styles.horaButtonText}>{form.horaInicio}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.horaColumn}>
                <Text style={styles.label}>Hora fin</Text>
                <TouchableOpacity
                  style={styles.horaButton}
                  onPress={() => setShowHoraFinPicker(true)}
                >
                  <Text style={styles.horaButtonText}>{form.horaFin}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Activa</Text>
              <TouchableOpacity
                style={[styles.switch, form.activa && styles.switchActive]}
                onPress={() => setForm((prev) => ({ ...prev, activa: !prev.activa }))}
              >
                <View style={[styles.switchThumb, form.activa && styles.switchThumbActive]} />
              </TouchableOpacity>
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Activa</Text>
              <TouchableOpacity
                style={[styles.switch, form.activa && styles.switchActive]}
                onPress={() => setForm((prev) => ({ ...prev, activa: !prev.activa }))}
              >
                <View style={[styles.switchThumb, form.activa && styles.switchThumbActive]} />
              </TouchableOpacity>
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <View style={styles.buttonRow}>
              {franja && onDelete ? (
                <TouchableOpacity style={styles.iconButton} onPress={handleDelete}>
                  <Ionicons name="trash-outline" size={22} color={colors.error} />
                </TouchableOpacity>
              ) : (
                <View style={styles.iconButton} />
              )}
              <TouchableOpacity style={styles.iconButton} onPress={onClose}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
              <Button
                title={saving ? '...' : 'Guardar'}
                onPress={handleSave}
                disabled={saving}
                style={styles.saveButton}
              />
            </View>
          </View>
        </Pressable>

        <TimePicker
          value={form.horaInicio}
          onChange={(value) => setForm((prev) => ({ ...prev, horaInicio: value }))}
          visible={showHoraInicioPicker}
          onClose={() => setShowHoraInicioPicker(false)}
        />
        <TimePicker
          value={form.horaFin}
          onChange={(value) => setForm((prev) => ({ ...prev, horaFin: value }))}
          visible={showHoraFinPicker}
          onClose={() => setShowHoraFinPicker(false)}
        />
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    maxHeight: '85%',
    flexDirection: 'column',
  },
  header: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
  },
  closeButton: {
    position: 'absolute',
    right: 0,
    top: -spacing.md,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  scrollContent: {
    flexGrow: 1,
  },
  modalTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  label: {
    ...typography.bodySmall,
    color: colors.text,
    marginBottom: spacing.xs,
    fontWeight: '500',
  },
  tipoContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  tipoButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  tipoButtonText: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '500',
  },
  tipoButtonTextSelected: {
    color: colors.surface,
  },
  horaRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  horaColumn: {
    flex: 1,
  },
  horaButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  horaButtonText: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingVertical: spacing.sm,
  },
  switchLabel: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
  },
  switch: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.border,
    padding: 2,
    justifyContent: 'center',
  },
  switchActive: {
    backgroundColor: colors.success,
  },
  switchThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.surface,
  },
  switchThumbActive: {
    alignSelf: 'flex-end',
  },
  modalActions: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    minWidth: 100,
  },
  flexButton: {
    borderColor: colors.error,
  },
  timePickerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  timePickerContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    width: '80%',
    maxHeight: '60%',
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
  timePickerDone: {
    ...typography.body,
    color: colors.accent,
    fontWeight: '600',
  },
  timePickerContent: {
    flexDirection: 'row',
    gap: spacing.md,
    height: 200,
  },
  timeColumn: {
    flex: 1,
  },
  timeColumnLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  timeScroll: {
    flex: 1,
  },
  timeOption: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
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
    marginTop: spacing.md,
  },
});
