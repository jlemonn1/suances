import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Loading } from '../../components/common';
import { colors, spacing, typography } from '../../theme';
import { PersonnelResponse } from '../../types/personal';
import { Rol } from '../../types/auth';
import { personalService } from '../../services/personalService';
import { usePersonalStore } from '../../store/personalStore';

interface PersonalDetailScreenProps {
  navigation: any;
  route: { params: { personnelId: string } };
}

const ROLES: { value: Rol; label: string }[] = [
  { value: 'PROPIETARIO', label: 'Propietario' },
  { value: 'GERENTE', label: 'Gerente' },
  { value: 'CAMARERO', label: 'Camarero' },
];

export const PersonalDetailScreen: React.FC<PersonalDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const { personnelId } = route.params;
  const { changePersonnelRole } = usePersonalStore();

  const [personnel, setPersonnel] = useState<PersonnelResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [changingRole, setChangingRole] = useState(false);

  const loadPersonnel = useCallback(async () => {
    try {
      const data = await personalService.getPersonnelById(personnelId);
      setPersonnel(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar el usuario');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [personnelId]);

  useEffect(() => {
    loadPersonnel();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadPersonnel();
    });
    return unsubscribe;
  }, [navigation, loadPersonnel]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPersonnel();
    setRefreshing(false);
  };

  const handleChangeRole = async (newRole: Rol) => {
    if (!personnel) return;
    if (newRole === personnel.role) return;

    Alert.alert(
      'Cambiar Rol',
      `¿Estás seguro de cambiar el rol de "${personnel.fullName}" a "${ROLES.find(r => r.value === newRole)?.label}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            setChangingRole(true);
            try {
              await changePersonnelRole(personnelId, newRole);
              await loadPersonnel();
            } catch (error) {
              Alert.alert('Error', 'No se pudo cambiar el rol');
            } finally {
              setChangingRole(false);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <Loading fullScreen message="Cargando usuario..." />;
  }

  if (!personnel) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {personnel.fullName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.nombre}>{personnel.fullName}</Text>
          <Text style={styles.username}>@{personnel.username}</Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: personnel.activo ? colors.success + '20' : colors.error + '20' }
          ]}>
            <Text style={[
              styles.statusText,
              { color: personnel.activo ? colors.success : colors.error }
            ]}>
              {personnel.activo ? 'Activo' : 'Inactivo'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nombre completo</Text>
            <Text style={styles.infoValue}>{personnel.fullName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Usuario</Text>
            <Text style={styles.infoValue}>@{personnel.username}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Fecha de creación</Text>
            <Text style={styles.infoValue}>{formatDate(personnel.createdAt)}</Text>
          </View>
          {personnel.updatedAt && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Última actualización</Text>
              <Text style={styles.infoValue}>{formatDate(personnel.updatedAt)}</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rol</Text>
          <Text style={styles.roleDescription}>
            Selecciona el rol para este usuario. Cada rol tiene diferentes permisos de acceso.
          </Text>
          {changingRole ? (
            <Loading message="Cambiando rol..." />
          ) : (
            <View style={styles.roleOptions}>
              {ROLES.map((role) => (
                <TouchableOpacity
                  key={role.value}
                  style={[
                    styles.roleOption,
                    personnel.role === role.value && styles.roleOptionSelected,
                  ]}
                  onPress={() => handleChangeRole(role.value)}
                  disabled={personnel.role === role.value}
                >
                  <Text
                    style={[
                      styles.roleOptionText,
                      personnel.role === role.value && styles.roleOptionTextSelected,
                    ]}
                  >
                    {role.label}
                  </Text>
                  {personnel.role === role.value && (
                    <Ionicons name="checkmark" size={16} color={colors.surface} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Editar Usuario"
          onPress={() => navigation.navigate('PersonalForm', { personnel })}
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
  content: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    ...typography.h1,
    color: colors.surface,
  },
  nombre: {
    ...typography.h1,
    color: colors.text,
    textAlign: 'center',
  },
  username: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    marginTop: spacing.md,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '600',
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  infoRow: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  infoValue: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
  },
  roleDescription: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  roleOptions: {
    gap: spacing.sm,
  },
  roleOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  roleOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  roleOptionText: {
    ...typography.body,
    color: colors.text,
  },
  roleOptionTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  roleCheck: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
