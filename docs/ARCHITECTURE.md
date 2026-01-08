# Orbyt Template Studio Architecture

## Defaults and Assumptions
- **Schema version**: `1.0` is the contract version shared across editor, API, and renderer.
- **Preview pipeline**: Studio uses the render-service `/render` endpoint for previews (same pipeline as production).
- **Determinism**: Rendering uses a fixed creation date and deterministic FO compilation (no timestamps, random IDs, or metadata in PDF output).
- **Multi-tenancy**: Every API request requires `x-tenant-id`; persisted data is always scoped by tenant.
- **RBAC**: Roles are `TenantAdmin`, `TemplateDesigner`, `Publisher`, `Viewer` enforced via `x-role` header.

## Service Responsibilities
- `packages/template-schema`: Contract-first schema + Zod validators.
- `services/template-api`: CRUD, versioning, audit trail, and RBAC enforcement.
- `services/render-service`: Compiles Template JSON -> XSL-FO -> PDF with Apache FOP.
- `apps/studio-web`: Drag-and-drop authoring and preview that calls render-service.

## Deterministic Rendering Notes
- `services/render-service` sets `FOUserAgent` metadata to fixed values, including a fixed creation date (`Date(0)`).
- `packages/fo-compiler` mirrors FO generation for tooling and tests; the runtime preview uses the Java pipeline.

## TODO (Stable Interfaces)
- Replace in-memory storage in template-api with Postgres JSONB and durable audit logs while keeping API routes unchanged.
- Add asset storage via local filesystem in dev; preserve `assetId` contract.
