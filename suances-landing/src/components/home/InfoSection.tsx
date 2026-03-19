import { MapPin, Clock, Phone, Mail } from 'lucide-react';
import './InfoSection.css';

export function InfoSection() {
  return (
    <section id="info" className="info-section">
      <div className="container">
        <div className="info-section__grid">
          <div className="info-section__card">
            <div className="info-section__icon">
              <MapPin size={32} strokeWidth={1.5} />
            </div>
            <h3 className="info-section__title">Dirección</h3>
            <p className="info-section__text">
              Calle Principal, 123<br />
              Madrid, España
            </p>
          </div>
          <div className="info-section__card">
            <div className="info-section__icon">
              <Clock size={32} strokeWidth={1.5} />
            </div>
            <h3 className="info-section__title">Horario</h3>
            <p className="info-section__text">
              Lun-Jue: 13:00 - 23:00<br />
              Vie-Sáb: 13:00 - 00:00<br />
              Dom: 13:00 - 22:00
            </p>
          </div>
          <div className="info-section__card">
            <div className="info-section__icon">
              <Phone size={32} strokeWidth={1.5} />
            </div>
            <h3 className="info-section__title">Teléfono</h3>
            <p className="info-section__text">
              +34 900 123 456<br />
              Disponible siempre
            </p>
          </div>
          <div className="info-section__card">
            <div className="info-section__icon">
              <Mail size={32} strokeWidth={1.5} />
            </div>
            <h3 className="info-section__title">Email</h3>
            <p className="info-section__text">
              info@isabella.com<br />
              Respondemos en 24h
            </p>
          </div>
        </div>
        <div className="info-section__about">
          <h2 className="section-title">Nuestra Cocina</h2>
          <p className="section-subtitle">
            Tradición y pasión en cada plato
          </p>
          <p className="info-section__description">
            En Restaurante Isabella combinamos los sabores auténticos de la cocina tradicional 
            con técnicas modernas de presentación. Nuestro compromiso es ofrecer una experiencia 
            gastronómica única, utilizando siempre productos frescos de temporada seleccionados 
            por nuestros proveedores de confianza.
          </p>
        </div>
      </div>
    </section>
  );
}
