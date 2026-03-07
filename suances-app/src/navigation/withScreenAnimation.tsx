import React, { useRef, useCallback } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

// HOC que añade animación de entrada a cualquier componente de pantalla
// La animación se ejecuta CADA VEZ que la pantalla recibe el foco
export function withScreenAnimation<P extends object>(
  WrappedComponent: React.ComponentType<P>
): React.FC<P> {
  return (props: P) => {
    const translateX = useRef(new Animated.Value(350)).current;
    const opacity = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(0.9)).current;
    const borderRadius = useRef(new Animated.Value(20)).current;

    useFocusEffect(
      useCallback(() => {
        // Reset values a posición inicial
        translateX.setValue(350);
        opacity.setValue(0);
        scale.setValue(0.9);
        borderRadius.setValue(20);

        // Animación de entrada tipo "liquid" muy visible
        Animated.parallel([
          // Movimiento desde la derecha
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            friction: 6,
            tension: 35,
          }),
          // Fade in
          Animated.timing(opacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          // Escalado
          Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
            friction: 6,
            tension: 35,
          }),
          // Border radius que se reduce (efecto gota)
          Animated.timing(borderRadius, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]).start();
      }, [])
    );

    const animatedStyle = {
      transform: [
        { translateX },
        { scale },
      ],
      opacity,
      borderRadius,
      overflow: 'hidden' as const,
      flex: 1,
    };

    return (
      <Animated.View style={[styles.container, animatedStyle]}>
        <View style={styles.innerContainer}>
          <WrappedComponent {...props} />
        </View>
      </Animated.View>
    );
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  innerContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
});
