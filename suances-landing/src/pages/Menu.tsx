import { useState, useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { MenuList } from '../components/menu/MenuList';

export interface Plato {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  imagenUrl: string | null;
}

export interface CategoriaMenu {
  nombre: string;
  platos: Plato[];
}

export interface MenuCarta {
  categorias: CategoriaMenu[];
}

export function Menu() {
  const [menu, setMenu] = useState<MenuCarta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await fetch('http://172.20.10.7/api/carta/api/menu');
        if (!response.ok) {
          throw new Error('Error al cargar el menú');
        }
        const data = await response.json();
        setMenu(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  if (loading) {
    return (
      <>
        <Header onReservarClick={() => {}} />
        <main className="loading-container">
          <div className="loading-spinner">Cargando menú...</div>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !menu) {
    return (
      <>
        <Header onReservarClick={() => {}} />
        <main className="error-container">
          <h2>No hay menú disponible</h2>
          <p>En estos momentos no hay carta activa. Prueba más tarde.</p>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header onReservarClick={() => {}} />
      <main className="menu-page">
        <div className="menu-header">
          <h1>Nuestra Carta</h1>
        </div>
        
        <MenuList categorias={menu.categorias} />
      </main>
      <Footer />
    </>
  );
}