@echo off
echo ========================================
echo Testing Inbound Telemetry (Local)
echo ========================================
echo.

set BACKEND_URL=http://localhost:3000
node test_mock_engine.js
