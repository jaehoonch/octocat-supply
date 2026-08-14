# OctoCAT Supply Chain Management Application - General Copilot Instructions

These instructions apply repository-wide. More specific rules in `.github/instructions/*.instructions.md` take precedence for matching API, frontend, and database files. Keep global guidance concise; add a scoped instruction file when a new subsystem needs detailed rules.

## Architecture and Source of Truth

- This repository contains two independently managed TypeScript packages, not an npm-workspaces root: `api/` is an Express REST API backed by SQLite, and `frontend/` is a React application built by Vite and styled with Tailwind CSS.
- API requests flow through routes to repositories and then SQLite. Frontend server state should flow through the API rather than accessing persistence directly.
- `Makefile` coordinates package-level commands. Use `make install`, `make dev`, `make build`, `make lint`, `make test-api`, and `make test-e2e`; use `npm run ...` from `api/` or `frontend/` only when targeting one package.
- The API listens on port 3000. Vite and Playwright use port 5137; Docker Compose exposes the frontend on port 3001.
- Treat `api/database/migrations/` and `api/database/seed/` as the schema and demo-data source of truth. Treat route/model Swagger JSDoc as the generated API-documentation source and keep `api/api-swagger.json` synchronized when endpoint contracts change.
- Refer to `docs/architecture.md`, `docs/sqlite-integration.md`, and `docs/build.md` instead of duplicating architecture or setup prose.

## Change Discipline

- Prefer the smallest coherent change and preserve local naming, formatting, and public contracts unless the task requires a contract change.
- Do not modify generated output (`dist/`, `coverage/`, Playwright reports), package lock files by hand, SQLite database files, or `.agent-audit/` session artifacts.
- Some demo resources intentionally introduce vulnerable or failing states. Do not "clean up" files under `demo/resources/` or demonstration examples outside the requested scenario.
- Keep configuration environment-driven. Never commit credentials, tokens, connection strings, private keys, or environment-specific hostnames.
- Validate at the narrowest useful level first, then broaden according to risk. Do not claim tests, lint, builds, deployments, or migrations passed unless they were run successfully.

## TypeScript and TSX

Apply these rules to application code and TypeScript configuration in both packages:

- Keep strict TypeScript checks enabled. Do not weaken `tsconfig` or ESLint rules to make an implementation compile.
- Use inference for obvious local values, but type exported functions, public class methods, component props, API payloads, database rows, and callback contracts explicitly.
- Prefer `interface` for extensible object/model shapes and `type` for unions, tuples, mapped types, and aliases. Model finite states with literal unions instead of unrestricted strings where practical.
- Avoid `any`. At untrusted boundaries use `unknown`, validate or narrow it with type guards, and only then convert it to a domain type. Keep assertions local and justified.
- Handle `null` and `undefined` deliberately with guards, optional chaining, and nullish coalescing. Do not use non-null assertions unless an invariant is guaranteed by nearby code.
- Use `import type` and `export type` for type-only dependencies. Prefer built-in utility types and simple generics over deeply nested conditional or mapped types.
- Keep functions focused, flatten nested async control flow with early returns, check failed HTTP responses, and propagate errors to the established owner. Use `Promise.all` only for independent operations.
- Prefer dependency injection at test boundaries. Do not instantiate databases, HTTP clients, or other external dependencies inside otherwise testable domain logic.
- Use camelCase for variables, functions, and TypeScript data properties; PascalCase for components, classes, and interfaces. Preserve the repository's existing camelCase filenames and PascalCase React component filenames.
- The SQLite adapter wraps synchronous `better-sqlite3` operations in promises. Preserve the repository's async repository contract and do not assume that this makes database work non-blocking.

These TypeScript principles align with the requested W3Schools TypeScript best-practices reference: strict mode, precise public types, inference for obvious values, `unknown` and type guards over `any`, explicit null handling, focused modules, robust async error handling, and testable dependencies.

## API and React Boundaries

