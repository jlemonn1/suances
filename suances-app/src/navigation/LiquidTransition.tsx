// Opciones de transición tipo "liquid" muy visibles para React Navigation
// Usa animaciones nativas con efectos más notorios

import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Configuración base para transiciones visibles
const baseVisibleTransition = {
  gestureEnabled: true,
  gestureDirection: 'horizontal' as const,
  presentation: 'card' as const,
  contentStyle: {
    backgroundColor: 'white',
  },
};

// Transición tipo "slide" con efecto de escala - MUY VISIBLE
export const liquidSlideTransition = {
  ...baseVisibleTransition,
  animation: 'slide_from_right' as const,
  animationDuration: 600,
  // Añadimos un pequeño delay para que se note más
  transitionSpec: {
    open: {
      animation: 'timing' as const,
      config: {
        duration: 600,
      },
    },
    close: {
      animation: 'timing' as const,
      config: {
        duration: 400,
      },
    },
  },
};

// Transición tipo "fade" desde abajo con zoom
export const liquidFadeTransition = {
  ...baseVisibleTransition,
  animation: 'fade_from_bottom' as const,
  animationDuration: 500,
};

// Transición tipo "modal" que sube desde abajo
export const liquidModalTransition = {
  ...baseVisibleTransition,
  animation: 'slide_from_bottom' as const,
  animationDuration: 500,
  presentation: 'modal' as const,
};

// Transición tipo iOS puro nativo (simply_push es muy suave en iOS)
export const liquidSimpleTransition = {
  gestureEnabled: true,
  gestureDirection: 'horizontal' as const,
  animation: 'simple_push' as const,
  presentation: 'card' as const,
};

// Transición con efecto de "gota" - más lenta y visible
export const liquidDropTransition = {
  gestureEnabled: true,
  gestureDirection: 'horizontal' as const,
  animation: 'slide_from_right' as const,
  animationDuration: 700,
  presentation: 'card' as const,
  contentStyle: {
    backgroundColor: 'white',
  },
};

// Transición recomendada - BUEN EQUILIBRIO entre velocidad y visibilidad
export const recommendedLiquidTransition = {
  gestureEnabled: true,
  gestureDirection: 'horizontal' as const,
  animation: 'slide_from_right' as const,
  animationDuration: 500,
  presentation: 'card' as const,
  contentStyle: {
    backgroundColor: 'white',
  },
};

// Transición SÚPER LENTA para debug/efecto dramático
export const liquidSlowTransition = {
  gestureEnabled: true,
  gestureDirection: 'horizontal' as const,
  animation: 'slide_from_right' as const,
  animationDuration: 1000,
  presentation: 'card' as const,
  contentStyle: {
    backgroundColor: 'white',
  },
};

// Transición con efecto de fade + slide combinado
export const liquidFadeSlideTransition = {
  gestureEnabled: true,
  gestureDirection: 'horizontal' as const,
  animation: 'fade' as const,
  animationDuration: 400,
  presentation: 'transparentModal' as const,
};

// Apple style - rápida pero fluida
export const appleLiquidTransition = {
  gestureEnabled: true,
  gestureDirection: 'horizontal' as const,
  animation: 'slide_from_right' as const,
  animationDuration: 400,
  presentation: 'card' as const,
  contentStyle: {
    backgroundColor: 'white',
  },
};

// Helper para combinar con opciones de header
export const createLiquidScreenOptions = (headerOptions: any = {}) => ({
  ...recommendedLiquidTransition,
  ...headerOptions,
});

// Helper para crear transición personalizada
export const createCustomTransition = (
  animation: 'slide_from_right' | 'slide_from_left' | 'slide_from_bottom' | 'fade' | 'fade_from_bottom' | 'simple_push' = 'slide_from_right',
  duration: number = 500
) => ({
  gestureEnabled: true,
  gestureDirection: 'horizontal' as const,
  animation,
  animationDuration: duration,
  presentation: 'card' as const,
  contentStyle: {
    backgroundColor: 'white',
  },
});
