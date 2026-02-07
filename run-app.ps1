# Quick launcher script to run the app from the shorter path location
# This avoids Windows path length limitations

Write-Host "Starting application from C:\dev\dashboard..." -ForegroundColor Green

# Check if the directory exists
if (-not (Test-Path "C:\dev\dashboard")) {
    Write-Host "Error: C:\dev\dashboard does not exist!" -ForegroundColor Red
    Write-Host "The project files should have been copied there." -ForegroundColor Yellow
    exit 1
}

# Check if node_modules exists, if not, install dependencies
if (-not (Test-Path "C:\dev\dashboard\node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    Set-Location "C:\dev\dashboard"
    npm install --legacy-peer-deps
}

# Navigate to the directory and run the dev server
Set-Location "C:\dev\dashboard"
Write-Host "Starting Next.js dev server..." -ForegroundColor Cyan
npm run dev
