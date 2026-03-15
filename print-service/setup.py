#!/usr/bin/env python3
"""
Script de configuración interactivo para Print Service
Configura automáticamente el config.properties según la ubicación
"""

import os
import sys


def print_banner():
    print("=" * 60)
    print("  CONFIGURACIÓN PRINT SERVICE - RESTAURANTE SUANCES")
    print("=" * 60)
    print()


def ask_question(question, options, default=None):
    """Muestra una pregunta con opciones y devuelve la selección"""
    print(f"\n{question}")
    print("-" * 40)
    for i, option in enumerate(options, 1):
        marker = " (defecto)" if option == default else ""
        print(f"  {i}. {option}{marker}")
    
    while True:
        try:
            prompt = f"\nSelecciona una opción (1-{len(options)}): "
            choice = input(prompt).strip()
            
            if choice == "" and default:
                return default
            
            idx = int(choice) - 1
            if 0 <= idx < len(options):
                return options[idx]
            else:
                print(f"❌ Opción inválida. Elige entre 1 y {len(options)}")
        except ValueError:
            print("❌ Por favor introduce un número")


def ask_redis_host():
    """Pregunta por el host de Redis"""
    print("\n" + "=" * 40)
    print("CONFIGURACIÓN REDIS")
    print("=" * 40)
    
    default_host = "localhost"
    host = input(f"\nHost de Redis [{default_host}]: ").strip()
    return host if host else default_host


def ask_redis_port():
    """Pregunta por el puerto de Redis"""
    default_port = "6379"
    port = input(f"Puerto de Redis [{default_port}]: ").strip()
    return port if port else default_port


def get_channels_for_location(location):
    """Devuelve los canales según la ubicación"""
    channels_map = {
        "Cocina": "print/cocina",
        "Barra Isabella": "print/ticket-isabella,print/barra",
        "Barra Faro": "print/ticket-faro",
    }
    return channels_map.get(location, "print/ticket")


def get_description_for_location(location):
    """Devuelve descripción según ubicación"""
    descriptions = {
        "Cocina": """
✓ Imprimirá tickets de cocina (comidas)
✓ También recibirá tickets de barra (bebidas) si es necesario
✓ Canal: print/cocina
""",
        "Barra Isabella": """
✓ Imprimirá tickets de cuenta cerrada (cobros)
✓ Imprimirá tickets de bebidas para preparar
✓ Canales: print/ticket-isabella, print/barra
""",
        "Barra Faro": """
✓ Imprimirá tickets de cuenta cerrada (cobros)
✓ Canal: print/ticket-faro
""",
    }
    return descriptions.get(location, "")


def ask_printer_name():
    """Pregunta por el nombre de la impresora en Windows"""
    print("\n" + "=" * 40)
    print("CONFIGURACIÓN IMPRESORA")
    print("=" * 40)
    
    print("\n⚠️  IMPORTANTE: El nombre debe coincidir EXACTAMENTE")
    print("   con el nombre de la impresora en Windows")
    print("\nPara ver el nombre en Windows:")
    print("  Panel de Control → Dispositivos e Impresoras")
    
    default_name = "POSIFLEX PP-6900"
    name = input(f"\nNombre de la impresora [{default_name}]: ").strip()
    return name if name else default_name


def ask_printer_type():
    """Pregunta por el tipo de conexión de la impresora"""
    print("\n" + "=" * 40)
    print("TIPO DE CONEXIÓN")
    print("=" * 40)
    
    options = [
        "Windows (Spooler de Windows - recomendado)",
        "USB (ESC/POS directo - avanzado)",
        "Serial (Puerto COM - avanzado)"
    ]
    
    choice = ask_question(
        "¿Cómo está conectada la impresora?",
        options,
        default=options[0]
    )
    
    if "Windows" in choice:
        return "windows"
    elif "USB" in choice:
        return "usb"
    else:
        return "serial"


