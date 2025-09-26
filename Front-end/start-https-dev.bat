@echo off
echo ========================================
echo    تشغيل AppZajel مع HTTPS للتطوير
echo ========================================
echo.

echo [1/3] تشغيل السيرفر (Backend) على HTTPS...
start "Backend Server" cmd /k "cd back-end && npm run dev:https"
timeout /t 3 /nobreak >nul

echo [2/3] تشغيل الفرونت إند (Frontend) على HTTPS...
start "Frontend Server" cmd /k "npm run dev:https"
timeout /t 3 /nobreak >nul

echo [3/3] فتح المتصفح...
timeout /t 5 /nobreak >nul
start https://localhost:5173

echo.
echo ✅ تم تشغيل التطبيق بنجاح!
echo.
echo 🌐 الفرونت إند: https://localhost:5173
echo 🔧 السيرفر: https://localhost:3002
echo.
echo ⚠️  إذا ظهر تحذير أمان في المتصفح:
echo    اضغط "Advanced" ثم "Proceed to localhost"
echo.
pause
