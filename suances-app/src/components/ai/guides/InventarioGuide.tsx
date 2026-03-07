import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, LayoutChangeEvent } from 'react-native';

import { AISectionTitle } from '../shared/AISectionTitle';
import { AIFlowCard } from '../shared/AIFlowCard';
import { AIDataStat } from '../shared/AIDataStat';
import { AIIndexItem } from '../shared/AIIndexItem';
import { AITipBox, AITipText } from '../shared/AITipBox';
import { AIDivider } from '../shared/AIDivider';
import { useIngredienteStore } from '../../../store/ingredienteStore';
import { colors, spacing } from '../../../theme';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

interface InventarioGuideProps {
  onScrollToSection: (sectionId: string) => void;
  onRegisterSection: (sectionId: string, y: number) => void;
}

export const InventarioGuide: React.FC<InventarioGuideProps> = ({
  onScrollToSection,
  onRegisterSection,
}) => {
  const { 
    ingredientes, 
    fetchIngredientes, 
    stockCriticoAlertas, 
    stockBajoAlertas,
  } = useIngredienteStore();

  const contentY = useRef(0);

  useEffect(() => {
    fetchIngredientes();
  }, []);

  // Calcular estadísticas
  const totalIngredientes = ingredientes.length;
  const sinStock = ingredientes.filter(i => i.stockActual <= 0).length;
  const bajoStock = stockBajoAlertas.length;
  const criticoStock = stockCriticoAlertas.length;
  
  // Calcular valor total del stock
  const valorStock = ingredientes.reduce((acc, ing) => {
    return acc + (ing.stockActual * (ing.precioPorUnidad || 0));
  }, 0);

  const handleLayout = (sectionId: string) => (event: LayoutChangeEvent) => {
    const { y } = event.nativeEvent.layout;
    onRegisterSection(sectionId, y + contentY.current);
  };

  return (
    <View
      onLayout={(event) => {
        contentY.current = event.nativeEvent.layout.y;
      }}
    >
      {/* Estadísticas principales */}
      <AISectionTitle title="Resumen del Inventario" />
      
      <View style={[styles.statsGrid, isTablet && styles.statsGridTablet]}>
        <AIDataStat
          icon="cube"
          value={totalIngredientes}
          label="Total ingredientes"
          color={colors.primary}
        />
        <AIDataStat
          icon="cash"
          value={`€${valorStock.toFixed(2)}`}
          label="Valor del stock"
          color="#10B981"
        />
        <AIDataStat
          icon="checkmark-circle"
          value={totalIngredientes - sinStock - bajoStock - criticoStock}
          label="Stock OK"
          color="#10B981"
        />
        <AIDataStat
          icon="warning"
          value={bajoStock}
          label="Bajo stock"
          color="#F59E0B"
        />
        <AIDataStat
          icon="alert-circle"
          value={criticoStock}
          label="Stock crítico"
          color="#EF4444"
        />
        <AIDataStat
          icon="close-circle"
          value={sinStock}
          label="Sin stock"
          color="#6B7280"
        />
      </View>

      {/* Alertas detalladas */}
      {(criticoStock > 0 || bajoStock > 0) && (
        <>
          <AIDivider />
          <AISectionTitle 
            title="Ingredientes que Necesitan Atención" 
            subtitle={`${criticoStock + bajoStock} ingredientes por debajo del umbral`}
          />
          
          {stockCriticoAlertas.slice(0, 3).map((ing) => (
            <View key={ing.id} style={styles.alertItem}>
              <View style={[styles.alertDot, { backgroundColor: '#EF4444' }]} />
              <View style={styles.alertContent}>
                <Text style={styles.alertName}>{ing.nombre}</Text>
                <Text style={styles.alertInfo}>
                  {ing.stockActual} {ing.unidadMedida} / Umbral: {ing.umbralAlerta} {ing.unidadMedida}
                </Text>
              </View>
              <View style={[styles.alertBadge, { backgroundColor: '#EF444420' }]}>
                <Text style={[styles.alertBadgeText, { color: '#EF4444' }]}>Crítico</Text>
              </View>
            </View>
          ))}
          
          {stockBajoAlertas.slice(0, 3).map((ing) => (
            <View key={ing.id} style={styles.alertItem}>
              <View style={[styles.alertDot, { backgroundColor: '#F59E0B' }]} />
              <View style={styles.alertContent}>
                <Text style={styles.alertName}>{ing.nombre}</Text>
                <Text style={styles.alertInfo}>
                  {ing.stockActual} {ing.unidadMedida} / Umbral: {ing.umbralAlerta} {ing.unidadMedida}
                </Text>
              </View>
              <View style={[styles.alertBadge, { backgroundColor: '#F59E0B20' }]}>
                <Text style={[styles.alertBadgeText, { color: '#F59E0B' }]}>Bajo</Text>
              </View>
            </View>
          ))}
          
          {(criticoStock + bajoStock) > 6 && (
            <Text style={styles.moreAlerts}>
              +{(criticoStock + bajoStock) - 6} ingredientes más...
            </Text>
          )}
        </>
      )}

      <AIDivider />

      {/* Índice de Guía */}
      <AISectionTitle title="Índice de Guía" />
      <AIIndexItem
        icon="create"
        title="Actualizar Stock"
        sectionId="actualizar-stock"
        onPress={onScrollToSection}
        color={colors.primary}
      />
      <AIIndexItem
        icon="options"
        title="Configurar Alertas"
        sectionId="configurar-alertas"
        onPress={onScrollToSection}
        color="#F59E0B"
      />
      <AIIndexItem
        icon="calculator"
        title="Conversor de Unidades"
        sectionId="conversor"
        onPress={onScrollToSection}
        color="#8B5CF6"
      />
      <AIIndexItem
        icon="eye"
        title="Estados Visuales"
        sectionId="estados"
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

      {/* Flujos principales */}
      <AISectionTitle
        title="Flujos Principales"
        subtitle="Cómo gestionar tu inventario"
      />

      <View style={[styles.flowsGrid, isTablet && styles.flowsGridTablet]}>
        <View onLayout={handleLayout('actualizar-stock')}>
          <AIFlowCard
            icon="create"
            title="Actualizar Stock"
            subtitle="Modificar cantidades de ingredientes"
            accentColor={colors.primary}
            steps={[
              { 
                title: 'Buscar ingrediente', 
                description: 'Desde la lista o usando el buscador' 
              },
              { 
                title: 'Tocar para editar', 
                description: 'Se abre modal con stock actual' 
              },
              { 
                title: 'Usar conversor (opcional)', 
                description: 'Si compras en kg pero gestionas en gramos, el conversor hace la conversión automática' 
              },
              { 
                title: 'Añadir o establecer', 
                description: 'Añadir cantidad (ej: +5kg de compra) o Establecer cantidad exacta (inventario físico)' 
              },
              { 
                title: 'Guardar cambios', 
                description: 'El stock se actualiza inmediatamente' 
              },
            ]}
          />
        </View>

        <View onLayout={handleLayout('configurar-alertas')}>
          <AIFlowCard
            icon="options"
            title="Configurar Alertas"
            subtitle="Personalizar umbrales de aviso"
            accentColor="#F59E0B"
            steps={[
              { 
                title: 'Seleccionar ingrediente', 
                description: 'Ir a detalle del ingrediente' 
              },
              { 
                title: 'Configurar umbral', 
                description: 'Cantidad mínima antes de alertar (ej: 2kg, 10ud, 5l)' 
              },
              { 
                title: 'Establecer precio', 
                description: 'Precio por unidad para cálculo del valor del stock' 
              },
              { 
                title: 'Guardar', 
                description: 'El sistema monitorizará automáticamente este ingrediente' 
              },
            ]}
          />
        </View>

        <View onLayout={handleLayout('conversor')}>
          <AIFlowCard
            icon="calculator"
            title="Conversor de Unidades"
            subtitle="Herramienta integrada para conversiones"
            accentColor="#8B5CF6"
            steps={[
              { 
                title: 'Seleccionar unidad origen', 
                description: 'Ej: Kilogramos (kg)' 
              },
              { 
                title: 'Introducir cantidad', 
                description: 'Ej: 2.5 kg' 
              },
              { 
                title: 'Seleccionar unidad destino', 
                description: 'Ej: Gramos (g)' 
              },
              { 
                title: 'Ver resultado', 
                description: 'Conversión automática: 2.5 kg = 2500 g' 
              },
            ]}
          />
        </View>
      </View>

      <AIDivider />

      {/* Estados visuales */}
      <View onLayout={handleLayout('estados')}>
        <AISectionTitle title="Estados Visuales" />
        
        <View style={[styles.statusList, isTablet && styles.statusListTablet]}>
          <View style={styles.statusItem}>
            <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
            <Text style={styles.statusText}>
              <Text style={styles.statusBold}>Stock OK:</Text> Cantidad actual por encima del umbral
            </Text>
          </View>
          <View style={styles.statusItem}>
            <View style={[styles.statusDot, { backgroundColor: '#F59E0B' }]} />
            <Text style={styles.statusText}>
              <Text style={styles.statusBold}>Bajo Stock:</Text> Cantidad por debajo del umbral configurado
            </Text>
          </View>
          <View style={styles.statusItem}>
            <View style={[styles.statusDot, { backgroundColor: '#EF4444' }]} />
            <Text style={styles.statusText}>
              <Text style={styles.statusBold}>Stock Crítico:</Text> Menos del 50% del umbral (urgente)
            </Text>
          </View>
          <View style={styles.statusItem}>
            <View style={[styles.statusDot, { backgroundColor: '#6B7280' }]} />
            <Text style={styles.statusText}>
              <Text style={styles.statusBold}>Sin Stock:</Text> Cantidad = 0 (plato no disponible)
            </Text>
          </View>
        </View>
      </View>

      <AIDivider />

      {/* Tips */}
      <View onLayout={handleLayout('consejos')}>
        <AISectionTitle title="Consejos Útiles" />
        
        <View style={styles.tipsContainer}>
          <AITipBox type="info">
            <AITipText>
              <Text style={styles.tipHighlight}>💰 Valor del stock:</Text> El valor total se 
              calcula multiplicando stock actual × precio por unidad. Mantén actualizados los 
              precios para cálculos precisos.
            </AITipText>
          </AITipBox>

          <AITipBox type="success">
            <AITipText>
              <Text style={styles.tipHighlight}>✅ Umbrales realistas:</Text> Configura umbrales 
              según tu consumo habitual. Ej: Si usas 5kg de patatas diarias, umbral = 10kg (2 días).
            </AITipText>
          </AITipBox>

          <AITipBox type="warning">
            <AITipText>
              <Text style={styles.tipHighlight}>⚠️ Impacto en carta:</Text> Ingredientes sin stock 
              hacen que los platos que los usan se marquen como no disponibles automáticamente.
            </AITipText>
          </AITipBox>

          <AITipBox type="info">
            <AITipText>
              <Text style={styles.tipHighlight}>🔄 Inventario periódico:</Text> Recomendamos hacer 
              inventario físico semanal y ajustar cantidades con "Establecer" en lugar de "Añadir".
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
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  alertDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.sm,
  },
  alertContent: {
    flex: 1,
  },
  alertName: {
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  alertInfo: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  alertBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 4,
  },
  alertBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  moreAlerts: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: spacing.sm,
  },
  flowsGrid: {
    gap: spacing.md,
  },
  flowsGridTablet: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  statusList: {
    gap: spacing.sm,
  },
  statusListTablet: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: isTablet ? 1 : undefined,
    minWidth: isTablet ? 250 : undefined,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.sm,
  },
  statusText: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  statusBold: {
    fontWeight: '700',
  },
  tipsContainer: {
    gap: spacing.sm,
  },
  tipHighlight: {
    fontWeight: '700',
  },
});
