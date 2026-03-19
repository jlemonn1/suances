import { useEffect, useRef } from 'react';
import './Hero.css';

interface HeroProps {
  onReservarClick: () => void;
}

export function Hero({ onReservarClick }: HeroProps) {
  const heroRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (imageRef.current) {
        const scrollY = window.scrollY;
        imageRef.current.style.transform = `translateY(${scrollY * 0.5}px)`;
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section id="inicio" className="hero" ref={heroRef}>
      <div className="hero__background" ref={imageRef}>
        <img 
          src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&q=80" 
          alt="Restaurante Isabella"
        />
      </div>
      <div className="hero__overlay"></div>
      <div className="hero__content">
        <h1 className="hero__title animate-slide-up">
          Restaurante Isabella
        </h1>
        <p className="hero__subtitle animate-fade-in">
          Donde la tradición culinaria meets la innovación
        </p>
        <div className="hero__actions animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <button className="btn btn-primary" onClick={onReservarClick}>
            Reservar Mesa
          </button>
          <a href="#info" className="btn btn-outline">
            Conócenos
          </a>
        </div>
      </div>
      <div className="hero__scroll">
        <span>Desliza</span>
        <div className="hero__scroll-line"></div>
      </div>
    </section>
  );
}
