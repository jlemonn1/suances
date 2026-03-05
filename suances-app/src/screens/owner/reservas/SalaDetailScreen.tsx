import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, Modal, Alert } from 'react-native';
import { Button, Input, Loading } from '../../../components/common';
import { LayoutCanvas } from '../../../components/reservas';
import { colors, spacing, typography } from '../../../theme';
import { useReservasStore } from '../../../store/reservasStore';
import { BloqueoTipo, MesaRequest, SalaLayout } from '../../../types/reservas';

interface Props {
  route: { params: { salaId: string } };
}

type MesaFormState = {
  numero: string;
  capacidad: string;
  visibleOnline: boolean;
  activa: boolean;
};

const defaultMesaForm: MesaFormState = {
  numero: '',
  capacidad: '',
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
  const [mesaModal, setMesaModal] = useState<{ visible: boolean; mesaId?: string }>({ visible: false });
  const [mesaForm, setMesaForm] = useState<MesaFormState>({ ...defaultMesaForm });
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

  const openMesaModal = (mesaId?: string) => {
    if (mesaId) {
      const mesa = mesas.find((m) => m.id === mesaId);
      if (mesa) {
        setMesaForm({
          numero: mesa.numero.toString(),
          capacidad: mesa.capacidad.toString(),
          visibleOnline: mesa.visibleOnline,
          activa: mesa.activa,
        });
      }
    } else {
      setMesaForm({ ...defaultMesaForm });
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
      Alert.alert('Completa número y capacidad');
      return;
    }
    const payload: MesaRequest = {
      numero: parseInt(mesaForm.numero, 10),
      capacidad: parseInt(mesaForm.capacidad, 10),
      visibleOnline: mesaForm.visibleOnline,
      activa: mesaForm.activa,
    };
    await saveMesa(salaId, payload, mesaModal.mesaId);
    setMesaModal({ visible: false });
    setMesaForm({ ...defaultMesaForm });
  };

  if (!sala) {
    return <Loading fullScreen message="Sala no encontrada" />;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{sala.nombre}</Text>
      <Text style={styles.subtitle}>Arrastra las mesas para ajustar el plano</Text>

      <LayoutCanvas
        layout={layout}
        mesas={mesas}
        onPositionChange={(mesaId, pos) => updateMesaPosition(salaId, mesaId, pos)}
      />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Mesas</Text>
        <Button title="Añadir mesa" size="small" onPress={() => openMesaModal()} />
      </View>

      {mesas.map((mesa) => (
        <View key={mesa.id} style={styles.mesaCard}>
          <View>
            <Text style={styles.mesaTitle}>Mesa #{mesa.numero}</Text>
            <Text style={styles.mesaMeta}>{mesa.capacidad} comensales</Text>
            <Text style={styles.mesaMeta}>Online: {mesa.visibleOnline ? 'Sí' : 'No'}</Text>
          </View>
          <View style={styles.mesaActions}>
            <Button title="Editar" size="small" variant="outline" onPress={() => openMesaModal(mesa.id)} />
            <Button title="Bloquear" size="small" variant="secondary" onPress={() => openBloqueoModal(mesa.id)} />
          </View>
        </View>
      ))}

      <Modal
        visible={mesaModal.visible}
        animationType="slide"
        onRequestClose={() => setMesaModal({ visible: false })}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{mesaModal.mesaId ? 'Editar mesa' : 'Nueva mesa'}</Text>
          <Input label="Número" value={mesaForm.numero} onChangeText={(value) => setMesaForm((prev) => ({ ...prev, numero: value }))} keyboardType="numeric" />
          <Input label="Capacidad" value={mesaForm.capacidad} onChangeText={(value) => setMesaForm((prev) => ({ ...prev, capacidad: value }))} keyboardType="numeric" />
          <Input
            label="Visible online (true/false)"
            value={mesaForm.visibleOnline ? 'true' : 'false'}
            onChangeText={(value) =>
              setMesaForm((prev) => ({ ...prev, visibleOnline: value.toLowerCase() === 'true' }))
            }
          />
          <Input
            label="Activa (true/false)"
            value={mesaForm.activa ? 'true' : 'false'}
            onChangeText={(value) => setMesaForm((prev) => ({ ...prev, activa: value.toLowerCase() === 'true' }))}
          />
          <View style={styles.modalActions}>
            <Button title="Cancelar" variant="outline" onPress={() => setMesaModal({ visible: false })} />
            <Button title="Guardar" onPress={handleMesaSubmit} />
          </View>
        </View>
      </Modal>

      <Modal
        visible={bloqueoModal.visible}
        animationType="slide"
        onRequestClose={() => setBloqueoModal({ visible: false })}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Bloquear mesa</Text>
          <Input label="Tipo (ONLINE/TOTAL/MANTENIMIENTO)" value={bloqueoForm.tipo} onChangeText={(value) => setBloqueoForm((prev) => ({ ...prev, tipo: value as BloqueoTipo }))} />
          <Input label="Fecha desde" value={bloqueoForm.fechaDesde} onChangeText={(value) => setBloqueoForm((prev) => ({ ...prev, fechaDesde: value }))} />
          <Input label="Fecha hasta" value={bloqueoForm.fechaHasta} onChangeText={(value) => setBloqueoForm((prev) => ({ ...prev, fechaHasta: value }))} />
          <Input label="Motivo" value={bloqueoForm.motivo} onChangeText={(value) => setBloqueoForm((prev) => ({ ...prev, motivo: value }))} />
          <View style={styles.modalActions}>
            <Button title="Cancelar" variant="outline" onPress={() => setBloqueoModal({ visible: false })} />
            <Button title="Crear" onPress={handleBloqueoSubmit} />
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
    padding: spacing.md,
  },
  title: {
    ...typography.h1,
    color: colors.text,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.text,
  },
  mesaCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mesaTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  mesaMeta: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  mesaActions: {
    gap: spacing.xs,
    minWidth: 140,
  },
  modalContent: {
    flex: 1,
    padding: spacing.lg,
    backgroundColor: colors.background,
    gap: spacing.md,
  },
  modalTitle: {
    ...typography.h2,
    color: colors.text,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
});
