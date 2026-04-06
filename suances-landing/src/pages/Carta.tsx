import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { CartaSwiper } from '../components/carta/CartaSwiper';
import { cartaData } from '../data/cartaData';

interface CartaProps {
  mostrarPrecios?: boolean;
}

export function Carta({ mostrarPrecios = false }: CartaProps) {
  return (
    <>
      <Header onReservarClick={() => {}} />
      <main className="carta-page">
        <div className="carta-header">
          <h1>Nuestra Carta</h1>
    
        </div>
        <CartaSwiper categorias={cartaData} mostrarPrecios={mostrarPrecios} />
      </main>
      <Footer />
    </>
  );
}