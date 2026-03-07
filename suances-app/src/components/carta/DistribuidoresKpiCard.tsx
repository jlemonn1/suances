import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../common';
import { useDistribuidorStore } from '../../store/distribuidorStore';
import { colors, spacing, typography, borderRadius } from '../../theme';

interface DistribuidoresKpiCardProps {
  navigation: any;
}

export const DistribuidoresKpiCard: React.FC<DistribuidoresKpiCardProps> = ({ navigation }) => {
  const { distribuidores, fetchDistribuidores } = useDistribuidorStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [animation] = useState(new Animated.Value(0));

  useEffect(() => {
    fetchDistribuidores(true);
  }, []);

  const toggleExpand = () => {
    const toValue = isExpanded ? 0 : 1;
    Animated.spring(animation, {
      toValue,
      useNativeDriver: false,
      friction: 8,
      tension: 40,
    }).start();
    setIsExpanded(!isExpanded);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigation.navigate('Distribuidores', { searchQuery: searchQuery.trim() });
      setSearchQuery('');
      setIsExpanded(false);
      animation.setValue(0);
    }
  };

  const distribuidoresToShow = distribuidores.slice(0, 3);

  const containerHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [220, 280],
  });

  return (
    <Animated.View style={[styles.animatedContainer, { height: containerHeight }]}>
      <Card style={styles.container} onPress={() => !isExpanded && navigation.navigate('Distribuidores')}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Ionicons name="car" size={20} color={colors.primary} />
            <Text style={styles.title}>Distribuidores</Text>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={toggleExpand}
            >
              <Ionicons 
                name={isExpanded ? "close" : "search"} 
                size={20} 
                color={isExpanded ? colors.error : colors.accent} 
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate('Distribuidores')}
            >
              <Ionicons name="arrow-forward" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {isExpanded && (
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Ionicons name="search" size={18} color={colors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar distribuidor..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
                autoFocus
              />
            </View>
            <TouchableOpacity
              style={styles.searchButton}
              onPress={handleSearch}
              disabled={!searchQuery.trim()}
            >
              <Ionicons name="arrow-forward" size={20} color={colors.surface} />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.contactsList}>
          {distribuidoresToShow.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={32} color={colors.textSecondary} />
              <Text style={styles.emptyText}>No hay distribuidores</Text>
            </View>
          ) : (
            distribuidoresToShow.map((distribuidor, index) => (
              <View key={distribuidor.id} style={styles.contactItem}>
                <View style={styles.contactAvatar}>
                  <Text style={styles.contactInitial}>
                    {distribuidor.nombre.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName} numberOfLines={1}>
                    {distribuidor.nombre}
                  </Text>
                  <View style={styles.contactDetails}>
                    {distribuidor.telefono && (
                      <View style={styles.contactDetail}>
                        <Ionicons name="call-outline" size={12} color={colors.textSecondary} />
                        <Text style={styles.contactDetailText} numberOfLines={1}>
                          {distribuidor.telefono}
                        </Text>
                      </View>
                    )}
                    {distribuidor.email && (
                      <View style={styles.contactDetail}>
                        <Ionicons name="mail-outline" size={12} color={colors.textSecondary} />
                        <Text style={styles.contactDetailText} numberOfLines={1}>
                          {distribuidor.email}
                        </Text>
                      </View>
                    )}
                    {!distribuidor.telefono && !distribuidor.email && (
                      <Text style={styles.noContactText}>Sin información de contacto</Text>
                    )}
                  </View>
                </View>
                <TouchableOpacity 
                  style={styles.contactAction}
                  onPress={() => navigation.navigate('DistribuidorDetail', { distribuidorId: distribuidor.id })}
                >
                  <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {distribuidores.length > 3 && (
          <Text style={styles.moreText}>
            +{distribuidores.length - 3} distribuidores más
          </Text>
        )}
      </Card>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  animatedContainer: {
    overflow: 'hidden',
  },
  container: {
    flex: 1,
    padding: spacing.md,
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
  searchContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    padding: 0,
  },
  searchButton: {
    backgroundColor: colors.accent,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
  },
  contactsList: {
    gap: spacing.sm,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactInitial: {
    ...typography.h3,
    color: colors.surface,
    fontSize: 18,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  contactDetails: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: 2,
  },
  contactDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  contactDetailText: {
    ...typography.caption,
    color: colors.textSecondary,
    maxWidth: 80,
  },
  noContactText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  contactAction: {
    padding: spacing.xs,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  emptyText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  moreText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
});
