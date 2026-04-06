import { useRef, useEffect } from 'react';
import type { CartaCategoria } from '../../data/cartaData';
import './CartaSwiper.css';

interface CartaSwiperProps {
  categorias: CartaCategoria[];
  mostrarPrecios?: boolean;
}

export function CartaSwiper({ categorias, mostrarPrecios = false }: CartaSwiperProps) {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const timer = setTimeout(() => {
      const scrollAmount = 100;
      
      grid.scrollTo({
        left: scrollAmount,
        behavior: 'smooth'
      });

      setTimeout(() => {
        grid.scrollTo({
          left: 0,
          behavior: 'smooth'
        });
      }, 400);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const scrollToCategoria = (index: number) => {
    const grid = gridRef.current;
    if (!grid) return;

    const sections = grid.querySelectorAll('.carta-section');
    const targetSection = sections[index] as HTMLElement;

    if (targetSection) {
      const gridRect = grid.getBoundingClientRect();
      const sectionRect = targetSection.getBoundingClientRect();
      const scrollLeft = grid.scrollLeft + sectionRect.left - gridRect.left - 16;

      grid.scrollTo({
        left: scrollLeft,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="carta">
      <nav className="carta-nav">
        {categorias.map((cat, index) => (
          <button
            key={cat.categoria}
            className="carta-nav__item"
            onClick={() => scrollToCategoria(index)}
          >
            {cat.categoria}
          </button>
        ))}
      </nav>

      <div className="carta-grid" ref={gridRef}>
        {categorias.map((cat) => (
          <section key={cat.categoria} className="carta-section">
            <h3 className="carta-section__titulo">{cat.categoria}</h3>
            <ul className="carta-section__lista">
              {cat.platos.map((plato, pIndex) => (
                <li key={`${cat.categoria}-${pIndex}`} className="carta-plato">
                  <span className="carta-plato__nombre">{plato.nombre}</span>
                  {mostrarPrecios && (
                    <span className="carta-plato__precio">{plato.precio.toFixed(2)} €</span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}