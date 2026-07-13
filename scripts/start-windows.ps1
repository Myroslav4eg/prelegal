$ErrorActionPreference = "Stop"
Set-Location "$PSScriptRoot\.."

docker compose up --build -d
Write-Host "Backend available at http://localhost:8000"
