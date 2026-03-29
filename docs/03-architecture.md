# stemma — Architecture Decisions

## Tech Stack

### Backend

| Concern   | Choice                                   | Why                                                                               |
| --------- | ---------------------------------------- | --------------------------------------------------------------------------------- |
| Runtime   | Node.js 24+                              | Modern, LTS, native ESM                                                           |
| Language  | TypeScript                               | Type safety, shared types with frontend                                           |
| Framework | Effect + @effect/platform                | Type-safe services, dependency injection, schema validation, HTTP API             |
| Database  | PostgreSQL                               | Relational model fits family trees perfectly (joins, constraints, recursive CTEs) |
| DB access | Drizzle ORM                              | Type-safe, great migrations, works with Effect via adapters                       |
| Auth      | Email + password, bcrypt, session tokens | Simple, no external dependency                                                    |

### Frontend

| Concern    | Choice             | Why                                                                             |
| ---------- | ------------------ | ------------------------------------------------------------------------------- |
| Framework  | React 19 (SPA)     | Mature, huge ecosystem                                                          |
| Routing    | TanStack Router    | Type-safe routing, file-based routes, loader pattern                            |
| Styling    | Tailwind CSS       | Utility-first, fast iteration                                                   |
| Components | shadcn/ui          | Accessible, composable, own the code                                            |
| API client | Effect HTTP client | Shared schemas with backend — typed requests/responses, error handling for free |
| Tree viz   | React Flow + elkjs | Node graph editor (zoom/pan/custom nodes) + hierarchical layout engine          |

### Monorepo

| Concern             | Choice        | Why                                                                  |
| ------------------- | ------------- | -------------------------------------------------------------------- |
| Package manager     | pnpm          | Fast, strict, workspace support                                      |
| Build orchestration | Turborepo     | Caching, parallel builds, task dependencies                          |
| Shared packages     | `@stemma/api` | Single source of truth for API contract (schemas, errors, endpoints) |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                   Frontend (SPA)                │
│  React + TanStack Router + Tailwind + shadcn    │
│  Effect HTTP client (typed from @stemma/api) │
└──────────────────────┬──────────────────────────┘
                       │ HTTP (JSON)
                       ▼
┌─────────────────────────────────────────────────┐
│                Backend (Effect)                  │
│  @effect/platform HttpApi                        │
│  ┌─────────────┐ ┌──────────┐ ┌──────────────┐ │
│  │ Presentation│ │ Domain   │ │ Infrastructure│ │
│  │ (routes,    │ │ (models, │ │ (DB, auth,   │ │
│  │  groups,    │ │  rules,  │ │  file store) │ │
│  │  middleware) │ │  services)│ │              │ │
│  └─────────────┘ └──────────┘ └──────────────┘ │
└──────────────────────┬──────────────────────────┘
                       │
                       ▼
              ┌─────────────────┐
              │   PostgreSQL    │
              └─────────────────┘
```

---

## Key Decisions

### 1. SPA, not SSR

A single-page app (no Next.js / Remix / server components).

**Why:**

- The app is interactive (tree manipulation, drag, zoom) — not content/SEO driven
- Simpler deployment: static files + API server
- Backend is already Effect-based — no need for a Node.js rendering server in front
- TanStack Router gives us route-level data loading without SSR

### 2. Shared API package (`@stemma/api`)

The `packages/api` package defines the full API contract: endpoints, request/response schemas, errors.

- Backend **implements** it (provides handlers)
- Frontend **consumes** it (typed HTTP client)
- Changes to the API break the build on both sides immediately — no drift

### 3. Effect end-to-end

Using Effect on both backend and frontend:

- Shared `Schema` types = no manual serialization/deserialization
- API client gets typed errors (can pattern-match on `UnauthorizedError` vs `NotFoundError`)
- Consistent error handling model across the stack

### 4. Backend layered architecture

Three layers, enforced by module structure:

- **Presentation** (`src/presentation/`): HTTP routes, groups, middleware — no business logic
- **Domain** (`src/domain/`): Entities, schemas, business rules, service interfaces (as Effect tags)
- **Infrastructure** (`src/infrastructure/`): Database queries, auth implementation, external services

Dependencies flow inward: Presentation → Domain ← Infrastructure. Domain never imports from the other two.

### 5. Auth: session tokens stored server-side

- On login: hash password with bcrypt, create a session row in DB, return token
- On requests: Authorization header with bearer token, look up session in DB
- On logout: delete session row
- No JWT — sessions are revocable, no token refresh complexity

**Why not JWT:**

- Small user base, no need for stateless scaling
- Revocation is instant (delete the row)
- Simpler mental model

---

## Tree Visualization (Phase 2)

**Choice: React Flow (`@xyflow/react`) + elkjs**

- **React Flow** provides: zoom/pan, minimap, controls, custom React node components (full JSX — use Tailwind/shadcn inside nodes), edge rendering, drag-and-drop, built-in interaction handling
- **elkjs** provides: hierarchical/layered layout algorithm, compound nodes (for couples), generation alignment, sophisticated edge routing
- Family-specific logic (couple nodes, parent-child connectors, generation rows) is built on top
- MIT licensed (React Flow core) + EPL-2.0 (elkjs) — both compatible with open source

**Why this over alternatives:**

- React Flow has a large community, active full-time team, and native React DX
- elkjs is the most sophisticated open-source layout engine (university-backed, supports compound nodes)
- Custom nodes = full React components, so tree cards use the same design system as the rest of the app
- If elkjs layout proves insufficient for complex family structures, the layout engine can be swapped for `relatives-tree` (family-aware) while keeping React Flow for rendering

---

## Database Access

**Choice: Drizzle ORM**

- Type-safe schema definition and queries
- Excellent migration system (`drizzle-kit`)
- Supports PostgreSQL natively
- Supports recursive CTEs (needed for tree traversal queries)
- Bridge to Effect via wrapping Drizzle calls in `Effect.tryPromise`

---

## Deployment

Not a priority now, but the target setup is decided.

**Docker Compose** with 3 services:

```
┌─────────────────────────────────────────────────┐
│                   Host / VPS                     │
│                                                  │
│  ┌───────────┐    ┌───────────┐    ┌──────────┐ │
│  │   Caddy   │───▶│    API    │    │ Postgres │ │
│  │ (reverse  │    │  (Effect  │───▶│          │ │
│  │  proxy +  │    │  Node.js) │    │          │ │
│  │  static   │    └───────────┘    └──────────┘ │
│  │  frontend)│                                   │
│  └───────────┘                                   │
└─────────────────────────────────────────────────┘
```

- **Caddy**: Reverse proxy + serves the static frontend (React SPA). Automatic HTTPS via Let's Encrypt.
- **API**: Effect/Node.js backend container
- **PostgreSQL**: Database container with a persistent volume

Caddy routes:

- `/api/*` → proxied to API container
- `/*` → serves static frontend files (with SPA fallback to `index.html`)
