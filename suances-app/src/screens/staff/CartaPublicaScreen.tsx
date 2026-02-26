import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import { PlatoCard, Loading, EmptyState } from '../../components/common';
import { colors, spacing, typography } from '../../theme';
import { cartaService } from '../../services/cartaService';
import { PlatoResponse } from '../../types/plato';
import { TipoCartaResponse } from '../../types/carta';

interface CartaPublicaScreenProps {
  navigation: any;
}

export const CartaPublicaScreen: React.FC<CartaPublicaScreenProps> = ({
  navigation,
}) => {
  const [tiposCarta, setTiposCarta] = useState<TipoCartaResponse[]>([]);
  const [selectedTipo, setSelectedTipo] = useState<string | null>(null);
  const [platos, setPlatos] = useState<PlatoResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const tipos = await cartaService.getTiposCarta();
      setTiposCarta(tipos.filter((t) => t.activo));
      
      if (tipos.length > 0) {
        const primerTipo = tipos.find((t) => t.activo) || tipos[0];
        setSelectedTipo(primerTipo.id);
      }
    } catch (error) {
      console.error('Error loading carta:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadPlatos = async (tipoId: string) => {
    try {
      const data = await cartaService.getPlatos(true);
      const filtered = data.filter((p) => 
        (p.tiposCarta || []).some((tc) => tc.id === tipoId)
      );
      setPlatos(filtered);
    } catch (error) {
      console.error('Error loading platos:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedTipo) {
      loadPlatos(selectedTipo);
    }
  }, [selectedTipo]);

  const renderItem = ({ item }: { item: PlatoResponse }) => (
    <PlatoCard plato={item} showDetails={false} />
  );

  if (loading) {
    return <Loading fullScreen message="Cargando carta..." />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nuestra Carta</Text>
      
      {tiposCarta.length > 0 && (
        <View style={styles.tabs}>
          {tiposCarta.map((tipo) => (
            <View
              key={tipo.id}
              style={[
                styles.tab,
                selectedTipo === tipo.id && styles.tabActive,
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedTipo === tipo.id && styles.tabTextActive,
                ]}
                onPress={() => setSelectedTipo(tipo.id)}
              >
                {tipo.nombre}
              </Text>
            </View>
          ))}
        </View>
      )}

      <FlatList
        data={platos}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
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
    </View>
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
});
