import { useState } from 'react';
import { useFranjas } from '../../hooks/useFranjas';
import { useReservas } from '../../hooks/useReservas';
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
    comensales: '2',
    nombre: '',
    telefono: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [reservaConfirmada, setReservaConfirmada] = useState<ReservaResponse | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const reserva = await crearReserva({
        fecha: formData.fecha,
        franjaId: formData.franjaId,
        comensales: parseInt(formData.comensales),
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
      <div className="reserva-form__row">
        <div className="input-group">
          <label htmlFor="fecha">Fecha</label>
          <input
            type="date"
            id="fecha"
            name="fecha"
            value={formData.fecha}
            onChange={handleChange}
            min={today}
            required
          />
        </div>
        <div className="input-group">
          <label htmlFor="comensales">Comensales</label>
          <select
            id="comensales"
            name="comensales"
            value={formData.comensales}
            onChange={handleChange}
            required
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? 'persona' : 'personas'}
              </option>
            ))}
            <option value="9">9+ (contactar)</option>
          </select>
        </div>
      </div>

      <div className="input-group">
        <label htmlFor="franjaId">Hora</label>
        <select
          id="franjaId"
          name="franjaId"
          value={formData.franjaId}
          onChange={handleChange}
          disabled={loadingFranjas}
          required
        >
          <option value="">Selecciona una hora</option>
          {franjas.map((franja) => (
            <option key={franja.id} value={franja.id}>
              {franja.nombre} ({franja.horaInicio} - {franja.horaFin})
            </option>
          ))}
        </select>
      </div>

      <div className="reserva-form__row">
        <div className="input-group">
          <label htmlFor="nombre">Nombre completo</label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
          />
        </div>
        <div className="input-group">
          <label htmlFor="telefono">Teléfono</label>
          <input
            type="tel"
            id="telefono"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      {error && <div className="reserva-form__error">{error}</div>}

      <button
        type="submit"
        className="btn btn-primary reserva-form__submit"
        disabled={loadingReserva}
      >
        {loadingReserva ? 'Confirmando...' : 'Confirmar Reserva'}
      </button>
    </form>
  );
}
