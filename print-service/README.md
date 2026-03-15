# Print Service - Restaurante Suances v3.0

Sistema de impresión universal para tickets de cocina, barra y cuentas.
Funciona en **Windows**, **Linux**, **Mac** y **Android (Termux)**.

## ⚡ Instalación Rápida (2 minutos)

### Windows
```cmd
git clone <repo-url>
cd print-service
python install.py
```

### Linux / Mac
```bash
git clone <repo-url>
cd print-service
python3 install.py
```

### Android (Termux)
```bash
pkg install python git
pip install redis
```

## 📋 Requisitos

- Python 3.7+
- Impresora térmica USB o conectada por red
- Servidor Redis (en PC central)

## 🚀 Uso

### Primera vez (Configuración)
Ejecuta el instalador que te guiará paso a paso:
```bash
python install.py
```

El asistente te preguntará:
1. **Ubicación**: Cocina, Isabella o Faro
2. **Redis**: IP del servidor (ej: 192.168.1.100)
3. **Impresora**: Selecciona de la lista detectada

### Iniciar el servicio

**Windows:**
```cmd
start.bat
```

**Linux/Mac/Android:**
```bash
./start.sh
```

O directamente:
```bash
python print_service.py
```

### Instalar como servicio (siempre disponible)

El instalador intentará configurarlo automáticamente, pero si quieres hacerlo manual:

**Windows (como servicio):**
```cmd
python install.py
# Selecciona instalar como servicio
```

**Linux (systemd):**
```bash
sudo cp /tmp/printservice.service /etc/systemd/system/
sudo systemctl enable printservices
sudo systemctl start printservices
```

**Android (Termux - inicio automático):**
```bash
echo './start.sh' >> ~/.bashrc
```

## 📁 Estructura

```
print-service/
├── install.py          # Instalador universal
├── print_service.py    # Servicio principal
├── config.json         # Tu configuración (generado)
├── start.bat           # Inicio rápido Windows
├── start.sh            # Inicio rápido Linux/Mac/Android
└── requirements.txt    # Dependencias
```

## 🔧 Configuración Manual

Si prefieres editar manualmente, crea `config.json`:

```json
{
  "ubicacion": "cocina",
  "canales": ["print/cocina"],
  "redis": {
    "host": "192.168.1.100",
    "port": 6379
  },
  "printer": {
    "name": "POSIFLEX PP-6900",
    "type": "windows"
  }
}
```

## 🖨️ Tipos de Impresora

- `windows`: Usa spooler de Windows (recomendado)
- `usb`: Conexión directa USB ESC/POS

## 📝 Logs

Los logs se guardan en `printservice.log` y se muestran en consola.

## 🔄 Actualizar

```bash
git pull
python install.py
```

## ❓ Troubleshooting

### "No se detecta la impresora"
- Windows: Ve a Panel de Control → Dispositivos e Impresoras
- Linux: Ejecuta `lpstat -p`
- Android: La impresora debe estar conectada por OTG

### "No conecta a Redis"
- Verifica que el servidor Redis esté encendido
- Comprueba el firewall (puerto 6379)
- Prueba: `redis-cli -h <IP> ping`

### "No imprime"
- Verifica que el nombre de la impresora coincida exactamente
- Prueba imprimir una página de prueba desde el sistema
- Revisa los logs: `tail -f printservice.log`

## 📱 Android (Termux) - Notas especiales

1. Instala Termux desde F-Droid (no Play Store)
2. Concede permisos de almacenamiento: `termux-setup-storage`
3. La impresora USB necesita adaptador OTG

## 📄 Licencia

Proyecto privado - Restaurante Suances

## 📞 Soporte

Para problemas o mejoras, contacta con el equipo de desarrollo.
