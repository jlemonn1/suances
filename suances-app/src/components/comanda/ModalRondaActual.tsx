import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { useRondaPersistencia } from '../../hooks/useRondaPersistencia';
import { SelectorPlatosSimple } from './SelectorPlatosSimple';
import { useSalaStore } from '../../store/salaStore';
import type { PlatoRondaItem, TipoRonda } from '../../types/sala';
import type { PlatoOperativo } from '../../types/carta';

interface ModalRondaActualProps {
  visible: boolean;
  onClose: () => void;
  comandaId: string;
  numeroRonda: number;
  onRondaEnviada: () => void;
}

const TIPOS_RONDA: { tipo: TipoRonda; label: string }[] = [
  { tipo: 'ENTRANTE', label: 'Entrantes' },
  { tipo: 'PRIMERO', label: 'Primeros' },
  { tipo: 'SEGUNDO', label: 'Segundos' },
  { tipo: 'BEBIDA', label: 'Bebidas' },
  { tipo: 'POSTRE', label: 'Postres' },
  { tipo: 'SIN_ORDEN', label: 'Sin orden' },
];

// Generar UUID simple
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const ModalRondaActual: React.FC<ModalRondaActualProps> = ({
  visible,
  onClose,
  comandaId,
  numeroRonda,
  onRondaEnviada,
}) => {
  const [platos, setPlatos] = useState<PlatoRondaItem[]>([]);
  const [seleccionados, setSeleccionados] = useState<string[]>([]);
  const [showSelector, setShowSelector] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [cargandoInicial, setCargandoInicial] = useState(true);
  
  const { guardar, cargar, limpiar } = useRondaPersistencia();
  const { crearYEnviarACocina, crearNuevaRonda } = useSalaStore();
  const prevPlatosRef = useRef<string>('');

  // Cargar datos al abrir (solo una vez)
  useEffect(() => {
    if (visible && cargandoInicial) {
      cargar(comandaId).then((guardados) => {
        if (guardados) {
          setPlatos(guardados);
          prevPlatosRef.current = JSON.stringify(guardados);
        } else {
          setPlatos([]);
          prevPlatosRef.current = '[]';
        }
        setSeleccionados([]);
        setCargandoInicial(false);
      });
    }
    
    // Resetear flag cuando se cierra
    if (!visible) {
      setCargandoInicial(true);
    }
  }, [visible, comandaId, cargar, cargandoInicial]);

  // Guardar al cambiar (solo si no estamos cargando inicialmente)
  useEffect(() => {
    if (visible && !cargandoInicial && platos.length >= 0) {
      const platosString = JSON.stringify(platos);
      // Solo guardar si realmente cambió
      if (platosString !== prevPlatosRef.current) {
        guardar(comandaId, platos);
        prevPlatosRef.current = platosString;
      }
    }
  }, [platos, visible, comandaId, guardar, cargandoInicial]);

  const handleAgregarPlato = useCallback((plato: PlatoOperativo) => {
    const nuevoPlato: PlatoRondaItem = {
      id: generateUUID(),
      platoId: plato.platoId,
      nombrePlato: plato.nombre,
      cantidad: 1,
      precioUnitario: plato.precioVenta,
    };
    setPlatos((prev) => [...prev, nuevoPlato]);
    // No cerramos el selector, seguimos añadiendo
  }, []);

  const handleEliminarPlato = useCallback((id: string) => {
    setPlatos((prev) => prev.filter((p) => p.id !== id));
    setSeleccionados((prev) => prev.filter((sid) => sid !== id));
  }, []);

  const handleCambiarCantidad = useCallback((id: string, delta: number) => {
    setPlatos((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const nuevaCantidad = Math.max(1, p.cantidad + delta);
          return { ...p, cantidad: nuevaCantidad };
        }
        return p;
      })
    );
  }, []);

  const handleToggleSeleccion = useCallback((id: string) => {
    setSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  }, []);

  const handleSeleccionarTodos = useCallback(() => {
    if (seleccionados.length === platos.length) {
      setSeleccionados([]);
    } else {
      setSeleccionados(platos.map((p) => p.id));
    }
  }, [platos, seleccionados.length]);

  const handleAsignarTipo = useCallback((tipo: TipoRonda) => {
    if (seleccionados.length === 0) return;
    
    setPlatos((prev) =>
      prev.map((p) =>
        seleccionados.includes(p.id) ? { ...p, tipoRonda: tipo } : p
      )
    );
    setSeleccionados([]);
  }, [seleccionados]);

  const calcularTotal = useCallback(() => {
    return platos.reduce((sum, p) => sum + p.precioUnitario * p.cantidad, 0);
  }, [platos]);

  const handleCerrar = useCallback(() => {
    if (platos.length > 0) {
      guardar(comandaId, platos);
    }
    onClose();
  }, [platos, comandaId, guardar, onClose]);

  const handleMandarACocina = useCallback(async () => {
    if (platos.length === 0) {
      Alert.alert('Error', 'No hay platos para enviar');
      return;
    }

    Alert.alert(
      'Mandar a Cocina',
      `¿Enviar ${platos.length} platos de la Ronda ${numeroRonda}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Enviar',
          onPress: async () => {
            setEnviando(true);
            try {
              // 1. Preparar los items para enviar
              const itemsParaEnviar = platos.map(plato => ({
                platoId: plato.platoId,
                nombrePlato: plato.nombrePlato,
                cantidad: plato.cantidad,
                tipoRonda: plato.tipoRonda || 'SIN_ORDEN',
                numeroRonda: numeroRonda,
                notas: plato.notas,
              }));

              console.log('[ModalRondaActual] Enviando items a cocina:', itemsParaEnviar);
              
              // 2. Crear y enviar todos los items en una sola llamada
              await crearYEnviarACocina(comandaId, itemsParaEnviar);
              console.log('[ModalRondaActual] Items creados y enviados exitosamente');

              // 3. Crear nueva ronda
              await crearNuevaRonda(comandaId);

              // 4. Limpiar todo
              await limpiar(comandaId);
              setPlatos([]);
              setSeleccionados([]);

              // 5. Cerrar modal PRIMERO
              onClose();

              // 6. Esperar a que el modal se cierre y luego actualizar
              setTimeout(() => {
                // Notificar éxito después de cerrar el modal
                onRondaEnviada();
                
                // Mostrar alerta al final
                Alert.alert('Éxito', `Ronda ${numeroRonda} enviada a cocina`);
              }, 300);
            } catch (error: any) {
              console.error('[ModalRondaActual] Error enviando:', error);
              Alert.alert('Error', error?.message || 'No se pudo enviar a cocina');
            } finally {
              setEnviando(false);
            }
          },
        },
      ]
    );
  }, [platos, numeroRonda, comandaId, crearYEnviarACocina, crearNuevaRonda, limpiar, onRondaEnviada, onClose]);

  const renderPlato = ({ item }: { item: PlatoRondaItem }) => {
    const isSeleccionado = seleccionados.includes(item.id);
    const tipoLabel = item.tipoRonda
      ? TIPOS_RONDA.find((t) => t.tipo === item.tipoRonda)?.label || item.tipoRonda
      : null;

    return (
      <View style={styles.platoItem}>
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => handleToggleSeleccion(item.id)}
        >
          <Ionicons
            name={isSeleccionado ? 'checkbox' : 'square-outline'}
            size={22}
            color={isSeleccionado ? colors.accent : colors.textSecondary}
          />
        </TouchableOpacity>

        <View style={styles.platoInfo}>
          <Text style={styles.platoNombre}>
            {item.nombrePlato} x{item.cantidad}
          </Text>
          {tipoLabel && (
            <Text style={styles.platoTipo}>{tipoLabel}</Text>
          )}
        </View>

        <View style={styles.platoAcciones}>
          <TouchableOpacity
            style={styles.botonCantidad}
            onPress={() => handleCambiarCantidad(item.id, -1)}
          >
            <Text style={styles.textoBotonCantidad}>-</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botonCantidad}
            onPress={() => handleCambiarCantidad(item.id, 1)}
          >
            <Text style={styles.textoBotonCantidad}>+</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botonEliminar}
            onPress={() => handleEliminarPlato(item.id)}
          >
            <Text style={styles.textoEliminar}>×</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={handleCerrar}
    >
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCerrar} style={styles.headerButton}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Ronda {numeroRonda}</Text>
            <Text style={styles.headerSubtitle}>
              {platos.length} {platos.length === 1 ? 'plato' : 'platos'}
            </Text>
          </View>
          {platos.length > 0 && (
            <TouchableOpacity onPress={handleSeleccionarTodos} style={styles.headerButton}>
              <Text style={styles.seleccionarTodosTexto}>
                {seleccionados.length === platos.length ? 'Ninguno' : 'Todos'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Lista de platos */}
        {platos.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="restaurant-outline" size={48} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No hay platos añadidos</Text>
            <Text style={styles.emptySubtext}>
              Usa el botón de abajo para añadir platos
            </Text>
          </View>
        ) : (
          <FlatList
            data={platos}
            renderItem={renderPlato}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Botones de tipo (solo si hay seleccionados) */}
        {seleccionados.length > 0 && (
          <View style={styles.tiposContainer}>
            <Text style={styles.tiposLabel}>Marcar seleccionados como:</Text>
            <View style={styles.tiposRow}>
              {TIPOS_RONDA.map((tipo) => (
                <TouchableOpacity
                  key={tipo.tipo}
                  style={styles.botonTipo}
                  onPress={() => handleAsignarTipo(tipo.tipo)}
                >
                  <Text style={styles.textoTipo}>{tipo.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Botón añadir platos */}
        <TouchableOpacity
          style={styles.botonAnadir}
          onPress={() => setShowSelector(true)}
        >
          <Ionicons name="add-circle-outline" size={20} color={colors.accent} />
          <Text style={styles.textoAnadir}>Añadir más platos</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total estimado:</Text>
            <Text style={styles.totalValor}>{calcularTotal().toFixed(2)} €</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.botonEnviar,
              (platos.length === 0 || enviando) && styles.botonEnviarDisabled,
            ]}
            onPress={handleMandarACocina}
            disabled={platos.length === 0 || enviando}
          >
            <Text style={styles.textoEnviar}>
              {enviando ? 'Enviando...' : `Mandar a Cocina (${platos.length})`}
            </Text>
            <Ionicons name="arrow-forward" size={20} color={colors.surface} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Selector de platos */}
      <SelectorPlatosSimple
        visible={showSelector}
        onClose={() => setShowSelector(false)}
        onSeleccionarPlato={handleAgregarPlato}
        platosEnRonda={platos.length}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerButton: {
    padding: spacing.xs,
  },
  headerContent: {
    flex: 1,
    marginHorizontal: spacing.md,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text,
    fontSize: 18,
  },
  headerSubtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  seleccionarTodosTexto: {
    ...typography.bodySmall,
    color: colors.accent,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  emptySubtext: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  platoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  checkbox: {
    marginRight: spacing.sm,
    padding: spacing.xs,
  },
  platoInfo: {
    flex: 1,
  },
  platoNombre: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
  },
  platoTipo: {
    ...typography.caption,
    color: colors.accent,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
  platoAcciones: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  botonCantidad: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 36,
    alignItems: 'center',
  },
  textoBotonCantidad: {
    ...typography.body,
    fontSize: 18,
    fontWeight: '600',
    color: colors.accent,
  },
  botonEliminar: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginLeft: spacing.sm,
  },
  textoEliminar: {
    ...typography.body,
    fontSize: 24,
    fontWeight: '600',
    color: colors.error,
  },
  tiposContainer: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  tiposLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  tiposRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  botonTipo: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textoTipo: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '500',
  },
  botonAnadir: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  textoAnadir: {
    ...typography.body,
    color: colors.accent,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  footer: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  totalLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  totalValor: {
    ...typography.h3,
    color: colors.text,
    fontWeight: '700',
  },
  botonEnviar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  botonEnviarDisabled: {
    backgroundColor: colors.textSecondary,
    opacity: 0.5,
  },
  textoEnviar: {
    ...typography.body,
    color: colors.surface,
    fontWeight: '600',
    fontSize: 16,
  },
});
