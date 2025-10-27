@echo off
REM Script para ejecutar el frontend en la red local (LAN)
REM Asegurate de tener Node.js y las dependencias instaladas

echo ========================================
echo   CityPulse Live - Frontend Server
echo   Modo: Red Local (LAN)
echo ========================================
echo.

REM Obtener IP local
echo Detectando IP local...
for /f "tokens=2 delimiters=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set IP=%%a
    goto :found
)
:found
set IP=%IP:~1%
echo IP Local detectada: %IP%
echo.

echo IMPORTANTE: Asegurate de configurar el archivo .env con:
echo   VITE_API_URL=http://%IP%:8000
echo   VITE_WS_URL=ws://%IP%:8000
echo.

echo Iniciando servidor de desarrollo Vite...
echo Frontend estara disponible en:
echo   - Local:   http://localhost:5173
echo   - Red LAN: http://%IP%:5173
echo.
echo Dispositivos en tu red pueden acceder usando:
echo   http://%IP%:5173
echo.
echo Presiona Ctrl+C para detener el servidor
echo.

REM Ejecutar Vite en modo desarrollo
npm run dev
