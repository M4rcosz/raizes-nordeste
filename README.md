# Raízes do Nordeste — Backend API

REST API for a multi-unit restaurant ordering system with inventory control, payment processing, and a customer loyalty program.

---

## Stack

| Technology | Version | Role |
|---|---|---|
| Node.js | 22 | Runtime |
| NestJS | 11 | HTTP Framework |
| TypeScript | 5.7 | Language |
| Prisma | 7 | ORM |
| PostgreSQL | 15 | Database |
| Docker | 29 | Containerization |

---

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) 29+
- [Node.js](https://nodejs.org/) 22+
- WSL Ubuntu 24.04 (if on Windows)

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/M4rcosz/raizes-nordeste.git
cd raizes-nordeste
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
POSTGRES_USER=adminuser
POSTGRES_PASSWORD=your_password
POSTGRES_DB=raizes_nordeste
DATABASE_URL="postgresql://adminuser:your_password@localhost:5432/raizes_nordeste?schema=public"

NODE_ENV=development
```

> ⚠️ `DATABASE_URL` uses `localhost` for local development. Inside Docker, `docker-compose.yml` overrides this variable automatically using the `db` service name.

### 3. Install dependencies and generate the Prisma client

```bash
npm install
npx prisma generate
```

### 4. Start the database and run migrations

```bash
docker compose up db -d

DATABASE_URL="postgresql://adminuser:your_password@localhost:5432/raizes_nordeste?schema=public" npx prisma migrate dev
```

### 5. Start the full application

```bash
docker compose up --build
```

On startup, the container automatically runs:
- Pending migrations (`prisma migrate deploy`)
- Database seed (`prisma db seed`)
- NestJS server initialization

---

## Local Development

```bash
# Start only the database
docker compose up db -d

# Start the application in watch mode
npm run start:dev
```

---

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `POSTGRES_USER` | PostgreSQL username | `adminuser` |
| `POSTGRES_PASSWORD` | PostgreSQL password | `secret123` |
| `POSTGRES_DB` | Database name | `raizes_nordeste` |
| `DATABASE_URL` | Full connection string | `postgresql://...` |
| `NODE_ENV` | Where is running | `development` |

---

## Architecture

```
src/
├── modules/          ← Domain modules (HTTP layer)
│   ├── auth/         ← JWT authentication and role guards
│   ├── orders/       ← Order management and status transitions
│   ├── payments/     ← Payment processing
│   ├── inventory/    ← Stock control
│   ├── loyalty/      ← Loyalty program
│   └── products/     ← Product catalog
├── domain/
│   ├── entities/     ← Pure domain entities with no ORM dependency
│   └── repositories/ ← Repository interfaces (contracts)
├── infrastructure/
│   ├── prisma/       ← PrismaService and repository implementations
│   └── logging/      ← AuditService for traceability
├── common/
│   ├── filters/      ← GlobalExceptionFilter
│   ├── interceptors/
│   └── decorators/   ← @Roles(), @CurrentUser()
└── main.ts
prisma/
├── schema.prisma     ← Database schema
├── seed.ts           ← Initial data
└── migrations/       ← Database version history
```

### Architecture Decisions

**Clean Architecture**
The `domain/` layer has no knowledge of Prisma or NestJS — pure TypeScript only. Modules handle the HTTP-to-domain bridge. Concrete implementations live in `infrastructure/`.

**Repository Pattern**
`domain/repositories/` defines interfaces. `infrastructure/prisma/repositories/` provides the implementations. This decouples business rules from the ORM, making it possible to swap Prisma without touching domain logic.

**Use Cases**
Complex operations such as `create-order` and `update-status` are isolated in `use-cases/` folders inside each module, separating orchestration from business rules.

---

## Database

### Domains

| Domain | Tables |
|---|---|
| Identity & Access | `users` |
| Business Units & Menu | `business_units`, `categories`, `products`, `business_unit_menu_items` |
| Inventory | `inventory`, `inventory_transactions` |
| Orders | `orders`, `order_items` |
| Payments | `payments` |
| Promotions | `promotions`, `order_promotions` |
| Loyalty | `loyalty_accounts`, `loyalty_transactions` |

### Design Decisions

- **UUIDs as primary keys** — prevents sequential ID exposure and enumeration attacks
- **camelCase in schema, snake_case in database** — enforced via `@map()` and `@@map()`
- **Decimal for monetary values** — `@db.Decimal(10, 2)` avoids floating-point precision loss
- **Selective audit trail** — `updated_by` applied only where operationally or legally relevant (LGPD)

---

## Testing

```bash
# Unit tests
npm run test

# End-to-end tests
npm run test:e2e

# Coverage report
npm run test:cov
```

---

## License

Academic project — all rights reserved.