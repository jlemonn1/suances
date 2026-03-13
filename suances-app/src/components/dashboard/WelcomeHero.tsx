import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Dimensions, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography, borderRadius } from '../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HEADER_MAX_HEIGHT = 320;
const HEADER_MIN_HEIGHT = 90;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

interface WelcomeHeroProps {
  scrollY: Animated.Value;
  navigation?: any;
}

export const WelcomeHero: React.FC<WelcomeHeroProps> = ({ scrollY, navigation }) => {
  const insets = useSafeAreaInsets();
  
  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT + insets.top, HEADER_MIN_HEIGHT + insets.top],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const collapsedOpacity = scrollY.interpolate({
    inputRange: [HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const titleScale = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0.7],
    extrapolate: 'clamp',
  });

  const titleTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [0, 10],
    extrapolate: 'clamp',
  });

  const ctaOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 3],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const ctaTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 3],
    outputRange: [0, 20],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View style={[styles.container, { height: headerHeight, paddingTop: insets.top }]}>
      <View style={styles.backgroundWave}>
        <View style={styles.wave} />
      </View>

      <View style={styles.collapsedContent}>
        <Animated.View 
          style={[
            styles.collapsedContainer,
            {
              opacity: collapsedOpacity,
              paddingTop: insets.top + spacing.xs,
            }
          ]}
        >
          <View style={styles.collapsedLeft}>
            <View style={styles.pandaMini}>
              <View style={styles.pandaMiniHead}>
                <View style={styles.pandaMiniEarL} />
                <View style={styles.pandaMiniEarR} />
                <View style={styles.pandaMiniFace}>
                  <View style={styles.pandaMiniEye} />
                  <View style={styles.pandaMiniEye} />
                </View>
              </View>
              <View style={styles.chefHatMini}>
                <View style={styles.hatMiniTop} />
                <View style={styles.hatMiniBand} />
              </View>
            </View>
            <Text style={styles.collapsedTitle}>Tiketea</Text>
          </View>
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationIcon}>🔔</Text>
            <View style={styles.notificationDot} />
          </View>
        </Animated.View>
      </View>

      <Animated.View 
        style={[
          styles.expandedContent,
          {
            opacity: headerOpacity,
          }
        ]}
      >
        <View style={styles.brandRow}>
          <Text style={styles.brandName}>Tiketea</Text>
        </View>

        <AnimatedIllustration />
        
        <Animated.Text 
          style={[
            styles.expandedTagline,
            {
              opacity: headerOpacity,
            }
          ]}
        >
          Todo lo que necesitas para tu restaurante
        </Animated.Text>

        <Animated.View 
          style={[
            styles.ctaWrapper,
            {
              opacity: ctaOpacity,
              transform: [{ translateY: ctaTranslateY }],
            }
          ]}
        >
          <CTAButton onPress={() => navigation?.navigate('SalaEnVivo')} />
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
};

