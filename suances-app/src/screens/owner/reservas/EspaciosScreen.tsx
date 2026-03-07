import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EmptyState, Loading } from '../../../components/common';
import { SalaCard } from '../../../components/reservas';
import { useReservasStore } from '../../../store/reservasStore';
import { colors, spacing, typography } from '../../../theme';
import { Sala } from '../../../types/reservas';

interface Props {
  navigation: any;
}

export const EspaciosScreen: React.FC<Props> = ({ navigation }) => {
  const { salas, fetchSalas, mesasBySala, loading } = useReservasStore();

  useEffect(() => {
    fetchSalas();
  }, []);

  const handleNuevaSala = () => {
    navigation.navigate('SalaEditor');
  };

  const handleEditarSala = (sala: Sala) => {
    navigation.navigate('SalaEditor', { salaId: sala.id });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Salas & Mesas</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleNuevaSala}>
          <Ionicons name="add" size={24} color={colors.surface} />
        </TouchableOpacity>
      </View>

      {loading.salas && salas.length === 0 ? (
        <Loading message="Cargando salas..." />
      ) : salas.length === 0 ? (
        <EmptyState
          title="No hay salas configuradas"
          message="Crea tu primera sala para comenzar"
          actionLabel="Crear sala"
          onAction={handleNuevaSala}
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
                onPress={() => handleEditarSala(sala)}
                onDetailPress={() => navigation.navigate('SalaDetail', { salaId: sala.id })}
              />
            );
          })}
        </ScrollView>
      )}
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    paddingBottom: spacing.xl,
  },
});
