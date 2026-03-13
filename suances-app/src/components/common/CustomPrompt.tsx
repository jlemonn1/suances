import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../../theme';

type PromptType = 'info' | 'warning' | 'error';

interface CustomPromptProps {
  visible: boolean;
  title: string;
  message: string;
  type?: PromptType;
  placeholder?: string;
  cancelText?: string;
  confirmText?: string;
  confirmStyle?: 'default' | 'destructive';
  onCancel?: () => void;
  onConfirm: (text: string) => void;
}

const getIconAndColor = (type: PromptType) => {
  switch (type) {
    case 'warning':
      return { icon: 'warning' as const, color: colors.warning };
    case 'error':
      return { icon: 'close-circle' as const, color: colors.error };
    default:
      return { icon: 'help-circle' as const, color: colors.accent };
  }
};

export const CustomPrompt: React.FC<CustomPromptProps> = ({
  visible,
  title,
  message,
  type = 'info',
  placeholder = 'Escribe aquí...',
  cancelText = 'Cancelar',
  confirmText = 'Aceptar',
  confirmStyle = 'default',
  onCancel,
  onConfirm,
}) => {
  const [text, setText] = useState('');
  const { icon, color } = getIconAndColor(type);

  const handleConfirm = () => {
    onConfirm(text);
    setText('');
  };

  const handleCancel = () => {
    onCancel?.();
    setText('');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <TouchableWithoutFeedback onPress={handleCancel}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.container}>
              <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
                <Ionicons name={icon} size={48} color={color} />
              </View>
              
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.message}>{message}</Text>

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={text}
                  onChangeText={setText}
                  placeholder={placeholder}
                  placeholderTextColor={colors.textSecondary}
                  autoFocus
                />
              </View>

              <View style={styles.buttonsContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.buttonCancel]}
                  onPress={handleCancel}
                >
                  <Text style={styles.buttonTextCancel}>{cancelText}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.buttonConfirm,
                    confirmStyle === 'destructive' && styles.buttonDestructive,
                  ]}
                  onPress={handleConfirm}
                >
                  <Text
                    style={[
                      styles.buttonTextConfirm,
                      confirmStyle === 'destructive' && styles.buttonTextDestructive,
                    ]}
                  >
                    {confirmText}
                  </Text>
                </TouchableOpacity>
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
    width: '100%',
    maxWidth: 340,
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
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  inputContainer: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  input: {
    ...typography.body,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
  },
  buttonsContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: spacing.md,
  },
  button: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonCancel: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonConfirm: {
    backgroundColor: colors.accent,
  },
  buttonDestructive: {
    backgroundColor: colors.error,
  },
  buttonTextCancel: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  buttonTextConfirm: {
    ...typography.body,
    fontWeight: '600',
    color: colors.surface,
  },
  buttonTextDestructive: {
    color: colors.surface,
  },
});
