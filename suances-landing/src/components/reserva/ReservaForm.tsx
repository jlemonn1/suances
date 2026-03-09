import { useState } from 'react';
import { useFranjas } from '../../hooks/useFranjas';
import { useReservas } from '../../hooks/useReservas';
import { FechaInput } from '../form/FechaInput';
import { NombreInput } from '../form/NombreInput';
import { TelefonoInput } from '../form/TelefonoInput';
import { ComensalesSelector } from '../form/ComensalesSelector';
import { HoraSelector } from '../form/HoraSelector';
import type { ReservaResponse } from '../../types';
import './ReservaForm.css';

interface ReservaFormProps {
  onSuccess?: (reserva: ReservaResponse) => void;
}

export function ReservaForm({ onSuccess }: ReservaFormProps) {
  const { franjas, loading: loadingFranjas } = useFranjas();
  const { crearReserva, loading: loadingReserva, error } = useReservas();

  const [formData, setFormData] = useState({
    fecha: '',
    franjaId: '',
    comensales: 2,
    nombre: '',
    telefono: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [reservaConfirmada, setReservaConfirmada] = useState<ReservaResponse | null>(null);

  const handleFechaChange = (value: string) => {
    setFormData((prev) => ({ ...prev, fecha: value }));
  };

  const handleComensalesChange = (value: number) => {
    setFormData((prev) => ({ ...prev, comensales: value }));
  };

  const handleFranjaChange = (value: string) => {
    setFormData((prev) => ({ ...prev, franjaId: value }));
  };

  const handleNombreChange = (value: string) => {
    setFormData((prev) => ({ ...prev, nombre: value }));
  };

  const handleTelefonoChange = (value: string) => {
    setFormData((prev) => ({ ...prev, telefono: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const reserva = await crearReserva({
        fecha: formData.fecha,
        franjaId: formData.franjaId,
        comensales: formData.comensales,
        nombre: formData.nombre,
        telefono: formData.telefono,
      });
      setReservaConfirmada(reserva);
      setSubmitted(true);
      onSuccess?.(reserva);
    } catch {
      // Error ya manejado en el hook
    }
  };

  const today = new Date().toISOString().split('T')[0];

  if (submitted && reservaConfirmada) {
    return (
      <div className="reserva-form__success">
        <div className="reserva-form__success-icon">✓</div>
        <h3 className="reserva-form__success-title">¡Reserva Confirmada!</h3>
        <p className="reserva-form__success-text">
          Tu código de reserva es: <strong>{reservaConfirmada.codigo}</strong>
        </p>
        <div className="reserva-form__success-details">
          <p><strong>Fecha:</strong> {new Date(reservaConfirmada.fecha).toLocaleDateString('es-ES')}</p>
          <p><strong>Comensales:</strong> {reservaConfirmada.comensales}</p>
          <p><strong>Nombre:</strong> {reservaConfirmada.nombreCliente}</p>
        </div>
        <p className="reserva-form__success-note">
          Te hemos enviado un correo de confirmación. Gracias por elegirnos.
        </p>
      </div>
    );
  }

  return (
    <form className="reserva-form" onSubmit={handleSubmit}>
      {/* Fecha y Comensales */}
      <div className="reserva-form__row">
        <FechaInput
          value={formData.fecha}
          onChange={handleFechaChange}
          min={today}
          required
        />
        <ComensalesSelector
          value={formData.comensales}
          onChange={handleComensalesChange}
          min={1}
          max={12}
        />
      </div>

      {/* Selector de Hora */}
      <HoraSelector
        franjas={franjas}
        value={formData.franjaId}
        onChange={handleFranjaChange}
        loading={loadingFranjas}
      />

      {/* Nombre y Teléfono */}
      <div className="reserva-form__row">
        <NombreInput
          value={formData.nombre}
          onChange={handleNombreChange}
          required
        />
        <TelefonoInput
          value={formData.telefono}
          onChange={handleTelefonoChange}
          required
        />
      </div>

      {error && <div className="reserva-form__error">{error}</div>}

      <button
        type="submit"
        className="btn btn-primary reserva-form__submit"
        disabled={loadingReserva}
      >
        {loadingReserva ? (
          <>
            <span className="reserva-form__spinner"></span>
            Confirmando...
          </>
        ) : (
          'Confirmar Reserva'
        )}
      </button>
    </form>
  );
}
