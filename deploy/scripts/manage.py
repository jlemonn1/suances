#!/usr/bin/env python3
"""
Suances Deploy Manager
Script para gestionar el despliegue de microservicios local y en producción
"""

import os
import sys
import subprocess
import argparse
from pathlib import Path
from datetime import datetime

# Configuración
DEPLOY_DIR = Path(__file__).parent.parent
BACKEND_DIR = DEPLOY_DIR.parent / "backend"
VPS_IP = "46.225.238.149"
VPS_USER = "root"
NETWORK_NAME = "suances-network"
SERVICES = ["carta-service", "personal-service", "reserva-service", "sala-service"]

def run_command(cmd, cwd=None, check=True):
    """Ejecuta un comando y muestra la salida"""
    print(f"\n$ {' '.join(cmd)}")
    try:
        result = subprocess.run(cmd, cwd=cwd, check=check, capture_output=True, text=True)
        if result.stdout:
            print(result.stdout)
        return result
    except subprocess.CalledProcessError as e:
        print(f"Error: {e}")
        if e.stderr:
            print(e.stderr)
        if check:
            sys.exit(1)
        return e

def check_docker():
    """Verifica que Docker esté instalado y corriendo"""
    try:
        subprocess.run(["docker", "info"], capture_output=True, check=True)
        return True
    except:
        print("❌ Docker no está instalado o no está corriendo")
        return False

def create_network():
    """Crea la red Docker si no existe"""
    print("🔧 Verificando red Docker...")
    result = subprocess.run(
        ["docker", "network", "ls", "--filter", f"name={NETWORK_NAME}", "--format", "{{.Name}}"],
        capture_output=True, text=True
    )
    
    if NETWORK_NAME not in result.stdout:
        print(f"🌐 Creando red '{NETWORK_NAME}'...")
        run_command(["docker", "network", "create", NETWORK_NAME])
        print(f"✅ Red '{NETWORK_NAME}' creada")
    else:
        print(f"✅ Red '{NETWORK_NAME}' ya existe")

def build_images(push=False, version="latest"):
    """Build de imágenes Docker"""
    print(f"\n🏗️  Build de imágenes (versión: {version})...")
    
    for service in SERVICES:
        service_dir = BACKEND_DIR / f"rest-{service}"
        
        if not service_dir.exists():
            print(f"❌ Directorio no encontrado: {service_dir}")
            continue
        
        print(f"\n📦 Building {service}...")
        image_tag = f"suances/{service}:{version}"
        
        run_command(
            ["docker", "build", "-t", image_tag, "."],
            cwd=service_dir
        )
        
        if push:
            print(f"📤 Pushing {image_tag}...")
            run_command(["docker", "push", image_tag])
            
            # También taggear como latest si no es latest
            if version != "latest":
                latest_tag = f"suances/{service}:latest"
                run_command(["docker", "tag", image_tag, latest_tag])
                run_command(["docker", "push", latest_tag])
    
    print("\n✅ Build completado")

def start_infra():
    """Inicia la infraestructura (PostgreSQL + Redis)"""
    print("\n🗄️  Iniciando infraestructura...")
    create_network()
    run_command(
        ["docker-compose", "-f", "docker-compose.infra.yml", "up", "-d"],
        cwd=DEPLOY_DIR
    )
    print("✅ Infraestructura iniciada")
    print("⏳ Esperando a que los servicios estén healthy...")
    import time
    time.sleep(10)

def stop_infra():
    """Detiene la infraestructura"""
    print("\n⏹️  Deteniendo infraestructura...")
    run_command(
        ["docker-compose", "-f", "docker-compose.infra.yml", "down"],
        cwd=DEPLOY_DIR
    )
    print("✅ Infraestructura detenida")

def deploy_local(build=True):
    """Deploy completo en local"""
    print("\n🚀 Deploy LOCAL...")
    
    if build:
        build_images(version="local")
    
    create_network()
    
    # 1. Levantar infraestructura
    print("\n🗄️  Iniciando infraestructura...")
    run_command(
        ["docker-compose", "-f", "docker-compose.infra.yml", "up", "-d"],
        cwd=DEPLOY_DIR
    )
    
    # 2. Esperar a que infra esté lista
    print("⏳ Esperando a que PostgreSQL y Redis estén listos...")
    import time
    time.sleep(15)
    
    # 3. Levantar servicios
    print("\n🚀 Iniciando microservicios...")
    run_command(
        ["docker-compose", "-f", "docker-compose.local.yml", "up", "-d"],
        cwd=DEPLOY_DIR
    )
    
    print("\n✅ Deploy local completado")
    print("\nEndpoints disponibles:")
    print("  - Carta:    http://localhost:8081/api/carta")
    print("  - Personal: http://localhost:8085/api/personal")
    print("  - Reservas: http://localhost:8087/api/reservas")
    print("  - Sala:     http://localhost:8083/api/sala")

