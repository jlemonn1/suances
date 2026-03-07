import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  TouchableOpacity,
  Modal,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Input, Card, Loading, EmptyState } from '../../components/common';
import { colors, spacing, typography } from '../../theme';
import { cartaService } from '../../services/cartaService';
import { DistribuidorResponse, DistribuidorRequest } from '../../types/ingrediente';
import { useDistribuidorStore } from '../../store/distribuidorStore';

export const DistribuidoresScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { distribuidores, isLoading, fetchDistribuidores, addDistribuidor, updateDistribuidor, removeDistribuidor } = useDistribuidorStore();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<DistribuidorResponse | null>(null);
  
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ nombre?: string }>({});

  useEffect(() => {
    if (distribuidores.length === 0) {
      fetchDistribuidores(true);
    }
  }, []);

  const loadData = () => {
    fetchDistribuidores(true);
  };

  const resetForm = () => {
    setNombre('');
    setTelefono('');
    setEmail('');
    setErrors({});
    setEditing(null);
  };

  const openCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const openEdit = (dist: DistribuidorResponse) => {
    setEditing(dist);
    setNombre(dist.nombre);
    setTelefono(dist.telefono || '');
    setEmail(dist.email || '');
    setShowModal(true);
  };

  const validate = (): boolean => {
    const newErrors: { nombre?: string } = {};
    if (!nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setSaving(true);
    try {
      const data: DistribuidorRequest = {
        nombre: nombre.trim(),
        telefono: telefono.trim() || undefined,
        email: email.trim() || undefined,
      };

      if (editing) {
        const updated = await cartaService.actualizarDistribuidor(editing.id, data);
        updateDistribuidor(updated);
      } else {
        const created = await cartaService.crearDistribuidor(data);
        addDistribuidor(created);
      }

      setShowModal(false);
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el distribuidor');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (dist: DistribuidorResponse) => {
    Alert.alert(
      'Eliminar Distribuidor',
      `¿Eliminar "${dist.nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await cartaService.eliminarDistribuidor(dist.id);
              removeDistribuidor(dist.id);
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: DistribuidorResponse }) => (
    <Card style={styles.card}>
      <TouchableOpacity
        style={styles.cardContent}
        onPress={() => openEdit(item)}
      >
        <View>
          <Text style={styles.nombre}>{item.nombre}</Text>
          {item.telefono && (
            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.info}> {item.telefono}</Text>
            </View>
          )}
          {item.email && (
            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.info}> {item.email}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={() => handleDelete(item)}>
          <Ionicons name="trash-outline" size={20} color={colors.error} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Card>
  );

  if (isLoading && distribuidores.length === 0) {
    return <Loading fullScreen message="Cargando distribuidores..." />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={distribuidores}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={distribuidores.length === 0 ? styles.emptyContainer : styles.list}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={loadData} />
        }
        ListEmptyComponent={
          <EmptyState
            title="No hay distribuidores"
            message="Añade proveedores para tus ingredientes"
            actionLabel="Crear Distribuidor"
            onAction={openCreate}
          />
        }
      />

      <Button
        title="+ Nuevo Distribuidor"
        onPress={openCreate}
        style={styles.fab}
      />

      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>
            {editing ? 'Editar Distribuidor' : 'Nuevo Distribuidor'}
          </Text>

          <Input
            label="Nombre"
            value={nombre}
            onChangeText={setNombre}
            placeholder="Nombre del distribuidor"
            error={errors.nombre}
          />

          <Input
            label="Teléfono"
            value={telefono}
            onChangeText={setTelefono}
            placeholder="666 666 666"
            keyboardType="phone-pad"
          />

          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="contacto@distribuidor.com"
            keyboardType="email-address"
          />

          <View style={styles.modalButtons}>
            <Button
              title="Cancelar"
              onPress={() => setShowModal(false)}
              variant="secondary"
              style={styles.modalButton}
            />
            <Button
              title={editing ? 'Actualizar' : 'Crear'}
              onPress={handleSave}
              loading={saving}
              style={styles.modalButton}
            />
          </View>
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
  list: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
  },
  card: {
    marginBottom: spacing.sm,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nombre: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  info: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
  },
  deleteButton: {
    fontSize: 18,
    padding: spacing.sm,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
  },
  modalContainer: {
    flex: 1,
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  modalTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  modalButton: {
    flex: 1,
  },
});
