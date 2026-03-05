import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, Alert, Switch, TouchableOpacity } from 'react-native';
import { Button, Input } from '../../../components/common';
import { colors, spacing, typography } from '../../../theme';
import { useReservasStore } from '../../../store/reservasStore';

interface Props {
  navigation: any;
  route: { params?: { waitlistEntry?: any } };
}

export const ReservaEditorScreen: React.FC<Props> = ({ navigation, route }) => {
  const waitlistEntry = route?.params?.waitlistEntry;
  const {
    franjas,
    fetchFranjas,
    salas,
    fetchSalas,
    mesasBySala,
    fetchMesas,
    createReserva,
  } = useReservasStore();

  const today = new Date().toISOString().split('T')[0];
  const [fecha, setFecha] = useState(waitlistEntry?.fecha ?? today);
  const [franjaId, setFranjaId] = useState(waitlistEntry?.franjaId ?? '');
  const [salaId, setSalaId] = useState('');
  const [mesaId, setMesaId] = useState('');
  const [nombreCliente, setNombreCliente] = useState(waitlistEntry?.nombreCliente ?? '');
  const [telefono, setTelefono] = useState(waitlistEntry?.telefono ?? '');
  const [email, setEmail] = useState('');
  const [comensales, setComensales] = useState(waitlistEntry?.comensales?.toString() ?? '2');
  const [force, setForce] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchFranjas();
    fetchSalas();
  }, []);

  useEffect(() => {
    if (salaId) {
      fetchMesas(salaId);
    }
  }, [salaId]);

  const mesas = salaId ? mesasBySala[salaId] || [] : [];

  const handleSubmit = async () => {
    if (!franjaId || !mesaId || !nombreCliente || !telefono) {
      Alert.alert('Completa todos los campos obligatorios');
      return;
    }
    setSaving(true);
    try {
      await createReserva({
        franjaId,
        mesaId,
        fecha,
        nombreCliente,
        telefono,
        email,
        comensales: parseInt(comensales, 10),
        force,
      });
      Alert.alert('Reserva creada');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear la reserva');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Nueva reserva manual</Text>
      <Input label="Fecha" value={fecha} onChangeText={setFecha} placeholder="YYYY-MM-DD" />
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
                {franja.nombre} ({franja.horaInicio}-{franja.horaFin})
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
      <View style={styles.chipsRow}>
        {mesas.map((mesa) => {
          const active = mesaId === mesa.id;
          return (
            <TouchableOpacity
              key={mesa.id}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => setMesaId(mesa.id)}
            >
              <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
                Mesa {mesa.numero} · {mesa.capacidad} pax
              </Text>
            </TouchableOpacity>
          );
        })}
        {mesas.length === 0 && <Text style={styles.helpText}>Selecciona una sala para ver mesas</Text>}
      </View>
      <Input label="Nombre cliente" value={nombreCliente} onChangeText={setNombreCliente} />
      <Input label="Teléfono" value={telefono} onChangeText={setTelefono} />
      <Input label="Email" value={email} onChangeText={setEmail} />
      <Input label="Comensales" value={comensales} onChangeText={setComensales} keyboardType="numeric" />
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Forzar asignación</Text>
        <Switch value={force} onValueChange={setForce} />
      </View>
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
  label: {
    ...typography.body,
    color: colors.text,
    marginTop: spacing.md,
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
  chipLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  chipLabelActive: {
    color: colors.surface,
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
