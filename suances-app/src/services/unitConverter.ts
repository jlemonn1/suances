export type UnidadConversor = 'KG' | 'G' | 'L' | 'ML' | 'UNIDAD';

interface FactorConversion {
  factor: number;
  base: 'G' | 'ML' | 'UNIDAD';
}

const FACTORES_CONVERSION: Record<UnidadConversor, FactorConversion> = {
  KG: { factor: 1000, base: 'G' },
  G: { factor: 1, base: 'G' },
  L: { factor: 1000, base: 'ML' },
  ML: { factor: 1, base: 'ML' },
  UNIDAD: { factor: 1, base: 'UNIDAD' },
};

export interface ConversionResultado {
  cantidadBase: number;
  precioBase: number;
  unidadBase: 'G' | 'ML' | 'UNIDAD';
  unidadBaseLabel: string;
}

export class UnitConverterService {
  static convertir(
    cantidad: number,
    unidadOrigen: UnidadConversor,
    precioTotal?: number
  ): ConversionResultado {
    const config = FACTORES_CONVERSION[unidadOrigen];
    const cantidadBase = cantidad * config.factor;
    
    let precioBase = 0;
    if (precioTotal !== undefined && cantidad > 0) {
      precioBase = precioTotal / cantidadBase;
    }

    return {
      cantidadBase,
      precioBase,
      unidadBase: config.base,
      unidadBaseLabel: config.base === 'G' ? 'g' : config.base === 'ML' ? 'ml' : 'unidad',
    };
  }

  static convertirPrecioUnitario(
    precioPorUnidad: number,
    unidadOrigen: UnidadConversor
  ): ConversionResultado {
    const config = FACTORES_CONVERSION[unidadOrigen];
    const precioBase = precioPorUnidad / config.factor;

    return {
      cantidadBase: 1,
      precioBase,
      unidadBase: config.base,
      unidadBaseLabel: config.base === 'G' ? 'g' : config.base === 'ML' ? 'ml' : 'unidad',
    };
  }

  static esUnidadPeso(unidad: UnidadConversor): boolean {
    return unidad === 'KG' || unidad === 'G';
  }

  static esUnidadVolumen(unidad: UnidadConversor): boolean {
    return unidad === 'L' || unidad === 'ML';
  }

  static obtenerUnidadBase(unidad: UnidadConversor): 'G' | 'ML' | 'UNIDAD' {
    return FACTORES_CONVERSION[unidad].base;
  }

  static obtenerLabel(unidad: UnidadConversor): string {
    const labels: Record<UnidadConversor, string> = {
      KG: 'kg',
      G: 'g',
      L: 'L',
      ML: 'ml',
      UNIDAD: 'unidades',
    };
    return labels[unidad];
  }

  static obtenerOpcionesPorTipo(tipo: 'peso' | 'volumen' | 'unidad'): { value: UnidadConversor; label: string }[] {
    switch (tipo) {
      case 'peso':
        return [
          { value: 'KG', label: 'Kilogramos (kg)' },
          { value: 'G', label: 'Gramos (g)' },
        ];
      case 'volumen':
        return [
          { value: 'L', label: 'Litros (L)' },
          { value: 'ML', label: 'Mililitros (ml)' },
        ];
      case 'unidad':
        return [
          { value: 'UNIDAD', label: 'Unidades' },
        ];
      default:
        return [];
    }
  }
}
