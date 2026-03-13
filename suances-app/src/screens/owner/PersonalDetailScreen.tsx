import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  RefreshControl,
  Modal,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Loading, EmptyState } from '../../components/common';
import { colors, spacing, typography } from '../../theme';
import { PersonnelResponse, AnotacionPersonal, TipoAccionAnotacion } from '../../types/personal';
import { Rol } from '../../types/auth';
import { personalService } from '../../services/personalService';
import { usePersonalStore } from '../../store/personalStore';
import { useAuthStore } from '../../store/authStore';

interface PersonalDetailScreenProps {
  navigation: any;
  route: { params: { personnelId: string } };
}

const ROLES: { value: Rol; label: string }[] = [
  { value: 'OWNER', label: 'Propietario' },
  { value: 'MANAGER', label: 'Gerente' },
  { value: 'WAITER', label: 'Camarero' },
];

const getTipoAccionLabel = (tipo: TipoAccionAnotacion): string => {
  switch (tipo) {
    case 'EDITAR_COMANDA':
      return 'Editar Comanda';
    case 'CANCELAR_COMANDA':
      return 'Cancelar Comanda';
    case 'ELIMINAR_ITEMS':
      return 'Eliminar Items';
    default:
      return tipo;
  }
};

const getTipoAccionIcon = (tipo: TipoAccionAnotacion): keyof typeof Ionicons.glyphMap => {
  switch (tipo) {
    case 'EDITAR_COMANDA':
      return 'create-outline';
    case 'CANCELAR_COMANDA':
      return 'trash-outline';
    case 'ELIMINAR_ITEMS':
      return 'remove-circle-outline';
    default:
      return 'alert-circle-outline';
  }
};

const getTipoAccionColor = (tipo: TipoAccionAnotacion): string => {
  switch (tipo) {
    case 'EDITAR_COMANDA':
      return colors.accent;
    case 'CANCELAR_COMANDA':
      return colors.error;
    case 'ELIMINAR_ITEMS':
      return colors.warning;
    default:
      return colors.textSecondary;
  }
};