- Follow `.github/instructions/api.instructions.md` for Express routes, repositories, validation, error middleware, and Swagger.
- Follow `.github/instructions/frontend.instructions.md` for React, accessibility, server-state handling, routing, responsive behavior, and Tailwind usage.
- Keep database access in repository classes. Use parameterized queries and the existing camelCase-to-snake_case mapping utilities.
- Keep route handlers thin: parse and validate input, call the repository, choose the HTTP response, and delegate errors to middleware.
- Keep frontend API base URLs in runtime or environment configuration. Do not embed deployment URLs in components.
- Never render untrusted HTML. Preserve semantic HTML, keyboard access, visible focus states, labels, and useful image alternative text.

## SQL and SQLite

- Follow `.github/instructions/database.instructions.md` for schema changes and `api/src/db/**` work.
- Use snake_case table and column names and map them to camelCase TypeScript properties through `api/src/utils/sql.ts`.
- Always bind user or application values as parameters. Never concatenate or interpolate them into SQL text.
- Historical migrations are immutable. Add the next sequential `NNN_description.sql` file and include indexes, constraints, foreign-key actions, data backfills, and seed compatibility required by the change.
- Make multi-statement data changes atomic when partial completion would violate integrity. Keep SQL compatible with the repository's migration and seed runners, which execute semicolon-delimited statements.
- Use foreign keys, `CHECK` constraints, and appropriate uniqueness constraints for durable invariants; retain application validation for clear client errors.
- Add indexes for foreign keys and demonstrated filter/sort patterns, and inspect query plans before adding speculative indexes.
- Keep seed files deterministic, ordered by dependency, minimal, and idempotent within the seeder's documented lifecycle. Use explicit IDs when later seed files reference them.
- Repository integration tests must use the in-memory database, run migrations first, and close/reset shared database state between tests.

## JavaScript and JSON Configuration

- JavaScript configuration files use ESM where declared. Preserve each tool's expected export form and the local semicolon/quote style; there is no repository-wide formatter.
- Keep ESLint flat-config scopes explicit. Add exceptions only to the narrowest file pattern and include a rationale; never disable a rule globally to hide one violation.
- Keep `package.json` scripts conventional and consistent with the Makefile. Put runtime packages in `dependencies` and build/test/lint tooling in `devDependencies`.
- Treat `package-lock.json` as package-manager output. Regenerate it with the matching npm command whenever dependencies change, and use `npm ci` in CI and container builds.
- JSON must remain strict JSON: double-quoted keys and strings, no comments, no trailing commas. Parse or tool-validate edited JSON before finishing.
- Preserve TypeScript project references and Vite/Playwright port alignment when changing frontend configuration.

## Bash and Make

- Bash scripts must use `#!/usr/bin/env bash` and, for new scripts, `set -euo pipefail`. Quote every variable expansion unless intentional word splitting is documented.
- Use `[[ ... ]]`, `$(...)`, `mktemp`, and cleanup traps. Validate required arguments and commands before making changes, and emit actionable errors to stderr with nonzero exits.
- Never echo secrets or pass them in command lines when a safer environment variable, standard input, or credential provider exists.
- Keep scripts non-interactive for CI unless interaction is the purpose. Prefer portable utilities and check platform-specific assumptions.
- In Makefiles, declare non-file targets as `.PHONY`, preserve literal tab recipe indentation, use variables for repeated paths/commands, and make dependencies explicit.
- Remember that each Make recipe line normally runs in a separate shell. Join commands deliberately when they must share a working directory or shell state.

## YAML and GitHub Actions

- Use two-space indentation, quote ambiguous scalars, and validate workflow/Compose syntax after edits.
- Give workflows the minimum required `permissions`; add write permissions only to the job that needs them.
- Use `npm ci` with checked-in lock files, explicit `working-directory`, caches keyed by the relevant lock file, and artifacts with bounded retention.
- Pin third-party actions to immutable commit SHAs when practical. For trusted first-party actions, follow the repository's established update policy and Dependabot configuration.
- Prevent expression injection: pass untrusted `${{ ... }}` values through environment variables rather than interpolating them directly into `run` scripts.
- Use repository secrets and environments for credentials. Never print secret-bearing contexts or persist credentials in artifacts.
- Keep Docker Compose service names, ports, environment variables, health/dependency assumptions, and application runtime configuration aligned.

