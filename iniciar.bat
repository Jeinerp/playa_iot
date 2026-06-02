@echo off
title Playa IoT - Lanzador de Servidores
echo ===================================================
echo             SISTEMA DE MONITOREO PLAYA IoT         
echo ===================================================
echo.

echo [+] Iniciando el servidor Backend (Django) en una nueva ventana...
start "Playa IoT - Backend" cmd /k "cd backend && venv\Scripts\python manage.py runserver 0.0.0.0:8000"

echo [+] Iniciando el servidor Frontend (Vite) en una nueva ventana...
start "Playa IoT - Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ===================================================
echo [+] Servidores iniciados con exito!
echo     - Backend: http://127.0.0.1:8000
echo     - Frontend (Vite): http://localhost:5173
echo.
echo [+] Credenciales de Administrador para pruebas:
echo     - Usuario: admin
echo     - Contrasena: admin123
echo ===================================================
echo.
pause
