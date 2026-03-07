import { useEffect, useRef } from 'react';
import './Gallery.css';

const images = [
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80',
  'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&q=80',
  'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600&q=80',
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80',
  'https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=600&q=80',
  'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=600&q=80',
];

export function Gallery() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.8) {
        const elements = sectionRef.current.querySelectorAll('.gallery__item');
        elements.forEach((el, i) => {
          setTimeout(() => {
            el.classList.add('gallery__item--visible');
          }, i * 100);
        });
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section id="galeria" className="gallery" ref={sectionRef}>
      <div className="container">
        <h2 className="section-title">Galería</h2>
        <p className="section-subtitle">Un glimpse de nuestra casa</p>
        <div className="gallery__grid">
          {images.map((src, index) => (
            <div key={index} className="gallery__item">
              <img src={src} alt={`Galería ${index + 1}`} />
              <div className="gallery__overlay"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
