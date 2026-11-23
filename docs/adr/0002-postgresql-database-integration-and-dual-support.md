# 2. PostgreSQL Database Integration and Dual-Engine Persistence

Date: 2026-11-22

## Status
Accepted

## Context
As the MDC Workshop and Regional Hackathon system expanded, storing operational data exclusively in a local SQLite file within ephemeral container storage risked data isolation and concurrency bottlenecks under multi-user regional workloads. A dedicated PostgreSQL 16 instance (`pg-mdc`) was provisioned on Coolify.

## Decision
1. **Target PostgreSQL Database `DB-MDC`**: Set default PostgreSQL database to `DB-MDC`. On startup, `server.mjs` automatically checks and creates `CREATE DATABASE "DB-MDC"` if it does not already exist, and connects the primary connection pool directly to `DB-MDC`.
2. **Activity Section SQLite Deprecation**: Fully migrated all activity workflows (Step 1 Registration `pilot_agency_registrations`, Step 2 Coffee Groups `pilot_coffee_groups`, Step 3-4 Criteria `pilot_hackathon_criteria`, Step 5 Hackathon Submissions & Display `pilot_hackathon_projects`) to run exclusively on PostgreSQL `DB-MDC`. Retired SQLite for the activity section.
3. **Dedicated Activity API Routing**: Routed all activity operations through `/api/activity/*` while maintaining backwards-compatible aliases for legacy `/api/pilot-sqlite/*` endpoints. All responses return `database: 'DB-MDC'` and `dbPath: 'PostgreSQL 16 (DB-MDC)'`.
4. **Coolify Cloud Integration**: Connected `mdc-workshop` application on Coolify to database `DB-MDC` via `DATABASE_URL=postgres://postgres:tti0bWT64mYT94xxbFjME6GJjwUOni8d@8vmtvp2j0b5l0ghdpmmwebn9:5432/DB-MDC`.
5. **Container Build Enhancement**: Updated `Dockerfile` Stage 2 runner to copy `node_modules` for native PostgreSQL `pg` driver support.

## Consequences
- Enterprise-grade relational database capabilities with concurrent connections.
- Persistent cross-deployment storage unaffected by container rebuilds.
- Frictionless local development remains preserved via zero-config SQLite fallback.
