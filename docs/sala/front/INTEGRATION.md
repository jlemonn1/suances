# Integración del Servicio Sala en Frontend

## Resumen

Este documento describe la integración del microservicio `rest-sala-service` en la aplicación frontend `suances-app` para las páginas de staff.

## API del Servicio Sala

**Base URL**: `http://localhost:8083/api/sala`

**Autenticación**: JWT con header `Authorization: Bearer <TOKEN>`

**Roles**: OWNER, MANAGER, WAITER

### Endpoints Principales

| Módulo | Endpoints |
|--------|-----------|
| **Comandas** | POST /comandas, GET /comandas, GET /comandas/{id}, PATCH /comandas/{id}/estado, POST /comandas/{id}/cerrar, POST /comandas/{id}/cobrar, DELETE /comandas/{id} |
| **Pedidos** | POST /comandas/{id}/pedidos, GET /comandas/{id}/pedidos, PATCH /pedidos/{id}/estado, DELETE /pedidos/{id} |
| **Mesas** | GET /mesas, GET /mesas/{id}, PATCH /mesas/{id}/estado, POST /mesas/{id}/asignar-camarero |
| **Cuenta** | GET /comandas/{id}/cuenta, POST /comandas/{id}/descuento |
| **Estadísticas** | GET /estadisticas/dia |

## Pasos de Integración

### 1. Configuración de API

Actualizar `src/config.ts` para incluir la URL del servicio sala:

```typescript
export const config = {
  // ...configuraciones existentes
  salaApiUrl: 'http://localhost:8083/api/sala',
};
```

### 2. Tipos TypeScript

Crear `src/types/sala.ts` con las interfaces necesarias:

```typescript
// Estados de comanda
export type ComandaEstado = 'ABIERTA' | 'EN_PREPARACION' | 'SERVIDA' | 'CUENTA' | 'COBRADA' | 'CANCELADA';

// Estados de pedido
export type PedidoEstado = 'PENDIENTE' | 'EN_PREPARACION' | 'LISTO' | 'SERVIDO' | 'CANCELADO';

// Estados operativos de mesa
export type MesaEstadoOperativo = 'LIBRE' | 'OCUPADA' | 'RESERVADA' | 'BLOQUEADA' | 'MANTENIMIENTO';

// Tipos de pago
export type TipoPago = 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA';

// Interfaces principales
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
}

export interface MesaOperativa {
  id: string;
  numero: number;
  salaId: string;
  nombreSala: string;
  capacidad: number;
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
  impuestos: { tasa: number; monto: number };
  total: number;
  tiempoTranscurridoMinutos: number;
}

export interface CuentaItem {
  pedidoId: string;
  nombrePlato: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface EstadisticasDia {
  fecha: string;
  comandas: { total: number; abiertas: number; cobradas: number; canceladas: number };
  ventas: { total: number; promedioPorComanda: number; metodosPago: Record<string, number> };
  mesas: { total: number; rotacionPromedio: number; tiempoPromedioOcupacionMinutos: number };
  camareros: { camareroId: string; nombre: string; comandasAtendidas: number; ventasGeneradas: number }[];
}
```

### 3. Servicio API

Crear `src/services/salaService.ts`:

