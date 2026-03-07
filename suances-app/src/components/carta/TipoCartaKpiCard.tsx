import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../common';
import { useTipoCartaStore } from '../../store/tipoCartaStore';
import { colors, spacing, typography, borderRadius } from '../../theme';

interface TipoCartaKpiCardProps {
  navigation: any;
}

export const TipoCartaKpiCard: React.FC<TipoCartaKpiCardProps> = ({ navigation }) => {
  const { tiposCarta, fetchTiposCarta } = useTipoCartaStore();

  useEffect(() => {
    fetchTiposCarta();
  }, []);

  const tiposCartaToShow = tiposCarta.slice(0, 2);

  const formatHora = (hora: string) => {
    return hora.substring(0, 5);
  };

  return (
    <Card style={styles.container} onPress={() => navigation.navigate('TiposCarta')}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons name="list" size={20} color={colors.accent} />
          <Text style={styles.title}>Tipos de Carta</Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('TipoCartaForm')}
          >
            <Ionicons name="add" size={20} color={colors.accent} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('TiposCarta')}
          >
            <Ionicons name="arrow-forward" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.list}>
        {tiposCartaToShow.length === 0 ? (
          <Text style={styles.emptyText}>No hay tipos de carta</Text>
        ) : (
          tiposCartaToShow.map((tipo) => (
            <View key={tipo.id} style={styles.item}>
              <View style={styles.itemContent}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {tipo.nombre}
                </Text>
                <Text style={styles.itemPlatos}>
                  {tipo.platos?.length || 0} platos
                </Text>
              </View>
              <Text style={styles.itemHorario}>
                {formatHora(tipo.horaInicio)} - {formatHora(tipo.horaFin)}
              </Text>
            </View>
          ))
        )}
      </View>

      {tiposCarta.length > 2 && (
        <Text style={styles.moreText}>+{tiposCarta.length - 2} más</Text>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    minHeight: 140,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  iconButton: {
    padding: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
  },
  list: {
    gap: spacing.xs,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  itemName: {
    ...typography.body,
    fontWeight: '500',
    color: colors.text,
    flex: 1,
  },
  itemPlatos: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  itemHorario: {
    ...typography.bodySmall,
    color: colors.accent,
    fontWeight: '500',
  },
  moreText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  emptyText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
});
