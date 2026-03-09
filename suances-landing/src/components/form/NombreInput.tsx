import { useState } from 'react';
import { User, Check } from 'lucide-react';
import './form-components.css';

interface NombreInputProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export function NombreInput({ value, onChange, required }: NombreInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isValid, setIsValid] = useState(true);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    // Validación simple: al menos 2 caracteres
    if (newValue.length > 0) {
      setIsValid(newValue.length >= 2);
    } else {
      setIsValid(true);
    }
  };

  return (
    <div className={`form-field ${isFocused ? 'focused' : ''} ${value ? 'has-value' : ''} ${!isValid ? 'error' : ''}`}>
      <label className="form-field__label">
        <User className="form-field__icon" size={14} strokeWidth={1.5} />
        Nombre
      </label>
      <div className="form-field__input-wrapper">
        <input
          type="text"
          value={value}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Ej: María García"
          required={required}
          className="form-field__input"
        />
        {value && isValid && (
          <Check className="form-field__check" size={16} strokeWidth={2.5} />
        )}
      </div>
      {!isValid && (
        <span className="form-field__error-text">Introduce un nombre válido</span>
      )}
    </div>
  );
}