```typescript
import axios from 'axios';
import { config } from '../config';
import { authService } from './authService';
import type { Comanda, Pedido, MesaOperativa, CuentaResponse, EstadisticasDia } from '../types/sala';

const createApiClient = () => {
  const token = authService.getToken();
  return axios.create({
    baseURL: config.salaApiUrl,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
};

// Comandas
export const salaService = {
  // Comandas
  crearComanda: async (data: { mesaId: string; numeroComensales: number; notas?: string }) => {
    const client = createApiClient();
    const response = await client.post<Comanda>('/comandas', data);
    return response.data;
  },
  
  listarComandas: async (params?: { estado?: string; mesaId?: string; page?: number; size?: number }) => {
    const client = createApiClient();
    const response = await client.get('/comandas', { params });
    return response.data;
  },
  
  obtenerComanda: async (id: string) => {
    const client = createApiClient();
    const response = await client.get<Comanda>(`/comandas/${id}`);
    return response.data;
  },
  
  cambiarEstadoComanda: async (id: string, estado: string, motivo?: string) => {
    const client = createApiClient();
    const response = await client.patch(`/comandas/${id}/estado`, { estado, motivo });
    return response.data;
  },
  
  cerrarComanda: async (id: string, tipoPago: string) => {
    const client = createApiClient();
    const response = await client.post(`/comandas/${id}/cerrar`, { tipoPago });
    return response.data;
  },
  
  cobrarComanda: async (id: string, data: { tipoPago: string; montoRecibido: number; propina?: number }) => {
    const client = createApiClient();
    const response = await client.post(`/comandas/${id}/cobrar`, data);
    return response.data;
  },
  
  cancelarComanda: async (id: string, motivo: string) => {
    const client = createApiClient();
    await client.delete(`/comandas/${id}`, { params: { motivo } });
  },
  
  // Pedidos
  agregarPedido: async (comandaId: string, data: { platoId: string; cantidad: number; notas?: string }) => {
    const client = createApiClient();
    const response = await client.post(`/comandas/${comandaId}/pedidos`, data);
    return response.data;
  },
  
  listarPedidos: async (comandaId: string, estado?: string) => {
    const client = createApiClient();
    const response = await client.get(`/comandas/${comandaId}/pedidos`, { params: { estado } });
    return response.data;
  },
  
  cambiarEstadoPedido: async (id: string, estado: string, notasCambio?: string) => {
    const client = createApiClient();
    const response = await client.patch(`/pedidos/${id}/estado`, { estado, notasCambio });
    return response.data;
  },
  
  cancelarPedido: async (id: string, motivo: string) => {
    const client = createApiClient();
    await client.delete(`/pedidos/${id}`, { params: { motivo } });
  },
  
  // Mesas
  listarMesas: async (params?: { salaId?: string; estado?: string; camareroId?: string }) => {
    const client = createApiClient();
    const response = await client.get('/mesas', { params });
    return response.data;
  },
  
  obtenerMesa: async (id: string) => {
    const client = createApiClient();
    const response = await client.get<MesaOperativa>(`/mesas/${id}`);
    return response.data;
  },
  
  cambiarEstadoMesa: async (id: string, estado: string, motivo?: string, forzar?: boolean) => {
    const client = createApiClient();
    const response = await client.patch(`/mesas/${id}/estado`, { estadoOperativo: estado, motivo, forzar });
    return response.data;
  },
  
  asignarCamarero: async (mesaId: string, camareroId: string) => {
    const client = createApiClient();
    const response = await client.post(`/mesas/${mesaId}/asignar-camarero`, { camareroId });
    return response.data;
  },
  
  // Cuenta
  obtenerCuenta: async (comandaId: string) => {
    const client = createApiClient();
    const response = await client.get<CuentaResponse>(`/comandas/${comandaId}/cuenta`);
    return response.data;
  },
  
  aplicarDescuento: async (comandaId: string, data: { porcentaje: number; motivo: string }) => {
    const client = createApiClient();
    const response = await client.post(`/comandas/${comandaId}/descuento`, data);
    return response.data;
  },
  
  // Estadísticas
  obtenerEstadisticasDia: async (fecha?: string) => {
    const client = createApiClient();
    const response = await client.get<EstadisticasDia>('/estadisticas/dia', { params: { fecha } });
    return response.data;
  },
};
```

### 4. Store de Estado

Crear `src/store/salaStore.ts` usando Zustand:

