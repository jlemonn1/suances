import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../../theme';

interface ModalSelectorImpresoraProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (impresora: string) => void;
  titulo?: string;
  subtitulo?: string;
}

const IMPRESORAS = [
  {
    id: 'Isabella',
    nombre: 'Barra Isabella',
    icono: 'wine' as const,
    color: colors.primary,
    descripcion: 'Imprimir en la barra de Isabella',
  },
  {
    id: 'Faro',
    nombre: 'Barra Faro',
    icono: 'restaurant' as const,
    color: colors.warning,
    descripcion: 'Imprimir en la barra del Faro',
  },
];

export const ModalSelectorImpresora: React.FC<ModalSelectorImpresoraProps> = ({
  visible,
  onClose,
  onSelect,
  titulo = 'Seleccionar Impresora',
  subtitulo = '¿Dónde desea imprimir el ticket?',
}) => {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="fullScreen"
      statusBarTranslucent
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={28} color={colors.surface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{titulo}</Text>
          <View style={styles.headerRight} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.subtituloContainer}>
            <Ionicons name="print-outline" size={48} color={colors.primary} />
            <Text style={styles.subtitulo}>{subtitulo}</Text>
          </View>

          <View style={styles.opcionesContainer}>
            {IMPRESORAS.map((impresora) => (
              <TouchableOpacity
                key={impresora.id}
                style={[styles.opcionCard, { borderColor: impresora.color }]}
                onPress={() => onSelect(impresora.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.iconoContainer, { backgroundColor: impresora.color + '20' }]}>
                  <Ionicons name={impresora.icono} size={32} color={impresora.color} />
                </View>
                <View style={styles.opcionInfo}>
                  <Text style={[styles.opcionNombre, { color: impresora.color }]}>
                    {impresora.nombre}
                  </Text>
                  <Text style={styles.opcionDescripcion}>
                    {impresora.descripcion}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.nota}>
            El ticket se imprimirá con toda la información de la cuenta
          </Text>
        </View>

        {/* Cancel Button */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.surface,
    fontWeight: '600',
  },
  headerRight: {
    width: 44,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.xl,
  },
  subtituloContainer: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xl,
  },
  subtitulo: {
    ...typography.h2,
    color: colors.text,
    textAlign: 'center',
  },
  opcionesContainer: {
    gap: spacing.md,
  },
  opcionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  iconoContainer: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  opcionInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  opcionNombre: {
    ...typography.h3,
    fontWeight: '700',
  },
  opcionDescripcion: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  nota: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  footer: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cancelButton: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});
