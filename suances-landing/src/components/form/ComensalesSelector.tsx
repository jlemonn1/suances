import { Users, Minus, Plus } from 'lucide-react';
import './form-components.css';

interface ComensalesSelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export function ComensalesSelector({ 
  value, 
  onChange, 
  min = 1, 
  max = 12 
}: ComensalesSelectorProps) {
  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const getComensalesText = (n: number) => {
    if (n === 1) return 'pers.';
    return 'pers.';
  };

  return (
    <div className="form-field comensales-field">
      <label className="form-field__label">
        <Users className="form-field__icon" size={14} strokeWidth={1.5} />
        Comensales
      </label>
      <div className="comensales-selector">
        <button
          type="button"
          className="comensales-selector__btn"
          onClick={handleDecrement}
          disabled={value <= min}
          aria-label="Reducir comensales"
        >
          <Minus size={16} strokeWidth={2} />
        </button>
        
        <div className="comensales-selector__value">
          <span className="comensales-selector__number">{value}</span>
          <span className="comensales-selector__text">{getComensalesText(value)}</span>
        </div>
        
        <button
          type="button"
          className="comensales-selector__btn"
          onClick={handleIncrement}
          disabled={value >= max}
          aria-label="Aumentar comensales"
        >
          <Plus size={16} strokeWidth={2} />
        </button>
      </div>
      
      <div className="comensales-selector__quick-options">
        {[2, 4, 6, 8].map((num) => (
          <button
            key={num}
            type="button"
            className={`comensales-selector__chip ${value === num ? 'active' : ''}`}
            onClick={() => onChange(num)}
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  );
}
