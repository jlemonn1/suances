import { Clock, AlertCircle } from 'lucide-react';
import './form-components.css';

interface Franja {
  id: string;
  nombre: string;
  horaInicio: string;
  horaFin: string;
}

interface HoraSelectorProps {
  franjas: Franja[];
  value: string;
  onChange: (value: string) => void;
  loading?: boolean;
}

export function HoraSelector({ franjas, value, onChange, loading }: HoraSelectorProps) {
  if (loading) {
    return (
      <div className="form-field hora-field">
        <label className="form-field__label">
          <Clock className="form-field__icon" size={14} strokeWidth={1.5} />
          Hora
        </label>
        <div className="hora-selector__loading">
          <div className="hora-selector__spinner"></div>
          <span>Cargando horarios...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="form-field hora-field">
      <label className="form-field__label">
        <Clock className="form-field__icon" size={14} strokeWidth={1.5} />
        Hora
      </label>

      <div className="hora-selector__grid">
        {franjas.length === 0 ? (
          <div className="hora-selector__empty">
            <AlertCircle size={32} strokeWidth={1.5} />
            <span>No hay horarios disponibles</span>
          </div>
        ) : (
          franjas.map((franja) => (
            <button
              key={franja.id}
              type="button"
              className={`hora-selector__option ${value === franja.id ? 'selected' : ''}`}
              onClick={() => onChange(franja.id)}
            >
              <span className="hora-selector__time">{franja.horaInicio}</span>
            </button>
          ))
        )}
      </div>

      {value && (
        <div className="hora-selector__selected">
          <span>Seleccionado: </span>
          <strong>
            {franjas.find(f => f.id === value)?.horaInicio} - {franjas.find(f => f.id === value)?.horaFin}
          </strong>
        </div>
      )}
    </div>
  );
}
