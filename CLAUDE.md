# ⚡ UNIVERSAL HACKATHON AGENT PLAYBOOK
> **Target Audience**: Autonomous AI Agents (Claude Code, Antigravity, OpenAI Codex, Cursor) & Human Engineers
> **Mission**: Build, polish, and ship a judge-ready, demoable MVP within a 24-hour sprint.
> **The Golden Law**: **Speed-to-Demo > Architectural Perfection.** Working code on stage beats a spotless theoretical architecture every single time.

---

## 🏆 The 5 Hackathon Invariants (Non-Negotiable)

### 1. The 3-Minute Judge Rule
- Every feature built MUST be visible, clickable, or impactful during the 3-minute judge demonstration.
- **Strictly Banned**:
  - Account recovery, complex password strength algorithms, email verification flows.
  - Multi-tenant permission management, team invite modals, billing/Stripe subscriptions.
  - Pixel-perfect edge-case error validation for non-demo paths.
- **Mandatory Inclusion**:
  - A prominent 1-click **"Demo Mode" / "Fill Sample Data"** button that populates realistic values and bypasses login barriers immediately.

### 2. Fail-Safe Mock Fallback Architecture
- **Never allow a missing API key, rate limit (429), or flaky Wi-Fi to ruin a live demo.**
- Every external integration (LLMs, Databases, Voice, SMS, Third-Party APIs) MUST implement automatic fallback:
  ```typescript
  const isMock = process.env.NEXT_PUBLIC_MOCK_MODE === "true" || !apiKey;
  if (isMock) {
    return getRealisticMockResponse(); // Sub-500ms delay + realistic payload
  }
  ```
- If an API call fails during execution, **catch the error gracefully and return mock data** rather than crashing the UI with an uncaught error boundary.

### 3. Pitch-Ready Aesthetics by Default
- Judges evaluate software with their eyes before their logic. Visual polish yields 50%+ of the judge's score.
- **Aesthetic Standards**:
  - Modern Dark Theme default (`bg-slate-950` / `zinc-900`, crisp subtle borders `border-white/10`).
  - Cohesive design system: Tailwind CSS, `clsx`, `tailwind-merge`, and `lucide-react` icons.
  - **Zero Empty States**: Use animated skeleton loaders (`animate-pulse`) during async queries. Never show a blank white screen.
  - Instant micro-feedback: Sonner/Toaster toasts on user actions ("Synced with ledger", "AI analysis complete").

### 4. Agent Execution Guardrails & Scope Slashing
- **Targeted Operations Only**: Before executing changes, explicitly specify the 1–3 files being touched. Do not perform global repository refactors.
- **Continuous Verification Loop**:
  - After modifying frontend code: run `npm run build` or `npm run lint`.
  - After backend modifications: test endpoints or verify types.
- **The 15-Minute Rule (Scope Slashing)**: If an agent or engineer is blocked on an API error or bug for >15 minutes, **slash the scope immediately**. Replace the broken dynamic subsystem with a high-fidelity synthetic mock and move on to the demo script.

### 5. Pitch & Demo Assets as First-Class Citizens
- Keep `pitch/DEMO_SCRIPT.md` and `presentation/PITCH_PLAYBOOK.md` in sync with codebase features.
- If a route changes or a UI step is altered, update the corresponding click-by-click instruction in the demo script immediately.

---

## 🏗️ Stack Standards & Conventions

| Domain | Recommended Hackathon Stack | Zero-Friction Hackathon Replacement |
| :--- | :--- | :--- |
| **Frontend** | Next.js 14/15 (App Router, TypeScript) | Pre-configured Tailwind + Lucide Icons |
| **UI Components** | shadcn/ui (Radix Primitives) | Ready-to-copy accessible primitives |
| **Backend** | Next.js Route Handlers (`app/api/*/route.ts`) | Optional Python FastAPI microservice (`api/index.py`) |
| **State Management** | URL Search Params (`nuqs`) or Zustand | Simple React state / Context for small apps |
| **Database** | Supabase (PostgreSQL) | Local JSON store (`data/seed.json`) via `integrations/auth-db-supabase.ts` |
| **Synthetic Data** | `scripts/seed-demo-data.ts` | Pre-hydrated fintech, healthcare, and agent data |
| **AI Orchestration** | Official SDKs + Mock Streaming fallback | Pre-baked token streaming responses |

---

## ⚡ Agent Operational Rules (For Autonomous Pair Programming)

When you are acting as an autonomous agent in this repository, follow these precise operational protocols:

```
┌──────────────────────────────────────────────────────────────┐
│                  AGENT WORKFLOW PROTOCOL                     │
├──────────────────────────────────────────────────────────────┤
│ 1. Read .github/GSD_SPEC.md to understand the current target │
│ 2. Announce the exact 1-3 files you will create or edit      │
│ 3. Implement the Happy Path logic with fail-safe mock stubs  │
│ 4. Run `npm run build` or `node tools/audit-judge.js`         │
│ 5. If build passes -> Update DEMO_SCRIPT.md and commit       │
│ 6. If build fails  -> Fix strictly within the modified scope │
└──────────────────────────────────────────────────────────────┘
```

