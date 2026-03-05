import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, Alert } from 'react-native';
import { Button, EmptyState, Input, Loading } from '../../../components/common';
import { SalaCard } from '../../../components/reservas';
import { useReservasStore } from '../../../store/reservasStore';
import { colors, spacing, typography } from '../../../theme';

interface Props {
  navigation: any;
}

export const EspaciosScreen: React.FC<Props> = ({ navigation }) => {
  const { salas, fetchSalas, saveSala, mesasBySala, loading } = useReservasStore();
  const [formVisible, setFormVisible] = useState(false);
  const [nombre, setNombre] = useState('');
  const [capacidad, setCapacidad] = useState('');

  useEffect(() => {
    fetchSalas();
  }, []);

  const handleSubmit = async () => {
    if (!nombre.trim()) {
      Alert.alert('Nombre requerido');
      return;
    }
    await saveSala({ nombre, capacidadMaxima: capacidad ? parseInt(capacidad, 10) : undefined });
    setNombre('');
    setCapacidad('');
    setFormVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Salas & Mesas</Text>
        <Button title="Nueva sala" onPress={() => setFormVisible(true)} size="small" />
      </View>

      {loading.salas && salas.length === 0 ? (
        <Loading message="Cargando salas..." />
      ) : salas.length === 0 ? (
        <EmptyState
          title="No hay salas configuradas"
          message="Crea tu primera sala para comenzar"
          actionLabel="Crear sala"
          onAction={() => setFormVisible(true)}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {salas.map((sala) => {
            const mesas = mesasBySala[sala.id] || [];
            const visibles = mesas.filter((m) => m.visibleOnline).length;
            return (
              <SalaCard
                key={sala.id}
                sala={sala}
                totalMesas={mesas.length}
                mesasVisibles={visibles}
                capacidad={mesas.reduce((sum, mesa) => sum + mesa.capacidad, 0)}
                onPress={() => navigation.navigate('SalaDetail', { salaId: sala.id })}
              />
            );
          })}
        </ScrollView>
      )}

      <Modal visible={formVisible} animationType="slide" onRequestClose={() => setFormVisible(false)}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Nueva sala</Text>
          <Input label="Nombre" value={nombre} onChangeText={setNombre} />
          <Input
            label="Capacidad"
            value={capacidad}
            onChangeText={setCapacidad}
            keyboardType="numeric"
          />
          <View style={styles.modalActions}>
            <Button title="Cancelar" variant="outline" onPress={() => setFormVisible(false)} />
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
  list: {
    paddingBottom: spacing.xl,
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
    marginBottom: spacing.sm,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
});
