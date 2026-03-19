import type { Plato } from '../../pages/Menu';

interface PlatoCardProps {
  plato: Plato;
  onClick: () => void;
}

export function PlatoCard({ plato, onClick }: PlatoCardProps) {
  const formatPrecio = (precio: number) => {
    return precio.toFixed(2) + ' €';
  };

  const imagenUrl = plato.imagenUrl;

  return (
    <article className="plato-card" onClick={onClick}>
      <div className="plato-imagen-container">
        {imagenUrl ? (
          <img 
            src={imagenUrl} 
            alt={plato.nombre} 
            className="plato-imagen"
          />
        ) : (
          <div className="plato-imagen-placeholder">
            <span>🍽️</span>
          </div>
        )}
      </div>
      <div className="plato-info">
        <h3 className="plato-nombre">{plato.nombre}</h3>
        {plato.descripcion && (
          <p className="plato-descripcion">{plato.descripcion}</p>
        )}
        <p className="plato-precio">{formatPrecio(plato.precio)}</p>
      </div>
    </article>
  );
}
