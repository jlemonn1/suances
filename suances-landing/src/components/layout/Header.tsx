import { useState, useEffect } from 'react';
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
        <button className="btn btn-primary header__cta" onClick={onReservarClick}>
          Reservar
        </button>
      </div>
    </header>
  );
}
