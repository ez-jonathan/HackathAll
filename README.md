# ⚡ HackathAll: The Universal Hackathon Repository
> **The zero-friction, agent-native hackathon foundation engineered to maximize speed-to-demo, slash scope, and impress judges in 24-hour sprints.**

Built for human engineers and autonomous coding agents (**Claude Code**, **Antigravity**, **OpenAI Codex**, **Cursor**, **Windsurf**) integrated with the **GSD (Get Shit Done)** scope-slashing framework and **CodeRabbit**.

---

## 🚀 Instant Quickstart (Under 60 Seconds)

### 1. Initialize Stack & Synthetic Mock Data
```bash
# Clone and enter the repository
cd HackathAll

# Hydrate realistic demo data (Fintech, HealthTech, AI Agent telemetry)
npm run seed
```

### 2. Scaffold Your Preferred Stack
```bash
# Option A: Fullstack Next.js App Router + Tailwind + shadcn/ui
npm run sync:fullstack

# Option B: Lightweight Python FastAPI AI microservice in /api
npm run sync:fastapi

# Option C: Pull essential dark-theme shadcn/ui primitives
npm run sync:shadcn
```
*(On Windows PowerShell, run `.\scripts\sync-tools.ps1 -TargetStack fullstack`)*

### 3. Launch with Zero API Keys (Offline-First Guarantee)
```bash
# Copy pre-configured mock environment
cp .env.example .env.local

# Launch dev server (http://localhost:3000)
npm run dev
```