export const PersonalDetailScreen: React.FC<PersonalDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const { personnelId } = route.params;
  const { changePersonnelRole, toggleModoEspia, fetchAnotacionesByUsuario, anotaciones, loadingAnotaciones } = usePersonalStore();
  const { isOwner } = useAuthStore();

  const [personnel, setPersonnel] = useState<PersonnelResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [changingRole, setChangingRole] = useState(false);
  const [togglingModoEspia, setTogglingModoEspia] = useState(false);
  const [showAnotacionesModal, setShowAnotacionesModal] = useState(false);

  const loadPersonnel = useCallback(async () => {
    try {
      const data = await personalService.getPersonnelById(personnelId);
      setPersonnel(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar el usuario');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [personnelId]);

  useEffect(() => {
    loadPersonnel();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadPersonnel();
    });
    return unsubscribe;
  }, [navigation, loadPersonnel]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPersonnel();
    setRefreshing(false);
  };

  const handleChangeRole = async (newRole: Rol) => {
    if (!personnel) return;
    if (newRole === personnel.role) return;

    Alert.alert(
      'Cambiar Rol',
      `¿Estás seguro de cambiar el rol de "${personnel.fullName}" a "${ROLES.find(r => r.value === newRole)?.label}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            setChangingRole(true);
            try {
              await changePersonnelRole(personnelId, newRole);
              await loadPersonnel();
            } catch (error) {
              Alert.alert('Error', 'No se pudo cambiar el rol');
            } finally {
              setChangingRole(false);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFechaAnotacion = (dateString: string) => {
    const date = new Date(dateString);
    const hoy = new Date();
    const ayer = new Date(hoy);
    ayer.setDate(ayer.getDate() - 1);
    
    const esHoy = date.toDateString() === hoy.toDateString();
    const esAyer = date.toDateString() === ayer.toDateString();
    
    if (esHoy) {
      return `Hoy, ${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (esAyer) {
      return `Ayer, ${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  const handleToggleModoEspia = async () => {
    if (!personnel || !isOwner()) return;
    
    const newValue = !personnel.modoEspia;
    const actionText = newValue ? 'activar' : 'desactivar';
    
    Alert.alert(
      newValue ? 'Activar Modo Espía' : 'Desactivar Modo Espía',
      `¿Estás seguro de ${actionText} el modo espía para "${personnel.fullName}"?\n\n` +
      (newValue 
        ? 'El usuario podrá ver las opciones de editar/cancelar comandas, pero al intentar usarlas se registrarán anotaciones en su perfil.'
        : 'El usuario volverá a tener acceso normal al sistema.'),
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            setTogglingModoEspia(true);
            try {
              const updated = await toggleModoEspia(personnelId, newValue);
              // Forzar actualización del estado local
              setPersonnel({ ...updated });
              // Recargar para asegurar sincronización
              await loadPersonnel();
              Alert.alert(
                'Éxito', 
                `Modo espía ${newValue ? 'activado' : 'desactivado'} correctamente`,
                [{ text: 'OK' }]
              );
            } catch (error) {
              console.error('Error toggle modo espía:', error);
              Alert.alert('Error', 'No se pudo cambiar el modo espía');
            } finally {
              setTogglingModoEspia(false);
            }
          },
        },
      ]
    );
  };

  const handleVerAnotaciones = async () => {
    await fetchAnotacionesByUsuario(personnelId);
    setShowAnotacionesModal(true);
  };

  const renderAnotacionItem = (anotacion: AnotacionPersonal, index: number) => {
    const isLast = index === anotaciones.length - 1;
    
    return (
      <View key={anotacion.id} style={styles.anotacionItem}>
        <View style={styles.timelineContainer}>
          <View style={[styles.timelineDot, { backgroundColor: getTipoAccionColor(anotacion.tipoAccion) }]}>
            <Ionicons 
              name={getTipoAccionIcon(anotacion.tipoAccion)} 
              size={12} 
              color={colors.surface} 
            />
          </View>
          {!isLast && <View style={styles.timelineLine} />}
        </View>
        
        <View style={styles.anotacionContent}>
          <View style={styles.anotacionHeader}>
            <Text style={[styles.anotacionTipo, { color: getTipoAccionColor(anotacion.tipoAccion) }]}>
              {getTipoAccionLabel(anotacion.tipoAccion)}
            </Text>
            <Text style={styles.anotacionFecha}>
              {formatFechaAnotacion(anotacion.createdAt)}
            </Text>
          </View>
          
          <View style={styles.anotacionDetalles}>
            <View style={styles.anotacionDetalleRow}>
              <Ionicons name="restaurant-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.anotacionDetalleText}>
                Mesa {anotacion.mesaNumero || 'N/A'} · Comanda {anotacion.comandaId.slice(-6)}
              </Text>
            </View>
            
            {anotacion.reservaId && (
              <View style={styles.anotacionDetalleRow}>
                <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                <Text style={styles.anotacionDetalleText}>Con reserva</Text>
              </View>
            )}
            
            {anotacion.detalle && (
              <View style={styles.anotacionDetalleRow}>
                <Ionicons name="document-text-outline" size={14} color={colors.textSecondary} />
                <Text style={styles.anotacionDetalleText} numberOfLines={2}>
                  {anotacion.detalle}
                </Text>
              </View>
            )}
          </View>
          
          <View style={[styles.anotacionEstado, { backgroundColor: colors.error + '15' }]}>
            <Ionicons name="close-circle" size={12} color={colors.error} />
            <Text style={[styles.anotacionEstadoText, { color: colors.error }]}>
              Bloqueado (Modo Espía)
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return <Loading fullScreen message="Cargando usuario..." />;
  }

  if (!personnel) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {personnel.fullName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.nombre}>{personnel.fullName}</Text>
          <Text style={styles.username}>@{personnel.username}</Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: personnel.activo ? colors.success + '20' : colors.error + '20' }
          ]}>
            <Text style={[
              styles.statusText,
              { color: personnel.activo ? colors.success : colors.error }
            ]}>
              {personnel.activo ? 'Activo' : 'Inactivo'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nombre completo</Text>
            <Text style={styles.infoValue}>{personnel.fullName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Usuario</Text>
            <Text style={styles.infoValue}>@{personnel.username}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Fecha de creación</Text>
            <Text style={styles.infoValue}>{formatDate(personnel.createdAt)}</Text>
          </View>
          {personnel.updatedAt && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Última actualización</Text>
              <Text style={styles.infoValue}>{formatDate(personnel.updatedAt)}</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rol</Text>
          <Text style={styles.roleDescription}>
            Selecciona el rol para este usuario. Cada rol tiene diferentes permisos de acceso.
          </Text>
          {changingRole ? (
            <Loading message="Cambiando rol..." />
          ) : (
            <View style={styles.roleOptions}>
              {ROLES.map((role) => (
                <TouchableOpacity
                  key={role.value}
                  style={[
                    styles.roleOption,
                    personnel.role === role.value && styles.roleOptionSelected,
                  ]}
                  onPress={() => handleChangeRole(role.value)}
                  disabled={personnel.role === role.value}
                >
                  <Text
                    style={[
                      styles.roleOptionText,
                      personnel.role === role.value && styles.roleOptionTextSelected,
                    ]}
                  >
                    {role.label}
                  </Text>
                  {personnel.role === role.value && (
                    <Ionicons name="checkmark" size={16} color={colors.surface} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {isOwner() && personnel.role !== 'OWNER' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Seguridad</Text>
            <View style={[
              styles.modoEspiaContainer,
              personnel.modoEspia && styles.modoEspiaContainerActive
            ]}>
              <View style={styles.modoEspiaHeader}>
                <View style={styles.modoEspiaTitleRow}>
                  <View style={[
                    styles.modoEspiaIconContainer,
                    personnel.modoEspia && styles.modoEspiaIconContainerActive
                  ]}>
                    <Ionicons 
                      name={personnel.modoEspia ? "eye" : "eye-off"} 
                      size={20} 
                      color={personnel.modoEspia ? colors.surface : colors.textSecondary} 
                    />
                  </View>
                  <View style={styles.modoEspiaTextContainer}>
                    <Text style={styles.modoEspiaTitle}>Modo Espía</Text>
                    <Text style={[
                      styles.modoEspiaStatus,
                      personnel.modoEspia && styles.modoEspiaStatusActive
                    ]}>
                      {personnel.modoEspia ? 'ACTIVO' : 'Inactivo'}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={personnel.modoEspia || false}
                  onValueChange={handleToggleModoEspia}
                  disabled={togglingModoEspia}
                  trackColor={{ false: colors.border, true: colors.warning + '80' }}
                  thumbColor={personnel.modoEspia ? colors.warning : colors.surface}
                />
              </View>
              <Text style={styles.modoEspiaDescription}>
                Cuando está activo, el usuario podrá ver opciones de editar/cancelar comandas, 
                pero sus intentos se registrarán sin ejecutar la acción real.
              </Text>
              {personnel.modoEspia && (
                <TouchableOpacity 
                  style={styles.verAnotacionesButton}
                  onPress={handleVerAnotaciones}
                >
                  <View style={styles.verAnotacionesBadge}>
                    <Ionicons name="document-text-outline" size={18} color={colors.surface} />
                  </View>
                  <Text style={styles.verAnotacionesText}>Ver Anotaciones</Text>
                  <Ionicons name="chevron-forward" size={18} color={colors.primary} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Editar Usuario"
          onPress={() => navigation.navigate('PersonalForm', { personnel })}
        />
      </View>

      <Modal
        visible={showAnotacionesModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAnotacionesModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => setShowAnotacionesModal(false)}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Anotaciones</Text>
            <Text style={styles.modalSubtitle}>{personnel.fullName}</Text>
          </View>
          
          {loadingAnotaciones ? (
            <Loading message="Cargando anotaciones..." />
          ) : anotaciones.length === 0 ? (
            <EmptyState
              title="Sin anotaciones"
              message="No hay registros de intentos de acción para este usuario."
              icon="shield-checkmark"
            />
          ) : (
            <ScrollView style={styles.anotacionesList}>
              <View style={styles.anotacionesSummary}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryNumber}>{anotaciones.length}</Text>
                  <Text style={styles.summaryLabel}>Intentos</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryNumber}>
                    {anotaciones.filter(a => a.tipoAccion === 'EDITAR_COMANDA').length}
                  </Text>
                  <Text style={styles.summaryLabel}>Ediciones</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryNumber}>
                    {anotaciones.filter(a => a.tipoAccion === 'CANCELAR_COMANDA').length}
                  </Text>
                  <Text style={styles.summaryLabel}>Cancelaciones</Text>
                </View>
              </View>
              
              <View style={styles.anotacionesContainer}>
                {anotaciones.map((anotacion, index) => renderAnotacionItem(anotacion, index))}
              </View>
            </ScrollView>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    ...typography.h1,
    color: colors.surface,
  },
  nombre: {
    ...typography.h1,
    color: colors.text,
    textAlign: 'center',
  },
  username: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    marginTop: spacing.md,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '600',
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  infoRow: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  infoValue: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
  },
  roleDescription: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  roleOptions: {
    gap: spacing.sm,
  },
  roleOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  roleOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  roleOptionText: {
    ...typography.body,
    color: colors.text,
  },
  roleOptionTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  roleCheck: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  modoEspiaContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  modoEspiaContainerActive: {
    borderColor: colors.warning,
    backgroundColor: colors.warning + '08',
    shadowColor: colors.warning,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  modoEspiaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  modoEspiaTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  modoEspiaIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modoEspiaIconContainerActive: {
    backgroundColor: colors.warning,
  },
  modoEspiaTextContainer: {
    marginLeft: spacing.xs,
  },
  modoEspiaTitle: {
    ...typography.h3,
    color: colors.text,
  },
  modoEspiaStatus: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  modoEspiaStatusActive: {
    color: colors.warning,
    fontWeight: '700',
  },
  modoEspiaDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
    marginTop: spacing.xs,
  },
  verAnotacionesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.primary + '10',
    borderRadius: 8,
  },
  verAnotacionesBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  verAnotacionesText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    padding: spacing.lg,
    paddingTop: 50,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalCloseButton: {
    position: 'absolute',
    top: 50,
    right: spacing.lg,
    padding: spacing.sm,
    zIndex: 1,
  },
  modalTitle: {
    ...typography.h1,
    color: colors.text,
    textAlign: 'center',
  },
  modalSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  anotacionesList: {
    flex: 1,
  },
  anotacionesSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: colors.surface,
    margin: spacing.md,
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryNumber: {
    ...typography.h1,
    color: colors.primary,
    fontWeight: '700',
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  anotacionesContainer: {
    padding: spacing.md,
    paddingTop: spacing.sm,
  },
  anotacionItem: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  timelineContainer: {
    alignItems: 'center',
    width: 32,
  },
  timelineDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.border,
    marginTop: spacing.xs,
    marginBottom: -spacing.md,
  },
  anotacionContent: {
    flex: 1,
    marginLeft: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  anotacionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  anotacionTipo: {
    ...typography.body,
    fontWeight: '700',
  },
  anotacionFecha: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  anotacionDetalles: {
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  anotacionDetalleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  anotacionDetalleText: {
    ...typography.caption,
    color: colors.text,
    flex: 1,
  },
  anotacionEstado: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 4,
  },
  anotacionEstadoText: {
    ...typography.caption,
    fontWeight: '600',
  },
});
