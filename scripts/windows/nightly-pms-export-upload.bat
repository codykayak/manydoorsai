@echo off
REM Upload tonight's Yardi / PMS rent-roll CSV to ManyDoors AI.
REM
REM 1) Copy this file's folder path, edit EXPORT_DIR below to your PMS export folder.
REM 2) Set PORTFOLIO_SYNC_API_KEY once (same key as Settings -> PMS nightly sync).
REM 3) Schedule in Task Scheduler: daily at 6:15 PM, after Yardi exports at 6:00 PM.

setlocal
cd /d "%~dp0\..\.."

if "%PORTFOLIO_SYNC_API_KEY%"=="" (
  echo ERROR: Set PORTFOLIO_SYNC_API_KEY first.
  echo   setx PORTFOLIO_SYNC_API_KEY "your-key-from-settings"
  exit /b 1
)

REM === EDIT THIS: folder where Yardi drops the nightly CSV ===
if "%EXPORT_DIR%"=="" set "EXPORT_DIR=C:\YardiExports"

if not exist "%EXPORT_DIR%" (
  echo ERROR: Export folder not found: %EXPORT_DIR%
  echo Create the folder or set EXPORT_DIR to your PMS export path.
  exit /b 1
)

echo Uploading newest CSV/XLSX from %EXPORT_DIR% ...
node scripts\nightly-pms-export-upload.mjs
exit /b %ERRORLEVEL%
