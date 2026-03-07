import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, LayoutChangeEvent, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { DateSelector } from './DateSelector';

interface QuickActionsBarProps {
  onNuevaReserva: () => void;
  onReservasOnline: () => void;
  onSalas: () => void;
  onFranjas: () => void;
  scrollY: Animated.Value;
  fecha: string;
  onChangeFecha: (fecha: string) => void;
  onSearch: (query: string) => void;
  total: number;
  confirmadas: number;
  canceladas: number;
  espera: number;
}

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const formatFechaDisplay = (fecha: string): string => {
  const [year, month, day] = fecha.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return `${DAYS[date.getDay()]} ${day} ${MONTHS[date.getMonth()]}`;
};

export const QuickActionsBar: React.FC<QuickActionsBarProps> = ({
  onNuevaReserva,
  onReservasOnline,
  onSalas,
  onFranjas,
  scrollY,
  fecha,
  onChangeFecha,
  onSearch,
  total,
  confirmadas,
  canceladas,
  espera,
}) => {
  const [baseHeight, setBaseHeight] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const searchInputRef = useRef<TextInput>(null);
  const searchHeightAnim = useRef(new Animated.Value(0)).current;

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const height = event.nativeEvent.layout.height;
    if (height > 0 && baseHeight === 0) {
      setBaseHeight(height);
    }
  }, [baseHeight]);

  useEffect(() => {
    Animated.timing(searchHeightAnim, {
      toValue: isSearchOpen ? 50 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [isSearchOpen]);

  const toggleSearch = () => {
    const newState = !isSearchOpen;
    setIsSearchOpen(newState);
    if (newState) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    } else {
      setSearchText('');
      onSearch('');
    }
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchText('');
    onSearch('');
  };

  const handleSearchChange = (text: string) => {
    setSearchText(text);
    onSearch(text);
  };

  const expandedStyle = {
    opacity: scrollY.interpolate({
      inputRange: [0, 50, 100],
      outputRange: [1, 0.3, 0],
      extrapolate: 'clamp',
    }),
    height: scrollY.interpolate({
      inputRange: [0, 50, 100],
      outputRange: [baseHeight || 200, 100, 0],
      extrapolate: 'clamp',
    }),
  };

  const collapsedStyle = {
    opacity: scrollY.interpolate({
      inputRange: [50, 100, 150],
      outputRange: [0, 0.5, 1],
      extrapolate: 'clamp',
    }),
  };

  const searchContainerStyle = {
    height: searchHeightAnim,
    opacity: searchHeightAnim.interpolate({
      inputRange: [0, 25, 50],
      outputRange: [0, 0.5, 1],
      extrapolate: 'clamp' as const,
    }),
    overflow: 'hidden' as const,
  };

  return (
    <View style={styles.wrapper}>
      <Animated.View 
        style={[styles.expandedContainer, expandedStyle]} 
        onLayout={handleLayout}
      >
        <View style={styles.row}>
          <TouchableOpacity style={styles.primaryButton} onPress={onNuevaReserva} activeOpacity={0.8}>
            <Ionicons name="add-circle" size={22} color={colors.surface} />
            <Text style={styles.primaryText}>Nueva Reserva</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={onReservasOnline} activeOpacity={0.8}>
            <Ionicons name="globe" size={20} color={colors.surface} />
            <Text style={styles.secondaryText}>Reservas Online</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.row}>
          <TouchableOpacity style={styles.iconButton} onPress={onSalas} activeOpacity={0.7}>
            <Ionicons name="grid" size={18} color={colors.accent} />
            <Text style={styles.iconText}>Salas</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={onFranjas} activeOpacity={0.7}>
            <Ionicons name="time" size={18} color={colors.accent} />
            <Text style={styles.iconText}>Franjas</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.dateSearchRow}>
          <View style={styles.dateContainer}>
            <DateSelector fecha={fecha} onChangeFecha={onChangeFecha} />
          </View>
          <TouchableOpacity style={styles.searchIconButton} onPress={toggleSearch} activeOpacity={0.7}>
            <Ionicons name="search" size={22} color={colors.accent} />
          </TouchableOpacity>
        </View>
        <Animated.View style={[styles.searchContainer, searchContainerStyle]}>
          <View style={styles.searchInputWrapper}>
            <Ionicons name="search" size={18} color={colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              ref={searchInputRef}
              style={styles.searchInput}
              placeholder="Buscar por nombre o teléfono..."
              value={searchText}
              onChangeText={handleSearchChange}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity onPress={closeSearch} style={styles.closeSearchButton}>
              <Ionicons name="close-circle" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </Animated.View>
        <View style={styles.metricsRow}>
          <Text style={styles.metricsText}>
            Total: {total} · Confirmadas: {confirmadas} · Canceladas: {canceladas} · Espera: {espera}
          </Text>
        </View>
      </Animated.View>

      <Animated.View style={[styles.collapsedContainer, collapsedStyle]}>
        <View style={styles.collapsedDateRow}>
          <Ionicons name="calendar" size={18} color={colors.surface} />
          <Text style={styles.collapsedDateText}>{formatFechaDisplay(fecha)}</Text>
        </View>
        <TouchableOpacity style={styles.collapsedButton} onPress={onNuevaReserva} activeOpacity={0.8}>
          <Ionicons name="add-circle" size={26} color={colors.surface} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.collapsedButton} onPress={onReservasOnline} activeOpacity={0.8}>
          <Ionicons name="globe" size={26} color={colors.surface} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.collapsedButton} onPress={onSalas} activeOpacity={0.7}>
          <Ionicons name="grid" size={26} color={colors.surface} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.collapsedButton} onPress={onFranjas} activeOpacity={0.7}>
          <Ionicons name="time" size={26} color={colors.surface} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.collapsedButton, styles.searchCollapsedButton]} onPress={toggleSearch} activeOpacity={0.7}>
          <Ionicons name="search" size={26} color={colors.surface} />
        </TouchableOpacity>
        {isSearchOpen && (
          <View style={styles.collapsedSearchOverlay}>
            <View style={styles.searchInputWrapper}>
              <Ionicons name="search" size={18} color={colors.textSecondary} style={styles.searchIcon} />
              <TextInput
                ref={searchInputRef}
                style={styles.searchInput}
                placeholder="Buscar..."
                value={searchText}
                onChangeText={handleSearchChange}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity onPress={closeSearch} style={styles.closeSearchButton}>
                <Ionicons name="close-circle" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    zIndex: 100,
  },
  expandedContainer: {
    gap: spacing.xs,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  collapsedContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    zIndex: 101,
  },
  collapsedDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginRight: spacing.sm,
    flex: 1,
  },
  collapsedDateText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: '600',
  },
  collapsedButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.xs,
  },
  searchCollapsedButton: {
    marginLeft: 'auto',
  },
  collapsedSearchOverlay: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    backgroundColor: colors.primary,
    padding: spacing.sm,
    zIndex: 102,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  dateSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: spacing.xs,
    width: '100%',
  },
  dateContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  searchIconButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginLeft: spacing.sm,
  },
  searchContainer: {
    marginTop: spacing.xs,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    height: 44,
  },
  searchIcon: {
    marginRight: spacing.xs,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    height: '100%',
  },
  closeSearchButton: {
    padding: spacing.xs,
  },
  metricsRow: {
    marginTop: spacing.xs,
  },
  metricsText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.accent,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  primaryText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  secondaryText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  iconButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
});