### Prohibited Agent Behaviors
1. **DO NOT** create elaborate unit test suites (`*.spec.ts`, `*.test.tsx`) unless specifically commanded. Verification is done via `npm run build` and visual runtime checks.
2. **DO NOT** rewrite existing working code to satisfy aesthetic refactoring preferences or micro-optimizations.
3. **DO NOT** introduce external dependencies without checking if an existing utility or lightweight standard library solves the problem.
4. **DO NOT** leave placeholder `// TODO: Implement later` on the primary Happy Path. Provide working mock logic if the real service is pending.

---

## 📂 Repository Anatomy

```
HackathAll/
├── .devcontainer/             # 1-Click VS Code & GitHub Codespaces dev container
│   └── devcontainer.json
├── .github/
│   └── GSD_SPEC.md            # 24h scope-slashing and deliverable milestone spec
├── .coderabbit.yaml           # Hackathon-tuned PR review guardrails (no style pedantry)
├── .cursorrules               # Fast agent instructions for Cursor / Codex
├── CLAUDE.md                  # Master playbook for Claude Code & Antigravity (this file)
├── agent-rules.md             # Universal agent symlink / alias
├── .env.example               # Pre-populated template with NEXT_PUBLIC_MOCK_MODE=true
├── data/
│   └── seed.json              # Generated realistic mock database records
├── integrations/              # Drop-in sponsor API wrappers with automatic mock fallback
│   ├── voice-elevenlabs.ts    # Streaming voice synthesis & Web Audio fallback
│   ├── auth-db-supabase.ts    # Mockable Supabase CRUD & Judge Session manager
│   ├── comms-twilio.ts        # SMS / WhatsApp notification wrapper
│   ├── resend.ts              # Transactional email sender & HTML template simulator
│   └── index.ts               # Unified export hub
├── presentation/              # Pitch deck & judge defense resources
│   ├── PITCH_PLAYBOOK.md      # The winning 3-minute pitch structure (0:00 to 3:00)
│   ├── SLIDE_DECK_TEMPLATE.md # Slide-by-slide outline ready for Pitch/Gamma
│   └── DEMO_SCRIPT.md         # Click-by-click presenter cheat sheet
├── scripts/
│   ├── sync-tools.sh          # 1-Click stack scaffolder (Next.js / FastAPI / shadcn)
│   ├── sync-tools.ps1         # Windows PowerShell equivalent scaffolder
│   ├── record-demo.sh         # Cross-platform ffmpeg screen recorder (MP4 + GIF)
│   ├── record-demo.ps1        # Windows screen recorder helper
│   ├── seed-demo-data.ts      # Realistic data hydrator (Fintech, Health, Agents)
│   └── generate-devpost.js    # Git & GSD-driven automated Devpost writeup generator
└── tools/
    └── audit-judge.js         # Pre-submission health scanner (secrets, links, video)
```

---

## 🚀 Fast Workflow Commands

```bash
# 1. Install & Bootstrap Dependencies
npm install
npm run seed              # Hydrate synthetic demo data into data/seed.json

# 2. Local Development
npm run dev               # Run development server (http://localhost:3000)
npm run mock              # Force offline mock mode with simulated API responses

# 3. Fast Scaffolding
npm run sync:shadcn       # Pull essential shadcn/ui components
npm run sync:fastapi      # Generate Python AI microservice in /api

# 4. Presentation & Submission
npm run record            # Record screen to pitch/demo.mp4 and backup GIF
npm run devpost           # Auto-generate DEVPOST_SUBMISSION.md writeup
npm run audit             # Run pre-submission judge criteria & secret audit
```

---

## ⏱️ The 24-Hour Countdown Playbook

| Phase | Hours | Goal | Focus |
| :--- | :---: | :--- | :--- |
| **Phase 1** | 0 – 3 | **The Shell & Wow Factor** | Finalize `GSD_SPEC.md`. Scaffold UI shell. Dark theme + realistic mock data loaded. |
| **Phase 2** | 4 – 14 | **The Core Interactive Engine** | Wire primary interactive action (AI call, computation). Ensure mock fallback functions. |
| **Phase 3** | 15 – 19 | **The Judge Loop & Polish** | Add 1-click "Sample Data" button, toast confirmations, skeleton animations. |
| **Phase 4** | 20 – 22 | **Hard Freeze & Fail-Safe Video** | Code freeze! Disconnect Wi-Fi and verify full demo offline. Record `pitch/demo.mp4`. |
| **Phase 5** | 22 – 24 | **Devpost & Stage Prep** | Run `npm run devpost`. Rehearse 3-minute pitch 3 times using `pitch/DEMO_SCRIPT.md`. |
