# Orbyt Template Studio

Monorepo for the Orbyt Template Studio platform.

## Requirements

- Node.js 18+
- pnpm 9+
- Docker + Docker Compose
- Java 21 (for render-service local builds)

## Local development

```bash
pnpm install
pnpm dev
```

## Common tasks

```bash
pnpm lint
pnpm test
pnpm build
```

## Docker compose

```bash
docker compose -f infra/docker-compose.yml up --build
```

## Structure

- `apps/studio-web`: Next.js editor + admin UI
- `services/template-api`: NestJS API for templates, versions, assets
- `services/render-service`: Spring Boot service for JSON -> FO -> PDF
- `packages/template-schema`: Zod schema + validators + examples
- `packages/xml-tools`: XML utilities for parsing and field bindings
- `packages/fo-compiler`: Template JSON -> XSL-FO compiler
- `fixtures`: sample XML + PDFs
- `docs`: architecture and contracts
