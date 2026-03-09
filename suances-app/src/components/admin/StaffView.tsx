import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CartaPublicaScreen } from '../../screens/staff/CartaPublicaScreen';
import { PerfilScreen } from '../../screens/staff/PerfilScreen';
import { SalaScreen } from '../../screens/staff/SalaScreen';
import { colors } from '../../theme';

type TabType = 'Sala' | 'Carta' | 'Perfil';

export const StaffView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('Sala');

  const renderContent = () => {
    switch (activeTab) {
      case 'Sala':
        return <SalaScreen />;
      case 'Carta':
        return <CartaPublicaScreen />;
      case 'Perfil':
        return <PerfilScreen />;
      default:
        return <SalaScreen />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Contenido principal */}
      <View style={styles.content}>
        {renderContent()}
      </View>

      {/* Barra de navegación inferior personalizada */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Sala' && styles.activeTab]}
          onPress={() => setActiveTab('Sala')}
        >
          <Ionicons
            name={activeTab === 'Sala' ? 'grid' : 'grid-outline'}
            size={24}
            color={activeTab === 'Sala' ? colors.accent : colors.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'Sala' && styles.activeTabText,
            ]}
          >
            Sala
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'Carta' && styles.activeTab]}
          onPress={() => setActiveTab('Carta')}
        >
          <Ionicons
            name={activeTab === 'Carta' ? 'restaurant' : 'restaurant-outline'}
            size={24}
            color={activeTab === 'Carta' ? colors.accent : colors.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'Carta' && styles.activeTabText,
            ]}
          >
            Carta
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'Perfil' && styles.activeTab]}
          onPress={() => setActiveTab('Perfil')}
        >
          <Ionicons
            name={activeTab === 'Perfil' ? 'person' : 'person-outline'}
            size={24}
            color={activeTab === 'Perfil' ? colors.accent : colors.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'Perfil' && styles.activeTabText,
            ]}
          >
            Perfil
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: 20, // Padding para dispositivos con notch
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  activeTab: {
    // Puedes agregar estilos adicionales para la pestaña activa
  },
  tabText: {
    fontSize: 12,
    marginTop: 4,
    color: colors.textSecondary,
  },
  activeTabText: {
    color: colors.accent,
    fontWeight: '600',
  },
});