```typescript
import { create } from 'zustand';
import { salaService } from '../services/salaService';
import type { Comanda, MesaOperativa, Pedido, CuentaResponse, EstadisticasDia } from '../types/sala';

interface SalaState {
  // Mesas
  mesas: MesaOperativa[];
  mesaSeleccionada: MesaOperativa | null;
  loadingMesas: boolean;
  
  // Comandas
  comandas: Comanda[];
  comandaActiva: Comanda | null;
  loadingComandas: boolean;
  
  // Pedidos
  pedidos: Pedido[];
  
  // Cuenta
  cuenta: CuentaResponse | null;
  
  // Estadísticas
  estadisticas: EstadisticasDia | null;
  
  // Acciones
  fetchMesas: (params?: { salaId?: string; estado?: string }) => Promise<void>;
  fetchComandas: (params?: { estado?: string }) => Promise<void>;
  fetchComanda: (id: string) => Promise<void>;
  fetchPedidos: (comandaId: string) => Promise<void>;
  fetchCuenta: (comandaId: string) => Promise<void>;
  fetchEstadisticas: (fecha?: string) => Promise<void>;
  
  crearComanda: (data: { mesaId: string; numeroComensales: number; notas?: string }) => Promise<Comanda>;
  agregarPedido: (comandaId: string, data: { platoId: string; cantidad: number; notas?: string }) => Promise<Pedido>;
  cambiarEstadoPedido: (pedidoId: string, estado: string) => Promise<void>;
  cerrarComanda: (comandaId: string, tipoPago: string) => Promise<void>;
  cobrarComanda: (comandaId: string, data: { tipoPago: string; montoRecibido: number; propina?: number }) => Promise<void>;
  
  seleccionarMesa: (mesa: MesaOperativa | null) => void;
  limpiarEstado: () => void;
}

export const useSalaStore = create<SalaState>((set, get) => ({
  // Estado inicial
  mesas: [],
  mesaSeleccionada: null,
  loadingMesas: false,
  comandas: [],
  comandaActiva: null,
  loadingComandas: false,
  pedidos: [],
  cuenta: null,
  estadisticas: null,
  
  // Acciones
  fetchMesas: async (params) => {
    set({ loadingMesas: true });
    try {
      const response = await salaService.listarMesas(params);
      set({ mesas: response.mesas || response });
    } finally {
      set({ loadingMesas: false });
    }
  },
  
  fetchComandas: async (params) => {
    set({ loadingComandas: true });
    try {
      const response = await salaService.listarComandas(params);
      set({ comandas: response.content || response });
    } finally {
      set({ loadingComandas: false });
    }
  },
  
  fetchComanda: async (id) => {
    const comanda = await salaService.obtenerComanda(id);
    set({ comandaActiva: comanda, pedidos: comanda.pedidos || [] });
  },
  
  fetchPedidos: async (comandaId) => {
    const response = await salaService.listarPedidos(comandaId);
    set({ pedidos: response.pedidos || response });
  },
  
  fetchCuenta: async (comandaId) => {
    const cuenta = await salaService.obtenerCuenta(comandaId);
    set({ cuenta });
  },
  
  fetchEstadisticas: async (fecha) => {
    const estadisticas = await salaService.obtenerEstadisticasDia(fecha);
    set({ estadisticas });
  },
  
  crearComanda: async (data) => {
    const comanda = await salaService.crearComanda(data);
    set({ comandaActiva: comanda });
    await get().fetchMesas();
    return comanda;
  },
  
  agregarPedido: async (comandaId, data) => {
    const pedido = await salaService.agregarPedido(comandaId, data);
    await get().fetchComanda(comandaId);
    return pedido;
  },
  
  cambiarEstadoPedido: async (pedidoId, estado) => {
    await salaService.cambiarEstadoPedido(pedidoId, estado);
    const { comandaActiva } = get();
    if (comandaActiva) {
      await get().fetchComanda(comandaActiva.id);
    }
  },
  
  cerrarComanda: async (comandaId, tipoPago) => {
    await salaService.cerrarComanda(comandaId, tipoPago);
    await get().fetchComanda(comandaId);
  },
  
  cobrarComanda: async (comandaId, data) => {
    await salaService.cobrarComanda(comandaId, data);
    set({ comandaActiva: null, cuenta: null });
    await get().fetchMesas();
  },
  
  seleccionarMesa: (mesa) => set({ mesaSeleccionada: mesa }),
  
  limpiarEstado: () => set({
    comandaActiva: null,
    pedidos: [],
    cuenta: null,
    mesaSeleccionada: null,
  }),
}));
```

### 5. Nuevas Pantallas

#### 5.1 Pantalla de Mesas (SalaScreen)

```typescript
// src/screens/staff/SalaScreen.tsx
// Muestra estado de todas las mesas en formato grid
// - Mesas libres (verde)
// - Mesas ocupadas (naranja)
// - Mesas con reserva (azul)
// Al hacer tap en mesa ocupada: abre ComandaDetailScreen
// Al hacer tap en mesa libre: abre NuevaComandaScreen
```

#### 5.2 Detalle de Comanda (ComandaDetailScreen)

```typescript
// src/screens/staff/ComandaDetailScreen.tsx
// Muestra:
// - Info de mesa y Camarero
// - Lista de pedidos con estados
// - Total actual
// - Acciones: agregar pedido, cambiar estado, pedir cuenta, cobrar
```

#### 5.3 Nueva Comanda (NuevaComandaScreen)

