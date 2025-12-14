@echo off
echo ========================================
echo   DEMARRAGE PLATEFORME KOUNDOUL
echo ========================================
echo.

echo [1/2] Demarrage du BACKEND (port 5000)...
start "Koundoul Backend" cmd /k "cd backend && node server.js"
timeout /t 3 /nobreak >nul

echo [2/2] Demarrage du FRONTEND (port 3000)...
start "Koundoul Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo   PLATEFORME EN COURS DE DEMARRAGE
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Appuyez sur une touche pour fermer cette fenetre...
pause >nul









