import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Loading } from '../../components/common';
import { EscandalloResumen } from '../../components/carta/EscandalloResumen';
import { colors, spacing, typography } from '../../theme';
import { cartaService } from '../../services/cartaService';
import { PlatoResponse } from '../../types/plato';
import { Escandallo } from '../../types/carta';
import { usePlatoStore } from '../../store/platoStore';

interface PlatoDetailScreenProps {
  navigation: any;
  route: { params: { platoId: string } };
}

export const PlatoDetailScreen: React.FC<PlatoDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const { removePlato, updatePlato } = usePlatoStore();
  const { platoId } = route.params;
  const [plato, setPlato] = useState<PlatoResponse | null>(null);
  const [escandallo, setEscandallo] = useState<Escandallo | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadPlato();
  }, [platoId]);

  const loadPlato = async () => {
    try {
      const data = await cartaService.getPlato(platoId);
      setPlato(data);
      try {
        const escandalloData = await cartaService.getEscandallo(platoId);
        setEscandallo(escandalloData);
      } catch (escandalloError) {
        setEscandallo(null);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar el plato');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Eliminar Plato',
      `¿Estás seguro de eliminar "${plato?.nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await cartaService.eliminarPlato(platoId);
              removePlato(platoId);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el plato');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  const handleEliminarImagen = (imgId: string) => {
    Alert.alert(
      'Eliminar Imagen',
      '¿Eliminar esta imagen?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await cartaService.eliminarImagen(platoId, imgId);
              loadPlato();
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar la imagen');
            }
          },
        },
      ]
    );
  };

  if (loading || !plato) {
    return <Loading fullScreen message="Cargando plato..." />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.nombre}>{plato.nombre}</Text>
        <Text style={styles.precio}>{plato.precioVenta.toFixed(2)} €</Text>
      </View>

      {plato.descripcion && (
        <Text style={styles.descripcion}>{plato.descripcion}</Text>
      )}

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{plato.contadorPedidos}</Text>
          <Text style={styles.statLabel}>Pedidos</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{plato.costeTotal?.toFixed(2) || '0.00'} €</Text>
          <Text style={styles.statLabel}>Coste</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{(plato.margen ? (plato.margen * 100).toFixed(0) : 0)}%</Text>
          <Text style={styles.statLabel}>Margen</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, !plato.activo && styles.inactive]}>
            {plato.activo ? 'Activo' : 'Inactivo'}
          </Text>
          <Text style={styles.statLabel}>Estado</Text>
        </View>
      </View>

      <View style={styles.actionsRow}>
        <View style={styles.iconButtonsGroup}>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => navigation.navigate('PlatoWizard', { plato })}
          >
            <Ionicons name="create-outline" size={20} color={colors.accent} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.iconButton, styles.deleteButton]}
            onPress={handleDelete}
          >
            <Ionicons name="trash-outline" size={20} color={colors.error} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.escandalloButton}
          onPress={() => navigation.navigate('Escandallos', { platoId, platoNombre: plato.nombre })}
        >
          <Ionicons name="list-outline" size={18} color={colors.accent} />
          <Text style={styles.escandalloButtonText}>Escandallo</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Imágenes</Text>
      {plato.imagenes.length === 0 ? (
        <Text style={styles.emptyText}>Sin imágenes</Text>
      ) : (
        <ScrollView horizontal style={styles.imagenesScroll}>
          {plato.imagenes.map((img: any) => (
            <TouchableOpacity
              key={img.id}
              style={styles.imagenContainer}
              onLongPress={() => handleEliminarImagen(img.id)}
            >
              <Image source={{ uri: img.url }} style={styles.imagen} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {escandallo && escandallo.ingredientes.length > 0 && (
        <EscandalloResumen escandallo={escandallo} />
      )}


    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  nombre: {
    ...typography.h1,
    color: colors.text,
    flex: 1,
  },
  precio: {
    ...typography.h2,
    color: colors.primary,
  },
  descripcion: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...typography.h3,
    color: colors.text,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  inactive: {
    color: colors.textSecondary,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  iconButtonsGroup: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  escandalloButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.accent + '40',
    gap: spacing.xs,
  },
  escandalloButtonText: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '600',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent + '15',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.accent + '30',
  },
  deleteButton: {
    backgroundColor: colors.error + '15',
    borderColor: colors.error + '30',
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tag: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primaryLight,
    borderRadius: 16,
  },
  tagText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  imagenesScroll: {
    marginTop: spacing.sm,
  },
  imagenContainer: {
    marginRight: spacing.md,
  },
  imagen: {
    width: 150,
    height: 150,
    borderRadius: 8,
    backgroundColor: colors.border,
  },

});
