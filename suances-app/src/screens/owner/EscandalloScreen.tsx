import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Button, Card, Loading, EmptyState } from '../../components/common';
import { colors, spacing, typography } from '../../theme';
import { cartaService } from '../../services/cartaService';
import { Escandallo, EscandalloRequest, EscandalloDetalle } from '../../types/carta';
import { IngredienteResponse } from '../../types/ingrediente';

interface EscandalloScreenProps {
  navigation: any;
  route: { params: { platoId: string; platoNombre?: string } };
}

interface DetalleEditable {
  ingredienteId: string;
  ingredienteNombre: string;
  cantidad: number;
}

export const EscandalloScreen: React.FC<EscandalloScreenProps> = ({
  navigation,
  route,
}) => {
  const { platoId, platoNombre } = route.params;
  const [escandallo, setEscandallo] = useState<Escandallo | null>(null);
  const [ingredientes, setIngredientes] = useState<IngredienteResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [detalles, setDetalles] = useState<DetalleEditable[]>([]);
  const [nombreVersion, setNombreVersion] = useState('Versión 1');
  const [showSelector, setShowSelector] = useState(false);

  useEffect(() => {
    loadData();
  }, [platoId]);

  const loadData = async () => {
    try {
      const [escandalloData, ingredientesData] = await Promise.all([
        cartaService.getEscandallo(platoId).catch(() => null),
        cartaService.getIngredientes(true),
      ]);

      setEscandallo(escandalloData);
      setIngredientes(ingredientesData);
      
      if (escandalloData?.ingredientes) {
        setDetalles(
          escandalloData.ingredientes.map((d) => ({
            ingredienteId: d.ingredienteId,
            ingredienteNombre: d.nombre,
            cantidad: d.cantidad,
          }))
        );
        setNombreVersion(escandalloData.nombreVersion);
      }
    } catch (error) {
      console.error('Error loading escandallo:', error);
    } finally {
      setLoading(false);
    }
  };

  const addIngrediente = (ingrediente: IngredienteResponse) => {
    if (detalles.some((d) => d.ingredienteId === ingrediente.id)) {
      Alert.alert('Aviso', 'Este ingrediente ya está en la receta');
      return;
    }
    
    setDetalles([
      ...detalles,
      {
        ingredienteId: ingrediente.id,
        ingredienteNombre: ingrediente.nombre,
        cantidad: 100,
      },
    ]);
    setShowSelector(false);
  };

  const removeDetalle = (ingredienteId: string) => {
    setDetalles(detalles.filter((d) => d.ingredienteId !== ingredienteId));
  };

  const updateCantidad = (ingredienteId: string, cantidad: number) => {
    setDetalles(
      detalles.map((d) =>
        d.ingredienteId === ingredienteId ? { ...d, cantidad } : d
      )
    );
  };

  const getCosteTotal = (): number => {
    return detalles.reduce((total, detalle) => {
      const ingrediente = ingredientes.find((i) => i.id === detalle.ingredienteId);
      if (!ingrediente) return total;
      return total + (ingrediente.precioPorUnidad * detalle.cantidad);
    }, 0);
  };

  const handleSave = async () => {
    if (detalles.length === 0) {
      Alert.alert('Error', 'Añade al menos un ingrediente');
      return;
    }

    setSaving(true);
    try {
      const data: EscandalloRequest = {
        nombreVersion,
        ingredientes: detalles.map((d) => ({
          ingredienteId: d.ingredienteId,
          cantidad: d.cantidad,
        })),
      };

      await cartaService.crearOActualizarEscandallo(platoId, data);
      Alert.alert('Éxito', 'Escandallo guardado correctamente');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el escandallo');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Eliminar Escandallo',
      '¿Eliminar toda la receta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await cartaService.eliminarEscandallo(platoId);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el escandallo');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return <Loading fullScreen message="Cargando escandallo..." />;
  }

  const costeTotal = getCosteTotal();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.platoNombre}>{platoNombre || 'Plato'}</Text>
        <TextInput
          style={styles.versionInput}
          value={nombreVersion}
          onChangeText={setNombreVersion}
          placeholder="Nombre versión"
        />
      </View>

      <View style={styles.costeContainer}>
        <Text style={styles.costeLabel}>Coste total:</Text>
        <Text style={styles.costeValue}>{costeTotal.toFixed(2)} €</Text>
      </View>

      <FlatList
        data={detalles}
        keyExtractor={(item) => item.ingredienteId}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <Text style={styles.sectionTitle}>Ingredientes de la receta</Text>
        }
        ListEmptyComponent={
          <EmptyState
            title="Sin ingredientes"
            message="Añade los ingredientes de la receta"
          />
        }
        renderItem={({ item }) => {
          const ingrediente = ingredientes.find((i) => i.id === item.ingredienteId);
          const coste = ingrediente ? ingrediente.precioPorUnidad * item.cantidad : 0;

          return (
            <Card style={styles.detalleCard}>
              <View style={styles.detalleRow}>
                <View style={styles.detalleInfo}>
                  <Text style={styles.detalleNombre}>{item.ingredienteNombre}</Text>
                  <Text style={styles.detalleCoste}>
                    {coste.toFixed(2)} € ({ingrediente?.precioPorUnidad.toFixed(2)} €/ {ingrediente?.unidadMedida})
                  </Text>
                </View>
                <TouchableOpacity onPress={() => removeDetalle(item.ingredienteId)}>
                  <Text style={styles.removeButton}>✕</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.cantidadRow}>
                <Text style={styles.cantidadLabel}>Cantidad:</Text>
                <TextInput
                  style={styles.cantidadInput}
                  value={item.cantidad.toString()}
                  onChangeText={(text) => {
                    const num = parseFloat(text) || 0;
                    updateCantidad(item.ingredienteId, num);
                  }}
                  keyboardType="decimal-pad"
                />
                <Text style={styles.unidadText}>{ingrediente?.unidadMedida || ''}</Text>
              </View>
            </Card>
          );
        }}
      />

      {showSelector ? (
        <View style={styles.selectorContainer}>
          <Text style={styles.selectorTitle}>Seleccionar ingrediente</Text>
          <FlatList
            data={ingredientes.filter(i => !detalles.some(d => d.ingredienteId === i.id))}
            keyExtractor={(item) => item.id}
            style={styles.selectorList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.selectorItem}
                onPress={() => addIngrediente(item)}
              >
                <Text style={styles.selectorItemText}>{item.nombre}</Text>
                <Text style={styles.selectorItemUnidad}>{item.unidadMedida}</Text>
              </TouchableOpacity>
            )}
          />
          <Button
            title="Cancelar"
            onPress={() => setShowSelector(false)}
            variant="secondary"
          />
        </View>
      ) : (
        <View style={styles.footer}>
          <Button
            title="+ Añadir Ingrediente"
            onPress={() => setShowSelector(true)}
            variant="secondary"
            style={styles.footerButton}
          />
          <Button
            title="Guardar Escandallo"
            onPress={handleSave}
            loading={saving}
            style={styles.footerButton}
          />
          {escandallo && (
            <Button
              title="Eliminar Escandallo"
              onPress={handleDelete}
              variant="danger"
            />
          )}
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
  header: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  platoNombre: {
    ...typography.h2,
    color: colors.text,
  },
  versionInput: {
    ...typography.body,
    color: colors.textSecondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: spacing.sm,
    marginTop: spacing.xs,
  },
  costeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.primaryLight,
  },
  costeLabel: {
    ...typography.body,
    color: colors.primary,
  },
  costeValue: {
    ...typography.h2,
    color: colors.primary,
  },
  list: {
    padding: spacing.md,
    paddingBottom: 200,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  detalleCard: {
    marginBottom: spacing.sm,
  },
  detalleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  detalleInfo: {
    flex: 1,
  },
  detalleNombre: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  detalleCoste: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  removeButton: {
    color: colors.error,
    fontSize: 18,
    padding: spacing.sm,
  },
  cantidadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cantidadLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  cantidadInput: {
    ...typography.body,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginLeft: spacing.sm,
    width: 80,
    textAlign: 'right',
  },
  unidadText: {
    ...typography.body,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  selectorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  selectorTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  selectorList: {
    flex: 1,
    marginBottom: spacing.md,
  },
  selectorItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  selectorItemText: {
    ...typography.body,
    color: colors.text,
  },
  selectorItemUnidad: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  footerButton: {
    marginBottom: spacing.xs,
  },
});