Visit [`http://localhost:3000`](http://localhost:3000) — the entire Happy Path runs offline with mock fallbacks even if stage Wi-Fi drops.

---

## 🧠 Why This Repository Wins Hackathons

| Hackathon Pain Point | How HackathAll Solves It |
| :--- | :--- |
| **API Keys Expire or Fail on Stage** | **Automatic Mock Fallback (`integrations/`)**: Drop-in wrappers for ElevenLabs, Supabase, Twilio, and Resend with sub-500ms cascading synthetic fallbacks if keys are absent or rate limits hit. |
| **Empty or Fake-Looking Dashboards** | **Synthetic Data Hydrator (`seed-demo-data.ts`)**: Auto-generates human-readable ledgers, patient telemetry, and AI traces into `data/seed.json` and `public/mock/seed.json`. |
| **Agents Overengineer & Bloat Code** | **Universal Agent Playbook (`CLAUDE.md`)**: Enforces strict 3-minute judge demo bounds, bans non-essential auth/billing, and mandates atomic 1–3 file edits. |
| **PRs Blocked by Nitpicky Reviews** | **Tailored CodeRabbit (`.coderabbit.yaml`)**: PR audit configured specifically for hackathons: flags fatal build errors and leaked keys; silences style pedantry. |
| **Scope Creep Destroys Velocity** | **GSD Specification (`.github/GSD_SPEC.md`)**: Slashes feature lists into exactly 3 agent-executable milestones (A: Shell, B: Engine, C: Demo Loop). |
| **Rushed Devpost Writeups** | **Automated Devpost Generator (`generate-devpost.js`)**: Analyzes git commits, dependencies, and GSD specs to output a complete, formatted writeup. |
| **Stage Wi-Fi Disaster** | **Pre-Submission Health Check (`audit-judge.js`)**: Validates secret hygiene, live deployment links, and offline backup video before submission. |

---

## 📁 Repository Architecture

```text
HackathAll/
├── .cursorrules               # Fast agent instructions for Cursor / Codex
├── CLAUDE.md                  # Master playbook for Claude Code & Antigravity
├── agent-rules.md             # Universal agent symlink / alias
├── .coderabbit.yaml           # Hackathon-tuned PR review guardrails
├── .devcontainer/             # 1-Click cloud dev container (VS Code & Codespaces)
│   └── devcontainer.json
├── .github/
│   └── GSD_SPEC.md            # Scope-slashing & 3-deliverable blueprint
├── .env.example               # Zero-friction environment template (mock-first)
├── .gitignore                 # Leak-proof git exclusion list
├── package.json               # Root scripts & health-check runner
├── data/
│   └── seed.json              # Hydrated synthetic demo database
├── public/
│   └── mock/seed.json         # Client-side static mock database
├── integrations/              # Drop-in sponsor API wrappers with mock fallbacks
│   ├── voice-elevenlabs.ts    # Streaming voice synthesis & Web Audio fallback
│   ├── auth-db-supabase.ts    # Mockable Supabase CRUD & Judge Session manager
│   ├── comms-twilio.ts        # SMS / WhatsApp notification wrapper
│   ├── resend.ts              # Transactional email sender & HTML template simulator
│   └── index.ts               # Unified export hub
├── presentation/              # Pitch deck & judge defense resources
│   ├── PITCH_PLAYBOOK.md      # The winning 3-minute pitch structure (0:00 to 3:00)
│   ├── SLIDE_DECK_TEMPLATE.md # Slide-by-slide outline ready for Pitch/Gamma
│   └── DEMO_SCRIPT.md         # 180-second click-through presenter script
├── scripts/
│   ├── sync-tools.sh          # 1-Click bash stack bootstrapper (Linux/macOS)
│   ├── sync-tools.ps1         # Native Windows PowerShell bootstrapper
│   ├── record-demo.sh         # Cross-platform ffmpeg screen recorder (MP4 + GIF)
│   ├── record-demo.ps1        # Windows screen recorder helper
│   ├── seed-demo-data.ts      # Synthetic data hydrator (Fintech, Health, Agents)
│   └── generate-devpost.js    # Git & GSD-driven automated Devpost writeup generator
└── tools/
    └── audit-judge.js         # Pre-submission secret scanner & judge checklist
```

---

## 🛠️ Pluggable Integrations Usage

All integrations automatically detect `NEXT_PUBLIC_MOCK_MODE=true` or missing API keys, returning realistic mock data with zero runtime crashes:

```typescript
import { elevenlabs, supabase, twilio, resend } from '@/integrations';

// 1. Bypass all logins with 1-click Judge Mode
const judgeSession = supabase.getJudgeSession();

// 2. Query or mutate data (backed by seed.json if Supabase is unset)
const { data: transactions } = await supabase.select('transactions');

// 3. Synthesize streaming speech
const { audioUrl, durationSeconds } = await elevenlabs.synthesize({
  text: "Hello judges! Analysis is complete."
});

// 4. Send SMS & Email alerts
await twilio.sendSMS({ to: '+15550192', body: 'AI alert triggered' });
await resend.send({ to: 'judge@apex.io', subject: 'Your Report is Ready' });
```

---

## ⚡ Master Command Suite

```bash
# Development & Data
npm run seed              # Hydrate synthetic demo data into data/seed.json
npm run dev               # Start local dev server (http://localhost:3000)
npm run mock              # Force offline mock mode with simulated responses

# Scaffolding
npm run sync:fullstack    # Bootstrap Next.js App Router + Tailwind
npm run sync:fastapi      # Generate Python AI microservice in /api
npm run sync:shadcn       # Install dark-theme shadcn/ui components

# Pitch, Recording & Submission
npm run record            # Record screen to presentation/demo.mp4 & demo.gif
npm run devpost           # Auto-generate DEVPOST_SUBMISSION.md writeup
npm run audit             # Run pre-submission judge criteria & secret audit
```

---

## 🔍 Pre-Submission Health Check

Before submitting to Devpost or taking the stage, run the automated judge audit:

```bash
npm run audit
# or: node tools/audit-judge.js
```

This verifies:
1. **Secret Hygiene**: Scans for leaked OpenAI, Gemini, Anthropic, or AWS keys.
2. **Offline Fallbacks**: Confirms `data/seed.json` and mock fallbacks are active.
3. **Judge Criteria**: Ensures pitch playbook, live demo links, and screen recording backups are present.
