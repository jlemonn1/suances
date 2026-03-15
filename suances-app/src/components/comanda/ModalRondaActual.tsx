import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Animated,
  StatusBar,
  Vibration,
  TextInput,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { useRondaPersistencia } from '../../hooks/useRondaPersistencia';
import { SelectorPlatosSimple } from './SelectorPlatosSimple';
import { CustomAlert } from '../common';
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

type AlertButtonConfig = {
  text?: string;
  icon?: string;
  iconColor?: string;
  iconSize?: number;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
};

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
  const insets = useSafeAreaInsets();
  
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    buttons: AlertButtonConfig[];
  }>({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    buttons: [{ text: 'OK' }],
  });

  // Estado para edición de notas temporales
  const [notaEditando, setNotaEditando] = useState<{id: string; nota: string} | null>(null);
  const [inputNota, setInputNota] = useState('');
   
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

  // Función para quitar una unidad de un plato (usada en long press)
  const handleQuitarUnPlato = useCallback((platoId: string) => {
    setPlatos((prevPlatos) => {
      // Encontrar el último plato con ese platoId
      let lastIndex = -1;
      for (let i = prevPlatos.length - 1; i >= 0; i--) {
        if (prevPlatos[i].platoId === platoId) {
          lastIndex = i;
          break;
        }
      }
      
      if (lastIndex === -1) return prevPlatos;
      
      const plato = prevPlatos[lastIndex];
      let newPlatos;
      
      if (plato.cantidad > 1) {
        // Reducir cantidad en 1
        newPlatos = prevPlatos.map((p, idx) => 
          idx === lastIndex ? { ...p, cantidad: p.cantidad - 1 } : p
        );
      } else {
        // Eliminar el plato completamente
        newPlatos = prevPlatos.filter((_, idx) => idx !== lastIndex);
      }
      
      // Actualizar referencia inmediatamente
      prevPlatosRef.current = JSON.stringify(newPlatos);
      
      return newPlatos;
    });
    
    // Actualizar seleccionados en el siguiente ciclo
    setTimeout(() => {
      setSeleccionados((prev) => {
        const currentPlatos = platos;
        const platoIds = new Set(currentPlatos.map(p => p.id));
        return prev.filter(id => platoIds.has(id));
      });
    }, 0);
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

  // Ordenar platos: sin marca primero, luego en orden fijo: entrantes, primeros, segundos, postres, bebidas
  const platosOrdenados = useMemo(() => {
    // Orden fijo de tipos
    const ordenTipos = ['ENTRANTE', 'PRIMERO', 'SEGUNDO', 'POSTRE', 'BEBIDA', 'SIN_ORDEN'];
    
    // Separar platos con y sin tipo
    const sinTipo = platos.filter(p => !p.tipoRonda || p.tipoRonda === 'SIN_ORDEN');
    const conTipo = platos.filter(p => p.tipoRonda && p.tipoRonda !== 'SIN_ORDEN');
    
    // Agrupar los que tienen tipo
    const grupos: Record<string, PlatoRondaItem[]> = {};
    conTipo.forEach(plato => {
      const tipo = plato.tipoRonda!;
      if (!grupos[tipo]) {
        grupos[tipo] = [];
      }
      grupos[tipo].push(plato);
    });
    
    // Concatenar: sin tipo primero + cada grupo de tipo en orden fijo
    const resultado = [...sinTipo];
    ordenTipos.forEach(tipo => {
      if (grupos[tipo]) {
        resultado.push(...grupos[tipo]);
      }
    });
    
    return resultado;
  }, [platos]);

  // Componente botón añadir platos con animación de pulso en el texto
  const BotonAnadirPlatos: React.FC = () => {
    const textScale = useRef(new Animated.Value(1)).current;
    
    useEffect(() => {
      if (!showSelector) {
        // Animación de pulso solo en el texto
        const pulseAnimation = Animated.loop(
          Animated.sequence([
            Animated.timing(textScale, {
              toValue: 1.15,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(textScale, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
          ])
        );
        pulseAnimation.start();
        return () => pulseAnimation.stop();
      } else {
        // Reset cuando está en modo "volver"
        textScale.setValue(1);
      }
    }, [showSelector, textScale]);

    return (
      <TouchableOpacity
        style={[
          styles.botonAnadir,
          showSelector && styles.botonAnadirVolver
        ]}
        onPress={() => setShowSelector(!showSelector)}
        activeOpacity={0.7}
      >
        <Ionicons 
          name={showSelector ? "create-outline" : "add-circle"} 
          size={20} 
          color={showSelector ? colors.text : colors.surface} 
        />
        <Animated.Text style={[
          styles.textoAnadir,
          showSelector && styles.textoAnadirVolver,
          { transform: [{ scale: textScale }] }
        ]}>
          {showSelector ? 'Volver a ronda' : 'Añadir más platos'}
        </Animated.Text>
      </TouchableOpacity>
    );
  };

  const showAlert = useCallback((
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info',
    buttons: AlertButtonConfig[] = [{ text: 'OK' }]
  ) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      type,
      buttons,
    });
  }, []);

  const hideAlert = useCallback(() => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
  }, []);

  const procesarEnvio = useCallback(async () => {
    if (platos.length === 0) {
      showAlert('Error', 'No hay platos para enviar', 'error');
      return;
    }

    setEnviando(true);
    try {
      const itemsParaEnviar = platos.map(plato => ({
        platoId: plato.platoId,
        nombrePlato: plato.nombrePlato,
        cantidad: plato.cantidad,
        tipoRonda: plato.tipoRonda || 'SIN_ORDEN',
        numeroRonda: numeroRonda,
        notas: plato.notas,
      }));

      console.log('[ModalRondaActual] Enviando items a cocina:', itemsParaEnviar);
      await crearYEnviarACocina(comandaId, itemsParaEnviar);

      await crearNuevaRonda(comandaId);

      await limpiar(comandaId);
      setPlatos([]);
      setSeleccionados([]);

      onClose();

      setTimeout(() => {
        onRondaEnviada();
        showAlert('Éxito', `Ronda ${numeroRonda} enviada a cocina`, 'success');
      }, 300);
    } catch (error: any) {
      console.error('[ModalRondaActual] Error enviando:', error);
      showAlert('Error', error?.message || 'No se pudo enviar a cocina', 'error');
    } finally {
      setEnviando(false);
    }
  }, [platos, numeroRonda, comandaId, crearYEnviarACocina, crearNuevaRonda, limpiar, onRondaEnviada, onClose, showAlert]);

  const handleMandarACocina = useCallback(() => {
    showAlert(
      'Mandar a Cocina',
      `¿Enviar ${platos.length} platos de la Ronda ${numeroRonda}?`,
      'info',
      [
        {
          text: 'Enviar',
          style: 'default',
          onPress: procesarEnvio,
        },
        {
          icon: 'close',
          iconColor: colors.textSecondary,
          iconSize: 22,
          style: 'cancel',
        },
      ]
    );
  }, [platos.length, numeroRonda, showAlert, procesarEnvio]);

  // Componente botón enviar a cocina con animación
  const BotonCocina: React.FC = () => {
    const shimmerValue = useRef(new Animated.Value(0)).current;
    const longPressActive = useRef(false);

    useEffect(() => {
      const shimmerAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerValue, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.delay(1000),
        ])
      );
      shimmerAnimation.start();
      return () => shimmerAnimation.stop();
    }, [shimmerValue]);

    const shimmerTranslate = shimmerValue.interpolate({
      inputRange: [0, 1],
      outputRange: [-50, 120],
    });

    // Si está abierto el selector, mostrar botón de volver
    if (showSelector) {
      return (
        <TouchableOpacity
          style={styles.botonVolverHeader}
          onPress={() => setShowSelector(false)}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color={colors.surface} />
          <Text style={styles.textoVolverHeader}>Volver</Text>
          <Animated.View style={[styles.shimmer, { transform: [{ translateX: shimmerTranslate }] }]} />
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        style={[
          styles.botonEnviarHeader,
          (platos.length === 0 || enviando) && styles.botonEnviarHeaderDisabled,
        ]}
        onPress={() => {
          if (longPressActive.current) {
            longPressActive.current = false;
            return;
          }
          handleMandarACocina();
        }}
        delayLongPress={700}
        onLongPress={() => {
          Vibration.vibrate(80);
          longPressActive.current = true;
          procesarEnvio();
          setTimeout(() => {
            longPressActive.current = false;
          }, 500);
        }}
        disabled={platos.length === 0 || enviando}
        activeOpacity={0.8}
      >
        <Text style={styles.textoEnviarHeader}>
          {enviando ? 'Enviando...' : 'Enviar'}
        </Text>
        <Ionicons name="send" size={20} color={colors.surface} />
        <Animated.View style={[styles.shimmer, { transform: [{ translateX: shimmerTranslate }] }]} />
      </TouchableOpacity>
    );
  };

  const handleCerrar = useCallback(() => {
    if (platos.length > 0) {
      guardar(comandaId, platos);
    }
    onClose();
  }, [platos, comandaId, guardar, onClose]);



  // Función para añadir/editar nota temporal
  const handleAgregarNota = useCallback((platoId: string, nota: string) => {
    setPlatos((prev) =>
      prev.map((p) =>
        p.id === platoId ? { ...p, notas: nota } : p
      )
    );
    // Guardar inmediatamente para persistir la nota
    const platosActualizados = platos.map((p) =>
      p.id === platoId ? { ...p, notas: nota } : p
    );
    guardar(comandaId, platosActualizados);
  }, [platos, comandaId, guardar]);

  // Mostrar input de nota
  const mostrarInputNota = useCallback((item: PlatoRondaItem) => {
    setNotaEditando({ id: item.id, nota: item.notas || '' });
    setInputNota(item.notas || '');
  }, []);

  // Guardar nota desde el input
  const guardarNota = useCallback(() => {
    if (notaEditando) {
      handleAgregarNota(notaEditando.id, inputNota);
      setNotaEditando(null);
      setInputNota('');
    }
  }, [notaEditando, inputNota, handleAgregarNota]);

  // Función para mostrar alertas personalizadas
  const renderPlato = ({ item }: { item: PlatoRondaItem }) => {
    const isSeleccionado = seleccionados.includes(item.id);
    const tipoLabel = item.tipoRonda
      ? TIPOS_RONDA.find((t) => t.tipo === item.tipoRonda)?.label || item.tipoRonda
      : null;

    return (
      <TouchableOpacity 
        style={[styles.platoItem, isSeleccionado && styles.platoItemSeleccionado]}
        onPress={() => handleToggleSeleccion(item.id)}
        onLongPress={() => mostrarInputNota(item)}
        delayLongPress={600}
        activeOpacity={0.7}
      >
        <View style={styles.checkbox} pointerEvents="none">
          <Ionicons
            name={isSeleccionado ? 'checkbox' : 'square-outline'}
            size={22}
            color={isSeleccionado ? colors.accent : colors.textSecondary}
          />
        </View>

        <View style={styles.platoInfo}>
          <Text style={styles.platoNombre}>
            {item.nombrePlato} x{item.cantidad}
          </Text>
          {tipoLabel && (
            <Text style={styles.platoTipo}>{tipoLabel}</Text>
          )}
          {item.notas && (
            <Text style={styles.platoNota}>📝 {item.notas}</Text>
          )}
        </View>

        <View style={styles.platoAcciones}>
          <TouchableOpacity
            style={styles.botonCantidad}
            onPress={(e) => {
              e.stopPropagation();
              handleCambiarCantidad(item.id, -1);
            }}
          >
            <Text style={styles.textoBotonCantidad}>-</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botonCantidad}
            onPress={(e) => {
              e.stopPropagation();
              handleCambiarCantidad(item.id, 1);
            }}
          >
            <Text style={styles.textoBotonCantidad}>+</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botonEliminar}
            onPress={(e) => {
              e.stopPropagation();
              handleEliminarPlato(item.id);
            }}
          >
            <Text style={styles.textoEliminar}>×</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={handleCerrar}
      presentationStyle="fullScreen"
      statusBarTranslucent
    >
      <View style={[styles.modalContainer, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
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
          {platos.length > 0 ? (
            <BotonCocina />
          ) : (
            <View style={styles.headerButton} />
          )}
        </View>

        {/* Botón seleccionar todos */}
        {platos.length > 0 && (
          <View style={styles.seleccionarTodosContainer}>
            <Text style={styles.seleccionarTodosText}>
              {seleccionados.length} de {platos.length} seleccionados
            </Text>
            <TouchableOpacity 
              style={styles.seleccionarTodosButton}
              onPress={handleSeleccionarTodos}
            >
              <Text style={styles.seleccionarTodosButtonText}>
                {seleccionados.length === platos.length ? 'Ninguno' : 'Todos'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Contenido: Selector de platos o Lista de platos */}
        {showSelector ? (
          <View style={styles.selectorContainer}>
          <SelectorPlatosSimple
            visible={showSelector}
            onClose={() => setShowSelector(false)}
            onSeleccionarPlato={handleAgregarPlato}
            onQuitarPlato={handleQuitarUnPlato}
            platosEnRonda={platos}
          />
          </View>
        ) : platos.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="restaurant-outline" size={48} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No hay platos añadidos</Text>
            <Text style={styles.emptySubtext}>
              Usa el botón de abajo para añadir platos
            </Text>
          </View>
        ) : (
          <FlatList
            data={platosOrdenados}
            renderItem={renderPlato}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Botones de tipo - Grid 3x2 (solo si hay seleccionados) */}
        {seleccionados.length > 0 ? (
          <View style={styles.tiposContainer}>
            <Text style={styles.tiposLabel}>Marcar seleccionados como:</Text>
            <View style={styles.tiposGrid}>
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
        ) : (
          <View style={styles.ayudaContainer}>
            <Ionicons name="information-circle-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.ayudaTexto}>Selecciona platos para marcar</Text>
          </View>
        )}

        {/* Botón toggle añadir/volver platos con animación */}
        <BotonAnadirPlatos />

        {/* Modal para editar nota */}
        {notaEditando && (
          <View style={styles.notaModalOverlay}>
            <View style={styles.notaModal}>
              <Text style={styles.notaModalTitle}>Añadir nota al plato</Text>
              <Text style={styles.notaModalSubtitle}>Esta nota aparecerá en el ticket de cocina</Text>
              
              <TextInput
                style={styles.notaInput}
                value={inputNota}
                onChangeText={setInputNota}
                placeholder="Ej: Sin cebolla, poco hecho..."
                placeholderTextColor={colors.textSecondary}
                multiline
                maxLength={100}
                autoFocus
              />
              
              <Text style={styles.notaContador}>{inputNota.length}/100</Text>
              
              <View style={styles.notaModalBotones}>
                <TouchableOpacity
                  style={[styles.notaBoton, styles.notaBotonCancelar]}
                  onPress={() => {
                    setNotaEditando(null);
                    setInputNota('');
                  }}
                >
                  <Text style={styles.notaBotonTextoCancelar}>Cancelar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.notaBoton, styles.notaBotonGuardar]}
                  onPress={guardarNota}
                >
                  <Text style={styles.notaBotonTextoGuardar}>Guardar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Alerta personalizada */}
        <CustomAlert
          visible={alertConfig.visible}
          title={alertConfig.title}
          message={alertConfig.message}
          type={alertConfig.type}
          buttons={alertConfig.buttons}
          onDismiss={hideAlert}
        />

      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
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
  botonEnviarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
    overflow: 'hidden',
    position: 'relative',
    minWidth: 100,
  },
  botonEnviarHeaderDisabled: {
    backgroundColor: colors.textSecondary,
    opacity: 0.5,
  },
  textoEnviarHeader: {
    ...typography.body,
    color: colors.surface,
    fontWeight: '700',
    fontSize: 16,
  },
  botonVolverHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
    overflow: 'hidden',
    position: 'relative',
    minWidth: 100,
  },
  textoVolverHeader: {
    ...typography.body,
    color: colors.surface,
    fontWeight: '700',
    fontSize: 16,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    transform: [{ skewX: '-20deg' }],
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
  platoItemSeleccionado: {
    backgroundColor: colors.accent + '15', // 15 es ~8% de opacidad en hex
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
  seleccionarTodosContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  seleccionarTodosText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  seleccionarTodosButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  seleccionarTodosButtonText: {
    ...typography.bodySmall,
    color: colors.accent,
    fontWeight: '600',
  },
  ayudaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  ayudaTexto: {
    ...typography.bodySmall,
    color: colors.textSecondary,
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
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  tiposGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  botonTipo: {
    width: '30%',
    paddingVertical: spacing.md,
    backgroundColor: colors.accent,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoTipo: {
    ...typography.bodySmall,
    color: colors.surface,
    fontWeight: '600',
  },
  botonAnadir: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: colors.accent,
    marginTop: spacing.xs,
    borderRadius: 0,
    gap: spacing.xs,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  botonAnadirVolver: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.1,
  },
  textoAnadir: {
    ...typography.body,
    color: colors.surface,
    fontWeight: '700',
    fontSize: 16,
    marginLeft: spacing.sm,
  },
  textoAnadirVolver: {
    color: colors.text,
  },
  selectorContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  platoNota: {
    ...typography.caption,
    color: colors.warning,
    marginTop: 2,
    fontStyle: 'italic',
  },
  // Estilos para modal de notas
  notaModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  notaModal: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: '85%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  notaModalTitle: {
    ...typography.h3,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  notaModalSubtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  notaInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.background,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  notaContador: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'right',
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  notaModalBotones: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  notaBoton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  notaBotonCancelar: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  notaBotonGuardar: {
    backgroundColor: colors.accent,
  },
  notaBotonTextoCancelar: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  notaBotonTextoGuardar: {
    ...typography.body,
    color: colors.surface,
    fontWeight: '600',
  },
});
