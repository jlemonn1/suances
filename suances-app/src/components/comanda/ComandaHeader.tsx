import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';
import type { ComandaDetalleRondas, ComandaEstado } from '../../types/sala';

interface ComandaHeaderProps {
  comanda: ComandaDetalleRondas;
  isOwnerOrManager: boolean;
  modoEdicion: boolean;
  itemsSeleccionados: string[];
  puedePedirCuenta: boolean;
  onFinalizar: () => void;
  onToggleEdicion: () => void;
  onCancelarEdicion: () => void;
  onEliminarSeleccionados: () => void;
  onCerrar: () => void;
}

const formatHora = (fechaStr: string): string => {
  const fecha = new Date(fechaStr);
  return fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
};

const getEstadoColor = (estado: ComandaEstado): string => {
  switch (estado) {
    case 'ABIERTA':
      return colors.warning;
    case 'EN_PREPARACION':
      return colors.primary;
    case 'SERVIDA':
      return colors.success;
    case 'CUENTA':
      return colors.accent;
    case 'COBRADA':
      return colors.success;
    case 'CANCELADA':
      return colors.error;
    default:
      return colors.textSecondary;
  }
};

export const ComandaHeader: React.FC<ComandaHeaderProps> = ({
  comanda,
  isOwnerOrManager,
  modoEdicion,
  itemsSeleccionados,
  puedePedirCuenta,
  onFinalizar,
  onToggleEdicion,
  onCancelarEdicion,
  onEliminarSeleccionados,
  onCerrar,
}) => {
  const totalPlatos = React.useMemo(() => {
    if (!comanda.rondas) return 0;
    return comanda.rondas.reduce((total, ronda) => {
      if (!ronda.pedidos) return total;
      return total + ronda.pedidos.reduce((sum, pedido) => sum + (pedido.cantidad || 0), 0);
    }, 0);
  }, [comanda.rondas]);

  const linea1 = React.useMemo(() => {
    const parts: string[] = [];
    if (comanda.nombreSala) parts.push(comanda.nombreSala);
    if (comanda.mesaNumero) parts.push(`Mesa ${comanda.mesaNumero}`);
    if (comanda.nombreClienteReserva) parts.push(`(${comanda.nombreClienteReserva})`);
    return parts.join(' - ');
  }, [comanda.nombreSala, comanda.mesaNumero, comanda.nombreClienteReserva]);

  if (modoEdicion) {
    return (
      <View style={styles.container}>
        <View style={styles.modoEdicionBar}>
          <View style={styles.modoEdicionInfo}>
            <Ionicons name="trash-outline" size={18} color={colors.error} />
            <Text style={styles.modoEdicionText}>
              {itemsSeleccionados.length} seleccionado{itemsSeleccionados.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <View style={styles.modoEdicionActions}>
            <TouchableOpacity style={styles.actionBtnSmall} onPress={onCancelarEdicion}>
              <Text style={styles.actionBtnText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionBtnSmall, styles.actionBtnDanger, itemsSeleccionados.length === 0 && styles.actionBtnDisabled]} 
              onPress={onEliminarSeleccionados}
              disabled={itemsSeleccionados.length === 0}
            >
              <Text style={styles.actionBtnTextDanger}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.mainRow}>
        {/* Columna izquierda: Info */}
        <View style={styles.infoCol}>
          <View style={styles.linea}>
            <Ionicons name="location-outline" size={12} color={colors.textSecondary} style={styles.icon} />
            <Text style={styles.linea1Text} numberOfLines={1}>
              {linea1 || `Mesa ${comanda.mesaNumero || '-'}`}
            </Text>
          </View>

          <View style={styles.linea}>
            <Ionicons name="person-outline" size={12} color={colors.textSecondary} style={styles.icon} />
            <Text style={styles.linea2Text} numberOfLines={1}>
              {comanda.camareroNombre || 'Sin camarero'} · {formatHora(comanda.fechaApertura)}
            </Text>
          </View>

          <View style={styles.statsRow}>
            <Text style={styles.statText}>{comanda.total?.toFixed(2)}€</Text>
            <Text style={styles.statDivider}>·</Text>
            <Text style={styles.statText}>Ronda {comanda.numeroRondaActual || 1}</Text>
            <Text style={styles.statDivider}>·</Text>
            <Text style={styles.statText}>{totalPlatos} platos</Text>
          </View>
        </View>

        {/* Columna derecha: Estado y Botones */}
        <View style={styles.actionsCol}>
          <View style={[styles.estadoBadge, { backgroundColor: getEstadoColor(comanda.estado) }]}>
            <Text style={styles.estadoText}>{comanda.estado}</Text>
          </View>
          
          <View style={styles.botonesCol}>
            {puedePedirCuenta && (
              <TouchableOpacity style={[styles.btn, styles.btnCuenta]} onPress={onFinalizar}>
                <Ionicons name="receipt-outline" size={16} color={colors.surface} />
                <Text style={styles.btnText}>Cuenta</Text>
              </TouchableOpacity>
            )}

            {isOwnerOrManager ? (
              <View style={styles.btnRow}>
                <TouchableOpacity style={[styles.btn, styles.btnEdit, styles.btnHalf]} onPress={onToggleEdicion}>
                  <Ionicons name="create-outline" size={16} color={colors.surface} />
                  <Text style={styles.btnText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, styles.btnCerrar, styles.btnHalf]} onPress={onCerrar}>
                  <Ionicons name="close-outline" size={16} color={colors.textSecondary} />
                  <Text style={styles.btnTextCerrar}>Cerrar</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={[styles.btn, styles.btnCerrar]} onPress={onCerrar}>
                <Ionicons name="close-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.btnTextCerrar}>Cerrar</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  mainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  // Columna izquierda: Info
  infoCol: {
    flex: 1,
    paddingRight: spacing.sm,
    justifyContent: 'center',
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
  },
  linea: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  icon: {
    marginRight: 4,
  },
  linea1Text: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
    fontSize: 14,
  },
  linea2Text: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 12,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  statText: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '600',
    fontSize: 13,
  },
  statDivider: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 13,
  },
  // Columna derecha: Estado y Botones
  actionsCol: {
    alignItems: 'flex-end',
  },
  estadoBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.accent,
    marginBottom: spacing.xs,
  },
  estadoText: {
    ...typography.caption,
    color: colors.surface,
    fontWeight: '600',
    fontSize: 10,
    textTransform: 'uppercase',
  },
  botonesCol: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  btnRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  btnHalf: {
    width: 68,
  },
  // Botones estándar
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: colors.accent,
    gap: 4,
    height: 32,
    width: 140,
  },
  btnCuenta: {
    backgroundColor: colors.primary,
  },
  btnEdit: {
    backgroundColor: colors.warning,
  },
  btnCerrar: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  btnText: {
    ...typography.caption,
    color: colors.surface,
    fontWeight: '600',
    fontSize: 13,
  },
  btnTextCerrar: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 13,
  },
  // Modo edición
  modoEdicionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modoEdicionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modoEdicionText: {
    ...typography.bodySmall,
    color: colors.error,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  modoEdicionActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionBtnSmall: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionBtnDanger: {
    backgroundColor: colors.error,
    borderColor: colors.error,
  },
  actionBtnDisabled: {
    opacity: 0.5,
  },
  actionBtnText: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '600',
  },
  actionBtnTextDanger: {
    ...typography.caption,
    color: colors.surface,
    fontWeight: '600',
  },
});
