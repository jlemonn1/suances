import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { SalaChipsSelector } from './SalaChipsSelector';
import type { FranjaHoraria, Sala } from '../../types/sala';

interface Props {
  franjas: FranjaHoraria[];
  salas: Sala[];
  salaSeleccionada: string;
  onSalaChange: (salaId: string) => void;
  modoVisualizacion: 'grid' | 'coordenadas';
  onModoChange: (modo: 'grid' | 'coordenadas') => void;
  onFranjaChange?: (franjaId: string | null) => void;
}

const MODO_STORAGE_KEY = '@sala_modo_visualizacion';

export const SalaOperativaHeader: React.FC<Props> = ({
  franjas,
  salas,
  salaSeleccionada,
  onSalaChange,
  modoVisualizacion,
  onModoChange,
  onFranjaChange,
}) => {
  const [horaActual, setHoraActual] = useState(new Date());

  // Actualizar hora cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      setHoraActual(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Formatear hora actual
  const horaFormateada = horaActual.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Detectar franja según hora actual
  const getFranjaActual = (): FranjaHoraria | null => {
    const horaStr = horaActual.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    
    // Buscar franja que contenga la hora actual
    const franjaEnCurso = franjas.find(f => {
      return horaStr >= f.horaInicio && horaStr <= f.horaFin;
    });
    
    if (franjaEnCurso) return franjaEnCurso;
    
    // Si no está en ninguna, buscar la más próxima (siguiente)
    const franjasFuturas = franjas.filter(f => f.horaInicio > horaStr);
    if (franjasFuturas.length > 0) {
      return franjasFuturas[0];
    }
    
    // Si no hay futuras, devolver la última del día
    return franjas.length > 0 ? franjas[franjas.length - 1] : null;
  };

  const franjaActual = getFranjaActual();

  // Notificar al padre cuando cambia la franja
  useEffect(() => {
    if (onFranjaChange && franjaActual) {
      onFranjaChange(franjaActual.id);
    } else if (onFranjaChange) {
      onFranjaChange(null);
    }
  }, [franjaActual?.id, onFranjaChange]);

  const handleToggleModo = async () => {
    const nuevoModo = modoVisualizacion === 'grid' ? 'coordenadas' : 'grid';
    onModoChange(nuevoModo);
    try {
      await AsyncStorage.setItem(MODO_STORAGE_KEY, nuevoModo);
    } catch (e) {
      console.error('Error guardando modo:', e);
    }
  };

  return (
    <View style={styles.container}>
      {/* Primera línea: Hora, Franja, Toggle */}
      <View style={styles.headerRow}>
        <View style={styles.horaFranjaContainer}>
          <Text style={styles.horaText}>{horaFormateada}</Text>
          <Text style={styles.separator}>|</Text>
          {franjaActual ? (
            <Text style={styles.franjaText}>
              {franjaActual.nombre} ({franjaActual.horaInicio}-{franjaActual.horaFin})
            </Text>
          ) : (
            <Text style={styles.franjaTextEmpty}>Sin franja</Text>
          )}
        </View>
        
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleButton, modoVisualizacion === 'grid' && styles.toggleButtonActive]}
            onPress={() => handleToggleModo()}
          >
            <Ionicons 
              name="grid" 
              size={20} 
              color={modoVisualizacion === 'grid' ? colors.surface : colors.textSecondary} 
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, modoVisualizacion === 'coordenadas' && styles.toggleButtonActive]}
            onPress={() => handleToggleModo()}
          >
            <Ionicons 
              name="map" 
              size={20} 
              color={modoVisualizacion === 'coordenadas' ? colors.surface : colors.textSecondary} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Selector de Sala con Chips */}
      <SalaChipsSelector
        salas={salas}
        salaSeleccionada={salaSeleccionada}
        onSalaChange={onSalaChange}
      />
    </View>
  );
};

export { MODO_STORAGE_KEY };

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  horaFranjaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  horaText: {
    ...typography.h3,
    color: colors.text,
    fontWeight: '700',
  },
  separator: {
    ...typography.h3,
    color: colors.textSecondary,
    marginHorizontal: spacing.sm,
  },
  franjaText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flex: 1,
  },
  franjaTextEmpty: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: 2,
  },
  toggleButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  toggleButtonActive: {
    backgroundColor: colors.primary,
  },
});
