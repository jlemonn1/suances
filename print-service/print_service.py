#!/usr/bin/env python3
"""
PrintService - Servicio Unificado
Combina configuración y cliente de impresión en un solo archivo
Funciona en Windows, Linux, Mac y Android (Termux)
"""

import json
import logging
import sys
import time
import platform
import threading
import os
import base64
from queue import Queue
from dataclasses import dataclass, field
from typing import Optional, Dict, List
from datetime import datetime
from collections import defaultdict

import redis

try:
    from PIL import Image
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False

# Configuración de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('printservice.log')
    ]
)
logger = logging.getLogger(__name__)

# Dataclasses para datos del ticket
@dataclass
class TicketItem:
    cantidad: int
    nombrePlato: str
    tipoRonda: Optional[str] = None
    notas: Optional[str] = None
    precioUnitario: Optional[float] = None
    subtotal: Optional[float] = None

@dataclass
class TicketData:
    """Datos completos de un ticket"""
    id: str
    type: str
    printer: str
    comanda_id: str
    codigo: str
    mesa: int
    sala: str = ""
    camarero: str = ""
    comensales: int = 0
    fecha_apertura: str = ""
    items: List[TicketItem] = field(default_factory=list)
    subtotal: Optional[float] = None
    descuento: Optional[float] = None
    total: Optional[float] = None
    timestamp: str = ""
    channel: str = ""

