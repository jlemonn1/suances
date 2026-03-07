import { useEffect } from 'react';
import { ReservaForm } from './ReservaForm';
import './ReservaModal.css';

interface ReservaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReservaModal({ isOpen, onClose }: ReservaModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="reserva-modal" onClick={onClose}>
      <div className="reserva-modal__content" onClick={(e) => e.stopPropagation()}>
        <button className="reserva-modal__close" onClick={onClose}>
          ×
        </button>
        <h2 className="reserva-modal__title">Reserva tu Mesa</h2>
        <p className="reserva-modal__subtitle">
          Vuelve a nosotros y disfruta de una experiencia única
        </p>
        <ReservaForm />
      </div>
    </div>
  );
}
