@echo off
:: Script de inicio rápido para Windows
:: Si no hay configuración, ejecuta el instalador

if not exist "config.json" (
    echo No se encontró configuración. Ejecutando instalador...
    python install.py
) else (
    python print_service.py
)
