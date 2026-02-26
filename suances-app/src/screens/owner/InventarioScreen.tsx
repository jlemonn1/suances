import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { Card, Loading, Button } from '../../components/common';
import { colors, spacing, typography } from '../../theme';
import { cartaService } from '../../services/cartaService';
import { IngredienteResponse } from '../../types/ingrediente';

interface InventarioScreenProps {
  navigation: any;
}

export const InventarioScreen: React.FC<InventarioScreenProps> = ({
  navigation,
}) => {
  const [ingredientes, setIngredientes] = useState<IngredienteResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAlertsOnly, setShowAlertsOnly] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedIngrediente, setSelectedIngrediente] = useState<IngredienteResponse | null>(null);
  const [newStock, setNewStock] = useState('');
  const [savingStock, setSavingStock] = useState(false);

  const loadData = async () => {
    try {
      const data = await cartaService.getIngredientes(true);
      setIngredientes(data);
    } catch (error) {
      console.error('Error loading ingredientes:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredIngredients = showAlertsOnly
    ? ingredientes.filter((i) => i.stockActual <= i.umbralAlerta)
    : ingredientes;

  const alertCount = ingredientes.filter((i) => i.stockActual <= i.umbralAlerta).length;
  const totalValue = ingredientes.reduce((sum, i) => sum + (i.stockActual * i.precioPorUnidad), 0);
  const lowStockCount = ingredientes.filter((i) => i.stockActual <= i.umbralAlerta && i.stockActual > 0).length;
  const outOfStockCount = ingredientes.filter((i) => i.stockActual === 0).length;

  const openStockModal = (ingrediente: IngredienteResponse) => {
    setSelectedIngrediente(ingrediente);
    setNewStock(ingrediente.stockActual.toString());
    setShowStockModal(true);
  };

  const handleUpdateStock = async () => {
    if (!selectedIngrediente) return;

    const stock = parseFloat(newStock);
    if (isNaN(stock) || stock < 0) {
      Alert.alert('Error', 'Stock inválido');
      return;
    }

    setSavingStock(true);
    try {
      await cartaService.actualizarIngrediente(selectedIngrediente.id, {
        nombre: selectedIngrediente.nombre,
        unidadMedida: selectedIngrediente.unidadMedida,
        precioPorUnidad: selectedIngrediente.precioPorUnidad,
        stockActual: stock,
        umbralAlerta: selectedIngrediente.umbralAlerta,
      });
      setShowStockModal(false);
      loadData();
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el stock');
    } finally {
      setSavingStock(false);
    }
  };

  const getStockStatus = (item: IngredienteResponse): 'ok' | 'low' | 'out' => {
    if (item.stockActual === 0) return 'out';
    if (item.stockActual <= item.umbralAlerta) return 'low';
    return 'ok';
  };

  const getStockColor = (status: 'ok' | 'low' | 'out') => {
    switch (status) {
      case 'out': return colors.error;
      case 'low': return colors.warning;
      default: return colors.success;
    }
  };

  const renderItem = ({ item }: { item: IngredienteResponse }) => {
    const status = getStockStatus(item);
    const stockColor = getStockColor(status);

    return (
      <Card style={styles.card} onPress={() => openStockModal(item)}>
        <View style={styles.cardRow}>
          <View style={styles.cardInfo}>
            <Text style={styles.cardNombre}>{item.nombre}</Text>
            <Text style={styles.cardUnidad}>{item.unidadMedida}</Text>
          </View>
          <View style={styles.stockContainer}>
            <View style={[styles.stockBadge, { backgroundColor: stockColor }]}>
              <Text style={styles.stockValue}>{item.stockActual}</Text>
            </View>
            <Text style={styles.umbralText}>Min: {item.umbralAlerta}</Text>
          </View>
        </View>
        <View style={styles.cardFooter}>
          <Text style={styles.precioText}>
            {item.precioPorUnidad.toFixed(2)} €/ {item.unidadMedida.toLowerCase()}
          </Text>
          <Text style={[styles.statusText, { color: stockColor }]}>
            {status === 'out' ? 'SIN STOCK' : status === 'low' ? 'BAJO STOCK' : 'OK'}
          </Text>
        </View>
      </Card>
    );
  };

  if (loading) {
    return <Loading fullScreen message="Cargando inventario..." />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.kpiContainer}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiValue}>{ingredientes.length}</Text>
          <Text style={styles.kpiLabel}>Ingredientes</Text>
        </View>
        <View style={[styles.kpiCard, { backgroundColor: colors.primaryLight }]}>
          <Text style={[styles.kpiValue, { color: colors.primary }]}>{totalValue.toFixed(2)}€</Text>
          <Text style={[styles.kpiLabel, { color: colors.primary }]}>Valor Stock</Text>
        </View>
        <View style={[styles.kpiCard, { backgroundColor: colors.warningLight }]}>
          <Text style={[styles.kpiValue, { color: colors.warning }]}>{lowStockCount}</Text>
          <Text style={[styles.kpiLabel, { color: colors.warning }]}>Bajo Stock</Text>
        </View>
        <View style={[styles.kpiCard, { backgroundColor: colors.errorLight }]}>
          <Text style={[styles.kpiValue, { color: colors.error }]}>{outOfStockCount}</Text>
          <Text style={[styles.kpiLabel, { color: colors.error }]}>Sin Stock</Text>
        </View>
      </View>

      <View style={styles.header}>
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, !showAlertsOnly && styles.tabActive]}
            onPress={() => setShowAlertsOnly(false)}
          >
            <Text style={[styles.tabText, !showAlertsOnly && styles.tabTextActive]}>
              Todo ({ingredientes.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, showAlertsOnly && styles.tabActive]}
            onPress={() => setShowAlertsOnly(true)}
          >
            <Text style={[styles.tabText, showAlertsOnly && styles.tabTextActive]}>
              ⚠️ Alertas ({alertCount})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filteredIngredients}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {showAlertsOnly ? 'No hay alertas de stock' : 'No hay ingredientes'}
            </Text>
          </View>
        }
      />

      <Modal visible={showStockModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Actualizar Stock</Text>
          {selectedIngrediente && (
            <>
              <Text style={styles.modalNombre}>{selectedIngrediente.nombre}</Text>
              <View style={styles.modalInfo}>
                <Text style={styles.modalInfoText}>
                  Stock actual: {selectedIngrediente.stockActual} {selectedIngrediente.unidadMedida}
                </Text>
                <Text style={styles.modalInfoText}>
                  Umbral alerta: {selectedIngrediente.umbralAlerta}
                </Text>
              </View>
              <TextInput
                style={styles.modalInput}
                value={newStock}
                onChangeText={setNewStock}
                keyboardType="decimal-pad"
                placeholder="Nueva cantidad"
                autoFocus
              />
              <View style={styles.modalButtons}>
                <Button
                  title="Cancelar"
                  onPress={() => setShowStockModal(false)}
                  variant="secondary"
                  style={styles.modalButton}
                />
                <Button
                  title="Guardar"
                  onPress={handleUpdateStock}
                  loading={savingStock}
                  style={styles.modalButton}
                />
              </View>
            </>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  kpiContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.surface,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  kpiValue: {
    ...typography.h3,
    color: colors.text,
  },
  kpiLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  header: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabs: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tab: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    backgroundColor: colors.background,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.surface,
  },
  list: {
    padding: spacing.md,
  },
  card: {
    marginBottom: spacing.sm,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  cardNombre: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  cardUnidad: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  stockContainer: {
    alignItems: 'flex-end',
  },
  stockBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  stockValue: {
    ...typography.h3,
    color: colors.surface,
  },
  umbralText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  precioText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  modalContainer: {
    flex: 1,
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  modalTitle: {
    ...typography.h2,
    color: colors.text,
  },
  modalNombre: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.lg,
  },
  modalInfo: {
    marginTop: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 8,
  },
  modalInfoText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  modalInput: {
    ...typography.h2,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  modalButton: {
    flex: 1,
  },
});
