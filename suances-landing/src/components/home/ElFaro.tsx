import { useEffect, useRef } from 'react';
import './ElFaro.css';

const faroCards = [
  {
    id: 'historia',
    title: 'Historia',
    text: 'Todo empezo aqui. El Faro ha sido durante años mas que un restaurante: el punto de encuentro donde comenzo esta aventura gastronomica. Hoy sigue siendo la base de nuestro proyecto.',
    image: '/images/F_IMG_3899.JPG',
  },
  {
    id: 'ambiente',
    title: 'Ambiente',
    text: 'Un espacio acogedor donde se respira familia. Ambiente relajado, entre colegas, risas compartidas y esa cercania que hace sentir como en casa. Mas desenfadado que nuestro salon principal, pero con la misma pasion.',
    image: '/images/F_IMG_3893.JPG',
  },
  {
    id: 'legado',
    title: 'Legado',
    text: 'De El Faro nacio todo. Su espiritu vive en cada rincon de nuestro proyecto actual.',
    image: '/images/F_lll.JPG',
  },
];

export function ElFaro() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('elfaro__card--visible');
          }
        });
      },
      { threshold: 0.2 }
    );

    const cards = cardsRef.current;
    cards.forEach((card) => {
      if (card) observer.observe(card);
    });

    return () => {
      cards.forEach((card) => {
        if (card) observer.unobserve(card);
      });
    };
  }, []);

  return (
    <section id="el-faro" className="elfaro" ref={sectionRef}>
      <div className="container">
        <h2 className="section-title">El Faro</h2>
        <p className="section-subtitle elfaro__subtitle">Nuestros origenes, nuestra esencia</p>
        <div className="elfaro__grid">
          {faroCards.map((card, index) => (
            <div
              key={card.id}
              className="elfaro__card"
              ref={(el) => {
                if (el) cardsRef.current[index] = el;
              }}
            >
              <div className="elfaro__card-image">
                <img src={card.image} alt={card.title} />
                <div className="elfaro__card-overlay" />
              </div>
              <div className="elfaro__card-content">
                <h3 className="elfaro__card-title">{card.title}</h3>
                <p className="elfaro__card-text">{card.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
