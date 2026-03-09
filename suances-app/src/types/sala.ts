export type ComandaEstado = 'ABIERTA' | 'EN_PREPARACION' | 'SERVIDA' | 'CUENTA' | 'COBRADA' | 'CANCELADA';

export type PedidoEstado = 'PENDIENTE' | 'EN_PREPARACION' | 'LISTO' | 'SERVIDO' | 'CANCELADO';

export type MesaEstadoOperativo = 'LIBRE' | 'OCUPADA' | 'RESERVADA' | 'BLOQUEADA' | 'MANTENIMIENTO';

export type TipoPago = 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA';

export interface Comanda {
  id: string;
  codigo: string;
  mesaId: string;
  mesaNumero: number;
  camareroId: string;
  camareroNombre: string;
  estado: ComandaEstado;
  numeroComensales: number;
  notas?: string;
  total: number;
  descuentoPorcentaje: number;
  fechaApertura: string;
}

export interface ComandaDetalle extends Comanda {
  pedidos: Pedido[];
  resumen: {
    totalPedidos: number;
    pedidosPendientes: number;
    pedidosEnPreparacion: number;
    pedidosListos: number;
    pedidosServidos: number;
    tiempoTranscurridoMinutos: number;
  };
}

export interface Pedido {
  id: string;
  comandaId: string;
  platoId: string;
  nombrePlato: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  estado: PedidoEstado;
  notas?: string;
  horaPedido: string;
  horaServido?: string;
  horaListo?: string;
  advertenciaStock?: boolean;
}

export interface MesaOperativa {
  id: string;
  numero: number;
  salaId: string;
  nombreSala: string;
  capacidad: number;
  posX?: number;
  posY?: number;
  estadoOperativo: MesaEstadoOperativo;
  comandaActivaId?: string;
  codigoComanda?: string;
  camareroAsignadoId?: string;
  nombreCamarero?: string;
  reservaActualId?: string;
  nombreClienteReserva?: string;
  totalComandaActual?: number;
  numeroComensales?: number;
  tiempoOcupadaMinutos?: number;
}

export interface FranjaHoraria {
  id: string;
  nombre: string;
  horaInicio: string;
  horaFin: string;
  activa: boolean;
}

export interface Sala {
  id: string;
  nombre: string;
  capacidadMaxima: number;
  layoutJson?: string;
  activa: boolean;
}

export interface MesasResponse {
  mesas: MesaOperativa[];
  resumen: {
    totalMesas: number;
    libres: number;
    ocupadas: number;
    reservadas: number;
  };
}

export interface CuentaItem {
  pedidoId: string;
  nombrePlato: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  horaPedido: string;
  horaServido?: string;
}

export interface CuentaResponse {
  comandaId: string;
  codigo: string;
  mesaNumero: number;
  camareroNombre: string;
  fechaApertura: string;
  items: CuentaItem[];
  subtotal: number;
  descuentoPorcentaje: number;
  descuentoMonto: number;
  impuestos: {
    tasa: number;
    monto: number;
  };
  total: number;
  redondeo: number;
  tiempoTranscurridoMinutos: number;
}

export interface CobroResponse {
  id: string;
  codigo: string;
  estado: ComandaEstado;
  estadoAnterior: ComandaEstado;
  total: number;
  tipoPago: TipoPago;
  montoRecibido: number;
  cambio: number;
  propina: number;
  fechaCobro: string;
  duracionTotalMinutos: number;
}

export interface CrearComandaRequest {
  mesaId: string;
  numeroComensales: number;
  notas?: string;
}

export interface AgregarPedidoRequest {
  platoId: string;
  cantidad: number;
  notas?: string;
}

export interface CobrarRequest {
  tipoPago: TipoPago;
  montoRecibido: number;
  propina?: number;
}
