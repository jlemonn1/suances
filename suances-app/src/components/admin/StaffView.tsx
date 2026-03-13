import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer, NavigationIndependentTree } from '@react-navigation/native';
import { SafeAreaInsetsContext, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StaffNavigator } from '../../navigation/StaffNavigator';
import { colors } from '../../theme';

export const StaffView: React.FC = () => {
  const parentInsets = useSafeAreaInsets();
  const overlayInsets = useMemo(
    () => ({
      top: 0,
      bottom: parentInsets.bottom,
      left: parentInsets.left,
      right: parentInsets.right,
    }),
    [parentInsets.bottom, parentInsets.left, parentInsets.right]
  );

  return (
    <View style={styles.container}>
      <SafeAreaInsetsContext.Provider value={overlayInsets}>
        <NavigationIndependentTree>
          <NavigationContainer independent>
            <StaffNavigator />
          </NavigationContainer>
        </NavigationIndependentTree>
      </SafeAreaInsetsContext.Provider>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
