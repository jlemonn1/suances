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
import { Ionicons } from '@expo/vector-icons';
import { Card, Button, EmptyState, Loading } from '../../components/common';
import { colors, spacing, typography } from '../../theme';
import { PersonnelResponse } from '../../types/personal';
import { usePersonalStore } from '../../store/personalStore';

interface PersonalListScreenProps {
  navigation: any;
}

const getRoleLabel = (role: string): string => {
  switch (role) {
    case 'OWNER':
      return 'Propietario';
    case 'MANAGER':
      return 'Gerente';
    case 'WAITER':
      return 'Camarero';
    default:
      return role;
  }
};

const getRoleColor = (role: string): string => {
  switch (role) {
    case 'OWNER':
      return colors.primary;
    case 'MANAGER':
      return colors.accent;
    case 'WAITER':
      return colors.textSecondary;
    default:
      return colors.textSecondary;
  }
};

export const PersonalListScreen: React.FC<PersonalListScreenProps> = ({
  navigation,
}) => {
  const { personnel, isLoading, fetchPersonnel, deactivatePersonnel } = usePersonalStore();

  useEffect(() => {
    if (personnel.length === 0) {
      fetchPersonnel();
    }
  }, []);

  const onRefresh = () => {
    fetchPersonnel();
  };

  const handleDelete = (id: string, fullName: string) => {
    Alert.alert(
      'Desactivar Usuario',
      `¿Estás seguro de desactivar a "${fullName}"? Ya no podrá acceder al sistema.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desactivar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deactivatePersonnel(id);
            } catch (error) {
              Alert.alert('Error', 'No se pudo desactivar el usuario');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: PersonnelResponse }) => (
    <Card style={styles.card}>
      <TouchableOpacity
        style={styles.cardContent}
        onPress={() => navigation.navigate('PersonalDetail', { personnelId: item.id })}
      >
        <View style={styles.info}>
          <Text style={styles.nombre}>{item.fullName}</Text>
          <Text style={styles.username}>@{item.username}</Text>
          <View style={[styles.roleBadge, { backgroundColor: getRoleColor(item.role) + '20' }]}>
            <Text style={[styles.roleText, { color: getRoleColor(item.role) }]}>
              {getRoleLabel(item.role)}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item.id, item.fullName)}
        >
          <Ionicons name="trash-outline" size={20} color={colors.error} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Card>
  );

  if (isLoading && personnel.length === 0) {
    return <Loading fullScreen message="Cargando personal..." />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={personnel}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <EmptyState
            title="No hay personal"
            message="Crea el primer empleado para gestionar tu equipo"
            actionLabel="Crear Empleado"
            onAction={() => navigation.navigate('PersonalForm', {})}
          />
        }
        contentContainerStyle={personnel.length === 0 && styles.emptyContainer}
      />
      <Button
        title="+ Nuevo Empleado"
        onPress={() => navigation.navigate('PersonalForm', {})}
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
  info: {
    flex: 1,
  },
  nombre: {
    ...typography.h3,
    color: colors.text,
  },
  username: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 4,
    marginTop: spacing.sm,
  },
  roleText: {
    ...typography.caption,
    fontWeight: '600',
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
