# 1. OpenRouter Key Pool and SQLite State Persistence

Date: 2026-11-20

## Status
Accepted

## Context
During high-concurrency provincial workshop hackathons (100+ concurrent attendees), individual LLM API keys hit HTTP 429 Rate Limits and browser-local state prevented cross-device collaboration when adding coffee groups and submitting project proposals.

## Decision
1. **Multi-Key Pool & Round-Robin Rotation**: Implemented in `openRouterKeyPoolService.ts` allowing comma/newline separated API keys with linear capacity scaling, automatic 60-second cooldown on 429 errors, jittered failover (1-3s), and expanded 45,000ms timeout.
2. **Dual Server Synchronization**: Implemented unified SQLite endpoints (`/api/pilot-sqlite/*`) in both `vite.config.ts` (dev) and `server.mjs` (production Node 22+ `DatabaseSync`) ensuring persistence of participants, hackathon projects, and dynamic coffee groups (`pilot_coffee_groups`).
3. **Deployment**: Deployed on Coolify (`https://workshop.addpay.in.th`) with automatic database volume mounting and health checks.

## Consequences
- Workshops scale seamlessly without rate-limit disruptions.
- Coffee groups and project submissions added by any participant or admin are immediately visible to all users across all devices.
