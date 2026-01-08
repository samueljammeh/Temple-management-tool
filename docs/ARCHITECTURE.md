# Architecture

## Defaults and assumptions

- Template JSON is the contract between `studio-web`, `template-api`, and `render-service`.
- Render pipeline: Template JSON -> XSL-FO -> Apache FOP -> PDF.
- Deterministic rendering: no timestamps or random metadata in generated PDFs.
- Tenancy uses `x-tenant-id` header in dev; OIDC later.
- Postgres is the system of record; assets stored on local filesystem in dev.

## Contracts

- Template schema and validators live in `packages/template-schema`.
- XML parsing utilities and XPath-like selectors live in `packages/xml-tools`.
- FO compiler lives in `packages/fo-compiler` and is reused by `render-service`.

## Services

- `services/template-api`: CRUD for templates, versions, assets, RBAC, audit logs.
- `services/render-service`: compiles templates and renders PDFs via FOP.
- `apps/studio-web`: editor, admin, and preview.
