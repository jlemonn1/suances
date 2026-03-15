import json
import logging
import sys
import time
import platform
import threading
from queue import Queue
from dataclasses import dataclass, asdict, field
from typing import Optional, Dict, List
from datetime import datetime
from configparser import ConfigParser
from collections import defaultdict

import redis

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@dataclass
class TicketItem:
    """Item en un ticket"""
    name: str
    quantity: int
    price: Optional[float] = None
    notes: Optional[str] = None
    tipo_ronda: Optional[str] = None


@dataclass
class TicketData:
    """Datos completos de un ticket"""
    id: str
    type: str
    printer: str
    comanda_id: str
    codigo: str
    mesa: int
    camarero: str = ""
    comensales: int = 0
    fecha_apertura: str = ""
    items: List[TicketItem] = field(default_factory=list)
    subtotal: Optional[float] = None
    descuento: Optional[float] = None
    total: Optional[float] = None
    timestamp: str = ""


class PrintClient:
    """Cliente de impresión con soporte para múltiples canales y tipos de tickets"""
    
    IDEMPOTENCY_TTL_SECONDS = 86400  # 24 horas
    MAX_RETRIES = 3
    RECONNECT_DELAY = 5  # segundos
    
    def __init__(self, config_path: str = "config.properties"):
        self.config = ConfigParser()
        self.config.read(config_path)
        
        # Redis configuration
        self.redis_host = self.config.get("redis", "redis-host", fallback="localhost")
        self.redis_port = self.config.getint("redis", "redis-port", fallback=6379)
        channels_str = self.config.get("redis", "channels", fallback="print/ticket")
        self.channels = [c.strip() for c in channels_str.split(",")]
        
        # Printer configuration
        self.printer_name = self.config.get("printer", "printer-name", fallback="Ticketera")
        self.printer_type = self.config.get("printer", "printer-type", fallback="windows").lower()
        
        # Handle hex values for USB vendor/product IDs
        vendor_str = self.config.get("printer", "vendor-id", fallback="0x0416")
        product_str = self.config.get("printer", "product-id", fallback="0x5011")
        try:
            self.printer_vendor = int(vendor_str, 16) if vendor_str.startswith("0x") else int(vendor_str)
            self.printer_product = int(product_str, 16) if product_str.startswith("0x") else int(product_str)
        except ValueError:
            logger.warning(f"Valores USB invalidos, usando defaults. vendor={vendor_str}, product={product_str}")
            self.printer_vendor = 0x0416
            self.printer_product = 0x5011
        
        # State
        self.redis_client: Optional[redis.Redis] = None
        self.pubsub = None
        self.print_queue: Queue = Queue()
        self.is_printing = False
        self.retry_count: Dict[str, int] = {}
        self.running = True
        
        # Thread for queue processing
        self.print_thread: Optional[threading.Thread] = None

    def connect_redis(self) -> bool:
        """Establece conexión con Redis"""
        try:
            self.redis_client = redis.Redis(
                host=self.redis_host,
                port=self.redis_port,
                decode_responses=True,
                socket_connect_timeout=5,
                socket_timeout=5,
                health_check_interval=30
            )
            self.redis_client.ping()
            logger.info(f"Conectado a Redis en {self.redis_host}:{self.redis_port}")
            return True
        except redis.ConnectionError as e:
            logger.error(f"Error conectando a Redis: {e}")
            return False
        except Exception as e:
            logger.error(f"Error inesperado conectando a Redis: {e}")
            return False

    def start(self):
        """Inicia el cliente de impresión"""
        logger.info(f"Iniciando PrintClient para impresora: {self.printer_name}")
        logger.info(f"Canales suscritos: {', '.join(self.channels)}")
        
        # Start queue processing thread
        self.print_thread = threading.Thread(target=self._process_queue, daemon=True)
        self.print_thread.start()
        
        # Connect and listen
        while self.running:
            if self.connect_redis():
                try:
                    self.listen()
                except Exception as e:
                    logger.error(f"Error en listener: {e}")
                    time.sleep(self.RECONNECT_DELAY)
            else:
                logger.warning(f"Reconectando en {self.RECONNECT_DELAY} segundos...")
                time.sleep(self.RECONNECT_DELAY)

    def listen(self):
        """Escucha mensajes en los canales configurados"""
        self.pubsub = self.redis_client.pubsub()
        
        # Subscribe to all channels
        for channel in self.channels:
            self.pubsub.subscribe(channel)
            logger.info(f"Suscrito a canal: {channel}")
        
        # Handle messages
        for message in self.pubsub.listen():
            if not self.running:
                break
                
            if message["type"] == "message":
                try:
                    channel = message["channel"]
                    data = json.loads(message["data"])
                    self._handle_message(channel, data)
                except json.JSONDecodeError as e:
                    logger.error(f"JSON inválido en canal {message.get('channel')}: {e}")
                except Exception as e:
                    logger.error(f"Error procesando mensaje: {e}")

    def _handle_message(self, channel: str, data: dict):
        """Procesa un mensaje recibido"""
        ticket_type = data.get("type", "UNKNOWN")
        target_printer = data.get("printer")
        
        logger.debug(f"Mensaje recibido - Canal: {channel}, Tipo: {ticket_type}, Impresora: {target_printer}")
        
        # Check if message is for this printer
        if target_printer and target_printer != self.printer_name:
            logger.debug(f"Mensaje para otra impresora: {target_printer} (yo soy: {self.printer_name})")
            return

        ticket_id = data.get("id")
        
        # Check idempotency
        if self._is_already_printed(ticket_id):
            logger.info(f"Ticket ya impreso (idempotencia): {ticket_id}")
            return

        logger.info(f"Nuevo ticket para imprimir: {ticket_id} (tipo: {ticket_type}, canal: {channel})")
        
        # Parse ticket data
        ticket = self._parse_ticket(data)
        
        # Add to queue
        self.print_queue.put((ticket, data))

    def _parse_ticket(self, data: dict) -> TicketData:
        """Parsea los datos del ticket desde JSON"""
        items = []
        
        # Debug: log raw data for kitchen/bar tickets
        if data.get("type") in ["TICKET_COCINA", "TICKET_BARRA"]:
            logger.debug(f"Parseando ticket tipo {data.get('type')}. Items raw: {data.get('items', [])}")
        
        for item_data in data.get("items", []):
            # Support both Spanish and English field names
            name = item_data.get("nombrePlato") or item_data.get("name", "")
            if not name:
                logger.warning(f"Item sin nombre en ticket {data.get('type')}: {item_data}")
                name = "SIN NOMBRE"
            
            items.append(TicketItem(
                name=name,
                quantity=item_data.get("cantidad") or item_data.get("quantity", 0),
                price=item_data.get("precioUnitario") or item_data.get("price"),
                notes=item_data.get("notas") or item_data.get("notes"),
                tipo_ronda=item_data.get("tipoRonda")
            ))
        
        # Handle rondas structure (for account tickets)
        if "rondas" in data:
            for ronda in data["rondas"]:
                tipo_ronda = ronda.get("tipoRonda", "")
                for item_data in ronda.get("items", []):
                    name = item_data.get("nombrePlato") or item_data.get("name", "")
                    if not name:
                        logger.warning(f"Item sin nombre en ronda: {item_data}")
                        name = "SIN NOMBRE"
                    
                    items.append(TicketItem(
                        name=name,
                        quantity=item_data.get("cantidad") or item_data.get("quantity", 0),
                        price=item_data.get("precioUnitario") or item_data.get("price"),
                        notes=item_data.get("notas") or item_data.get("notes"),
                        tipo_ronda=tipo_ronda
                    ))
        
        return TicketData(
            id=data.get("id", ""),
            type=data.get("type", "TICKET"),
            printer=data.get("printer", ""),
            comanda_id=data.get("comandaId", ""),
            codigo=data.get("codigo", ""),
            mesa=data.get("mesa", 0),
            camarero=data.get("camarero", ""),
            comensales=data.get("comensales", 0),
            fecha_apertura=data.get("fechaApertura", ""),
            items=items,
            subtotal=data.get("subtotal"),
            descuento=data.get("descuento"),
            total=data.get("total"),
            timestamp=data.get("timestamp", datetime.now().isoformat())
        )

    def _is_already_printed(self, ticket_id: Optional[str]) -> bool:
        """Verifica si un ticket ya fue impreso"""
        if not ticket_id or not self.redis_client:
            return False
        try:
            key = f"printed:{ticket_id}"
            return self.redis_client.exists(key) > 0
        except Exception as e:
            logger.error(f"Error verificando idempotencia: {e}")
            return False

    def _mark_as_printed(self, ticket_id: Optional[str]):
        """Marca un ticket como impreso"""
        if not ticket_id or not self.redis_client:
            return
        try:
            key = f"printed:{ticket_id}"
            self.redis_client.setex(key, self.IDEMPOTENCY_TTL_SECONDS, "1")
            logger.debug(f"Marcado como impreso: {ticket_id}")
        except Exception as e:
            logger.error(f"Error marcando ticket como impreso: {e}")

    def _process_queue(self):
        """Procesa la cola de impresión en segundo plano"""
        while self.running:
            try:
                if not self.print_queue.empty() and not self.is_printing:
                    ticket, raw_data = self.print_queue.get(timeout=1)
                    self._print_with_retry(ticket, raw_data)
                else:
                    time.sleep(0.1)
            except Exception as e:
                logger.error(f"Error en procesamiento de cola: {e}")

    def _print_with_retry(self, ticket: TicketData, raw_data: dict):
        """Imprime un ticket con lógica de reintento"""
        self.is_printing = True
        ticket_id = ticket.id
        
        current_retries = self.retry_count.get(ticket_id, 0)
        
        if current_retries >= self.MAX_RETRIES:
            logger.error(f"Ticket abandonado tras {self.MAX_RETRIES} intentos: {ticket_id}")
            self.retry_count.pop(ticket_id, None)
            self.is_printing = False
            return
        
        try:
            logger.info(f"Imprimiendo ticket {ticket_id} (intento {current_retries + 1}/{self.MAX_RETRIES + 1})")
            self._print_ticket(ticket, raw_data)
            self._mark_as_printed(ticket_id)
            logger.info(f"Ticket impreso exitosamente: {ticket_id}")
            self.retry_count.pop(ticket_id, None)
        except Exception as e:
            logger.error(f"Error imprimiendo ticket {ticket_id}: {e}")
            self.retry_count[ticket_id] = current_retries + 1
            # Re-queue for retry
            self.print_queue.put((ticket, raw_data))
            time.sleep(2)
        finally:
            self.is_printing = False

    def _print_ticket(self, ticket: TicketData, raw_data: dict):
        """Imprime un ticket según su tipo"""
        if self.printer_type == "windows":
            self._print_windows(ticket, raw_data)
        elif self.printer_type == "usb":
            self._print_usb(ticket, raw_data)
        elif self.printer_type == "serial":
            self._print_serial(ticket, raw_data)
        else:
            raise ValueError(f"Tipo de impresora desconocido: {self.printer_type}")

    def _print_windows(self, ticket: TicketData, raw_data: dict):
        """Imprime usando spooler de Windows"""
        import win32print
        
        logger.info(f"Imprimiendo en: '{self.printer_name}'")
        
        ESC = chr(0x1B)
        GS = chr(0x1D)
        
        # Generate content based on ticket type
        lines = self._generate_ticket_content(ticket, ESC, GS)
        content = "".join(lines)
        
        try:
            hprinter = win32print.OpenPrinter(self.printer_name)
            try:
                win32print.StartDocPrinter(hprinter, 1, (f"Ticket-{ticket.codigo}", "", "RAW"))
                try:
                    win32print.WritePrinter(hprinter, content.encode("utf-8"))
                finally:
                    win32print.EndDocPrinter(hprinter)
            finally:
                win32print.ClosePrinter(hprinter)
        except Exception as e:
            raise RuntimeError(f"Error de Windows printing: {e}")

    def _generate_ticket_content(self, ticket: TicketData, ESC: str, GS: str) -> List[str]:
        """Genera el contenido del ticket según su tipo"""
        
        if ticket.type == "TICKET_COCINA":
            return self._generate_cocina_content(ticket, [], "", "")
        elif ticket.type == "TICKET_BARRA":
            return self._generate_barra_content(ticket, [], "", "")
        else:
            # Default: TICKET_CUENTA or generic ticket
            return self._generate_cuenta_content(ticket, [], ESC, GS)

    def _generate_cocina_content(self, ticket: TicketData, lines: List[str], ESC: str, GS: str) -> List[str]:
        """Genera contenido para ticket de cocina (sin precios)"""
        
        # Linea divisoria
        LINEA = "=" * 32
        
        # Header destacado
        lines.append("\n")
        lines.append("/==============================\\\n")
        lines.append(f"|        COCINA - MESA {str(ticket.mesa):>2}       |\n")
        lines.append("\\==============================/\n")
        lines.append(f"  Comanda: {ticket.codigo}\n")
        if ticket.camarero:
            lines.append(f"  Camarero: {ticket.camarero}\n")
        lines.append(f"  Hora: {datetime.now().strftime('%H:%M')}\n")
        lines.append(LINEA + "\n")
        
        # Agrupar items por tipo_ronda
        items_por_tipo = defaultdict(list)
        
        for item in ticket.items:
            tipo = item.tipo_ronda or "SIN TIPO"
            items_por_tipo[tipo].append(item)
        
        # Orden de tipos
        orden_tipos = ["ENTRANTE", "PRIMERO", "SEGUNDO", "POSTRE", "BEBIDA", "SIN_ORDEN", "SIN TIPO"]
        
        # Imprimir por secciones
        for tipo in orden_tipos:
            if tipo in items_por_tipo and items_por_tipo[tipo]:
                # Nombre amigable del tipo
                nombre_tipo = {
                    "ENTRANTE": "ENTRANTES",
                    "PRIMERO": "PRIMEROS",
                    "SEGUNDO": "SEGUNDOS",
                    "POSTRE": "POSTRES",
                    "BEBIDA": "BEBIDAS",
                    "SIN_ORDEN": "SIN ORDEN",
                    "SIN TIPO": "OTROS"
                }.get(tipo, tipo)
                
                lines.append(f"\n[ {nombre_tipo} ]\n")
                lines.append("-" * 32 + "\n")
                
                for item in items_por_tipo[tipo]:
                    qty = item.quantity
                    name = item.name
                    notes = item.notes or ""
                    
                    # Item principal en negrita (usando mayúsculas)
                    lines.append(f"  {qty}x {name.upper()}\n")
                    
                    # Notas indentadas
                    if notes:
                        lines.append(f"     >> {notes}\n")
                
                lines.append("\n")
        
        # Footer
        lines.append(LINEA + "\n")
        lines.append(f"  Impreso: {datetime.now().strftime('%H:%M:%S')}\n")
        lines.append(LINEA + "\n")
        lines.append("\n\n\n")  # Espacio para corte
        
        # Cut command
        GS = chr(0x1D)
        lines.append(GS + "V" + chr(0))
        
        return lines

    def _generate_barra_content(self, ticket: TicketData, lines: List[str], ESC: str, GS: str) -> List[str]:
        """Genera contenido para ticket de barra (sin precios)"""
        
        # Linea divisoria
        LINEA = "=" * 32
        
        # Header destacado
        lines.append("\n")
        lines.append("/==============================\\\n")
        lines.append(f"|        BARRA - MESA {str(ticket.mesa):>2}        |\n")
        lines.append("\\==============================/\n")
        lines.append(f"  Comanda: {ticket.codigo}\n")
        if ticket.camarero:
            lines.append(f"  Camarero: {ticket.camarero}\n")
        lines.append(f"  Hora: {datetime.now().strftime('%H:%M')}\n")
        lines.append(LINEA + "\n")
        
        # Agrupar items por tipo_ronda
        items_por_tipo = defaultdict(list)
        
        for item in ticket.items:
            tipo = item.tipo_ronda or "BEBIDA"
            items_por_tipo[tipo].append(item)
        
        # Orden de tipos para barra (bebidas primero)
        orden_tipos = ["BEBIDA", "SIN_ORDEN", "SIN TIPO"]
        
        # Imprimir por secciones
        for tipo in orden_tipos:
            if tipo in items_por_tipo and items_por_tipo[tipo]:
                # Nombre amigable del tipo
                nombre_tipo = {
                    "BEBIDA": "BEBIDAS",
                    "SIN_ORDEN": "OTROS",
                    "SIN TIPO": "VARIOS"
                }.get(tipo, tipo)
                
                lines.append(f"\n[ {nombre_tipo} ]\n")
                lines.append("-" * 32 + "\n")
                
                for item in items_por_tipo[tipo]:
                    qty = item.quantity
                    name = item.name
                    notes = item.notes or ""
                    
                    # Item principal en negrita (usando mayúsculas)
                    lines.append(f"  {qty}x {name.upper()}\n")
                    
                    # Notas indentadas
                    if notes:
                        lines.append(f"     >> {notes}\n")
                
                lines.append("\n")
        
        # Footer
        lines.append(LINEA + "\n")
        lines.append(f"  Impreso: {datetime.now().strftime('%H:%M:%S')}\n")
        lines.append(LINEA + "\n")
        lines.append("\n\n\n")  # Espacio para corte
        
        # Cut command
        GS = chr(0x1D)
        lines.append(GS + "V" + chr(0))
        
        return lines

    def _to_float(self, value) -> float:
        """Convierte un valor a float de forma segura"""
        if value is None:
            return 0.0
        if isinstance(value, (int, float)):
            return float(value)
        if isinstance(value, str):
            try:
                return float(value)
            except ValueError:
                return 0.0
        return 0.0

    def _generate_cuenta_content(self, ticket: TicketData, lines: List[str], ESC: str, GS: str) -> List[str]:
        """Genera contenido para ticket de cuenta (con precios)"""
        
        # Lineas divisorias
        LINEA = "=" * 32
        LINEA_DOBLE = "=" * 32
        
        # Header destacado
        lines.append("\n")
        lines.append("/==============================\\\n")
        lines.append("|     RESTAURANTE SUANCES      |\n")
        lines.append("\\==============================/\n")
        lines.append(f"\n  Mesa: {ticket.mesa}  |  {ticket.codigo}\n")
        if ticket.camarero:
            lines.append(f"  Camarero: {ticket.camarero}\n")
        if ticket.comensales:
            lines.append(f"  Comensales: {ticket.comensales}\n")
        lines.append(LINEA + "\n")
        
        # Agrupar items por tipo_ronda
        items_por_tipo = defaultdict(list)
        for item in ticket.items:
            tipo = item.tipo_ronda or "SIN TIPO"
            items_por_tipo[tipo].append(item)
        
        # Orden de tipos
        orden_tipos = ["ENTRANTE", "PRIMERO", "SEGUNDO", "POSTRE", "BEBIDA", "SIN_ORDEN", "SIN TIPO"]
        
        # Imprimir por secciones
        for tipo in orden_tipos:
            if tipo in items_por_tipo and items_por_tipo[tipo]:
                # Nombre amigable del tipo
                nombre_tipo = {
                    "ENTRANTE": "ENTRANTES",
                    "PRIMERO": "PRIMEROS",
                    "SEGUNDO": "SEGUNDOS",
                    "POSTRE": "POSTRES",
                    "BEBIDA": "BEBIDAS",
                    "SIN_ORDEN": "SIN ORDEN",
                    "SIN TIPO": "OTROS"
                }.get(tipo, tipo)
                
                lines.append(f"\n[ {nombre_tipo} ]\n")
                lines.append("-" * 32 + "\n")
                
                for item in items_por_tipo[tipo]:
                    qty = item.quantity
                    name = item.name
                    price = self._to_float(item.price)
                    
                    line = f"  {qty}x {name}"
                    price_str = f"{price:.2f}€"
                    spaces = max(1, 32 - len(line) - len(price_str) - 2)
                    lines.append(line + " " * spaces + price_str + "\n")
                
                lines.append("\n")
        
        # Totales
        lines.append(LINEA + "\n")
        
        subtotal = self._to_float(ticket.subtotal)
        descuento = self._to_float(ticket.descuento)
        total = self._to_float(ticket.total)
        
        if subtotal > 0:
            line = "  Subtotal:"
            price_str = f"{subtotal:.2f}€"
            spaces = 32 - len(line) - len(price_str) - 2
            lines.append(line + " " * spaces + price_str + "\n")
        
        if descuento > 0:
            line = "  Descuento:"
            price_str = f"-{descuento:.2f}€"
            spaces = 32 - len(line) - len(price_str) - 2
            lines.append(line + " " * spaces + price_str + "\n")
        
        if total > 0:
            lines.append(LINEA_DOBLE + "\n")
            line = "  TOTAL:"
            price_str = f"{total:.2f}€"
            spaces = 32 - len(line) - len(price_str) - 2
            lines.append(line + " " * spaces + price_str + "\n")
            lines.append(LINEA_DOBLE + "\n")
        
        # Footer
        lines.append("\n")
        lines.append("    Gracias por su visita\n")
        lines.append(f"    {datetime.now().strftime('%d/%m/%Y %H:%M')}\n")
        lines.append("\n\n\n")  # Espacio para corte
        
        # Cut command
        GS = chr(0x1D)
        lines.append(GS + "V" + chr(0))
        
        return lines

    def _print_usb(self, ticket: TicketData, raw_data: dict):
        """Imprime usando conexión USB ESC/POS"""
        try:
            from escpos import printer
            from escpos.exceptions import USBNotFoundError
            
            p = printer.Usb(self.printer_vendor, self.printer_product, timeout=5)
            self._send_to_escpos(p, ticket)
        except ImportError as e:
            raise RuntimeError(f"Libreria escpos no disponible: {e}")
        except Exception as e:
            if "USBNotFoundError" in str(type(e)) or "not found" in str(e).lower():
                raise RuntimeError(f"Impresora USB no encontrada (VID:{self.printer_vendor:04x}, PID:{self.printer_product:04x})")
            raise

    def _print_serial(self, ticket: TicketData, raw_data: dict):
        """Imprime usando conexión serial"""
        from escpos import printer
        import serial
        
        port = self.config.get("printer", "serial-port", fallback="COM1")
        baud = self.config.getint("printer", "serial-baud", fallback=9600)
        
        with serial.Serial(port, baud, timeout=5) as ser:
            p = printer.Serial(ser)
            self._send_to_escpos(p, ticket)

    def _send_to_escpos(self, p, ticket: TicketData):
        """Envía comandos ESC/POS a la impresora"""
        from escpos import printer
        
        p.charcode("UTF8")
        
        if ticket.type == "TICKET_COCINA":
            p.text("*** COCINA ***\n")
        elif ticket.type == "TICKET_BARRA":
            p.text("*** BARRA ***\n")
        else:
            p.text("RESTAURANTE SUANCES\n")
        
        p.text("=" * 32 + "\n")
        p.text(f"Mesa: {ticket.mesa} - Cod: {ticket.codigo}\n")
        if ticket.camarero:
            p.text(f"Camarero: {ticket.camarero}\n")
        p.text("-" * 32 + "\n")
        
        for item in ticket.items:
            qty = item.quantity
            name = item.name
            price = self._to_float(item.price)
            
            p.text(f"{qty}x {name}\n")
            if price > 0 and ticket.type not in ["TICKET_COCINA", "TICKET_BARRA"]:
                p.text(f"   {price:.2f}€\n")
        
        total = self._to_float(ticket.total)
        if total > 0 and ticket.type not in ["TICKET_COCINA", "TICKET_BARRA"]:
            p.text("-" * 32 + "\n")
            p.text(f"TOTAL: {total:.2f}€\n")
        
        p.text("=" * 32 + "\n")
        p.text(f"{datetime.now().strftime('%d/%m/%Y %H:%M')}\n\n\n")
        p.cut()

    def stop(self):
        """Detiene el cliente de impresión"""
        logger.info("Deteniendo PrintClient...")
        self.running = False
        if self.pubsub:
            self.pubsub.unsubscribe()
        if self.redis_client:
            self.redis_client.close()
        if self.print_thread:
            self.print_thread.join(timeout=5)
        logger.info("PrintClient detenido")


def main():
    import os
    import signal
    
    default_config = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "config.properties")
    config_path = sys.argv[1] if len(sys.argv) > 1 else default_config
    if not os.path.isabs(config_path):
        config_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", config_path)
    config_path = os.path.normpath(config_path)
    
    print(f"Usando config: {config_path}")
    
    client = PrintClient(config_path)
    
    def signal_handler(sig, frame):
        print("\nRecibida señal de cierre...")
        client.stop()
        sys.exit(0)
    
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    try:
        client.start()
    except Exception as e:
        logger.error(f"Error fatal: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
