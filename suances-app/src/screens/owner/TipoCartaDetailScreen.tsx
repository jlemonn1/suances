import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from 'react-native';
import { Button, Loading } from '../../components/common';
import { colors, spacing, typography } from '../../theme';
import { cartaService } from '../../services/cartaService';
import { TipoCartaResponse } from '../../types/carta';
import { PlatoResponse } from '../../types/plato';
import { usePlatoStore } from '../../store/platoStore';

interface TipoCartaDetailScreenProps {
  navigation: any;
  route: { params: { tipoCartaId: string } };
}

export const TipoCartaDetailScreen: React.FC<TipoCartaDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const { tipoCartaId } = route.params;
  const { platos, fetchPlatos } = usePlatoStore();
  
  const [tipoCarta, setTipoCarta] = useState<TipoCartaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingPlatos, setLoadingPlatos] = useState(false);
  const [showPlatosSelector, setShowPlatosSelector] = useState(false);

  const loadTipoCarta = useCallback(async () => {
    try {
      const data = await cartaService.getTipoCarta(tipoCartaId);
      setTipoCarta(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar el tipo de carta');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [tipoCartaId]);

  useEffect(() => {
    loadTipoCarta();
    fetchPlatos(false);
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadTipoCarta();
    });
    return unsubscribe;
  }, [navigation, loadTipoCarta]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTipoCarta();
    setRefreshing(false);
  };

  const handleAgregarPlato = async (plato: PlatoResponse) => {
    if (!tipoCarta) return;
    
    const PlatoYaAsociado = tipoCarta.platos.some(p => p.id === plato.id);
    if (PlatoYaAsociado) {
      Alert.alert('Informacion', 'Este plato ya esta asociado');
      return;
    }

    setLoadingPlatos(true);
    try {
      const currentPlatoIds = tipoCarta.platos.map(p => p.id);
      console.log('Asociando platos a tipoCarta:', tipoCarta.id, 'platos:', [...currentPlatoIds, plato.id]);
      const updated = await cartaService.asociarPlatosATipoCarta(tipoCarta.id, [...currentPlatoIds, plato.id]);
      setTipoCarta(updated);
      setShowPlatosSelector(false);
    } catch (error: any) {
      console.error('Error associating plato:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'No se pudo asociar el plato';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoadingPlatos(false);
    }
  };

  const handleEliminarPlato = async (platoId: string) => {
    if (!tipoCarta) return;

    Alert.alert(
      'Desasociar plato',
      'Quieres desasociar este plato del tipo de carta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desasociar',
          style: 'destructive',
          onPress: async () => {
            setLoadingPlatos(true);
            try {
              const currentPlatoIds = tipoCarta.platos.filter(p => p.id !== platoId).map(p => p.id);
              console.log('Desasociando plato:', platoId, 'tipoCarta:', tipoCarta.id, 'platos restantes:', currentPlatoIds);
              const updated = await cartaService.asociarPlatosATipoCarta(tipoCarta.id, currentPlatoIds);
              setTipoCarta(updated);
            } catch (error: any) {
              console.error('Error desasociando plato:', error);
              const errorMessage = error?.response?.data?.message || error?.message || 'No se pudo desasociar el plato';
              Alert.alert('Error', errorMessage);
            } finally {
              setLoadingPlatos(false);
            }
          },
        },
      ]
    );
  };

  const handleToggleActivo = async (value: boolean) => {
    if (!tipoCarta) return;
    
    try {
      await cartaService.actualizarTipoCarta(tipoCarta.id, {
        nombre: tipoCarta.nombre,
        horaInicio: tipoCarta.horaInicio,
        horaFin: tipoCarta.horaFin,
      });
      setTipoCarta({ ...tipoCarta, activo: value });
    } catch (error) {
      Alert.alert('Error', 'No se pudo cambiar el estado');
    }
  };

  const handleVerDetallePlato = (platoId: string) => {
    navigation.navigate('PlatoDetail', { platoId });
  };

  if (loading) {
    return <Loading fullScreen message="Cargando tipo de carta..." />;
  }

  if (!tipoCarta) {
    return null;
  }

  const platosNoAsociados = platos.filter(p => !tipoCarta.platos.some(pa => pa.id === p.id));

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.nombre}>{tipoCarta.nombre}</Text>
          <View style={styles.activoRow}>
            <Text style={styles.activoLabel}>
              {tipoCarta.activo ? 'Activo' : 'Inactivo'}
            </Text>
            <Switch
              value={tipoCarta.activo}
              onValueChange={handleToggleActivo}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.surface}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Horario</Text>
          <Text style={styles.horario}>
            {tipoCarta.horaInicio} - {tipoCarta.horaFin}
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Platos asociados ({tipoCarta.platos.length})
            </Text>
            <TouchableOpacity onPress={() => setShowPlatosSelector(true)}>
              <Text style={styles.addButton}>+ Agregar</Text>
            </TouchableOpacity>
          </View>

          {loadingPlatos ? (
            <Loading message="Cargando..." />
          ) : tipoCarta.platos.length === 0 ? (
            <Text style={styles.emptyText}>No hay platos asociados</Text>
          ) : (
            <View style={styles.platosList}>
              {tipoCarta.platos.map((plato) => (
                <TouchableOpacity
                  key={plato.id}
                  style={styles.platoItem}
                  onPress={() => handleVerDetallePlato(plato.id)}
                >
                  <View style={styles.platoInfo}>
                    <Text style={styles.platoNombre}>{plato.nombre}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleEliminarPlato(plato.id)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={styles.removeText}>X</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Editar Tipo de Carta"
          onPress={() => navigation.navigate('TipoCartaForm', { tipoCarta })}
        />
      </View>

      {showPlatosSelector && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Agregar plato</Text>
            {loadingPlatos ? (
              <Loading message="Cargando platos..." />
            ) : platosNoAsociados.length === 0 ? (
              <Text style={styles.emptyText}>No hay mas platos disponibles</Text>
            ) : (
              <FlatList
                data={platosNoAsociados}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.platoOption}
                    onPress={() => handleAgregarPlato(item)}
                  >
                    <Text style={styles.platoNombre}>{item.nombre}</Text>
                    <Text style={styles.platoPrecio}>
                      {item.precioVenta?.toFixed(2)} EUR
                    </Text>
                  </TouchableOpacity>
                )}
                style={styles.platosSelectorList}
              />
            )}
            <Button
              title="Cerrar"
              onPress={() => setShowPlatosSelector(false)}
              variant="secondary"
              style={styles.modalCloseButton}
            />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  header: {
    marginBottom: spacing.lg,
  },
  nombre: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  activoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activoLabel: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
  },
  addButton: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  horario: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 18,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    padding: spacing.lg,
  },
  platosList: {
    gap: spacing.sm,
  },
  platoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  platoInfo: {
    flex: 1,
  },
  platoNombre: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
  },
  platoPrecio: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  removeText: {
    color: colors.error,
    fontSize: 18,
    paddingLeft: spacing.md,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    width: '85%',
    maxHeight: '70%',
  },
  modalTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  modalCloseButton: {
    marginTop: spacing.md,
  },
  platosSelectorList: {
    maxHeight: 300,
  },
  platoOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
});
