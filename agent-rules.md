# ⚡ UNIVERSAL HACKATHON AGENT PLAYBOOK (agent-rules.md)
> **Mirror File of CLAUDE.md**: Standard ruleset for AI Coding Assistants (Cursor, Antigravity, Claude Code, OpenAI Codex, Windsurf, GitHub Copilot).
> Refer to [CLAUDE.md](file:///C:/Users/Wilfred/Desktop/HackathAll/CLAUDE.md) for full context, workflow protocols, and invariants.

## 🎯 Executive Summary for Autonomous Agents

1. **Mission**: Build and ship a functioning, visually impressive 3-minute judge demo within 24 hours.
2. **Cardinal Priority**: Speed-to-Demo > Architectural Purity.
3. **Happy Path First**: Build the exact sequence of clicks the judge will witness. Postpone or slash everything else.
4. **Zero Downtime Guarantee**:
   - Never let an API key absence or rate limit break the user flow.
   - All external calls must have sub-500ms realistic mock fallbacks (`NEXT_PUBLIC_MOCK_MODE=true`).
5. **Aesthetics Count**: Dark theme (`bg-slate-950`), Lucide icons, skeleton loaders (`animate-pulse`), toast notifications (`sonner`).
6. **Agent Guardrails**:
   - Touch only 1–3 files per turn.
   - Run verification (`npm run build` or `node tools/audit-judge.js`) before marking tasks complete.
   - Proactively slash scope when facing complex dependencies or upstream API blocks.
