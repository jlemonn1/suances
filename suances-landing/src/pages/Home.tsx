import { useState } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Hero } from '../components/home/Hero';
import { InfoSection } from '../components/home/InfoSection';
import { Gallery } from '../components/home/Gallery';
import { ContactSection } from '../components/home/ContactSection';
import { ReservaModal } from '../components/reserva/ReservaModal';

export function Home() {
  const [reservaOpen, setReservaOpen] = useState(false);

  return (
    <>
      <Header onReservarClick={() => setReservaOpen(true)} />
      <main>
        <Hero onReservarClick={() => setReservaOpen(true)} />
        <InfoSection />
        <Gallery />
        <ContactSection />
      </main>
      <Footer />
      <ReservaModal isOpen={reservaOpen} onClose={() => setReservaOpen(false)} />
    </>
  );
}
