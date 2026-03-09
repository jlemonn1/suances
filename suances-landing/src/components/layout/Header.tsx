import { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import './Header.css';

interface HeaderProps {
  onReservarClick: () => void;
}

export function Header({ onReservarClick }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleWhatsAppClick = () => {
    window.open('https://wa.me/34653593891', '_blank');
  };

  return (
    <header className={`header ${scrolled ? 'header--scrolled' : ''}`}>
      <div className="header__container">
        <div className="header__logo">
          <span className="header__logo-text">Suances</span>
        </div>
        <nav className="header__nav">
          <a href="#inicio" className="header__link">Inicio</a>
          <a href="#info" className="header__link">Info</a>
          <a href="#galeria" className="header__link">Galería</a>
          <a href="#contacto" className="header__link">Contacto</a>
        </nav>
        <div className="header__actions">
          <button 
            className="header__whatsapp" 
            onClick={handleWhatsAppClick}
            aria-label="Contactar por WhatsApp"
          >
            <MessageCircle size={20} strokeWidth={1.5} />
          </button>
          <button className="btn btn-primary header__cta" onClick={onReservarClick}>
            Reservar
          </button>
        </div>
      </div>
    </header>
  );
}