def deploy_prod():
    """Deploy en producción (VPS)"""
    print(f"\n🌐 Deploy en VPS ({VPS_IP})...")
    
    # Backup antes de deploy
    backup_databases()
    
    # Copiar archivos al VPS
    print("\n📤 Copiando archivos al VPS...")
    run_command([
        "scp", "-r", str(DEPLOY_DIR), 
        f"{VPS_USER}@{VPS_IP}:/opt/suances/"
    ], check=False)
    
    # Ejecutar deploy en VPS
    print("\n🚀 Ejecutando deploy en VPS...")
    run_command([
        "ssh", f"{VPS_USER}@{VPS_IP}",
        f"cd /opt/suances/deploy && ./scripts/manage.py --action deploy-remote"
    ])

def deploy_remote():
    """Deploy remoto (ejecutado en el VPS)"""
    print("\n🌐 Deploy en servidor remoto...")
    
    create_network()
    
    # Pull de imágenes
    print("\n📥 Descargando imágenes...")
    run_command(["docker-compose", "-f", "docker-compose.prod.yml", "pull"], cwd=DEPLOY_DIR)
    
    # Detener servicios actuales
    print("\n⏹️  Deteniendo servicios actuales...")
    run_command(["docker-compose", "-f", "docker-compose.prod.yml", "down"], cwd=DEPLOY_DIR)
    
    # Iniciar infraestructura
    print("\n🗄️  Iniciando infraestructura...")
    run_command(["docker-compose", "-f", "docker-compose.infra.yml", "up", "-d"], cwd=DEPLOY_DIR)
    
    # Iniciar servicios
    print("\n🚀 Iniciando microservicios...")
    run_command(["docker-compose", "-f", "docker-compose.prod.yml", "up", "-d"], cwd=DEPLOY_DIR)
    
    print("\n✅ Deploy en producción completado")
    print(f"\nEndpoints disponibles en http://{VPS_IP}")

def stop_services(local=True):
    """Detiene los microservicios"""
    print("\n⏹️  Deteniendo microservicios...")
    compose_file = "docker-compose.dev.yml" if local else "docker-compose.prod.yml"
    run_command(["docker-compose", "-f", compose_file, "down"], cwd=DEPLOY_DIR)
    print("✅ Servicios detenidos")

def view_logs(service=None, follow=False):
    """Muestra logs"""
    cmd = ["docker-compose", "-f", "docker-compose.local.yml", "logs"]
    if follow:
        cmd.append("-f")
    if service:
        cmd.append(service)
    
    print(f"\n📋 Logs{' de ' + service if service else ''}...")
    run_command(cmd, cwd=DEPLOY_DIR, check=False)

def view_status():
    """Muestra estado de los contenedores"""
    print("\n📊 Estado de contenedores:")
    run_command(["docker", "ps", "--format", "table {{.Names}}\t{{.Status}}\t{{.Ports}}"], check=False)

def clean_all():
    """Limpia todo: contenedores, volúmenes, imágenes"""
    print("\n🧹 Limpiando todo...")
    
    # Detener todo
    run_command(["docker-compose", "-f", "docker-compose.local.yml", "down", "-v"], cwd=DEPLOY_DIR, check=False)
    run_command(["docker-compose", "-f", "docker-compose.prod.yml", "down", "-v"], cwd=DEPLOY_DIR, check=False)
    run_command(["docker-compose", "-f", "docker-compose.infra.yml", "down", "-v"], cwd=DEPLOY_DIR, check=False)
    
    # Limpiar imágenes no usadas
    run_command(["docker", "system", "prune", "-f"], check=False)
    
    print("✅ Limpieza completada")

