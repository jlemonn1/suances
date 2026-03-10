import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { salaService } from '../../services/salaService';
import type { PlatoOperativo } from '../../types/carta';

interface SelectorPlatosSimpleProps {
  visible: boolean;
  onClose: () => void;
  onSeleccionarPlato: (plato: PlatoOperativo) => void;
  platosEnRonda: number;
}

interface CategoriaConPlatos {
  categoriaId: string;
  categoriaNombre: string;
  platos: PlatoOperativo[];
}

const { width } = Dimensions.get('window');
const isTablet = width > 768;

export const SelectorPlatosSimple: React.FC<SelectorPlatosSimpleProps> = ({
  visible,
  onClose,
  onSeleccionarPlato,
  platosEnRonda,
}) => {
  const [platos, setPlatos] = useState<PlatoOperativo[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (visible) {
      cargarPlatos();
    }
  }, [visible]);

  const cargarPlatos = async () => {
    setLoading(true);
    try {
      const platosOperativos = await salaService.getPlatosOperativos();
      setPlatos(platosOperativos.filter((p) => p.disponible));
    } catch (error) {
      console.error('[SelectorPlatosSimple] Error cargando platos:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleSeleccionarPlato = (plato: PlatoOperativo) => {
    onSeleccionarPlato(plato);
    // No cerramos, el usuario sigue añadiendo
  };

  const renderPlato = ({ item }: { item: PlatoOperativo }) => (
    <TouchableOpacity
      style={[styles.platoCard, isTablet && styles.platoCardTablet]}
      onPress={() => handleSeleccionarPlato(item)}
      activeOpacity={0.7}
    >
      <Text style={styles.platoNombre} numberOfLines={2}>
        {item.nombre}
      </Text>
      <Text style={styles.platoPrecio}>{item.precioVenta.toFixed(2)} €</Text>
    </TouchableOpacity>
  );

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

  if (!visible) return null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Añadir platos</Text>
          <Text style={styles.headerSubtitle}>
            {platosEnRonda} en ronda actual
          </Text>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeText}>Listo</Text>
        </TouchableOpacity>
      </View>

      {/* Búsqueda */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar plato..."
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
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
    </View>
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
  backButton: {
    padding: spacing.xs,
  },
  headerContent: {
    flex: 1,
    marginLeft: spacing.md,
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
  closeButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  closeText: {
    ...typography.body,
    color: colors.accent,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    ...typography.body,
    color: colors.text,
    fontSize: 16,
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
  },
  platoCardTablet: {
    maxWidth: '31%',
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
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
