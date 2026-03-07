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
                <p>Calle Principal, 123<br />Madrid, España</p>
              </div>
            </div>
            <div className="contact-section__item">
              <span className="contact-section__icon">📞</span>
              <div>
                <h4>Teléfono</h4>
                <p>+34 900 123 456</p>
              </div>
            </div>
            <div className="contact-section__item">
              <span className="contact-section__icon">✉️</span>
              <div>
                <h4>Email</h4>
                <p>info@suances.com</p>
              </div>
            </div>
            <div className="contact-section__item">
              <span className="contact-section__icon">🕐</span>
              <div>
                <h4>Horario</h4>
                <p>Lun-Dom: 13:00 - 00:00</p>
              </div>
            </div>
          </div>
          <div className="contact-section__map">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3037.497197178362!2d-3.703790084683987!3d40.41677507936456!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd42249780000001%3A0x0!2zNDDCsDI1JzAwLjAiTiAzwrA0MicxNy4xIlc!5e0!3m2!1ses!2ses!4v1234567890"
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
