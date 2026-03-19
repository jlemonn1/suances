import type { CategoriaMenu } from '../../pages/Menu';

interface MenuListProps {
  categorias: CategoriaMenu[];
}

export function MenuList({ categorias }: MenuListProps) {
  const formatPrecio = (precio: number) => {
    return precio.toFixed(2) + ' €';
  };

  return (
    <div className="menu-simple">
      {categorias.map((categoria) => (
        <section key={categoria.nombre} className="menu-categoria-simple">
          <h2 className="categoria-titulo-simple">{categoria.nombre}</h2>
          <ul className="platos-lista">
            {categoria.platos.map((plato) => (
              <li key={plato.id} className="plato-linea">
                <span className="plato-nombre-simple">{plato.nombre}</span>
                <span className="plato-precio-simple">{formatPrecio(plato.precio)}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}