def backup_databases():
    """Hace backup de las bases de datos"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_dir = DEPLOY_DIR / "backups"
    backup_dir.mkdir(exist_ok=True)
    
    print(f"\n💾 Haciendo backup de bases de datos ({timestamp})...")
    
    databases = [
        ("postgres-carta", "carta"),
        ("postgres-personal", "personal"),
        ("postgres-reservas", "reservas"),
        ("postgres-sala", "sala")
    ]
    
    for container, db_name in databases:
        backup_file = backup_dir / f"{db_name}_{timestamp}.sql"
        print(f"  📄 Backup de {db_name}...")
        
        result = subprocess.run(
            ["docker", "exec", container, "pg_dump", "-U", "postgres", db_name],
            capture_output=True, text=True
        )
        
        if result.returncode == 0:
            with open(backup_file, "w") as f:
                f.write(result.stdout)
            print(f"    ✅ Guardado en {backup_file}")
        else:
            print(f"    ❌ Error: {result.stderr}")
    
    print("\n✅ Backup completado")

def shell_into(container):
    """Accede al shell de un contenedor"""
    print(f"\n🐚 Accediendo a {container}...")
    subprocess.run(["docker", "exec", "-it", container, "/bin/sh"])

def show_menu():
    """Muestra el menú principal"""
    print("\n" + "="*60)
    print("     🍽️  SUANCES DEPLOY MANAGER")
    print("="*60)
    print("\n🖥️  DESARROLLO LOCAL:")
    print("   1. 🏗️  Build imágenes (desde código)")
    print("   2. 🗄️  Iniciar infraestructura (PostgreSQL + Redis)")
    print("   3. 🚀 Deploy completo local (build + up)")
    print("   4. 📊 Ver logs de servicios")
    print("   5. ⏹️  Detener servicios")
    print("   6. 🧹 Limpiar todo")
    print("   7. 📋 Estado de contenedores")
    
    print("\n🌐 PRODUCCIÓN:")
    print("   8. 🐳 Build + Push a Docker Hub")
    print("   9. 🌐 Deploy en VPS")
    print("  10. 💾 Backup de bases de datos")
    
    print("\n🔧 UTILIDADES:")
    print("  11. 🌐 Crear red Docker")
    print("  12. 📤 Copiar archivos a VPS")
    print("  13. 🐚 Acceder a shell de contenedor")
    print("  14. ❌ Salir")
    print("\n" + "="*60)

def main():
    parser = argparse.ArgumentParser(description="Suances Deploy Manager")
    parser.add_argument("--action", choices=[
        "build", "infra-up", "deploy-local", "stop-local", "logs", "status", "clean",
        "build-push", "deploy-prod", "backup", "create-network", "scp", "shell", "deploy-remote"
    ], help="Ejecutar acción directamente sin menú")
    parser.add_argument("--service", help="Nombre del servicio (para logs)")
    parser.add_argument("--follow", "-f", action="store_true", help="Seguir logs")
    parser.add_argument("--version", default="latest", help="Versión de la imagen")
    
    args = parser.parse_args()
    
    if not check_docker():
        sys.exit(1)
    
    if args.action:
        # Modo comando directo
        if args.action == "build":
            build_images(version=args.version)
        elif args.action == "infra-up":
            start_infra()
        elif args.action == "deploy-local":
            deploy_local(build=True)
        elif args.action == "stop-local":
            stop_services(local=True)
        elif args.action == "logs":
            view_logs(args.service, args.follow)
        elif args.action == "status":
            view_status()
        elif args.action == "clean":
            clean_all()
        elif args.action == "build-push":
            build_images(push=True, version=args.version)
        elif args.action == "deploy-prod":
            deploy_prod()
        elif args.action == "deploy-remote":
            deploy_remote()
        elif args.action == "backup":
            backup_databases()
        elif args.action == "create-network":
            create_network()
        elif args.action == "scp":
            print(f"\n📤 Copiando archivos a {VPS_IP}...")
            run_command(["scp", "-r", str(DEPLOY_DIR), f"{VPS_USER}@{VPS_IP}:/opt/suances/"])
        elif args.action == "shell":
            container = args.service or input("Nombre del contenedor: ")
            shell_into(container)
        return
    
    # Modo menú interactivo
    while True:
        show_menu()
        choice = input("\nSelecciona una opción: ").strip()
        
        if choice == "1":
            build_images(version="local")
        elif choice == "2":
            start_infra()
        elif choice == "3":
            deploy_local(build=True)
        elif choice == "4":
            service = input("Servicio (dejar vacío para todos): ").strip() or None
            follow = input("¿Seguir logs? (s/n): ").strip().lower() == "s"
            view_logs(service, follow)
        elif choice == "5":
            stop_services(local=True)
        elif choice == "6":
            confirm = input("⚠️  ¿Estás seguro? Se borrarán todos los datos (s/n): ")
            if confirm.lower() == "s":
                clean_all()
        elif choice == "7":
            view_status()
        elif choice == "8":
            version = input("Versión (default: latest): ").strip() or "latest"
            build_images(push=True, version=version)
        elif choice == "9":
            deploy_prod()
        elif choice == "10":
            backup_databases()
        elif choice == "11":
            create_network()
        elif choice == "12":
            print(f"\n📤 Copiando archivos a {VPS_IP}...")
            run_command(["scp", "-r", str(DEPLOY_DIR), f"{VPS_USER}@{VPS_IP}:/opt/suances/"])
        elif choice == "13":
            container = input("Nombre del contenedor: ").strip()
            if container:
                shell_into(container)
        elif choice == "14":
            print("\n👋 Hasta luego!")
            break
        else:
            print("\n❌ Opción no válida")
        
        input("\nPresiona Enter para continuar...")

if __name__ == "__main__":
    main()
