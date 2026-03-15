#!/usr/bin/env python3
"""
PrintService - Instalador Universal
Instala y configura el servicio de impresión en Windows, Linux, Mac o Android (Termux)
"""

import os
import sys
import json
import platform
import subprocess
import shutil
from pathlib import Path

# Colores para terminal
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def print_banner():
    print(f"{Colors.HEADER}{'='*60}{Colors.ENDC}")
    print(f"{Colors.BOLD}  PRINT SERVICE - RESTAURANTE SUANCES{Colors.ENDC}")
    print(f"{Colors.BLUE}  Instalador Universal v3.0{Colors.ENDC}")
    print(f"{Colors.HEADER}{'='*60}{Colors.ENDC}")
    print()

def detect_os():
    """Detecta el sistema operativo"""
    system = platform.system().lower()
    
    # Detectar Android/Termux
    if system == "linux" and "ANDROID_ROOT" in os.environ:
        return "android"
    
    return system

def check_python():
    """Verifica versión de Python"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 7):
        print(f"{Colors.RED}ERROR: Se necesita Python 3.7 o superior{Colors.ENDC}")
        print(f"Versión actual: {version.major}.{version.minor}")
        return False
    return True

def install_dependencies():
    """Instala dependencias Python"""
    print(f"{Colors.BLUE}📦 Instalando dependencias...{Colors.ENDC}")
    
    deps = ["redis", "pyserial"]
    
    # En Windows, agregar pywin32
    if detect_os() == "windows":
        deps.append("pywin32")
    
    for dep in deps:
        try:
            __import__(dep.replace("pywin32", "win32print") if dep == "pywin32" else dep)
            print(f"  ✅ {dep} ya instalado")
        except ImportError:
            print(f"  📥 Instalando {dep}...")
            subprocess.check_call([sys.executable, "-m", "pip", "install", dep, "-q"])
            print(f"  ✅ {dep} instalado")

def scan_usb_printers():
    """Escanea impresoras USB disponibles"""
    printers = []
    
    os_type = detect_os()
    
    if os_type == "windows":
        try:
            import win32print
            printers_info = win32print.EnumPrinters(win32print.PRINTER_ENUM_LOCAL | win32print.PRINTER_ENUM_CONNECTIONS)
            for printer in printers_info:
                name = printer[2]
                # Filtrar impresoras de sistema
                if "microsoft" not in name.lower() and "pdf" not in name.lower() and "xps" not in name.lower():
                    printers.append(name)
        except:
            pass
    
    elif os_type in ["linux", "android"]:
        # Usar lpstat o CUPS
        try:
            result = subprocess.run(["lpstat", "-p"], capture_output=True, text=True)
            for line in result.stdout.split('\n'):
                if line.startswith("printer "):
                    name = line.split()[1]
                    printers.append(name)
        except:
            pass
        
        # También buscar dispositivos USB directos
        try:
            if os.path.exists("/dev/usb"):
                for device in os.listdir("/dev/usb"):
                    if "lp" in device:
                        printers.append(f"USB:/dev/usb/{device}")
        except:
            pass
    
    return printers

def configure():
    """Wizard de configuración"""
    print(f"{Colors.GREEN}\n{'='*60}{Colors.ENDC}")
    print(f"{Colors.BOLD}  CONFIGURACIÓN DEL SERVICIO{Colors.ENDC}")
    print(f"{Colors.GREEN}{'='*60}{Colors.ENDC}\n")
    
    config = {}
    
    # 1. Ubicación
    print(f"{Colors.YELLOW}1. Selecciona la ubicación de esta impresora:{Colors.ENDC}")
    print("   1. Cocina")
    print("   2. Barra Isabella")
    print("   3. Barra Faro")
    
    while True:
        choice = input("\n   Opción (1-3): ").strip()
        if choice == "1":
            config["ubicacion"] = "cocina"
            config["canales"] = ["print/cocina"]
            break
        elif choice == "2":
            config["ubicacion"] = "isabella"
            config["canales"] = ["print/ticket-isabella", "print/barra"]
            break
        elif choice == "3":
            config["ubicacion"] = "faro"
            config["canales"] = ["print/ticket-faro"]
            break
        print(f"{Colors.RED}   Opción inválida{Colors.ENDC}")
    
    print(f"\n   ✅ Ubicación: {config['ubicacion'].upper()}")
    
    # 2. Redis
    print(f"\n{Colors.YELLOW}2. Configuración de Redis (servidor central):{Colors.ENDC}")
    redis_host = input("   Host [localhost]: ").strip() or "localhost"
    redis_port = input("   Puerto [6379]: ").strip() or "6379"
    
    config["redis"] = {
        "host": redis_host,
        "port": int(redis_port)
    }
    
    print(f"   ✅ Redis: {redis_host}:{redis_port}")
    
    # 3. Impresora
    print(f"\n{Colors.YELLOW}3. Selección de impresora:{Colors.ENDC}")
    print("   Escaneando impresoras disponibles...")
    
    printers = scan_usb_printers()
    
    if printers:
        print(f"\n   Impresoras detectadas:")
        for i, printer in enumerate(printers, 1):
            print(f"   {i}. {printer}")
        print(f"   {len(printers)+1}. Otra (introducir manualmente)")
        
        while True:
            choice = input(f"\n   Selecciona (1-{len(printers)+1}): ").strip()
            if choice.isdigit():
                idx = int(choice) - 1
                if 0 <= idx < len(printers):
                    config["printer"] = {
                        "name": printers[idx],
                        "type": "windows" if detect_os() == "windows" else "usb"
                    }
                    break
                elif idx == len(printers):
                    manual = input("   Nombre de la impresora: ").strip()
                    config["printer"] = {
                        "name": manual,
                        "type": "windows" if detect_os() == "windows" else "usb"
                    }
                    break
            print(f"{Colors.RED}   Opción inválida{Colors.ENDC}")
    else:
        print(f"\n   {Colors.YELLOW}⚠️  No se detectaron impresoras automáticamente{Colors.ENDC}")
        manual = input("   Introduce el nombre de la impresora: ").strip()
        config["printer"] = {
            "name": manual,
            "type": "windows" if detect_os() == "windows" else "usb"
        }
    
    print(f"   ✅ Impresora: {config['printer']['name']}")
    
    # Guardar configuración
    config_path = Path("config.json")
    with open(config_path, 'w', encoding='utf-8') as f:
        json.dump(config, f, indent=2)
    
    print(f"\n{Colors.GREEN}✅ Configuración guardada en: {config_path.absolute()}{Colors.ENDC}")
    
    return config

def install_service():
    """Instala el servicio según el SO"""
    os_type = detect_os()
    
    print(f"\n{Colors.BLUE}🔧 Instalando servicio para {os_type.upper()}...{Colors.ENDC}")
    
    if os_type == "windows":
        install_windows_service()
    elif os_type == "linux":
        install_linux_service()
    elif os_type == "android":
        install_android_service()
    elif os_type == "darwin":
        install_mac_service()
    else:
        print(f"{Colors.YELLOW}⚠️  SO no soportado para instalación automática{Colors.ENDC}")
        print("   Puedes ejecutar manualmente: python print_service.py")

def install_windows_service():
    """Instala servicio en Windows"""
    try:
        import win32serviceutil
        import win32service
        import win32event
        import servicemanager
        
        # Crear script de servicio
        service_script = '''import win32serviceutil
import win32service
import win32event
import servicemanager
import subprocess
import sys
import os

class PrintService(win32serviceutil.ServiceFramework):
    _svc_name_ = "PrintServiceSuances"
    _svc_display_name_ = "Print Service - Restaurante Suances"
    _svc_description_ = "Servicio de impresión de tickets para el restaurante"
    
    def __init__(self, args):
        win32serviceutil.ServiceFramework.__init__(self, args)
        self.stop_event = win32event.CreateEvent(None, 0, 0, None)
        self.process = None
    
    def SvcStop(self):
        self.ReportServiceStatus(win32service.SERVICE_STOP_PENDING)
        win32event.SetEvent(self.stop_event)
        if self.process:
            self.process.terminate()
    
    def SvcDoRun(self):
        servicemanager.LogMsg(servicemanager.EVENTLOG_INFORMATION_TYPE,
                              servicemanager.PYS_SERVICE_STARTED,
                              (self._svc_name_, ''))
        
        script_path = os.path.join(os.path.dirname(__file__), "print_service.py")
        self.process = subprocess.Popen([sys.executable, script_path],
                                       stdout=subprocess.PIPE,
                                       stderr=subprocess.PIPE)
        self.process.wait()

if __name__ == '__main__':
    win32serviceutil.HandleCommandLine(PrintService)
'''
        
        with open("service_windows.py", "w") as f:
            f.write(service_script)
        
        # Instalar servicio
        subprocess.check_call([sys.executable, "service_windows.py", "install"])
        subprocess.check_call([sys.executable, "service_windows.py", "start"])
        
        print(f"{Colors.GREEN}✅ Servicio instalado y iniciado{Colors.ENDC}")
        print(f"   Puedes gestionarlo desde: services.msc")
        
    except Exception as e:
        print(f"{Colors.RED}❌ Error instalando servicio: {e}{Colors.ENDC}")
        print(f"   Puedes ejecutar manualmente: python print_service.py")

def install_linux_service():
    """Instala servicio en Linux con systemd"""
    try:
        service_content = f'''[Unit]
Description=Print Service - Restaurante Suances
After=network.target

[Service]
Type=simple
User={os.environ.get('USER', 'root')}
WorkingDirectory={os.getcwd()}
ExecStart={sys.executable} {os.getcwd()}/print_service.py
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
'''
        
        service_path = "/etc/systemd/system/printservice.service"
        
        # Escribir servicio (necesita sudo)
        print(f"   {Colors.YELLOW}Se requiere sudo para instalar el servicio{Colors.ENDC}")
        
        # Guardar temporalmente
        with open("/tmp/printservice.service", "w") as f:
            f.write(service_content)
        
        print(f"   Ejecuta manualmente:")
        print(f"   sudo cp /tmp/printservice.service {service_path}")
        print(f"   sudo systemctl enable printservices")
        print(f"   sudo systemctl start printservices")
        
    except Exception as e:
        print(f"{Colors.RED}❌ Error: {e}{Colors.ENDC}")

def install_android_service():
    """Instala servicio en Android (Termux)"""
    print(f"{Colors.BLUE}📱 Configurando para Termux...{Colors.ENDC}")
    
    # Crear script de inicio
    boot_script = f'''#!/data/data/com.termux/files/usr/bin/bash
cd {os.getcwd()}
python print_service.py &
'''
    
    with open("start_termux.sh", "w") as f:
        f.write(boot_script)
    
    os.chmod("start_termux.sh", 0o755)
    
    print(f"{Colors.GREEN}✅ Script de inicio creado: start_termux.sh{Colors.ENDC}")
    print(f"\n   Para iniciar automáticamente al abrir Termux:")
    print(f"   echo './start_termux.sh' >> ~/.bashrc")
    print(f"\n   O ejecuta manualmente: ./start_termux.sh")

def install_mac_service():
    """Instala servicio en Mac con launchd"""
    print(f"{Colors.YELLOW}🍎 Para Mac, ejecuta manualmente:{Colors.ENDC}")
    print(f"   python print_service.py")
    print(f"\n   Para instalar como servicio, consulta el README")

def main():
    print_banner()
    
    # Verificar Python
    if not check_python():
        sys.exit(1)
    
    # Instalar dependencias
    install_dependencies()
    
    # Configurar
    config = configure()
    
    # Instalar servicio
    install_service()
    
    # Resumen final
    print(f"\n{Colors.GREEN}{'='*60}{Colors.ENDC}")
    print(f"{Colors.BOLD}  INSTALACIÓN COMPLETADA{Colors.ENDC}")
    print(f"{Colors.GREEN}{'='*60}{Colors.ENDC}")
    print()
    print(f"  📍 Ubicación: {config['ubicacion'].upper()}")
    print(f"  🖨️  Impresora: {config['printer']['name']}")
    print(f"  📡 Redis: {config['redis']['host']}:{config['redis']['port']}")
    print(f"  📋 Canales: {', '.join(config['canales'])}")
    print()
    print(f"{Colors.BLUE}  El servicio está corriendo en segundo plano.{Colors.ENDC}")
    print(f"{Colors.BLUE}  Puedes cerrar esta ventana.{Colors.ENDC}")
    print()
    
    # Iniciar servicio inmediatamente
    print(f"{Colors.YELLOW}🚀 Iniciando servicio ahora...{Colors.ENDC}")
    try:
        subprocess.Popen([sys.executable, "print_service.py"])
        print(f"{Colors.GREEN}✅ Servicio iniciado{Colors.ENDC}")
    except Exception as e:
        print(f"{Colors.RED}❌ Error iniciando: {e}{Colors.ENDC}")
        print(f"   Ejecuta manualmente: python print_service.py")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n\n{Colors.YELLOW}Instalación cancelada{Colors.ENDC}")
        sys.exit(0)
