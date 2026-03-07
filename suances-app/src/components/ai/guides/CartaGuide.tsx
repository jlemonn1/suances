import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, LayoutChangeEvent } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { AISectionTitle } from '../shared/AISectionTitle';
import { AIFlowCard } from '../shared/AIFlowCard';
import { AIDataStat } from '../shared/AIDataStat';
import { AIIndexItem } from '../shared/AIIndexItem';
import { AITipBox, AITipText } from '../shared/AITipBox';
import { AIDivider } from '../shared/AIDivider';
import { usePlatoStore } from '../../../store/platoStore';
import { useIngredienteStore } from '../../../store/ingredienteStore';
import { useTipoCartaStore } from '../../../store/tipoCartaStore';
import { useCategoriaStore } from '../../../store/categoriaStore';
import { colors, spacing } from '../../../theme';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

interface CartaGuideProps {
  onScrollToSection: (sectionId: string) => void;
  onRegisterSection: (sectionId: string, y: number) => void;
}

export const CartaGuide: React.FC<CartaGuideProps> = ({
  onScrollToSection,
  onRegisterSection,
}) => {
  const navigation = useNavigation();
  const { platos, fetchPlatos, platosAgotados } = usePlatoStore();
  const { ingredientes, fetchIngredientes, stockCriticoAlertas, stockBajoAlertas } = useIngredienteStore();
  const { tiposCarta, fetchTiposCarta } = useTipoCartaStore();
  const { categorias, fetchCategorias } = useCategoriaStore();

  const contentY = useRef(0);

  useEffect(() => {
    fetchPlatos();
    fetchIngredientes();
    fetchTiposCarta();
    fetchCategorias();
  }, []);

  // Calcular estadísticas
  const platosActivos = platos.length;
  const ingredientesTotal = ingredientes.length;
  const categoriasPlatos = categorias.filter(c => c.tipo === 'PLATO').length;
  const alertasStock = stockCriticoAlertas.length + stockBajoAlertas.length;
  const platosSinStock = platosAgotados.length;

  const handleLayout = (sectionId: string) => (event: LayoutChangeEvent) => {
    const { y } = event.nativeEvent.layout;
    onRegisterSection(sectionId, y + contentY.current);
  };

  const handleNuevoPlato = () => {
    navigation.navigate('PlatoWizard' as never);
  };

  const handleVerIngredientes = () => {
    navigation.navigate('Ingredientes' as never);
  };

  const handleVerEscandallos = () => {
    navigation.navigate('Escandallos' as never);
  };

  const handleVerTiposCarta = () => {
    navigation.navigate('TiposCarta' as never);
  };

  return (
    <View
      onLayout={(event) => {
        contentY.current = event.nativeEvent.layout.y;
      }}
    >
      {/* Estadísticas en tiempo real */}
      <AISectionTitle title="Resumen de tu Carta" />
      
      <View style={[styles.statsGrid, isTablet && styles.statsGridTablet]}>
        <AIDataStat
          icon="restaurant"
          value={platosActivos}
          label="Platos activos"
          color={colors.primary}
        />
        <AIDataStat
          icon="cube"
          value={ingredientesTotal}
          label="Ingredientes"
          color="#8B5CF6"
        />
        <AIDataStat
          icon="folder"
          value={categoriasPlatos}
          label="Categorías"
          color="#3B82F6"
        />
        <AIDataStat
          icon="time"
          value={tiposCarta.length}
          label="Tipos de carta"
          color="#F59E0B"
        />
      </View>

      {/* Alertas */}
      {(alertasStock > 0 || platosSinStock > 0) && (
        <>
          <AISectionTitle title="Alertas" subtitle="Requieren tu atención" />
          <View style={[styles.statsGrid, isTablet && styles.statsGridTablet]}>
            {alertasStock > 0 && (
              <AIDataStat
                icon="warning"
                value={alertasStock}
                label="Ingredientes bajo stock"
                color="#EF4444"
              />
            )}
            {platosSinStock > 0 && (
              <AIDataStat
                icon="alert-circle"
                value={platosSinStock}
                label="Platos no disponibles"
                color="#F59E0B"
              />
            )}
          </View>
        </>
      )}

      <AIDivider />

      {/* Índice de Guía */}
      <AISectionTitle title="Índice de Guía" />
      <AIIndexItem
        icon="restaurant"
        title="Crear Plato Completo"
        sectionId="crear-plato"
        onPress={onScrollToSection}
        color={colors.primary}
      />
      <AIIndexItem
        icon="calculator"
        title="Crear Escandallo (Receta)"
        sectionId="escandallo"
        onPress={onScrollToSection}
        color="#10B981"
      />
      <AIIndexItem
        icon="cube"
        title="Gestionar Ingredientes"
        sectionId="ingredientes"
        onPress={onScrollToSection}
        color="#8B5CF6"
      />
      <AIIndexItem
        icon="menu"
        title="Configurar Tipos de Carta"
        sectionId="tipos-carta"
        onPress={onScrollToSection}
        color="#F59E0B"
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
        subtitle="Guía paso a paso para gestionar tu carta"
      />

      <View style={[styles.flowsGrid, isTablet && styles.flowsGridTablet]}>
        <View onLayout={handleLayout('crear-plato')}>
          <AIFlowCard
            icon="restaurant"
            title="Crear Plato Completo"
            subtitle="Wizard de 3 pasos para añadir un nuevo plato"
            accentColor={colors.primary}
            steps={[
              { 
                title: 'Datos Básicos', 
                description: 'Nombre del plato, descripción (aparece en la carta), precio de venta y categoría (Entrante, Principal, Postre...)' 
              },
              { 
                title: 'Asociar a Tipos de Carta', 
                description: 'Seleccionar en qué menús aparece: Comida (13:00-16:00), Cena (20:00-23:00), o ambos' 
              },
              { 
                title: 'Añadir Imágenes', 
                description: 'URLs de fotos del plato. Se recomiendan 2-3 imágenes de calidad. Puedes añadirlas después' 
              },
            ]}
          />
        </View>

        <View onLayout={handleLayout('escandallo')}>
          <AIFlowCard
            icon="calculator"
            title="Crear Escandallo (Receta)"
            subtitle="Configura ingredientes y calcula costes automáticamente"
            accentColor="#10B981"
            steps={[
              { 
                title: 'Seleccionar plato', 
                description: 'Desde el detalle de un plato, accede a "Escandallo" o "Receta"' 
              },
              { 
                title: 'Añadir ingredientes', 
                description: 'Buscar ingredientes existentes y añadirlos a la receta' 
              },
              { 
                title: 'Indicar cantidades', 
                description: 'Especificar cantidad necesaria de cada ingrediente según unidad (kg, g, l, ml, ud)' 
              },
              { 
                title: 'Revisar cálculos', 
                description: 'El sistema calcula: Coste total = Σ(cantidad × precio unitario)' 
              },
              { 
                title: 'Ver margen de beneficio', 
                description: 'Margen = Precio venta - Coste total. Ideal: margen > 60%' 
              },
              { 
                title: 'Guardar versión', 
                description: 'Cada cambio crea una nueva versión del escandallo con fecha' 
              },
            ]}
          />
        </View>

        <View onLayout={handleLayout('ingredientes')}>
          <AIFlowCard
            icon="cube"
            title="Gestionar Ingredientes"
            subtitle="Control de stock y alertas"
            accentColor="#8B5CF6"
            steps={[
              { 
                title: 'Crear ingrediente', 
                description: 'Nombre, unidad de medida (kg, g, l, ml, ud) y categoría' 
              },
              { 
                title: 'Establecer stock inicial', 
                description: 'Cantidad actual en almacén' 
              },
              { 
                title: 'Configurar alertas', 
                description: 'Umbral de alerta: cantidad mínima antes de avisar (ej: 2 kg)' 
              },
              { 
                title: 'Precio por unidad', 
                description: 'Importante para cálculo de escandallos' 
              },
              { 
                title: 'Actualizar stock', 
                description: 'Añadir compras nuevas o hacer inventario físico' 
              },
            ]}
          />
        </View>

        <View onLayout={handleLayout('tipos-carta')}>
          <AIFlowCard
            icon="menu"
            title="Configurar Tipos de Carta"
            subtitle="Menús por horario y disponibilidad"
            accentColor="#F59E0B"
            steps={[
              { 
                title: 'Crear tipo de carta', 
                description: 'Ejemplos: "Menú Comida", "Carta Cena", "Brunch Domingo"' 
              },
              { 
                title: 'Definir horario', 
                description: 'Hora inicio y fin (ej: Comida 13:00-16:00, Cena 20:00-23:30)' 
              },
              { 
                title: 'Asociar platos', 
                description: 'Seleccionar qué platos están disponibles en este tipo de carta' 
              },
              { 
                title: 'Activar/Desactivar', 
                description: 'Puedes tener tipos de carta preparados y activarlos según temporada' 
              },
            ]}
          />
        </View>
      </View>

      <AIDivider />

      {/* Distribuidores */}
      <AISectionTitle
        title="Distribuidores"
        subtitle="Gestión de proveedores"
      />
      
      <AITipBox type="info">
        <AITipText>
          <Text style={styles.tipHighlight}>📋 Proveedores:</Text> En la sección 
          Distribuidores puedes guardar los datos de contacto de tus proveedores 
          (nombre, teléfono, email) para tenerlos siempre a mano.
        </AITipText>
      </AITipBox>

      <AIDivider />

      {/* Tips */}
      <View onLayout={handleLayout('consejos')}>
        <AISectionTitle title="Consejos Útiles" />
        
        <View style={styles.tipsContainer}>
          <AITipBox type="success">
            <AITipText>
              <Text style={styles.tipHighlight}>💰 Margen recomendado:</Text> Un escandallo 
              bien configurado te permite ver el margen real. Se recomienda mantener márgenes 
              superiores al 60% en bebidas y 50-65% en comidas.
            </AITipText>
          </AITipBox>

          <AITipBox type="info">
            <AITipText>
              <Text style={styles.tipHighlight}>🔄 Duplicar platos:</Text> Para crear 
              variaciones de un plato (ej: "Solomillo" → "Solomillo a la pimienta"), 
              ve al detalle del plato original y usa "Duplicar".
            </AITipText>
          </AITipBox>

          <AITipBox type="warning">
            <AITipText>
              <Text style={styles.tipHighlight}>⚠️ Sin escandallo:</Text> Los platos sin 
              escandallo configurado no pueden calcular costes ni margen de beneficio real.
            </AITipText>
          </AITipBox>

          <AITipBox type="info">
            <AITipText>
              <Text style={styles.tipHighlight}>📊 Stock automático:</Text> Cuando un plato 
              se agota (algún ingrediente sin stock), se marca automáticamente como no disponible.
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
  flowsGrid: {
    gap: spacing.md,
  },
  flowsGridTablet: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  tipsContainer: {
    gap: spacing.sm,
  },
  tipHighlight: {
    fontWeight: '700',
  },
});
