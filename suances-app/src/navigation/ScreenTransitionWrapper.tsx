import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

interface ScreenTransitionWrapperProps {
  children: React.ReactNode;
  isEntering?: boolean;
}

// Wrapper que añade animación de entrada/salida a cada pantalla
export const ScreenTransitionWrapper: React.FC<ScreenTransitionWrapperProps> = ({
  children,
  isEntering = true,
}) => {
  const translateX = useRef(new Animated.Value(300)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    if (isEntering) {
      // Animación de entrada - viene desde la derecha
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          friction: 8,
          tension: 40,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          friction: 8,
          tension: 40,
        }),
      ]).start();
    }

    return () => {
      // Cleanup animations
      translateX.setValue(300);
      opacity.setValue(0);
      scale.setValue(0.95);
    };
  }, []);

  const animatedStyle = {
    transform: [
      { translateX },
      { scale },
    ],
    opacity,
  };

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
