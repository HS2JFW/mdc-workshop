# AGENTS.md

Instructions, conventions, and operational skills for AI agents and developers working on the **MDC Hackathon & AI Agent Summary Map** codebase.

---

## Project Overview

This project is an interactive web-based system for the **Moral Development Center (MDC / ศูนย์คุณธรรม)**. It supports regional Hackathon workshops (4 Regions of Thailand), multi-tier stakeholder alignment (3 Participant Levels: Youth/Innovator, Community Driver, Policy/Executive), 5 Moral Virtues assessment, Coffee Group collaborative ideation, and automated AI evaluation via an **OpenRouter API Key Pool**.

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Modern Screenshot, Recharts, docx/jspdf/xlsx.
- **Backend / Persistence**: Node.js (`server.mjs`), Dual Database Engine supporting **PostgreSQL 16** (`pg`) and local **SQLite** (`data/pilot_activities_4regions.sqlite`), REST API endpoints for projects, coffee groups, and workshop participants.
- **AI Engine**: OpenRouter LLM API with round-robin key rotation, exponential backoff, jitter, and failover across multiple keys.
- **Deployment**: Dockerized with Coolify self-hosted PaaS.

---

## Agent skills

### Issue tracker

GitHub Issues tracked at `HS2JFW/mdc-workshop`. See `docs/agents/issue-tracker.md`.

### Triage labels

Canonical five-label triage vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout anchored to `GLOSSARY.md` at project root and Architecture Decision Records in `docs/adr/`. See `docs/agents/domain.md`.

---

## Available Skills (Installed in `.agents/skills/`)

The workspace is loaded with **Matt Pocock's Skills suite** plus domain-specific evaluation skills:

| Skill | Category | Description |
|---|---|---|
| `tdd` | Engineering | Test-Driven Development workflow (Red-Green-Refactor) using Vitest/Jest. |
| `code-review` | Engineering | Comprehensive review for code quality, architectural integrity, and edge cases. |
| `diagnosing-bugs` | Engineering | Systematic root cause analysis and bug fixing with regression prevention. |
| `implement` | Engineering | Autonomous execution of technical specifications or tickets. |
| `codebase-design` | Engineering | Architectural and API design adhering to clean domain boundaries. |
| `wayfinder` | Engineering | Fast repo indexing and code navigation across components and services. |
| `to-spec` | Engineering | Convert loose requirements or tickets into rigorous engineering specifications. |
| `to-tickets` | Engineering | Break down feature specifications or epics into actionable tickets. |
| `pr` | Engineering | Generate high-quality Pull Requests with structured context and summaries. |
| `grill-me` | Engineering / Productivity | Interactive architectural/design interview to align requirements before coding. |
| `domain-modeling` | Engineering | Model entities, value objects, and business workflows aligned with `GLOSSARY.md`. |
| `moral-behavioral-project-evaluator` | Domain | Moral & Behavioral project assessment using the 5 Virtues and Behavioral Science. |

---

## Core Engineering Conventions

1. **Strict TypeScript**: Always maintain valid TypeScript. Avoid `any` when possible. Run `npx tsc -b` to verify types.
2. **Domain Ubiquitous Language**: Always consult [`GLOSSARY.md`](file:///c:/Users/Dragomo/Desktop/work/_AI%20Agent%20Summary%20Map/_Map%20Summary%20Project%20Openrouter/GLOSSARY.md) before naming new entities, types, database columns, or UI components.
3. **Architecture Decisions**: When introducing architectural changes (like caching, database migrations, or key rotation), document them in [`docs/adr/`](file:///c:/Users/Dragomo/Desktop/work/_AI%20Agent%20Summary%20Map/_Map%20Summary%20Project%20Openrouter/docs/adr/).
4. **Resilient AI Calling**: LLM calls through `openRouterService.ts` must always leverage the round-robin key pool and exponential backoff.
5. **Database Sync**: When adding state that must be shared across workshop participants (e.g., Coffee Groups, Workshop Submissions), persist both to SQLite via REST endpoints and fallback to local state gracefully.
