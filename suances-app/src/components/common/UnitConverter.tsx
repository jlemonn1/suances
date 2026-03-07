import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { colors, spacing, typography } from '../../theme';
import { UnitConverterService, UnidadConversor } from '../../services/unitConverter';

interface UnitConverterProps {
  visible: boolean;
  onClose: () => void;
  tipo: 'peso' | 'volumen' | 'unidad';
  onConversionComplete: (cantidadBase: number, precioBase: number) => void;
  titulo?: string;
  showPrecio?: boolean;
}

export const UnitConverter: React.FC<UnitConverterProps> = ({
  visible,
  onClose,
  tipo,
  onConversionComplete,
  titulo = 'Convertir unidades',
  showPrecio = true,
}) => {
  const [cantidad, setCantidad] = useState('');
  const [unidadSeleccionada, setUnidadSeleccionada] = useState<UnidadConversor>(
    tipo === 'peso' ? 'KG' : tipo === 'volumen' ? 'L' : 'UNIDAD'
  );
  const [precioTotal, setPrecioTotal] = useState('');
  const [resultado, setResultado] = useState<{
    cantidadBase: number;
    precioBase: number;
    unidadBaseLabel: string;
  } | null>(null);

  const opciones = UnitConverterService.obtenerOpcionesPorTipo(tipo);

  useEffect(() => {
    calcularConversion();
  }, [cantidad, unidadSeleccionada, precioTotal]);

  const calcularConversion = () => {
    // Reemplazar coma por punto para manejar decimales correctamente
    const cantidadNum = parseFloat(cantidad.replace(',', '.'));
    const precioNum = parseFloat(precioTotal.replace(',', '.'));

    if (isNaN(cantidadNum) || cantidadNum <= 0) {
      setResultado(null);
      return;
    }

    const conversion = UnitConverterService.convertir(
      cantidadNum,
      unidadSeleccionada,
      isNaN(precioNum) ? undefined : precioNum
    );

    setResultado({
      cantidadBase: conversion.cantidadBase,
      precioBase: conversion.precioBase,
      unidadBaseLabel: conversion.unidadBaseLabel,
    });
  };

  const handleAplicar = () => {
    if (resultado) {
      onConversionComplete(resultado.cantidadBase, resultado.precioBase);
      onClose();
      // Limpiar campos
      setCantidad('');
      setPrecioTotal('');
      setResultado(null);
    }
  };

  const handleCerrar = () => {
    onClose();
    setCantidad('');
    setPrecioTotal('');
    setResultado(null);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleCerrar}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.titulo}>{titulo}</Text>

          {/* Selector de unidad */}
          <Text style={styles.label}>Unidad de entrada</Text>
          <View style={styles.unidadesContainer}>
            {opciones.map((opcion) => (
              <TouchableOpacity
                key={opcion.value}
                style={[
                  styles.unidadButton,
                  unidadSeleccionada === opcion.value && styles.unidadButtonSelected,
                ]}
                onPress={() => setUnidadSeleccionada(opcion.value)}
              >
                <Text
                  style={[
                    styles.unidadText,
                    unidadSeleccionada === opcion.value && styles.unidadTextSelected,
                  ]}
                >
                  {opcion.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Input de cantidad */}
          <Text style={styles.label}>Cantidad</Text>
          <TextInput
            style={styles.input}
            value={cantidad}
            onChangeText={setCantidad}
            placeholder={`Ej: 5 ${UnitConverterService.obtenerLabel(unidadSeleccionada)}`}
            keyboardType="decimal-pad"
            placeholderTextColor={colors.textSecondary}
          />

          {/* Input de precio total - solo si showPrecio es true */}
          {showPrecio && (
            <>
              <Text style={styles.label}>Precio total (€)</Text>
              <TextInput
                style={styles.input}
                value={precioTotal}
                onChangeText={setPrecioTotal}
                placeholder="Ej: 25.50"
                keyboardType="decimal-pad"
                placeholderTextColor={colors.textSecondary}
              />
            </>
          )}

          {/* Resultado */}
          {resultado && (
            <View style={styles.resultadoContainer}>
              <Text style={styles.resultadoTitulo}>Conversión a unidad base:</Text>
              <Text style={styles.resultadoTexto}>
                <Text style={styles.resultadoValor}>
                  {resultado.cantidadBase.toLocaleString('es-ES', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 4,
                  })}
                </Text>
                <Text style={styles.resultadoUnidad}> {resultado.unidadBaseLabel}</Text>
              </Text>
              {showPrecio && resultado.precioBase > 0 && (
                <Text style={styles.resultadoTexto}>
                  <Text style={styles.resultadoLabel}>Precio por {resultado.unidadBaseLabel}: </Text>
                  <Text style={styles.resultadoValor}>
                    {resultado.precioBase.toLocaleString('es-ES', {
                      style: 'currency',
                      currency: 'EUR',
                    })}
                  </Text>
                </Text>
              )}
            </View>
          )}

          {/* Botones */}
          <View style={styles.botonesContainer}>
            <TouchableOpacity
              style={[styles.boton, styles.botonCancelar]}
              onPress={handleCerrar}
            >
              <Text style={styles.botonCancelarTexto}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.boton, styles.botonAplicar, !resultado && styles.botonDeshabilitado]}
              onPress={handleAplicar}
              disabled={!resultado}
            >
              <Text style={styles.botonAplicarTexto}>Aplicar</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.cerrarIcono} onPress={handleCerrar}>
            <Text style={styles.cerrarIconoTexto}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  container: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  titulo: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  unidadesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  unidadButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  unidadButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  unidadText: {
    ...typography.body,
    color: colors.text,
  },
  unidadTextSelected: {
    color: colors.surface,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.background,
  },
  resultadoContainer: {
    backgroundColor: colors.primary + '15',
    borderRadius: 8,
    padding: spacing.md,
    marginTop: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  resultadoTitulo: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  resultadoTexto: {
    ...typography.body,
    color: colors.text,
    marginTop: spacing.xs,
  },
  resultadoLabel: {
    color: colors.textSecondary,
  },
  resultadoValor: {
    fontWeight: '700',
    fontSize: 18,
    color: colors.primary,
  },
  resultadoUnidad: {
    ...typography.body,
    color: colors.textSecondary,
  },
  botonesContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  boton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  botonCancelar: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  botonCancelarTexto: {
    ...typography.body,
    color: colors.text,
  },
  botonAplicar: {
    backgroundColor: colors.primary,
  },
  botonAplicarTexto: {
    ...typography.body,
    color: colors.surface,
    fontWeight: '600',
  },
  botonDeshabilitado: {
    opacity: 0.5,
  },
  cerrarIcono: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    padding: spacing.sm,
  },
  cerrarIconoTexto: {
    fontSize: 20,
    color: colors.textSecondary,
  },
});
