import './ContactSection.css';

export function ContactSection() {
  return (
    <section id="contacto" className="contact-section">
      <div className="container">
        <h2 className="section-title">Contacto</h2>
        <p className="section-subtitle">Escríbenos o visítanos</p>
        <div className="contact-section__grid">
          <div className="contact-section__info">
            <div className="contact-section__item">
              <span className="contact-section__icon">📍</span>
              <div>
                <h4>Dirección</h4>
                <p>Travesia del muelle 17<br />Suances, Cantabria</p>
              </div>
            </div>
            <div className="contact-section__item">
              <span className="contact-section__icon">📞</span>
              <div>
                <h4>Teléfono</h4>
                <p><a href="tel:+34942810275" style={{ color: 'inherit', textDecoration: 'none' }}>942 81 02 75</a></p>
              </div>
            </div>
            <div className="contact-section__item">
              <span className="contact-section__icon">✉️</span>
              <div>
                <h4>Email</h4>
                <p><a href="mailto:trattoriaisabella.arg@gmail.com" style={{ color: 'inherit', textDecoration: 'none' }}>trattoriaisabella.arg@gmail.com</a></p>
              </div>
            </div>
            <div className="contact-section__item">
              <span className="contact-section__icon">🕐</span>
              <div>
                <h4>Horario</h4>
                <p>Miércoles a Lunes<br/>12:30 - 23:30</p>
              </div>
            </div>
          </div>
          <div className="contact-section__map">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2300!2d-4.036711!3d43.432988!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDPCsDI1JzU4LjgiTiA0wrAwMicxMi4yIlc!5e0!3m2!1ses!2ses!4v1699999999999!5m2!1ses!2ses"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              title="Ubicación"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
}
