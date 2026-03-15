import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card, Loading } from '../../components/common';
import { AlertPanel, ReservationSummary, WelcomeHero, HEADER_MAX_HEIGHT, LiveTicketsGallery } from '../../components/dashboard';
import { colors, spacing, typography } from '../../theme';
import { cartaService } from '../../services/cartaService';
import { PlatoResponse } from '../../types/plato';
import { useAuthStore } from '../../store/authStore';
import { useIngredienteStore } from '../../store/ingredienteStore';
import { usePlatoStore } from '../../store/platoStore';

export const DashboardScreen = ({ navigation }: any) => {
  const { isAuthenticated, logout, user } = useAuthStore();
  const [platos, setPlatos] = useState<PlatoResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const { fetchIngredientes } = useIngredienteStore();
  const { fetchPlatos } = usePlatoStore();

  const handleLogout = async () => {
    await logout();
  };

  const loadData = async () => {
    try {
      console.log('Loading dashboard data...');
      const platosData = await cartaService.getPlatos(true);
      console.log('Dashboard data loaded:', platosData.length, 'platos');
      setPlatos(platosData);
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
    fetchIngredientes(true);
    fetchPlatos(true);
    loadData();
  };

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false }
  );

  const platosMasPedidos = [...platos]
    .sort((a, b) => b.contadorPedidos - a.contadorPedidos)
    .slice(0, 5);

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <WelcomeHero scrollY={scrollY} navigation={navigation} />
      
      <Animated.ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        <View style={styles.content}>
          <LiveTicketsGallery />
          <View style={styles.gallerySpacer} />
          <AlertPanel />
          <ReservationSummary />

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
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    paddingBottom: 300,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  gallerySpacer: {
    height: spacing.lg,
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
