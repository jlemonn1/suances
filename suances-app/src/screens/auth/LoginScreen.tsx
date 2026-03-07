import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Input } from '../../components/common';
import { colors, spacing, typography } from '../../theme';
import { useAuthStore } from '../../store/authStore';

export const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const login = useAuthStore((state) => state.login);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError('Por favor, introduce usuario y contraseña');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await login({ username, password });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Ionicons name="restaurant" size={64} color={colors.accent} />
          <Text style={styles.title}>Suances</Text>
          <Text style={styles.subtitle}>Gestión de Restaurante</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Usuario"
            value={username}
            onChangeText={setUsername}
            placeholder="Introduce tu usuario"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Input
            label="Contraseña"
            value={password}
            onChangeText={setPassword}
            placeholder="Introduce tu contraseña"
            secureTextEntry
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button
            title="Iniciar Sesión"
            onPress={handleLogin}
            loading={loading}
            style={styles.button}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  logo: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h1,
    color: colors.primary,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  form: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
  },
  error: {
    ...typography.bodySmall,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  button: {
    marginTop: spacing.md,
  },
});
