import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Input } from '../../../components/common';
import { LayoutEditor } from '../../../components/reservas';
import { useReservasStore } from '../../../store/reservasStore';
import { colors, spacing, typography, borderRadius } from '../../../theme';
import { Sala, SalaLayout, SalaRequest } from '../../types/reservas';

interface Props {
  route: { params?: { salaId?: string } };
  navigation: any;
}

export const SalaEditorScreen: React.FC<Props> = ({ route, navigation }) => {
  const { salaId } = route.params || {};
  const { salas, saveSala, loading } = useReservasStore();
  const sala = salaId ? salas.find((s) => s.id === salaId) : undefined;

  const [nombre, setNombre] = useState(sala?.nombre ?? '');
  const [capacidadMaxima, setCapacidadMaxima] = useState(sala?.capacidadMaxima?.toString() ?? '');
  const [activa, setActiva] = useState(sala?.activa ?? true);
  const [layout, setLayout] = useState<SalaLayout | null>(null);
  const [showLayoutEditor, setShowLayoutEditor] = useState(false);

  useEffect(() => {
    if (sala?.layoutJson) {
      try {
        const parsed = JSON.parse(sala.layoutJson);
        setLayout(parsed);
      } catch (e) {
        setLayout(null);
      }
    }
  }, [sala]);

  const handleLayoutChange = (newLayout: SalaLayout) => {
    setLayout(newLayout);
    setShowLayoutEditor(false);
  };

  const handleSubmit = async () => {
    if (!nombre.trim()) {
      Alert.alert('Campo obligatorio', 'El nombre de la sala es obligatorio');
      return;
    }

    const payload: SalaRequest = {
      nombre: nombre.trim(),
      capacidadMaxima: capacidadMaxima ? parseInt(capacidadMaxima, 10) : null,
      activa,
      layoutJson: layout ? JSON.stringify(layout) : null,
    };

    try {
      await saveSala(payload, sala?.id);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar la sala');
    }
  };

  if (showLayoutEditor) {
    return (
      <View style={styles.container}>
        <View style={styles.layoutHeader}>
          <Pressable onPress={() => setShowLayoutEditor(false)} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
            <Text style={styles.backText}>Volver</Text>
          </Pressable>
          <Text style={styles.layoutTitle}>Configurar espacio</Text>
        </View>
        <ScrollView style={styles.scrollContent}>
          <LayoutEditor layout={layout} onLayoutChange={handleLayoutChange} editable />
        </ScrollView>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <View style={styles.iconContainer}>
            <Ionicons
              name={sala ? 'home' : 'add'}
              size={36}
              color={colors.accent}
            />
          </View>
          <Text style={styles.heroTitle}>
            {sala ? 'Editar sala' : 'Crear nueva sala'}
          </Text>
          <Text style={styles.heroSubtitle}>
            {sala
              ? 'Modifica los datos de tu sala'
              : 'Define un nuevo espacio para tu restaurante'}
          </Text>
        </View>

        <View style={styles.formCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIcon}>
              <Ionicons name="create" size={18} color={colors.primary} />
            </View>
            <Text style={styles.cardTitle}>Información básica</Text>
          </View>

          <Input
            label="Nombre de la sala"
            value={nombre}
            onChangeText={setNombre}
            placeholder="Ej: Terraza principal, Comedor..."
          />

          <Input
            label="Capacidad máxima"
            value={capacidadMaxima}
            onChangeText={setCapacidadMaxima}
            placeholder="Ej: 50"
            keyboardType="numeric"
            hint="Número máximo de comensales"
          />

          <View style={styles.switchContainer}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>Sala activa</Text>
              <Text style={styles.switchHint}>
                Visible en reservas online
              </Text>
            </View>
            <Switch
              value={activa}
              onValueChange={setActiva}
              trackColor={{ false: colors.border, true: colors.accent + '80' }}
              thumbColor={activa ? colors.accent : colors.textSecondary}
            />
          </View>
        </View>

        <View style={styles.formCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIcon}>
              <Ionicons name="grid" size={18} color={colors.primary} />
            </View>
            <Text style={styles.cardTitle}>Configuración del espacio</Text>
          </View>

          <Text style={styles.cardDescription}>
            Define el tamaño del área y los puntos que delimitan la sala.
            Esto permitirá posicionar mesas en un plano visual.
          </Text>

          {layout ? (
            <View style={styles.layoutPreview}>
              <View style={styles.layoutInfo}>
                <View style={styles.layoutRow}>
                  <View style={styles.layoutBadge}>
                    <Text style={styles.layoutBadgeText}>
                      {layout.mesasAncho || Math.round(layout.ancho / 80)} ×{' '}
                      {layout.mesasAlto || Math.round(layout.alto / 80)} mesas
                    </Text>
                  </View>
                </View>
                <Text style={styles.layoutVertices}>
                  {layout.vertices.length} puntos de borde · {layout.ancho}×{layout.alto}u
                </Text>
              </View>
              <Pressable
                style={styles.editButton}
                onPress={() => setShowLayoutEditor(true)}
              >
                <Text style={styles.editButtonText}>Editar</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              style={styles.setupButton}
              onPress={() => setShowLayoutEditor(true)}
            >
              <View style={styles.setupIconContainer}>
                <Ionicons name="map" size={24} color={colors.primary} />
              </View>
              <View style={styles.setupContent}>
                <Text style={styles.setupTitle}>Configurar espacio</Text>
                <Text style={styles.setupHint}>
                  Define el área de la sala en el plano
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.primary} />
            </Pressable>
          )}
        </View>

        {sala && (
          <View style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <Text style={styles.infoIconText}>ℹ️</Text>
            </View>
            <Text style={styles.infoText}>
              Los cambios en la configuración de la sala se guardarán
              automáticamente. Las mesas existentes se mantendrán.
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Cancelar"
          variant="outline"
          onPress={() => navigation.goBack()}
          style={styles.footerButton}
        />
        <Button
          title={sala ? 'Guardar cambios' : 'Crear sala'}
          onPress={handleSubmit}
          loading={loading.salas}
          style={styles.footerButton}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accent + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  heroIcon: {
    fontSize: 36,
  },
  heroTitle: {
    ...typography.h1,
    color: colors.text,
    textAlign: 'center',
  },
  heroSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  cardIconText: {
    fontSize: 18,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.text,
  },
  cardDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  switchInfo: {
    flex: 1,
  },
  switchLabel: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  switchHint: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  layoutPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.primary + '08',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.primary + '20',
  },
  layoutInfo: {
    flex: 1,
  },
  layoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  layoutBadge: {
    backgroundColor: colors.primary + '15',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  layoutBadgeText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  layoutVertices: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  editButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.accent,
    borderRadius: borderRadius.md,
  },
  editButtonText: {
    ...typography.bodySmall,
    color: colors.surface,
    fontWeight: '600',
  },
  setupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '05',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.primary + '30',
  },
  setupIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  setupIcon: {
    fontSize: 24,
  },
  setupContent: {
    flex: 1,
  },
  setupTitle: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  setupHint: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  setupArrow: {
    fontSize: 20,
    color: colors.primary,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: colors.warningLight,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'flex-start',
  },
  infoIcon: {
    marginRight: spacing.sm,
  },
  infoIconText: {
    fontSize: 16,
  },
  infoText: {
    ...typography.bodySmall,
    color: colors.text,
    flex: 1,
  },
  layoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: spacing.md,
  },
  backIcon: {
    fontSize: 20,
    color: colors.accent,
    marginRight: spacing.xs,
  },
  backText: {
    ...typography.body,
    color: colors.accent,
    fontWeight: '600',
  },
  layoutTitle: {
    ...typography.h3,
    color: colors.text,
  },
  footer: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  footerButton: {
    flex: 1,
  },
});
