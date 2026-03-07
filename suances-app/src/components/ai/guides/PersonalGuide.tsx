import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, LayoutChangeEvent } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { AISectionTitle } from '../shared/AISectionTitle';
import { AIFlowCard } from '../shared/AIFlowCard';
import { AIDataStat } from '../shared/AIDataStat';
import { AIIndexItem } from '../shared/AIIndexItem';
import { AITipBox, AITipText } from '../shared/AITipBox';
import { AIDivider } from '../shared/AIDivider';
import { usePersonalStore } from '../../../store/personalStore';
import { colors, spacing, typography } from '../../../theme';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

interface PersonalGuideProps {
  onScrollToSection: (sectionId: string) => void;
  onRegisterSection: (sectionId: string, y: number) => void;
}

export const PersonalGuide: React.FC<PersonalGuideProps> = ({
  onScrollToSection,
  onRegisterSection,
}) => {
  const navigation = useNavigation();
  const { personnel, fetchPersonnel } = usePersonalStore();

  const contentY = useRef(0);

  useEffect(() => {
    fetchPersonnel();
  }, []);

  // Calcular estadísticas
  const totalPersonal = personnel.length;
  const activos = personnel.filter((p: any) => p.activo).length;
  const inactivos = personnel.filter((p: any) => !p.activo).length;
  
  const propietarios = personnel.filter((p: any) => p.rol === 'PROPIETARIO' && p.activo).length;
  const gerentes = personnel.filter((p: any) => p.rol === 'GERENTE' && p.activo).length;
  const camareros = personnel.filter((p: any) => p.rol === 'CAMARERO' && p.activo).length;

  const handleLayout = (sectionId: string) => (event: LayoutChangeEvent) => {
    const { y } = event.nativeEvent.layout;
    onRegisterSection(sectionId, y + contentY.current);
  };

  const handleNuevoEmpleado = () => {
    navigation.navigate('PersonalForm' as never);
  };

  return (
    <View
      onLayout={(event) => {
        contentY.current = event.nativeEvent.layout.y;
      }}
    >
      {/* Estadísticas principales */}
      <AISectionTitle title="Resumen del Equipo" />
      
      <View style={[styles.statsGrid, isTablet && styles.statsGridTablet]}>
        <AIDataStat
          icon="people"
          value={totalPersonal}
          label="Total empleados"
          color={colors.primary}
        />
        <AIDataStat
          icon="checkmark-circle"
          value={activos}
          label="Activos"
          color="#10B981"
        />
        {inactivos > 0 && (
          <AIDataStat
            icon="close-circle"
            value={inactivos}
            label="Inactivos"
            color="#6B7280"
          />
        )}
      </View>

      {/* Distribución por roles */}
      <AIDivider />
      <AISectionTitle title="Distribución por Roles" />
      
      <View style={[styles.statsGrid, isTablet && styles.statsGridTablet]}>
        <AIDataStat
          icon="star"
          value={propietarios}
          label="Propietarios"
          color="#F59E0B"
        />
        <AIDataStat
          icon="briefcase"
          value={gerentes}
          label="Gerentes"
          color="#8B5CF6"
        />
        <AIDataStat
          icon="cafe"
          value={camareros}
          label="Camareros"
          color="#3B82F6"
        />
      </View>

      <AIDivider />

      {/* Índice de Guía */}
      <AISectionTitle title="Índice de Guía" />
      <AIIndexItem
        icon="person-add"
        title="Crear Nuevo Empleado"
        sectionId="crear-empleado"
        onPress={onScrollToSection}
        color={colors.primary}
      />
      <AIIndexItem
        icon="refresh"
        title="Desactivar/Reactivar Empleado"
        sectionId="desactivar"
        onPress={onScrollToSection}
        color="#F59E0B"
      />
      <AIIndexItem
        icon="shield"
        title="Cambiar Rol de Empleado"
        sectionId="cambiar-rol"
        onPress={onScrollToSection}
        color="#8B5CF6"
      />
      <AIIndexItem
        icon="lock-closed"
        title="Permisos por Rol"
        sectionId="permisos"
        onPress={onScrollToSection}
        color="#10B981"
      />
      <AIIndexItem
        icon="bulb"
        title="Consejos Útiles"
        sectionId="consejos"
        onPress={onScrollToSection}
        color="#3B82F6"
      />

      <AIDivider />

      {/* Permisos por rol */}
      <View onLayout={handleLayout('permisos')}>
        <AISectionTitle
          title="Permisos por Rol"
          subtitle="Qué puede hacer cada tipo de usuario"
        />

        <View style={[styles.rolesGrid, isTablet && styles.rolesGridTablet]}>
          <View style={styles.roleCard}>
            <View style={styles.roleHeader}>
              <View style={[styles.roleIcon, { backgroundColor: '#F59E0B20' }]}>
                <Text style={[styles.roleIconText, { color: '#F59E0B' }]}>★</Text>
              </View>
              <View>
                <Text style={styles.roleName}>PROPIETARIO</Text>
                <Text style={styles.roleDesc}>Acceso total al sistema</Text>
              </View>
            </View>
            <View style={styles.permissionsList}>
              <View style={styles.permissionItem}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.permissionText}>Dashboard completo</Text>
              </View>
              <View style={styles.permissionItem}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.permissionText}>Reservas (crear, editar, cancelar)</Text>
              </View>
              <View style={styles.permissionItem}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.permissionText}>Carta (crear, editar, eliminar platos)</Text>
              </View>
              <View style={styles.permissionItem}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.permissionText}>Inventario (actualizar stock)</Text>
              </View>
              <View style={styles.permissionItem}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.permissionText}>Personal (crear, editar roles, desactivar)</Text>
              </View>
            </View>
          </View>

          <View style={styles.roleCard}>
            <View style={styles.roleHeader}>
              <View style={[styles.roleIcon, { backgroundColor: '#8B5CF620' }]}>
                <Text style={[styles.roleIconText, { color: '#8B5CF6' }]}>⚡</Text>
              </View>
              <View>
                <Text style={styles.roleName}>GERENTE</Text>
                <Text style={styles.roleDesc}>Gestión completa excepto personal</Text>
              </View>
            </View>
            <View style={styles.permissionsList}>
              <View style={styles.permissionItem}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.permissionText}>Dashboard</Text>
              </View>
              <View style={styles.permissionItem}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.permissionText}>Reservas (todas las acciones)</Text>
              </View>
              <View style={styles.permissionItem}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.permissionText}>Carta (todas las acciones)</Text>
              </View>
              <View style={styles.permissionItem}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.permissionText}>Inventario (todas las acciones)</Text>
              </View>
              <View style={styles.permissionItem}>
                <Text style={styles.cross}>✗</Text>
                <Text style={[styles.permissionText, styles.disabled]}>Personal (solo ver, no crear/editar)</Text>
              </View>
            </View>
          </View>

          <View style={styles.roleCard}>
            <View style={styles.roleHeader}>
              <View style={[styles.roleIcon, { backgroundColor: '#3B82F620' }]}>
                <Text style={[styles.roleIconText, { color: '#3B82F6' }]}>☕</Text>
              </View>
              <View>
                <Text style={styles.roleName}>CAMARERO</Text>
                <Text style={styles.roleDesc}>Solo visualización</Text>
              </View>
            </View>
            <View style={styles.permissionsList}>
              <View style={styles.permissionItem}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.permissionText}>Ver reservas</Text>
              </View>
              <View style={styles.permissionItem}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.permissionText}>Ver carta</Text>
              </View>
              <View style={styles.permissionItem}>
                <Text style={styles.cross}>✗</Text>
                <Text style={[styles.permissionText, styles.disabled]}>Crear/editar/eliminar nada</Text>
              </View>
              <View style={styles.permissionItem}>
                <Text style={styles.cross}>✗</Text>
                <Text style={[styles.permissionText, styles.disabled]}>Acceso a personal</Text>
              </View>
              <View style={styles.permissionItem}>
                <Text style={styles.cross}>✗</Text>
                <Text style={[styles.permissionText, styles.disabled]}>Acceso a inventario</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      <AIDivider />

      {/* Flujos principales */}
      <AISectionTitle
        title="Flujos Principales"
        subtitle="Cómo gestionar el personal"
      />

      <View style={[styles.flowsGrid, isTablet && styles.flowsGridTablet]}>
        <View onLayout={handleLayout('crear-empleado')}>
          <AIFlowCard
            icon="person-add"
            title="Crear Nuevo Empleado"
            subtitle="Proceso de alta de personal"
            accentColor={colors.primary}
            steps={[
              { title: 'Datos personales', description: 'Nombre completo del empleado' },
              { title: 'Nombre de usuario', description: 'Único para login. Ej: juan.garcia, maria.lopez (no se puede cambiar después)' },
              { title: 'Contraseña inicial', description: 'Obligatoria en creación. El empleado puede cambiarla después' },
              { title: 'Asignar rol', description: 'Propietario, Gerente o Camarero. Importante: determina los permisos de acceso' },
              { title: 'Guardar', description: 'El empleado puede iniciar sesión inmediatamente' },
            ]}
          />
        </View>

        <View onLayout={handleLayout('desactivar')}>
          <AIFlowCard
            icon="refresh"
            title="Desactivar/Reactivar Empleado"
            subtitle="Control de acceso sin perder datos"
            accentColor="#F59E0B"
            steps={[
              { title: 'Buscar empleado', description: 'Desde la lista de personal' },
              { title: 'Ver detalle', description: 'Acceder a ficha completa' },
              { title: 'Cambiar estado', description: 'Toggle Activo/Inactivo' },
              { title: 'Desactivar', description: 'El empleado no puede hacer login pero se conservan todos sus datos e historial' },
              { title: 'Reactivar', description: 'Restaurar acceso cuando vuelva a trabajar' },
            ]}
          />
        </View>

        <View onLayout={handleLayout('cambiar-rol')}>
          <AIFlowCard
            icon="shield"
            title="Cambiar Rol de Empleado"
            subtitle="Modificar permisos"
            accentColor="#8B5CF6"
            steps={[
              { title: 'Acceder a detalle', description: 'Ficha del empleado' },
              { title: 'Sección "Rol"', description: 'Ver rol actual' },
              { title: 'Seleccionar nuevo rol', description: 'Propietario, Gerente o Camarero' },
              { title: 'Confirmar cambio', description: 'Los nuevos permisos se aplican inmediatamente' },
            ]}
          />
        </View>
      </View>

      <AIDivider />

      {/* Diferencias clave */}
      <AISectionTitle title="Diferencias Clave: Desactivar vs Eliminar" />
      
      <View style={styles.comparisonContainer}>
        <View style={[styles.comparisonCard, { borderLeftColor: '#F59E0B' }]}>
          <Text style={styles.comparisonTitle}>Desactivar</Text>
          <Text style={styles.comparisonDesc}>
            El empleado no puede hacer login pero{' '}
            <Text style={styles.comparisonBold}>se conservan todos sus datos</Text>,
            historial de acciones y relaciones. Recomendado para bajas temporales o definitivas.
          </Text>
        </View>
        
        <View style={[styles.comparisonCard, { borderLeftColor: '#EF4444' }]}>
          <Text style={styles.comparisonTitle}>Eliminar</Text>
          <Text style={styles.comparisonDesc}>
            Borra permanentemente al empleado.{' '}
            <Text style={styles.comparisonBold}>Solo disponible</Text> si el empleado 
            nunca ha realizado acciones en el sistema (por integridad de datos históricos).
          </Text>
        </View>
      </View>

      <AIDivider />

      {/* Tips */}
      <View onLayout={handleLayout('consejos')}>
        <AISectionTitle title="Consejos Útiles" />
        
        <View style={styles.tipsContainer}>
          <AITipBox type="warning">
            <AITipText>
              <Text style={styles.tipHighlight}>⚠️ Usuario único:</Text> El nombre de usuario 
              no se puede cambiar después de crearlo. Asegúrate de elegirlo bien desde el principio.
            </AITipText>
          </AITipBox>

          <AITipBox type="info">
            <AITipText>
              <Text style={styles.tipHighlight}>🔐 Seguridad:</Text> Solo los Propietarios 
              pueden crear nuevos empleados. Esto evita que empleados con menos privilegios 
              creen cuentas adicionales.
            </AITipText>
          </AITipBox>

          <AITipBox type="success">
            <AITipText>
              <Text style={styles.tipHighlight}>✅ Historial preservado:</Text> Al desactivar 
              un empleado, todas sus acciones previas (reservas creadas, etc.) se mantienen 
              registradas con su nombre.
            </AITipText>
          </AITipBox>

          <AITipBox type="warning">
            <AITipText>
              <Text style={styles.tipHighlight}>⚠️ Rol Propio:</Text> Un Propietario no puede 
              cambiar su propio rol para evitar quedarse sin acceso al sistema.
            </AITipText>
          </AITipBox>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statsGridTablet: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
    gap: spacing.xs,
  },
  actionsGridTablet: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginHorizontal: 0,
  },
  rolesGrid: {
    gap: spacing.md,
  },
  rolesGridTablet: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  roleCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    flex: isTablet ? 1 : undefined,
    minWidth: isTablet ? 280 : undefined,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  roleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  roleIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  roleIconText: {
    fontSize: 20,
  },
  roleName: {
    ...typography.h3,
    color: colors.text,
    fontWeight: '700',
  },
  roleDesc: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  permissionsList: {
    gap: spacing.xs,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkmark: {
    width: 20,
    color: '#10B981',
    fontWeight: '700',
  },
  cross: {
    width: 20,
    color: '#EF4444',
    fontWeight: '700',
  },
  permissionText: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
  },
  disabled: {
    color: colors.textSecondary,
  },
  flowsGrid: {
    gap: spacing.md,
  },
  flowsGridTablet: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  comparisonContainer: {
    gap: spacing.sm,
  },
  comparisonCard: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.md,
    borderLeftWidth: 4,
  },
  comparisonTitle: {
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
    fontSize: 16,
  },
  comparisonDesc: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  comparisonBold: {
    fontWeight: '700',
    color: colors.text,
  },
  tipsContainer: {
    gap: spacing.sm,
  },
  tipHighlight: {
    fontWeight: '700',
  },
});
