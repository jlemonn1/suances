import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Loading, EmptyState } from '../../components/common';
import { colors, spacing, typography } from '../../theme';
import { salaService } from '../../services/salaService';
import { PlatoOperativo, TipoCartaOperativo } from '../../types/carta';
import { useCartaSSE } from '../../hooks/useCartaSSE';

interface CartaPublicaScreenProps {
  navigation?: any;
}

export const CartaPublicaScreen: React.FC<CartaPublicaScreenProps> = ({
  navigation,
}) => {
  const [tiposCarta, setTiposCarta] = useState<TipoCartaOperativo[]>([]);
  const [selectedTipo, setSelectedTipo] = useState<string | null>(null);
  const [platos, setPlatos] = useState<PlatoOperativo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updateVersion, setUpdateVersion] = useState(0);
  
  // Ref para mantener el valor actual de selectedTipo sin depender del closure
  const selectedTipoRef = useRef<string | null>(null);
  
  useEffect(() => {
    selectedTipoRef.current = selectedTipo;
  }, [selectedTipo]);

  // Callback para forzar actualización cuando llegan eventos SSE
  const handleDataUpdate = useCallback(() => {
    console.log('[CartaPublicaScreen] Forzando actualización por evento SSE, carta actual:', selectedTipoRef.current);
    setUpdateVersion(prev => prev + 1);
    // No llamamos loadData() aquí, dejamos que el useEffect maneje la actualización
  }, []);

  // Conectar a SSE para actualizaciones en tiempo real de la carta
  useCartaSSE({
    enabled: true,
    onPlatoChanged: handleDataUpdate,
    onTipoCartaChanged: handleDataUpdate
  });

  const loadData = useCallback(async () => {
    try {
      console.log('[CartaPublicaScreen] Cargando datos de carta...');
      // Cargar tipos de carta desde sala-service
      const tipos = await salaService.getTiposCartaOperativos();
      const tiposActivos = tipos.filter((t) => t.activo);
      setTiposCarta(tiposActivos);

      if (tiposActivos.length > 0) {
        // Solo cambiar el tipo seleccionado si no hay ninguno seleccionado
        // o si el seleccionado ya no existe
        const currentSelected = selectedTipoRef.current;
        let tipoIdToUse = currentSelected;
        
        if (!currentSelected) {
          // Primera carga: seleccionar el primero
          tipoIdToUse = tiposActivos[0].tipoCartaId;
          setSelectedTipo(tipoIdToUse);
        } else {
          // Verificar si el tipo seleccionado todavía existe
          const tipoExiste = tiposActivos.find((t) => t.tipoCartaId === currentSelected);
          if (!tipoExiste) {
            // El tipo seleccionado ya no existe, usar el primero
            tipoIdToUse = tiposActivos[0].tipoCartaId;
            setSelectedTipo(tipoIdToUse);
          }
        }

        // Actualizar platos del tipo seleccionado
        const tipoActual = tiposActivos.find((t) => t.tipoCartaId === tipoIdToUse);
        if (tipoActual) {
          console.log('[CartaPublicaScreen] Platos cargados para tipo', tipoActual.nombre, ':', tipoActual.platos?.length);
          setPlatos(tipoActual.platos || []);
        }
      } else {
        setPlatos([]);
      }
    } catch (error) {
      console.error('Error loading carta desde sala:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Actualizar platos cuando cambie el tipo seleccionado, los tipos de carta o la versión
  useEffect(() => {
    if (selectedTipo && tiposCarta.length > 0) {
      const tipo = tiposCarta.find((t) => t.tipoCartaId === selectedTipo);
      if (tipo) {
        console.log('[CartaPublicaScreen] Actualizando platos para tipo:', tipo.nombre, '- Platos:', tipo.platos?.length);
        setPlatos(tipo.platos || []);
      }
    }
  }, [selectedTipo, tiposCarta, updateVersion]);

  useEffect(() => {
    loadData();
  }, [loadData, updateVersion]);

  const renderPlato = ({ item }: { item: PlatoOperativo }) => (
    <View style={styles.platoCard}>
      <View style={styles.platoInfo}>
        <Text style={styles.platoNombre}>{item.nombre}</Text>
        {item.descripcion && (
          <Text style={styles.platoDescripcion}>{item.descripcion}</Text>
        )}
        {item.categoriaNombre && (
          <Text style={styles.platoCategoria}>{item.categoriaNombre}</Text>
        )}
      </View>
      <View style={styles.platoPrecioContainer}>
        <Text style={styles.platoPrecio}>{item.precioVenta.toFixed(2)} €</Text>
        {item.stockBajo && (
          <Text style={styles.stockBajo}>Stock bajo</Text>
        )}
      </View>
    </View>
  );

  if (loading) {
    return <Loading fullScreen message="Cargando carta..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <Text style={styles.title}>Nuestra Carta</Text>
      
      {tiposCarta.length > 0 && (
        <View style={styles.tabs}>
          {tiposCarta.map((tipo) => (
            <View
              key={tipo.tipoCartaId}
              style={[
                styles.tab,
                selectedTipo === tipo.tipoCartaId && styles.tabActive,
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedTipo === tipo.tipoCartaId && styles.tabTextActive,
                ]}
                onPress={() => setSelectedTipo(tipo.tipoCartaId)}
              >
                {tipo.nombre}
              </Text>
            </View>
          ))}
        </View>
      )}

      <FlatList
        data={platos}
        keyExtractor={(item) => item.platoId}
        renderItem={renderPlato}
        contentContainerStyle={platos.length === 0 ? styles.emptyContainer : styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} />
        }
        ListEmptyComponent={
          <EmptyState
            title="No hay platos disponibles"
            message="En estos momentos no hay platos en esta categoría"
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  tab: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    backgroundColor: colors.surface,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  tabTextActive: {
    color: colors.surface,
  },
  list: {
    padding: spacing.md,
  },
  emptyContainer: {
    flex: 1,
  },
  platoCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  platoInfo: {
    flex: 1,
  },
  platoNombre: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  platoDescripcion: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  platoCategoria: {
    ...typography.caption,
    color: colors.primary,
  },
  platoPrecioContainer: {
    alignItems: 'flex-end',
  },
  platoPrecio: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: 'bold',
  },
  stockBajo: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },
});
