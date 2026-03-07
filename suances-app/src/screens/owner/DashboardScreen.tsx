import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card, Loading } from '../../components/common';
import { colors, spacing, typography } from '../../theme';
import { cartaService } from '../../services/cartaService';
import { PlatoResponse } from '../../types/plato';
import { IngredienteResponse } from '../../types/ingrediente';
import { useAuthStore } from '../../store/authStore';

export const DashboardScreen = ({ navigation }: any) => {
  const { isAuthenticated, logout, user } = useAuthStore();
  const [platos, setPlatos] = useState<PlatoResponse[]>([]);
  const [ingredientes, setIngredientes] = useState<IngredienteResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  const loadData = async () => {
    try {
      console.log('Loading dashboard data...');
      const [platosData, ingredientesData] = await Promise.all([
        cartaService.getPlatos(true),
        cartaService.getIngredientes(true),
      ]);
      console.log('Dashboard data loaded:', platosData.length, 'platos,', ingredientesData.length, 'ingredientes');
      setPlatos(platosData);
      setIngredientes(ingredientesData);
    } catch (error: any) {
      console.error('Error loading dashboard:', error?.response?.status, error?.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      console.log('Dashboard: auth ready, loading data');
      loadData();
    }
  }, [isAuthenticated]);

  if (loading) {
    return <Loading fullScreen message="Cargando dashboard..." />;
  }

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const ingredientesBajoStock = ingredientes.filter(
    (i) => i.stockActual <= i.umbralAlerta
  );

  const platosMasPedidos = [...platos]
    .sort((a, b) => b.contadorPedidos - a.contadorPedidos)
    .slice(0, 5);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Dashboard</Text>
            <Text style={styles.subtitle}>{user?.nombre}</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>🚪 Salir</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>{platos.length}</Text>
            <Text style={styles.statLabel}>Platos Activos</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>{ingredientes.length}</Text>
            <Text style={styles.statLabel}>Ingredientes</Text>
          </Card>
        </View>

        <View style={styles.statsRow}>
          <Card style={[styles.statCard, ingredientesBajoStock.length > 0 && styles.alertCard]}>
            <Text style={[styles.statNumber, ingredientesBajoStock.length > 0 && styles.alertNumber]}>
              {ingredientesBajoStock.length}
            </Text>
            <Text style={styles.statLabel}>Stock Bajo</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>
              {platos.reduce((acc, p) => acc + p.contadorPedidos, 0)}
            </Text>
            <Text style={styles.statLabel}>Pedidos Totales</Text>
          </Card>
        </View>

        {ingredientesBajoStock.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="warning" size={18} color={colors.warning} />
              <Text style={styles.sectionTitle}> Ingredientes con Stock Bajo</Text>
            </View>
            {ingredientesBajoStock.map((ing) => (
              <Card key={ing.id} style={styles.alertItem}>
                <Text style={styles.alertItemText}>
                  {ing.nombre}: {ing.stockActual} / {ing.umbralAlerta} {ing.unidadMedida.toLowerCase()}
                </Text>
              </Card>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="flame" size={18} color={colors.accent} />
            <Text style={styles.sectionTitle}> Platos Más Pedidos</Text>
          </View>
          {platosMasPedidos.map((plato, index) => (
            <Card key={plato.id} style={styles.topItem}>
              <Text style={styles.ranking}>#{index + 1}</Text>
              <Text style={styles.topItemName}>{plato.nombre}</Text>
              <Text style={styles.topItemCount}>{plato.contadorPedidos} pedidos</Text>
            </Card>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
    paddingTop: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  logoutButton: {
    padding: spacing.sm,
  },
  logoutText: {
    ...typography.body,
    color: colors.error,
  },
  title: {
    ...typography.h1,
    color: colors.text,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.lg,
  },
  statNumber: {
    ...typography.h1,
    color: colors.primary,
  },
  statLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  alertCard: {
    borderColor: colors.error,
    borderWidth: 1,
  },
  alertNumber: {
    color: colors.error,
  },
  section: {
    marginTop: spacing.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  alertItem: {
    marginBottom: spacing.sm,
    backgroundColor: '#ffebee',
  },
  alertItemText: {
    ...typography.body,
    color: colors.error,
  },
  topItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  ranking: {
    ...typography.body,
    fontWeight: '700',
    color: colors.accent,
    width: 40,
  },
  topItemName: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  topItemCount: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
});
