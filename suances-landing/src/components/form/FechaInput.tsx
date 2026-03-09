import { useState } from 'react';
import { Calendar } from 'lucide-react';
import './form-components.css';

interface FechaInputProps {
  value: string;
  onChange: (value: string) => void;
  min?: string;
  required?: boolean;
}

export function FechaInput({ value, onChange, min, required }: FechaInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  
  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    });
  };

  return (
    <div className={`form-field ${isFocused ? 'focused' : ''} ${value ? 'has-value' : ''}`}>
      <label className="form-field__label">
        <Calendar className="form-field__icon" size={14} strokeWidth={1.5} />
        Fecha
      </label>
      <div className="form-field__input-wrapper">
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          min={min}
          required={required}
          className="form-field__input form-field__input--date"
        />
        {value && (
          <span className="form-field__display-value">
            {formatDisplayDate(value)}
          </span>
        )}
      </div>
    </div>
  );
}
