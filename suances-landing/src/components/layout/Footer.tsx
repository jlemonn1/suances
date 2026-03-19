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
              <li>Lunes - Jueves: 13:00 - 23:00</li>
              <li>Viernes - Sábado: 13:00 - 00:00</li>
              <li>Domingo: 13:00 - 22:00</li>
            </ul>
          </div>
          <div className="footer__section">
            <h4 className="footer__subtitle">Contacto</h4>
            <ul className="footer__list">
              <li>Calle Principal, 123</li>
              <li>Madrid, España</li>
              <li>+34 900 123 456</li>
              <li>info@isabella.com</li>
            </ul>
          </div>
          <div className="footer__section">
            <h4 className="footer__subtitle">Síguenos</h4>
            <div className="footer__social">
              <a href="#" className="footer__social-link">Instagram</a>
              <a href="#" className="footer__social-link">Facebook</a>
              <a href="#" className="footer__social-link">Twitter</a>
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
