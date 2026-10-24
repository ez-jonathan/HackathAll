# PowerShell bootstrap equivalent for Windows environments
param (
    [string]$TargetStack = "fullstack"
)

Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host " ⚡ HACKATHON UNIVERSAL BOOTSTRAPPER (sync-tools.ps1)" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan

switch ($TargetStack.ToLower()) {
    "fullstack" {
        Write-Host "[*] Checking Next.js App Router configuration..." -ForegroundColor Green
        if (-not (Test-Path "package.json")) {
            npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --skip-install
            Write-Host "[✓] Next.js structure initialized." -ForegroundColor Green
        } else {
            Write-Host "[!] package.json already exists. Skipping root scaffolding." -ForegroundColor Yellow
        }
        Write-Host "[*] Installing essential hackathon UI packages..." -ForegroundColor Green
        npm install lucide-react clsx tailwind-merge sonner
    }
    "fastapi" {
        Write-Host "[*] Setting up lightweight FastAPI microservice scaffold..." -ForegroundColor Green
        if (-not (Test-Path "api")) { New-Item -ItemType Directory -Path "api" }
        @'
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(title="Hackathon AI Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health():
    mock_mode = os.getenv("MOCK_MODE", "true").lower() == "true"
    return {"status": "ok", "mock_mode": mock_mode}

@app.post("/api/generate")
def generate(payload: dict):
    if os.getenv("MOCK_MODE", "true").lower() == "true":
        return {
            "result": f"Mock result for: {payload.get('prompt', 'default')}",
            "is_mock": True
        }
    return {"result": "Live AI generation placeholder", "is_mock": False}
'@ | Out-File -FilePath "api/index.py" -Encoding utf8

        @'
fastapi>=0.110.0
uvicorn>=0.28.0
pydantic>=2.0.0
python-dotenv>=1.0.0
'@ | Out-File -FilePath "api/requirements.txt" -Encoding utf8
        Write-Host "[✓] FastAPI scaffold created in api/" -ForegroundColor Green
    }
    default {
        Write-Host "[X] Unknown stack: $TargetStack" -ForegroundColor Red
        Write-Host "Usage: .\scripts\sync-tools.ps1 -TargetStack [fullstack|fastapi]"
    }
}

if (-not (Test-Path ".env.local") -and (Test-Path ".env.example")) {
    Copy-Item ".env.example" ".env.local"
    Write-Host "[✓] Generated .env.local from .env.example" -ForegroundColor Green
}
Write-Host "=====================================================" -ForegroundColor Green
Write-Host " 🚀 Ready to code! Launching Happy Path.             " -ForegroundColor Green
Write-Host "=====================================================" -ForegroundColor Green