## Bicep and Azure Infrastructure

- Parameterize environment-specific names, locations, image references, sizing, and resource IDs. Add clear `@description` decorators and constrain parameters where valid values are known.
- Mark secret parameters with `@secure()` and prefer managed identities and role assignments over passwords or access keys for new integrations.
- Use symbolic resource references instead of constructing resource IDs manually. Use existing resources explicitly when infrastructure is owned outside this deployment.
- Pin supported resource API versions intentionally and review release changes before updating them. Preserve resource naming limits and deterministic uniqueness.
- Keep outputs non-sensitive. Add consistent tags, configure least-privilege ingress and network exposure, and avoid insecure transport.
- Validate and lint Bicep before deployment, and use a what-if review for infrastructure changes. Never deploy as part of an implementation task unless explicitly requested.

## Dockerfile and nginx

- Use multi-stage builds, copy dependency manifests before source for cache reuse, install reproducibly with lock files, and keep runtime images free of build-only dependencies.
- Pin base images to an intentional version and update them regularly. Prefer non-root runtime users, minimal filesystem permissions, and a useful health check where supported.
- Do not bake secrets into image layers, build arguments, or frontend bundles. Inject runtime configuration through the established entrypoint and environment mechanism.
- Keep container ports consistent with Express, nginx, Compose, Bicep, and documentation. Persist SQLite data on an explicit writable volume in production-like deployments.
- Preserve nginx SPA fallback behavior, send container logs to stdout/stderr, add security headers deliberately, and cache hashed assets without caching runtime configuration incorrectly.

## HTML, CSS, and Tailwind

- Use semantic HTML before ARIA, retain the document language and viewport metadata, and keep scripts/styles compatible with Vite's module pipeline.
- Prefer Tailwind utilities and shared theme tokens over one-off inline styles or duplicated CSS. Keep dark-mode variants and responsive breakpoints paired with their light/mobile behavior.
- Keep global CSS limited to resets, base behavior, or patterns that Tailwind cannot express cleanly. Avoid `!important` unless integrating an unavoidable third-party style.
- Reserve fixed dimensions for media or controls that need layout stability; otherwise use responsive constraints and verify text does not clip or overlap.

## Markdown and Documentation

- Use descriptive headings, fenced code blocks with language identifiers, relative repository links, and valid Mermaid syntax.
- Keep commands, paths, ports, environment variables, and endpoint examples synchronized with executable configuration. Do not document scripts or directories that do not exist.
- Explain behavior and operational tradeoffs rather than restating code. Update architecture/build documentation when public behavior, deployment, schema, or developer workflow changes.
- Preserve template directives and intentional walkthrough prompts in demo documentation unless the task explicitly changes the demo flow.

## Testing and Quality Gates

- API unit and integration tests use Vitest; route integration tests use Supertest and an isolated in-memory SQLite database.
- Browser end-to-end tests use Playwright under `frontend/tests/e2e/`; component tests should use React Testing Library when introduced.
- Cover happy paths, invalid input, not-found/conflict behavior, persistence mapping, and security-relevant boundaries. Avoid implementation-detail assertions and brittle snapshots.
- Run the narrowest relevant command first, then `make lint` and `make build` for cross-package or configuration changes. Use `make test-api` for API tests and `make test-e2e` for browser flows.
- Verify a script exists in the target package before invoking it; do not assume both packages expose identical npm scripts.

## Review Priorities and Feedback

Review in this order: security and data integrity; functional correctness; performance and scalability; maintainability and duplication; readability and consistency; style.

Keep feedback concise and actionable. Give a rationale for non-trivial recommendations, quote only the relevant lines, and offer one preferred solution with a lightweight alternative only when it materially helps.
