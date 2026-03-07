import React, { useEffect, useState, useLayoutEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, Alert, Switch, TouchableOpacity } from 'react-native';
import { Button, Input } from '../../../components/common';
import { DateSelector } from '../../../components/reservas/DateSelector';
import { ComensalesSelector } from '../../../components/reservas/ComensalesSelector';
import { colors, spacing, typography } from '../../../theme';
import { useReservasStore } from '../../../store/reservasStore';

interface Props {
  navigation: any;
  route: { params?: { waitlistEntry?: any; reservaId?: string } };
}

export const ReservaEditorScreen: React.FC<Props> = ({ navigation, route }) => {
  const reservaId = route?.params?.reservaId;
  const waitlistEntry = route?.params?.waitlistEntry;
  const isEditing = !!reservaId;
  const formatHora = (hora: string) => hora?.substring(0, 5) || '';

  useLayoutEffect(() => {
    navigation.setOptions({
      title: isEditing ? 'Editar Reserva' : 'Nueva Reserva',
    });
  }, [navigation, isEditing]);

  const {
    franjas,
    fetchFranjas,
    salas,
    fetchSalas,
    mesasBySala,
    fetchMesas,
    createReserva,
    updateReserva,
    fetchMesasOcupadas,
    mesasOcupadas,
    reservas,
  } = useReservasStore();

  const existingReserva = isEditing ? reservas.find(r => r.id === reservaId) : null;

  const today = new Date().toISOString().split('T')[0];
  const [fecha, setFecha] = useState(existingReserva?.fecha ?? waitlistEntry?.fecha ?? today);
  const [franjaId, setFranjaId] = useState(existingReserva?.franjaId ?? waitlistEntry?.franjaId ?? '');
  const [salaId, setSalaId] = useState('');
  const [mesaId, setMesaId] = useState(existingReserva?.mesaId ?? '');
  const [nombreCliente, setNombreCliente] = useState(existingReserva?.nombreCliente ?? waitlistEntry?.nombreCliente ?? '');
  const [telefono, setTelefono] = useState(existingReserva?.telefono ?? waitlistEntry?.telefono ?? '');
  const [comensales, setComensales] = useState(existingReserva?.comensales ?? waitlistEntry?.comensales ?? 2);
  const [force, setForce] = useState(false);
  const [saving, setSaving] = useState(false);
  const [initialSalaLoaded, setInitialSalaLoaded] = useState(false);

  useEffect(() => {
    fetchFranjas();
    fetchSalas();
  }, []);

  useEffect(() => {
    if (isEditing && existingReserva && !initialSalaLoaded) {
      const mesa = Object.values(mesasBySala).flat().find(m => m.id === existingReserva.mesaId);
      if (mesa) {
        setSalaId(mesa.salaId);
        setInitialSalaLoaded(true);
      } else if (salas.length > 0) {
        fetchSalas().then(() => {
          setInitialSalaLoaded(true);
        });
      }
    }
  }, [isEditing, existingReserva, salas, mesasBySala]);

  useEffect(() => {
    if (salaId) {
      fetchMesas(salaId);
    }
  }, [salaId]);

  useEffect(() => {
    if (fecha && franjaId) {
      fetchMesasOcupadas(fecha, franjaId);
    }
  }, [fecha, franjaId]);

  useEffect(() => {
    if (isEditing && existingReserva) {
      fetchMesasOcupadas(fecha, franjaId);
    }
  }, [isEditing, existingReserva]);

  const mesas = salaId ? mesasBySala[salaId] || [] : [];
  const mesaIdsOcupadas = mesasOcupadas?.mesaIds || [];
  
  const mesaActualId = isEditing ? existingReserva?.mesaId : null;
  const mesaIdsOcupadasFiltradas = mesaIdsOcupadas.filter(id => id !== mesaActualId);
  
  const mesasDisponibles = mesas.filter((mesa) => !mesaIdsOcupadasFiltradas.includes(mesa.id));
  const mesasOcupadasList = mesas.filter((mesa) => mesaIdsOcupadasFiltradas.includes(mesa.id));

  const handleNombreChange = (text: string) => {
    setNombreCliente(text.toUpperCase());
  };

  const handleTelefonoChange = (text: string) => {
    const cleaned = text.replace(/[^0-9+\s]/g, '');
    setTelefono(cleaned);
  };

  const handleSubmit = async () => {
    if (!franjaId || !mesaId || !nombreCliente.trim() || !telefono.trim()) {
      Alert.alert('Completa todos los campos obligatorios');
      return;
    }
    
    if (isEditing && !existingReserva) {
      Alert.alert('Error', 'Los datos de la reserva no están cargados');
      return;
    }
    
    setSaving(true);
    try {
      if (isEditing) {
        const payload: any = {
          fecha,
          nombreCliente: nombreCliente.trim(),
          telefono: telefono.trim(),
          comensales,
        };
        
        if (mesaId !== existingReserva?.mesaId) {
          payload.mesaId = mesaId;
        }
        if (franjaId !== existingReserva?.franjaId) {
          payload.franjaId = franjaId;
        }
        
        await updateReserva(reservaId, payload);
        Alert.alert('Reserva actualizada');
      } else {
        await createReserva({
          franjaId: franjaId,
          mesaId,
          fecha,
          nombreCliente: nombreCliente.trim(),
          telefono: telefono.trim(),
          comensales,
          force,
        });
        Alert.alert('Reserva creada');
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', isEditing ? 'No se pudo actualizar la reserva' : 'No se pudo crear la reserva');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{isEditing ? 'Editar reserva' : 'Nueva reserva manual'}</Text>
      
      <DateSelector fecha={fecha} onChangeFecha={setFecha} />
      
      <Text style={styles.label}>Franja</Text>
      <View style={styles.chipsRow}>
        {franjas.map((franja) => {
          const active = franjaId === franja.id;
          return (
            <TouchableOpacity
              key={franja.id}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => setFranjaId(franja.id)}
            >
              <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
                {franja.nombre} ({formatHora(franja.horaInicio)}-{formatHora(franja.horaFin)})
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.label}>Sala</Text>
      <View style={styles.chipsRow}>
        {salas.map((sala) => {
          const active = salaId === sala.id;
          return (
            <TouchableOpacity
              key={sala.id}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => setSalaId(sala.id)}
            >
              <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{sala.nombre}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.label}>Mesa</Text>
      {mesas.length === 0 ? (
        <Text style={styles.helpText}>Selecciona una sala para ver mesas</Text>
      ) : (
        <>
          {isEditing && mesaActualId && (
            <>
              <Text style={styles.subLabel}>Mesa actual</Text>
              <View style={styles.chipsRow}>
                {mesas.filter(m => m.id === mesaActualId).map((mesa) => (
                  <TouchableOpacity
                    key={mesa.id}
                    style={[styles.chip, styles.chipCurrent]}
                  >
                    <Text style={[styles.chipLabel, styles.chipLabelCurrent]}>
                      Mesa {mesa.numero} · {mesa.capacidad} pax
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
          
          <Text style={styles.subLabel}>Disponibles ({mesasDisponibles.length})</Text>
          {mesasDisponibles.length > 0 ? (
            <View style={styles.chipsRow}>
              {mesasDisponibles.map((mesa) => {
                const active = mesaId === mesa.id;
                return (
                  <TouchableOpacity
                    key={mesa.id}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => setMesaId(mesa.id)}
                  >
                    <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
                      {mesa.numero} · {mesa.capacidad} pax
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <Text style={styles.helpText}>No hay mesas disponibles</Text>
          )}

          {mesasOcupadasList.length > 0 && (
            <>
              <Text style={styles.subLabel}>Ocupadas ({mesasOcupadasList.length})</Text>
              <View style={styles.chipsRow}>
                {mesasOcupadasList.map((mesa) => (
                  <TouchableOpacity
                    key={mesa.id}
                    style={[styles.chip, styles.chipDisabled]}
                    disabled
                  >
                    <Text style={[styles.chipLabel, styles.chipLabelDisabled]}>
                      {mesa.numero} · {mesa.capacidad} pax
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
        </>
      )}

      <Text style={styles.sectionTitle}>Datos del cliente</Text>
      
      <Input
        label="Nombre"
        value={nombreCliente}
        onChangeText={handleNombreChange}
        placeholder="NOMBRE COMPLETO"
        autoCapitalize="characters"
      />
      <Input
        label="Teléfono"
        value={telefono}
        onChangeText={handleTelefonoChange}
        placeholder="+34 600 000 000"
        keyboardType="phone-pad"
      />

      <ComensalesSelector
        label="Comensales"
        value={comensales}
        onChange={setComensales}
      />

      {!isEditing && (
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Forzar asignación</Text>
          <Switch value={force} onValueChange={setForce} />
        </View>
      )}
      
      <Button title="Guardar" onPress={handleSubmit} loading={saving} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  label: {
    ...typography.body,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  subLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipCurrent: {
    backgroundColor: '#E8F5E9',
    borderColor: colors.primary,
  },
  chipLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  chipLabelActive: {
    color: colors.surface,
  },
  chipLabelCurrent: {
    color: '#2E7D32',
    fontWeight: '600',
  },
  chipDisabled: {
    backgroundColor: colors.border,
    borderColor: colors.border,
    opacity: 0.6,
  },
  chipLabelDisabled: {
    color: colors.textSecondary,
  },
  helpText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  switchLabel: {
    ...typography.body,
    color: colors.text,
  },
});