const AnimatedIllustration: React.FC = () => {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const blinkAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const float = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    float.start();

    const blink = Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, {
          toValue: 0.1,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.delay(150),
        Animated.timing(blinkAnim, {
          toValue: 1,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.delay(3200),
        Animated.timing(blinkAnim, {
          toValue: 0.2,
          duration: 90,
          useNativeDriver: true,
        }),
        Animated.delay(90),
        Animated.timing(blinkAnim, {
          toValue: 1,
          duration: 90,
          useNativeDriver: true,
        }),
        Animated.delay(4200),
      ])
    );
    blink.start();

    return () => {
      float.stop();
      blink.stop();
    };
  }, []);

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

  return (
    <Animated.View style={[styles.illustrationContainer, { transform: [{ translateY }] }]}>
      <View style={styles.pandaWrapper}>
        <View style={styles.pandaBody}>
          <View style={styles.pandaHead}>
            <View style={styles.pandaEarL} />
            <View style={styles.pandaEarR} />
            <View style={styles.pandaFace}>
        <Animated.View style={[styles.pandaEye, { transform: [{ scaleY: blinkAnim }] }]}>
          <View style={styles.pandaPupil} />
        </Animated.View>
        <Animated.View style={[styles.pandaEye, { transform: [{ scaleY: blinkAnim }] }]}>
                <View style={styles.pandaPupil} />
              </Animated.View>
              <View style={styles.pandaNose} />
              <View style={styles.pandaMouth} />
            </View>
            <View style={styles.pandaCheekL} />
            <View style={styles.pandaCheekR} />
          </View>
          <View style={styles.pandaBodyShape} />
        </View>

        <View style={styles.chefHat}>
          <View style={styles.hatPuff} />
          <View style={styles.hatTop} />
          <View style={styles.hatBand} />
          <View style={styles.hatBase} />
        </View>
      </View>

      <View style={styles.floatingItems}>
        <Animated.View style={[styles.floater, styles.floater1]}>
          <Text style={styles.floaterEmoji}>🍽️</Text>
        </Animated.View>
        <Animated.View style={[styles.floater, styles.floater2]}>
          <Text style={styles.floaterEmoji}>📊</Text>
        </Animated.View>
        <Animated.View style={[styles.floater, styles.floater3]}>
          <Text style={styles.floaterEmoji}>✨</Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
};

