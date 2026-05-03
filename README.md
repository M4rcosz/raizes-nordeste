# Raízes do Nordeste — Backend API

[![CI](https://github.com/M4rcosz/raizes-do-nordeste/actions/workflows/ci.yml/badge.svg)](https://github.com/M4rcosz/raizes-do-nordeste/actions/workflows/ci.yml)

REST API for a multi-unit restaurant ordering system. The platform powers menu
browsing, order management, payment processing, inventory control and a
customer loyalty program — across multiple business units (franchises).

> **Status:** the project is being built incrementally. The product catalog
> module is currently implemented; auth, orders, payments, inventory and
> loyalty modules are planned (see [Roadmap](#roadmap)).

---

## Table of Contents

- [Stack](#stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Local Development](#local-development)
- [Environment Variables](#environment-variables)
- [Database](#database)
- [API Reference](#api-reference)
- [Testing](#testing)
- [Code Quality](#code-quality)
- [Roadmap](#roadmap)
- [License](#license)

---

## Stack

| Technology  | Version | Role                          |
| ----------- | ------- | ----------------------------- |
| Node.js     | 22      | Runtime                       |
| NestJS      | 11      | HTTP framework / DI container |
| TypeScript  | 5.7     | Language                      |
| Prisma      | 7       | ORM and migration tool        |
| PostgreSQL  | 17      | Relational database           |
| Jest        | 30      | Unit and e2e testing          |
| Docker      | 29      | Containerization              |
| big.js      | 7       | Arbitrary-precision decimals  |

---

## Architecture

The codebase follows **Clean Architecture organized by bounded context** — each
business context owns its own four-layer stack, and dependencies point strictly
inwards (infrastructure → application → domain).

```
   ┌────────────────────────────────────────────────────────┐
   │                       API Layer                        │  HTTP edge
   │  (NestJS controllers, guards, pipes, exception filters)│
   └───────────────────────────┬────────────────────────────┘
                               │ depends on
   ┌───────────────────────────▼────────────────────────────┐
   │                    Application Layer                   │  Orchestration
   │            (Use Cases — one per business action)       │
   └───────────────────────────┬────────────────────────────┘
                               │ depends on
   ┌───────────────────────────▼────────────────────────────┐
   │                       Domain Layer                     │  Pure rules
   │  (Entities, value objects, repository interfaces)      │
   └───────────────────────────▲────────────────────────────┘
                               │ implemented by
   ┌───────────────────────────┴────────────────────────────┐
   │                  Infrastructure Layer                  │  Adapters
   │   (Prisma client, repositories, external integrations) │
   └────────────────────────────────────────────────────────┘
```

> **Heads-up — structural change mid-project (May 2026):** the codebase was
> refactored from a flat layout (`src/domain`, `src/infrastructure`,
> `src/modules/<feature>`) into a per-bounded-context layout
> (`src/modules/<context>/{domain,application,infrastructure}`). The flat
> shape worked while only one feature module existed, but the planned domain
> spans seven bounded contexts (`identity`, `business-units`, `inventory`,
> `orders`, `payments`, `promotions`, `loyalty`) and a global `domain/` would
> have ended up mixing entities from unrelated contexts. Moving the layered
> stack inside each context makes ownership explicit, keeps cross-context
> coupling visible (it has to cross a module boundary), and is the canonical
> DDD layout.

### Architectural Decisions

**1. Clean Architecture with NestJS pragmatism**
The `domain/` layer of each context contains pure TypeScript — no NestJS, no
Prisma, no framework imports. This keeps business rules portable and trivial
to unit test. Use cases, however, use `@Injectable()` so the DI container can
wire them up — this is a deliberate, accepted compromise for ergonomics.

**2. Repository Pattern**
Each context's `domain/repositories/` declares interfaces. The matching
`infrastructure/persistence/` provides Prisma-backed implementations. Use
cases depend on the interface through a `Symbol` injection token (e.g.
`PRODUCT_REPOSITORY`), which keeps the ORM swappable without touching domain
or application code.

**3. Use Cases as the application boundary**
Each business action is a single-purpose class with one `execute()` method.
This produces small, focused, easy-to-test units and prevents controllers
from accumulating logic.

**4. Domain Entities, never raw ORM models**
Repositories convert Prisma rows into rich domain entities (`Product`,
`BusinessUnitMenuItem`) before returning them. Controllers convert entities
into response DTOs (`ProductResponseDto`) before sending them over HTTP.
ORM models never leak across layer boundaries.

**5. Decimal-safe monetary values**
Money is represented as [`big.js`](https://github.com/MikeMcl/big.js) inside
the domain (avoiding IEEE-754 rounding errors) and as `Decimal(12, 2)` in
PostgreSQL. DTOs convert to `number` only at the HTTP edge.

**6. Errors model intent, not transport**
- `ProductsFetchException` (an application-layer error) wraps the underlying
  cause using the standard `Error.cause` option.
- `NotFoundException` (NestJS) is thrown when a resource is missing, so the
  framework converts it to `404 Not Found` automatically.

**7. `shared/` is the cross-context kernel**
Anything reused across two or more contexts (Prisma client lifecycle,
pagination primitives, future `Money`/`Email` value objects, global guards
and interceptors) lives in `src/shared/`. If something is used by only one
context, it stays inside that context.

---

## Project Structure

```
src/
├── main.ts                       ← Bootstrap: prefix /api, CORS, shutdown hooks
├── app.module.ts                 ← Root module wiring
├── shared/                       ← Cross-context kernel
│   ├── infrastructure/
│   │   └── prisma/               ← @Global() PrismaService + lifecycle
│   └── pagination/               ← Cursor-pagination types and DTO envelope
└── modules/                      ← One folder per bounded context
    └── business-units/           ← Products, Categories, Menu Items, Units
        ├── business-units.module.ts
        ├── domain/               ← Pure rules (no framework imports)
        │   ├── entities/         ← Product, BusinessUnitMenuItem
        │   └── repositories/     ← Interfaces + DI tokens
        ├── application/          ← Orchestration
        │   ├── use-cases/        ← One file per business action
        │   └── errors/           ← Application-layer errors (e.g. fetch wrappers)
        └── infrastructure/       ← Adapters
            ├── persistence/      ← Prisma repository implementations
            └── http/
                ├── controllers/  ← NestJS controllers
                └── dto/          ← Response DTOs (serialization only)
prisma/
├── schema.prisma                 ← Single source of truth for the database
├── seed.ts                       ← Idempotent seed for local dev
└── migrations/                   ← Versioned migration history
test/
└── app.e2e-spec.ts               ← End-to-end HTTP tests
```

> Future contexts (`identity`, `inventory`, `orders`, `payments`,
> `promotions`, `loyalty`) will follow the same internal shape under
> `src/modules/`.

---

## Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) **29+**
- [Node.js](https://nodejs.org/) **22+**
- WSL Ubuntu 24.04 (if on Windows)

### 1. Clone the repository

```bash
git clone https://github.com/M4rcosz/raizes-do-nordeste.git
cd raizes-do-nordeste
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
POSTGRES_USER=adminuser
POSTGRES_PASSWORD=your_password
POSTGRES_DB=raizes_do_nordeste
DATABASE_URL="postgresql://adminuser:your_password@localhost:5432/raizes_do_nordeste?schema=public"

NODE_ENV=development
PORT=3000
```

> ⚠️ `DATABASE_URL` uses `localhost` for local development. Inside Docker
> Compose, the `app` service overrides this variable so it points at the
> `db` service hostname.

### 3. Install dependencies and generate the Prisma client

```bash
npm install
npm run db:generate
```

### 4. Run the database and apply migrations

```bash
npm run db:up        # starts only the db service
npm run db:migrate   # applies pending migrations
npm run db:seed      # loads sample data
```

### 5. Start the full stack

```bash
docker compose up --build
```

On startup, the application container automatically:

1. Runs pending migrations (`prisma migrate deploy`)
2. Runs the database seed (`prisma db seed`)
3. Starts the NestJS server on port `3000`

The API is then available at **http://localhost:3000/api**.

---

## Local Development

```bash
# Start only the database
npm run db:up

# Start the application in watch mode
npm run start:dev
```

A one-shot helper that resets the local database, regenerates the client,
re-applies migrations, re-seeds and starts the watcher:

```bash
npm run devs
```

> ⚠️ `npm run devs` runs `db:down -v`, which **wipes the local database
> volume**. Never run it against any environment that holds data you care
> about.

---

## Environment Variables

| Variable            | Description                               | Example                      |
| ------------------- | ----------------------------------------- | ---------------------------- |
| `POSTGRES_USER`     | PostgreSQL username                       | `adminuser`                  |
| `POSTGRES_PASSWORD` | PostgreSQL password                       | `secret123`                  |
| `POSTGRES_DB`       | Database name                             | `raizes_do_nordeste`         |
| `DATABASE_URL`      | Full connection string consumed by Prisma | `postgresql://...`           |
| `NODE_ENV`          | Runtime environment                       | `development` / `production` |
| `PORT`              | HTTP server port                          | `3000`                       |

---

## Database

### Domains

| Domain              | Tables                                                                    |
| ------------------- | ------------------------------------------------------------------------- |
| Identity & Access   | `users`                                                                   |
| Business Units      | `business_units`, `categories`, `products`, `business_unit_menu_items`    |
| Inventory           | `inventory`, `inventory_transactions`                                     |
| Orders              | `orders`, `order_items`                                                   |
| Payments            | `payments`                                                                |
| Promotions          | `promotions`, `order_promotions`                                          |
| Loyalty             | `loyalty_accounts`, `loyalty_transactions`                                |

### Design Decisions

- **UUIDs as primary keys** — prevents sequential ID exposure and
  enumeration attacks; safer for distributed systems.
- **camelCase in TypeScript, snake_case in PostgreSQL** — enforced via
  `@map()` and `@@map()` directives so each side follows its own idiomatic
  convention.
- **`Decimal(10, 2)` for monetary values** — avoids floating-point precision
  loss on multiplication and rounding.
- **`DateTime` (TIMESTAMPTZ) for `createdAt`/`updatedAt`** — preserves
  timezone semantics, is human-readable in queries, and Prisma serializes
  it as ISO-8601 to JSON. Numeric Unix timestamps were intentionally
  rejected because they lose precision and timezone meaning.
- **Optional descriptions are `NULL`, not empty strings** — `NULL`
  unambiguously means "no value" and is semantically distinct from an empty
  description, which is a meaningful (but unusual) state.
- **Selective audit trail** — `updated_by` is applied only where
  operationally or legally relevant (e.g. LGPD compliance), avoiding
  pointless metadata noise on append-only tables.
- **Indexed columns by access pattern** — every foreign key and every
  enum-style filter (`isActive`, `orderStatus`, etc.) has an explicit
  `@@index`.

---

## API Reference

All routes are prefixed with **`/api`**.

### Products

| Method | Path                                              | Description                                            |
| ------ | ------------------------------------------------- | ------------------------------------------------------ |
| `GET`  | `/api/products`                                   | List all active products with their base price.        |
| `GET`  | `/api/products/:productId`                        | Get a single product by id. Returns `404` if missing.  |
| `GET`  | `/api/products/by-business-unit/:businessUnitId`  | List products available at a business unit (effective price = `customPrice` when set, otherwise `basePrice`). |

#### Response — `ProductResponseDto`

```json
{
  "id": "cebe6acf-e54e-4842-a8ec-eda9a439ceb5",
  "name": "Açaí Fitness",
  "description": null,
  "price": 20.5,
  "isActive": true,
  "categoryId": "5b8f...",
  "createdAt": "2026-01-01T12:00:00.000Z",
  "updatedAt": "2026-01-01T12:00:00.000Z"
}
```

### Error responses

| Status | When                                                    | Body shape                                          |
| ------ | ------------------------------------------------------- | --------------------------------------------------- |
| `404`  | A product or business unit does not exist               | `{ "statusCode": 404, "message": "...", "error": "Not Found" }` |
| `500`  | Repository / database failure (`ProductsFetchException`)| Standard NestJS error envelope                      |

---

## Testing

```bash
# Unit tests (use cases, controllers, entities, DTOs)
npm test

# Watch mode
npm run test:watch

# Coverage report → ./coverage/lcov-report/index.html
npm run test:cov

# End-to-end tests (boots the full Nest application)
npm run test:e2e
```

### Testing strategy

- **Unit tests** mock the `IProductRepository` interface, so use cases are
  validated without any database. Entities and DTOs are tested in isolation
  for behavior (`isAvailable()`) and pure transformation (`fromEntity()`).
- **e2e tests** boot the full Nest application against the development
  database and exercise the HTTP surface.
- Each test asserts both **success paths** and **failure paths** — including
  `NotFoundException` propagation and `ProductsFetchException` wrapping
  with `Error.cause`.

---

## Code Quality

- **ESLint** (`eslint.config.mjs`) with `typescript-eslint` strict-typed
  rules, `no-explicit-any: error`, `no-floating-promises: error`,
  `eqeqeq: error`, `curly: error`.
- **Prettier** (`.prettierrc`) — single quotes, 100-column width,
  trailing commas everywhere.
- **Husky + lint-staged** — pre-commit hook runs ESLint and Prettier on
  staged TypeScript files only.
- **GitHub Actions CI** (`.github/workflows/ci.yml`) — installs
  dependencies, generates the Prisma client, lints, tests and builds on
  every push to `main`/`develop` and on every PR to `main`.

---

## Roadmap

The product catalog module is shipped. Upcoming modules — already designed
in the database schema — are:

- [ ] **Auth** — JWT + role-based guards (`CUSTOMER`, `ATTENDANT`, `KITCHEN`,
  `MANAGER`, `ADMIN`)
- [ ] **Orders** — order creation, item management, status transitions
- [ ] **Payments** — gateway integration (mocked initially), refund flow
- [ ] **Inventory** — stock, reservations, audit log of inventory transactions
- [ ] **Promotions** — percentage / fixed-amount / free-item discounts
- [ ] **Loyalty** — points earning, redemption and consent tracking (LGPD)

---

## License

Academic project — all rights reserved.
