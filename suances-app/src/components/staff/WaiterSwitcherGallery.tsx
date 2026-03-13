import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { colors, spacing, typography } from '../../theme';
import type { WaiterSession } from '../../types/auth';
import { CustomAlert } from '../common/CustomAlert';

const getInitial = (name?: string) =>
  (name?.trim()?.charAt(0)?.toUpperCase() || '?');

const getShortName = (name?: string) => {
  if (!name) return '—';
  const parts = name.trim().split(/\s+/);
  return parts.slice(0, 2).join(' ');
};

interface WaiterSwitcherGalleryProps {
  style?: StyleProp<ViewStyle>;
}

export const WaiterSwitcherGallery: React.FC<WaiterSwitcherGalleryProps> = ({ style }) => {
  const sessions = useAuthStore((state) => state.waiterSessions);
  const activeUserId = useAuthStore((state) => state.user?.id);
  const switchWaiter = useAuthStore((state) => state.switchWaiter);
  const [pendingSession, setPendingSession] = useState<WaiterSession | null>(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handlePress = useCallback(
    (session: WaiterSession) => {
      if (session.user.id === activeUserId) return;
      setPendingSession(session);
      setAlertVisible(true);
      setErrorMessage(null);
    },
    [activeUserId]
  );

  const handleConfirm = async () => {
    if (!pendingSession) return;
    try {
      await switchWaiter(pendingSession.user.id);
      setAlertVisible(false);
      setPendingSession(null);
    } catch (error: any) {
      setErrorMessage(error?.message || 'Inténtalo de nuevo más tarde');
    }
  };

  const handleDismiss = () => {
    setAlertVisible(false);
    setPendingSession(null);
    setErrorMessage(null);
  };

  if (!sessions.length) {
    return null;
  }

  return (
    <>
      <View style={[styles.container, style]}>
        {sessions.map((session, index) => {
          const isActive = session.user.id === activeUserId;
          return (
            <TouchableOpacity
              key={session.user.id}
              style={[
                styles.avatar,
                isActive && styles.avatarActive,
                index < sessions.length - 1 && styles.avatarSpacing,
              ]}
              onPress={() => handlePress(session)}
              activeOpacity={0.8}
            >
              <View style={styles.initialWrapper}>
                <Text style={[styles.initial, isActive && styles.initialActive]}>
                  {getInitial(session.user.nombre)}
                </Text>
              </View>
              <Text style={[styles.name, isActive && styles.nameActive]} numberOfLines={1}>
                {getShortName(session.user.nombre)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <CustomAlert
        visible={alertVisible}
        title={
          errorMessage ? 'No se pudo cambiar' : 'Cambiar de camarero'
        }
        message={
          errorMessage
            ? errorMessage
            : `¿Quieres usar a ${pendingSession?.user.nombre || 'este camarero'}?`
        }
        type={errorMessage ? 'error' : 'info'}
        onDismiss={handleDismiss}
        buttons={
          errorMessage
            ? [{ text: 'Cerrar', onPress: handleDismiss }]
            : [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Cambiar', onPress: handleConfirm },
              ]
        }
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  avatar: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 12,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    minWidth: 56,
    maxWidth: 90,
  },
  avatarSpacing: {
    marginRight: spacing.sm,
  },
  avatarActive: {
    backgroundColor: colors.accent,
  },
  initialWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  initial: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  initialActive: {
    color: colors.surface,
  },
  name: {
    ...typography.caption,
    color: colors.surface,
    textAlign: 'center',
  },
  nameActive: {
    fontWeight: '600',
  },
});
