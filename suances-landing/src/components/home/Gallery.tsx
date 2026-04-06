import { useEffect, useRef, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import './Gallery.css';

const images = [
  '/images/IMG_2586.jpg',
  '/images/IMG_3845.JPG',
  '/images/IMG_3848.JPG',
  '/images/IMG_3853.JPG',
  '/images/IMG_3895.JPG',
  '/images/IMG_9138.JPG',
  '/images/IMG_9139.JPG',
  '/images/IMG_9140.JPG',
  '/images/IMG_9141.JPG',
  '/images/IMG_9142.JPG',
  '/images/IMG_9144.JPG',
  '/images/IMG_9145.JPG',
  '/images/IMG_9146.JPG',
  '/images/IMG_9147.JPG',
  '/images/IMG_9150.JPG',
];

export function Gallery() {
  const sectionRef = useRef<HTMLElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const autoplayRef = useRef<number | null>(null);

  const scrollTo = useCallback((index: number) => {
    const slider = sliderRef.current;
    if (!slider) return;
    
    const cardWidth = slider.offsetWidth - 32;
    slider.scrollTo({
      left: index * cardWidth,
      behavior: 'smooth'
    });
    setCurrentIndex(index);
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % images.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + images.length) % images.length);
  }, []);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
    document.body.style.overflow = '';
  };

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const visible = rect.top < window.innerHeight * 0.8 && rect.bottom > 0;
      setIsVisible(visible);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!isVisible || isPaused || window.innerWidth > 768 || lightboxIndex !== null) return;

    autoplayRef.current = window.setInterval(() => {
      nextSlide();
    }, 4000);

    return () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
      }
    };
  }, [isVisible, isPaused, nextSlide, lightboxIndex]);

  useEffect(() => {
    if (window.innerWidth > 768 || !sliderRef.current) return;
    
    const slider = sliderRef.current;
    const cardWidth = slider.offsetWidth - 32;
    
    slider.scrollTo({
      left: currentIndex * cardWidth,
      behavior: 'smooth'
    });
  }, [currentIndex]);

  const handleTouchStart = () => setIsPaused(true);
  const handleTouchEnd = () => setIsPaused(false);

  const handleLightboxKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') setLightboxIndex(prev => prev !== null ? (prev - 1 + images.length) % images.length : null);
    if (e.key === 'ArrowRight') setLightboxIndex(prev => prev !== null ? (prev + 1) % images.length : null);
  };

  return (
    <section 
      id="galeria" 
      className="gallery" 
      ref={sectionRef}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="container">
        <h2 className="section-title">Galeria</h2>
        <p className="section-subtitle">Un glimpse de nuestra casa</p>
        
        <div className="gallery__grid">
          {images.map((src, index) => (
            <div 
              key={index} 
              className="gallery__item"
              onClick={() => openLightbox(index)}
            >
              <img src={src} alt={'Galeria ' + (index + 1)} loading="lazy" />
              <div className="gallery__overlay"></div>
            </div>
          ))}
        </div>

        <div className="gallery__slider">
          <button 
            className="gallery__arrow gallery__arrow--prev" 
            onClick={prevSlide}
            aria-label="Imagen anterior"
          >
            <ChevronLeft size={24} />
          </button>

          <div 
            className="gallery__track"
            ref={sliderRef}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {images.map((src, index) => (
              <div 
                key={index} 
                className="gallery__card"
                onClick={() => openLightbox(index)}
              >
                <img src={src} alt={'Galeria ' + (index + 1)} loading="lazy" />
              </div>
            ))}
          </div>

          <button 
            className="gallery__arrow gallery__arrow--next" 
            onClick={nextSlide}
            aria-label="Siguiente imagen"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        <div className="gallery__pagination">
          {images.map((_, index) => (
            <button
              key={index}
              className={`gallery__dot ${index === currentIndex ? 'gallery__dot--active' : ''}`}
              onClick={() => scrollTo(index)}
              aria-label={`Ir a imagen ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {lightboxIndex !== null && (
        <div 
          className="gallery__lightbox"
          onClick={closeLightbox}
          onKeyDown={handleLightboxKeyDown}
          tabIndex={0}
        >
          <button 
            className="gallery__lightbox-close"
            onClick={closeLightbox}
            aria-label="Cerrar"
          >
            <X size={28} />
          </button>
          
          <button 
            className="gallery__lightbox-arrow gallery__lightbox-arrow--prev"
            onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex - 1 + images.length) % images.length); }}
            aria-label="Imagen anterior"
          >
            <ChevronLeft size={32} />
          </button>

          <div className="gallery__lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img src={images[lightboxIndex]} alt={'Galeria ' + (lightboxIndex + 1)} />
          </div>

          <button 
            className="gallery__lightbox-arrow gallery__lightbox-arrow--next"
            onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex + 1) % images.length); }}
            aria-label="Siguiente imagen"
          >
            <ChevronRight size={32} />
          </button>
        </div>
      )}
    </section>
  );
}