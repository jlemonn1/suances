import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Dimensions,
  Vibration,
  Modal,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { salaService } from '../../services/salaService';
import { useCartaSSE } from '../../hooks/useCartaSSE';
import type { PlatoOperativo } from '../../types/carta';
import type { PlatoRondaItem } from '../../types/sala';
import { CustomAlert } from '../common/CustomAlert';

interface SelectorPlatosSimpleProps {
  visible: boolean;
  onClose: () => void;
  onSeleccionarPlato: (plato: PlatoOperativo) => void;
  onQuitarPlato?: (platoId: string) => void;
  platosEnRonda: PlatoRondaItem[];
}

// Hook personalizado para manejar el long press
const useLongPress = (
  onLongPress: () => void,
  onLongLongPress: () => void,
  shortDuration: number = 800,
  longDuration: number = 1700
) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const longTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isPressing, setIsPressing] = useState(false);
  const [isLongPhase, setIsLongPhase] = useState(false);
  const actionTaken = useRef(false);

  const startPress = useCallback(() => {
    actionTaken.current = false;
    setIsPressing(true);
    setIsLongPhase(false);
    
    // Timer para short press (quita 1)
    timerRef.current = setTimeout(() => {
      if (!actionTaken.current) {
        onLongPress();
        actionTaken.current = true;
        setIsLongPhase(true);
        
        // Timer para long press (quita todo)
        longTimerRef.current = setTimeout(() => {
          onLongLongPress();
          setIsPressing(false);
        }, longDuration - shortDuration);
      }
    }, shortDuration);
  }, [onLongPress, onLongLongPress, shortDuration, longDuration]);

  const endPress = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (longTimerRef.current) {
      clearTimeout(longTimerRef.current);
      longTimerRef.current = null;
    }
    
    const hadAction = actionTaken.current;
    setIsPressing(false);
    setIsLongPhase(false);
    
    return !hadAction; // Retorna true si no hubo acción (para permitir onPress)
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (longTimerRef.current) clearTimeout(longTimerRef.current);
    };
  }, []);

  return { startPress, endPress, isPressing, isLongPhase, actionTaken };
};

interface CategoriaConPlatos {
  categoriaId: string;
  categoriaNombre: string;
  platos: PlatoOperativo[];
}