class PrintService:
    """Servicio de impresión unificado"""
    
    IDEMPOTENCY_TTL = 86400  # 24 horas
    MAX_RETRIES = 3
    
    def __init__(self, config_path: str = "config.json"):
        self.config = self._load_config(config_path)
        self.redis_client: Optional[redis.Redis] = None
        self.pubsub = None
        self.print_queue: Queue = Queue()
        self.is_printing = False
        self.running = True
        self.print_thread: Optional[threading.Thread] = None
        self.retry_count: Dict[str, int] = {}
    
    def _load_config(self, config_path: str) -> dict:
        """Carga configuración desde JSON"""
        defaults = {
            "ubicacion": "all",
            "canales": ["print/ticket"],
            "redis": {"host": "localhost", "port": 6379}
        }
        
        try:
            with open(config_path, 'r', encoding='utf-8') as f:
                loaded = json.load(f)
                defaults.update(loaded)
                logger.info(f"Config cargada desde {config_path}")
        except FileNotFoundError:
            logger.warning(f"No se encontró {config_path}, usando defaults")
            with open(config_path, 'w', encoding='utf-8') as f:
                json.dump(defaults, f, indent=2)
        except Exception as e:
            logger.error(f"Error cargando config: {e}")
        
        return defaults
    
    def start(self):
        """Inicia el servicio"""
        logger.info("=" * 50)
        logger.info("PrintService iniciando...")
        
        # Conectar Redis
        try:
            redis_cfg = self.config.get('redis', {})
            self.redis_client = redis.Redis(
                host=redis_cfg.get('host', 'localhost'),
                port=redis_cfg.get('port', 6379),
                decode_responses=True
            )
            self.redis_client.ping()
            logger.info("Redis conectado")
        except Exception as e:
            logger.error(f"Error Redis: {e}")
            return False
        
        # Iniciar thread de impresión
        self.print_thread = threading.Thread(target=self._print_worker, daemon=True)
        self.print_thread.start()
        
        # Suscribirse a canales
        canales = self.config.get('canales', ['print/ticket'])
        logger.info(f"Suscrito a: {canales}")
        
        self.pubsub = self.redis_client.pubsub()
        self.pubsub.subscribe(canales)
        
        # Loop principal
        logger.info("Esperando mensajes...")
        try:
            for message in self.pubsub.listen():
                if not self.running:
                    break
                    
                if message['type'] != 'message':
                    continue
                
                channel = message['channel']
                try:
                    data = json.loads(message['data'])
                    logger.info(f"Recibido en {channel}: {data.get('type', 'unknown')}")
                    
                    # Extraer items según el tipo de ticket
                    items = []
                    if 'items' in data:
                        # Cocina/Barra: items directos
                        items = [TicketItem(**item) for item in data.get('items', [])]
                    elif 'rondas' in data:
                        # Cuenta: items dentro de rondas
                        for ronda in data.get('rondas', []):
                            for item in ronda.get('items', []):
                                items.append(TicketItem(**item))
                    
                    ticket = TicketData(
                        id=data.get('id', ''),
                        type=data.get('type', ''),
                        printer=data.get('printer', ''),
                        comanda_id=data.get('comandaId', ''),
                        codigo=data.get('codigo', ''),
                        mesa=data.get('mesaNumero', 0),
                        sala=data.get('sala', ''),
                        camarero=data.get('camareroNombre', ''),
                        comensales=data.get('comensales', 0),
                        fecha_apertura=data.get('fechaApertura', ''),
                        items=items,
                        subtotal=data.get('subtotal'),
                        descuento=data.get('descuento'),
                        total=data.get('total'),
                        timestamp=data.get('timestamp', ''),
                        channel=channel
                    )
                    
                    self.print_queue.put((ticket, data, channel))
                    
                except Exception as e:
                    logger.error(f"Error procesando mensaje: {e}")
                    
        except Exception as e:
            logger.error(f"Error en loop principal: {e}")
        
        return True
    
    def stop(self):
        """Detiene el servicio"""
        logger.info("Deteniendo PrintService...")
        self.running = False
        if self.pubsub:
            self.pubsub.unsubscribe()
        if self.print_thread:
            self.print_thread.join(timeout=5)
    
    def _print_worker(self):
        """Thread worker para impresión"""
        while self.running:
            try:
                ticket, raw_data, channel = self.print_queue.get(timeout=1)
                self._print_with_retry(ticket, raw_data, channel)
            except:
                continue
    
    def _is_already_printed(self, ticket_id: Optional[str]) -> bool:
        """Verifica si ticket ya fue impreso"""
        if not ticket_id or not self.redis_client:
            return False
        try:
            return self.redis_client.exists(f"printed:{ticket_id}")
        except:
            return False
    
    def _mark_as_printed(self, ticket_id: Optional[str]):
        """Marca ticket como impreso"""
        if not ticket_id or not self.redis_client:
            return
        try:
            self.redis_client.setex(f"printed:{ticket_id}", self.IDEMPOTENCY_TTL, "1")
        except Exception as e:
            logger.warning(f"No se pudo marcar ticket: {e}")
    
    def _to_float(self, value) -> float:
        """Convierte valor a float seguro"""
        try:
            return float(value) if value else 0.0
        except (TypeError, ValueError):
            return 0.0
    
    def _print_with_retry(self, ticket: TicketData, raw_data: dict, channel: str):
        """Imprime con reintentos"""
        ticket_id = ticket.id or f"{ticket.codigo}_{time.time()}"
        
        if self._is_already_printed(ticket_id):
            logger.info(f"Ticket {ticket_id} ya impreso, ignorando")
            return
        
        for attempt in range(self.MAX_RETRIES):
            try:
                self._print_ticket(ticket, raw_data, channel)
                self._mark_as_printed(ticket_id)
                logger.info(f"Ticket {ticket_id} impreso correctamente")
                return
            except Exception as e:
                logger.error(f"Error impresión (intento {attempt + 1}): {e}")
                if attempt < self.MAX_RETRIES - 1:
                    time.sleep(1)
        
        logger.error(f"Falló impresión después de {self.MAX_RETRIES} intentos")
    
    def _print_ticket(self, ticket: TicketData, raw_data: dict, channel: str):
        """Imprime según tipo"""
        printer_type = self.config.get('printer', {}).get('type', 'windows')

        if printer_type == "windows":
            self._print_windows(ticket, channel)
        else:
            self._print_usb(ticket, channel)

    def _print_windows(self, ticket: TicketData, channel: str):
        """Imprime usando Windows"""
        import win32print

        printer_name = self.config.get('printer', {}).get('name', '')
        logger.info(f"Imprimiendo en: '{printer_name}'")

        logo_data = self._get_logo_bytes(channel)
        lines = self._generate_content(ticket, channel)
        content = "".join(lines)
        
        try:
            hprinter = win32print.OpenPrinter(printer_name)
            try:
                win32print.StartDocPrinter(hprinter, 1, (f"Ticket-{ticket.codigo}", "", "RAW"))
                try:
                    if logo_data:
                        win32print.WritePrinter(hprinter, logo_data)
                    win32print.WritePrinter(hprinter, content.encode("utf-8"))
                finally:
                    win32print.EndDocPrinter(hprinter)
            finally:
                win32print.ClosePrinter(hprinter)
        except Exception as e:
            raise RuntimeError(f"Error Windows printing: {e}")

    def _print_usb(self, ticket: TicketData, channel: str):
        """Imprime usando USB ESC/POS"""
        try:
            from escpos import printer as escpos_printer
            p = escpos_printer.Usb(0x0416, 0x5011, timeout=5)

            logo_data = self._get_logo_bytes(channel)
            if logo_data:
                p._raw(logo_data)

            lines = self._generate_content(ticket, channel)
            for line in lines:
                p.text(line)
            p.cut()
        except ImportError:
            raise RuntimeError("Librería escpos no disponible")

    def _get_logo_bytes(self, channel: str) -> Optional[bytes]:
        """Obtiene bytes del logo para imprimir usando GS v 0 (raster bit image)"""
        logo_config = self.config.get('logo', {})
        if not logo_config.get('enabled', False):
            return None
        
        # Seleccionar logo según el canal
        if 'faro' in channel.lower():
            logo_path = logo_config.get('faro', 'logo_faro.png')
        else:
            logo_path = logo_config.get('isabella', 'logo.png')
            
        if not os.path.exists(logo_path):
            logger.warning(f"Logo no encontrado: {logo_path}")
            return None
            
        if not PIL_AVAILABLE:
            logger.warning("PIL no disponible para procesar logo")
            return None
            
        try:
            img = Image.open(logo_path)
            img = img.convert('1')
            
            max_width = 576
            if img.size[0] > max_width:
                ratio = max_width / float(img.size[0])
                h_size = int(float(img.size[1]) * ratio)
                img = img.resize((max_width, h_size), Image.Resampling.LANCZOS)
            
            if img.size[0] % 8 != 0:
                new_width = ((img.size[0] // 8) + 1) * 8
                new_img = Image.new('1', (new_width, img.size[1]), 1)
                new_img.paste(img, (0, 0))
                img = new_img
            
            width, height = img.size
            w_bytes = width // 8
            
            xL = w_bytes & 0xFF
            xH = (w_bytes >> 8) & 0xFF
            yL = height & 0xFF
            yH = (height >> 8) & 0xFF
            
            img_bytes = bytearray()
            
            for y in range(height):
                for x_byte in range(w_bytes):
                    byte = 0
                    for bit in range(8):
                        x = x_byte * 8 + bit
                        if x < width:
                            pixel = img.getpixel((x, y))
                            if pixel == 0:
                                byte |= (1 << (7 - bit))
                    img_bytes.append(byte)
            
            escpos_data = bytearray()
            escpos_data.extend([0x1B, 0x40])
            escpos_data.extend([0x1D, 0x76, 0x30, 0x00])
            escpos_data.extend([xL, xH, yL, yH])
            escpos_data.extend(img_bytes)
            escpos_data.extend([0x0A, 0x0A])
            
            result = bytes(escpos_data)
            logger.info(f"Logo raster: {logo_path} ({width}x{height}, {w_bytes} bytes/linea) -> {len(result)} bytes")
            return result
            
        except Exception as e:
            logger.error(f"Error procesando logo: {e}")
            return None

    def _generate_content(self, ticket: TicketData, channel: str) -> List[str]:
        """Genera contenido del ticket"""
        if ticket.type == "TICKET_COCINA":
            return self._generate_cocina(ticket)
        elif ticket.type == "TICKET_BARRA":
            return self._generate_barra(ticket)
        else:
            return self._generate_cuenta(ticket, channel)
    
    def _generate_cocina(self, ticket: TicketData) -> List[str]:
        """Genera ticket de cocina"""
        lines = []
        LINEA = "=" * 48
        SEP = "-" * 48
        
        # Header with visual separation
        lines.append("\n")
        lines.append(LINEA + "\n")
        lines.append(f"{'COCINA':^48}\n")
        lines.append(LINEA + "\n")
        lines.append("\n")
        
        # Sala y Mesa en formato destacado
        if ticket.sala:
            lines.append(f"{ticket.sala.upper()} - MESA {ticket.mesa}\n")
        else:
            lines.append(f"MESA {ticket.mesa}\n")
        lines.append(f"Comanda: {ticket.codigo}\n")
        if ticket.camarero:
            lines.append(f"Camarero: {ticket.camarero}\n")
        lines.append(f"Hora: {datetime.now().strftime('%H:%M')}\n")
        lines.append("\n")
        
        # Agrupar por tipo de ronda
        items_por_tipo = defaultdict(list)
        for item in ticket.items:
            tipo = item.tipoRonda or "OTROS"
            items_por_tipo[tipo].append(item)
        
        orden_tipos = ["ENTRANTE", "PRIMERO", "SEGUNDO", "POSTRE", "BEBIDA"]
        for tipo in orden_tipos:
            if tipo in items_por_tipo:
                lines.append(SEP + "\n")
                lines.append(f"  >> {tipo} <<\n")
                lines.append(SEP + "\n")
                for item in items_por_tipo[tipo]:
                    lines.append(f"  {item.cantidad}x {item.nombrePlato}\n")
                    if item.notas:
                        lines.append(f"     ** {item.notas}\n")
                lines.append("\n")
        
        # Otros tipos si quedan
        for tipo, items in items_por_tipo.items():
            if tipo not in orden_tipos:
                lines.append(SEP + "\n")
                lines.append(f"  >> {tipo} <<\n")
                lines.append(SEP + "\n")
                for item in items:
                    lines.append(f"  {item.cantidad}x {item.nombrePlato}\n")
                    if item.notas:
                        lines.append(f"     ** {item.notas}\n")
                lines.append("\n")
        
        lines.append("\n")
        lines.append(LINEA + "\n")
        lines.append("\n\n\n")
        return lines
    
    def _generate_barra(self, ticket: TicketData) -> List[str]:
        """Genera ticket de barra"""
        lines = []
        LINEA = "=" * 48
        SEP = "-" * 48
        
        # Header with visual separation
        lines.append("\n")
        lines.append(LINEA + "\n")
        lines.append(f"{'BARRA':^48}\n")
        lines.append(LINEA + "\n")
        lines.append("\n")
        
        # Sala y Mesa
        if ticket.sala:
            lines.append(f"{ticket.sala.upper()} - MESA {ticket.mesa}\n")
        else:
            lines.append(f"MESA {ticket.mesa}\n")
        lines.append(f"Comanda: {ticket.codigo}\n")
        if ticket.camarero:
            lines.append(f"Camarero: {ticket.camarero}\n")
        lines.append(f"Hora: {datetime.now().strftime('%H:%M')}\n")
        lines.append("\n")
        
        # Bebidas
        items_por_tipo = defaultdict(list)
        for item in ticket.items:
            tipo = item.tipoRonda or "OTROS"
            items_por_tipo[tipo].append(item)
        
        orden_tipos = ["ENTRANTE", "PRIMERO", "SEGUNDO", "POSTRE", "BEBIDA"]
        for tipo in orden_tipos:
            if tipo in items_por_tipo:
                lines.append(SEP + "\n")
                lines.append(f"  >> {tipo} <<\n")
                lines.append(SEP + "\n")
                for item in items_por_tipo[tipo]:
                    lines.append(f"  {item.cantidad}x {item.nombrePlato}\n")
                    if item.notas:
                        lines.append(f"     ** {item.notas}\n")
                lines.append("\n")
        
        for tipo, items in items_por_tipo.items():
            if tipo not in orden_tipos:
                lines.append(SEP + "\n")
                lines.append(f"  >> {tipo} <<\n")
                lines.append(SEP + "\n")
                for item in items:
                    lines.append(f"  {item.cantidad}x {item.nombrePlato}\n")
                    if item.notas:
                        lines.append(f"     ** {item.notas}\n")
                lines.append("\n")
        
        lines.append("\n")
        lines.append(LINEA + "\n")
        lines.append("\n\n\n")
        return lines
    
    def _generate_cuenta(self, ticket: TicketData, channel: str) -> List[str]:
        """Genera ticket de cuenta - lista simple sin agrupar"""
        lines = []
        LINEA = "=" * 48
        SEP = "-" * 48
        WIDTH = 48

        # Determinar nombre del restaurante según canal
        if "faro" in channel.lower():
            nombre_restaurante = "El Faro de Isabella"
        elif "isabella" in channel.lower():
            nombre_restaurante = "Isabella Trattoria"
        else:
            nombre_restaurante = "RESTAURANTE SUANCES"

        # Header with visual separation
        lines.append("\n")
        lines.append(LINEA + "\n")
        lines.append(f"{nombre_restaurante:^48}\n")
        lines.append(LINEA + "\n")
        lines.append("\n")
        
        if ticket.sala:
            lines.append(f"Sala: {ticket.sala}\n")
        lines.append(f"Mesa: {ticket.mesa}  |  {ticket.codigo}\n")
        if ticket.camarero:
            lines.append(f"Camarero: {ticket.camarero}\n")
        if ticket.comensales:
            lines.append(f"Comensales: {ticket.comensales}\n")
        lines.append("\n")
        lines.append(LINEA + "\n")

        # Lista simple de todos los items (sin agrupar por tipo)
        lines.append("\n")
        for item in ticket.items:
            price = self._to_float(item.precioUnitario)
            item_str = f"{item.cantidad}x {item.nombrePlato}"
            price_str = f"{price:.2f}"
            # Right-align price, item on left
            spaces = max(1, WIDTH - len(item_str) - len(price_str) - 2)
            lines.append(f"  {item_str}{' ' * spaces}{price_str}\n")
        lines.append("\n")
        
        # Totales
        lines.append(LINEA + "\n")
        
        subtotal = self._to_float(ticket.subtotal)
        descuento = self._to_float(ticket.descuento)
        total = self._to_float(ticket.total)
        
        if subtotal > 0:
            label = "Subtotal:"
            price_str = f"{subtotal:.2f}"
            spaces = WIDTH - len(label) - len(price_str) - 2
            lines.append(f"  {label}{' ' * spaces}{price_str}\n")
        
        if descuento > 0:
            label = "Descuento:"
            price_str = f"-{descuento:.2f}"
            spaces = WIDTH - len(label) - len(price_str) - 2
            lines.append(f"  {label}{' ' * spaces}{price_str}\n")
        
        label = "TOTAL:"
        price_str = f"{total:.2f}"
        spaces = WIDTH - len(label) - len(price_str) - 2
        lines.append(f"  {label}{' ' * spaces}{price_str}\n")
        lines.append(LINEA + "\n")
        
        # Footer
        lines.append("\n")
        lines.append(f"{'¡Gracias por su visita!':^48}\n")
        lines.append("\n")
        lines.append(LINEA + "\n")
        lines.append("\n\n\n")
        return lines

def main():
    """Punto de entrada principal"""
    service = PrintService()
    
    def signal_handler(signum, frame):
        logger.info("Señal recibida, deteniendo...")
        service.stop()
        sys.exit(0)
    
    import signal
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    if not service.start():
        logger.error("No se pudo iniciar el servicio")
        sys.exit(1)
    
    try:
        while service.running:
            time.sleep(1)
    except KeyboardInterrupt:
        service.stop()

if __name__ == "__main__":
    main()
