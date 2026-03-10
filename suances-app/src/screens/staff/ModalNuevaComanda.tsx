import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { useSalaStore } from '../../store/salaStore';
import { useAuthStore } from '../../store/authStore';
import type { MesaOperativa } from '../../types/sala';

interface ModalNuevaComandaProps {
  visible: boolean;
  mesa: MesaOperativa | null;
  onClose: () => void;
  onCreated: () => void;
}

const COMENSALES_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export const ModalNuevaComanda: React.FC<ModalNuevaComandaProps> = ({
  visible,
  mesa,
  onClose,
  onCreated,
}) => {
  const [numeroComensales, setNumeroComensales] = useState(2);
  const [notas, setNotas] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { crearComanda, loadingAccion } = useSalaStore();
  const { user } = useAuthStore();

  const handleCrear = async () => {
    if (!mesa) return;

    setError(null);
    try {
      if (!user?.id) {
        setError('Error: No se pudo identificar al camarero');
        return;
      }
      
      await crearComanda({
        mesaId: mesa.id,
        camareroId: user.id,
        camareroNombre: user.nombre,
        numeroComensales,
        notas: notas.trim() || undefined,
      });
      setNotas('');
      setNumeroComensales(2);
      onCreated();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear comanda');
    }
  };

  const handleClose = () => {
    setNotas('');
    setNumeroComensales(2);
    setError(null);
    onClose();
  };

  if (!mesa) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={styles.modalContainer}
            >
              <View style={styles.modal}>
                <View style={styles.handle} />

                <View style={styles.header}>
                  <Text style={styles.title}>Nueva Comanda</Text>
                  <TouchableOpacity onPress={handleClose}>
                    <Ionicons name="close" size={24} color={colors.text} />
                  </TouchableOpacity>
                </View>

                <View style={styles.mesaInfo}>
                  <View style={styles.mesaBadge}>
                    <Ionicons name="tablet-landscape" size={20} color={colors.primary} />
                    <Text style={styles.mesaText}>Mesa {mesa.numero}</Text>
                  </View>
                  <Text style={styles.salaText}>{mesa.nombreSala}</Text>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                  <Text style={styles.label}>Número de comensales</Text>
                  <View style={styles.comensalesGrid}>
                    {COMENSALES_OPTIONS.map((num) => (
                      <TouchableOpacity
                        key={num}
                        style={[
                          styles.comensalOption,
                          numeroComensales === num && styles.comensalOptionActive,
                        ]}
                        onPress={() => setNumeroComensales(num)}
                      >
                        <Text
                          style={[
                            styles.comensalText,
                            numeroComensales === num && styles.comensalTextActive,
                          ]}
                        >
                          {num}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Input
                    label="Notas (opcional)"
                    placeholder="Ej: Mesa junto a ventana, cliente habitual..."
                    value={notas}
                    onChangeText={setNotas}
                    multiline
                    numberOfLines={3}
                    style={styles.notasInput}
                  />

                  {error && (
                    <View style={styles.errorContainer}>
                      <Ionicons name="alert-circle" size={16} color={colors.error} />
                      <Text style={styles.errorText}>{error}</Text>
                    </View>
                  )}
                </ScrollView>

                <View style={styles.footer}>
                  <Button
                    title="Cancelar"
                    variant="outline"
                    onPress={handleClose}
                    style={styles.cancelButton}
                  />
                  <Button
                    title="Crear Comanda"
                    onPress={handleCrear}
                    loading={loadingAccion}
                    style={styles.createButton}
                  />
                </View>
              </View>
            </KeyboardAvoidingView>
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
  modalContainer: {
    maxHeight: '90%',
  },
  modal: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    paddingTop: spacing.sm,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  mesaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  mesaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  mesaText: {
    ...typography.h3,
    color: colors.primary,
  },
  salaText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  label: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '500',
    marginBottom: spacing.sm,
  },
  comensalesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  comunalOption: {},
  comensalOption: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  comensalOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  comensalText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  comensalTextActive: {
    color: colors.surface,
  },
  notasInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.errorLight,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
  },
  errorText: {
    ...typography.bodySmall,
    color: colors.error,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  cancelButton: {
    flex: 1,
  },
  createButton: {
    flex: 2,
  },
});