const { width } = Dimensions.get('window');
const isTablet = width > 768;
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export const SelectorPlatosSimple: React.FC<SelectorPlatosSimpleProps> = ({
  visible,
  onClose,
  onSeleccionarPlato,
  onQuitarPlato,
  platosEnRonda,
}) => {
  const [platos, setPlatos] = useState<PlatoOperativo[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [pressingId, setPressingId] = useState<string | null>(null);
  const [longPhaseId, setLongPhaseId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [platoSeleccionado, setPlatoSeleccionado] = useState<PlatoOperativo | null>(null);
  const [platoPendienteStockBajo, setPlatoPendienteStockBajo] = useState<PlatoOperativo | null>(null);
  const [alertVisible, setAlertVisible] = useState(false);

  // Animación para el borde rojo
  const animacionBorde = useRef(new Animated.Value(0)).current;

  // Iniciar animación de borde
  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animacionBorde, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(animacionBorde, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [animacionBorde]);

  // Estilo de borde animado para stock bajo
  const bordeStockBajo: any = {
    borderColor: animacionBorde.interpolate({
      inputRange: [0, 1],
      outputRange: [colors.stockLow, '#d6b9fa'],
    }),
    borderWidth: 2,
  };

  // Callback para actualizar platos cuando llega evento SSE
  const handlePlatoStockChanged = useCallback(() => {
    console.log('[SelectorPlatosSimple] Evento stock cambiado, recargando platos...');
    cargarPlatos();
  }, []);

  // Iniciar SSE para escuchar eventos de stock
  useCartaSSE({
    enabled: true,
    onPlatoChanged: handlePlatoStockChanged,
  });

  useEffect(() => {
    if (visible) {
      cargarPlatos();
    } else {
      setPressingId(null);
      setLongPhaseId(null);
    }
  }, [visible]);

  const cargarPlatos = async () => {
    setLoading(true);
    try {
      console.log('[SelectorPlatosSimple] === CARGANDO PLATOS ===');
      const platosOperativos = await salaService.getPlatosOperativos();
      const filteredPlatos = platosOperativos.filter((p) => p.disponible);
      
      // Log para ver cuáles tienen stock bajo
      const platosConStockBajo = filteredPlatos.filter(p => p.stockBajo);
      console.log('[SelectorPlatosSimple] Total platos:', filteredPlatos.length);
      console.log('[SelectorPlatosSimple] Platos con stock bajo:', platosConStockBajo.map(p => ({ nombre: p.nombre, stockBajo: p.stockBajo, ingredientesBajos: p.ingredientesBajos })));
      
      setPlatos(filteredPlatos);
      console.log('[SelectorPlatosSimple] === FIN CARGA PLATOS ===');
    } catch (error) {
      console.error('[SelectorPlatosSimple] Error cargando platos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calcular cantidad de cada plato en la ronda
  const cantidadesEnRonda = useMemo(() => {
    const cantidades: Record<string, number> = {};
    platosEnRonda.forEach((item) => {
      cantidades[item.platoId] = (cantidades[item.platoId] || 0) + item.cantidad;
    });
    return cantidades;
  }, [platosEnRonda]);

  // Agrupar platos por categoría
  const categoriasConPlatos = useMemo((): CategoriaConPlatos[] => {
    const grupos: Record<string, CategoriaConPlatos> = {};

    platos.forEach((plato) => {
      const catId = plato.categoriaId || 'sin-categoria';
      const catNombre = plato.categoriaNombre || 'Sin categoría';

      if (!grupos[catId]) {
        grupos[catId] = { categoriaId: catId, categoriaNombre: catNombre, platos: [] };
      }
      grupos[catId].platos.push(plato);
    });

    return Object.values(grupos).sort((a, b) =>
      a.categoriaNombre.localeCompare(b.categoriaNombre)
    );
  }, [platos]);

  // Filtrar por búsqueda
  const categoriasFiltradas = useMemo(() => {
    if (!search.trim()) return categoriasConPlatos;

    const term = search.toLowerCase();
    return categoriasConPlatos
      .map((cat) => ({
        ...cat,
        platos: cat.platos.filter((p) =>
          p.nombre.toLowerCase().includes(term)
        ),
      }))
      .filter((cat) => cat.platos.length > 0);
  }, [categoriasConPlatos, search]);

  // Componente de plato individual con su propio estado de press
  const PlatoItem = ({ item }: { item: PlatoOperativo }) => {
    const cantidadEnRonda = cantidadesEnRonda[item.platoId] || 0;
    const [isPressing, setIsPressing] = useState(false);
    const [isLongPhase, setIsLongPhase] = useState(false);
    const actionTaken = useRef(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const longTimerRef = useRef<NodeJS.Timeout | null>(null);
    
    const cleanup = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (longTimerRef.current) {
        clearTimeout(longTimerRef.current);
        longTimerRef.current = null;
      }
    };
    
    const handlePressIn = () => {
      if (cantidadEnRonda === 0 || !onQuitarPlato) return;
      
      actionTaken.current = false;
      setIsPressing(true);
      setIsLongPhase(false);
      
      // Timer para 0.8s - quita 1
      timerRef.current = setTimeout(() => {
        actionTaken.current = true;
        setIsLongPhase(true);
        Vibration.vibrate(100);
        onQuitarPlato(item.platoId);
        
        // Timer adicional para 1.7s total - quita todo
        longTimerRef.current = setTimeout(() => {
          const remaining = cantidadesEnRonda[item.platoId] - 1;
          if (remaining > 0) {
            Vibration.vibrate([0, 200, 100, 200]);
            for (let i = 0; i < remaining; i++) {
              onQuitarPlato(item.platoId);
            }
          }
          setIsPressing(false);
          setIsLongPhase(false);
          cleanup();
        }, 900);
      }, 800);
    };
    
    const handlePressOut = () => {
      cleanup();
      const shouldTriggerPress = !actionTaken.current;
      setIsPressing(false);
      setIsLongPhase(false);
      return shouldTriggerPress;
    };
    
    const handlePress = () => {
      if (!actionTaken.current) {
        if (item.stockBajo) {
          setPlatoPendienteStockBajo(item);
          setAlertVisible(true);
        } else {
          onSeleccionarPlato(item);
        }
      }
    };
    
    useEffect(() => {
      return cleanup;
    }, []);
    
    const TouchableComponent = item.stockBajo ? AnimatedTouchableOpacity : TouchableOpacity;

    return (
      <TouchableComponent
        style={[
          styles.platoCard, 
          isTablet && styles.platoCardTablet,
          isPressing && styles.platoCardPressing,
          cantidadEnRonda > 0 && styles.platoCardConItems,
          item.stockBajo && bordeStockBajo
        ]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onLongPress={() => {
          if (item.stockBajo && item.ingredientesBajos && item.ingredientesBajos.length > 0) {
            setPlatoSeleccionado(item);
            setModalVisible(true);
          }
        }}
        delayLongPress={600}
        activeOpacity={0.7}
      >
        {cantidadEnRonda > 0 && (
          <View style={[styles.cantidadBadge, isPressing && styles.cantidadBadgePressing]}>
            <Text style={styles.cantidadBadgeText}>{cantidadEnRonda}</Text>
          </View>
        )}
        <Text style={styles.platoNombre} numberOfLines={2}>
          {item.nombre}
        </Text>
        <Text style={styles.platoPrecio}>{item.precioVenta.toFixed(2)} €</Text>
        {item.stockBajo && (
          <View style={styles.stockBajoIndicator}>
            <Ionicons name="warning" size={12} color={colors.error} />
            <Text style={styles.stockBajoText}>Stock bajo</Text>
          </View>
        )}
        {cantidadEnRonda > 0 && (
          <Text style={[styles.mantenerTexto, isLongPhase && styles.mantenerTextoFuerte]}>
            {isLongPhase ? '¡Suelta para eliminar todo!' : 'Mantén para quitar'}
          </Text>
        )}
      </TouchableComponent>
    );
  };

  const renderPlato = ({ item }: { item: PlatoOperativo }) => {
    return <PlatoItem item={item} />;
  };

  const renderCategoria = ({ item }: { item: CategoriaConPlatos }) => (
    <View style={styles.categoriaContainer}>
      <View style={styles.categoriaHeader}>
        <Text style={styles.categoriaNombre}>{item.categoriaNombre}</Text>
        <Text style={styles.categoriaCount}>({item.platos.length})</Text>
      </View>
      <FlatList
        data={item.platos}
        renderItem={renderPlato}
        keyExtractor={(plato) => plato.platoId}
        numColumns={isTablet ? 3 : 2}
        columnWrapperStyle={styles.platosRow}
        scrollEnabled={false}
      />
    </View>
  );

  const descripcionIngredientes = (plato?: PlatoOperativo | null) => {
    if (!plato?.ingredientesBajos?.length) {
      return 'Ver detalles para más información.';
    }
    return plato.ingredientesBajos
      .map((ing) => `• ${ing.nombre}: ${ing.stockActual}/${ing.umbralAlerta} ${ing.unidadMedida}`)
      .join('\n');
  };

  const confirmarPlatoStockBajo = () => {
    if (platoPendienteStockBajo) {
      onSeleccionarPlato(platoPendienteStockBajo);
    }
    setAlertVisible(false);
    setPlatoPendienteStockBajo(null);
  };

  const cerrarAlert = () => {
    setAlertVisible(false);
    setPlatoPendienteStockBajo(null);
  };

  if (!visible) return null;

  return (
    <View style={styles.container}>
      {/* Búsqueda */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar plato..."
            placeholderTextColor={colors.textSecondary}
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Lista de categorías */}
      <FlatList
        data={categoriasFiltradas}
        renderItem={renderCategoria}
        keyExtractor={(item) => item.categoriaId}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {search ? 'No se encontraron platos' : 'No hay platos disponibles'}
            </Text>
          </View>
        }
      />

      {/* Modal de ingredientes con stock bajo */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons name="warning" size={24} color={colors.error} />
              <Text style={styles.modalTitle}>Ingredientes con stock bajo</Text>
            </View>
            
            <Text style={styles.modalPlatoNombre}>{platoSeleccionado?.nombre}</Text>
            
            <View style={styles.ingredientesList}>
              {platoSeleccionado?.ingredientesBajos?.map((ing, index) => (
                <View key={index} style={styles.ingredienteItem}>
                  <Text style={styles.ingredienteNombre}>{ing.nombre}</Text>
                  <Text style={styles.ingredienteStock}>
                    {ing.stockActual} / {ing.umbralAlerta} {ing.unidadMedida}
                  </Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <CustomAlert
        visible={alertVisible}
        title="Plato con stock bajo"
        message={`El plato "${platoPendienteStockBajo?.nombre}" tiene ingredientes comprometidos:\n\n${descripcionIngredientes(platoPendienteStockBajo)}`}
        type="warning"
        buttons={[
          { icon: 'close', iconColor: colors.textSecondary, style: 'cancel', onPress: cerrarAlert },
          { text: 'Añadir', onPress: confirmarPlatoStockBajo },
        ]}
        onDismiss={cerrarAlert}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchWrapper: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    ...typography.bodySmall,
    color: colors.text,
    fontSize: 14,
    paddingVertical: 4,
    lineHeight: 18,
  },
  clearButton: {
    padding: spacing.xs,
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
  categoriaContainer: {
    marginBottom: spacing.lg,
  },
  categoriaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  categoriaNombre: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    fontSize: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  categoriaCount: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  platosRow: {
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
  },
  platoCard: {
    flex: 1,
    margin: spacing.xs,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 80,
    justifyContent: 'space-between',
    maxWidth: '48%',
    position: 'relative',
  },
  platoCardTablet: {
    maxWidth: '31%',
  },
  platoCardConItems: {
    borderColor: colors.accent,
    borderWidth: 2,
  },
  platoCardPressing: {
    backgroundColor: colors.error + '20',
    borderColor: colors.error,
    transform: [{ scale: 0.98 }],
  },
  mantenerTexto: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  mantenerTextoFuerte: {
    color: colors.error,
    fontWeight: '700',
  },
  platoNombre: {
    ...typography.body,
    fontWeight: '500',
    color: colors.text,
    fontSize: 14,
    marginBottom: spacing.xs,
  },
  platoPrecio: {
    ...typography.body,
    fontWeight: '600',
    color: colors.accent,
    fontSize: 14,
  },
  cantidadBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
    zIndex: 10,
  },
  cantidadBadgePressing: {
    backgroundColor: colors.error,
    transform: [{ scale: 1.1 }],
  },
  cantidadBadgeText: {
    ...typography.bodySmall,
    color: colors.surface,
    fontWeight: '700',
    fontSize: 13,
  },
  stockBajoIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
    paddingVertical: 2,
    paddingHorizontal: 6,
    backgroundColor: colors.stockLow,
    borderRadius: borderRadius.sm,
    alignSelf: 'center',
    color: colors.primary,
  },
  stockBajoText: {
    fontSize: 10,
    color: colors.error,
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.text,
    marginLeft: spacing.sm,
    flex: 1,
  },
  modalPlatoNombre: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  ingredientesList: {
    marginBottom: spacing.lg,
  },
  ingredienteItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '50',
  },
  ingredienteNombre: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  ingredienteStock: {
    ...typography.body,
    color: colors.error,
    fontWeight: '600',
  },
  modalButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  modalButtonText: {
    ...typography.body,
    color: colors.surface,
    fontWeight: '600',
  },
});
