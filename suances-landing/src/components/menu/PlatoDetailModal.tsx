import { useEffect } from 'react';
import type { Plato } from '../../pages/Menu';
import { X } from 'lucide-react';

interface PlatoDetailModalProps {
  plato: Plato;
  onClose: () => void;
}

export function PlatoDetailModal({ plato, onClose }: PlatoDetailModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  const formatPrecio = (precio: number) => {
    return precio.toFixed(2) + ' €';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content plato-detail-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={24} />
        </button>

        {plato.imagenUrl && (
          <div className="plato-detail-galeria">
            <img 
              src={plato.imagenUrl} 
              alt={plato.nombre}
              className="plato-detail-imagen"
            />
          </div>
        )}

        <div className="plato-detail-info">
          <h2 className="plato-detail-nombre">{plato.nombre}</h2>
          {plato.descripcion && <p className="plato-detail-descripcion">{plato.descripcion}</p>}
          <p className="plato-detail-precio">{formatPrecio(plato.precio)}</p>
        </div>
      </div>
    </div>
  );
}
