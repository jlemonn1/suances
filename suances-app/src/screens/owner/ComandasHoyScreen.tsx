import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { useSalaStore } from '../../store/salaStore';
import { EmptyState } from '../../components/common';
import type { ComandaHoyResponse, ComandaEstado } from '../../types/sala';

const getEstadoColor = (estado: ComandaEstado): string => {
  switch (estado) {
    case 'ABIERTA':
      return colors.warning;
    case 'EN_PREPARACION':
      return colors.primary;
    case 'SERVIDA':
      return colors.success;
    case 'CUENTA':
      return colors.error;
    case 'COBRADA':
      return colors.success;
    case 'CANCELADA':
      return colors.textSecondary;
    default:
      return colors.textSecondary;
  }
};

const getEstadoIcon = (estado: ComandaEstado): keyof typeof Ionicons.glyphMap => {
  switch (estado) {
    case 'ABIERTA':
      return 'time-outline';
    case 'EN_PREPARACION':
      return 'restaurant-outline';
    case 'SERVIDA':
      return 'checkmark-circle-outline';
    case 'CUENTA':
      return 'receipt-outline';
    case 'COBRADA':
      return 'cash-outline';
    case 'CANCELADA':
      return 'close-circle-outline';
    default:
      return 'help-circle-outline';
  }
};

