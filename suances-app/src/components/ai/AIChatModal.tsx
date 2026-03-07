import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
  RefreshControl,
  Platform,
  PanResponder,
  GestureResponderEvent,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAIStore, AIScreen } from '../../store/aiStore';
import { ReservasGuide } from './guides/ReservasGuide';
import { CartaGuide } from './guides/CartaGuide';
import { InventarioGuide } from './guides/InventarioGuide';
import { PersonalGuide } from './guides/PersonalGuide';
import { colors, spacing } from '../../theme';

const { height, width } = Dimensions.get('window');
const isTablet = width >= 768;
const MODAL_HEIGHT = Platform.OS === 'ios' ? height * 0.85 : height * 0.87;

interface AIChatModalProps {}

export const AIChatModal: React.FC<AIChatModalProps> = () => {
  const { isModalOpen, currentScreen, closeModal } = useAIStore();
  const slideAnim = useRef(new Animated.Value(MODAL_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const scrollY = useRef(0);
  const sectionPositions = useRef<Record<string, number>>({});

  useEffect(() => {
    if (isModalOpen) {
      slideAnim.setValue(MODAL_HEIGHT);
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.9);
      setIsVisible(true);
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          damping: 20,
          stiffness: 150,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          damping: 15,
          stiffness: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: MODAL_HEIGHT,
          duration: 250,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 0.85,
          damping: 15,
          stiffness: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsVisible(false);
      });
    }
  }, [isModalOpen]);

  const handleClose = useCallback(() => {
    closeModal();
  }, [closeModal]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  const handleScroll = useCallback((event: any) => {
    scrollY.current = event.nativeEvent.contentOffset.y;
  }, []);

  const handleScrollToSection = useCallback((sectionId: string) => {
    const position = sectionPositions.current[sectionId];
    if (position !== undefined && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        y: position,
        animated: true,
      });
    }
  }, []);

  const handleRegisterSection = useCallback((sectionId: string, y: number) => {
    sectionPositions.current[sectionId] = y;
  }, []);

  const renderGuide = () => {
    const guideProps = {
      onScrollToSection: handleScrollToSection,
      onRegisterSection: handleRegisterSection,
    };

    switch (currentScreen) {
      case 'reservas':
        return <ReservasGuide {...guideProps} />;
      case 'carta':
        return <CartaGuide {...guideProps} />;
      case 'inventario':
        return <InventarioGuide {...guideProps} />;
      case 'personal':
        return <PersonalGuide {...guideProps} />;
      default:
        return <ReservasGuide {...guideProps} />;
    }
  };

  if (!isVisible && !isModalOpen) {
    return null;
  }

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={styles.container}>
        {/* Overlay oscuro - clickeable para cerrar */}
        <Animated.View 
          style={[styles.overlay, { opacity: fadeAnim }]}
          pointerEvents={isVisible ? 'auto' : 'none'}
        >
          <TouchableOpacity 
            style={styles.overlayTouchable}
            onPress={handleClose}
            activeOpacity={1}
          />
        </Animated.View>

        {/* Modal deslizable */}
        <Animated.View
          style={[
            styles.modal,
            { transform: [{ translateY: slideAnim }, { scale: scaleAnim }] },
            isTablet && styles.modalTablet,
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.dragIndicator} />
            <View style={styles.headerContent}>
              <View style={styles.headerTitleSection}>
                <View style={styles.iconContainer}>
                  <Ionicons name="sparkles" size={22} color={colors.accent} />
                </View>
                <View>
                  <Text style={styles.headerTitle}>Asistente IA</Text>
                  <Text style={styles.headerSubtitle}>Guía inteligente</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={handleClose}
                style={styles.closeButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={26} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Contenido con scroll */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
            indicatorStyle="default"
            bounces={true}
            alwaysBounceVertical={true}
            overScrollMode="always"
            scrollEnabled={true}
            nestedScrollEnabled={true}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={colors.primary}
                colors={[colors.primary]}
                progressBackgroundColor={colors.surface}
              />
            }
          >
            {renderGuide()}
            <View style={styles.bottomSpacer} />
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlayTouchable: {
    flex: 1,
  },
  modal: {
    height: MODAL_HEIGHT,
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
  },
  modalTablet: {
    maxWidth: 600,
    alignSelf: 'center',
    width: '90%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  header: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingTop: 8,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  dragIndicator: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing.sm,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  closeButton: {
    padding: spacing.xs,
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: Platform.OS === 'ios' ? 100 : 80,
    minHeight: MODAL_HEIGHT - 100,
  },
  bottomSpacer: {
    height: 50,
  },
});
