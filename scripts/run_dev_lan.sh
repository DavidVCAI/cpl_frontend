#!/bin/bash
# Script para ejecutar el frontend en la red local (LAN)
# Para Linux/macOS

echo "========================================"
echo "  CityPulse Live - Frontend Server"
echo "  Modo: Red Local (LAN)"
echo "========================================"
echo ""

# Obtener IP local
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    IP=$(ipconfig getifaddr en0)
else
    # Linux
    IP=$(hostname -I | awk '{print $1}')
fi

echo "IP Local detectada: $IP"
echo ""

echo "IMPORTANTE: Asegúrate de configurar el archivo .env con:"
echo "  VITE_API_URL=http://$IP:8000"
echo "  VITE_WS_URL=ws://$IP:8000"
echo ""

echo "Iniciando servidor de desarrollo Vite..."
echo "Frontend estará disponible en:"
echo "  - Local:   http://localhost:5173"
echo "  - Red LAN: http://$IP:5173"
echo ""
echo "Dispositivos en tu red pueden acceder usando:"
echo "  http://$IP:5173"
echo ""
echo "Presiona Ctrl+C para detener el servidor"
echo ""

# Ejecutar Vite en modo desarrollo
npm run dev
