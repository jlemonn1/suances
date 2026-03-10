import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Button, Input, Loading } from '../../components/common';
import { colors, spacing, typography } from '../../theme';
import { PersonnelResponse } from '../../types/personal';
import { Rol } from '../../types/auth';
import { usePersonalStore } from '../../store/personalStore';

interface PersonalFormScreenProps {
  navigation: any;
  route: { params?: { personnel?: PersonnelResponse } };
}

const ROLES: { value: Rol; label: string; description: string }[] = [
  { value: 'OWNER', label: 'Propietario', description: 'Acceso total al sistema' },
  { value: 'MANAGER', label: 'Gerente', description: 'Gestión de carta e inventario' },
  { value: 'WAITER', label: 'Camarero', description: 'Acceso limitado a pedidos' },
];

export const PersonalFormScreen: React.FC<PersonalFormScreenProps> = ({
  navigation,
  route,
}) => {
  const { createPersonnel, updatePerson } = usePersonalStore();
  const initialData = route.params?.personnel;

  const [username, setUsername] = useState(initialData?.username || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState(initialData?.fullName || '');
  const [role, setRole] = useState<Rol>(initialData?.role || 'WAITER');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    username?: string;
    password?: string;
    confirmPassword?: string;
    fullName?: string;
  }>({});

  const isEditing = !!initialData;

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'El nombre es obligatorio';
    }

    if (!isEditing) {
      if (!username.trim()) {
        newErrors.username = 'El usuario es obligatorio';
      } else if (username.length < 3) {
        newErrors.username = 'El usuario debe tener al menos 3 caracteres';
      }

      if (!password) {
        newErrors.password = 'La contraseña es obligatoria';
      } else if (password.length < 6) {
        newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
      }

      if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden';
      }
    }

    if (isEditing && password) {
      if (password.length < 6) {
        newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
      }
      if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      if (isEditing) {
        const updateData: any = {
          fullName: fullName.trim(),
        };
        if (password) {
          updateData.password = password;
        }
        await updatePerson(initialData!.id, updateData);
      } else {
        await createPersonnel({
          username: username.trim(),
          password,
          fullName: fullName.trim(),
          role,
        });
      }
      navigation.goBack();
    } catch (error: any) {
      const message = error.response?.data?.message || 'No se pudo guardar el usuario';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Input
        label="Nombre completo"
        value={fullName}
        onChangeText={setFullName}
        placeholder="Ej: Juan García Pérez"
        error={errors.fullName}
      />

      {!isEditing && (
        <>
          <Input
            label="Usuario"
            value={username}
            onChangeText={setUsername}
            placeholder="Ej: jgarcia"
            error={errors.username}
            autoCapitalize="none"
          />

          <Input
            label="Contraseña"
            value={password}
            onChangeText={setPassword}
            placeholder="Mínimo 6 caracteres"
            error={errors.password}
            secureTextEntry
          />

          <Input
            label="Confirmar contraseña"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Repite la contraseña"
            error={errors.confirmPassword}
            secureTextEntry
          />
        </>
      )}

      {isEditing && (
        <View style={styles.passwordSection}>
          <Text style={styles.sectionTitle}>Cambiar contraseña</Text>
          <Text style={styles.passwordHint}>
            Deja estos campos vacíos si no quieres cambiar la contraseña
          </Text>
          <Input
            label="Nueva contraseña"
            value={password}
            onChangeText={setPassword}
            placeholder="Mínimo 6 caracteres"
            error={errors.password}
            secureTextEntry
          />
          <Input
            label="Confirmar nueva contraseña"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Repite la contraseña"
            error={errors.confirmPassword}
            secureTextEntry
          />
        </View>
      )}

      {!isEditing && (
        <>
          <Text style={styles.sectionTitle}>Rol</Text>
          <Text style={styles.roleHint}>
            Selecciona el nivel de acceso para este usuario
          </Text>
          <View style={styles.rolesContainer}>
            {ROLES.map((r) => (
              <View
                key={r.value}
                style={[
                  styles.roleOption,
                  role === r.value && styles.roleOptionSelected,
                ]}
              >
                <Text
                  style={[
                    styles.roleLabel,
                    role === r.value && styles.roleLabelSelected,
                  ]}
                  onPress={() => setRole(r.value)}
                >
                  {r.label}
                </Text>
                <Text
                  style={[
                    styles.roleDescription,
                    role === r.value && styles.roleDescriptionSelected,
                  ]}
                >
                  {r.description}
                </Text>
              </View>
            ))}
          </View>
        </>
      )}

      <Button
        title={isEditing ? 'Actualizar Usuario' : 'Crear Usuario'}
        onPress={handleSave}
        loading={loading}
        style={styles.saveButton}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  roleHint: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  rolesContainer: {
    gap: spacing.sm,
  },
  roleOption: {
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
  roleLabel: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  roleLabelSelected: {
    color: colors.primary,
  },
  roleDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  roleDescriptionSelected: {
    color: colors.primary,
  },
  passwordSection: {
    marginTop: spacing.md,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  passwordHint: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  saveButton: {
    marginTop: spacing.xl,
  },
});
