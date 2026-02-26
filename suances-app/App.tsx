import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

import { AuthNavigator, OwnerNavigator, StaffNavigator } from './src/navigation';
import { useAuthStore } from './src/store/authStore';
import { colors } from './src/theme';

export default function App() {
  const { isAuthenticated, isLoading, loadStoredAuth, isOwner, user } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const init = async () => {
      await loadStoredAuth();
      setIsInitializing(false);
    };
    init();
  }, []);

  if (isInitializing) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      {!isAuthenticated ? (
        <AuthNavigator />
      ) : isOwner() ? (
        <OwnerNavigator />
      ) : (
        <StaffNavigator />
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