def generate_config(location, redis_host, redis_port, printer_name, printer_type):
    """Genera el contenido del archivo de configuración"""
    channels = get_channels_for_location(location)
    
    config = f"""[redis]
redis-host={redis_host}
redis-port={redis_port}

# Channels to subscribe (comma-separated)
# Esta PC está configurada como: {location}
channels={channels}

[printer]
# Printer name as configured in Windows
printer-name={printer_name}

# Printer type: windows, usb, serial
printer-type={printer_type}

# USB settings (only for usb type)
vendor-id=0x0d3a
product-id=0x0369

# Serial settings (only for serial type)
serial-port=COM1
serial-baud=9600
"""
    return config


def save_config(config_content, config_path="config.properties"):
    """Guarda la configuración en el archivo"""
    try:
        # Backup del archivo existente si existe
        if os.path.exists(config_path):
            backup_path = config_path + ".backup"
            os.rename(config_path, backup_path)
            print(f"\n💾 Backup creado: {backup_path}")
        
        with open(config_path, "w", encoding="utf-8") as f:
            f.write(config_content)
        
        return True
    except Exception as e:
        print(f"\n❌ Error guardando configuración: {e}")
        return False


def test_redis_connection(host, port):
    """Prueba la conexión a Redis"""
    try:
        import redis
        r = redis.Redis(host=host, port=int(port), socket_connect_timeout=3)
        r.ping()
        return True
    except Exception as e:
        return False


def main():
    print_banner()
    
    # Paso 1: Ubicación
    print("=" * 40)
    print("PASO 1: UBICACIÓN DE ESTA PC")
    print("=" * 40)
    
    locations = ["Cocina", "Barra Isabella", "Barra Faro"]
    location = ask_question(
        "¿En qué ubicación está este ordenador?",
        locations
    )
    
    print(get_description_for_location(location))
    
    # Paso 2: Redis
    redis_host = ask_redis_host()
    redis_port = ask_redis_port()
    
    # Test conexión Redis
    print(f"\n🔄 Probando conexión a Redis en {redis_host}:{redis_port}...")
    if test_redis_connection(redis_host, redis_port):
        print("✅ Conexión exitosa")
    else:
        print("⚠️  No se pudo conectar a Redis (puede estar en otro servidor)")
        continue_anyway = input("¿Continuar de todos modos? (s/N): ").strip().lower()
        if continue_anyway != "s":
            print("\n❌ Configuración cancelada")
            sys.exit(1)
    
    # Paso 3: Impresora
    printer_name = ask_printer_name()
    printer_type = ask_printer_type()
    
    # Generar configuración
    print("\n" + "=" * 40)
    print("GENERANDO CONFIGURACIÓN")
    print("=" * 40)
    
    config_content = generate_config(
        location,
        redis_host,
        redis_port,
        printer_name,
        printer_type
    )
    
    # Mostrar resumen
    print("\n📋 RESUMEN DE CONFIGURACIÓN:")
    print("-" * 40)
    print(f"  Ubicación: {location}")
    print(f"  Redis: {redis_host}:{redis_port}")
    print(f"  Canales: {get_channels_for_location(location)}")
    print(f"  Impresora: {printer_name}")
    print(f"  Tipo: {printer_type}")
    
    # Confirmar
    print("\n" + "=" * 40)
    confirm = input("¿Guardar esta configuración? (S/n): ").strip().lower()
    
    if confirm in ("", "s", "si", "yes"):
        config_path = "config.properties"
        if save_config(config_content, config_path):
            print(f"\n✅ Configuración guardada en: {os.path.abspath(config_path)}")
            print("\n🚀 Para iniciar el servicio de impresión:")
            print("   python src/print_client.py")
            print("\n   o ejecuta: start.bat")
        else:
            print("\n❌ No se pudo guardar la configuración")
            sys.exit(1)
    else:
        print("\n❌ Configuración cancelada")
        sys.exit(0)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n❌ Configuración cancelada por el usuario")
        sys.exit(0)
