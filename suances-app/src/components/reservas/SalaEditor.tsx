import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Alert, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Input } from '../common';
import { LayoutEditor } from './LayoutEditor';
import { useReservasStore } from '../../store/reservasStore';
import { colors, spacing, typography } from '../../theme';
import { Sala, SalaLayout, SalaRequest } from '../../types/reservas';

interface Props {
  sala?: Sala;
  onClose: () => void;
  onSaved?: (sala: Sala) => void;
}

export const SalaEditor: React.FC<Props> = ({ sala, onClose, onSaved }) => {
  const { saveSala, loading } = useReservasStore();
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
    // Volver automáticamente al formulario principal
    setShowLayoutEditor(false);
  };

  const handleSubmit = async () => {
    if (!nombre.trim()) {
      Alert.alert('El nombre es obligatorio');
      return;
    }

    const payload: SalaRequest = {
      nombre: nombre.trim(),
      capacidadMaxima: capacidadMaxima ? parseInt(capacidadMaxima, 10) : null,
      activa,
      layoutJson: layout ? JSON.stringify(layout) : null,
    };

    try {
      const saved = await saveSala(payload, sala?.id);
      onSaved?.(saved);
      onClose();
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar la sala');
    }
  };

  if (showLayoutEditor) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => setShowLayoutEditor(false)}>
            <Text style={styles.backLink}>← Volver</Text>
          </Pressable>
          <Text style={styles.title}>Editar layout</Text>
        </View>
        <ScrollView style={styles.scrollContent}>
          <LayoutEditor layout={layout} onLayoutChange={handleLayoutChange} editable />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollContentContainer}>
        <Text style={styles.title}>{sala ? 'Editar sala' : 'Nueva sala'}</Text>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Información básica</Text>
          
          <Input
            label="Nombre de la sala"
            value={nombre}
            onChangeText={setNombre}
            placeholder="Ej: Terraza principal"
          />

          <Input
            label="Capacidad máxima (opcional)"
            value={capacidadMaxima}
            onChangeText={setCapacidadMaxima}
            placeholder="Ej: 50"
            keyboardType="numeric"
          />

          <View style={styles.switchRow}>
            <View>
              <Text style={styles.switchLabel}>Sala activa</Text>
              <Text style={styles.switchHint}>Las salas inactivas no aparecen en reservas online</Text>
            </View>
            <Switch
              value={activa}
              onValueChange={setActiva}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={activa ? colors.primary : colors.textSecondary}
            />
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Configuración del espacio</Text>
          <Text style={styles.sectionDescription}>
            Define el tamaño del área y los puntos que delimitan la sala. 
            Esto permitirá posicionar mesas en un plano visual más adelante.
          </Text>

          {layout ? (
            <View style={styles.layoutPreview}>
              <View style={styles.layoutInfo}>
                <Text style={styles.layoutDimension}>
                  {layout.mesasAncho || Math.round(layout.ancho / 80)} × {layout.mesasAlto || Math.round(layout.alto / 80)} mesas
                </Text>
                <Text style={styles.layoutVertices}>
                  {layout.vertices.length} puntos de borde · {layout.ancho}×{layout.alto}u
                </Text>
              </View>
              <Pressable style={styles.editLayoutButton} onPress={() => setShowLayoutEditor(true)}>
                <Text style={styles.editLayoutText}>Editar</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable style={styles.setupLayoutButton} onPress={() => setShowLayoutEditor(true)}>
              <Ionicons name="grid" size={20} color={colors.primary} />
              <Text style={styles.setupLayoutText}>Configurar espacio</Text>
            </Pressable>
          )}
        </View>

        {sala && (
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Estadísticas</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>-</Text>
                <Text style={styles.statLabel}>Mesas</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>-</Text>
                <Text style={styles.statLabel}>Capacidad total</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Cancelar"
          variant="outline"
          onPress={onClose}
          style={styles.footerButton}
        />
        <Button
          title={sala ? 'Guardar cambios' : 'Crear sala'}
          onPress={handleSubmit}
          loading={loading.salas}
          style={styles.footerButton}
        />
      </View>
    </View>
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
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backLink: {
    ...typography.body,
    color: colors.primary,
    marginRight: spacing.md,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  formSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  sectionDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginTop: spacing.sm,
  },
  switchLabel: {
    ...typography.body,
    color: colors.text,
  },
  switchHint: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  layoutPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  layoutInfo: {
    flex: 1,
  },
  layoutDimension: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  layoutVertices: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  editLayoutButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primaryLight,
    borderRadius: spacing.sm,
  },
  editLayoutText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  setupLayoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: spacing.md,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border,
    gap: spacing.sm,
  },
  setupLayoutIcon: {
    fontSize: 24,
  },
  setupLayoutText: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statItem: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: spacing.md,
    alignItems: 'center',
  },
  statValue: {
    ...typography.h2,
    color: colors.text,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  footerButton: {
    flex: 1,
  },
});
