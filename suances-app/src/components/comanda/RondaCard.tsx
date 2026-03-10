import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';
import type { Ronda, Pedido } from '../../types/sala';

interface RondaCardProps {
  ronda: Ronda;
  modoEdicion?: boolean;
  itemsSeleccionados?: string[];
  onSeleccionarItem?: (itemId: string) => void;
}

const formatHora = (fechaStr?: string): string => {
  if (!fechaStr) return '';
  const fecha = new Date(fechaStr);
  return fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
};

const getEstadoLabel = (estado: string): string => {
  switch (estado) {
    case 'PENDIENTE':
      return 'Pendiente';
    case 'EN_COCINA':
      return 'En cocina';
    case 'LISTO':
      return 'Listo';
    case 'SERVIDO':
      return 'Servido';
    case 'CANCELADO':
      return 'Cancelado';
    default:
      return estado;
  }
};

// Orden visual de tipos de ronda
const TIPO_RONDA_ORDEN: Record<string, number> = {
  'ENTRANTE': 1,
  'BEBIDA': 2,
  'PRIMERO': 3,
  'SEGUNDO': 4,
  'POSTRE': 5,
  'SIN_ORDEN': 99,
};

export const RondaCard: React.FC<RondaCardProps> = ({ 
  ronda, 
  modoEdicion = false,
  itemsSeleccionados = [],
  onSeleccionarItem,
}) => {
  // Protección contra datos inválidos
  if (!ronda) {
    console.warn('[RondaCard] Ronda es null o undefined');
    return null;
  }
  
  const enviada = !!ronda.horaEnvio;
  const pedidos = ronda.pedidos || [];

  // Agrupar pedidos por tipoRonda
  const pedidosAgrupados = React.useMemo(() => {
    const grupos: Record<string, Pedido[]> = {};
    
    pedidos.forEach(pedido => {
      const tipo = pedido.tipoRonda || 'SIN_ORDEN';
      if (!grupos[tipo]) {
        grupos[tipo] = [];
      }
      grupos[tipo].push(pedido);
    });
    
    // Ordenar según TIPO_RONDA_ORDEN
    return Object.entries(grupos)
      .sort(([tipoA], [tipoB]) => {
        const ordenA = TIPO_RONDA_ORDEN[tipoA] || 99;
        const ordenB = TIPO_RONDA_ORDEN[tipoB] || 99;
        return ordenA - ordenB;
      });
  }, [pedidos]);

  const renderPedido = (item: Pedido) => {
    // Protección contra pedidos inválidos
    if (!item || !item.id) {
      console.warn('[RondaCard] Pedido inválido:', item);
      return null;
    }
    
    const enviado = item.estado !== 'PENDIENTE';
    const esSeleccionable = modoEdicion && item.estado !== 'SERVIDO' && item.estado !== 'CANCELADO';
    const estaSeleccionado = itemsSeleccionados.includes(item.id);

    if (modoEdicion) {
      return (
        <TouchableOpacity
          key={item.id}
          style={[
            styles.itemRowEdicion,
            estaSeleccionado && styles.itemRowSeleccionado,
            !esSeleccionable && styles.itemRowNoSeleccionable,
          ]}
          onPress={() => esSeleccionable && onSeleccionarItem?.(item.id)}
          disabled={!esSeleccionable}
        >
          <View style={styles.checkbox}>
            {estaSeleccionado && (
              <Ionicons name="checkmark" size={16} color={colors.surface} />
            )}
          </View>
          <View style={styles.itemInfo}>
            <Text style={[styles.itemText, !esSeleccionable && styles.itemNoSeleccionable]}>
              {item.nombrePlato || 'Plato sin nombre'} x{item.cantidad || 0}
            </Text>
            {enviada && (
              <Text style={styles.itemEstado}> {getEstadoLabel(item.estado)}</Text>
            )}
          </View>
          {!esSeleccionable && item.estado === 'SERVIDO' && (
            <Ionicons name="lock-closed" size={14} color={colors.textSecondary} />
          )}
        </TouchableOpacity>
      );
    }

    return (
      <View key={item.id} style={styles.itemRow}>
        <Text style={[styles.itemText, enviado && styles.itemEnviado]}>
          - {item.nombrePlato || 'Plato sin nombre'} x{item.cantidad || 0}
        </Text>
        {enviada && (
          <Text style={styles.itemEstado}> [{getEstadoLabel(item.estado)}]</Text>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header de la ronda */}
      <Text style={styles.rondaTitulo}>
        Ronda {ronda.numeroRonda || '?'}
        {enviada && ronda.horaEnvio && (
          <Text style={styles.horaEnvio}> enviado a cocina {formatHora(ronda.horaEnvio)}</Text>
        )}
      </Text>

      {/* Lista de pedidos agrupados por tipo */}
      {pedidosAgrupados.map(([tipo, itemsTipo]) => {
        // Protección contra grupos inválidos
        if (!itemsTipo || !Array.isArray(itemsTipo)) {
          console.warn('[RondaCard] Grupo de pedidos inválido:', tipo, itemsTipo);
          return null;
        }
        
        return (
          <View key={tipo} style={styles.grupo}>
            <Text style={styles.tipoTitulo}>{tipo}:</Text>
            {itemsTipo.map(item => renderPedido(item))}
          </View>
        );
      })}

      {/* Separador al final */}
      <Text style={styles.separador}>---</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  rondaTitulo: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text,
    fontSize: 16,
    marginBottom: spacing.sm,
  },
  horaEnvio: {
    fontWeight: '400',
    color: colors.textSecondary,
  },
  grupo: {
    marginBottom: spacing.sm,
  },
  tipoTitulo: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
    textTransform: 'capitalize',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingLeft: spacing.sm,
  },
  itemText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  itemEnviado: {
    color: colors.textSecondary,
  },
  itemEstado: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  separador: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  // Modo edición styles
  itemRowEdicion: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background,
    marginBottom: spacing.xs,
  },
  itemRowSeleccionado: {
    backgroundColor: colors.errorLight,
  },
  itemRowNoSeleccionable: {
    opacity: 0.6,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  itemInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemNoSeleccionable: {
    color: colors.textSecondary,
  },
});