```typescript
// src/screens/staff/NuevaComandaScreen.tsx
// Formulario para abrir nueva comanda:
// - Selección de mesa
// - Número de comensales
// - Notas opcionales
// - Botón crear comanda
```

#### 5.4 Vista de Cocina (CocinaScreen)

```typescript
// src/screens/staff/CocinaScreen.tsx
// Muestra pedidos pendientes por preparar
// - Agrupados por estado
// - Acciones: marcar en preparación, marcar listo
```

#### 5.5 Cobro (CobroScreen)

```typescript
// src/screens/staff/CobroScreen.tsx
// Pantalla de cobro:
// - Desglose de cuenta
// - Descuentos (si aplica)
// - Método de pago
// - Monto recibido
// - Cambio
// - Propina
```

### 6. Navegación

Actualizar `src/navigation/StaffNavigator.tsx`:

```typescript
import { SalaScreen } from '../screens/staff/SalaScreen';
import { ComandaDetailScreen } from '../screens/staff/ComandaDetailScreen';
import { NuevaComandaScreen } from '../screens/staff/NuevaComandaScreen';
import { CocinaScreen } from '../screens/staff/CocinaScreen';
import { CobroScreen } from '../screens/staff/CobroScreen';
import { CartaScreen } from '../screens/staff/CartaScreen'; // Nueva para añadir pedidos

// Agregar Stack Navigator para las nuevas pantallas
const Stack = createNativeStackNavigator();

// En StaffNavigator:
<Tab.Navigator>
  <Tab.Screen name="Sala" component={SalaScreen} />
  <Tab.Screen name="Cocina" component={CocinaScreen} />
  <Tab.Screen name="Carta" component={CartaPublicaScreen} />
  <Tab.Screen name="Perfil" component={PerfilScreen} />
</Tab.Navigator>
```

### 7. Integración con Carta

Para agregar pedidos, integrar con el servicio de carta existente:

```typescript
// En ComandaDetailScreen o NuevaComandaScreen:
// 1. Usar cartaService para obtener platos
// 2. Al seleccionar plato, usar salaService.agregarPedido()
// 3. Sincronizar con el store de sala
```

### 8. Permisos por Rol

Según el API contract:

| Operación | OWNER | MANAGER | WAITER |
|-----------|-------|---------|--------|
| Ver mesas | ✓ | ✓ | ✓ |
| Crear comanda | ✓ | ✓ | ✓ |
| Agregar pedido | ✓ | ✓ | ✓ |
| Cambiar estado pedido | ✓ | ✓ | ✓ |
| Cerrar comanda | ✓ | ✓ | ✓ |
| Cobrar comanda | ✓ | ✓ | ✓ |
| Cancelar comanda | ✓ | ✓ | ✗ |
| Aplicar descuento | ✓ | ✓ | ✗ |
| Cambiar estado mesa | ✓ | ✓ | ✗ |
| Asignar Camarero | ✓ | ✓ | ✗ |
| Ver estadísticas | ✓ | ✓ | ✗ |

Implementar verificación de rol en cada pantalla:

```typescript
const { role } = useAuthStore();
const puedeCancelar = role === 'OWNER' || role === 'MANAGER';
const puedeDescuentos = role === 'OWNER' || role === 'MANAGER';
```

## Notas de Implementación

1. **Manejo de errores**: El API retorna errores con formato específico (código, mensaje). Crear utilería para manejar errores de forma consistente.

2. **WebSockets**: El servicio soporta SSE para eventos en tiempo real. Considerar implementar en fase 2.

3. **Sincronización**: Después de cobrar, limpiar el estado local y actualizar la lista de mesas.

4. **Precios**: Los precios se congelan al momento del pedido. No recalcular al visualizar.

5. **Estados de transición**: Respetar las transiciones de estado definidas en el API para mantener consistencia.

## Fase 1 (MVP)

1. Pantalla de salas con grid de mesas
2. Crear nueva comanda
3. Ver detalle de comanda con pedidos
4. Agregar pedidos desde carta
5. Cambiar estados de pedidos
6. Cerrar y cobrar comanda

## Fase 2

1. Pantalla de cocina
2. Descuentos
3. Asignación de Camareros
4. Cambios manuales de estado de mesa
5. Estadísticas del día

## Fase 3

1. SSE para tiempo real
2. Integración completa con reservas
3. Historial de comandas