const formatearHora = (fecha: string): string => {
  return new Date(fecha).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatearDuracion = (minutos: number): string => {
  if (minutos < 60) {
    return `${minutos}m`;
  }
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;
  return `${horas}h ${mins}m`;
};

export const ComandasHoyScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const {
    comandasHoy,
    loadingComandasHoy,
    errorComandasHoy,
    fetchComandasHoy,
  } = useSalaStore();

  const [refreshing, setRefreshing] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState<ComandaEstado | 'TODAS'>('TODAS');

  // Cargar comandas al montar el componente
  useEffect(() => {
    loadComandas();
  }, []);

  // Auto-refresh cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      fetchComandasHoy();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadComandas = useCallback(async () => {
    try {
      await fetchComandasHoy();
    } catch (error) {
      console.error('Error cargando comandas:', error);
    }
  }, [fetchComandasHoy]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadComandas();
    setRefreshing(false);
  }, [loadComandas]);

  const handleComandaPress = (comanda: ComandaHoyResponse) => {
    navigation.navigate('ComandaDetail', { comandaId: comanda.id });
  };

  const comandasFiltradas = filtroEstado === 'TODAS' 
    ? comandasHoy 
    : comandasHoy.filter(c => c.estado === filtroEstado);

  const renderComandaItem = ({ item }: { item: ComandaHoyResponse }) => {
    const duracionMinutos = Math.floor(
      (new Date().getTime() - new Date(item.fechaApertura).getTime()) / 60000
    );

    return (
      <TouchableOpacity
        style={styles.comandaCard}
        onPress={() => handleComandaPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.comandaHeader}>
          <View style={styles.comandaInfo}>
            <Text style={styles.comandaCodigo}>{item.codigo}</Text>
            <Text style={styles.comandaMesa}>
              Mesa {item.mesaNumero} • {item.nombreSala || 'Sala'}
            </Text>
          </View>
          <View style={[styles.estadoBadge, { backgroundColor: getEstadoColor(item.estado) + '20' }]}>
            <Ionicons 
              name={getEstadoIcon(item.estado)} 
              size={14} 
              color={getEstadoColor(item.estado)} 
            />
            <Text style={[styles.estadoText, { color: getEstadoColor(item.estado) }]}>
              {item.estado.replace('_', ' ')}
            </Text>
          </View>
        </View>

        <View style={styles.comandaDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="person-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.detailText}>{item.camareroNombre || 'Sin asignar'}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="people-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.detailText}>{item.numeroComensales} comensales</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.detailText}>
              {formatearHora(item.fechaApertura)} • {formatearDuracion(duracionMinutos)}
            </Text>
          </View>
        </View>

        <View style={styles.comandaFooter}>
          {item.descuentoPorcentaje > 0 && (
            <View style={styles.descuentoBadge}>
              <Text style={styles.descuentoText}>-{item.descuentoPorcentaje}%</Text>
            </View>
          )}
          <Text style={styles.totalText}>{item.total.toFixed(2)}€</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFiltro = () => {
    const filtros: { label: string; value: ComandaEstado | 'TODAS' }[] = [
      { label: 'Todas', value: 'TODAS' },
      { label: 'Abiertas', value: 'ABIERTA' },
      { label: 'En Prep.', value: 'EN_PREPARACION' },
      { label: 'Servidas', value: 'SERVIDA' },
      { label: 'Cuenta', value: 'CUENTA' },
      { label: 'Cobradas', value: 'COBRADA' },
    ];

    return (
      <View style={styles.filtrosContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filtros}
          keyExtractor={(item) => item.value}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filtroButton,
                filtroEstado === item.value && styles.filtroButtonActive,
              ]}
              onPress={() => setFiltroEstado(item.value)}
            >
              <Text
                style={[
                  styles.filtroText,
                  filtroEstado === item.value && styles.filtroTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.filtrosContent}
        />
      </View>
    );
  };

  const renderResumen = () => {
    const totalComandas = comandasHoy.length;
    const totalAbierta = comandasHoy.filter(c => c.estado === 'ABIERTA').length;
    const totalCuenta = comandasHoy.filter(c => c.estado === 'CUENTA').length;
    const totalCobrado = comandasHoy
      .filter(c => c.estado === 'COBRADA')
      .reduce((sum, c) => sum + c.total, 0);

    return (
      <View style={styles.resumenContainer}>
        <View style={styles.resumenCard}>
          <View style={styles.resumenItem}>
            <Text style={styles.resumenValue}>{totalComandas}</Text>
            <Text style={styles.resumenLabel}>Comandas</Text>
          </View>
          <View style={styles.resumenDivider} />
          <View style={styles.resumenItem}>
            <Text style={styles.resumenValue}>{totalAbierta}</Text>
            <Text style={styles.resumenLabel}>Abiertas</Text>
          </View>
          <View style={styles.resumenDivider} />
          <View style={styles.resumenItem}>
            <Text style={styles.resumenValue}>{totalCuenta}</Text>
            <Text style={styles.resumenLabel}>Cuenta</Text>
          </View>
          <View style={styles.resumenDivider} />
          <View style={styles.resumenItem}>
            <Text style={styles.resumenValue}>{totalCobrado.toFixed(0)}€</Text>
            <Text style={styles.resumenLabel}>Cobrado</Text>
          </View>
        </View>
      </View>
    );
  };

  if (loadingComandasHoy && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Cargando comandas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Comandas del Día</Text>
        <Text style={styles.headerSubtitle}>
          {new Date().toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </Text>
      </View>

      {renderResumen()}
      {renderFiltro()}

      <FlatList
        data={comandasFiltradas}
        keyExtractor={(item) => item.id}
        renderItem={renderComandaItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <EmptyState
            title="Sin comandas"
            message={
              filtroEstado === 'TODAS'
                ? "No hay comandas registradas hoy"
                : `No hay comandas en estado ${filtroEstado.replace('_', ' ')}`
            }
            icon="receipt-outline"
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.body.fontSize,
    color: colors.textSecondary,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerTitle: {
    fontSize: typography.h1.fontSize,
    fontWeight: typography.h1.fontWeight,
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: typography.body.fontSize,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textTransform: 'capitalize',
  },
  resumenContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  resumenCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  resumenItem: {
    alignItems: 'center',
  },
  resumenValue: {
    fontSize: typography.h2.fontSize,
    fontWeight: typography.h2.fontWeight,
    color: colors.primary,
  },
  resumenLabel: {
    fontSize: typography.caption.fontSize,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  resumenDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  filtrosContainer: {
    paddingBottom: spacing.sm,
  },
  filtrosContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  filtroButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filtroButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filtroText: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textSecondary,
  },
  filtroTextActive: {
    color: colors.surface,
    fontWeight: '600',
  },
  listContent: {
    padding: spacing.md,
    paddingTop: 0,
  },
  comandaCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  comandaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  comandaInfo: {
    flex: 1,
  },
  comandaCodigo: {
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
    color: colors.text,
  },
  comandaMesa: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  estadoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    gap: 4,
  },
  estadoText: {
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  comandaDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  detailText: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textSecondary,
  },
  comandaFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  descuentoBadge: {
    backgroundColor: colors.error + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  descuentoText: {
    fontSize: typography.caption.fontSize,
    color: colors.error,
    fontWeight: '600',
  },
  totalText: {
    fontSize: typography.h2.fontSize,
    fontWeight: '700',
    color: colors.success,
  },
});