const CTAButton: React.FC<{ onPress: () => void }> = ({ onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.02,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
      <AnimatedTouchableOpacity
        style={[styles.ctaContainer, { transform: [{ scale: scaleAnim }] }]}
        activeOpacity={0.9}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={styles.ctaInner}>
          <View style={styles.ctaIconBox}>
            <View style={styles.liveBadge}>
              <Text style={styles.liveText}>REC</Text>
              
            </View>
          </View>
          <View style={styles.ctaTextBox}>
            <Text style={styles.ctaTitle}>Ir a Sala en Vivo</Text>
            <Text style={styles.ctaSubtitle}>Gestiona las comandas en tiempo real</Text>
          </View>
          <View style={styles.ctaArrowBox}>
            <Text style={styles.ctaArrow}>→</Text>
          </View>
        </View>
      </AnimatedTouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    overflow: 'hidden',
  },
  backgroundWave: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  wave: {
    position: 'absolute',
    bottom: -25,
    left: -20,
    right: -20,
    height: 70,
    backgroundColor: colors.background,
    borderTopLeftRadius: 55,
    borderTopRightRadius: 55,
  },
  collapsedContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 0,
    paddingHorizontal: spacing.md,
    zIndex: 10,
  },
  collapsedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  collapsedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pandaMini: {
    width: 40,
    height: 40,
    marginRight: spacing.sm,
  },
  pandaMiniHead: {
    width: 30,
    height: 26,
    backgroundColor: '#fff',
    borderRadius: 15,
    position: 'relative',
  },
  pandaMiniEarL: {
    position: 'absolute',
    width: 10,
    height: 10,
    backgroundColor: '#333',
    borderRadius: 5,
    top: -3,
    left: 2,
  },
  pandaMiniEarR: {
    position: 'absolute',
    width: 10,
    height: 10,
    backgroundColor: '#333',
    borderRadius: 5,
    top: -3,
    right: 2,
  },
  pandaMiniFace: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  pandaMiniEye: {
    width: 6,
    height: 6,
    backgroundColor: '#333',
    borderRadius: 3,
    marginHorizontal: 2,
  },
  chefHatMini: {
    position: 'absolute',
    top: -18,
    left: 8,
    alignItems: 'center',
  },
  hatMiniTop: {
    width: 18,
    height: 14,
    backgroundColor: '#fff',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  hatMiniBand: {
    width: 20,
    height: 4,
    backgroundColor: colors.accent,
    marginTop: -1,
  },
  collapsedTitle: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '800',
  },
  notificationBadge: {
    position: 'relative',
    padding: spacing.sm,
  },
  notificationIcon: {
    fontSize: 22,
  },
  notificationDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 10,
    height: 10,
    backgroundColor: colors.accent,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  expandedContent: {
    alignItems: 'center',
  },
  brandRow: {
    alignItems: 'center',
  },
  brandName: {
    fontSize: 38,
    fontWeight: '900',
    color: colors.accent,
    letterSpacing: 4,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  illustrationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  pandaWrapper: {
    alignItems: 'center',
    position: 'relative',
    transform: [{ scale: 0.75 }],
  },
  pandaBody: {
    alignItems: 'center',
  },
  pandaHead: {
    width: 60,
    height: 52,
    backgroundColor: '#fff',
    borderRadius: 30,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pandaEarL: {
    position: 'absolute',
    width: 18,
    height: 18,
    backgroundColor: '#333',
    borderRadius: 9,
    top: -6,
    left: 3,
  },
  pandaEarR: {
    position: 'absolute',
    width: 18,
    height: 18,
    backgroundColor: '#333',
    borderRadius: 9,
    top: -6,
    right: 3,
  },
  pandaFace: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  pandaEye: {
    width: 14,
    height: 14,
    backgroundColor: '#333',
    borderRadius: 7,
    marginHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pandaPupil: {
    width: 4,
    height: 4,
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  pandaNose: {
    position: 'absolute',
    width: 8,
    height: 5,
    backgroundColor: '#333',
    borderRadius: 4,
    top: 24,
  },
  pandaMouth: {
    position: 'absolute',
    width: 14,
    height: 7,
    borderBottomWidth: 2,
    borderBottomColor: '#333',
    borderRadius: 7,
    top: 30,
  },
  pandaCheekL: {
    position: 'absolute',
    width: 10,
    height: 7,
    backgroundColor: '#ffb6c1',
    borderRadius: 3,
    bottom: 8,
    left: 2,
  },
  pandaCheekR: {
    position: 'absolute',
    width: 10,
    height: 7,
    backgroundColor: '#ffb6c1',
    borderRadius: 3,
    bottom: 8,
    right: 2,
  },
  pandaBodyShape: {
    width: 42,
    height: 26,
    backgroundColor: '#f0f0f0',
    borderRadius: 21,
    marginTop: -4,
  },
  chefHat: {
    position: 'absolute',
    top: -36,
    alignItems: 'center',
  },
  hatPuff: {
    width: 10,
    height: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    position: 'absolute',
    top: -3,
    left: 12,
  },
  hatTop: {
    width: 34,
    height: 30,
    backgroundColor: '#fff',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
  hatBand: {
    width: 38,
    height: 6,
    backgroundColor: colors.accent,
    marginTop: -2,
  },
  hatBase: {
    width: 40,
    height: 7,
    backgroundColor: '#f5f5f5',
    borderRadius: 2,
    marginTop: -1,
  },
  floatingItems: {
    position: 'absolute',
    width: 90,
    height: 50,
  },
  floater: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  floater1: {
    top: -2,
    right: -6,
  },
  floater2: {
    top: 14,
    left: -10,
  },
  floater3: {
    bottom: 0,
    right: 6,
  },
  floaterEmoji: {
    fontSize: 10,
  },
  expandedTagline: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
    fontStyle: 'italic',
  },
  ctaWrapper: {
    marginHorizontal: spacing.md,
    marginTop: spacing.xs,
  },
  ctaContainer: {
    backgroundColor: colors.accent,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  ctaInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
  },
  ctaIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  liveBadge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveText: {
    fontSize: 8,
    color: '#fff',
    fontWeight: '800',
  },
  livePulse: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff4757',
    bottom: -3,
  },
  ctaIcon: {
    fontSize: 20,
  },
  ctaTextBox: {
    flex: 1,
  },
  ctaTitle: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '700',
  },
  ctaSubtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 1,
  },
  ctaArrowBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaArrow: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export { HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT, HEADER_SCROLL_DISTANCE };
