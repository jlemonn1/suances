import './Footer.css';

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__grid">
          <div className="footer__section">
            <h3 className="footer__title">Isabella</h3>
            <p className="footer__text">
              Restaurante de cocina tradicional con un toque moderno. 
              Disfruta de la mejor gastronomía en un ambiente único.
            </p>
          </div>
          <div className="footer__section">
            <h4 className="footer__subtitle">Horario</h4>
            <ul className="footer__list">
              <li>Faro: Jueves a Domingo</li>
              <li>Isabella: Miércoles a Lunes</li>
              <li>12:00 - 00:00</li>
            </ul>
          </div>
          <div className="footer__section">
            <h4 className="footer__subtitle">Contacto</h4>
            <ul className="footer__list">
              <li>Travesia del muelle 17</li>
              <li>Suances, Cantabria</li>
              <li><a href="tel:+34942810275" style={{ color: 'inherit', textDecoration: 'none' }}>942 81 02 75</a></li>
              <li><a href="mailto:trattoriaisabella.arg@gmail.com" style={{ color: 'inherit', textDecoration: 'none' }}>trattoriaisabella.arg@gmail.com</a></li>
            </ul>
          </div>
          <div className="footer__section">
            <h4 className="footer__subtitle">Síguenos</h4>
            <div className="footer__social">
              <a href="https://www.instagram.com/isabella.trattoria/" target="_blank" rel="noopener noreferrer" className="footer__social-link">Instagram</a>
              <a href="https://www.tiktok.com/@isabella.trattoria" target="_blank" rel="noopener noreferrer" className="footer__social-link">TikTok</a>
            </div>
          </div>
        </div>
        <div className="footer__bottom">
          <p>&copy; {new Date().getFullYear()} Restaurante Isabella. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
