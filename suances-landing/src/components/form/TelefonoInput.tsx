import { useState } from 'react';
import { Phone, Check } from 'lucide-react';
import './form-components.css';

interface TelefonoInputProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export function TelefonoInput({ value, onChange, required }: TelefonoInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const formatPhoneNumber = (input: string) => {
    // Eliminar todo excepto números
    const cleaned = input.replace(/\D/g, '');
    
    // Limitar a 9 dígitos (España)
    const limited = cleaned.slice(0, 9);
    
    // Formatear: 123 456 789
    if (limited.length >= 6) {
      return `${limited.slice(0, 3)} ${limited.slice(3, 6)} ${limited.slice(6)}`;
    } else if (limited.length >= 3) {
      return `${limited.slice(0, 3)} ${limited.slice(3)}`;
    }
    return limited;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\s/g, '');
    onChange(rawValue);
  };

  const isComplete = value.length === 9;

  return (
    <div className={`form-field ${isFocused ? 'focused' : ''} ${value ? 'has-value' : ''}`}>
      <label className="form-field__label">
        <Phone className="form-field__icon" size={14} strokeWidth={1.5} />
        Teléfono
      </label>
      <div className="form-field__input-wrapper">
        <span className="form-field__prefix">+34</span>
        <input
          type="tel"
          value={formatPhoneNumber(value)}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="123 456 789"
          required={required}
          className="form-field__input form-field__input--with-prefix"
          inputMode="numeric"
        />
        {isComplete && (
          <Check className="form-field__check" size={16} strokeWidth={2.5} />
        )}
      </div>
      <span className="form-field__hint">
        Te enviaremos un SMS de confirmación
      </span>
    </div>
  );
}
