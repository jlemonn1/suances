import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, Alert, ScrollView } from 'react-native';
import { Button, Input, Loading } from '../../../components/common';
import { FranjaCard } from '../../../components/reservas';
import { useReservasStore } from '../../../store/reservasStore';
import { colors, spacing, typography } from '../../../theme';
import { FranjaRequest, FranjaTipo } from '../../../types/reservas';

const franjaTipos: FranjaTipo[] = ['COMIDA', 'CENA', 'ESPECIAL'];

export const FranjasScreen = () => {
  const { franjas, fetchFranjas, saveFranja } = useReservasStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState<FranjaRequest>({
    nombre: '',
    tipo: 'COMIDA',
    horaInicio: '13:00',
    horaFin: '14:00',
  });

  useEffect(() => {
    fetchFranjas();
  }, []);

  const handleSubmit = async () => {
    if (!form.nombre) {
      Alert.alert('Nombre requerido');
      return;
    }
    await saveFranja(form);
    setModalVisible(false);
    setForm({ ...form, nombre: '' });
  };

  const handleToggle = async (franjaId: string) => {
    const franja = franjas.find((f) => f.id === franjaId);
    if (!franja) return;
    await saveFranja({
      nombre: franja.nombre,
      tipo: franja.tipo,
      horaInicio: franja.horaInicio,
      horaFin: franja.horaFin,
      activa: !franja.activa,
    }, franjaId);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Franjas horarias</Text>
        <Button title="Nueva franja" size="small" onPress={() => setModalVisible(true)} />
      </View>
      {franjas.length === 0 ? (
        <Loading message="Sin franjas" />
      ) : (
        <ScrollView>
          {franjas.map((franja) => (
            <FranjaCard key={franja.id} franja={franja} onToggle={() => handleToggle(franja.id)} />
          ))}
        </ScrollView>
      )}

      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Franja</Text>
          <Input label="Nombre" value={form.nombre} onChangeText={(value) => setForm((prev) => ({ ...prev, nombre: value }))} />
          <Input
            label="Tipo (COMIDA/CENA/ESPECIAL)"
            value={form.tipo}
            onChangeText={(value) =>
              setForm((prev) => ({ ...prev, tipo: franjaTipos.includes(value as FranjaTipo) ? (value as FranjaTipo) : prev.tipo }))
            }
          />
          <Input label="Hora inicio" value={form.horaInicio} onChangeText={(value) => setForm((prev) => ({ ...prev, horaInicio: value }))} />
          <Input label="Hora fin" value={form.horaFin} onChangeText={(value) => setForm((prev) => ({ ...prev, horaFin: value }))} />
          <View style={styles.modalActions}>
            <Button title="Cancelar" variant="outline" onPress={() => setModalVisible(false)} />
            <Button title="Guardar" onPress={handleSubmit} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.text,
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
