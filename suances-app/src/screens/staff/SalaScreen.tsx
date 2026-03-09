import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  RefreshControl,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SalaOperativaHeader, MODO_STORAGE_KEY } from '../../components/sala/SalaOperativaHeader';
import { SalaOperativaCanvas } from '../../components/sala/SalaOperativaCanvas';
import { Loading } from '../../components/common';
import { colors, spacing } from '../../theme';
import { useSalaStore } from '../../store/salaStore';
import { salaService } from '../../services/salaService';
import { useSalaSSE } from '../../hooks/useSalaSSE';
import type { MesaOperativa, FranjaHoraria, Sala } from '../../types/sala';
import { ModalNuevaComanda } from './ModalNuevaComanda';

export const SalaScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [refreshing, setRefreshing] = useState(false);
  const [showNuevaComanda, setShowNuevaComanda] = useState(false);
  const [mesaSeleccionada, setMesaSeleccionada] = useState<MesaOperativa | null>(null);
  
  // Estados para franjas y salas
  const [franjas, setFranjas] = useState<FranjaHoraria[]>([]);
  const [salas, setSalas] = useState<Sala[]>([]);
  const [salaSeleccionada, setSalaSeleccionada] = useState<string>('');
  const [franjaSeleccionada, setFranjaSeleccionada] = useState<string>('');
  const [modoVisualizacion, setModoVisualizacion] = useState<'grid' | 'coordenadas'>('grid');
  
  const {
    mesas,
    loadingMesas,
    errorMesas,
    fetchMesas,
  } = useSalaStore();

  // Conectar a SSE para actualizaciones en tiempo real
  useSalaSSE({ enabled: true, salaId: salaSeleccionada });

  // Cargar modo guardado y datos iniciales
  useEffect(() => {
    cargarModoGuardado();
    cargarFranjas();
    cargarSalas();
  }, []);

  // Cargar mesas cuando cambia la sala o la franja
  useEffect(() => {
    console.log('[SalaScreen] useEffect salaSeleccionada cambió:', salaSeleccionada);
    if (salaSeleccionada) {
      console.log('[SalaScreen] Llamando loadMesas con sala:', salaSeleccionada);
      loadMesas();
    }
  }, [salaSeleccionada, franjaSeleccionada, loadMesas]);

  const cargarModoGuardado = async () => {
    try {
      const modoGuardado = await AsyncStorage.getItem(MODO_STORAGE_KEY);
      if (modoGuardado === 'coordenadas') {
        setModoVisualizacion('coordenadas');
      }
    } catch (e) {
      console.error('Error cargando modo:', e);
    }
  };

  const cargarFranjas = async () => {
    try {
      const franjasData = await salaService.getFranjas();
      const franjasActivas = franjasData.filter(f => f.activa);
      setFranjas(franjasActivas);
    } catch (error) {
      console.error('Error cargando franjas:', error);
    }
  };

  const cargarSalas = async () => {
    try {
      console.log('[SalaScreen] Cargando salas...');
      const salasData = await salaService.getSalas();
      console.log('[SalaScreen] Salas recibidas:', salasData.length);
      const salasActivas = salasData
        .filter(s => s.activa)
        .map(s => ({ id: s.id, nombre: s.nombre, capacidadMaxima: s.capacidadMaxima, activa: s.activa }));
      setSalas(salasActivas);
      
      // Seleccionar primera sala por defecto
      if (salasActivas.length > 0 && !salaSeleccionada) {
        console.log('[SalaScreen] Seleccionando primera sala:', salasActivas[0].id);
        setSalaSeleccionada(salasActivas[0].id);
      } else {
        console.log('[SalaScreen] No se seleccionó sala. salasActivas:', salasActivas.length, 'salaSeleccionada:', salaSeleccionada);
      }
    } catch (error) {
      console.error('[SalaScreen] Error cargando salas:', error);
    }
  };

  const loadMesas = useCallback(async () => {
    console.log('[SalaScreen] loadMesas ejecutándose. salaSeleccionada:', salaSeleccionada, 'franjaSeleccionada:', franjaSeleccionada);
    if (salaSeleccionada) {
      console.log('[SalaScreen] Llamando fetchMesas con salaId:', salaSeleccionada, 'franjaId:', franjaSeleccionada);
      await fetchMesas({ salaId: salaSeleccionada, franjaId: franjaSeleccionada || undefined });
      console.log('[SalaScreen] fetchMesas completado');
    }
  }, [fetchMesas, salaSeleccionada, franjaSeleccionada]);

  useFocusEffect(
    useCallback(() => {
      if (salaSeleccionada) {
        loadMesas();
      }
    }, [loadMesas, salaSeleccionada])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMesas();
    setRefreshing(false);
  };

  const handleMesaPress = (mesa: MesaOperativa) => {
    setMesaSeleccionada(mesa);

    if (mesa.estadoOperativo === 'LIBRE') {
      setShowNuevaComanda(true);
    } else if (mesa.estadoOperativo === 'OCUPADA' && mesa.comandaActivaId) {
      navigation.navigate('ComandaDetail', { comandaId: mesa.comandaActivaId });
    } else if (mesa.estadoOperativo === 'RESERVADA') {
      Alert.alert('Mesa Reservada', `Cliente: ${mesa.nombreClienteReserva || 'Sin nombre'}`);
    }
  };

  const handleCrearComanda = () => {
    setShowNuevaComanda(false);
    loadMesas();
  };

  const handleModoChange = (nuevoModo: 'grid' | 'coordenadas') => {
    setModoVisualizacion(nuevoModo);
  };

  const handleSalaChange = (salaId: string) => {
    setSalaSeleccionada(salaId);
  };

  const handleFranjaChange = (franjaId: string | null) => {
    console.log('[SalaScreen] Franja cambió:', franjaId);
    if (franjaId) {
      setFranjaSeleccionada(franjaId);
    }
  };

  if (loadingMesas && mesas.length === 0) {
    return <Loading fullScreen message="Cargando mesas..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerContainer}>
        <SalaOperativaHeader
          franjas={franjas}
          salas={salas}
          salaSeleccionada={salaSeleccionada}
          onSalaChange={handleSalaChange}
          modoVisualizacion={modoVisualizacion}
          onModoChange={handleModoChange}
          onFranjaChange={handleFranjaChange}
        />
      </View>
      
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.canvasContainer}>
          <SalaOperativaCanvas
            mesas={mesas}
            onMesaPress={handleMesaPress}
            modo={modoVisualizacion}
          />
        </View>
      </ScrollView>

      <ModalNuevaComanda
        visible={showNuevaComanda}
        mesa={mesaSeleccionada}
        onClose={() => {
          setShowNuevaComanda(false);
          setMesaSeleccionada(null);
        }}
        onCreated={handleCrearComanda}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerContainer: {
    backgroundColor: colors.surface,
    zIndex: 10,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  canvasContainer: {
    flex: 1,
    paddingVertical: spacing.sm,
  },
});
