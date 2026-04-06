import { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
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

  const headerClass = scrolled ? 'header header--scrolled' : 'header';

  return (
    <header className={headerClass}>
      <div className="header__container">
<Link to="/" className="header__logo">
          <img src="/images/rojo.PNG" alt="Isabella" className="header__logo-img header__logo-img--default" />
          <img src="/images/negro.PNG" alt="Isabella" className="header__logo-img header__logo-img--scrolled" />
        </Link>
<nav className="header__nav">
          <Link to="/" className="header__link">Inicio</Link>
          <a href="#info" className="header__link">Info</a>
          <a href="#el-faro" className="header__link">El Faro</a>
          <a href="#galeria" className="header__link">Galeria</a>
          <Link to="/carta" className="header__link">Carta</Link>
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
