import React, { useEffect, useLayoutEffect, useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  SectionList,
  RefreshControl,
  TouchableOpacity,
  Text,
  TextInput,
} from 'react-native';
import { PlatoCard, EmptyState, Loading } from '../../components/common';
import { colors, spacing, typography } from '../../theme';
import { PlatoResponse } from '../../types/plato';
import { usePlatoStore } from '../../store/platoStore';
import { useCategoriaStore } from '../../store/categoriaStore';
import { useCartaSSE } from '../../hooks/useCartaSSE';

interface PlatoListScreenProps {
  navigation: any;
}

export const PlatoListScreen: React.FC<PlatoListScreenProps> = ({
  navigation,
}) => {
  const { platos, isLoading, fetchPlatos } = usePlatoStore();
  const { categorias, fetchCategorias } = useCategoriaStore();
  const [searchText, setSearchText] = useState('');

  // Conectar a SSE para actualizaciones en tiempo real
  useCartaSSE({
    enabled: true,
    onPlatoChanged: () => {
      console.log('[PlatoListScreen] Recargando platos por cambio SSE');
      fetchPlatos(true);
    },
  });

  useEffect(() => {
    if (platos.length === 0) {
      fetchPlatos(true);
    }
    fetchCategorias(true, 'PLATO');
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate('PlatoWizard')}
          style={styles.headerButton}
        >
          <Text style={styles.headerButtonText}>+</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const onRefresh = () => {
    fetchPlatos(true);
    fetchCategorias(true, 'PLATO');
  };

  const filteredData = useMemo(() => {
    const searchLower = searchText.toLowerCase().trim();
    
    if (!searchLower) {
      return platos;
    }

    return platos.filter((plato) => {
      const nombreMatch = plato.nombre.toLowerCase().includes(searchLower);
      const categoriaMatch = plato.categoria?.nombre.toLowerCase().includes(searchLower);
      return nombreMatch || categoriaMatch;
    });
  }, [platos, searchText]);

  const sections = useMemo(() => {
    const grouped: { [key: string]: PlatoResponse[] } = {};

    filteredData.forEach((plato) => {
      const categoriaKey = plato.categoria?.nombre || 'Sin categoría';
      if (!grouped[categoriaKey]) {
        grouped[categoriaKey] = [];
      }
      grouped[categoriaKey].push(plato);
    });

    return Object.keys(grouped)
      .sort((a, b) => {
        if (a === 'Sin categoría') return 1;
        if (b === 'Sin categoría') return -1;
        return a.localeCompare(b);
      })
      .map((key) => ({
        title: key,
        data: grouped[key],
      }));
  }, [filteredData]);

  const renderSectionHeader = ({ section }: { section: { title: string } }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <Text style={styles.sectionCount}>
        {sections.find((s) => s.title === section.title)?.data.length || 0} items
      </Text>
    </View>
  );

  const renderItem = ({ item }: { item: PlatoResponse }) => (
    <PlatoCard
      plato={item}
      onPress={() => navigation.navigate('PlatoDetail', { platoId: item.id })}
    />
  );

  if (isLoading && platos.length === 0) {
    return <Loading fullScreen message="Cargando platos..." />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre o categoría..."
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor={colors.textSecondary}
        />
        {searchText.length > 0 && (
          <Text style={styles.searchResultCount}>
            {filteredData.length} resultado{filteredData.length !== 1 ? 's' : ''}
          </Text>
        )}
      </View>

      {filteredData.length === 0 ? (
        <View style={styles.emptyWrapper}>
          <EmptyState
            title={searchText ? 'Sin resultados' : 'No hay platos'}
            message={
              searchText
                ? 'Prueba con otros términos de búsqueda'
                : 'Crea el primer plato de tu carta'
            }
            actionLabel={searchText ? undefined : 'Crear Plato'}
            onAction={searchText ? undefined : () => navigation.navigate('PlatoWizard')}
          />
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.list}
          stickySectionHeadersEnabled={false}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchInput: {
    backgroundColor: colors.background,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.body,
    color: colors.text,
  },
  searchResultCount: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  list: {
    padding: spacing.md,
    paddingBottom: 80,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.primary,
  },
  sectionCount: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  emptyWrapper: {
    flex: 1,
  },
  headerButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  headerButtonText: {
    color: colors.surface,
    fontSize: 24,
    fontWeight: '600',
  },
});
