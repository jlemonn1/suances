import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../../theme';

type AlertType = 'info' | 'success' | 'warning' | 'error';

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  type?: AlertType;
  buttons?: {
    text?: string;
    icon?: string;
    iconColor?: string;
    iconSize?: number;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }[];
  onDismiss?: () => void;
}

const getIconAndColor = (type: AlertType) => {
  switch (type) {
    case 'success':
      return { icon: 'checkmark-circle' as const, color: colors.success };
    case 'warning':
      return { icon: 'warning' as const, color: colors.warning };
    case 'error':
      return { icon: 'close-circle' as const, color: colors.error };
    default:
      return { icon: 'information-circle' as const, color: colors.accent };
  }
};

export const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  type = 'info',
  buttons = [{ text: 'OK' }],
  onDismiss,
}) => {
  const { icon, color } = getIconAndColor(type);

  const handleButtonPress = (onPress?: () => void) => {
    onPress?.();
    onDismiss?.();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <TouchableWithoutFeedback onPress={onDismiss}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.container}>
              <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
                <Ionicons name={icon} size={48} color={color} />
              </View>
              
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.message}>{message}</Text>

              <View style={styles.buttonsContainer}>
                {buttons.map((button, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.button,
                    index === 0 && styles.buttonPrimary,
                    button.style === 'destructive' && styles.buttonDestructive,
                    button.style === 'cancel' && styles.buttonCancel,
                    buttons.length > 1 && styles.buttonMulti,
                    button.style === 'cancel' && !button.text && styles.cancelIconWrapper,
                  ]}
                  onPress={() => handleButtonPress(button.onPress)}
                >
                  {button.icon && !button.text ? (
                    <Ionicons
                      name={button.icon}
                      size={button.iconSize || 20}
                      color={button.iconColor || colors.text}
                    />
                  ) : (
                    <Text
                      style={[
                        styles.buttonText,
                        index === 0 && styles.buttonTextPrimary,
                        button.style === 'destructive' && styles.buttonTextDestructive,
                        button.style === 'cancel' && styles.buttonTextCancel,
                      ]}
                    >
                      {button.text || ''}
                    </Text>
                  )}
                </TouchableOpacity>
                ))}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    width: '90%',
    maxWidth: 420,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h3,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  buttonsContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonMulti: {
    flex: 1,
  },
  buttonPrimary: {
    backgroundColor: colors.accent,
  },
  buttonDestructive: {
    backgroundColor: colors.error,
  },
  buttonCancel: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  buttonTextPrimary: {
    color: colors.surface,
  },
  buttonTextDestructive: {
    color: colors.surface,
  },
  buttonTextCancel: {
    color: colors.textSecondary,
  },
  cancelIconWrapper: {
    padding: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
});
