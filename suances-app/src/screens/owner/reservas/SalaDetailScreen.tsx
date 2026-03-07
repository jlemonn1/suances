import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, Modal, Alert, Pressable, Switch, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Input, Loading } from '../../../components/common';
import { LayoutCanvas } from '../../../components/reservas';
import { colors, spacing, typography } from '../../../theme';
import { useReservasStore } from '../../../store/reservasStore';
import { BloqueoTipo, MesaRequest, SalaLayout, DEFAULT_TABLE_CAPACITY } from '../../../types/reservas';

interface Props {
  route: { params: { salaId: string } };
}

type MesaFormState = {
  numero: string;
  capacidad: string;
  visibleOnline: boolean;
  activa: boolean;
  posX?: number;
  posY?: number;
};

const defaultMesaForm: MesaFormState = {
  numero: '',
  capacidad: String(DEFAULT_TABLE_CAPACITY),
  visibleOnline: true,
  activa: true,
};

export const SalaDetailScreen: React.FC<Props> = ({ route }) => {
  const { salaId } = route.params;
  const {
    salas,
    mesasBySala,
    fetchMesas,
    saveMesa,
    updateMesaPosition,
    crearBloqueo,
  } = useReservasStore();

  const sala = salas.find((s) => s.id === salaId);
  const mesas = mesasBySala[salaId] || [];
  
  // Estado del modo edición
  const [editMode, setEditMode] = useState(false);
  
  // Modal de mesa
  const [mesaModal, setMesaModal] = useState<{ visible: boolean; mesaId?: string }>({ visible: false });
  const [mesaForm, setMesaForm] = useState<MesaFormState>({ ...defaultMesaForm });
  
  // Modal de bloqueo
  const [bloqueoModal, setBloqueoModal] = useState<{ visible: boolean; mesaId?: string }>({ visible: false });
  const [bloqueoForm, setBloqueoForm] = useState({
    tipo: 'ONLINE' as BloqueoTipo,
    fechaDesde: new Date().toISOString().split('T')[0],
    fechaHasta: new Date().toISOString().split('T')[0],
    motivo: '',
  });

  useEffect(() => {
    fetchMesas(salaId);
  }, [salaId]);

  const layout = useMemo(() => {
    if (!sala?.layoutJson) return null;
    try {
      return JSON.parse(sala.layoutJson) as SalaLayout;
    } catch (error) {
      console.warn('Layout inválido', error);
      return null;
    }
  }, [sala?.layoutJson]);

  // Calcular siguiente número de mesa disponible
  const getNextMesaNumber = () => {
    if (mesas.length === 0) return 1;
    const maxNum = Math.max(...mesas.map((m) => m.numero));
    return maxNum + 1;
  };

  const openMesaModal = (mesaId?: string, initialPos?: { posX: number; posY: number }) => {
    if (mesaId) {
      // Editar mesa existente
      const mesa = mesas.find((m) => m.id === mesaId);
      if (mesa) {
        setMesaForm({
          numero: mesa.numero.toString(),
          capacidad: mesa.capacidad.toString(),
          visibleOnline: mesa.visibleOnline,
          activa: mesa.activa,
          posX: mesa.posX ?? undefined,
          posY: mesa.posY ?? undefined,
        });
      }
    } else {
      // Nueva mesa
      setMesaForm({
        ...defaultMesaForm,
        numero: getNextMesaNumber().toString(),
        posX: initialPos?.posX,
        posY: initialPos?.posY,
      });
    }
    setMesaModal({ visible: true, mesaId });
  };

  const openBloqueoModal = (mesaId: string) => {
    setBloqueoModal({ visible: true, mesaId });
  };

  const handleBloqueoSubmit = async () => {
    if (!bloqueoModal.mesaId) return;
    await crearBloqueo(bloqueoModal.mesaId, bloqueoForm);
    setBloqueoModal({ visible: false });
  };

  const handleMesaSubmit = async () => {
    if (!mesaForm.numero || !mesaForm.capacidad) {
      Alert.alert('Error', 'Completa número y capacidad');
      return;
    }
    
    const payload: MesaRequest = {
      numero: parseInt(mesaForm.numero, 10),
      capacidad: parseInt(mesaForm.capacidad, 10),
      visibleOnline: mesaForm.visibleOnline,
      activa: mesaForm.activa,
      posX: mesaForm.posX ?? null,
      posY: mesaForm.posY ?? null,
    };
    
    await saveMesa(salaId, payload, mesaModal.mesaId);
    setMesaModal({ visible: false });
    setMesaForm({ ...defaultMesaForm });
  };

  // El canvas ahora maneja todo internamente (selección y movimiento)

  const handlePositionChange = async (mesaId: string, pos: { posX: number; posY: number }) => {
    await updateMesaPosition(salaId, mesaId, pos);
  };

  if (!sala) {
    return <Loading fullScreen message="Sala no encontrada" />;
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{sala.nombre}</Text>
          <Text style={styles.subtitle}>
            {mesas.length} mesas · Capacidad: {mesas.reduce((sum, m) => sum + m.capacidad, 0)} comensales
          </Text>
        </View>
      </View>

      {/* Toggle modo edición */}
      <View style={styles.editModeContainer}>
        <View style={styles.editModeRow}>
          <View style={styles.editModeLabelContainer}>
            <Ionicons 
              name={editMode ? 'create' : 'eye'} 
              size={16} 
              color={colors.textSecondary} 
            />
            <Text style={styles.editModeLabel}>
              {editMode ? 'Modo Edición' : 'Modo Visualización'}
            </Text>
          </View>
          <Switch
            value={editMode}
            onValueChange={setEditMode}
            trackColor={{ false: colors.border, true: colors.primary + '80' }}
            thumbColor={editMode ? colors.primary : colors.textSecondary}
          />
        </View>
        <Text style={styles.editModeHint}>
          {editMode 
            ? 'Toca una mesa para seleccionarla, luego usa los controles para moverla.'
            : 'Visualiza el plano de la sala. Activa el modo edición para modificar.'
          }
        </Text>
      </View>

      {/* Canvas */}
      <LayoutCanvas
        layout={layout}
        mesas={mesas}
        editable={editMode}
        onPositionChange={handlePositionChange}
      />

      {/* Lista de mesas */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Mesas</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => openMesaModal()}>
          <Ionicons name="add" size={22} color={colors.surface} />
        </TouchableOpacity>
      </View>

      {mesas.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No hay mesas configuradas</Text>
          <Text style={styles.emptyStateSubtext}>
            Activa el modo edición y toca el canvas para añadir mesas
          </Text>
        </View>
      ) : (
        mesas.map((mesa) => (
          <View key={mesa.id} style={styles.mesaCard}>
            <View style={styles.mesaInfo}>
              <Text style={styles.mesaTitle}>Mesa #{mesa.numero}</Text>
              <View style={styles.mesaMetaRow}>
                <Text style={styles.mesaMeta}>{mesa.capacidad} comensales</Text>
                {mesa.visibleOnline && (
                  <View style={styles.onlineBadge}>
                    <Text style={styles.onlineBadgeText}>Online</Text>
                  </View>
                )}
                {!mesa.activa && (
                  <View style={[styles.onlineBadge, { backgroundColor: colors.error + '20' }]}>
                    <Text style={[styles.onlineBadgeText, { color: colors.error }]}>Inactiva</Text>
                  </View>
                )}
              </View>
              {(mesa.posX !== null && mesa.posY !== null) ? (
                <Text style={styles.mesaPosition}>
                  Posición: ({mesa.posX}, {mesa.posY})
                </Text>
              ) : (
                <Text style={styles.mesaPositionUnplaced}>Sin posición asignada</Text>
              )}
            </View>
            <View style={styles.mesaActions}>
              <Button 
                title="Editar" 
                size="small" 
                variant="outline" 
                onPress={() => openMesaModal(mesa.id)} 
              />
              <Button 
                title="Bloquear" 
                size="small" 
                variant="secondary" 
                onPress={() => openBloqueoModal(mesa.id)} 
              />
            </View>
          </View>
        ))
      )}

      {/* Modal de Mesa */}
      <Modal
        visible={mesaModal.visible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setMesaModal({ visible: false })}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {mesaModal.mesaId ? 'Editar Mesa' : 'Nueva Mesa'}
              </Text>
              <Pressable 
                onPress={() => setMesaModal({ visible: false })}
                style={styles.modalClose}
              >
                <Ionicons name="close" size={20} color={colors.text} />
              </Pressable>
            </View>

            <ScrollView style={styles.modalBody}>
              <Input 
                label="Número de mesa *" 
                value={mesaForm.numero} 
                onChangeText={(value) => setMesaForm((prev) => ({ ...prev, numero: value }))} 
                keyboardType="numeric" 
                placeholder="Ej: 1"
              />
              
              <Input 
                label="Capacidad (comensales) *" 
                value={mesaForm.capacidad} 
                onChangeText={(value) => setMesaForm((prev) => ({ ...prev, capacidad: value }))} 
                keyboardType="numeric" 
                placeholder="Ej: 4"
              />

              {(mesaForm.posX !== undefined && mesaForm.posY !== undefined) && (
                <View style={styles.positionInfo}>
                  <Text style={styles.positionLabel}>Posición en el plano:</Text>
                  <Text style={styles.positionValue}>
                    X: {mesaForm.posX}, Y: {mesaForm.posY}
                  </Text>
                </View>
              )}

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Visible para reservas online</Text>
                <Switch
                  value={mesaForm.visibleOnline}
                  onValueChange={(value) => setMesaForm((prev) => ({ ...prev, visibleOnline: value }))}
                  trackColor={{ false: colors.border, true: colors.success + '80' }}
                  thumbColor={mesaForm.visibleOnline ? colors.success : colors.textSecondary}
                />
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Mesa activa</Text>
                <Switch
                  value={mesaForm.activa}
                  onValueChange={(value) => setMesaForm((prev) => ({ ...prev, activa: value }))}
                  trackColor={{ false: colors.border, true: colors.primary + '80' }}
                  thumbColor={mesaForm.activa ? colors.primary : colors.textSecondary}
                />
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <Button 
                title="Cancelar" 
                variant="outline" 
                onPress={() => setMesaModal({ visible: false })}
                style={styles.modalButton}
              />
              <Button 
                title={mesaModal.mesaId ? 'Guardar' : 'Crear'}
                onPress={handleMesaSubmit}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Bloqueo */}
      <Modal
        visible={bloqueoModal.visible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setBloqueoModal({ visible: false })}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Bloquear Mesa</Text>
              <Pressable 
                onPress={() => setBloqueoModal({ visible: false })}
                style={styles.modalClose}
              >
                <Ionicons name="close" size={20} color={colors.text} />
              </Pressable>
            </View>

            <ScrollView style={styles.modalBody}>
              <Input 
                label="Tipo de bloqueo" 
                value={bloqueoForm.tipo} 
                onChangeText={(value) => setBloqueoForm((prev) => ({ ...prev, tipo: value as BloqueoTipo }))}
                placeholder="ONLINE, TOTAL, MANTENIMIENTO..."
              />
              
              <Input 
                label="Fecha desde" 
                value={bloqueoForm.fechaDesde} 
                onChangeText={(value) => setBloqueoForm((prev) => ({ ...prev, fechaDesde: value }))}
                placeholder="YYYY-MM-DD"
              />
              
              <Input 
                label="Fecha hasta" 
                value={bloqueoForm.fechaHasta} 
                onChangeText={(value) => setBloqueoForm((prev) => ({ ...prev, fechaHasta: value }))}
                placeholder="YYYY-MM-DD"
              />
              
              <Input 
                label="Motivo (opcional)" 
                value={bloqueoForm.motivo} 
                onChangeText={(value) => setBloqueoForm((prev) => ({ ...prev, motivo: value }))}
                placeholder="Motivo del bloqueo"
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <Button 
                title="Cancelar" 
                variant="outline" 
                onPress={() => setBloqueoModal({ visible: false })}
                style={styles.modalButton}
              />
              <Button 
                title="Crear" 
                onPress={handleBloqueoSubmit}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: {
    ...typography.h1,
    color: colors.text,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  editModeContainer: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  editModeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  editModeLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  editModeLabel: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  editModeHint: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.text,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    padding: spacing.xl,
    alignItems: 'center',
    marginHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: spacing.md,
  },
  emptyStateText: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  emptyStateSubtext: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  mesaCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: spacing.md,
    marginBottom: spacing.sm,
    marginHorizontal: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  mesaInfo: {
    flex: 1,
  },
  mesaTitle: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text,
  },
  mesaMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  mesaMeta: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  onlineBadge: {
    backgroundColor: colors.success + '20',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  onlineBadgeText: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '600',
    fontSize: 10,
  },
  mesaPosition: {
    ...typography.caption,
    color: colors.primary,
    marginTop: spacing.xs,
    fontFamily: 'monospace',
  },
  mesaPositionUnplaced: {
    ...typography.caption,
    color: colors.warning,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
  mesaActions: {
    gap: spacing.xs,
    minWidth: 100,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.background + 'CC',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: spacing.lg,
    borderTopRightRadius: spacing.lg,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    ...typography.h2,
    color: colors.text,
  },
  modalClose: {
    padding: spacing.xs,
  },
  modalCloseText: {
    fontSize: 20,
    color: colors.textSecondary,
  },
  modalBody: {
    padding: spacing.md,
    gap: spacing.md,
  },
  positionInfo: {
    backgroundColor: colors.primary + '10',
    padding: spacing.md,
    borderRadius: spacing.sm,
    marginBottom: spacing.sm,
  },
  positionLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  positionValue: {
    ...typography.body,
    fontWeight: '600',
    color: colors.primary,
    fontFamily: 'monospace',
    marginTop: spacing.xs,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '40',
  },
  switchLabel: {
    ...typography.body,
    color: colors.text,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  modalButton: {
    flex: 1,
    width: undefined,
  },
});
