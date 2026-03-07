import React, { useCallback, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
  Platform,
} from 'react-native';
import { colors, spacing } from '../../theme';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

interface AIGuideContainerProps {
  children: React.ReactNode;
  onRefresh?: () => Promise<void>;
}

export const AIGuideContainer: React.FC<AIGuideContainerProps> = ({
  children,
  onRefresh,
}) => {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    if (onRefresh) {
      setRefreshing(true);
      await onRefresh();
      setRefreshing(false);
    }
  }, [onRefresh]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.contentContainer,
        isTablet && styles.contentContainerTablet,
      ]}
      showsVerticalScrollIndicator={true}
      indicatorStyle="black"
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        ) : undefined
      }
      bounces={true}
      alwaysBounceVertical={true}
      overScrollMode="always"
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    >
      {children}
      {/* Espacio adicional al final para mejor UX */}
      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: Platform.OS === 'ios' ? 120 : 100,
    flexGrow: 1,
  },
  contentContainerTablet: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    maxWidth: 700,
    alignSelf: 'center',
    width: '100%',
  },
  bottomPadding: {
    height: 60,
  },
});
