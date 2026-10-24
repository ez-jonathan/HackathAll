#!/usr/bin/env bash
# ==============================================================================
# sync-tools.sh - 1-Click Hackathon Tool & Template Bootstrapper
# ==============================================================================
# Pulls curated starter templates, UI components, and boilerplates via npx/degit
# without keeping repo bloat or unnecessary git histories.
# ==============================================================================

set -euo pipefail

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}=====================================================${NC}"
echo -e "${CYAN} ⚡ HACKATHON UNIVERSAL BOOTSTRAPPER (sync-tools.sh) ${NC}"
echo -e "${CYAN}=====================================================${NC}"

TARGET_STACK="${1:-fullstack}"

case "$TARGET_STACK" in
  fullstack|nextjs)
    echo -e "${GREEN}[*] Scaffolding Next.js App Router + Tailwind + shadcn/ui...${NC}"
    if [ ! -f "package.json" ]; then
      npx create-next-app@latest . \
        --typescript \
        --tailwind \
        --eslint \
        --app \
        --src-dir \
        --import-alias "@/*" \
        --use-npm \
        --skip-install
      echo -e "${GREEN}[✓] Next.js structure initialized.${NC}"
    else
      echo -e "${YELLOW}[!] package.json already exists. Skipping root scaffolding.${NC}"
    fi

    echo -e "${GREEN}[*] Installing essential hackathon UI packages...${NC}"
    npm install lucide-react clsx tailwind-merge sonner
    ;;

  fastapi|python)
    echo -e "${GREEN}[*] Setting up lightweight FastAPI microservice scaffold...${NC}"
    mkdir -p api
    cat << 'EOF' > api/index.py
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
    # Automatic mock fallback
    if os.getenv("MOCK_MODE", "true").lower() == "true":
        return {
            "result": f"Mock result for: {payload.get('prompt', 'default')}",
            "is_mock": True
        }
    return {"result": "Live AI generation placeholder", "is_mock": False}
EOF
    cat << 'EOF' > api/requirements.txt
fastapi>=0.110.0
uvicorn>=0.28.0
pydantic>=2.0.0
python-dotenv>=1.0.0
EOF
    echo -e "${GREEN}[✓] FastAPI scaffold created in /api${NC}"
    ;;

  shadcn)
    echo -e "${GREEN}[*] Initializing shadcn/ui components...${NC}"
    npx shadcn@latest init -y -d
    npx shadcn@latest add button card dialog input skeleton badge
    echo -e "${GREEN}[✓] Essential shadcn components installed.${NC}"
    ;;

  *)
    echo -e "${RED}[X] Unknown stack: $TARGET_STACK${NC}"
    echo "Usage: ./scripts/sync-tools.sh [fullstack|fastapi|shadcn]"
    exit 1
    ;;
esac

# Create .env.local if not present
if [ ! -f ".env.local" ] && [ -f ".env.example" ]; then
  cp .env.example .env.local
  echo -e "${GREEN}[✓] Generated .env.local from .env.example${NC}"
fi

echo -e "${GREEN}=====================================================${NC}"
echo -e "${GREEN} 🚀 Ready to code! Launching Happy Path.             ${NC}"
echo -e "${GREEN}=====================================================${NC}"
