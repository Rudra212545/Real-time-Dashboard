@echo off
echo ========================================
echo Testing Inbound Telemetry (Render)
echo ========================================
echo.

set BACKEND_URL=https://real-time-dashboard-backend-test.onrender.com
node test_mock_engine.js
