import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, TextInput, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../common';
import { usePlatoStore } from '../../store/platoStore';
import { usePlatosMasPedidos } from '../../hooks/usePlatosMasPedidos';
import { colors, spacing, typography, borderRadius } from '../../theme';

interface PlatosKpiCardProps {
  navigation: any;
}

export const PlatosKpiCard: React.FC<PlatosKpiCardProps> = ({ navigation }) => {
  const { fetchPlatos } = usePlatoStore();
  const platosMasPedidos = usePlatosMasPedidos(4);
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [animation] = useState(new Animated.Value(0));

  useEffect(() => {
    fetchPlatos(true);
  }, []);

  const toggleExpand = () => {
    const toValue = isExpanded ? 0 : 1;
    Animated.spring(animation, {
      toValue,
      useNativeDriver: false,
      friction: 8,
      tension: 40,
    }).start();
    setIsExpanded(!isExpanded);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigation.navigate('Platos', { searchQuery: searchQuery.trim() });
      setSearchQuery('');
      setIsExpanded(false);
      animation.setValue(0);
    }
  };

  const containerHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [200, 280],
  });

  return (
    <Animated.View style={[styles.animatedContainer, { height: containerHeight }]}>
      <Card style={styles.container} onPress={() => !isExpanded && navigation.navigate('Platos')}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Ionicons name="restaurant" size={20} color={colors.accent} />
            <Text style={styles.title}>Platos</Text>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={toggleExpand}
            >
              <Ionicons 
                name={isExpanded ? "close" : "search"} 
                size={20} 
                color={isExpanded ? colors.error : colors.accent} 
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate('Platos')}
            >
              <Ionicons name="arrow-forward" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {isExpanded && (
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Ionicons name="search" size={18} color={colors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar plato..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
                autoFocus
              />
            </View>
            <TouchableOpacity
              style={styles.searchButton}
              onPress={handleSearch}
              disabled={!searchQuery.trim()}
            >
              <Ionicons name="arrow-forward" size={20} color={colors.surface} />
            </TouchableOpacity>
          </View>
        )}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.gallery}
          contentContainerStyle={styles.galleryContent}
        >
          {platosMasPedidos.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No hay platos</Text>
            </View>
          ) : (
            platosMasPedidos.map((plato) => (
              <TouchableOpacity
                key={plato.id}
                style={styles.platoCard}
                onPress={() => navigation.navigate('PlatoDetail', { platoId: plato.id })}
              >
                {plato.imagenes?.[0]?.url ? (
                  <Image
                    source={{ uri: plato.imagenes[0].url }}
                    style={styles.platoImage}
                  />
                ) : (
                  <View style={styles.platoImagePlaceholder}>
                    <Ionicons name="restaurant" size={32} color={colors.textSecondary} />
                  </View>
                )}
                <Text style={styles.platoNombre} numberOfLines={1}>
                  {plato.nombre}
                </Text>
                <View style={styles.platoStats}>
                  <Ionicons name="trending-up" size={14} color={colors.accent} />
                  <Text style={styles.platoContador}>{plato.contadorPedidos}</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </Card>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  animatedContainer: {
    overflow: 'hidden',
  },
  container: {
    flex: 1,
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  iconButton: {
    padding: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    padding: 0,
  },
  searchButton: {
    backgroundColor: colors.accent,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
  },
  gallery: {
    flex: 1,
  },
  galleryContent: {
    gap: spacing.md,
    paddingRight: spacing.md,
  },
  platoCard: {
    width: 100,
    alignItems: 'center',
  },
  platoImage: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.xs,
  },
  platoImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  platoNombre: {
    ...typography.bodySmall,
    fontWeight: '500',
    color: colors.text,
    textAlign: 'center',
    width: '100%',
  },
  platoStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  platoContador: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: 200,
  },
  emptyText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
});
