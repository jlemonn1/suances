import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Loading, EmptyState } from '../../../components/common';
import { FranjaCard } from '../../../components/reservas';
import { FranjaEditor } from '../../../components/reservas/FranjaEditor';
import { useReservasStore } from '../../../store/reservasStore';
import { colors, spacing, typography } from '../../../theme';
import { FranjaHoraria, FranjaRequest } from '../../../types/reservas';

export const FranjasScreen: React.FC = () => {
  const { franjas, loading, fetchFranjas, saveFranja, deleteFranja } = useReservasStore();
  const [editorVisible, setEditorVisible] = useState(false);
  const [selectedFranja, setSelectedFranja] = useState<FranjaHoraria | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchFranjas();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFranjas();
    setRefreshing(false);
  };

  const handleNewFranja = () => {
    setSelectedFranja(null);
    setEditorVisible(true);
  };

  const handleEditFranja = (franja: FranjaHoraria) => {
    setSelectedFranja(franja);
    setEditorVisible(true);
  };

  const handleToggle = async (franja: FranjaHoraria) => {
    await saveFranja({
      nombre: franja.nombre,
      tipo:franja.tipo,
      horaInicio:franja.horaInicio,
      horaFin:franja.horaFin,
      activa: !franja.activa,
    }, franja.id);
  };

  const handleSave = async (data: FranjaRequest) => {
    await saveFranja(data, selectedFranja?.id);
    await fetchFranjas();
  };

  const handleDelete = async (franjaId: string) => {
    await deleteFranja(franjaId);
  };

  const renderFranja = ({ item }: { item: FranjaHoraria }) => (
    <FranjaCard
      franca={item}
      onToggle={handleToggle}
      onPress={() => handleEditFranja(item)}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Franjas</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleNewFranja}>
          <Ionicons name="add" size={24} color={colors.surface} />
        </TouchableOpacity>
      </View>

      {loading.franjas && franjas.length === 0 ? (
        <Loading message="Cargando franjas..." />
      ) : franjas.length === 0 ? (
        <EmptyState
          title="Sin franjas"
          message="Crea tu primera franja horaria para gestionar las reservas"
          actionLabel="Crear franja"
          onAction={handleNewFranja}
        />
      ) : (
        <FlatList
          data={franjas}
          renderItem={renderFranja}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.accent]} />
          }
        />
      )}

      <FranjaEditor
        visible={editorVisible}
        franja={selectedFranja}
        onClose={() => setEditorVisible(false)}
        onSave={handleSave}
        onDelete={handleDelete}
      />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: {
    ...typography.h1,
    color: colors.text,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    padding: spacing.md,
  },
});
