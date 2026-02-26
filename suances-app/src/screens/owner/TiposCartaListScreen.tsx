import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { Card, Button, EmptyState, Loading } from '../../components/common';
import { colors, spacing, typography } from '../../theme';
import { cartaService } from '../../services/cartaService';
import { TipoCartaResponse } from '../../types/carta';
import { useTipoCartaStore } from '../../store/tipoCartaStore';

interface TiposCartaListScreenProps {
  navigation: any;
}

export const TiposCartaListScreen: React.FC<TiposCartaListScreenProps> = ({
  navigation,
}) => {
  const { tiposCarta, isLoading, fetchTiposCarta, removeTipoCarta } = useTipoCartaStore();

  useEffect(() => {
    if (tiposCarta.length === 0) {
      fetchTiposCarta();
    }
  }, []);

  const onRefresh = () => {
    fetchTiposCarta();
  };

  const handleDelete = (id: string, nombre: string) => {
    Alert.alert(
      'Eliminar Tipo de Carta',
      `¿Estás seguro de eliminar "${nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await cartaService.eliminarTipoCarta(id);
              removeTipoCarta(id);
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el tipo de carta');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: TipoCartaResponse }) => (
    <Card style={styles.card}>
      <TouchableOpacity
        style={styles.cardContent}
        onPress={() => navigation.navigate('TipoCartaDetail', { tipoCartaId: item.id })}
      >
        <View>
          <Text style={styles.nombre}>{item.nombre}</Text>
          <Text style={styles.horario}>
            {item.horaInicio} - {item.horaFin}
          </Text>
          <Text style={styles.platos}>
            {item.platos?.length || 0} platos asociados
          </Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item.id, item.nombre)}
        >
          <Text style={styles.deleteText}>🗑</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </Card>
  );

  if (isLoading && tiposCarta.length === 0) {
    return <Loading fullScreen message="Cargando tipos de carta..." />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={tiposCarta}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <EmptyState
            title="No hay tipos de carta"
            message="Crea el primer tipo de carta para organizar tu menú"
            actionLabel="Crear Tipo"
            onAction={() => navigation.navigate('TipoCartaForm', {})}
          />
        }
        contentContainerStyle={tiposCarta.length === 0 && styles.emptyContainer}
      />
      <Button
        title="+ Nuevo Tipo de Carta"
        onPress={() => navigation.navigate('TipoCartaForm', {})}
        style={styles.fab}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  emptyContainer: {
    flex: 1,
  },
  card: {
    margin: spacing.md,
    marginBottom: 0,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nombre: {
    ...typography.h3,
    color: colors.text,
  },
  horario: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  platos: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  deleteButton: {
    padding: spacing.sm,
  },
  deleteText: {
    fontSize: 20,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
  },
});
